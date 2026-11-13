```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Murmuring Moonbell</title>
<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #082f43;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="tank"></canvas>
<script>
(() => {
  const canvas = document.getElementById("tank");
  const ctx = canvas.getContext("2d");
  const backdrop = document.createElement("canvas");
  const bg = backdrop.getContext("2d");

  let w = 1000, h = 750, dpr = 1, time = 0, last = 0;
  let pointerX = 500, pointerY = 300, interest = 0;
  let followX = 0, followY = 0;

  let seed = 18427;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const motes = Array.from({length: 48}, () => ({
    x: random() * 1000,
    y: random() * 680,
    r: 0.5 + random() * 1.5,
    speed: 2 + random() * 7,
    phase: random() * 6.283,
    alpha: 0.08 + random() * 0.22
  }));

  const bubbles = Array.from({length: 10}, (_, i) => ({
    x: i < 5 ? 80 + random() * 130 : 790 + random() * 130,
    y: random() * 680,
    r: 1.5 + random() * 3.5,
    speed: 10 + random() * 17,
    phase: random() * 6.283
  }));

  const plants = [
    {x: 45, y: 690, s: 1.25, hue: 172, blades: 8, phase: 0.2, alpha: 0.92},
    {x: 128, y: 676, s: 0.76, hue: 184, blades: 6, phase: 2.1, alpha: 0.65},
    {x: 925, y: 682, s: 1.17, hue: 166, blades: 8, phase: 1.3, alpha: 0.94},
    {x: 845, y: 675, s: 0.72, hue: 190, blades: 6, phase: 3.2, alpha: 0.62},
    {x: 260, y: 665, s: 0.39, hue: 181, blades: 5, phase: 0.8, alpha: 0.34},
    {x: 752, y: 660, s: 0.42, hue: 181, blades: 5, phase: 2.8, alpha: 0.34}
  ];

  function buildBackdrop() {
    backdrop.width = canvas.width;
    backdrop.height = canvas.height;
    bg.setTransform(dpr * w / 1000, 0, 0, dpr * h / 750, 0, 0);

    let g = bg.createLinearGradient(0, 0, 0, 750);
    g.addColorStop(0, "#082d49");
    g.addColorStop(0.3, "#0b485b");
    g.addColorStop(0.68, "#0a384c");
    g.addColorStop(1, "#092a3c");
    bg.fillStyle = g;
    bg.fillRect(0, 0, 1000, 750);

    g = bg.createRadialGradient(410, -60, 10, 410, -60, 690);
    g.addColorStop(0, "rgba(119,229,222,0.25)");
    g.addColorStop(0.45, "rgba(58,158,166,0.08)");
    g.addColorStop(1, "rgba(0,20,38,0)");
    bg.fillStyle = g;
    bg.fillRect(0, 0, 1000, 750);

    bg.fillStyle = "rgba(6,38,51,0.48)";
    bg.beginPath();
    bg.moveTo(0, 610);
    bg.bezierCurveTo(80, 565, 125, 617, 205, 602);
    bg.bezierCurveTo(285, 580, 337, 635, 414, 622);
    bg.bezierCurveTo(560, 590, 642, 634, 745, 602);
    bg.bezierCurveTo(844, 570, 905, 615, 1000, 584);
    bg.lineTo(1000, 750);
    bg.lineTo(0, 750);
    bg.fill();

    g = bg.createLinearGradient(0, 625, 0, 750);
    g.addColorStop(0, "#8f9278");
    g.addColorStop(0.2, "#747e6d");
    g.addColorStop(1, "#3c5b58");
    bg.fillStyle = g;
    bg.beginPath();
    bg.moveTo(0, 674);
    bg.bezierCurveTo(130, 634, 245, 691, 382, 665);
    bg.bezierCurveTo(516, 639, 626, 679, 750, 653);
    bg.bezierCurveTo(850, 632, 922, 668, 1000, 641);
    bg.lineTo(1000, 750);
    bg.lineTo(0, 750);
    bg.fill();

    bg.strokeStyle = "rgba(181,211,178,0.18)";
    bg.lineWidth = 2;
    bg.beginPath();
    bg.moveTo(0, 674);
    bg.bezierCurveTo(130, 634, 245, 691, 382, 665);
    bg.bezierCurveTo(516, 639, 626, 679, 750, 653);
    bg.bezierCurveTo(850, 632, 922, 668, 1000, 641);
    bg.stroke();

    seed = 723;
    for (let i = 0; i < 190; i++) {
      const x = random() * 1000;
      const y = 664 + random() * 86;
      const r = 0.4 + random() * 1.4;
      bg.fillStyle = random() > 0.45
        ? "rgba(207,208,164,0.18)"
        : "rgba(13,57,59,0.22)";
      bg.beginPath();
      bg.arc(x, y, r, 0, Math.PI * 2);
      bg.fill();
    }

    for (let i = 0; i < 24; i++) {
      const x = random() * 1000;
      const y = 663 + random() * 75;
      const rx = 4 + random() * 13;
      const ry = 2 + random() * 6;
      bg.fillStyle = `rgba(${35 + random() * 25},${68 + random() * 25},${68 + random() * 22},0.55)`;
      bg.beginPath();
      bg.ellipse(x, y, rx, ry, random() * 2, 0, Math.PI * 2);
      bg.fill();
      bg.strokeStyle = "rgba(173,195,167,0.1)";
      bg.lineWidth = 1;
      bg.stroke();
    }

    g = bg.createRadialGradient(500, 345, 230, 500, 345, 680);
    g.addColorStop(0, "rgba(0,8,24,0)");
    g.addColorStop(0.72, "rgba(0,9,25,0.08)");
    g.addColorStop(1, "rgba(0,7,20,0.43)");
    bg.fillStyle = g;
    bg.fillRect(0, 0, 1000, 750);
  }

  function resize() {
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 1.65);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    buildBackdrop();
  }

  function drawRays(t) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const shift = Math.sin(t * 0.09) * 35;
    const rays = [
      [85 + shift, 0, 250 + shift, 0, 500 + shift * 0.3, 650, 335 + shift * 0.3, 650],
      [350 - shift * 0.3, 0, 440 - shift * 0.3, 0, 650, 620, 555, 620],
      [665 + shift * 0.2, 0, 720 + shift * 0.2, 0, 865, 570, 790, 570]
    ];
    rays.forEach((r, i) => {
      const g = ctx.createLinearGradient(0, 0, 0, 650);
      g.addColorStop(0, `rgba(122,226,218,${0.045 + i * 0.008})`);
      g.addColorStop(1, "rgba(83,190,182,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(r[0], r[1]);
      for (let n = 2; n < r.length; n += 2) ctx.lineTo(r[n], r[n + 1]);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  function drawMotes(t) {
    ctx.save();
    for (const p of motes) {
      const y = ((p.y - t * p.speed) % 690 + 690) % 690;
      const x = p.x + Math.sin(t * 0.24 + p.phase) * 10;
      const a = p.alpha * (0.72 + 0.28 * Math.sin(t * 0.7 + p.phase));
      ctx.fillStyle = `rgba(177,231,216,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = 1;
    for (const b of bubbles) {
      const y = ((b.y - t * b.speed) % 690 + 690) % 690;
      const x = b.x + Math.sin(t * 0.8 + b.phase + y * 0.012) * 9;
      ctx.strokeStyle = "rgba(172,231,226,0.22)";
      ctx.beginPath();
      ctx.arc(x, y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(220,255,245,0.25)";
      ctx.beginPath();
      ctx.arc(x - b.r * 0.3, y - b.r * 0.35, Math.max(0.45, b.r * 0.18), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCaustics(t) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 8; i++) {
      const x = 55 + i * 130;
      const y = 678 + Math.sin(i * 1.9) * 20;
      const drift = Math.sin(t * 0.35 + i) * 16;
      ctx.strokeStyle = `rgba(139,215,187,${0.055 + 0.025 * Math.sin(t * 0.5 + i)})`;
      ctx.beginPath();
      ctx.moveTo(x - 46 + drift, y);
      ctx.bezierCurveTo(x - 20, y - 13, x + 18, y + 13, x + 51 + drift, y - 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlant(p, t) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.s, p.s);
    ctx.globalAlpha = p.alpha;

    for (let i = 0; i < p.blades; i++) {
      const spread = (i - (p.blades - 1) / 2) * 10;
      const len = 92 + ((i * 37) % 82);
      const width = 5 + (i % 3) * 1.6;
      const sway = Math.sin(t * 0.55 + p.phase + i * 0.47) * (10 + len * 0.045);
      const lean = spread * 1.9 + sway;
      const tipX = lean + Math.sin(t * 0.31 + i) * 7;
      const g = ctx.createLinearGradient(0, 0, tipX, -len);
      g.addColorStop(0, `hsla(${p.hue},47%,19%,0.95)`);
      g.addColorStop(0.65, `hsla(${p.hue + 5},48%,31%,0.85)`);
      g.addColorStop(1, `hsla(${p.hue + 12},55%,43%,0.3)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(spread - width, 4);
      ctx.bezierCurveTo(spread - 12, -len * 0.35, lean - width * 1.4, -len * 0.72, tipX, -len);
      ctx.bezierCurveTo(lean + width * 1.8, -len * 0.68, spread + 14, -len * 0.28, spread + width, 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function bellPath() {
    ctx.beginPath();
    ctx.moveTo(-106, 0);
    ctx.bezierCurveTo(-105, -61, -65, -108, -8, -113);
    ctx.bezierCurveTo(52, -119, 101, -66, 106, 0);
    ctx.bezierCurveTo(91, 13, 77, 11, 64, 5);
    ctx.bezierCurveTo(49, 18, 30, 16, 17, 7);
    ctx.bezierCurveTo(5, 18, -7, 18, -19, 7);
    ctx.bezierCurveTo(-34, 17, -51, 16, -65, 5);
    ctx.bezierCurveTo(-79, 12, -94, 12, -106, 0);
    ctx.closePath();
  }

  function drawJelly(x, y, rotation, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.7);
    const sx = 1.075 - pulse * 0.13;
    const sy = 0.94 + pulse * 0.11;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(sx, sy);

    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 12; i++) {
      const a = -88 + i * 16;
      const len = 135 + (i % 4) * 22 + Math.sin(i * 1.8) * 13;
      const ph = t * 0.9 + i * 0.58;
      const s1 = Math.sin(ph) * 15;
      const s2 = Math.sin(ph - 0.9) * 31;
      const s3 = Math.sin(ph - 1.7) * 47;
      const g = ctx.createLinearGradient(0, 0, 0, len);
      g.addColorStop(0, i % 3 === 0 ? "rgba(244,177,222,0.42)" : "rgba(157,232,231,0.4)");
      g.addColorStop(0.7, "rgba(143,211,222,0.17)");
      g.addColorStop(1, "rgba(141,205,220,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = i % 3 === 0 ? 1.7 : 1.15;
      ctx.beginPath();
      ctx.moveTo(a, 3);
      ctx.bezierCurveTo(a + s1, len * 0.27, a + s2, len * 0.62, a + s3, len);
      ctx.stroke();
    }
    ctx.restore();

    const arms = [-43, -14, 16, 44];
    arms.forEach((o, i) => {
      const len = 156 + (i % 2) * 30;
      const s1 = Math.sin(t * 0.83 + i * 1.3) * 19;
      const s2 = Math.sin(t * 0.71 + i * 1.3 - 0.9) * 34;
      const s3 = Math.sin(t * 0.65 + i * 1.3 - 1.6) * 42;
      const g = ctx.createLinearGradient(0, 0, 0, len);
      g.addColorStop(0, i % 2 ? "rgba(174,221,238,0.35)" : "rgba(244,180,221,0.35)");
      g.addColorStop(0.55, i % 2 ? "rgba(154,208,232,0.18)" : "rgba(213,169,226,0.18)");
      g.addColorStop(1, "rgba(155,204,225,0.015)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(o - 11, 0);
      ctx.bezierCurveTo(o - 22, 40, o + s1 - 22, 74, o + s1 - 8, 105);
      ctx.bezierCurveTo(o + s2 - 20, 133, o + s3 - 8, len - 15, o + s3, len);
      ctx.bezierCurveTo(o + s3 + 8, len - 22, o + s2 + 4, 130, o + s2 + 8, 106);
      ctx.bezierCurveTo(o + s1 + 18, 69, o + 15, 34, o + 11, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(217,229,244,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(o, 4);
      ctx.bezierCurveTo(o + s1, 65, o + s2, 120, o + s3, len - 5);
      ctx.stroke();
    });

    ctx.save();
    ctx.shadowColor = "rgba(129,224,231,0.48)";
    ctx.shadowBlur = 24;
    bellPath();
    ctx.fillStyle = "rgba(115,204,218,0.1)";
    ctx.fill();
    ctx.restore();

    let g = ctx.createRadialGradient(-27, -60, 5, 0, -42, 145);
    g.addColorStop(0, "rgba(239,255,248,0.43)");
    g.addColorStop(0.36, "rgba(159,231,235,0.21)");
    g.addColorStop(0.72, "rgba(189,158,229,0.16)");
    g.addColorStop(1, "rgba(92,177,205,0.12)");
    bellPath();
    ctx.fillStyle = g;
    ctx.fill();

    g = ctx.createLinearGradient(-105, -80, 105, 20);
    g.addColorStop(0, "rgba(171,250,237,0.83)");
    g.addColorStop(0.42, "rgba(211,221,250,0.52)");
    g.addColorStop(0.75, "rgba(241,170,222,0.65)");
    g.addColorStop(1, "rgba(133,220,229,0.55)");
    bellPath();
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -43);
    ctx.rotate(Math.sin(t * 0.35) * 0.035);
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 2);
      ctx.fillStyle = i % 2 ? "rgba(255,184,218,0.15)" : "rgba(213,176,239,0.18)";
      ctx.strokeStyle = i % 2 ? "rgba(255,192,224,0.35)" : "rgba(189,210,246,0.35)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.bezierCurveTo(-23, -12, -24, -39, -3, -40);
      ctx.bezierCurveTo(20, -42, 25, -15, 0, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const pearl = ctx.createRadialGradient(-3, -4, 1, 0, 0, 12);
    pearl.addColorStop(0, "rgba(255,255,235,0.9)");
    pearl.addColorStop(0.4, "rgba(201,244,239,0.5)");
    pearl.addColorStop(1, "rgba(171,210,235,0.04)");
    ctx.fillStyle = pearl;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const blinkTime = (t + 2) % 7;
    const blink = blinkTime < 0.17 ? Math.sin(blinkTime / 0.17 * Math.PI) : 0;
    const lookX = Math.max(-2.2, Math.min(2.2, followX * 0.012)) + Math.sin(t * 0.45) * 0.45;
    const lookY = Math.max(-1.2, Math.min(1.5, followY * 0.008));

    [-20, 20].forEach(ex => {
      ctx.save();
      ctx.translate(ex, -22);
      ctx.scale(1, 1 - blink * 0.91);
      ctx.fillStyle = "rgba(16,53,74,0.88)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.1, 5.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(245,255,244,0.9)";
      ctx.beginPath();
      ctx.arc(-1.1 + lookX * 0.25, -1.6 + lookY * 0.2, 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.strokeStyle = "rgba(33,73,91,0.58)";
    ctx.lineWidth = 1.35;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0.18, Math.PI - 0.18);
    ctx.stroke();

    ctx.strokeStyle = "rgba(240,255,250,0.38)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-77, -48);
    ctx.bezierCurveTo(-66, -78, -43, -94, -19, -99);
    ctx.stroke();
    ctx.strokeStyle = "rgba(241,255,252,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-86, -29);
    ctx.bezierCurveTo(-84, -40, -81, -45, -78, -51);
    ctx.stroke();

    for (let i = 0; i < 9; i++) {
      const a = -80 + i * 20;
      const yy = 7 + Math.abs(i - 4) * 0.45;
      ctx.fillStyle = i % 2 ? "rgba(202,244,239,0.5)" : "rgba(249,190,227,0.46)";
      ctx.beginPath();
      ctx.arc(a, yy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(56, -76);
    ctx.rotate(t * 0.15);
    ctx.strokeStyle = "rgba(239,255,240,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawShadow(x, y) {
    ctx.save();
    ctx.translate(x, 658);
    ctx.scale(1, 0.23);
    const g = ctx.createRadialGradient(0, 0, 5, 0, 0, 125);
    g.addColorStop(0, "rgba(3,25,39,0.16)");
    g.addColorStop(1, "rgba(3,25,39,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 125, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRings(x, y, rotation, t) {
    ctx.save();
    ctx.translate(x, y - 34);
    ctx.rotate(rotation);
    for (let i = 0; i < 3; i++) {
      const q = (t * 0.19 + i / 3) % 1;
      const r = 119 + q * 112;
      ctx.strokeStyle = `rgba(${160 + i * 18},${220 - i * 9},231,${(1 - q) * 0.105})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.82, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    time += dt;

    interest *= Math.exp(-dt * 0.3);
    const autoX = 505 + Math.sin(time * 0.105) * 157 + Math.sin(time * 0.237 + 1) * 37;
    const autoY = 326 + Math.sin(time * 0.16 + 0.4) * 42 + Math.sin(time * 0.41) * 13;

    const desiredX = (pointerX - autoX) * 0.38 * interest;
    const desiredY = (pointerY - autoY) * 0.28 * interest;
    const ease = 1 - Math.exp(-dt * 1.4);
    followX += (desiredX - followX) * ease;
    followY += (desiredY - followY) * ease;

    const x = autoX + followX;
    const y = autoY + followY;
    const rotation = Math.sin(time * 0.105) * 0.055 + Math.sin(time * 0.31) * 0.025 + followX * 0.00012;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(backdrop, 0, 0);
    ctx.setTransform(dpr * w / 1000, 0, 0, dpr * h / 750, 0, 0);

    drawRays(time);
    drawMotes(time);
    drawCaustics(time);
    drawShadow(x, y);

    plants.slice(2).forEach(p => drawPlant(p, time));
    drawRings(x, y, rotation, time);
    drawJelly(x, y, rotation, time);
    plants.slice(0, 2).forEach(p => drawPlant(p, time));

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    pointerX = Math.max(185, Math.min(815, (e.clientX - r.left) / r.width * 1000));
    pointerY = Math.max(180, Math.min(405, (e.clientY - r.top) / r.height * 750));
    interest = 1;
  }, {passive: true});
  window.addEventListener("pointerleave", () => {
    interest = 0;
  });

  resize();
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Murmuring Moonbell",
  "statement": "A bashful bell-jelly that murmurs in ripples of color and carries a tiny night sky beneath its glassy dome. It drifts after interesting lights, trailing four ribbons of almost-music."
}
```