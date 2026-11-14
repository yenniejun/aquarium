```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = 1, U = 1;
  let pointerTargetX = 0, pointerTargetY = 0;
  let pointerX = 0, pointerY = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(W * DPR));
    canvas.height = Math.max(1, Math.floor(H * DPR));
    U = Math.min(W, H * 0.75);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener('pointermove', (e) => {
    if (!W || !H) return;
    pointerTargetX = ((e.clientX / W) - 0.5) * 2;
    pointerTargetY = ((e.clientY / H) - 0.5) * 2;
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
  }, { passive: true });

  const TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smoothstep(a, b, x) {
    const u = clamp((x - a) / (b - a), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function smootherstep(a, b, x) {
    const u = clamp((x - a) / (b - a), 0, 1);
    return u * u * u * (u * (u * 6 - 15) + 10);
  }
  function mixColor(c1, c2, u) {
    return [lerp(c1[0], c2[0], u), lerp(c1[1], c2[1], u), lerp(c1[2], c2[2], u)];
  }
  function rgba(c, a) {
    return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a, 0, 1).toFixed(3)})`;
  }

  // Deterministic PRNG for pebbles, moss, root veins, and particles
  function mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(42073);

  const pebbles = Array.from({ length: 28 }, (_, i) => ({
    xNorm: 0.05 + rng() * 0.90,
    yDepth: 0.012 + rng() * 0.095,
    rx: 0.008 + rng() * 0.019,
    ry: 0.005 + rng() * 0.011,
    rot: (rng() - 0.5) * 0.8,
    shade: rng(),
    crystal: i % 6 === 0
  }));

  const mineralShards = Array.from({ length: 6 }, (_, i) => ({
    xNorm: 0.16 + (i / 5) * 0.68 + (rng() - 0.5) * 0.06,
    h: 0.018 + rng() * 0.022,
    w: 0.007 + rng() * 0.006,
    tilt: (rng() - 0.5) * 0.55
  }));

  const roots = Array.from({ length: 10 }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const spread = 0.08 + (Math.floor(i / 2) / 5) * 0.34;
    return {
      side,
      spread,
      depth: 0.04 + rng() * 0.085,
      wave: (rng() - 0.5) * 0.04,
      phase: rng() * TAU
    };
  });

  const pollenMotes = Array.from({ length: 14 }, (_, i) => ({
    phase: i / 14,
    radius: 0.04 + rng() * 0.14,
    rise: 0.08 + rng() * 0.13,
    speed: 1 + (i % 3),
    size: 0.003 + rng() * 0.004,
    warm: rng()
  }));

  const moonSeeds = Array.from({ length: 5 }, (_, i) => ({
    tStart: 26.2 + i * 1.15,
    duration: 4.8 + (i % 2) * 0.6,
    targetXOff: (i - 2) * 0.075 + (rng() - 0.5) * 0.02,
    swirlFreq: 2.2 + (i % 3) * 0.5,
    swirlAmp: 0.035 + rng() * 0.025
  }));

  function soilSurfaceY(xNorm) {
    const dx = (xNorm - 0.5) * 2;
    return H * (0.848 + 0.024 * dx * dx - 0.006 * Math.cos(xNorm * Math.PI * 3));
  }

  function drawSoil(t, dayBlend, warmBlend, nightBlend, rootGlow, seedPulse) {
    const cx = W * 0.5;
    const steps = 32;

    // Soil base gradient
    const topSoilDay = [68, 52, 38];
    const topSoilNight = [22, 27, 42];
    const botSoilDay = [28, 21, 16];
    const botSoilNight = [9, 11, 18];
    const warmSoil = [92, 56, 40];

    let cTop = mixColor(topSoilNight, topSoilDay, dayBlend);
    cTop = mixColor(cTop, warmSoil, warmBlend * 0.55);
    const cBot = mixColor(botSoilNight, botSoilDay, dayBlend);

    const grad = ctx.createLinearGradient(0, H * 0.84, 0, H);
    grad.addColorStop(0, rgba(cTop, 0.98));
    grad.addColorStop(0.45, rgba(mixColor(cTop, cBot, 0.55), 0.99));
    grad.addColorStop(1, rgba(cBot, 1));

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i <= steps; i++) {
      const xn = i / steps;
      ctx.lineTo(xn * W, soilSurfaceY(xn));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle rim light along the top contour of the soil
    const rimDay = [156, 178, 122];
    const rimWarm = [235, 162, 110];
    const rimNight = [95, 155, 210];
    let rimCol = mixColor(rimNight, rimDay, dayBlend);
    rimCol = mixColor(rimCol, rimWarm, warmBlend * 0.7);

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const xn = i / steps;
      const px = xn * W, py = soilSurfaceY(xn);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = rgba(rimCol, 0.42 + 0.2 * dayBlend);
    ctx.lineWidth = Math.max(1, U * 0.004);
    ctx.stroke();

    // Subterranean luminous root circuitry
    const rootGrow = smootherstep(0.0, 4.5, t) * (1 - smootherstep(33.5, 39.3, t));
    if (rootGrow > 0.005) {
      const rootOriginY = soilSurfaceY(0.5) + H * 0.008;
      const rootColDay = [165, 205, 120];
      const rootColNight = [90, 235, 255];
      const rootCol = mixColor(rootColNight, rootColDay, dayBlend);

      for (const r of roots) {
        const endX = cx + r.side * r.spread * W * rootGrow;
        const endY = rootOriginY + r.depth * H * rootGrow;
        const ctrlX = cx + r.side * r.spread * 0.45 * W * rootGrow;
        const ctrlY = rootOriginY + (r.depth * 0.35 + r.wave) * H * rootGrow;

        ctx.beginPath();
        ctx.moveTo(cx, rootOriginY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        const alpha = (0.14 + 0.38 * rootGlow + 0.16 * nightBlend) * rootGrow;
        ctx.strokeStyle = rgba(rootCol, alpha);
        ctx.lineWidth = Math.max(0.8, U * 0.0032);
        ctx.stroke();

        // Tiny glowing root node at tip
        ctx.beginPath();
        ctx.arc(endX, endY, U * (0.004 + 0.002 * rootGlow), 0, TAU);
        ctx.fillStyle = rgba(rootCol, alpha * 1.25);
        ctx.fill();
      }
    }

    // Pebbles & crystalline soil inclusions
    for (const p of pebbles) {
      const px = p.xNorm * W;
      const py = soilSurfaceY(p.xNorm) + p.yDepth * H;
      if (py > H - 2) continue;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.rx * U, p.ry * U, 0, 0, TAU);
      if (p.crystal) {
        const cCol = mixColor([110, 215, 245], [175, 210, 175], dayBlend);
        ctx.fillStyle = rgba(cCol, 0.28 + 0.25 * nightBlend);
      } else {
        const pCol = mixColor([36, 42, 60], [95 + p.shade * 45, 80 + p.shade * 35, 65 + p.shade * 25], dayBlend);
        ctx.fillStyle = rgba(pCol, 0.55);
      }
      ctx.fill();
      ctx.restore();
    }

    // Small surface quartz shards
    const shardCol = mixColor([125, 225, 255], [215, 245, 225], dayBlend);
    for (const s of mineralShards) {
      const sx = s.xNorm * W;
      const sy = soilSurfaceY(s.xNorm) + U * 0.004;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(s.tilt);
      ctx.beginPath();
      ctx.moveTo(-s.w * U, 0);
      ctx.lineTo(0, -s.h * U);
      ctx.lineTo(s.w * U, 0);
      ctx.closePath();
      ctx.fillStyle = rgba(shardCol, 0.28 + 0.22 * (nightBlend + dayBlend * 0.5));
      ctx.fill();
      ctx.strokeStyle = rgba([240, 252, 255], 0.35);
      ctx.lineWidth = Math.max(0.6, U * 0.0018);
      ctx.stroke();
      ctx.restore();
    }

    // Seed-landing ripples in soil (t = 30.8 .. 37.5)
    for (const ms of moonSeeds) {
      const landT = ms.tStart + ms.duration;
      if (t >= landT && t < landT + 2.2) {
        const age = (t - landT) / 2.2;
        const lx = cx + ms.targetXOff * W;
        const ly = soilSurfaceY(0.5 + ms.targetXOff);
        ctx.beginPath();
        ctx.ellipse(lx, ly, U * (0.01 + age * 0.065), U * (0.004 + age * 0.018), 0, 0, TAU);
        ctx.strokeStyle = rgba([130, 245, 255], (1 - age) * 0.65);
        ctx.lineWidth = Math.max(1, U * 0.003);
        ctx.stroke();
      }
    }

    // Central resting crystalline seed-bulb
    const bulbY = soilSurfaceY(0.5) + U * 0.006;
    const bulbCol = mixColor([110, 230, 255], [225, 200, 120], dayBlend);
    const bulbGlow = ctx.createRadialGradient(cx, bulbY - U * 0.01, 0, cx, bulbY - U * 0.01, U * 0.065);
    bulbGlow.addColorStop(0, rgba(bulbCol, 0.38 * (0.45 + 0.55 * seedPulse)));
    bulbGlow.addColorStop(1, rgba(bulbCol, 0));
    ctx.fillStyle = bulbGlow;
    ctx.beginPath();
    ctx.arc(cx, bulbY - U * 0.01, U * 0.065, 0, TAU);
    ctx.fill();

    // Faceted bulb scales
    for (let s = -1; s <= 1; s++) {
      ctx.save();
      ctx.translate(cx, bulbY);
      ctx.rotate(s * 0.36);
      ctx.beginPath();
      ctx.moveTo(0, U * 0.008);
      ctx.quadraticCurveTo(-U * 0.018, -U * 0.02, 0, -U * 0.044);
      ctx.quadraticCurveTo(U * 0.018, -U * 0.02, 0, U * 0.008);
      ctx.fillStyle = rgba(mixColor([48, 95, 130], [115, 165, 105], dayBlend), 0.72);
      ctx.fill();
      ctx.strokeStyle = rgba(bulbCol, 0.55 + 0.25 * seedPulse);
      ctx.lineWidth = Math.max(0.8, U * 0.0024);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawLeaf(ox, oy, dir, length, width, bend, unfurl, dayBlend, warmBlend, nightBlend) {
    if (length <= 1 || unfurl <= 0.01) return;
    const L = length * unfurl;
    const Wl = width * (0.45 + 0.55 * unfurl);
    const actualBend = lerp(bend * 1.9, bend, unfurl);

    function spinePt(u) {
      const along = u * L;
      const perp = actualBend * L * (u * u);
      const tx = Math.cos(dir), ty = Math.sin(dir);
      const nx = -ty, ny = tx;
      return {
        x: ox + tx * along + nx * perp,
        y: oy + ty * along + ny * perp
      };
    }

    function leafNormal(u) {
      const eps = 0.01;
      const p0 = spinePt(Math.max(0, u - eps));
      const p1 = spinePt(Math.min(1, u + eps));
      const dx = p1.x - p0.x, dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy) || 1;
      return { nx: -dy / len, ny: dx / len };
    }

    function halfW(u) {
      return Wl * Math.sin(Math.pow(clamp(u, 0, 1), 0.68) * Math.PI);
    }

    const segs = 14;
    const rightPts = [];
    const leftPts = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const sp = spinePt(u);
      const nm = leafNormal(u);
      const w = halfW(u);
      rightPts.push({ x: sp.x + nm.nx * w, y: sp.y + nm.ny * w });
      leftPts.push({ x: sp.x - nm.nx * w, y: sp.y - nm.ny * w });
    }

    const baseDay = [32, 128, 92];
    const tipDay = [148, 224, 145];
    const baseNight = [22, 62, 118];
    const tipNight = [95, 228, 245];
    const warmTip = [245, 178, 115];

    const cBase = mixColor(baseNight, baseDay, dayBlend);
    let cTip = mixColor(tipNight, tipDay, dayBlend);
    cTip = mixColor(cTip, warmTip, warmBlend * 0.55);

    const endPt = spinePt(1);
    const grad = ctx.createLinearGradient(ox, oy, endPt.x, endPt.y);
    grad.addColorStop(0, rgba(cBase, 0.85));
    grad.addColorStop(0.6, rgba(mixColor(cBase, cTip, 0.65), 0.78));
    grad.addColorStop(1, rgba(cTip, 0.88));

    ctx.beginPath();
    ctx.moveTo(rightPts[0].x, rightPts[0].y);
    for (let i = 1; i <= segs; i++) ctx.lineTo(rightPts[i].x, rightPts[i].y);
    for (let i = segs - 1; i >= 0; i--) ctx.lineTo(leftPts[i].x, leftPts[i].y);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    const edgeCol = mixColor([135, 245, 255], [220, 250, 185], dayBlend);
    ctx.strokeStyle = rgba(edgeCol, 0.45 + 0.25 * nightBlend);
    ctx.lineWidth = Math.max(0.8, U * 0.0024);
    ctx.stroke();

    // Central luminous midrib
    ctx.beginPath();
    for (let i = 0; i <= segs; i++) {
      const sp = spinePt(i / segs);
      if (i === 0) ctx.moveTo(sp.x, sp.y);
      else ctx.lineTo(sp.x, sp.y);
    }
    ctx.strokeStyle = rgba(edgeCol, 0.55 + 0.25 * nightBlend);
    ctx.lineWidth = Math.max(0.7, U * 0.0022);
    ctx.stroke();

    // Geometric chevron veins
    ctx.strokeStyle = rgba(edgeCol, 0.24 + 0.28 * nightBlend);
    ctx.lineWidth = Math.max(0.5, U * 0.0015);
    for (let k = 1; k <= 5; k++) {
      const u0 = k * 0.145;
      const u1 = Math.min(0.95, u0 + 0.13);
      const sp0 = spinePt(u0);
      const sp1 = spinePt(u1);
      const nm1 = leafNormal(u1);
      const w1 = halfW(u1) * 0.78;
      ctx.beginPath();
      ctx.moveTo(sp1.x + nm1.nx * w1, sp1.y + nm1.ny * w1);
      ctx.lineTo(sp0.x, sp0.y);
      ctx.lineTo(sp1.x - nm1.nx * w1, sp1.y - nm1.ny * w1);
      ctx.stroke();
    }
  }

  function drawLotusPetal(cx, cy, angle, len, wid, curve, fillColTop, fillColBot, edgeCol, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(0, 0, 0, -len);
    grad.addColorStop(0, rgba(fillColBot, alpha * 0.92));
    grad.addColorStop(0.55, rgba(mixColor(fillColBot, fillColTop, 0.65), alpha * 0.8));
    grad.addColorStop(1, rgba(fillColTop, alpha * 0.95));

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-wid, -len * 0.34, -wid * (0.72 - curve * 0.25), -len * 0.78, 0, -len);
    ctx.bezierCurveTo(wid * (0.72 - curve * 0.25), -len * 0.78, wid, -len * 0.34, 0, 0);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = rgba(edgeCol, alpha * 0.72);
    ctx.lineWidth = Math.max(0.7, U * 0.0022);
    ctx.stroke();

    // Subtle center prism rib
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.08);
    ctx.lineTo(0, -len * 0.9);
    ctx.strokeStyle = rgba([255, 255, 255], alpha * 0.35);
    ctx.lineWidth = Math.max(0.5, U * 0.0014);
    ctx.stroke();

    ctx.restore();
  }

  function projectRingPoint(theta, radius, tilt, incl, cx, cy) {
    const x0 = radius * Math.cos(theta);
    const y0 = radius * Math.sin(theta) * Math.sin(incl);
    const z0 = radius * Math.sin(theta) * Math.cos(incl);
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    return {
      x: cx + x0 * ct - y0 * st,
      y: cy + x0 * st + y0 * ct,
      z: z0
    };
  }

  function drawOrreryHalf(cx, cy, radius, tilt, incl, rotPhase, col, alpha, drawBack, beadCount) {
    if (radius <= 1 || alpha <= 0.01) return;
    const steps = 48;
    ctx.lineWidth = Math.max(0.7, U * 0.0024);

    for (let i = 0; i < steps; i++) {
      const a0 = (i / steps) * TAU + rotPhase;
      const a1 = ((i + 1) / steps) * TAU + rotPhase;
      const p0 = projectRingPoint(a0, radius, tilt, incl, cx, cy);
      const p1 = projectRingPoint(a1, radius, tilt, incl, cx, cy);
      const isBack = (p0.z + p1.z) * 0.5 < 0;
      if (isBack !== drawBack) continue;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = rgba(col, alpha * (drawBack ? 0.42 : 0.92));
      ctx.stroke();
    }

    // Orbiting pollen satellites
    for (let b = 0; b < beadCount; b++) {
      const theta = rotPhase + (b / beadCount) * TAU;
      const p = projectRingPoint(theta, radius, tilt, incl, cx, cy);
      const isBack = p.z < 0;
      if (isBack !== drawBack) continue;

      // Tiny comet trail
      for (let tr = 1; tr <= 4; tr++) {
        const pt = projectRingPoint(theta - tr * 0.11, radius, tilt, incl, cx, cy);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, U * (0.0055 - tr * 0.001), 0, TAU);
        ctx.fillStyle = rgba(col, alpha * (0.55 - tr * 0.11));
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, U * 0.0072, 0, TAU);
      ctx.fillStyle = rgba([255, 255, 245], alpha * (drawBack ? 0.65 : 1));
      ctx.fill();
    }
  }

  function drawPrismHeart(cx, cy, size, spinAngle, dayBlend, warmBlend, nightBlend, alpha) {
    if (size <= 0.5 || alpha <= 0.01) return;

    const glowCol = mixColor([125, 240, 255], [255, 225, 130], dayBlend);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 3.4);
    glow.addColorStop(0, rgba(glowCol, alpha * (0.55 + 0.25 * nightBlend)));
    glow.addColorStop(0.5, rgba(glowCol, alpha * 0.18));
    glow.addColorStop(1, rgba(glowCol, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 3.4, 0, TAU);
    ctx.fill();

    // Rotating faceted octahedron diamond
    const h = size * 1.45;
    const r = size * 0.92;
    const pts = [];
    for (let k = 0; k < 4; k++) {
      const a = spinAngle + (k * TAU) / 4;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.28, z: Math.sin(a) });
    }
    const top = { x: cx, y: cy - h };
    const bot = { x: cx, y: cy + h * 0.92 };

    const facetBase = mixColor([110, 225, 255], [255, 232, 165], dayBlend);
    const facetWarm = mixColor(facetBase, [255, 175, 195], warmBlend * 0.5);

    for (let k = 0; k < 4; k++) {
      const pA = pts[k];
      const pB = pts[(k + 1) % 4];
      const front = (pA.z + pB.z) * 0.5;
      if (front < -0.15) continue;

      const shade = 0.65 + 0.35 * ((k % 2 === 0 ? 1 : 0.45) * (front + 1) * 0.5);
      const col = mixColor([255, 255, 255], facetWarm, shade);

      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.closePath();
      ctx.fillStyle = rgba(col, alpha * 0.88);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(bot.x, bot.y);
      ctx.lineTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.closePath();
      ctx.fillStyle = rgba(mixColor(col, [55, 95, 135], 0.35), alpha * 0.82);
      ctx.fill();

      ctx.strokeStyle = rgba([255, 255, 255], alpha * 0.65);
      ctx.lineWidth = Math.max(0.6, U * 0.0018);
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(pA.x, pA.y);
      ctx.lineTo(bot.x, bot.y);
      ctx.stroke();
    }
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!W || !H) return;

    // Shared 40-second gallery clock
    const t = (Date.now() / 1000) % 40;

    // Smooth optional pointer sway
    pointerX += (pointerTargetX - pointerX) * 0.06;
    pointerY += (pointerTargetY - pointerY) * 0.06;

    ctx.save();
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, W, H);

    // Light curves synchronized to the 40s sun/moon schedule
    const dayBlend = smoothstep(0, 3.2, t) * (1 - smoothstep(16.8, 20.4, t));
    const nightBlend = smoothstep(19.6, 22.8, t) * (1 - smoothstep(37.2, 40, t));
    const dawnWarm = smoothstep(0, 1.1, t) * Math.exp(-Math.pow((t - 2.1) / 1.45, 2));
    const duskWarm = Math.exp(-Math.pow((t - 18.4) / 1.45, 2)) * (1 - smoothstep(20, 21.4, t));
    const warmBlend = clamp(dawnWarm + duskWarm, 0, 1);

    const sunAzimuth = t < 20 ? -Math.cos((t / 20) * Math.PI) : 0;

    // Lifecycle curves (all identically 0 at t = 0 and t = 40)
    const stemGrowth = smootherstep(0.3, 8.6, t) * (1 - smootherstep(31.5, 39.2, t));
    const bloomSize = smootherstep(4.4, 9.6, t) * (1 - smootherstep(31.0, 37.5, t));
    const petalOpen = smootherstep(5.4, 10.0, t) *
      (1 - 0.78 * smootherstep(17.5, 21.5, t)) *
      (1 - smootherstep(30.5, 35.5, t));
    const orreryActive = smootherstep(6.2, 10.0, t) * (1 - smootherstep(30.2, 35.5, t));

    const rootGlow = dawnWarm * 0.7 + smootherstep(28.5, 34.0, t) * (1 - smootherstep(36.0, 39.5, t));
    const seedPulse = 0.5 + 0.5 * Math.sin((t / 40) * TAU * 4);

    // Draw soil & subterranean root-circuitry first
    drawSoil(t, dayBlend, warmBlend, nightBlend, rootGlow, seedPulse);

    const cx = W * 0.5;
    const baseY = soilSurfaceY(0.5) + U * 0.002;

    if (stemGrowth > 0.004) {
      const swayPhase = (t / 40) * TAU * 4;
      const breeze = Math.sin(swayPhase) * 0.022 * U * stemGrowth;
      const sunLean = sunAzimuth * 0.042 * U * dayBlend * stemGrowth;
      const pOffset = pointerX * 0.032 * U * stemGrowth;

      const maxStemH = H * 0.49;
      const tipX = cx + breeze + sunLean + pOffset;
      const tipY = baseY - maxStemH * stemGrowth;

      const ctrl1X = cx - 0.03 * U * stemGrowth + (breeze + sunLean) * 0.25;
      const ctrl1Y = lerp(baseY, tipY, 0.36);
      const ctrl2X = cx + 0.035 * U * stemGrowth + (breeze + sunLean + pOffset) * 0.72;
      const ctrl2Y = lerp(baseY, tipY, 0.72);

      function stemAt(s) {
        const inv = 1 - s;
        const x = inv * inv * inv * cx + 3 * inv * inv * s * ctrl1X + 3 * inv * s * s * ctrl2X + s * s * s * tipX;
        const y = inv * inv * inv * baseY + 3 * inv * inv * s * ctrl1Y + 3 * inv * s * s * ctrl2Y + s * s * s * tipY;
        const dx = 3 * inv * inv * (ctrl1X - cx) + 6 * inv * s * (ctrl2X - ctrl1X) + 3 * s * s * (tipX - ctrl2X);
        const dy = 3 * inv * inv * (ctrl1Y - baseY) + 6 * inv * s * (ctrl2Y - ctrl1Y) + 3 * s * s * (tipY - ctrl2Y);
        const len = Math.hypot(dx, dy) || 1;
        return { x, y, nx: -dy / len, ny: dx / len };
      }

      // Draw leaves behind/around stem (3 pairs from bottom to top)
      const leafSpecs = [
        { s: 0.24, g0: 1.5, g1: 5.2, r0: 31.2, r1: 36.8, len: 0.16, wid: 0.045, ang: 0.85, bend: 0.22 },
        { s: 0.50, g0: 3.1, g1: 7.0, r0: 30.2, r1: 35.5, len: 0.19, wid: 0.052, ang: 0.72, bend: 0.20 },
        { s: 0.75, g0: 4.8, g1: 8.8, r0: 29.2, r1: 34.2, len: 0.15, wid: 0.042, ang: 0.58, bend: 0.16 }
      ];

      for (let i = 0; i < leafSpecs.length; i++) {
        const ls = leafSpecs[i];
        const unfurl = smootherstep(ls.g0, ls.g1, t) * (1 - smootherstep(ls.r0, ls.r1, t));
        if (unfurl <= 0.01) continue;
        const anchor = stemAt(ls.s);
        const droop = (1 - dayBlend) * 0.14;
        // Left leaf
        drawLeaf(
          anchor.x, anchor.y,
          -Math.PI * 0.5 - ls.ang - droop,
          ls.len * U, ls.wid * U, -ls.bend,
          unfurl, dayBlend, warmBlend, nightBlend
        );
        // Right leaf
        drawLeaf(
          anchor.x, anchor.y,
          -Math.PI * 0.5 + ls.ang + droop,
          ls.len * U, ls.wid * U, ls.bend,
          unfurl, dayBlend, warmBlend, nightBlend
        );
      }

      // Stem outer glass sheath + inner luminous vascular core
      const stemSegs = 24;
      const stemColOuter = mixColor([36, 98, 138], [52, 152, 102], dayBlend);
      const stemColCore = mixColor([125, 240, 255], [225, 245, 165], dayBlend);

      ctx.beginPath();
      for (let i = 0; i <= stemSegs; i++) {
        const p = stemAt(i / stemSegs);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = rgba(stemColOuter, 0.85);
      ctx.lineWidth = Math.max(2, U * 0.015 * (0.5 + 0.5 * stemGrowth));
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.strokeStyle = rgba(stemColCore, 0.7 + 0.2 * nightBlend);
      ctx.lineWidth = Math.max(1, U * 0.0048 * (0.5 + 0.5 * stemGrowth));
      ctx.stroke();

      // Helical golden/cyan filament coiled around the stem
      const helixCol = mixColor([145, 245, 255], [250, 222, 135], dayBlend);
      const helixPhase = (t / 40) * TAU * 3;
      const helixSteps = 36;
      ctx.beginPath();
      for (let i = 0; i <= helixSteps; i++) {
        const s = i / helixSteps;
        const p = stemAt(s);
        const offset = Math.sin(s * 18 - helixPhase) * U * 0.014 * (1 - s * 0.35) * stemGrowth;
        const hx = p.x + p.nx * offset;
        const hy = p.y + p.ny * offset;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.strokeStyle = rgba(helixCol, 0.55 + 0.25 * nightBlend);
      ctx.lineWidth = Math.max(0.7, U * 0.0025);
      ctx.stroke();

      // Stem node joints
      for (const ls of leafSpecs) {
        const p = stemAt(ls.s);
        ctx.beginPath();
        ctx.arc(p.x, p.y, U * 0.007 * stemGrowth, 0, TAU);
        ctx.fillStyle = rgba(helixCol, 0.8);
        ctx.fill();
      }

      // Lotus Crown & Orrery
      if (bloomSize > 0.01) {
        const crownX = tipX;
        const crownY = tipY - U * 0.012 * bloomSize;

        // Ambient crown halo
        const haloCol = mixColor([105, 225, 255], [255, 225, 145], dayBlend);
        const haloWarm = mixColor(haloCol, [255, 155, 185], warmBlend * 0.5);
        const haloR = U * (0.19 + 0.06 * petalOpen) * bloomSize;
        const halo = ctx.createRadialGradient(crownX, crownY - U * 0.04, 0, crownX, crownY - U * 0.04, haloR);
        halo.addColorStop(0, rgba(haloWarm, 0.28 + 0.18 * nightBlend));
        halo.addColorStop(0.55, rgba(haloWarm, 0.09 + 0.08 * nightBlend));
        halo.addColorStop(1, rgba(haloWarm, 0));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(crownX, crownY - U * 0.04, haloR, 0, TAU);
        ctx.fill();

        // Petal palettes
        const outerTopDay = [255, 225, 232];
        const outerBotDay = [95, 205, 165];
        const outerTopNight = [155, 238, 255];
        const outerBotNight = [42, 68, 145];
        const warmPetal = [255, 165, 142];

        let oTop = mixColor(outerTopNight, outerTopDay, dayBlend);
        oTop = mixColor(oTop, warmPetal, warmBlend * 0.55);
        const oBot = mixColor(outerBotNight, outerBotDay, dayBlend);

        const innerTopDay = [255, 245, 195];
        const innerBotDay = [245, 165, 195];
        const innerTopNight = [225, 252, 255];
        const innerBotNight = [105, 130, 235];

        let iTop = mixColor(innerTopNight, innerTopDay, dayBlend);
        iTop = mixColor(iTop, warmPetal, warmBlend * 0.45);
        const iBot = mixColor(innerBotNight, innerBotDay, dayBlend);
        const edgeCol = mixColor([180, 248, 255], [255, 250, 220], dayBlend);

        // Back outer petals
        const outerCount = 6;
        for (let i = 0; i < outerCount; i++) {
          const frac = (i / (outerCount - 1)) - 0.5;
          const spread = lerp(0.28, 1.38, petalOpen);
          const ang = frac * spread * 2;
          const pLen = U * (0.145 + (1 - Math.abs(frac)) * 0.03) * bloomSize;
          const pWid = U * 0.042 * bloomSize;
          drawLotusPetal(crownX, crownY, ang, pLen, pWid, 1 - petalOpen, oTop, oBot, edgeCol, 0.72);
        }

        // Inner stamen filaments
        const stamCount = 9;
        const stamCol = mixColor([155, 248, 255], [255, 222, 125], dayBlend);
        for (let i = 0; i < stamCount; i++) {
          const frac = (i / (stamCount - 1)) - 0.5;
          const ang = -Math.PI * 0.5 + frac * lerp(0.32, 1.25, petalOpen);
          const sLen = U * (0.085 + (1 - Math.abs(frac)) * 0.025) * bloomSize;
          const sx = crownX + Math.cos(ang) * sLen;
          const sy = crownY + Math.sin(ang) * sLen;
          ctx.beginPath();
          ctx.moveTo(crownX, crownY);
          ctx.quadraticCurveTo(crownX + Math.cos(ang) * sLen * 0.45, crownY - sLen * 0.65, sx, sy);
          ctx.strokeStyle = rgba(stamCol, 0.65);
          ctx.lineWidth = Math.max(0.7, U * 0.002);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sx, sy, U * 0.0045 * bloomSize, 0, TAU);
          ctx.fillStyle = rgba([255, 255, 235], 0.9);
          ctx.fill();
        }

        // Orrery & floating prism crystal center
        const orreryCenterY = crownY - U * (0.072 + 0.015 * petalOpen) * bloomSize;
        const r1 = U * 0.148 * orreryActive;
        const r2 = U * 0.112 * orreryActive;
        const ringCol1 = mixColor([135, 242, 255], [255, 215, 115], dayBlend);
        const ringCol2 = mixColor([195, 175, 255], [255, 175, 195], dayBlend);
        const rot1 = (t / 40) * TAU * 2;
        const rot2 = -(t / 40) * TAU * 3;
        const spin = (t / 40) * TAU * 4;

        // Back halves of tilted 3D orrery rings
        drawOrreryHalf(crownX, orreryCenterY, r1, 0.42, 0.34, rot1, ringCol1, orreryActive * 0.85, true, 3);
        drawOrreryHalf(crownX, orreryCenterY, r2, -0.56, 0.42, rot2, ringCol2, orreryActive * 0.78, true, 2);

        // Central spinning faceted prism heart
        drawPrismHeart(crownX, orreryCenterY, U * 0.025 * bloomSize, spin, dayBlend, warmBlend, nightBlend, bloomSize);

        // Front halves of tilted 3D orrery rings
        drawOrreryHalf(crownX, orreryCenterY, r1, 0.42, 0.34, rot1, ringCol1, orreryActive * 0.85, false, 3);
        drawOrreryHalf(crownX, orreryCenterY, r2, -0.56, 0.42, rot2, ringCol2, orreryActive * 0.78, false, 2);

        // Front inner petals (cradling the lower half of the core)
        const innerCount = 5;
        for (let i = 0; i < innerCount; i++) {
          const frac = (i / (innerCount - 1)) - 0.5;
          const spread = lerp(0.22, 0.92, petalOpen);
          const ang = frac * spread * 2;
          const pLen = U * (0.118 + (1 - Math.abs(frac)) * 0.024) * bloomSize;
          const pWid = U * 0.036 * bloomSize;
          drawLotusPetal(crownX, crownY, ang, pLen, pWid, 1 - petalOpen, iTop, iBot, edgeCol, 0.84);
        }

        // Daytime sunlit pollen motes rising softly around the crown
        const moteVis = smoothstep(6.0, 9.5, t) * (1 - smoothstep(16.5, 19.8, t));
        if (moteVis > 0.01) {
          for (const m of pollenMotes) {
            const life = (m.phase + (t / 40) * m.speed) % 1;
            const env = Math.sin(life * Math.PI);
            const mx = crownX + Math.sin(life * TAU * 1.5 + m.phase * TAU) * m.radius * U;
            const my = orreryCenterY - life * m.rise * U;
            const mCol = mixColor([255, 238, 165], [195, 255, 225], m.warm);
            ctx.beginPath();
            ctx.arc(mx, my, m.size * U * (0.6 + 0.4 * env), 0, TAU);
            ctx.fillStyle = rgba(mCol, env * moteVis * 0.85);
            ctx.fill();
          }
        }

        // Midnight moon-seeds drifting gracefully back into the soil
        for (const ms of moonSeeds) {
          if (t >= ms.tStart && t <= ms.tStart + ms.duration) {
            const u = (t - ms.tStart) / ms.duration;
            const env = Math.sin(Math.min(1, u * 5) * Math.PI * 0.5) * (1 - smoothstep(0.88, 1.0, u));
            const endX = cx + ms.targetXOff * W;
            const endY = soilSurfaceY(0.5 + ms.targetXOff);
            const sx = lerp(crownX, endX, smootherstep(0, 1, u)) +
              Math.sin(u * TAU * ms.swirlFreq) * ms.swirlAmp * U * (1 - u);
            const sy = lerp(orreryCenterY, endY, u * u * (3 - 2 * u) * 0.85 + u * 0.15);

            // Soft parachute filament & glow
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - Math.cos(u * TAU * ms.swirlFreq) * U * 0.012, sy - U * 0.026);
            ctx.strokeStyle = rgba([165, 245, 255], env * 0.72);
            ctx.lineWidth = Math.max(0.7, U * 0.002);
            ctx.stroke();

            const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, U * 0.024);
            sg.addColorStop(0, rgba([215, 255, 255], env * 0.95));
            sg.addColorStop(0.4, rgba([115, 225, 255], env * 0.45));
            sg.addColorStop(1, rgba([115, 225, 255], 0));
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.arc(sx, sy, U * 0.024, 0, TAU);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(sx, sy, U * 0.0055, 0, TAU);
            ctx.fillStyle = rgba([255, 255, 255], env);
            ctx.fill();
          }
        }
      }
    }

    ctx.restore();
  }

  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Harmonic Orrery-Lotus",
  "statement": "A chrono-botanical hybrid whose faceted crystal heart conducts orbiting filaments of pollen across solar and lunar tides. Unfurling its prism fronds at sunrise, it folds into a bioluminescent lantern by night to return luminous moon-seeds to the mineral earth."
}
```