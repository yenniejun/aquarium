```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Glimmer-Gale Ginkgo</title>
<style>
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #8a948c;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="alcove" aria-label="Animated ginkgo bonsai in a ceramic pot"></canvas>
<script>
(() => {
  'use strict';

  const canvas = document.getElementById('alcove');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Deterministic PRNG for harmonious, repeatable organic form
  function createRng(seed) {
    let s = seed >>> 0;
    return () => {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rng = createRng(482719);

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function mixHex(c1, c2, t) {
    const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
    const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));
    return `rgb(${r},${g},${b})`;
  }

  // Subtle paper-grain tile generated once offscreen
  const grainTile = document.createElement('canvas');
  grainTile.width = 160;
  grainTile.height = 160;
  const gctx = grainTile.getContext('2d');
  const gImg = gctx.createImageData(160, 160);
  for (let i = 0; i < gImg.data.length; i += 4) {
    const v = 128 + (rng() - 0.5) * 44;
    gImg.data[i] = v;
    gImg.data[i + 1] = v;
    gImg.data[i + 2] = v - 4;
    gImg.data[i + 3] = 14;
  }
  gctx.putImageData(gImg, 0, 0);
  let grainPattern = null;

  // Viewport transform (virtual 1000x1000 scene centered inside any aspect ratio)
  let vw = 0, vh = 0, dpr = 1, sceneScale = 1, offsetX = 0, offsetY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = canvas.clientWidth || window.innerWidth;
    vh = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.round(vw * dpr));
    canvas.height = Math.max(1, Math.round(vh * dpr));
    const side = Math.min(vw, vh);
    sceneScale = side / 1000;
    offsetX = (vw - side) * 0.5;
    offsetY = (vh - side) * 0.5;
    grainPattern = ctx.createPattern(grainTile, 'repeat');
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Optional gentle pointer breeze (never blocks scrolling)
  const pointer = {
    active: false,
    x: 500,
    y: 500,
    vx: 0,
    vy: 0,
    energy: 0
  };

  function updatePointer(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) - offsetX) / sceneScale;
    const sy = ((e.clientY - rect.top) - offsetY) / sceneScale;
    if (pointer.active) {
      const dx = sx - pointer.x;
      const dy = sy - pointer.y;
      pointer.vx = lerp(pointer.vx, clamp(dx, -60, 60), 0.35);
      pointer.vy = lerp(pointer.vy, clamp(dy, -60, 60), 0.35);
      pointer.energy = Math.min(1, pointer.energy + Math.hypot(dx, dy) * 0.008);
    }
    pointer.x = sx;
    pointer.y = sy;
    pointer.active = true;
  }

  window.addEventListener('pointermove', updatePointer, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });

  // Tree Anatomy (1000x1000 virtual coordinate space)
  // Moyogi S-curve trunk spine from soil line (y=792) up to delicate apex (y=245)
  const trunkSpine = [
    { x: 476, y: 794, r: 34, flex: 0.00 },
    { x: 454, y: 742, r: 29, flex: 0.03 },
    { x: 436, y: 682, r: 24, flex: 0.08 },
    { x: 472, y: 626, r: 21, flex: 0.14 },
    { x: 526, y: 572, r: 18, flex: 0.21 },
    { x: 492, y: 514, r: 15, flex: 0.30 },
    { x: 450, y: 458, r: 13, flex: 0.40 },
    { x: 484, y: 400, r: 10.5, flex: 0.52 },
    { x: 506, y: 345, r: 8.0, flex: 0.65 },
    { x: 478, y: 292, r: 5.5, flex: 0.80 },
    { x: 468, y: 246, r: 3.0, flex: 0.96 }
  ];

  // Muscular surface roots (nebari) gripping the mossy mound
  const roots = [
    { pts: [{ x: 462, y: 786, r: 15 }, { x: 422, y: 792, r: 9 }, { x: 386, y: 798, r: 3 }] },
    { pts: [{ x: 470, y: 790, r: 13 }, { x: 446, y: 797, r: 8 }, { x: 420, y: 803, r: 2.5 }] },
    { pts: [{ x: 482, y: 790, r: 14 }, { x: 496, y: 798, r: 8.5 }, { x: 516, y: 803, r: 2.5 }] },
    { pts: [{ x: 494, y: 786, r: 16 }, { x: 528, y: 793, r: 9.5 }, { x: 562, y: 799, r: 3 }] }
  ];

  // Branches emerging from the outer curves of the trunk
  // Each branch has control points, base flex, phase, and sub-twigs + foliage pads
  const branchConfigs = [
    {
      // Low-left sweeping sashieda
      id: 'lowLeft',
      pts: [
        { x: 442, y: 668, r: 11.5, flex: 0.12 },
        { x: 382, y: 644, r: 8.5, flex: 0.35 },
        { x: 320, y: 618, r: 5.5, flex: 0.65 },
        { x: 266, y: 586, r: 2.8, flex: 1.00 }
      ],
      twigs: [
        [{ x: 368, y: 638, r: 4.5, flex: 0.45 }, { x: 334, y: 598, r: 2.5, flex: 0.85 }, { x: 306, y: 572, r: 1.5, flex: 1.15 }],
        [{ x: 312, y: 614, r: 3.5, flex: 0.72 }, { x: 274, y: 612, r: 2.0, flex: 1.05 }, { x: 238, y: 598, r: 1.2, flex: 1.25 }],
        [{ x: 336, y: 625, r: 3.2, flex: 0.60 }, { x: 362, y: 594, r: 1.8, flex: 0.92 }]
      ],
      pads: [
        { cx: 298, cy: 576, rx: 92, ry: 34, count: 66, depthBias: 0.0 },
        { cx: 244, cy: 598, rx: 52, ry: 22, count: 32, depthBias: 0.1 }
      ],
      phase: 0.4
    },
    {
      // Mid-right counterweight bough
      id: 'midRight',
      pts: [
        { x: 522, y: 572, r: 10.5, flex: 0.22 },
        { x: 584, y: 552, r: 7.8, flex: 0.48 },
        { x: 648, y: 530, r: 5.0, flex: 0.80 },
        { x: 704, y: 504, r: 2.5, flex: 1.12 }
      ],
      twigs: [
        [{ x: 588, y: 550, r: 4.5, flex: 0.50 }, { x: 624, y: 512, r: 2.5, flex: 0.88 }, { x: 654, y: 488, r: 1.5, flex: 1.18 }],
        [{ x: 650, y: 528, r: 3.2, flex: 0.82 }, { x: 692, y: 532, r: 1.8, flex: 1.12 }, { x: 730, y: 520, r: 1.2, flex: 1.32 }],
        [{ x: 562, y: 558, r: 3.5, flex: 0.42 }, { x: 584, y: 520, r: 1.9, flex: 0.78 }]
      ],
      pads: [
        { cx: 652, cy: 498, rx: 98, ry: 36, count: 72, depthBias: 0.05 },
        { cx: 716, cy: 516, rx: 54, ry: 22, count: 32, depthBias: 0.15 }
      ],
      phase: 1.7
    },
    {
      // Back depth bough (subtle, darker, behind upper trunk)
      id: 'backMid',
      behindTrunk: true,
      pts: [
        { x: 472, y: 486, r: 7.2, flex: 0.35 },
        { x: 524, y: 454, r: 5.0, flex: 0.62 },
        { x: 572, y: 428, r: 2.8, flex: 0.92 }
      ],
      twigs: [
        [{ x: 530, y: 450, r: 3.0, flex: 0.66 }, { x: 556, y: 416, r: 1.6, flex: 0.98 }]
      ],
      pads: [
        { cx: 560, cy: 414, rx: 64, ry: 25, count: 38, depthBias: -0.35 }
      ],
      phase: 2.6
    },
    {
      // Upper-left bough
      id: 'upperLeft',
      pts: [
        { x: 452, y: 458, r: 8.5, flex: 0.42 },
        { x: 398, y: 432, r: 6.0, flex: 0.68 },
        { x: 344, y: 404, r: 3.6, flex: 0.96 },
        { x: 304, y: 380, r: 2.0, flex: 1.22 }
      ],
      twigs: [
        [{ x: 402, y: 434, r: 3.6, flex: 0.66 }, { x: 376, y: 394, r: 2.0, flex: 0.98 }, { x: 354, y: 370, r: 1.3, flex: 1.20 }],
        [{ x: 348, y: 405, r: 2.8, flex: 0.95 }, { x: 314, y: 406, r: 1.6, flex: 1.22 }]
      ],
      pads: [
        { cx: 356, cy: 376, rx: 82, ry: 30, count: 56, depthBias: 0.08 }
      ],
      phase: 3.5
    },
    {
      // Upper-right bough
      id: 'upperRight',
      pts: [
        { x: 504, y: 352, r: 6.2, flex: 0.65 },
        { x: 554, y: 326, r: 4.0, flex: 0.92 },
        { x: 604, y: 302, r: 2.2, flex: 1.20 }
      ],
      twigs: [
        [{ x: 556, y: 326, r: 2.8, flex: 0.92 }, { x: 580, y: 294, r: 1.5, flex: 1.22 }],
        [{ x: 528, y: 340, r: 2.6, flex: 0.78 }, { x: 546, y: 304, r: 1.4, flex: 1.08 }]
      ],
      pads: [
        { cx: 576, cy: 296, rx: 72, ry: 27, count: 48, depthBias: 0.1 }
      ],
      phase: 4.8
    },
    {
      // Airy apex crown
      id: 'apex',
      pts: [
        { x: 474, y: 274, r: 4.4, flex: 0.85 },
        { x: 446, y: 248, r: 2.4, flex: 1.10 },
        { x: 422, y: 230, r: 1.4, flex: 1.32 }
      ],
      twigs: [
        [{ x: 468, y: 254, r: 2.6, flex: 0.96 }, { x: 484, y: 222, r: 1.4, flex: 1.28 }],
        [{ x: 472, y: 262, r: 2.4, flex: 0.94 }, { x: 510, y: 234, r: 1.3, flex: 1.26 }]
      ],
      pads: [
        { cx: 468, cy: 222, rx: 94, ry: 34, count: 68, depthBias: 0.20 },
        { cx: 428, cy: 238, rx: 48, ry: 20, count: 28, depthBias: 0.12 }
      ],
      phase: 5.4
    }
  ];

  // Bark fissure segments & subtle lichen flecks along the trunk
  const barkMarks = [];
  for (let i = 0; i < trunkSpine.length - 1; i++) {
    const a = trunkSpine[i];
    const b = trunkSpine[i + 1];
    const steps = 4;
    for (let s = 0; s < steps; s++) {
      const t = (s + rng() * 0.7) / steps;
      const px = lerp(a.x, b.x, t);
      const py = lerp(a.y, b.y, t);
      const pr = lerp(a.r, b.r, t);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      barkMarks.push({
        x: px + (rng() - 0.5) * pr * 0.9,
        y: py,
        len: 8 + rng() * pr * 0.75,
        ang: ang + (rng() - 0.5) * 0.18,
        flex: lerp(a.flex, b.flex, t),
        isLichen: rng() < 0.24,
        lichenR: 1.5 + rng() * 2.4
      });
    }
  }

  // Generate individual Ginkgo fan leaves within each sculpted foliage pad
  const allLeafPads = [];
  for (const br of branchConfigs) {
    for (const pad of br.pads) {
      const leaves = [];
      for (let i = 0; i < pad.count; i++) {
        // Uniform disk distribution biased toward gentle cloud dome
        const u = Math.sqrt(rng());
        const theta = rng() * Math.PI * 2;
        const lx = pad.cx + Math.cos(theta) * u * pad.rx;
        // Dome top, flatter bottom (classic bonsai pad silhouette)
        const rawY = Math.sin(theta) * u;
        const domeY = rawY < 0 ? rawY * 1.15 : rawY * 0.62;
        const ly = pad.cy + domeY * pad.ry;

        // Vertical normalized position inside pad: -1 (top sunlit) to +1 (bottom shaded)
        const vNorm = clamp((ly - pad.cy) / (pad.ry * 0.95), -1, 1);
        const shade = clamp(0.5 + vNorm * 0.45 - pad.depthBias * 0.35 + (rng() - 0.5) * 0.18, 0, 1);

        leaves.push({
          x: lx,
          y: ly,
          size: (13.5 + rng() * 7.5) * (1 - u * 0.18),
          baseAngle: -Math.PI * 0.5 + (lx - pad.cx) / pad.rx * 0.75 + (rng() - 0.5) * 0.9,
          shade,
          phase: rng() * Math.PI * 2,
          flex: clamp(1.0 - (ly - 200) / 700, 0.45, 1.3) + (1 - pad.depthBias) * 0.1,
          branchPhase: br.phase,
          glintSeed: rng()
        });
      }
      // Painter's order: back/bottom shaded leaves drawn first, sunlit crown leaves on top
      leaves.sort((a, b) => b.shade - a.shade || b.y - a.y);
      allLeafPads.push({ behindTrunk: !!br.behindTrunk, leaves, pad });
    }
  }

  // Velvet moss tufts & tiny spore stalks on the pot soil mound
  const mossMounds = [
    { x: 356, y: 790, rx: 46, ry: 15, c: 0 },
    { x: 416, y: 787, rx: 52, ry: 17, c: 1 },
    { x: 484, y: 789, rx: 60, ry: 16, c: 0 },
    { x: 554, y: 788, rx: 54, ry: 17, c: 1 },
    { x: 616, y: 791, rx: 42, ry: 14, c: 0 }
  ];

  const mossTufts = [];
  for (let i = 0; i < 65; i++) {
    const mx = 332 + rng() * 316;
    const distCenter = Math.abs(mx - 485) / 160;
    const my = 782 + distCenter * 7 + (rng() - 0.5) * 10;
    mossTufts.push({
      x: mx,
      y: my,
      h: 3 + rng() * 4.5,
      tilt: (rng() - 0.5) * 0.45,
      bright: rng(),
      hasSpore: rng() < 0.12,
      sporeH: 9 + rng() * 8,
      phase: rng() * Math.PI * 2
    });
  }

  // Ceramic glaze speckles
  const potSpeckles = [];
  for (let i = 0; i < 55; i++) {
    potSpeckles.push({
      x: 325 + rng() * 332,
      y: 804 + rng() * 52,
      r: 0.7 + rng() * 1.4,
      a: 0.08 + rng() * 0.16,
      light: rng() > 0.45
    });
  }

  // Atmospheric motes & fireflies
  const motes = [];
  for (let i = 0; i < 28; i++) {
    motes.push({
      x: 120 + rng() * 760,
      y: 120 + rng() * 720,
      r: 1.4 + rng() * 2.4,
      speedY: -5 - rng() * 8,
      driftAmp: 10 + rng() * 22,
      phase: rng() * Math.PI * 2,
      isFirefly: i < 11
    });
  }

  // Falling & settling golden Ginkgo leaves
  const fallingLeaves = [];
  function spawnFallingLeaf(fromX, fromY, shade) {
    if (fallingLeaves.length >= 14) return;
    fallingLeaves.push({
      x: fromX,
      y: fromY,
      vx: 6 + rng() * 14,
      vy: 18 + rng() * 14,
      size: 11 + rng() * 5,
      rot: rng() * Math.PI * 2,
      spin: (rng() - 0.5) * 2.8,
      swayPhase: rng() * Math.PI * 2,
      shade: shade !== undefined ? shade : rng() * 0.5,
      restTime: 0,
      landed: false,
      landY: 785 + rng() * 14,
      alpha: 0.95
    });
  }

  // Seed initial couple of drifting leaves so the scene starts alive immediately
  spawnFallingLeaf(340, 580, 0.25);
  spawnFallingLeaf(620, 490, 0.15);

  let leafSpawnTimer = 1.4;
  let lastTime = performance.now();
  let simTime = 0;

  // Compute wind displacement at a given point and flexibility factor
  function windOffset(x, y, flex, phaseOffset, t) {
    const gustWave = Math.sin(t * 0.75 + x * 0.004 - y * 0.002 + phaseOffset * 0.3);
    const slowSwell = Math.sin(t * 0.32 + 0.7);
    const flutter = Math.sin(t * 2.3 + phaseOffset + x * 0.015) * 0.25;
    const baseWind = (slowSwell * 6.5 + gustWave * 5.0 + 3.2 + flutter * 2.2) * flex;

    // Gentle local pointer wake
    let pPushX = 0;
    let pPushY = 0;
    if (pointer.energy > 0.01) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 28000) {
        const falloff = (1 - dist2 / 28000) * pointer.energy * flex;
        pPushX = pointer.vx * falloff * 0.35 + (dx > 0 ? 1 : -1) * falloff * 4;
        pPushY = pointer.vy * falloff * 0.2;
      }
    }

    return {
      dx: baseWind + pPushX,
      dy: Math.abs(baseWind) * 0.14 + Math.sin(t * 1.4 + phaseOffset) * 1.2 * flex + pPushY
    };
  }

  // Draw a tapered organic wood branch/trunk spline with warm/cool bark lighting
  function drawWoodSpline(pts, t, phaseOffset, warmth) {
    const displaced = pts.map(p => {
      const w = windOffset(p.x, p.y, p.flex || 0, phaseOffset, t);
      return { x: p.x + w.dx, y: p.y + w.dy, r: p.r };
    });

    if (displaced.length < 2) return displaced;

    const leftPts = [];
    const rightPts = [];

    for (let i = 0; i < displaced.length; i++) {
      const prev = displaced[Math.max(0, i - 1)];
      const next = displaced[Math.min(displaced.length - 1, i + 1)];
      const tx = next.x - prev.x;
      const ty = next.y - prev.y;
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;
      leftPts.push({ x: displaced[i].x + nx * displaced[i].r, y: displaced[i].y + ny * displaced[i].r });
      rightPts.push({ x: displaced[i].x - nx * displaced[i].r, y: displaced[i].y - ny * displaced[i].r });
    }

    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    for (let i = 1; i < leftPts.length - 1; i++) {
      const mx = (leftPts[i].x + leftPts[i + 1].x) * 0.5;
      const my = (leftPts[i].y + leftPts[i + 1].y) * 0.5;
      ctx.quadraticCurveTo(leftPts[i].x, leftPts[i].y, mx, my);
    }
    const lastL = leftPts[leftPts.length - 1];
    ctx.lineTo(lastL.x, lastL.y);

    const lastR = rightPts[rightPts.length - 1];
    ctx.lineTo(lastR.x, lastR.y);

    for (let i = rightPts.length - 2; i >= 1; i--) {
      const mx = (rightPts[i].x + rightPts[i - 1].x) * 0.5;
      const my = (rightPts[i].y + rightPts[i - 1].y) * 0.5;
      ctx.quadraticCurveTo(rightPts[i].x, rightPts[i].y, mx, my);
    }
    ctx.lineTo(rightPts[0].x, rightPts[0].y);
    ctx.closePath();

    // Silvery ash-umber bark gradient catching soft side light
    const grad = ctx.createLinearGradient(380, 300, 580, 750);
    grad.addColorStop(0, mixHex(0x6e6a73, 0x8a7d72, warmth));
    grad.addColorStop(0.55, mixHex(0x4b4752, 0x62574f, warmth));
    grad.addColorStop(1, mixHex(0x33303b, 0x453b36, warmth));
    ctx.fillStyle = grad;
    ctx.fill();

    // Sunlit rim highlight along left/top edge
    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    for (let i = 1; i < leftPts.length - 1; i++) {
      const mx = (leftPts[i].x + leftPts[i + 1].x) * 0.5;
      const my = (leftPts[i].y + leftPts[i + 1].y) * 0.5;
      ctx.quadraticCurveTo(leftPts[i].x, leftPts[i].y, mx, my);
    }
    ctx.lineWidth = Math.max(1.2, displaced[0].r * 0.14);
    ctx.strokeStyle = warmth > 0.5
      ? `rgba(235, 218, 194, ${0.22 + warmth * 0.18})`
      : `rgba(195, 212, 224, ${0.18 + (1 - warmth) * 0.14})`;
    ctx.lineCap = 'round';
    ctx.stroke();

    return displaced;
  }

  // Draw a notched fan-shaped Ginkgo leaf
  function drawGinkgoLeaf(x, y, size, angle, fillStyle, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    if (alpha !== undefined && alpha < 1) ctx.globalAlpha = alpha;

    // Petiole stem
    ctx.beginPath();
    ctx.moveTo(0, size * 0.25);
    ctx.lineTo(0, 0);
    ctx.lineWidth = Math.max(0.9, size * 0.08);
    ctx.strokeStyle = fillStyle;
    ctx.stroke();

    // Characteristic notched fan blade
    const w = size * 0.85;
    const h = size * 0.92;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-w * 0.95, -h * 0.42, -w * 0.66, -h * 0.92);
    ctx.quadraticCurveTo(-w * 0.24, -h * 1.06, -w * 0.06, -h * 0.82);
    ctx.lineTo(0, -h * 0.64);
    ctx.lineTo(w * 0.06, -h * 0.82);
    ctx.quadraticCurveTo(w * 0.24, -h * 1.06, w * 0.66, -h * 0.92);
    ctx.quadraticCurveTo(w * 0.95, -h * 0.42, 0, 0);
    ctx.closePath();

    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
  }

  // Smooth leaf color ramp across afternoon warmth & twilight
  function getLeafColor(shade, warmth) {
    // shade: 0 = sunlit top, 0.5 = mid chartreuse-gold, 1 = deep shaded olive-sage
    if (shade < 0.48) {
      const u = shade / 0.48;
      const topC = warmth > 0.5 ? 0xf6d365 : 0xe9cf7a;
      const midC = warmth > 0.5 ? 0xd8b143 : 0xbcb054;
      const cA = lerp(0xe9cf7a, 0xf8d86b, warmth);
      // Use direct hex mix
      const topHex = Math.round(lerp(0xe6, 0xf8, warmth)) << 16 |
                     Math.round(lerp(0xcc, 0xd9, warmth)) << 8 |
                     Math.round(lerp(0x7c, 0x6a, warmth));
      const midHex = Math.round(lerp(0xb2, 0xd6, warmth)) << 16 |
                     Math.round(lerp(0xa9, 0xae, warmth)) << 8 |
                     Math.round(lerp(0x55, 0x40, warmth));
      void topC; void midC; void cA;
      return mixHex(topHex, midHex, u);
    } else {
      const u = (shade - 0.48) / 0.52;
      const midHex = Math.round(lerp(0xb2, 0xd6, warmth)) << 16 |
                     Math.round(lerp(0xa9, 0xae, warmth)) << 8 |
                     Math.round(lerp(0x55, 0x40, warmth));
      const darkHex = Math.round(lerp(0x4c, 0x6b, warmth)) << 16 |
                      Math.round(lerp(0x63, 0x7b, warmth)) << 8 |
                      Math.round(lerp(0x52, 0x42, warmth));
      return mixHex(midHex, darkHex, u);
    }
  }

  function drawBackground(t, warmth) {
    // Luminous soft wash filling the alcove
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1000);
    bgGrad.addColorStop(0, mixHex(0x617385, 0xcad3c9, warmth));
    bgGrad.addColorStop(0.42, mixHex(0x95a5b0, 0xede6d5, warmth));
    bgGrad.addColorStop(0.84, mixHex(0x748591, 0xd0d4c8, warmth));
    bgGrad.addColorStop(1, mixHex(0x586774, 0xb6bcb0, warmth));
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Halo behind the crown (warm sun-glow or pale moon-mist)
    const haloX = 485 + Math.sin(t * 0.14) * 18;
    const haloY = 390 + Math.cos(t * 0.11) * 10;
    const halo = ctx.createRadialGradient(haloX, haloY, 30, haloX, haloY, 470);
    halo.addColorStop(0, warmth > 0.5
      ? `rgba(255, 246, 218, ${0.32 + warmth * 0.18})`
      : `rgba(220, 232, 242, ${0.24 + (1 - warmth) * 0.12})`);
    halo.addColorStop(0.55, warmth > 0.5
      ? 'rgba(248, 230, 190, 0.10)'
      : 'rgba(180, 198, 214, 0.08)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 1000, 1000);

    // Subtle slanted sun/moon light rays drifting softly
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      const rx = 250 + i * 165 + Math.sin(t * 0.18 + i * 1.4) * 24;
      const beam = ctx.createLinearGradient(rx, 0, rx + 190, 880);
      const alpha = (0.045 + Math.sin(t * 0.25 + i) * 0.02) * (0.55 + warmth * 0.45);
      beam.addColorStop(0, `rgba(255, 244, 214, ${alpha})`);
      beam.addColorStop(0.7, `rgba(255, 240, 200, ${alpha * 0.35})`);
      beam.addColorStop(1, 'rgba(255, 240, 200, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(rx - 55, 0);
      ctx.lineTo(rx + 65, 0);
      ctx.lineTo(rx + 290, 920);
      ctx.lineTo(rx + 95, 920);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Subtle handmade washi texture
    if (grainPattern) {
      ctx.save();
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, 1000, 1000);
      ctx.restore();
    }
  }

  function drawPotAndMoss(t, warmth) {
    // Soft grounded shadow directly beneath pot (no stand, no frame)
    const shGrad = ctx.createRadialGradient(490, 875, 40, 490, 875, 235);
    shGrad.addColorStop(0, 'rgba(22, 26, 30, 0.42)');
    shGrad.addColorStop(0.65, 'rgba(22, 26, 30, 0.16)');
    shGrad.addColorStop(1, 'rgba(22, 26, 30, 0)');
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(490, 876, 232, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pot bracket feet
    const footColor = mixHex(0x1b2b33, 0x263942, warmth);
    const feetX = [342, 412, 568, 638];
    for (const fx of feetX) {
      ctx.fillStyle = footColor;
      ctx.beginPath();
      ctx.moveTo(fx - 15, 860);
      ctx.lineTo(fx + 15, 860);
      ctx.lineTo(fx + 10, 874);
      ctx.lineTo(fx - 10, 874);
      ctx.closePath();
      ctx.fill();
    }

    // Pot main ceramic body (chamfered tokoname basin)
    const potGrad = ctx.createLinearGradient(312, 800, 668, 860);
    potGrad.addColorStop(0, mixHex(0x3a5d69, 0x456b75, warmth));
    potGrad.addColorStop(0.26, mixHex(0x2d4b57, 0x375964, warmth));
    potGrad.addColorStop(0.75, mixHex(0x1e353f, 0x26404a, warmth));
    potGrad.addColorStop(1, mixHex(0x172931, 0x1e323b, warmth));

    ctx.beginPath();
    ctx.moveTo(318, 800);
    ctx.lineTo(662, 800);
    ctx.quadraticCurveTo(664, 845, 646, 861);
    ctx.lineTo(334, 861);
    ctx.quadraticCurveTo(316, 845, 318, 800);
    ctx.closePath();
    ctx.fillStyle = potGrad;
    ctx.fill();

    // Subtle horizontal throwing rings on pot face
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.lineWidth = 1.2;
    for (const ry of [818, 834, 848]) {
      ctx.beginPath();
      ctx.moveTo(324, ry);
      ctx.lineTo(656, ry);
      ctx.stroke();
    }

    // Ceramic stoneware speckles
    for (const sp of potSpeckles) {
      ctx.fillStyle = sp.light
        ? `rgba(210, 224, 220, ${sp.a})`
        : `rgba(14, 24, 28, ${sp.a * 1.2})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pot top rim (curved chamfered lip)
    const rimGrad = ctx.createLinearGradient(308, 790, 672, 804);
    rimGrad.addColorStop(0, mixHex(0x5b7c84, 0x6a8a8e, warmth));
    rimGrad.addColorStop(0.35, mixHex(0x41616b, 0x4d6f78, warmth));
    rimGrad.addColorStop(1, mixHex(0x284049, 0x314c54, warmth));

    ctx.beginPath();
    ctx.roundRect(308, 788, 364, 15, 6);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Thin rim highlight
    ctx.beginPath();
    ctx.moveTo(315, 790);
    ctx.lineTo(656, 790);
    ctx.strokeStyle = 'rgba(235, 245, 242, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rim underside shadow
    ctx.beginPath();
    ctx.moveTo(318, 804);
    ctx.lineTo(662, 804);
    ctx.strokeStyle = 'rgba(10, 18, 22, 0.42)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dark rich soil mound tucked inside the rim
    ctx.beginPath();
    ctx.moveTo(324, 790);
    ctx.quadraticCurveTo(490, 770, 656, 790);
    ctx.closePath();
    ctx.fillStyle = '#2d2621';
    ctx.fill();

    // Velvet cushion moss mounds
    for (const m of mossMounds) {
      const mGrad = ctx.createRadialGradient(m.x - 8, m.y - 6, 4, m.x, m.y, m.rx);
      mGrad.addColorStop(0, m.c === 0
        ? mixHex(0x5b8a4b, 0x76a64c, warmth)
        : mixHex(0x4a7740, 0x649442, warmth));
      mGrad.addColorStop(0.7, mixHex(0x2f5330, 0x416832, warmth));
      mGrad.addColorStop(1, mixHex(0x1f3a22, 0x2c4a24, warmth));
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // Fine moss tufts and glowing sporophyte dew beads
    for (const tuft of mossTufts) {
      const sway = Math.sin(t * 1.4 + tuft.phase) * 0.9;
      ctx.beginPath();
      ctx.moveTo(tuft.x, tuft.y);
      ctx.lineTo(tuft.x + tuft.tilt * 4 + sway, tuft.y - tuft.h);
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = tuft.bright > 0.5
        ? mixHex(0x6ea055, 0x91bf56, warmth)
        : mixHex(0x436d3a, 0x5c893c, warmth);
      ctx.stroke();

      if (tuft.hasSpore) {
        const sx = tuft.x + tuft.tilt * 6 + sway * 1.8;
        const sy = tuft.y - tuft.sporeH;
        ctx.beginPath();
        ctx.moveTo(tuft.x, tuft.y - 2);
        ctx.quadraticCurveTo(tuft.x + sway, tuft.y - tuft.sporeH * 0.5, sx, sy);
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(182, 206, 118, 0.72)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = warmth > 0.5 ? '#f5df86' : '#d2e8a4';
        ctx.fill();
      }
    }

    // Two river-smoothed slate stones nestled in the moss (san-zon-seki balance)
    drawStone(568, 783, 30, 15, -0.08, warmth);
    drawStone(374, 787, 17, 9, 0.10, warmth);
  }

  function drawStone(cx, cy, rx, ry, rot, warmth) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    const sGrad = ctx.createLinearGradient(-rx, -ry, rx, ry);
    sGrad.addColorStop(0, mixHex(0x747e88, 0x86857f, warmth));
    sGrad.addColorStop(0.55, mixHex(0x4a535c, 0x565754, warmth));
    sGrad.addColorStop(1, mixHex(0x2c3238, 0x353636, warmth));

    ctx.beginPath();
    ctx.moveTo(-rx, ry * 0.45);
    ctx.bezierCurveTo(-rx * 0.95, -ry * 0.7, -rx * 0.25, -ry * 1.05, rx * 0.2, -ry * 0.9);
    ctx.bezierCurveTo(rx * 0.75, -ry * 0.75, rx * 1.05, -ry * 0.1, rx * 0.95, ry * 0.48);
    ctx.quadraticCurveTo(0, ry * 0.65, -rx, ry * 0.45);
    ctx.closePath();
    ctx.fillStyle = sGrad;
    ctx.fill();

    // Subtle mineral stratum line
    ctx.beginPath();
    ctx.moveTo(-rx * 0.65, -ry * 0.15);
    ctx.quadraticCurveTo(0, -ry * 0.35, rx * 0.68, -ry * 0.08);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function drawBarkDetails(t, warmth) {
    for (const m of barkMarks) {
      const w = windOffset(m.x, m.y, m.flex, 0, t);
      const x = m.x + w.dx;
      const y = m.y + w.dy;
      if (m.isLichen) {
        ctx.beginPath();
        ctx.arc(x, y, m.lichenR, 0, Math.PI * 2);
        ctx.fillStyle = warmth > 0.5
          ? 'rgba(182, 198, 134, 0.34)'
          : 'rgba(156, 186, 166, 0.30)';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(m.ang) * m.len * 0.5, y - Math.sin(m.ang) * m.len * 0.5);
        ctx.lineTo(x + Math.cos(m.ang) * m.len * 0.5, y + Math.sin(m.ang) * m.len * 0.5);
        ctx.strokeStyle = 'rgba(26, 22, 24, 0.34)';
        ctx.lineWidth = 1.25;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
  }

  function drawLeafPad(padObj, t, warmth) {
    for (const leaf of padObj.leaves) {
      const w = windOffset(leaf.x, leaf.y, leaf.flex, leaf.branchPhase, t);
      const flutter = Math.sin(t * 2.6 + leaf.phase) * 0.11 + Math.sin(t * 1.1 + leaf.branchPhase) * 0.07;
      const col = getLeafColor(leaf.shade, warmth);
      drawGinkgoLeaf(
        leaf.x + w.dx,
        leaf.y + w.dy,
        leaf.size,
        leaf.baseAngle + flutter,
        col,
        0.96
      );

      // Occasional subtle sunlit catchlight on uppermost leaves
      if (leaf.shade < 0.18 && leaf.glintSeed > 0.72) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.7 + leaf.phase * 2);
        if (pulse > 0.55) {
          ctx.beginPath();
          ctx.arc(leaf.x + w.dx, leaf.y + w.dy - leaf.size * 0.55, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 250, 214, ${(pulse - 0.55) * 0.9})`;
          ctx.fill();
        }
      }
    }
  }

  function updateAndDrawFallingLeaves(dt, t, warmth) {
    leafSpawnTimer -= dt;
    if (leafSpawnTimer <= 0) {
      leafSpawnTimer = 2.6 + rng() * 3.2;
      // Pick a random sunlit leaf from one of the foliage pads
      const padObj = allLeafPads[Math.floor(rng() * allLeafPads.length)];
      const src = padObj.leaves[Math.floor(rng() * padObj.leaves.length)];
      const w = windOffset(src.x, src.y, src.flex, src.branchPhase, t);
      spawnFallingLeaf(src.x + w.dx, src.y + w.dy, src.shade * 0.7);
    }

    for (let i = fallingLeaves.length - 1; i >= 0; i--) {
      const fl = fallingLeaves[i];
      if (!fl.landed) {
        const swayX = Math.sin(t * 2.2 + fl.swayPhase) * 24;
        const breeze = 10 + Math.sin(t * 0.6) * 8;
        fl.x += (fl.vx + swayX + breeze) * dt;
        fl.y += (fl.vy + Math.cos(t * 2.5 + fl.swayPhase) * 6) * dt;
        fl.rot += (fl.spin + Math.sin(t * 3 + fl.swayPhase) * 0.8) * dt;

        // Land softly if over the moss/pot area or drift down smoothly
        const overPot = fl.x > 335 && fl.x < 645;
        if (overPot && fl.y >= fl.landY) {
          fl.y = fl.landY;
          fl.landed = true;
        } else if (fl.y > 885 || fl.x > 960 || fl.x < 40) {
          fl.alpha -= dt * 1.4;
          if (fl.alpha <= 0) {
            fallingLeaves.splice(i, 1);
            continue;
          }
        }
      } else {
        fl.restTime += dt;
        if (fl.restTime > 3.5) {
          fl.alpha -= dt * 0.45;
          if (fl.alpha <= 0) {
            fallingLeaves.splice(i, 1);
            continue;
          }
        }
      }

      const col = getLeafColor(fl.shade, warmth);
      drawGinkgoLeaf(fl.x, fl.y, fl.size, fl.rot, col, fl.alpha);
    }
  }

  function updateAndDrawMotes(dt, t, warmth) {
    for (const m of motes) {
      m.y += m.speedY * dt;
      if (m.y < 85) {
        m.y = 835;
        m.x = 120 + rng() * 760;
      }
      const x = m.x + Math.sin(t * 0.55 + m.phase) * m.driftAmp;
      const pulse = 0.45 + 0.55 * Math.sin(t * 1.9 + m.phase * 2.1);

      if (m.isFirefly) {
        // Warm amber-lime twilight fireflies glow brighter as warmth softens
        const ffVis = lerp(0.88, 0.25, warmth) * pulse;
        const glow = ctx.createRadialGradient(x, m.y, 0.5, x, m.y, m.r * 5.2);
        glow.addColorStop(0, `rgba(255, 244, 168, ${ffVis})`);
        glow.addColorStop(0.45, `rgba(232, 224, 118, ${ffVis * 0.38})`);
        glow.addColorStop(1, 'rgba(232, 224, 118, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, m.y, m.r * 5.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Golden pollen specks in sunlit air
        const pVis = lerp(0.18, 0.48, warmth) * pulse;
        ctx.beginPath();
        ctx.arc(x, m.y, m.r * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 246, 206, ${pVis})`;
        ctx.fill();
      }
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    simTime += dt;

    // Decay pointer breeze energy smoothly
    pointer.energy *= Math.pow(0.25, dt);
    pointer.vx *= Math.pow(0.15, dt);
    pointer.vy *= Math.pow(0.15, dt);

    // 48-second smooth eternal light cycle between honeyed afternoon & misty twilight
    const cycle = 0.5 + 0.5 * Math.cos((simTime / 48) * Math.PI * 2);
    const warmth = smoothstep(cycle);

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fill outer margin cleanly if viewport isn't strictly 1:1
    ctx.fillStyle = mixHex(0x637586, 0xc9d1c6, warmth);
    ctx.fillRect(0, 0, vw, vh);

    ctx.translate(offsetX, offsetY);
    ctx.scale(sceneScale, sceneScale);

    // 1. Atmospheric alcove backdrop
    drawBackground(simTime, warmth);

    // 2. Back-depth branch & foliage pad (behind main trunk)
    for (const br of branchConfigs) {
      if (!br.behindTrunk) continue;
      drawWoodSpline(br.pts, simTime, br.phase, warmth);
      for (const tw of br.twigs) {
        drawWoodSpline(tw, simTime, br.phase + 0.5, warmth);
      }
    }
    for (const padObj of allLeafPads) {
      if (padObj.behindTrunk) drawLeafPad(padObj, simTime, warmth);
    }

    // 3. Ceramic pot, velvet moss & slate stones
    drawPotAndMoss(simTime, warmth);

    // 4. Muscular nebari roots & sculptural trunk
    for (const root of roots) {
      drawWoodSpline(root.pts, simTime, 0, warmth);
    }
    drawWoodSpline(trunkSpine, simTime, 0, warmth);
    drawBarkDetails(simTime, warmth);

    // 5. Foreground branches & fine twigs
    for (const br of branchConfigs) {
      if (br.behindTrunk) continue;
      drawWoodSpline(br.pts, simTime, br.phase, warmth);
      for (const tw of br.twigs) {
        drawWoodSpline(tw, simTime, br.phase + 0.6, warmth);
      }
    }

    // 6. Sculpted Ginkgo foliage pads
    for (const padObj of allLeafPads) {
      if (!padObj.behindTrunk) drawLeafPad(padObj, simTime, warmth);
    }

    // 7. Drifting & settling leaves + ambient fireflies/pollen
    updateAndDrawFallingLeaves(dt, simTime, warmth);
    updateAndDrawMotes(dt, simTime, warmth);

    ctx.restore();

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
  "title": "Glimmer-Gale Ginkgo",
  "statement": "An ancient silver-barked ginkgo trained in graceful S-curved balance over a glazed celadon basin, its fan-leaf clouds shimmering softly between honeyed afternoon light and firefly dusk."
}
```