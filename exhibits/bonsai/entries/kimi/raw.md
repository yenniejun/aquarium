```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{width:100%;height:100%;margin:0;overflow:hidden;background:transparent}
  body{display:grid;place-items:center}
  svg{display:block;width:100%;height:100%;max-width:100vmin;max-height:100vmin;overflow:hidden}
</style>
</head>
<body>
<svg viewBox="0 0 700 700" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bark" x1="0" y1="0" x2="1" y2=".25">
      <stop offset="0" stop-color="#392b29"/>
      <stop offset=".28" stop-color="#725044"/>
      <stop offset=".52" stop-color="#9a7054"/>
      <stop offset=".72" stop-color="#543d35"/>
      <stop offset="1" stop-color="#2d2b29"/>
    </linearGradient>
    <linearGradient id="rootBark" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#8b654d"/>
      <stop offset="1" stop-color="#41352e"/>
    </linearGradient>
    <linearGradient id="potGlaze" x1=".1" y1="0" x2=".85" y2="1">
      <stop stop-color="#a8c8ba"/>
      <stop offset=".18" stop-color="#709f95"/>
      <stop offset=".5" stop-color="#397872"/>
      <stop offset=".78" stop-color="#255c5b"/>
      <stop offset="1" stop-color="#173f44"/>
    </linearGradient>
    <linearGradient id="rimGlaze" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#c0d6c6"/>
      <stop offset=".45" stop-color="#63988d"/>
      <stop offset="1" stop-color="#285e5b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#fff0a7"/>
      <stop offset=".4" stop-color="#d8a74b"/>
      <stop offset=".7" stop-color="#f2ce75"/>
      <stop offset="1" stop-color="#9e6c2e"/>
    </linearGradient>
    <radialGradient id="leafShade" cx="35%" cy="24%" r="78%">
      <stop stop-color="#6e9270"/>
      <stop offset=".38" stop-color="#426f5b"/>
      <stop offset=".76" stop-color="#285449"/>
      <stop offset="1" stop-color="#173d39"/>
    </radialGradient>
    <radialGradient id="moss" cx="40%" cy="25%" r="75%">
      <stop stop-color="#8b9c59"/>
      <stop offset=".5" stop-color="#596d3e"/>
      <stop offset="1" stop-color="#344b36"/>
    </radialGradient>
    <radialGradient id="soil" cx="45%" cy="35%" r="70%">
      <stop stop-color="#655446"/>
      <stop offset="1" stop-color="#292d29"/>
    </radialGradient>
    <path id="bowlShape" d="M154 557 Q154 547 177 544 L523 544 Q546 547 546 557 L520 642 Q513 667 487 671 L213 671 Q187 667 180 642 Z"/>
    <clipPath id="potClip"><use href="#bowlShape"/></clipPath>
  </defs>

  <g>
    <path d="M204 653 L258 653 L250 700 L214 700 Z" fill="#214d4e"/>
    <path d="M442 653 L496 653 L486 700 L450 700 Z" fill="#183f43"/>
    <path d="M214 695 H250" stroke="#9db8a7" stroke-opacity=".25" stroke-width="2"/>
    <path d="M450 695 H486" stroke="#9db8a7" stroke-opacity=".18" stroke-width="2"/>
    <use href="#bowlShape" fill="url(#potGlaze)"/>
    <g clip-path="url(#potClip)" fill="none">
      <path d="M137 590 Q230 566 330 590 T562 582" stroke="#b9d4c1" stroke-opacity=".18" stroke-width="3"/>
      <path d="M145 607 Q245 583 340 608 T554 599" stroke="#c9dcc9" stroke-opacity=".1" stroke-width="1.5"/>
      <path d="M157 646 Q281 619 407 644 T542 632" stroke="#0e383c" stroke-opacity=".35" stroke-width="9"/>
      <path d="M170 556 Q188 608 218 659" stroke="#e1eee0" stroke-opacity=".15" stroke-width="18"/>
    </g>
    <ellipse cx="350" cy="551" rx="196" ry="29" fill="url(#rimGlaze)"/>
    <ellipse cx="350" cy="549" rx="179" ry="20" fill="url(#soil)"/>
    <path d="M158 554 Q350 584 542 554" fill="none" stroke="#173f42" stroke-opacity=".7" stroke-width="7"/>
    <path d="M163 548 Q350 573 537 548" fill="none" stroke="#c2d7c4" stroke-opacity=".45" stroke-width="2.5"/>

    <g fill="url(#moss)">
      <path d="M190 550 Q202 531 226 540 Q244 523 267 540 Q285 532 302 551 Z"/>
      <path d="M281 553 Q297 531 320 538 Q342 518 365 539 Q389 526 408 552 Z"/>
      <path d="M395 552 Q413 535 434 541 Q450 527 469 541 Q490 535 506 552 Z"/>
    </g>
    <g fill="#b5ba92" opacity=".55">
      <circle cx="223" cy="540" r="2.1"/><circle cx="247" cy="537" r="1.5"/>
      <circle cx="306" cy="539" r="1.8"/><circle cx="381" cy="539" r="1.7"/>
      <circle cx="432" cy="540" r="2"/><circle cx="470" cy="542" r="1.4"/>
    </g>
    <path d="M202 548 Q211 532 229 538 Q239 545 229 553 L207 554 Z" fill="#718078"/>
    <path d="M207 545 Q217 536 228 540" fill="none" stroke="#b3b9a4" stroke-opacity=".6" stroke-width="2"/>
    <path d="M467 549 Q474 538 487 541 Q496 548 488 554 L471 554 Z" fill="#576e68"/>
  </g>

  <g id="tree">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M339 318 C298 283 263 264 211 254 C185 249 165 250 144 256" stroke="#49372f" stroke-width="15"/>
      <path d="M339 316 C293 286 252 272 199 264" stroke="#987052" stroke-opacity=".55" stroke-width="4"/>
      <path d="M365 263 C402 239 438 211 483 193 C511 182 537 184 560 187" stroke="#49382f" stroke-width="13"/>
      <path d="M367 260 C420 230 465 202 525 194" stroke="#a37855" stroke-opacity=".48" stroke-width="3.5"/>
      <path d="M310 369 C269 359 228 356 187 365 C159 371 138 372 117 368" stroke="#46362f" stroke-width="16"/>
      <path d="M306 365 C252 356 206 365 157 373" stroke="#9a7153" stroke-opacity=".48" stroke-width="4"/>
      <path d="M330 419 C367 408 399 424 432 444 C458 460 483 459 509 452" stroke="#46362f" stroke-width="14"/>
      <path d="M336 416 C382 417 407 443 455 452" stroke="#a07755" stroke-opacity=".45" stroke-width="3.5"/>
      <path d="M359 187 C395 173 427 157 461 147" stroke="#503b31" stroke-width="10"/>
      <path d="M356 204 C329 193 309 184 285 178" stroke="#4b382f" stroke-width="9"/>
      <path d="M333 453 C354 435 375 422 403 414" stroke="#4a382f" stroke-width="10"/>
    </g>

    <path d="M318 560
      C307 526 305 486 286 451
      C266 415 273 379 292 348
      C312 316 341 309 337 275
      C333 243 319 222 334 192
      C347 164 373 145 381 108
      L397 101
      C390 143 373 174 370 202
      C367 226 382 246 375 278
      C368 316 335 337 330 365
      C324 396 343 415 336 450
      C329 484 346 524 371 558 Z" fill="url(#bark)"/>

    <g fill="none" stroke-linecap="round">
      <path d="M338 544 C321 493 323 472 309 441 C290 399 298 374 313 348 C335 312 357 298 355 267 C353 237 344 219 351 194 C359 166 380 145 387 116" stroke="#c49a6c" stroke-opacity=".48" stroke-width="5"/>
      <path d="M326 532 C320 493 310 468 298 446 C278 408 286 379 302 353" stroke="#2b2928" stroke-opacity=".65" stroke-width="5"/>
      <path d="M356 535 C337 491 340 462 327 433" stroke="#d1ad7b" stroke-opacity=".28" stroke-width="3"/>
      <path d="M351 308 C365 283 364 261 357 241" stroke="#272a28" stroke-opacity=".55" stroke-width="3"/>
      <path d="M365 182 C374 157 384 141 389 119" stroke="#e0ba81" stroke-opacity=".4" stroke-width="2.5"/>
      <path d="M295 405 C290 382 300 360 315 340" stroke="#d5b080" stroke-opacity=".24" stroke-width="2"/>
    </g>

    <path d="M326 463 C312 426 307 402 315 373 C320 354 333 340 340 326 C326 343 311 350 303 373 C293 402 305 435 315 462 Z" fill="#c5b28b" opacity=".7"/>
    <path d="M318 439 C309 407 310 386 320 365" fill="none" stroke="#ede0b6" stroke-opacity=".55" stroke-width="2"/>
    <path d="M291 348 C273 333 260 316 254 296 C266 313 281 323 301 330 Z" fill="#b8aa88" opacity=".72"/>

    <g fill="url(#rootBark)">
      <path d="M324 526 C317 540 298 548 270 554 L236 557 C270 544 290 533 309 520 Z"/>
      <path d="M350 525 C365 539 390 547 430 554 L461 555 C419 541 392 531 366 516 Z"/>
      <path d="M335 531 C329 545 323 552 306 560 L350 558 C357 548 357 538 352 528 Z"/>
      <path d="M319 541 C297 548 282 551 265 554" fill="none" stroke="#c1966c" stroke-opacity=".42" stroke-width="3"/>
    </g>

    <g id="pads"></g>
    <g id="drifters"></g>
  </g>

  <g>
    <path d="M391 558 C386 575 399 582 394 596 C389 610 403 618 398 635 C395 646 403 655 407 670" fill="none" stroke="#173f40" stroke-opacity=".65" stroke-width="5"/>
    <path d="M391 558 C386 575 399 582 394 596 C389 610 403 618 398 635 C395 646 403 655 407 670" fill="none" stroke="url(#gold)" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M395 595 L410 586 L419 587 M398 634 L383 626 L377 616 M401 653 L417 646" fill="none" stroke="url(#gold)" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M181 637 Q198 661 222 663 H477" fill="none" stroke="#b9d3bf" stroke-opacity=".2" stroke-width="2"/>
    <g id="speckles" clip-path="url(#potClip)"></g>
  </g>
</svg>

<script>
(() => {
  const ns = "http://www.w3.org/2000/svg";
  const make = (name, attrs, parent) => {
    const el = document.createElementNS(ns, name);
    for (const key in attrs) el.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(el);
    return el;
  };
  let state = 73129;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const padHost = document.getElementById("pads");
  const pads = [];
  const palette = ["#789878", "#638767", "#52785f", "#91a77b", "#3b6755", "#b0ad68"];

  function pad(x, y, rx, ry, seedPhase) {
    const g = make("g", {}, padHost);
    const points = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const rough = .91 + random() * .15;
      points.push([
        x + Math.cos(a) * rx * rough,
        y + Math.sin(a) * ry * (.88 + random() * .2)
      ]);
    }
    const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let start = midpoint(points[count - 1], points[0]);
    let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
    for (let i = 0; i < count; i++) {
      const m = midpoint(points[i], points[(i + 1) % count]);
      d += ` Q${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    make("path", {d: d + "Z", fill: "url(#leafShade)"}, g);

    for (let i = 0; i < 58; i++) {
      const a = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * .9;
      const px = x + Math.cos(a) * rx * radius;
      const py = y + Math.sin(a) * ry * radius;
      const length = 4 + random() * 7;
      const tilt = -24 + random() * 48;
      const tuft = make("g", {transform: `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${tilt.toFixed(1)})`}, g);
      const color = palette[Math.floor(random() * palette.length)];
      make("path", {
        d: `M${(-length).toFixed(1)} 2 Q0 -1 ${length.toFixed(1)} -2 M-1 0 L-4 -4 M2 -1 L4 -5`,
        fill: "none",
        stroke: color,
        "stroke-width": 1.5 + random() * 1.15,
        "stroke-linecap": "round",
        opacity: .55 + random() * .4
      }, tuft);
    }

    for (let i = 0; i < 4; i++) {
      const px = x + (random() - .5) * rx * 1.25;
      const py = y - ry * (.15 + random() * .55);
      make("ellipse", {
        cx: px, cy: py, rx: 2.2, ry: 4.2,
        fill: "#c5a55c", opacity: .72,
        transform: `rotate(${-35 + random() * 70} ${px} ${py})`
      }, g);
    }
    pads.push({g, x, y, phase: seedPhase});
  }

  pad(386, 104, 76, 36, .2);
  pad(455, 158, 89, 34, 1.4);
  pad(274, 188, 75, 30, 2.1);
  pad(493, 205, 112, 42, 3.2);
  pad(215, 256, 123, 41, 4.1);
  pad(190, 366, 118, 43, 5.3);
  pad(393, 411, 79, 31, 6.2);
  pad(477, 454, 91, 34, 7.1);

  const speckles = document.getElementById("speckles");
  for (let i = 0; i < 34; i++) {
    make("circle", {
      cx: 170 + random() * 360,
      cy: 566 + random() * 99,
      r: .45 + random() * 1.05,
      fill: random() > .5 ? "#d5dfc8" : "#102f34",
      opacity: .08 + random() * .13
    }, speckles);
  }

  const driftHost = document.getElementById("drifters");
  const drifters = [];
  const origins = [[508,205],[180,365],[452,151],[474,453],[249,255]];
  for (let i = 0; i < origins.length; i++) {
    const g = make("g", {}, driftHost);
    make("path", {
      d: "M-5 0 Q0 -3 6 0 Q0 3 -5 0Z",
      fill: i % 2 ? "#b49a54" : "#8c9b62"
    }, g);
    make("path", {
      d: "M-4 0 H5", stroke: "#e1c983", "stroke-width": .65, opacity: .7
    }, g);
    drifters.push({g, x: origins[i][0], y: origins[i][1], offset: i * 3.17, duration: 13 + i * 1.7});
  }

  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motion = calm ? .35 : 1;

  function animate(ms) {
    const t = ms * .001;
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      const breeze = Math.sin(t * .72 + p.phase) + .35 * Math.sin(t * 1.61 + p.phase * 1.7);
      const angle = breeze * .72 * motion;
      const dx = breeze * 1.45 * motion;
      const dy = Math.sin(t * .9 + p.phase) * .45 * motion;
      p.g.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${angle.toFixed(3)} ${p.x} ${p.y})`);
    }
    for (let i = 0; i < drifters.length; i++) {
      const leaf = drifters[i];
      const p = ((t + leaf.offset) % leaf.duration) / leaf.duration;
      const x = leaf.x + p * 78 + Math.sin(p * 10 + i) * 18;
      const y = leaf.y + p * 245 + Math.sin(p * 6 + i) * 7;
      const opacity = Math.sin(Math.PI * p) * .72 * motion;
      leaf.g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(p * 480 + i * 37).toFixed(1)}) scale(${(.7 + .2 * Math.sin(p * 8)).toFixed(2)})`);
      leaf.g.setAttribute("opacity", opacity.toFixed(3));
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Tidemend Juniper",
  "statement": "An old juniper leans into a patient breeze, rooted in a sea-glazed pot held together by one golden mend. Its drifting amber scales keep time by weather rather than season."
}
```