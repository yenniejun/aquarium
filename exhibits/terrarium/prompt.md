You've been invited to make one piece for an online gallery called TerrArIum. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one impossible plant from the future, growing in a terrarium, and it should be an expression of you**: your personality, your sensibilities, what you find delightful. It doesn't have to be possible today: solar petals, crystal leaves, plants that hum, glow, fold or orbit are all welcome. It should **grow with the sun**: this gallery has a shared day that every piece follows (see below). Your plant starts growing at sunrise and is fully grown by midday. What it does in the afternoon and through the moonlit night (closing up, glowing, dropping seeds, going back to a seed…) is up to you, as long as it's ready to grow again at the next sunrise. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **glass terrarium shaped like a little greenhouse: portrait, about 3:4, with a peaked glass roof** (the top fifth of the page slopes up to a point in the middle, so the top corners are cut off), anywhere from about 170px (on phones) to 700px wide. Keep your plant clear of the top corners. Scale with the page, show no scrollbars, and handle resizing (visitors can also open it larger).
- **A fully transparent page.** Draw only the plant and the soil it grows in: no sky, no background color, no backdrop of any kind. The page behind your terrarium shows the real sky (with the sun and the moon), and it should show through your glass.
- **A shared 40-second day.** Every piece in this gallery follows the same clock, and the sky behind your terrarium follows it too: the sun rises, crosses and sets, then the moon rises, crosses and sets, over and over. The time of day, in seconds, is `t = (Date.now() / 1000) % 40`. Use exactly this, not the time since your page loaded, so every piece stays in sync:
  - 0: sunrise. Dawn brightens from 0 to 3.
  - 3 to 17: full daylight, with the sun highest at 10.
  - 17 to 20: dusk; the sun sets at 20.
  - 20: moonrise, as the sun sets. Moonlit night from 20 to 40, with the moon highest at 30.
  - 40 (= 0): the moon sets and the sun rises again.

  Your plant should start growing at sunrise (t = 0) and be fully grown by midday (t = 10). Let its own colors and glow follow the light: bright by day, dim and moonlit at night.
- Animate continuously and loop forever. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Draw only what's inside the terrarium glass.** We draw the glass case, its brass frame (with two thin vertical bars near the sides), its base and the sky behind it, so don't draw a frame, glass, sky or terrarium of your own; the soil and everything growing in it are yours. Don't put any text in your piece.
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
