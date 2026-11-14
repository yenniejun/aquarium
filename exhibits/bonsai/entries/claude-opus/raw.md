```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Golden Seam Maple</title>
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
  canvas { display: block; width: 100%; height: 100%; background: transparent; touch-action: auto; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function () {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  let W = 1, H = 1, dpr = 1, K = 1, OX = 0, OY = 0, SIDE = 1;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.max(1, Math.round(W * dpr));
    cv.height = Math.max(1, Math.round(H * dpr));
    SIDE = Math.min(W, H);
    K = SIDE / 1000;
    OX = (W - SIDE) / 2;
    OY = H - SIDE;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- seeded randomness ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const R = mulberry32(7310429);
  const rr = (a, b) => a + (b - a) * R();
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };

  const T = 64;            // seconds per year
  const SX = 500, SY = 850; // trunk base
  let S = 1;               // tree scale (fit to square)

  function surf(x) {
    const u = (x - 500) / 220;
    return 866 - 22 * Math.sqrt(Math.max(0, 1 - u * u));
  }

  // ---------- tree structure ----------
  const leaves = [];
  const terminals = [];
  function mk(len, ang, w, flex) {
    return { len, ang, w, flex, bend: rr(-0.12, 0.12), ph: rr(0, 6.283), kids: [], leaves: [], term: false };
  }
  const HUES = [2, 6, 12, 18, 26, 36, 44];
  function addLeaves(n, count) {
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(R()) * 30, th = R() * Math.PI * 2;
      const dy = Math.sin(th) * r * 0.55 - 6;
      leaves.push(null);
      n.leaves.push({
        dx: Math.cos(th) * r * 1.2, dy,
        size: rr(7.5, 11.5), rot: rr(0, 6.283),
        bud: rr(0.02, 0.13), fall: rr(0.57, 0.81),
        A: HUES[(R() * HUES.length) | 0], j: rr(-1, 1),
        lt: clamp(-dy * 0.35, -6, 8) + rr(-4, 4),
        off: rr(-0.03, 0.03), ph: rr(0, 6.283),
        v: rr(26, 40), amp: rr(10, 28), fq: rr(1.1, 2.2), drift: rr(-9, 9), spin: rr(-2.5, 2.5),
        ax: undefined, ay: undefined, land: null
      });
    }
  }
  function grow(n, lvl, abs, side, maxL) {
    if (lvl >= maxL) { n.term = true; terminals.push(n); addLeaves(n, 10); return; }
    let a1 = rr(-0.3, 0.3);
    if (side) { const target = -Math.PI / 2 + side * 1.0; a1 += (target - (abs + a1)) * 0.25; }
    const c = mk(n.len * rr(0.68, 0.8), a1, n.w * 0.7, n.flex + 0.12);
    n.kids.push(c); grow(c, lvl + 1, abs + a1, side, maxL);
    if (R() < 0.9) {
      let sg = R() < 0.5 ? -1 : 1;
      let a2 = sg * rr(0.45, 0.85);
      if (Math.sin(abs + a2) > 0.2) a2 = -a2;
      const d = mk(n.len * rr(0.55, 0.72), a2, n.w * 0.55, n.flex + 0.14);
      n.kids.push(d); grow(d, lvl + 1, abs + a2, side, maxL);
    }
    if (lvl >= maxL - 2) addLeaves(n, 6);
  }

  const trunkA = [0.2, -0.38, 0.42, -0.36, 0.2, -0.12];
  const trunkL = [100, 92, 86, 78, 66, 56];
  const sides = [-1, 1, -1, 1, -1];
  const brL = [150, 138, 116, 96, 76];
  let root = null, prev = null, w = 56, abs = -Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const n = mk(trunkL[i], trunkA[i], w, i * 0.12);
    n.bend = rr(-0.08, 0.08);
    if (prev) prev.kids.push(n); else root = n;
    abs += trunkA[i];
    if (i <= 4) {
      const target = -Math.PI / 2 + sides[i] * rr(1.05, 1.3);
      const b = mk(brL[i], target - abs, w * 0.48, i * 0.12 + 0.22);
      n.kids.push(b);
      grow(b, 0, target, sides[i], i < 3 ? 4 : 3);
    }
    prev = n; w *= 0.8;
  }
  grow(prev, 1, abs, 0, 3);

  // ---------- walking the tree ----------
  const bounds = { minX: 1e9, maxX: -1e9, minY: 1e9 };
  const live = [];
  function walk(n, x, y, abs, sw, draw, bud) {
    const sway = sw ? n.flex * (0.022 * Math.sin(sw.t * 1.05 + n.ph) + 0.01 * Math.sin(sw.t * 2.3 + n.ph * 2) + 0.045 * sw.w) : 0;
    const a = abs + n.ang + sway;
    const L = n.len * S;
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
    const px = -Math.sin(a), py = Math.cos(a);
    const cx = (x + ex) / 2 + px * L * n.bend, cy = (y + ey) / 2 + py * L * n.bend;
    if (draw) {
      const wd = n.w * S;
      ctx.strokeStyle = '#4f3e33';
      ctx.lineWidth = wd;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
      if (wd > 2.2) {
        const o = -wd * 0.22;
        ctx.strokeStyle = 'rgba(176,154,130,0.38)';
        ctx.lineWidth = wd * 0.28;
        ctx.beginPath(); ctx.moveTo(x + px * o, y + py * o); ctx.quadraticCurveTo(cx + px * o, cy + py * o, ex + px * o, ey + py * o); ctx.stroke();
      }
      if (n.term && bud > 0) {
        ctx.fillStyle = 'rgba(196,72,58,' + bud.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(ex, ey, 2.6 * S, 0, 6.283); ctx.fill();
      }
      const sx = sw ? Math.sin(sw.t * 1.4 + n.ph) * 0.8 : 0;
      for (const l of n.leaves) live.push(l, ex + l.dx * S + sx, ey + l.dy * S);
    } else {
      bounds.minX = Math.min(bounds.minX, ex); bounds.maxX = Math.max(bounds.maxX, ex); bounds.minY = Math.min(bounds.minY, ey);
      for (const l of n.leaves) {
        const lx = ex + l.dx, ly = ey + l.dy, r = l.size + 2;
        bounds.minX = Math.min(bounds.minX, lx - r); bounds.maxX = Math.max(bounds.maxX, lx + r); bounds.minY = Math.min(bounds.minY, ly - r);
      }
    }
    for (const k of n.kids) walk(k, ex, ey, a, sw, draw, bud);
  }
  S = 1;
  walk(root, SX, SY, -Math.PI / 2, null, false, 0);
  {
    const hx = Math.max(SX - bounds.minX, bounds.maxX - SX);
    const vy = SY - bounds.minY;
    S = Math.min(1.3, 400 / hx, 785 / vy);
  }

  // ---------- leaf shape ----------
  const leafP = new Path2D();
  for (let i = 0; i <= 70; i++) {
    const th = i / 70 * Math.PI * 2;
    const lobe = Math.pow(Math.abs(Math.cos(th * 2.5)), 0.7);
    const r = 0.38 + 0.62 * lobe;
    const x = Math.sin(th) * r, y = -Math.cos(th) * r;
    if (i) leafP.lineTo(x, y); else leafP.moveTo(x, y);
  }
  leafP.closePath();

  const KS = [0, 0.16, 0.38, 0.5, 0.62, 0.78];
  function leafCol(l, s, alpha) {
    const ss = clamp(s + l.off, 0, 1);
    const Hh = [78 + l.j * 8, 98 + l.j * 6, 122 + l.j * 6, 116 + l.j * 4, l.A, l.A - 5];
    const Sa = [62, 56, 46, 46, 82, 70];
    const Li = [64 + l.lt * 0.5, 50 + l.lt, 31 + l.lt, 33 + l.lt, 50 + l.lt, 38 + l.lt * 0.5];
    let i = 0;
    while (i < KS.length - 2 && ss > KS[i + 1]) i++;
    const f = clamp((ss - KS[i]) / (KS[i + 1] - KS[i]), 0, 1);
    const h = Hh[i] + (Hh[i + 1] - Hh[i]) * f;
    const sa = Sa[i] + (Sa[i + 1] - Sa[i]) * f;
    const li = Li[i] + (Li[i + 1] - Li[i]) * f;
    return 'hsla(' + h.toFixed(1) + ',' + sa.toFixed(1) + '%,' + li.toFixed(1) + '%,' + alpha.toFixed(3) + ')';
  }

  // ---------- moss, stone, cracks ----------
  const moss = [];
  for (let i = 0; i < 110; i++) {
    let x = R() < 0.45 ? rr(410, 590) : rr(288, 712);
    const y = surf(x) + rr(-1, 6);
    moss.push({ x, y, r: rr(2.5, 6.5), c: 'hsl(' + rr(78, 112).toFixed(0) + ',' + rr(32, 52).toFixed(0) + '%,' + rr(20, 36).toFixed(0) + '%)' });
  }
  moss.sort((a, b) => a.y - b.y);

  function crack(x, y, dir, steps) {
    const pts = [[x, y]];
    for (let i = 0; i < steps; i++) { x += rr(-13, 13); y += dir * rr(10, 17); pts.push([x, y]); }
    return pts;
  }
  const cracks = [crack(342, 872, 1, 9), crack(604, 872, 1, 6), crack(472, 992, -1, 5)];
  {
    const p = cracks[0][4];
    const b = [[p[0], p[1]]]; let x = p[0], y = p[1];
    for (let i = 0; i < 5; i++) { x += rr(12, 22); y += rr(4, 12); b.push([x, y]); }
    cracks.push(b);
    const q = cracks[1][3];
    const c = [[q[0], q[1]]]; x = q[0]; y = q[1];
    for (let i = 0; i < 4; i++) { x += rr(10, 20); y += rr(-6, 10); c.push([x, y]); }
    cracks.push(c);
  }
  const speck = [];
  for (let i = 0; i < 46; i++) speck.push([rr(275, 725), rr(884, 978), rr(0.6, 1.6), rr(0.05, 0.16)]);

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function potBody() {
    ctx.beginPath();
    ctx.moveTo(258, 874); ctx.lineTo(742, 874);
    ctx.bezierCurveTo(738, 930, 728, 972, 700, 986);
    ctx.lineTo(300, 986);
    ctx.bezierCurveTo(272, 972, 262, 930, 258, 874);
    ctx.closePath();
  }
  function strokeCracks() {
    for (const c of cracks) {
      ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]);
      for (let i = 1; i < c.length; i++) ctx.lineTo(c[i][0], c[i][1]);
      ctx.stroke();
    }
  }

  function drawPot(t) {
    // feet
    const fg = ctx.createLinearGradient(0, 976, 0, 1000);
    fg.addColorStop(0, '#16202e'); fg.addColorStop(1, '#0e1520');
    ctx.fillStyle = fg;
    rrect(318, 974, 58, 26, 5); ctx.fill();
    rrect(624, 974, 58, 26, 5); ctx.fill();
    // body
    const g = ctx.createLinearGradient(258, 0, 742, 0);
    g.addColorStop(0, '#18243a'); g.addColorStop(0.3, '#33507a'); g.addColorStop(0.55, '#263c5c'); g.addColorStop(1, '#141e30');
    ctx.fillStyle = g; potBody(); ctx.fill();
    ctx.save();
    potBody(); ctx.clip();
    const sh = ctx.createLinearGradient(0, 874, 0, 986);
    sh.addColorStop(0, 'rgba(0,0,0,0.38)'); sh.addColorStop(0.15, 'rgba(0,0,0,0)'); sh.addColorStop(0.8, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = sh; ctx.fillRect(250, 870, 500, 120);
    const sheen = ctx.createRadialGradient(360, 920, 4, 360, 920, 90);
    sheen.addColorStop(0, 'rgba(220,235,255,0.16)'); sheen.addColorStop(1, 'rgba(220,235,255,0)');
    ctx.fillStyle = sheen; ctx.fillRect(250, 870, 500, 120);
    for (const p of speck) { ctx.fillStyle = 'rgba(210,225,245,' + p[3] + ')'; ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, 6.283); ctx.fill(); }
    // kintsugi seams
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(70,50,10,0.5)'; ctx.lineWidth = 5; strokeCracks();
    ctx.strokeStyle = '#c59a3e'; ctx.lineWidth = 3.4; strokeCracks();
    ctx.strokeStyle = '#efd48a'; ctx.lineWidth = 1.2; strokeCracks();
    ctx.setLineDash([16, 250]);
    ctx.lineDashOffset = -((t * 46) % 266);
    ctx.strokeStyle = 'rgba(255,248,222,0.95)'; ctx.lineWidth = 3; strokeCracks();
    ctx.setLineDash([]);
    ctx.restore();
    // rim
    const rg = ctx.createLinearGradient(248, 0, 752, 0);
    rg.addColorStop(0, '#22324c'); rg.addColorStop(0.3, '#4a6a96'); rg.addColorStop(0.6, '#34507a'); rg.addColorStop(1, '#1b2840');
    ctx.fillStyle = rg; rrect(248, 856, 504, 22, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(200,220,245,0.22)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(258, 858.5); ctx.lineTo(742, 858.5); ctx.stroke();
    // a little gold on the rim too
    ctx.strokeStyle = '#d4ab52'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(342, 878); ctx.lineTo(338, 868); ctx.lineTo(346, 857); ctx.stroke();
  }

  function drawSoil() {
    ctx.fillStyle = '#3a2c22';
    ctx.beginPath(); ctx.ellipse(500, 866, 222, 22, 0, Math.PI, 0); ctx.fill();
    // stone
    const sx = 642, sy = surf(642) - 1;
    const sg = ctx.createRadialGradient(sx - 7, sy - 6, 2, sx, sy, 24);
    sg.addColorStop(0, '#a9a49b'); sg.addColorStop(1, '#5b5850');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.ellipse(sx, sy, 22, 11, -0.1, 0, 6.283); ctx.fill();
  }

  function drawRoots() {
    ctx.strokeStyle = '#4f3e33';
    const r = [[-1, 62, 0.42], [1, 70, 0.4], [-1, 34, 0.5], [1, 38, 0.46]];
    for (const [d, len, wf] of r) {
      ctx.lineWidth = 56 * S * wf * 0.55;
      ctx.beginPath();
      ctx.moveTo(SX + d * 8 * S, SY - 14 * S);
      ctx.quadraticCurveTo(SX + d * len * 0.5 * S, SY - 2, SX + d * len * S, SY + 6);
      ctx.stroke();
    }
  }

  // ---------- wind & pointer ----------
  let ptrX = 0.5, lastMove = -1e9, wind = 0;
  window.addEventListener('pointermove', e => {
    if (SIDE > 0) { ptrX = (e.clientX - OX) / SIDE; lastMove = performance.now(); }
  }, { passive: true });
  window.addEventListener('pointerleave', () => { lastMove = -1e9; }, { passive: true });

  // ---------- main loop ----------
  function frame(now) {
    const t = now / 1000;
    const s = ((t / T) + 0.42) % 1;
    const target = (now - lastMove < 2500) ? clamp((ptrX - 0.5) * 2, -1, 1) * 0.9 : 0;
    wind += (target - wind) * 0.03;
    const gust = 0.55 * Math.sin(t * 0.23) * Math.sin(t * 0.071 + 1.3);
    const wt = wind + gust;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    const a = dpr * K, bx = dpr * OX, by = dpr * OY;
    ctx.setTransform(a, 0, 0, a, bx, by);

    drawSoil();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawRoots();
    let bud = 0;
    if (s > 0.86) bud = smooth((s - 0.86) / 0.08);
    else if (s < 0.08) bud = 1 - smooth(s / 0.08);
    live.length = 0;
    walk(root, SX, SY, -Math.PI / 2, { t, w: wt }, true, bud);
    for (const m of moss) { ctx.fillStyle = m.c; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill(); }
    drawPot(t);

    // leaves
    const flutterAmp = 0.18 + Math.abs(wt) * 0.25;
    for (let i = 0; i < live.length; i += 3) {
      const l = live[i]; let x = live[i + 1], y = live[i + 2];
      if (s < l.bud) { l.land = null; continue; }
      let sc, rot, alpha = 1;
      if (s < l.fall) {
        l.land = null;
        l.ax = x; l.ay = y;
        sc = l.size * S * smooth((s - l.bud) / 0.1);
        rot = l.rot + Math.sin(t * 3 + l.ph) * flutterAmp;
      } else {
        if (l.ax === undefined) continue;
        if (l.land) {
          x = l.land[0]; y = l.land[1]; rot = l.land[2];
          sc = l.size * S * 0.9;
        } else {
          const tau = (s - l.fall) * T;
          x = l.ax + Math.sin(tau * l.fq + l.ph) * l.amp + l.drift * tau;
          y = l.ay + l.v * tau;
          rot = l.rot + tau * l.spin;
          sc = l.size * S;
          if (x > 286 && x < 714 && y >= surf(x) - 2) {
            y = surf(x) - 2 + (l.ph % 4);
            l.land = [x, y, rot];
          } else if (y > 870) {
            alpha = 1 - (y - 870) / 70;
            if (alpha <= 0) continue;
          }
        }
        if (s > 0.9) alpha *= 1 - smooth((s - 0.9) / 0.09);
        if (alpha <= 0.01) continue;
      }
      if (sc <= 0.05) continue;
      const c = Math.cos(rot) * sc * a, sn = Math.sin(rot) * sc * a;
      ctx.setTransform(c, sn, -sn, c, a * x + bx, a * y + by);
      ctx.fillStyle = leafCol(l, s, alpha);
      ctx.fill(leafP);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
  "title": "Golden Seam Maple",
  "statement": "A small Japanese maple lets the whole year pass through it: bright spring flush, deep summer green, ember autumn, then bare winter branches with red buds waiting. It grows in a dark pot that once broke and was mended with gold, because the repaired places can be the ones that catch the light."
}
```