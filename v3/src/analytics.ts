/**
 * Fire a custom event to all active analytics providers (Plausible + Simple Analytics).
 *
 * Safe to call anywhere — silently no-ops if a provider hasn't loaded
 * (e.g., script blocked by an ad blocker).
 *
 * Plausible: event names must be registered in the dashboard under
 * Goals → Custom Events before they appear in reports.
 *
 * Simple Analytics: events appear automatically in the SA dashboard.
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>,
): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plausible = (window as any).plausible
    if (typeof plausible === 'function') {
      plausible(eventName, props ? { props } : undefined)
    }
  } catch {
    // Never throw — analytics must never break the app
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sa_event = (window as any).sa_event
    if (typeof sa_event === 'function') {
      sa_event(eventName, props)
    }
  } catch {
    // Never throw — analytics must never break the app
  }
}
