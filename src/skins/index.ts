/**
 * A skin is how an exhibit looks: the Room (page backdrop + signage) and the Frame
 * (what each piece hangs in). Pieces stay identical across skins; only the frame changes.
 * To add one: create src/skins/<name>/{Room,Frame}.astro, add the name to ./names.ts,
 * and register it here.
 */
import type { SkinName } from './names';
import AquariumRoom from './aquarium/Room.astro';
import AquariumFrame from './aquarium/Frame.astro';
import GalleryRoom from './gallery/Room.astro';
import GalleryFrame from './gallery/Frame.astro';

type Component = (props: any) => any;

export const skins: Record<SkinName, { Room: Component; Frame: Component }> = {
  aquarium: { Room: AquariumRoom, Frame: AquariumFrame },
  gallery: { Room: GalleryRoom, Frame: GalleryFrame },
};
