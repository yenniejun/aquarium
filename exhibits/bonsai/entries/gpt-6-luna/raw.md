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
  body { display: grid; place-items: end center; }
  svg {
    display: block;
    width: min(100vw, 100vh);
    height: min(100vw, 100vh);
    overflow: visible;
  }
  .pad {
    transform-box: fill-box;
    transform-origin: center;
    animation: breathe 5.8s ease-in-out infinite alternate;
  }
  .pad:nth-of-type(2n) { animation-duration: 6.7s; }
  .pad:nth-of-type(3n) { animation-duration: 7.4s; }
  @keyframes breathe {
    from { transform: rotate(-1deg) translateY(0); }
    to   { transform: rotate(1deg) translateY(-2px); }
  }
  .glint {
    animation: glimmer 4.2s ease-in-out infinite alternate;
  }
  @keyframes glimmer {
    from { opacity: .28; }
    to   { opacity: .75; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pad, .glint { animation-duration: 18s; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 700 700" role="img" aria-label="A small, flowering bonsai in a glazed ceramic pot">
  <defs>
    <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#493b32"/>
      <stop offset=".42" stop-color="#806247"/>
      <stop offset=".7" stop-color="#574638"/>
      <stop offset="1" stop-color="#332f2d"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2=".85" y2="1">
      <stop offset="0" stop-color="#b6c99a"/>
      <stop offset=".45" stop-color="#718e69"/>
      <stop offset="1" stop-color="#385d53"/>
    </linearGradient>
    <linearGradient id="leafLight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d2d7a8"/>
      <stop offset="1" stop-color="#7e9b75"/>
    </linearGradient>
    <linearGradient id="ceramic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#365d68"/>
      <stop offset=".48" stop-color="#234755"/>
      <stop offset="1" stop-color="#183644"/>
    </linearGradient>
    <linearGradient id="copper" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a76248"/>
      <stop offset=".45" stop-color="#e0a06c"/>
      <stop offset="1" stop-color="#9b5744"/>
    </linearGradient>
    <radialGradient id="soil" cx=".5" cy=".25" r=".8">
      <stop offset="0" stop-color="#584639"/>
      <stop offset="1" stop-color="#292e2b"/>
    </radialGradient>
  </defs>

  <!-- Branches -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M350 617 C337 577 365 537 351 494 C338 455 351 421 340 381 C329 342 349 309 337 274 C328 244 342 218 334 190"
          stroke="url(#bark)" stroke-width="20"/>
    <path d="M350 524 C324 505 302 481 271 463 C243 447 216 428 197 398"
          stroke="url(#bark)" stroke-width="13"/>
    <path d="M345 467 C374 448 399 425 431 410 C454 399 470 381 480 359"
          stroke="url(#bark)" stroke-width="12"/>
    <path d="M340 379 C313 360 292 341 270 321 C251 305 236 289 229 270"
          stroke="url(#bark)" stroke-width="10"/>
    <path d="M339 334 C368 315 389 293 412 276 C430 263 441 249 446 232"
          stroke="url(#bark)" stroke-width="10"/>
    <path d="M337 275 C318 258 306 240 300 219"
          stroke="url(#bark)" stroke-width="8"/>
    <path d="M351 497 C381 485 405 472 427 453"
          stroke="url(#bark)" stroke-width="8"/>
    <path d="M349 557 C365 543 379 533 393 526"
          stroke="url(#bark)" stroke-width="6"/>
    <path d="M350 617 C339 593 321 585 310 578 M350 617 C363 592 380 585 393 578"
          stroke="#70543f" stroke-width="8"/>
    <path d="M344 584 C348 550 351 519 344 487 C337 451 346 418 335 384 C327 352 341 325 332 294"
          stroke="#c49a6b" stroke-width="2.2" opacity=".65"/>
  </g>

  <!-- Foliage cushions -->
  <g class="pad">
    <path d="M270 184 C273 166 291 155 308 160 C316 141 336 132 353 141 C367 124 392 130 398 149 C418 150 428 166 423 182 C432 197 417 211 400 211 C387 225 365 220 354 216 C337 228 316 218 309 210 C290 216 270 205 270 184Z"
          fill="url(#leaf)" stroke="#496c59" stroke-width="2"/>
    <path d="M286 177 Q310 163 328 174 M332 151 Q350 160 359 175 M373 151 Q389 163 389 180 M303 196 Q328 184 346 198 M361 196 Q385 183 405 193"
          fill="none" stroke="#c8d2a0" stroke-width="2" opacity=".55"/>
    <path d="M292 175 C301 165 307 168 310 176 C304 182 298 181 292 175 M326 158 C335 151 341 155 341 163 C335 169 330 166 326 158 M367 163 C375 155 382 158 382 166 C377 173 371 170 367 163 M393 183 C400 176 407 179 406 187 C401 193 396 190 393 183"
          fill="url(#leafLight)" opacity=".82"/>
    <circle cx="315" cy="190" r="3" fill="#d88969"/>
    <circle cx="378" cy="184" r="2.7" fill="#d88969"/>
  </g>

  <g class="pad">
    <path d="M179 276 C182 260 197 250 214 254 C222 237 242 232 256 242 C271 231 290 239 293 255 C310 262 309 279 298 289 C295 306 277 311 262 305 C248 318 229 312 221 306 C202 313 183 301 185 288 C178 285 176 281 179 276Z"
          fill="url(#leaf)" stroke="#496c59" stroke-width="2"/>
    <path d="M194 273 Q216 260 232 271 M235 249 Q249 256 256 271 M266 253 Q281 263 280 277 M200 292 Q221 281 237 294 M248 293 Q271 278 290 287"
          fill="none" stroke="#c8d2a0" stroke-width="2" opacity=".55"/>
    <path d="M203 268 C210 260 216 264 216 271 C211 276 206 274 203 268 M240 254 C247 248 253 252 252 259 C247 264 242 261 240 254 M272 268 C279 261 284 264 283 271 C278 276 274 274 272 268"
          fill="url(#leafLight)" opacity=".85"/>
    <circle cx="226" cy="288" r="2.8" fill="#d88969"/>
  </g>

  <g class="pad">
    <path d="M384 237 C388 219 405 210 421 216 C432 198 451 197 463 208 C480 198 499 207 501 224 C519 231 520 248 509 259 C507 275 488 282 473 275 C459 289 440 284 431 277 C412 284 393 273 395 260 C385 255 381 246 384 237Z"
          fill="url(#leaf)" stroke="#496c59" stroke-width="2"/>
    <path d="M400 236 Q421 222 438 235 M441 214 Q456 221 462 236 M475 219 Q490 230 487 244 M406 255 Q429 244 446 258 M456 258 Q480 242 500 251"
          fill="none" stroke="#c8d2a0" stroke-width="2" opacity=".55"/>
    <path d="M408 229 C415 221 421 225 420 232 C415 237 411 235 408 229 M448 219 C456 213 461 218 459 225 C454 230 450 226 448 219 M482 236 C489 229 494 233 492 240 C487 245 483 243 482 236"
          fill="url(#leafLight)" opacity=".85"/>
    <circle cx="432" cy="251" r="3" fill="#d88969"/>
    <circle cx="477" cy="262" r="2.5" fill="#d88969"/>
  </g>

  <g class="pad">
    <path d="M133 383 C137 366 155 357 171 362 C181 344 201 342 214 353 C231 343 249 352 252 369 C270 376 271 393 260 404 C258 421 239 426 224 420 C210 433 191 428 182 421 C164 428 145 418 147 405 C136 401 131 392 133 383Z"
          fill="url(#leaf)" stroke="#496c59" stroke-width="2"/>
    <path d="M150 383 Q169 369 187 383 M191 360 Q206 366 213 381 M225 365 Q239 375 237 389 M155 401 Q177 390 194 404 M204 404 Q229 389 249 397"
          fill="none" stroke="#c8d2a0" stroke-width="2" opacity=".55"/>
    <path d="M160 376 C167 368 173 372 172 379 C167 384 163 382 160 376 M198 366 C205 360 211 364 209 371 C204 376 200 373 198 366 M231 382 C238 375 244 379 241 386 C237 391 233 389 231 382"
          fill="url(#leafLight)" opacity=".85"/>
    <circle cx="183" cy="399" r="3" fill="#d88969"/>
    <circle cx="226" cy="397" r="2.5" fill="#d88969"/>
  </g>

  <g class="pad">
    <path d="M284 354 C288 338 305 329 321 334 C331 316 351 314 364 325 C381 315 400 324 402 341 C421 348 422 365 411 376 C409 393 390 398 375 392 C361 405 342 400 333 393 C315 400 296 390 298 377 C287 373 282 363 284 354Z"
          fill="url(#leaf)" stroke="#496c59" stroke-width="2"/>
    <path d="M300 354 Q320 340 337 354 M341 332 Q356 339 362 354 M376 336 Q390 347 388 361 M305 373 Q327 361 344 375 M354 375 Q379 360 399 369"
          fill="none" stroke="#c8d2a0" stroke-width="2" opacity=".55"/>
    <path d="M310 347 C317 339 323 343 322 350 C317 355 313 353 310 347 M348 337 C355 331 361 335 359 342 C354 347 350 344 348 337 M384 353 C391 346 397 350 394 357 C389 362 386 360 384 353"
          fill="url(#leafLight)" opacity=".85"/>
    <circle cx="335" cy="371" r="2.8" fill="#d88969"/>
  </g>

  <g class="pad">
    <path d="M436 345 C440 328 457 319 473 324 C483 306 503 304 516 315 C533 305 552 314 554 331 C573 338 574 355 563 366 C561 383 542 388 527 382 C513 395 494 390 485 383 C467 390 448 380 450 367 C439 363 434 354 436 345Z"
          fill="url(#leaf)" stroke="#496c59" stroke-width="2"/>
    <path d="M452 345 Q472 331 489 345 M493 323 Q508 330 514 345 M528 327 Q542 338 540 352 M457 364 Q479 352 496 366 M506 366 Q531 351 551 360"
          fill="none" stroke="#c8d2a0" stroke-width="2" opacity=".55"/>
    <path d="M462 338 C469 330 475 334 474 341 C469 346 465 344 462 338 M500 328 C507 322 513 326 511 333 C506 338 502 335 500 328 M536 344 C543 337 549 341 546 348 C541 353 538 351 536 344"
          fill="url(#leafLight)" opacity=".85"/>
    <circle cx="482" cy="362" r="2.8" fill="#d88969"/>
    <circle cx="530" cy="365" r="2.5" fill="#d88969"/>
  </g>

  <g class="pad">
    <path d="M356 445 C360 429 377 420 393 425 C403 407 423 405 436 416 C453 406 472 415 474 432 C493 439 494 456 483 467 C481 484 462 489 447 483 C433 496 414 491 405 484 C387 491 368 481 370 468 C359 464 354 454 356 445Z"
          fill="url(#leaf)" stroke="#496c59" stroke-width="2"/>
    <path d="M372 445 Q392 431 409 445 M413 423 Q428 430 434 445 M448 427 Q462 438 460 452 M377 464 Q399 452 416 466 M426 466 Q451 451 471 460"
          fill="none" stroke="#c8d2a0" stroke-width="2" opacity=".55"/>
    <path d="M382 438 C389 430 395 434 394 441 C389 446 385 444 382 438 M420 428 C427 422 433 426 431 433 C426 438 422 435 420 428 M456 444 C463 437 469 441 466 448 C461 453 458 451 456 444"
          fill="url(#leafLight)" opacity=".85"/>
    <circle cx="402" cy="462" r="2.8" fill="#d88969"/>
    <circle cx="449" cy="461" r="2.5" fill="#d88969"/>
  </g>

  <!-- Fine shoots and a few blossoms -->
  <g fill="none" stroke="#526c50" stroke-width="2" stroke-linecap="round">
    <path d="M304 189 Q296 179 294 169 M356 178 Q362 164 372 158 M226 291 Q217 279 215 267 M466 248 Q475 238 478 226 M181 397 Q174 386 173 376 M505 352 Q515 342 518 331 M400 458 Q392 446 391 437"/>
  </g>
  <g class="glint" fill="#e3a17a">
    <circle cx="293" cy="168" r="3"/>
    <circle cx="373" cy="157" r="3"/>
    <circle cx="214" cy="266" r="2.6"/>
    <circle cx="479" cy="225" r="2.8"/>
    <circle cx="172" cy="375" r="2.7"/>
    <circle cx="519" cy="330" r="2.8"/>
  </g>

  <!-- Soil and pot -->
  <ellipse cx="350" cy="617" rx="171" ry="20" fill="url(#soil)"/>
  <g fill="#8b8064" opacity=".72">
    <ellipse cx="249" cy="615" rx="8" ry="3"/>
    <ellipse cx="288" cy="623" rx="5" ry="2.4"/>
    <ellipse cx="421" cy="612" rx="7" ry="3"/>
    <ellipse cx="462" cy="619" rx="5" ry="2"/>
    <circle cx="319" cy="610" r="2"/>
    <circle cx="385" cy="622" r="2"/>
  </g>
  <g fill="#71826a">
    <path d="M222 614 Q226 603 230 613 Q235 601 238 614 Q244 605 246 616Z"/>
    <path d="M451 616 Q456 605 460 615 Q465 604 468 617Z"/>
  </g>

  <path d="M183 620 Q350 638 517 620 L495 681 Q350 697 205 681Z"
        fill="url(#ceramic)" stroke="#173642" stroke-width="3"/>
  <path d="M197 634 Q350 649 503 634" fill="none" stroke="#78919a" stroke-width="2" opacity=".55"/>
  <path d="M207 650 Q230 663 253 650 Q276 637 299 650 Q322 663 345 650 Q368 637 391 650 Q414 663 437 650 Q460 637 483 650"
        fill="none" stroke="#b1795c" stroke-width="2.5" opacity=".88"/>
  <path d="M211 661 Q234 674 257 661 Q280 648 303 661 Q326 674 349 661 Q372 648 395 661 Q418 674 441 661 Q464 648 487 661"
        fill="none" stroke="#7b9a9b" stroke-width="2" opacity=".7"/>
  <path d="M203 680 Q350 694 497 680 L490 697 Q350 700 210 697Z"
        fill="#183744" stroke="#122f3a" stroke-width="2"/>
  <path d="M190 615 Q350 635 510 615 L522 622 Q350 644 178 622Z"
        fill="url(#copper)" stroke="#8e5541" stroke-width="2"/>
  <path d="M190 616 Q350 633 510 616" fill="none" stroke="#f0bd84" stroke-width="2" opacity=".8"/>
  <ellipse cx="350" cy="615" rx="171" ry="15" fill="none" stroke="#edb681" stroke-width="1.5" opacity=".75"/>
</svg>
</body>
</html>
```

```json
{
  "title": "Tideglass Alder",
  "statement": "An imagined alder keeps its crooked branches balanced beneath small, flowering clouds. Its blue-green pot carries a quiet wave pattern, like a little tide held still."
}
```