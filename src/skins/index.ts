/**
 * A skin is how an exhibit looks. Its Room gets the exhibit and its pieces and owns the whole
 * layout: backdrop, title, grid, and the Frame each piece hangs in. Pieces never know which
 * skin they're in.
 *
 * For blind voting to work, a Room must render the hooks documented in src/scripts/voting.ts
 * ([data-pieces], [data-piece], [data-vote], [data-artist], [data-medium]).
 *
 * To add a skin: create src/skins/<name>/Room.astro (+ any parts it needs), add the name to
 * ./names.ts, and register it here.
 */
import type { SkinName } from './names';
import AquariumRoom from './aquarium/Room.astro';
import GalleryRoom from './gallery/Room.astro';

type Component = (props: any) => any;

export const skins: Record<SkinName, Component> = {
  aquarium: AquariumRoom,
  gallery: GalleryRoom,
};
