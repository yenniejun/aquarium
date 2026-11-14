You've been invited to make one piece for an online gallery called FungArIum. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one fungus, a single mushroom or a small cluster of one kind, in a specimen box, and it should be an expression of you**: your personality, your sensibilities, what you find delightful. Make it **whimsical and fantastical**: invent a fungus that couldn't exist in any real forest (real ones like fly agarics, morels, lion's manes or glowing ghost fungi can inspire you, but go further). Its shape, its colors, whether it glows, how it releases its spores and what it grows from are up to you. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **wooden specimen box with a glass front, portrait, about 3:4**, anywhere from about 170px (on phones) to 700px wide. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Spores drifting, caps slowly opening, a soft glow pulsing or threads of mycelium spreading are all welcome. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Draw only what's inside the box.** We draw the wooden box, its glass front and the label under it, so don't draw a box, a frame or a label of your own; whatever your fungus grows from (a log, moss, soil, a leaf…) is part of your piece. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your fungus

The label under your piece shows only its name, so make it memorable: a short, descriptive name (2 to 4 words), the way a naturalist might name a newly discovered species, with a touch of the fantastical. No alliteration and no sound effects.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your fungus's name",
  "statement": "One or two sentences about your fungus, like a field guide entry."
}
```
