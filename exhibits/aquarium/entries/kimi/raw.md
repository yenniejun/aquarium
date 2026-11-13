```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Glimmering Glassjelly</title>
<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #031923;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="tank" role="img" aria-label="A luminous glass jellyfish drifting through a quiet moonlit aquarium"></canvas>
<script>
(() => {
  const canvas = document.getElementById("tank");
  const ctx = canvas.getContext("2d", { alpha: false });
  let W = 1, H = 1, D = 1;
  let jellyX = 0, jellyY = 0, previousX = 0;
  let pointerX = 0, pointerY = 0, pointerTime = -10000, pointerStrength = 0;

  function randomGenerator(seed) {
    return () => {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
      n = n + Math.imul(n ^ n >>> 7, 61 | n) ^ n;
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }

  const rnd = randomGenerator(74291);
  const motes = Array.from({ length: 54 }, () => ({
    x: rnd(),
    y: rnd(),
    r: 0.35 + rnd() * 1.25,
    speed: 0.0015 + rnd() * 0.005,
    phase: rnd() * Math.PI * 2,
    glow: rnd()
  }));

  const sand = Array.from({ length: 75 }, () => ({
    x: rnd(),
    y: 0.885 + rnd() * 0.115,
    r: 0.3 + rnd() * 1.15,
    a: 0.04 + rnd() * 0.12
  }));

  const bellSpecks = Array.from({ length: 17 }, () => ({
    x: (rnd() - 0.5) * 125,
    y: -76 + rnd() * 69,
    r: 0.55 + rnd() * 1.15,
    phase: rnd() * Math.PI * 2
  }));

  function resize() {
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);
    D = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * D);
    canvas.height = Math.round(H * D);
    ctx.setTransform(D, 0, 0, D, 0, 0);
    jellyX = previousX = W * 0.5;
    jellyY = H * 0.4;
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", e => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    pointerTime = performance.now();
  }, { passive: true });

  function background(t) {
    const water = ctx.createLinearGradient(0, 0, 0, H);
    water.addColorStop(0, "#073849");
    water.addColorStop(0.42, "#062b3b");
    water.addColorStop(1, "#031824");
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, W, H);

    const moon = ctx.createRadialGradient(W * 0.28, -H * 0.06, 0, W * 0.28, 0, H * 0.9);
    moon.addColorStop(0, "rgba(121,230,213,0.22)");
    moon.addColorStop(0.42, "rgba(43,151,153,0.075)");
    moon.addColorStop(1, "rgba(0,25,40,0)");
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i++) {
      const sway = Math.sin(t * 0.12 + i * 1.9) * W * 0.025;
      const top = W * (0.08 + i * 0.17) + sway;
      const ray = ctx.createLinearGradient(0, 0, 0, H * 0.9);
      ray.addColorStop(0, "rgba(118,225,207,0.055)");
      ray.addColorStop(0.65, "rgba(74,181,177,0.018)");
      ray.addColorStop(1, "rgba(74,181,177,0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(top, 0);
      ctx.lineTo(top + W * 0.075, 0);
      ctx.lineTo(top + W * 0.24, H * 0.88);
      ctx.lineTo(top + W * 0.08, H * 0.88);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(138,238,221,0.055)";
    ctx.lineWidth = Math.max(0.5, H * 0.0012);
    for (let i = 0; i < 7; i++) {
      const y = H * (0.055 + i * 0.032);
      ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 18) {
        const yy = y + Math.sin(x * 0.018 + t * 0.45 + i) * 3;
        if (x === -20) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();

    const distant = ctx.createLinearGradient(0, H * 0.66, 0, H);
    distant.addColorStop(0, "rgba(6,39,48,0)");
    distant.addColorStop(1, "rgba(2,19,28,0.8)");
    ctx.fillStyle = distant;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.79);
    ctx.bezierCurveTo(W * 0.15, H * 0.72, W * 0.2, H * 0.84, W * 0.36, H * 0.79);
    ctx.bezierCurveTo(W * 0.55, H * 0.71, W * 0.64, H * 0.83, W * 0.79, H * 0.77);
    ctx.bezierCurveTo(W * 0.9, H * 0.73, W * 0.96, H * 0.78, W, H * 0.75);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
  }

  function seaFloor(t) {
    const floor = ctx.createLinearGradient(0, H * 0.82, 0, H);
    floor.addColorStop(0, "#16454a");
    floor.addColorStop(0.3, "#123a3e");
    floor.addColorStop(1, "#09282f");
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.89);
    ctx.bezierCurveTo(W * 0.2, H * 0.84, W * 0.36, H * 0.92, W * 0.55, H * 0.875);
    ctx.bezierCurveTo(W * 0.75, H * 0.835, W * 0.88, H * 0.88, W, H * 0.855);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    const pool = ctx.createRadialGradient(W * 0.51, H * 0.89, 0, W * 0.51, H * 0.9, W * 0.34);
    pool.addColorStop(0, "rgba(90,162,143,0.12)");
    pool.addColorStop(1, "rgba(26,75,73,0)");
    ctx.fillStyle = pool;
    ctx.fillRect(0, H * 0.78, W, H * 0.22);

    ctx.save();
    for (const p of sand) {
      ctx.fillStyle = `rgba(174,205,166,${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(107,197,174,0.055)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = H * (0.9 + i * 0.016);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 22) {
        const yy = y + Math.sin(x * 0.021 + i * 1.7 + t * 0.15) * 3;
        if (!x) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function plant(x, baseY, height, seed, t, front) {
    const blades = front ? 5 : 7;
    for (let b = 0; b < blades; b++) {
      const h = height * (0.52 + ((b * 37 + seed * 11) % 53) / 100);
      const startX = x + (b - (blades - 1) / 2) * height * 0.025;
      const lean = (b - (blades - 1) / 2) * height * 0.055;
      const points = [];
      const segments = 12;
      for (let k = 0; k <= segments; k++) {
        const f = k / segments;
        const wave = Math.sin(t * (0.42 + b * 0.013) + seed + b * 0.7 + f * 2.3);
        points.push({
          x: startX + lean * f + wave * height * 0.052 * f * f,
          y: baseY - h * f,
          w: (Math.sin(Math.PI * Math.min(0.96, f + 0.04)) * height * 0.014 + 0.45) * (front ? 1.1 : 0.85)
        });
      }
      ctx.beginPath();
      ctx.moveTo(points[0].x - points[0].w, points[0].y);
      for (let k = 1; k < points.length; k++) ctx.lineTo(points[k].x - points[k].w, points[k].y);
      for (let k = points.length - 1; k >= 0; k--) ctx.lineTo(points[k].x + points[k].w, points[k].y);
      ctx.closePath();
      ctx.fillStyle = front
        ? `rgba(24,105,91,${0.45 + b * 0.035})`
        : `rgba(20,91,83,${0.3 + b * 0.025})`;
      ctx.fill();
      ctx.strokeStyle = front ? "rgba(87,159,124,0.16)" : "rgba(74,151,128,0.1)";
      ctx.lineWidth = 0.65;
      ctx.stroke();
    }
  }

  function rock(x, y, rx, ry, shade) {
    const g = ctx.createRadialGradient(x - rx * 0.35, y - ry * 0.6, 0, x, y, rx * 1.1);
    g.addColorStop(0, shade ? "#38615b" : "#294e4e");
    g.addColorStop(0.6, "#173b3e");
    g.addColorStop(1, "#0a292f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - rx, y);
    ctx.bezierCurveTo(x - rx * 0.94, y - ry * 0.72, x - rx * 0.42, y - ry, x, y - ry * 0.9);
    ctx.bezierCurveTo(x + rx * 0.56, y - ry * 1.06, x + rx, y - ry * 0.54, x + rx, y);
    ctx.quadraticCurveTo(x, y + ry * 0.2, x - rx, y);
    ctx.fill();
    ctx.strokeStyle = "rgba(128,175,150,0.09)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawMotes(t, foreground) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = foreground ? 1 : 0; i < motes.length; i += 2) {
      const p = motes[i];
      const y = ((p.y - t * p.speed) % 1 + 1) % 1;
      const x = p.x + Math.sin(t * 0.2 + p.phase + y * 5) * 0.013;
      const alpha = (0.1 + 0.25 * (0.5 + 0.5 * Math.sin(t * 0.7 + p.phase))) * (0.5 + p.glow * 0.5);
      ctx.fillStyle = p.glow > 0.75
        ? `rgba(201,238,172,${alpha})`
        : `rgba(132,218,211,${alpha})`;
      ctx.beginPath();
      ctx.arc(x * W, y * H, p.r * (foreground ? 1.25 : 0.8), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function ribbon(anchor, length, phase, t, hue) {
    const left = [], right = [];
    const count = 18;
    for (let k = 0; k <= count; k++) {
      const f = k / count;
      const y = 10 + length * f;
      const wave = Math.sin(t * 0.75 + phase + f * 5.2) * (3 + 15 * f);
      const curl = Math.sin(t * 0.38 + phase * 1.8 + f * 8) * 5 * f;
      const x = anchor + wave + curl;
      const width = (8.5 * (1 - f) + 1.2) * (0.85 + 0.15 * Math.sin(f * 10 + t + phase));
      left.push([x - width, y]);
      right.push([x + width, y]);
    }
    const g = ctx.createLinearGradient(0, 10, 0, length + 10);
    g.addColorStop(0, hue === 0 ? "rgba(210,177,229,0.26)" : "rgba(150,226,218,0.23)");
    g.addColorStop(0.65, hue === 0 ? "rgba(170,132,207,0.13)" : "rgba(94,188,190,0.12)");
    g.addColorStop(1, "rgba(93,159,184,0.015)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let k = 1; k < left.length; k++) ctx.lineTo(left[k][0], left[k][1]);
    for (let k = right.length - 1; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1]);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hue === 0 ? "rgba(226,196,236,0.18)" : "rgba(177,236,225,0.16)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function jellyfish(x, y, u, t, tilt) {
    const pulseWave = 0.5 + 0.5 * Math.sin(t * 1.65);
    const pulse = pulseWave * pulseWave * (3 - 2 * pulseWave);
    const squeeze = 1 - pulse * 0.075;
    const stretch = 1 + pulse * 0.095;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(u, u);

    const aura = ctx.createRadialGradient(0, -24, 8, 0, -12, 142);
    aura.addColorStop(0, "rgba(142,231,217,0.16)");
    aura.addColorStop(0.45, "rgba(121,189,211,0.07)");
    aura.addColorStop(1, "rgba(73,143,176,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(-150, -160, 300, 320);

    for (let i = 0; i < 12; i++) {
      const anchor = -72 + i * 144 / 11;
      const phase = i * 1.73;
      const length = 105 + 47 * (0.5 + 0.5 * Math.sin(i * 2.17));
      const sway = Math.sin(t * 0.7 + phase) * 18 + Math.sin(t * 0.31 + i) * 8;
      const g = ctx.createLinearGradient(0, 8, 0, length);
      g.addColorStop(0, i % 3 === 0 ? "rgba(218,188,230,0.55)" : "rgba(160,230,224,0.48)");
      g.addColorStop(0.62, "rgba(121,193,205,0.22)");
      g.addColorStop(1, "rgba(105,175,195,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = i % 4 === 0 ? 1.35 : 0.8;
      ctx.beginPath();
      ctx.moveTo(anchor, 9);
      ctx.bezierCurveTo(
        anchor + sway * 0.12, length * 0.31,
        anchor - sway * 0.75, length * 0.65,
        anchor + sway, length
      );
      ctx.stroke();
    }

    ribbon(-42, 142, 0.2, t, 0);
    ribbon(-14, 163, 2.1, t, 1);
    ribbon(15, 154, 4.3, t, 0);
    ribbon(43, 132, 5.8, t, 1);

    ctx.save();
    ctx.scale(squeeze, stretch);

    const bell = ctx.createLinearGradient(-35, -96, 35, 28);
    bell.addColorStop(0, "rgba(207,255,241,0.48)");
    bell.addColorStop(0.32, "rgba(146,225,222,0.23)");
    bell.addColorStop(0.72, "rgba(116,176,207,0.19)");
    bell.addColorStop(1, "rgba(197,153,218,0.35)");

    ctx.beginPath();
    ctx.moveTo(-84, 5);
    ctx.bezierCurveTo(-84, -48, -48, -91, 0, -93);
    ctx.bezierCurveTo(48, -91, 84, -48, 84, 5);
    ctx.quadraticCurveTo(74, 20, 63, 9);
    ctx.quadraticCurveTo(52, 27, 42, 12);
    ctx.quadraticCurveTo(31, 29, 21, 14);
    ctx.quadraticCurveTo(10, 31, 0, 15);
    ctx.quadraticCurveTo(-10, 31, -21, 14);
    ctx.quadraticCurveTo(-31, 29, -42, 12);
    ctx.quadraticCurveTo(-52, 27, -63, 9);
    ctx.quadraticCurveTo(-74, 20, -84, 5);
    ctx.closePath();
    ctx.fillStyle = bell;
    ctx.shadowColor = "rgba(128,225,216,0.34)";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.save();
    ctx.clip();

    const inner = ctx.createRadialGradient(-18, -43, 3, 0, -25, 87);
    inner.addColorStop(0, "rgba(211,255,235,0.19)");
    inner.addColorStop(0.55, "rgba(103,192,200,0.035)");
    inner.addColorStop(1, "rgba(190,131,208,0.12)");
    ctx.fillStyle = inner;
    ctx.fillRect(-90, -100, 180, 140);

    ctx.strokeStyle = "rgba(195,243,231,0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const a = -70 + i * 17.5;
      ctx.beginPath();
      ctx.moveTo(0, -81);
      ctx.quadraticCurveTo(a * 0.3, -45, a, 9);
      ctx.stroke();
    }

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i++) {
      const ox = -31 + i * 20.5;
      const oy = -28 + Math.sin(i * 2.2) * 3;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate((i - 1.5) * 0.13);
      const organ = ctx.createRadialGradient(0, 0, 1, 0, 0, 15);
      organ.addColorStop(0, "rgba(255,188,181,0.08)");
      organ.addColorStop(0.65, "rgba(255,159,181,0.17)");
      organ.addColorStop(1, "rgba(255,153,194,0.03)");
      ctx.fillStyle = organ;
      ctx.strokeStyle = "rgba(255,188,194,0.62)";
      ctx.lineWidth = 2.6;
      ctx.shadowColor = "rgba(255,146,181,0.5)";
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-15, 9, -14, -12, -2, -13);
      ctx.bezierCurveTo(12, -14, 15, 6, 5, 11);
      ctx.bezierCurveTo(1, 7, -4, 6, 0, 12);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    for (const p of bellSpecks) {
      const alpha = 0.23 + 0.48 * (0.5 + 0.5 * Math.sin(t * 1.2 + p.phase));
      ctx.fillStyle = `rgba(242,236,174,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x + Math.sin(t * 0.35 + p.phase) * 2, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(197,247,235,0.56)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-84, 5);
    ctx.bezierCurveTo(-84, -48, -48, -91, 0, -93);
    ctx.bezierCurveTo(48, -91, 84, -48, 84, 5);
    ctx.stroke();

    ctx.strokeStyle = "rgba(225,192,232,0.48)";
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(-82, 6);
    ctx.quadraticCurveTo(0, 37, 82, 6);
    ctx.stroke();

    ctx.strokeStyle = "rgba(238,255,246,0.38)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-57, -48);
    ctx.bezierCurveTo(-48, -70, -28, -82, -10, -84);
    ctx.stroke();
    ctx.strokeStyle = "rgba(238,255,246,0.18)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-67, -29);
    ctx.quadraticCurveTo(-64, -39, -61, -43);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  function frame(ms) {
    const t = ms * 0.001;
    ctx.setTransform(D, 0, 0, D, 0, 0);
    background(t);
    drawMotes(t, false);
    seaFloor(t);

    const plantScale = Math.min(W, H * 1.3);
    plant(W * 0.065, H * 0.94, plantScale * 0.35, 0.3, t, false);
    plant(W * 0.16, H * 0.94, plantScale * 0.22, 2.8, t, false);
    plant(W * 0.92, H * 0.94, plantScale * 0.38, 4.4, t, false);
    plant(W * 0.82, H * 0.94, plantScale * 0.21, 1.7, t, false);

    rock(W * 0.075, H * 0.935, W * 0.07, H * 0.055, true);
    rock(W * 0.15, H * 0.95, W * 0.047, H * 0.035, false);
    rock(W * 0.88, H * 0.94, W * 0.083, H * 0.062, true);
    rock(W * 0.78, H * 0.956, W * 0.04, H * 0.028, false);
    rock(W * 0.57, H * 0.963, W * 0.028, H * 0.016, false);

    const targetStrength = ms - pointerTime < 1800 ? 1 : 0;
    pointerStrength += (targetStrength - pointerStrength) * 0.025;
    const autoX = 0.5 + Math.sin(t * 0.105) * 0.17 + Math.sin(t * 0.263) * 0.025;
    const autoY = 0.385 + Math.sin(t * 0.34) * 0.035 + Math.sin(t * 0.13) * 0.015;
    const desiredX = W * (autoX + (pointerX / W - autoX) * 0.095 * pointerStrength);
    const desiredY = H * (autoY + (pointerY / H - autoY) * 0.065 * pointerStrength);
    previousX = jellyX;
    jellyX += (desiredX - jellyX) * 0.018;
    jellyY += (desiredY - jellyY) * 0.018;
    const tilt = Math.max(-0.09, Math.min(0.09, (jellyX - previousX) * 0.008)) + Math.sin(t * 0.29) * 0.018;
    const u = Math.min(W / 760, H / 570);
    jellyfish(jellyX, jellyY, u, t, tilt);

    plant(W * 0.015, H * 1.01, plantScale * 0.19, 5.2, t, true);
    plant(W * 0.985, H * 1.01, plantScale * 0.18, 3.1, t, true);
    drawMotes(t, true);

    const vignette = ctx.createRadialGradient(W * 0.5, H * 0.43, Math.min(W, H) * 0.2, W * 0.5, H * 0.45, Math.max(W, H) * 0.72);
    vignette.addColorStop(0, "rgba(0,10,20,0)");
    vignette.addColorStop(0.72, "rgba(0,10,20,0.035)");
    vignette.addColorStop(1, "rgba(0,8,17,0.3)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Glimmering Glassjelly",
  "statement": "A patient little lantern that gathers stray glimmers in its glassy bell and wanders wherever the water feels interesting. It pulses like a quiet thought: gather, glow, let go."
}
```