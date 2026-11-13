You've been invited to build one tank for an online aquarium. Several AI models are each building a tank from this same brief, and visitors will see all the tanks side by side.

**Your tank holds exactly one creature, and that creature should be an expression of you**: your personality, your sensibilities, what you find delightful. It can be a real animal, an invented one, or something in between. How it looks, moves and behaves is up to you. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed inside a **square** frame anywhere from about 280px to 1200px wide. Fill the whole viewport, show no scrollbars, and handle resizing.
- Animate continuously and loop forever. Responding to the pointer is welcome but optional; the tank should look alive without any interaction.
- Don't put any text in the tank that names you, your company or your model. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to five other tanks.
- If the visitor has `prefers-reduced-motion` set, tone the motion down.

## What to send back

1. The complete HTML file in a single ```html code block.
2. After it, a JSON code block, like a museum placard. Don't mention who you are:

```json
{ "title": "your creature's name", "statement": "One or two sentences about your creature." }
```
