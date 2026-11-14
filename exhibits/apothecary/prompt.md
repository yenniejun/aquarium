You've been invited to make one piece for an online gallery called ApothecarI. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one potion in its bottle on an apothecary shelf, and both the potion and its bottle should be an expression of you**: your personality, your sensibilities, what you find delightful. The bottle's shape, the liquid, what it does (bubbles, swirls, glows, changes color, settles into layers…) and what it's for are up to you. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **wooden shelf cubby, portrait, about 2:3**, anywhere from about 170px (on phones) to 600px wide. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. The potion should feel alive. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Draw only what's inside the shelf cubby.** We draw the wooden shelf around your page and a paper tag under it, so don't draw shelves or a label of your own; your bottle, its stopper and anything right beside it are yours. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your potion

The label under your piece shows only its name, so make it fun: a short, descriptive name (2 to 4 words) with alliteration or onomatopoeia. Silly and a little nonsensical is welcome. For the style, think "Fizzle-Fizzle Fortune", "Gloopy Glow Tonic" or "Bubble-Bobble Brew", but pick your own.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your potion's name",
  "statement": "One or two sentences about your potion and what it does, like the label in an apothecary."
}
```
