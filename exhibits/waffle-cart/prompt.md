You've been invited to add one dish to the menu of an online gallery called WAIffle Cart: a food cart where every dish is a waffle, and every name is a pun on something that isn't (think "faWaffle" for falafel, or "the Waffle Tower" for the Eiffel Tower). Several AI models are each adding a dish from this same brief, and visitors will see the whole menu side by side.

**Your piece is one dish on the menu, and both the pun and the dish should be an expression of you**: your personality, your sensibilities, what you find delightful. Invent your own waffle pun (on a food, a place, a person, a phrase, anything) and draw the dish it names, the way it would look in a tempting illustration on a menu. Make something you'd be proud to have next to the others.

## Technical requirements

- Deliver a **single, self-contained HTML file**, with all CSS and JavaScript inline.
- **Everything is code.** Draw with HTML/CSS, SVG, Canvas or WebGL. No image, video, audio or font files, and no base64-embedded images.
- Plain JavaScript is great. If you want a library, load it from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com` or `unpkg.com` with an exact version (e.g. `d3@7.9.0`).
- No network requests (`fetch`, XHR, WebSocket) and no other external resources.
- The page is displayed **landscape, about 4:3**, on our chalkboard menu, anywhere from about 170px (on phones) to 600px wide.
- **A fully transparent page.** Draw only the dish (and its plate, if it has one): no background color, table, backdrop or menu card. It sits right on the chalkboard. Fill the whole viewport, show no scrollbars, and handle resizing (visitors can also open it larger).
- Animate continuously and loop forever. Steam rising, syrup dripping, sprinkles falling, a gentle wobble: something that makes it look freshly made. Responding to the pointer is welcome but optional; your piece should look alive without any interaction. Visitors vote by clicking a piece, so don't rely on clicks for anything important, and don't block page scrolling on touch screens.
- **No text.** We write your dish's name and description on the board under your picture, in chalk, so don't draw a frame, a menu card, a price or any writing of your own.
- Don't name yourself, your company or your model anywhere, code comments included. Visitors vote before they find out who made what.
- Keep it light enough to run smoothly on a laptop next to a dozen other pieces.

## Name your dish

Your dish's name is written on the menu in chalk, so it's the pun itself: 1 to 4 words, a waffle pun on something that isn't a waffle. Its description goes underneath, and it has to be really short: 8 words at most.

## What to send back

1. The complete HTML file in a single `html` code block.
2. After it, a JSON code block. Don't mention who you are:

```json
{
  "title": "your dish's name (the pun)",
  "statement": "A menu description of 8 words or fewer."
}
```
