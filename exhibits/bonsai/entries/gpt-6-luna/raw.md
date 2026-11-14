```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: transparent;
  }
  body {
    display: grid;
    place-items: end center;
  }
  svg {
    display: block;
    width: min(100vw, 100vh);
    height: min(100vw, 100vh);
    overflow: hidden;
  }
  .sway {
    transform-box: fill-box;
    transform-origin: center;
    animation: breathe 5.8s ease-in-out infinite alternate;
  }
  .sway:nth-of-type(2n) { animation-duration: 6.6s; }
  .sway:nth-of-type(3n) { animation-duration: 7.2s; }
  .sway:nth-of-type(4n) { animation-delay: -2.1s; }
  @keyframes breathe {
    from { transform: rotate(-1.1deg) translateY(0); }
    to   { transform: rotate(1.2deg) translateY(-1.5px); }
  }
  .glint {
    transform-box: fill-box;
    transform-origin: center;
    animation: glimmer 3.8s ease-in-out infinite alternate;
  }
  @keyframes glimmer {
    from { opacity: .3; }
    to   { opacity: .8; }
  }
  @media (prefers-reduced-motion: reduce) {
    .sway, .glint { animation: none; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 600 600" role="img" aria-label="A small, wind-swayed juniper in a glazed ceramic pot">
  <defs>
    <linearGradient id="leaf" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#789b68"/>
      <stop offset=".55" stop-color="#496f53"/>
      <stop offset="1" stop-color="#294e43"/>
    </linearGradient>
    <linearGradient id="leafLight" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#a9b879"/>
      <stop offset="1" stop-color="#66865c"/>
    </linearGradient>
    <linearGradient id="bark" x1="0" y1="0" x2="1" y2=".2">
      <stop stop-color="#543d31"/>
      <stop offset=".45" stop-color="#98704b"/>
      <stop offset="1" stop-color="#604533"/>
    </linearGradient>
    <linearGradient id="ceramic" x1="0" y1="0" x2="1" y2=".6">
      <stop stop-color="#b8c4ad"/>
      <stop offset=".35" stop-color="#8ba69b"/>
      <stop offset=".72" stop-color="#64877f"/>
      <stop offset="1" stop-color="#476b69"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#d1d1b5"/>
      <stop offset="1" stop-color="#829d91"/>
    </linearGradient>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#3c4335"/>
      <stop offset="1" stop-color="#272f29"/>
    </linearGradient>
    <symbol id="foliage" viewBox="0 0 180 100">
      <path d="M14 66
        C6 58 12 45 24 42 C20 29 31 20 45 23
        C49 9 66 8 76 18 C87 4 105 8 110 21
        C126 12 142 23 140 36 C157 31 170 43 164 56
        C177 64 168 78 155 79 C146 91 129 86 121 82
        C108 94 91 87 83 84 C68 94 51 85 46 80
        C31 88 17 79 14 66Z" fill="url(#leaf)"/>
      <path d="M25 57 C31 39 47 36 57 43 C59 26 78 23 87 37
        C98 21 119 28 120 43 C139 35 154 48 148 61
        C159 72 143 80 130 72 C119 86 101 76 96 70
        C82 83 65 74 62 66 C48 78 34 70 25 57Z"
        fill="url(#leafLight)" opacity=".54"/>
      <g fill="#b5c27d" opacity=".8">
        <ellipse cx="38" cy="49" rx="9" ry="3.2" transform="rotate(-29 38 49)"/>
        <ellipse cx="59" cy="30" rx="9" ry="3" transform="rotate(-17 59 30)"/>
        <ellipse cx="78" cy="48" rx="10" ry="3.4" transform="rotate(22 78 48)"/>
        <ellipse cx="99" cy="31" rx="9" ry="3" transform="rotate(-28 99 31)"/>
        <ellipse cx="122" cy="52" rx="10" ry="3.2" transform="rotate(15 122 52)"/>
        <ellipse cx="143" cy="62" rx="8" ry="2.8" transform="rotate(-24 143 62)"/>
        <ellipse cx="71" cy="69" rx="9" ry="3" transform="rotate(-12 71 69)"/>
        <ellipse cx="108" cy="72" rx="8" ry="2.8" transform="rotate(29 108 72)"/>
      </g>
      <g fill="#d6d39a" opacity=".72">
        <circle cx="47" cy="59" r="1.7"/><circle cx="87" cy="28" r="1.5"/>
        <circle cx="132" cy="43" r="1.5"/><circle cx="97" cy="59" r="1.4"/>
      </g>
      <path d="M28 65 Q55 48 83 57 T145 55" fill="none"
        stroke="#d0d39a" stroke-width="1.2" opacity=".26"/>
    </symbol>
  </defs>

  <!-- Branches, with a little wandering left in the trunk -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M300 525 C286 488 292 459 311 429 C329 400 302 376 307 347
      C311 319 345 301 337 270 C330 244 347 218 340 192
      C334 164 352 141 346 111" stroke="#382f29" stroke-width="15"/>
    <path d="M300 525 C286 488 292 459 311 429 C329 400 302 376 307 347
      C311 319 345 301 337 270 C330 244 347 218 340 192
      C334 164 352 141 346 111" stroke="url(#bark)" stroke-width="10"/>
    <path d="M297 481 C301 460 311 441 319 426" stroke="#c09a68" stroke-width="2.2" opacity=".7"/>
    <path d="M307 347 C299 326 281 310 257 298 C238 288 224 278 211 264
      M257 298 C244 274 238 253 230 234
      M311 319 C337 303 361 292 384 277 C399 268 412 251 423 236
      M337 270 C316 247 294 231 277 215 C260 199 247 187 237 171
      M340 192 C357 177 377 167 397 158 C414 150 427 138 437 126
      M346 142 C327 130 314 118 306 104
      M311 429 C294 410 275 398 253 388 C232 379 214 367 198 350
      M319 419 C341 402 362 391 385 382 C408 373 425 358 439 341
      M302 376 C281 359 264 346 246 335 C226 323 211 309 199 293"
      stroke="#49382d" stroke-width="7"/>
    <path d="M307 347 C299 326 281 310 257 298 C238 288 224 278 211 264
      M257 298 C244 274 238 253 230 234
      M311 319 C337 303 361 292 384 277 C399 268 412 251 423 236
      M337 270 C316 247 294 231 277 215 C260 199 247 187 237 171
      M340 192 C357 177 377 167 397 158 C414 150 427 138 437 126
      M346 142 C327 130 314 118 306 104
      M311 429 C294 410 275 398 253 388 C232 379 214 367 198 350
      M319 419 C341 402 362 391 385 382 C408 373 425 358 439 341
      M302 376 C281 359 264 346 246 335 C226 323 211 309 199 293"
      stroke="#9a704b" stroke-width="4.2"/>
    <g stroke="#a77e55" stroke-width="3.1">
      <path d="M230 234 Q211 219 198 204 M237 171 Q225 157 219 145"/>
      <path d="M423 236 Q439 224 449 209 M397 158 Q410 145 414 132"/>
      <path d="M198 350 Q183 336 177 322 M439 341 Q454 326 461 311"/>
      <path d="M211 264 Q197 252 190 239 M384 277 Q403 262 410 246"/>
    </g>
    <g stroke="#c29a6a" stroke-width="1.4" opacity=".65">
      <path d="M307 347 C311 319 345 301 337 270"/>
      <path d="M311 429 C294 410 275 398 253 388"/>
    </g>
  </g>

  <!-- Soft, layered evergreen pads -->
  <g class="sway"><use href="#foliage" x="258" y="76" width="166" height="92"/></g>
  <g class="sway"><use href="#foliage" x="157" y="145" width="167" height="93"/></g>
  <g class="sway"><use href="#foliage" x="353" y="151" width="171" height="95"/></g>
  <g class="sway"><use href="#foliage" x="103" y="235" width="180" height="100"/></g>
  <g class="sway"><use href="#foliage" x="222" y="219" width="168" height="94"/></g>
  <g class="sway"><use href="#foliage" x="365" y="245" width="178" height="99"/></g>
  <g class="sway"><use href="#foliage" x="151" y="329" width="174" height="97"/></g>
  <g class="sway"><use href="#foliage" x="326" y="350" width="174" height="97"/></g>

  <!-- Glazed, gently irregular vessel -->
  <path d="M190 520 Q300 532 410 520 L387 582 Q300 592 213 582Z" fill="url(#ceramic)"/>
  <path d="M190 520 Q300 532 410 520 L405 535 Q300 547 195 535Z" fill="url(#rim)"/>
  <ellipse cx="300" cy="521" rx="105" ry="13" fill="#718779"/>
  <ellipse cx="300" cy="522" rx="94" ry="8.5" fill="url(#soil)"/>

  <!-- Moss and small river-worn stones -->
  <g>
    <path d="M211 522 Q229 514 245 521 Q262 515 276 522
      Q298 516 315 522 Q334 514 350 521 Q370 516 389 522
      L389 526 Q350 531 300 530 Q251 531 211 526Z" fill="#71865a"/>
    <ellipse cx="245" cy="518" rx="8" ry="4" fill="#a6a17d"/>
    <ellipse cx="344" cy="518" rx="10" ry="4.5" fill="#9b9b78"/>
    <ellipse cx="278" cy="520" rx="5" ry="3" fill="#c1b28a"/>
    <g fill="#b3bf7d">
      <circle cx="225" cy="522" r="1.5"/><circle cx="236" cy="519" r="1.4"/>
      <circle cx="365" cy="522" r="1.5"/><circle cx="378" cy="520" r="1.2"/>
    </g>
  </g>

  <!-- Fine incised ornament: a branching line, not a mark or lettering -->
  <g fill="none" stroke="#d0d0ad" stroke-linecap="round" opacity=".58">
    <path d="M300 552 C294 559 305 566 299 575 M299 563 Q285 558 279 551
      M301 568 Q316 561 323 554 M299 575 Q288 574 282 579
      M299 575 Q311 574 318 579" stroke-width="1.6"/>
    <path d="M229 546 Q300 554 371 546 M224 577 Q300 586 376 577"
      stroke-width="1"/>
  </g>
  <g fill="#d9d5b3" opacity=".58">
    <circle cx="246" cy="557" r="1.4"/><circle cx="354" cy="561" r="1.4"/>
    <circle cx="263" cy="574" r="1.1"/><circle cx="339" cy="574" r="1.1"/>
  </g>

  <!-- Low, rounded foot; its base meets the page edge -->
  <path d="M213 581 Q300 592 387 581 L380 600 Q300 600 220 600Z" fill="#607e76"/>
  <path d="M216 584 Q300 594 384 584" fill="none" stroke="#c2c8a9" stroke-width="2" opacity=".65"/>
  <path d="M220 599 Q300 599 380 599" fill="none" stroke="#3f625d" stroke-width="2"/>
</svg>
</body>
</html>
```

```json
{
  "title": "Curious Cloud Juniper",
  "statement": "A juniper with branches that wander like a thought finding its way, carrying soft evergreen clouds in the breeze. Its quietly branching glaze echoes the tree above."
}
```