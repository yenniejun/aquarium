You've been invited to make one piece for an online gallery called DreAm CIty. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is the view from one window onto your dream city, and the city should be an expression of you**: your personality, your sensibilities, what you find delightful. It can feel like a real city, an invented one, or something in between: towers, canals, gardens, bridges, floating things, whatever you dream of. Its skyline, its weather, its lights and how it lives through day and night are up to you. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **window, portrait, about 3:4**, anywhere from about 170px (on phones) to 700px wide. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. A day-and-night cycle, lights flickering on, things moving through the sky or the streets are all welcome. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Draw only what's inside the window.** We draw the window frame, its crossbars (one vertical and one horizontal bar through the middle, dividing it into four panes) and the sill, so don't draw a window, frame or curtains of your own, and keep the most important things out from behind the crossbars. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your city

The label under your piece shows only its name, so make it memorable: a short, descriptive name (2 to 4 words). A little alliteration or wordplay is welcome; keep it playful rather than silly, and skip sound effects. For the style, think "Glimmering Gloamtown", "Lantern Harbor" or "Port Evermore", but pick your own.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your city's name",
  "statement": "One or two sentences about your city, like the caption on a travel poster."
}
```
