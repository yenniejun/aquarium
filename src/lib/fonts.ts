/**
 * The Google Fonts a page loads: the site's own (menu, buttons, credit) plus only what its skin and
 * display use (title and placards), so a gallery doesn't wait on a dozen families it never shows.
 * Add a family here when a skin or display starts using one.
 */
const site = ['IBM Plex Mono:wght@400;500;600'];

const bySkin: Record<string, string[]> = {
  aquarium: ['Gluten:wght@400;600', 'Josefin Sans:wght@400;600;700'],
  cabinet: ['Josefin Sans:wght@400;600;700'],
  gallery: ['Cormorant Garamond:ital,wght@0,500;0,600;1,500;1,600'],
};

const byVariant: Record<string, string[]> = {
  belljar: ['Cinzel Decorative:wght@700', 'Cormorant Garamond:wght@700'],
  niche: ['Shippori Mincho:wght@700'],
  shelf: ['Almendra:wght@700'],
  porthole: ['Poiret One'],
  specimen: ['Mountains of Christmas:wght@700', 'Cormorant Garamond:ital,wght@1,600'],
  terrarium: ['Comfortaa:wght@700'],
  window: ['Monoton'],
  menu: ['Caveat:wght@500;700'],
  bigtop: ['Limelight'],
  tarot: ['IM Fell English:ital@0;1'],
  fieldguide: ['Metamorphous', 'IM Fell English:ital@0;1', 'Caveat:wght@500;700'],
};

export function fontsUrl(skin: string, variant?: string) {
  const families = [...site, ...(bySkin[skin] ?? []), ...((variant && byVariant[variant]) ?? [])];
  const query = families.map((f) => `family=${f.replaceAll(' ', '+')}`).join('&');
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}
