# Design

## The idea

A museum where every exhibit gives several AI models the same brief, and every piece is **pure code** the model wrote, with no images or assets. The first exhibit is **A(quar)I(um)**: twelve tanks, each holding one creature that expresses its model's personality. Later, visitors **vote blind** for a favorite before finding out who made what, then see the tallies. Then more exhibits follow (modern art, portraits, …), each with its own look.

## Vocabulary

| Term | Meaning | Example |
| --- | --- | --- |
| **Museum** | The whole site | The Model Museum |
| **Exhibit** | One themed page (a "wing") | A(quar)I(um), Modern Art Wing |
| **Entry** | One model's slot in an exhibit | `exhibits/aquarium/entries/claude/` |
| **Piece** | The HTML file the model produced | a jellyfish tank |
| **Skin** | How an exhibit looks. Its **Room** owns the page layout and hangs each piece in its **Frame** | aquarium: glass tanks on cabinets, 3×2 on the first screen; gallery: gilded frames on a wall |

## Principles

1. **Everything is code.** Pieces, frames, rooms, plaques and the favicon are all HTML/CSS/SVG/JS. The site contains no image files.
2. **Exhibits are data, skins are code.** A new exhibit is a folder of JSON + HTML. A new *look* is a Room component, which usually comes with its own Frame. Pieces never know which skin they're in.
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
  modern-art/                     ← draft (unlisted; still at /modern-art/ in dev), gallery skin, no pieces yet
src/
  lib/exhibits.ts                 ← loads + validates exhibits/, assigns opaque piece ids
  lib/sandbox.ts                  ← CSP injected into every piece
  scripts/voting.ts               ← client: shuffle, click-to-vote, reveal (skin-agnostic)
  components/                     ← SideNav (menu), About (welcome + "?" modal with the prompt)
  skins/
    names.ts, index.ts            ← skin registry (name → Room)
    aquarium/{Room,Frame}.astro   ← 3-column grid, two rows above the fold; glass tank, hood light, cabinet, brass plaque
    gallery/{Room,Frame}.astro    ← wallpaper + wainscot, gilded frame, picture light, wall label
  pages/
    index.astro                   ← lobby with the museum directory
    [exhibit]/index.astro         ← any exhibit: loads pieces, hands them to the skin's Room
    pieces/[exhibit]/[id].html.ts ← serves each piece (with CSP) at an opaque URL
    reveal/[exhibit].json.ts      ← who made what; only fetched after a vote (v0 stand-in for the vote API)
  layouts/Base.astro, styles/global.css, site.ts
