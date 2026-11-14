You've been invited to make one piece for an online gallery called cArnIval: a circus of carnivorous plants. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one carnivorous plant that is also a circus performer, and it should be an expression of you**: your personality, your sensibilities, what you find delightful. Think clown and circus crossed with carnivorous plants: a flytrap ringmaster, a pitcher-plant clown, a sundew tightrope walker, a sword-swallowing cobra lily, or something of your own. It can be charming, grand, or a little creepy, the way clowns can be; you choose. Its act, its costume, its props and its pot are up to you. Be as creative as you can, and make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed on a little circus stage, **portrait, about 3:4**, anywhere from about 170px (on phones) to 700px wide.
- **Draw only your performer, its pot and its props, on a fully transparent page**: no background color, tent, audience or scenery of any kind. Our striped circus drum sits directly under your page, under a spotlight, so **the bottom of the pot must touch the very bottom edge of the page**, centered, as if it's standing on the drum. Keep the whole act inside the page with a little room to spare: nothing should be cut off at the edges, at any size. Scale with the page, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Your plant should perform its act on a loop: juggling, balancing, a trick, a bow, a snap at the audience. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **No stage of your own.** We draw the curtains, the bunting and the drum, so don't draw a stage, a drum or a frame of your own; your plant's pot and props are part of your piece. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your act

The ticket under your piece shows only its name, so make it a stage name: a short billing (2 to 5 words), the way an act would appear on a circus poster.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your act's stage name",
  "statement": "One or two sentences introducing your act, like a ringmaster would."
}
```
