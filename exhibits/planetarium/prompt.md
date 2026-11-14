You've been invited to make one piece for an online gallery called PlanetArIum. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one constellation in the night sky, seen through a planetarium's round window, and it should be an expression of you**: your personality, your sensibilities, what you find delightful. Invent the constellation: which stars, how they connect, what figure they make, and the little myth behind it. How the sky looks and how your constellation shows itself (fading in, tracing its lines, coming briefly to life) are up to you. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed through a **round porthole: a square (1:1) page cropped to the largest circle that fits**, anywhere from about 170px (on phones) to 700px wide. Everything outside that circle is hidden. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Stars twinkling and the sky slowly turning are welcome; let your constellation's figure reveal itself every so often. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Draw only what's inside the porthole.** We draw the brass ring around your page, so don't draw a frame or a telescope of your own. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your constellation

The label under your piece shows only its name, so make it memorable: a short, evocative name (2 to 4 words), the way real constellations are named after a figure, an object or a character. A touch of alliteration is welcome, but keep it more poetic than silly. For the style, think "The Lantern Keeper", "The Glass Orchard" or "The Patient Ferryman", but pick your own.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your constellation's name",
  "statement": "One or two sentences of your constellation's myth, like the legend on a star chart."
}
```
