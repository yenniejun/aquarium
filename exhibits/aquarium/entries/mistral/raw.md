Here's my tank — a dusk-lit little reef with one round resident who greets visitors by puffing up and humming bubble-rings:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tank</title>
<style>
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #082c47; }
  body { user-select: none; -webkit-user-select: none; touch-action: pan-y; }
  canvas { display: block; width: 100vw; height: 100vh; touch-action: pan-y; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
'use strict';
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

let W = 0, H = 0, s = 1, sh = 0, t = 0, last = 0;
let plants = [], frontPlants = [], pebbles = [], rocks = [], motes = [], bokeh = [], rays = [], caustics = [];
let bubbles = [], drops = [];
let vig = null;
let px = 0, py = 0, hasPtr = false, ambAcc = 0;

const rnd = (a, b) => a + Math.random() * (b - a);

const pip = { x: 0, y: 0, vx: 0, vy: 0, dir: 1, puff: 0, puffT: 0,
  blinkT: 2, blinkP: 0, singT: 3, sing: 0, spawnAcc: 0,
  rot: 0, spin: 0, spinV: 0, excited: 0, tx: 0, ty: 0, retarget: 0,
  mouthX: 0, mouthY: 0 };

function build() {
  plants = [];
  const cols = ['#2e8f6e', '#3aa87c', '#25795c', '#3aa87c', '#2e8f6e', '#8a4a6b', '#2f7f66', '#3aa87c'];
  const fxs = [0.05, 0.14, 0.27, 0.42, 0.58, 0.73, 0.88, 0.97];
  fxs.forEach((f, i) => {
    plants.push({ fx: f, len: rnd(0.22, 0.42) * H, w: rnd(6, 11) * s,
      color: cols[i % cols.length], phase: rnd(0, 9), sway: rnd(8, 16) * s, sp: rnd(0.7, 1.2) });
  });
  frontPlants = [
    { fx: 0.23, len: rnd(0.32, 0.46) * H, w: 9 * s, color: '#1e6b52', phase: rnd(0, 9), sway: 15 * s, sp: 0.9 },
    { fx: 0.80, len: rnd(0.30, 0.42) * H, w: 8 * s, color: '#7c3a52', phase: rnd(0, 9), sway: 13 * s, sp: 1.1 }
  ];
  pebbles = [];
  const pc = ['#8d7b68', '#7a6a8a', '#96866f', '#6f7f8a', '#a08b72', '#8a7a5f'];
  for (let i = 0; i < 16; i++) {
    const rx = rnd(3, 11) * s;
    pebbles.push({ x: rnd(0, W), y: H - sh + 4 * s + rnd(0, Math.max(4, sh - 8 * s)),
      rx: rx, ry: rx * rnd(0.5, 0.75), c: pc[i % pc.length] });
  }
  rocks = [];
  [{ fx: 0.08, c: '#5d6f7e' }, { fx: 0.94, c: '#66788a' }].forEach(cl => {
    for (let i = 0; i < 3; i++) {
      rocks.push({ x: cl.fx * W + rnd(-14, 14) * s, y: H - sh + rnd(2, 9) * s,
        rx: rnd(16, 30) * s, ry: rnd(10, 18) * s, c: cl.c });
    }
  });
  motes = [];
  const n = Math.max(24, Math.min(70, Math.round(W * H / 16000)));
  for (let i = 0; i < n; i++) {
    motes.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.7, 2.4) * Math.sqrt(s),
      vy: rnd(3, 9), ph: rnd(0, 9), warm: Math.random() < 0.18, a: rnd(0.08, 0.28) });
  }
  bokeh = [];
  for (let i = 0; i < 6; i++) bokeh.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(30, 80) * s, vy: rnd(2, 6), ph: rnd(0, 9) });
  rays = [];
  for (let i = 0; i < 4; i++) rays.push({ fx: rnd(0.1, 0.9), w: rnd(0.05, 0.13), ph: rnd(0, 9), sp: rnd(0.15, 0.35) });
  caustics = [];
  for (let i = 0; i < 5; i++) caustics.push({ fx: rnd(0, 1), fy: rnd(0.15, 0.9), sp: rnd(0.2, 0.5), ph: rnd(0, 9), rx: rnd(30, 60) * s });
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.max(1, Math.round(W * dpr));
  cv.height = Math.max(1, Math.round(H * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  s = Math.max(0.42, Math.min(1.7, Math.min(W, H) / 620));
  sh = H * 0.13;
  if (!pip.x) { pip.x = W * 0.5; pip.y = H * 0.45; pip.tx = pip.x; pip.ty = pip.y; }
  pip.x = Math.max(30 * s, Math.min(W - 30 * s, pip.x));
  pip.y = Math.max(H * 0.1, Math.min(H - sh - 30 * s, pip.y));
  build();
  vig = ctx.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.78);
  vig.addColorStop(0, 'rgba(4,16,32,0)');
  vig.addColorStop(1, 'rgba(4,16,32,0.42)');
}

