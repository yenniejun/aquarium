You've been invited to paint one card for an online gallery called fAIries: a tarot deck in which every card is a fairy. Several AI models are each painting a card from this same brief, and visitors will see the whole spread side by side.

**Your piece is one fairy, painted as the artwork of a tarot card, and it should be an expression of you**: your personality, your sensibilities, your idea of what a fairy is. Every fairy here is the fairy *of* something, and you choose what: a flower, a fruit, a tide, a fever, nightmares, rust, a lost key, a first frost, anything at all. You also choose its nature: it can be beautiful, horrific, magnificent, sorrowful, sly, or something else entirely. Show your fairy together with the thing it belongs to, nearby rather than sitting on or attached to it. How it looks and moves is up to you. Make something you'd be proud to have in the deck.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- Your page is the **artwork of a tarot card: portrait, about 2:3**, anywhere from about 170px (on phones) to 600px wide. Fill it edge to edge with your scene; a background is welcome. The bottom corners are gently rounded by the card's frame. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Your fairy and its world should stir: wings, light, drifting motes, a slow turn of the head. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **Just the artwork.** We draw the card around your page (its border, frame and decorations) and write its title and description below the artwork, so don't draw a card border, a frame, a title banner or any writing of your own.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your card

Your card's title is written under its artwork: "The Fairy of …", completed with whatever your fairy is the fairy of (2 to 5 words in all). A short description goes beneath it: 12 words at most, in the voice of a tarot card's meaning.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "The Fairy of …",
  "statement": "A description of 12 words or fewer."
}
```
