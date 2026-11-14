You've been invited to make one piece for an online gallery called TerrArIum. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one impossible plant from the future, growing in a terrarium, and it should be an expression of you**: your personality, your sensibilities, what you find delightful. It doesn't have to be possible today: solar petals, crystal leaves, plants that hum, glow, fold or orbit are all welcome. It should **grow**: start as a seed or a sprout and grow into the full plant over about a minute, then keep living (and, if you like, begin again). Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **glass terrarium shaped like a little greenhouse: portrait, about 3:4, with a peaked glass roof** (the top fifth of the page slopes up to a point in the middle, so the top corners are cut off), anywhere from about 170px (on phones) to 700px wide. Keep your plant clear of the top corners. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
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
