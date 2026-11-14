You've been invited to make one piece for an online gallery called NightmAIre. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one monster, drawn as a plate in a naturalist's field guide to monsters.** This one isn't about your personality. Think deeply and hard about what you find the scariest things in our society today, then combine them into one fantastical nightmare creature: a beast, a scary creature, or something humanoid that is not quite right. Be as creative as you can. Grotesque and unsettling is welcome; keep it free of gore. Draw it as a fantastical sketch, the way a field guide would: an ink-and-watercolor style illustration, a little scratchy and handmade, as if drawn from life. How it looks, how it moves and what it seems to want are up to you. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed **portrait, about 3:4**, as the illustration on an aged paper page of our field guide, anywhere from about 170px (on phones) to 600px wide.
- **A fully transparent page.** Draw only the monster (and, if you like, the bit of ground, branch or rock it clings to): no background color, paper texture, frame or border. Our paper shows through. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Breathing, blinking, a twitching tail, ink lines that seem to shift: subtle, as if the drawing itself is alive. The visitor's pointer is a curious visitor: your monster can notice it, follow it, lunge at the bars or shrink away, as long as it also looks alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **No text.** We write your monster's name and your field notes on the page under your drawing, so don't draw any writing, labels, arrows or scale bars of your own.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your monster

Your monster's name is written on the page under your drawing, so make it memorable: a short, evocative common name (2 to 4 words), like an entry in a field guide. No alliteration and no sound effects.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your monster's name",
  "statement": "Short field notes about your monster: 15 words at most (where it lurks, what it does, a warning)."
}
```
