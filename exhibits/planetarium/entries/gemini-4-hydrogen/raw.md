```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>The Lantern Moth</title>
<style>
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #040712;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: pan-y;
  }
</style>
</head>
<body>
<canvas id="sky"></canvas>
<script>
(() => {
  'use strict';

  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Deterministic PRNG for consistent starfields across resizes
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  // Pre-rendered radial glow sprites for fast additive star bloom
  function makeGlowSprite(innerHex, midRgb, outerRgb) {
    const s = 64;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const g = c.getContext('2d');
    const r = s / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, innerHex);
    grad.addColorStop(0.14, `rgba(${midRgb}, 0.85)`);
    grad.addColorStop(0.38, `rgba(${outerRgb}, 0.24)`);
    grad.addColorStop(0.7, `rgba(${outerRgb}, 0.05)`);
    grad.addColorStop(1, `rgba(${outerRgb}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    return c;
  }

  const sprites = {
    ivory: makeGlowSprite('#ffffff', '224, 234, 255', '128, 166, 255'),
    blue:  makeGlowSprite('#f0f7ff', '165, 206, 255', '76, 132, 245'),
    gold:  makeGlowSprite('#fffbe8', '255, 212, 128', '245, 148, 52'),
    rose:  makeGlowSprite('#fff4f7', '245, 190, 212', '196, 110, 162'),
    teal:  makeGlowSprite('#effffc', '150, 238, 226', '68, 182, 194')
  };

  // Constellation definition in local moth space (head points toward -Y)
  // 0: head, 1: thorax, 2: abdomen, 3: tail
  // 4-5: antennae tips
  // 6-8: left forewing, 9-11: right forewing
  // 12-13: left hindwing, 14-15: right hindwing
  const MOTH_STARS = [
    { x:  0.00, y: -0.20, mag: 0.92, tint: 'ivory', wing: 0 }, // 0 head
    { x:  0.00, y: -0.06, mag: 1.05, tint: 'gold',  wing: 0 }, // 1 thorax (heart star)
    { x:  0.00, y:  0.09, mag: 0.84, tint: 'ivory', wing: 0 }, // 2 abdomen
    { x:  0.00, y:  0.24, mag: 0.78, tint: 'blue',  wing: 0 }, // 3 tail

    { x: -0.11, y: -0.36, mag: 0.72, tint: 'gold',  wing: 0 }, // 4 left antenna
    { x:  0.11, y: -0.36, mag: 0.72, tint: 'gold',  wing: 0 }, // 5 right antenna

    { x: -0.47, y: -0.22, mag: 1.08, tint: 'blue',  wing: -1 }, // 6 left forewing apex
    { x: -0.42, y:  0.02, mag: 0.86, tint: 'ivory', wing: -1 }, // 7 left forewing outer
    { x: -0.18, y:  0.03, mag: 0.80, tint: 'teal',  wing: -1 }, // 8 left forewing inner

    { x:  0.47, y: -0.22, mag: 1.08, tint: 'blue',  wing: 1 }, // 9 right forewing apex
    { x:  0.42, y:  0.02, mag: 0.86, tint: 'ivory', wing: 1 }, // 10 right forewing outer
    { x:  0.18, y:  0.03, mag: 0.80, tint: 'teal',  wing: 1 }, // 11 right forewing inner

    { x: -0.31, y:  0.19, mag: 0.90, tint: 'rose',  wing: -1 }, // 12 left hindwing outer
    { x: -0.12, y:  0.27, mag: 0.76, tint: 'ivory', wing: -1 }, // 13 left hindwing inner

    { x:  0.31, y:  0.19, mag: 0.90, tint: 'rose',  wing: 1 }, // 14 right hindwing outer
    { x:  0.12, y:  0.27, mag: 0.76, tint: 'ivory', wing: 1 }  // 15 right hindwing inner
  ];

  // Ordered groups for sequential constellation tracing
  const TRACE_SEGMENTS = [
    // Group 0: central spine & antennae
    { a: 1, b: 0, start: 0.00, end: 0.22 },
    { a: 1, b: 2, start: 0.04, end: 0.24 },
    { a: 2, b: 3, start: 0.16, end: 0.34 },
    { a: 0, b: 4, start: 0.18, end: 0.40 },
    { a: 0, b: 5, start: 0.18, end: 0.40 },
    // Group 1: forewings
    { a: 1, b: 6, start: 0.22, end: 0.50 },
    { a: 1, b: 9, start: 0.22, end: 0.50 },
    { a: 6, b: 7, start: 0.44, end: 0.68 },
    { a: 9, b: 10, start: 0.44, end: 0.68 },
    { a: 7, b: 8, start: 0.62, end: 0.80 },
    { a: 10, b: 11, start: 0.62, end: 0.80 },
    { a: 8, b: 1, start: 0.72, end: 0.88 },
    { a: 11, b: 1, start: 0.72, end: 0.88 },
    // Group 2: hindwings
    { a: 2, b: 12, start: 0.52, end: 0.76 },
    { a: 2, b: 14, start: 0.52, end: 0.76 },
    { a: 12, b: 13, start: 0.72, end: 0.92 },
    { a: 14, b: 15, start: 0.72, end: 0.92 },
    { a: 13, b: 3, start: 0.84, end: 1.00 },
    { a: 15, b: 3, start: 0.84, end: 1.00 }
  ];

  // Lantern star in local moth space (ahead along the flight axis)
  const LANTERN = { x: 0.0, y: -0.76 };

  // Placement of the moth system in normalized porthole coordinates (R = 1)
  const MOTH_CENTER = { x: -0.13, y: 0.13 };
  const MOTH_SCALE = 0.88;
  const MOTH_TILT = 0.66; // radians clockwise toward upper-right

  // Foreground twinkling field stars
  const FIELD_STARS = [];
  (function initFieldStars() {
    const rand = mulberry32(419283);
    const tints = ['ivory', 'ivory', 'blue', 'blue', 'gold', 'rose'];
    for (let i = 0; i < 105; i++) {
      // Uniform inside disk up to r = 1.05
      const r = Math.sqrt(rand()) * 1.04;
      const a = rand() * Math.PI * 2;
      FIELD_STARS.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        size: 0.35 + Math.pow(rand(), 2.2) * 0.95,
        baseAlpha: 0.25 + rand() * 0.65,
        speed: 0.8 + rand() * 2.4,
        phase: rand() * Math.PI * 2,
        tint: tints[Math.floor(rand() * tints.length)],
        depth: 0.35 + rand() * 0.65
      });
    }
  })();

  // Golden dust motes drifting from moth wings toward the Lantern Star
  const MAX_MOTES = 46;
  const motes = [];
  const moteRand = mulberry32(98231);
  for (let i = 0; i < MAX_MOTES; i++) {
    motes.push({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      age: 0,
      life: 1,
      size: 1,
      phase: 0
    });
  }

  function spawnMote(mx, my, boost) {
    for (let i = 0; i < MAX_MOTES; i++) {
      const m = motes[i];
      if (!m.active) {
        m.active = true;
        m.x = mx + (moteRand() - 0.5) * 0.06;
        m.y = my + (moteRand() - 0.5) * 0.06;
        m.vx = (moteRand() - 0.5) * 0.04;
        m.vy = -(0.08 + moteRand() * 0.11) * (boost ? 1.25 : 0.9);
        m.age = 0;
        m.life = 2.6 + moteRand() * 2.6;
        m.size = 0.55 + moteRand() * 0.95;
        m.phase = moteRand() * Math.PI * 2;
        return;
      }
    }
  }

  // Offscreen static deep sky (nebula + distant dust stars), rotated gently
  const skyOffscreen = document.createElement('canvas');
  let skySize = 0;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cx = 0;
  let cy = 0;
  let R = 100;

  // Gentle pointer parallax (never blocks touch scrolling)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  window.addEventListener('pointermove', (e) => {
    if (!width || !height) return;
    const nx = (e.clientX - cx) / R;
    const ny = (e.clientY - cy) / R;
    pointer.tx = clamp(nx, -1, 1);
    pointer.ty = clamp(ny, -1, 1);
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
  }, { passive: true });

  function buildDeepSky() {
    const dim = Math.max(256, Math.ceil(Math.min(width, height) * dpr * 1.48));
    skySize = dim;
    skyOffscreen.width = dim;
    skyOffscreen.height = dim;
    const g = skyOffscreen.getContext('2d');
    const half = dim / 2;

    // Midnight twilight gradient
    const bg = g.createRadialGradient(half * 0.9, half * 0.85, dim * 0.04, half, half, half);
    bg.addColorStop(0, '#0d1936');
    bg.addColorStop(0.45, '#081128');
    bg.addColorStop(0.82, '#050a1a');
    bg.addColorStop(1, '#030610');
    g.fillStyle = bg;
    g.fillRect(0, 0, dim, dim);

    const rand = mulberry32(77123);

    // Subtle Milky Way nebula clouds along a gentle diagonal
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) {
      const along = (rand() - 0.5) * 0.92;
      const across = (rand() - 0.5) * 0.34;
      const angle = -0.58;
      const px = half + (along * Math.cos(angle) - across * Math.sin(angle)) * dim * 0.52;
      const py = half + (along * Math.sin(angle) + across * Math.cos(angle)) * dim * 0.52;
      const rad = dim * (0.10 + rand() * 0.16);
      const neb = g.createRadialGradient(px, py, 0, px, py, rad);
      const huePick = rand();
      if (huePick < 0.45) {
        neb.addColorStop(0, 'rgba(46, 86, 156, 0.065)');
        neb.addColorStop(0.5, 'rgba(32, 58, 120, 0.025)');
      } else if (huePick < 0.8) {
        neb.addColorStop(0, 'rgba(72, 58, 138, 0.055)');
        neb.addColorStop(0.5, 'rgba(42, 34, 96, 0.02)');
      } else {
        neb.addColorStop(0, 'rgba(44, 118, 134, 0.05)');
        neb.addColorStop(0.5, 'rgba(24, 72, 94, 0.02)');
      }
      neb.addColorStop(1, 'rgba(0, 0, 0, 0)');
      g.fillStyle = neb;
      g.beginPath();
      g.arc(px, py, rad, 0, Math.PI * 2);
      g.fill();
    }

    // Distant micro-star dust baked into the deep sky
    for (let i = 0; i < 320; i++) {
      const r = Math.sqrt(rand()) * half * 0.96;
      const a = rand() * Math.PI * 2;
      const sx = half + Math.cos(a) * r;
      const sy = half + Math.sin(a) * r;
      const sr = (0.45 + rand() * 0.95) * (dim / 700);
      const alpha = 0.12 + rand() * 0.38;
      g.fillStyle = rand() > 0.25
        ? `rgba(210, 226, 255, ${alpha})`
        : `rgba(255, 228, 185, ${alpha * 0.9})`;
      g.beginPath();
      g.arc(sx, sy, Math.max(0.5, sr), 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function resize() {
    width = window.innerWidth || 300;
    height = window.innerHeight || 300;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    cx = width * 0.5;
    cy = height * 0.5;
    R = Math.min(width, height) * 0.5;
    buildDeepSky();
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Transform a local moth coordinate into canvas pixel coordinates
  function mothToScreen(lx, ly, skyRot, parallaxX, parallaxY) {
    const sx = lx * MOTH_SCALE;
    const sy = ly * MOTH_SCALE;
    const ct = Math.cos(MOTH_TILT);
    const st = Math.sin(MOTH_TILT);
    const nx = MOTH_CENTER.x + (sx * ct - sy * st);
    const ny = MOTH_CENTER.y + (sx * st + sy * ct);

    const cs = Math.cos(skyRot);
    const ss = Math.sin(skyRot);
    const rx = nx * cs - ny * ss;
    const ry = nx * ss + ny * cs;

    return {
      x: cx + (rx + parallaxX) * R,
      y: cy + (ry + parallaxY) * R
    };
  }

  // Draw a glowing star with sprite bloom and optional 4-point diffraction spikes
  function drawStar(x, y, radiusPx, alpha, tint, spikes) {
    if (alpha <= 0.01) return;
    const sprite = sprites[tint] || sprites.ivory;
    const bloom = radiusPx * 7.5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.drawImage(sprite, x - bloom, y - bloom, bloom * 2, bloom * 2);

    if (spikes > 0) {
      const len = radiusPx * spikes;
      ctx.strokeStyle = tint === 'gold'
        ? `rgba(255, 234, 178, ${alpha * 0.58})`
        : `rgba(220, 236, 255, ${alpha * 0.48})`;
      ctx.lineWidth = Math.max(0.6, radiusPx * 0.35);
      ctx.beginPath();
      ctx.moveTo(x - len, y);
      ctx.lineTo(x + len, y);
      ctx.moveTo(x, y - len);
      ctx.lineTo(x, y + len);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Compute wing-flapping deformation for a star during the Living Myth phase
  function deformedStar(star, flap) {
    if (star.wing === 0 || flap === 0) {
      return { x: star.x, y: star.y };
    }
    const dist = Math.abs(star.x);
    const xPull = 1 - 0.17 * flap * (0.45 + dist);
    const yLift = -0.045 * flap * (0.3 + dist * 1.4);
    return {
      x: star.x * xPull,
      y: star.y + yLift
    };
  }

  // Draw translucent gossamer moth wings and filigree when aura > 0
  function drawGossamerMoth(aura, flap, skyRot, px, py, time) {
    if (aura <= 0.005) return;

    const pt = (lx, ly, wingSide) => {
      const d = deformedStar({ x: lx, y: ly, wing: wingSide }, flap);
      return mothToScreen(d.x, d.y, skyRot, px, py);
    };

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const side of [-1, 1]) {
      const pThorax = pt(0, -0.06, 0);
      const pAbdom = pt(0, 0.09, 0);
      const pTail = pt(0, 0.23, 0);

      const pApex = pt(side * 0.47, -0.22, side);
      const pOuter = pt(side * 0.42, 0.02, side);
      const pInner = pt(side * 0.18, 0.03, side);
      const pHindOuter = pt(side * 0.31, 0.19, side);
      const pHindInner = pt(side * 0.12, 0.27, side);

      // Forewing gossamer membrane
      const fwGrad = ctx.createLinearGradient(pThorax.x, pThorax.y, pApex.x, pApex.y);
      fwGrad.addColorStop(0, `rgba(74, 178, 198, ${0.22 * aura})`);
      fwGrad.addColorStop(0.55, `rgba(116, 128, 224, ${0.18 * aura})`);
      fwGrad.addColorStop(1, `rgba(255, 206, 126, ${0.26 * aura})`);

      ctx.fillStyle = fwGrad;
      ctx.beginPath();
      ctx.moveTo(pThorax.x, pThorax.y);
      const cLead = pt(side * 0.25, -0.21, side);
      ctx.quadraticCurveTo(cLead.x, cLead.y, pApex.x, pApex.y);
      const cMargin = pt(side * 0.48, -0.09, side);
      ctx.quadraticCurveTo(cMargin.x, cMargin.y, pOuter.x, pOuter.y);
      const cBottom = pt(side * 0.30, 0.05, side);
      ctx.quadraticCurveTo(cBottom.x, cBottom.y, pInner.x, pInner.y);
      ctx.closePath();
      ctx.fill();

      // Warm golden rim-light on leading edge facing the Lantern Star
      ctx.strokeStyle = `rgba(255, 214, 138, ${0.38 * aura})`;
      ctx.lineWidth = Math.max(0.8, R * 0.0045);
      ctx.beginPath();
      ctx.moveTo(pThorax.x, pThorax.y);
      ctx.quadraticCurveTo(cLead.x, cLead.y, pApex.x, pApex.y);
      ctx.stroke();

      // Delicate internal wing veins
      ctx.strokeStyle = `rgba(168, 224, 245, ${0.19 * aura})`;
      ctx.lineWidth = Math.max(0.5, R * 0.0022);
      const veins = [
        [0.37, -0.14],
        [0.38, -0.05],
        [0.29, 0.00]
      ];
      for (const [vx, vy] of veins) {
        const pv = pt(side * vx, vy, side);
        const pm = pt(side * vx * 0.52, lerp(-0.06, vy, 0.45) - 0.02, side);
        ctx.beginPath();
        ctx.moveTo(pThorax.x, pThorax.y);
        ctx.quadraticCurveTo(pm.x, pm.y, pv.x, pv.y);
        ctx.stroke();
      }

      // Hindwing gossamer membrane
      const hwGrad = ctx.createRadialGradient(
        pAbdom.x, pAbdom.y, R * 0.02,
        pHindOuter.x, pHindOuter.y, R * 0.28
      );
      hwGrad.addColorStop(0, `rgba(98, 126, 218, ${0.20 * aura})`);
      hwGrad.addColorStop(0.65, `rgba(182, 128, 206, ${0.16 * aura})`);
      hwGrad.addColorStop(1, `rgba(255, 194, 146, ${0.20 * aura})`);

      ctx.fillStyle = hwGrad;
      ctx.beginPath();
      ctx.moveTo(pAbdom.x, pAbdom.y);
      const cHindTop = pt(side * 0.20, 0.08, side);
      ctx.quadraticCurveTo(cHindTop.x, cHindTop.y, pHindOuter.x, pHindOuter.y);
      const cHindEdge = pt(side * 0.24, 0.26, side);
      ctx.quadraticCurveTo(cHindEdge.x, cHindEdge.y, pHindInner.x, pHindInner.y);
      ctx.lineTo(pTail.x, pTail.y);
      ctx.closePath();
      ctx.fill();

      // Luminous crescent eyespots (ocelli) on wings
      const eyePulse = 0.78 + 0.22 * Math.sin(time * 2.4 + side);
      const foreEye = pt(side * 0.28, -0.08, side);
      const hindEye = pt(side * 0.17, 0.16, side);
      drawStar(foreEye.x, foreEye.y, Math.max(1.2, R * 0.0085), 0.55 * aura * eyePulse, 'gold', 0);
      drawStar(hindEye.x, hindEye.y, Math.max(1.0, R * 0.0072), 0.45 * aura * eyePulse, 'teal', 0);

      // Curved feathery antennae glow
      const pHead = pt(0, -0.20, 0);
      const pAnt = pt(side * 0.11, -0.36, 0);
      const pAntCtrl = pt(side * 0.03, -0.31, 0);
      ctx.strokeStyle = `rgba(255, 224, 165, ${0.42 * aura})`;
      ctx.lineWidth = Math.max(0.7, R * 0.003);
      ctx.beginPath();
      ctx.moveTo(pHead.x, pHead.y);
      ctx.quadraticCurveTo(pAntCtrl.x, pAntCtrl.y, pAnt.x, pAnt.y);
      ctx.stroke();
    }

    // Soft velvet body glow along spine
    const pHead = pt(0, -0.20, 0);
    const pTail = pt(0, 0.24, 0);
    const bodyGrad = ctx.createLinearGradient(pHead.x, pHead.y, pTail.x, pTail.y);
    bodyGrad.addColorStop(0, `rgba(255, 232, 185, ${0.42 * aura})`);
    bodyGrad.addColorStop(0.5, `rgba(190, 225, 255, ${0.30 * aura})`);
    bodyGrad.addColorStop(1, `rgba(130, 170, 240, ${0.15 * aura})`);
    ctx.strokeStyle = bodyGrad;
    ctx.lineWidth = Math.max(2.0, R * 0.015);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pHead.x, pHead.y);
    ctx.lineTo(pTail.x, pTail.y);
    ctx.stroke();

    ctx.restore();
  }

  let lastTime = performance.now();
  let lastMoteSpawn = 0;
  const CYCLE = 20.0; // seconds per full myth cycle

  function render(now) {
    requestAnimationFrame(render);
    const dt = Math.min(0.05, (now - lastTime) * 0.001);
    lastTime = now;
    const elapsed = now * 0.001;

    // Smooth pointer parallax
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4.5);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4.5);

    // Very calm, continuous celestial rotation around the porthole center
    const skyRot = elapsed * 0.016;

    // Cycle phases (start slightly into the cycle so first glance is engaging)
    const t = (elapsed + 1.8) % CYCLE;

    // Line trace: unfurls 2.0s..6.2s, holds until 14.8s, gently retracts 14.8s..18.2s
    let trace = 0;
    let retract = 0;
    if (t >= 2.0 && t < 6.2) {
      trace = smoothstep(2.0, 6.2, t);
    } else if (t >= 6.2 && t < 14.8) {
      trace = 1;
    } else if (t >= 14.8 && t < 18.2) {
      trace = 1;
      retract = smoothstep(14.8, 18.2, t);
    }

    // Gossamer living aura: blooms 6.0s..15.2s
    let aura = 0;
    if (t >= 6.0 && t <= 15.2) {
      const fadeIn = smoothstep(6.0, 8.2, t);
      const fadeOut = 1 - smoothstep(12.8, 15.2, t);
      aura = fadeIn * fadeOut;
    }

    // Two slow, dreamy wingbeats while awake
    let flap = 0;
    if (aura > 0.01) {
      const wingPhase = (t - 6.0) / 9.2;
      flap = Math.sin(wingPhase * Math.PI * 4) * 0.5 + 0.5;
      flap *= aura;
    }

    // Constellation star wake-up brightness
    const wake = Math.max(trace * (1 - retract) * 0.6, aura);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Draw slowly rotating pre-rendered deep sky & nebula
    ctx.save();
    ctx.translate(cx - pointer.x * R * 0.012, cy - pointer.y * R * 0.012);
    ctx.rotate(skyRot * 0.85);
    const drawDim = skySize / dpr;
    ctx.drawImage(skyOffscreen, -drawDim / 2, -drawDim / 2, drawDim, drawDim);
    ctx.restore();

    // 2. Twinkling field stars
    const pxFg = -pointer.x * 0.022;
    const pyFg = -pointer.y * 0.022;
    const cs = Math.cos(skyRot);
    const ss = Math.sin(skyRot);
    for (let i = 0; i < FIELD_STARS.length; i++) {
      const s = FIELD_STARS[i];
      const rx = s.x * cs - s.y * ss;
      const ry = s.x * ss + s.y * cs;
      const sx = cx + (rx + pxFg * s.depth) * R;
      const sy = cy + (ry + pyFg * s.depth) * R;
      const tw = 0.62 + 0.38 * Math.sin(elapsed * s.speed + s.phase);
      const rPx = Math.max(0.75, R * 0.0042 * s.size);
      drawStar(sx, sy, rPx, s.baseAlpha * tw, s.tint, s.size > 1.15 ? 4.2 : 0);
    }

    // 3. Lantern Star (warm beacon ahead of the moth)
    const lanternPos = mothToScreen(LANTERN.x, LANTERN.y, skyRot, pxFg, pyFg);
    const lanternPulse = 0.86 + 0.14 * Math.sin(elapsed * 2.1) + 0.25 * aura;
    const lanternRadius = Math.max(2.0, R * 0.0115);

    // Soft warm atmospheric halo around the Lantern Star
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const coronaR = R * (0.16 + 0.04 * aura);
    const corona = ctx.createRadialGradient(
      lanternPos.x, lanternPos.y, 0,
      lanternPos.x, lanternPos.y, coronaR
    );
    corona.addColorStop(0, `rgba(255, 220, 140, ${0.26 * lanternPulse})`);
    corona.addColorStop(0.35, `rgba(255, 165, 68, ${0.10 * lanternPulse})`);
    corona.addColorStop(1, 'rgba(255, 130, 40, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(lanternPos.x, lanternPos.y, coronaR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawStar(lanternPos.x, lanternPos.y, lanternRadius, 0.95 * lanternPulse, 'gold', 6.5 + aura * 2.5);

    // 4. Spawn & update golden star-motes drifting from wings toward the Lantern Star
    const spawnInterval = aura > 0.15 ? 0.11 : 0.55;
    if (elapsed - lastMoteSpawn > spawnInterval) {
      lastMoteSpawn = elapsed;
      const pick = MOTH_STARS[Math.floor(moteRand() * MOTH_STARS.length)];
      const dPick = deformedStar(pick, flap);
      spawnMote(dPick.x, dPick.y, aura > 0.2);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < MAX_MOTES; i++) {
      const m = motes[i];
      if (!m.active) continue;
      m.age += dt;
      if (m.age >= m.life) {
        m.active = false;
        continue;
      }
      const p = m.age / m.life;
      // Gentle pull toward Lantern Star in local moth space
      const toLanternX = LANTERN.x - m.x;
      const toLanternY = LANTERN.y - m.y;
      m.vx += toLanternX * dt * 0.10 + Math.sin(elapsed * 2.5 + m.phase) * dt * 0.03;
      m.vy += toLanternY * dt * 0.10;
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      const fade = Math.sin(p * Math.PI);
      const mp = mothToScreen(m.x, m.y, skyRot, pxFg, pyFg);
      const mr = Math.max(0.7, R * 0.0038 * m.size);
      const alpha = fade * (0.45 + 0.45 * aura);
      const bloom = mr * 5.2;
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.drawImage(sprites.gold, mp.x - bloom, mp.y - bloom, bloom * 2, bloom * 2);
    }
    ctx.restore();

    // 5. Compute current constellation star screen positions (with subtle wingbeat)
    const starPts = new Array(MOTH_STARS.length);
    for (let i = 0; i < MOTH_STARS.length; i++) {
      const st = MOTH_STARS[i];
      const def = deformedStar(st, flap);
      starPts[i] = mothToScreen(def.x, def.y, skyRot, pxFg, pyFg);
    }

    // 6. Gossamer wings & myth manifestation
    drawGossamerMoth(aura, flap, skyRot, pxFg, pyFg, elapsed);

    // 7. Constellation lines & flight-path whisper toward the Lantern
    if (trace > 0 && retract < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const lineAlpha = (1 - retract) * (0.58 + 0.28 * aura);
      ctx.lineWidth = Math.max(0.85, R * 0.0036);

      for (let i = 0; i < TRACE_SEGMENTS.length; i++) {
        const seg = TRACE_SEGMENTS[i];
        const segProg = clamp((trace - seg.start) / (seg.end - seg.start), 0, 1);
        if (segProg <= 0) continue;

        const pA = starPts[seg.a];
        const pB = starPts[seg.b];
        const curX = lerp(pA.x, pB.x, segProg);
        const curY = lerp(pA.y, pB.y, segProg);

        // Retract softly from the outer tip inward
        const startFrac = retract * 0.9;
        const sx = lerp(pA.x, curX, startFrac);
        const sy = lerp(pA.y, curY, startFrac);

        const lineGrad = ctx.createLinearGradient(sx, sy, curX, curY);
        lineGrad.addColorStop(0, `rgba(176, 214, 255, ${lineAlpha * 0.72})`);
        lineGrad.addColorStop(1, `rgba(255, 224, 166, ${lineAlpha})`);
        ctx.strokeStyle = lineGrad;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Spark at the tracing comet-tip while drawing
        if (segProg > 0.02 && segProg < 0.98 && retract === 0) {
          drawStar(curX, curY, Math.max(1.0, R * 0.0055), 0.85, 'gold', 0);
        }
      }

      // Faint dotted golden flight-arc reaching from head toward Lantern Star
      const arcProg = clamp((trace - 0.55) / 0.45, 0, 1) * (1 - retract);
      if (arcProg > 0.02) {
        const pHead = starPts[0];
        const pMid = mothToScreen(0.05, -0.44, skyRot, pxFg, pyFg);
        const pStop = mothToScreen(0.0, -0.63, skyRot, pxFg, pyFg);
        ctx.strokeStyle = `rgba(255, 214, 138, ${0.28 * arcProg * (0.6 + 0.4 * aura)})`;
        ctx.lineWidth = Math.max(0.7, R * 0.0026);
        ctx.setLineDash([Math.max(2, R * 0.012), Math.max(3, R * 0.022)]);
        ctx.lineDashOffset = -elapsed * R * 0.04;
        ctx.beginPath();
        ctx.moveTo(pHead.x, pHead.y);
        ctx.quadraticCurveTo(pMid.x, pMid.y, pStop.x, pStop.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // 8. Constellation anchor stars (always visible, brightening during reveal)
    for (let i = 0; i < MOTH_STARS.length; i++) {
      const st = MOTH_STARS[i];
      const p = starPts[i];
      const tw = 0.84 + 0.16 * Math.sin(elapsed * 1.9 + i * 1.3);
      const radiusPx = Math.max(1.3, R * 0.0068 * st.mag * (1 + 0.25 * wake));
      const alpha = (0.72 + 0.28 * wake) * tw;
      const spikes = st.mag >= 1.0 ? 4.8 + wake * 2.2 : (wake > 0.35 ? 3.2 * wake : 0);
      drawStar(p.x, p.y, radiusPx, alpha, st.tint, spikes);
    }
  }

  requestAnimationFrame(render);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Lantern Moth",
  "statement": "Born from a stray spark of the first hearthfire, she climbs the midnight sky toward an unreachable golden star. Whenever she nears its warmth, her gossamer wings catch the glow and scatter new constellations into the dark."
}
```