function splash(b) {
  const n = 4 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) {
    drops.push({ x: b.x + rnd(-3, 3) * s, y: 6 * s, vx: rnd(-34, 34) * s, vy: -rnd(30, 85) * s,
      life: rnd(0.3, 0.55), r: rnd(1, 2.2) * s });
  }
}

function burst(x, y) {
  for (let i = 0; i < 9; i++) {
    bubbles.push({ x: x + rnd(-10, 10) * s, y: y + rnd(-10, 10) * s, r: rnd(2, 5) * s,
      vr: rnd(3, 7) * s, vy: -rnd(28, 62) * s, seed: rnd(0, 9), life: 0, ring: false });
  }
}

function update(dt) {
  t += dt;
  const dPtr = hasPtr ? Math.hypot(px - pip.x, py - pip.y) : 1e9;
  pip.puffT = (hasPtr && dPtr < 240 * s) ? 1 : 0;
  pip.puff += (pip.puffT - pip.puff) * Math.min(1, dt * 3);
  const R = 44 * s * (1 + 0.5 * pip.puff);
  const bob = Math.sin(t * 2.4) * R * 0.07;
  pip.mouthX = pip.x + pip.dir * R * 0.60;
  pip.mouthY = pip.y + R * 0.22 + bob;
  pip.excited = Math.max(0, pip.excited - dt * 0.8);

  pip.retarget -= dt;
  const top = H * 0.16, bot = Math.max(top + 20 * s, H - sh - R - 8 * s);
  if (pip.retarget <= 0 || Math.hypot(pip.tx - pip.x, pip.ty - pip.y) < 30 * s) {
    pip.retarget = rnd(2.5, 5.5);
    pip.tx = rnd(W * 0.14, W * 0.86);
    pip.ty = rnd(top, bot);
  }
  let tx = pip.tx, ty = pip.ty;
  if (hasPtr && dPtr < 260 * s) { tx = px; ty = py; }
  let dx = tx - pip.x, dy = ty - pip.y;
  const L = Math.hypot(dx, dy) || 1;
  const sp = 58 * s;
  const slow = Math.max(0, Math.min(1, (L - 24 * s) / (90 * s)));
  dx = dx / L * sp * slow; dy = dy / L * sp * slow;
  if (hasPtr && dPtr < 85 * s) {
    dx += (pip.x - px) / (dPtr || 1) * sp * 0.9;
    dy += (pip.y - py) / (dPtr || 1) * sp * 0.9;
  }
  const k = Math.min(1, dt * 2.4);
  pip.vx += (dx - pip.vx) * k;
  pip.vy += (dy - pip.vy) * k;
  pip.x += pip.vx * dt;
  pip.y += pip.vy * dt;
  pip.x = Math.max(R * 0.6, Math.min(W - R * 0.6, pip.x));
  pip.y = Math.max(H * 0.10, Math.min(H - sh - R - 3 * s, pip.y));
  if (pip.vx > 6 * s) pip.dir = 1; else if (pip.vx < -6 * s) pip.dir = -1;
  pip.rot = Math.max(-0.16, Math.min(0.16, pip.vx * 0.0011)) + Math.sin(t * 2.1) * 0.04;
  pip.spinV *= Math.max(0, 1 - dt * 2.4);
  pip.spin += pip.spinV * dt;

  pip.blinkT -= dt;
  if (pip.blinkT <= 0) { pip.blinkP = 0.16; pip.blinkT = rnd(2, 5); }
  if (pip.blinkP > 0) pip.blinkP -= dt;

  pip.singT -= dt;
  if (pip.singT <= 0) { pip.sing = 1.4; pip.singT = rnd(4.5, 8.5); }
  if (pip.sing > 0) {
    pip.sing -= dt;
    pip.spawnAcc += dt;
    if (pip.spawnAcc > 0.17) {
      pip.spawnAcc = 0;
      bubbles.push({ x: pip.mouthX + rnd(-2, 2) * s, y: pip.mouthY + rnd(-2, 2) * s,
        r: 3 * s, vr: 22 * s, vy: -rnd(22, 34) * s, seed: rnd(0, 9), life: 0, ring: true });
    }
  }

  ambAcc += dt;
  if (ambAcc > 0.7) {
    ambAcc = 0;
    const p = plants[(Math.random() * plants.length) | 0];
    if (p) bubbles.push({ x: p.fx * W + rnd(-8, 8) * s, y: H - sh - p.len * 0.96,
      r: rnd(1.2, 2.6) * s, vr: rnd(1, 3) * s, vy: -rnd(14, 26) * s, seed: rnd(0, 9), life: 0, ring: false });
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.life += dt; b.y += b.vy * dt; b.r += b.vr * dt;
    if (b.y < 8 * s || b.life > 7) {
      if (b.y < 16 * s) splash(b);
      bubbles.splice(i, 1);
    }
  }
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life -= dt; d.vy += 320 * s * dt; d.x += d.vx * dt; d.y += d.vy * dt;
    if (d.life <= 0) drops.splice(i, 1);
  }
  for (const m of motes) {
    m.y -= m.vy * dt;
    m.x += Math.sin(t * 0.4 + m.ph) * 7 * dt;
    if (m.y < -6) { m.y = H + 6; m.x = rnd(0, W); }
    if (m.x < -6) m.x = W + 6; else if (m.x > W + 6) m.x = -6;
  }
  for (const b of bokeh) {
    b.y -= b.vy * dt;
    if (b.y < -b.r) { b.y = H + b.r; b.x = rnd(0, W); }
  }
}

