```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tarot Fairy</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #08101f;
  }
  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
    touch-action: pan-y;
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

let mx = 0.5, my = 0.45, smx = 0.5, smy = 0.45;
window.addEventListener('pointermove', e => {
  mx = e.clientX / Math.max(1, W);
  my = e.clientY / Math.max(1, H);
});

const snow = [];
for (let i = 0; i < 85; i++) {
  snow.push({
    x: Math.random(), y: Math.random(),
    r: 0.7 + Math.random() * 2.1,
    s: 0.12 + Math.random() * 0.38,
    ph: Math.random() * Math.PI * 2,
    drift: 0.2 + Math.random() * 0.8
  });
}
const stars = [];
for (let i = 0; i < 70; i++) {
  stars.push({ x: Math.random(), y: Math.random() * 0.52, r: Math.random() * 1.4 + 0.3, ph: Math.random() * 7 });
}
const sparkles = [];
for (let i = 0; i < 36; i++) {
  sparkles.push({ x: Math.random(), y: Math.random(), ph: Math.random() * 7, s: 0.5 + Math.random() });
}

function lerp(a, b, t){ return a + (b - a) * t; }

function drawCrystal(x, y, size, angle, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = `rgba(230,248,255,${alpha})`;
  ctx.lineWidth = Math.max(0.6, size * 0.12);
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size);
    ctx.moveTo(0, -size * 0.55);
    ctx.lineTo(size * 0.28, -size * 0.78);
    ctx.moveTo(0, -size * 0.55);
    ctx.lineTo(-size * 0.28, -size * 0.78);
    ctx.stroke();
  }
  ctx.restore();
}

function wing(cx, cy, len, wid, angle, flap, upper) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + flap);
  const g = ctx.createLinearGradient(0, 0, -len, 0);
  g.addColorStop(0, 'rgba(210,242,255,0.55)');
  g.addColorStop(0.55, 'rgba(140,205,245,0.26)');
  g.addColorStop(1, 'rgba(235,250,255,0.06)');
  ctx.fillStyle = g;
  ctx.strokeStyle = 'rgba(225,248,255,0.75)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-len * 0.35, -wid, -len * 0.92, -wid * 0.72, -len, 0);
  ctx.bezierCurveTo(-len * 0.75, wid * (upper ? 0.55 : 0.42), -len * 0.3, wid * 0.35, 0, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(235,250,255,0.35)';
  ctx.lineWidth = 0.7;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-4, 1);
    ctx.quadraticCurveTo(-len * 0.45 * i / 2, -wid * 0.28, -len * (0.32 + i * 0.18), -wid * 0.12 + i * 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFern(vw, vh, t, frost) {
  const bx = vw * 0.76;
  const by = vh * 0.92;
  // soft shadow
  ctx.fillStyle = 'rgba(3,10,20,0.35)';
  ctx.beginPath(); ctx.ellipse(bx, by + 6, 78, 13, 0, 0, Math.PI * 2); ctx.fill();

  const stems = [
    { a: -0.22, l: 150, bend: -18 },
    { a: 0.05, l: 178, bend: 4 },
    { a: 0.34, l: 138, bend: 24 },
    { a: -0.48, l: 105, bend: -30 }
  ];
  stems.forEach((st, si) => {
    const tipX = bx + Math.sin(st.a) * st.l + st.bend;
    const tipY = by - Math.cos(st.a) * st.l;
    const midX = bx + Math.sin(st.a) * st.l * 0.5 + st.bend * 0.35;
    const midY = by - Math.cos(st.a) * st.l * 0.55;
    ctx.strokeStyle = si % 2 ? '#2f7f6d' : '#256f62';
    ctx.lineWidth = 3.2 - si * 0.3;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(midX, midY, tipX, tipY); ctx.stroke();

    const leaves = 9;
    for (let i = 2; i < leaves; i++) {
      const p = i / leaves;
      const px = lerp(lerp(bx, midX, p), lerp(midX, tipX, p), p);
      const py = lerp(lerp(by, midY, p), lerp(midY, tipY, p), p);
      const sz = (1 - p) * 34 + 7;
      const sway = Math.sin(t * 0.9 + si + i * 0.4) * 2;
      for (let side of [-1, 1]) {
        const ex = px + side * sz + sway;
        const ey = py - sz * 0.28 + Math.abs(side) * 2;
        const leafGrad = ctx.createLinearGradient(px, py, ex, ey);
        leafGrad.addColorStop(0, '#2d8a72');
        leafGrad.addColorStop(1, `rgba(210,242,235,${0.25 + frost * 0.55})`);
        ctx.strokeStyle = leafGrad;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + side * sz * 0.55, py - sz * 0.42, ex, ey); ctx.stroke();
        if (frost > 0.35 && (i + si) % 2 === 0) {
          ctx.fillStyle = `rgba(235,250,255,${(frost - 0.3) * 0.9})`;
          ctx.beginPath(); ctx.arc(ex, ey, 1.8 + frost * 1.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    drawCrystal(tipX, tipY, 7 + frost * 7 + Math.sin(t + si) * 1.2, t * 0.08 + si, 0.35 + frost * 0.55);
  });

  // frost creeping on the ground toward the fern
  ctx.strokeStyle = `rgba(220,245,255,${0.25 + frost * 0.4})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const yy = by - 4 + i * 3;
    ctx.beginPath();
    ctx.moveTo(bx - 76 + i * 6, yy);
    ctx.lineTo(bx - 30 + Math.sin(i * 2.1) * 8, yy - 3);
    ctx.lineTo(bx + 8, yy + 1);
    ctx.stroke();
  }
}

