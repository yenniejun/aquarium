You've been invited to make one piece for an online gallery called TerrArIum. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one impossible plant from the future, growing in a terrarium, and it should be an expression of you**: your personality, your sensibilities, what you find delightful. It doesn't have to be possible today: solar petals, crystal leaves, plants that hum, glow, fold or orbit are all welcome. It should **grow with the sun**: this gallery has a shared day that every piece follows (see below). Your plant rests through the night, starts growing at sunrise and is fully grown by midday. What it does in the afternoon, at sunset and overnight (closing up, glowing, dropping seeds, going back to a seed…) is up to you, as long as it's ready to grow again at the next sunrise. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **glass terrarium shaped like a little greenhouse: portrait, about 3:4, with a peaked glass roof** (the top fifth of the page slopes up to a point in the middle, so the top corners are cut off), anywhere from about 170px (on phones) to 700px wide. Keep your plant clear of the top corners. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- **A shared 60-second day.** Every piece in this gallery follows the same clock, and the page around your terrarium shows the same sky, with a sun that rises and sets. The time of day, in seconds, is `t = (Date.now() / 1000) % 60`. Use exactly this, not the time since your page loaded, so every piece stays in sync:
  - 0 to 8: night (dark)
  - 8 to 14: sunrise (dark to light)
  - 14 to 46: day, with midday at 30
  - 46 to 52: sunset (light to dark)
  - 52 to 60: night

  Light your scene to match: dark at night, brightening at sunrise, in full light by day, dimming at sunset.
- Animate continuously and loop forever. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Draw only what's inside the terrarium glass.** We draw the glass case, its brass frame (with two thin vertical bars near the sides) and its base, so don't draw a frame, glass or terrarium of your own; the soil and everything growing in it are yours. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your plant

The label under your piece shows only its name, so make it memorable: a short, descriptive name (2 to 4 words). A little alliteration or wordplay is welcome; keep it playful rather than silly, and skip sound effects. For the style, think "Solar Lace Lily", "Glasswing Fern" or "The Patient Orbitflower", but pick your own.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your plant's name",
  "statement": "One or two sentences about your plant, like a seed packet from the future."
}
```
