```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box}
  html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#07151f}
  body{display:flex;align-items:center;justify-content:center;touch-action:pan-y}
  #art{width:min(100vw,66.6667vh);height:min(100vh,150vw);display:block;overflow:hidden}
  svg{display:block;width:100%;height:100%;shape-rendering:geometricPrecision}
</style>
</head>
<body>
<div id="art">
<svg viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A luminous fairy listens to a golden shell beneath the moon">
<defs>
  <linearGradient id="night" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#071523"/>
    <stop offset=".46" stop-color="#102c3b"/>
    <stop offset="1" stop-color="#061b25"/>
  </linearGradient>
  <radialGradient id="aura">
    <stop offset="0" stop-color="#80e4d0" stop-opacity=".22"/>
    <stop offset=".48" stop-color="#5bb9b3" stop-opacity=".09"/>
    <stop offset="1" stop-color="#143140" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moon">
    <stop offset="0" stop-color="#d9f5dc" stop-opacity=".19"/>
    <stop offset=".72" stop-color="#8bcbbb" stop-opacity=".07"/>
    <stop offset="1" stop-color="#91d4c3" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#19434a" stop-opacity=".2"/>
    <stop offset=".32" stop-color="#10343d"/>
    <stop offset="1" stop-color="#051822"/>
  </linearGradient>
  <linearGradient id="wingA" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#d7ffe9" stop-opacity=".78"/>
    <stop offset=".28" stop-color="#77dbcb" stop-opacity=".48"/>
    <stop offset=".6" stop-color="#82a9cd" stop-opacity=".29"/>
    <stop offset="1" stop-color="#e9a9b8" stop-opacity=".48"/>
  </linearGradient>
  <linearGradient id="wingB" x1="1" y1="0" x2="0" y2="1">
    <stop stop-color="#ffe7c2" stop-opacity=".68"/>
    <stop offset=".35" stop-color="#94e6d3" stop-opacity=".48"/>
    <stop offset=".74" stop-color="#719fc0" stop-opacity=".26"/>
    <stop offset="1" stop-color="#c893be" stop-opacity=".45"/>
  </linearGradient>
  <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#ffe0b0"/>
    <stop offset=".48" stop-color="#d99b7e"/>
    <stop offset="1" stop-color="#825d68"/>
  </linearGradient>
  <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#193b48"/>
    <stop offset=".45" stop-color="#102837"/>
    <stop offset=".8" stop-color="#31605f"/>
    <stop offset="1" stop-color="#b89469"/>
  </linearGradient>
  <linearGradient id="gown" x1="0" y1="0" x2=".8" y2="1">
    <stop stop-color="#b7e4c8"/>
    <stop offset=".22" stop-color="#489a91"/>
    <stop offset=".58" stop-color="#1d5f68"/>
    <stop offset="1" stop-color="#102f49" stop-opacity=".92"/>
  </linearGradient>
  <linearGradient id="veil" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#d9f7d5" stop-opacity=".65"/>
    <stop offset=".5" stop-color="#63b9ad" stop-opacity=".22"/>
    <stop offset="1" stop-color="#5697a1" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="shellGold" cx=".38" cy=".3" r=".8">
    <stop stop-color="#fff0b4"/>
    <stop offset=".35" stop-color="#dcbf79"/>
    <stop offset=".72" stop-color="#a16f50"/>
    <stop offset="1" stop-color="#4d4550"/>
  </radialGradient>
  <linearGradient id="reed" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#2f655c"/>
    <stop offset="1" stop-color="#09272d"/>
  </linearGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="8"/>
  </filter>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="shellGlow" x="-70%" y="-70%" width="240%" height="240%">
    <feGaussianBlur stdDeviation="12"/>
  </filter>
</defs>

<rect width="600" height="900" fill="url(#night)"/>
<g id="ambient">
  <ellipse cx="303" cy="408" rx="286" ry="398" fill="url(#aura)"/>
  <circle cx="301" cy="286" r="197" fill="url(#moon)"/>
  <circle cx="301" cy="286" r="147" fill="none" stroke="#b7e5cf" stroke-opacity=".1" stroke-width="1"/>
  <path d="M171 218 A147 147 0 0 1 424 203" fill="none" stroke="#d5e9c9" stroke-opacity=".18" stroke-width="1.2"/>
  <path d="M171 355 A147 147 0 0 0 432 344" fill="none" stroke="#89c9ba" stroke-opacity=".1"/>
</g>
<g id="stars"/>
<g fill="none" stroke="#8cc3ac" stroke-opacity=".12">
  <path d="M39 650 Q45 389 19 193 M67 658 Q62 410 104 283 M551 667 Q542 407 581 241 M526 670 Q536 445 505 306"/>
  <path d="M18 489 Q71 462 78 407 Q31 417 18 489 M77 556 Q115 523 118 477 Q79 494 77 556 M552 487 Q505 456 500 407 Q545 426 552 487 M533 566 Q486 543 480 500 Q524 511 533 566"/>
</g>
<g opacity=".32" fill="#12343a">
  <path d="M0 572 Q84 525 158 588 T310 577 T467 578 T600 552 V735 H0Z"/>
  <path d="M0 624 Q102 572 205 625 T410 610 T600 605 V731 H0Z" fill="#0b2933"/>
</g>
<path d="M0 664 Q135 642 282 661 T600 650 V900 H0Z" fill="url(#water)"/>
<g id="waterLines" fill="none" stroke-linecap="round">
  <path d="M25 704 Q101 696 169 705 M370 724 Q468 713 567 724 M76 790 Q191 777 295 791 M343 829 Q442 815 548 825" stroke="#80b8aa" stroke-opacity=".14"/>
  <path d="M8 750 Q65 741 120 749 M193 734 Q268 724 329 732 M440 780 Q512 772 593 779 M26 855 Q123 842 204 851" stroke="#c0d7b5" stroke-opacity=".08"/>
  <path d="M205 860 Q292 846 373 857 M400 695 Q471 686 543 695" stroke="#5bb7ac" stroke-opacity=".16"/>
</g>

<g id="shellRipples" fill="none" stroke="#e9ce87" stroke-width="1.2">
  <ellipse cx="443" cy="705" rx="46" ry="10"/>
  <ellipse cx="443" cy="705" rx="46" ry="10"/>
  <ellipse cx="443" cy="705" rx="46" ry="10"/>
</g>
<ellipse cx="443" cy="674" rx="82" ry="52" fill="#e8c978" opacity=".12" filter="url(#shellGlow)" id="shellAura"/>

<g id="fairy">
  <g id="wingLeft">
    <path d="M290 362 C254 295 177 279 149 174 C214 164 280 222 294 312 C297 333 294 350 290 362Z" fill="url(#wingA)" stroke="#b9ead6" stroke-opacity=".55" stroke-width="1.4"/>
    <path d="M287 366 C223 350 159 385 157 483 C223 469 272 426 294 377Z" fill="url(#wingA)" stroke="#9bdacb" stroke-opacity=".5" stroke-width="1.3"/>
    <g fill="none" stroke="#d0f4df" stroke-opacity=".35" stroke-width="1">
      <path d="M289 354 Q226 274 158 185 M286 343 Q239 258 218 196 M283 326 Q256 285 173 266 M280 372 Q219 397 166 469 M279 380 Q232 376 181 397 M265 404 Q232 433 208 451"/>
      <path d="M206 205 Q204 242 222 267 M173 266 Q197 278 209 302 M181 397 Q204 418 205 449" stroke="#edb7c5" stroke-opacity=".4"/>
    </g>
    <g fill="#e7f7d6" opacity=".55">
      <ellipse cx="168" cy="195" rx="6" ry="11" transform="rotate(-30 168 195)"/>
      <circle cx="184" cy="230" r="3"/><circle cx="174" cy="450" r="4"/>
    </g>
  </g>
  <g id="wingRight">
    <path d="M310 360 C325 282 377 204 449 200 C450 288 379 349 318 369Z" fill="url(#wingB)" stroke="#cce9d2" stroke-opacity=".55" stroke-width="1.4"/>
    <path d="M316 372 C377 344 429 381 430 471 C370 454 332 420 312 382Z" fill="url(#wingB)" stroke="#b2d8c5" stroke-opacity=".48" stroke-width="1.3"/>
    <g fill="none" stroke="#e0f2d7" stroke-opacity=".34" stroke-width="1">
      <path d="M316 357 Q370 275 439 211 M320 344 Q350 259 390 221 M327 344 Q380 313 434 290 M320 377 Q375 399 421 457 M325 380 Q365 372 410 398 M344 405 Q373 430 397 442"/>
      <path d="M390 221 Q391 255 376 278 M434 290 Q409 298 396 320 M410 398 Q390 418 392 440" stroke="#f0c0b4" stroke-opacity=".4"/>
    </g>
    <g fill="#fff0c9" opacity=".55">
      <ellipse cx="433" cy="219" rx="5" ry="10" transform="rotate(28 433 219)"/>
      <circle cx="417" cy="251" r="3"/><circle cx="414" cy="442" r="4"/>
    </g>
  </g>

  <g id="hairBack">
    <path d="M271 282 C245 323 262 370 249 411 C233 465 240 521 269 570 C259 512 289 479 276 429 C267 394 287 359 287 326Z" fill="url(#hair)"/>
    <path d="M321 278 C352 324 324 369 338 414 C355 468 340 521 309 555 C329 493 300 464 315 420 C329 378 303 352 302 320Z" fill="url(#hair)" opacity=".85"/>
    <path d="M261 323 Q239 432 265 522" fill="none" stroke="#8eb395" stroke-opacity=".38" stroke-width="2"/>
    <path d="M330 329 Q348 429 319 508" fill="none" stroke="#c1ad7b" stroke-opacity=".28" stroke-width="1.4"/>
  </g>

  <path d="M283 340 L282 365 Q301 378 319 361 L316 337Z" fill="url(#skin)"/>
  <path d="M271 363 Q299 348 328 365 L322 425 L316 456 L277 450 L269 408Z" fill="url(#gown)" stroke="#b5d8b7" stroke-opacity=".45"/>
  <path d="M276 363 Q299 385 324 363 Q316 391 299 398 Q282 390 276 363Z" fill="#d4e8bd" opacity=".55"/>
  <path d="M276 401 Q300 412 324 399 M279 426 Q298 433 320 424" fill="none" stroke="#d2c68f" stroke-opacity=".5"/>

  <g fill="none" stroke="url(#skin)" stroke-linecap="round">
    <path d="M274 375 Q249 399 246 428 Q244 443 233 457" stroke-width="12"/>
    <path d="M324 376 Q346 402 346 429 Q348 445 373 459" stroke-width="12"/>
  </g>
  <path d="M234 450 Q225 456 222 469 Q230 465 234 460 Q231 472 236 474 Q242 463 241 454Z" fill="url(#skin)"/>
  <path d="M368 452 Q380 453 389 465 Q379 462 374 461 Q384 470 380 474 Q369 465 363 459Z" fill="url(#skin)"/>
  <circle cx="389" cy="466" r="2.5" fill="#f5dfa4" filter="url(#glow)"/>

  <path d="M278 438 C271 485 253 542 254 591 C255 627 277 650 296 672 C306 635 316 607 314 562 C326 597 343 614 361 624 C359 563 332 493 317 440Z" fill="url(#gown)"/>
  <path d="M286 448 C282 508 270 563 282 632 M304 452 Q293 542 298 644 M315 466 Q335 547 346 601" fill="none" stroke="#aad9bd" stroke-opacity=".26" stroke-width="1.5"/>
  <path d="M277 452 C248 507 231 563 246 623 C257 651 278 665 285 688 C250 671 224 642 222 607 C220 550 250 487 277 452Z" fill="url(#veil)"/>
  <path d="M316 453 C348 501 377 553 369 610 C365 636 349 656 329 673 C370 657 392 630 391 594 C389 539 349 486 316 453Z" fill="url(#veil)" opacity=".7"/>
  <path d="M291 663 Q289 680 279 690 Q293 691 302 674 M311 647 Q316 667 327 675 Q313 679 303 662" fill="url(#skin)" opacity=".9"/>

  <g id="head">
    <path d="M270 303 L246 294 Q249 315 269 324Z" fill="url(#skin)" stroke="#d6a787" stroke-width=".7"/>
    <path d="M265 307 L253 302" stroke="#8d6c6c" stroke-width="1"/>
    <path d="M273 279 C294 257 325 264 335 289 C341 304 334 315 338 329 C329 348 307 357 287 345 C268 334 259 298 273 279Z" fill="url(#skin)"/>
    <path d="M268 310 C251 278 277 250 307 255 C332 258 343 278 337 298 C326 287 319 276 316 267 C302 286 282 292 268 310Z" fill="url(#hair)"/>
    <path d="M273 281 Q291 258 315 264 M267 298 Q287 286 301 270" fill="none" stroke="#85a58b" stroke-opacity=".45" stroke-width="1.3"/>
    <path d="M300 312 Q307 316 314 311" fill="none" stroke="#4a4850" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M324 307 Q329 310 333 306" fill="none" stroke="#4a4850" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M321 313 Q324 322 319 325" fill="none" stroke="#9a6d6a" stroke-width="1"/>
    <path d="M312 334 Q320 338 326 332" fill="none" stroke="#9d5f65" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M292 304 Q305 299 315 305 M324 301 Q330 298 335 301" fill="none" stroke="#5e5a58" stroke-opacity=".6"/>
    <circle cx="337" cy="319" r="3.2" fill="#f4d99a" filter="url(#glow)"/>
    <path d="M280 266 Q273 248 283 235 Q284 251 293 259 M309 256 Q313 237 328 231 Q320 246 322 263" fill="none" stroke="#b9d8b0" stroke-opacity=".65" stroke-width="1.4"/>
    <circle cx="283" cy="235" r="2.6" fill="#e9e4ad"/>
    <circle cx="328" cy="231" r="2.2" fill="#e9e4ad"/>
  </g>

  <g id="hairFront" fill="none" stroke-linecap="round">
    <path d="M271 294 Q254 358 277 402 Q287 424 268 463" stroke="#183845" stroke-width="8"/>
    <path d="M272 298 Q260 361 280 399 Q289 424 272 458" stroke="#a5aa7e" stroke-opacity=".42" stroke-width="1.4"/>
    <path d="M331 289 Q341 340 322 374" stroke="#193b47" stroke-width="6"/>
  </g>
</g>

<g id="listeningArcs" fill="none" stroke="#efd99a" stroke-linecap="round">
  <path d="M403 577 Q380 558 386 532" stroke-opacity=".35"/>
  <path d="M418 568 Q402 551 408 531" stroke-opacity=".5"/>
  <path d="M432 564 Q424 551 429 538" stroke-opacity=".65"/>
</g>

<g id="shell">
  <ellipse cx="444" cy="698" rx="69" ry="13" fill="#020f18" opacity=".55"/>
  <path d="M388 661 C384 615 420 588 459 601 C499 613 514 651 491 679 C469 707 421 706 398 682 C391 675 388 668 388 661Z" fill="url(#shellGold)" stroke="#ead99c" stroke-opacity=".65" stroke-width="1.5"/>
  <path d="M398 661 C390 631 416 607 447 611 C480 614 495 641 481 666 C467 692 429 694 414 672 C402 654 415 633 435 632 C454 631 466 647 458 660 C451 673 433 671 430 660 C427 652 435 646 442 649" fill="none" stroke="#5c5551" stroke-width="4" stroke-linecap="round"/>
  <path d="M399 661 C391 631 417 607 447 611 C480 614 495 641 481 666 C467 692 429 694 414 672 C402 654 415 633 435 632 C454 631 466 647 458 660 C451 673 433 671 430 660 C427 652 435 646 442 649" fill="none" stroke="#f4df9f" stroke-opacity=".7" stroke-width="1.3" stroke-linecap="round"/>
  <g fill="none" stroke="#fff0b4" stroke-opacity=".34" stroke-width="1">
    <path d="M396 632 Q411 639 414 649 M408 612 Q420 623 422 635 M431 601 Q435 612 434 629 M457 602 Q452 614 450 631 M480 615 Q466 625 461 638 M496 639 Q480 643 466 651 M496 663 Q480 660 465 662 M479 688 Q468 676 455 674 M450 700 Q450 683 445 675 M420 695 Q429 681 431 673 M400 679 Q411 674 416 666"/>
  </g>
  <path d="M398 619 Q421 591 454 604" fill="none" stroke="#fff5c8" stroke-opacity=".7" stroke-width="2.3" stroke-linecap="round"/>
  <circle cx="442" cy="654" r="4" fill="#fff2b7" filter="url(#glow)"/>
</g>

<g fill="url(#reed)">
  <path d="M37 900 Q42 764 29 654 Q50 754 51 900Z"/>
  <path d="M64 900 Q62 795 88 701 Q76 804 78 900Z"/>
  <path d="M18 900 Q16 807 4 742 Q27 804 31 900Z"/>
  <path d="M553 900 Q548 777 566 671 Q563 798 568 900Z"/>
  <path d="M579 900 Q581 801 596 738 V900Z"/>
  <path d="M47 788 Q1 761 4 722 Q43 741 47 788 M57 824 Q105 785 111 749 Q68 766 57 824 M554 802 Q510 776 511 737 Q547 752 554 802 M566 848 Q598 811 600 786 V836Z"/>
</g>
<g fill="none" stroke="#79a88a" stroke-opacity=".22">
  <path d="M102 900 Q94 835 117 784 M495 900 Q508 837 489 786"/>
  <path d="M109 845 Q134 817 155 820 Q140 846 109 845 M498 852 Q469 824 449 832 Q468 853 498 852"/>
</g>
<g id="motes"/>
<ellipse cx="300" cy="878" rx="250" ry="65" fill="#020e17" opacity=".22"/>
</svg>
</div>
<script>
(() => {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.querySelector("svg");
  const stars = document.getElementById("stars");
  const motes = document.getElementById("motes");
  let seed = 8173;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const make = (name, attrs, parent) => {
    const el = document.createElementNS(ns, name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  };
  const starData = [];
  for (let i = 0; i < 52; i++) {
    const x = 25 + rnd() * 550;
    const y = 25 + rnd() * 590;
    const r = .45 + rnd() * 1.35;
    const el = make("circle", {cx:x, cy:y, r:r, fill:i%5===0?"#f5dfac":"#c5ead7", opacity:.15+rnd()*.45}, stars);
    starData.push({el, phase:rnd()*6.283, base:.12+rnd()*.42});
  }
  const moteData = [];
  for (let i = 0; i < 28; i++) {
    const x = 85 + rnd() * 440;
    const y = 160 + rnd() * 570;
    const r = .8 + rnd() * 1.8;
    const el = make("circle", {cx:0, cy:0, r:r, fill:i%4===0?"#ffdca0":"#c4f4d5", filter:i%6===0?"url(#glow)":""}, motes);
    moteData.push({el,x,y,phase:rnd()*6.283,speed:.35+rnd()*.45,range:5+rnd()*12});
  }
  const fairy = document.getElementById("fairy");
  const left = document.getElementById("wingLeft");
  const right = document.getElementById("wingRight");
  const head = document.getElementById("head");
  const hair = document.getElementById("hairFront");
  const arcs = document.getElementById("listeningArcs");
  const shellAura = document.getElementById("shellAura");
  const ambient = document.getElementById("ambient");
  const ripples = [...document.querySelectorAll("#shellRipples ellipse")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let px = 0, py = 0, tx = 0, ty = 0;
  addEventListener("pointermove", e => {
    tx = (e.clientX / innerWidth - .5) * 5;
    ty = (e.clientY / innerHeight - .5) * 4;
  }, {passive:true});
  addEventListener("pointerleave", () => { tx = 0; ty = 0; }, {passive:true});
  function frame(ms) {
    const t = ms * .001 * (reduce ? .35 : 1);
    px += (tx - px) * .025;
    py += (ty - py) * .025;
    const hover = Math.sin(t * 1.15) * 5;
    fairy.setAttribute("transform", `translate(${px*.35} ${hover+py*.25})`);
    const breath = Math.sin(t * 2.25);
    left.setAttribute("transform", `rotate(${-2.8+breath*3.3} 291 363)`);
    right.setAttribute("transform", `rotate(${2.4-breath*3.1} 311 363)`);
    head.setAttribute("transform", `rotate(${2.4+Math.sin(t*.72)*1.7} 301 339)`);
    hair.setAttribute("transform", `translate(${Math.sin(t*.85)*1.8} 0)`);
    ambient.setAttribute("transform", `translate(${px*.45} ${py*.45})`);
    arcs.setAttribute("opacity", .48 + .35 * (.5+.5*Math.sin(t*1.7)));
    arcs.setAttribute("transform", `translate(${Math.sin(t*.8)*2} ${Math.sin(t*1.1)*2})`);
    shellAura.setAttribute("opacity", .09 + .07*(.5+.5*Math.sin(t*1.7)));
    ripples.forEach((el,i) => {
      const p = (t*.16 + i/3) % 1;
      el.setAttribute("rx", 42+p*105);
      el.setAttribute("ry", 9+p*20);
      el.setAttribute("opacity", Math.sin(p*Math.PI)*.32);
    });
    starData.forEach(s => s.el.setAttribute("opacity", s.base*(.62+.38*Math.sin(t*.8+s.phase))));
    moteData.forEach(m => {
      const a = t*m.speed+m.phase;
      const x = m.x + Math.sin(a)*m.range;
      const y = m.y + Math.cos(a*.73)*m.range*.8 - ((t*3+m.phase*9)%30);
      m.el.setAttribute("transform", `translate(${x} ${y})`);
      m.el.setAttribute("opacity", .18+.58*(.5+.5*Math.sin(a*1.7)));
    });
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
  "title": "The Fairy of Deep Listening",
  "statement": "In stillness, even the smallest voice becomes a world."
}
```