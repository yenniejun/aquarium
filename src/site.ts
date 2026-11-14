export const site = {
  name: 'The Model Museum',
  blurb:
    'Every exhibit gives several AI models the same brief. Every piece is pure code the model wrote: no images, no assets.',
  /** Shown in the lobby directory before they have an exhibit folder. */
  upcoming: [] as { title: string; note: string }[],
  /**
   * Umami Cloud (umami.is): cookieless, privacy-friendly counts of page views and of which piece
   * each visitor picks. Paste the website ID from Umami's tracking code; empty turns it off.
   * Only loaded in production builds, so local testing never shows up in the numbers.
   */
  umamiWebsiteId: '18b7c895-d5e8-4d23-80ce-91da296dfb0b',
};
