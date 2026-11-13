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
    background: #082c38;
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .rays {
    animation: ray-drift 24s ease-in-out infinite alternate;
    transform-origin: center;
  }
  .water-shimmer {
    animation: shimmer 11s ease-in-out infinite alternate;
  }
  .weed {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: sway 5s ease-in-out infinite alternate;
  }
  .weed.slow { animation-duration: 7s; animation-delay: -2s; }
  .weed.fast { animation-duration: 4s; animation-delay: -1s; }
  .drifter {
    animation: drift 5.4s ease-in-out infinite;
  }
  .tail {
    transform-box: fill-box;
    transform-origin: 0% 50%;
    animation: tail-swish 1.8s ease-in-out infinite alternate;
  }
  .pectoral {
    transform-box: fill-box;
    transform-origin: 15% 50%;
    animation: fin-flutter 1.25s ease-in-out infinite alternate;
  }
  .lantern {
    transform-box: fill-box;
    transform-origin: 15% 100%;
    animation: lantern-sway 3.4s ease-in-out infinite alternate;
  }
  .lantern-glow {
    animation: glow 2.8s ease-in-out infinite alternate;
  }
  .blink {
    transform-box: fill-box;
    transform-origin: 50% 50%;
    animation: blink 6.2s infinite;
  }
  .bubble {
    animation: rise 7s linear infinite;
  }
  .bubble.b2 { animation-duration: 9s; animation-delay: -4s; }
  .bubble.b3 { animation-duration: 8s; animation-delay: -6s; }
  .speck {
    animation: twinkle 3s ease-in-out infinite alternate;
  }
  .speck.s2 { animation-delay: -1.2s; }
  .speck.s3 { animation-delay: -2.1s; }

  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(0, -11px); }
  }
  @keyframes tail-swish {
    from { transform: rotate(-7deg); }
    to { transform: rotate(8deg); }
  }
  @keyframes fin-flutter {
    from { transform: rotate(-8deg) scaleX(.96); }
    to { transform: rotate(9deg) scaleX(1.04); }
  }
  @keyframes lantern-sway {
    from { transform: rotate(-5deg); }
    to { transform: rotate(6deg); }
  }
  @keyframes glow {
    from { opacity: .55; }
    to { opacity: 1; }
  }
  @keyframes blink {
    0%, 43%, 47%, 100% { transform: scaleY(1); }
    45% { transform: scaleY(.08); }
  }
  @keyframes sway {
    from { transform: rotate(-4deg); }
    to { transform: rotate(5deg); }
  }
  @keyframes rise {
    0% { transform: translateY(35px); opacity: 0; }
    12% { opacity: .7; }
    85% { opacity: .55; }
    100% { transform: translateY(-95px); opacity: 0; }
  }
  @keyframes ray-drift {
    from { transform: translateX(-12px); opacity: .65; }
    to { transform: translateX(16px); opacity: 1; }
  }
  @keyframes shimmer {
    from { transform: translateX(-12px); opacity: .3; }
    to { transform: translateX(12px); opacity: .62; }
  }
  @keyframes twinkle {
    from { opacity: .25; }
    to { opacity: .9; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 1000 750" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-label="A glowing fish drifting through a quiet underwater garden">
  <defs>
    <linearGradient id="water" x2="0" y2="1">
      <stop stop-color="#153f51"/>
      <stop offset=".42" stop-color="#0b5261"/>
      <stop offset="1" stop-color="#062f3d"/>
    </linearGradient>
    <radialGradient id="waterGlow" cx=".51" cy=".4" r=".68">
      <stop stop-color="#69b7aa" stop-opacity=".28"/>
      <stop offset=".55" stop-color="#2e8b8e" stop-opacity=".08"/>
      <stop offset="1" stop-color="#062c3b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sand" x2="0" y2="1">
      <stop stop-color="#b5a978"/>
      <stop offset=".3" stop-color="#667968"/>
      <stop offset="1" stop-color="#254b50"/>
    </linearGradient>
    <linearGradient id="fin" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#b9ffe0" stop-opacity=".78"/>
      <stop offset=".48" stop-color="#8ce4dc" stop-opacity=".47"/>
      <stop offset="1" stop-color="#cb9fe9" stop-opacity=".58"/>
    </linearGradient>
    <linearGradient id="finEdge" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#edfff0" stop-opacity=".9"/>
      <stop offset="1" stop-color="#a7d8e7" stop-opacity=".55"/>
    </linearGradient>
    <linearGradient id="body" x1=".08" y1=".08" x2=".9" y2=".92">
      <stop stop-color="#ffe2bd"/>
      <stop offset=".4" stop-color="#f5a995"/>
      <stop offset=".76" stop-color="#d781a0"/>
      <stop offset="1" stop-color="#8d83b9"/>
    </linearGradient>
    <linearGradient id="belly" x1="0" y1="0" x2=".15" y2="1">
      <stop stop-color="#ffe5c8" stop-opacity=".04"/>
      <stop offset="1" stop-color="#fff0d2" stop-opacity=".75"/>
    </linearGradient>
    <radialGradient id="lure">
      <stop stop-color="#fffde1"/>
      <stop offset=".32" stop-color="#f7e9a9"/>
      <stop offset=".72" stop-color="#e9bb8b"/>
      <stop offset="1" stop-color="#f4bba5" stop-opacity=".2"/>
    </radialGradient>
    <radialGradient id="orbGlow">
      <stop stop-color="#fff5ca" stop-opacity=".72"/>
      <stop offset=".45" stop-color="#ffdf9a" stop-opacity=".2"/>
      <stop offset="1" stop-color="#ffdf9a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#76c6a1"/>
      <stop offset="1" stop-color="#237d78"/>
    </linearGradient>
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>

  <!-- Open blue-green water -->
  <rect width="1000" height="750" fill="url(#water)"/>
  <rect width="1000" height="750" fill="url(#waterGlow)"/>
  <ellipse cx="510" cy="16" rx="510" ry="76" fill="#c4f0d1" opacity=".12"/>
  <path d="M0 74 Q150 47 300 71 T600 66 T1000 55 L1000 0 L0 0Z" fill="#b8e7d0" opacity=".08"/>

  <g class="rays" fill="#c1f5d8" opacity=".1">
    <path d="M120 0 L245 0 L440 560 L360 560Z"/>
    <path d="M325 0 L402 0 L565 470 L510 470Z" opacity=".7"/>
    <path d="M710 0 L790 0 L680 505 L620 505Z" opacity=".65"/>
    <path d="M890 0 L960 0 L785 470 L735 470Z" opacity=".5"/>
  </g>

  <!-- Distant, softly layered garden -->
  <path d="M0 533 Q125 490 240 534 T470 526 T720 528 T1000 512 L1000 750 L0 750Z"
        fill="#164c50" opacity=".62"/>
  <path d="M0 588 Q170 553 325 582 T650 575 T1000 565 L1000 750 L0 750Z"
        fill="#205557" opacity=".68"/>

  <g opacity=".7">
    <path d="M92 595 Q82 491 116 405 Q128 496 110 595Z" fill="#267c76"/>
    <path d="M111 594 Q138 506 178 457 Q160 533 128 602Z" fill="#378c79"/>
    <path d="M850 591 Q836 489 873 389 Q886 507 867 600Z" fill="#24726f"/>
    <path d="M877 600 Q901 510 951 461 Q928 547 894 607Z" fill="#348779"/>
    <path d="M730 586 Q721 515 745 463 Q761 528 747 590Z" fill="#236b6c"/>
  </g>

  <!-- Tall ribbon plants -->
  <g class="weed slow">
    <path d="M153 642 C126 540 155 445 120 329 C187 431 177 542 170 642Z" fill="url(#leaf)"/>
    <path d="M171 642 C202 538 188 456 224 369 C240 474 207 568 189 646Z" fill="#47977c"/>
    <path d="M134 635 C100 554 96 492 65 435 C119 479 145 548 151 641Z" fill="#327e76"/>
    <path d="M161 632 Q157 493 120 329" fill="none" stroke="#a0d6a3" stroke-opacity=".35" stroke-width="2"/>
  </g>
  <g class="weed fast">
    <path d="M818 642 C793 536 823 432 799 348 C861 438 847 551 839 642Z" fill="#398e7a"/>
    <path d="M850 642 C878 552 867 480 912 409 C923 504 891 577 869 645Z" fill="#5aa27f"/>
    <path d="M828 638 Q828 493 799 348" fill="none" stroke="#b2dba0" stroke-opacity=".32" stroke-width="2"/>
  </g>

  <!-- Small branching coral-like plants -->
  <g fill="none" stroke-linecap="round" opacity=".78">
    <path d="M270 626 Q277 581 261 549 M270 590 Q242 578 238 555 M268 576 Q292 558 296 534"
          stroke="#d48778" stroke-width="7"/>
    <path d="M690 620 Q681 574 700 538 M688 584 Q660 568 656 544 M691 573 Q719 558 724 531"
          stroke="#d89b83" stroke-width="7"/>
    <path d="M270 626 Q277 581 261 549 M270 590 Q242 578 238 555 M268 576 Q292 558 296 534"
          stroke="#f0b39a" stroke-opacity=".6" stroke-width="2"/>
    <path d="M690 620 Q681 574 700 538 M688 584 Q660 568 656 544 M691 573 Q719 558 724 531"
          stroke="#f3c3a0" stroke-opacity=".55" stroke-width="2"/>
  </g>

  <!-- Sunlit water ripples -->
  <g class="water-shimmer" fill="none" stroke="#b9efcf" stroke-linecap="round">
    <path d="M168 168 Q206 154 246 165 M699 135 Q751 121 798 137 M814 216 Q850 205 884 215"
          stroke-width="2" opacity=".28"/>
    <path d="M93 258 Q127 246 158 256 M756 290 Q800 276 843 289 M236 111 Q264 104 287 112"
          stroke-width="1.5" opacity=".22"/>
  </g>

  <!-- One gently rising trail of bubbles -->
  <g fill="none" stroke="#c6f4df" stroke-width="2">
    <circle class="bubble" cx="272" cy="390" r="5" opacity=".55"/>
    <circle class="bubble b2" cx="754" cy="435" r="4" opacity=".55"/>
    <circle class="bubble b3" cx="675" cy="295" r="3" opacity=".48"/>
    <circle cx="226" cy="321" r="2.5" opacity=".48"/>
    <circle cx="781" cy="358" r="2" opacity=".42"/>
  </g>

  <!-- A few suspended pinpricks of light -->
  <g fill="#d8f2c5">
    <circle class="speck" cx="244" cy="236" r="2.2"/>
    <circle class="speck s2" cx="708" cy="205" r="1.8"/>
    <circle class="speck s3" cx="609" cy="155" r="2"/>
    <circle class="speck s2" cx="336" cy="289" r="1.5"/>
    <circle class="speck" cx="792" cy="262" r="1.6"/>
  </g>

  <!-- The Puddlewing -->
  <g class="drifter">
    <g transform="translate(0 0)">
      <!-- Tail: translucent, petal-shaped fins -->
      <g class="tail">
        <path d="M554 389 C621 346 650 291 719 290 C711 340 667 386 577 405
                 C663 402 708 433 721 481 C656 478 612 446 552 420Z"
              fill="url(#fin)" stroke="url(#finEdge)" stroke-width="3"/>
        <path d="M570 400 Q638 359 714 297 M573 405 Q654 403 717 476"
              fill="none" stroke="#e5fff0" stroke-opacity=".62" stroke-width="2"/>
        <path d="M592 393 Q651 344 690 319 M596 412 Q659 420 693 455"
              fill="none" stroke="#def7ed" stroke-opacity=".4" stroke-width="1.5"/>
        <path d="M566 397 C625 388 664 389 711 389" fill="none" stroke="#e8fff4" stroke-opacity=".35" stroke-width="1.5"/>
      </g>

      <!-- Soft dorsal frill -->
      <path d="M385 329 Q404 289 425 304 Q442 274 464 303 Q485 275 506 312
               Q525 290 548 337 Q515 325 485 329 Q433 323 385 349Z"
            fill="url(#fin)" stroke="#e8fff0" stroke-opacity=".72" stroke-width="2"/>
      <path d="M408 323 Q421 305 428 317 M450 321 Q464 297 471 316 M493 324 Q512 306 521 330"
            fill="none" stroke="#e9fff1" stroke-opacity=".55" stroke-width="2"/>

      <!-- Lower fin -->
      <path d="M434 472 Q446 514 481 523 Q501 511 511 475 Q475 491 434 472Z"
            fill="url(#fin)" stroke="#e5fff0" stroke-opacity=".8" stroke-width="2"/>
      <path d="M450 481 Q461 505 481 516 M476 484 Q485 503 488 514"
            fill="none" stroke="#effff0" stroke-opacity=".55" stroke-width="1.5"/>

      <!-- Pectoral fin -->
      <g class="pectoral">
        <path d="M475 417 Q535 424 550 469 Q517 483 476 453Z"
              fill="url(#fin)" stroke="#effff0" stroke-opacity=".8" stroke-width="2"/>
        <path d="M483 426 Q514 446 542 464 M490 433 Q512 460 519 474"
              fill="none" stroke="#f4fff0" stroke-opacity=".48" stroke-width="1.5"/>
      </g>

      <!-- Round, pearly body -->
      <path d="M351 338
               C389 294 469 289 530 318
               C578 341 604 379 597 418
               C589 462 548 493 491 500
               C430 508 370 482 337 445
               C305 409 314 370 351 338Z"
            fill="url(#body)" stroke="#f9d5c7" stroke-opacity=".75" stroke-width="3"/>
      <path d="M337 415
               C386 439 441 448 502 435
               C540 427 569 409 595 387
               C600 431 566 473 512 491
               C449 511 379 480 344 446Z"
            fill="url(#belly)" opacity=".75"/>

      <!-- Soft freckles and pearlescent scales -->
      <g fill="#fff0d4" opacity=".62">
        <circle cx="425" cy="350" r="4"/>
        <circle cx="453" cy="336" r="3"/>
        <circle cx="479" cy="355" r="4"/>
        <circle cx="511" cy="344" r="3"/>
        <circle cx="532" cy="370" r="4"/>
        <circle cx="462" cy="382" r="3"/>
        <circle cx="495" cy="401" r="4"/>
        <circle cx="536" cy="424" r="3"/>
        <circle cx="458" cy="431" r="4"/>
        <circle cx="412" cy="407" r="3"/>
      </g>
      <g fill="#b776a0" opacity=".48">
        <circle cx="443" cy="365" r="2"/>
        <circle cx="520" cy="384" r="2.5"/>
        <circle cx="483" cy="460" r="2"/>
        <circle cx="393" cy="432" r="2.4"/>
      </g>

      <!-- Gills -->
      <path d="M399 387 Q416 401 404 428 M412 384 Q430 403 418 435 M425 383 Q440 405 431 435"
            fill="none" stroke="#a95f79" stroke-opacity=".65" stroke-width="3" stroke-linecap="round"/>

      <!-- Bright, curious eye -->
      <g class="blink">
        <ellipse cx="361" cy="370" rx="17" ry="21" fill="#fff5dc"/>
        <ellipse cx="365" cy="372" rx="10.5" ry="14" fill="#33495b"/>
        <ellipse cx="368" cy="373" rx="5" ry="8" fill="#132f41"/>
        <circle cx="368" cy="366" r="4" fill="#ffffff"/>
      </g>
      <path d="M340 402 Q328 410 318 406" fill="none" stroke="#88596c" stroke-width="3" stroke-linecap="round"/>
      <circle cx="334" cy="394" r="5" fill="#f7b2a2" opacity=".75"/>

      <!-- Fine, curved lantern stalk -->
      <g class="lantern">
        <path d="M385 325 C393 296 396 276 421 258"
              fill="none" stroke="#eac0a9" stroke-width="5" stroke-linecap="round"/>
        <path d="M386 324 C394 296 397 277 422 259"
              fill="none" stroke="#fff1d6" stroke-opacity=".65" stroke-width="1.5" stroke-linecap="round"/>
        <circle class="lantern-glow" cx="428" cy="252" r="34" fill="url(#orbGlow)"/>
        <path d="M428 237 C440 237 448 247 445 258 C443 269 433 275 423 269 C414 264 411 251 417 243 C420 239 424 237 428 237Z"
              fill="url(#lure)" stroke="#fff0cb" stroke-opacity=".85" stroke-width="2"/>
        <circle cx="424" cy="247" r="4" fill="#fffef1" opacity=".9"/>
      </g>
    </g>
  </g>

  <!-- Pebbly, softly lit floor -->
  <path d="M0 621 Q126 606 251 620 T500 617 T750 622 T1000 608 L1000 750 L0 750Z"
        fill="url(#sand)"/>
  <path d="M0 621 Q126 606 251 620 T500 617 T750 622 T1000 608"
        fill="none" stroke="#d1c795" stroke-opacity=".46" stroke-width="3"/>
  <g opacity=".82">
    <ellipse cx="72" cy="655" rx="47" ry="14" fill="#7d8975"/>
    <ellipse cx="178" cy="684" rx="31" ry="10" fill="#c2b68c"/>
    <ellipse cx="291" cy="652" rx="24" ry="8" fill="#8f9b7c"/>
    <ellipse cx="414" cy="694" rx="39" ry="12" fill="#637d72"/>
    <ellipse cx="575" cy="659" rx="28" ry="9" fill="#c1ad83"/>
    <ellipse cx="696" cy="690" rx="45" ry="13" fill="#778676"/>
    <ellipse cx="837" cy="655" rx="34" ry="11" fill="#b7ad85"/>
    <ellipse cx="949" cy="688" rx="49" ry="14" fill="#657a6f"/>
  </g>
  <g fill="#e8d9a7" opacity=".52">
    <circle cx="117" cy="636" r="2"/>
    <circle cx="340" cy="672" r="2.5"/>
    <circle cx="522" cy="640" r="2"/>
    <circle cx="771" cy="673" r="2"/>
    <circle cx="900" cy="633" r="2.5"/>
  </g>

  <!-- Foreground leaf tips -->
  <g class="weed slow" opacity=".82">
    <path d="M31 751 Q45 681 22 625 Q74 673 67 751Z" fill="#338c76"/>
    <path d="M73 751 Q92 682 134 647 Q115 714 98 751Z" fill="#4c9b7b"/>
  </g>
  <g class="weed fast" opacity=".8">
    <path d="M906 751 Q923 678 900 624 Q955 675 949 751Z" fill="#327d70"/>
    <path d="M948 751 Q968 681 999 658 L1000 751Z" fill="#4d9677"/>
  </g>
</svg>
</body>
</html>
```

```json
{
  "title": "Puddlewing Puffer",
  "statement": "This soft little drifter fans the water with opal fins and carries a lantern that glows brighter whenever it dreams. It spends its quiet days turning the garden into a slow dance of light."
}
```