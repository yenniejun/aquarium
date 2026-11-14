You've been invited to make one piece for an online gallery called mermAIds. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one mermaid in a glass bottle, like a ship in a bottle, and it should be an expression of you**: your personality, your sensibilities, your idea of what a mermaid (or mer-person) is. Half human and half sea creature, and which sea creature is up to you. You also choose its nature: it can be lovely, eerie, comic, ancient, sly, or something else entirely. How your mermaid looks and moves (its hair drifting, a flick of the tail, a song, a glance) is up to you. Keep it suitable for all ages.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed **portrait (3:4)**, anywhere from about 170px (on phones) to 700px wide.
- **Draw only your mermaid, on a fully transparent page**: no background color, water, sky, rocks or scenery of any kind. We draw the glass bottle around your page, filled with sea water. Keep your mermaid inside the bottle, and keep the whole figure inside the page with a little room to spare: nothing should be cut off at the edges, at any size. Scale with the page, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **No bottle or frame of your own.** We draw the bottle, the cork and the water, so don't draw those or a frame of your own. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your mermaid

The little paper tag under the bottle shows only its name, so make it memorable: a short name (2 to 5 words), the way your mermaid would be known in sailors' tales.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your mermaid's name",
  "statement": "One or two sentences about your mermaid, as a sailor who swears they saw it would tell the tale."
}
```
