```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FungArIum Specimen</title>
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
    background: #070812;
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
<canvas id="scene"></canvas>
<script>
(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Deterministic PRNG for procedural botanical & mineral detail
  function mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(847291);
  const range = (min, max) => min + rand() * (max - min);

  // Pre-rendered optical glow stamps for smooth performance
  function makeGlowSprite(r, g, b) {
    const size = 64;
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    const half = size / 2;
    const grad = octx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0.0, `rgba(255, 255, 255, 0.95)`);
    grad.addColorStop(0.16, `rgba(${r}, ${g}, ${b}, 0.78)`);
    grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.22)`);
    grad.addColorStop(1.0, `rgba(${r}, ${g}, ${b}, 0)`);
    octx.fillStyle = grad;
    octx.fillRect(0, 0, size, size);
    return off;
  }

  const glows = {
    gold: makeGlowSprite(255, 206, 108),
    cyan: makeGlowSprite(110, 236, 255),
    violet: makeGlowSprite(216, 128, 255),
    amber: makeGlowSprite(255, 160, 82)
  };

  function drawGlow(sprite, x, y, radius, alpha) {
    if (alpha <= 0.005 || radius <= 0.2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  }

  // Viewport state (virtual 600x800 portrait scene, smoothly extended to edges)
  let vw = 600, vh = 800, dpr = 1;
  let scale = 1, offsetX = 0, offsetY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(vw * dpr));
    canvas.height = Math.max(1, Math.floor(vh * dpr));
    scale = Math.min(vw / 600, vh / 800);
    offsetX = (vw - 600 * scale) * 0.5;
    offsetY = vh - 800 * scale;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Subtle passive pointer tracking
  const pointer = {
    active: false,
    x: 300,
    y: 350,
    tx: 300,
    ty: 350,
    strength: 0
  };

  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX - offsetX) / scale;
    pointer.ty = (e.clientY - offsetY) / scale;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, { passive: true });

  // Background ambient bokeh motes
  const bgMotes = Array.from({ length: 34 }, () => ({
    x: range(-180, 780),
    y: range(-160, 680),
    r: range(6, 28),
    phase: range(0, Math.PI * 2),
    speed: range(0.2, 0.55),
    drift: range(6, 20),
    tint: rand() > 0.45 ? 'violet' : 'cyan',
    alpha: range(0.03, 0.09)
  }));

  // Misty background silhouettes (distant miniature cup-fungi & fern curls)
  const bgFlora = [
    { x: 112, y: 676, h: 68, lean: -18, curl: -1 },
    { x: 142, y: 684, h: 46, lean: -8, curl: 1 },
    { x: 472, y: 678, h: 74, lean: 22, curl: 1 },
    { x: 504, y: 690, h: 48, lean: 14, curl: -1 }
  ];

  // Meteorite fragment facets
  const rockPoly = [
    { x: 145, y: 745 },
    { x: 168, y: 678 },
    { x: 222, y: 642 },
    { x: 305, y: 632 },
    { x: 382, y: 646 },
    { x: 438, y: 685 },
    { x: 462, y: 748 }
  ];

  const rockFacets = [
    [{ x: 168, y: 678 }, { x: 222, y: 642 }, { x: 256, y: 684 }, { x: 198, y: 712 }],
    [{ x: 222, y: 642 }, { x: 305, y: 632 }, { x: 318, y: 674 }, { x: 256, y: 684 }],
    [{ x: 305, y: 632 }, { x: 382, y: 646 }, { x: 365, y: 694 }, { x: 318, y: 674 }],
    [{ x: 382, y: 646 }, { x: 438, y: 685 }, { x: 412, y: 726 }, { x: 365, y: 694 }]
  ];

  // Crystalline meteorite flecks
  const meteorFlecks = Array.from({ length: 42 }, () => ({
    x: range(175, 430),
    y: range(646, 735),
    s: range(0.8, 2.2),
    phase: range(0, Math.PI * 2)
  }));

  // Bioluminescent mycelium network across stone, brass ring, and soil
  function buildMycelium() {
    const branches = [];
    const roots = [
      { x: 298, y: 650, ang: Math.PI * 0.72, len: 115, depth: 3 },
      { x: 302, y: 650, ang: Math.PI * 0.52, len: 105, depth: 3 },
      { x: 306, y: 652, ang: Math.PI * 0.28, len: 120, depth: 3 },
      { x: 226, y: 668, ang: Math.PI * 0.80, len: 88, depth: 2 },
      { x: 378, y: 672, ang: Math.PI * 0.20, len: 92, depth: 2 }
    ];

    function grow(x, y, ang, len, depth, delay) {
      const steps = 6;
      const pts = [{ x, y }];
      let cx = x, cy = y, cang = ang;
      const seg = len / steps;
      for (let i = 0; i < steps; i++) {
        cang += range(-0.28, 0.28);
        cx += Math.cos(cang) * seg;
        cy += Math.sin(cang) * seg * 0.62;
        pts.push({ x: cx, y: cy });
      }
      branches.push({ pts, width: depth * 0.65 + 0.35, delay, depth });
      if (depth > 1) {
        const splitIdx = 3;
        const sp = pts[splitIdx];
        grow(sp.x, sp.y, cang - range(0.35, 0.7), len * 0.62, depth - 1, delay + 0.35);
        if (rand() > 0.25) {
          grow(sp.x, sp.y, cang + range(0.35, 0.7), len * 0.58, depth - 1, delay + 0.5);
        }
      }
    }

    roots.forEach((r, idx) => grow(r.x, r.y, r.ang, r.len, r.depth, idx * 0.25));
    return branches;
  }
  const mycelium = buildMycelium();

  // Velvet moss cushions and tufts
  const mossMounds = [
    { x: 110, y: 736, rx: 95, ry: 34, c1: '#11302b', c2: '#1f5444' },
    { x: 225, y: 688, rx: 68, ry: 26, c1: '#143830', c2: '#296b52' },
    { x: 304, y: 668, rx: 58, ry: 22, c1: '#174036', c2: '#33805e' },
    { x: 392, y: 696, rx: 72, ry: 27, c1: '#13352e', c2: '#27654d' },
    { x: 495, y: 738, rx: 105, ry: 36, c1: '#0f2b27', c2: '#1b4a3c' },
    { x: 295, y: 738, rx: 135, ry: 38, c1: '#0d2623', c2: '#1d4d3e' }
  ];

  const mossTufts = [];
  mossMounds.forEach((m) => {
    const count = Math.floor(m.rx * 0.95);
    for (let i = 0; i < count; i++) {
      const a = range(Math.PI, Math.PI * 2);
      const rFrac = range(0.15, 1.02);
      const tx = m.x + Math.cos(a) * m.rx * rFrac;
      const ty = m.y + Math.sin(a) * m.ry * rFrac + range(-4, 6);
      const distCenter = Math.abs(tx - 300);
      const lit = Math.max(0, 1 - distCenter / 185);
      mossTufts.push({
        x: tx,
        y: ty,
        h: range(4, 11),
        spread: range(2.2, 5.2),
        lit,
        hueShift: range(-10, 14)
      });
    }
  });
  mossTufts.sort((a, b) => a.y - b.y);

  // Tiny glowing primordial pins in the moss
  const mossPins = [
    { x: 196, y: 680, h: 13, lean: -3, phase: 0.4 },
    { x: 256, y: 664, h: 16, lean: -2, phase: 1.7 },
    { x: 344, y: 666, h: 14, lean: 3, phase: 2.9 },
    { x: 360, y: 673, h: 10, lean: 4, phase: 4.1 },
    { x: 422, y: 692, h: 12, lean: 5, phase: 5.2 }
  ];

  // Three specimens of the Twilight Orrery Parasol
  function createMushroomSpecs() {
    const specs = [
      // Left leaning secondary specimen
      {
        id: 'left',
        baseX: 252, baseY: 666,
        ctrl1X: 222, ctrl1Y: 560,
        ctrl2X: 162, ctrl2Y: 455,
        capX: 192, capY: 365,
        baseWidth: 15, neckWidth: 6.5,
        rx: 76, ry: 27, domeH: 54,
        baseTilt: -0.21,
        swayFreq: 0.62, swayPhase: 1.3, swayAmp: 8,
        gillCount: 34,
        ringPos: 0.58,
        isBud: false,
        spots: [],
        orbits: [
          { radius: 0.46, drop: 11, speed: 0.48, count: 5, size: 3.1, tint: 'gold' },
          { radius: 0.78, drop: 18, speed: -0.31, count: 7, size: 2.5, tint: 'cyan' }
        ]
      },
      // Central grand specimen
      {
        id: 'main',
        baseX: 302, baseY: 658,
        ctrl1X: 326, ctrl1Y: 510,
        ctrl2X: 268, ctrl2Y: 365,
        capX: 306, capY: 238,
        baseWidth: 21, neckWidth: 9.0,
        rx: 118, ry: 41, domeH: 82,
        baseTilt: 0.06,
        swayFreq: 0.48, swayPhase: 0.0, swayAmp: 10,
        gillCount: 46,
        ringPos: 0.55,
        isBud: false,
        spots: [],
        orbits: [
          { radius: 0.42, drop: 15, speed: 0.42, count: 6, size: 3.8, tint: 'gold' },
          { radius: 0.76, drop: 25, speed: -0.26, count: 9, size: 3.0, tint: 'cyan' }
        ]
      },
      // Right lantern bud specimen
      {
        id: 'bud',
        baseX: 346, baseY: 668,
        ctrl1X: 374, ctrl1Y: 605,
        ctrl2X: 418, ctrl2Y: 545,
        capX: 414, capY: 482,
        baseWidth: 13, neckWidth: 6.0,
        rx: 42, ry: 15, domeH: 52,
        baseTilt: 0.24,
        swayFreq: 0.76, swayPhase: 2.6, swayAmp: 6,
        gillCount: 22,
        ringPos: 0.62,
        isBud: true,
        spots: [],
        orbits: [
          { radius: 0.56, drop: 10, speed: 0.58, count: 5, size: 2.4, tint: 'gold' }
        ]
      }
    ];

    // Populate star-speckles across each translucent dome
    specs.forEach((m) => {
      const n = m.isBud ? 18 : 36;
      for (let i = 0; i < n; i++) {
        // u: horizontal angle across dome (-1..1), v: elevation (0.08..0.92)
        const u = range(-0.88, 0.88);
        const v = Math.pow(rand(), 0.75) * 0.85 + 0.08;
        m.spots.push({
          u,
          v,
          r: range(0.9, 2.5) * (m.rx / 95),
          phase: range(0, Math.PI * 2),
          cyan: rand() > 0.6
        });
      }
    });

    return specs;
  }

  const mushrooms = createMushroomSpecs();

  // Rising constellation spores
  const MAX_SPORES = 58;
  const spores = [];

  function spawnSpore(initialRandomY = false) {
    // Pick an emitter mushroom weighted toward main and left
    const r = rand();
    const m = r < 0.58 ? mushrooms[1] : (r < 0.88 ? mushrooms[0] : mushrooms[2]);
    const angle = range(0, Math.PI * 2);
    const rad = range(0.25, 0.85);
    const sx = m.capX + Math.cos(angle) * m.rx * rad;
    const sy = initialRandomY ? range(-80, 620) : m.capY + Math.sin(angle) * m.ry * rad + range(4, 20);
    const tints = ['gold', 'cyan', 'violet'];
    const tint = tints[Math.floor(rand() * tints.length)];

    return {
      x: sx,
      y: sy,
      vx: range(-5, 5),
      vy: range(-14, -29),
      size: range(1.3, 3.1),
      depth: range(0.55, 1.15),
      phase: range(0, Math.PI * 2),
      wobbleFreq: range(0.6, 1.4),
      wobbleAmp: range(6, 18),
      life: initialRandomY ? range(0.1, 0.9) : 0,
      maxLife: range(11, 20),
      star: rand() > 0.45,
      tint
    };
  }

  for (let i = 0; i < MAX_SPORES; i++) {
    spores.push(spawnSpore(true));
  }

  // Cubic Bezier evaluation & derivative
  function bezierPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
      x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
    };
  }

  function bezierTangent(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const dx = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
    const dy = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function drawBackground(time) {
    // Deep nocturnal cavern / glass-case interior gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, vh);
    bgGrad.addColorStop(0.0, '#05060f');
    bgGrad.addColorStop(0.45, '#0b0e20');
    bgGrad.addColorStop(0.78, '#131328');
    bgGrad.addColorStop(1.0, '#090b12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, vw, vh);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Subtle atmospheric radial glow behind the main cluster
    const aura = ctx.createRadialGradient(295, 340, 20, 295, 380, 390);
    aura.addColorStop(0.0, 'rgba(64, 52, 128, 0.24)');
    aura.addColorStop(0.45, 'rgba(32, 54, 96, 0.12)');
    aura.addColorStop(1.0, 'rgba(8, 10, 22, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(-350, -250, 1300, 1100);

    // Soft out-of-focus bokeh motes
    for (let i = 0; i < bgMotes.length; i++) {
      const b = bgMotes[i];
      const bx = b.x + Math.sin(time * b.speed + b.phase) * b.drift;
      const by = b.y + Math.cos(time * b.speed * 0.8 + b.phase) * (b.drift * 0.6);
      const pulse = 0.65 + 0.35 * Math.sin(time * 0.9 + b.phase);
      drawGlow(glows[b.tint], bx, by, b.r, b.alpha * pulse);
    }

    // Distant misty fern fiddleheads
    ctx.strokeStyle = 'rgba(20, 38, 48, 0.55)';
    ctx.lineCap = 'round';
    bgFlora.forEach((f, idx) => {
      const sway = Math.sin(time * 0.5 + idx) * 3;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      const topX = f.x + f.lean + sway;
      const topY = f.y - f.h;
      ctx.quadraticCurveTo(f.x + f.lean * 0.3, f.y - f.h * 0.6, topX, topY);
      // Spiral fiddlehead tip
      const dir = f.curl;
      ctx.arc(topX + dir * 6, topY + 2, 6, dir > 0 ? Math.PI : 0, dir > 0 ? Math.PI * 2.6 : -Math.PI * 1.6, dir < 0);
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawBrassAstrolabe(time) {
    // Half-sunken antique astronomical brass arc & gear nestled in the meteorite
    ctx.save();
    ctx.translate(296, 688);
    ctx.rotate(-0.24);

    // Outer tarnished brass ring arc (only upper-left / upper-right visible above stone/moss)
    const rOuter = 112;
    const rInner = 97;

    const brassGrad = ctx.createLinearGradient(-rOuter, -rOuter, rOuter, 20);
    brassGrad.addColorStop(0.0, '#4a3d28');
    brassGrad.addColorStop(0.32, '#9e824c');
    brassGrad.addColorStop(0.55, '#594c36');
    brassGrad.addColorStop(0.82, '#b89858');
    brassGrad.addColorStop(1.0, '#362d1e');

    ctx.beginPath();
    ctx.arc(0, 0, rOuter, Math.PI * 1.06, Math.PI * 1.94);
    ctx.arc(0, 0, rInner, Math.PI * 1.94, Math.PI * 1.06, true);
    ctx.closePath();
    ctx.fillStyle = brassGrad;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 224, 150, 0.32)';
    ctx.stroke();

    // Geometric degree notches along the ring (purely geometric lines, zero text)
    ctx.strokeStyle = 'rgba(32, 24, 14, 0.72)';
    for (let i = 0; i <= 32; i++) {
      const a = Math.PI * (1.08 + (i / 32) * 0.84);
      const major = i % 4 === 0;
      const r1 = major ? rInner + 1 : rInner + 5;
      const r2 = rOuter - 2;
      ctx.lineWidth = major ? 1.3 : 0.75;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }

    // Inner delicate armillary crossbar & slow-ticking balance wheel
    ctx.save();
    ctx.translate(-52, -56);
    ctx.rotate(time * 0.08);
    const wheelR = 24;
    ctx.strokeStyle = '#8b7243';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    // Tiny gear teeth
    ctx.fillStyle = '#755f37';
    for (let t = 0; t < 16; t++) {
      const ga = (t / 16) * Math.PI * 2;
      ctx.save();
      ctx.rotate(ga);
      ctx.fillRect(wheelR - 0.5, -1.5, 3.5, 3);
      ctx.restore();
    }

    // Spokes
    ctx.lineWidth = 1.4;
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sa) * -wheelR, Math.sin(sa) * -wheelR);
      ctx.lineTo(Math.cos(sa) * wheelR, Math.sin(sa) * wheelR);
      ctx.stroke();
    }
    ctx.restore();

    // Verdigris patina accents on brass
    ctx.fillStyle = 'rgba(54, 138, 122, 0.26)';
    ctx.beginPath();
    ctx.arc(-82, -56, 9, 0, Math.PI * 2);
    ctx.arc(76, -62, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawSubstrate(time) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Wide dark forest humus base extending seamlessly across any aspect ratio
    const soilGrad = ctx.createLinearGradient(300, 675, 300, 840);
    soilGrad.addColorStop(0.0, '#121824');
    soilGrad.addColorStop(0.35, '#0c1018');
    soilGrad.addColorStop(1.0, '#05060b');
    ctx.fillStyle = soilGrad;
    ctx.beginPath();
    ctx.moveTo(-500, 850);
    ctx.lineTo(-500, 742);
    ctx.quadraticCurveTo(-120, 706, 120, 722);
    ctx.quadraticCurveTo(300, 695, 480, 724);
    ctx.quadraticCurveTo(720, 708, 1100, 744);
    ctx.lineTo(1100, 850);
    ctx.closePath();
    ctx.fill();

    // Sunken brass astrolabe arc behind the front meteorite facets
    drawBrassAstrolabe(time);

    // Meteorite stone body
    ctx.beginPath();
    rockPoly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    const rockGrad = ctx.createLinearGradient(200, 630, 380, 750);
    rockGrad.addColorStop(0.0, '#262d42');
    rockGrad.addColorStop(0.5, '#181c2b');
    rockGrad.addColorStop(1.0, '#0d0f18');
    ctx.fillStyle = rockGrad;
    ctx.fill();

    // Crystalline iron-nickel facets
    const facetColors = [
      'rgba(58, 72, 104, 0.38)',
      'rgba(44, 54, 82, 0.42)',
      'rgba(30, 38, 62, 0.45)',
      'rgba(22, 26, 44, 0.5)'
    ];
    rockFacets.forEach((f, idx) => {
      ctx.beginPath();
      f.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = facetColors[idx];
      ctx.fill();
      ctx.strokeStyle = 'rgba(130, 165, 220, 0.12)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // Tiny iridescent meteoritic glints
    meteorFlecks.forEach((fl) => {
      const twinkle = 0.35 + 0.65 * Math.sin(time * 1.7 + fl.phase);
      ctx.fillStyle = `rgba(175, 215, 255, ${0.22 * twinkle})`;
      ctx.fillRect(fl.x, fl.y, fl.s, fl.s);
    });

    // Glowing mycelial veins pulsing upward toward the stems
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    mycelium.forEach((b) => {
      ctx.beginPath();
      b.pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      const wave = 0.45 + 0.55 * Math.sin(time * 1.9 - b.delay * 2.2);
      ctx.strokeStyle = b.depth >= 3
        ? `rgba(255, 208, 122, ${0.25 + 0.32 * wave})`
        : `rgba(104, 232, 245, ${0.16 + 0.26 * wave})`;
      ctx.lineWidth = b.width;
      ctx.stroke();

      // Traveling nutrient spark along main hyphae
      if (b.depth >= 2) {
        const u = (1 - ((time * 0.38 + b.delay) % 1));
        const idx = Math.min(b.pts.length - 2, Math.floor(u * (b.pts.length - 1)));
        const frac = u * (b.pts.length - 1) - idx;
        const px = b.pts[idx].x + (b.pts[idx + 1].x - b.pts[idx].x) * frac;
        const py = b.pts[idx].y + (b.pts[idx + 1].y - b.pts[idx].y) * frac;
        drawGlow(glows.cyan, px, py, 5.5, 0.28 * wave);
      }
    });

    // Velvet moss mounds
    mossMounds.forEach((m) => {
      const mg = ctx.createRadialGradient(m.x, m.y - m.ry * 0.5, 4, m.x, m.y, m.rx);
      mg.addColorStop(0.0, m.c2);
      mg.addColorStop(0.75, m.c1);
      mg.addColorStop(1.0, 'rgba(9, 16, 18, 0.95)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, Math.PI, Math.PI * 2);
      ctx.quadraticCurveTo(m.x, m.y + m.ry * 0.45, m.x - m.rx, m.y);
      ctx.fill();
    });

    // Individual velvet moss shoots illuminated by overhead bioluminescence
    const glowBreath = 0.85 + 0.15 * Math.sin(time * 1.2);
    for (let i = 0; i < mossTufts.length; i++) {
      const t = mossTufts[i];
      const g = Math.floor(78 + t.lit * 78 * glowBreath + t.hueShift);
      const r = Math.floor(22 + t.lit * 48 * glowBreath);
      const b = Math.floor(58 + t.lit * 34);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x - t.spread * 0.5, t.y - t.h * 0.85);
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x, t.y - t.h);
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x + t.spread * 0.5, t.y - t.h * 0.85);
      ctx.stroke();
    }

    // Tiny glowing sporeling pins nestled in moss
    mossPins.forEach((pin) => {
      const sway = Math.sin(time * 1.4 + pin.phase) * 1.4;
      const tipX = pin.x + pin.lean + sway;
      const tipY = pin.y - pin.h;
      ctx.strokeStyle = 'rgba(165, 228, 225, 0.65)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(pin.x, pin.y);
      ctx.quadraticCurveTo(pin.x + pin.lean * 0.3, pin.y - pin.h * 0.6, tipX, tipY);
      ctx.stroke();

      const pGlow = 0.7 + 0.3 * Math.sin(time * 2.1 + pin.phase);
      drawGlow(glows.gold, tipX, tipY, 7, 0.55 * pGlow);
      ctx.fillStyle = '#fff3cf';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Warm downward pool of cap bioluminescence on central moss
    drawGlow(glows.gold, 300, 668, 85, 0.16 * glowBreath);
    drawGlow(glows.cyan, 235, 682, 55, 0.12 * glowBreath);

    ctx.restore();
  }

  function drawStipe(p0, p1, p2, p3, hubPt, m, time, capTilt) {
    const steps = 26;
    const leftEdge = [];
    const rightEdge = [];
    const centerPts = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = bezierPoint(p0, p1, p2, hubPt, t);
      const tan = bezierTangent(p0, p1, p2, hubPt, t);
      const nx = -tan.y;
      const ny = tan.x;

      // Graceful bulbous base tapering to slender opalescent neck, flaring slightly at hub
      const baseSwelling = Math.pow(1 - t, 2.6) * (m.baseWidth - m.neckWidth);
      const hubFlare = Math.pow(t, 5) * 3.5;
      const halfW = (m.neckWidth + baseSwelling + hubFlare) * 0.5;

      centerPts.push({ x: pt.x, y: pt.y, nx, ny, halfW, t });
      leftEdge.push({ x: pt.x + nx * halfW, y: pt.y + ny * halfW });
      rightEdge.push({ x: pt.x - nx * halfW, y: pt.y - ny * halfW });
    }

    // Main translucent opalescent stem silhouette
    ctx.beginPath();
    leftEdge.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    for (let i = rightEdge.length - 1; i >= 0; i--) {
      ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
    }
    ctx.closePath();

    const stipeGrad = ctx.createLinearGradient(p0.x, p0.y, hubPt.x, hubPt.y);
    stipeGrad.addColorStop(0.0, '#1c3a44');
    stipeGrad.addColorStop(0.28, '#3b527d');
    stipeGrad.addColorStop(0.72, '#7d8ac4');
    stipeGrad.addColorStop(1.0, '#ffe39f');
    ctx.fillStyle = stipeGrad;
    ctx.fill();

    // Inner pearlescent core line
    ctx.beginPath();
    centerPts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = 'rgba(235, 245, 255, 0.34)';
    ctx.lineWidth = m.neckWidth * 0.38;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Helical striae wrapping delicately up the stem
    ctx.strokeStyle = 'rgba(170, 235, 255, 0.22)';
    ctx.lineWidth = 0.9;
    for (let strand = 0; strand < 2; strand++) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const c = centerPts[i];
        const wave = Math.sin(c.t * 11 + strand * Math.PI - time * 0.9);
        const sx = c.x + c.nx * c.halfW * 0.78 * wave;
        const sy = c.y + c.ny * c.halfW * 0.78 * wave;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Internal rising bioluminescent sap pulses
    for (let pIdx = 0; pIdx < 2; pIdx++) {
      const u = (time * 0.28 + pIdx * 0.5 + m.swayPhase * 0.2) % 1;
      const pt = bezierPoint(p0, p1, p2, hubPt, u);
      const fade = Math.sin(u * Math.PI);
      drawGlow(pIdx === 0 ? glows.gold : glows.cyan, pt.x, pt.y, m.neckWidth * 1.9, 0.38 * fade);
    }

    // Lacy astrolabe annulus (skirt/collar) partway up the stem
    const ringIdx = Math.floor(m.ringPos * steps);
    const rc = centerPts[ringIdx];
    const rTan = bezierTangent(p0, p1, p2, hubPt, m.ringPos);
    const ringAngle = Math.atan2(rTan.x, -rTan.y);

    ctx.save();
    ctx.translate(rc.x, rc.y);
    ctx.rotate(ringAngle);

    const skirtW = rc.halfW * 2.85;
    const skirtDrop = rc.halfW * 1.65 + Math.sin(time * 1.5 + m.swayPhase) * 1.2;

    const skirtGrad = ctx.createLinearGradient(0, -2, 0, skirtDrop + 4);
    skirtGrad.addColorStop(0.0, 'rgba(220, 232, 255, 0.75)');
    skirtGrad.addColorStop(0.65, 'rgba(122, 138, 214, 0.45)');
    skirtGrad.addColorStop(1.0, 'rgba(255, 214, 132, 0.65)');

    ctx.beginPath();
    ctx.moveTo(-rc.halfW * 0.95, 0);
    ctx.quadraticCurveTo(-skirtW * 0.85, skirtDrop * 0.45, -skirtW, skirtDrop);
    const scallops = 7;
    for (let s = 0; s < scallops; s++) {
      const x1 = -skirtW + ((s + 0.5) / scallops) * (skirtW * 2);
      const x2 = -skirtW + ((s + 1) / scallops) * (skirtW * 2);
      ctx.quadraticCurveTo(x1, skirtDrop + 4.2, x2, skirtDrop);
    }
    ctx.quadraticCurveTo(skirtW * 0.85, skirtDrop * 0.45, rc.halfW * 0.95, 0);
    ctx.closePath();
    ctx.fillStyle = skirtGrad;
    ctx.fill();

    // Tiny golden marginal droplets on the annulus
    ctx.fillStyle = '#ffe9a8';
    for (let s = 0; s <= scallops; s++) {
      const bx = -skirtW + (s / scallops) * (skirtW * 2);
      ctx.beginPath();
      ctx.arc(bx, skirtDrop, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawOrreryPearls(orbits, rx, ry, hubY, time, passBack) {
    for (let oIdx = 0; oIdx < orbits.length; oIdx++) {
      const orb = orbits[oIdx];
      for (let i = 0; i < orb.count; i++) {
        const theta = time * orb.speed + (i / orb.count) * Math.PI * 2;
        const sinT = Math.sin(theta);
        const isBack = sinT > 0;
        if (isBack !== passBack) continue;

        const cosT = Math.cos(theta);
        // Anchor point on underside gill ceiling
        const ceilX = cosT * rx * orb.radius;
        const ceilY = sinT * ry * orb.radius + hubY * (1 - orb.radius);

        // Hanging pearl position with gentle pendulum lag
        const bob = Math.sin(time * 2.1 + i * 1.7 + oIdx) * 2.2;
        const px = ceilX + Math.sin(time * 1.3 + i) * 1.4;
        const py = ceilY + orb.drop + bob;

        // Perspective depth scaling (front slightly larger & brighter than back)
        const depthScale = 0.86 - sinT * 0.18;
        const pr = orb.size * depthScale;

        // Fine silk-hypha suspension filament
        ctx.strokeStyle = isBack
          ? 'rgba(255, 218, 152, 0.28)'
          : 'rgba(255, 236, 190, 0.52)';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(ceilX, ceilY);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Pearl glow & core
        const glowAlpha = isBack ? 0.42 : 0.78;
        drawGlow(glows[orb.tint], px, py, pr * 4.4, glowAlpha);

        ctx.fillStyle = orb.tint === 'gold' ? '#fff6d6' : '#dffbff';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawMushroom(m, time, windOffset) {
    // Organic breathing & gentle sway
    const breath = Math.sin(time * 0.95 + m.swayPhase);
    const swayX = Math.sin(time * m.swayFreq + m.swayPhase) * m.swayAmp + windOffset * (m.isBud ? 0.5 : 1.0);
    const swayY = Math.abs(Math.cos(time * m.swayFreq + m.swayPhase)) * 3.5 - breath * 2.2;

    const p0 = { x: m.baseX, y: m.baseY };
    const p1 = { x: m.ctrl1X + swayX * 0.25, y: m.ctrl1Y };
    const p2 = { x: m.ctrl2X + swayX * 0.68, y: m.ctrl2Y + swayY * 0.5 };
    const capCenter = { x: m.capX + swayX, y: m.capY + swayY };

    const capTilt = m.baseTilt + swayX * 0.0042 + Math.sin(time * 0.7 + m.swayPhase) * 0.025;
    const rx = m.rx * (1 + breath * 0.028);
    const ry = m.ry * (1 - breath * 0.022);
    const domeH = m.domeH * (1 - breath * 0.025);

    // Hub inside underside cavity (shifted slightly up into the dome)
    const hubLocalY = -domeH * 0.18;
    const hubWorld = {
      x: capCenter.x - Math.sin(capTilt) * hubLocalY,
      y: capCenter.y + Math.cos(capTilt) * hubLocalY
    };

    // Ambient bioluminescent halo behind the entire cap
    drawGlow(glows.violet, capCenter.x, capCenter.y - domeH * 0.3, rx * 1.45, 0.22);
    drawGlow(glows.gold, hubWorld.x, hubWorld.y + 6, rx * 0.95, 0.28);

    // 1. Underside Cavity & Back Gills + Back Orbiting Pearls (drawn BEFORE stipe so stipe enters cleanly!)
    ctx.save();
    ctx.translate(capCenter.x, capCenter.y);
    ctx.rotate(capTilt);

    // Dark cosmic-plum hymenium cavity
    const cavGrad = ctx.createRadialGradient(0, hubLocalY, 2, 0, 0, rx);
    cavGrad.addColorStop(0.0, '#fff0be');
    cavGrad.addColorStop(0.22, '#f29f58');
    cavGrad.addColorStop(0.55, '#6b2d6c');
    cavGrad.addColorStop(0.88, '#231742');
    cavGrad.addColorStop(1.0, '#151230');

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = cavGrad;
    ctx.fill();

    // Radiant celestial gills curving from central hub to scalloped rim
    for (let g = 0; g < m.gillCount; g++) {
      const a = (g / m.gillCount) * Math.PI * 2;
      const rimX = Math.cos(a) * rx;
      const rimY = Math.sin(a) * ry;
      const midX = rimX * 0.52 + Math.cos(a + 0.16) * rx * 0.08;
      const midY = hubLocalY * 0.55 + rimY * 0.52;

      const isMajor = g % 2 === 0;
      const startFrac = isMajor ? 0.08 : 0.36;
      const sx = rimX * startFrac;
      const sy = hubLocalY * (1 - startFrac) + rimY * startFrac;

      const gillAlpha = Math.sin(a) > 0 ? 0.52 : 0.78;
      ctx.strokeStyle = isMajor
        ? `rgba(255, 218, 138, ${gillAlpha})`
        : `rgba(220, 140, 245, ${gillAlpha * 0.75})`;
      ctx.lineWidth = isMajor ? 1.15 : 0.7;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(midX, midY, rimX, rimY);
      ctx.stroke();
    }

    // Back rim delicate luminous trim
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
    ctx.strokeStyle = 'rgba(130, 220, 255, 0.38)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Back half of orbiting spore-pearls (behind stem)
    drawOrreryPearls(m.orbits, rx, ry, hubLocalY, time, true);

    ctx.restore();

    // 2. Stipe (stem) rising from moss, occluding back rim and inserting into glowing hub
    drawStipe(p0, p1, p2, capCenter, hubWorld, m, time, capTilt);

    // 3. Front Orbiting Pearls & Upper Translucent Star-Chart Dome
    ctx.save();
    ctx.translate(capCenter.x, capCenter.y);
    ctx.rotate(capTilt);

    // Soft glowing junction where stem fuses into central hub
    drawGlow(glows.gold, 0, hubLocalY, m.neckWidth * 2.1, 0.55);

    // Front half of orbiting spore-pearls (passing in front of stem!)
    drawOrreryPearls(m.orbits, rx, ry, hubLocalY, time, false);

    // Translucent pleated parasol dome arching over the front scalloped margin
    // Front margin runs from (-rx, 0) along upper arc (theta = PI..2PI, i.e. y = -ry at center!) to (+rx, 0)
    // Wait: for bud, front rim dips slightly lower so it looks more enclosed like a lantern!
    const frontRimLift = m.isBud ? -ry * 0.32 : -ry * 0.92;

    function buildDomePath() {
      ctx.beginPath();
      ctx.moveTo(-rx, 0);
      // Outer bell profile up to crown apex and down to right rim
      if (m.isBud) {
        ctx.bezierCurveTo(-rx * 1.04, -domeH * 0.72, -rx * 0.42, -domeH * 1.05, 0, -domeH);
        ctx.bezierCurveTo(rx * 0.42, -domeH * 1.05, rx * 1.04, -domeH * 0.72, rx, 0);
      } else {
        ctx.bezierCurveTo(-rx * 0.92, -domeH * 0.48, -rx * 0.46, -domeH * 1.02, 0, -domeH);
        ctx.bezierCurveTo(rx * 0.46, -domeH * 1.02, rx * 0.92, -domeH * 0.48, rx, 0);
      }

      // Scalloped front parasol hem from +rx back to -rx
      const pleats = m.isBud ? 9 : 15;
      for (let i = 0; i < pleats; i++) {
        const t1 = (i + 0.5) / pleats;
        const t2 = (i + 1) / pleats;
        const a1 = Math.PI * t1;
        const a2 = Math.PI * t2;
        const x1 = Math.cos(a1) * rx;
        const y1 = Math.sin(a1) * frontRimLift - (m.isBud ? 2.5 : 4.2);
        const x2 = Math.cos(a2) * rx;
        const y2 = Math.sin(a2) * frontRimLift;
        ctx.quadraticCurveTo(x1, y1, x2, y2);
      }
      ctx.closePath();
    }

    buildDomePath();

    // Rich translucent indigo-violet-cyan dome gradient with warm internal transmission
    const domeGrad = ctx.createLinearGradient(0, -domeH, 0, 8);
    domeGrad.addColorStop(0.0, 'rgba(92, 224, 245, 0.88)');
    domeGrad.addColorStop(0.24, 'rgba(58, 76, 178, 0.86)');
    domeGrad.addColorStop(0.62, 'rgba(38, 28, 98, 0.78)');
    domeGrad.addColorStop(0.88, 'rgba(116, 54, 152, 0.72)');
    domeGrad.addColorStop(1.0, 'rgba(255, 206, 132, 0.78)');
    ctx.fillStyle = domeGrad;
    ctx.fill();

    // Warm internal lantern glow shining softly through the translucent dome center
    ctx.save();
    buildDomePath();
    ctx.clip();

    const innerShine = ctx.createRadialGradient(0, -domeH * 0.25, 2, 0, -domeH * 0.35, rx * 0.78);
    innerShine.addColorStop(0.0, 'rgba(255, 214, 128, 0.36)');
    innerShine.addColorStop(0.5, 'rgba(218, 112, 240, 0.16)');
    innerShine.addColorStop(1.0, 'rgba(20, 24, 68, 0)');
    ctx.fillStyle = innerShine;
    ctx.fillRect(-rx * 1.2, -domeH * 1.2, rx * 2.4, domeH * 1.5);

    // Delicate fluted parasol ribs arching from crown umbo to each front scallop
    const pleats = m.isBud ? 9 : 15;
    for (let i = 1; i < pleats; i++) {
      const a = Math.PI * (i / pleats);
      const rimX = Math.cos(a) * rx;
      const rimY = Math.sin(a) * frontRimLift;
      ctx.strokeStyle = i % 2 === 0
        ? 'rgba(165, 238, 255, 0.28)'
        : 'rgba(255, 212, 165, 0.18)';
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.moveTo(0, -domeH * 0.98);
      ctx.quadraticCurveTo(rimX * 0.62, -domeH * 0.62, rimX, rimY);
      ctx.stroke();
    }

    // Star-chart bioluminescent speckles embedded across the cap cuticle
    for (let s = 0; s < m.spots.length; s++) {
      const sp = m.spots[s];
      const widthAtV = Math.sin((1 - sp.v * 0.88) * Math.PI * 0.5) * rx * 0.92;
      const sx = sp.u * widthAtV;
      const baseLineY = Math.sqrt(Math.max(0, 1 - sp.u * sp.u)) * frontRimLift;
      const sy = baseLineY + (-domeH - baseLineY) * sp.v;
      const tw = 0.55 + 0.45 * Math.sin(time * 1.8 + sp.phase);

      ctx.fillStyle = sp.cyan
        ? `rgba(175, 248, 255, ${0.72 * tw})`
        : `rgba(255, 236, 178, ${0.78 * tw})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle constellations etched between nearby cap spots
    ctx.strokeStyle = 'rgba(165, 235, 255, 0.16)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    for (let s = 0; s < m.spots.length - 1; s += 2) {
      const a = m.spots[s];
      const b = m.spots[s + 1];
      if (Math.hypot(a.u - b.u, a.v - b.v) < 0.42) {
        const wa = Math.sin((1 - a.v * 0.88) * Math.PI * 0.5) * rx * 0.92;
        const wb = Math.sin((1 - b.v * 0.88) * Math.PI * 0.5) * rx * 0.92;
        const ya = Math.sqrt(Math.max(0, 1 - a.u * a.u)) * frontRimLift;
        const yb = Math.sqrt(Math.max(0, 1 - b.u * b.u)) * frontRimLift;
        ctx.moveTo(a.u * wa, ya + (-domeH - ya) * a.v);
        ctx.lineTo(b.u * wb, yb + (-domeH - yb) * b.v);
      }
    }
    ctx.stroke();

    ctx.restore(); // end dome clip

    // Crisp iridescent rim highlight & crown umbo pearl
    buildDomePath();
    ctx.strokeStyle = 'rgba(165, 240, 255, 0.48)';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // Glowing umbo pinnacle at the apex of the dome
    drawGlow(glows.cyan, 0, -domeH, rx * 0.22, 0.52);

    ctx.restore();
  }

  function updateAndDrawSpores(dt, time) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Update spore positions
    for (let i = 0; i < spores.length; i++) {
      const s = spores[i];
      s.life += dt;
      if (s.life >= s.maxLife || s.y < -220) {
        spores[i] = spawnSpore(false);
        continue;
      }

      // Gentle upward thermal + sinusoidal curl drift
      const curlX = Math.sin(time * s.wobbleFreq + s.phase + s.y * 0.012) * s.wobbleAmp;
      let pxForce = 0, pyForce = 0;

      if (pointer.strength > 0.01) {
        const dx = pointer.x - s.x;
        const dy = pointer.y - s.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 26000 && distSq > 16) {
          const dist = Math.sqrt(distSq);
          const pull = (1 - dist / 161) * 26 * pointer.strength;
          // Gentle orbital swirl around pointer
          pxForce = (-dy / dist * 0.8 + dx / dist * 0.35) * pull;
          pyForce = (dx / dist * 0.8 + dy / dist * 0.35) * pull;
        }
      }

      s.x += (s.vx + curlX * 0.45 + pxForce) * dt * s.depth;
      s.y += (s.vy + pyForce) * dt * s.depth;
    }

    // Transient constellation filaments connecting nearby airborne spores
    const linkDist = 82;
    const linkDistSq = linkDist * linkDist;
    ctx.lineCap = 'round';

    for (let i = 0; i < spores.length; i++) {
      const a = spores[i];
      const fadeA = Math.min(1, a.life * 0.8) * Math.min(1, (a.maxLife - a.life) * 0.5);
      if (fadeA <= 0.05 || a.y > 540) continue;

      for (let j = i + 1; j < spores.length; j++) {
        const b = spores[j];
        if (b.y > 540) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < linkDistSq) {
          const fadeB = Math.min(1, b.life * 0.8) * Math.min(1, (b.maxLife - b.life) * 0.5);
          const proximity = 1 - Math.sqrt(dSq) / linkDist;
          const alpha = proximity * proximity * Math.min(fadeA, fadeB) * 0.58;
          if (alpha > 0.02) {
            ctx.strokeStyle = `rgba(185, 236, 255, ${alpha})`;
            ctx.lineWidth = 0.75 * proximity + 0.25;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw each luminous spore grain / tiny 4-ray star polyhedron
    for (let i = 0; i < spores.length; i++) {
      const s = spores[i];
      const fadeIn = Math.min(1, s.life * 0.9);
      const fadeOut = Math.min(1, (s.maxLife - s.life) * 0.45);
      const twinkle = 0.68 + 0.32 * Math.sin(time * 2.6 + s.phase);
      const alpha = fadeIn * fadeOut * twinkle;
      if (alpha <= 0.01) continue;

      const r = s.size * s.depth;
      drawGlow(glows[s.tint], s.x, s.y, r * 4.5, alpha * 0.62);

      ctx.fillStyle = s.tint === 'gold'
        ? `rgba(255, 248, 218, ${alpha})`
        : (s.tint === 'cyan' ? `rgba(220, 252, 255, ${alpha})` : `rgba(248, 224, 255, ${alpha})`);

      if (s.star) {
        const arm = r * 2.1;
        const waist = r * 0.48;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - arm);
        ctx.lineTo(s.x + waist, s.y - waist);
        ctx.lineTo(s.x + arm, s.y);
        ctx.lineTo(s.x + waist, s.y + waist);
        ctx.lineTo(s.x, s.y + arm);
        ctx.lineTo(s.x - waist, s.y + waist);
        ctx.lineTo(s.x - arm, s.y);
        ctx.lineTo(s.x - waist, s.y - waist);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  let lastTs = performance.now();
  let elapsed = 0;

  function frame(ts) {
    const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;
    elapsed += dt;

    // Smooth pointer interpolation
    const targetStrength = pointer.active ? 1 : 0;
    pointer.strength += (targetStrength - pointer.strength) * Math.min(1, dt * 3.5);
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 5.0);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 5.0);

    const windOffset = pointer.strength * Math.max(-14, Math.min(14, (pointer.x - 300) * 0.045));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Deep nocturnal atmosphere & distant flora
    drawBackground(elapsed);

    // 2. Mossy meteorite, sunken brass astrolabe & glowing mycelium
    drawSubstrate(elapsed);

    // 3. Cluster of Twilight Orrery Parasols (left, right bud, then grand central foreground)
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    drawMushroom(mushrooms[0], elapsed, windOffset);
    drawMushroom(mushrooms[2], elapsed, windOffset);
    drawMushroom(mushrooms[1], elapsed, windOffset);
    ctx.restore();

    // 4. Drifting constellation spores & ephemeral star-chart links
    updateAndDrawSpores(dt, elapsed);

    // 5. Subtle interior depth vignette
    const vig = ctx.createRadialGradient(vw * 0.5, vh * 0.48, Math.min(vw, vh) * 0.34, vw * 0.5, vh * 0.5, Math.hypot(vw, vh) * 0.62);
    vig.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1.0, 'rgba(3, 4, 10, 0.46)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, vw, vh);

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
  "title": "Twilight Orrery Parasol",
  "statement": "Rooted in meteoritic iron and mossy relics, this nocturnal basidiomycete suspends luminous spore-pearls in slow, planetary orbits beneath its pleated indigo cap. As ripe grains drift skyward on warm drafts, transient filaments of static light link nearby spores into fleeting constellations."
}
```