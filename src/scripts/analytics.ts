/** Anonymous event counts via Umami (see umamiWebsiteId in src/site.ts). A no-op when it isn't loaded. */
declare global {
  interface Window {
    umami?: { track(event: string, data?: Record<string, string>): void };
  }
}

export function track(event: string, data: Record<string, string>) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Analytics must never break the page.
  }
}
