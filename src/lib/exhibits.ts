/**
 * Content loader. Everything on the site is driven by the `exhibits/` folder:
 *
 *   exhibits/<exhibit>/exhibit.json         -> Exhibit (one themed page, e.g. the Aquarium)
 *   exhibits/<exhibit>/prompt.md            -> the brief every model receives, verbatim
 *   exhibits/<exhibit>/placeholder.html     -> shown for entries that have no piece yet
 *   exhibits/<exhibit>/entries/<slug>/meta.json   -> who made it + provenance
 *   exhibits/<exhibit>/entries/<slug>/piece.html  -> the model's code, untouched
 *
 * This module only runs at build time (server side), so model names in meta.json
 * never reach the client unless a page deliberately renders them.
 */
import { createHash } from 'node:crypto';
import { z } from 'astro/zod';
import { skinNames } from '../skins/names';
import { href } from './url';

const ExhibitSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  intro: z.string().optional(),
  skin: z.enum(skinNames),
  /** live = in nav, preview = in nav with a badge, draft = only built in dev */
  status: z.enum(['live', 'preview', 'draft']),
  /** open = artists shown; blind = hidden + shuffled until the visitor votes (v2) */
  mode: z.enum(['open', 'blind']).default('open'),
  order: z.number().default(100),
  /** Plaque prefix: "Tank 01", "No. 01", ... */
  pieceLabel: z.string().default('No.'),
  promptVersion: z.number().int().default(1),
  /** Entry folder names, in display order. Entries not listed are not shown. */
  lineup: z.array(z.string()).min(1),
});

const EntrySchema = z.object({
  /** Display name of the model, e.g. "Claude Opus 5.5" */
  artist: z.string(),
  provider: z.string(),
  modelId: z.string().optional(),
  openWeights: z.boolean().default(false),
  /** dummy = hand-written stand-in, final = real model output. ("pending" = no piece.html) */
  status: z.enum(['dummy', 'final']).default('final'),
  /** Name the model gave its piece/creature */
  title: z.string().optional(),
  /** The model's own placard text */
  statement: z.string().optional(),
  /** Museum-label style medium, e.g. "SVG and JavaScript" */
  medium: z.string().optional(),
  generation: z
    .object({
      date: z.string(),
      via: z.string(),
      params: z.record(z.string(), z.unknown()).optional(),
      attempts: z.number().int().default(1),
      edits: z.string().default('none'),
    })
    .optional(),
});

export type Exhibit = z.infer<typeof ExhibitSchema> & { slug: string };
export type Entry = z.infer<typeof EntrySchema> & { slug: string };

/** What a skin's Frame needs to render one piece. Skins never see raw meta. */
export interface PieceView {
  id: string;
  src: string;
  label: string;
  title: string;
  /** null in blind mode */
  artist: string | null;
  medium: string | null;
  statement: string | null;
  status: 'pending' | 'dummy' | 'final';
}

const exhibitFiles = import.meta.glob<unknown>('/exhibits/*/exhibit.json', { eager: true, import: 'default' });
const entryFiles = import.meta.glob<unknown>('/exhibits/*/entries/*/meta.json', { eager: true, import: 'default' });
const pieceFiles = import.meta.glob<string>('/exhibits/*/entries/*/piece.html', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const placeholderFiles = import.meta.glob<string>('/exhibits/*/placeholder.html', {
  eager: true,
  query: '?raw',
  import: 'default',
});

// Piece URLs are opaque so neither the URL nor the DOM gives the artist away.
// Set PIECE_ID_SALT in the deploy environment once voting matters.
const SALT = import.meta.env.PIECE_ID_SALT ?? 'model-museum';
const pieceId = (exhibit: string, entry: string) =>
  createHash('sha256').update(`${SALT}/${exhibit}/${entry}`).digest('hex').slice(0, 10);

function parse<T>(schema: z.ZodType<T>, data: unknown, path: string): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`Invalid ${path}:\n${z.prettifyError(result.error)}`);
  return result.data;
}

const exhibits: Exhibit[] = Object.entries(exhibitFiles)
  .map(([path, data]) => ({ ...parse(ExhibitSchema, data, path), slug: path.split('/')[2] }))
  .filter((ex) => import.meta.env.DEV || ex.status !== 'draft')
  .sort((a, b) => a.order - b.order);

export function getExhibits(): Exhibit[] {
  return exhibits;
}

export interface Piece {
  id: string;
  entry: Entry;
  html: string;
  pending: boolean;
}

export function getPieces(exhibit: Exhibit): Piece[] {
  return exhibit.lineup.map((slug) => {
    const base = `/exhibits/${exhibit.slug}/entries/${slug}`;
    const meta = entryFiles[`${base}/meta.json`];
    if (!meta) throw new Error(`${exhibit.slug}/exhibit.json lists "${slug}" but ${base}/meta.json is missing`);
    const html = pieceFiles[`${base}/piece.html`];
    const placeholder = placeholderFiles[`/exhibits/${exhibit.slug}/placeholder.html`];
    if (!html && !placeholder) throw new Error(`${base} has no piece.html and the exhibit has no placeholder.html`);
    return {
      id: pieceId(exhibit.slug, slug),
      entry: { ...parse(EntrySchema, meta, `${base}/meta.json`), slug },
      html: html ?? placeholder,
      pending: !html,
    };
  });
}

export function pieceSrc(exhibit: Exhibit, piece: Piece): string {
  return href(`/pieces/${exhibit.slug}/${piece.id}.html`);
}

export function toView(exhibit: Exhibit, piece: Piece, index: number): PieceView {
  const { entry } = piece;
  const blind = exhibit.mode === 'blind';
  return {
    id: piece.id,
    src: pieceSrc(exhibit, piece),
    label: `${exhibit.pieceLabel} ${String(index + 1).padStart(2, '0')}`,
    title: piece.pending ? 'Awaiting arrival' : (entry.title ?? 'Untitled'),
    artist: blind ? null : entry.artist,
    medium: piece.pending ? null : (entry.medium ?? null),
    statement: piece.pending ? null : (entry.statement ?? null),
    status: piece.pending ? 'pending' : entry.status,
  };
}
