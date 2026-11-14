```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>First Light</title>
<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #101326;
  }
  body {
    display: grid;
    place-items: center;
  }
  .artwork {
    width: min(100vw, 600px, calc(100vh * 2 / 3));
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 0 0 16px 16px;
    background: #171b35;
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .star {
    transform-box: fill-box;
    transform-origin: center;
    animation: twinkle 4s ease-in-out infinite;
  }
  .vein {
    fill: none;
    stroke: #fff4e1;
    stroke-width: 1.2;
    stroke-linecap: round;
    opacity: .44;
  }
  .fine {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .thread {
    stroke-dasharray: 3 11;
    animation: flowing 8s linear infinite;
  }
  .breath {
    animation: breathe 5s ease-in-out infinite;
  }
  .flower {
    transform-box: fill-box;
    transform-origin: center bottom;
    animation: sway 6s ease-in-out infinite;
  }
  @keyframes twinkle {
    0%, 100% { opacity: .2; transform: scale(.7); }
    50% { opacity: .95; transform: scale(1.25); }
  }
  @keyframes flowing {
    to { stroke-dashoffset: -112; }
  }
  @keyframes breathe {
    0%, 100% { opacity: .42; }
    50% { opacity: .82; }
  }
  @keyframes sway {
    0%, 100% { transform: rotate(-2deg); }
    50% { transform: rotate(3deg); }
  }
</style>
</head>
<body>
<main class="artwork" aria-label="A luminous fairy greeting a small floating sun at dawn">
<svg viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" role="img">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#10162f"/>
      <stop offset=".32" stop-color="#343456"/>
      <stop offset=".64" stop-color="#9b667d"/>
      <stop offset="1" stop-color="#efb58d"/>
    </linearGradient>
    <radialGradient id="horizonGlow">
      <stop offset="0" stop-color="#ffe7b0" stop-opacity=".82"/>
      <stop offset=".45" stop-color="#f7b4a0" stop-opacity=".26"/>
      <stop offset="1" stop-color="#e9a4b4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sunCore" cx=".38" cy=".32">
      <stop offset="0" stop-color="#fffdf0"/>
      <stop offset=".35" stop-color="#fff1b7"/>
      <stop offset=".75" stop-color="#ffc878"/>
      <stop offset="1" stop-color="#ef8b70"/>
    </radialGradient>
    <radialGradient id="sunHalo">
      <stop offset="0" stop-color="#fff7c9" stop-opacity=".72"/>
      <stop offset=".35" stop-color="#ffd894" stop-opacity=".3"/>
      <stop offset="1" stop-color="#ffd1a0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wingA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d9f5ef" stop-opacity=".14"/>
      <stop offset=".38" stop-color="#c7e5ef" stop-opacity=".62"/>
      <stop offset=".72" stop-color="#e8c7e5" stop-opacity=".42"/>
      <stop offset="1" stop-color="#ffdfba" stop-opacity=".1"/>
    </linearGradient>
    <linearGradient id="wingB" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff4cc" stop-opacity=".62"/>
      <stop offset=".5" stop-color="#c7e9e5" stop-opacity=".36"/>
      <stop offset="1" stop-color="#cbb9e5" stop-opacity=".08"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff4dc"/>
      <stop offset=".55" stop-color="#f6cfb9"/>
      <stop offset="1" stop-color="#c8878f"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff0c4"/>
      <stop offset=".35" stop-color="#e7ad9f"/>
      <stop offset=".7" stop-color="#a46782"/>
      <stop offset="1" stop-color="#5b416d"/>
    </linearGradient>
    <linearGradient id="dress" x1="0" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="#f4f3d9"/>
      <stop offset=".32" stop-color="#b7d9ca"/>
      <stop offset=".7" stop-color="#669b9c"/>
      <stop offset="1" stop-color="#394d76"/>
    </linearGradient>
    <linearGradient id="dressLight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff8dd" stop-opacity=".8"/>
      <stop offset="1" stop-color="#9bd2c6" stop-opacity=".05"/>
    </linearGradient>
    <linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4c506c"/>
      <stop offset="1" stop-color="#252c48"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#29324b"/>
      <stop offset="1" stop-color="#101a2c"/>
    </linearGradient>
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <filter id="smallGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <path id="spark" d="M0-5 L1.3-1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3-1.3 Z"/>
    <path id="petalRay" d="M430 226 C426 214 428 202 430 190 C434 203 435 215 430 226 Z"/>
  </defs>

  <rect width="600" height="900" fill="url(#sky)"/>
  <ellipse cx="435" cy="585" rx="330" ry="290" fill="url(#horizonGlow)"/>
  <ellipse cx="80" cy="190" rx="240" ry="280" fill="#344a72" opacity=".12"/>

  <g id="stars" fill="#fff6dd"></g>

  <g opacity=".72">
    <circle cx="105" cy="129" r="35" fill="#e8e5d5"/>
    <circle cx="119" cy="116" r="35" fill="#171d38"/>
    <circle cx="81" cy="154" r="2" fill="#fff3d1"/>
  </g>

  <g id="cloudsBack" fill="none" stroke="#d7c9dd" stroke-linecap="round">
    <path d="M-65 245 C38 210 110 253 199 232 S365 193 471 224 S620 211 680 185" stroke-width="18" opacity=".045"/>
    <path d="M-50 264 C60 238 115 277 211 251 S373 224 472 245 S610 230 667 217" stroke-width="3" opacity=".12"/>
    <path d="M-20 394 C90 367 154 398 241 382 S404 342 630 385" stroke-width="12" opacity=".04"/>
  </g>

  <g opacity=".2" fill="none" stroke="#f4d6cb">
    <path d="M64 522 Q300 425 536 522" stroke-width=".7"/>
    <path d="M25 552 Q300 442 575 552" stroke-width=".5"/>
  </g>

  <g id="dawn">
    <circle cx="430" cy="285" r="121" fill="url(#sunHalo)" class="breath"/>
    <circle cx="430" cy="285" r="59" fill="#ffd695" opacity=".18" filter="url(#softGlow)"/>
    <g id="rays" fill="#ffe9b0" opacity=".58">
      <use href="#petalRay"/>
      <use href="#petalRay" transform="rotate(30 430 285)"/>
      <use href="#petalRay" transform="rotate(60 430 285)"/>
      <use href="#petalRay" transform="rotate(90 430 285)"/>
      <use href="#petalRay" transform="rotate(120 430 285)"/>
      <use href="#petalRay" transform="rotate(150 430 285)"/>
      <use href="#petalRay" transform="rotate(180 430 285)"/>
      <use href="#petalRay" transform="rotate(210 430 285)"/>
      <use href="#petalRay" transform="rotate(240 430 285)"/>
      <use href="#petalRay" transform="rotate(270 430 285)"/>
      <use href="#petalRay" transform="rotate(300 430 285)"/>
      <use href="#petalRay" transform="rotate(330 430 285)"/>
    </g>
    <circle cx="430" cy="285" r="49" fill="none" stroke="#ffe9b4" stroke-width=".8" opacity=".6"/>
    <g id="orb">
      <circle cx="430" cy="285" r="35" fill="url(#sunCore)"/>
      <ellipse cx="419" cy="273" rx="12" ry="9" fill="#fffef0" opacity=".62"/>
      <path d="M404 297 Q430 309 456 295" fill="none" stroke="#fff1bb" stroke-width="1.1" opacity=".65"/>
    </g>
    <g fill="#fff5ca">
      <use href="#spark" transform="translate(489 256) scale(.65)" class="star"/>
      <use href="#spark" transform="translate(377 250) scale(.42)" class="star" style="animation-delay:-1.4s"/>
      <circle cx="468" cy="340" r="2.3" class="star" style="animation-delay:-2.2s"/>
    </g>
  </g>

  <path d="M0 664 L77 593 L120 620 L191 548 L253 616 L320 564 L380 622 L454 560 L524 619 L600 576 L600 900 L0 900 Z" fill="#626078" opacity=".38"/>
  <path d="M0 698 L80 637 L141 674 L226 606 L295 668 L365 617 L438 677 L514 621 L600 667 L600 900 L0 900 Z" fill="url(#mountain)"/>
  <path d="M0 731 C101 697 146 724 224 702 S390 695 600 720 L600 900 L0 900 Z" fill="url(#ground)"/>

  <g id="fairy">
    <g id="leftWing">
      <path d="M244 398 C190 335 161 243 91 221 C59 211 66 269 77 310 C94 377 146 431 237 425 Z" fill="url(#wingA)" stroke="#e7e5dc" stroke-width="1.2" stroke-opacity=".52"/>
      <path d="M239 410 C166 409 112 454 119 504 C124 539 162 532 190 510 C219 487 236 452 250 418 Z" fill="url(#wingB)" stroke="#e5e8df" stroke-width="1" stroke-opacity=".45"/>
      <path class="vein" d="M241 409 Q160 336 91 232 M225 403 Q154 381 86 307 M205 369 Q174 297 137 264 M170 342 Q135 336 99 325"/>
      <path class="vein" d="M240 417 Q167 457 129 500 M208 435 Q180 480 175 516"/>
      <path d="M91 221 C115 267 119 325 102 348" class="fine" stroke="#fff8dc" stroke-width="2" opacity=".25"/>
      <g fill="#f7f0d7" opacity=".58">
        <circle cx="105" cy="255" r="3"/><circle cx="121" cy="291" r="2.3"/>
        <circle cx="145" cy="328" r="2.6"/><circle cx="157" cy="475" r="2.5"/>
      </g>
    </g>

    <g id="rightWing">
      <path d="M263 400 C292 324 313 235 374 199 C403 182 405 236 397 278 C384 349 340 404 270 425 Z" fill="url(#wingA)" stroke="#f1e8db" stroke-width="1.2" stroke-opacity=".55"/>
      <path d="M267 412 C334 402 375 439 366 482 C359 514 329 503 307 481 C285 459 275 438 267 412 Z" fill="url(#wingB)" stroke="#e9e8dc" stroke-width="1" stroke-opacity=".45"/>
      <path class="vein" d="M269 410 Q328 310 378 207 M279 402 Q340 365 394 279 M302 358 Q322 288 350 246 M334 316 Q363 307 392 300"/>
      <path class="vein" d="M271 417 Q326 447 359 479 M297 424 Q318 462 326 492"/>
      <g fill="#fff5d8" opacity=".55">
        <circle cx="374" cy="230" r="2.8"/><circle cx="363" cy="268" r="2.2"/>
        <circle cx="346" cy="307" r="2.5"/><circle cx="341" cy="463" r="2"/>
      </g>
    </g>

    <g id="hairBack">
      <path d="M237 282 C196 267 175 296 184 338 C191 372 162 392 135 422 C105 456 140 477 167 458 C195 439 177 415 205 394 C230 375 248 343 256 310 Z" fill="url(#hair)"/>
      <path id="hairRibbon" d="M213 322 C160 357 190 408 135 451 C111 470 94 451 111 439" fill="none" stroke="#e3a29d" stroke-width="8" stroke-linecap="round" opacity=".52"/>
      <path d="M222 302 C182 335 218 385 166 420" fill="none" stroke="#ffe0ba" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>
      <path d="M204 349 C178 391 202 431 160 462" fill="none" stroke="#734e75" stroke-width="3" opacity=".55"/>
    </g>

    <path d="M235 414 C215 452 196 500 178 549 C164 586 142 624 156 646 C169 665 184 639 188 616 C198 560 231 522 249 473 Z" fill="url(#skin)"/>
    <path d="M258 424 C265 473 277 509 306 537 C329 560 325 588 309 604 C298 614 298 592 302 579 C307 558 281 557 262 544 C225 518 217 470 224 439 Z" fill="url(#skin)"/>
    <path d="M151 644 C148 654 156 667 169 664 C181 661 187 649 184 641 C174 648 164 649 151 644 Z" fill="#e9b7aa"/>
    <path d="M307 601 C300 612 286 615 281 607 C278 601 291 595 301 584 Z" fill="#e9b7aa"/>

    <path d="M229 363 C216 391 217 423 224 448 C229 470 216 505 201 539 C231 529 247 514 258 488 C266 512 282 528 307 537 C292 499 285 466 282 432 C280 397 274 372 261 360 Z" fill="url(#dress)"/>
    <path d="M236 366 C225 408 243 446 225 497 C245 481 258 456 260 423 C263 400 256 380 251 365 Z" fill="url(#dressLight)"/>
    <path d="M224 449 C241 457 265 456 282 443" fill="none" stroke="#d9e4c9" stroke-width="2" opacity=".7"/>
    <path d="M212 521 Q230 507 244 480 M261 484 Q276 514 293 525" fill="none" stroke="#c2ded0" stroke-width="1.2" opacity=".45"/>
    <g fill="#dff1d5" opacity=".7">
      <ellipse cx="221" cy="500" rx="3" ry="8" transform="rotate(35 221 500)"/>
      <ellipse cx="281" cy="497" rx="3" ry="8" transform="rotate(-28 281 497)"/>
      <circle cx="251" cy="470" r="2.2"/>
    </g>

    <path d="M235 373 C213 379 198 398 179 407 C166 413 157 407 151 398 C149 415 163 427 181 422 C204 416 222 402 237 391 Z" fill="url(#skin)"/>
    <path d="M152 398 C143 390 137 390 134 394 C139 399 143 404 151 407" fill="#f1c6b2"/>
    <path d="M260 372 C281 371 298 354 314 343 C326 334 337 334 348 337 L346 347 C330 347 322 353 311 364 C294 382 278 397 263 393 Z" fill="url(#skin)"/>
    <path d="M344 337 C353 331 361 330 367 334 C360 337 354 341 347 347" fill="#f8d6ba"/>
    <path d="M358 333 L369 327 M360 337 L372 334" class="fine" stroke="#f8d6ba" stroke-width="2.3"/>

    <path d="M238 344 L237 367 Q249 378 262 365 L259 341 Z" fill="url(#skin)"/>

    <g id="head">
      <path d="M216 278 C224 251 259 247 275 270 C285 285 277 297 279 307 L288 314 L278 320 C277 342 262 354 242 348 C220 342 208 319 211 296 Z" fill="url(#skin)"/>
      <path d="M215 310 C199 282 215 251 243 247 C268 243 282 257 282 277 C262 265 251 278 235 279 C231 296 224 307 215 310 Z" fill="url(#hair)"/>
      <path d="M218 290 C205 315 216 342 236 349 C217 350 201 334 201 311 C201 290 207 275 221 264" fill="#bd8291"/>
      <path d="M224 269 Q244 250 270 266" fill="none" stroke="#ffe6bd" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <path d="M275 293 Q269 288 264 293" fill="none" stroke="#684c66" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M266 294 Q270 298 274 294" fill="none" stroke="#433a59" stroke-width="1.2"/>
      <circle cx="271" cy="294" r="1.5" fill="#29344c"/>
      <path d="M277 327 Q271 331 266 327" fill="none" stroke="#b66f7d" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M223 307 L209 302 L215 317" fill="url(#skin)" stroke="#e6b5aa" stroke-width=".8"/>
      <circle cx="259" cy="315" r="7" fill="#ee9f9d" opacity=".13"/>
      <g fill="#fff0bd">
        <use href="#spark" transform="translate(228 249) scale(.55)"/>
        <use href="#spark" transform="translate(248 244) scale(.36)"/>
        <circle cx="239" cy="250" r="2"/>
      </g>
      <path d="M216 259 Q236 236 265 252" fill="none" stroke="#d9c58f" stroke-width="1.2"/>
    </g>

    <path d="M226 378 Q246 388 270 376" fill="none" stroke="#f6e4c1" stroke-width="2"/>
    <circle cx="248" cy="384" r="4" fill="#fff0b3"/>
    <circle cx="248" cy="384" r="9" fill="#ffe5a0" opacity=".2" filter="url(#smallGlow)"/>
  </g>

  <g id="lightThread" fill="none" stroke="#ffeab2" stroke-linecap="round">
    <path d="M365 333 C384 317 387 292 403 286" stroke-width="1.2" opacity=".6" class="thread"/>
    <path d="M357 348 C389 357 408 338 413 321" stroke-width=".65" opacity=".35" class="thread"/>
  </g>
  <g fill="#fff2b9">
    <use href="#spark" transform="translate(373 326) scale(.52)" class="star"/>
    <use href="#spark" transform="translate(391 302) scale(.34)" class="star" style="animation-delay:-2s"/>
    <circle cx="382" cy="347" r="2" class="star" style="animation-delay:-.8s"/>
  </g>

  <g id="motes" fill="#ffe9ad"></g>

  <g opacity=".65" fill="none" stroke="#52606b" stroke-width="3" stroke-linecap="round">
    <path d="M35 900 Q44 803 23 728 M46 842 Q76 800 88 750 M559 900 Q549 804 576 733 M546 847 Q520 800 512 765"/>
    <path d="M25 781 Q6 765 8 745 M31 808 Q56 787 58 765 M570 788 Q590 766 590 746 M561 818 Q537 795 535 777"/>
  </g>

  <g class="flower" style="animation-delay:-1s">
    <path d="M89 900 Q82 832 103 785" fill="none" stroke="#55766f" stroke-width="3"/>
    <path d="M96 818 Q72 806 69 786 M93 837 Q117 820 122 801" fill="none" stroke="#55766f" stroke-width="2"/>
    <g transform="translate(104 781)" fill="#e8c5cf">
      <ellipse rx="6" ry="17" transform="rotate(0) translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(72) translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(144) translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(216) translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(288) translate(0 -10)"/>
      <circle r="5" fill="#ffe7a5"/>
    </g>
  </g>

  <g class="flower" style="animation-delay:-3.4s">
    <path d="M500 900 Q510 842 491 809" fill="none" stroke="#4d716b" stroke-width="3"/>
    <path d="M503 853 Q527 836 531 819" fill="none" stroke="#4d716b" stroke-width="2"/>
    <g transform="translate(490 805) scale(.8)" fill="#b8d8d2">
      <ellipse rx="6" ry="17" transform="translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(72) translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(144) translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(216) translate(0 -10)"/>
      <ellipse rx="6" ry="17" transform="rotate(288) translate(0 -10)"/>
      <circle r="5" fill="#ffe9af"/>
    </g>
  </g>

  <path d="M0 879 C91 856 149 882 224 868 S383 856 600 878 L600 900 L0 900 Z" fill="#0d1728" opacity=".8"/>
  <g fill="#ffe8a6">
    <circle cx="102" cy="779" r="14" opacity=".09" filter="url(#softGlow)"/>
    <circle cx="490" cy="804" r="12" opacity=".08" filter="url(#softGlow)"/>
  </g>
</svg>
</main>

<script>
(() => {
  const ns = "http://www.w3.org/2000/svg";
  const byId = id => document.getElementById(id);
  let seed = 73129;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const stars = byId("stars");
  for (let i = 0; i < 54; i++) {
    const c = document.createElementNS(ns, "circle");
    const y = 35 + random() * 475;
    c.setAttribute("cx", (18 + random() * 564).toFixed(1));
    c.setAttribute("cy", y.toFixed(1));
    c.setAttribute("r", (.45 + random() * 1.45).toFixed(2));
    c.setAttribute("class", "star");
    c.style.animationDuration = (2.8 + random() * 4.5).toFixed(2) + "s";
    c.style.animationDelay = (-random() * 6).toFixed(2) + "s";
    c.style.opacity = (.25 + (1 - y / 600) * .55).toFixed(2);
    stars.appendChild(c);
  }

  const moteLayer = byId("motes");
  const motes = [];
  for (let i = 0; i < 24; i++) {
    const c = document.createElementNS(ns, "circle");
    const data = {
      x: 35 + random() * 530,
      y: 410 + random() * 420,
      r: .7 + random() * 1.8,
      phase: random() * Math.PI * 2,
      speed: .35 + random() * .65,
      drift: 6 + random() * 14
    };
    c.setAttribute("r", data.r.toFixed(2));
    moteLayer.appendChild(c);
    motes.push({ c, ...data });
  }

  const fairy = byId("fairy");
  const leftWing = byId("leftWing");
  const rightWing = byId("rightWing");
  const head = byId("head");
  const hairRibbon = byId("hairRibbon");
  const rays = byId("rays");
  const orb = byId("orb");
  const clouds = byId("cloudsBack");

  function frame(ms) {
    const t = ms * .001;
    const hover = Math.sin(t * .9);
    const wing = Math.sin(t * 2.15);

    fairy.setAttribute("transform", `translate(0 ${(hover * 6).toFixed(2)})`);
    leftWing.setAttribute("transform", `rotate(${(-3 + wing * 5).toFixed(2)} 244 405)`);
    rightWing.setAttribute("transform", `rotate(${(3 - wing * 5).toFixed(2)} 267 405)`);
    head.setAttribute("transform", `rotate(${(Math.sin(t * .55) * 1.8).toFixed(2)} 246 350)`);
    hairRibbon.setAttribute("transform", `rotate(${(Math.sin(t * .72) * 2.8).toFixed(2)} 211 324)`);
    rays.setAttribute("transform", `rotate(${(t * 2.4).toFixed(2)} 430 285)`);

    const pulse = 1 + Math.sin(t * 1.35) * .025;
    orb.setAttribute("transform", `translate(430 285) scale(${pulse.toFixed(4)}) translate(-430 -285)`);
    clouds.setAttribute("transform", `translate(${(Math.sin(t * .12) * 12).toFixed(2)} 0)`);

    for (const m of motes) {
      const x = m.x + Math.sin(t * m.speed + m.phase) * m.drift;
      const y = m.y + Math.cos(t * m.speed * .63 + m.phase) * m.drift * .7;
      const glow = .22 + .65 * (.5 + .5 * Math.sin(t * 1.4 + m.phase));
      m.c.setAttribute("cx", x.toFixed(2));
      m.c.setAttribute("cy", y.toFixed(2));
      m.c.setAttribute("opacity", glow.toFixed(2));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Fairy of First Light",
  "statement": "What you nurture in darkness becomes the morning."
}
```