```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #10182b; }
  svg { display: block; width: 100%; height: 100%; }
  .fairy-bob { animation: hover 5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .wing-a { animation: wing 3.2s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 88% 72%; }
  .wing-b { animation: wing 3.2s ease-in-out infinite alternate-reverse; transform-box: fill-box; transform-origin: 12% 72%; }
  .hair-tip { animation: hair 5s ease-in-out infinite; transform-box: fill-box; transform-origin: 20% 10%; }
  .flower-head { animation: flower 5.5s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 90%; }
  .glow-pulse { animation: pulse 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .mote { animation: drift 8s ease-in-out infinite; }
  .mote:nth-of-type(2n) { animation-delay: -3s; animation-duration: 10s; }
  .mote:nth-of-type(3n) { animation-delay: -5s; animation-duration: 12s; }
  .twinkle { animation: twinkle 3s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
  @keyframes hover { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  @keyframes wing { from { transform: scaleX(.93) rotate(-2deg); } to { transform: scaleX(1.04) rotate(2deg); } }
  @keyframes hair { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(2deg); } }
  @keyframes flower { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(1.5deg); } }
  @keyframes pulse { 0%,100% { opacity: .65; transform: scale(.96); } 50% { opacity: 1; transform: scale(1.06); } }
  @keyframes drift { 0%,100% { transform: translate(0, 0); opacity: .25; } 50% { transform: translate(8px, -20px); opacity: .9; } }
  @keyframes twinkle { from { opacity: .25; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 12s !important; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A small winged fairy hovers beside a glowing flower at first light.">
<defs>
  <linearGradient id="sky" x2="0" y2="1">
    <stop stop-color="#111a35"/>
    <stop offset=".43" stop-color="#344568"/>
    <stop offset=".73" stop-color="#d18d91"/>
    <stop offset="1" stop-color="#f4c39a"/>
  </linearGradient>
  <radialGradient id="dawn">
    <stop stop-color="#fff4cb" stop-opacity=".95"/>
    <stop offset=".3" stop-color="#f6c89a" stop-opacity=".52"/>
    <stop offset="1" stop-color="#e8a5a2" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="hill" x2="0" y2="1">
    <stop stop-color="#5b607b"/>
    <stop offset="1" stop-color="#242d49"/>
  </linearGradient>
  <linearGradient id="ground" x2="0" y2="1">
    <stop stop-color="#394054"/>
    <stop offset="1" stop-color="#151d31"/>
  </linearGradient>
  <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#fff4de" stop-opacity=".84"/>
    <stop offset=".45" stop-color="#b9e7e1" stop-opacity=".48"/>
    <stop offset="1" stop-color="#f3a9b7" stop-opacity=".18"/>
  </linearGradient>
  <linearGradient id="wing2" x1="0" y1="1" x2="1" y2="0">
    <stop stop-color="#f7d5dc" stop-opacity=".58"/>
    <stop offset=".55" stop-color="#d9eff0" stop-opacity=".42"/>
    <stop offset="1" stop-color="#fff2cf" stop-opacity=".8"/>
  </linearGradient>
  <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#f7e7c2"/>
    <stop offset=".48" stop-color="#d9c6bb"/>
    <stop offset="1" stop-color="#8d9aab"/>
  </linearGradient>
  <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#f5c985"/>
    <stop offset=".48" stop-color="#bd765f"/>
    <stop offset="1" stop-color="#603e56"/>
  </linearGradient>
  <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#fff4d4"/>
    <stop offset=".55" stop-color="#f4c8b4"/>
    <stop offset="1" stop-color="#d68c9a"/>
  </linearGradient>
  <radialGradient id="seed">
    <stop stop-color="#fffbd7"/>
    <stop offset=".35" stop-color="#ffd98e"/>
    <stop offset="1" stop-color="#d88971"/>
  </radialGradient>
  <filter id="soft">
    <feGaussianBlur stdDeviation="18"/>
  </filter>
  <filter id="shine">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>

<!-- The long blue hour giving way to dawn -->
<rect width="600" height="900" fill="url(#sky)"/>
<ellipse cx="296" cy="548" rx="260" ry="190" fill="url(#dawn)" class="glow-pulse"/>
<circle cx="301" cy="539" r="48" fill="#ffe5b7" opacity=".38" filter="url(#soft)"/>
<circle cx="301" cy="543" r="20" fill="#fff0c7" opacity=".78"/>
<path d="M0 548 Q124 510 242 549 Q380 586 600 524 L600 900 0 900Z" fill="#60627a" opacity=".42"/>
<path d="M0 602 Q110 547 232 588 Q376 632 600 568 L600 900 0 900Z" fill="url(#hill)"/>
<path d="M0 684 Q125 621 236 656 Q379 701 600 631 L600 900 0 900Z" fill="#303950"/>
<path d="M0 758 Q150 689 289 739 Q422 787 600 700 L600 900 0 900Z" fill="url(#ground)"/>

<!-- Last stars, still visible in the morning -->
<g fill="#fff1d4">
  <circle class="twinkle" cx="72" cy="112" r="2.2"/>
  <circle class="twinkle" cx="184" cy="174" r="1.7"/>
  <circle class="twinkle" cx="459" cy="107" r="2"/>
  <circle class="twinkle" cx="527" cy="239" r="1.6"/>
  <circle class="twinkle" cx="394" cy="193" r="1.4"/>
  <circle class="twinkle" cx="119" cy="285" r="1.5"/>
  <circle class="twinkle" cx="495" cy="377" r="1.8"/>
  <circle cx="255" cy="90" r="1.4" opacity=".7"/>
  <circle cx="72" cy="412" r="1.3" opacity=".7"/>
</g>
<g stroke="#fff0d1" stroke-width="1" opacity=".6">
  <path class="twinkle" d="M412 286v10m-5-5h10"/>
  <path class="twinkle" d="M145 367v8m-4-4h8"/>
  <path class="twinkle" d="M535 474v7m-3.5-3.5h7"/>
</g>

<!-- Low grasses and distant flower silhouettes -->
<g fill="none" stroke-linecap="round">
  <g stroke="#82917e" opacity=".55" stroke-width="2">
    <path d="M35 900 Q45 804 91 757 M46 900 Q57 822 28 785 M83 900 Q80 836 120 801"/>
    <path d="M522 900 Q498 814 530 760 M546 900 Q550 831 579 810 M492 900 Q488 850 461 819"/>
    <path d="M247 900 Q230 824 253 791 M262 900 Q275 847 310 821"/>
  </g>
  <g stroke="#d4a99a" opacity=".48" stroke-width="1.5">
    <path d="M104 704q-20-30-10-51m10 51q16-29 34-33"/>
    <path d="M446 679q-17-30-8-49m8 49q19-28 34-27"/>
  </g>
</g>

<!-- Flower: near the fairy, rooted in the waking earth -->
<path d="M168 900 Q174 796 170 682" fill="none" stroke="#70896f" stroke-width="5"/>
<path d="M171 804 Q134 779 116 793 Q132 825 170 818Z" fill="#6c8871"/>
<path d="M171 846 Q203 812 229 819 Q216 852 173 862Z" fill="#84927a"/>
<path d="M170 739 Q139 720 126 731 Q140 755 169 753Z" fill="#8e9b7e"/>
<g class="flower-head">
  <path d="M166 658 C133 640 127 615 143 604 C154 596 165 614 169 634 C164 602 174 580 188 584 C203 588 195 615 177 639 C199 613 221 608 226 623 C231 639 207 652 179 660Z" fill="url(#petal)" stroke="#ffe9d2" stroke-width="2"/>
  <path d="M169 657 C149 641 146 625 154 619 C163 614 171 633 171 648 C173 627 185 614 192 620 C199 627 186 645 176 654 C194 640 207 643 207 650 C207 658 188 663 174 662Z" fill="#f7d8bd" opacity=".95"/>
  <circle cx="172" cy="655" r="11" fill="url(#seed)" filter="url(#shine)"/>
  <g fill="#fff4cb">
    <circle cx="159" cy="653" r="1.5"/><circle cx="165" cy="646" r="1.4"/>
    <circle cx="179" cy="647" r="1.6"/><circle cx="184" cy="657" r="1.3"/>
    <circle cx="170" cy="663" r="1.5"/>
  </g>
</g>
<ellipse cx="171" cy="661" rx="53" ry="48" fill="#ffe9b2" opacity=".24" filter="url(#soft)"/>

<!-- Fairy light: a fine invitation between her open hand and the flower -->
<path d="M274 464 C244 496 232 539 198 604" fill="none" stroke="#ffedbd" stroke-width="1.5" opacity=".72"/>
<path d="M274 464 C244 496 232 539 198 604" fill="none" stroke="#ffe9a8" stroke-width="7" opacity=".13" filter="url(#soft)"/>
<circle cx="274" cy="464" r="4" fill="#fff6d8" filter="url(#shine)"/>
<circle cx="198" cy="604" r="3" fill="#fff4cf" filter="url(#shine)"/>

<!-- Wings, fine as morning mist -->
<g class="fairy-bob">
  <g class="wing-a">
    <path d="M346 416 C281 369 252 298 273 258 C296 216 344 253 365 310 C379 348 371 390 356 423Z" fill="url(#wing)" stroke="#f6e6d2" stroke-opacity=".78" stroke-width="1.5"/>
    <path d="M349 418 C305 381 275 321 278 272 M350 414 C332 358 320 308 299 249 M352 414 C359 353 353 300 338 265" fill="none" stroke="#fff2d8" stroke-opacity=".54" stroke-width="1"/>
    <path d="M348 416 C298 423 264 463 265 496 C266 530 307 514 338 475 C355 454 360 433 356 418Z" fill="url(#wing2)" stroke="#f6e6d2" stroke-opacity=".7" stroke-width="1.4"/>
    <path d="M351 418 C319 447 291 474 270 495 M351 418 C331 452 329 486 310 512 M351 418 C348 451 352 478 341 491" fill="none" stroke="#fff2d8" stroke-opacity=".48" stroke-width="1"/>
  </g>
  <g class="wing-b">
    <path d="M344 416 C402 371 438 306 421 267 C403 224 358 255 336 312 C321 351 327 390 338 423Z" fill="url(#wing2)" stroke="#f6e6d2" stroke-opacity=".78" stroke-width="1.5"/>
    <path d="M341 418 C389 382 420 324 418 278 M341 414 C360 358 380 307 401 255 M340 414 C330 352 340 301 360 265" fill="none" stroke="#fff2d8" stroke-opacity=".54" stroke-width="1"/>
    <path d="M342 416 C390 425 425 461 425 493 C424 527 385 515 351 475 C335 455 330 433 335 418Z" fill="url(#wing)" stroke="#f6e6d2" stroke-opacity=".7" stroke-width="1.4"/>
    <path d="M340 418 C373 447 401 473 421 493 M340 418 C363 450 364 485 384 512 M340 418 C343 450 339 478 350 491" fill="none" stroke="#fff2d8" stroke-opacity=".48" stroke-width="1"/>
  </g>

  <!-- Hair flowing behind the face -->
  <path d="M320 351 C306 378 305 410 318 435 C326 451 311 477 287 488 C301 459 293 440 301 418 C283 397 289 369 302 348Z" fill="url(#hair)"/>
  <g class="hair-tip">
    <path d="M330 355 C363 370 383 397 377 433 C373 457 399 468 419 461 C399 486 363 482 351 456 C340 431 351 404 331 385Z" fill="url(#hair)"/>
    <path d="M337 366 Q367 397 363 431 Q361 452 380 464" fill="none" stroke="#f3c58d" stroke-opacity=".7" stroke-width="2"/>
  </g>

  <!-- Legs, briefly visible beneath the petal dress -->
  <path d="M334 475 Q326 500 314 519 Q309 527 299 527" fill="none" stroke="#e5bca1" stroke-width="6" stroke-linecap="round"/>
  <path d="M347 476 Q354 495 368 508 Q375 514 382 510" fill="none" stroke="#e5bca1" stroke-width="6" stroke-linecap="round"/>
  <path d="M300 527q-7 2-10-2m92-15q7 2 10-2" fill="none" stroke="#f4d1ad" stroke-width="3" stroke-linecap="round"/>

  <!-- Floating gown -->
  <path d="M326 421 Q343 414 355 426 Q360 450 371 480 Q348 498 308 481 Q326 456 326 421Z" fill="url(#dress)" stroke="#fff0d6" stroke-opacity=".7" stroke-width="1.5"/>
  <path d="M326 435 Q343 450 357 480 M339 426 Q339 455 332 486 M351 433 Q354 454 368 477" fill="none" stroke="#fff9e8" stroke-opacity=".62" stroke-width="2"/>
  <path d="M310 481 Q335 471 371 480 Q355 499 317 490Z" fill="#ead5c2" opacity=".8"/>
  <path d="M322 431 Q340 441 359 431" fill="none" stroke="#b78e7d" stroke-width="2" opacity=".65"/>

  <!-- Reaching arm -->
  <path d="M328 432 Q306 438 290 452 Q281 460 273 464" fill="none" stroke="#e9bea4" stroke-width="7" stroke-linecap="round"/>
  <path d="M273 464q-8 2-12-2m13 1q-5 6-11 6m12-5q-2 7-7 9" fill="none" stroke="#f2ceb0" stroke-width="2.4" stroke-linecap="round"/>
  <!-- Other arm resting near her heart -->
  <path d="M353 433 Q368 447 363 458 Q357 466 348 460" fill="none" stroke="#e8bda3" stroke-width="6" stroke-linecap="round"/>

  <!-- Neck and face, turned toward the flower -->
  <path d="M328 389 Q331 408 324 421 Q333 432 349 421 L347 393Z" fill="#eabda0"/>
  <path d="M305 357 Q309 332 334 329 Q360 330 363 357 Q365 384 346 399 Q331 407 316 390 Q305 376 305 357Z" fill="#f0c8a9"/>
  <!-- Profile's small, intent features -->
  <path d="M308 365 Q300 368 306 373 Q309 375 307 379" fill="none" stroke="#c58579" stroke-width="2" stroke-linecap="round"/>
  <path d="M310 382 Q316 385 321 382" fill="none" stroke="#9d5f64" stroke-width="1.7" stroke-linecap="round"/>
  <circle cx="315" cy="361" r="2" fill="#45394b"/>
  <path d="M310 355 Q316 350 322 354" fill="none" stroke="#704b50" stroke-width="2" stroke-linecap="round"/>

  <!-- Crown of sunlit hair -->
  <path d="M305 365 C294 345 304 322 324 318 C345 309 367 324 370 348 C360 340 350 335 343 336 C333 354 320 360 305 365Z" fill="url(#hair)"/>
  <path d="M307 353 Q316 329 339 325 Q357 326 366 344" fill="none" stroke="#f4d093" stroke-width="2.2" opacity=".82"/>
  <path d="M301 357 Q297 379 311 393 Q320 402 323 411" fill="none" stroke="#bc7964" stroke-width="6" stroke-linecap="round"/>
  <circle cx="337" cy="321" r="3" fill="#ffebbd"/>
  <circle cx="337" cy="321" r="9" fill="#ffe8b0" opacity=".24" filter="url(#soft)"/>
</g>

<!-- Slow, wandering sparks -->
<g fill="#fff0c4" filter="url(#shine)">
  <circle class="mote" cx="244" cy="348" r="2.2"/>
  <circle class="mote" cx="414" cy="334" r="1.8"/>
  <circle class="mote" cx="237" cy="523" r="2"/>
  <circle class="mote" cx="430" cy="540" r="2.4"/>
  <circle class="mote" cx="129" cy="565" r="1.7"/>
  <circle class="mote" cx="207" cy="449" r="1.6"/>
  <circle class="mote" cx="388" cy="583" r="1.8"/>
  <circle class="mote" cx="291" cy="596" r="1.5"/>
  <circle class="mote" cx="98" cy="675" r="1.6"/>
</g>

<!-- Foreground seed heads and soft, dark leaves -->
<g fill="none" stroke-linecap="round">
  <path d="M411 900 Q400 813 427 746 M426 900 Q446 833 475 799 M118 900 Q99 837 105 797" stroke="#6c806e" stroke-width="3"/>
  <path d="M427 771q-25-17-34-9m40-1q16-23 31-22M104 817q-19-20-32-13" stroke="#89947a" stroke-width="2"/>
</g>
<g fill="#d9b49a" opacity=".75">
  <circle cx="426" cy="745" r="3"/><circle cx="475" cy="799" r="2.5"/>
  <circle cx="105" cy="797" r="2.5"/><circle cx="393" cy="762" r="2"/>
</g>
</svg>
</body>
</html>
```

```json
{
  "title": "The Fairy of First Light",
  "statement": "Hope arrives softly; notice what has begun to glow."
}
```