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
  tagline: z.string().optional(),
  /** Background info, shown small at the bottom of the page */
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
  /** Who makes the model, e.g. "Anthropic" */
  provider: z.string(),
  modelId: z.string().optional(),
  /** API the generate script calls through, when it isn't the provider's own, e.g. "OpenRouter" */
  route: z.string().optional(),
  /** On OpenRouter: the one host allowed to serve the request (no fallbacks), e.g. "deepseek" */
  host: z.string().optional(),
  openWeights: z.boolean().default(false),
  /** dummy = hand-written stand-in, final = real model output. ("pending" = no piece.html) */
  status: z.enum(['dummy', 'final']).default('final'),
  /** Name the model gave its piece/creature, e.g. "Glub-Glub Goldfish" */
  title: z.string().optional(),
  /** The model's own placard text */
  statement: z.string().optional(),
  /** How it was made, in a few words, e.g. "SVG + JavaScript". Revealed with the artist. */
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
  /** artist and medium are null in blind mode until the visitor votes */
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
const promptFiles = import.meta.glob<string>('/exhibits/*/prompt.md', { eager: true, query: '?raw', import: 'default' });

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

/** Exhibits shown in the nav and lobby. Drafts are still built in dev, just not listed. */
export function getListedExhibits(): Exhibit[] {
  return exhibits.filter((ex) => ex.status !== 'draft');
}

/** The exhibit shown at the site root: the first listed one (lowest `order`). */
export function getHomeExhibit(): Exhibit {
  return getListedExhibits()[0];
}

/** Where an exhibit's page lives: "/" for the home exhibit, "/<slug>/" for the rest. */
export function exhibitPath(exhibit: Exhibit): string {
  return exhibit.slug === getHomeExhibit()?.slug ? '/' : `/${exhibit.slug}/`;
}

/** The brief, exactly as sent to the models (minus any <!-- notes to ourselves -->). */
export function getPrompt(exhibit: Exhibit): string | null {
  const text = promptFiles[`/exhibits/${exhibit.slug}/prompt.md`];
  return text ? text.replace(/<!--[\s\S]*?-->\s*/g, '').trim() : null;
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

/** Who made what. In blind mode this is served separately and only fetched after a vote. */
export interface Reveal {
  title: string;
  artist: string;
  provider: string;
  medium: string | null;
}

export function getReveal(exhibit: Exhibit): Record<string, Reveal> {
  return Object.fromEntries(
    getPieces(exhibit).map((piece) => [
      piece.id,
      {
        title: piece.pending ? 'Awaiting arrival' : (piece.entry.title ?? 'Untitled'),
        artist: piece.entry.artist,
        provider: piece.entry.provider,
        medium: piece.pending ? null : (piece.entry.medium ?? null),
      },
    ]),
  );
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
    medium: blind || piece.pending ? null : (entry.medium ?? null),
    statement: piece.pending ? null : (entry.statement ?? null),
    status: piece.pending ? 'pending' : entry.status,
  };
}
