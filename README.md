# The Model Museum

Same brief, different minds. Each exhibit asks several AI models to make something from the same prompt, entirely in code. First exhibit: **The Aquarium**, six tanks with one creature each, showing off its model's personality.

```sh
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run check:blind  # flag model names hiding in piece code
```

- Content lives in `exhibits/`. Each exhibit is a folder with `exhibit.json`, `prompt.md` and one `entries/<model>/` per model (`meta.json` + `piece.html`).
- The current tanks are **hand-written dummies** (marked `"status": "dummy"`) that test the pipeline with SVG, Canvas, d3, CSS-only, pointer interaction and WebGL. Replace them with real model output.
- Every piece runs in a sandboxed iframe with an injected CSP.
- The aquarium is in blind mode: click a tank to vote and reveal who made what. Add `?reset` to the URL to see the entrance curtains and vote again.

See [docs/DESIGN.md](docs/DESIGN.md) for the architecture, the piece contract and the roadmap (generation harness → blind voting → more wings).
