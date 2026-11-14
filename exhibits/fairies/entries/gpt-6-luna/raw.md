```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #101829; }
  svg { display: block; width: 100%; height: 100%; }
  .fairy-float { animation: float 5.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .hair-flow { animation: hair 5.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 12% 20%; }
  .page-breathe { animation: page 4.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  .glimmer { animation: glimmer 3.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .drift-a { animation: driftA 8s ease-in-out infinite; }
  .drift-b { animation: driftB 10s ease-in-out infinite; }
  .wing-left { animation: flapL 1.8s ease-in-out infinite; }
  .wing-right { animation: flapR 1.8s ease-in-out infinite; }
  .wing-lower { animation: flapLow 2.2s ease-in-out infinite; }
  .ripple { animation: ripple 4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes float { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-9px) rotate(1deg); } }
  @keyframes hair { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(2deg); } }
  @keyframes page { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-1.2deg); } }
  @keyframes glimmer { 0%,100% { opacity: .45; transform: scale(.86); } 50% { opacity: 1; transform: scale(1.18); } }
  @keyframes driftA { 0%,100% { transform: translate(0,0); opacity: .35; } 50% { transform: translate(8px,-19px); opacity: 1; } }
  @keyframes driftB { 0%,100% { transform: translate(0,0); opacity: .8; } 50% { transform: translate(-9px,-24px); opacity: .35; } }
  @keyframes flapL { 0%,100% { transform: rotate(3deg) scaleX(1); } 50% { transform: rotate(-6deg) scaleX(.94); } }
  @keyframes flapR { 0%,100% { transform: rotate(-3deg) scaleX(1); } 50% { transform: rotate(6deg) scaleX(.94); } }
  @keyframes flapLow { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(5deg); } }
  @keyframes ripple { 0% { opacity: .65; transform: scale(.65); } 100% { opacity: 0; transform: scale(1.5); } }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 12s !important; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A winged fairy hovers beside an open book in a moonlit forest.">
  <defs>
    <linearGradient id="sky" x2="0" y2="1">
      <stop stop-color="#101b35"/>
      <stop offset=".48" stop-color="#23314a"/>
      <stop offset="1" stop-color="#182b32"/>
    </linearGradient>
    <radialGradient id="moonGlow">
      <stop stop-color="#fff6d3" stop-opacity=".78"/>
      <stop offset=".35" stop-color="#c8e6d7" stop-opacity=".22"/>
      <stop offset="1" stop-color="#b9dfd0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fairyGlow">
      <stop stop-color="#fff4bb" stop-opacity=".7"/>
      <stop offset="1" stop-color="#fff0b0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#c6fff0" stop-opacity=".78"/>
      <stop offset=".48" stop-color="#7de3d7" stop-opacity=".35"/>
      <stop offset="1" stop-color="#e7dbad" stop-opacity=".48"/>
    </linearGradient>
    <linearGradient id="skin" x2=".9" y2="1">
      <stop stop-color="#ffe7bd"/>
      <stop offset="1" stop-color="#dba978"/>
    </linearGradient>
    <linearGradient id="dress" x2=".8" y2="1">
      <stop stop-color="#b6d6ab"/>
      <stop offset=".5" stop-color="#678f79"/>
      <stop offset="1" stop-color="#314d50"/>
    </linearGradient>
    <linearGradient id="hair" x2=".8" y2="1">
      <stop stop-color="#806044"/>
      <stop offset=".48" stop-color="#493846"/>
      <stop offset="1" stop-color="#283345"/>
    </linearGradient>
    <linearGradient id="pageInk" x2="0" y2="1">
      <stop stop-color="#f4e7bd"/>
      <stop offset="1" stop-color="#c6b98e"/>
    </linearGradient>
    <linearGradient id="wood" x2="0" y2="1">
      <stop stop-color="#76634d"/>
      <stop offset=".45" stop-color="#4c493d"/>
      <stop offset="1" stop-color="#292f30"/>
    </linearGradient>
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="smallGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
      <feGaussianBlur stdDeviation="11"/>
    </filter>
  </defs>

  <!-- Deep, quiet woodland -->
  <rect width="600" height="900" fill="url(#sky)"/>
  <circle cx="170" cy="173" r="160" fill="url(#moonGlow)"/>
  <circle cx="170" cy="173" r="49" fill="#f2edcf" opacity=".9"/>
  <circle cx="190" cy="153" r="47" fill="#25344a"/>
  <path d="M115 186 Q144 163 165 178 Q181 190 199 178" fill="none" stroke="#e5dfc1" stroke-opacity=".38" stroke-width="2"/>

  <g fill="#e9edcf">
    <circle cx="74" cy="113" r="1.5"/><circle cx="264" cy="90" r="1.2"/>
    <circle cx="345" cy="147" r="1.3"/><circle cx="470" cy="108" r="1.7"/>
    <circle cx="530" cy="211" r="1.2"/><circle cx="93" cy="292" r="1.1"/>
    <circle cx="286" cy="237" r="1.6"/><circle cx="502" cy="323" r="1.1"/>
    <circle cx="425" cy="185" r="1.1"/><circle cx="54" cy="220" r="1.5"/>
  </g>
  <g fill="none" stroke="#c6d8c5" stroke-opacity=".35" stroke-width="1.5">
    <path d="M0 226 Q70 171 133 207 Q169 229 202 212"/>
    <path d="M600 187 Q548 157 510 188 Q487 209 454 200"/>
    <path d="M0 341 Q45 303 88 322"/><path d="M600 294 Q557 262 523 286"/>
  </g>

  <!-- Distant trunks and canopy -->
  <path d="M0 0 H65 Q47 116 79 238 Q56 332 71 505 L0 565Z" fill="#141f31"/>
  <path d="M535 0 H600 V574 Q548 521 554 412 Q572 291 530 193Z" fill="#14202f"/>
  <path d="M0 403 Q91 337 154 388 Q207 424 250 385 L248 500 Q153 476 0 545Z" fill="#1a2936"/>
  <path d="M600 375 Q525 330 470 380 Q423 421 385 386 L380 494 Q488 478 600 541Z" fill="#182832"/>
  <path d="M45 0 Q105 76 91 154 M553 0 Q496 71 513 130" fill="none" stroke="#35413d" stroke-width="13" opacity=".56"/>
  <g fill="#263c3a" opacity=".8">
    <ellipse cx="46" cy="474" rx="91" ry="82"/><ellipse cx="124" cy="502" rx="93" ry="62"/>
    <ellipse cx="565" cy="470" rx="89" ry="88"/><ellipse cx="494" cy="512" rx="106" ry="63"/>
  </g>

  <!-- A pool of shadow and the green floor -->
  <path d="M0 652 Q91 609 169 639 Q263 675 351 632 Q462 582 600 641 V900 H0Z" fill="#172a30"/>
  <path d="M0 740 Q123 684 228 729 Q338 772 452 711 Q534 668 600 704 V900 H0Z" fill="#1d3533"/>
  <ellipse cx="302" cy="757" rx="177" ry="29" fill="#0d1b25" opacity=".58" filter="url(#shadow)"/>

  <!-- Low ferns -->
  <g fill="none" stroke="#54705a" stroke-width="3" stroke-linecap="round" opacity=".72">
    <path d="M32 788 Q68 721 113 700 M52 760 Q37 737 24 731 M64 744 Q48 715 46 703 M76 728 Q74 701 82 688 M89 715 Q100 692 114 685"/>
    <path d="M554 803 Q521 730 477 707 M535 773 Q552 744 570 739 M519 748 Q528 718 526 704 M505 732 Q492 708 479 701 M490 719 Q469 698 454 695"/>
  </g>
  <g fill="#79926a" opacity=".7">
    <ellipse cx="25" cy="731" rx="13" ry="5" transform="rotate(28 25 731)"/>
    <ellipse cx="46" cy="703" rx="14" ry="5" transform="rotate(74 46 703)"/>
    <ellipse cx="82" cy="688" rx="13" ry="5" transform="rotate(-26 82 688)"/>
    <ellipse cx="570" cy="739" rx="14" ry="5" transform="rotate(-24 570 739)"/>
    <ellipse cx="526" cy="704" rx="14" ry="5" transform="rotate(82 526 704)"/>
    <ellipse cx="454" cy="695" rx="13" ry="5" transform="rotate(29 454 695)"/>
  </g>

  <!-- A weathered stump: the book rests here, the fairy hovers near it -->
  <path d="M212 675 Q229 650 251 655 Q276 640 301 653 Q326 643 348 659 Q374 650 397 670
           L381 761 Q339 779 301 766 Q260 780 224 758Z" fill="url(#wood)"/>
  <path d="M212 674 Q247 653 275 662 Q307 647 335 660 Q365 651 397 670 Q377 694 346 690
           Q316 704 286 689 Q252 702 224 688Z" fill="#9a8662"/>
  <path d="M223 675 Q254 663 279 671 Q309 658 335 670 Q362 661 385 673 Q362 685 341 680
           Q312 694 285 680 Q251 693 223 675Z" fill="#c1aa7c" opacity=".75"/>
  <path d="M248 688 Q241 725 251 753 M357 689 Q350 724 363 749 M301 700 Q292 733 302 763"
        fill="none" stroke="#302f2c" stroke-width="3" opacity=".48"/>
  <g fill="#607453">
    <path d="M214 671 Q224 651 239 659 Q239 673 214 671Z"/>
    <path d="M363 660 Q378 646 388 665 Q382 675 363 660Z"/>
  </g>

  <!-- Open, blank-paged book -->
  <g class="page-breathe">
    <path d="M194 624 Q247 602 300 624 Q353 601 407 621 L399 675 Q349 659 301 681 Q250 658 201 677Z"
          fill="#282d31" opacity=".7"/>
    <path d="M202 617 Q250 593 301 617 L301 667 Q251 645 206 665Z" fill="url(#pageInk)"/>
    <path d="M301 617 Q352 593 402 615 L396 664 Q350 645 301 667Z" fill="#dfd2a9"/>
    <path d="M301 618 L301 667" stroke="#8e8064" stroke-width="2"/>
    <path d="M209 620 Q254 600 294 619 M207 628 Q252 609 294 627 M208 637 Q251 619 294 636"
          fill="none" stroke="#a99a74" stroke-width="1.2" opacity=".55"/>
    <path d="M307 619 Q348 600 395 619 M307 628 Q351 609 397 627 M307 637 Q350 619 396 636"
          fill="none" stroke="#a99a74" stroke-width="1.2" opacity=".5"/>
    <path d="M212 617 Q250 596 301 617 Q354 595 399 615" fill="none" stroke="#fff0ca" stroke-width="2" opacity=".7"/>
    <path d="M221 646 Q247 637 273 646 M330 646 Q357 637 382 646" fill="none" stroke="#b8a77b" stroke-width="1" opacity=".45"/>
  </g>
  <ellipse cx="302" cy="616" rx="125" ry="35" fill="#f3dca0" opacity=".24" filter="url(#softGlow)"/>

  <!-- The fairy's lantern-like hush -->
  <circle cx="354" cy="418" r="102" fill="url(#fairyGlow)"/>
  <g class="fairy-float">
    <!-- upper wings -->
    <g transform="translate(365 405)">
      <g class="wing-left">
        <path d="M0 0 C-12 -47 -52 -105 -104 -111 C-121 -66 -91 -19 -10 10Z"
              fill="url(#wing)" stroke="#c6eee0" stroke-opacity=".8" stroke-width="1.7"/>
        <path d="M-2 0 Q-43 -52 -104 -111 M-8 3 Q-71 -38 -104 -111 M-18 -4 Q-45 -71 -104 -111"
              fill="none" stroke="#d9f1d8" stroke-opacity=".55" stroke-width="1"/>
        <animateTransform attributeName="transform" type="rotate" values="0; -5; 0; 4; 0" dur="1.8s" repeatCount="indefinite"/>
      </g>
      <g class="wing-right">
        <path d="M0 0 C15 -48 55 -103 103 -108 C117 -63 88 -18 10 10Z"
              fill="url(#wing)" stroke="#c6eee0" stroke-opacity=".8" stroke-width="1.7"/>
        <path d="M2 0 Q44 -52 103 -108 M8 3 Q73 -35 103 -108 M18 -4 Q47 -70 103 -108"
              fill="none" stroke="#d9f1d8" stroke-opacity=".55" stroke-width="1"/>
        <animateTransform attributeName="transform" type="rotate" values="0; 5; 0; -4; 0" dur="1.8s" repeatCount="indefinite"/>
      </g>
      <!-- lower wings -->
      <g class="wing-lower" opacity=".85">
        <path d="M0 2 C-34 3 -76 31 -82 74 C-48 87 -16 53 5 13Z"
              fill="url(#wing)" stroke="#c6eee0" stroke-opacity=".75" stroke-width="1.5"/>
        <path d="M0 4 Q-48 38 -82 74 M0 7 Q-27 55 -82 74" fill="none" stroke="#d9f1d8" stroke-opacity=".5"/>
        <path d="M3 2 C35 2 76 30 83 71 C49 87 17 52 -5 13Z"
              fill="url(#wing)" stroke="#c6eee0" stroke-opacity=".75" stroke-width="1.5"/>
        <path d="M3 4 Q49 37 83 71 M3 7 Q28 55 83 71" fill="none" stroke="#d9f1d8" stroke-opacity=".5"/>
      </g>
    </g>

    <!-- fine legs and feet -->
    <path d="M356 464 Q349 489 336 503 Q333 508 340 509 Q355 504 363 483"
          fill="none" stroke="#e6bd8d" stroke-width="4" stroke-linecap="round"/>
    <path d="M370 462 Q372 489 385 501 Q391 507 385 510 Q371 507 362 485"
          fill="none" stroke="#e6bd8d" stroke-width="4" stroke-linecap="round"/>
    <path d="M337 508 Q329 509 326 514 M385 509 Q392 510 396 514"
          fill="none" stroke="#e6bd8d" stroke-width="2.4" stroke-linecap="round"/>

    <!-- arms, one reaching toward the rising light -->
    <path d="M351 411 Q332 424 324 445 Q319 455 313 466"
          fill="none" stroke="url(#skin)" stroke-width="7" stroke-linecap="round"/>
    <path d="M375 411 Q391 423 396 439 Q398 447 405 451"
          fill="none" stroke="url(#skin)" stroke-width="7" stroke-linecap="round"/>
    <path d="M313 466 Q309 470 307 475 M405 451 Q410 453 413 457"
          fill="none" stroke="#f0c895" stroke-width="2.5" stroke-linecap="round"/>

    <!-- leaf-draped body -->
    <path d="M350 399 Q363 390 377 400 Q387 417 380 444 Q375 462 366 472
             Q356 461 347 446 Q341 419 350 399Z" fill="url(#dress)"/>
    <path d="M350 402 Q336 408 339 423 Q349 426 356 416Z" fill="#aac89b"/>
    <path d="M377 403 Q392 409 389 424 Q379 427 371 416Z" fill="#a5c59a"/>
    <path d="M348 438 Q362 446 381 438 Q378 455 366 470 Q354 458 348 438Z" fill="#6d9b7b"/>
    <path d="M365 401 Q360 426 366 462" fill="none" stroke="#d0d7a8" stroke-opacity=".62" stroke-width="1.5"/>
    <path d="M351 431 Q359 438 365 440 M379 428 Q372 437 366 440" fill="none" stroke="#d0d7a8" stroke-opacity=".5" stroke-width="1.3"/>

    <!-- face and slow-turning head -->
    <g class="head-turn">
      <path d="M345 360 Q344 337 362 332 Q383 334 387 354 Q388 370 373 381
               Q359 386 348 374Z" fill="url(#skin)"/>
      <path d="M345 357 Q337 345 344 334 Q348 317 370 319 Q389 320 393 338
               Q398 356 386 368 Q383 350 371 346 Q359 356 345 357Z" fill="url(#hair)"/>
      <path d="M388 344 Q402 373 390 401 Q386 414 376 420 Q389 391 377 370Z" fill="#3b3944"/>
      <path d="M347 353 Q340 372 352 385 Q345 407 331 414 Q344 387 336 373Z" fill="#55404a"/>
      <path d="M345 361 Q338 366 343 371 Q347 373 350 369" fill="none" stroke="#d19a73" stroke-width="2"/>
      <path d="M349 365 Q353 363 357 365" fill="none" stroke="#6b4b43" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="354" cy="365" r="1.5" fill="#27333b"/>
      <path d="M349 378 Q357 382 364 379" fill="none" stroke="#b87868" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M349 338 Q361 325 380 332" fill="none" stroke="#c9a16b" stroke-width="2" opacity=".7"/>
      <circle cx="376" cy="337" r="2.2" fill="#ecd79a"/>
      <animateTransform attributeName="transform" type="rotate" values="0 365 360; 2 365 360; 0 365 360; -1.5 365 360; 0 365 360" dur="7s" repeatCount="indefinite"/>
    </g>
  </g>

  <!-- A small, wordless spark between fairy and page -->
  <g class="glimmer">
    <circle cx="307" cy="490" r="17" fill="#f9e9af" opacity=".34" filter="url(#smallGlow)"/>
    <path d="M307 479 Q309 488 318 491 Q309 493 307 502 Q305 493 296 491 Q305 488 307 479Z" fill="#fff1bd"/>
    <circle cx="307" cy="491" r="2.2" fill="#fffdf0"/>
  </g>

  <!-- Drifting punctuation-like motes, without symbols or letters -->
  <g fill="#f3e9be">
    <circle class="drift-a" cx="271" cy="522" r="2.4"/>
    <circle class="drift-b" cx="333" cy="550" r="1.8"/>
    <circle class="drift-a" cx="423" cy="487" r="2"/>
    <circle class="drift-b" cx="245" cy="573" r="1.5"/>
    <circle class="drift-a" cx="391" cy="562" r="1.4"/>
    <circle class="drift-b" cx="286" cy="587" r="2.1"/>
    <circle class="drift-a" cx="443" cy="536" r="1.6"/>
    <circle class="drift-b" cx="354" cy="583" r="1.2"/>
  </g>
  <circle class="ripple" cx="307" cy="616" r="30" fill="none" stroke="#f5e7b3" stroke-width="1.2" opacity=".45"/>

  <!-- Foreground blooms -->
  <g fill="#d4b878" opacity=".85">
    <circle cx="160" cy="747" r="4"/><circle cx="155" cy="740" r="3"/><circle cx="165" cy="740" r="3"/>
    <circle cx="160" cy="735" r="3"/><circle cx="170" cy="746" r="3"/>
    <circle cx="450" cy="748" r="4"/><circle cx="444" cy="741" r="3"/><circle cx="455" cy="739" r="3"/>
    <circle cx="460" cy="746" r="3"/><circle cx="450" cy="735" r="3"/>
  </g>
  <g fill="none" stroke="#70835d" stroke-width="2">
    <path d="M160 747 Q157 769 147 783 M450 748 Q453 768 465 785"/>
  </g>
  <g fill="#536e53">
    <ellipse cx="149" cy="772" rx="11" ry="4" transform="rotate(-27 149 772)"/>
    <ellipse cx="462" cy="772" rx="11" ry="4" transform="rotate(25 462 772)"/>
  </g>
</svg>
</body>
</html>
```

```json
{
  "title": "The Fairy of Unwritten Stories",
  "statement": "A beginning waits; listen for the page that breathes."
}
```