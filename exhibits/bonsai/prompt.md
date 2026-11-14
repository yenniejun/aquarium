You've been invited to make one piece for an online gallery called BonsAI. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one bonsai tree in its pot, and both the tree and its pot should be an expression of you**: your personality, your sensibilities, what you find delightful. It can be a real species (a juniper, a maple, a pine…), an invented one, or something in between. Its shape, its age, its season and how it moves in the breeze are up to you, and so is the pot (and any moss or stones in it). Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed **square (1:1)**, anywhere from about 170px (on phones) to 700px wide.
- **Draw only the tree and its pot, on a fully transparent page**: no background color, sky, sun, moon, ground, other trees or scenery of any kind. Our wooden display stand sits directly under your page, against a pale paper wall, so **the bottom of the pot must touch the very bottom edge of the page**, centered, as if it's resting on the stand. Keep the whole tree inside the square with a little room to spare: nothing should be cut off at the edges, at any size. Scale with the page, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Seasons changing, a few leaves drifting or the tree slowly growing are all welcome. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **No stand or frame of your own.** We draw the wall and the stand, so don't draw a stand, a table or a frame of your own; the tree's pot is part of your piece. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your tree

The label under your piece shows only its name, so make it memorable: a short, descriptive name (2 to 4 words). A little alliteration or wordplay is welcome; keep it playful rather than silly, and skip sound effects. For the style, think "Crooked Cloud Pine", "Tiny Tangled Maple" or "Old Moon Juniper", but pick your own.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your tree's name",
  "statement": "One or two sentences about your tree, like a placard at a bonsai show."
}
```
