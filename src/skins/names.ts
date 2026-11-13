// Kept separate from ./index.ts so the content schema can import it without pulling in components.
export const skinNames = ['aquarium', 'gallery'] as const;
export type SkinName = (typeof skinNames)[number];
