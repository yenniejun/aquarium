```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#1a110b}
  canvas{display:block;width:100vw;height:100vh}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  let W, H, dpr, cx, cy, r, nw, neckTop;
  const TAU = Math.PI * 2;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    r = Math.min(W * 0.37, H * 0.265);
    cx = W / 2;
    cy = H * 0.93 - r;
    nw = r * 0.38;
    neckTop = cy - r - r * 0.8;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- helpers ----------
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const toX = u => cx + u * r;
  const toY = v => cy + v * r;
  const LEVEL = -0.5;
  const CENTER_V = 0.22;

  // ---------- pointer (optional stir) ----------
  const ptr = { u: 0, v: 0, power: 0 };
  window.addEventListener('pointermove', e => {
    ptr.u = (e.clientX - cx) / r;
    ptr.v = (e.clientY - cy) / r;
    if (ptr.u * ptr.u + ptr.v * ptr.v < 1.3) ptr.power = 1;
  }, { passive: true });

  // ---------- threads ----------
  const N = 72, TRAIL = 22;
  const threads = [];
  for (let i = 0; i < N; i++) {
    let u, v;
    do { u = rnd() * 1.8 - 0.9; v = rnd() * 1.3 - 0.4; } while (u * u + v * v > 0.8);
    threads.push({
      u, v,
      h: 0.1 + 0.52 * Math.pow(rnd(), 0.8),
      jit: rnd() * 40 - 20,
      warm: i % 2 === 0,
      sp: 0.8 + rnd() * 0.4,
      trail: []
    });
  }

  // ---------- bubbles & sparks ----------
  const bubbles = [], sparks = [];
  function spawnBubble(){
    const a = rnd() * TAU, d = Math.sqrt(rnd()) * 0.55;
    bubbles.push({
      u: Math.cos(a) * d, v: 0.55 + rnd() * 0.3,
      s: 0.012 + rnd() * 0.022, sp: 0.18 + rnd() * 0.18,
      ph: rnd() * TAU
    });
  }

  // ---------- static cork speckles ----------
  const specks = [];
  for (let i = 0; i < 26; i++) specks.push([rnd(), rnd(), 0.3 + rnd() * 0.7]);

  // ---------- paths ----------
  function bodyPath(){
    const a = Math.asin((nw / 2) / r);
    const jy = cy - Math.cos(a) * r;
    ctx.beginPath();
    ctx.moveTo(cx - nw / 2, neckTop);
    ctx.lineTo(cx - nw / 2, jy - r * 0.06);
    ctx.quadraticCurveTo(cx - nw / 2, jy + r * 0.01, cx - nw / 2 - r * 0.08, jy + r * 0.02);
    ctx.arc(cx, cy, r, -Math.PI / 2 - a - 0.1, -Math.PI / 2 + a + 0.1 - TAU, true);
    ctx.quadraticCurveTo(cx + nw / 2, jy + r * 0.01, cx + nw / 2, jy - r * 0.06);
    ctx.lineTo(cx + nw / 2, neckTop);
    ctx.closePath();
  }
  function surfaceY(x, t){
    return toY(LEVEL) + Math.sin(x / r * 4 + t * 1.4) * r * 0.012 + Math.sin(x / r * 7 - t * 2.1) * r * 0.006;
  }

  // ---------- animation ----------
  let t = 0, last = performance.now(), bubbleAcc = 0, prevM = 0;
  const PERIOD = 17;

  function frame(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;

    const ph = (t % PERIOD) / PERIOD;
    const m = smooth(0.28, 0.46, ph) - smooth(0.82, 0.98, ph); // 0 = tangled, 1 = untangled
    ptr.power *= Math.pow(0.25, dt);

    // a little burst of bubbles at the moment of clarity
    if (prevM < 0.6 && m >= 0.6) for (let i = 0; i < 9; i++) spawnBubble();
    prevM = m;

    // ---- update threads ----
    for (const p of threads) {
      const ang = 2.2 * Math.sin(p.u * 2.3 + t * 0.37 + Math.sin(p.v * 3.1 - t * 0.29))
                + 1.7 * Math.cos(p.v * 2.9 - t * 0.31 + p.u * 1.3);
      let tx = Math.cos(ang) * 0.45, ty = Math.sin(ang) * 0.45;

      const dx = p.u, dy = p.v - CENTER_V;
      const d = Math.hypot(dx, dy) + 1e-4;
      const target = p.h * (1 + 0.13 * Math.sin(5 * Math.atan2(dy, dx) + t * 0.6));
      const rad = (target - d) * 3;
      const ox = (-dy / d) * 0.42 + (dx / d) * rad;
      const oy = (dx / d) * 0.42 + (dy / d) * rad;

      let vx = lerp(tx, ox, m) * p.sp, vy = lerp(ty, oy, m) * p.sp;

      if (ptr.power > 0.02) {
        const ex = p.u - ptr.u, ey = p.v - ptr.v, dp = Math.hypot(ex, ey);
        if (dp < 0.55) {
          const k = (0.55 - dp) * 3.2 * ptr.power;
          vx += -ey * k; vy += ex * k;
        }
      }

      p.u += vx * dt; p.v += vy * dt;
      const dc = Math.hypot(p.u, p.v);
      if (dc > 0.9) { p.u *= 0.9 / dc; p.v *= 0.9 / dc; }
      if (p.v < LEVEL + 0.08) p.v = LEVEL + 0.08;

      p.trail.push(p.u, p.v);
      if (p.trail.length > TRAIL * 2) p.trail.splice(0, 2);
    }

    // ---- bubbles ----
    bubbleAcc += dt * (0.9 + m * 1.6);
    while (bubbleAcc > 1) { bubbleAcc -= 1; spawnBubble(); }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.v -= b.sp * dt;
      b.u += Math.sin(t * 3 + b.ph) * 0.05 * dt;
      if (b.v < LEVEL + 0.01) {
        bubbles.splice(i, 1);
        sparks.push({ u: b.u, v: LEVEL, vu: -b.u * 0.25, vv: -0.25 - Math.random() * 0.15, life: 1, s: b.s });
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.u += s.vu * dt; s.v += s.vv * dt;
      s.vu += (-s.u) * 0.9 * dt;
      s.u += Math.sin(t * 5 + i) * 0.02 * dt;
      s.life -= dt * 0.55;
      const topV = (neckTop - cy) / r + 0.15;
      if (s.life <= 0 || s.v < topV) sparks.splice(i, 1);
    }

    draw(m);
    requestAnimationFrame(frame);
  }

  function draw(m){
    // ---- back wall ----
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#24170e');
    bg.addColorStop(1, '#120a05');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glowHue = lerp(285, 200, m);
    const amb = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.2);
    amb.addColorStop(0, `hsla(${glowHue},70%,55%,${0.12 + 0.1 * m})`);
    amb.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = amb;
    ctx.fillRect(0, 0, W, H);

    // floor shadow + caustic
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.98, r * 0.85, r * 0.09, 0, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    const cau = ctx.createRadialGradient(cx + r * 0.15, cy + r * 1.0, 0, cx + r * 0.15, cy + r * 1.0, r * 0.7);
    cau.addColorStop(0, `hsla(${lerp(300, 45, m)},90%,60%,${0.12 + 0.12 * m})`);
    cau.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = cau;
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.15, cy + r * 1.0, r * 0.7, r * 0.07, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // ---- inside the bottle ----
    ctx.save();
    bodyPath();
    ctx.fillStyle = 'rgba(170,200,255,0.05)';
    ctx.fill();
    ctx.clip();

    // liquid body
    ctx.beginPath();
    ctx.moveTo(cx - r * 1.1, surfaceY(cx - r * 1.1, t));
    for (let x = cx - r * 1.1; x <= cx + r * 1.1; x += r * 0.05) ctx.lineTo(x, surfaceY(x, t));
    ctx.lineTo(cx + r * 1.1, cy + r * 1.1);
    ctx.lineTo(cx - r * 1.1, cy + r * 1.1);
    ctx.closePath();
    const lg = ctx.createRadialGradient(cx, toY(CENTER_V), r * 0.05, cx, toY(CENTER_V), r * 1.05);
    lg.addColorStop(0, `hsl(${lerp(265, 235, m)},55%,${lerp(16, 20, m)}%)`);
    lg.addColorStop(1, '#07061a');
    ctx.fillStyle = lg;
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';

    const core = ctx.createRadialGradient(cx, toY(CENTER_V), 0, cx, toY(CENTER_V), r * 0.75);
    core.addColorStop(0, `hsla(${lerp(300, 45, m)},85%,60%,${0.1 + 0.22 * m})`);
    core.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = core;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // threads
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const p of threads) {
      const tr = p.trail;
      if (tr.length < 4) continue;
      const hue = p.warm ? lerp(290 + p.jit, 405 + p.jit * 0.3, m) : lerp(270 + p.jit, 190 + p.jit * 0.3, m);
      ctx.strokeStyle = `hsla(${hue},90%,${lerp(58, 64, m)}%,${lerp(0.4, 0.6, m)})`;
      ctx.lineWidth = Math.max(1, r * 0.013);
      ctx.beginPath();
      ctx.moveTo(toX(tr[0]), toY(tr[1]));
      for (let k = 2; k < tr.length; k += 2) ctx.lineTo(toX(tr[k]), toY(tr[k + 1]));
      ctx.stroke();
      ctx.fillStyle = `hsla(${hue},100%,80%,0.7)`;
      ctx.beginPath();
      ctx.arc(toX(tr[tr.length - 2]), toY(tr[tr.length - 1]), Math.max(0.8, r * 0.011), 0, TAU);
      ctx.fill();
    }

    // bubbles
    for (const b of bubbles) {
      const x = toX(b.u), y = toY(b.v), s = b.s * r;
      ctx.strokeStyle = 'rgba(220,235,255,0.45)';
      ctx.lineWidth = Math.max(0.6, r * 0.005);
      ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(x - s * 0.35, y - s * 0.35, s * 0.25, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // meniscus
    ctx.strokeStyle = 'rgba(210,225,255,0.3)';
    ctx.lineWidth = Math.max(1, r * 0.01);
    ctx.beginPath();
    for (let x = cx - r * 1.1; x <= cx + r * 1.1; x += r * 0.05) {
      const y = surfaceY(x, t);
      x === cx - r * 1.1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // sparks rising into the neck
    ctx.globalCompositeOperation = 'lighter';
    for (const s of sparks) {
      const x = toX(s.u), y = toY(s.v), a = Math.max(0, s.life);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.07);
      g.addColorStop(0, `hsla(48,100%,80%,${0.8 * a})`);
      g.addColorStop(1, 'hsla(48,100%,60%,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 0.07, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // ---- glass ----
    ctx.save();
    bodyPath();
    ctx.strokeStyle = 'rgba(215,230,255,0.38)';
    ctx.lineWidth = Math.max(1.2, r * 0.022);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = Math.max(0.6, r * 0.006);
    ctx.stroke();

    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = r * 0.07;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, Math.PI * 1.08, Math.PI * 1.36); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = r * 0.025;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, Math.PI * 1.12, Math.PI * 1.3); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.62, r * 0.03, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = r * 0.04;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, Math.PI * 0.1, Math.PI * 0.35); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = r * 0.025;
    ctx.beginPath();
    ctx.moveTo(cx - nw * 0.28, neckTop + r * 0.2);
    ctx.lineTo(cx - nw * 0.28, cy - r * 0.95);
    ctx.stroke();
    ctx.restore();

    // ---- twine around the neck ----
    const ty = neckTop + r * 0.3;
    ctx.save();
    ctx.strokeStyle = '#c9a774';
    ctx.lineWidth = Math.max(1, r * 0.018);
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(cx - nw / 2 - r * 0.01, ty + k * r * 0.035);
      ctx.quadraticCurveTo(cx, ty + k * r * 0.035 + r * 0.025, cx + nw / 2 + r * 0.01, ty + k * r * 0.035);
      ctx.stroke();
    }
    const kx = cx + nw * 0.3, ky = ty + r * 0.06;
    const sway = Math.sin(t * 1.3) * r * 0.02;
    ctx.beginPath();
    ctx.moveTo(kx, ky);
    ctx.quadraticCurveTo(kx + r * 0.08, ky + r * 0.1, kx + r * 0.06 + sway, ky + r * 0.22);
    ctx.moveTo(kx, ky);
    ctx.quadraticCurveTo(kx + r * 0.16, ky + r * 0.05, kx + r * 0.17 + sway, ky + r * 0.16);
    ctx.stroke();
    ctx.fillStyle = '#b8935e';
    ctx.beginPath(); ctx.arc(kx, ky, r * 0.025, 0, TAU); ctx.fill();
    // little glowing bead
    const bx = kx + r * 0.06 + sway, by = ky + r * 0.25;
    const bg2 = ctx.createRadialGradient(bx, by, 0, bx, by, r * 0.06);
    bg2.addColorStop(0, `hsla(${lerp(300, 45, m)},100%,75%,0.9)`);
    bg2.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = bg2;
    ctx.beginPath(); ctx.arc(bx, by, r * 0.06, 0, TAU); ctx.fill();
    ctx.fillStyle = `hsla(${lerp(300, 45, m)},80%,65%,1)`;
    ctx.beginPath(); ctx.arc(bx, by, r * 0.022, 0, TAU); ctx.fill();
    ctx.restore();

    // ---- lip ----
    ctx.save();
    const lw = nw * 1.3, lh = r * 0.08;
    ctx.fillStyle = 'rgba(200,220,255,0.18)';
    ctx.strokeStyle = 'rgba(220,235,255,0.5)';
    ctx.lineWidth = Math.max(1, r * 0.012);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cx - lw / 2, neckTop - lh * 0.4, lw, lh, lh * 0.45);
    else ctx.rect(cx - lw / 2, neckTop - lh * 0.4, lw, lh);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // ---- cork ----
    ctx.save();
    const cTop = neckTop - r * 0.26, cBot = neckTop + r * 0.12;
    const wTop = nw * 1.04, wBot = nw * 0.86;
    ctx.beginPath();
    ctx.moveTo(cx - wTop / 2, cTop);
    ctx.lineTo(cx + wTop / 2, cTop);
    ctx.lineTo(cx + wBot / 2, cBot);
    ctx.lineTo(cx - wBot / 2, cBot);
    ctx.closePath();
    const cg = ctx.createLinearGradient(cx - wTop / 2, 0, cx + wTop / 2, 0);
    cg.addColorStop(0, '#8a5a2e');
    cg.addColorStop(0.35, '#c4904f');
    cg.addColorStop(1, '#7a4c26');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = 'rgba(60,35,15,0.55)';
    for (const s of specks) {
      ctx.beginPath();
      ctx.arc(cx - wTop / 2 + s[0] * wTop, cTop + s[1] * (cBot - cTop), r * 0.008 * s[2] + 0.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.fillStyle = '#d6a466';
    ctx.beginPath();
    ctx.ellipse(cx, cTop, wTop / 2, r * 0.035, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,55,25,0.6)';
    ctx.lineWidth = Math.max(0.6, r * 0.006);
    ctx.beginPath();
    ctx.ellipse(cx, cTop, wTop / 2 * 0.55, r * 0.018, 0, 0, TAU);
    ctx.stroke();
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
  "title": "Tangle-Untangle Tincture",
  "statement": "A round flask of indigo thought where glowing threads knot themselves into a muddle, then slowly comb out into a calm golden rosette, and each little bubble of clarity pops into a spark. Take one swirl whenever a problem feels snarled; stirring is encouraged."
}
```