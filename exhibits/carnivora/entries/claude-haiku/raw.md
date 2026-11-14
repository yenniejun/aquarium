```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Lantern Sundew</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #050908; }
  canvas { display: block; width: 100vw; height: 100vh; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function () {
  const cv = document.getElementById('c');
  const g = cv.getContext('2d');
  const W = 300, H = 400, TAU = Math.PI * 2;
  const BX = 150, BY = 342, N = 10;
  let cw, ch, dpr, s, ox, oy;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth;
    ch = window.innerHeight;
    cv.width = Math.floor(cw * dpr);
    cv.height = Math.floor(ch * dpr);
    s = Math.min(cw / W, ch / H);
    ox = (cw - W * s) / 2;
    oy = (ch - H * s) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // Random helpers with a fixed seed-free feel
  const R = (a, b) => a + Math.random() * (b - a);

  // Pointer tracking (world coordinates)
  let px = null, py = null, pvx = 0, pvy = 0, lastPT = 0;
  function toWorld(cx, cy) { return [(cx - ox) / s, (cy - oy) / s]; }
  window.addEventListener('pointermove', (e) => {
    const [x, y] = toWorld(e.clientX, e.clientY);
    const now = performance.now();
    if (px !== null) {
      const dt = Math.max(0.016, (now - lastPT) / 1000);
      const nvx = (x - px) / dt, nvy = (y - py) / dt;
      pvx = pvx * 0.6 + nvx * 0.4;
      pvy = pvy * 0.6 + nvy * 0.4;
    }
    px = x; py = y; lastPT = now;
  }, { passive: true });
  window.addEventListener('pointerout', (e) => { if (!e.relatedTarget) { px = null; py = null; } }, { passive: true });

  // Plant
  const leaves = [];
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    leaves.push({
      a0: -Math.PI / 2 + k * 0.3 + R(-0.05, 0.05),
      L: 96 - Math.abs(k) * 9 + R(-5, 5),
      curl: 0, hold: 0, a: 0, pts: [], th: [], tips: []
    });
  }

  function updateLeaf(lf, dt, t, i) {
    lf.hold = Math.max(0, lf.hold - dt);
    const goal = lf.hold > 0 ? 1 : 0;
    lf.curl += (goal - lf.curl) * Math.min(1, dt * 2.2);
    const a = lf.a0 + Math.sin(t * 0.6 + i * 1.7) * 0.035;
    lf.a = a;
    const sgn = Math.cos(a) < 0 ? 1 : -1;
    const seg = lf.L / N;
    let x = BX, y = BY;
    lf.pts = [[x, y]];
    lf.th = [a];
    for (let k = 1; k <= N; k++) {
      const th = a + sgn * lf.curl * 0.2 * k + Math.sin(t * 1.3 + i + k * 0.5) * 0.012 * k / N;
      x += Math.cos(th) * seg;
      y += Math.sin(th) * seg;
      lf.pts.push([x, y]);
      lf.th.push(th);
    }
    lf.tips = [];
    for (let k = 2; k <= N; k++) {
      for (const side of [-1, 1]) {
        const ang = lf.th[k] + side * 1.15;
        const p = lf.pts[k];
        lf.tips.push([p[0] + Math.cos(ang) * 5.5, p[1] + Math.sin(ang) * 5.5]);
      }
    }
  }

  // Bugs
  const bugs = [];
  function makeBug(type) {
    return {
      type, x: R(30, 270), y: R(60, 300),
      vx: R(-15, 15), vy: R(-15, 15),
      ph: R(0, TAU), state: 'free', lf: null, j: 0, t: 0,
      base: type === 'gnat' ? 24 : 13
    };
  }
  for (let i = 0; i < 6; i++) bugs.push(makeBug('gnat'));
  for (let i = 0; i < 3; i++) bugs.push(makeBug('fly'));

  function respawn(b) {
    b.state = 'free';
    b.x = R(30, 270); b.y = R(60, 300);
    b.vx = R(-15, 15); b.vy = R(-15, 15);
    b.t = 0;
  }

  function moveFree(b, dt) {
    b.vx += R(-1, 1) * 70 * dt;
    b.vy += R(-1, 1) * 70 * dt;

    if (px !== null) {
      const dx = b.x - px, dy = b.y - py;
      const d = Math.hypot(dx, dy);
      if (d < 50 && d > 0.01) {
        const f = (50 - d) / 50;
        b.vx += (dx / d) * f * 420 * dt;
        b.vy += (dy / d) * f * 420 * dt;
      }
      if (d < 40) {
        const f2 = (40 - d) / 40;
        b.vx += pvx * f2 * 1.2 * dt;
        b.vy += pvy * f2 * 1.2 * dt;
      }
    }

    // Walls and soil ceiling
    if (b.x < 18) b.vx += 300 * dt;
    if (b.x > 282) b.vx -= 300 * dt;
    if (b.y < 40) b.vy += 300 * dt;
    if (b.y > 316) b.vy -= 300 * dt;

    // Keep speed within a lively band
    let sp = Math.hypot(b.vx, b.vy);
    const minSp = b.base * 0.5, maxSp = b.base * 2.6;
    if (sp < 0.001) { b.vx = b.base; b.vy = 0; sp = b.base; }
    if (sp > maxSp) { b.vx *= maxSp / sp; b.vy *= maxSp / sp; }
    else if (sp < minSp) { b.vx *= minSp / sp; b.vy *= minSp / sp; }

    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  function checkCatch(b) {
    for (const lf of leaves) {
      if (lf.curl > 0.35) continue;
      for (let j = 0; j < lf.tips.length; j++) {
        const tp = lf.tips[j];
        if (Math.hypot(b.x - tp[0], b.y - tp[1]) < 4.2) {
          b.state = 'caught';
          b.lf = lf;
          b.j = j;
          b.t = 0;
          lf.hold = 10;
          return;
        }
      }
    }
  }

  function update(dt) {
    const dec = Math.exp(-dt * 3);
    pvx *= dec; pvy *= dec;
    leaves.forEach((lf, i) => updateLeaf(lf, dt, T, i));
    for (const b of bugs) {
      if (b.state === 'free') {
        moveFree(b, dt);
        checkCatch(b);
      } else if (b.state === 'caught') {
        b.t += dt;
        const tp = b.lf.tips[b.j];
        b.x = tp[0] + Math.sin(T * 30 + b.ph) * 0.35;
        b.y = tp[1] + Math.cos(T * 27 + b.ph) * 0.35;
        if (b.t > 9) respawn(b);
      }
    }
  }

  // Ambient motes
  const motes = [];
  for (let i = 0; i < 16; i++) {
    motes.push({ x: R(0, W), y: R(40, 330), vx: R(2, 6), ph: R(0, TAU), r: R(0.4, 0.9) });
  }

  // Moss and pebbles on the soil (deterministic-looking random, built once)
  const SOIL = { cx: 150, cy: 372, rx: 140, ry: 40 };
  const moss = [];
  for (let i = 0; i < 70; i++) {
    const x = R(14, 286);
    const edge = Math.sqrt(Math.max(0, 1 - ((x - SOIL.cx) / SOIL.rx) ** 2)) * SOIL.ry;
    const y = SOIL.cy - edge + R(-1, 6);
    moss.push({ x, y, r: R(2.5, 6), hue: R(90, 120), l: R(26, 38) });
  }
  const pebbles = [];
  for (let i = 0; i < 40; i++) {
    const x = R(20, 280), y = R(345, 392);
    if (((x - SOIL.cx) / SOIL.rx) ** 2 + ((y - SOIL.cy) / SOIL.ry) ** 2 < 0.85) {
      pebbles.push({ x, y, rx: R(1.5, 3.5), ry: R(1, 2.2), c: Math.random() < 0.5 ? '#4a3c34' : '#5e4e42' });
    }
  }

  function mushroom(x, y, sc, cap) {
    g.fillStyle = '#d8c8ae';
    g.fillRect(x - 1.2 * sc, y - 7 * sc, 2.4 * sc, 7 * sc);
    g.fillStyle = cap;
    g.beginPath();
    g.ellipse(x, y - 7 * sc, 5.5 * sc, 3.6 * sc, 0, Math.PI, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,250,235,0.85)';
    g.beginPath(); g.arc(x - 2 * sc, y - 9 * sc, 0.8 * sc, 0, TAU); g.fill();
    g.beginPath(); g.arc(x + 1.8 * sc, y - 8.4 * sc, 0.6 * sc, 0, TAU); g.fill();
  }

  function drawBug(b) {
    let al = 1;
    if (b.state === 'caught') al = Math.max(0, 1 - Math.max(0, b.t - 6) / 3);
    if (al <= 0) return;
    if (b.type === 'fly') {
      const pulse = 0.55 + 0.45 * Math.sin(T * 2.3 + b.ph);
      const r = 7;
      const grd = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      grd.addColorStop(0, `rgba(230,255,140,${0.9 * pulse * al})`);
      grd.addColorStop(0.3, `rgba(190,255,110,${0.3 * pulse * al})`);
      grd.addColorStop(1, 'rgba(190,255,110,0)');
      g.fillStyle = grd;
      g.beginPath(); g.arc(b.x, b.y, r, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,255,225,${al})`;
      g.beginPath(); g.arc(b.x, b.y, 0.9, 0, TAU); g.fill();
    } else {
      const ang = Math.atan2(b.vy, b.vx);
      const flick = 0.35 + 0.65 * Math.abs(Math.sin(T * 55 + b.ph));
      g.save();
      g.translate(b.x, b.y);
      g.rotate(ang);
      g.fillStyle = `rgba(210,225,215,${0.35 * al})`;
      g.beginPath(); g.ellipse(-0.3, -1.6, 1.9, 0.9 * flick, 0.3, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(-0.3, 1.6, 1.9, 0.9 * flick, -0.3, 0, TAU); g.fill();
      g.fillStyle = `rgba(25,22,26,${al})`;
      g.beginPath(); g.ellipse(0, 0, 1.8, 1.1, 0, 0, TAU); g.fill();
      g.restore();
    }
  }

  function drawLeaf(lf, idx) {
    const pts = lf.pts, th = lf.th;
    // Hairs and dew first, under the blade
    let j = 0;
    for (let k = 2; k <= N; k++) {
      for (const side of [-1, 1]) {
        const tp = lf.tips[j];
        const p = pts[k];
        g.strokeStyle = 'rgba(200,80,95,0.55)';
        g.lineWidth = 0.6;
        g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(tp[0], tp[1]); g.stroke();
        const glint = 0.75 + 0.25 * Math.sin(T * 3 + j * 1.7 + idx);
        g.fillStyle = `rgba(190,255,225,${0.28 * glint})`;
        g.beginPath(); g.arc(tp[0], tp[1], 2.4, 0, TAU); g.fill();
        g.fillStyle = `rgba(240,255,248,${0.95 * glint})`;
        g.beginPath(); g.arc(tp[0], tp[1], 1.1, 0, TAU); g.fill();
        j++;
      }
    }
    // Blade
    const lightness = 36 + lf.curl * 10;
    for (let k = 0; k < N; k++) {
      const a = pts[k], b = pts[k + 1];
      const w = 3.8 * (1 - k / N) + 1.2;
      g.lineWidth = w;
      g.lineCap = 'round';
      if (k < 3) {
        g.strokeStyle = `hsl(115,35%,${28 + k * 3}%)`;
      } else {
        g.strokeStyle = `hsl(346,58%,${lightness + k * 0.8}%)`;
      }
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    const tip = pts[N];
    const tg = g.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], 6);
    tg.addColorStop(0, 'rgba(255,120,130,0.35)');
    tg.addColorStop(1, 'rgba(255,120,130,0)');
    g.fillStyle = tg;
    g.beginPath(); g.arc(tip[0], tip[1], 6, 0, TAU); g.fill();
  }

  let T = 0;

  function draw() {
    // Letterbox fill
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#050908';
    g.fillRect(0, 0, cw, ch);

    g.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    g.save();
    g.beginPath(); g.rect(0, 0, W, H); g.clip();

    // Background: a dim greenish dusk
    const bg = g.createRadialGradient(150, 170, 10, 150, 200, 300);
    bg.addColorStop(0, '#2b4a44');
    bg.addColorStop(0.5, '#132321');
    bg.addColorStop(1, '#060b0a');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // Drifting fog bands
    for (let k = 0; k < 3; k++) {
      const fx = ((T * 6 + k * 120) % 420) - 60;
      g.fillStyle = 'rgba(150,190,180,0.05)';
      g.beginPath();
      g.ellipse(fx, 290 + k * 22, 160, 26, 0, 0, TAU);
      g.fill();
    }

    // Motes
    for (const m of motes) {
      const x = (m.x + T * m.vx) % W;
      const y = m.y + Math.sin(T * 0.5 + m.ph) * 6;
      const a = 0.2 + 0.25 * Math.sin(T * 1.4 + m.ph);
      g.fillStyle = `rgba(200,240,225,${a})`;
      g.beginPath(); g.arc(x < 0 ? x + W : x, y, m.r, 0, TAU); g.fill();
    }

    // Halo behind plant
    const halo = g.createRadialGradient(150, 250, 10, 150, 250, 130);
    halo.addColorStop(0, 'rgba(120,255,200,0.10)');
    halo.addColorStop(1, 'rgba(120,255,200,0)');
    g.fillStyle = halo;
    g.fillRect(0, 100, W, 300);

    // Soil mound
    g.fillStyle = '#2a1f1a';
    g.beginPath(); g.ellipse(SOIL.cx, SOIL.cy, SOIL.rx, SOIL.ry, 0, 0, TAU); g.fill();
    g.fillStyle = '#3a2b23';
    g.beginPath(); g.ellipse(SOIL.cx, SOIL.cy - 6, SOIL.rx * 0.8, SOIL.ry * 0.5, 0, 0, TAU); g.fill();
    for (const p of pebbles) {
      g.fillStyle = p.c;
      g.beginPath(); g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, TAU); g.fill();
    }
    for (const m of moss) {
      g.fillStyle = `hsl(${m.hue},38%,${m.l}%)`;
      g.beginPath(); g.ellipse(m.x, m.y, m.r, m.r * 0.6, 0, 0, TAU); g.fill();
    }

    // Mushrooms
    mushroom(56, 338, 1, '#b0553f');
    mushroom(250, 344, 0.7, '#8c6a4a');

    // Leaves (back to front so central leaves overlap naturally)
    const order = leaves.map((_, i) => i).sort((a, b) => Math.abs(leaves[b].a - (-Math.PI / 2)) - Math.abs(leaves[a].a - (-Math.PI / 2)));
    for (const i of order) drawLeaf(leaves[i], i);

    // Bugs
    for (const b of bugs) drawBug(b);

    g.restore();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    T += dt;
    update(dt);
    draw();
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
  "title": "The Lantern Sundew",
  "statement": "A sundew whose glands shine like tiny lamps in the dusk, drawing in gnats and the occasional firefly with sticky dew. Once a leaf folds around its catch, it spends about ten seconds digesting before it opens again, ready for the next visitor."
}
```