scripts/check-blind.mjs           ← flags model names hiding in piece code
```

## How a page renders

```
exhibits/aquarium/exhibit.json ─┐
exhibits/aquarium/entries/*/    ├─► lib/exhibits.ts ──► PieceView[] ──► skins[exhibit.skin] (Room → Frame)
                                │    (zod-validated,      (title; artist     (tank / gilded frame)
                                │     opaque ids)          null if blind)          │
                                │                                                  ▼
                                └─► /pieces/aquarium/a22dcbcd5c.html ◄── <iframe sandbox="allow-scripts">
                                     (piece.html + injected CSP)
```

Everything is static at build time (Astro, `output: static`), so the site can be hosted anywhere for v0.

## The aquarium page

- **3×2 above the fold, 3×4 in all.** Twelve tanks in three columns. The title and the first two rows fill exactly the first screen; rows 3–4 are below it. Tanks are 4:3, and `--tank-h` (in `skins/aquarium/Room.astro`) is the largest height that fits three across and two rows (plus their fixed chrome) above the fold, from container query width units and `svh`. Any leftover height is split above row 1 and below row 2. Portrait screens and phones scroll in two columns.
- **Empty slots.** A lineup entry with no `piece.html` shows `placeholder.html` (an empty tank) with an "Awaiting arrival" plaque. Its `<li>` gets `data-pending`, so voting keeps it at the end, unshuffled and unvotable. Right now the six newer slots (grok, mistral, kimi, glm, gemma, gpt-oss) are empty stand-ins.
- **Welcome.** On a first visit, the "?" modal opens by itself (remembered per exhibit in `localStorage` as `museum:welcomed:<exhibit>`; `?reset` shows it again). Its About tab is the skin's Welcome, `src/skins/aquarium/Welcome.astro`: the title and two lines above a strip of water with a goldfish. Hover or tap the underlined words: "a tank" swells the waves, "one creature" makes the fish wiggle, "favorite tank" makes it leap out and flip.
- **Loading.** Each tank shows a few rising bubbles until its iframe loads, then fades the piece in. Tanks on the first screen load eagerly; empty slots load lazily. `public/_headers` lets browsers cache pieces for 5 minutes, then refresh them in the background.
- **Menu.** `src/components/SideNav.astro`: a slim panel on the left edge (Galleries) on screens ≥1000px, and a "Menu" popover on narrower ones. Upcoming galleries come from `src/site.ts`.
- **About ("?").** `src/components/About.astro` (shared by all exhibits): a "?" button in the top-right corner opens a fixed-size modal with two tabs: About (a skin's Welcome, or the plain title and intro) and Prompt (the exact `prompt.md` in an editor-style view with line numbers and a Copy button). The aquarium page itself is just the room: no section or footer below it.
- **Type.** Gluten (soft and wobbly) for the title and the welcome, Josefin Sans caps on the brass plaques, IBM Plex Mono for small UI labels.
- **Plaque = specimen name only.** Who made it and how ("Claude · SVG + JavaScript") appear only after voting.

## Blind voting (v0, client side)

1. In `mode: "blind"`, the page renders no artist names, and `scripts/voting.ts` shuffles the tanks (with CSS `order`, so iframes don't reload) to remove position bias.
2. The visitor votes by clicking a tank: either the cabinet/plaque (a real `<button>`, keyboard accessible) or anywhere inside the glass. A click inside a sandboxed iframe never reaches the parent page, but it moves focus into the iframe, so the page listens for `window` blur and checks whether `document.activeElement` is a tank's iframe. Iframes are `tabindex="-1"` so tabbing can't trigger a vote, and pieces stay fully interactive.
3. The page fetches `/reveal/<exhibit>.json` (id → artist, medium), fills in every plaque, and marks the pick with a "♥ your pick" badge.
4. The vote is stored in `localStorage` (`museum:vote:<exhibit>`), so reloading shows the revealed state. Add `?reset` to the URL to see the welcome and vote again.

This keeps names out of the page source, but the reveal file is public if you know where to look. v2 replaces steps 3–4 with the real API.

## Sandboxing a piece

Model-written code can do anything JavaScript can, so each piece runs in a cage:

- **`<iframe sandbox="allow-scripts">`** without `allow-same-origin` gives the piece an opaque origin. It can't read the parent page, cookies or localStorage. This matters once votes exist, because a piece must not be able to vote for itself.
- **Injected CSP** (`src/lib/sandbox.ts`): `connect-src 'none'`, images only from `data:`/`blob:`, scripts only inline or from jsDelivr/cdnjs/unpkg. This blocks phoning home and loading outside images, which would break the "everything is code" rule.
- **`public/_headers`** sets `Content-Security-Policy: sandbox allow-scripts` on `/pieces/*` for hosts that honor it (Cloudflare Pages, Netlify), so a piece opened in its own tab is sandboxed too.
- Iframes are `loading="lazy"`, and isolation means one broken piece can't break the page.

Why not inline the code, or use `srcdoc`? Inlining lets pieces' CSS and globals collide, and it gives up the security boundary. Separate URLs also make lazy loading, "open full size" and future per-piece pages possible.

## The piece contract

`exhibits/aquarium/prompt.md` is the source of truth. In short: one self-contained HTML file, drawn entirely in code, optional libraries only from the three CDNs, no network, fills a 4:3 tank (280–1000px wide) at any size, loops forever, doesn't depend on clicks (clicks vote), no self-identifying text, and respects `prefers-reduced-motion`. It also returns a JSON with a silly alliterative `title`, a short `medium` and a `statement`.

The six dummy pieces deliberately cover the techniques models are likely to use (SVG+JS, Canvas 2D, d3 from a CDN, CSS only, pointer interaction, WebGL), and all six render through the sandbox and CSP.

## Adding things

- **A piece:** drop the model's HTML into `entries/<slug>/piece.html` and fill in `meta.json` (`status: "final"`, title/statement from the placard JSON, `generation` provenance). Run `npm run check:blind`.
- **An exhibit:** copy an exhibit folder, edit `exhibit.json` (`status: "draft"` hides it in production), write `prompt.md` and `placeholder.html`.
- **A skin** (e.g. oval portrait frames): create `src/skins/<name>/Room.astro` (props: `exhibit`, `pieces`) plus whatever Frame it uses, add the name to `names.ts`, and register it in `index.ts`. The Room owns layout and colors. For blind voting it must render the hooks listed in `src/scripts/voting.ts` (`[data-pieces]`, `[data-piece]`, `[data-vote]`, `[data-artist]`, `[data-medium]`).

## Roadmap

### v0 (now)
Static site: A(quar)I(um) with six dummy tanks and six empty ones, blind click-to-vote with a client-side reveal, and sandboxing. The lobby and the gilded-frame Modern Art Wing exist but are parked (modern-art is a draft).

### v1: real pieces
- `scripts/generate.mjs` (`npm run generate -- <entry>…`, built): sends `prompt.md` to each entry's model through its provider's API (Anthropic and OpenAI so far; OpenRouter could cover the rest with one key). Saves the raw reply to `entries/<slug>/raw.md`, the HTML block to `piece.html`, and the JSON block plus a `generation` record (date, API, params) to `meta.json`.
- Fairness rules, written down before running: default sampling settings, first response that renders wins, retry only if it fails to render (and log the attempts), no human edits except removing self-identification (logged in `generation.edits`).
- Optional "view source" page per piece (showing the code is part of the point), plus stats like bytes, lines and libraries used.

### v2: blind voting
- **Hosting:** move from static-only to something with functions. Cloudflare Pages + Workers + D1 + Turnstile is the recommendation: free tier, bot protection built in, and an official Astro adapter. (Vercel + Upstash/Supabase works too.)
- **Flow:** the v0 client flow stays the same. Only `castVote()` changes: it calls `POST /api/vote {exhibit, pieceId, turnstileToken}` instead of fetching the static reveal file. The response carries the same id→artist map plus tallies, and the plaques gain a score.
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
