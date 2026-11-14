```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: transparent;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
  }
</style>
</head>
<body>
<canvas id="garden"></canvas>
<script>
(() => {
  const canvas = document.getElementById("garden");
  const ctx = canvas.getContext("2d");
  const W = 600, H = 800;
  let scale = 1, offsetX = 0, offsetY = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    scale = Math.min(innerWidth / W, innerHeight / H);
    offsetX = (innerWidth - W * scale) / 2;
    offsetY = (innerHeight - H * scale) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", resize);
  resize();

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = v => {
    v = clamp(v, 0, 1);
    return v * v * (3 - 2 * v);
  };
  const mix = (a, b, f) => Math.round(a + (b - a) * f);
  function color(day, night, f) {
    return `rgb(${mix(day[0], night[0], f)},${mix(day[1], night[1], f)},${mix(day[2], night[2], f)})`;
  }

  const palette = {
    stem: [[63, 145, 113], [80, 171, 193]],
    leaf: [[42, 126, 98], [62, 164, 185]],
    leafLight: [[147, 213, 151], [155, 220, 224]],
    vein: [[188, 230, 163], [184, 234, 242]],
    petal: [[244, 183, 91], [134, 185, 220]],
    petalLight: [[255, 225, 147], [199, 228, 246]],
    soil: [[76, 54, 48], [54, 52, 75]]
  };

  function drawSoil(nightMix, glow) {
    const soil = color(palette.soil[0], palette.soil[1], nightMix);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(98, 712);
    ctx.quadraticCurveTo(190, 686, 300, 699);
    ctx.quadraticCurveTo(420, 684, 502, 711);
    ctx.lineTo(510, 772);
    ctx.quadraticCurveTo(300, 788, 90, 772);
    ctx.closePath();
    ctx.fillStyle = soil;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(100, 711);
    ctx.quadraticCurveTo(195, 686, 300, 699);
    ctx.quadraticCurveTo(420, 685, 500, 711);
    ctx.strokeStyle = `rgba(191,174,126,${0.48 - nightMix * 0.19})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.globalAlpha = 0.33;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const x = 133 + i * 79;
      ctx.beginPath();
      ctx.moveTo(x, 726 + (i % 2) * 7);
      ctx.quadraticCurveTo(x + 24, 746, x + 6, 768);
      ctx.strokeStyle = color([167, 118, 91], [111, 132, 171], nightMix);
      ctx.stroke();
    }

    const flecks = [
      [145, 738, 2], [187, 753, 1.5], [236, 727, 2],
      [353, 744, 1.5], [405, 729, 2], [463, 752, 1.5],
      [288, 760, 1.5], [320, 721, 1.5]
    ];
    ctx.globalAlpha = 0.28 + glow * 0.22;
    for (let i = 0; i < flecks.length; i++) {
      const [x, y, r] = flecks[i];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? "#e9c982" : "#a8d9cb";
      ctx.fill();
    }
    ctx.restore();
  }

  function stemPoint(u, stemH, sway) {
    const p0 = [300, 704];
    const p1 = [282 + sway, 704 - stemH * 0.36];
    const p2 = [319 + sway * 0.7, 704 - stemH * 0.72];
    const p3 = [300 + sway * 0.42, 704 - stemH];
    const v = 1 - u;
    return [
      v*v*v*p0[0] + 3*v*v*u*p1[0] + 3*v*u*u*p2[0] + u*u*u*p3[0],
      v*v*v*p0[1] + 3*v*v*u*p1[1] + 3*v*u*u*p2[1] + u*u*u*p3[1]
    ];
  }

  function drawLeaf(x, y, angle, len, width, nightMix, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const base = color(palette.leaf[0], palette.leaf[1], nightMix);
    const light = color(palette.leafLight[0], palette.leafLight[1], nightMix);
    const vein = color(palette.vein[0], palette.vein[1], nightMix);

    ctx.globalAlpha = alpha;
    const grad = ctx.createLinearGradient(0, -width, len, width);
    grad.addColorStop(0, light);
    grad.addColorStop(0.52, base);
    grad.addColorStop(1, color([28, 92, 79], [52, 119, 155], nightMix));

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.23, -width * 0.86, len * 0.69, -width * 0.88, len, 0);
    ctx.bezierCurveTo(len * 0.69, width * 0.76, len * 0.28, width * 0.72, 0, 0);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.globalAlpha = alpha * 0.9;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.quadraticCurveTo(len * 0.48, 1, len * 0.96, 0);
    ctx.strokeStyle = vein;
    ctx.lineWidth = 1.15;
    ctx.stroke();

    for (let i = 1; i <= 3; i++) {
      const u = i * 0.2;
      ctx.beginPath();
      ctx.moveTo(len * u, 0);
      ctx.quadraticCurveTo(len * (u + 0.08), -width * 0.36, len * (u + 0.17), -width * 0.52);
      ctx.moveTo(len * u, 0);
      ctx.quadraticCurveTo(len * (u + 0.08), width * 0.28, len * (u + 0.17), width * 0.46);
      ctx.strokeStyle = vein;
      ctx.lineWidth = 0.65;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBloom(x, y, size, open, time, nightMix, glow) {
    if (size < 0.5) return;
    ctx.save();
    ctx.translate(x, y);
    const petal = color(palette.petal[0], palette.petal[1], nightMix);
    const petalLight = color(palette.petalLight[0], palette.petalLight[1], nightMix);
    const bright = 0.24 + glow * 0.55;

    ctx.save();
    ctx.rotate(time * 0.12);
    ctx.globalAlpha = 0.18 + glow * 0.34;
    ctx.strokeStyle = petalLight;
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.38, size * 0.53, 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    for (let ring = 0; ring < 2; ring++) {
      ctx.save();
      ctx.rotate(time * (ring ? -0.17 : 0.11) + ring * 0.7);
      ctx.globalAlpha = 0.34 + glow * 0.38;
      ctx.strokeStyle = ring ? petalLight : color([172, 211, 158], [144, 208, 226], nightMix);
      ctx.lineWidth = ring ? 1.1 : 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * (ring ? 1.22 : 1.02), size * (ring ? 0.4 : 0.28), ring ? -0.42 : 0.34, 0, Math.PI * 2);
      ctx.stroke();

      const a = time * (ring ? -0.17 : 0.11) + ring * 0.7;
      const ex = Math.cos(a + 0.9) * size * (ring ? 1.22 : 1.02);
      const ey = Math.sin(a + 0.9) * size * (ring ? 0.4 : 0.28);
      ctx.shadowColor = petalLight;
      ctx.shadowBlur = 7 + glow * 8;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.1 + size * 0.018, 0, Math.PI * 2);
      ctx.fillStyle = petalLight;
      ctx.fill();
      ctx.restore();
    }

    const petalCount = 9;
    const petalLen = size * (0.66 * open + 0.15);
    const petalWidth = size * (0.18 * open + 0.08);
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2 + time * 0.025;
      ctx.save();
      ctx.rotate(a);
      ctx.globalAlpha = 0.75 + bright * 0.25;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(petalLen * 0.25, -petalWidth, petalLen * 0.72, -petalWidth * 0.83, petalLen, 0);
      ctx.bezierCurveTo(petalLen * 0.7, petalWidth * 0.8, petalLen * 0.23, petalWidth, 0, 0);
      const grad = ctx.createLinearGradient(0, 0, petalLen, 0);
      grad.addColorStop(0, petal);
      grad.addColorStop(1, petalLight);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 0.9;
    ctx.shadowColor = petalLight;
    ctx.shadowBlur = 8 + glow * 13;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2, size * 0.17), 0, Math.PI * 2);
    ctx.fillStyle = petalLight;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.68;
    ctx.beginPath();
    ctx.arc(-size * 0.035, -size * 0.035, Math.max(1, size * 0.07), 0, Math.PI * 2);
    ctx.fillStyle = "#fff4cf";
    ctx.fill();
    ctx.restore();
  }

  function draw(t) {
    const day = t < 3 ? smooth(t / 3)
      : t < 17 ? 1
      : t < 20 ? 1 - smooth((t - 17) / 3)
      : 0;
    const moon = t >= 20 ? Math.sin(Math.PI * (t - 20) / 20) : 0;
    const nightMix = clamp(1 - day * 0.88, 0, 1);
    const glow = clamp(day * 0.45 + moon * 0.55, 0, 1);
    const growth = smooth(t / 10);
    const nightFold = t >= 20 ? smooth((t - 20) / 3) : 0;
    const structure = growth * (1 - nightFold * 0.86);
    const duskFold = t >= 17 ? smooth((t - 17) / 3) : 0;
    const openness = 1 - duskFold;
    const stemH = 425 * structure;
    const sway = Math.sin(t * Math.PI / 10) * 12;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawSoil(nightMix, glow);

    const rootColor = color([148, 111, 84], [115, 135, 178], nightMix);
    ctx.save();
    ctx.globalAlpha = 0.42 + moon * 0.15;
    ctx.strokeStyle = rootColor;
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(300 + i * 3, 701);
      ctx.bezierCurveTo(294 + i * 15, 717, 306 + i * 22, 737, 300 + i * 33, 760 - (i % 2) * 8);
      ctx.stroke();
    }
    ctx.restore();

    const seedPulse = 1 + Math.sin(t * Math.PI / 5) * 0.08;
    ctx.save();
    ctx.translate(300, 696);
    ctx.rotate(-0.45);
    ctx.globalAlpha = 0.72 + moon * 0.2;
    ctx.shadowColor = color([232, 190, 107], [139, 203, 225], nightMix);
    ctx.shadowBlur = 3 + moon * 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5 * seedPulse, 3.2 * seedPulse, 0, 0, Math.PI * 2);
    ctx.fillStyle = color([191, 139, 75], [102, 157, 187], nightMix);
    ctx.fill();
    ctx.restore();

    if (structure > 0.012) {
      const stem = color(palette.stem[0], palette.stem[1], nightMix);
      const tip = stemPoint(1, stemH, sway);
      ctx.save();
      ctx.globalAlpha = 0.56 + day * 0.36 + moon * 0.12;
      ctx.lineCap = "round";
      ctx.lineWidth = 5 * Math.sqrt(structure);
      ctx.beginPath();
      ctx.moveTo(300, 704);
      ctx.bezierCurveTo(282 + sway, 704 - stemH * 0.36, 319 + sway * 0.7, 704 - stemH * 0.72, tip[0], tip[1]);
      ctx.strokeStyle = stem;
      ctx.stroke();

      ctx.globalAlpha = 0.4 + glow * 0.32;
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = color(palette.vein[0], palette.vein[1], nightMix);
      ctx.beginPath();
      for (let i = 0; i <= 70; i++) {
        const u = i / 70;
        const p = stemPoint(u, stemH, sway);
        const x = p[0] + Math.sin(u * Math.PI * 10 - t * 0.4) * 3.4;
        if (i === 0) ctx.moveTo(x, p[1]);
        else ctx.lineTo(x, p[1]);
      }
      ctx.stroke();

      for (let i = 0; i < 5; i++) {
        const u = 0.2 + i * 0.145;
        const [x, y] = stemPoint(u, stemH, sway);
        const len = (67 + (i % 2) * 12) * structure;
        const drift = Math.sin(t * 0.28 + i) * 0.07;
        drawLeaf(x, y, -Math.PI / 2 - 0.56 + drift, len, len * 0.22, nightMix, 0.82);
        drawLeaf(x + 1, y + 2, -Math.PI / 2 + 0.59 - drift, len * 0.91, len * 0.2, nightMix, 0.78);
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(x, y, 2.1 * structure, 0, Math.PI * 2);
        ctx.fillStyle = color(palette.petalLight[0], palette.petalLight[1], nightMix);
        ctx.fill();
      }
      ctx.restore();

      const bloomSize = 47 * structure;
      drawBloom(tip[0], tip[1], bloomSize, openness, t, nightMix, glow);

      if (growth > 0.45 && t < 20) {
        for (let i = 0; i < 7; i++) {
          const a = i * 2.399 + t * 0.09;
          const r = 28 + (i % 3) * 16;
          const x = tip[0] + Math.cos(a) * r;
          const y = tip[1] + Math.sin(a) * r * 0.66;
          const pulse = 1.2 + (1 + Math.sin(t * 0.7 + i)) * 0.7;
          ctx.save();
          ctx.globalAlpha = (0.2 + day * 0.5) * (0.65 + 0.35 * Math.sin(t * 0.45 + i));
          ctx.shadowColor = "#d6edbb";
          ctx.shadowBlur = 7;
          ctx.beginPath();
          ctx.arc(x, y, pulse, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 ? "#f6d990" : "#b8e7cf";
          ctx.fill();
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  function frame() {
    const t = (Date.now() / 1000) % 40;
    draw(t);
    requestAnimationFrame(frame);
  }
  frame();
})();
</script>
</body>
</html>
```

```json
{
  "title": "Daythread Orrery",
  "statement": "A patient sun-seeker braids its leaves around a tiny living orrery, opening by noon to follow the day. At night it folds back to its seed, keeping a little moonlight for tomorrow."
}
```