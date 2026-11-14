```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #090d20; }
  svg { display: block; width: 100%; height: 100%; }
  .fairy { transform-box: fill-box; transform-origin: center; animation: hover 6s ease-in-out infinite; }
  .wing-left { transform-box: view-box; transform-origin: 302px 365px; animation: leftWing 3.4s ease-in-out infinite; }
  .wing-right { transform-box: view-box; transform-origin: 306px 362px; animation: rightWing 3.4s ease-in-out infinite; }
  .letter-a { transform-box: fill-box; transform-origin: center; animation: driftA 8s ease-in-out infinite; }
  .letter-b { transform-box: fill-box; transform-origin: center; animation: driftB 10s ease-in-out infinite; }
  .letter-c { transform-box: fill-box; transform-origin: center; animation: driftC 9s ease-in-out infinite; }
  .glow { animation: pulse 4s ease-in-out infinite; }
  .mote { animation: mote 7s ease-in-out infinite; }
  @keyframes hover { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-11px) rotate(1deg); } }
  @keyframes leftWing { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(5deg); } }
  @keyframes rightWing { 0%,100% { transform: rotate(4deg); } 50% { transform: rotate(-5deg); } }
  @keyframes driftA { 0%,100% { transform: translate(0,0) rotate(-3deg); } 50% { transform: translate(5px,-9px) rotate(1deg); } }
  @keyframes driftB { 0%,100% { transform: translate(0,0) rotate(3deg); } 50% { transform: translate(-6px,8px) rotate(-1deg); } }
  @keyframes driftC { 0%,100% { transform: translate(0,0) rotate(-5deg); } 50% { transform: translate(7px,-6px) rotate(2deg); } }
  @keyframes pulse { 0%,100% { opacity: .45; } 50% { opacity: .9; } }
  @keyframes mote { 0%,100% { transform: translateY(0); opacity: .25; } 50% { transform: translateY(-17px); opacity: .9; } }
</style>
</head>
<body>
<svg viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-label="A moonlit fairy floats among drifting blank letters">
<defs>
  <linearGradient id="sky" x2=".15" y2="1">
    <stop stop-color="#11132c"/>
    <stop offset=".47" stop-color="#272344"/>
    <stop offset="1" stop-color="#101d36"/>
  </linearGradient>
  <radialGradient id="moonlight">
    <stop stop-color="#f3d8ae" stop-opacity=".68"/>
    <stop offset=".3" stop-color="#c6a5b8" stop-opacity=".2"/>
    <stop offset="1" stop-color="#a087ba" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#ffe8c8" stop-opacity=".7"/>
    <stop offset=".48" stop-color="#d6c6eb" stop-opacity=".33"/>
    <stop offset="1" stop-color="#9c9acc" stop-opacity=".12"/>
  </linearGradient>
  <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#ffe2c4"/>
    <stop offset="1" stop-color="#c997a5"/>
  </linearGradient>
  <linearGradient id="dress" x1="0" y1="0" x2=".85" y2="1">
    <stop stop-color="#e8d8d2"/>
    <stop offset=".48" stop-color="#a99bbd"/>
    <stop offset="1" stop-color="#555b83"/>
  </linearGradient>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#fff0d2"/>
    <stop offset=".65" stop-color="#e5cba9"/>
    <stop offset="1" stop-color="#bba995"/>
  </linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#36405d" stop-opacity=".7"/>
    <stop offset="1" stop-color="#101a30"/>
  </linearGradient>
  <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="12"/>
  </filter>
  <filter id="smallGlow" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="3"/>
  </filter>
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
</defs>

<rect width="600" height="900" fill="url(#sky)"/>
<ellipse cx="310" cy="398" rx="285" ry="330" fill="url(#moonlight)"/>
<circle cx="466" cy="160" r="90" fill="#f0d7bd" opacity=".05"/>
<circle cx="466" cy="160" r="49" fill="#f2ddc5" opacity=".82"/>
<circle cx="483" cy="144" r="49" fill="#191a35"/>
<circle cx="455" cy="160" r="68" fill="#e9cda9" opacity=".08" filter="url(#softGlow)"/>

<g fill="#f5dfc5">
  <circle cx="82" cy="116" r="1.6" opacity=".8"/><circle cx="158" cy="82" r="1.2" opacity=".65"/>
  <circle cx="228" cy="156" r="1.5" opacity=".7"/><circle cx="363" cy="83" r="1.3" opacity=".7"/>
  <circle cx="541" cy="259" r="1.5" opacity=".65"/><circle cx="97" cy="300" r="1.2" opacity=".6"/>
  <circle cx="186" cy="230" r="1" opacity=".7"/><circle cx="410" cy="282" r="1.2" opacity=".6"/>
  <circle cx="518" cy="82" r="1.2" opacity=".6"/><circle cx="48" cy="199" r="1" opacity=".7"/>
</g>

<path d="M0 565 C94 536 176 565 255 548 C362 526 450 558 600 524 L600 900 L0 900Z" fill="#151a31" opacity=".72"/>
<path d="M0 668 C118 635 227 678 323 651 C431 620 519 658 600 634 L600 900 L0 900Z" fill="url(#water)"/>
<path d="M0 678 C108 649 202 689 302 666 C415 640 505 670 600 652" fill="none" stroke="#b6a6b3" stroke-opacity=".17" stroke-width="2"/>
<g fill="none" stroke="#c8b6b8" stroke-opacity=".22" stroke-linecap="round">
  <path d="M60 718 Q137 709 202 720"/><path d="M385 707 Q451 693 535 708"/>
  <path d="M110 769 Q188 757 255 770"/><path d="M336 752 Q421 741 494 756"/>
  <path d="M32 824 Q121 813 177 823"/><path d="M419 817 Q491 807 570 820"/>
</g>
<g fill="none" stroke="#17172d" stroke-width="8" stroke-linecap="round" opacity=".75">
  <path d="M29 675 Q44 596 34 529 M34 603 Q10 579 8 548 M34 620 Q61 591 65 558"/>
  <path d="M565 658 Q548 584 565 513 M561 604 Q587 578 589 549 M558 623 Q532 595 529 565"/>
</g>
<ellipse cx="304" cy="574" rx="75" ry="18" fill="#10162a" opacity=".5" filter="url(#shadow)"/>

<g class="glow">
  <circle cx="303" cy="390" r="54" fill="#f8d8b6" opacity=".18" filter="url(#softGlow)"/>
</g>

<g class="wing-left" fill="url(#wing)" stroke="#f5dfd1" stroke-opacity=".76" stroke-width="1.5">
  <path d="M302 365 C252 307 204 235 135 213 C104 203 87 215 93 245 C104 295 181 352 273 383 C221 369 165 378 128 414 C109 433 115 453 140 456 C199 461 256 416 302 378Z"/>
  <path d="M296 365 C259 324 223 270 159 232 M291 374 C236 366 179 363 130 414 M282 380 C231 398 186 430 143 447" fill="none" stroke="#fff0d9" stroke-opacity=".52"/>
  <path d="M210 295 Q223 328 273 372 M167 263 Q199 320 266 376 M184 405 Q225 395 281 378" fill="none" stroke="#f4d7d3" stroke-opacity=".38"/>
</g>
<g class="wing-right" fill="url(#wing)" stroke="#f5dfd1" stroke-opacity=".76" stroke-width="1.5">
  <path d="M306 363 C351 302 392 222 461 204 C491 196 509 208 503 238 C493 291 421 350 333 380 C384 365 439 372 477 407 C499 428 492 450 468 453 C408 458 354 414 306 377Z"/>
  <path d="M312 363 C349 321 384 265 447 225 M318 374 C374 361 431 357 479 407 M327 381 C377 398 424 426 465 444" fill="none" stroke="#fff0d9" stroke-opacity=".52"/>
  <path d="M397 292 Q384 328 335 373 M439 256 Q405 316 341 377 M421 400 Q379 392 323 378" fill="none" stroke="#f4d7d3" stroke-opacity=".38"/>
</g>

<g class="letter-a" transform="translate(78 510) rotate(-12)">
  <path d="M0 12 Q4 4 13 8 L103 0 Q110 1 109 10 L99 101 Q98 109 90 107 L4 95 Q-2 94 0 86Z" fill="#080d1d" opacity=".38" transform="translate(5 9)"/>
  <path d="M0 12 Q4 4 13 8 L103 0 Q110 1 109 10 L99 101 Q98 109 90 107 L4 95 Q-2 94 0 86Z" fill="url(#paper)" stroke="#fff0d4" stroke-opacity=".65"/>
  <path d="M12 19 Q51 12 94 12 M10 29 Q49 24 92 22 M9 39 Q45 36 89 32" fill="none" stroke="#9d8d83" stroke-opacity=".28" stroke-width="1"/>
  <path d="M76 3 L72 30 L101 26" fill="#fff4dd" opacity=".42"/>
</g>
<g class="letter-b" transform="translate(411 488) rotate(13)">
  <path d="M4 4 L97 0 Q104 1 102 9 L111 91 Q111 99 102 100 L9 106 Q1 106 1 98 L0 12 Q0 5 4 4Z" fill="#080d1d" opacity=".4" transform="translate(5 8)"/>
  <path d="M4 4 L97 0 Q104 1 102 9 L111 91 Q111 99 102 100 L9 106 Q1 106 1 98 L0 12 Q0 5 4 4Z" fill="url(#paper)" stroke="#fff0d4" stroke-opacity=".65"/>
  <path d="M12 20 Q50 15 90 13 M13 31 Q52 27 94 24 M13 42 Q47 38 96 35" fill="none" stroke="#9d8d83" stroke-opacity=".28" stroke-width="1"/>
  <path d="M6 12 L33 31 L4 43" fill="#fff3db" opacity=".32"/>
</g>
<g class="letter-c" transform="translate(229 622) rotate(5)">
  <path d="M0 8 Q1 1 9 2 L93 9 Q100 10 99 18 L90 86 Q89 93 81 92 L6 85 Q0 84 0 77Z" fill="#080d1d" opacity=".4" transform="translate(5 8)"/>
  <path d="M0 8 Q1 1 9 2 L93 9 Q100 10 99 18 L90 86 Q89 93 81 92 L6 85 Q0 84 0 77Z" fill="url(#paper)" stroke="#fff0d4" stroke-opacity=".6"/>
  <path d="M12 20 Q48 22 84 26 M11 31 Q47 34 82 37 M10 42 Q47 45 80 48" fill="none" stroke="#9d8d83" stroke-opacity=".3" stroke-width="1"/>
</g>

<g class="fairy">
  <ellipse cx="304" cy="354" rx="15" ry="19" fill="#1c172c"/>
  <path d="M295 304 C285 284 298 268 317 271 C338 275 342 301 330 318 C324 327 307 329 299 320Z" fill="url(#skin)"/>
  <path d="M294 303 C287 282 299 264 319 269 C338 273 345 289 338 307 C330 294 320 290 309 289 C304 300 299 305 294 307Z" fill="#292033"/>
  <path d="M329 302 Q340 306 332 313 Q327 317 324 314" fill="none" stroke="#9d6474" stroke-width="1.5"/>
  <path d="M294 286 C281 294 284 317 291 329 C280 322 274 302 282 286 C288 273 300 266 313 266 C303 272 298 278 294 286Z" fill="#30243a"/>
  <path d="M301 317 Q312 329 327 320 L331 344 Q318 356 297 344Z" fill="url(#skin)"/>
  <path d="M297 338 C283 350 282 379 292 406 C299 423 314 431 326 414 C339 391 334 365 324 345Z" fill="url(#dress)"/>
  <path d="M295 344 Q280 376 288 415 Q299 407 307 379 Q313 410 328 420 Q343 380 325 344 Q313 354 295 344Z" fill="#d7c3d0" opacity=".8"/>
  <path d="M288 404 Q278 425 266 446 Q295 437 314 449 Q332 431 336 415 Q317 426 307 410Z" fill="#8586a7"/>
  <path d="M301 370 Q282 382 270 394 Q263 398 258 393" fill="none" stroke="url(#skin)" stroke-width="7" stroke-linecap="round"/>
  <path d="M326 365 Q344 375 354 391 Q359 397 365 391" fill="none" stroke="url(#skin)" stroke-width="7" stroke-linecap="round"/>
  <path d="M259 393 L251 398 M365 391 L373 387" stroke="#f4d5b6" stroke-width="3" stroke-linecap="round"/>
  <path d="M299 422 Q292 446 278 458 M318 424 Q329 446 325 461" fill="none" stroke="url(#skin)" stroke-width="6" stroke-linecap="round"/>
  <path d="M278 458 Q272 464 267 460 M325 461 Q331 468 336 464" fill="none" stroke="#e3c0bc" stroke-width="4" stroke-linecap="round"/>
  <path d="M291 337 Q306 350 329 338" fill="none" stroke="#f5e1d0" stroke-width="1.6" opacity=".8"/>
  <path d="M292 280 C282 260 293 243 309 239 C302 254 310 259 327 251 C321 266 309 276 292 280Z" fill="#312239"/>
  <path d="M295 276 C282 260 274 252 269 242 M299 274 C294 256 295 248 301 237 M306 272 C309 255 317 249 325 244" fill="none" stroke="#39263d" stroke-width="5" stroke-linecap="round"/>
  <circle cx="329" cy="312" r="2" fill="#291c31"/>
  <circle cx="329" cy="312" r="5" fill="#f1c98f" opacity=".5" filter="url(#smallGlow)"/>
  <path d="M267 398 Q253 405 249 416" fill="none" stroke="#eed8bd" stroke-width="1" opacity=".7"/>
</g>

<g class="glow">
  <circle cx="366" cy="392" r="5" fill="#ffe9bd"/>
  <circle cx="366" cy="392" r="17" fill="#ffdaa0" opacity=".34" filter="url(#smallGlow)"/>
</g>
<g fill="#ffe6bd">
  <circle class="mote" cx="218" cy="443" r="2.2"/>
  <circle class="mote" cx="400" cy="339" r="1.8" style="animation-delay:-2s"/>
  <circle class="mote" cx="190" cy="520" r="1.5" style="animation-delay:-4s"/>
  <circle class="mote" cx="382" cy="553" r="2" style="animation-delay:-1s"/>
  <circle class="mote" cx="302" cy="490" r="1.7" style="animation-delay:-3s"/>
  <circle class="mote" cx="458" cy="438" r="1.3" style="animation-delay:-5s"/>
  <circle class="mote" cx="143" cy="377" r="1.5" style="animation-delay:-2.5s"/>
  <circle class="mote" cx="342" cy="601" r="1.3" style="animation-delay:-1.5s"/>
</g>
<path d="M0 0 H600 V900 H0Z" fill="none" stroke="#070b18" stroke-opacity=".12" stroke-width="22"/>
</svg>
</body>
</html>
```

```json
{
  "title": "The Fairy of Unsent Letters",
  "statement": "What remains unspoken still finds wings; release the message, not its ache."
}
```