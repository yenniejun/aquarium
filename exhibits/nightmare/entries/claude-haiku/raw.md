```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Marrow Heron</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    overflow: hidden;
  }
  svg {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    display: block;
    background: transparent;
  }
</style>
</head>
<body>
<svg id="art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3" result="n2"/>
      <feDisplacementMap in="SourceGraphic" in2="n2" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <radialGradient id="ember" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f2c46b" stop-opacity="0.95"/>
      <stop offset="45%" stop-color="#d98a3a" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#d98a3a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f4eec4" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#f4eec4" stop-opacity="0.05"/>
    </radialGradient>
    <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#15131c" stroke-width="0.9" stroke-opacity="0.45"/>
    </pattern>
  </defs>

  <!-- ground -->
  <g filter="url(#ink)" fill="none" stroke="#1d1a24" stroke-linecap="round" opacity="0.55">
    <path d="M24,387 Q150,380 278,389" stroke-width="1.2"/>
    <path d="M40,388 q-4,-14 -12,-22 M46,388 q2,-18 -2,-30 M268,388 q4,-16 12,-24 M262,388 q-2,-12 2,-26" stroke-width="1"/>
  </g>

  <g id="bodyG" transform="translate(150 385) scale(1 1) translate(-150 -385)">

    <!-- legs -->
    <g filter="url(#ink)" fill="none" stroke="#211e2a" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M140,252 L118,312 L132,384"/>
      <path d="M162,252 L184,306 L168,384"/>
      <path d="M122,384 h18 M160,384 h18" stroke-width="3"/>
    </g>

    <!-- cloak wings behind -->
    <g id="cloakL" filter="url(#wash)">
      <path d="M125,215 C80,240 60,300 56,372 L72,350 L84,378 L100,344 L116,372 L128,330 Z" fill="#2f2b3a" opacity="0.78"/>
      <path d="M125,215 C80,240 60,300 56,372 L72,350 L84,378 L100,344 L116,372 L128,330 Z" fill="url(#hatch)"/>
    </g>
    <g id="cloakR" filter="url(#wash)">
      <path d="M180,215 C222,240 240,300 244,372 L228,350 L216,378 L200,344 L184,372 L172,330 Z" fill="#2f2b3a" opacity="0.78"/>
      <path d="M180,215 C222,240 240,300 244,372 L228,350 L216,378 L200,344 L184,372 L172,330 Z" fill="url(#hatch)"/>
    </g>

    <!-- torso -->
    <g filter="url(#wash)">
      <path d="M118,210 C108,250 120,282 150,290 C185,282 198,250 186,210 C176,188 130,188 118,210 Z" fill="#4b4659" opacity="0.92"/>
      <path d="M118,210 C108,250 120,282 150,290 C185,282 198,250 186,210 C176,188 130,188 118,210 Z" fill="url(#hatch)"/>
    </g>
    <g id="innerGlow">
      <circle id="ember" cx="150" cy="252" r="18" fill="url(#ember)" opacity="0.7"/>
    </g>
    <g filter="url(#ink)" fill="none" stroke="#17141e" stroke-width="1.3" stroke-linecap="round">
      <path d="M124,224 q13,7 26,0"/>
      <path d="M124,240 q13,7 26,0"/>
      <path d="M128,256 q11,6 22,0"/>
      <path d="M118,210 C108,250 120,282 150,290 C185,282 198,250 186,210 C176,188 130,188 118,210 Z" stroke-width="1.6"/>
    </g>

    <!-- neck -->
    <g filter="url(#wash)">
      <path d="M140,205 C152,160 118,132 130,100 L148,100 C136,134 168,164 162,205 Z" fill="#5a5566" opacity="0.92"/>
    </g>
    <path filter="url(#ink)" d="M140,205 C152,160 118,132 130,100" fill="none" stroke="#17141e" stroke-width="1.4" stroke-linecap="round"/>
    <path filter="url(#ink)" d="M162,205 C166,164 136,134 148,100" fill="none" stroke="#17141e" stroke-width="1.2" stroke-linecap="round"/>

    <!-- head group, pivots at neck top -->
    <g id="headG" transform="translate(0 0) rotate(0 130 92)">
      <!-- crest strands -->
      <g id="crest" filter="url(#ink)" fill="none" stroke="#1a1721" stroke-width="1.2" stroke-linecap="round" opacity="0.8">
        <path id="s0"/>
        <path id="s1"/>
        <path id="s2"/>
        <path id="s3"/>
      </g>

      <!-- skull and beak -->
      <g filter="url(#wash)">
        <path d="M116,74 C128,56 152,60 156,76 C158,88 142,96 124,98 L78,116 L84,123 L128,106 C116,104 110,90 116,74 Z" fill="#5a5566" opacity="0.95"/>
      </g>
      <path filter="url(#ink)" d="M116,74 C128,56 152,60 156,76 C158,88 142,96 124,98 L78,116 L84,123 L128,106 C116,104 110,90 116,74 Z" fill="none" stroke="#17141e" stroke-width="1.4" stroke-linejoin="round"/>
      <path filter="url(#ink)" d="M90,118 L110,108" fill="none" stroke="#17141e" stroke-width="0.8" opacity="0.6"/>

      <!-- eyes -->
      <g id="eyeA">
        <circle cx="130" cy="74" r="7" fill="url(#eyeGlow)"/>
        <ellipse cx="130" cy="74" rx="5.5" ry="4.6" fill="#ece4b8" stroke="#17141e" stroke-width="0.9"/>
        <circle id="pupA" cx="130" cy="74" r="2.4" fill="#100e15"/>
      </g>
      <g id="eyeB">
        <circle cx="141" cy="80" r="4.5" fill="url(#eyeGlow)"/>
        <ellipse cx="141" cy="80" rx="3.6" ry="3" fill="#ece4b8" stroke="#17141e" stroke-width="0.8"/>
        <circle id="pupB" cx="141" cy="80" r="1.6" fill="#100e15"/>
      </g>
      <rect id="lidA" x="123" y="67" width="14" height="0" fill="#5a5566"/>
      <rect id="lidB" x="136" y="73" width="10" height="0" fill="#5a5566"/>
    </g>
  </g>
</svg>

<script>
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const headG = document.getElementById("headG");
  const bodyG = document.getElementById("bodyG");
  const cloakL = document.getElementById("cloakL");
  const cloakR = document.getElementById("cloakR");
  const ember = document.getElementById("ember");
  const pupA = document.getElementById("pupA");
  const pupB = document.getElementById("pupB");
  const lidA = document.getElementById("lidA");
  const lidB = document.getElementById("lidB");
  const strands = [0, 1, 2, 3].map(i => document.getElementById("s" + i));

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // pointer state, normalized to the window
  let tx = 0.5, ty = 0.4;
  let lastMove = -100;
  let cx = 0.5, cy = 0.4;
  let headAngle = 0, headAngleT = 0;
  let pupX = 0, pupY = 0;

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX / Math.max(1, window.innerWidth);
    ty = e.clientY / Math.max(1, window.innerHeight);
    lastMove = performance.now() / 1000;
  }, { passive: true });

  window.addEventListener("pointerleave", () => { lastMove = -100; });

  let nextBlink = 2.5;
  let blinkStart = -1;
  const BLINK_DUR = 0.18;

  function blinkValue(t) {
    if (blinkStart < 0 && t >= nextBlink) {
      blinkStart = t;
    }
    if (blinkStart < 0) return 0;
    const p = (t - blinkStart) / BLINK_DUR;
    if (p >= 1) {
      blinkStart = -1;
      nextBlink = t + 3 + Math.random() * 3.5;
      return 0;
    }
    return Math.sin(p * Math.PI);
  }

  function crestPath(i, t) {
    const bx = 138 + i * 3.2;
    const by = 66 + i * 2.2;
    const tipX = 172 + i * 9 + Math.sin(t * 1.3 + i * 0.8) * 5;
    const tipY = 58 + i * 11 + Math.cos(t * 1.1 + i) * 3;
    const mx = (bx + tipX) / 2 + Math.sin(t * 1.7 + i) * 4;
    const my = (by + tipY) / 2 - 7 - i * 1.5;
    return `M${bx.toFixed(2)},${by.toFixed(2)} Q${mx.toFixed(2)},${my.toFixed(2)} ${tipX.toFixed(2)},${tipY.toFixed(2)}`;
  }

  let last = performance.now();
  let clock = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += reduced ? dt * 0.4 : dt;
    const t = clock;
    const nowSec = now / 1000;

    // when the pointer is idle, the monster wanders its gaze slowly
    const idle = nowSec - lastMove > 4;
    const wantX = idle ? 0.5 + 0.18 * Math.sin(t * 0.27) : tx;
    const wantY = idle ? 0.4 + 0.08 * Math.sin(t * 0.19 + 1) : ty;

    // ease toward target
    const k = 1 - Math.pow(0.001, dt);
    cx += (wantX - cx) * k;
    cy += (wantY - cy) * k;

    // head turns toward the visitor, with a small lunge when close to the pointer side
    headAngleT = (cx - 0.5) * 22 + (cy - 0.4) * -8;
    headAngle += (headAngleT - headAngle) * (1 - Math.pow(0.02, dt));
    const bob = Math.sin(t * 1.4) * 1.4;
    headG.setAttribute("transform",
      `translate(0 ${bob.toFixed(2)}) rotate(${headAngle.toFixed(2)} 130 92)`);

    // eyes track the visitor
    const targetPX = (cx - 0.5) * 4.5;
    const targetPY = (cy - 0.4) * 3;
    pupX += (targetPX - pupX) * (1 - Math.pow(0.01, dt));
    pupY += (targetPY - pupY) * (1 - Math.pow(0.01, dt));
    pupA.setAttribute("cx", (130 + pupX).toFixed(2));
    pupA.setAttribute("cy", (74 + pupY).toFixed(2));
    pupB.setAttribute("cx", (141 + pupX * 0.8).toFixed(2));
    pupB.setAttribute("cy", (80 + pupY * 0.8).toFixed(2));

    // blink
    const b = blinkValue(t);
    const lidH = 14 * b;
    lidA.setAttribute("y", (67).toFixed(2));
    lidA.setAttribute("height", (lidH * 0.8).toFixed(2));
    lidB.setAttribute("y", (73).toFixed(2));
    lidB.setAttribute("height", (lidH * 0.55).toFixed(2));

    // breathing body
    const s = 1 + 0.012 * Math.sin(t * 1.6);
    bodyG.setAttribute("transform",
      `translate(150 385) scale(1 ${s.toFixed(4)}) translate(-150 -385)`);

    // cloak wings sway
    cloakL.setAttribute("transform", `rotate(${(1.6 * Math.sin(t * 0.9)).toFixed(2)} 125 215)`);
    cloakR.setAttribute("transform", `rotate(${(-1.6 * Math.sin(t * 0.9 + 0.6)).toFixed(2)} 175 215)`);

    // ember pulse
    ember.setAttribute("opacity", (0.55 + 0.3 * Math.sin(t * 2.1) + 0.1 * Math.sin(t * 5.3)).toFixed(3));

    // crest strands
    for (let i = 0; i < strands.length; i++) {
      strands[i].setAttribute("d", crestPath(i, t));
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
  "title": "Marrow Heron",
  "statement": "Waits in flooded bogs at dusk. Wears your reflection. Never follow its lantern."
}
```