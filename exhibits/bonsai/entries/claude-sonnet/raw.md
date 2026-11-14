```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>bonsai</title>
<style>
  html,body{margin:0;padding:0;height:100%;background:transparent;overflow:hidden}
  canvas{position:absolute;left:50%;bottom:0;transform:translateX(-50%);display:block;background:transparent}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const D = Math.PI / 180, TAU = Math.PI * 2;

/* ---------- helpers ---------- */
let sd = 20240;
function rnd() {
  sd |= 0; sd = sd + 0x6D2B79F5 | 0;
  let t = Math.imul(sd ^ sd >>> 15, 1 | sd);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
const R = (a, b) => a + (b - a) * rnd();
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sm = u => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

/* ---------- tree structure ---------- */
const leaves = [], cands = [], fruits = [];
let amp = 0, gust = 0, measuring = false, bb = null;

function mk(depth, rel, len, n, w0, wf, bends, at) {
  return { depth, rel, n, sl: len / n, w0, w1: w0 * wf, bends, at: at || 0, kids: [], ph: rnd() * TAU,
    xs: new Float32Array(n + 1), ys: new Float32Array(n + 1), hs: new Float32Array(n + 1) };
}
function wAt(b, i) {
  let w = b.w0 + (b.w1 - b.w0) * i / b.n;
  if (b.depth === 0) w *= 1 + .6 * Math.max(0, 1 - i / 3);
  return Math.max(w, 1.6);
}
function zig(n, a) {
  const r = []; let s = rnd() < .5 ? 1 : -1;
  for (let i = 0; i < n; i++) { r.push(s * a * R(.4, 1.1)); s = -s; }
  return r;
}
function addLeaf(b, at, off, size) {
  leaves.push({ b, at, off: off + R(-.25, .25), size: size * R(.85, 1.15), v: rnd(), t0: R(.02, .17), fT: R(.74, .9),
    drops: rnd() < .55, fallen: false, ph: rnd() * TAU, x: 0, y: 0, h: 0, gx: 0, gy: 0, ga: 0, col: '#000', vis: 1 });
}
function tipLeaves(b, s) { addLeaf(b, b.n, 0, s); addLeaf(b, b.n, .9, s * .9); addLeaf(b, b.n, -.9, s * .9); }
function cand(b, at) { cands.push({ b, at, x: 0, y: 0 }); }

function build(b) {
  const n = b.n;
  if (b.depth === 1) {
    const sg = rnd() < .5 ? 1 : -1;
    [2, 4, 6].forEach((at, j) => {
      if (at >= n) return;
      const side = j % 2 ? -sg : sg;
      const len = b.sl * n * .5 * (1 - at / n * .4);
      const k = mk(2, side * R(32, 55) * D, len, 5, wAt(b, at) * .62, .45, zig(5, 10 * D), at);
      b.kids.push(k); build(k);
    });
    tipLeaves(b, 32);
  } else if (b.depth === 2) {
    const sg = rnd() < .5 ? 1 : -1;
    [2, 4].forEach((at, j) => {
      const side = j % 2 ? -sg : sg;
      const len = b.sl * n * .55 * (1 - at / n * .3);
      const k = mk(3, side * R(35, 55) * D, len, 3, wAt(b, at) * .6, .5, zig(3, 12 * D), at);
      b.kids.push(k); build(k);
    });
    addLeaf(b, 1, 1, 30); addLeaf(b, 3, -1, 30);
    cand(b, 1); cand(b, 3);
    tipLeaves(b, 30);
  } else if (b.depth === 3) {
    for (let i = 1; i < n; i++) { addLeaf(b, i, 1, 32); addLeaf(b, i, -1, 32); cand(b, i); }
    tipLeaves(b, 34);
  }
}

const trunkBends = [];
for (let i = 0; i < 14; i++) trunkBends.push(17 * Math.sin(.6 * i + .2) * D);
const trunk = mk(0, 0, 420, 14, 40, .36, trunkBends);
const blens = [250, 210, 175, 145, 115, 95];
[3, 5, 7, 9, 11, 13].forEach((at, j) => {
  const side = j % 2 ? -1 : 1, n = j < 4 ? 7 : 6;
  const k = mk(1, side * R(50, 66) * D, blens[j], n, wAt(trunk, at) * .55, .4, zig(n, 9 * D), at);
  trunk.kids.push(k); build(k);
});
[1, -1].forEach(s => {
  const k = mk(1, s * R(14, 26) * D, 115, 6, wAt(trunk, 14) * .9, .4, zig(6, 8 * D), 14);
  trunk.kids.push(k); build(k);
});

/* ---------- walking / drawing the wood ---------- */
const woodCol = ['#4a3a30', '#52402f', '#614a38', '#755e49'];
const lx = new Float32Array(20), ly = new Float32Array(20), rx = new Float32Array(20), ry = new Float32Array(20);

function sway(b, i, t) {
  return amp * (.0032 + .0026 * b.depth) * (Math.sin(t * 1.25 + b.ph + i * .3) + .8 * gust);
}
function line(b, off, w, col, dash) {
  const n = b.n;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const x = b.xs[i] + (lx[i] - b.xs[i]) * off, y = b.ys[i] + (ly[i] - b.ys[i]) * off;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
}
function wood(b) {
  const n = b.n, xs = b.xs, ys = b.ys, hs = b.hs;
  for (let i = 0; i <= n; i++) {
    const h = i === 0 ? hs[0] : i === n ? hs[n - 1] : (hs[i - 1] + hs[i]) / 2;
    const w = wAt(b, i) / 2, nx = -Math.sin(h), ny = Math.cos(h);
    lx[i] = xs[i] + nx * w; ly[i] = ys[i] + ny * w; rx[i] = xs[i] - nx * w; ry[i] = ys[i] - ny * w;
  }
  ctx.fillStyle = woodCol[b.depth];
  ctx.beginPath(); ctx.moveTo(lx[0], ly[0]);
  for (let i = 1; i < n; i++) ctx.quadraticCurveTo(lx[i], ly[i], (lx[i] + lx[i + 1]) / 2, (ly[i] + ly[i + 1]) / 2);
  ctx.lineTo(lx[n], ly[n]); ctx.lineTo(rx[n], ry[n]);
  for (let i = n - 1; i >= 1; i--) ctx.quadraticCurveTo(rx[i], ry[i], (rx[i] + rx[i - 1]) / 2, (ry[i] + ry[i - 1]) / 2);
  ctx.lineTo(rx[0], ry[0]); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(xs[n], ys[n], wAt(b, n) / 2, 0, TAU); ctx.fill();
  if (b.depth <= 1) {
    const w = wAt(b, n >> 1);
    line(b, .5, Math.max(1, w * .13), 'rgba(238,208,168,.22)');
    line(b, -.55, Math.max(1.2, w * .22), 'rgba(12,6,3,.28)');
    if (b.depth === 0) {
      line(b, .05, 2, 'rgba(15,8,4,.35)', [16, 9, 5, 13]);
      line(b, -.25, 1.6, 'rgba(15,8,4,.3)', [9, 14, 20, 8]);
      line(b, .3, 1.5, 'rgba(240,215,180,.14)', [7, 18, 12, 10]);
    }
  }
}
function walk(b, x, y, h0, t, draw) {
  const n = b.n; let ang = h0, px = x, py = y;
  b.xs[0] = x; b.ys[0] = y;
  for (let i = 0; i < n; i++) {
    ang += b.bends[i] + (amp ? sway(b, i, t) : 0);
    b.hs[i] = ang;
    px += Math.cos(ang) * b.sl; py += Math.sin(ang) * b.sl;
    b.xs[i + 1] = px; b.ys[i + 1] = py;
    if (measuring) {
      if (px < bb.x0) bb.x0 = px; if (px > bb.x1) bb.x1 = px;
      if (py < bb.y0) bb.y0 = py; if (py > bb.y1) bb.y1 = py;
    }
  }
  if (draw) wood(b);
  for (const k of b.kids) walk(k, b.xs[k.at], b.ys[k.at], b.hs[k.at - 1] + k.rel, t, draw);
}
function updateAnch() {
  for (const L of leaves) { L.x = L.b.xs[L.at]; L.y = L.b.ys[L.at]; L.h = L.b.hs[L.at - 1]; }
  for (const c of cands) { c.x = c.b.xs[c.at]; c.y = c.b.ys[c.at]; }
  for (const f of fruits) { f.ax = f.b.xs[f.at]; f.ay = f.b.ys[f.at]; }
}

/* ---------- fit tree into the frame ---------- */
const BY = 862;
let K = 1, bx = 500;
(function fit() {
  amp = 0; gust = 0; measuring = true;
  bb = { x0: 0, x1: 0, y0: 0, y1: 0 };
  walk(trunk, 0, 0, -98 * D, 0, false);
  measuring = false;
  updateAnch();
  const pool = cands.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  for (const c of pool) {
    if (fruits.length >= 11) break;
    if (fruits.every(f => Math.hypot(f.x - c.x, f.y - c.y) > 82))
      fruits.push({ b: c.b, at: c.at, x: c.x, y: c.y, ax: c.x, ay: c.y, r: R(15, 18), ph: rnd() * TAU, fT: R(.955, .995), fallen: false, gx: 0, gy: 0 });
  }
  for (const L of leaves) {
    bb.x0 = Math.min(bb.x0, L.x - L.size * 1.1); bb.x1 = Math.max(bb.x1, L.x + L.size * 1.1);
    bb.y0 = Math.min(bb.y0, L.y - L.size * 1.1); bb.y1 = Math.max(bb.y1, L.y + L.size * 1.1);
  }
  for (const f of fruits) {
    bb.x0 = Math.min(bb.x0, f.ax - 26); bb.x1 = Math.max(bb.x1, f.ax + 26);
    bb.y1 = Math.max(bb.y1, f.ay + 50);
  }
  const mnx = Math.min(bb.x0, -1), mxx = Math.max(bb.x1, 1), mny = Math.min(bb.y0, -1);
  K = Math.min(1.3, (BY - 70) / -mny, 800 / (mxx - mnx));
  bx = clamp(500 - K * (mnx + mxx) / 2, 410, 590);
  K = Math.min(K, (bx - 90) / -mnx, (910 - bx) / mxx);
})();

/* ---------- seasons ---------- */
const stops = [[0, 92, 62, 64], [.2, 118, 45, 42], [.46, 126, 40, 32], [.58, 62, 72, 50], [.68, 36, 85, 52], [.78, 13, 80, 45], [1, 10, 70, 40]];
function lc(s, v) {
  s = clamp(s + (v - .5) * .08, 0, 1);
  let i = 0; while (i < stops.length - 2 && s > stops[i + 1][0]) i++;
  const a = stops[i], b = stops[i + 1], u = clamp((s - a[0]) / (b[0] - a[0]), 0, 1);
  return 'hsl(' + (a[1] + (b[1] - a[1]) * u | 0) + ',' + (a[2] + (b[2] - a[2]) * u | 0) + '%,' + ((a[3] + (b[3] - a[3]) * u) + (v - .5) * 10 | 0) + '%)';
}
const PERIOD = 72, S0 = .66;

/* ---------- leaf & fruit drawing ---------- */
function drawLeaf(x, y, a, L, wf, col) {
  const c = Math.cos(a), s = Math.sin(a), W = L * .38 * wf;
  const X = (u, v) => x + u * c - v * s, Y = (u, v) => y + u * s + v * c;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.bezierCurveTo(X(.15 * L, W * 1.3), Y(.15 * L, W * 1.3), X(.7 * L, W), Y(.7 * L, W), X(L, 0), Y(L, 0));
  ctx.bezierCurveTo(X(.7 * L, -W), Y(.7 * L, -W), X(.15 * L, -W * 1.3), Y(.15 * L, -W * 1.3), x, y);
  ctx.fillStyle = col; ctx.fill();
  ctx.lineTo(X(L * .92, 0), Y(L * .92, 0));
  ctx.strokeStyle = 'rgba(40,20,0,.22)'; ctx.lineWidth = 1.1; ctx.stroke();
}
let T = 0;
function drawFruit(x, y, r, ripe, glow, ph) {
  if (r < .5) return;
  if (glow > .02) {
    const g = ctx.createRadialGradient(x, y, r * .5, x, y, r * 2.7);
    const a = glow * (.3 + .1 * Math.sin(T * 1.6 + ph));
    g.addColorStop(0, 'rgba(255,160,40,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,160,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.7, 0, TAU); ctx.fill();
  }
  const h = 95 - 73 * ripe, l = 44 + 10 * ripe;
  const g2 = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r * 1.2);
  g2.addColorStop(0, 'hsl(' + (h + 8 | 0) + ',95%,' + (l + 16 | 0) + '%)');
  g2.addColorStop(.6, 'hsl(' + (h | 0) + ',90%,' + (l | 0) + '%)');
  g2.addColorStop(1, 'hsl(' + (h - 6 | 0) + ',85%,' + (l - 14 | 0) + '%)');
  ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(x, y, r * 1.1, r * .94, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'hsl(' + (70 - 20 * ripe | 0) + ',35%,' + (32 - 6 * ripe | 0) + '%)';
  for (let j = 0; j < 4; j++) {
    const a = j * Math.PI / 2 + .4;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * r * .4, y - r * .8 + Math.sin(a) * r * .13, r * .4, r * .15, Math.cos(a) * .4, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.33)';
  ctx.beginPath(); ctx.ellipse(x - r * .42, y - r * .3, r * .22, r * .12, -.6, 0, TAU); ctx.fill();
}

/* ---------- pot, soil, moss (static layers) ---------- */
const body = new Path2D();
body.moveTo(272, 884); body.bezierCurveTo(258, 925, 290, 966, 318, 986); body.lineTo(682, 986);
body.bezierCurveTo(710, 966, 742, 925, 728, 884); body.closePath();

function mkCrack(x, y, dx0, dx1, dy0, dy1, maxY, maxN) {
  const p = [[x, y]]; let n = 0;
  while (y < maxY && n < maxN) { x += R(dx0, dx1); y += R(dy0, dy1); p.push([x, y]); n++; }
  return p;
}
const cracks = [];
{
  const A = mkCrack(440, 884, -8, 14, 14, 21, 975, 9);
  const B = mkCrack(618, 884, -14, 6, 14, 20, 935, 4);
  const C = mkCrack(736, 912, -20, -10, 6, 13, 990, 5);
  cracks.push(A, B, C);
  cracks.push(mkCrack(A[2][0], A[2][1], 6, 16, 5, 12, 999, 3));
  cracks.push(mkCrack(A[4][0], A[4][1], -16, -6, 6, 12, 999, 3));
  cracks.push(mkCrack(B[1][0], B[1][1], 6, 14, 6, 12, 999, 2));
}
const crackPaths = cracks.map(pts => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); return p; });

const mossBlobs = [];
const surfY = x => { const t = (x - 266) / 468; return 866 - 108 * t * (1 - t); };
for (let i = 0; i < 340; i++) {
  const x = R(272, 728), y = R(surfY(x) - 3, 866);
  mossBlobs.push({ x, y, r: R(4, 10), h: R(88, 135), s: R(30, 50), l: R(22, 44) });
}
mossBlobs.sort((a, b) => a.y - b.y);
const rndSeed = sd;
const speck = [];
for (let i = 0; i < 110; i++) speck.push({ x: R(270, 730), y: R(900, 990), r: R(.7, 2), a: R(.1, .3) });
const drips = [];
for (let x = 275; x < 730; x += R(26, 52)) drips.push({ x, w: R(9, 15), d: R(10, 30) + (rnd() < .5 ? R(18, 48) : 0) });
const frontTufts = [];
for (let i = 0; i < 46; i++) frontTufts.push({ dx: R(-64, 64), y: R(848, 864), r: R(5, 10), h: R(88, 135), s: R(30, 50), l: R(26, 48) });

let layerA, layerB, W = 0, SC = 1;

function paintA(c) {
  // foot ring
  let g = c.createLinearGradient(0, 982, 0, 1000);
  g.addColorStop(0, '#2a4a57'); g.addColorStop(1, '#10222a');
  c.fillStyle = g; rr(c, 316, 982, 368, 18, 5); c.fill();
  // body
  g = c.createLinearGradient(258, 0, 742, 0);
  g.addColorStop(0, '#16303a'); g.addColorStop(.3, '#2b5565'); g.addColorStop(.55, '#37687a');
  g.addColorStop(.85, '#1d3a46'); g.addColorStop(1, '#10242c');
  c.fillStyle = g; c.fill(body);
  c.save(); c.clip(body);
  g = c.createLinearGradient(0, 884, 0, 1000);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
  c.fillStyle = g; c.fillRect(240, 884, 520, 120);
  g = c.createLinearGradient(340, 0, 440, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.13)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(340, 890, 100, 100);
  for (const s of speck) { c.fillStyle = 'rgba(205,235,235,' + s.a + ')'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); }
  // cream glaze band with drips
  g = c.createLinearGradient(0, 880, 0, 930);
  g.addColorStop(0, '#f1e6c8'); g.addColorStop(1, '#d6c39a');
  c.fillStyle = g; c.strokeStyle = g; c.lineCap = 'round';
  c.beginPath(); c.moveTo(250, 880); c.lineTo(750, 880);
  for (let x = 750; x >= 250; x -= 6) c.lineTo(x, 893 + 4 * Math.sin(x * .05) + 2.5 * Math.sin(x * .13));
  c.closePath(); c.fill();
  for (const d of drips) { c.lineWidth = d.w; c.beginPath(); c.moveTo(d.x, 892); c.lineTo(d.x, 892 + d.d); c.stroke(); }
  // lip shadow
  g = c.createLinearGradient(0, 884, 0, 902);
  g.addColorStop(0, 'rgba(40,25,10,.35)'); g.addColorStop(1, 'rgba(40,25,10,0)');
  c.fillStyle = g; c.fillRect(250, 884, 500, 18);
  // gold repair lines
  c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = 'rgba(90,55,10,.55)'; c.lineWidth = 6;
  crackPaths.forEach(p => c.stroke(p));
  c.strokeStyle = '#d9a73f'; c.lineWidth = 3.6;
  crackPaths.forEach(p => c.stroke(p));
  c.strokeStyle = 'rgba(255,236,160,.7)'; c.lineWidth = 1.2;
  crackPaths.forEach(p => c.stroke(p));
  c.restore();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.5; c.stroke(body);

  // soil
  c.fillStyle = '#2b1d14';
  c.beginPath(); c.moveTo(266, 884); c.lineTo(266, 866); c.quadraticCurveTo(500, 812, 734, 866); c.lineTo(734, 884); c.fill();
  for (const m of mossBlobs) {
    c.fillStyle = 'hsl(' + (m.h | 0) + ',' + (m.s | 0) + '%,' + (m.l | 0) + '%)';
    c.beginPath(); c.arc(m.x, m.y, m.r, 0, TAU); c.fill();
  }
  for (let i = 0; i < 90; i++) {
    const x = 285 + (i * 97 % 430), y = surfY(x) + (i * 31 % 18);
    c.fillStyle = 'hsla(' + (100 + i % 30) + ',55%,62%,.35)';
    c.beginPath(); c.arc(x, y, 1.8 + (i % 3), 0, TAU); c.fill();
  }
  // stones
  [[352, 856, 22, 14], [688, 857, 17, 11], [664, 861, 9, 6]].forEach(s => {
    const gr = c.createRadialGradient(s[0] - s[2] * .3, s[1] - s[3] * .5, 2, s[0], s[1], s[2] * 1.2);
    gr.addColorStop(0, '#b7b2a6'); gr.addColorStop(1, '#4c4a47');
    c.fillStyle = gr; c.beginPath(); c.ellipse(s[0], s[1], s[2], s[3], 0, 0, TAU); c.fill();
  });
  // tiny mushrooms
  [[306, 850, 1], [323, 853, .65]].forEach(m => {
    const x = m[0], y = m[1], k = m[2];
    c.fillStyle = '#efe3cc'; rr(c, x - 2.5 * k, y - 11 * k, 5 * k, 14 * k, 2); c.fill();
    c.fillStyle = '#e8785a'; c.beginPath(); c.ellipse(x, y - 11 * k, 11 * k, 8 * k, 0, Math.PI, TAU); c.fill();
    c.fillStyle = '#fff1dc';
    [[-4, -14], [3, -16], [6, -12]].forEach(d => { c.beginPath(); c.arc(x + d[0] * k, y + d[1] * k, 1.5 * k, 0, TAU); c.fill(); });
  });
}
function paintB(c) {
  // lip
  let g = c.createLinearGradient(0, 860, 0, 887);
  g.addColorStop(0, '#548796'); g.addColorStop(.5, '#34606f'); g.addColorStop(1, '#1f414e');
  c.fillStyle = g; rr(c, 252, 860, 496, 27, 13); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1.6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(272, 864); c.lineTo(728, 864); c.stroke();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.2; rr(c, 252, 860, 496, 27, 13); c.stroke();
  // gold-mended chip
  g = c.createLinearGradient(668, 860, 724, 887);
  g.addColorStop(0, '#f7dc8c'); g.addColorStop(.5, '#d9a73f'); g.addColorStop(1, '#a8761f');
  c.fillStyle = g; c.beginPath();
  [[668, 860], [712, 860], [716, 868], [706, 872], [710, 880], [694, 887], [680, 884], [676, 874], [664, 868]]
    .forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(90,55,10,.6)'; c.lineWidth = 1.4; c.stroke();
  // front moss tufts
  for (const t of frontTufts) {
    c.fillStyle = 'hsl(' + (t.h | 0) + ',' + (t.s | 0) + '%,' + (t.l | 0) + '%)';
    c.beginPath(); c.arc(bx + t.dx, t.y, t.r, 0, TAU); c.fill();
  }
}
function buildLayers() {
  layerA = document.createElement('canvas'); layerB = document.createElement('canvas');
  layerA.width = layerB.width = layerA.height = layerB.height = W;
  [layerA, layerB].forEach((l, i) => {
    const c = l.getContext('2d'); c.setTransform(SC, 0, 0, SC, 0, 0);
    i ? paintB(c) : paintA(c);
  });
}
function resize() {
  const size = Math.max(100, Math.min(window.innerWidth, window.innerHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = Math.round(size * dpr);
  cv.width = cv.height = W;
  cv.style.width = cv.style.height = size + 'px';
  SC = W / 1000;
  buildLayers();
}
window.addEventListener('resize', resize);
resize();

/* ---------- particles ---------- */
const parts = [];
function spawnLeaf(L) {
  if (parts.length > 260) return;
  parts.push({ type: 0, x: L.gx, y: L.gy, rot: L.ga, size: L.size * K, col: L.col, vy: 38 + Math.random() * 32,
    ph: Math.random() * TAU, fr: 1.2 + Math.random() * 1.2, landY: 846 + Math.random() * 14, alpha: 1, land: 0, landed: false });
}
function spawnFruit(f) {
  parts.push({ type: 1, x: f.gx, y: f.gy, r: f.r * K, vy: 0, vx: (Math.random() - .5) * 40, ph: f.ph, landY: 848,
    alpha: 1, land: 0, landed: false, bounces: 0 });
}
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p.type === 0) {
      if (!p.landed) {
        p.y += p.vy * dt;
        p.x += (Math.sin(T * p.fr + p.ph) * 34 + gust * 18) * dt;
        p.rot += Math.cos(T * p.fr + p.ph) * dt * 1.2;
        if (p.y >= p.landY && p.x > 275 && p.x < 725) { p.landed = true; p.y = p.landY; }
        else if (p.y > 940) p.alpha = Math.max(0, (1000 - p.y) / 60);
      } else { p.land += dt; if (p.land > 5) p.alpha = 1 - (p.land - 5) / 3; }
    } else {
      if (!p.landed) {
        p.vy += 1000 * dt; p.y += p.vy * dt; p.x += p.vx * dt;
        if (p.y >= p.landY && p.x > 285 && p.x < 715) {
          p.y = p.landY; p.vy = -p.vy * .28; p.vx *= .5; p.bounces++;
          if (p.bounces > 2 || Math.abs(p.vy) < 40) { p.landed = true; p.vy = 0; }
        } else if (p.y > 940) p.alpha = Math.max(0, (1000 - p.y) / 60);
      } else { p.land += dt; if (p.land > 6) p.alpha = 1 - (p.land - 6) / 3; }
    }
    if (p.alpha <= 0 || p.y > 1010) parts.splice(i, 1);
  }
}
function drawParts() {
  for (const p of parts) {
    ctx.globalAlpha = clamp(p.alpha, 0, 1);
    if (p.type === 0) drawLeaf(p.x, p.y, p.rot, p.size, Math.abs(Math.cos(T * p.fr + p.ph)) * .8 + .2, p.col);
    else drawFruit(p.x, p.y, p.r, 1, .5, p.ph);
  }
  ctx.globalAlpha = 1;
}

/* ---------- interaction ---------- */
let impulse = 0;
window.addEventListener('pointermove', e => {
  const m = Math.hypot(e.movementX || 0, e.movementY || 0);
  impulse = Math.min(1.5, impulse + m * .004);
}, { passive: true });

/* ---------- main loop ---------- */
let last = 0;
function frame(ts) {
  const now = ts / 1000;
  const dt = Math.min(.05, Math.max(0, now - last)); last = now;
  T += dt;
  impulse *= Math.exp(-dt * 1.2);
  amp = .9 + .35 * Math.sin(T * .4) + impulse * 2.2;
  gust = Math.sin(T * .45) * .7 + Math.sin(T * 1.13 + 2) * .3;
  const s = (S0 + T / PERIOD) % 1;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, W);
  ctx.drawImage(layerA, 0, 0);
  ctx.setTransform(SC, 0, 0, SC, 0, 0);

  // golden glints crawling along the mends
  ctx.save(); ctx.clip(body);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(255,246,200,.95)';
  ctx.setLineDash([14, 150]);
  crackPaths.forEach((p, i) => { ctx.lineDashOffset = -((T * 55 + i * 47) % 164); ctx.stroke(p); });
  ctx.setLineDash([]); ctx.restore();

  // tree
  ctx.save(); ctx.translate(bx, BY); ctx.scale(K, K);
  ctx.strokeStyle = woodCol[0]; ctx.lineCap = 'round';
  for (let j = -2; j <= 2; j++) {
    ctx.lineWidth = 17 - Math.abs(j) * 3.5;
    ctx.beginPath(); ctx.moveTo(j * 8, -16); ctx.quadraticCurveTo(j * 20, -8, j * 33, 4 + Math.abs(j)); ctx.stroke();
  }
  walk(trunk, 0, 0, -98 * D, T, true);
  updateAnch();

  for (const L of leaves) {
    if (s < .3) L.fallen = false;
    if (!L.fallen && s >= L.fT) { L.fallen = true; if (L.drops) spawnLeaf(L); }
    let sc;
    if (L.fallen) sc = 0;
    else if (s < .3) sc = sm((s - L.t0) / .08);
    else if (!L.drops && s > L.fT - .012) sc = clamp(1 - (s - (L.fT - .012)) / .012, 0, 1);
    else sc = 1;
    L.vis = sc;
    L.col = lc(s, L.v);
    let a = L.h + L.off + Math.sin(T * 2.6 + L.ph) * .1 * amp;
    const dx = Math.cos(a), dy = Math.sin(a) + .55;
    a = Math.atan2(dy, dx);
    L.ga = a; L.gx = bx + K * L.x; L.gy = BY + K * L.y;
    if (sc > .02) drawLeaf(L.x, L.y, a, L.size * sc, 1, L.col);
  }
  for (const f of fruits) {
    if (s < .1) f.fallen = false;
    if (!f.fallen && s >= f.fT) { f.fallen = true; spawnFruit(f); }
    const sz = f.fallen ? 0 : s < .14 ? 0 : s < .4 ? .6 * sm((s - .14) / .26) : s < .68 ? .6 + .4 * sm((s - .4) / .28) : 1;
    const ripe = sm((s - .48) / .2);
    const glow = ripe * (.7 + .3 * sm((s - .7) / .15));
    const r = f.r * sz;
    const fx = f.ax + Math.sin(T * 1.3 + f.ph) * 4 * (.5 + amp * .5);
    const fy = f.ay + 10 + r * .9;
    f.gx = bx + K * fx; f.gy = BY + K * fy;
    if (sz > .02) {
      ctx.strokeStyle = '#5a4630'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(f.ax, f.ay); ctx.lineTo(fx, fy - r * .8); ctx.stroke();
      drawFruit(fx, fy, r, ripe, glow, f.ph);
    }
  }
  ctx.restore();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerB, 0, 0);
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  updateParts(dt);
  drawParts();
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
  "title": "Mended Lantern Persimmon",
  "statement": "A persimmon that cycles through a full year, from unfurling leaves to a bare winter branch hung with glowing fruit, and drops its last fruits onto the moss before starting over. Its teal pot is cracked and mended with gold, and the repairs catch the light as it sways."
}
```