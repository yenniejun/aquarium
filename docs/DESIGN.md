# Design

## The idea

A museum where every exhibit gives several AI models the same brief, and every piece is **pure code** the model wrote, with no images or assets. The first exhibit is **The Aquarium**: six tanks, each holding one creature that expresses its model's personality. Later, visitors **vote blind** for a favorite before finding out who made what, then see the tallies. Then more exhibits follow (modern art, portraits, …), each with its own look.

## Vocabulary

| Term | Meaning | Example |
| --- | --- | --- |
| **Museum** | The whole site | The Model Museum |
| **Exhibit** | One themed page (a "wing") | The Aquarium, Modern Art Wing |
| **Entry** | One model's slot in an exhibit | `exhibits/aquarium/entries/claude/` |
| **Piece** | The HTML file the model produced | a jellyfish tank |
| **Skin** | How an exhibit looks: its **Room** (page backdrop) and **Frame** (what each piece hangs in) | aquarium: glass tank on a cabinet; gallery: gilded frame + picture light |

## Principles

1. **Everything is code.** Pieces, frames, rooms, plaques and the favicon are all HTML/CSS/SVG/JS. The site contains no image files.
2. **Exhibits are data, skins are code.** A new exhibit is a folder of JSON + HTML. A new *look* is one Room + one Frame component. Pieces never know which skin they're in.
3. **Pieces are untrusted.** Model output is never inlined into our pages; each piece runs in its own sandboxed iframe.
4. **Same brief, recorded honestly.** The prompt lives in the repo, verbatim. Each entry records how it was generated, and any human edits.
5. **Blind-ready from day one.** Piece URLs are opaque hashes and the page can render without artist names, so voting is a feature we add later, not a rewrite.

## Repo layout

```
exhibits/                         ← all content; one folder per exhibit
  aquarium/
    exhibit.json                  ← title, skin, status, mode, lineup (display order)
    prompt.md                     ← the brief, sent verbatim to every model
    placeholder.html              ← shown for entries without a piece yet (empty tank)
    entries/
      claude/
        meta.json                 ← artist, provider, title, statement, medium, provenance
        piece.html                ← the model's output, untouched
      gpt/ gemini/ deepseek/ qwen/ llama/
  modern-art/                     ← preview exhibit, gallery skin, no pieces yet
src/
  lib/exhibits.ts                 ← loads + validates exhibits/, assigns opaque piece ids
  lib/sandbox.ts                  ← CSP injected into every piece
  skins/
    names.ts, index.ts            ← skin registry
    aquarium/{Room,Frame}.astro   ← glass tank, hood light, wooden cabinet, brass plaque
    gallery/{Room,Frame}.astro    ← wallpaper + wainscot, gilded frame, picture light, wall label
  pages/
    index.astro                   ← lobby with the museum directory
    [exhibit]/index.astro         ← any exhibit: Room + grid of Frames
    pieces/[exhibit]/[id].html.ts ← serves each piece (with CSP) at an opaque URL
  layouts/Base.astro, styles/global.css, site.ts
scripts/check-blind.mjs           ← flags model names hiding in piece code
```

## How a page renders

```
exhibits/aquarium/exhibit.json ─┐
exhibits/aquarium/entries/*/    ├─► lib/exhibits.ts ──► PieceView[] ──► skins[exhibit.skin].Frame
                                │    (zod-validated,      (label, title,     (tank / gilded frame)
                                │     opaque ids)          artist|null)            │
                                │                                                  ▼
                                └─► /pieces/aquarium/a22dcbcd5c.html ◄── <iframe sandbox="allow-scripts">
                                     (piece.html + injected CSP)
```

Everything is static at build time (Astro, `output: static`), so the site can be hosted anywhere for v0.

## Sandboxing a piece

Model-written code can do anything JavaScript can, so each piece runs in a cage:

- **`<iframe sandbox="allow-scripts">`** without `allow-same-origin` gives the piece an opaque origin. It can't read the parent page, cookies or localStorage. This matters once votes exist, because a piece must not be able to vote for itself.
- **Injected CSP** (`src/lib/sandbox.ts`): `connect-src 'none'`, images only from `data:`/`blob:`, scripts only inline or from jsDelivr/cdnjs/unpkg. This blocks phoning home and loading outside images, which would break the "everything is code" rule.
- **`public/_headers`** sets `Content-Security-Policy: sandbox allow-scripts` on `/pieces/*` for hosts that honor it (Cloudflare Pages, Netlify), so a piece opened in its own tab is sandboxed too.
- Iframes are `loading="lazy"`, and isolation means one broken piece can't break the page.