function frame(now) {
  const t = now * 0.001;
  smx = lerp(smx, mx, 0.04);
  smy = lerp(smy, my, 0.04);
  const lookX = (smx - 0.5) * 14;
  const lookY = (smy - 0.5) * 8;

  // virtual portrait space, cover-fit
  const vw = 400, vh = 600;
  const scale = Math.max(W / vw, H / vh);
  const ox = (W - vw * scale) / 2;
  const oy = (H - vh * scale) / 2;

  // night sky in screen space
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#070d24');
  sky.addColorStop(0.42, '#12294a');
  sky.addColorStop(0.72, '#1d4a5e');
  sky.addColorStop(1, '#b9d9de');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // stars
  stars.forEach(s => {
    const a = 0.25 + 0.65 * Math.abs(Math.sin(t * 0.7 + s.ph));
    ctx.fillStyle = `rgba(230,244,255,${a})`;
    ctx.beginPath(); ctx.arc(s.x * vw, s.y * vh, s.r, 0, Math.PI * 2); ctx.fill();
  });

  // moon
  const moonX = vw * 0.82 + lookX * 0.25, moonY = vh * 0.15;
  const glow = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 92);
  glow.addColorStop(0, 'rgba(230,246,255,0.55)');
  glow.addColorStop(1, 'rgba(230,246,255,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(moonX, moonY, 92, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#eef8ff';
  ctx.beginPath(); ctx.arc(moonX, moonY, 27, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#12294a';
  ctx.beginPath(); ctx.arc(moonX + 11, moonY - 7, 23, 0, Math.PI * 2); ctx.fill();

  // distant pines / hills
  ctx.fillStyle = '#0e2b3f';
  ctx.beginPath();
  ctx.moveTo(0, 438);
  for (let x = 0; x <= vw; x += 20) ctx.lineTo(x, 420 + Math.sin(x * 0.045) * 16 - (x % 60 === 0 ? 18 : 0));
  ctx.lineTo(vw, vh); ctx.lineTo(0, vh); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8f4f6';
  ctx.beginPath();
  ctx.moveTo(0, 492); ctx.quadraticCurveTo(vw * 0.3, 462, vw * 0.58, 488);
  ctx.quadraticCurveTo(vw * 0.82, 506, vw, 482); ctx.lineTo(vw, vh); ctx.lineTo(0, vh); ctx.closePath(); ctx.fill();

  // ground sparkles
  sparkles.forEach(s => {
    const a = 0.18 + 0.5 * Math.abs(Math.sin(t * 1.4 + s.ph));
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath(); ctx.arc(s.x * vw, 495 + s.y * 92, s.s, 0, Math.PI * 2); ctx.fill();
  });

  const frost = 0.58 + 0.42 * Math.sin(t * 0.45);
  drawFern(vw, vh, t, frost);

  // ---- Fairy ----
  const bob = Math.sin(t * 1.15) * 7;
  const fx = vw * 0.40 + Math.sin(t * 0.5) * 4 + lookX * 0.35;
  const fy = vh * 0.46 + bob;
  const flap = Math.sin(t * 7.2) * 0.34;
  const flap2 = Math.sin(t * 7.2 + 0.5) * 0.28;

  // aura
  const aura = ctx.createRadialGradient(fx, fy, 5, fx, fy, 118);
  aura.addColorStop(0, 'rgba(170,225,255,0.34)');
  aura.addColorStop(0.6, 'rgba(140,200,240,0.10)');
  aura.addColorStop(1, 'rgba(140,200,240,0)');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(fx, fy, 118, 0, Math.PI * 2); ctx.fill();

  // wings (behind body, both sides suggested by depth)
  ctx.save(); ctx.translate(fx, fy - 24); ctx.scale(-1, 1); wing(0, 0, 76, 48, -0.55, -flap * 0.7, true); ctx.restore();
  wing(fx - 4, fy - 26, 104, 62, -0.62, flap, true);
  wing(fx - 3, fy - 5, 78, 38, 0.42, -flap2, false);

  // flowing hair behind
  ctx.fillStyle = '#cfe8f5';
  ctx.beginPath();
  ctx.moveTo(fx - 17, fy - 62);
  ctx.bezierCurveTo(fx - 38, fy - 20, fx - 28 + Math.sin(t * 1.6) * 6, fy + 42, fx - 20 + Math.sin(t * 1.3) * 8, fy + 82);
  ctx.bezierCurveTo(fx - 8, fy + 55, fx - 6, fy + 20, fx - 4, fy - 30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a9cade';
  ctx.beginPath();
  ctx.moveTo(fx + 12, fy - 60);
  ctx.bezierCurveTo(fx + 30, fy - 18, fx + 24 + Math.sin(t * 1.4 + 2) * 6, fy + 34, fx + 18, fy + 68);
  ctx.bezierCurveTo(fx + 8, fy + 30, fx + 7, fy - 15, fx + 5, fy - 45);
  ctx.closePath(); ctx.fill();

  // legs
  const legSwing = Math.sin(t * 1.15) * 5;
  ctx.strokeStyle = '#f2d7c8'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(fx - 6, fy + 43); ctx.quadraticCurveTo(fx - 10, fy + 76, fx - 14 + legSwing, fy + 101); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fx + 7, fy + 43); ctx.quadraticCurveTo(fx + 13, fy + 72, fx + 20 - legSwing, fy + 96); ctx.stroke();
  // ice slippers
  ctx.fillStyle = '#dff5ff';
  ctx.beginPath(); ctx.ellipse(fx - 15 + legSwing, fy + 103, 7, 3.5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(fx + 21 - legSwing, fy + 98, 7, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();

  // dress
  const dress = ctx.createLinearGradient(fx, fy - 38, fx, fy + 52);
  dress.addColorStop(0, '#eaf9ff');
  dress.addColorStop(0.35, '#7fc6dd');
  dress.addColorStop(1, '#2d7f9e');
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(fx - 13, fy - 36);
  ctx.quadraticCurveTo(fx, fy - 43, fx + 14, fy - 36);
  ctx.quadraticCurveTo(fx + 20, fy + 4, fx + 25, fy + 34);
  // icicle hem
  const hem = [[25,34],[17,52],[10,36],[3,56],[-4,38],[-11,54],[-18,36],[-25,46]];
  hem.forEach(p => ctx.lineTo(fx + p[0], fy + p[1]));
  ctx.quadraticCurveTo(fx - 20, fy + 2, fx - 13, fy - 36);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 1; ctx.stroke();
  // sash sparkle
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(fx + 2, fy - 12 + Math.sin(t * 2) * 1.5, 2.2, 0, Math.PI * 2); ctx.fill();

  // arms
  const armR = Math.sin(t * 1.1) * 0.12;
  ctx.strokeStyle = '#f2d7c8'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(fx + 12, fy - 30); ctx.quadraticCurveTo(fx + 34, fy - 22 + armR * 18, fx + 47, fy - 4 + Math.sin(t * 1.5) * 3); ctx.stroke(); // reaching toward fern
  ctx.beginPath(); ctx.moveTo(fx - 12, fy - 30); ctx.quadraticCurveTo(fx - 30, fy - 12, fx - 36, fy + 10 + Math.sin(t * 1.2) * 3); ctx.stroke();
  // frost magic from reaching hand
  const hx = fx + 47, hy = fy - 4 + Math.sin(t * 1.5) * 3;
  for (let i = 0; i < 5; i++) {
    const p = ((t * 0.45 + i / 5) % 1);
    const px = hx + p * 58 + Math.sin(p * 9 + i) * 5;
    const py = hy + p * 34 + Math.cos(p * 7 + i) * 4;
    ctx.fillStyle = `rgba(225,248,255,${(1 - p) * 0.9})`;
    ctx.beginPath(); ctx.arc(px, py, 2.4 * (1 - p) + 0.6, 0, Math.PI * 2); ctx.fill();
  }
  drawCrystal(hx + 4, hy - 4, 6 + Math.sin(t * 3) * 1.5, t * 0.6, 0.8);

  // head — slow turn via shifting features
  const headTilt = Math.sin(t * 0.45) * 0.07 + (smx - 0.5) * 0.08;
  ctx.save();
  ctx.translate(fx, fy - 55);
  ctx.rotate(headTilt);
  ctx.fillStyle = '#f7e3d3';
  ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
  // ears
  ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(-24, -8); ctx.lineTo(-15, 5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(16, -2); ctx.lineTo(24, -8); ctx.lineTo(15, 5); ctx.closePath(); ctx.fill();
  // hair cap & fringe
  ctx.fillStyle = '#e6f3fa';
  ctx.beginPath(); ctx.arc(0, -4, 18, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(10, -10, 6, -1); ctx.quadraticCurveTo(0, -7, -7, -1); ctx.quadraticCurveTo(-12, -9, -18, -3); ctx.closePath(); ctx.fill();
  // ice crown
  ctx.fillStyle = 'rgba(205,240,255,0.95)'; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.7;
  [[-11,-17,8],[-4,-21,13],[4,-22,15],[11,-18,9]].forEach(c => {
    ctx.beginPath(); ctx.moveTo(c[0]-3, c[1]+6); ctx.lineTo(c[0], c[1]-c[2]+6); ctx.lineTo(c[0]+3, c[1]+6); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  // face
  const fxOff = Math.sin(t * 0.45) * 2.2 + lookX * 0.28;
  const blink = Math.sin(t * 0.9) > 0.985 ? 0.15 : 1;
  ctx.fillStyle = '#20344d';
  ctx.beginPath(); ctx.ellipse(-6 + fxOff, 1, 1.9, 2.4 * blink, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6 + fxOff, 1, 1.9, 2.4 * blink, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,170,175,0.55)';
  ctx.beginPath(); ctx.ellipse(-9 + fxOff, 6, 3.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9 + fxOff, 6, 3.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a85f5f'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.arc(1 + fxOff, 6, 3, 0.25, Math.PI - 0.6); ctx.stroke();
  ctx.restore();

  // breath mist
  const breathP = (t * 0.28) % 1;
  ctx.fillStyle = `rgba(235,250,255,${(1 - breathP) * 0.20})`;
  ctx.beginPath(); ctx.ellipse(fx + 20 + breathP * 30, fy - 48 + breathP * 6, 6 + breathP * 13, 3 + breathP * 5, 0, 0, Math.PI * 2); ctx.fill();

  // falling snow in virtual space
  snow.forEach(s => {
    s.y += s.s * 0.0016;
    s.x += Math.sin(t * s.drift + s.ph) * 0.00035;
    if (s.y > 1.02) { s.y = -0.02; s.x = Math.random(); }
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.beginPath(); ctx.arc(s.x * vw, s.y * vh, s.r, 0, Math.PI * 2); ctx.fill();
  });

  // foreground crystals bottom-left
  drawCrystal(38, 556, 13, t * 0.05, 0.55);
  drawCrystal(66, 572, 8, -t * 0.04, 0.45);
  drawCrystal(332, 560, 9, t * 0.06, 0.4);

  // vignette
  const vig = ctx.createRadialGradient(vw/2, vh/2, vh*0.28, vw/2, vh/2, vh*0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(2,6,18,0.48)');
  ctx.fillStyle = vig; ctx.fillRect(0, 0, vw, vh);

  ctx.restore();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script>
</body>
</html>
```

```json
{
  "title": "The Fairy of First Frost",
  "statement": "Cold arrives gently; endings reveal the beauty hidden in letting go."
}
```