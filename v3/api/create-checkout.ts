import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const { userId } = req.body as { userId?: string }
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' })
  }

  // Verify the caller's Supabase JWT and assert it matches the requested userId
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !callerUser || callerUser.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const earlyBirdPriceId = process.env.STRIPE_PRICE_ID_EARLY_BIRD
  const regularPriceId = process.env.STRIPE_PRICE_ID_REGULAR
  const appUrl = process.env.APP_URL ?? 'https://dsygn.cloud'

  if (!secretKey || !earlyBirdPriceId || !regularPriceId) {
    console.error('Missing Stripe environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })

  const isEarlyBird = process.env.VITE_EARLY_BIRD_ACTIVE === 'true'
  const priceId = isEarlyBird ? earlyBirdPriceId : regularPriceId

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?upgraded=1`,
      cancel_url: `${appUrl}/`,
      metadata: { supabase_user_id: userId },
      // EU digital goods: withdrawal waiver displayed at checkout
      custom_text: {
        submit: {
          message:
            'By completing this purchase you acknowledge immediate delivery of digital content and waive your 14-day right of withdrawal under EU consumer law.',
        },
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe session creation failed:', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