Why not inline the code, or use `srcdoc`? Inlining lets pieces' CSS and globals collide, and it gives up the security boundary. Separate URLs also make lazy loading, "open full size" and future per-piece pages possible.

## The piece contract

`exhibits/aquarium/prompt.md` is the source of truth. In short: one self-contained HTML file, drawn entirely in code, optional libraries only from the three CDNs, no network, fills a square viewport from 280 to 1200px, loops forever, no self-identifying text, and respects `prefers-reduced-motion`. It also returns a placard JSON with `title` and `statement`.

The six dummy pieces deliberately cover the techniques models are likely to use (SVG+JS, Canvas 2D, d3 from a CDN, CSS only, pointer interaction, WebGL), and all six render through the sandbox and CSP.

## Adding things

- **A piece:** drop the model's HTML into `entries/<slug>/piece.html` and fill in `meta.json` (`status: "final"`, title/statement from the placard JSON, `generation` provenance). Run `npm run check:blind`.
- **An exhibit:** copy an exhibit folder, edit `exhibit.json` (`status: "draft"` hides it in production), write `prompt.md` and `placeholder.html`.
- **A skin** (e.g. oval portrait frames): create `src/skins/<name>/Room.astro` and `Frame.astro` (both get typed props), add the name to `names.ts`, and register it in `index.ts`. The Room sets `--cols / --gap-x / --gap-y / --grid-max` and colors for its page.

## Roadmap

### v0 (now)
Static site: lobby, The Aquarium with six dummy tanks, the Modern Art Wing preview with gilded frames, sandboxing, and the blind-mode rendering switch.

### v1: real pieces
- `scripts/generate`: send `prompt.md` to each model. OpenRouter covers all six with one API key. Save the raw response to `entries/<slug>/raw.md`, extract the HTML block to `piece.html` and the JSON to `meta.json`, and record `generation` (date, model id, params, attempts).
- Fairness rules, written down before running: default sampling settings, first response that renders wins, retry only if it fails to render (and log the attempts), no human edits except removing self-identification (logged in `generation.edits`).
- Optional "view source" page per piece (showing the code is part of the point), plus stats like bytes, lines and libraries used.

### v2: blind voting
- **Hosting:** move from static-only to something with functions. Cloudflare Pages + Workers + D1 + Turnstile is the recommendation: free tier, bot protection built in, and an official Astro adapter. (Vercel + Upstash/Supabase works too.)
- **Flow:** set the exhibit to `mode: "blind"`. Visitors see shuffled tanks with no names and no scores. They pick one and `POST /api/vote {exhibit, pieceId, turnstileToken}`. The response carries tallies plus the id→artist reveal, and plaques flip to show names and vote bars.
- **Data:** `votes(exhibit, piece_id, voter_hash, created_at)`, unique on `(exhibit, voter_hash)`. The reveal map lives server-side and is never in the blind page.
- **Integrity, honestly:** blind mode hides names from the page, URLs and DOM. But if this repo is **public**, anyone can read `meta.json`. That's fine for a fun site. If it ever matters, keep the repo private (Cloudflare and Vercel deploy private repos) or move the artist mapping out of the repo.
- Hide scores until after a visitor votes to avoid bandwagoning. Maybe add a head-to-head (Elo) mode later.

### v3: more wings
Modern Art (skin already built), Portrait Hall (oval frames), and so on. Each one is a folder plus, optionally, a skin. Exhibits could also be re-run as models update ("2027 season") so visitors can compare model generations.

## Open questions

1. **Lineup.** Placeholders are Claude, GPT, Gemini, DeepSeek, Qwen and Llama. Swap in Kimi, GLM or Mistral for the open-weight slots? Pin exact model versions when generating.
2. **Delivery channel.** API (reproducible, recorded params) vs. each product's chat UI (what people actually use)? API is easier to defend.
3. **Libraries.** Allow CDN libraries, or require vanilla code for a purer comparison?
4. **Placards.** Show the model's title and statement *before* the vote? It's part of the personality, but it could hint at the artist.
5. **Name and domain.** "The Model Museum" is a working title, set in `src/site.ts`.
