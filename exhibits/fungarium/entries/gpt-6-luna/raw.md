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
    background: #111b24;
  }
  svg {
    display: block;
    width: 100vw;
    height: 100vh;
  }
  .breath { animation: breathe 5.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .glow { animation: glow 4s ease-in-out infinite; }
  .spore { animation: drift 8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .spore:nth-of-type(2n) { animation-duration: 10s; }
  .spore:nth-of-type(3n) { animation-duration: 7s; }
  .spore:nth-of-type(4n) { animation-delay: -3s; }
  .root { animation: rootlight 5s ease-in-out infinite; }
  @keyframes breathe {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-5px) rotate(.5deg); }
  }
  @keyframes glow {
    0%, 100% { opacity: .42; }
    50% { opacity: .78; }
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); opacity: .35; }
    50% { transform: translate(8px, -17px); opacity: .95; }
  }
  @keyframes rootlight {
    0%, 100% { opacity: .55; }
    50% { opacity: .95; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="A luminous fantastical mushroom">
  <defs>
    <linearGradient id="back" x2="0" y2="1">
      <stop stop-color="#192a37"/>
      <stop offset=".55" stop-color="#243444"/>
      <stop offset="1" stop-color="#111e29"/>
    </linearGradient>
    <radialGradient id="mist">
      <stop stop-color="#8dd4cf" stop-opacity=".25"/>
      <stop offset="1" stop-color="#6daebc" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cap" x1=".15" y1="0" x2=".82" y2="1">
      <stop stop-color="#eed5b0"/>
      <stop offset=".28" stop-color="#cf91a2"/>
      <stop offset=".63" stop-color="#796d9e"/>
      <stop offset="1" stop-color="#405d78"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#fff0c5"/>
      <stop offset=".5" stop-color="#eca9a2"/>
      <stop offset="1" stop-color="#84d8cb"/>
    </linearGradient>
    <linearGradient id="gills" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#e8c1aa"/>
      <stop offset="1" stop-color="#716e91"/>
    </linearGradient>
    <linearGradient id="stem" x1="0" y1="0" x2="1" y2=".2">
      <stop stop-color="#477d82"/>
      <stop offset=".45" stop-color="#c0d1b2"/>
      <stop offset=".72" stop-color="#e4c393"/>
      <stop offset="1" stop-color="#739a9b"/>
    </linearGradient>
    <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#8f7867"/>
      <stop offset=".5" stop-color="#514d50"/>
      <stop offset="1" stop-color="#29343a"/>
    </linearGradient>
    <radialGradient id="pearl">
      <stop stop-color="#fff7d8"/>
      <stop offset=".35" stop-color="#d5f0d4"/>
      <stop offset="1" stop-color="#7fd4d0" stop-opacity=".2"/>
    </radialGradient>
    <filter id="soft" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="15"/>
    </filter>
    <filter id="shine" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <pattern id="flecks" width="33" height="29" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="7" r="1.2" fill="#f0d5a7" opacity=".55"/>
      <circle cx="23" cy="20" r=".8" fill="#d4efda" opacity=".55"/>
      <path d="M14 2l2 2" stroke="#f2bd9f" stroke-width="1" opacity=".4"/>
    </pattern>
  </defs>

  <rect width="600" height="800" fill="url(#back)"/>
  <ellipse cx="303" cy="368" rx="245" ry="295" fill="url(#mist)"/>
  <ellipse class="glow" cx="302" cy="280" rx="150" ry="105" fill="#a3e0cc" opacity=".5" filter="url(#soft)"/>

  <!-- Quiet motes in the specimen air -->
  <g fill="#d9ebce">
    <circle cx="102" cy="158" r="1.5" opacity=".55"/><circle cx="478" cy="143" r="1" opacity=".6"/>
    <circle cx="84" cy="367" r="1.2" opacity=".45"/><circle cx="516" cy="354" r="1.4" opacity=".55"/>
    <circle cx="125" cy="505" r="1" opacity=".5"/><circle cx="458" cy="477" r="1.2" opacity=".45"/>
    <circle cx="203" cy="117" r="1" opacity=".5"/><circle cx="393" cy="109" r="1.3" opacity=".45"/>
  </g>
  <path d="M112 252 C158 176 215 147 275 151" fill="none" stroke="#b4dac6" stroke-opacity=".12" stroke-width="1"/>
  <path d="M362 145 C426 169 470 220 488 269" fill="none" stroke="#b4dac6" stroke-opacity=".12" stroke-width="1"/>
  <circle cx="112" cy="252" r="2" fill="#b8e6d1" opacity=".5"/>
  <circle cx="488" cy="269" r="2" fill="#b8e6d1" opacity=".5"/>

  <!-- Floating cushion of peat and mineral -->
  <path d="M128 633 Q153 610 188 616 Q213 590 247 607 Q279 587 307 608 Q343 588 374 610 Q411 597 431 620 Q465 619 477 644
           Q461 668 442 683 Q398 696 355 688 Q308 708 260 691 Q216 702 175 680 Q143 669 128 633Z"
        fill="url(#earth)" stroke="#bda78b" stroke-opacity=".55" stroke-width="2"/>
  <path d="M128 633 Q153 610 188 616 Q213 590 247 607 Q279 587 307 608 Q343 588 374 610 Q411 597 431 620 Q465 619 477 644
           Q461 668 442 683 Q398 696 355 688 Q308 708 260 691 Q216 702 175 680 Q143 669 128 633Z"
        fill="url(#flecks)" opacity=".75"/>
  <path d="M147 644 Q178 652 197 638 Q220 650 242 636 M357 640 Q389 653 420 636 M217 673 Q250 660 274 677 M327 668 Q350 653 375 674"
        fill="none" stroke="#d9bb94" stroke-opacity=".4" stroke-width="2"/>
  <path d="M176 671 Q163 694 150 704 M216 682 Q211 705 197 716 M399 681 Q411 701 425 709 M359 685 Q365 706 379 716"
        fill="none" stroke="#87c5b2" stroke-width="2" stroke-linecap="round" opacity=".7" class="root"/>
  <circle cx="177" cy="635" r="4" fill="#e6c79b" opacity=".65"/>
  <circle cx="414" cy="641" r="3" fill="#a7d9c1" opacity=".8"/>
  <circle cx="287" cy="670" r="2.5" fill="#f2d09d" opacity=".8"/>

  <!-- Mycelial threads in the floating earth -->
  <g fill="none" stroke="#b8d8ad" stroke-width="1.5" opacity=".52">
    <path d="M299 620 Q270 643 233 656 Q216 665 205 679"/>
    <path d="M302 620 Q328 645 366 652 Q389 661 400 679"/>
    <path d="M284 638 Q269 656 270 678"/>
    <path d="M322 638 Q337 657 333 680"/>
  </g>

  <!-- Stem, twisting like a ribbon -->
  <path d="M300 624
           C278 583 331 540 310 500
           C288 461 270 435 299 400
           C318 377 303 350 300 306
           C319 344 342 377 322 414
           C302 452 344 482 330 521
           C318 557 342 592 326 625Z"
        fill="#243b47" opacity=".45" transform="translate(5 7)"/>
  <path d="M300 624
           C278 583 331 540 310 500
           C288 461 270 435 299 400
           C318 377 303 350 300 306
           C319 344 342 377 322 414
           C302 452 344 482 330 521
           C318 557 342 592 326 625Z"
        fill="url(#stem)" stroke="#d4d8b1" stroke-opacity=".72" stroke-width="2"/>
  <path d="M306 597 C294 565 328 538 319 507 C310 475 284 447 307 414 C321 394 313 367 307 340"
        fill="none" stroke="#f4e0b5" stroke-opacity=".75" stroke-width="4" stroke-linecap="round"/>
  <path d="M286 540 Q305 550 327 541 M286 464 Q307 474 328 463"
        fill="none" stroke="#668e8d" stroke-width="2" opacity=".7"/>

  <!-- Gilled, folded cap -->
  <g class="breath">
    <path d="M153 270
      C170 249 166 223 194 203
      C217 186 242 198 265 184
      C288 168 309 164 330 180
      C352 194 372 186 394 202
      C420 221 425 241 450 257
      C430 276 412 276 391 284
      C365 295 342 283 322 294
      C300 306 278 294 255 289
      C223 282 191 293 153 270Z"
      fill="url(#gills)" stroke="url(#rim)" stroke-width="4"/>

    <!-- Radiating gills -->
    <g fill="none" stroke="#f1d4b5" stroke-opacity=".76" stroke-width="1.7">
      <path d="M300 300 Q229 301 159 268"/>
      <path d="M300 300 Q239 312 174 276"/>
      <path d="M300 300 Q252 319 193 283"/>
      <path d="M300 300 Q269 321 213 286"/>
      <path d="M300 300 Q285 320 235 289"/>
      <path d="M300 300 Q301 323 258 291"/>
      <path d="M300 300 Q319 320 281 294"/>
      <path d="M300 300 Q339 315 304 293"/>
      <path d="M300 300 Q361 309 329 291"/>
      <path d="M300 300 Q383 300 354 286"/>
      <path d="M300 300 Q408 289 379 280"/>
      <path d="M300 300 Q426 278 404 273"/>
    </g>

    <!-- Iridescent cap surface -->
    <path d="M153 270
      C172 248 169 224 195 204
      C218 187 243 199 266 184
      C288 169 309 165 330 181
      C350 195 373 187 394 203
      C418 220 426 242 450 257
      C425 266 402 257 382 265
      C356 276 337 267 315 279
      C292 292 269 276 245 276
      C211 275 184 287 153 270Z"
      fill="url(#cap)" stroke="#f4d6ae" stroke-width="2.5"/>

    <!-- Fold lines and luminous ridges -->
    <path d="M181 258 C205 236 196 216 225 203 M236 266 C260 237 244 211 272 187
             M295 273 C315 242 291 211 310 174 M347 267 C362 239 342 213 346 194
             M390 258 C399 238 382 222 386 206"
      fill="none" stroke="#fff0c9" stroke-opacity=".67" stroke-width="3" stroke-linecap="round"/>
    <path d="M169 265 Q211 258 245 268 Q275 273 300 280 Q336 263 372 267 Q412 263 438 258"
      fill="none" stroke="#92e1d0" stroke-width="3" stroke-opacity=".8"/>
    <ellipse cx="249" cy="216" rx="21" ry="9" transform="rotate(-28 249 216)" fill="#fff1cf" opacity=".23"/>
    <ellipse cx="369" cy="226" rx="16" ry="7" transform="rotate(28 369 226)" fill="#d7fff0" opacity=".22"/>
    <circle cx="300" cy="282" r="6" fill="#fff4cc" opacity=".9" filter="url(#shine)"/>
  </g>

  <!-- Hanging pearl-like spore lamps -->
  <g stroke="#b9e5d4" stroke-width="1.5" fill="none" opacity=".85">
    <path d="M202 281 Q195 306 190 321"/>
    <path d="M395 277 Q404 301 412 314"/>
    <path d="M242 290 Q237 309 235 325"/>
    <path d="M360 288 Q365 309 371 324"/>
  </g>
  <g>
    <circle cx="190" cy="324" r="7" fill="url(#pearl)"/>
    <circle cx="412" cy="317" r="8" fill="url(#pearl)"/>
    <circle cx="235" cy="328" r="5" fill="url(#pearl)"/>
    <circle cx="371" cy="327" r="6" fill="url(#pearl)"/>
    <circle cx="188" cy="322" r="1.5" fill="#fff9db"/>
    <circle cx="410" cy="315" r="2" fill="#fff9db"/>
  </g>

  <!-- Slowly wandering spores -->
  <g fill="#e3f4d7">
    <g class="spore"><circle cx="155" cy="354" r="3"/><circle cx="155" cy="354" r="6" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".7"/></g>
    <g class="spore"><circle cx="443" cy="376" r="2.5"/><circle cx="443" cy="376" r="5" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".65"/></g>
    <g class="spore"><circle cx="211" cy="405" r="2"/><circle cx="211" cy="405" r="4" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".6"/></g>
    <g class="spore"><circle cx="386" cy="421" r="3"/><circle cx="386" cy="421" r="6" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".7"/></g>
    <g class="spore"><circle cx="130" cy="447" r="2"/><circle cx="130" cy="447" r="4" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".55"/></g>
    <g class="spore"><circle cx="468" cy="475" r="2.5"/><circle cx="468" cy="475" r="5" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".6"/></g>
    <g class="spore"><circle cx="178" cy="524" r="2"/><circle cx="178" cy="524" r="4" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".55"/></g>
    <g class="spore"><circle cx="430" cy="547" r="2"/><circle cx="430" cy="547" r="4" fill="none" stroke="#c8f4dc" stroke-width="1" opacity=".6"/></g>
  </g>

  <!-- Tiny glints -->
  <g fill="#fff2c9" opacity=".78">
    <path d="M123 300l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>
    <path d="M474 407l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/>
    <path d="M447 196l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z"/>
  </g>
</svg>
</body>
</html>
```

```json
{
  "title": "Tideglass Parasol",
  "statement": "This luminous fungus unfurls a folded, iridescent cap above a stem that twists like a ribbon. Its pearl-like spores drift through the air while fine mycelial threads stitch the floating peat beneath it."
}
```