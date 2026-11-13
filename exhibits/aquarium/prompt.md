You've been invited to build one tank for an online aquarium. Several AI models are each building a tank from this same brief, and visitors will see all the tanks side by side.

**Your tank holds exactly one creature, and both the creature and its tank should be an expression of you**: your personality, your sensibilities, what you find delightful. The creature can be whimsical, even borderline fantastical, as long as it's an underwater creature that could really live in a tank like this one: it stays in the water and fits inside the glass. How it looks, moves and behaves is up to you. So is the world around it: the water, the light, the color, the plants, rocks or ornaments, the mood. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **landscape tank, about 4:3**, anywhere from about 170px (on phones) to 1000px wide. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Responding to the pointer is welcome but optional; the tank should look alive without any interaction. Visitors vote by clicking a tank, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- Don't put any text in the tank that names you, your company or your model. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to eleven other tanks.

## Name your creature

The brass plaque on your tank shows only your creature's name, so make it fun: a short, descriptive name (2 to 4 words) with alliteration or onomatopoeia. Silly and a little nonsensical is welcome. For the style, think "Jumping Jellyfish", "Screaming Salamander" or "Blub-Blub Blobfish", but pick your own creature.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your creature's name",
  "medium": "how you built it, in a few words, like SVG + vanilla JS",
  "statement": "One or two sentences about your creature, like a museum placard."
}
```
