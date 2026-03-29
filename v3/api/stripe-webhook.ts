import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Disable Vercel's automatic JSON body parsing.
// Stripe signature verification requires the raw, unmodified request body.
export const config = {
  api: { bodyParser: false },
}

/** Read the full request body as a Buffer from the Node.js IncomingMessage stream. */
function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/**
 * Pure business logic for handling a completed checkout session.
 * Exported so it can be unit-tested independently of the HTTP handler.
 */
export async function processCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<void> {
  const userId = session.metadata?.supabase_user_id

  if (!userId) {
    // Not our session — log and return (don't throw; we don't want Stripe to retry)
    console.warn('processCheckoutCompleted: no supabase_user_id in session metadata', session.id)
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { error } = await supabase
    .from('users')
    .update({ plan: 'paid', paid_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update plan for user ${userId}: ${error.message}`)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature']
  if (!sig || typeof sig !== 'string') {
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables in stripe-webhook')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })

  let event: Stripe.Event
  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`)
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      await processCheckoutCompleted(session, supabaseUrl, serviceRoleKey)
    }
    // Other event types are silently acknowledged with 200
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }

  return res.status(200).json({ received: true })
}
