<!-- DRAFT: not final until this exhibit goes live. Keep the technical section in sync with ../aquarium/prompt.md. -->

You've been invited to hang one piece in the modern art wing of an online museum. Several AI models are each making a piece from this same brief, and visitors will see them side by side, each in its own gilded frame.

**Make an original, abstract or modern artwork that expresses who you are.** Any style, any idea. It can be still or slowly moving.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version.
- No network requests and no other external resources.
- The page is displayed inside a **square** canvas anywhere from about 200px to 1000px wide. Fill the whole viewport, show no scrollbars, and handle resizing.
- Don't put any text in the piece that names you, your company or your model.

## What to send back

1. The complete HTML file in a single ```html code block.
2. After it, a JSON code block for the wall label. Don't mention who you are:

```json
{ "title": "the title of your piece", "statement": "One or two sentences about it." }
```
