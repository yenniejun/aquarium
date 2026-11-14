```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: #020610;
  }
  canvas {
    position: absolute;
    width: min(100vw, 100vh);
    height: min(100vw, 100vh);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    display: block;
  }
</style>
</head>
<body>
<canvas id="sky" aria-hidden="true"></canvas>
<script>
(() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const SIZE = 600;
  let dpr = 1;
  let stars = [];

  function seededRandom(seed) {
    let n = seed >>> 0;
    return () => {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
  }

  function resize() {
    const side = Math.min(innerWidth, innerHeight);
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(side * dpr);
    canvas.height = Math.round(side * dpr);

    const random = seededRandom(90217);
    stars = [];
    while (stars.length < 190) {
      const x = random() * SIZE;
      const y = random() * SIZE;
      const dx = x - SIZE / 2;
      const dy = y - SIZE / 2;
      if (dx * dx + dy * dy < 286 * 286) {
        stars.push({
          x, y,
          r: 0.35 + random() * 1.05,
          a: 0.18 + random() * 0.62,
          phase: random() * Math.PI * 2,
          speed: 0.35 + random() * 1.25,
          tint: random()
        });
      }
    }
  }
  addEventListener("resize", resize, { passive: true });
  resize();

  const P = {
    head: [300, 218],
    feelL: [278, 185],
    feelR: [319, 180],
    neck: [304, 247],
    body: [299, 281],
    tail: [294, 315],
    ember: [291, 350],

    lIn: [269, 250],
    lHigh: [238, 220],
    lTip: [207, 244],
    lLow: [224, 278],
    lFold: [260, 273],

    rIn: [331, 249],
    rHigh: [363, 218],
    rTip: [395, 243],
    rLow: [378, 278],
    rFold: [340, 273],

    lDust: [241, 250],
    rDust: [361, 249]
  };

  const edges = [
    ["head", "feelL"], ["head", "feelR"],
    ["head", "neck"], ["neck", "body"], ["body", "tail"], ["tail", "ember"],
    ["neck", "lIn"], ["lIn", "lHigh"], ["lHigh", "lTip"],
    ["lTip", "lLow"], ["lLow", "lFold"], ["lFold", "lIn"],
    ["lIn", "lDust"], ["lDust", "lHigh"],
    ["neck", "rIn"], ["rIn", "rHigh"], ["rHigh", "rTip"],
    ["rTip", "rLow"], ["rLow", "rFold"], ["rFold", "rIn"],
    ["rIn", "rDust"], ["rDust", "rHigh"]
  ];

  const nodeOrder = [
    "head", "feelL", "feelR", "neck", "body", "tail", "ember",
    "lIn", "lHigh", "lTip", "lLow", "lFold", "lDust",
    "rIn", "rHigh", "rTip", "rLow", "rFold", "rDust"
  ];

  const lengths = edges.map(([a, b]) => {
    const dx = P[b][0] - P[a][0];
    const dy = P[b][1] - P[a][1];
    return Math.hypot(dx, dy);
  });
  const totalLength = lengths.reduce((sum, v) => sum + v, 0);

  function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
  function smooth(v) {
    v = clamp(v);
    return v * v * (3 - 2 * v);
  }

  function glowStar(x, y, radius, color, alpha, time, pulse = 1) {
    const shimmer = 0.78 + 0.22 * Math.sin(time * 1.6 + x * 0.08 + y * 0.05);
    const r = radius * pulse;
    ctx.save();
    ctx.globalAlpha = alpha * shimmer;
    ctx.shadowColor = color;
    ctx.shadowBlur = r * 9;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff7df";
    ctx.globalAlpha = alpha * shimmer * 0.92;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.65, r * 0.34), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBackground(time) {
    const bg = ctx.createLinearGradient(35, 10, 550, 590);
    bg.addColorStop(0, "#071225");
    bg.addColorStop(0.46, "#090f24");
    bg.addColorStop(1, "#100c20");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const haze = [
      [175 + Math.sin(time * 0.045) * 8, 210, 170, "rgba(33,87,111,0.14)"],
      [394, 338 + Math.cos(time * 0.038) * 7, 155, "rgba(91,48,103,0.13)"],
      [310, 110, 120, "rgba(41,54,103,0.12)"]
    ];
    for (const [x, y, r, color] of haze) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(7,12,27,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    const vignette = ctx.createRadialGradient(300, 285, 150, 300, 300, 315);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.48)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, SIZE, SIZE);

    for (const s of stars) {
      const twinkle = 0.58 + 0.42 * Math.sin(time * s.speed + s.phase);
      ctx.globalAlpha = s.a * twinkle;
      ctx.fillStyle = s.tint > 0.82 ? "#b8d8ed" : "#dce4ef";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // A faraway, ringed world, barely brighter than the surrounding dust.
    ctx.save();
    ctx.translate(453, 148);
    ctx.rotate(-0.23);
    ctx.strokeStyle = "rgba(186,190,221,0.24)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    const planet = ctx.createRadialGradient(-5, -6, 1, 0, 0, 12);
    planet.addColorStop(0, "#899ab5");
    planet.addColorStop(1, "#35445f");
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // A loose arc of distant, almost-lost stardust.
    ctx.save();
    ctx.strokeStyle = "rgba(160,186,203,0.10)";
    ctx.lineWidth = 0.7;
    ctx.setLineDash([1, 8]);
    ctx.beginPath();
    ctx.ellipse(302, 300, 205, 146, -0.32, 3.55, 5.92);
    ctx.stroke();
    ctx.restore();
  }

  function drawWingWhispers(alpha, flutter) {
    ctx.save();
    ctx.globalAlpha = 0.09 + alpha * 0.19;
    ctx.strokeStyle = "#8bd5dc";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(300, 257);
      ctx.scale(sign, 1);
      ctx.scale(1, 1 + flutter);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-31, -28, -50, -56, -94, -37);
      ctx.bezierCurveTo(-89, -13, -65, 13, -34, 21);
      ctx.bezierCurveTo(-18, 18, -8, 9, 0, 0);
      ctx.stroke();

      ctx.globalAlpha *= 0.72;
      ctx.beginPath();
      ctx.moveTo(-7, 6);
      ctx.bezierCurveTo(-37, 1, -61, 2, -78, 17);
      ctx.moveTo(-14, -7);
      ctx.bezierCurveTo(-39, -23, -56, -32, -76, -32);
      ctx.moveTo(-31, -21);
      ctx.quadraticCurveTo(-45, -4, -54, 12);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawConstellation(time, reveal, opacity) {
    const flutter = Math.sin(time * 1.1) * 0.018;
    drawWingWhispers(opacity, flutter);

    // A faint remembered outline remains in the sky between apparitions.
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(122,207,218,${0.055 + opacity * 0.12})`;
    ctx.lineWidth = 0.8;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(300, 257);
      ctx.scale(side, 1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-42, -68, -94, -37);
      ctx.quadraticCurveTo(-83, 5, -34, 21);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    let distance = 0;
    const target = reveal * totalLength;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i];
      const len = lengths[i];
      const part = clamp((target - distance) / len);
      if (part > 0) {
        const x1 = P[a][0], y1 = P[a][1];
        const x2 = x1 + (P[b][0] - x1) * part;
        const y2 = y1 + (P[b][1] - y1) * part;

        ctx.globalAlpha = opacity * 0.24;
        ctx.strokeStyle = "#82f5ec";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#5df3e8";
        ctx.shadowBlur = 13;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.globalAlpha = opacity * 0.74;
        ctx.shadowBlur = 4;
        ctx.strokeStyle = "#a4eee5";
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      distance += len;
    }
    ctx.restore();

    nodeOrder.forEach((name, i) => {
      const activation = smooth((reveal - (i / (nodeOrder.length - 1)) * 0.78) / 0.15);
      const [x, y] = P[name];
      const special = name === "ember" || name === "head";
      const pulse = 0.88 + 0.12 * Math.sin(time * (special ? 2.0 : 1.1) + i);
      glowStar(
        x, y,
        name === "ember" ? 3.6 : special ? 2.8 : 1.9,
        name === "ember" ? "#ffd991" : "#c8fff2",
        opacity * (0.12 + activation * 0.88),
        time + i,
        pulse
      );
    });

    // The little carried ember keeps its own, warmer light.
    const emberGlow = 0.72 + 0.28 * Math.sin(time * 2.4);
    const [ex, ey] = P.ember;
    const emberHalo = ctx.createRadialGradient(ex, ey, 1, ex, ey, 26);
    emberHalo.addColorStop(0, `rgba(255,215,142,${opacity * 0.28 * emberGlow})`);
    emberHalo.addColorStop(1, "rgba(255,190,112,0)");
    ctx.fillStyle = emberHalo;
    ctx.beginPath();
    ctx.arc(ex, ey, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = opacity * 0.7;
    ctx.strokeStyle = "rgba(255,220,166,0.64)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(294, 317);
    ctx.quadraticCurveTo(286, 331, ex, ey - 4);
    ctx.stroke();
    ctx.restore();

    // Tiny rays wink around the lantern when its figure is fully found.
    const rayAlpha = opacity * smooth((reveal - 0.67) / 0.2);
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(time * 0.12);
    ctx.globalAlpha = rayAlpha * 0.6;
    ctx.strokeStyle = "#ffe7b5";
    ctx.lineWidth = 0.75;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const r1 = i % 2 ? 7 : 9;
      const r2 = i % 2 ? 10 : 13;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function frame(now) {
    const time = now / 1000;
    const side = Math.min(innerWidth, innerHeight);
    ctx.setTransform(dpr * side / SIZE, 0, 0, dpr * side / SIZE, 0, 0);

    drawBackground(time);

    const cycle = (time % 16) / 16;
    const seconds = (time % 16);
    const reveal = smooth((seconds - 1.15) / 4.1);
    const fadeOut = 1 - smooth((seconds - 13.15) / 2.5);
    const opacity = (0.035 + 0.965 * reveal) * fadeOut;
    const rotation = Math.sin(time * 0.045) * 0.012 + time * 0.004;

    ctx.save();
    ctx.translate(300, 300);
    ctx.rotate(rotation);
    ctx.translate(-300, -300);
    drawConstellation(time, reveal, opacity);
    ctx.restore();

    // A slow, breathing wash of blue light beneath the figure.
    const breath = 0.5 + 0.5 * Math.sin(time * 0.34);
    const wash = ctx.createRadialGradient(300, 272, 12, 300, 272, 180);
    wash.addColorStop(0, `rgba(62,157,165,${0.025 + breath * 0.025})`);
    wash.addColorStop(1, "rgba(25,77,112,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(100, 100, 400, 400);

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
  "title": "The Ember Moth",
  "statement": "A moth once carried a borrowed ember through the dark, guiding lost stars back to their places. Now its wings appear only now and then, to remind wanderers that even a small light can help someone find their way."
}
```