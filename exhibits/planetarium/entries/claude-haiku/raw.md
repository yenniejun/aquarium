```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;height:100%;background:#000;overflow:hidden;}
body{display:flex;align-items:center;justify-content:center;}
canvas{display:block;touch-action:none;}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function () {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  let S = 0, R = 0, cx = 0, cy = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    S = Math.min(window.innerWidth, window.innerHeight);
    R = S / 2; cx = R; cy = R;
    cv.style.width = S + 'px';
    cv.style.height = S + 'px';
    cv.width = Math.round(S * dpr);
    cv.height = Math.round(S * dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  // Seeded random so the sky is the same every visit
  let seed = 20417;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  const TINTS = ['#ffffff', '#fff4e6', '#e6f0ff', '#ffe9d2', '#dfe9ff'];

  // Field stars in polar form on the unit disc
  const field = [];
  for (let i = 0; i < 520; i++) {
    const r = Math.sqrt(rnd()) * 1.05;
    field.push({
      r, th: rnd() * Math.PI * 2,
      sz: 0.35 + Math.pow(rnd(), 3) * 1.6,
      b: 0.3 + rnd() * 0.7,
      ph: rnd() * Math.PI * 2,
      sp: 0.8 + rnd() * 1.6,
      c: TINTS[Math.floor(rnd() * TINTS.length)]
    });
  }

  // Milky way band, tilted through the disc
  const band = [];
  const BA = 0.6;
  for (let i = 0; i < 700; i++) {
    const t = rnd() * 2 - 1;
    const off = (rnd() + rnd() + rnd() - 1.5) * 0.2;
    const x = t * Math.cos(BA) - off * Math.sin(BA);
    const y = t * Math.sin(BA) + off * Math.cos(BA);
    const r = Math.hypot(x, y);
    if (r > 1.05) continue;
    band.push({
      r, th: Math.atan2(y, x),
      sz: 0.4 + rnd() * 0.6,
      b: 0.06 + rnd() * 0.16,
      c: rnd() < 0.5 ? '#c9d6ff' : '#ffd9f0'
    });
  }

  // The Lantern Whale: constellation in unit disc coordinates (x right, y down)
  const P = [
    [-0.56, 0.04],  // 0 head tip
    [-0.42, -0.12], // 1 brow
    [-0.20, -0.24], // 2 back
    [0.05, -0.21],  // 3 back mid
    [0.24, -0.12],  // 4 dorsal
    [0.42, -0.02],  // 5 tail base
    [0.60, -0.22],  // 6 tail upper
    [0.70, -0.03],  // 7 tail tip
    [0.60, 0.19],   // 8 tail lower
    [0.20, 0.21],   // 9 belly
    [-0.08, 0.31],  // 10 fin
    [-0.42, 0.20],  // 11 jaw
    [0.08, 0.00],   // 12 lantern heart
    [-0.58, -0.30], // 13 spout
    [-0.64, -0.45], // 14 spout
    [-0.52, -0.50]  // 15 spout
  ];
  const LINES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 5],
    [5, 9], [9, 10], [10, 11], [11, 0]
  ];
  const SPOUT = [[1, 13], [13, 14], [13, 15]];
  const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 13, 14, 15];
  const TS = new Array(P.length).fill(0);
  ORDER.forEach((idx, k) => { TS[idx] = 0.4 + k * 0.38; });

  const PATH = [1, 2, 3, 4, 5, 9, 10];
  const plens = [0];
  for (let i = 1; i < PATH.length; i++) {
    const a = P[PATH[i - 1]], b = P[PATH[i]];
    plens.push(plens[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const PATH_TOTAL = plens[plens.length - 1];

  function pathAt(u) {
    const d = Math.max(0, Math.min(1, u)) * PATH_TOTAL;
    let i = 1;
    while (i < PATH.length - 1 && plens[i] < d) i++;
    const seg = plens[i] - plens[i - 1] || 1;
    const k = Math.max(0, Math.min(1, (d - plens[i - 1]) / seg));
    const a = P[PATH[i - 1]], b = P[PATH[i]];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }

  const W0 = 0.010; // sky turning speed
  const K = 1.1;    // constellation scale

  function sky(x, y, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return [cx + (x * c - y * s) * K * R, cy + (x * s + y * c) * K * R];
  }

  function ss(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function drawBackground() {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, '#0e1433');
    g.addColorStop(0.6, '#060819');
    g.addColorStop(1, '#010206');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }

  function drawNebula(T) {
    const blobs = [
      { r: 0.45, th: 0.6, c: '70,50,130', a: 0.16, rad: 0.7 },
      { r: 0.55, th: 3.4, c: '40,80,120', a: 0.12, rad: 0.8 },
      { r: 0.30, th: 5.0, c: '120,60,110', a: 0.09, rad: 0.5 }
    ];
    const ang = T * W0 * 0.4;
    for (const b of blobs) {
      const x = cx + Math.cos(b.th + ang) * b.r * R;
      const y = cy + Math.sin(b.th + ang) * b.r * R;
      const g = ctx.createRadialGradient(x, y, 0, x, y, b.rad * R);
      g.addColorStop(0, 'rgba(' + b.c + ',' + b.a + ')');
      g.addColorStop(1, 'rgba(' + b.c + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);
    }
  }

  function drawField(T) {
    const ang = T * W0;
    ctx.globalAlpha = 1;
    for (const s of band) {
      const th = s.th + ang;
      ctx.globalAlpha = s.b;
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(th) * s.r * R, cy + Math.sin(th) * s.r * R, s.sz, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const s of field) {
      const th = s.th + ang;
      const tw = 0.55 + 0.45 * Math.sin(T * s.sp + s.ph);
      ctx.globalAlpha = s.b * tw;
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(th) * s.r * R, cy + Math.sin(th) * s.r * R, s.sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShootingStar(T) {
    const period = 7.3;
    const seedN = Math.floor(T / period);
    const p = (T % period) / 1.1;
    if (p > 1) return;
    const a = seedN * 2.399;
    const sx = cx + Math.cos(a) * R * 0.95;
    const sy = cy + Math.sin(a) * R * 0.95;
    const dx = Math.cos(a + 2.2), dy = Math.sin(a + 2.2);
    const hx = sx + dx * p * R * 0.9;
    const hy = sy + dy * p * R * 0.9;
    const len = R * 0.22;
    const alpha = Math.sin(Math.PI * p) * 0.9;
    const g = ctx.createLinearGradient(hx - dx * len, hy - dy * len, hx, hy);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,' + alpha + ')');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(hx - dx * len, hy - dy * len);
    ctx.lineTo(hx, hy);
    ctx.stroke();
  }

  function drawConstellation(T, tt) {
    const ang = T * W0;
    // Gentle tail sway around the tail base
    const sway = Math.sin(T * 0.9) * 0.07;
    const U = P.map(p => p.slice());
    const bx = P[5][0], by = P[5][1];
    for (const i of [6, 7, 8]) {
      const dx = P[i][0] - bx, dy = P[i][1] - by;
      U[i] = [
        bx + dx * Math.cos(sway) - dy * Math.sin(sway),
        by + dx * Math.sin(sway) + dy * Math.cos(sway)
      ];
    }
    const Q = U.map(u => sky(u[0], u[1], ang));

    const F = 1 - ss(16.0, 19.4, tt);
    if (F <= 0.001) {
      drawStaticHeart(Q, 0);
      return;
    }

    // Lines grow outward from the earlier star
    const allLines = LINES.concat(SPOUT);
    for (let li = 0; li < allLines.length; li++) {
      const [a, b] = allLines[li];
      const from = TS[a] <= TS[b] ? a : b;
      const to = from === a ? b : a;
      const tmin = Math.min(TS[a], TS[b]);
      const s = ss(tmin, tmin + 0.5, tt);
      if (s <= 0) continue;
      const ex = Q[from][0] + (Q[to][0] - Q[from][0]) * s;
      const ey = Q[from][1] + (Q[to][1] - Q[from][1]) * s;
      const isSpout = li >= LINES.length;
      ctx.setLineDash(isSpout ? [2, 4] : []);
      ctx.strokeStyle = 'rgba(255,214,160,' + (0.12 * F * s) + ')';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(Q[from][0], Q[from][1]);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,215,' + ((isSpout ? 0.4 : 0.7) * F * s) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Q[from][0], Q[from][1]);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Stars
    for (let i = 0; i < P.length; i++) {
      if (i === 12) continue; // lantern drawn separately
      const act = ss(TS[i], TS[i] + 0.35, tt);
      const tw = 0.85 + 0.15 * Math.sin(T * 3 + i * 1.7);
      const base = 0.12 + 0.88 * act;
      const [x, y] = Q[i];
      if (act > 0) {
        const hg = ctx.createRadialGradient(x, y, 0, x, y, 9);
        hg.addColorStop(0, 'rgba(255,230,190,' + (0.35 * act * F * tw) + ')');
        hg.addColorStop(1, 'rgba(255,230,190,0)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,248,235,' + (base * F * tw) + ')';
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + 0.9 * act, 0, Math.PI * 2);
      ctx.fill();
    }

    drawStaticHeart(Q, F);
    drawLantern(U, ang, tt, F);
  }

  function drawStaticHeart(Q, F) {
    const [x, y] = Q[12];
    ctx.fillStyle = 'rgba(255,200,130,' + (0.18 + 0.1 * F) + ')';
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLantern(U, ang, tt, F) {
    const lb = ss(6.0, 6.8, tt) * (1 - ss(15.5, 16.8, tt)) * F;
    if (lb <= 0.001) return;
    const lu = (tt - 6.4) / 4.6;
    // Trail
    for (let k = 10; k >= 1; k--) {
      const uu = lu - k * 0.025;
      if (uu < 0 || uu > 1) continue;
      const p = sky(...pathAt(uu), ang);
      const f = 1 - k / 11;
      ctx.fillStyle = 'rgba(255,190,110,' + (0.25 * f * lb) + ')';
      ctx.beginPath();
      ctx.arc(p[0], p[1], 1.4 * f + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    const u = Math.max(0, Math.min(1, lu));
    const [x, y] = sky(...pathAt(u), ang);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
    g.addColorStop(0, 'rgba(255,200,120,' + (0.7 * lb) + ')');
    g.addColorStop(0.4, 'rgba(255,170,90,' + (0.25 * lb) + ')');
    g.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,250,235,' + lb + ')';
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const t0 = performance.now();
  const CYCLE = 20;

  function frame(now) {
    const T = (now - t0) / 1000;
    const tt = T % CYCLE;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    drawBackground();
    drawNebula(T);
    drawField(T);
    drawConstellation(T, tt);
    drawShootingStar(T);

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
  "title": "The Lantern Whale",
  "statement": "Each dusk the Lantern Whale swallows the last lamp-light of the sea and swims off into the dark carrying it, spouting seven small stars as it goes. Once every night it surfaces, and its glowing heart wanders the length of its body, lighting the way home for sailors who have lost the shore."
}
```