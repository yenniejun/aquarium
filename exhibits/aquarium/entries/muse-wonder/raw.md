```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Aquarium Tank</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #062e3d;
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
<canvas id="tank"></canvas>
<script>
(function () {
  const canvas = document.getElementById('tank');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = 1, S = 1;
  let pointerX = -999, pointerY = -999, pointerTime = -9999;
  let lastTime = performance.now();

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    S = Math.min(W, H);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildScenery();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', function (e) {
    pointerX = e.clientX;
    pointerY = e.clientY;
    pointerTime = performance.now() / 1000;
    spawnRipple(pointerX, pointerY);
  }, { passive: true });
  window.addEventListener('pointerdown', function (e) {
    pointerX = e.clientX;
    pointerY = e.clientY;
    pointerTime = performance.now() / 1000;
    spawnRipple(pointerX, pointerY);
    for (let i = 0; i < 8; i++) bubbles.push(makeBubble(pointerX, pointerY, true));
  }, { passive: true });

  // Seeded pseudo-random
  let seed = 1234567;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  let pebbles = [], motes = [], kelps = [], grasses = [];
  function buildScenery() {
    seed = 987654;
    pebbles = [];
    for (let i = 0; i < 90; i++) {
      pebbles.push({ x: rand() * W, y: H * 0.86 + rand() * H * 0.13, r: 1 + rand() * S * 0.008, a: 0.08 + rand() * 0.22, hue: rand() });
    }
    motes = [];
    for (let i = 0; i < 42; i++) {
      motes.push({ x: rand() * W, y: rand() * H, r: 0.6 + rand() * 1.9, s: 4 + rand() * 12, p: rand() * Math.PI * 2, a: 0.12 + rand() * 0.3 });
    }
    kelps = [];
    const kx = [0.04, 0.10, 0.90, 0.96, 0.16, 0.84];
    for (let i = 0; i < kx.length; i++) {
      kelps.push({ x: kx[i] * W, h: H * (0.34 + rand() * 0.24), w: S * (0.018 + rand() * 0.014), p: rand() * 9, dark: i > 3 });
    }
    grasses = [];
    for (let i = 0; i < 46; i++) {
      grasses.push({ x: rand() * W, h: H * (0.07 + rand() * 0.13), p: rand() * 9, w: 1.5 + rand() * 2.5 });
    }
  }

  const bubbles = [];
  const ripples = [];
  const sparkles = [];
  const trail = [];

  function makeBubble(x, y, burst) {
    return {
      x: x + (Math.random() - 0.5) * 10,
      y: y,
      r: (burst ? 2 : 3) + Math.random() * (S * 0.012 + 4),
      vy: -(18 + Math.random() * 34),
      vx: (Math.random() - 0.5) * 10,
      p: Math.random() * Math.PI * 2,
      life: 1
    };
  }
  function spawnRipple(x, y) {
    if (ripples.length > 8) return;
    ripples.push({ x: x, y: y, r: 4, a: 0.28 });
  }

  // Creature state
  const octo = {
    x: 300, y: 200, vx: 0, vy: 0,
    angle: 0, spin: 0, spinT: 0, nextSpin: 5,
    blink: 0, nextBlink: 2.5, bubbleT: 1.6,
    hueShift: 0
  };
  let started = false;

  function angleLerp(a, b, t) {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }

  function drawBackground(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0e6b7f');
    g.addColorStop(0.35, '#0a556e');
    g.addColorStop(0.68, '#073f56');
    g.addColorStop(1, '#042636');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Distant glow
    const glow = ctx.createRadialGradient(W * 0.52, H * 0.08, 10, W * 0.52, H * 0.08, S * 0.85);
    glow.addColorStop(0, 'rgba(190,255,235,0.34)');
    glow.addColorStop(0.4, 'rgba(110,220,205,0.12)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Light rays
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const baseX = W * (0.14 + i * 0.17) + Math.sin(t * 0.18 + i * 1.7) * W * 0.025;
      const grad = ctx.createLinearGradient(baseX, 0, baseX + W * 0.08, H);
      grad.addColorStop(0, 'rgba(210,255,240,0.16)');
      grad.addColorStop(1, 'rgba(210,255,240,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(baseX, -10);
      ctx.lineTo(baseX + S * 0.055, -10);
      ctx.lineTo(baseX + W * 0.16, H * 0.82);
      ctx.lineTo(baseX + W * 0.04, H * 0.82);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Far kelp silhouettes
    ctx.save();
    ctx.fillStyle = 'rgba(4,55,62,0.30)';
    for (let i = 0; i < kelps.length; i++) {
      const k = kelps[i];
      const sway = Math.sin(t * 0.7 + k.p) * S * 0.018;
      ctx.beginPath();
      ctx.moveTo(k.x - k.w, H * 0.88);
      ctx.quadraticCurveTo(k.x - k.w * 0.4 + sway * 0.4, H * 0.88 - k.h * 0.55, k.x + sway, H * 0.88 - k.h);
      ctx.quadraticCurveTo(k.x + k.w * 0.4 + sway * 0.4, H * 0.88 - k.h * 0.55, k.x + k.w, H * 0.88);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSand(t) {
    const top = H * 0.845;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, top + Math.sin(0) * 4);
    for (let x = 0; x <= W; x += Math.max(20, W / 18)) {
      ctx.lineTo(x, top + Math.sin(x * 0.008 + 1.2) * S * 0.012 + Math.sin(x * 0.002) * S * 0.008);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, top, 0, H);
    g.addColorStop(0, '#c9b183');
    g.addColorStop(0.25, '#a98f66');
    g.addColorStop(1, '#5f4c38');
    ctx.fillStyle = g;
    ctx.fill();

    // Caustics
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255,245,190,0.13)';
    ctx.lineWidth = Math.max(1, S * 0.003);
    for (let i = 0; i < 7; i++) {
      const cx = ((i * 0.17 + (t * 0.018 % 0.17)) % 1.1) * W;
      const cy = top + S * 0.025 + (i % 3) * S * 0.028;
      ctx.beginPath();
      ctx.ellipse(cx, cy, S * (0.05 + (i % 3) * 0.015), S * 0.011, -0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    for (let i = 0; i < pebbles.length; i++) {
      const p = pebbles[i];
      ctx.fillStyle = p.hue > 0.7 ? 'rgba(255,235,190,' + p.a + ')' : 'rgba(40,35,28,' + p.a + ')';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 1.6, p.r, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    drawRocksAndCrystals(t);
    drawGrass(t);
  }

  function rock(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x - w * 0.8, y - h, x - w * 0.15, y - h * 1.05);
    ctx.quadraticCurveTo(x + w * 0.55, y - h * 0.9, x + w, y - h * 0.25);
    ctx.quadraticCurveTo(x + w * 1.05, y, x + w * 0.6, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.ellipse(x - w * 0.25, y - h * 0.62, w * 0.32, h * 0.22, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRocksAndCrystals(t) {
    const base = H * 0.885;
    rock(W * 0.12, base + S * 0.018, S * 0.075, S * 0.045, '#3d4b52');
    rock(W * 0.82, base + S * 0.012, S * 0.095, S * 0.055, '#35434b');
    rock(W * 0.66, base + S * 0.03, S * 0.05, S * 0.032, '#46545a');

    // Crystal clusters
    const clusters = [[W * 0.20, base], [W * 0.76, base + S * 0.01], [W * 0.38, base + S * 0.028]];
    for (let c = 0; c < clusters.length; c++) {
      const cx = clusters[c][0], cy = clusters[c][1];
      const pulse = 0.65 + Math.sin(t * 1.6 + c * 2.1) * 0.18;
      for (let i = 0; i < 3; i++) {
        const h = S * (0.045 + i * 0.017) * (c === 1 ? 0.8 : 1);
        const w = S * 0.016;
        const off = (i - 1) * S * 0.02;
        const grad = ctx.createLinearGradient(cx + off, cy, cx + off, cy - h);
        grad.addColorStop(0, 'rgba(35,160,170,' + (0.55 * pulse) + ')');
        grad.addColorStop(1, 'rgba(170,255,235,' + (0.85 * pulse) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx + off - w, cy);
        ctx.lineTo(cx + off - w * 0.25, cy - h * 0.78);
        ctx.lineTo(cx + off + (i - 1) * 2, cy - h);
        ctx.lineTo(cx + off + w * 0.35, cy - h * 0.68);
        ctx.lineTo(cx + off + w, cy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(140,255,225,' + (0.10 * pulse) + ')';
      ctx.beginPath();
      ctx.ellipse(cx, cy - S * 0.035, S * 0.055, S * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Empty shells
    for (let i = 0; i < 3; i++) {
      const x = W * (0.30 + i * 0.19) + Math.sin(i * 7) * S * 0.02;
      const y = base + S * (0.028 + (i % 2) * 0.018);
      const r = S * 0.016;
      ctx.fillStyle = i % 2 ? '#e8b7a0' : '#f0d2b0';
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,90,70,0.45)';
      ctx.lineWidth = 1;
      for (let j = -2; j <= 2; j++) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + j * r * 0.38, y - r * 0.92);
        ctx.stroke();
      }
    }
  }

  function drawGrass(t) {
    for (let i = 0; i < grasses.length; i++) {
      const gr = grasses[i];
      const baseY = H * 0.885;
      const sway = Math.sin(t * 1.25 + gr.p) * S * 0.014 + Math.sin(t * 0.6 + gr.p * 2) * S * 0.006;
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(72,190,130,0.75)' : 'rgba(38,150,105,0.72)';
      ctx.lineWidth = gr.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gr.x, baseY);
      ctx.quadraticCurveTo(gr.x + sway * 0.35, baseY - gr.h * 0.55, gr.x + sway, baseY - gr.h);
      ctx.stroke();
    }
  }

  function drawForegroundKelp(t) {
    for (let i = 0; i < 4; i++) {
      const side = i % 2 === 0 ? 0 : 1;
      const x = side === 0 ? W * (0.025 + i * 0.012) : W * (0.975 - i * 0.012);
      const h = H * (0.42 + (i % 3) * 0.07);
      const baseY = H * 0.92;
      const sway = Math.sin(t * 0.9 + i * 2.4) * S * 0.028;
      ctx.fillStyle = i % 2 ? 'rgba(9,94,72,0.82)' : 'rgba(13,115,82,0.86)';
      ctx.beginPath();
      ctx.moveTo(x - S * 0.014, baseY);
      for (let s = 0; s <= 5; s++) {
        const yy = baseY - h * (s / 5);
        const xx = x + Math.sin(s * 1.15 + t * 1.1 + i) * S * 0.012 + sway * (s / 5);
        ctx.lineTo(xx - S * 0.014 + Math.sin(s * 2.2 + t) * 3, yy);
      }
      for (let s = 5; s >= 0; s--) {
        const yy = baseY - h * (s / 5);
        const xx = x + Math.sin(s * 1.15 + t * 1.1 + i) * S * 0.012 + sway * (s / 5);
        ctx.lineTo(xx + S * 0.014 + Math.cos(s * 2.0 + t) * 3, yy);
      }
      ctx.closePath();
      ctx.fill();
      // leaf dots
      ctx.fillStyle = 'rgba(120,255,180,0.20)';
      for (let s = 1; s < 5; s++) {
        const yy = baseY - h * (s / 5);
        const xx = x + sway * (s / 5);
        ctx.beginPath();
        ctx.ellipse(xx + S * 0.02, yy, S * 0.009, S * 0.016, 0.6 + Math.sin(t + s) * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawTrail() {
    if (trail.length < 3) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i++) {
      const p = trail[i], q = trail[i - 1];
      const f = i / trail.length;
      ctx.strokeStyle = 'hsla(' + (285 + f * 70 + octo.hueShift) + ', 85%, 72%, ' + (f * 0.28) + ')';
      ctx.lineWidth = 1 + f * S * 0.009;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTentacles(t, R) {
    const count = 6;
    for (let k = 0; k < count; k++) {
      const spread = (k - (count - 1) / 2) / count;
      const baseAng = octo.angle + Math.PI + spread * 1.55;
      const wavePhase = t * 5.2 + k * 1.05;
      const len = R * (1.25 + Math.sin(k * 3.7) * 0.14);
      const segs = 7;
      let px = octo.x + Math.cos(baseAng) * R * 0.55;
      let py = octo.y + Math.sin(baseAng) * R * 0.55 + R * 0.12;
      for (let sIdx = 0; sIdx < segs; sIdx++) {
        const f = sIdx / segs;
        const ang = baseAng + Math.sin(wavePhase - f * 3.2) * (0.28 + f * 0.35) + spread * f * 0.7;
        const step = len / segs;
        const nx = px + Math.cos(ang) * step;
        const ny = py + Math.sin(ang) * step + Math.sin(wavePhase - f * 4) * R * 0.035;
        const rad = R * 0.20 * (1 - f * 0.72);
        const hue = 282 + k * 5 + f * 28;
        ctx.fillStyle = 'hsl(' + hue + ', 62%, ' + (58 - f * 10) + '%)';
        ctx.beginPath();
        ctx.arc((px + nx) / 2, (py + ny) / 2, Math.max(1.2, rad), 0, Math.PI * 2);
        ctx.fill();
        if (sIdx % 2 === 0 && f > 0.15) {
          ctx.fillStyle = 'rgba(255,190,220,0.55)';
          ctx.beginPath();
          ctx.arc((px + nx) / 2 + rad * 0.3, (py + ny) / 2 + rad * 0.35, Math.max(0.7, rad * 0.28), 0, Math.PI * 2);
          ctx.fill();
        }
        px = nx; py = ny;
      }
      // glowing tip
      ctx.fillStyle = 'rgba(255,170,225,0.8)';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1.5, R * 0.045), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCreature(t, dt) {
    if (!started) { octo.x = W * 0.5; octo.y = H * 0.45; started = true; }

    // Wander target
    let tx = W * 0.5 + Math.sin(t * 0.21) * W * 0.27 + Math.sin(t * 0.073 + 2) * W * 0.10;
    let ty = H * 0.44 + Math.sin(t * 0.31 + 1.3) * H * 0.17 + Math.cos(t * 0.11) * H * 0.06;
    const nowSec = performance.now() / 1000;
    if (nowSec - pointerTime < 4 && pointerX > 0) {
      const px = Math.max(W * 0.12, Math.min(W * 0.88, pointerX));
      const py = Math.max(H * 0.16, Math.min(H * 0.70, pointerY));
      tx = tx * 0.35 + px * 0.65;
      ty = ty * 0.35 + py * 0.65;
    }

    // Occasional joyful loop
    octo.nextSpin -= dt;
    if (octo.nextSpin <= 0 && octo.spinT <= 0) {
      octo.spinT = 1.45;
      octo.nextSpin = 6 + Math.random() * 5;
      for (let i = 0; i < 10; i++) sparkles.push({ x: octo.x, y: octo.y, vx: (Math.random() - 0.5) * 70, vy: (Math.random() - 0.5) * 70, life: 1, p: Math.random() * 9 });
    }
    let spinAngle = 0;
    if (octo.spinT > 0) {
      octo.spinT -= dt;
      const p = 1 - Math.max(0, octo.spinT / 1.45);
      spinAngle = p * Math.PI * 2;
      const orbit = S * 0.045 * Math.sin(p * Math.PI);
      tx += Math.cos(p * Math.PI * 2) * orbit;
      ty += Math.sin(p * Math.PI * 2) * orbit;
      octo.hueShift = p * 40;
    } else octo.hueShift *= 0.96;

    const ax = (tx - octo.x) * 1.55;
    const ay = (ty - octo.y) * 1.55;
    octo.vx += ax * dt; octo.vy += ay * dt;
    octo.vx *= Math.pow(0.12, dt); octo.vy *= Math.pow(0.12, dt);
    // gentle bobbing propulsion pulses
    const pulse = Math.max(0, Math.sin(t * 3.4)) * 14;
    octo.vx += Math.cos(octo.angle) * pulse * dt * 2.2;
    octo.vy += Math.sin(octo.angle) * pulse * dt * 2.2;
    octo.x += octo.vx * dt;
    octo.y += octo.vy * dt + Math.sin(t * 2.1) * 0.18;

    const speed = Math.hypot(octo.vx, octo.vy);
    if (speed > 8) octo.angle = angleLerp(octo.angle, Math.atan2(octo.vy, octo.vx), Math.min(1, dt * 5));

    // Trail
    trail.push({ x: octo.x - Math.cos(octo.angle) * S * 0.04, y: octo.y - Math.sin(octo.angle) * S * 0.04 + S * 0.015 });
    if (trail.length > 95) trail.shift();
    drawTrail();

    const R = S * 0.075 + Math.sin(t * 2.4) * S * 0.0025;
    drawTentacles(t, R);

    // Blink
    octo.nextBlink -= dt;
    if (octo.nextBlink <= 0) { octo.blink = 0.16; octo.nextBlink = 2 + Math.random() * 3.2; }
    if (octo.blink > 0) octo.blink -= dt;
    const eyeOpen = octo.blink > 0 ? 0.12 : 1;

    ctx.save();
    ctx.translate(octo.x, octo.y);
    ctx.rotate(Math.sin(octo.angle) * 0.18 + (octo.spinT > 0 ? Math.sin(spinAngle) * 0.25 : 0));
    const stretch = 1 + Math.min(0.16, speed * 0.00045);
    const squash = 1 - Math.min(0.08, speed * 0.00022) + Math.sin(t * 3.4) * 0.018;
    ctx.scale(stretch, squash);

    // Feathery gill frills
    for (let side = -1; side <= 1; side += 2) {
      for (let gIdx = 0; gIdx < 3; gIdx++) {
        const gx = side * R * (0.72 + gIdx * 0.08);
        const gy = -R * (0.48 - gIdx * 0.16);
        const flutter = Math.sin(t * 4 + gIdx * 1.4 + side) * R * 0.08;
        ctx.strokeStyle = gIdx % 2 ? 'rgba(255,130,185,0.85)' : 'rgba(255,165,210,0.9)';
        ctx.lineWidth = Math.max(1.2, R * 0.075);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + side * R * 0.28, gy - R * 0.16 + flutter * 0.4, gx + side * R * (0.42 + gIdx * 0.05), gy - R * 0.05 + flutter);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,205,230,0.65)';
        ctx.lineWidth = Math.max(0.7, R * 0.035);
        for (let b = 0; b < 3; b++) {
          const bx = gx + side * R * (0.16 + b * 0.11);
          const by = gy - R * 0.08 + flutter * (0.3 + b * 0.2);
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + side * R * 0.08, by - R * 0.14);
          ctx.stroke();
        }
      }
    }

    // Body
    const bodyGrad = ctx.createRadialGradient(-R * 0.35, -R * 0.45, R * 0.1, 0, 0, R * 1.25);
    bodyGrad.addColorStop(0, '#ffd6ec');
    bodyGrad.addColorStop(0.28, '#c084d8');
    bodyGrad.addColorStop(0.62, '#7d5fc4');
    bodyGrad.addColorStop(1, '#4b3a8f');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.02, R * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = 'rgba(255,235,245,0.52)';
    ctx.beginPath();
    ctx.ellipse(R * 0.12, R * 0.34, R * 0.52, R * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots
    const spots = [[-0.48, -0.38, 0.10], [0.42, -0.52, 0.08], [-0.18, -0.62, 0.065], [0.58, 0.02, 0.07], [-0.62, 0.12, 0.06]];
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    for (let i = 0; i < spots.length; i++) {
      ctx.beginPath();
      ctx.arc(spots[i][0] * R, spots[i][1] * R, spots[i][2] * R * (1 + Math.sin(t * 2 + i) * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    // Tiny star freckle
    ctx.fillStyle = 'rgba(255,230,150,0.9)';
    const sx = R * 0.30, sy = -R * 0.30, sr = R * 0.09 * (1 + Math.sin(t * 3) * 0.15);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + i * Math.PI / 5;
      const rad = i % 2 ? sr * 0.45 : sr;
      const vx = sx + Math.cos(ang) * rad, vy = sy + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
    }
    ctx.closePath(); ctx.fill();

    // Cheeks
    ctx.fillStyle = 'rgba(255,120,175,0.42)';
    ctx.beginPath(); ctx.ellipse(-R * 0.52, R * 0.18, R * 0.16, R * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(R * 0.60, R * 0.18, R * 0.16, R * 0.09, 0, 0, Math.PI * 2); ctx.fill();

    // Eyes
    let lookX = 0, lookY = 0;
    if (nowSec - pointerTime < 4 && pointerX > 0) {
      lookX = Math.max(-1, Math.min(1, (pointerX - octo.x) / (S * 0.35)));
      lookY = Math.max(-1, Math.min(1, (pointerY - octo.y) / (S * 0.35)));
    } else {
      lookX = Math.sin(t * 0.7) * 0.45;
      lookY = Math.cos(t * 0.53) * 0.3;
    }
    for (let side = -1; side <= 1; side += 2) {
      const ex = side * R * 0.34 + R * 0.06, ey = -R * 0.08;
      ctx.save();
      ctx.translate(ex, ey);
      ctx.scale(1, eyeOpen);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(0, 0, R * 0.19, R * 0.23, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#172038';
      ctx.beginPath(); ctx.ellipse(lookX * R * 0.07, lookY * R * 0.07, R * 0.105, R * 0.135, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7ee8fa';
      ctx.beginPath(); ctx.ellipse(lookX * R * 0.07, lookY * R * 0.07 + R * 0.03, R * 0.055, R * 0.07, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-R * 0.035 + lookX * R * 0.05, -R * 0.055 + lookY * R * 0.05, R * 0.038, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Mouth: delighted little "o" that opens when blowing bubbles
    const mouthOpen = octo.bubbleT < 0.45 ? 1 : 0.25 + Math.sin(t * 2.2) * 0.08;
    ctx.fillStyle = '#40204a';
    ctx.beginPath();
    ctx.ellipse(R * 0.06, R * 0.28, R * 0.075, R * 0.075 * mouthOpen + R * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,140,180,0.8)';
    ctx.beginPath();
    ctx.ellipse(R * 0.06, R * 0.315, R * 0.04, R * 0.025 * mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Bubble blowing
    octo.bubbleT -= dt;
    if (octo.bubbleT <= 0) {
      octo.bubbleT = 3.2 + Math.random() * 2.5;
      const mx = octo.x + Math.cos(octo.angle) * R * 0.8;
      const my = octo.y + Math.sin(octo.angle) * R * 0.5 + R * 0.25;
      for (let i = 0; i < 5; i++) setTimeout(function () { if (bubbles.length < 80) bubbles.push(makeBubble(mx, my, false)); }, i * 90);
    }

    // Sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.life -= dt * 0.9; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vx *= 0.98; sp.vy *= 0.98;
      if (sp.life <= 0) { sparkles.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(sp.p + t * 3);
      ctx.fillStyle = 'rgba(255,235,150,' + (sp.life * 0.9) + ')';
      const r = S * 0.008 * sp.life + 2;
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.28, -r * 0.28); ctx.lineTo(r, 0); ctx.lineTo(r * 0.28, r * 0.28);
      ctx.lineTo(0, r); ctx.lineTo(-r * 0.28, r * 0.28); ctx.lineTo(-r, 0); ctx.lineTo(-r * 0.28, -r * 0.28);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  function drawBubblesAndMotes(t, dt) {
    // Ambient bubbles from sand vents
    if (Math.random() < 0.025 && bubbles.length < 70) {
      bubbles.push(makeBubble(W * (0.2 + Math.random() * 0.6), H * 0.86, false));
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y += b.vy * dt; b.x += (b.vx + Math.sin(t * 3 + b.p) * 9) * dt; b.vy -= dt * 6;
      if (b.y < -20 || b.life <= 0) { bubbles.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(210,245,255,0.65)';
      ctx.fillStyle = 'rgba(180,235,255,0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.34, Math.max(0.8, b.r * 0.18), 0, Math.PI * 2); ctx.fill();
    }
    // Motes / plankton sparkle
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.y -= m.s * dt * 0.25; m.x += Math.sin(t * 0.6 + m.p) * 0.12;
      if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; }
      ctx.fillStyle = 'rgba(200,255,235,' + (m.a * (0.6 + Math.sin(t * 2 + m.p) * 0.4)) + ')';
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
    }
    // Pointer ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += dt * 55; r.a -= dt * 0.35;
      if (r.a <= 0) { ripples.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(190,245,255,' + r.a + ')';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function frame(now) {
    const t = now / 1000;
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.05) dt = 0.05;
    if (dt <= 0) dt = 0.016;

    drawBackground(t);
    drawSand(t);
    drawBubblesAndMotes(t, dt);
    drawCreature(t, dt);
    drawForegroundKelp(t);

    // Soft vignette
    const v = ctx.createRadialGradient(W / 2, H / 2, S * 0.35, W / 2, H / 2, S * 0.95);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,10,20,0.32)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Dizzy Doodling Octopus",
  "statement": "This cheerful little octopus paints looping ribbons in the water, chasing bubbles and daydreaming in the sunbeams. Give it a moment and it will happily doodle a circle just for you."
}
```