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
    background: #172b3a;
  }
  body { display: grid; place-items: center; }
  svg { display: block; width: 100%; height: 100%; }
  .crown { transform-box: fill-box; transform-origin: center; }
  .c1 { animation: breathe 5.8s ease-in-out infinite; }
  .c2 { animation: breathe 6.6s ease-in-out -2s infinite; }
  .c3 { animation: breathe 7.2s ease-in-out -3.5s infinite; }
  .c4 { animation: breathe 6.2s ease-in-out -1s infinite; }
  .c5 { animation: breathe 7.4s ease-in-out -4s infinite; }
  .c6 { animation: breathe 5.5s ease-in-out -2.8s infinite; }
  .c7 { animation: breathe 6.9s ease-in-out -1.8s infinite; }
  .firefly { animation: twinkle 3.2s ease-in-out infinite alternate; }
  .firefly:nth-of-type(2n) { animation-delay: -1.4s; }
  .drifter { transform-box: fill-box; transform-origin: center; animation: drift 9s ease-in-out infinite; }
  .drifter.d2 { animation-delay: -4s; }
  .drifter.d3 { animation-delay: -6.2s; }
  @keyframes breathe {
    0%, 100% { transform: translate(0, 0) rotate(-1deg); }
    50% { transform: translate(2px, -3px) rotate(1deg); }
  }
  @keyframes twinkle { from { opacity: .35; } to { opacity: 1; } }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0) rotate(-12deg); opacity: .4; }
    50% { transform: translate(12px, 18px) rotate(35deg); opacity: .9; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 20s !important; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A small, glowing bonsai beneath a moon">
  <defs>
    <linearGradient id="sky" x2="0" y2="1">
      <stop stop-color="#263e52"/>
      <stop offset=".56" stop-color="#52677a"/>
      <stop offset="1" stop-color="#b29483"/>
    </linearGradient>
    <radialGradient id="dusk">
      <stop stop-color="#f3d7aa" stop-opacity=".42"/>
      <stop offset=".55" stop-color="#e9c49d" stop-opacity=".12"/>
      <stop offset="1" stop-color="#d6b39a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="moon">
      <stop stop-color="#fff2c9"/>
      <stop offset=".72" stop-color="#eed8ab"/>
      <stop offset="1" stop-color="#d4b995"/>
    </radialGradient>
    <linearGradient id="bark" x1="0" x2="1">
      <stop stop-color="#553e39"/>
      <stop offset=".38" stop-color="#a2765d"/>
      <stop offset=".62" stop-color="#d0a178"/>
      <stop offset="1" stop-color="#624744"/>
    </linearGradient>
    <linearGradient id="pot" x1="0" x2="1" y2="1">
      <stop stop-color="#b9cbb9"/>
      <stop offset=".35" stop-color="#668b8b"/>
      <stop offset=".72" stop-color="#416b76"/>
      <stop offset="1" stop-color="#284b5c"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" x2="0" y2="1">
      <stop stop-color="#d2d6bd"/>
      <stop offset=".48" stop-color="#8ea99b"/>
      <stop offset="1" stop-color="#527880"/>
    </linearGradient>
    <linearGradient id="leafA" x2=".8" y2="1">
      <stop stop-color="#b9d4a7"/>
      <stop offset="1" stop-color="#5c927e"/>
    </linearGradient>
    <linearGradient id="leafB" x2=".8" y2="1">
      <stop stop-color="#d7d99e"/>
      <stop offset="1" stop-color="#789b78"/>
    </linearGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <symbol id="leaf" viewBox="0 0 30 16">
      <path d="M1 8C7 1 20 0 29 7c-7 8-20 10-28 1Z" fill="currentColor"/>
      <path d="M3 8c8 1 15 1 24-.5" fill="none" stroke="#f1e5bd" stroke-opacity=".48" stroke-width=".75"/>
    </symbol>
  </defs>

  <rect width="600" height="600" fill="url(#sky)"/>
  <ellipse cx="300" cy="330" rx="285" ry="255" fill="url(#dusk)"/>
  <circle cx="160" cy="139" r="91" fill="#f0d6aa" opacity=".12" filter="url(#soft)"/>
  <circle cx="160" cy="139" r="40" fill="url(#moon)"/>
  <circle cx="160" cy="139" r="47" fill="none" stroke="#f8e5bf" stroke-opacity=".2"/>
  <path d="M128 145c12-8 22-8 34-2m-15-24c7 2 12 7 14 12" fill="none" stroke="#fff1d2" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>

  <path d="M0 392c91-25 158-7 228 8 87 19 170 13 252-8 41-11 79-12 120-2v210H0Z" fill="#536878" opacity=".25"/>
  <ellipse cx="300" cy="489" rx="174" ry="27" fill="#142d39" opacity=".28"/>
  <ellipse cx="300" cy="472" rx="151" ry="23" fill="#e8c69c" opacity=".12" filter="url(#soft)"/>

  <g opacity=".55" fill="#f8e6c0">
    <circle class="firefly" cx="103" cy="293" r="2.1"/>
    <circle class="firefly" cx="476" cy="188" r="1.7"/>
    <circle class="firefly" cx="453" cy="345" r="2"/>
    <circle class="firefly" cx="184" cy="380" r="1.4"/>
    <circle class="firefly" cx="390" cy="123" r="1.5"/>
    <circle class="firefly" cx="120" cy="360" r="1.2"/>
    <circle class="firefly" cx="505" cy="292" r="1.6"/>
  </g>

  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M300 431C288 407 278 390 290 367c14-26 16-41-1-65-15-22-13-42 6-64 15-19 16-39 5-62"
          stroke="#483b39" stroke-width="27"/>
    <path d="M300 431C288 407 278 390 290 367c14-26 16-41-1-65-15-22-13-42 6-64 15-19 16-39 5-62"
          stroke="url(#bark)" stroke-width="19"/>
    <path d="M295 416c-3-23-14-35-2-55m5-17c10-20 4-34-8-49m8-14c18-20 19-34 10-54m-2-20c2-13-1-22-7-31"
          stroke="#efd0a0" stroke-opacity=".55" stroke-width="3"/>
    <path d="M292 312c-24-20-44-29-68-34-19-4-32-16-43-34"
          stroke="#62483e" stroke-width="13"/>
    <path d="M292 312c-24-20-44-29-68-34-19-4-32-16-43-34"
          stroke="url(#bark)" stroke-width="8"/>
    <path d="M226 279c-16-1-29-9-40-22m40 22c-13-16-15-31-13-44"
          stroke="#a87c5f" stroke-width="5"/>
    <path d="M286 336c-26 1-48 7-68 21-13 9-29 10-44 6"
          stroke="#654a40" stroke-width="12"/>
    <path d="M286 336c-26 1-48 7-68 21-13 9-29 10-44 6"
          stroke="url(#bark)" stroke-width="7"/>
    <path d="M218 357c-14-12-25-15-40-14m40 14c-8 10-17 15-27 18"
          stroke="#ae8162" stroke-width="4.5"/>
    <path d="M289 300c18-21 34-31 53-40 18-8 31-22 42-42"
          stroke="#60473e" stroke-width="13"/>
    <path d="M289 300c18-21 34-31 53-40 18-8 31-22 42-42"
          stroke="url(#bark)" stroke-width="8"/>
    <path d="M342 260c17-3 31-12 42-25m-42 25c9-16 10-30 7-43"
          stroke="#a87c5f" stroke-width="5"/>
    <path d="M300 250c14-18 29-29 44-37 15-8 25-20 32-35"
          stroke="#61483e" stroke-width="11"/>
    <path d="M300 250c14-18 29-29 44-37 15-8 25-20 32-35"
          stroke="url(#bark)" stroke-width="7"/>
    <path d="M344 213c17 0 29-7 39-19m-39 19c5-12 5-23 2-33"
          stroke="#b18364" stroke-width="4"/>
    <path d="M286 380c-17-19-28-27-43-31m43 31c-5-18-2-30 8-42"
          stroke="#a77a5d" stroke-width="5"/>
  </g>

  <g class="crown c1" transform="translate(110 190)">
    <path d="M10 38c8-22 31-35 53-28 14-17 47-10 51 10 21-3 34 13 29 31-10 19-42 22-62 18-25 11-64 2-71-12-7-7-6-14 0-19Z" fill="#507a70" opacity=".5"/>
    <use href="#leaf" x="3" y="23" width="36" height="19" style="color:#8eb293"/>
    <use href="#leaf" x="26" y="7" width="34" height="18" style="color:#b9c99b"/>
    <use href="#leaf" x="48" y="20" width="38" height="20" style="color:#7eaa8c"/>
    <use href="#leaf" x="72" y="5" width="34" height="18" style="color:#c3cf9e"/>
    <use href="#leaf" x="92" y="22" width="35" height="18" style="color:#8fb293"/>
    <use href="#leaf" x="15" y="43" width="34" height="18" style="color:#b2c698"/>
    <use href="#leaf" x="48" y="43" width="37" height="19" style="color:#6f9d87"/>
    <use href="#leaf" x="82" y="42" width="34" height="18" style="color:#b5c79b"/>
    <use href="#leaf" x="38" y="27" width="32" height="17" style="color:#d0d5a5"/>
    <circle cx="67" cy="18" r="3" fill="#f3d796"/>
    <circle cx="112" cy="39" r="2.5" fill="#f3d796"/>
  </g>

  <g class="crown c2" transform="translate(198 237)">
    <path d="M4 25c8-19 26-24 43-18 17-17 42-8 44 8 18-2 28 11 23 25-12 17-43 18-58 12-18 9-47 3-54-8-5-7-4-13 2-19Z" fill="#4d766d" opacity=".5"/>
    <use href="#leaf" x="0" y="18" width="32" height="17" style="color:#9ab994"/>
    <use href="#leaf" x="23" y="4" width="33" height="18" style="color:#c3ce9e"/>
    <use href="#leaf" x="47" y="15" width="35" height="18" style="color:#79a48a"/>
    <use href="#leaf" x="72" y="5" width="31" height="17" style="color:#b2c69b"/>
    <use href="#leaf" x="88" y="24" width="31" height="16" style="color:#94b795"/>
    <use href="#leaf" x="21" y="35" width="34" height="18" style="color:#b8c99a"/>
    <use href="#leaf" x="56" y="35" width="34" height="18" style="color:#709984"/>
    <circle cx="45" cy="18" r="2.6" fill="#f2d38e"/>
    <circle cx="91" cy="15" r="2.3" fill="#f2d38e"/>
  </g>

  <g class="crown c3" transform="translate(257 137)">
    <path d="M7 30c5-20 24-28 42-20 15-19 43-12 47 7 20-3 31 12 25 28-9 19-39 22-59 16-20 10-48 1-56-11-5-7-4-14 1-20Z" fill="#527a70" opacity=".52"/>
    <use href="#leaf" x="0" y="21" width="34" height="18" style="color:#8eae8d"/>
    <use href="#leaf" x="18" y="4" width="34" height="18" style="color:#cad1a0"/>
    <use href="#leaf" x="43" y="16" width="36" height="19" style="color:#78a18a"/>
    <use href="#leaf" x="67" y="2" width="34" height="18" style="color:#b8c99a"/>
    <use href="#leaf" x="91" y="19" width="34" height="18" style="color:#8cad8c"/>
    <use href="#leaf" x="21" y="39" width="35" height="18" style="color:#b7c99b"/>
    <use href="#leaf" x="55" y="38" width="36" height="19" style="color:#709a84"/>
    <use href="#leaf" x="88" y="39" width="32" height="17" style="color:#c1cd9f"/>
    <circle cx="42" cy="16" r="2.8" fill="#f1d590"/>
    <circle cx="105" cy="37" r="2.3" fill="#f1d590"/>
  </g>

  <g class="crown c4" transform="translate(356 174)">
    <path d="M7 30c8-20 31-27 49-17 16-14 41-7 44 10 21-4 35 10 29 27-8 19-41 22-60 15-20 9-50 4-59-9-5-8-4-18-3-26Z" fill="#50786d" opacity=".52"/>
    <use href="#leaf" x="0" y="20" width="35" height="18" style="color:#9db994"/>
    <use href="#leaf" x="24" y="4" width="34" height="18" style="color:#cbd1a0"/>
    <use href="#leaf" x="48" y="17" width="35" height="18" style="color:#78a28a"/>
    <use href="#leaf" x="75" y="5" width="33" height="17" style="color:#b8c99a"/>
    <use href="#leaf" x="96" y="22" width="34" height="18" style="color:#8cae8d"/>
    <use href="#leaf" x="18" y="40" width="34" height="18" style="color:#b6c99b"/>
    <use href="#leaf" x="52" y="39" width="37" height="19" style="color:#739a83"/>
    <use href="#leaf" x="88" y="41" width="32" height="17" style="color:#c3ce9f"/>
    <circle cx="60" cy="14" r="2.7" fill="#f2d794"/>
    <circle cx="112" cy="40" r="2.4" fill="#f2d794"/>
  </g>

  <g class="crown c5" transform="translate(405 218)">
    <path d="M3 23c9-17 28-23 45-14 14-13 38-6 40 10 19-3 29 10 23 24-9 17-35 18-51 12-18 9-43 3-53-8-6-7-8-17-4-24Z" fill="#4d7469" opacity=".5"/>
    <use href="#leaf" x="0" y="16" width="31" height="16" style="color:#a2bb95"/>
    <use href="#leaf" x="20" y="2" width="31" height="16" style="color:#c8d09e"/>
    <use href="#leaf" x="42" y="13" width="34" height="18" style="color:#7ba38a"/>
    <use href="#leaf" x="67" y="1" width="31" height="17" style="color:#b6c99a"/>
    <use href="#leaf" x="82" y="20" width="32" height="17" style="color:#91b08e"/>
    <use href="#leaf" x="18" y="34" width="33" height="17" style="color:#b9c99a"/>
    <use href="#leaf" x="52" y="33" width="34" height="18" style="color:#719982"/>
    <circle cx="35" cy="13" r="2.4" fill="#f3d995"/>
  </g>

  <g class="crown c6" transform="translate(326 269)">
    <path d="M5 24c6-17 25-23 42-15 13-13 37-7 40 9 18-3 29 9 23 23-9 16-35 19-51 12-18 8-43 4-52-8-5-6-6-14-2-21Z" fill="#4a7167" opacity=".5"/>
    <use href="#leaf" x="0" y="16" width="32" height="17" style="color:#a2bc96"/>
    <use href="#leaf" x="19" y="1" width="33" height="17" style="color:#c5cf9d"/>
    <use href="#leaf" x="43" y="12" width="34" height="18" style="color:#79a28a"/>
    <use href="#leaf" x="68" y="2" width="31" height="17" style="color:#b7c99a"/>
    <use href="#leaf" x="84" y="21" width="31" height="16" style="color:#8ead8d"/>
    <use href="#leaf" x="21" y="34" width="33" height="17" style="color:#b4c797"/>
    <use href="#leaf" x="55" y="34" width="34" height="18" style="color:#6e9881"/>
    <circle cx="62" cy="13" r="2.4" fill="#f2d591"/>
  </g>

  <g class="crown c7" transform="translate(164 316)">
    <path d="M6 22c8-17 27-22 43-13 14-13 36-7 39 9 19-2 29 10 23 23-10 16-35 17-52 11-17 9-43 4-52-8-5-7-5-15-1-22Z" fill="#4d756b" opacity=".48"/>
    <use href="#leaf" x="0" y="15" width="32" height="17" style="color:#9db994"/>
    <use href="#leaf" x="20" y="1" width="32" height="17" style="color:#c6cf9e"/>
    <use href="#leaf" x="44" y="12" width="34" height="18" style="color:#78a087"/>
    <use href="#leaf" x="69" y="2" width="31" height="17" style="color:#b5c799"/>
    <use href="#leaf" x="85" y="21" width="31" height="16" style="color:#8eae8c"/>
    <use href="#leaf" x="18" y="34" width="34" height="17" style="color:#b8c99b"/>
    <use href="#leaf" x="54" y="33" width="34" height="18" style="color:#719982"/>
    <circle cx="47" cy="14" r="2.6" fill="#f4d995"/>
    <circle cx="98" cy="32" r="2" fill="#f4d995"/>
  </g>

  <g class="drifter" fill="#d5d99f" opacity=".75">
    <path d="M111 267c8-7 15-6 21-1-7 7-14 8-21 1Z"/>
  </g>
  <g class="drifter d2" fill="#e6cf98" opacity=".8">
    <path d="M469 326c7-6 13-5 18-1-6 6-12 7-18 1Z"/>
  </g>
  <g class="drifter d3" fill="#c3d19b" opacity=".7">
    <path d="M448 153c6-5 11-4 15-1-5 5-10 6-15 1Z"/>
  </g>

  <g>
    <path d="M258 426c12-10 25-12 42-9 17-4 31-1 44 8-17 8-70 10-86 1Z" fill="#516c54"/>
    <path d="M273 421c8-8 17-9 24-5 8-7 17-6 24 0 9-3 17 0 22 7-18 4-54 5-70-2Z" fill="#78916d"/>
    <g fill="#d1b989">
      <ellipse cx="223" cy="421" rx="10" ry="6" transform="rotate(-18 223 421)"/>
      <ellipse cx="374" cy="418" rx="13" ry="7" transform="rotate(16 374 418)"/>
      <ellipse cx="393" cy="425" rx="7" ry="4" transform="rotate(-12 393 425)"/>
    </g>
    <path d="M279 427c-11-8-17-13-22-21m44 18c8-10 15-13 24-16m-7 18c14-7 24-8 34-7"
          fill="none" stroke="#87986e" stroke-width="3" stroke-linecap="round"/>
  </g>

  <g>
    <path d="M190 431c0-8 7-13 16-13h188c9 0 16 5 16 13l-16 48c-2 7-9 11-18 11H224c-9 0-16-4-18-11Z" fill="url(#pot)"/>
    <path d="M201 445c51 10 148 10 199 0l-8 28c-2 8-8 11-17 11H226c-9 0-15-4-17-11Z" fill="#315968" opacity=".58"/>
    <path d="M202 456c50 10 145 10 196 0" fill="none" stroke="#b8c5a8" stroke-opacity=".55" stroke-width="2"/>
    <path d="M195 425c0-6 5-10 12-10h192c7 0 12 4 12 10v12c-65 13-151 13-216 0Z" fill="url(#rim)"/>
    <path d="M199 431c54 11 154 11 208 0" fill="none" stroke="#e5d2a6" stroke-width="2.2" stroke-opacity=".85"/>
    <path d="M212 481c54 8 127 8 181 0" fill="none" stroke="#d4c49e" stroke-width="1.4" stroke-opacity=".55"/>
    <path d="M221 490c41 5 121 5 163 0" fill="none" stroke="#294956" stroke-width="4" stroke-linecap="round" opacity=".75"/>
    <g fill="#d9c997" opacity=".8">
      <circle cx="226" cy="450" r="2"/><circle cx="239" cy="461" r="1.6"/>
      <circle cx="364" cy="450" r="2"/><circle cx="379" cy="462" r="1.5"/>
    </g>
    <path d="M260 468c20 4 60 4 80 0" fill="none" stroke="#9eb5a4" stroke-width="2" stroke-linecap="round" opacity=".55"/>
  </g>

  <g fill="#ffe7b3" filter="url(#glow)" opacity=".8">
    <circle cx="105" cy="325" r="2"/>
    <circle cx="485" cy="262" r="1.8"/>
    <circle cx="425" cy="372" r="1.6"/>
  </g>
</svg>
</body>
</html>
```

```json
{
  "title": "Murmur Moon Myrtle",
  "statement": "A wind-leaning myrtle keeps a little moonlight tucked among its leaves. Its glazed pot holds a miniature dusk, complete with moss, warm stones, and a few wandering sparks."
}
```