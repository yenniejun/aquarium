```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: transparent;
  }
  svg {
    display: block;
    width: 100vw;
    height: 100vh;
    overflow: visible;
  }
  .body-bob {
    transform-box: fill-box;
    transform-origin: center;
    animation: bob 3.2s ease-in-out infinite;
  }
  .left-arm {
    transform-box: fill-box;
    transform-origin: 100% 100%;
    animation: leftWave 2.8s ease-in-out infinite;
  }
  .right-arm {
    transform-box: fill-box;
    transform-origin: 0% 100%;
    animation: rightWave 2.5s ease-in-out infinite;
  }
  .lid {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: lidTip 3.2s ease-in-out infinite;
  }
  .sparkle {
    transform-box: fill-box;
    transform-origin: center;
    animation: twinkle 1.7s ease-in-out infinite alternate;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes leftWave {
    0%, 100% { transform: rotate(-2deg); }
    50% { transform: rotate(4deg); }
  }
  @keyframes rightWave {
    0%, 100% { transform: rotate(2deg); }
    50% { transform: rotate(-4deg); }
  }
  @keyframes lidTip {
    0%, 78%, 100% { transform: rotate(0); }
    88% { transform: rotate(-5deg); }
  }
  @keyframes twinkle {
    from { opacity: .3; transform: scale(.75); }
    to { opacity: 1; transform: scale(1.15); }
  }
</style>
</head>
<body>
<svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" aria-label="A pitcher-plant clown juggling dewdrops">
  <defs>
    <linearGradient id="pitcher" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b8e878"/>
      <stop offset=".38" stop-color="#59ad61"/>
      <stop offset="1" stop-color="#176b58"/>
    </linearGradient>
    <linearGradient id="lip" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#f9a3a1"/>
      <stop offset=".52" stop-color="#e85e78"/>
      <stop offset="1" stop-color="#9c315c"/>
    </linearGradient>
    <linearGradient id="pot" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#f59b66"/>
      <stop offset=".5" stop-color="#d95062"/>
      <stop offset="1" stop-color="#922e59"/>
    </linearGradient>
    <radialGradient id="dew">
      <stop offset="0" stop-color="#fffef0"/>
      <stop offset=".28" stop-color="#fff7bd"/>
      <stop offset=".68" stop-color="#8ee8df"/>
      <stop offset="1" stop-color="#55aeca"/>
    </radialGradient>
    <radialGradient id="goldDew">
      <stop stop-color="#fffde6"/>
      <stop offset=".35" stop-color="#ffe78e"/>
      <stop offset="1" stop-color="#f29b45"/>
    </radialGradient>
    <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Juggling arc -->
  <path d="M145 312 C205 184 396 176 458 309" fill="none"
        stroke="#f6d98a" stroke-width="2" stroke-dasharray="2 10"
        stroke-linecap="round" opacity=".55"/>
  <g class="sparkle" fill="#fff1b4">
    <path d="M111 285l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>
  </g>
  <g class="sparkle" fill="#bcefe1" style="animation-delay:.6s">
    <path d="M482 254l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>
  </g>
  <circle r="18" fill="url(#dew)" filter="url(#softGlow)">
    <animateMotion dur="3.4s" repeatCount="indefinite"
      path="M150 305 C205 188 392 185 450 305 C390 403 210 403 150 305"/>
  </circle>
  <circle r="15" fill="url(#goldDew)" filter="url(#softGlow)">
    <animateMotion dur="3.4s" begin="-1.13s" repeatCount="indefinite"
      path="M150 305 C205 188 392 185 450 305 C390 403 210 403 150 305"/>
  </circle>
  <circle r="13" fill="url(#dew)" filter="url(#softGlow)">
    <animateMotion dur="3.4s" begin="-2.26s" repeatCount="indefinite"
      path="M150 305 C205 188 392 185 450 305 C390 403 210 403 150 305"/>
  </circle>

  <!-- Leafy arms -->
  <g class="left-arm">
    <path d="M254 411 C218 389 194 365 170 333 C152 309 134 297 112 296"
          fill="none" stroke="#267955" stroke-width="13" stroke-linecap="round"/>
    <path d="M205 374 C177 378 159 367 150 346 C176 345 194 353 205 374Z"
          fill="#77c96c" stroke="#286e54" stroke-width="3"/>
    <path d="M168 335 C147 338 130 327 125 307 C146 305 161 315 168 335Z"
          fill="#98d86e" stroke="#286e54" stroke-width="3"/>
    <path d="M112 296 C106 283 112 270 126 264 C137 278 132 291 112 296Z"
          fill="#71bd63" stroke="#286e54" stroke-width="3"/>
    <path d="M112 296 Q122 281 126 264" fill="none" stroke="#d6ef9a" stroke-width="2"/>
  </g>
  <g class="right-arm">
    <path d="M346 410 C382 385 408 360 431 329 C449 304 465 289 488 287"
          fill="none" stroke="#267955" stroke-width="13" stroke-linecap="round"/>
    <path d="M397 370 C424 372 441 359 448 338 C424 338 408 348 397 370Z"
          fill="#77c96c" stroke="#286e54" stroke-width="3"/>
    <path d="M435 329 C456 331 472 318 476 298 C454 297 440 309 435 329Z"
          fill="#98d86e" stroke="#286e54" stroke-width="3"/>
    <path d="M488 287 C495 274 489 261 475 256 C464 270 469 283 488 287Z"
          fill="#71bd63" stroke="#286e54" stroke-width="3"/>
    <path d="M488 287 Q478 272 475 256" fill="none" stroke="#d6ef9a" stroke-width="2"/>
  </g>

  <!-- Back leaves -->
  <path d="M286 644 C243 606 201 592 174 608 C196 646 234 660 286 658Z"
        fill="#70bc68" stroke="#286e54" stroke-width="4"/>
  <path d="M313 646 C353 600 402 587 430 606 C412 644 370 662 313 660Z"
        fill="#70bc68" stroke="#286e54" stroke-width="4"/>
  <path d="M224 625l54 27M381 616l-59 37" stroke="#d3eb91" stroke-width="3" opacity=".8"/>

  <!-- Pitcher body and face -->
  <g class="body-bob">
    <path d="M249 333
      C238 377 229 419 235 477
      C242 548 257 615 276 675
      Q300 693 324 675
      C343 615 358 548 365 477
      C371 419 362 377 351 333Z"
      fill="url(#pitcher)" stroke="#205e51" stroke-width="6"/>
    <path d="M260 385 C249 465 262 572 286 646"
          fill="none" stroke="#d4f19a" stroke-width="8" opacity=".44" stroke-linecap="round"/>
    <path d="M342 398 C353 476 340 572 322 635"
          fill="none" stroke="#155d50" stroke-width="7" opacity=".35" stroke-linecap="round"/>

    <!-- freckles and friendly face -->
    <ellipse cx="276" cy="444" rx="7" ry="10" fill="#173e3d"/>
    <ellipse cx="324" cy="444" rx="7" ry="10" fill="#173e3d"/>
    <circle cx="278" cy="441" r="2.5" fill="#fff6d8"/>
    <circle cx="326" cy="441" r="2.5" fill="#fff6d8"/>
    <ellipse cx="258" cy="466" rx="12" ry="7" fill="#f18a91" opacity=".85"/>
    <ellipse cx="342" cy="466" rx="12" ry="7" fill="#f18a91" opacity=".85"/>
    <path d="M282 468 Q300 488 318 468" fill="none" stroke="#77344e"
          stroke-width="5" stroke-linecap="round"/>
    <path d="M288 476 Q300 482 312 476" fill="none" stroke="#fff0c9"
          stroke-width="2.5" stroke-linecap="round"/>

    <!-- pitcher mouth and ruffled rim -->
    <path d="M242 342 Q300 327 358 342 L352 365 Q300 382 248 365Z"
          fill="url(#lip)" stroke="#8e355b" stroke-width="5"/>
    <path d="M250 347 Q300 337 350 347" fill="none" stroke="#ffd1bd" stroke-width="4"
          stroke-linecap="round"/>
    <path d="M252 362 Q264 352 275 365 Q287 351 300 366 Q313 351 325 365 Q338 352 349 362"
          fill="none" stroke="#f9b1a9" stroke-width="5" stroke-linecap="round"/>

    <!-- jaunty leaf cap -->
    <g class="lid">
      <path d="M276 335 C258 303 254 272 269 247
        C286 258 299 277 300 307
        C308 269 330 245 352 239
        C361 272 347 307 321 337Z"
        fill="#4d9e5b" stroke="#205e51" stroke-width="5"/>
      <path d="M300 326 Q296 282 269 247 M303 328 Q320 278 352 239"
        fill="none" stroke="#bfe77c" stroke-width="4" opacity=".85"/>
      <path d="M282 305 Q300 288 320 304 Q300 322 282 305Z"
        fill="#e55a77" stroke="#9c315c" stroke-width="3"/>
      <circle cx="301" cy="305" r="5" fill="#ffe8a4"/>
    </g>

    <!-- clown collar -->
    <path d="M254 526
      Q236 501 222 516 Q222 537 246 544
      Q222 548 228 570 Q246 579 263 555
      Q251 581 270 594 Q288 584 286 557
      Q300 585 314 594 Q333 581 320 555
      Q339 579 359 570 Q365 548 342 544
      Q366 537 363 516 Q346 501 327 526
      Q300 510 254 526Z"
      fill="#f7d975" stroke="#a64c60" stroke-width="4"/>
    <path d="M258 532 Q300 548 323 532" fill="none" stroke="#fff2bf" stroke-width="4"/>
    <path d="M287 536 Q300 525 313 536 L308 550 300 556 292 550Z"
          fill="#e64d73" stroke="#9a315b" stroke-width="3"/>
    <circle cx="300" cy="541" r="4" fill="#ffe8a4"/>
  </g>

  <!-- Pot, soil, and little decorative leaves -->
  <path d="M183 700 Q300 686 417 700 L396 777
      Q390 796 372 800 L228 800 Q210 796 204 777Z"
      fill="url(#pot)" stroke="#792d50" stroke-width="6"/>
  <path d="M195 714 Q300 728 405 714" fill="none" stroke="#ffbd83" stroke-width="5" opacity=".8"/>
  <path d="M207 740 Q300 753 393 740" fill="none" stroke="#f38379" stroke-width="3" opacity=".8"/>
  <path d="M220 770 Q300 781 380 770" fill="none" stroke="#f38379" stroke-width="3" opacity=".8"/>
  <path d="M194 695 Q300 681 406 695 L414 713 Q300 730 186 713Z"
        fill="#8c4b51" stroke="#612e49" stroke-width="5"/>
  <ellipse cx="300" cy="699" rx="104" ry="11" fill="#3d463d"/>
  <path d="M274 699 Q282 688 289 699 Q300 686 309 699 Q320 687 327 699"
        fill="#6c9c56"/>
  <path d="M240 730 Q250 720 260 730 M340 730 Q350 720 360 730"
        fill="none" stroke="#ffd39a" stroke-width="4" stroke-linecap="round"/>
  <circle cx="300" cy="751" r="5" fill="#ffd77c"/>
</svg>
</body>
</html>
```

```json
{
  "title": "The Dewdrop Revue",
  "statement": "Step right up for a pitcher-plant clown with a leafy flourish and three impossible dewdrop tricks. Every loop ends with a smile—and starts all over again."
}
```