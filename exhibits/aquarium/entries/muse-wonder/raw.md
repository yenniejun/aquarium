```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #062a3a;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
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

  // Seeded random for stable decor
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry(20240607);

  let decor = null;
  function buildDecor() {
    const rng = mulberry(918273);
    const weeds = [], corals = [], pebbles = [], shells = [], motes = [], backRocks = [], fans = [];
    for (let i = 0; i < 26; i++) weeds.push({ x: rng(), h: 0.18 + rng() * 0.38, w: 5 + rng() * 9, ph: rng() * 6.28, hue: 145 + rng() * 35, blades: 2 + (rng() * 3 | 0) });
    for (let i = 0; i < 9; i++) corals.push({ x: 0.04 + rng() * 0.92, s: 0.5 + rng() * 1.1, hue: [345, 18, 285, 200][i % 4], ph: rng() * 6.28, branches: 4 + (rng() * 4 | 0) });
    for (let i = 0; i < 46; i++) pebbles.push({ x: rng(), y: 0.90 + rng() * 0.09, r: 3 + rng() * 11, c: rng() });
    for (let i = 0; i < 7; i++) shells.push({ x: 0.06 + rng() * 0.88, s: 0.6 + rng() * 0.9, rot: rng() * 6.28, hue: 30 + rng() * 40 });
    for (let i = 0; i < 55; i++) motes.push({ x: rng(), y: rng(), r: 0.6 + rng() * 2.2, ph: rng() * 6.28, sp: 0.2 + rng() * 0.7 });
    for (let i = 0; i < 6; i++) backRocks.push({ x: i / 5 + (rng() - 0.5) * 0.08, h: 0.14 + rng() * 0.22, w: 0.16 + rng() * 0.14 });
    for (let i = 0; i < 5; i++) fans.push({ x: 0.08 + rng() * 0.84, s: 0.6 + rng() * 0.8, hue: 275 + rng() * 50, ph: rng() * 6.28 });
    decor = { weeds, corals, pebbles, shells, motes, backRocks, fans };
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    S = Math.min(W, H) / 520; // scale unit
    if (!decor) buildDecor();
    if (!creature.init) placeCreature();
  }
  window.addEventListener('resize', resize);

  // ---------- Creature state ----------
  const creature = {
    init: false,
    x: 0, y: 0, vx: 0, vy: 0,
    tx: 0, ty: 0, wanderT: 0,
    angle: 0, roll: 0, rollT: 9, rolling: 0,
    blink: 0, blinkT: 2.5,
    breath: 0,
    mouthO: 0,
    hue: 305
  };
  function placeCreature() {
    creature.x = W * 0.5; creature.y = H * 0.45;
    creature.tx = W * 0.6; creature.ty = H * 0.4;
    creature.init = true;
  }

  const pointer = { x: -9999, y: -9999, active: false, last: 0 };
  window.addEventListener('pointermove', e => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.active = true; pointer.last = performance.now();
  });
  window.addEventListener('pointerdown', e => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; pointer.last = performance.now();
    burst(e.clientX, e.clientY, 10);
    rings.push({ x: creature.x, y: creature.y - 20 * S, r: 6 * S, vr: 26 * S, a: 0.9, wob: Math.random() * 6.28 });
    creature.mouthO = 1;
  });
  window.addEventListener('pointerleave', () => { pointer.active = false; });

  // ---------- Particles ----------
  const bubbles = [], rings = [], sparkles = [], inks = [];
  function burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      bubbles.push({
        x: x + (Math.random() - 0.5) * 30 * S, y: y + (Math.random() - 0.5) * 20 * S,
        r: (2 + Math.random() * 6) * S, vy: -(25 + Math.random() * 55) * S,
        vx: (Math.random() - 0.5) * 18 * S, ph: Math.random() * 6.28, life: 1
      });
    }
  }
  function spawnAmbientBubble() {
    const fromVent = Math.random() < 0.5;
    bubbles.push({
      x: fromVent ? W * (0.13 + Math.random() * 0.06) : creature.x + (Math.random() - 0.5) * 30 * S,
      y: fromVent ? H * 0.88 : creature.y - 10 * S,
      r: (1.5 + Math.random() * 5) * S, vy: -(20 + Math.random() * 45) * S,
      vx: (Math.random() - 0.5) * 10 * S, ph: Math.random() * 6.28, life: 1
    });
  }

  function drawSparkleShape(x, y, r, kind, color, a, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
    ctx.fillStyle = color; ctx.strokeStyle = color;
    if (kind === 0) { // 4-point star
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0);
      ctx.quadraticCurveTo(r * 0.18, r * 0.18, 0, r);
      ctx.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0);
      ctx.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r);
      ctx.fill();
    } else if (kind === 1) { // heart
      ctx.beginPath();
      ctx.moveTo(0, r * 0.7);
      ctx.bezierCurveTo(-r * 1.2, -r * 0.1, -r * 0.6, -r * 1.0, 0, -r * 0.35);
      ctx.bezierCurveTo(r * 0.6, -r * 1.0, r * 1.2, -r * 0.1, 0, r * 0.7);
      ctx.fill();
    } else { // swirl
      ctx.lineWidth = Math.max(1, r * 0.22); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0.3, 4.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 0.15, -r * 0.1, r * 0.32, 2.2, 6.4); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  // ---------- Environment ----------
  function drawBackground(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1b7f9e');
    g.addColorStop(0.35, '#0d5f83');
    g.addColorStop(0.7, '#083e63');
    g.addColorStop(1, '#052a49');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // distant glow
    const rg = ctx.createRadialGradient(W * 0.5, H * 0.08, 10, W * 0.5, H * 0.08, Math.max(W, H) * 0.75);
    rg.addColorStop(0, 'rgba(190,245,255,0.35)');
    rg.addColorStop(0.4, 'rgba(120,220,240,0.10)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

    // light rays
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const cx = W * (0.16 + i * 0.17) + Math.sin(t * 0.18 + i * 1.7) * 26 * S;
      const wTop = (22 + i * 7) * S, wBot = (85 + i * 12) * S;
      const grad = ctx.createLinearGradient(0, 0, 0, H * 0.85);
      grad.addColorStop(0, 'rgba(200,250,255,0.14)');
      grad.addColorStop(1, 'rgba(200,250,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx - wTop, -10); ctx.lineTo(cx + wTop, -10);
      ctx.lineTo(cx + wBot, H * 0.85); ctx.lineTo(cx - wBot, H * 0.85);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // far rocks
    ctx.fillStyle = 'rgba(10,54,78,0.75)';
    decor.backRocks.forEach(r => {
      const bx = r.x * W, bw = r.w * W, bh = r.h * H, by = H * 0.92;
      ctx.beginPath();
      ctx.moveTo(bx - bw, by);
      ctx.quadraticCurveTo(bx - bw * 0.45, by - bh, bx, by - bh * 0.85);
      ctx.quadraticCurveTo(bx + bw * 0.55, by - bh * 0.55, bx + bw, by);
      ctx.closePath(); ctx.fill();
    });

    // ruined arch (left) + crystal orb
    drawArch(t);
    // treasure observatory dome (right): stone base + glowing pearl string
    drawDome(t);
  }

  function drawArch(t) {
    const ax = W * 0.13, ay = H * 0.90, aw = 115 * S, ah = 150 * S;
    ctx.save();
    ctx.fillStyle = '#3d6b74';
    ctx.strokeStyle = '#2c545e'; ctx.lineWidth = 3 * S;
    // pillars
    roundRect(ax - aw * 0.5, ay - ah * 0.62, 20 * S, ah * 0.62, 7 * S); ctx.fill(); ctx.stroke();
    roundRect(ax + aw * 0.5 - 20 * S, ay - ah * 0.62, 20 * S, ah * 0.62, 7 * S); ctx.fill(); ctx.stroke();
    // top beam (broken)
    ctx.beginPath();
    ctx.moveTo(ax - aw * 0.58, ay - ah * 0.62);
    ctx.lineTo(ax + aw * 0.34, ay - ah * 0.68);
    ctx.lineTo(ax + aw * 0.40, ay - ah * 0.52);
    ctx.lineTo(ax - aw * 0.52, ay - ah * 0.46);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // cracks / moss
    ctx.strokeStyle = 'rgba(140,230,170,0.55)'; ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.moveTo(ax - aw * 0.42, ay - ah * 0.55); ctx.quadraticCurveTo(ax - aw * 0.38, ay - ah * 0.30, ax - aw * 0.44, ay - ah * 0.12); ctx.stroke();
    // crystal orb on pedestal
    const ox = ax, oy = ay - ah * 0.18;
    ctx.fillStyle = '#355d66';
    roundRect(ox - 16 * S, ay - 22 * S, 32 * S, 22 * S, 4 * S); ctx.fill();
    const pulse = 0.75 + Math.sin(t * 1.6) * 0.25;
    const og = ctx.createRadialGradient(ox - 4 * S, oy - 5 * S, 1, ox, oy, 17 * S);
    og.addColorStop(0, 'rgba(255,255,255,0.95)');
    og.addColorStop(0.35, `rgba(130,240,255,${0.85 * pulse})`);
    og.addColorStop(1, 'rgba(70,160,255,0.15)');
    ctx.fillStyle = og;
    ctx.beginPath(); ctx.arc(ox, oy, 15 * S, 0, 6.29); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(110,230,255,${0.10 * pulse})`;
    ctx.beginPath(); ctx.arc(ox, oy, 34 * S, 0, 6.29); ctx.fill(); ctx.restore();
    ctx.restore();
  }

  function drawDome(t) {
    const dx = W * 0.87, dy = H * 0.90;
    ctx.save();
    // stone plinth
    ctx.fillStyle = '#416a70';
    ctx.beginPath();
    ctx.moveTo(dx - 62 * S, dy); ctx.lineTo(dx - 48 * S, dy - 34 * S);
    ctx.lineTo(dx + 48 * S, dy - 34 * S); ctx.lineTo(dx + 62 * S, dy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,50,58,0.5)'; ctx.lineWidth = 2 * S; ctx.stroke();
    // glass dome (drawn as ornament, not tank frame)
    ctx.beginPath(); ctx.arc(dx, dy - 34 * S, 46 * S, Math.PI, 0); ctx.closePath();
    const dg = ctx.createLinearGradient(dx, dy - 85 * S, dx, dy);
    dg.addColorStop(0, 'rgba(180,245,255,0.30)');
    dg.addColorStop(1, 'rgba(120,200,235,0.06)');
    ctx.fillStyle = dg; ctx.fill();
    ctx.strokeStyle = 'rgba(220,250,255,0.45)'; ctx.lineWidth = 1.6 * S; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dx, dy - 80 * S); ctx.lineTo(dx, dy - 34 * S); ctx.stroke();
    ctx.beginPath(); ctx.arc(dx, dy - 34 * S, 28 * S, Math.PI, 0); ctx.stroke();
    // tiny telescope silhouette inside
    ctx.strokeStyle = '#173d4d'; ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(dx - 8 * S, dy - 38 * S); ctx.lineTo(dx + 18 * S, dy - 62 * S); ctx.stroke();
    ctx.lineWidth = 3 * S;
    ctx.beginPath(); ctx.moveTo(dx - 4 * S, dy - 38 * S); ctx.lineTo(dx - 12 * S, dy - 22 * S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dx - 4 * S, dy - 38 * S); ctx.lineTo(dx + 6 * S, dy - 22 * S); ctx.stroke();
    // glowing pearls inside
    for (let i = 0; i < 4; i++) {
      const px = dx + (i - 1.5) * 16 * S, py = dy - 18 * S + Math.sin(t * 1.3 + i * 1.9) * 2 * S;
      ctx.fillStyle = `hsla(${45 + i * 18},100%,78%,0.95)`;
      ctx.beginPath(); ctx.arc(px, py, 3.4 * S, 0, 6.29); ctx.fill();
    }
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawSand(t) {
    ctx.beginPath();
    ctx.moveTo(0, H * 0.90);
    for (let x = 0; x <= W; x += 18) {
      ctx.lineTo(x, H * 0.90 + Math.sin(x * 0.012 + 1.2) * 7 * S + Math.sin(x * 0.004) * 5 * S);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    const g = ctx.createLinearGradient(0, H * 0.86, 0, H);
    g.addColorStop(0, '#c9b183'); g.addColorStop(0.4, '#a98f66'); g.addColorStop(1, '#77644a');
    ctx.fillStyle = g; ctx.fill();

    // caustic shimmers
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const cx = ((i * 0.083 + Math.sin(t * 0.25 + i) * 0.012) % 1) * W;
      const cy = H * (0.925 + (i % 4) * 0.018);
      ctx.strokeStyle = `rgba(255,245,200,${0.05 + 0.04 * Math.sin(t * 1.4 + i * 2)})`;
      ctx.lineWidth = 1.4 * S;
      ctx.beginPath();
      ctx.ellipse(cx, cy, (26 + (i % 3) * 12) * S, 5 * S, 0, 0, 6.29); ctx.stroke();
    }
    ctx.restore();

    // pebbles & shells
    decor.pebbles.forEach(p => {
      const shades = ['#8a7a5e', '#6f7d74', '#99876a', '#5e6e6a'];
      ctx.fillStyle = shades[Math.floor(p.c * 4)];
      ctx.beginPath(); ctx.ellipse(p.x * W, p.y * H, p.r * S, p.r * 0.55 * S, p.c * 2, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.ellipse(p.x * W - p.r * 0.25 * S, p.y * H - p.r * 0.2 * S, p.r * 0.4 * S, p.r * 0.18 * S, 0, 0, 6.29); ctx.fill();
    });
    decor.shells.forEach(sh => {
      const x = sh.x * W, y = H * 0.945, s = sh.s * S;
      ctx.save(); ctx.translate(x, y); ctx.rotate(sh.rot * 0.3 - 0.4);
      ctx.fillStyle = `hsl(${sh.hue},70%,78%)`;
      ctx.beginPath(); ctx.moveTo(0, 0);
      for (let a = -1.2; a <= 1.2; a += 0.3) {
        ctx.lineTo(Math.sin(a) * 13 * s, -Math.cos(a) * 11 * s + Math.abs(a) * 3 * s);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(160,90,80,0.45)'; ctx.lineWidth = 1 * S;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(k * 0.5) * 12 * s, -Math.cos(k * 0.5) * 10 * s); ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawPlantsBack(t) {
    // sea fans
    decor.fans.forEach(f => {
      const x = f.x * W, y = H * 0.91, s = f.s * S;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.6 + f.ph) * 0.05);
      ctx.strokeStyle = `hsla(${f.hue},75%,70%,0.55)`; ctx.lineWidth = 1.3 * S;
      for (let a = -0.9; a <= 0.9; a += 0.18) {
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(Math.sin(a) * 30 * s, -55 * s, Math.sin(a) * 58 * s, -88 * s * Math.cos(a * 0.6));
        ctx.stroke();
      }
      for (let r = 20; r < 80; r += 16) {
        ctx.beginPath(); ctx.arc(0, 0, r * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawPlantsFront(t) {
    // corals
    decor.corals.forEach(c => {
      const x = c.x * W, y = H * 0.915, s = c.s * S;
      ctx.save(); ctx.translate(x, y);
      ctx.strokeStyle = `hsl(${c.hue},72%,62%)`; ctx.lineCap = 'round';
      for (let b = 0; b < c.branches; b++) {
        const ang = -Math.PI / 2 + (b - (c.branches - 1) / 2) * 0.38 + Math.sin(t * 0.7 + c.ph + b) * 0.03;
        const len = (38 + (b % 3) * 13) * s;
        ctx.lineWidth = (6 - Math.abs(b - c.branches / 2) * 0.6) * s;
        ctx.beginPath(); ctx.moveTo(0, 0);
        const ex = Math.cos(ang) * len, ey = Math.sin(ang) * len;
        ctx.quadraticCurveTo(ex * 0.4, ey * 0.6, ex, ey); ctx.stroke();
        ctx.lineWidth = 3.2 * s;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(ang - 0.5) * 14 * s, ey + Math.sin(ang - 0.5) * 14 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(ang + 0.5) * 14 * s, ey + Math.sin(ang + 0.5) * 14 * s); ctx.stroke();
        ctx.fillStyle = `hsl(${c.hue + 25},90%,78%)`;
        ctx.beginPath(); ctx.arc(ex, ey, 3.2 * s, 0, 6.29); ctx.fill();
      }
      ctx.restore();
    });

    // seaweed
    decor.weeds.forEach(wd => {
      const x = wd.x * W, y = H * 0.93, h = wd.h * H;
      for (let b = 0; b < wd.blades; b++) {
        const off = (b - wd.blades / 2) * 7 * S;
        const sway = Math.sin(t * 1.1 + wd.ph + b * 0.8) * 14 * S;
        const sway2 = Math.sin(t * 0.8 + wd.ph + b) * 24 * S;
        ctx.strokeStyle = `hsla(${wd.hue + b * 8},60%,${38 + b * 5}%,0.92)`;
        ctx.lineWidth = wd.w * S * (1 - b * 0.12); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + off, y);
        ctx.bezierCurveTo(x + off + sway * 0.3, y - h * 0.35, x + off + sway, y - h * 0.7, x + off + sway2, y - h);
        ctx.stroke();
        // leaf dots
        ctx.fillStyle = `hsla(${wd.hue + 30},70%,60%,0.7)`;
        ctx.beginPath(); ctx.arc(x + off + sway2, y - h, 2.4 * S, 0, 6.29); ctx.fill();
      }
    });

    // glowing mushrooms near arch / dome (ornaments)
    [[0.20, 345], [0.78, 190], [0.24, 160]].forEach(([fx, hue], i) => {
      const x = W * fx, y = H * 0.915, s = (1 - i * 0.18) * S;
      const glow = 0.6 + Math.sin(t * 1.8 + i * 2.1) * 0.3;
      ctx.save();
      ctx.fillStyle = '#d8cfc0';
      roundRect(x - 3 * s, y - 12 * s, 6 * s, 12 * s, 3 * s); ctx.fill();
      ctx.fillStyle = `hsla(${hue},85%,68%,0.95)`;
      ctx.beginPath(); ctx.arc(x, y - 12 * s, 11 * s, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(x - 4 * s, y - 16 * s, 1.7 * s, 0, 6.29); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 4 * s, y - 14 * s, 1.3 * s, 0, 6.29); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `hsla(${hue},100%,70%,${0.10 * glow})`;
      ctx.beginPath(); ctx.arc(x, y - 12 * s, 26 * s, 0, 6.29); ctx.fill();
      ctx.restore();
    });
  }

  // ---------- Creature drawing ----------
  function drawCreature(t, dt) {
    const c = creature;
    const R = 44 * S * (1 + Math.sin(c.breath) * 0.025); // body radius
    c.hue = 302 + Math.sin(t * 0.22) * 26;

    ctx.save();
    ctx.translate(c.x, c.y + Math.sin(t * 1.7) * 4 * S);
    ctx.rotate(c.angle + c.roll);
    const squash = 1 + Math.sin(c.breath * 2) * 0.02;
    ctx.scale(squash, 1 / squash);

    // --- tentacles (behind body) ---
    const nT = 7;
    for (let i = 0; i < nT; i++) {
      const f = (i - (nT - 1) / 2) / ((nT - 1) / 2); // -1..1
      const bx = f * R * 0.72;
      const by = R * 0.62;
      const len = R * (1.05 - Math.abs(f) * 0.22);
      const wave = Math.sin(t * 5.2 + i * 0.95) * R * 0.20;
      const wave2 = Math.sin(t * 3.7 + i * 1.4 + 1) * R * 0.26;
      const tipX = bx + f * R * 0.28 + wave2;
      const tipY = by + len;
      const grad = ctx.createLinearGradient(bx, by, tipX, tipY);
      grad.addColorStop(0, `hsl(${c.hue + f * 18},78%,66%)`);
      grad.addColorStop(1, `hsl(${c.hue + 35 + f * 18},82%,54%)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = R * 0.30 * (1 - Math.abs(f) * 0.15);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.bezierCurveTo(bx + wave * 0.4, by + len * 0.38, tipX - wave2 * 0.3, by + len * 0.72, tipX, tipY);
      ctx.stroke();
      // suckers
      ctx.fillStyle = 'rgba(255,240,250,0.75)';
      for (let k = 1; k <= 3; k++) {
        const u = k / 3.4;
        const sx = bx + (tipX - bx) * u + Math.sin(t * 5.2 + i * 0.95) * R * 0.08 * u;
        const sy = by + len * u;
        ctx.beginPath(); ctx.arc(sx, sy, R * 0.045, 0, 6.29); ctx.fill();
      }
      // curled tip sparkle occasionally
      ctx.fillStyle = `hsl(${c.hue + 60},95%,76%)`;
      ctx.beginPath(); ctx.arc(tipX, tipY, R * 0.05, 0, 6.29); ctx.fill();
    }

    // --- ear fins (dumbo) ---
    const flap = Math.sin(t * 6.0) * 0.45 + Math.min(Math.abs(c.vx) * 0.002, 0.25);
    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * R * 0.88, -R * 0.28);
      ctx.rotate(side * (0.55 + flap * side * 0.6));
      const eg = ctx.createRadialGradient(0, 0, 2, 0, 0, R * 0.52);
      eg.addColorStop(0, `hsl(${c.hue + 20},85%,74%)`);
      eg.addColorStop(1, `hsl(${c.hue + 45},80%,56%)`);
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.ellipse(side * R * 0.26, 0, R * 0.42, R * 0.26, side * 0.35, 0, 6.29); ctx.fill();
      ctx.strokeStyle = `hsla(${c.hue + 50},80%,48%,0.5)`; ctx.lineWidth = 1.4 * S;
      ctx.beginPath(); ctx.ellipse(side * R * 0.26, 0, R * 0.28, R * 0.15, side * 0.35, 0, 6.29); ctx.stroke();
      ctx.restore();
    });

    // --- body ---
    const bg = ctx.createRadialGradient(-R * 0.35, -R * 0.45, R * 0.1, 0, 0, R * 1.25);
    bg.addColorStop(0, `hsl(${c.hue - 18},95%,86%)`);
    bg.addColorStop(0.45, `hsl(${c.hue},84%,70%)`);
    bg.addColorStop(1, `hsl(${c.hue + 38},78%,52%)`);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-R, R * 0.55);
    ctx.bezierCurveTo(-R * 1.02, -R * 0.25, -R * 0.62, -R * 1.02, 0, -R * 1.04);
    ctx.bezierCurveTo(R * 0.62, -R * 1.02, R * 1.02, -R * 0.25, R, R * 0.55);
    ctx.bezierCurveTo(R * 0.7, R * 0.82, -R * 0.7, R * 0.82, -R, R * 0.55);
    ctx.closePath(); ctx.fill();

    // belly sheen
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.beginPath(); ctx.ellipse(0, R * 0.30, R * 0.58, R * 0.38, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(-R * 0.34, -R * 0.48, R * 0.20, R * 0.11, -0.6, 0, 6.29); ctx.fill();

    // iridescent spots
    const spots = [[-0.48, -0.62, 0.09], [0.30, -0.78, 0.07], [0.58, -0.38, 0.08], [-0.15, -0.85, 0.055], [0.05, -0.60, 0.05]];
    spots.forEach((sp, i) => {
      ctx.fillStyle = `hsla(${c.hue + 70 + i * 22 + Math.sin(t * 2 + i) * 20},100%,82%,${0.55 + Math.sin(t * 2.4 + i * 1.7) * 0.25})`;
      ctx.beginPath(); ctx.arc(sp[0] * R, sp[1] * R, sp[2] * R, 0, 6.29); ctx.fill();
    });

    // tiny golden crown-knot / sprout of wonder (a glowing bud on head)
    const budX = R * 0.08, budY = -R * 1.04;
    ctx.strokeStyle = `hsl(130,55%,52%)`; ctx.lineWidth = 2.2 * S; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -R * 0.98); ctx.quadraticCurveTo(budX, budY - R * 0.10, budX + R * 0.06, budY - R * 0.16); ctx.stroke();
    const budGlow = 0.7 + Math.sin(t * 2.6) * 0.3;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,220,120,${0.16 * budGlow})`;
    ctx.beginPath(); ctx.arc(budX + R * 0.07, budY - R * 0.19, R * 0.30, 0, 6.29); ctx.fill(); ctx.restore();
    ctx.fillStyle = `hsl(46,100%,${66 + Math.sin(t * 2.6) * 8}%)`;
    ctx.beginPath(); ctx.arc(budX + R * 0.07, budY - R * 0.19, R * 0.085, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(budX + R * 0.04, budY - R * 0.22, R * 0.03, 0, 6.29); ctx.fill();

    // cheeks
    ctx.fillStyle = 'rgba(255,110,160,0.42)';
    ctx.beginPath(); ctx.ellipse(-R * 0.52, R * 0.10, R * 0.14, R * 0.08, 0, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.ellipse(R * 0.52, R * 0.10, R * 0.14, R * 0.08, 0, 0, 6.29); ctx.fill();

    // eyes
    const lookX = Math.max(-1, Math.min(1, (c.lookX || 0))) * R * 0.07;
    const lookY = Math.max(-1, Math.min(1, (c.lookY || 0))) * R * 0.05;
    [-1, 1].forEach(side => {
      const ex = side * R * 0.34, ey = -R * 0.12;
      if (c.blink > 0.12) {
        ctx.strokeStyle = '#40203a'; ctx.lineWidth = 2.4 * S; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ex - R * 0.11, ey); ctx.quadraticCurveTo(ex, ey + R * 0.06, ex + R * 0.11, ey); ctx.stroke();
      } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(ex, ey, R * 0.145, R * 0.17, 0, 0, 6.29); ctx.fill();
        ctx.fillStyle = '#2b1830';
        ctx.beginPath(); ctx.arc(ex + lookX, ey + lookY, R * 0.082, 0, 6.29); ctx.fill();
        ctx.fillStyle = '#7a4fd0';
        ctx.beginPath(); ctx.arc(ex + lookX, ey + lookY + R * 0.02, R * 0.045, 0, 6.29); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ex + lookX - R * 0.03, ey + lookY - R * 0.035, R * 0.032, 0, 6.29); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + lookX + R * 0.028, ey + lookY + R * 0.028, R * 0.016, 0, 6.29); ctx.fill();
        // lashes
        ctx.strokeStyle = '#40203a'; ctx.lineWidth = 1.6 * S;
        ctx.beginPath(); ctx.moveTo(ex + side * R * 0.10, ey - R * 0.13); ctx.lineTo(ex + side * R * 0.16, ey - R * 0.19); ctx.stroke();
      }
    });

    // mouth
    ctx.strokeStyle = '#5a2547'; ctx.lineWidth = 2.2 * S; ctx.lineCap = 'round';
    if (c.mouthO > 0.25) {
      ctx.fillStyle = '#7a3355';
      ctx.beginPath(); ctx.arc(0, R * 0.16, R * 0.075 * c.mouthO + 1, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,150,180,0.8)';
      ctx.beginPath(); ctx.arc(0, R * 0.185, R * 0.035, 0, 6.29); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, R * 0.06, R * 0.13, 0.25, Math.PI - 0.25); ctx.stroke();
    }

    ctx.restore();

    // soft glow around creature
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gg = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, R * 2.4);
    gg.addColorStop(0, `hsla(${c.hue},100%,75%,0.10)`);
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; ctx.fillRect(c.x - R * 2.4, c.y - R * 2.4, R * 4.8, R * 4.8);
    ctx.restore();
  }

  // ---------- Update ----------
  let last = performance.now(), bubbleTimer = 0, ringTimer = 4, sparkTimer = 0;

  function update(t, dt) {
    const c = creature;
    c.breath += dt * 2.2;
    c.mouthO = Math.max(0, c.mouthO - dt * 1.8);

    // blink
    c.blinkT -= dt;
    if (c.blinkT <= 0) { c.blink = 0.22; c.blinkT = 1.8 + Math.random() * 3.4; }
    if (c.blink > 0) c.blink -= dt;

    // decide target
    c.wanderT -= dt;
    const pointerFresh = pointer.active && (performance.now() - pointer.last < 4500);
    if (pointerFresh) {
      // curious: hover near pointer but keep a shy distance
      const dx = pointer.x - c.x, dy = pointer.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      const desired = 120 * S;
      c.tx = pointer.x - (dx / d) * desired * 0.6;
      c.ty = pointer.y - (dy / d) * desired * 0.4;
      c.lookX = dx / d; c.lookY = dy / d;
      if (d < 70 * S && Math.random() < dt * 0.7) {
        rings.push({ x: c.x, y: c.y - 18 * S, r: 5 * S, vr: 30 * S, a: 0.95, wob: Math.random() * 6.28 });
        c.mouthO = 1;
      }
    } else if (c.wanderT <= 0) {
      c.wanderT = 3.5 + Math.random() * 3.5;
      c.tx = W * (0.14 + Math.random() * 0.72);
      c.ty = H * (0.20 + Math.random() * 0.48);
      const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy) || 1;
      c.lookX = dx / d; c.lookY = dy / d;
    }

    // steering
    const dx = c.tx - c.x, dy = c.ty - c.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = Math.min(dist * 0.9, 95 * S) + 12 * S;
    const dvx = (dx / dist) * speed, dvy = (dy / dist) * speed + Math.sin(t * 1.3) * 6 * S;
    c.vx += (dvx - c.vx) * Math.min(1, dt * 1.6);
    c.vy += (dvy - c.vy) * Math.min(1, dt * 1.6);
    c.x += c.vx * dt; c.y += c.vy * dt;
    c.x = Math.max(50 * S, Math.min(W - 50 * S, c.x));
    c.y = Math.max(55 * S, Math.min(H * 0.80, c.y));

    const targetAngle = Math.max(-0.28, Math.min(0.28, c.vx * 0.0022));
    c.angle += (targetAngle - c.angle) * Math.min(1, dt * 5);
    if (!pointerFresh && dist > 40) { c.lookX = c.vx / 80; c.lookY = c.vy / 120; }

    // joyful barrel roll
    c.rollT -= dt;
    if (c.rollT <= 0 && c.rolling === 0) { c.rolling = 1; c.rollT = 10 + Math.random() * 8; }
    if (c.rolling === 1) {
      c.roll += dt * 5.2;
      if (Math.random() < dt * 22) {
        inks.push({
          x: c.x + (Math.random() - 0.5) * 50 * S, y: c.y + (Math.random() - 0.5) * 40 * S,
          r: (5 + Math.random() * 9) * S, kind: Math.floor(Math.random() * 3),
          hue: c.hue + Math.random() * 70, a: 0.85, vy: -8 * S, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 2
        });
      }
      if (c.roll >= Math.PI * 2) { c.roll = 0; c.rolling = 0; }
    }

    // timers: bubbles, rings, sparkles
    bubbleTimer -= dt;
    if (bubbleTimer <= 0) { spawnAmbientBubble(); bubbleTimer = 0.25 + Math.random() * 0.7; }
    ringTimer -= dt;
    if (ringTimer <= 0) {
      rings.push({ x: c.x, y: c.y - 16 * S, r: 5 * S, vr: 24 * S, a: 0.85, wob: Math.random() * 6.28 });
      c.mouthO = 1; ringTimer = 5 + Math.random() * 6;
    }
    sparkTimer -= dt;
    if (sparkTimer <= 0) {
      sparkles.push({ x: Math.random() * W, y: H * (0.15 + Math.random() * 0.6), r: (3 + Math.random() * 5) * S, a: 0, ph: Math.random() * 6.28, life: 0 });
      sparkTimer = 0.5 + Math.random() * 1.1;
    }

    // update particles
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y += b.vy * dt; b.x += b.vx * dt + Math.sin(t * 3 + b.ph) * 14 * S * dt;
      b.vy -= 6 * S * dt;
      if (b.y < -12 || b.life <= 0) bubbles.splice(i, 1);
    }
    if (bubbles.length > 90) bubbles.splice(0, bubbles.length - 90);
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += r.vr * dt; r.y -= 22 * S * dt; r.x += Math.sin(t * 2.2 + r.wob) * 8 * S * dt;
      r.a -= dt * 0.28;
      if (r.a <= 0 || r.y < 20) rings.splice(i, 1);
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i]; sp.life += dt;
      sp.a = Math.sin(Math.min(sp.life / 2.6, 1) * Math.PI) * 0.75;
      sp.y -= 6 * S * dt;
      if (sp.life > 2.6) sparkles.splice(i, 1);
    }
    for (let i = inks.length - 1; i >= 0; i--) {
      const p = inks[i];
      p.y += p.vy * dt; p.vy *= (1 - dt * 0.4); p.rot += p.vr * dt; p.a -= dt * 0.32; p.r += dt * 3 * S;
      if (p.a <= 0) inks.splice(i, 1);
    }
  }

  function drawParticles(t) {
    // ink doodles (behind creature glow, in water)
    inks.forEach(p => drawSparkleShape(p.x, p.y, p.r, p.kind, `hsla(${p.hue},90%,72%,1)`, Math.max(p.a, 0) * 0.8, p.rot));
    // ambient sparkles
    sparkles.forEach(sp => drawSparkleShape(sp.x, sp.y, sp.r, 0, '#cffcff', sp.a, sp.ph + t * 0.4));

    // bubble rings
    rings.forEach(r => {
      ctx.save();
      ctx.strokeStyle = `rgba(210,250,255,${Math.max(r.a, 0) * 0.85})`;
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.82, 0, 0, 6.29); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(r.a, 0) * 0.5})`;
      ctx.lineWidth = 1 * S;
      ctx.beginPath(); ctx.ellipse(r.x - r.r * 0.2, r.y - r.r * 0.15, r.r * 0.55, r.r * 0.4, -0.4, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
      ctx.restore();
    });

    // bubbles
    bubbles.forEach(b => {
      ctx.save();
      ctx.strokeStyle = 'rgba(215,250,255,0.75)'; ctx.lineWidth = 1.1 * S;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.29); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.34, Math.max(b.r * 0.22, 0.7), 0, 6.29); ctx.fill();
      ctx.restore();
    });

    // plankton motes (foreground drift)
    ctx.save();
    decor.motes.forEach(m => {
      const mx = ((m.x + Math.sin(t * 0.05 * m.sp + m.ph) * 0.012) % 1) * W;
      const my = ((m.y - t * 0.006 * m.sp) % 1 + 1) % 1 * H;
      ctx.fillStyle = `rgba(190,245,255,${0.16 + 0.14 * Math.sin(t * 1.5 + m.ph)})`;
      ctx.beginPath(); ctx.arc(mx, my, m.r * S, 0, 6.29); ctx.fill();
    });
    ctx.restore();
  }

  function vignette() {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(2,18,32,0.38)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // surface shimmer at top
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const x = ((i / 8) + Math.sin(performance.now() * 0.0002 + i * 2) * 0.02) * W;
      ctx.fillStyle = 'rgba(220,250,255,0.05)';
      ctx.beginPath(); ctx.ellipse(x, 4, (40 + (i % 3) * 22) * S, 7 * S, 0, 0, 6.29); ctx.fill();
    }
    ctx.restore();
  }

  resize();

  function frame(now) {
    const t = now * 0.001;
    let dt = (now - last) * 0.001; last = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;

    update(t, dt);

    ctx.clearRect(0, 0, W, H);
    drawBackground(t);
    drawPlantsBack(t);
    drawSand(t);
    inks.forEach(p => drawSparkleShape(p.x, p.y, p.r, p.kind, `hsla(${p.hue},90%,72%,1)`, Math.max(p.a, 0) * 0.75, p.rot));
    drawCreature(t, dt);
    drawPlantsFront(t);
    drawParticles(t);
    vignette();

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
  "title": "Dizzy Doodling Dumbo",
  "statement": "A pocket-sized dumbo octopus who doodles stars and hearts in sparkling ink, blows wobbly bubble rings at wishes, and daydreams beside a tiny crystal observatory."
}
```