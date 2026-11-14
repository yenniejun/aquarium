```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    overflow: hidden;
    touch-action: auto;
    user-select: none;
    -webkit-user-select: none;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
  }
</style>
</head>
<body>
<canvas id="stage"></canvas>
<script>
(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d', { alpha: true });

  // Virtual 3:4 portrait coordinate space (600 x 800).
  // Host water fills bottom 30% => y = 560 in virtual coordinates.
  const VW = 600;
  const VH = 800;

  let dpr = 1;
  let viewScale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const w = window.innerWidth || document.documentElement.clientWidth || 300;
    const h = window.innerHeight || document.documentElement.clientHeight || 400;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));

    viewScale = Math.min(w / VW, h / VH);
    offsetX = (w - VW * viewScale) * 0.5;
    // Align vertically so the 70% waterline stays aligned when wider than 3:4,
    // or stays safely centered if taller than 3:4.
    offsetY = (h - VH * viewScale) * 0.5;
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Subtle passive pointer tracking (never blocks clicks or touch scrolling)
  const pointer = {
    x: 290,
    y: 340,
    lastMoveTime: -10,
    weight: 0
  };

  window.addEventListener('pointermove', (e) => {
    const vx = (e.clientX - offsetX) / viewScale;
    const vy = (e.clientY - offsetY) / viewScale;
    if (vx >= -60 && vx <= VW + 60 && vy >= -60 && vy <= VH + 60) {
      pointer.x = Math.max(80, Math.min(VW - 80, vx));
      pointer.y = Math.max(100, Math.min(VH - 60, vy));
      pointer.lastMoveTime = performance.now() * 0.001;
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.lastMoveTime = -10;
  }, { passive: true });

  // Pre-allocated arrays for the serpentine oarfish spine (85 stations)
  const SPINE_N = 85;
  const DENSE_STEPS = 32;
  const SEGMENTS = 7; // C1..C8 with C0 and C9 as guide endpoints
  const DENSE_N = SEGMENTS * DENSE_STEPS + 1;

  const denseX = new Float64Array(DENSE_N);
  const denseY = new Float64Array(DENSE_N);
  const denseDist = new Float64Array(DENSE_N);

  const spX = new Float64Array(SPINE_N);
  const spY = new Float64Array(SPINE_N);
  const spTX = new Float64Array(SPINE_N);
  const spTY = new Float64Array(SPINE_N);
  const spNX = new Float64Array(SPINE_N);
  const spNY = new Float64Array(SPINE_N);
  const spR = new Float64Array(SPINE_N);
  const dorX = new Float64Array(SPINE_N);
  const dorY = new Float64Array(SPINE_N);
  const venX = new Float64Array(SPINE_N);
  const venY = new Float64Array(SPINE_N);
  const rayTipX = new Float64Array(SPINE_N);
  const rayTipY = new Float64Array(SPINE_N);

  // Precompute body radius taper
  for (let i = 0; i < SPINE_N; i++) {
    const u = i / (SPINE_N - 1);
    spR[i] = 34.0 * Math.pow(1 - u, 0.82) + 1.25;
  }

  // Deterministic natural oarfish markings (dark indigo oblique streaks & speckles)
  const markings = [];
  let seed = 13379;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  for (let i = 0; i < 68; i++) {
    const u = 0.03 + 0.92 * (i / 68) + (rand() - 0.5) * 0.012;
    const v = (rand() - 0.45) * 1.35; // lateral position across radius (-0.75..0.75)
    const len = (5 + rand() * 11) * (1 - u * 0.55);
    const thick = (1.3 + rand() * 2.1) * (1 - u * 0.45);
    const alpha = 0.24 + rand() * 0.30;
    const slant = -0.35 + (rand() - 0.5) * 0.3;
    markings.push({
      u: Math.max(0.02, Math.min(0.96, u)),
      v: Math.max(-0.75, Math.min(0.75, v)),
      len,
      thick,
      alpha,
      slant
    });
  }

  // Hair strand definitions (back and front locks)
  const backHair = [
    { ox: -16, oy: -52, cx1: -62, cy1: -10, cx2: -76, cy2: 68, ex: -52, ey: 138, w: 12, phase: 0.0 },
    { ox: -8,  oy: -58, cx1: -48, cy1: -2,  cx2: -62, cy2: 84, ex: -36, ey: 156, w: 14, phase: 0.7 },
    { ox: 2,   oy: -60, cx1: -22, cy1: 8,   cx2: -32, cy2: 95, ex: -14, ey: 165, w: 15, phase: 1.4 },
    { ox: 12,  oy: -58, cx1: 24,  cy1: 6,   cx2: 46,  cy2: 86, ex: 34,  ey: 162, w: 15, phase: 2.1 },
    { ox: 19,  oy: -50, cx1: 52,  cy1: -4,  cx2: 74,  cy2: 72, ex: 62,  ey: 144, w: 13, phase: 2.8 },
    { ox: 22,  oy: -42, cx1: 68,  cy1: -14, cx2: 92,  cy2: 52, ex: 82,  ey: 118, w: 10, phase: 3.5 },
    { ox: -20, oy: -44, cx1: -74, cy1: -18, cx2: -90, cy2: 45, ex: -72, ey: 108, w: 9,  phase: 4.2 }
  ];

  // Gaze & blink state
  const gaze = {
    curX: -0.15,
    curY: 0.05,
    targetX: -0.15,
    targetY: 0.05,
    nextShift: 2.5,
    nextBlink: 3.2,
    blinkStart: -10,
    blinkDur: 0.17
  };

  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  }

  const ctrlX = new Float64Array(10);
  const ctrlY = new Float64Array(10);

  function computeSpine(t, breath, bobY, flickAmp) {
    // Anchor C1 (hips) moves cleanly with torso buoyancy
    const hipX = 302 + Math.sin(t * 0.85) * 2.5;
    const hipY = 520 + bobY;

    // Guide C0 above hips along torso centerline
    ctrlX[0] = 296 + Math.sin(t * 0.85 - 0.3) * 1.5;
    ctrlY[0] = 456 + bobY;

    // C1: Hips just above 560 waterline
    ctrlX[1] = hipX;
    ctrlY[1] = hipY;

    // C2: Plunging down-right across the 560 waterline
    ctrlX[2] = 376 + Math.sin(t * 1.15 - 0.6) * 5.0;
    ctrlY[2] = 588 + bobY * 0.7 + Math.cos(t * 1.05 - 0.4) * 3.5;

    // C3: Deep right curve
    ctrlX[3] = 398 + Math.sin(t * 1.15 - 1.3) * 6.5;
    ctrlY[3] = 664 + Math.cos(t * 0.95 - 1.1) * 4.5;

    // C4: Bottom center cradle (safely above bottle glass base)
    ctrlX[4] = 302 + Math.sin(t * 1.05 - 2.1) * 7.5;
    ctrlY[4] = 696 + Math.sin(t * 1.3 - 1.8) * 4.0;

    // C5: Deep left curve
    ctrlX[5] = 204 + Math.sin(t * 1.15 - 2.9) * 6.5;
    ctrlY[5] = 662 + Math.cos(t * 1.1 - 2.5) * 5.0;

    // C6: Rising along left water margin near surface
    ctrlX[6] = 192 + Math.sin(t * 1.35 - 3.6) * 7.5 - flickAmp * 8.0;
    ctrlY[6] = 584 + Math.sin(t * 1.2 - 3.2) * 5.5 + flickAmp * 4.0;

    // C7: Graceful curl skimming the 560 waterline
    ctrlX[7] = 234 + Math.sin(t * 1.6 - 4.3) * 8.5 + flickAmp * 12.0;
    ctrlY[7] = 548 + Math.cos(t * 1.45 - 3.9) * 6.5 - flickAmp * 11.0;

    // C8: Tapered ribbon tip
    ctrlX[8] = 260 + Math.sin(t * 1.85 - 5.0) * 9.5 + flickAmp * 16.0;
    ctrlY[8] = 568 + Math.cos(t * 1.7 - 4.6) * 7.5 + flickAmp * 9.0;

    // Guide C9 for smooth tip tangent
    ctrlX[9] = ctrlX[8] + (ctrlX[8] - ctrlX[7]) * 0.85 + Math.sin(t * 2.1) * 4.0;
    ctrlY[9] = ctrlY[8] + (ctrlY[8] - ctrlY[7]) * 0.85 + Math.cos(t * 2.1) * 4.0;

    // Sample dense spline and compute arc length
    let idx = 0;
    for (let seg = 0; seg < SEGMENTS; seg++) {
      const x0 = ctrlX[seg],     y0 = ctrlY[seg];
      const x1 = ctrlX[seg + 1], y1 = ctrlY[seg + 1];
      const x2 = ctrlX[seg + 2], y2 = ctrlY[seg + 2];
      const x3 = ctrlX[seg + 3], y3 = ctrlY[seg + 3];
      const steps = (seg === SEGMENTS - 1) ? DENSE_STEPS : DENSE_STEPS - 1;
      for (let s = 0; s <= steps; s++) {
        const st = s / DENSE_STEPS;
        denseX[idx] = catmullRom(x0, x1, x2, x3, st);
        denseY[idx] = catmullRom(y0, y1, y2, y3, st);
        if (idx === 0) {
          denseDist[0] = 0;
        } else {
          const dx = denseX[idx] - denseX[idx - 1];
          const dy = denseY[idx] - denseY[idx - 1];
          denseDist[idx] = denseDist[idx - 1] + Math.hypot(dx, dy);
        }
        idx++;
      }
    }

    const totalLen = denseDist[idx - 1];
    let searchIdx = 0;
    for (let i = 0; i < SPINE_N; i++) {
      const targetD = (i / (SPINE_N - 1)) * totalLen;
      while (searchIdx < idx - 2 && denseDist[searchIdx + 1] < targetD) {
        searchIdx++;
      }
      const d0 = denseDist[searchIdx];
      const d1 = denseDist[searchIdx + 1];
      const frac = d1 > d0 ? (targetD - d0) / (d1 - d0) : 0;
      spX[i] = denseX[searchIdx] + (denseX[searchIdx + 1] - denseX[searchIdx]) * frac;
      spY[i] = denseY[searchIdx] + (denseY[searchIdx + 1] - denseY[searchIdx]) * frac;
    }

    // Initial tangents to apply subtle traveling swimming ripple
    for (let i = 0; i < SPINE_N; i++) {
      const i0 = Math.max(0, i - 1);
      const i1 = Math.min(SPINE_N - 1, i + 1);
      const dx = spX[i1] - spX[i0];
      const dy = spY[i1] - spY[i0];
      const len = Math.hypot(dx, dy) || 1;
      const nx = dy / len;
      const ny = -dx / len;
      const u = i / (SPINE_N - 1);
      // Zero at u=0 so hips stay locked seamlessly to torso
      const swim = Math.sin(u * Math.PI * 0.92) * (2.2 + 5.2 * u) * Math.sin(t * 2.25 - u * 8.5);
      spX[i] += nx * swim;
      spY[i] += ny * swim;
    }

    // Final tangents, normals (pointing outward along the convex dorsal curve), and body contours
    for (let i = 0; i < SPINE_N; i++) {
      const i0 = Math.max(0, i - 1);
      const i1 = Math.min(SPINE_N - 1, i + 1);
      const dx = spX[i1] - spX[i0];
      const dy = spY[i1] - spY[i0];
      const len = Math.hypot(dx, dy) || 1;
      const tx = dx / len;
      const ty = dy / len;
      const nx = ty;
      const ny = -tx;
      spTX[i] = tx;
      spTY[i] = ty;
      spNX[i] = nx;
      spNY[i] = ny;

      const r = spR[i];
      dorX[i] = spX[i] + nx * r;
      dorY[i] = spY[i] + ny * r;
      venX[i] = spX[i] - nx * r;
      venY[i] = spY[i] - ny * r;
    }
  }

  function updateGazeAndMood(t, dt) {
    const sinceMove = t - pointer.lastMoveTime;
    const targetWeight = sinceMove < 2.6 ? 1 : 0;
    pointer.weight += (targetWeight - pointer.weight) * Math.min(1, dt * 3.5);

    if (t > gaze.nextShift) {
      // Choose a lifelike curiosity target when idle: viewer, left bottle, right bottle, or waterline hand
      const r = Math.sin(t * 12.9898) * 43758.5453;
      const pick = r - Math.floor(r);
      if (pick < 0.42) {
        // Look straight out at the viewer
        gaze.targetX = -0.05 + (pick - 0.2) * 0.3;
        gaze.targetY = -0.05;
      } else if (pick < 0.68) {
        // Glance slyly left
        gaze.targetX = -0.78;
        gaze.targetY = 0.05;
      } else if (pick < 0.86) {
        // Glance right
        gaze.targetX = 0.72;
        gaze.targetY = -0.08;
      } else {
        // Glance down at her hand / coiled silver tail in the water
        gaze.targetX = 0.18;
        gaze.targetY = 0.68;
      }
      gaze.nextShift = t + 2.8 + ((Math.sin(t * 7.3) + 1) * 1.6);
    }

    const pxNorm = Math.max(-1, Math.min(1, (pointer.x - 295) / 170));
    const pyNorm = Math.max(-1, Math.min(1, (pointer.y - 310) / 190));

    const goalX = gaze.targetX * (1 - pointer.weight) + pxNorm * pointer.weight;
    const goalY = gaze.targetY * (1 - pointer.weight) + pyNorm * pointer.weight;

    gaze.curX += (goalX - gaze.curX) * Math.min(1, dt * 5.2);
    gaze.curY += (goalY - gaze.curY) * Math.min(1, dt * 5.2);

    if (t > gaze.nextBlink) {
      gaze.blinkStart = t;
      // Occasional double-blink
      const dbl = ((Math.sin(t * 19.1) + 1) * 0.5) < 0.22;
      gaze.nextBlink = t + (dbl ? 0.34 : (3.4 + (Math.sin(t * 3.7) + 1) * 1.9));
    }
  }

  function getBlinkAmount(t) {
    const el = t - gaze.blinkStart;
    if (el < 0 || el > gaze.blinkDur) return 0;
    const p = el / gaze.blinkDur;
    return Math.sin(p * Math.PI);
  }

  function drawCervicalDorsalFin(t, headX, headY, headTilt, bobY, songGlow) {
    // Connects the back of her head/neck down behind her right shoulder to dorX[0], dorY[0]
    const nPts = 18;
    const basePtsX = [];
    const basePtsY = [];
    const tipPtsX = [];
    const tipPtsY = [];

    const startX = headX + Math.cos(headTilt) * 10 + Math.sin(headTilt) * 48;
    const startY = headY + Math.sin(headTilt) * 10 - Math.cos(headTilt) * 48;
    const mid1X = 319;
    const mid1Y = 362 + bobY * 0.6;
    const mid2X = 327;
    const mid2Y = 442 + bobY * 0.85;
    const endX = dorX[1];
    const endY = dorY[1];

    for (let i = 0; i <= nPts; i++) {
      const u = i / nPts;
      const iu = 1 - u;
      // Cubic Bezier along spine behind torso
      const bx = iu * iu * iu * startX + 3 * iu * iu * u * mid1X + 3 * iu * u * u * mid2X + u * u * u * endX;
      const by = iu * iu * iu * startY + 3 * iu * iu * u * mid1Y + 3 * iu * u * u * mid2Y + u * u * u * endY;
      basePtsX.push(bx);
      basePtsY.push(by);

      const finLen = 19 + 7 * Math.sin(u * Math.PI) + 3 * Math.sin(t * 3.1 - u * 5.0);
      const waveAng = -0.18 + 0.22 * Math.sin(t * 2.9 - i * 0.38);
      tipPtsX.push(bx + Math.cos(waveAng) * finLen);
      tipPtsY.push(by + Math.sin(waveAng) * finLen);
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(basePtsX[0], basePtsY[0]);
    for (let i = 0; i <= nPts; i++) {
      ctx.lineTo(tipPtsX[i], tipPtsY[i]);
    }
    for (let i = nPts; i >= 0; i--) {
      ctx.lineTo(basePtsX[i], basePtsY[i]);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(305, 340, 355, 450);
    grad.addColorStop(0, 'rgba(195, 28, 62, 0.58)');
    grad.addColorStop(0.65, 'rgba(238, 68, 88, 0.42)');
    grad.addColorStop(1, 'rgba(255, 148, 120, 0.28)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Delicate crimson fin rays
    ctx.lineWidth = 1.05;
    for (let i = 1; i < nPts; i++) {
      ctx.beginPath();
      ctx.moveTo(basePtsX[i], basePtsY[i]);
      ctx.lineTo(tipPtsX[i], tipPtsY[i]);
      ctx.strokeStyle = `rgba(255, 92, 112, ${0.42 + 0.2 * songGlow})`;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBackHair(t, headX, headY, headTilt) {
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt * 0.55);

    for (let i = 0; i < backHair.length; i++) {
      const s = backHair[i];
      const sway1 = Math.sin(t * 1.45 + s.phase) * 9;
      const sway2 = Math.cos(t * 1.15 + s.phase * 1.3) * 14;

      ctx.beginPath();
      ctx.moveTo(s.ox - s.w * 0.4, s.oy);
      ctx.bezierCurveTo(
        s.cx1 + sway1 - s.w * 0.5, s.cy1,
        s.cx2 + sway2 - s.w * 0.3, s.cy2,
        s.ex + sway2 * 1.25, s.ey
      );
      ctx.bezierCurveTo(
        s.cx2 + sway2 + s.w * 0.45, s.cy2 - 4,
        s.cx1 + sway1 + s.w * 0.55, s.cy1 - 4,
        s.ox + s.w * 0.45, s.oy
      );
      ctx.closePath();

      const hGrad = ctx.createLinearGradient(s.ox, s.oy, s.ex + sway2, s.ey);
      hGrad.addColorStop(0, '#182340');
      hGrad.addColorStop(0.55, '#2b355c');
      hGrad.addColorStop(0.88, '#5f466e');
      hGrad.addColorStop(1, 'rgba(155, 118, 165, 0.18)');
      ctx.fillStyle = hGrad;
      ctx.fill();

      // Subtle silver silk highlight thread
      ctx.beginPath();
      ctx.moveTo(s.ox, s.oy + 4);
      ctx.bezierCurveTo(
        s.cx1 + sway1, s.cy1,
        s.cx2 + sway2, s.cy2,
        s.ex + sway2 * 1.2, s.ey - 4
      );
      ctx.strokeStyle = 'rgba(205, 226, 248, 0.22)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTailAndDorsalFin(t, songGlow) {
    ctx.save();

    // 1. Precompute dorsal fin ray tips along the whole 85-point spine
    for (let i = 0; i < SPINE_N; i++) {
      const u = i / (SPINE_N - 1);
      const baseLen = (27 * Math.sin(Math.pow(u, 0.65) * Math.PI * 0.92) + 14 * (1 - u * 0.4));
      const flutter = Math.sin(t * 3.4 - i * 0.26) * 0.28 + Math.sin(t * 5.2 - i * 0.45) * 0.10;
      const baseAng = Math.atan2(spNY[i], spNX[i]) + flutter - 0.12;
      rayTipX[i] = dorX[i] + Math.cos(baseAng) * baseLen;
      rayTipY[i] = dorY[i] + Math.sin(baseAng) * baseLen;
    }

    // 2. Sheer Ventral Keel Shimmer (along inner curve of lower half)
    ctx.beginPath();
    const vStart = 10;
    ctx.moveTo(venX[vStart], venY[vStart]);
    for (let i = vStart; i < SPINE_N; i++) {
      const u = i / (SPINE_N - 1);
      const kLen = 5.5 * Math.sin(u * Math.PI);
      const flutter = Math.sin(t * 3.0 - i * 0.25) * 1.8;
      ctx.lineTo(venX[i] - spNX[i] * (kLen + flutter), venY[i] - spNY[i] * (kLen + flutter));
    }
    for (let i = SPINE_N - 1; i >= vStart; i--) {
      ctx.lineTo(venX[i], venY[i]);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(170, 215, 238, 0.22)';
    ctx.fill();

    // 3. Unbroken Crimson Dorsal Ribbon Fin
    for (let i = 0; i < SPINE_N - 1; i++) {
      const u = i / (SPINE_N - 1);
      ctx.beginPath();
      ctx.moveTo(dorX[i], dorY[i]);
      ctx.lineTo(rayTipX[i], rayTipY[i]);
      const midX = (rayTipX[i] + rayTipX[i + 1]) * 0.5 - spNX[i] * 1.6;
      const midY = (rayTipY[i] + rayTipY[i + 1]) * 0.5 - spNY[i] * 1.6;
      ctx.quadraticCurveTo(midX, midY, rayTipX[i + 1], rayTipY[i + 1]);
      ctx.lineTo(dorX[i + 1], dorY[i + 1]);
      ctx.closePath();

      const pulse = 0.5 + 0.5 * Math.sin(t * 3.0 - u * 10.0);
      const alphaBase = 0.54 - u * 0.14 + pulse * 0.08 * songGlow;
      const g = ctx.createLinearGradient(dorX[i], dorY[i], rayTipX[i], rayTipY[i]);
      g.addColorStop(0, `rgba(182, 22, 56, ${alphaBase})`);
      g.addColorStop(0.58, `rgba(238, 62, 86, ${alphaBase * 0.82})`);
      g.addColorStop(1, `rgba(255, 176, 128, ${alphaBase * 0.32})`);
      ctx.fillStyle = g;
      ctx.fill();
    }

    // Individual crimson fin rays & glowing pearl pinpoints
    ctx.lineCap = 'round';
    for (let i = 0; i < SPINE_N; i++) {
      const u = i / (SPINE_N - 1);
      ctx.beginPath();
      ctx.moveTo(dorX[i], dorY[i]);
      ctx.lineTo(rayTipX[i], rayTipY[i]);
      ctx.lineWidth = 1.25 * (1 - u * 0.45);
      ctx.strokeStyle = 'rgba(250, 88, 106, 0.58)';
      ctx.stroke();

      if (i % 3 === 0) {
        const glowWave = 0.5 + 0.5 * Math.sin(t * 3.6 - i * 0.22);
        const rDot = 1.3 + glowWave * 0.9 + songGlow * 0.7;
        ctx.beginPath();
        ctx.arc(rayTipX[i], rayTipY[i], rDot, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 218, 152, ${0.48 + 0.42 * glowWave})`;
        ctx.fill();
      }
    }

    // 4. Caudal Fan Plume at the tip of the tail (station SPINE_N - 1)
    const tipX = spX[SPINE_N - 1];
    const tipY = spY[SPINE_N - 1];
    const tipAng = Math.atan2(spTY[SPINE_N - 1], spTX[SPINE_N - 1]);
    const fanCount = 7;
    for (let f = 0; f < fanCount; f++) {
      const spread = ((f / (fanCount - 1)) - 0.5) * 1.15;
      const sway = Math.sin(t * 2.8 - f * 0.55) * 0.22;
      const len = 34 + (3 - Math.abs(f - 3)) * 10;
      const a1 = tipAng + spread * 0.65 + sway * 0.5;
      const a2 = tipAng + spread + sway;

      const cx1 = tipX + Math.cos(a1) * (len * 0.48);
      const cy1 = tipY + Math.sin(a1) * (len * 0.48);
      const ex = tipX + Math.cos(a2) * len;
      const ey = tipY + Math.sin(a2) * len;

      // Sheer caudal webbing between rays
      if (f < fanCount - 1) {
        const nextSpread = (((f + 1) / (fanCount - 1)) - 0.5) * 1.15;
        const nextSway = Math.sin(t * 2.8 - (f + 1) * 0.55) * 0.22;
        const nextLen = 34 + (3 - Math.abs(f + 1 - 3)) * 10;
        const nex = tipX + Math.cos(tipAng + nextSpread + nextSway) * nextLen;
        const ney = tipY + Math.sin(tipAng + nextSpread + nextSway) * nextLen;

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.quadraticCurveTo(cx1, cy1, ex, ey);
        ctx.lineTo(nex, ney);
        ctx.closePath();
        ctx.fillStyle = 'rgba(232, 58, 86, 0.28)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.quadraticCurveTo(cx1, cy1, ex, ey);
      const rGrad = ctx.createLinearGradient(tipX, tipY, ex, ey);
      rGrad.addColorStop(0, 'rgba(225, 42, 72, 0.88)');
      rGrad.addColorStop(0.7, 'rgba(255, 105, 118, 0.72)');
      rGrad.addColorStop(1, 'rgba(255, 220, 150, 0.85)');
      ctx.strokeStyle = rGrad;
      ctx.lineWidth = 1.45 - Math.abs(f - 3) * 0.15;
      ctx.stroke();

      // Luminous droplet bud at filament tip
      ctx.beginPath();
      ctx.arc(ex, ey, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 224, 158, 0.82)';
      ctx.fill();
    }

    // 5. Main Mirror-Silver Iridescent Oarfish Body
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dorX[0], dorY[0]);
    for (let i = 1; i < SPINE_N; i++) {
      ctx.lineTo(dorX[i], dorY[i]);
    }
    for (let i = SPINE_N - 1; i >= 0; i--) {
      ctx.lineTo(venX[i], venY[i]);
    }
    ctx.closePath();
    ctx.clip();

    // Base deep abyssal slate-silver fill
    const bodyBase = ctx.createLinearGradient(200, 515, 390, 710);
    bodyBase.addColorStop(0, '#4f6885');
    bodyBase.addColorStop(0.45, '#2d4461');
    bodyBase.addColorStop(1, '#1e314b');
    ctx.fillStyle = bodyBase;
    ctx.fillRect(140, 485, 320, 260);

    // Longitudinal metallic guanine bands following the curved spine
    const bands = [
      { offset: -0.66, width: 0.55, color: 'rgba(24, 42, 68, 0.65)' },
      { offset: -0.26, width: 0.55, color: 'rgba(138, 214, 230, 0.52)' },
      { offset:  0.06, width: 0.48, color: 'rgba(232, 244, 255, 0.82)' },
      { offset:  0.22, width: 0.22, color: 'rgba(255, 255, 255, 0.72)' },
      { offset:  0.48, width: 0.36, color: 'rgba(208, 184, 235, 0.42)' },
      { offset:  0.78, width: 0.35, color: 'rgba(54, 72, 104, 0.62)' }
    ];

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let b = 0; b < bands.length; b++) {
      const band = bands[b];
      ctx.strokeStyle = band.color;
      // Draw in segments so stroke width scales accurately with tapering radius
      for (let i = 0; i < SPINE_N - 1; i += 2) {
        const iNext = Math.min(SPINE_N - 1, i + 2);
        const rMid = (spR[i] + spR[iNext]) * 0.5;
        ctx.beginPath();
        ctx.moveTo(spX[i] + spNX[i] * spR[i] * band.offset, spY[i] + spNY[i] * spR[i] * band.offset);
        if (i + 1 < SPINE_N) {
          ctx.lineTo(spX[i + 1] + spNX[i + 1] * spR[i + 1] * band.offset, spY[i + 1] + spNY[i + 1] * spR[i + 1] * band.offset);
        }
        ctx.lineTo(spX[iNext] + spNX[iNext] * spR[iNext] * band.offset, spY[iNext] + spNY[iNext] * spR[iNext] * band.offset);
        ctx.lineWidth = Math.max(0.8, rMid * band.width * 2);
        ctx.stroke();
      }
    }

    // Subtle opalescent chevron myomere / scale glints along the body
    ctx.lineWidth = 0.9;
    for (let i = 2; i < SPINE_N - 3; i += 2) {
      const u = i / (SPINE_N - 1);
      const r = spR[i];
      const shimmer = 0.5 + 0.5 * Math.sin(t * 2.8 - u * 14.0);
      const alpha = (0.12 + 0.22 * shimmer * (0.4 + 0.6 * songGlow)) * (1 - u * 0.5);
      ctx.strokeStyle = shimmer > 0.6
        ? `rgba(195, 252, 250, ${alpha})`
        : `rgba(235, 205, 255, ${alpha})`;

      const cx = spX[i];
      const cy = spY[i];
      const backX = -spTX[i] * r * 0.52;
      const backY = -spTY[i] * r * 0.52;

      ctx.beginPath();
      ctx.moveTo(cx + spNX[i] * r * 0.78 + backX, cy + spNY[i] * r * 0.78 + backY);
      ctx.quadraticCurveTo(cx + spTX[i] * r * 0.22, cy + spTY[i] * r * 0.22, cx - spNX[i] * r * 0.78 + backX, cy - spNY[i] * r * 0.78 + backY);
      ctx.stroke();
    }

    // Characteristic oarfish dark ink-indigo streaks and spots
    for (let m = 0; m < markings.length; m++) {
      const mk = markings[m];
      const fIdx = mk.u * (SPINE_N - 1);
      const i0 = Math.min(SPINE_N - 2, Math.floor(fIdx));
      const frac = fIdx - i0;
      const cx = spX[i0] + (spX[i0 + 1] - spX[i0]) * frac;
      const cy = spY[i0] + (spY[i0 + 1] - spY[i0]) * frac;
      const nx = spNX[i0];
      const ny = spNY[i0];
      const tx = spTX[i0];
      const ty = spTY[i0];
      const r = spR[i0];

      const px = cx + nx * r * mk.v;
      const py = cy + ny * r * mk.v;
      const ang = Math.atan2(ty, tx) + mk.slant;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, 0, mk.len * 0.5, mk.thick * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(22, 36, 68, ${mk.alpha})`;
      ctx.fill();
      ctx.restore();
    }

    // Glowing lateral line with travelling bioluminescent pulses
    ctx.beginPath();
    for (let i = 0; i < SPINE_N; i++) {
      const lx = spX[i] + spNX[i] * spR[i] * 0.14;
      const ly = spY[i] + spNY[i] * spR[i] * 0.14;
      if (i === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    ctx.strokeStyle = `rgba(255, 165, 145, ${0.34 + 0.26 * songGlow})`;
    ctx.lineWidth = 1.15;
    ctx.stroke();

    for (let i = 2; i < SPINE_N - 1; i += 3) {
      const u = i / (SPINE_N - 1);
      const lx = spX[i] + spNX[i] * spR[i] * 0.14;
      const ly = spY[i] + spNY[i] * spR[i] * 0.14;
      const wave = Math.pow(0.5 + 0.5 * Math.sin(t * 3.4 - u * 12.5), 3);
      const glow = 0.25 + 0.75 * wave * (0.45 + 0.55 * songGlow);
      const pr = (1.5 + 1.8 * wave) * (1 - u * 0.35);

      ctx.beginPath();
      ctx.arc(lx, ly, pr * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(120, 245, 245, ${glow * 0.24})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(lx, ly, pr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 236, 175, ${glow * 0.85})`;
      ctx.fill();
    }

    ctx.restore(); // end body clip

    // Crisp pearlescent rim light along dorsal & ventral edges of the tail
    ctx.beginPath();
    ctx.moveTo(dorX[0], dorY[0]);
    for (let i = 1; i < SPINE_N; i++) ctx.lineTo(dorX[i], dorY[i]);
    ctx.strokeStyle = 'rgba(225, 242, 255, 0.52)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(venX[0], venY[0]);
    for (let i = 1; i < SPINE_N; i++) ctx.lineTo(venX[i], venY[i]);
    ctx.strokeStyle = 'rgba(32, 52, 82, 0.55)';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    ctx.restore();
  }

  function drawWebbedHand(wx, wy, angle, scaleX, scaleY, t) {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(angle);
    ctx.scale(scaleX, scaleY);

    // Finger angles & lengths
    const fingers = [
      { ang: -0.58, len: 13.5, bx: -4.2, by: 2.5 }, // thumb
      { ang: -0.24, len: 20.5, bx: -2.8, by: 6.0 }, // index
      { ang: -0.04, len: 22.8, bx: -0.4, by: 6.5 }, // middle
      { ang:  0.16, len: 20.2, bx:  2.0, by: 6.0 }, // ring
      { ang:  0.38, len: 16.2, bx:  4.0, by: 5.0 }  // pinky
    ];

    const tipCoords = [];
    for (let i = 0; i < fingers.length; i++) {
      const f = fingers[i];
      const curl = Math.sin(t * 1.9 + i * 0.55) * 0.06;
      const a = f.ang + curl + Math.PI * 0.5;
      tipCoords.push({
        bx: f.bx,
        by: f.by,
        tx: f.bx + Math.cos(a) * f.len,
        ty: f.by + Math.sin(a) * f.len
      });
    }

    // Translucent coral-pearl webbing between fingers
    ctx.beginPath();
    ctx.moveTo(tipCoords[0].bx, tipCoords[0].by);
    for (let i = 0; i < tipCoords.length - 1; i++) {
      const c1 = tipCoords[i];
      const c2 = tipCoords[i + 1];
      const w1x = c1.bx + (c1.tx - c1.bx) * 0.68;
      const w1y = c1.by + (c1.ty - c1.by) * 0.68;
      const w2x = c2.bx + (c2.tx - c2.bx) * 0.68;
      const w2y = c2.by + (c2.ty - c2.by) * 0.68;
      const midX = (c1.bx + c2.bx) * 0.5 + (w1x + w2x - c1.bx - c2.bx) * 0.34;
      const midY = (c1.by + c2.by) * 0.5 + (w1y + w2y - c1.by - c2.by) * 0.34;
      ctx.lineTo(w1x, w1y);
      ctx.quadraticCurveTo(midX, midY, w2x, w2y);
    }
    ctx.lineTo(tipCoords[4].bx, tipCoords[4].by);
    ctx.closePath();
    ctx.fillStyle = 'rgba(235, 118, 148, 0.36)';
    ctx.fill();

    // Palm
    ctx.beginPath();
    ctx.ellipse(0, 3.8, 5.4, 6.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dcebf2';
    ctx.fill();

    // Slender tapered fingers
    ctx.lineCap = 'round';
    for (let i = 0; i < tipCoords.length; i++) {
      const c = tipCoords[i];
      ctx.beginPath();
      ctx.moveTo(c.bx, c.by);
      ctx.lineTo(c.tx, c.ty);
      ctx.strokeStyle = '#d7e8f0';
      ctx.lineWidth = i === 0 ? 2.4 : 2.1;
      ctx.stroke();

      // Tiny opalescent claw/nail glint
      ctx.beginPath();
      ctx.arc(c.tx, c.ty, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 226, 232, 0.85)';
      ctx.fill();
    }

    ctx.restore();
  }

  function drawBackArm(t, bobY) {
    // Her right arm (viewer's left), poised gracefully with raised forearm
    const shX = 262;
    const shY = 376 + bobY;
    const elX = 218 + Math.sin(t * 1.15) * 3.5;
    const elY = 438 + bobY + Math.cos(t * 1.05) * 3.0;
    const wrX = 240 + Math.sin(t * 1.35 + 0.6) * 4.5 + pointer.weight * (pointer.x - 290) * 0.03;
    const wrY = 392 + bobY + Math.cos(t * 1.25 + 0.4) * 4.0 + pointer.weight * (pointer.y - 340) * 0.02;

    ctx.save();

    // Translucent ulnar forearm finlet
    ctx.beginPath();
    ctx.moveTo(elX - 2, elY + 4);
    ctx.quadraticCurveTo(
      (elX + wrX) * 0.5 - 18 + Math.sin(t * 2.8) * 3,
      (elY + wrY) * 0.5 + 14,
      wrX - 3, wrY + 5
    );
    ctx.lineTo(elX + 2, elY);
    ctx.closePath();
    const fGrad = ctx.createLinearGradient(elX, elY, elX - 18, elY + 12);
    fGrad.addColorStop(0, 'rgba(195, 42, 76, 0.48)');
    fGrad.addColorStop(1, 'rgba(255, 152, 148, 0.14)');
    ctx.fillStyle = fGrad;
    ctx.fill();

    // Sculpted upper arm & forearm
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Shadow pass
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.quadraticCurveTo((shX + elX) * 0.5 - 3, (shY + elY) * 0.5 + 3, elX, elY);
    ctx.strokeStyle = '#8aa3bd';
    ctx.lineWidth = 14.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(elX, elY);
    ctx.quadraticCurveTo((elX + wrX) * 0.5 - 2, (elY + wrY) * 0.5 + 2, wrX, wrY);
    ctx.strokeStyle = '#92abc4';
    ctx.lineWidth = 11.2;
    ctx.stroke();

    // Pearlescent skin highlight pass
    ctx.beginPath();
    ctx.moveTo(shX, shY - 1);
    ctx.quadraticCurveTo((shX + elX) * 0.5 - 4, (shY + elY) * 0.5 + 1, elX, elY - 1);
    ctx.strokeStyle = '#d7e8f1';
    ctx.lineWidth = 11.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(elX, elY - 1);
    ctx.quadraticCurveTo((elX + wrX) * 0.5 - 3, (elY + wrY) * 0.5, wrX, wrY - 1);
    ctx.strokeStyle = '#e3eff6';
    ctx.lineWidth = 8.8;
    ctx.stroke();

    // Hand poised upward/inward
    const handAng = Math.atan2(wrY - elY, wrX - elX) - Math.PI * 0.42;
    drawWebbedHand(wrX, wrY, handAng, -0.92, 0.92, t);

    ctx.restore();
    return { wrX, wrY };
  }

  function drawTorsoAndBodice(t, bobY, breath, songGlow) {
    ctx.save();

    // Seamless hip anchors right onto the computed oarfish spine
    const lHipX = venX[2];
    const lHipY = venY[2];
    const rHipX = dorX[2];
    const rHipY = dorY[2];

    const lShX = 257;
    const lShY = 373 + bobY;
    const rShX = 339;
    const rShY = 373 + bobY;

    const lRibX = 263 - breath * 1.6;
    const lRibY = 420 + bobY;
    const rRibX = 334 + breath * 1.8;
    const rRibY = 420 + bobY;

    const lWaistX = 274 - breath * 0.8;
    const lWaistY = 468 + bobY;
    const rWaistX = 323 + breath * 0.8;
    const rWaistY = 466 + bobY;

    // Build unified torso + upper hip silhouette
    ctx.beginPath();
    ctx.moveTo(286, 354 + bobY); // left base of neck
    ctx.quadraticCurveTo(272, 366 + bobY, lShX, lShY);
    ctx.bezierCurveTo(lShX - 2, 396 + bobY, lRibX, lRibY - 10, lRibX, lRibY);
    ctx.bezierCurveTo(lRibX + 2, 444 + bobY, lWaistX - 2, lWaistY - 12, lWaistX, lWaistY);
    ctx.quadraticCurveTo(lWaistX - 3, (lWaistY + lHipY) * 0.5, lHipX, lHipY);
    // Curve deeply into the tail body so zero seam can ever appear
    ctx.quadraticCurveTo(spX[4], spY[4] + 8, rHipX, rHipY);
    ctx.quadraticCurveTo(rWaistX + 5, (rWaistY + rHipY) * 0.5, rWaistX, rWaistY);
    ctx.bezierCurveTo(rWaistX + 2, lWaistY - 14, rRibX + 1, rRibY + 20, rRibX, rRibY);
    ctx.bezierCurveTo(rRibX, rRibY - 12, rShX + 2, 395 + bobY, rShX, rShY);
    ctx.quadraticCurveTo(324, 366 + bobY, 310, 354 + bobY); // right base of neck
    ctx.closePath();

    ctx.save();
    ctx.clip();

    // Luminous 3D porcelain-cyan skin shading
    const skinGrad = ctx.createLinearGradient(254, 375 + bobY, 344, 460 + bobY);
    skinGrad.addColorStop(0, '#eef7fb');
    skinGrad.addColorStop(0.45, '#d6e8f2');
    skinGrad.addColorStop(0.82, '#a7c0d8');
    skinGrad.addColorStop(1, '#7c98b6');
    ctx.fillStyle = skinGrad;
    ctx.fillRect(245, 345 + bobY, 115, 220);

    // Subtle subsurface cyan-violet luminescence on ribs/sternum
    const ribGlow = ctx.createRadialGradient(294, 430 + bobY, 4, 296, 435 + bobY, 52);
    ribGlow.addColorStop(0, `rgba(155, 248, 248, ${0.14 + 0.24 * songGlow})`);
    ribGlow.addColorStop(0.6, 'rgba(185, 195, 240, 0.08)');
    ribGlow.addColorStop(1, 'rgba(140, 170, 210, 0)');
    ctx.fillStyle = ribGlow;
    ctx.fillRect(245, 375 + bobY, 110, 120);

    // Soft sculpted collarbones
    ctx.strokeStyle = 'rgba(116, 144, 174, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(264, 374 + bobY);
    ctx.quadraticCurveTo(279, 381 + bobY, 293, 378 + bobY);
    ctx.moveTo(331, 374 + bobY);
    ctx.quadraticCurveTo(315, 381 + bobY, 301, 378 + bobY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(265, 372.5 + bobY);
    ctx.quadraticCurveTo(279, 379.5 + bobY, 293, 376.5 + bobY);
    ctx.moveTo(330, 372.5 + bobY);
    ctx.quadraticCurveTo(315, 379.5 + bobY, 301, 376.5 + bobY);
    ctx.stroke();

    // Three pairs of pulsing bioluminescent gill slits along her ribs
    for (let g = 0; g < 3; g++) {
      const gy = 432 + g * 10.5 + bobY;
      const gPulse = 0.45 + 0.55 * Math.sin(t * 2.2 - g * 0.55);
      const glowA = 0.35 + 0.55 * gPulse * (0.45 + 0.55 * songGlow);
      const len = 13 - g * 1.6;

      // Left side gills
      ctx.beginPath();
      ctx.moveTo(274 + g * 1.5, gy - 2);
      ctx.quadraticCurveTo(274 + g * 1.5 + len * 0.5, gy + 2.5, 274 + g * 1.5 + len, gy + 1.5);
      ctx.strokeStyle = `rgba(58, 92, 128, 0.65)`;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.strokeStyle = `rgba(135, 252, 245, ${glowA})`;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Right side gills
      ctx.beginPath();
      ctx.moveTo(321 - g * 1.5, gy - 2);
      ctx.quadraticCurveTo(321 - g * 1.5 - len * 0.5, gy + 2.5, 321 - g * 1.5 - len, gy + 1.5);
      ctx.strokeStyle = `rgba(58, 92, 128, 0.65)`;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.strokeStyle = `rgba(135, 252, 245, ${glowA})`;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }

    // Iridescent Hip & Waist Scale Cuirass (bridging skin into silver oarfish scales)
    const scaleTopY = 468 + bobY;
    const cuirassGrad = ctx.createLinearGradient(268, scaleTopY, 336, 542 + bobY);
    cuirassGrad.addColorStop(0, 'rgba(182, 224, 242, 0.55)');
    cuirassGrad.addColorStop(0.45, 'rgba(218, 238, 252, 0.88)');
    cuirassGrad.addColorStop(1, 'rgba(104, 138, 175, 0.95)');

    ctx.beginPath();
    ctx.moveTo(lWaistX - 4, scaleTopY + 12);
    ctx.quadraticCurveTo(298, scaleTopY - 12, rWaistX + 4, scaleTopY + 6);
    ctx.lineTo(rHipX + 6, rHipY + 20);
    ctx.lineTo(lHipX - 6, lHipY + 20);
    ctx.closePath();
    ctx.fillStyle = cuirassGrad;
    ctx.fill();

    // Overlapping scalloped mother-of-pearl scale rows across waist & hips
    for (let row = 0; row < 6; row++) {
      const ry = scaleTopY + 2 + row * 10.5;
      const cols = 6 + (row % 2);
      for (let col = 0; col < cols; col++) {
        const sx = 268 + (col + (row % 2 ? 0.0 : 0.5)) * 11.2;
        const sy = ry + Math.abs(col - cols * 0.5) * 1.4 - (rHipY < lHipY ? (col - 3) * 1.5 : 0);
        ctx.beginPath();
        ctx.arc(sx, sy, 6.4, 0.08 * Math.PI, 0.92 * Math.PI);
        ctx.fillStyle = row < 2 ? 'rgba(224, 244, 255, 0.52)' : 'rgba(195, 225, 245, 0.45)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }
    }

    ctx.restore(); // end torso clip

    // Organic Pectoral Fin-Drapes (sculpted opalescent crimson-and-pearl chest armor)
    // Left pectoral fin-shell
    ctx.beginPath();
    ctx.moveTo(296, 412 + bobY);
    ctx.bezierCurveTo(286, 392 + bobY, 266, 392 + bobY, 263, 412 + bobY);
    ctx.bezierCurveTo(261, 426 + bobY, 278, 432 + bobY, 296, 421 + bobY);
    ctx.closePath();
    const pecGradL = ctx.createLinearGradient(262, 395 + bobY, 296, 426 + bobY);
    pecGradL.addColorStop(0, 'rgba(202, 42, 76, 0.82)');
    pecGradL.addColorStop(0.55, 'rgba(238, 118, 146, 0.86)');
    pecGradL.addColorStop(1, 'rgba(225, 244, 255, 0.92)');
    ctx.fillStyle = pecGradL;
    ctx.fill();

    // Right pectoral fin-shell
    ctx.beginPath();
    ctx.moveTo(296, 412 + bobY);
    ctx.bezierCurveTo(308, 392 + bobY, 330, 392 + bobY, 333, 412 + bobY);
    ctx.bezierCurveTo(335, 426 + bobY, 316, 432 + bobY, 296, 421 + bobY);
    ctx.closePath();
    const pecGradR = ctx.createLinearGradient(334, 395 + bobY, 296, 426 + bobY);
    pecGradR.addColorStop(0, 'rgba(182, 34, 68, 0.85)');
    pecGradR.addColorStop(0.55, 'rgba(232, 110, 140, 0.86)');
    pecGradR.addColorStop(1, 'rgba(225, 244, 255, 0.92)');
    ctx.fillStyle = pecGradR;
    ctx.fill();

    // Delicate pleated fin-rays on pectoral drapes & center luminous pearl-organ
    ctx.strokeStyle = 'rgba(255, 232, 238, 0.55)';
    ctx.lineWidth = 0.85;
    for (let k = 1; k <= 4; k++) {
      const f = k / 5;
      ctx.beginPath();
      ctx.moveTo(295, 417 + bobY);
      ctx.quadraticCurveTo(280, 398 + f * 24 + bobY, 265 + f * 6, 403 + f * 18 + bobY);
      ctx.moveTo(297, 417 + bobY);
      ctx.quadraticCurveTo(314, 398 + f * 24 + bobY, 331 - f * 6, 403 + f * 18 + bobY);
      ctx.stroke();
    }

    // Center sternum bioluminescent pearl node
    const heartGlow = 0.55 + 0.45 * Math.sin(t * 2.2);
    ctx.beginPath();
    ctx.arc(296, 416 + bobY, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 212, 158, ${0.22 + 0.25 * songGlow})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(296, 416 + bobY, 3.1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 242, 205, ${0.75 + 0.25 * heartGlow})`;
    ctx.fill();

    // Hip fin-frills flaring slightly at the waist-to-tail transition
    ctx.beginPath();
    ctx.moveTo(lWaistX, lWaistY + 6);
    ctx.quadraticCurveTo(lWaistX - 18 + Math.sin(t * 2.4) * 3, lWaistY + 34, lHipX - 2, lHipY + 8);
    ctx.quadraticCurveTo(lWaistX - 4, lWaistY + 30, lWaistX, lWaistY + 6);
    ctx.fillStyle = 'rgba(228, 58, 88, 0.52)';
    ctx.fill();

    ctx.restore();
  }

  function drawPelvicOarRays(t, bobY, songGlow) {
    // Iconic elongated oarfish pelvic rays with diamond crimson-gold "oar" paddles at the tips
    const rays = [
      { sx: 286, sy: 422 + bobY, cx1: 254, cy1: 495 + bobY, cx2: 244, cy2: 575, ex: 252, ey: 636, phase: 0.0 },
      { sx: 306, sy: 422 + bobY, cx1: 318, cy1: 505 + bobY, cx2: 356, cy2: 582, ex: 348, ey: 644, phase: 1.4 }
    ];

    ctx.save();
    for (let i = 0; i < rays.length; i++) {
      const r = rays[i];
      const sway1 = Math.sin(t * 1.4 + r.phase) * 9;
      const sway2 = Math.cos(t * 1.15 + r.phase) * 13;
      const ex = r.ex + sway2 + pointer.weight * (pointer.x - 300) * 0.04;
      const ey = r.ey + Math.sin(t * 1.7 + r.phase) * 5;

      const grad = ctx.createLinearGradient(r.sx, r.sy, ex, ey);
      grad.addColorStop(0, 'rgba(218, 48, 82, 0.78)');
      grad.addColorStop(0.65, 'rgba(255, 108, 118, 0.72)');
      grad.addColorStop(1, 'rgba(255, 214, 142, 0.92)');

      ctx.beginPath();
      ctx.moveTo(r.sx, r.sy);
      ctx.bezierCurveTo(r.cx1 + sway1 * 0.5, r.cy1, r.cx2 + sway1, r.cy2, ex, ey);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.45;
      ctx.stroke();

      // Glowing oar-blade paddle at the tip
      const tx = ex - (r.cx2 + sway1);
      const ty = ey - r.cy2;
      const ang = Math.atan2(ty, tx);

      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);

      // Soft bioluminescent aura
      const aura = ctx.createRadialGradient(5, 0, 1, 5, 0, 14);
      aura.addColorStop(0, `rgba(255, 205, 135, ${0.42 + 0.28 * songGlow})`);
      aura.addColorStop(1, 'rgba(255, 90, 110, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(5, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Leaf/diamond oar blade
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -5.5, 14, 0);
      ctx.quadraticCurveTo(6, 5.5, 0, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(236, 52, 82, 0.86)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 224, 158, 0.85)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(6.5, 0, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff2c6';
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  function drawEarFin(x, y, side, t) {
    // Pleated translucent crimson-and-pearl lateral ear-fin (side: -1 left, +1 right)
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(side, 1);
    const flutter = Math.sin(t * 3.1 + side) * 0.08;
    ctx.rotate(flutter);

    const rays = [
      { ang: -0.62, len: 22 },
      { ang: -0.30, len: 25 },
      { ang:  0.02, len: 22 },
      { ang:  0.32, len: 17 },
      { ang:  0.58, len: 12 }
    ];

    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let i = 0; i < rays.length; i++) {
      const rx = Math.cos(rays[i].ang) * rays[i].len;
      const ry = Math.sin(rays[i].ang) * rays[i].len;
      ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 24, 0);
    g.addColorStop(0, 'rgba(205, 45, 78, 0.72)');
    g.addColorStop(0.65, 'rgba(248, 122, 142, 0.45)');
    g.addColorStop(1, 'rgba(255, 222, 185, 0.22)');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth = 0.9;
    ctx.strokeStyle = 'rgba(255, 195, 200, 0.65)';
    for (let i = 0; i < rays.length; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rays[i].ang) * rays[i].len, Math.sin(rays[i].ang) * rays[i].len);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawEye(cx, cy, rx, ry, blink, songGlow) {
    ctx.save();
    ctx.translate(cx, cy);

    // Subtle orbital socket shadow
    const orb = ctx.createRadialGradient(0, 0, rx * 0.3, 0, 0, rx * 1.45);
    orb.addColorStop(0, 'rgba(65, 88, 122, 0.24)');
    orb.addColorStop(1, 'rgba(65, 88, 122, 0)');
    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 1.45, ry * 1.65, 0, 0, Math.PI * 2);
    ctx.fill();

    const openRy = Math.max(0.4, ry * (1 - blink * 0.95));

    // Almond eye opening clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-rx, 0.8);
    ctx.bezierCurveTo(-rx * 0.45, -openRy * 1.35, rx * 0.45, -openRy * 1.35, rx, -0.4);
    ctx.bezierCurveTo(rx * 0.45, openRy * 1.25, -rx * 0.45, openRy * 1.25, -rx, 0.8);
    ctx.closePath();

    // Deep twilight sclera
    ctx.fillStyle = '#15253d';
    ctx.fill();
    ctx.clip();

    if (blink < 0.88) {
      const ix = gaze.curX * rx * 0.34;
      const iy = gaze.curY * ry * 0.32;
      const ir = ry * 0.96;

      // Glowing amber-gold & cyan abyssal iris
      const iGrad = ctx.createRadialGradient(ix, iy, ir * 0.15, ix, iy, ir);
      iGrad.addColorStop(0, '#7ef5f0');
      iGrad.addColorStop(0.42, '#ffe07d');
      iGrad.addColorStop(0.82, '#d47b2a');
      iGrad.addColorStop(1, '#52281e');
      ctx.beginPath();
      ctx.arc(ix, iy, ir, 0, Math.PI * 2);
      ctx.fillStyle = iGrad;
      ctx.fill();

      // Deep pupil
      ctx.beginPath();
      ctx.ellipse(ix, iy, ir * 0.36, ir * 0.46, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#09111f';
      ctx.fill();

      // Twin crisp specular catchlights
      ctx.beginPath();
      ctx.arc(ix - ir * 0.32, iy - ir * 0.32, ir * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ix + ir * 0.28, iy + ir * 0.26, ir * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(185, 255, 252, ${0.75 + 0.25 * songGlow})`;
      ctx.fill();
    }

    // Closed / closing lavender-pearl eyelid wash
    if (blink > 0.05) {
      ctx.fillStyle = `rgba(182, 198, 222, ${blink * 0.92})`;
      ctx.fillRect(-rx - 2, -ry - 2, rx * 2 + 4, ry * 2 + 4);
    }

    ctx.restore(); // end eye clip

    // Upper lash line with siren wing flick
    ctx.beginPath();
    ctx.moveTo(-rx - 0.8, 1.0);
    ctx.bezierCurveTo(-rx * 0.45, -openRy * 1.38, rx * 0.48, -openRy * 1.38, rx + 2.2, -1.6 + blink * 2.0);
    ctx.strokeStyle = '#182038';
    ctx.lineWidth = 1.75;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Subtle lower rim highlight
    ctx.beginPath();
    ctx.moveTo(-rx * 0.7, openRy * 0.9);
    ctx.quadraticCurveTo(0, openRy * 1.25, rx * 0.75, openRy * 0.7);
    ctx.strokeStyle = 'rgba(195, 232, 248, 0.42)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  function drawCrownPlumes(t, headX, headY, headTilt, backHand, songGlow) {
    // 8 regal crimson oarfish crest rays rising from the median line of her crown
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt);

    const plumes = [
      { bx: -5, by: -68, len: 86, ang: -1.96, curve: -0.45, lureToHand: true },
      { bx: -2, by: -70, len: 96, ang: -1.66, curve: -0.18, lureToHand: false },
      { bx:  2, by: -71, len: 92, ang: -1.44, curve:  0.14, lureToHand: false },
      { bx:  6, by: -70, len: 82, ang: -1.24, curve:  0.24, lureToHand: false },
      { bx: 10, by: -68, len: 70, ang: -1.04, curve:  0.30, lureToHand: false },
      { bx: 13, by: -65, len: 58, ang: -0.84, curve:  0.34, lureToHand: false },
      { bx: 16, by: -61, len: 47, ang: -0.64, curve:  0.36, lureToHand: false },
      { bx: 18, by: -56, len: 38, ang: -0.44, curve:  0.36, lureToHand: false }
    ];

    const mids = [];
    const tips = [];

    // Convert backHand into local head coordinates so the foremost lure filament responds delicately
    const dxH = backHand.wrX - headX;
    const dyH = backHand.wrY - headY;
    const cosT = Math.cos(-headTilt);
    const sinT = Math.sin(-headTilt);
    const localHandX = dxH * cosT - dyH * sinT - 12;
    const localHandY = dxH * sinT + dyH * cosT - 18;

    for (let i = 0; i < plumes.length; i++) {
      const p = plumes[i];
      const sway = Math.sin(t * 1.75 - i * 0.38) * 0.11 + pointer.weight * (pointer.x - 300) * 0.0004;
      const a1 = p.ang + sway * 0.6;
      const a2 = p.ang + p.curve + sway * 1.25;

      const mx = p.bx + Math.cos(a1) * (p.len * 0.48);
      const my = p.by + Math.sin(a1) * (p.len * 0.48);
      const tx = p.bx + Math.cos(a2) * p.len;
      const ty = p.by + Math.sin(a2) * p.len;

      mids.push({ x: mx, y: my });
      tips.push({ x: tx, y: ty, bx: p.bx, by: p.by });
    }

    // Sheer opalescent rose webbing across the lower 42% of the crown crest
    ctx.beginPath();
    ctx.moveTo(plumes[0].bx, plumes[0].by);
    for (let i = 0; i < plumes.length; i++) {
      const wx = plumes[i].bx + (mids[i].x - plumes[i].bx) * 0.85;
      const wy = plumes[i].by + (mids[i].y - plumes[i].by) * 0.85;
      ctx.lineTo(wx, wy);
    }
    for (let i = plumes.length - 1; i >= 0; i--) {
      ctx.lineTo(plumes[i].bx, plumes[i].by);
    }
    ctx.closePath();
    const webGrad = ctx.createLinearGradient(0, -68, 12, -115);
    webGrad.addColorStop(0, 'rgba(198, 28, 64, 0.68)');
    webGrad.addColorStop(1, 'rgba(255, 132, 138, 0.16)');
    ctx.fillStyle = webGrad;
    ctx.fill();

    // Draw each arching crimson plume & glowing golden-rose oar tip
    ctx.lineCap = 'round';
    for (let i = 0; i < plumes.length; i++) {
      const tPt = tips[i];
      const mPt = mids[i];

      const pGrad = ctx.createLinearGradient(tPt.bx, tPt.by, tPt.x, tPt.y);
      pGrad.addColorStop(0, '#c81d46');
      pGrad.addColorStop(0.6, '#f64d68');
      pGrad.addColorStop(1, '#ffd98a');

      ctx.beginPath();
      ctx.moveTo(tPt.bx, tPt.by);
      ctx.quadraticCurveTo(mPt.x, mPt.y, tPt.x, tPt.y);
      ctx.strokeStyle = pGrad;
      ctx.lineWidth = 2.0 - i * 0.12;
      ctx.stroke();

      // Bioluminescent tip bud
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.8 - i * 0.45);
      const glowR = 5.5 + pulse * 3.0 + songGlow * 2.5;
      const bGrad = ctx.createRadialGradient(tPt.x, tPt.y, 0.5, tPt.x, tPt.y, glowR);
      bGrad.addColorStop(0, 'rgba(255, 245, 195, 0.95)');
      bGrad.addColorStop(0.38, 'rgba(255, 118, 118, 0.55)');
      bGrad.addColorStop(1, 'rgba(255, 70, 95, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(tPt.x, tPt.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tPt.x, tPt.y, 1.9, 0, Math.PI * 2);
      ctx.fillStyle = '#fff5cc';
      ctx.fill();
    }

    // Delicate angler-silk lure curving from foremost crown plume toward her raised left hand
    const p0 = tips[0];
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(
      p0.x - 28, p0.y + 22,
      localHandX - 18, localHandY - 26,
      localHandX, localHandY
    );
    const lureGrad = ctx.createLinearGradient(p0.x, p0.y, localHandX, localHandY);
    lureGrad.addColorStop(0, 'rgba(255, 195, 140, 0.72)');
    lureGrad.addColorStop(0.55, 'rgba(255, 98, 122, 0.48)');
    lureGrad.addColorStop(1, 'rgba(145, 250, 248, 0.85)');
    ctx.strokeStyle = lureGrad;
    ctx.lineWidth = 1.05;
    ctx.stroke();

    // Glowing cyan-gold lantern orb hovering at her poised fingertips
    const orbPulse = 0.65 + 0.35 * Math.sin(t * 3.6);
    const orbR = 11 + orbPulse * 4 + songGlow * 4;
    const oGrad = ctx.createRadialGradient(localHandX, localHandY, 1, localHandX, localHandY, orbR);
    oGrad.addColorStop(0, 'rgba(255, 252, 220, 0.96)');
    oGrad.addColorStop(0.32, 'rgba(135, 248, 245, 0.62)');
    oGrad.addColorStop(1, 'rgba(135, 248, 245, 0)');
    ctx.fillStyle = oGrad;
    ctx.beginPath();
    ctx.arc(localHandX, localHandY, orbR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawNeckHeadAndFace(t, headX, headY, headTilt, bobY, blink, songGlow, backHand) {
    // Slender neck with subtle chin shadow
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(286, 330 + bobY);
    ctx.quadraticCurveTo(288, 348 + bobY, 282, 364 + bobY);
    ctx.lineTo(314, 364 + bobY);
    ctx.quadraticCurveTo(308, 348 + bobY, 309, 330 + bobY);
    ctx.closePath();
    const neckGrad = ctx.createLinearGradient(284, 332 + bobY, 312, 360 + bobY);
    neckGrad.addColorStop(0, '#c8dce8');
    neckGrad.addColorStop(0.5, '#b1cada');
    neckGrad.addColorStop(1, '#86a2be');
    ctx.fillStyle = neckGrad;
    ctx.fill();

    // Soft cast shadow under jaw
    ctx.beginPath();
    ctx.ellipse(297, 339 + bobY, 12, 6, 0.08, 0, Math.PI);
    ctx.fillStyle = 'rgba(68, 92, 124, 0.38)';
    ctx.fill();
    ctx.restore();

    // Crown plumes behind front hair
    drawCrownPlumes(t, headX, headY, headTilt, backHand, songGlow);

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt);

    // Lateral Ear-Fins
    drawEarFin(-23.5, -34, -1, t);
    drawEarFin(23.5, -33, 1, t);

    // Sculpted Head & Face (graceful oval tapering to chin at (-2.5, 2))
    ctx.beginPath();
    ctx.moveTo(-2, -71);
    ctx.bezierCurveTo(-18, -71, -25.5, -56, -24.5, -37);
    ctx.bezierCurveTo(-23.5, -20, -14, -4, -2.5, 2);
    ctx.bezierCurveTo(10, -3, 21.5, -18, 24.5, -35);
    ctx.bezierCurveTo(26.5, -55, 17, -71, -2, -71);
    ctx.closePath();

    const faceGrad = ctx.createRadialGradient(-8, -44, 5, 0, -36, 46);
    faceGrad.addColorStop(0, '#f1f8fc');
    faceGrad.addColorStop(0.52, '#d5e7f1');
    faceGrad.addColorStop(0.86, '#a5bfd6');
    faceGrad.addColorStop(1, '#7f9bb8');
    ctx.fillStyle = faceGrad;
    ctx.fill();

    // Soft coral-rose cheek luminescence
    const blushL = ctx.createRadialGradient(-15, -26, 1, -15, -26, 11);
    blushL.addColorStop(0, 'rgba(235, 118, 148, 0.22)');
    blushL.addColorStop(1, 'rgba(235, 118, 148, 0)');
    ctx.fillStyle = blushL;
    ctx.beginPath();
    ctx.arc(-15, -26, 11, 0, Math.PI * 2);
    ctx.fill();

    const blushR = ctx.createRadialGradient(11, -25, 1, 11, -25, 12);
    blushR.addColorStop(0, 'rgba(235, 118, 148, 0.22)');
    blushR.addColorStop(1, 'rgba(235, 118, 148, 0)');
    ctx.fillStyle = blushR;
    ctx.beginPath();
    ctx.arc(11, -25, 12, 0, Math.PI * 2);
    ctx.fill();

    // Bioluminescent brow & cheekbone photophore dots
    const browDots = [
      { x: -16, y: -49, r: 0.9 }, { x: -11, y: -51, r: 1.1 },
      { x: 5,   y: -51, r: 1.1 }, { x: 11,  y: -49, r: 1.0 }, { x: 16, y: -46, r: 0.85 },
      { x: -19, y: -28, r: 0.85 }, { x: 16, y: -27, r: 0.9 }, { x: 19, y: -24, r: 0.75 }
    ];
    for (let i = 0; i < browDots.length; i++) {
      const d = browDots[i];
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(182, 250, 250, ${0.52 + 0.38 * songGlow})`;
      ctx.fill();
    }

    // Expressive Abyssal Eyes (slight 3/4 perspective: left eye slightly narrower)
    drawEye(-13.2, -36.5, 6.2, 4.1, blink, songGlow);
    drawEye(8.4, -36.2, 6.8, 4.3, blink, songGlow);

    // Graceful silver-indigo eyebrows
    const browLift = pointer.weight * 1.1 + songGlow * 0.8;
    ctx.strokeStyle = 'rgba(42, 54, 88, 0.78)';
    ctx.lineWidth = 1.45;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, -42.5 - browLift * 0.5);
    ctx.quadraticCurveTo(-13.5, -46.8 - browLift, -7.2, -43.5);
    ctx.moveTo(1.8, -43.5);
    ctx.quadraticCurveTo(9.2, -47.0 - browLift, 16.5, -42.2 - browLift * 0.5);
    ctx.stroke();

    // Delicate nose bridge & tip shadow
    ctx.beginPath();
    ctx.moveTo(-3.5, -36);
    ctx.quadraticCurveTo(-5.8, -27, -5.2, -22.5);
    ctx.quadraticCurveTo(-3.2, -20.8, -1.0, -21.8);
    ctx.strokeStyle = 'rgba(98, 124, 154, 0.52)';
    ctx.lineWidth = 1.15;
    ctx.stroke();

    // Tiny pearl highlight on nose tip
    ctx.beginPath();
    ctx.arc(-4.0, -23.2, 1.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.fill();

    // Expressive Lips (subtle sly smile, parting slightly during bioluminescent song)
    const smile = 0.6 + pointer.weight * 0.6;
    const part = songGlow * 1.6;

    // Soft interior glow if parted during song
    if (part > 0.25) {
      ctx.beginPath();
      ctx.ellipse(-2.8, -12.2, 5.2, 0.7 + part, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#3b1c34';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-2.8, -12.2, 3.2, 0.4 + part * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(145, 248, 245, ${songGlow * 0.55})`;
      ctx.fill();
    }

    // Upper lip Cupid's bow
    ctx.beginPath();
    ctx.moveTo(-9.2, -12.2 - smile * 0.4);
    ctx.quadraticCurveTo(-5.6, -15.2 - part * 0.3, -3.6, -13.8 - part * 0.3);
    ctx.quadraticCurveTo(-1.8, -15.2 - part * 0.3, 3.8, -12.0 - smile * 0.6);
    ctx.quadraticCurveTo(-2.8, -11.8 - part * 0.4, -9.2, -12.2 - smile * 0.4);
    ctx.closePath();
    ctx.fillStyle = '#8e3c5c';
    ctx.fill();

    // Lower lip
    ctx.beginPath();
    ctx.moveTo(-8.8, -12.0 - smile * 0.3);
    ctx.quadraticCurveTo(-2.8, -11.5 + part * 0.5, 3.4, -11.8 - smile * 0.5);
    ctx.quadraticCurveTo(-2.6, -7.8 + part * 0.8, -8.8, -12.0 - smile * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#b45879';
    ctx.fill();

    // Wet specular glint on lower lip
    ctx.beginPath();
    ctx.ellipse(-2.5, -10.2 + part * 0.4, 2.3, 0.65, -0.05, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 240, 245, 0.68)';
    ctx.fill();

    // Front Hair Locks (silky moonlit indigo & silver framing temples and forehead)
    const swayL = Math.sin(t * 1.55) * 4.5;
    const swayR = Math.cos(t * 1.42) * 5.5;

    // Left temple lock
    ctx.beginPath();
    ctx.moveTo(-3, -71);
    ctx.bezierCurveTo(-18, -72, -29, -56, -28 + swayL * 0.5, -30);
    ctx.bezierCurveTo(-27 + swayL, -4, -32 + swayL * 1.3, 18, -22 + swayL * 1.4, 38);
    ctx.bezierCurveTo(-22 + swayL, 12, -19 + swayL * 0.4, -18, -20, -44);
    ctx.quadraticCurveTo(-14, -60, -2, -65);
    ctx.closePath();
    const fhGradL = ctx.createLinearGradient(-15, -70, -24, 38);
    fhGradL.addColorStop(0, '#1c2848');
    fhGradL.addColorStop(0.55, '#3b4a74');
    fhGradL.addColorStop(1, 'rgba(185, 206, 238, 0.35)');
    ctx.fillStyle = fhGradL;
    ctx.fill();

    // Right sweeping lock
    ctx.beginPath();
    ctx.moveTo(-3, -71);
    ctx.bezierCurveTo(15, -73, 29, -56, 28 + swayR * 0.5, -28);
    ctx.bezierCurveTo(28 + swayR, 2, 36 + swayR * 1.3, 26, 28 + swayR * 1.5, 52);
    ctx.bezierCurveTo(24 + swayR, 24, 20 + swayR * 0.5, -14, 19, -44);
    ctx.quadraticCurveTo(10, -61, -3, -65);
    ctx.closePath();
    const fhGradR = ctx.createLinearGradient(12, -70, 28, 52);
    fhGradR.addColorStop(0, '#1a2544');
    fhGradR.addColorStop(0.5, '#35436b');
    fhGradR.addColorStop(0.85, '#7a5a88');
    fhGradR.addColorStop(1, 'rgba(205, 195, 235, 0.25)');
    ctx.fillStyle = fhGradR;
    ctx.fill();

    // Delicate silver widow's-peak hair strands
    ctx.strokeStyle = 'rgba(218, 236, 255, 0.42)';
    ctx.lineWidth = 0.95;
    ctx.beginPath();
    ctx.moveTo(-2, -67);
    ctx.bezierCurveTo(-16, -60, -23, -38, -23 + swayL, 8);
    ctx.moveTo(1, -67);
    ctx.bezierCurveTo(17, -59, 23, -34, 25 + swayR, 18);
    ctx.stroke();

    ctx.restore();
  }

  function drawFrontArm(t, bobY) {
    // Her left arm (viewer's right), trailing gracefully down so her webbed fingertips
    // skim and dip right across the 70% waterline (y = 560)
    const shX = 337;
    const shY = 376 + bobY;
    const elX = 362 + Math.sin(t * 1.1 - 0.5) * 3.5;
    const elY = 452 + bobY + Math.cos(t * 1.0 - 0.3) * 2.5;
    const wrX = 334 + Math.sin(t * 1.45 - 1.1) * 5.5;
    const wrY = 532 + bobY * 0.45 + Math.cos(t * 1.3 - 0.8) * 3.0;

    ctx.save();

    // Translucent crimson-pearl forearm finlet trailing off outer forearm
    ctx.beginPath();
    ctx.moveTo(elX + 3, elY - 2);
    ctx.quadraticCurveTo(
      (elX + wrX) * 0.5 + 22 + Math.sin(t * 2.9 - 0.8) * 3.5,
      (elY + wrY) * 0.5 + 4,
      wrX + 4, wrY - 2
    );
    ctx.lineTo(elX, elY + 2);
    ctx.closePath();
    const fGrad = ctx.createLinearGradient(elX, elY, elX + 22, elY + 25);
    fGrad.addColorStop(0, 'rgba(198, 38, 72, 0.54)');
    fGrad.addColorStop(1, 'rgba(255, 162, 148, 0.14)');
    ctx.fillStyle = fGrad;
    ctx.fill();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Soft ambient shadow
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.quadraticCurveTo((shX + elX) * 0.5 + 3, (shY + elY) * 0.5, elX, elY);
    ctx.strokeStyle = '#7e9ab6';
    ctx.lineWidth = 14.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(elX, elY);
    ctx.quadraticCurveTo((elX + wrX) * 0.5 + 3, (elY + wrY) * 0.5 + 2, wrX, wrY);
    ctx.strokeStyle = '#84a0bc';
    ctx.lineWidth = 11.0;
    ctx.stroke();

    // Luminous porcelain skin highlight
    ctx.beginPath();
    ctx.moveTo(shX - 1, shY);
    ctx.quadraticCurveTo((shX + elX) * 0.5 + 1, (shY + elY) * 0.5, elX - 1, elY);
    ctx.strokeStyle = '#d3e5f0';
    ctx.lineWidth = 11.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(elX - 1, elY);
    ctx.quadraticCurveTo((elX + wrX) * 0.5 + 1, (elY + wrY) * 0.5 + 1, wrX - 1, wrY);
    ctx.strokeStyle = '#dcecf5';
    ctx.lineWidth = 8.6;
    ctx.stroke();

    // Hand dipping right across y = 550..562 (the 70% waterline!)
    const handAng = Math.atan2(wrY - elY, wrX - elX) - Math.PI * 0.48 + Math.sin(t * 1.8) * 0.08;
    drawWebbedHand(wrX, wrY, handAng, 0.94, 0.94, t + 1.2);

    ctx.restore();
  }

  let prevTime = performance.now() * 0.001;

  function render(nowMs) {
    const t = nowMs * 0.001;
    const dt = Math.min(0.05, Math.max(0.001, t - prevTime));
    prevTime = t;

    updateGazeAndMood(t, dt);

    // Organic cycles: calm breath, gentle buoyancy, periodic silent song & tail flick
    const breath = Math.sin(t * 1.14);
    const bobY = breath * 3.8 + Math.sin(t * 0.53) * 1.8;

    // Periodic tail-tip flick every ~8.8 seconds
    const flickPhase = (t % 8.8) / 8.8;
    const flickEnv = Math.exp(-Math.pow((flickPhase - 0.52) / 0.09, 2));
    const flickAmp = flickEnv * Math.sin((flickPhase - 0.52) * 34.0);

    // Periodic silent deep-sea "song" (bioluminescent pulse along ribs & lateral line)
    const songCycle = Math.max(0, Math.sin(t * 0.72 - 0.8));
    const songGlow = Math.min(1, Math.pow(songCycle, 3) * 0.85 + pointer.weight * 0.45);

    const headX = 297 + Math.sin(t * 0.85 + 0.4) * 2.0 + gaze.curX * 2.8;
    const headY = 336 + bobY;
    const headTilt = -0.055 + Math.sin(t * 0.72) * 0.035 + gaze.curX * 0.065;
    const blink = getBlinkAmount(t);

    computeSpine(t, breath, bobY, flickAmp);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.setTransform(
      viewScale * dpr, 0,
      0, viewScale * dpr,
      offsetX * dpr, offsetY * dpr
    );

    // Layer 1: Flowing twilight-silver back hair
    drawBackHair(t, headX, headY, headTilt);

    // Layer 2: Cervical/thoracic crimson dorsal fin behind neck & back
    drawCervicalDorsalFin(t, headX, headY, headTilt, bobY, songGlow);

    // Layer 3: Poised back arm (viewer's left)
    const backHand = drawBackArm(t, bobY);

    // Layer 4: Coiled mirror-silver oarfish body, markings, lateral photophores & crimson dorsal ribbon
    drawTailAndDorsalFin(t, songGlow);

    // Layer 5: Human torso, pulsing cyan-gold gill slits, iridescent scale cuirass & pectoral fin-drapes
    drawTorsoAndBodice(t, bobY, breath, songGlow);

    // Layer 6: Elongated crimson-gold pelvic oar-rays trailing into the water
    drawPelvicOarRays(t, bobY, songGlow);

    // Layer 7: Neck, regal crown plumes, ear-fins, sculpted face, lantern eyes & front locks
    drawNeckHeadAndFace(t, headX, headY, headTilt, bobY, blink, songGlow, backHand);

    // Layer 8: Front arm trailing its webbed fingertips across the 70% waterline
    drawFrontArm(t, bobY);

    ctx.restore();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Queen of the Silver Herrings",
  "statement": "She rose beside the rudder in a dead-glass calm off the Azores, half pale woman and half mirror-bright oarfish crowned in scarlet plumes that burned without smoke. Never a word did she speak, only watched us with those twin lantern eyes while a cold light ran pulsing down her ribs and coiled silver spine, till the helm went slack in my hands."
}
```