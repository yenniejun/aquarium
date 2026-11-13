/**
 * A skin is how an exhibit looks. Its Room gets the exhibit and its pieces and owns the whole
 * layout: backdrop, title, grid, and the Frame each piece hangs in. Pieces never know which
 * skin they're in.
 *
 * For blind voting to work, a Room must render the hooks documented in src/scripts/voting.ts
 * ([data-pieces], [data-piece], [data-pending], [data-vote], [data-artist], [data-medium]).
 *
 * A skin can also bring a Welcome: what the About tab of the "?" modal (and the first-visit
 * welcome) shows instead of the plain title and intro.
 *
 * To add a skin: create src/skins/<name>/Room.astro (+ any parts it needs), add the name to
 * ./names.ts, and register it here.
 */
import type { SkinName } from './names';
import AquariumRoom from './aquarium/Room.astro';
import AquariumWelcome from './aquarium/Welcome.astro';
import GalleryRoom from './gallery/Room.astro';

type Component = (props: any) => any;

export const skins: Record<SkinName, { Room: Component; Welcome?: Component }> = {
  aquarium: { Room: AquariumRoom, Welcome: AquariumWelcome },
  gallery: { Room: GalleryRoom },
};
