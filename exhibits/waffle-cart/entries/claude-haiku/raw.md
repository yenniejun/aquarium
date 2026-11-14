```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: transparent; }
  canvas { position: fixed; left: 0; top: 0; display: block; pointer-events: none; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  let dpr = 1, S = 1, OX = 0, OY = 0, VW = 1, VH = 1;

  function resize() {
    VW = innerWidth; VH = innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(VW * dpr);
    cv.height = Math.round(VH * dpr);
    cv.style.width = VW + 'px';
    cv.style.height = VH + 'px';
    S = Math.min(VW / 400, VH / 300);
    OX = (VW - 400 * S) / 2;
    OY = (VH - 300 * S) / 2;
  }
  addEventListener('resize', resize);
  resize();

  // seeded random for stable layout
  let seed = 7;
  const R0 = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const R = 102, CX = 200, CY = 128;
  const THETA = -0.5;
  const PAL = ['#ff6b8a', '#6bd3ff', '#ffe66b', '#9dff8a', '#c79bff', '#ffffff'];

  const stars = [];
  for (let i = 0; i < 90; i++) {
    const a = R0() * Math.PI * 2;
    const d = Math.sqrt(R0()) * R * 0.92;
    stars.push({
      x: Math.cos(a) * d,
      y: Math.sin(a) * d,
      spr: R0() < 0.6,
      c: PAL[Math.floor(R0() * PAL.length)],
      ph: R0() * Math.PI * 2,
      ang: R0() * Math.PI
    });
  }

  const dust = [];
  for (let i = 0; i < 12; i++) {
    dust.push({ x: (R0() * 2 - 1) * R * 0.8, y: (R0() * 2 - 1) * 14, r: 6 + R0() * 10 });
  }

  function newFall(initial) {
    return {
      x: R0() * 400,
      y: initial ? R0() * 300 : -10 - R0() * 40,
      vy: 16 + R0() * 18,
      rot: R0() * 6.28,
      vr: (R0() * 2 - 1) * 4,
      c: PAL[Math.floor(R0() * PAL.length)],
      ph: R0() * 6.28
    };
  }
  const falls = Array.from({ length: 26 }, () => newFall(true));

  let t = 0;
  let shoot = null;
  let nextShoot = 3.5;

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPlate() {
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(200, 184, 146, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    // plate body
    const g = ctx.createLinearGradient(0, 140, 0, 216);
    g.addColorStop(0, '#fbf8f1');
    g.addColorStop(1, '#c9c1b2');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(200, 178, 150, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    // inner well
    ctx.strokeStyle = 'rgba(90,80,70,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 180, 118, 28, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawSteam(bob) {
    const xs = [-36, -6, 26];
    xs.forEach((dx, i) => {
      const x = CX + dx;
      const y0 = CY + bob - 0.55 * R - 6;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.bezierCurveTo(
        x + Math.sin(t * 1.3 + i) * 12, y0 - 18,
        x - Math.sin(t * 1.0 + i) * 12, y0 - 34,
        x + Math.sin(t * 0.8 + i * 2) * 6, y0 - 62
      );
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 9;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([18, 30]);
      ctx.lineDashOffset = -t * 22 - i * 9;
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawWaffle(bob, tilt) {
    ctx.save();
    ctx.translate(CX, CY + bob);
    ctx.rotate(tilt);
    ctx.scale(1, 0.55);

    // thickness
    ctx.fillStyle = '#8c4a1c';
    ctx.beginPath();
    ctx.arc(0, 24, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a95f25';
    ctx.beginPath();
    ctx.arc(0, 14, R, 0, Math.PI * 2);
    ctx.fill();

    // top surface
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.clip();

    const base = ctx.createRadialGradient(0, 0, 10, 0, 0, R);
    base.addColorStop(0, '#ffd77a');
    base.addColorStop(0.7, '#f0a844');
    base.addColorStop(1, '#c4712a');
    ctx.fillStyle = base;
    ctx.fillRect(-R, -R, R * 2, R * 2);

    // waffle pockets
    const step = 24;
    for (let gx = -R; gx < R; gx += step) {
      for (let gy = -R; gy < R; gy += step) {
        const cx = gx + 12, cy = gy + 12;
        if (Math.hypot(cx, cy) < R - 8) {
          const pg = ctx.createLinearGradient(0, gy, 0, gy + step);
          pg.addColorStop(0, '#b8621f');
          pg.addColorStop(0.5, '#f5c46a');
          pg.addColorStop(1, '#ffe39a');
          ctx.fillStyle = pg;
          roundRect(gx + 4, gy + 4, 16, 16, 5);
          ctx.fill();
        }
      }
    }

    // milky way band
    ctx.save();
    ctx.rotate(THETA);
    const pulse = 0.8 + 0.2 * Math.sin(t * 0.9);
    const wide = ctx.createLinearGradient(0, -34, 0, 34);
    wide.addColorStop(0, 'rgba(255,247,232,0)');
    wide.addColorStop(0.5, 'rgba(255,247,232,1)');
    wide.addColorStop(1, 'rgba(255,247,232,0)');
    ctx.globalAlpha = 0.35 * pulse;
    ctx.fillStyle = wide;
    ctx.fillRect(-R - 10, -34, R * 2 + 20, 68);

    const core = ctx.createLinearGradient(0, -20, 0, 20);
    core.addColorStop(0, 'rgba(255,250,240,0)');
    core.addColorStop(0.5, 'rgba(255,252,246,1)');
    core.addColorStop(1, 'rgba(255,250,240,0)');
    ctx.globalAlpha = 0.85 * pulse;
    ctx.fillStyle = core;
    ctx.fillRect(-R - 10, -20, R * 2 + 20, 40);

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#8a4a1c';
    dust.forEach(d => {
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.r, d.r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // sprinkle stars
    stars.forEach(s => {
      const inBand = Math.abs(s.x * Math.sin(THETA) - s.y * Math.cos(THETA)) < 24;
      const tw = 0.55 + 0.45 * Math.sin(t * 2.2 + s.ph);
      ctx.globalAlpha = inBand ? tw : tw * 0.8;
      if (s.spr) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.ang);
        ctx.fillStyle = s.c;
        roundRect(-3.5, -1.2, 7, 2.4, 1.2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    ctx.restore(); // clip

    // rim highlight
    ctx.strokeStyle = 'rgba(255,240,200,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R - 2, Math.PI * 1.05, Math.PI * 1.9);
    ctx.stroke();

    ctx.restore();
  }

  function drawDrip(bob, tilt) {
    const dx = 58;
    const edgeY = CY + bob + 0.55 * Math.sqrt(R * R - dx * dx) + 2;
    const phase = (t * 0.22) % 1;
    const p = Math.min(phase, 0.9) / 0.9;
    const len = 34 * Math.sin(p * Math.PI / 2);
    const x = CX + dx;
    ctx.globalAlpha = phase > 0.9 ? 1 - (phase - 0.9) / 0.1 : 1;
    ctx.strokeStyle = '#d9781c';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, edgeY);
    ctx.lineTo(x, edgeY + len);
    ctx.stroke();
    ctx.fillStyle = '#e8902a';
    ctx.beginPath();
    ctx.arc(x, edgeY + len, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawFalls(dt) {
    falls.forEach(f => {
      f.y += f.vy * dt;
      f.x += Math.sin(t * 1.5 + f.ph) * 8 * dt;
      f.rot += f.vr * dt;
      if (f.y > 310) Object.assign(f, newFall(false), { y: -10, x: R0() * 400 });
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.fillStyle = f.c;
      roundRect(-3.5, -1.2, 7, 2.4, 1.2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawShoot(dt) {
    if (!shoot && t > nextShoot) {
      shoot = { t0: t, sx: 20 + R0() * 90, sy: 22 + R0() * 40 };
    }
    if (!shoot) return;
    const p = (t - shoot.t0) / 0.9;
    if (p >= 1) {
      shoot = null;
      nextShoot = t + 4 + R0() * 3;
      return;
    }
    const hx = shoot.sx + p * 150, hy = shoot.sy + p * 52;
    const tx = hx - 46 * (1 - p * 0.3), ty = hy - 16;
    const g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,' + (0.9 * (1 - p * 0.5)) + ')');
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.stroke();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * OX, dpr * OY);

    const bob = Math.sin(t * 1.2) * 2.5;
    const tilt = Math.sin(t * 0.7) * 0.012;

    drawPlate();
    drawSteam(bob);
    drawWaffle(bob, tilt);
    drawDrip(bob, tilt);
    drawFalls(dt);
    drawShoot(dt);

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
  "title": "Milky Waffle",
  "statement": "Cream river flowing across a starry, syrup-dusted sky."
}
```