// Kept separate from ./index.ts so the content schema can import it without pulling in components.
export const skinNames = ['aquarium', 'gallery', 'cabinet'] as const;

/** Display shapes for the cabinet skin, one per gallery (see src/skins/cabinet/Frame.astro). */
export const cabinetVariants = ['belljar', 'niche', 'window', 'shelf', 'terrarium', 'porthole', 'specimen', 'fieldguide', 'menu', 'tarot', 'bigtop', 'bottle'] as const;
export type CabinetVariant = (typeof cabinetVariants)[number];
export type SkinName = (typeof skinNames)[number];
