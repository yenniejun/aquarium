# The Model Museum

Same brief, different minds. Each exhibit asks several AI models to make something from the same prompt, entirely in code. First exhibit: **A(quar)I(um)**, twelve tanks with one creature each, showing off its model's personality.

```sh
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run check:blind  # flag model names hiding in piece code
```

- Content lives in `exhibits/`. Each exhibit is a folder with `exhibit.json`, `prompt.md` and one `entries/<model>/` per model (`meta.json` + `piece.html`).
- The tanks are real model output from `npm run generate` (see below). Entries without a `piece.html` yet show an empty "Awaiting arrival" tank.
- Every piece runs in a sandboxed iframe with an injected CSP.
- The aquarium is in blind mode: click a tank to vote and reveal who made what. Add `?reset` to the URL to see the welcome again and vote again.

See [docs/DESIGN.md](docs/DESIGN.md) for the architecture, the piece contract and the roadmap (generation harness → blind voting → more wings).

## Generating pieces

Put API keys in a `.env` file in the project root (git ignores it):

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

Then send the exhibit's `prompt.md` to the models behind one or more entries:

```sh
npm run generate -- claude-haiku claude-sonnet
```

Each entry's `meta.json` names its `provider` and `modelId`. The script saves the full reply to `raw.md`, the HTML to `piece.html`, and the title, medium, statement and a generation record to `meta.json`. An entry only shows on the page once it's in the exhibit's `lineup`. Run `npm run check:blind` afterwards to catch pieces that name their maker.
