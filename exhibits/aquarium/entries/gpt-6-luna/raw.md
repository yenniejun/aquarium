```html
<!DOCTYPE html>
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
    background: #071a2a;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="tank" aria-label="A glowing octopus drifting through a quiet underwater garden"></canvas>
<script>
(() => {
  const canvas = document.getElementById("tank");
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1;
  let pointer = { x: 0, y: 0 };

  function resize() {
    w = innerWidth;
    h = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr * w / 1000, 0, 0, dpr * h / 750, 0, 0);
  }
  addEventListener("resize", resize);
  addEventListener("pointermove", e => {
    pointer.x = (e.clientX / innerWidth - .5) * 2;
    pointer.y = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });
  resize();

  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  function background(t) {
    const bg = ctx.createLinearGradient(0, 0, 0, 750);
    bg.addColorStop(0, "#12334a");
    bg.addColorStop(.44, "#0b293b");
    bg.addColorStop(1, "#071b29");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1000, 750);

    const glow = ctx.createRadialGradient(470, 150, 10, 470, 220, 510);
    glow.addColorStop(0, "rgba(114,208,211,.22)");
    glow.addColorStop(.4, "rgba(47,138,160,.10)");
    glow.addColorStop(1, "rgba(8,28,45,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1000, 700);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 6; i++) {
      const x = 90 + i * 155 + Math.sin(t * .18 + i) * 20;
      ctx.beginPath();
      ctx.moveTo(x - 20, 0);
      ctx.lineTo(x + 35, 0);
      ctx.lineTo(x + 175 + Math.sin(t * .13 + i) * 25, 620);
      ctx.lineTo(x - 70 + Math.sin(t * .12 + i) * 20, 620);
      const ray = ctx.createLinearGradient(x, 0, x + 20, 620);
      ray.addColorStop(0, "rgba(156,232,220,.11)");
      ray.addColorStop(1, "rgba(78,188,197,0)");
      ctx.fillStyle = ray;
      ctx.fill();
    }
    ctx.restore();

    // Distant rock silhouettes
    ctx.fillStyle = "rgba(8,29,39,.46)";
    ctx.beginPath();
    ctx.moveTo(0, 570);
    ctx.bezierCurveTo(110, 520, 170, 548, 250, 574);
    ctx.bezierCurveTo(330, 530, 420, 548, 495, 584);
    ctx.bezierCurveTo(600, 535, 720, 542, 808, 580);
    ctx.bezierCurveTo(900, 532, 942, 555, 1000, 565);
    ctx.lineTo(1000, 750); ctx.lineTo(0, 750); ctx.closePath();
    ctx.fill();
  }

  function plant(x, base, height, phase, color, sway = 1) {
    const swayNow = Math.sin(phase) * 18 * sway;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.bezierCurveTo(x - 14 + swayNow * .25, base - height * .34,
                      x + 22 + swayNow, base - height * .74,
                      x + swayNow, base - height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const f = .18 + i * .12;
      const px = x + swayNow * f * .55 + Math.sin(f * 8 + phase) * 5;
      const py = base - height * f;
      const dir = i % 2 ? -1 : 1;
      const len = 23 + 9 * Math.sin(i * 1.7 + phase);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + dir * len * .3, py - 7,
                           px + dir * len, py - 18 - (i % 3) * 4);
      ctx.quadraticCurveTo(px + dir * len * .55, py + 1, px, py);
      ctx.fillStyle = color;
      ctx.globalAlpha = .75;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function seaGarden(t) {
    // Soft, distant coral fans
    for (let side = 0; side < 2; side++) {
      const baseX = side ? 910 : 75;
      const sign = side ? -1 : 1;
      ctx.save();
      ctx.translate(baseX, 636);
      ctx.scale(sign, 1);
      for (let b = 0; b < 5; b++) {
        const bx = (b - 2) * 13;
        const ht = 65 + (b * 17 % 50);
        ctx.beginPath();
        ctx.moveTo(bx, 8);
        ctx.bezierCurveTo(bx - 12, -ht * .42, bx + 15, -ht * .7, bx + 5, -ht);
        ctx.strokeStyle = b % 2 ? "rgba(97,161,153,.48)" : "rgba(152,139,158,.42)";
        ctx.lineWidth = 3 + b % 2;
        ctx.lineCap = "round";
        ctx.stroke();
        for (let j = 0; j < 4; j++) {
          const yy = -ht * (.28 + j * .15);
          ctx.beginPath();
          ctx.arc(bx + Math.sin(j + b) * 6, yy, 3.2, 0, TAU);
          ctx.fillStyle = "rgba(191,187,159,.55)";
          ctx.fill();
        }
      }
      ctx.restore();
    }

    plant(115, 676, 142, t * .7, "rgba(70,154,140,.85)", .8);
    plant(162, 680, 90, t * .6 + 2, "rgba(78,177,152,.72)", .7);
    plant(853, 678, 135, t * .72 + 1, "rgba(68,160,150,.82)", .8);
    plant(900, 676, 100, t * .65 + 3, "rgba(73,178,151,.72)", .7);

    // Sandy bed
    const sand = ctx.createLinearGradient(0, 640, 0, 750);
    sand.addColorStop(0, "#42544e");
    sand.addColorStop(.34, "#394943");
    sand.addColorStop(1, "#23363a");
    ctx.fillStyle = sand;
    ctx.beginPath();
    ctx.moveTo(0, 664);
    ctx.quadraticCurveTo(180, 636, 345, 665);
    ctx.quadraticCurveTo(520, 691, 695, 660);
    ctx.quadraticCurveTo(860, 638, 1000, 667);
    ctx.lineTo(1000, 750); ctx.lineTo(0, 750); ctx.closePath();
    ctx.fill();

    // Stones
    const stones = [
      [225, 675, 34, 16], [278, 685, 23, 12], [739, 677, 38, 17],
      [786, 685, 19, 10], [442, 694, 27, 11], [570, 688, 20, 9],
      [55, 697, 25, 12], [959, 691, 30, 13]
    ];
    stones.forEach(([x, y, rx, ry], i) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, -.12, 0, TAU);
      ctx.fillStyle = i % 2 ? "#596258" : "#4b5851";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - rx * .2, y - ry * .35, rx * .48, ry * .24, -.12, Math.PI, TAU);
      ctx.fillStyle = "rgba(195,206,178,.16)";
      ctx.fill();
    });

    // Grains and tiny glints on the sand
    for (let i = 0; i < 95; i++) {
      const x = (i * 137.5 + 23) % 1000;
      const y = 674 + ((i * 47) % 74);
      ctx.globalAlpha = .18 + .18 * Math.sin(i * 7);
      ctx.fillStyle = i % 3 ? "#d3c99e" : "#9bc6b2";
      ctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  const arms = [
    { s: [-43, 59], c1: [-115, 17], c2: [-230, 94], e: [-287, 20], w: 17, col: "#42c5bd" },
    { s: [-32, 67], c1: [-103, 105], c2: [-245, 177], e: [-254, 132], w: 18, col: "#55d2c5" },
    { s: [-20, 72], c1: [-75, 147], c2: [-169, 205], e: [-184, 252], w: 16, col: "#53b9c4" },
    { s: [-8, 77], c1: [-21, 158], c2: [-83, 233], e: [-102, 276], w: 15, col: "#8ed9cc" },
    { s: [8, 77], c1: [12, 157], c2: [66, 235], e: [99, 270], w: 15, col: "#73cfc4" },
    { s: [21, 72], c1: [90, 135], c2: [166, 193], e: [211, 231], w: 16, col: "#49bfc0" },
    { s: [34, 67], c1: [115, 86], c2: [225, 156], e: [273, 118], w: 18, col: "#65d3c1" },
    { s: [44, 58], c1: [139, 4], c2: [246, 59], e: [291, 11], w: 17, col: "#55c6c6" }
  ];

  function cubic(p0, p1, p2, p3, u) {
    const v = 1 - u;
    return {
      x: v*v*v*p0.x + 3*v*v*u*p1.x + 3*v*u*u*p2.x + u*u*u*p3.x,
      y: v*v*v*p0.y + 3*v*v*u*p1.y + 3*v*u*u*p2.y + u*u*u*p3.y
    };
  }

  function drawArm(spec, cx, cy, t, idx) {
    const sway = Math.sin(t * .85 + idx * .9);
    const p0 = { x: cx + spec.s[0], y: cy + spec.s[1] };
    const p1 = { x: cx + spec.c1[0] + sway * 8, y: cy + spec.c1[1] + Math.cos(t + idx) * 7 };
    const p2 = { x: cx + spec.c2[0] + Math.sin(t * .7 + idx) * 13, y: cy + spec.c2[1] + sway * 8 };
    const p3 = { x: cx + spec.e[0] + Math.sin(t * .65 + idx * 1.2) * 10,
                 y: cy + spec.e[1] + Math.cos(t * .8 + idx) * 9 };

    const pts = [];
    for (let i = 0; i <= 42; i++) pts.push(cubic(p0, p1, p2, p3, i / 42));

    const widths = pts.map((_, i) => Math.max(1.5, spec.w * Math.pow(1 - i / 43, .62)));
    const left = [], right = [];
    pts.forEach((p, i) => {
      const before = pts[Math.max(0, i - 1)], after = pts[Math.min(42, i + 1)];
      const dx = after.x - before.x, dy = after.y - before.y;
      const len = Math.hypot(dx, dy) || 1;
      const n = widths[i] * .5;
      left.push([p.x - dy / len * n, p.y + dx / len * n]);
      right.push([p.x + dy / len * n, p.y - dx / len * n]);
    });

    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < left.length; i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();

    const grad = ctx.createLinearGradient(p0.x - 30, p0.y - 25, p3.x + 20, p3.y + 35);
    grad.addColorStop(0, "#367f91");
    grad.addColorStop(.34, spec.col);
    grad.addColorStop(.78, "#319da9");
    grad.addColorStop(1, "#7be1cf");
    ctx.fillStyle = grad;
    ctx.shadowColor = "rgba(75,220,213,.2)";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fine highlight along the upper edge
    ctx.beginPath();
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const before = pts[i - 1], after = pts[Math.min(42, i + 1)];
      const dx = after.x - before.x, dy = after.y - before.y;
      const len = Math.hypot(dx, dy) || 1;
      const x = p.x - dy / len * widths[i] * .20;
      const y = p.y + dx / len * widths[i] * .20;
      if (i === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(210,255,230,.34)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.stroke();

    // Little pearly suckers, tucked along the underside of each arm
    for (let k = 4; k <= 31; k += 4) {
      const i = k;
      const p = pts[i];
      const before = pts[i - 1], after = pts[i + 1];
      const dx = after.x - before.x, dy = after.y - before.y;
      const len = Math.hypot(dx, dy) || 1;
      const offset = widths[i] * .24;
      const sx = p.x + dy / len * offset;
      const sy = p.y - dx / len * offset;
      const r = 2.7 * (1 - i / 49);
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(1.2, r), 0, TAU);
      ctx.fillStyle = "rgba(220,255,228,.67)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx - .5, sy - .6, Math.max(.65, r * .38), 0, TAU);
      ctx.fillStyle = "rgba(255,255,240,.83)";
      ctx.fill();
    }
  }

  function octopus(t) {
    const bob = Math.sin(t * 1.15) * 7;
    const cx = 500 + pointer.x * 9;
    const cy = 365 + bob + pointer.y * 5;

    // A soft pool of light beneath the drifting creature
    const halo = ctx.createRadialGradient(cx, cy + 40, 15, cx, cy + 40, 255);
    halo.addColorStop(0, "rgba(72,196,195,.12)");
    halo.addColorStop(1, "rgba(72,196,195,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(cx - 260, cy - 220, 520, 520);

    arms.forEach((a, i) => drawArm(a, cx, cy, t, i));

    // Mantle
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(t * .65) * .025);
    const mantle = ctx.createRadialGradient(-28, -50, 10, 0, -5, 120);
    mantle.addColorStop(0, "#c8f0d6");
    mantle.addColorStop(.23, "#78d8cf");
    mantle.addColorStop(.65, "#439cae");
    mantle.addColorStop(1, "#275b79");
    ctx.beginPath();
    ctx.moveTo(-69, 29);
    ctx.bezierCurveTo(-89, -5, -77, -88, -38, -119);
    ctx.bezierCurveTo(-17, -137, 17, -137, 39, -116);
    ctx.bezierCurveTo(78, -78, 83, -11, 62, 31);
    ctx.bezierCurveTo(43, 57, -42, 58, -69, 29);
    ctx.closePath();
    ctx.fillStyle = mantle;
    ctx.shadowColor = "rgba(89,227,217,.28)";
    ctx.shadowBlur = 22;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(214,255,229,.42)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gentle mantle markings
    for (let i = 0; i < 11; i++) {
      const x = -48 + (i * 19 % 98);
      const y = -91 + (i * 31 % 91);
      const r = 2.2 + (i % 3) * .8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = i % 2 ? "rgba(235,255,224,.38)" : "rgba(44,116,137,.28)";
      ctx.fill();
    }

    // Face and bright, curious eyes
    for (const ex of [-31, 31]) {
      ctx.beginPath();
      ctx.ellipse(ex, 2, 17, 21, 0, 0, TAU);
      ctx.fillStyle = "rgba(226,251,221,.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex + 2, 3, 10, 14, -.1, 0, TAU);
      ctx.fillStyle = "#153148";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 5, -2, 4.3, 0, TAU);
      ctx.fillStyle = "#f6fff0";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex - 1, 9, 1.8, 0, TAU);
      ctx.fillStyle = "rgba(130,224,215,.85)";
      ctx.fill();
    }

    // Small, bashful blush and a tiny curved smile
    ctx.beginPath(); ctx.ellipse(-53, 29, 8, 4, -.2, 0, TAU);
    ctx.fillStyle = "rgba(255,164,164,.40)"; ctx.fill();
    ctx.beginPath(); ctx.ellipse(53, 29, 8, 4, .2, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, 31);
    ctx.quadraticCurveTo(0, 38, 9, 31);
    ctx.strokeStyle = "rgba(22,69,83,.8)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();

    // A little crown of luminous freckles
    for (let i = 0; i < 5; i++) {
      const x = -28 + i * 14;
      const y = -121 + Math.abs(i - 2) * 3;
      ctx.beginPath();
      ctx.arc(x, y, i === 2 ? 3.5 : 2.2, 0, TAU);
      ctx.fillStyle = i === 2 ? "rgba(255,232,158,.95)" : "rgba(206,255,231,.82)";
      ctx.shadowColor = "#c3ffe0";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function bubbles(t) {
    for (let i = 0; i < 18; i++) {
      const seed = i * 83.7;
      const speed = .22 + (i % 5) * .055;
      const y = 700 - ((t * 31 * speed + seed * 2.8) % 760);
      const x = (seed * 1.73 + Math.sin(t * .45 + i * 2) * 18 + 35) % 1000;
      const r = 1.8 + (i % 4) * .7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.strokeStyle = "rgba(198,246,235,.32)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - r * .3, y - r * .35, .75, 0, TAU);
      ctx.fillStyle = "rgba(232,255,239,.52)";
      ctx.fill();
    }
  }

  function draw(time) {
    const t = time * .001;
    background(t);
    seaGarden(t);
    bubbles(t);
    octopus(t);

    // A faint vignette keeps the view quiet and jewel-like
    const vignette = ctx.createRadialGradient(500, 370, 270, 500, 370, 690);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(2,12,24,.38)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1000, 750);

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Opal Octopus",
  "statement": "A shy little drifter, the Opal Octopus tends its own pocket of moonlit water, trailing eight pearl-dotted arms through the garden. Its freckles glow whenever the current brings something new to wonder at."
}
```