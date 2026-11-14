# AquarIum and friends

AI models, one brief per gallery, everything drawn in code. In each gallery several models make one piece from the same prompt; visitors pick a favorite before finding out who made what. Live at https://galleries.artfish.ai (aquarium.artfish.ai, its first address, redirects there).

```sh
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run check        # type check
npm run check:blind  # flag model names hiding in piece code, titles or statements
```

## Galleries

Each gallery is a folder in `exhibits/` with `exhibit.json` (title, skin, status, lineup…), `prompt.md` (sent verbatim to every model), `placeholder.html` (shown in empty slots) and one `entries/<model>/` per model (`meta.json` + `piece.html` + `raw.md`).

| Gallery | Folder | Display | Status |
|---|---|---|---|
| AquarIum | `aquarium` | fish tanks (aquarium skin) | live, home page |
| cArnIvora | `carnivora` | bell jars | preview |
| cArnIval | `carnival` | circus stages | draft (hidden) |
| BonsAI | `bonsai` | frameless, on a wooden stand | preview |
| ApothecarI | `apothecary` | shelf cubbies | preview |
| PlanetArIum | `planetarium` | brass portholes | preview |
| FungArIum | `fungarium` | museum vitrines | preview |
| NightmAIre | `nightmare` | field-guide pages | draft (hidden) |
| WAIffle Cart | `waffle-cart` | chalkboard menu | draft (hidden) |
| fAIries | `fairies` | tarot cards | preview |
| TerrArIum | `terrarium` | glass terrarium, shared sun/moon day | draft (hidden) |
| DreAm CIty | `dream-city` | windows | draft (hidden) |

- **Status:** `live` and `preview` appear in the menu; `draft` only builds on the dev server and stays out of the menu.
- **Titles:** the capital A and I that spell AI are highlighted in the gallery's accent color, as in `AquarIum`, `cArnIvora` or `BonsAI`.
- **Blind mode:** pieces are shuffled and unlabeled until you vote. `?reset` in the URL forgets your vote (and shows the aquarium's welcome again); on the dev server there's also a "Reset vote" button.
- **"?" and "Prompt":** hovering (or tapping) "?" shows a small bubble with what the models were told; "Prompt" opens the exact prompt. The aquarium also greets first-time visitors with its goldfish welcome.
- **Fonts:** each page loads only the Google Fonts it uses (`src/lib/fonts.ts`); add a family there when a gallery starts using one.

### Adding a gallery

1. Copy a similar folder in `exhibits/` and edit `exhibit.json` (`title`, `intro`, `order`, `pieceLabel`, `lineup`) and `prompt.md`.
2. Pick a display: `"skin": "cabinet"` with a `variant` (`belljar`, `niche`, `window`, `shelf`, `terrarium`, `porthole`, `specimen`, `fieldguide`, `menu`, `tarot`, `bigtop`). Displays live in `src/skins/cabinet/Frame.astro` and their rooms in `src/skins/cabinet/Room.astro`; a new variant also goes in `src/skins/names.ts`.
3. Start it as `"status": "draft"` or `"preview"`, generate pieces (below), and look at it locally.

## Generating pieces

Put API keys in a `.env` file in the project root (git ignores it):

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
```

Then send a gallery's `prompt.md` to the models behind one or more of its entries:

```sh
npm run generate -- --exhibit bonsai claude-haiku gpt-6-luna
npm run generate -- --exhibit nightmare --reasoning medium --max-tokens 64000 --attempts 2 qwen
```

- `--exhibit` (default `aquarium`), `--max-tokens` (default 32000; reasoning models need more), `--reasoning low|medium|high` (OpenRouter and Claude), `--attempts N` (ask again when a reply has no page or no name; the first complete one is kept).
- Each entry's `meta.json` names its `provider` and `modelId`. Models from other makers (Meta, Qwen, GLM, DeepSeek, Kimi, Grok) go through OpenRouter: `"route": "OpenRouter"`, with `"host"` pinning the request to one host, normally the maker's own servers, with no fallbacks.
- The script saves the full reply to `raw.md`, the HTML to `piece.html`, and the title, statement and a generation record (date, API and host, prompt version, settings, attempts) to `meta.json`. A reply without a page goes to `raw.failed.md` (ignored) and leaves the entry as it was.
- An entry only shows on the page once it's in the gallery's `lineup`. Run `npm run check:blind` afterwards.

## Deploying and counting

- Cloudflare Pages builds `main` to https://galleries.artfish.ai on every push (DNS: CNAMEs at GoDaddy). Every gallery lives at `/<folder>/`; `/` forwards to the aquarium, and a visitor on the old aquarium.artfish.ai is sent to the same page on the new address (`site.url` and `site.oldHosts` in `src/site.ts`).
- Picks are counted anonymously with Umami (no cookies), in production only: each vote sends a `pick · <maker>` event. The site ID is in `src/site.ts`.

See [docs/DESIGN.md](docs/DESIGN.md) for the architecture, the piece contract and the sandboxing.