function drawSand() {
  const step = Math.max(16, (W / 40) | 0);
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, H - sh + Math.sin(2.0) * 4 * s);
  for (let x = 0; x <= W; x += step) {
    ctx.lineTo(x, H - sh + Math.sin(x * 0.012 + 2.0) * 4 * s + Math.sin(x * 0.03) * 2 * s);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, H - sh, 0, H);
  g.addColorStop(0, '#d3c096');
  g.addColorStop(1, '#8f7a55');
  ctx.fillStyle = g;
  ctx.fill();
}

function drawStrand(p, front) {
  const bx = p.fx * W, baseY = H - sh + 6 * s, len = p.len, n = 16;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = bx + Math.sin(u * 2.8 + t * p.sp + p.phase) * p.sway * u
              + Math.sin(t * 0.6 + p.phase * 2.3) * p.sway * 0.35 * u;
    const y = baseY - u * len;
    const w = Math.max(0.8, p.w * (1 - u * 0.8));
    pts.push([x, y, w]);
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0] - pts[0][2] / 2, pts[0][1]);
  for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0] - pts[i][2] / 2, pts[i][1]);
  for (let i = n; i >= 0; i--) ctx.lineTo(pts[i][0] + pts[i][2] / 2, pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = p.color;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = front ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.22)';
  ctx.lineWidth = Math.max(0.8, p.w * 0.28);
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawPip() {
  const R = 44 * s * (1 + 0.5 * pip.puff);
  const bob = Math.sin(t * 2.4) * R * 0.07;
  ctx.save();
  ctx.translate(pip.x, pip.y + bob);
  ctx.rotate(pip.rot + pip.spin * 0.15);
  ctx.scale(pip.dir, 1);

  ctx.fillStyle = '#ef8354';
  const nSp = 14;
  for (let i = 0; i < nSp; i++) {
    const a = i / nSp * Math.PI * 2 + 0.35;
    const sl = R * (0.05 + 0.30 * pip.puff);
    const bx = Math.cos(a) * R * 0.9, by = Math.sin(a) * R * 0.9;
    const ox = Math.cos(a + Math.PI / 2) * R * 0.10, oy = Math.sin(a + Math.PI / 2) * R * 0.10;
    ctx.beginPath();
    ctx.moveTo(bx + ox, by + oy);
    ctx.lineTo(bx - ox, by - oy);
    ctx.lineTo(Math.cos(a) * (R + sl), Math.sin(a) * (R + sl));
    ctx.closePath();
    ctx.fill();
  }

  const wag = Math.sin(t * 9) * R * 0.14;
  ctx.fillStyle = 'rgba(255,150,105,0.9)';
  ctx.beginPath();
  ctx.moveTo(-R * 0.72, -R * 0.26);
  ctx.quadraticCurveTo(-R * 1.12, -R * 0.08 + wag * 0.5, -R * 1.34, wag);
  ctx.quadraticCurveTo(-R * 1.08, R * 0.16 + wag * 0.5, -R * 0.72, R * 0.30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(226,116,82,0.7)';
  ctx.beginPath();
  ctx.ellipse(-R * 0.18, R * 0.34, R * 0.28, R * 0.13, 0.6 + Math.sin(t * 7) * 0.3, 0, Math.PI * 2);
  ctx.fill();

  const bg = ctx.createRadialGradient(-R * 0.35, -R * 0.42, R * 0.15, 0, 0, R * 1.15);
  bg.addColorStop(0, '#ffe2b4');
  bg.addColorStop(0.5, '#ffb37c');
  bg.addColorStop(1, '#ff8a55');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 0, R, R * 0.94, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,238,219,0.85)';
  ctx.beginPath();
  ctx.ellipse(R * 0.10, R * 0.40, R * 0.52, R * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  const dw = Math.sin(t * 6) * R * 0.07;
  ctx.fillStyle = 'rgba(255,150,105,0.9)';
  ctx.beginPath();
  ctx.moveTo(-R * 0.28, -R * 0.86);
  ctx.quadraticCurveTo(-R * 0.02, -R * 1.28 + dw, R * 0.26, -R * 0.88);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,145,100,0.95)';
  ctx.beginPath();
  ctx.ellipse(-R * 0.02, R * 0.34, R * 0.36, R * 0.16, 0.7 + Math.sin(t * 7.3) * 0.35, 0, Math.PI * 2);
  ctx.fill();

  let eo = 1;
  if (pip.blinkP > 0) {
    const p = pip.blinkP / 0.16;
    eo = Math.max(0.06, p < 0.5 ? 1 - p * 2 : (p - 0.5) * 2);
  }
  let lx = pip.dir * R * 0.07, ly = R * 0.03;
  if (hasPtr) {
    const dx = (px - pip.x) * pip.dir, dy = py - pip.y;
    const d = Math.hypot(dx, dy) || 1;
    const m = Math.min(R * 0.10, d * 0.06);
    lx = dx / d * m; ly = dy / d * m;
  }
  const eyes = [[R * 0.42, -R * 0.26, R * 0.30], [R * 0.08, -R * 0.46, R * 0.21]];
  for (const e of eyes) {
    const ex = e[0], ey = e[1], r = e[2];
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, r, Math.max(0.4, r * eo), 0, 0, Math.PI * 2);
    ctx.fill();
    const pr = r * 0.5;
    ctx.fillStyle = '#33272e';
    ctx.beginPath();
    ctx.ellipse(ex + lx, ey + ly, pr, Math.max(0.2, pr * eo), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex + lx - pr * 0.3, ey + ly - pr * 0.35, pr * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }

  const mo = pip.sing > 0 ? 0.5 + 0.5 * Math.sin(t * 9) : 0;
  if (mo > 0.08) {
    ctx.fillStyle = '#7e3b2e';
    ctx.beginPath();
    ctx.ellipse(R * 0.60, R * 0.22, R * 0.16 * (0.5 + 0.5 * mo), R * 0.13 * (0.5 + 0.5 * mo), 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#7e3b2e';
    ctx.lineWidth = Math.max(1.4, 2.2 * s);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(R * 0.52, R * 0.12, R * 0.13, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  const bl = Math.max(pip.puff * 0.55, pip.excited * 0.8);
  if (bl > 0.04) {
    ctx.fillStyle = 'rgba(255,105,105,' + Math.min(0.5, bl * 0.5) + ')';
    ctx.beginPath(); ctx.ellipse(R * 0.32, R * 0.10, R * 0.14, R * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(R * 0.58, R * 0.42, R * 0.11, R * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawRays() {
  for (const r of rays) {
    const x = r.fx * W, hw = r.w * W * 0.5;
    const lean = Math.sin(t * r.sp + r.ph) * W * 0.07;
    const al = 0.07 + 0.035 * Math.sin(t * 0.4 + r.ph * 2);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(255,255,255,' + al + ')');
    g.addColorStop(0.55, 'rgba(255,255,255,' + (al * 0.4) + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - hw, -20);
    ctx.lineTo(x + hw, -20);
    ctx.lineTo(x + hw + lean + hw * 0.9, H + 20);
    ctx.lineTo(x - hw + lean - hw * 0.9, H + 20);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSurface() {
  const step = Math.max(14, (W / 60) | 0);
  const wave = x => 8 * s + Math.sin(x * 0.02 + t * 1.6) * 3 * s + Math.sin(x * 0.05 - t * 2.2) * 2 * s;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, wave(W));
  for (let x = W; x >= 0; x -= step) ctx.lineTo(x, wave(x));
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  ctx.beginPath();
  for (let x = 0; x <= W; x += step) {
    if (x === 0) ctx.moveTo(x, wave(x)); else ctx.lineTo(x, wave(x));
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = Math.max(1, 1.6 * s);
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#46a3b8');
  g.addColorStop(0.45, '#1e6f90');
  g.addColorStop(1, '#093049');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawSand();

  for (const c of caustics) {
    ctx.save();
    ctx.translate(c.fx * W + Math.sin(t * c.sp + c.ph) * 40 * s, H - sh + 4 * s + c.fy * Math.max(4, sh - 8 * s));
    ctx.rotate(Math.sin(t * 0.3 + c.ph) * 0.25);
    ctx.beginPath();
    ctx.ellipse(0, 0, c.rx, c.rx * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,250,220,0.06)';
    ctx.fill();
    ctx.restore();
  }

  const R = 44 * s * (1 + 0.5 * pip.puff);
  const sd = Math.max(0, Math.min(1, (H - sh - 20 * s - pip.y) / (H * 0.45)));
  if (sd > 0.02) {
    ctx.fillStyle = 'rgba(10,25,40,' + (0.16 * sd) + ')';
    ctx.beginPath();
    ctx.ellipse(pip.x, H - sh + 8 * s, 10 * s + 40 * s * (1 + 0.5 * pip.puff) * sd, 2 + 7 * s * sd, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const r of rocks) {
    ctx.fillStyle = r.c;
    ctx.beginPath(); ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.ellipse(r.x - r.rx * 0.15, r.y - r.ry * 0.4, r.rx * 0.6, r.ry * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (const p of pebbles) {
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); ctx.fill();
  }

  for (const p of plants) drawStrand(p, false);
  drawPip();

  for (const b of bubbles) {
    const x = b.x + Math.sin(b.life * 4 + b.seed) * 5 * s;
    let a = 0.6 * (1 - b.life / 6);
    if (b.y < 50 * s) a *= Math.max(0, b.y / (50 * s));
    if (a <= 0) continue;
    if (b.ring) {
      ctx.strokeStyle = 'rgba(225,245,255,' + a + ')';
      ctx.lineWidth = Math.max(1, 2 * s);
      ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,' + (a * 0.8) + ')';
      ctx.lineWidth = Math.max(0.6, 1 * s);
      ctx.beginPath(); ctx.arc(x, b.y, b.r * 0.55, -2.4, -1.2); ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(220,240,255,' + a + ')';
      ctx.lineWidth = Math.max(0.8, 1.2 * s);
      ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,' + (a * 0.5) + ')';
      ctx.beginPath(); ctx.arc(x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
    }
  }
  for (const d of drops) {
    const a = Math.max(0, d.life * 1.6);
    ctx.fillStyle = 'rgba(230,246,255,' + a + ')';
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
  }

  for (const p of frontPlants) drawStrand(p, true);

  for (const b of bokeh) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.arc(b.x + Math.sin(t * 0.2 + b.ph) * 10 * s, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  }
  for (const m of motes) {
    ctx.fillStyle = m.warm ? 'rgba(255,224,180,' + m.a + ')' : 'rgba(255,255,255,' + m.a + ')';
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
  }

  drawRays();
  drawSurface();

  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0.001, (ts - last) / 1000));
  last = ts;
  update(dt);
  draw();
}

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
window.addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; hasPtr = true; }, { passive: true });
window.addEventListener('pointerdown', e => {
  px = e.clientX; py = e.clientY; hasPtr = true;
  pip.excited = 1;
  pip.spinV = (Math.random() < 0.5 ? -1 : 1) * rnd(5, 8);
  burst(e.clientX, e.clientY);
}, { passive: true });
window.addEventListener('pointercancel', () => { hasPtr = false; });
document.documentElement.addEventListener('mouseleave', () => { hasPtr = false; });

resize();
last = performance.now();
requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Pip the Puffy Puffer",
  "statement": "A round little optimist who inflates when admired and hums the rest of his song as bubble-rings. He spends his days puttering between the seaweed, blinking slowly, and greeting visitors with a small proud puff."
}
```