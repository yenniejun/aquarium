```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wibbly-Wobble Lanternpuff</title>
<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #03161f;
  }
  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');

  let W = 0, H = 0, dpr = 1, R = 20;
  let bg = null;          // cached background
  let plants = [];
  let pebbles = [];
  let bubbles = [];
  let rays = [];
  let fish = null;
  let mx = -1, my = -1, mouseActive = false, lastMouse = 0;

  let t = 0, last = performance.now();
  let nextBubbleAt = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.floor(W * dpr);
    cv.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.max(9, Math.min(W, H) * 0.075);
    buildScene();
    if (!fish) {
      fish = { x: W * 0.5, y: H * 0.45, vx: 0, vy: 0, tx: W * 0.5, ty: H * 0.45, nextTarget: 0, tilt: 0, facing: 1 };
    } else {
      fish.x = Math.min(Math.max(fish.x, R * 2), W - R * 2);
      fish.y = Math.min(Math.max(fish.y, R * 2), H * 0.8);
    }
  }

  function buildScene() {
    bg = document.createElement('canvas');
    bg.width = Math.floor(W * dpr);
    bg.height = Math.floor(H * dpr);
    const b = bg.getContext('2d');
    b.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Water column
    const wg = b.createLinearGradient(0, 0, 0, H);
    wg.addColorStop(0, '#2a8fa0');
    wg.addColorStop(0.35, '#126879');
    wg.addColorStop(0.75, '#08404f');
    wg.addColorStop(1, '#042531');
    b.fillStyle = wg;
    b.fillRect(0, 0, W, H);

    // Distant haze blobs for depth
    for (let i = 0; i < 6; i++) {
      const x = rand(0, W), y = rand(H * 0.2, H * 0.7), r = rand(W * 0.1, W * 0.25);
      const hg = b.createRadialGradient(x, y, 0, x, y, r);
      hg.addColorStop(0, 'rgba(120,220,220,0.05)');
      hg.addColorStop(1, 'rgba(120,220,220,0)');
      b.fillStyle = hg;
      b.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Sand floor with dunes
    const sandTop = H * 0.86;
    const sg = b.createLinearGradient(0, sandTop - H * 0.05, 0, H);
    sg.addColorStop(0, '#d9b98a');
    sg.addColorStop(1, '#8e6a44');
    b.fillStyle = sg;
    b.beginPath();
    b.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const y = sandTop + Math.sin(x * 0.011) * H * 0.02 + Math.sin(x * 0.027 + 1.3) * H * 0.012;
      b.lineTo(x, y);
    }
    b.lineTo(W, H);
    b.closePath();
    b.fill();

    // Rocks on the left and right
    drawRock(b, W * 0.08, sandTop + H * 0.01, W * 0.11, H * 0.12, '#1d4b57');
    drawRock(b, W * 0.93, sandTop + H * 0.02, W * 0.09, H * 0.1, '#23555f');
    drawRock(b, W * 0.62, sandTop + H * 0.04, W * 0.05, H * 0.05, '#2b5f68');

    // Pebbles in the sand
    pebbles = [];
    for (let i = 0; i < Math.max(20, W / 18); i++) {
      pebbles.push({ x: rand(0, W), y: rand(sandTop + H * 0.03, H * 0.98), r: rand(1, 3.2), c: Math.random() < 0.5 ? '#f0dcb5' : '#7d5d3b' });
    }

    // Plants (kelp-like strands and a few fronds)
    plants = [];
    const count = Math.max(5, Math.round(W / 110));
    for (let i = 0; i < count; i++) {
      const x = (i + rand(0.15, 0.85)) * (W / count);
      plants.push({
        x,
        h: rand(H * 0.3, H * 0.6),
        ph: rand(0, Math.PI * 2),
        sp: rand(0.6, 1.1),
        w: rand(R * 0.35, R * 0.6),
        hue: Math.random() < 0.6 ? 'kelp' : 'frond'
      });
    }

    // Light rays from the surface
    rays = [];
    for (let i = 0; i < 6; i++) {
      rays.push({
        x: rand(-W * 0.1, W * 1.1),
        w: rand(W * 0.04, W * 0.12),
        ph: rand(0, Math.PI * 2),
        sp: rand(0.15, 0.35),
        lean: rand(-0.25, 0.25)
      });
    }

    bubbles = [];
  }

  function drawRock(c, x, y, rx, ry, color) {
    const g = c.createRadialGradient(x - rx * 0.3, y - ry * 0.4, rx * 0.1, x, y, rx);
    g.addColorStop(0, shade(color, 30));
    g.addColorStop(1, color);
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x, y - ry * 0.4, rx, ry, 0, Math.PI, 0);
    c.lineTo(x + rx, y + ry);
    c.lineTo(x - rx, y + ry);
    c.closePath();
    c.fill();
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `rgb(${r|0},${g|0},${b|0})`;
  }

  // ---------- Update ----------

  function pickTarget() {
    const margin = R * 2.5;
    fish.tx = rand(margin, W - margin);
    fish.ty = rand(H * 0.18, H * 0.72);
    fish.nextTarget = t + rand(3.5, 6.5);
  }

  function updateFish(dt) {
    if (t > fish.nextTarget) pickTarget();

    const dx = fish.tx - fish.x, dy = fish.ty - fish.y;
    const d = Math.hypot(dx, dy) || 1;
    const speed = Math.min(d * 0.35, W * 0.09);
    const desVx = (dx / d) * speed;
    const desVy = (dy / d) * speed + Math.sin(t * 1.7) * 6; // gentle wobble

    fish.vx += (desVx - fish.vx) * Math.min(1, dt * 1.2);
    fish.vy += (desVy - fish.vy) * Math.min(1, dt * 1.2);
    fish.x += fish.vx * dt;
    fish.y += fish.vy * dt;

    fish.x = Math.min(Math.max(fish.x, R * 1.6), W - R * 1.6);
    fish.y = Math.min(Math.max(fish.y, R * 1.8), H * 0.8);

    if (Math.abs(fish.vx) > 4) fish.facing = fish.vx > 0 ? 1 : -1;
    const targetTilt = Math.max(-0.35, Math.min(0.35, fish.vy * 0.004));
    fish.tilt += (targetTilt - fish.tilt) * Math.min(1, dt * 3);
  }

  function mouthOpen() {
    // Opens for a short puff every ~6 seconds
    const phase = (t % 6) / 6;
    if (phase > 0.9) return Math.sin(((phase - 0.9) / 0.1) * Math.PI);
    return 0;
  }

  function updateBubbles(dt) {
    // Emit from the mouth while it's open
    const open = mouthOpen();
    if (open > 0.5 && t > nextBubbleAt) {
      const m = mouthPos();
      for (let i = 0; i < 2; i++) {
        bubbles.push({ x: m.x + rand(-2, 2), y: m.y + rand(-2, 2), r: rand(R * 0.08, R * 0.22), vy: rand(-30, -55), ph: rand(0, 6.28), life: 0 });
      }
      nextBubbleAt = t + 0.35;
    }
    // Ambient bubbles from the sand
    if (Math.random() < dt * 0.6) {
      bubbles.push({ x: rand(0, W), y: H * 0.92, r: rand(1, 2.5), vy: rand(-35, -60), ph: rand(0, 6.28), life: 0 });
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.life += dt;
      b.y += b.vy * dt;
      b.vy -= dt * 4;  // slight acceleration as they rise
      b.x += Math.sin(t * 2 + b.ph) * 8 * dt;
      if (b.y < -20) bubbles.splice(i, 1);
    }
    if (bubbles.length > 260) bubbles.splice(0, bubbles.length - 260);
  }

  function mouthPos() {
    // Local mouth at (0.98R, 0.05R), converted to world with facing and tilt
    const lx = R * 0.98 * fish.facing;
    const ly = R * 0.05;
    const c = Math.cos(fish.tilt), s = Math.sin(fish.tilt);
    return { x: fish.x + lx * c - ly * s, y: fish.y + lx * s + ly * c };
  }

  // ---------- Draw ----------

  function drawBackground() {
    ctx.drawImage(bg, 0, 0, W, H);
  }

  function drawRays() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const r of rays) {
      const a = 0.04 + 0.03 * Math.sin(t * r.sp * 2 + r.ph);
      const topX = r.x;
      const botX = r.x + r.lean * H;
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.85);
      g.addColorStop(0, `rgba(190,255,245,${a * 1.6})`);
      g.addColorStop(1, 'rgba(190,255,245,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(topX - r.w * 0.2, 0);
      ctx.lineTo(topX + r.w * 0.2, 0);
      ctx.lineTo(botX + r.w * 0.6, H * 0.85);
      ctx.lineTo(botX - r.w * 0.6, H * 0.85);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCaustics() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#bff7ee';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const y0 = H * (0.5 + i * 0.09);
      for (let x = 0; x <= W; x += 10) {
        const y = y0 + Math.sin(x * 0.02 + t * 0.9 + i) * 6 + Math.sin(x * 0.047 - t * 1.3 + i * 2) * 3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlants() {
    for (const p of plants) {
      const baseY = H * 0.88;
      ctx.save();
      if (p.hue === 'kelp') {
        ctx.strokeStyle = 'rgba(40,140,90,0.9)';
        ctx.lineWidth = p.w * 0.35;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
          const f = i / steps;
          const y = baseY - f * p.h;
          const x = p.x + Math.sin(t * p.sp + p.ph + f * 2.5) * (p.w * 2.2) * f;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // leaf blades
        ctx.fillStyle = 'rgba(70,190,120,0.7)';
        for (let i = 3; i < steps; i += 4) {
          const f = i / steps;
          const y = baseY - f * p.h;
          const x = p.x + Math.sin(t * p.sp + p.ph + f * 2.5) * (p.w * 2.2) * f;
          const side = i % 8 < 4 ? 1 : -1;
          ctx.beginPath();
          ctx.ellipse(x + side * p.w * 0.9, y, p.w * 0.9, p.w * 0.3, side * 0.5 + Math.sin(t + i) * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Frond: a fan of swaying lines
        const h = p.h * 0.55;
        for (let k = -3; k <= 3; k++) {
          ctx.strokeStyle = `rgba(230,120,140,${0.55 - Math.abs(k) * 0.05})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(p.x, baseY);
          const sway = Math.sin(t * p.sp + p.ph) * 14;
          ctx.quadraticCurveTo(p.x + k * 10 + sway * 0.4, baseY - h * 0.6, p.x + k * 22 + sway, baseY - h);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  function drawPebbles() {
    ctx.save();
    for (const p of pebbles) {
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 1.3, p.r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBubbles() {
    ctx.save();
    for (const b of bubbles) {
      const alpha = Math.min(1, b.life * 4) * Math.max(0.2, Math.min(1, b.y / (H * 0.5)));
      ctx.strokeStyle = `rgba(220,255,255,${0.55 * alpha})`;
      ctx.fillStyle = `rgba(200,250,255,${0.08 * alpha})`;
      ctx.lineWidth = Math.max(0.8, b.r * 0.22);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // specular highlight
      ctx.fillStyle = `rgba(255,255,255,${0.6 * alpha})`;
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFish() {
    const f = fish;
    const open = mouthOpen();
    const flutter = Math.sin(t * 9);
    const breathe = 1 + Math.sin(t * 2.2) * 0.025;
    const lureGlow = 0.6 + 0.4 * Math.sin(t * 3.1) * Math.sin(t * 7.3);

    // Eye direction: toward pointer when recently moved, else toward travel
    let ex = Math.sign(f.vx || 1), ey = 0;
    if (mouseActive && performance.now() - lastMouse < 4000) {
      const dx = mx - f.x, dy = my - f.y;
      const d = Math.hypot(dx, dy) || 1;
      ex = dx / d; ey = dy / d;
    } else {
      const d = Math.hypot(f.vx, f.vy) || 1;
      ex = (f.vx / d) * 0.6; ey = (f.vy / d) * 0.6;
    }

    // Blink every ~4.5 seconds
    const bt = t % 4.5;
    const blink = bt > 4.3 ? Math.max(0.1, Math.abs(bt - 4.4) / 0.1) : 1;

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.tilt);
    ctx.scale(f.facing, 1);

    // Soft glow around the body
    const glow = ctx.createRadialGradient(0, 0, R * 0.6, 0, 0, R * 2.6);
    glow.addColorStop(0, 'rgba(150,255,235,0.18)');
    glow.addColorStop(1, 'rgba(150,255,235,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, R * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Tail fan
    const tailWag = Math.sin(t * 5) * R * 0.25;
    ctx.fillStyle = 'rgba(255,170,190,0.75)';
    ctx.beginPath();
    ctx.moveTo(-R * 0.75, 0);
    ctx.quadraticCurveTo(-R * 1.3, -R * 0.55 + tailWag, -R * 1.6, -R * 0.65 + tailWag);
    ctx.quadraticCurveTo(-R * 1.25, 0, -R * 1.6, R * 0.65 - tailWag);
    ctx.quadraticCurveTo(-R * 1.3, R * 0.55 - tailWag, -R * 0.75, 0);
    ctx.fill();

    // Lure stalk and bulb (anglerfish-style, drawn behind body)
    ctx.strokeStyle = 'rgba(255,240,200,0.8)';
    ctx.lineWidth = Math.max(1, R * 0.07);
    ctx.beginPath();
    ctx.moveTo(R * 0.55, -R * 0.75);
    ctx.quadraticCurveTo(R * 0.9, -R * 1.25 + Math.sin(t * 2) * R * 0.1, R * 1.3, -R * 1.45);
    ctx.stroke();
    const bulbX = R * 1.3, bulbY = -R * 1.45;
    const lg = ctx.createRadialGradient(bulbX, bulbY, 0, bulbX, bulbY, R * 0.9);
    lg.addColorStop(0, `rgba(255,255,220,${0.95 * lureGlow})`);
    lg.addColorStop(0.35, `rgba(120,255,230,${0.55 * lureGlow})`);
    lg.addColorStop(1, 'rgba(120,255,230,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, R * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,235,${0.9 + 0.1 * lureGlow})`;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, R * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Dorsal fin (waving)
    ctx.fillStyle = 'rgba(200,170,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(-R * 0.35, -R * 0.82);
    ctx.quadraticCurveTo(-R * 0.6, -R * 1.25 + flutter * R * 0.08, -R * 0.95, -R * 1.1 + flutter * R * 0.1);
    ctx.quadraticCurveTo(-R * 0.75, -R * 0.9, -R * 0.55, -R * 0.7);
    ctx.fill();

    // Body
    ctx.save();
    ctx.scale(breathe, breathe);
    const rx = R, ry = R * 0.9;
    // spines
    ctx.strokeStyle = 'rgba(120,80,40,0.55)';
    ctx.lineWidth = Math.max(0.8, R * 0.05);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + 0.1;
      const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
      const nx = Math.cos(a), ny = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + nx * R * 0.18, py + ny * R * 0.18);
      ctx.stroke();
    }
    const bodyG = ctx.createRadialGradient(-R * 0.3, -R * 0.4, R * 0.1, 0, 0, R * 1.1);
    bodyG.addColorStop(0, '#fff6c9');
    bodyG.addColorStop(0.6, '#f2dc8a');
    bodyG.addColorStop(1, '#c9a862');
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots
    ctx.fillStyle = 'rgba(214,110,90,0.55)';
    const spots = [[-0.3, 0.2, 0.12], [0.1, -0.35, 0.09], [-0.55, -0.1, 0.08], [0.25, 0.45, 0.1], [-0.1, 0.5, 0.07]];
    for (const [sx, sy, sr] of spots) {
      ctx.beginPath();
      ctx.arc(sx * R, sy * R, sr * R, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pectoral fin (flapping)
    ctx.fillStyle = 'rgba(255,220,240,0.65)';
    ctx.save();
    ctx.translate(R * 0.2, R * 0.35);
    ctx.rotate(0.5 + flutter * 0.35);
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.42, R * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eye
    const eyeX = R * 0.42, eyeY = -R * 0.18;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, R * 0.24, R * 0.24 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,20,0.5)';
    ctx.lineWidth = Math.max(0.8, R * 0.04);
    ctx.stroke();
    if (blink > 0.3) {
      const pl = Math.hypot(ex, ey) || 1;
      const px = eyeX + (ex / pl) * R * 0.09;
      const py = eyeY + (ey / pl) * R * 0.09;
      ctx.fillStyle = '#1b1a2e';
      ctx.beginPath();
      ctx.arc(px, py, R * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(px - R * 0.04, py - R * 0.05, R * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth: small round opening that puffs bubbles
    const mx0 = R * 0.98, my0 = R * 0.05;
    ctx.fillStyle = '#6b2f2a';
    ctx.beginPath();
    ctx.ellipse(mx0, my0, R * (0.05 + 0.1 * open), R * (0.04 + 0.12 * open), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // body scale

    ctx.restore(); // fish transform
  }

  // ---------- Loop ----------

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;

    updateFish(dt);
    updateBubbles(dt);

    drawBackground();
    drawRays();
    drawCaustics();
    drawPebbles();
    drawPlants();
    drawFish();
    drawBubbles();

    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    mouseActive = true;
    lastMouse = performance.now();
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(t0 => { last = t0; requestAnimationFrame(frame); });
})();
</script>
</body>
</html>
```

```json
{
  "title": "Wibbly-Wobble Lanternpuff",
  "statement": "This round, butter-colored puffer drifts through the shallows with a glowing lure bobbing above its head, blowing little bubbles that rise toward the light. It is known to wobble with great enthusiasm and to stare curiously at anything that moves nearby."
}
```