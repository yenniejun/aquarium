```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Glass-Bellied Angler</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      background: transparent;
      touch-action: pan-y;
    }
  </style>
</head>
<body>
<canvas id="plate"></canvas>
<script>
(() => {
  const canvas = document.getElementById('plate');
  const ctx = canvas.getContext('2d');

  const VW = 600;
  const VH = 800;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let viewScale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let strokeBoost = 1;

  // Deterministic pseudo-random table for organic hand-drawn jitter
  const NOISE_LEN = 256;
  const noiseTable = new Float32Array(NOISE_LEN);
  let seed = 73856093;
  for (let i = 0; i < NOISE_LEN; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    noiseTable[i] = (seed / 4294967295) * 2 - 1;
  }
  function nAt(idx) {
    return noiseTable[((idx % NOISE_LEN) + NOISE_LEN) % NOISE_LEN];
  }

  // Ink & Watercolor Palette
  const INK = '#1c1816';
  const INK_SOFT = 'rgba(34, 28, 25, ';
  const WASH_SLATE = 'rgba(54, 65, 80, ';
  const WASH_PLUM = 'rgba(104, 58, 72, ';
  const WASH_TEAL = 'rgba(84, 146, 140, ';
  const WASH_OCHRE = 'rgba(174, 130, 62, ';
  const WASH_BARK = 'rgba(88, 78, 62, ';
  const WASH_MOSS = 'rgba(84, 98, 68, ';
  const WASH_PALE = 'rgba(232, 226, 212, ';

  // Pointer & curiosity state
  const pointer = {
    x: 420,
    y: 260,
    active: false,
    lastMove: 0,
    smoothX: 420,
    smoothY: 260,
    tension: 0
  };

  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const px = (clientX - rect.left - offsetX) / viewScale;
    const py = (clientY - rect.top - offsetY) / viewScale;
    pointer.x = px;
    pointer.y = py;
    pointer.active = true;
    pointer.lastMove = performance.now();
  }

  window.addEventListener('pointermove', (e) => {
    updatePointer(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, { passive: true });

  function resize() {
    width = window.innerWidth || document.documentElement.clientWidth;
    height = window.innerHeight || document.documentElement.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));

    viewScale = Math.min(width / VW, height / VH);
    offsetX = (width - VW * viewScale) * 0.5;
    offsetY = (height - VH * viewScale) * 0.5;

    // Keep ink crisp at small thumbnail sizes without thickening large views
    strokeBoost = viewScale < 0.65 ? Math.min(1.85, 0.65 / Math.max(0.22, viewScale)) : 1;
  }

  window.addEventListener('resize', resize);
  resize();

  // Creature state
  let t = 0;
  let lastTime = performance.now();
  let tailTwitch = 0;
  let nextTwitch = 2.4;

  // Eyes suspended inside the glass belly
  const eyes = [
    { rx: -20, ry: -28, r: 13.5, iris: WASH_OCHRE, blink: 0, nextBlink: 1.8, seed: 11 },
    { rx: 16,  ry: -34, r: 10.5, iris: WASH_TEAL,  blink: 0, nextBlink: 3.1, seed: 23 },
    { rx: -3,  ry: -4,  r: 16.5, iris: WASH_PLUM,  blink: 0, nextBlink: 4.4, seed: 37 },
    { rx: -28, ry: 12,  r: 9.5,  iris: WASH_SLATE, blink: 0, nextBlink: 2.3, seed: 53 },
    { rx: 24,  ry: 4,   r: 12.0, iris: WASH_OCHRE, blink: 0, nextBlink: 5.0, seed: 71 },
    { rx: 6,   ry: 28,  r: 11.0, iris: WASH_TEAL,  blink: 0, nextBlink: 1.4, seed: 89 },
    { rx: -15, ry: 40,  r: 8.0,  iris: WASH_PLUM,  blink: 0, nextBlink: 3.9, seed: 103 },
    { rx: 22,  ry: 35,  r: 7.5,  iris: WASH_SLATE, blink: 0, nextBlink: 2.9, seed: 127 }
  ];

  // Drifting motes of drained warmth & pale lure sparks
  const motes = [];
  for (let i = 0; i < 24; i++) {
    motes.push({
      kind: i < 15 ? 'ember' : 'lure',
      phase: (i / 24) * Math.PI * 2,
      speed: 0.25 + (i % 5) * 0.08,
      radius: 1.2 + (i % 4) * 0.65,
      seed: i * 17 + 3
    });
  }

  // Spring state for hanging lure
  const lureState = {
    angle: 0,
    vel: 0,
    nod: 0
  };

  // --- Drawing Helpers (Ink & Watercolor) ---

  function wLine(base) {
    return base * strokeBoost;
  }

  // Organic quadratic spline with subtle living ink tremor
  function buildSketchPath(pts, closed, seedId, jitterAmp, timePhase) {
    if (pts.length < 2) return;
    const jPts = [];
    for (let i = 0; i < pts.length; i++) {
      const n1 = nAt(seedId + i * 3);
      const n2 = nAt(seedId + i * 3 + 1);
      const wave = Math.sin(timePhase * 1.9 + i * 1.4 + seedId) * 0.45;
      jPts.push({
        x: pts[i][0] + (n1 + wave) * jitterAmp,
        y: pts[i][1] + (n2 - wave) * jitterAmp
      });
    }

    ctx.beginPath();
    if (closed) {
      const mid0x = (jPts[jPts.length - 1].x + jPts[0].x) * 0.5;
      const mid0y = (jPts[jPts.length - 1].y + jPts[0].y) * 0.5;
      ctx.moveTo(mid0x, mid0y);
      for (let i = 0; i < jPts.length; i++) {
        const next = jPts[(i + 1) % jPts.length];
        const mx = (jPts[i].x + next.x) * 0.5;
        const my = (jPts[i].y + next.y) * 0.5;
        ctx.quadraticCurveTo(jPts[i].x, jPts[i].y, mx, my);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(jPts[0].x, jPts[0].y);
      for (let i = 1; i < jPts.length - 1; i++) {
        const mx = (jPts[i].x + jPts[i + 1].x) * 0.5;
        const my = (jPts[i].y + jPts[i + 1].y) * 0.5;
        ctx.quadraticCurveTo(jPts[i].x, jPts[i].y, mx, my);
      }
      const last = jPts[jPts.length - 1];
      ctx.lineTo(last.x, last.y);
    }
  }

  function inkStroke(pts, opts = {}) {
    const {
      closed = false,
      width = 1.6,
      alpha = 0.88,
      jitter = 1.1,
      seedId = 1,
      double = true,
      color = INK
    } = opts;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = wLine(width);
    buildSketchPath(pts, closed, seedId, jitter, t);
    ctx.stroke();

    if (double) {
      ctx.globalAlpha = alpha * 0.34;
      ctx.lineWidth = wLine(width * 0.65);
      buildSketchPath(pts, closed, seedId + 41, jitter * 1.8 + 0.5, t * 0.8 + 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Layered translucent watercolor wash with wet-edge pooling
  function washShape(pts, colorPrefix, alpha, seedId, edgeAlpha = 0.12) {
    ctx.save();
    // Primary translucent wash
    ctx.fillStyle = colorPrefix + alpha + ')';
    buildSketchPath(pts, true, seedId, 1.4, t * 0.25);
    ctx.fill();

    // Subtle offset bleed layer
    ctx.fillStyle = colorPrefix + (alpha * 0.55) + ')';
    buildSketchPath(pts, true, seedId + 19, 2.8, t * 0.2 + 2);
    ctx.fill();

    // Wet-edge pigment ring
    if (edgeAlpha > 0) {
      ctx.strokeStyle = colorPrefix + edgeAlpha + ')';
      ctx.lineWidth = wLine(2.6);
      buildSketchPath(pts, true, seedId + 7, 1.5, t * 0.25);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Fine scratchy ink hatching lines between pairs of points or along a curve
  function hatchStrokes(lines, alpha = 0.42, width = 0.8) {
    ctx.save();
    ctx.strokeStyle = INK_SOFT + alpha + ')';
    ctx.lineWidth = wLine(width);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      ctx.moveTo(l[0], l[1]);
      ctx.lineTo(l[2], l[3]);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawTaperedLimb(pts, widths, washColor, washAlpha, seedId, hatchSide = 1) {
    const left = [];
    const right = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      let dx = next[0] - prev[0];
      let dy = next[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const nx = -dy;
      const ny = dx;
      const hw = widths[i] * 0.5;
      left.push([p[0] + nx * hw, p[1] + ny * hw]);
      right.unshift([p[0] - nx * hw, p[1] - ny * hw]);
    }
    const poly = left.concat(right);
    washShape(poly, washColor, washAlpha, seedId, washAlpha * 0.55);

    // Cross-hatching along shaded side
    const hLines = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const segLen = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const steps = Math.max(2, Math.floor(segLen / 7));
      for (let s = 1; s < steps; s++) {
        const u = s / steps;
        const cx = p0[0] + (p1[0] - p0[0]) * u;
        const cy = p0[1] + (p1[1] - p0[1]) * u;
        const w = (widths[i] + (widths[i + 1] - widths[i]) * u) * 0.45;
        let dx = p1[0] - p0[0];
        let dy = p1[1] - p0[1];
        const l = Math.hypot(dx, dy) || 1;
        dx /= l; dy /= l;
        const nx = -dy * hatchSide;
        const ny = dx * hatchSide;
        hLines.push([
          cx + nx * w * 0.15,
          cy + ny * w * 0.15,
          cx + nx * w + dx * 2.5,
          cy + ny * w + dy * 2.5
        ]);
      }
    }
    hatchStrokes(hLines, 0.36, 0.75);

    inkStroke(left, { width: 1.5, jitter: 0.7, seedId });
    inkStroke(right.slice().reverse(), { width: 1.35, jitter: 0.7, seedId: seedId + 9 });
  }

  // --- Creature Anatomical Parts ---

  function drawPerch() {
    // Weathered dead branch / root sweeping across lower frame
    const topEdge = [
      [88, 704], [148, 682], [218, 662], [295, 650], [365, 646], [438, 655], [505, 672]
    ];
    const botEdge = [
      [496, 688], [430, 678], [360, 674], [285, 682], [212, 695], [145, 718], [94, 725]
    ];
    const branchPoly = topEdge.concat(botEdge);

    washShape(branchPoly, WASH_BARK, 0.24, 3, 0.14);

    // Moss & damp lichen blotches
    washShape([[195, 660], [238, 652], [262, 664], [218, 676]], WASH_MOSS, 0.22, 15, 0.08);
    washShape([[335, 644], [382, 643], [395, 660], [345, 663]], WASH_MOSS, 0.20, 29, 0.08);
    washShape([[132, 688], [168, 678], [176, 694], [138, 704]], WASH_SLATE, 0.15, 43, 0.05);

    // Little broken twig spur on left
    const spur = [[175, 674], [150, 652], [138, 645], [146, 658], [166, 680]];
    washShape(spur, WASH_BARK, 0.22, 51, 0.1);
    inkStroke([[175, 674], [150, 652], [138, 645]], { width: 1.3, seedId: 52 });
    inkStroke([[138, 645], [146, 658], [166, 680]], { width: 1.1, seedId: 55 });

    // Bark grain & underside hatching
    const barkLines = [];
    for (let i = 0; i < 18; i++) {
      const x = 115 + i * 20 + nAt(i) * 5;
      const y = 668 - Math.sin((x - 90) / 400 * Math.PI) * 18;
      barkLines.push([x, y + 6, x + 16, y + 4 + nAt(i + 8) * 3]);
      barkLines.push([x + 3, y + 14, x + 9, y + 23]);
    }
    hatchStrokes(barkLines, 0.34, 0.8);

    // Fade tips softly without harsh closed caps
    inkStroke(topEdge, { width: 1.75, alpha: 0.85, jitter: 1.1, seedId: 61 });
    inkStroke(botEdge.slice().reverse(), { width: 1.5, alpha: 0.72, jitter: 1.2, seedId: 67 });
  }

  function drawTail(breath, twitch) {
    // Long segmented tail coiling beneath the perch, tipped with a cracked glass bell-pod
    const sw = Math.sin(t * 1.35) * 8 + twitch * 22;
    const pts = [
      [212, 468],
      [168, 512],
      [142, 580],
      [158, 655],
      [228, 704 + sw * 0.2],
      [325, 706 + sw * 0.35],
      [405, 692 + sw * 0.6],
      [448, 658 + sw]
    ];
    const widths = [18, 13, 10.5, 8.5, 7, 5.5, 4, 2.5];
    drawTaperedLimb(pts, widths, WASH_SLATE, 0.25, 91, 1);

    // Segmented chitin/ink rings along tail
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i];
      inkStroke([[p[0] - 3, p[1] - 4], [p[0] + 3, p[1] + 4]], {
        width: 1.1, alpha: 0.6, jitter: 0.4, seedId: 100 + i, double: false
      });
    }

    // Cracked glass bell-pod at tail tip
    const tip = pts[pts.length - 1];
    const bellPts = [
      [tip[0] - 2, tip[1] - 2],
      [tip[0] + 10, tip[1] - 11],
      [tip[0] + 18, tip[1] + 1],
      [tip[0] + 11, tip[1] + 13],
      [tip[0] - 1, tip[1] + 7]
    ];
    washShape(bellPts, WASH_TEAL, 0.24, 117, 0.14);
    inkStroke(bellPts, { closed: true, width: 1.2, jitter: 0.6, seedId: 118 });
    // Tiny eye/filament inside tail bell
    ctx.save();
    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(tip[0] + 8, tip[1] + 1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHindLeg(isNear, hip, knee, ankle, foot, seedBase) {
    const alphaMult = isNear ? 1 : 0.72;
    const wash = isNear ? WASH_SLATE : WASH_BARK;
    ctx.save();
    ctx.globalAlpha = alphaMult;

    drawTaperedLimb(
      [hip, knee, ankle, foot],
      [isNear ? 22 : 18, 11, 7.5, 5.5],
      wash,
      isNear ? 0.28 : 0.20,
      seedBase,
      isNear ? -1 : 1
    );

    // Knobby joint swellings
    washShape([
      [knee[0] - 6, knee[1] - 6],
      [knee[0] + 7, knee[1] - 5],
      [knee[0] + 5, knee[1] + 7],
      [knee[0] - 7, knee[1] + 5]
    ], WASH_PLUM, 0.2, seedBase + 5, 0.08);

    // Bird-like talons gripping the branch
    const claws = [
      [foot, [foot[0] - 12, foot[1] + 10], [foot[0] - 16, foot[1] + 19]],
      [foot, [foot[0] + 4, foot[1] + 14], [foot[0] - 1, foot[1] + 24]],
      [foot, [foot[0] + 16, foot[1] + 11], [foot[0] + 14, foot[1] + 21]],
      [foot, [foot[0] - 13, foot[1] - 3], [foot[0] - 21, foot[1] + 4]]
    ];
    for (let i = 0; i < claws.length; i++) {
      inkStroke(claws[i], { width: 1.5, jitter: 0.5, seedId: seedBase + 20 + i * 3 });
    }
    ctx.restore();
  }

  function drawGlassBellyAndEyes(breath, tension, spineShiftX, spineShiftY) {
    const cx = 278 + spineShiftX * 0.6;
    const cy = 426 + breath * 3.5 + spineShiftY * 0.4;
    const rx = 56 + breath * 2.2;
    const ry = 76 - breath * 1.4;

    // Teardrop / alembic glass sac contour
    const sacPts = [
      [cx - 8,  cy - ry],
      [cx + 34, cy - ry * 0.72],
      [cx + rx, cy - ry * 0.1],
      [cx + rx * 0.88, cy + ry * 0.56],
      [cx + 22, cy + ry],
      [cx - 26, cy + ry * 0.94],
      [cx - rx * 0.96, cy + ry * 0.42],
      [cx - rx * 0.92, cy - ry * 0.28],
      [cx - 40, cy - ry * 0.82]
    ];

    // Inner cold luminescence
    const glow = ctx.createRadialGradient(cx + 6, cy - 8, 8, cx, cy, ry * 1.15);
    glow.addColorStop(0, 'rgba(130, 195, 185, 0.24)');
    glow.addColorStop(0.55, 'rgba(72, 108, 120, 0.16)');
    glow.addColorStop(1, 'rgba(54, 48, 66, 0.04)');
    ctx.save();
    buildSketchPath(sacPts, true, 201, 1.0, t * 0.3);
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.restore();

    // Multi-pigment murky fluid wash inside the belly
    washShape(sacPts, WASH_SLATE, 0.16, 205, 0.14);

    // Sloshing fluid meniscus inside lower 65% of glass sac
    ctx.save();
    buildSketchPath(sacPts, true, 201, 1.0, t * 0.3);
    ctx.clip();

    const tilt = Math.sin(t * 1.1) * 5 + (pointer.smoothX - cx) * 0.015;
    const liqY = cy - 16 + breath * 2;
    const liqPoly = [
      [cx - rx - 15, liqY - tilt],
      [cx - 18, liqY + Math.sin(t * 2.1) * 3],
      [cx + 22, liqY - Math.cos(t * 1.8) * 3],
      [cx + rx + 15, liqY + tilt],
      [cx + rx + 15, cy + ry + 20],
      [cx - rx - 15, cy + ry + 20]
    ];
    washShape(liqPoly, WASH_PLUM, 0.17, 219, 0.09);

    // Draw the 8 suspended watching eyes inside the clipped sac
    for (let i = 0; i < eyes.length; i++) {
      const e = eyes[i];
      const bobX = Math.sin(t * 0.9 + e.seed) * 2.3;
      const bobY = Math.cos(t * 1.15 + e.seed) * 2.8;
      const ex = cx + e.rx + bobX;
      const ey = cy + e.ry + bobY;

      // Sclera wash (warm pale parchment tint, semi-translucent)
      ctx.save();
      ctx.fillStyle = WASH_PALE + '0.68)';
      ctx.beginPath();
      ctx.ellipse(ex, ey, e.r, e.r * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gaze vector toward visitor pointer (or idle drift)
      let gx = pointer.smoothX - ex;
      let gy = pointer.smoothY - ey;
      const gDist = Math.hypot(gx, gy) || 1;
      const maxOffset = e.r * 0.34;
      const pull = Math.min(1, gDist / 120) * maxOffset;
      gx = (gx / gDist) * pull;
      gy = (gy / gDist) * pull * 0.75;

      // Blink compression
      const openScale = Math.max(0.05, 1 - e.blink);

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ex, ey, e.r, e.r * 0.78 * openScale, 0, 0, Math.PI * 2);
      ctx.clip();

      // Iris watercolor wash
      ctx.fillStyle = e.iris + '0.72)';
      ctx.beginPath();
      ctx.arc(ex + gx, ey + gy, e.r * 0.56, 0, Math.PI * 2);
      ctx.fill();

      // Pupil (dilates slightly with tension/proximity)
      const pupilR = e.r * (0.26 + tension * 0.10);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(ex + gx, ey + gy, pupilR * 0.88, pupilR * 1.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tiny pale specular dot
      ctx.fillStyle = 'rgba(248, 245, 236, 0.85)';
      ctx.beginPath();
      ctx.arc(ex + gx - pupilR * 0.45, ey + gy - pupilR * 0.45, Math.max(1, e.r * 0.13), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ink outline of eyelid
      ctx.strokeStyle = INK_SOFT + '0.82)';
      ctx.lineWidth = wLine(1.15);
      ctx.beginPath();
      ctx.ellipse(ex, ey, e.r, e.r * 0.78 * openScale, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Tiny nerve tendrils holding eye in fluid
      ctx.strokeStyle = INK_SOFT + '0.28)';
      ctx.lineWidth = wLine(0.75);
      ctx.beginPath();
      ctx.moveTo(ex, ey - e.r * 0.78 * openScale);
      ctx.quadraticCurveTo(ex + nAt(e.seed) * 8, ey - e.r * 1.6, ex + nAt(e.seed + 2) * 14, ey - e.r * 2.2);
      ctx.stroke();
      ctx.restore();
    }

    // Glass facet reflections & hairline cracks
    ctx.strokeStyle = 'rgba(245, 242, 232, 0.48)';
    ctx.lineWidth = wLine(1.5);
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.62, cy - ry * 0.52);
    ctx.quadraticCurveTo(cx - rx * 0.78, cy - ry * 0.1, cx - rx * 0.68, cy + ry * 0.35);
    ctx.stroke();

    // Hairline ink crack on lower right of glass
    inkStroke([
      [cx + rx * 0.72, cy + ry * 0.18],
      [cx + rx * 0.48, cy + ry * 0.28],
      [cx + rx * 0.38, cy + ry * 0.46],
      [cx + rx * 0.25, cy + ry * 0.52]
    ], { width: 0.9, alpha: 0.55, jitter: 0.4, seedId: 251, double: false });

    ctx.restore(); // end sac clip

    // Sac outer ink contour
    inkStroke(sacPts, { closed: true, width: 1.5, alpha: 0.85, jitter: 0.9, seedId: 201 });
  }

  function drawTorsoAndRibs(breath, tension, spineShiftX, spineShiftY) {
    // Hunched spine & shoulders
    const pelvis = [212, 466];
    const midBack = [218 + spineShiftX * 0.4, 368 + spineShiftY * 0.5 - breath * 2];
    const hump = [268 + spineShiftX * 0.8, 294 + spineShiftY - breath * 3];
    const shoulder = [322 + spineShiftX, 298 + spineShiftY - breath * 2.5];

    const backLine = [
      [pelvis[0] - 10, pelvis[1] + 6],
      [196 + spineShiftX * 0.2, 415],
      [midBack[0] - 16, midBack[1]],
      [hump[0] - 10, hump[1] - 12],
      [shoulder[0] + 10, shoulder[1] - 8],
      [shoulder[0] + 16, shoulder[1] + 22],
      [274 + spineShiftX * 0.5, 342],
      [238, 430],
      [pelvis[0] + 16, pelvis[1] + 10]
    ];

    washShape(backLine, WASH_SLATE, 0.30, 301, 0.16);
    washShape([
      [hump[0] - 8, hump[1] - 8],
      [shoulder[0] + 8, shoulder[1] - 4],
      [shoulder[0] + 4, shoulder[1] + 24],
      [midBack[0], midBack[1] + 10]
    ], WASH_PLUM, 0.22, 315, 0.08);

    // Dorsal vertebral ridge spikes
    const ridgePts = [
      [pelvis[0] - 8, pelvis[1]],
      [198 + spineShiftX * 0.2, 414],
      [midBack[0] - 14, midBack[1]],
      [hump[0] - 8, hump[1] - 10],
      [shoulder[0] + 8, shoulder[1] - 6]
    ];
    inkStroke(ridgePts, { width: 2.0, jitter: 1.0, seedId: 305 });
    for (let i = 1; i < ridgePts.length; i++) {
      const p = ridgePts[i];
      inkStroke([[p[0], p[1]], [p[0] - 9, p[1] - 10]], {
        width: 1.3, alpha: 0.75, jitter: 0.4, seedId: 320 + i, double: false
      });
    }

    // Curved ribcage bars wrapping around the glass belly
    const bx = 278 + spineShiftX * 0.6;
    const by = 426 + breath * 3.5 + spineShiftY * 0.4;
    for (let r = 0; r < 5; r++) {
      const u = r / 4;
      const ry = by - 48 + r * 23;
      const startX = 228 + u * 8 + spineShiftX * (0.6 - u * 0.2);
      const endX = bx + 48 - Math.abs(u - 0.45) * 28 + breath * 3;
      const ribPts = [
        [startX, ry - 10],
        [startX + 34, ry + 6],
        [endX - 10, ry + 16],
        [endX, ry + 6]
      ];
      inkStroke(ribPts, { width: 2.2 - u * 0.25, alpha: 0.85, jitter: 0.7, seedId: 340 + r * 7 });
      // Pale bone highlight along top of rib
      inkStroke([ribPts[0], ribPts[1], ribPts[2]], {
        width: 1.0, alpha: 0.35, color: 'rgba(225, 218, 200, 0.7)', jitter: 0.3, seedId: 360 + r, double: false
      });
    }

    // Cross-hatching on back muscles
    const backHatch = [];
    for (let i = 0; i < 12; i++) {
      const hx = 212 + i * 7 + spineShiftX * 0.5;
      const hy = 355 - i * 4.5 + spineShiftY * 0.5;
      backHatch.push([hx, hy, hx + 12, hy + 18]);
    }
    hatchStrokes(backHatch, 0.38, 0.8);
  }

  function drawTrueHead(breath, tension, spineShiftX, spineShiftY) {
    // Low, blind, pale skull tucked forward beneath the hunched shoulders
    const neckBase = [324 + spineShiftX, 314 + spineShiftY - breath * 2];
    const headX = 382 + spineShiftX * 0.9;
    const headY = 352 + spineShiftY * 0.7 + breath * 1.5;

    // Neck
    drawTaperedLimb(
      [neckBase, [neckBase[0] + 28, neckBase[1] + 18], [headX - 8, headY - 4]],
      [26, 20, 17],
      WASH_SLATE,
      0.28,
      401,
      1
    );

    const jawOpen = 6 + (breath * 0.5 + 0.5) * 9 + tension * 7;

    // Upper skull (blind, elongated, sunken sockets)
    const upperSkull = [
      [headX - 16, headY - 14],
      [headX + 8,  headY - 22],
      [headX + 36, headY - 12],
      [headX + 46, headY + 4],
      [headX + 18, headY + 8],
      [headX - 12, headY + 6]
    ];
    washShape(upperSkull, WASH_PALE, 0.55, 411, 0.14);
    washShape(upperSkull, WASH_SLATE, 0.14, 415, 0.08);
    inkStroke(upperSkull, { closed: true, width: 1.6, jitter: 0.8, seedId: 411 });

    // Sunken eyeless socket
    const socket = [
      [headX + 6, headY - 11],
      [headX + 20, headY - 12],
      [headX + 23, headY - 4],
      [headX + 9, headY - 2]
    ];
    washShape(socket, WASH_PLUM, 0.36, 421, 0.16);
    inkStroke(socket, { closed: true, width: 1.1, alpha: 0.7, jitter: 0.5, seedId: 422 });

    // Lower jaw (hinging open while breathing)
    const lowerJaw = [
      [headX - 10, headY + 5],
      [headX + 14, headY + 12 + jawOpen * 0.5],
      [headX + 42, headY + 8 + jawOpen],
      [headX + 34, headY + 18 + jawOpen],
      [headX + 4,  headY + 22 + jawOpen * 0.6],
      [headX - 14, headY + 13]
    ];
    washShape(lowerJaw, WASH_PALE, 0.45, 431, 0.12);
    washShape(lowerJaw, WASH_PLUM, 0.18, 433, 0.08);
    inkStroke(lowerJaw, { closed: true, width: 1.45, jitter: 0.8, seedId: 431 });

    // Dark oral cavity wash
    washShape([
      [headX - 4, headY + 6],
      [headX + 38, headY + 5],
      [headX + 36, headY + 9 + jawOpen],
      [headX - 2, headY + 11]
    ], WASH_PLUM, 0.32, 440, 0.06);

    // Fine baleen / needle teeth along upper and lower jaw
    const teeth = [];
    for (let i = 0; i < 6; i++) {
      const tx = headX + 8 + i * 6;
      teeth.push([tx, headY + 7, tx - 1, headY + 12 + jawOpen * 0.25]);
      teeth.push([tx + 2, headY + 9 + jawOpen * 0.85, tx + 1, headY + 4 + jawOpen * 0.65]);
    }
    hatchStrokes(teeth, 0.72, 0.9);
  }

  function drawStalkAndLure(breath, spineShiftX, spineShiftY) {
    // Arched angler stalk sprouting from hunchback
    const root = [282 + spineShiftX * 0.85, 288 + spineShiftY - breath * 2.5];
    const p1 = [288 + spineShiftX * 0.7, 208];
    const p2 = [322 + spineShiftX * 0.5, 134];
    const p3 = [382 + lureState.angle * 18, 108 + breath * 2];
    const tip = [434 + lureState.angle * 30, 146 + breath * 3];

    drawTaperedLimb([root, p1, p2, p3, tip], [14, 9.5, 6.5, 4.5, 3], WASH_SLATE, 0.28, 501, -1);

    // Braided nerve filaments coiled along the stalk
    inkStroke([
      [root[0] - 4, root[1] - 10],
      [p1[0] + 5, p1[1]],
      [p2[0] - 4, p2[1]],
      [p3[0] + 3, p3[1]],
      [tip[0], tip[1]]
    ], { width: 0.95, alpha: 0.55, jitter: 0.9, seedId: 515, double: false });

    // Hanging thread & porcelain mask-lure
    const maskX = tip[0] + lureState.angle * 16;
    const maskY = tip[1] + 62 + lureState.nod * 6;

    inkStroke([[tip[0], tip[1]], [maskX, maskY - 34]], {
      width: 1.15, alpha: 0.78, jitter: 0.4, seedId: 525, double: false
    });

    // Cold phosphor-teal aura behind the mask
    const halo = ctx.createRadialGradient(maskX, maskY, 4, maskX, maskY, 56);
    halo.addColorStop(0, 'rgba(136, 208, 198, 0.28)');
    halo.addColorStop(0.55, 'rgba(92, 152, 150, 0.11)');
    halo.addColorStop(1, 'rgba(92, 152, 150, 0)');
    ctx.save();
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(maskX, maskY, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(maskX, maskY);
    ctx.rotate(lureState.angle * 0.35);

    // Porcelain mask silhouette
    const maskPts = [
      [0, -35],
      [21, -28],
      [26, -6],
      [21, 18],
      [9, 34],
      [-9, 34],
      [-21, 18],
      [-26, -6],
      [-21, -28]
    ];
    washShape(maskPts, WASH_PALE, 0.84, 531, 0.14);
    washShape([
      [-24, -10], [-14, -26], [0, -34], [-8, 0], [-14, 24], [-22, 14]
    ], WASH_TEAL, 0.15, 537, 0.04);
    inkStroke(maskPts, { closed: true, width: 1.5, jitter: 0.7, seedId: 531 });

    // Hairline crack across forehead & cheek
    inkStroke([
      [11, -31], [7, -18], [13, -8], [10, 2]
    ], { width: 0.85, alpha: 0.6, jitter: 0.4, seedId: 545, double: false });

    // Hollow almond eyeholes glowing faintly
    const eyeL = [[-15, -8], [-8, -12], [-3, -7], [-9, -3]];
    const eyeR = [[3, -7], [8, -12], [15, -8], [9, -3]];
    washShape(eyeL, WASH_SLATE, 0.55, 551, 0.12);
    washShape(eyeR, WASH_SLATE, 0.55, 553, 0.12);
    inkStroke(eyeL, { closed: true, width: 1.15, jitter: 0.35, seedId: 551, double: false });
    inkStroke(eyeR, { closed: true, width: 1.15, jitter: 0.35, seedId: 553, double: false });

    // Tiny pale pinprick reflections inside dark mask sockets
    ctx.fillStyle = 'rgba(180, 236, 228, 0.85)';
    const lookX = Math.max(-2.5, Math.min(2.5, (pointer.smoothX - maskX) * 0.015));
    const lookY = Math.max(-1.5, Math.min(1.5, (pointer.smoothY - maskY) * 0.015));
    ctx.beginPath();
    ctx.arc(-9 + lookX, -7.5 + lookY, 1.5, 0, Math.PI * 2);
    ctx.arc(9 + lookX, -7.5 + lookY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Uncanny serene half-smile
    inkStroke([
      [-12, 13], [-5, 18], [5, 18], [13, 12]
    ], { width: 1.25, alpha: 0.82, jitter: 0.35, seedId: 561, double: false });
    // Faint vertical crease below mouth
    inkStroke([[0, 22], [0, 27]], { width: 0.8, alpha: 0.4, jitter: 0.2, seedId: 565, double: false });

    ctx.restore();

    return { x: maskX, y: maskY };
  }

  function drawForelimb(isNear, shoulder, elbow, wrist, pluckOffset, seedBase, maskPos) {
    ctx.save();
    ctx.globalAlpha = isNear ? 1 : 0.7;

    drawTaperedLimb(
      [shoulder, elbow, wrist],
      [isNear ? 16 : 13, 9, 6],
      isNear ? WASH_SLATE : WASH_BARK,
      isNear ? 0.27 : 0.20,
      seedBase,
      1
    );

    // Delicate, overly long human-like fingers
    const fingers = [
      [wrist, [wrist[0] + 15, wrist[1] - 4 + pluckOffset], [wrist[0] + 29, wrist[1] - 2 + pluckOffset * 1.4]],
      [wrist, [wrist[0] + 19, wrist[1] + 5 - pluckOffset * 0.7], [wrist[0] + 34, wrist[1] + 11 - pluckOffset]],
      [wrist, [wrist[0] + 16, wrist[1] + 13 + pluckOffset * 0.5], [wrist[0] + 28, wrist[1] + 24 + pluckOffset * 0.8]],
      [wrist, [wrist[0] + 9,  wrist[1] + 18], [wrist[0] + 15, wrist[1] + 29]]
    ];

    for (let i = 0; i < fingers.length; i++) {
      inkStroke(fingers[i], { width: 1.25, jitter: 0.5, seedId: seedBase + 30 + i * 4 });
    }

    // Fine gossamer ink threads plucked between fingers and the mask/belly
    if (isNear && maskPos) {
      const tip1 = fingers[0][2];
      const tip2 = fingers[1][2];
      inkStroke([
        [maskPos.x - 10, maskPos.y + 32],
        [(maskPos.x + tip1[0]) * 0.5 + 4, (maskPos.y + tip1[1]) * 0.5],
        tip1
      ], { width: 0.65, alpha: 0.34, jitter: 0.3, seedId: 641, double: false });
      inkStroke([
        [maskPos.x + 8, maskPos.y + 33],
        [(maskPos.x + tip2[0]) * 0.5 - 3, (maskPos.y + tip2[1]) * 0.5],
        tip2
      ], { width: 0.65, alpha: 0.28, jitter: 0.3, seedId: 645, double: false });
    }

    ctx.restore();
  }

  function drawMotes(maskPos, mawX, mawY) {
    ctx.save();
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      const cycle = ((t * m.speed + m.phase) % (Math.PI * 2)) / (Math.PI * 2);

      if (m.kind === 'ember') {
        // Warm golden-amber motes drawn upward from below into the open maw
        const startX = mawX + 26 + nAt(m.seed) * 48;
        const startY = mawY + 135 + nAt(m.seed + 1) * 35;
        const mx = startX + (mawX + 24 - startX) * cycle + Math.sin(t * 2.1 + m.seed) * 6 * (1 - cycle);
        const my = startY + (mawY + 8 - startY) * cycle;
        const alpha = Math.sin(cycle * Math.PI) * 0.62;

        ctx.fillStyle = WASH_OCHRE + alpha + ')';
        ctx.beginPath();
        ctx.arc(mx, my, m.radius * (1 - cycle * 0.4), 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Pale teal sparks circling lazily around the smiling mask
        const ang = t * (m.speed * 2.2) + m.phase;
        const radX = 36 + nAt(m.seed) * 18;
        const radY = 26 + nAt(m.seed + 2) * 16;
        const mx = maskPos.x + Math.cos(ang) * radX;
        const my = maskPos.y + Math.sin(ang * 1.3) * radY;
        const alpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3 + m.seed));

        ctx.fillStyle = WASH_TEAL + alpha + ')';
        ctx.beginPath();
        ctx.arc(mx, my, m.radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // --- Main Animation Loop ---

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    t += dt;

    // Idle autonomous curiosity if pointer hasn't moved recently
    const idleTime = (now - pointer.lastMove) / 1000;
    let targetX = pointer.x;
    let targetY = pointer.y;
    if (!pointer.active || idleTime > 4.5) {
      targetX = 360 + Math.sin(t * 0.55) * 120 + Math.cos(t * 0.23) * 40;
      targetY = 320 + Math.cos(t * 0.42) * 110;
    }
    pointer.smoothX += (targetX - pointer.smoothX) * Math.min(1, dt * 4.2);
    pointer.smoothY += (targetY - pointer.smoothY) * Math.min(1, dt * 4.2);

    // Tension rises gently when pointer comes close to the glass belly or true head
    const distToCore = Math.hypot(pointer.smoothX - 310, pointer.smoothY - 395);
    const targetTension = pointer.active && idleTime < 4.5
      ? Math.max(0, Math.min(1, 1 - (distToCore - 55) / 170))
      : 0;
    pointer.tension += (targetTension - pointer.tension) * Math.min(1, dt * 3.5);

    // Breathing rhythm (quickens slightly under tension)
    const breath = Math.sin(t * (1.45 + pointer.tension * 0.8));

    // Tail twitch impulse
    if (t > nextTwitch) {
      tailTwitch = 1;
      nextTwitch = t + 2.5 + ((nAt(Math.floor(t * 10)) + 1) * 1.8);
    }
    tailTwitch *= Math.exp(-dt * 4.5);

    // Lure damped spring swaying toward visitor
    const desiredAngle = Math.max(-0.48, Math.min(0.48, (pointer.smoothX - 420) * 0.0018))
      + Math.sin(t * 1.1) * 0.07;
    const accel = (desiredAngle - lureState.angle) * 12 - lureState.vel * 3.2;
    lureState.vel += accel * dt;
    lureState.angle += lureState.vel * dt;
    lureState.nod = Math.sin(t * 1.6) * 0.6 + pointer.tension * 0.8;

    // Independent eye blinking
    for (let i = 0; i < eyes.length; i++) {
      const e = eyes[i];
      if (t > e.nextBlink) {
        e.blink = Math.min(1, e.blink + dt * 13);
        if (e.blink >= 1) {
          e.nextBlink = t + 1.8 + ((nAt(e.seed + Math.floor(t)) + 1) * 2.2);
        }
      } else {
        e.blink = Math.max(0, e.blink - dt * 9);
      }
    }

    // Spine defensive recoil when pointer is near
    const spineShiftX = -pointer.tension * 10;
    const spineShiftY = -pointer.tension * 9;

    // Clear transparent canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply DPR + centered 3:4 virtual frame
    ctx.setTransform(
      dpr * viewScale, 0,
      0, dpr * viewScale,
      dpr * offsetX, dpr * offsetY
    );

    // Layer order: back to front
    drawPerch();
    drawTail(breath, tailTwitch);

    // Far hind leg
    drawHindLeg(
      false,
      [246, 466],
      [272, 542],
      [256, 594],
      [270, 650],
      701
    );

    // Far forelimb
    const pluckFar = Math.sin(t * 2.2 + 1.1) * 5;
    drawForelimb(
      false,
      [338 + spineShiftX, 320 + spineShiftY],
      [352 + spineShiftX * 0.5, 405],
      [412, 456 + breath * 2],
      pluckFar,
      741,
      null
    );

    // Core body: Glass belly with watching eyes, ribcage, spine, true skull
    drawGlassBellyAndEyes(breath, pointer.tension, spineShiftX, spineShiftY);
    drawTorsoAndRibs(breath, pointer.tension, spineShiftX, spineShiftY);
    drawTrueHead(breath, pointer.tension, spineShiftX, spineShiftY);

    // Stalk & porcelain lure
    const maskPos = drawStalkAndLure(breath, spineShiftX, spineShiftY);

    // Near hind leg gripping perch
    drawHindLeg(
      true,
      [215, 466],
      [182, 545],
      [218, 608],
      [212, 663],
      781
    );

    // Near forelimb plucking gossamer threads
    const pluckNear = Math.sin(t * 2.4) * 6;
    drawForelimb(
      true,
      [308 + spineShiftX, 314 + spineShiftY],
      [296 + spineShiftX * 0.6, 412],
      [368, 480 + breath * 2.5],
      pluckNear,
      821,
      maskPos
    );

    // Floating ember motes & lure sparks
    drawMotes(maskPos, 382 + spineShiftX * 0.9, 352 + spineShiftY * 0.7);

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
  "title": "The Glass-Bellied Angler",
  "statement": "Perches along crowded avenues, dangling a serene mask while its belly harvests every stray glance."
}
```