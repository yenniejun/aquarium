// @ts-check
import { defineConfig } from 'astro/config';

// If this ends up hosted under a subpath (e.g. yenniejun.github.io/aquarium),
// set `base: '/aquarium'` — all internal links go through `href()` in src/lib/url.ts.
export default defineConfig({
  // The floating dev toolbar sits on top of the tanks; turn back on if you want it.
  devToolbar: { enabled: false },
});
