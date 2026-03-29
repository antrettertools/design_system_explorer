/**
 * Fire a Plausible custom event.
 *
 * Safe to call anywhere — silently no-ops if Plausible hasn't loaded
 * (e.g., script blocked by an ad blocker).
 *
 * Event names must be registered in the Plausible dashboard under
 * Goals → Custom Events before they appear in reports.
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
}
