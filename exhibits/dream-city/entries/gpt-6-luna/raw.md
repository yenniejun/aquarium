```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title></title>
<style>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: #17223f;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="city"></canvas>
<script>
(() => {
  const canvas = document.getElementById("city");
  const ctx = canvas.getContext("2d");
  const W = 700, H = 900;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
  }
  addEventListener("resize", resize, { passive: true });
  resize();

  const stars = Array.from({ length: 100 }, (_, i) => {
    const r = Math.sin(i * 127.1 + 2.4) * 43758.5453;
    const q = Math.sin(i * 311.7 + 7.8) * 24634.6345;
    return {
      x: (r - Math.floor(r)) * W,
      y: 25 + (q - Math.floor(q)) * 355,
      size: 0.7 + ((i * 17) % 10) / 10,
      phase: i * 1.73
    };
  });

  const palettes = [
    { at: 0.00, top: [17, 27, 59], bottom: [55, 61, 105] },
    { at: 0.18, top: [62, 78, 130], bottom: [235, 154, 154] },
    { at: 0.40, top: [94, 172, 202], bottom: [244, 222, 177] },
    { at: 0.62, top: [67, 93, 145], bottom: [238, 139, 130] },
    { at: 0.83, top: [22, 31, 68], bottom: [68, 67, 111] },
    { at: 1.00, top: [17, 27, 59], bottom: [55, 61, 105] }
  ];

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const mix = (a, b, t) => a + (b - a) * t;
  const mixColor = (a, b, t) => `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(",")})`;

  function skyColors(p) {
    let i = 0;
    while (i < palettes.length - 2 && p > palettes[i + 1].at) i++;
    const a = palettes[i], b = palettes[i + 1];
    const t = clamp((p - a.at) / (b.at - a.at));
    return [a.top.map((v, j) => mix(v, b.top[j], t)), a.bottom.map((v, j) => mix(v, b.bottom[j], t))];
  }

  function ellipse(x, y, rx, ry, color, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCloud(x, y, s, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#f7d9d4";
    ctx.beginPath();
    ctx.ellipse(0, 10, 49, 13, 0, 0, Math.PI * 2);
    ctx.ellipse(-24, 3, 20, 17, 0, 0, Math.PI * 2);
    ctx.ellipse(0, -4, 27, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(27, 6, 23, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = "#fff5df";
    ctx.beginPath();
    ctx.ellipse(-1, -4, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWindows(x, y, cols, rows, cw, ch, seed, night) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const n = Math.sin((row + 1) * 19.3 + (col + 1) * 47.2 + seed * 8.1);
        if (n < -0.12) continue;
        const flicker = 0.78 + 0.22 * Math.sin(performance.now() * 0.0014 + seed + row * 2 + col);
        ctx.globalAlpha = (0.22 + night * 0.72) * (0.72 + (n + 1) * 0.14) * flicker;
        ctx.fillStyle = (row + col + seed) % 4 === 0 ? "#ffd78d" : "#c2f3e7";
        ctx.fillRect(x + col * cw, y + row * ch, Math.max(2, cw * 0.34), Math.max(3, ch * 0.42));
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawDistantCity(night) {
    const blocks = [
      [0, 407, 55, 155], [44, 382, 42, 181], [75, 420, 47, 143],
      [190, 402, 51, 153], [224, 377, 45, 177], [265, 421, 39, 135],
      [374, 410, 47, 151], [408, 389, 57, 170], [459, 418, 46, 142],
      [600, 391, 47, 166], [638, 422, 62, 137]
    ];
    ctx.fillStyle = "#415778";
    blocks.forEach(([x, y, w, h], i) => {
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#536b84";
      ctx.fillRect(x + 4, y + 8, w - 8, 3);
      ctx.fillStyle = "#415778";
      for (let r = 0; r < 5; r++) {
        const on = Math.sin(i * 17 + r * 5.2) > -0.1;
        if (on) {
          ctx.globalAlpha = 0.15 + night * 0.6;
          ctx.fillStyle = r % 2 ? "#f5d194" : "#b4eadb";
          ctx.fillRect(x + 8 + (r % 2) * 13, y + 22 + r * 21, 4, 7);
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#415778";
    });
    ctx.fillStyle = "#567283";
    ctx.fillRect(0, 545, W, 40);
  }

  function drawLeftObservatory(night) {
    ctx.save();
    ctx.fillStyle = "#36586b";
    ctx.beginPath();
    ctx.moveTo(97, 555); ctx.lineTo(108, 367); ctx.lineTo(118, 351);
    ctx.lineTo(118, 323); ctx.lineTo(111, 313); ctx.lineTo(112, 304);
    ctx.quadraticCurveTo(143, 273, 174, 304);
    ctx.lineTo(175, 314); ctx.lineTo(166, 325); ctx.lineTo(168, 350);
    ctx.lineTo(181, 368); ctx.lineTo(194, 555); ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#507b7e";
    ctx.beginPath();
    ctx.moveTo(114, 366); ctx.lineTo(177, 366); ctx.lineTo(181, 384);
    ctx.lineTo(111, 384); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#29485f";
    ctx.fillRect(121, 385, 54, 170);
    ctx.fillStyle = "#82a78a";
    ctx.fillRect(117, 423, 62, 6);
    ctx.fillRect(113, 489, 70, 6);

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#c9efe0";
    ctx.beginPath();
    ctx.ellipse(143, 316, 23, 18, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawWindows(125, 397, 4, 7, 12, 19, 2, night);
    ctx.strokeStyle = "#9ac8ae";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(143, 283); ctx.lineTo(143, 254);
    ctx.stroke();
    ellipse(143, 251, 4, 4, "#f9d998", 0.9);
    ctx.restore();
  }

  function drawRightTower(night) {
    ctx.save();
    ctx.fillStyle = "#394e73";
    ctx.beginPath();
    ctx.moveTo(500, 558); ctx.lineTo(511, 361); ctx.lineTo(526, 338);
    ctx.lineTo(529, 301); ctx.lineTo(543, 275); ctx.lineTo(550, 226);
    ctx.lineTo(557, 275); ctx.lineTo(572, 301); ctx.lineTo(575, 338);
    ctx.lineTo(590, 361); ctx.lineTo(603, 558); ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#587493";
    ctx.beginPath();
    ctx.moveTo(514, 376); ctx.lineTo(588, 376); ctx.lineTo(591, 389);
    ctx.lineTo(513, 389); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#293d65";
    ctx.fillRect(522, 390, 60, 168);

    ctx.strokeStyle = "#7597a4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(542, 299); ctx.lineTo(565, 299);
    ctx.moveTo(530, 340); ctx.lineTo(575, 340);
    ctx.moveTo(516, 378); ctx.lineTo(586, 378);
    ctx.stroke();

    drawWindows(529, 405, 4, 7, 13, 20, 8, night);
    ctx.fillStyle = "#f2ca83";
    ctx.globalAlpha = 0.8 + 0.2 * Math.sin(performance.now() * 0.002);
    ctx.beginPath();
    ctx.arc(550, 225, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLittleRoofs(night) {
    const rooftops = [
      [206, 459, 48, 96], [245, 441, 37, 113], [296, 469, 54, 88],
      [349, 446, 39, 111], [428, 454, 42, 103], [465, 433, 46, 124],
      [32, 477, 50, 78], [620, 467, 49, 89]
    ];
    rooftops.forEach(([x, y, w, h], i) => {
      ctx.fillStyle = i % 2 ? "#53687e" : "#49667a";
      ctx.beginPath();
      ctx.moveTo(x, y + 20); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w, y + 20);
      ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#6c8589";
      ctx.fillRect(x + 5, y + 21, w - 10, 4);
      drawWindows(x + 9, y + 35, 3, 3, (w - 16) / 3, 18, i + 14, night);
    });
  }

  function drawCanal(night, t) {
    const water = ctx.createLinearGradient(0, 565, 0, 900);
    water.addColorStop(0, "#426f83");
    water.addColorStop(0.42, "#285b70");
    water.addColorStop(1, "#173e5a");
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.moveTo(326, 557);
    ctx.bezierCurveTo(307, 620, 345, 680, 314, 742);
    ctx.bezierCurveTo(286, 802, 253, 842, 228, 900);
    ctx.lineTo(491, 900);
    ctx.bezierCurveTo(463, 836, 421, 790, 407, 733);
    ctx.bezierCurveTo(390, 670, 413, 619, 376, 557);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#9bc4ad";
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.64;
    ctx.beginPath();
    ctx.moveTo(326, 566);
    ctx.bezierCurveTo(307, 620, 345, 680, 314, 742);
    ctx.bezierCurveTo(286, 802, 253, 842, 228, 900);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(376, 566);
    ctx.bezierCurveTo(413, 619, 390, 670, 407, 733);
    ctx.bezierCurveTo(421, 790, 463, 836, 491, 900);
    ctx.stroke();
    ctx.globalAlpha = 1;

    for (let i = 0; i < 48; i++) {
      const f = (i * 0.173 + t * 0.035) % 1;
      const y = 580 + f * 305;
      const center = 350 + Math.sin(f * 8 + 0.4) * (13 + f * 50);
      const width = 3 + f * 32;
      const shimmer = 0.12 + 0.25 * (0.5 + 0.5 * Math.sin(i * 7 + t * 1.6));
      ctx.globalAlpha = shimmer * (0.45 + night * 0.8);
      ctx.strokeStyle = i % 4 === 0 ? "#f5ce9b" : "#9de2d1";
      ctx.lineWidth = 1 + f * 2;
      ctx.beginPath();
      ctx.moveTo(center - width / 2, y);
      ctx.lineTo(center + width / 2, y + Math.sin(i) * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Two small arched footbridges.
    [704, 824].forEach((y, index) => {
      const f = (y - 557) / 343;
      const c = 350 + Math.sin(f * 8 + 0.4) * (13 + f * 50);
      const half = 31 + f * 40;
      ctx.strokeStyle = "#d5ad83";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(c - half, y);
      ctx.quadraticCurveTo(c, y - 22 - index * 3, c + half, y);
      ctx.stroke();
      ctx.strokeStyle = "#f1d3a3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c - half, y - 5);
      ctx.quadraticCurveTo(c, y - 27 - index * 3, c + half, y - 5);
      ctx.stroke();
      for (let k = -2; k <= 2; k++) {
        const px = c + k * half * 0.34;
        const py = y - 5 - (1 - Math.pow((px - c) / half, 2)) * (22 + index * 3);
        ctx.strokeStyle = "#d5ad83";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, y - 8); ctx.stroke();
      }
    });
  }

  function drawGardenBanks(t) {
    // Little terrace gardens and their lantern flowers.
    for (let side of [-1, 1]) {
      for (let i = 0; i < 13; i++) {
        const y = 592 + i * 24;
        const spread = 16 + i * 8;
        const x = 350 + side * (43 + i * 7);
        const sway = Math.sin(t * 1.4 + i * 1.7 + side) * 3;
        const stemH = 9 + (i % 4) * 3;
        ctx.strokeStyle = i % 2 ? "#709878" : "#91aa7f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + sway, y - stemH, x + sway * 1.5, y - stemH - 5);
        ctx.stroke();
        ellipse(x + sway * 1.5, y - stemH - 6, 3 + (i % 2), 3, i % 3 ? "#f2c68e" : "#f3a6a2", 0.9);
        ctx.fillStyle = "#658a78";
        ctx.beginPath();
        ctx.ellipse(x + sway - 4, y - 5, 5, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawAirship(x, y, s, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = 0.86;
    ctx.fillStyle = "#f2c99a";
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 10, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d68d85";
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, -0.08, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#edd3a6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, 8); ctx.lineTo(-4, 15); ctx.lineTo(4, 15); ctx.lineTo(7, 7);
    ctx.stroke();
    ctx.fillStyle = "#ffe7ad";
    ctx.fillRect(-4, 12, 8, 5);
    ctx.globalAlpha = 0.3 + 0.18 * Math.sin(t * 2);
    ctx.fillStyle = "#ffe6a2";
    ctx.beginPath(); ctx.arc(0, 14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawCelestial(p, day, t) {
    const x = 350 + 270 * Math.cos((p - 0.38) * Math.PI * 2);
    const y = 151 + 34 * Math.sin((p - 0.08) * Math.PI * 2);
    const glow = ctx.createRadialGradient(x, y, 4, x, y, 68);
    glow.addColorStop(0, day > 0.45 ? "rgba(255,232,171,.30)" : "rgba(190,215,255,.22)");
    glow.addColorStop(1, "rgba(255,232,171,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, 68, 0, Math.PI * 2); ctx.fill();

    if (day > 0.48) {
      ellipse(x, y, 20, 20, "#ffe6a7", 0.96);
      ctx.strokeStyle = "rgba(255,232,177,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 28 + Math.sin(t) * 1.5, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = "#e6eddb";
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#30385f";
      ctx.beginPath();
      ctx.arc(x + 8, y - 6, 15, 0, Math.PI * 2);
      ctx.fill();
      ellipse(x - 24, y + 22, 2, 2, "#f5d994", 0.8);
    }
  }

  function draw(p, t) {
    const day = 0.5 + 0.5 * Math.cos((p - 0.42) * Math.PI * 2);
    const night = 1 - smooth(0.24, 0.8, day);
    const [top, bottom] = skyColors(p);

    ctx.setTransform(dpr * canvas.width / dpr / W, 0, 0, dpr * canvas.height / dpr / H, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, 0, 590);
    bg.addColorStop(0, `rgb(${top.join(",")})`);
    bg.addColorStop(1, `rgb(${bottom.join(",")})`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawCelestial(p, day, t);

    stars.forEach(s => {
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.7 + s.phase));
      ellipse(s.x, s.y, s.size, s.size, "#fff0c4", night * twinkle * 0.85);
    });

    drawCloud((90 + t * 4.2) % 850 - 75, 177, 0.75, 0.25 + day * 0.28);
    drawCloud((490 - t * 2.4 + 850) % 850 - 75, 252, 0.57, 0.17 + day * 0.25);
    drawCloud((295 + t * 2.0) % 850 - 75, 105, 0.38, 0.12 + day * 0.18);

    ctx.fillStyle = "#657f91";
    ctx.beginPath();
    ctx.moveTo(0, 456); ctx.lineTo(74, 406); ctx.lineTo(142, 449);
    ctx.lineTo(224, 389); ctx.lineTo(299, 450); ctx.lineTo(383, 405);
    ctx.lineTo(470, 455); ctx.lineTo(561, 395); ctx.lineTo(700, 465);
    ctx.lineTo(700, 580); ctx.lineTo(0, 580); ctx.closePath();
    ctx.globalAlpha = 0.56;
    ctx.fill();
    ctx.globalAlpha = 1;

    drawDistantCity(night);
    drawLeftObservatory(night);
    drawRightTower(night);
    drawLittleRoofs(night);
    drawCanal(night, t);
    drawGardenBanks(t);

    drawAirship((145 + t * 10) % 790 - 45, 226 + Math.sin(t * 1.2) * 7, 0.8, t);
    drawAirship((520 - t * 6 + 790) % 790 - 45, 319 + Math.sin(t * 1.5 + 2) * 5, 0.48, t);

    // A few slow firefly-lanterns above the rooftops.
    for (let i = 0; i < 11; i++) {
      const x = (i * 79 + t * (5 + i % 3)) % 730 - 15;
      const y = 350 + (i * 37) % 105 + Math.sin(t * 1.1 + i) * 5;
      const a = 0.3 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2 + i * 2));
      ellipse(x, y, 2.3, 2.3, "#ffe4a2", a * (0.4 + night * 0.6));
    }

    // Soft evening haze makes the distant roofs melt into the sky.
    const haze = ctx.createLinearGradient(0, 430, 0, 585);
    haze.addColorStop(0, "rgba(245,190,167,0)");
    haze.addColorStop(1, `rgba(239,190,165,${0.08 + day * 0.1})`);
    ctx.fillStyle = haze;
    ctx.fillRect(0, 420, W, 170);
  }

  const start = performance.now();
  function frame(now) {
    const seconds = (now - start) / 1000;
    const p = (seconds % 96) / 96;
    draw(p, seconds);
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
  "title": "Mosslight Moonmarket",
  "statement": "A garden-grown city drifts between moonlit canals and warm, sleepy rooftops. Its little observatories keep watch while lanterns wander home through the changing sky."
}
```