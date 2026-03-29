import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { publishDesign, unpublishDesign } from '@/core/sessions/cloudStorage'
import styles from './PublishDesignModal.module.css'

interface Props {
  designId: string
  designName: string
  username: string
  currentSlug: string | null
  currentIsPublic: boolean
  onClose: () => void
  onPublished: (slug: string) => void
  onUnpublished: () => void
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const APP_HOST = 'dsygn.cloud'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'my-design'
}

export function PublishDesignModal({
  designId,
  designName,
  username,
  currentSlug,
  currentIsPublic,
  onClose,
  onPublished,
  onUnpublished,
}: Props) {
  const [slug, setSlug] = useState(currentSlug ?? toSlug(designName))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const isValidSlug = SLUG_REGEX.test(slug)
  const publicUrl = `https://${APP_HOST}/s/${username}/${slug}`

  const handlePublish = async () => {
    if (!isValidSlug) return
    setLoading(true)
    setError(null)
    try {
      await publishDesign(supabase, designId, slug)
      setPublishedUrl(publicUrl)
      onPublished(slug)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg === 'slug_conflict' ? 'That URL is already in use — try a different slug.' : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    setLoading(true)
    setError(null)
    try {
      await unpublishDesign(supabase, designId)
      onUnpublished()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Publish design system">
        <div className={styles.header}>
          <h2 className={styles.heading}>Publish design system</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <p className={styles.intro}>
          Give your design system a public URL. Anyone with the link can view it.
        </p>

        <label className={styles.label} htmlFor="slug-input">
          URL slug
        </label>
        <div className={styles.slugRow}>
          <span className={styles.slugPrefix}>{APP_HOST}/s/{username}/</span>
          <input
            id="slug-input"
            className={`${styles.slugInput} ${slug && !isValidSlug ? styles.invalid : ''}`}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            maxLength={40}
            spellCheck={false}
            placeholder="my-design-system"
          />
        </div>
        {slug && !isValidSlug && (
          <p className={styles.hint}>Only lowercase letters, numbers, and hyphens.</p>
        )}

        {isValidSlug && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Preview URL</span>
            <a className={styles.previewUrl} href={publicUrl} target="_blank" rel="noopener noreferrer">
              {publicUrl}
            </a>
          </div>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}

        {/* Post-publish success state: show URL with copy button */}
        {publishedUrl && (
          <div className={styles.successRow}>
            <a className={styles.publishedUrl} href={publishedUrl} target="_blank" rel="noopener noreferrer">
              {publishedUrl}
            </a>
            <button
              className={styles.copyUrlBtn}
              onClick={async () => {
                await navigator.clipboard.writeText(publishedUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
          </div>
        )}

        <div className={styles.actions}>
          {currentIsPublic ? (
            <>
              <button
                className={styles.publishBtn}
                onClick={handlePublish}
                disabled={loading || !isValidSlug}
              >
                {loading ? 'Saving…' : 'Update URL'}
              </button>
              <button
                className={styles.unpublishBtn}
                onClick={handleUnpublish}
                disabled={loading}
              >
                Unpublish
              </button>
            </>
          ) : (
            <button
              className={styles.publishBtn}
              onClick={handlePublish}
              disabled={loading || !isValidSlug}
            >
              {loading ? 'Publishing…' : 'Publish'}
            </button>
          )}
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
