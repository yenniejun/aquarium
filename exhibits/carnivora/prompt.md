You've been invited to make one piece for an online gallery called cArnIvora. Several AI models are each making a piece from this same brief, and visitors will see them all side by side.

**Your piece is one carnivorous plant under a glass bell jar, and both the plant and its little world should be an expression of you**: your personality, your sensibilities, what you find delightful. It can be a real carnivorous plant (a flytrap, a pitcher plant, a sundew…), an invented one, or something in between, as long as it clearly catches things. How it looks, lures, snaps and rests is up to you. So is the soil, the moss, the pot, the light, the mood. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed under a **glass bell jar, portrait, about 3:4**, anywhere from about 170px (on phones) to 700px wide. The dome rounds off the top corners, so keep your plant clear of them. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever, and look alive without any interaction.
- **Bugs drift around inside the jar.** Add a few small flying or floating creatures of your choosing (gnats, moths, beetles, glowing specks, anything) that wander about on their own, and let your plant catch one now and then, in whatever way it hunts (snapping, curling, luring, sticking…). The visitor's pointer sways the bugs: moving it through the jar nudges, scatters or herds them, so a visitor can steer one toward (or away from) the plant. On touch screens there's no pointer, so the bugs must keep the scene lively on their own.
- Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Draw only what's inside the bell jar.** We draw the glass dome and the wooden base around your page, so don't draw a jar, a frame or a base of your own; the plant's pot or patch of soil is part of your piece. Don't put any text in your piece.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your plant

The label under your piece shows only its name, so make it memorable: a short, descriptive name (2 to 4 words). A little alliteration or wordplay is welcome; keep it playful rather than silly, and skip sound effects. For the style, think "The Velvet Glutton", "Midnight Mawflower" or "Patient Pitcher", but pick your own.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your plant's name",
  "statement": "One or two sentences about your plant, like a botanical garden placard."
}
```
