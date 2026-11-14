```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #070d18;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="canvas" aria-label="A cluster of luminous, bell-shaped mushrooms releasing spiraling spores above a mossy island"></canvas>
<script>
(() => {
  "use strict";

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1, scale = 1, ox = 0, oy = 0;

  let seed = 71342;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const dust = Array.from({length: 54}, () => ({
    x: 30 + random() * 540,
    y: 45 + random() * 650,
    r: 0.35 + random() * 1.15,
    p: random() * Math.PI * 2,
    v: 0.25 + random() * 0.65
  }));

  const freckles = [];
  for (let i = 0; i < 38; i++) {
    const y = -474 + random() * 127;
    const half = 140 * Math.sqrt(Math.max(0, (-y - 330) / 170));
    freckles.push({
      x: (random() * 2 - 1) * half * 0.88,
      y,
      r: 0.5 + random() * 1.45,
      p: random() * Math.PI * 2
    });
  }

  const moss = Array.from({length: 48}, () => ({
    x: 112 + random() * 376,
    y: 650 + random() * 23,
    h: 2 + random() * 9,
    r: 1 + random() * 2.4,
    p: random() * Math.PI * 2
  }));

  const mushrooms = [
    {x: 174, y: 666, s: 0.51, phase: 1.8, count: 17},
    {x: 433, y: 668, s: 0.43, phase: 4.1, count: 14},
    {x: 300, y: 670, s: 1, phase: 0, count: 43}
  ];

  for (const m of mushrooms) {
    m.spores = Array.from({length: m.count}, () => ({
      phase: random(),
      speed: 0.035 + random() * 0.035,
      x: (random() * 2 - 1) * 132,
      sway: 12 + random() * 35,
      drift: (random() * 2 - 1) * 55,
      size: 0.65 + random() * 1.65,
      curl: random() * Math.PI * 2,
      gold: random() > 0.42
    }));
  }

  const roots = [
    [119, 660, 91, 681, 126, 705, 107, 735],
    [154, 665, 173, 690, 138, 710, 151, 748],
    [204, 667, 185, 696, 221, 717, 202, 737],
    [260, 664, 250, 693, 275, 716, 265, 755],
    [323, 665, 339, 691, 310, 721, 327, 746],
    [376, 663, 396, 688, 371, 710, 389, 737],
    [438, 660, 463, 681, 437, 708, 455, 727],
    [142, 657, 196, 646, 227, 674, 286, 657],
    [278, 661, 331, 643, 377, 676, 447, 653]
  ];

  const pointer = {x: 300, y: 400, tx: 300, ty: 400, active: false};

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    scale = Math.min(W / 600, H / 800);
    ox = (W - 600 * scale) / 2;
    oy = (H - 800 * scale) / 2;
  }

  window.addEventListener("resize", resize, {passive: true});
  window.addEventListener("pointermove", e => {
    pointer.tx = (e.clientX - ox) / scale;
    pointer.ty = (e.clientY - oy) / scale;
    pointer.active = true;
  }, {passive: true});
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.tx = 300;
    pointer.ty = 400;
  }, {passive: true});

  function cubicPoint(a, t) {
    const u = 1 - t;
    return {
      x: u*u*u*a[0] + 3*u*u*t*a[2] + 3*u*t*t*a[4] + t*t*t*a[6],
      y: u*u*u*a[1] + 3*u*u*t*a[3] + 3*u*t*t*a[5] + t*t*t*a[7]
    };
  }

  function star(x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
    ctx.restore();
  }

  function drawBackground(t) {
    const g = ctx.createRadialGradient(300, 335, 20, 300, 390, 470);
    g.addColorStop(0, "#183347");
    g.addColorStop(0.38, "#101f32");
    g.addColorStop(0.76, "#0a1222");
    g.addColorStop(1, "#070d18");
    ctx.fillStyle = g;
    ctx.fillRect(-200, -100, 1000, 1000);

    const aura = ctx.createRadialGradient(300, 337, 5, 300, 337, 225);
    aura.addColorStop(0, "rgba(81,191,184,0.105)");
    aura.addColorStop(0.55, "rgba(75,128,164,0.045)");
    aura.addColorStop(1, "rgba(20,45,68,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(55, 92, 490, 490);

    ctx.save();
    ctx.translate(300, 337);
    ctx.rotate(t * 0.012);
    ctx.strokeStyle = "rgba(142,211,199,0.09)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 12, 26, 17]);
    ctx.beginPath();
    ctx.arc(0, 0, 202, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(-t * 0.028);
    ctx.strokeStyle = "rgba(219,189,129,0.07)";
    ctx.setLineDash([42, 90, 5, 55]);
    ctx.beginPath();
    ctx.arc(0, 0, 184, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.setLineDash([]);

    for (const d of dust) {
      const a = 0.1 + 0.18 * (0.5 + 0.5 * Math.sin(t * d.v + d.p));
      ctx.fillStyle = `rgba(172,211,211,${a})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y + Math.sin(t * 0.12 + d.p) * 4, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.strokeStyle = "rgba(94,153,159,0.055)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const yy = 530 + i * 44;
      ctx.beginPath();
      ctx.moveTo(-30, yy);
      ctx.bezierCurveTo(125, yy - 45 + Math.sin(t * 0.15 + i) * 8,
                        420, yy + 38, 640, yy - 18);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawIslandBack() {
    const glow = ctx.createRadialGradient(300, 670, 5, 300, 670, 220);
    glow.addColorStop(0, "rgba(70,202,166,0.16)");
    glow.addColorStop(0.5, "rgba(51,132,126,0.06)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(65, 565, 470, 230);

    ctx.beginPath();
    ctx.moveTo(103, 658);
    ctx.bezierCurveTo(133, 632, 186, 645, 218, 640);
    ctx.bezierCurveTo(267, 626, 314, 645, 352, 638);
    ctx.bezierCurveTo(401, 630, 468, 640, 497, 660);
    ctx.bezierCurveTo(478, 690, 421, 704, 357, 706);
    ctx.bezierCurveTo(276, 718, 167, 704, 119, 684);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 637, 0, 713);
    g.addColorStop(0, "#213d3b");
    g.addColorStop(0.25, "#172d30");
    g.addColorStop(0.68, "#101d27");
    g.addColorStop(1, "#09131e");
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = "rgba(107,175,147,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(112, 658);
    ctx.bezierCurveTo(194, 638, 228, 654, 286, 643);
    ctx.bezierCurveTo(357, 630, 423, 647, 489, 659);
    ctx.stroke();

    for (const r of roots) {
      ctx.beginPath();
      ctx.moveTo(r[0], r[1]);
      ctx.bezierCurveTo(r[2], r[3], r[4], r[5], r[6], r[7]);
      ctx.strokeStyle = "rgba(83,158,144,0.21)";
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }
  }

  function drawStem(m, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.75 + m.phase);

    ctx.save();
    ctx.shadowColor = "rgba(93,224,191,0.38)";
    ctx.shadowBlur = 15 + pulse * 5;
    ctx.beginPath();
    ctx.moveTo(-19, 5);
    ctx.bezierCurveTo(-12, -55, -19, -131, -10, -209);
    ctx.bezierCurveTo(-5, -255, -12, -298, -7, -332);
    ctx.lineTo(8, -332);
    ctx.bezierCurveTo(7, -289, 17, -251, 13, -204);
    ctx.bezierCurveTo(8, -137, 23, -56, 20, 5);
    ctx.quadraticCurveTo(0, 17, -19, 5);
    ctx.closePath();
    const g = ctx.createLinearGradient(-20, 0, 22, 0);
    g.addColorStop(0, "rgba(31,91,92,0.88)");
    g.addColorStop(0.28, "rgba(105,190,166,0.82)");
    g.addColorStop(0.52, "rgba(183,230,193,0.88)");
    g.addColorStop(0.72, "rgba(83,160,149,0.78)");
    g.addColorStop(1, "rgba(26,75,87,0.9)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const inner = ctx.createLinearGradient(0, 0, 0, -330);
    inner.addColorStop(0, "rgba(82,226,169,0.06)");
    inner.addColorStop(0.55, "rgba(159,244,201,0.34)");
    inner.addColorStop(1, "rgba(255,218,143,0.58)");
    ctx.strokeStyle = inner;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(1, -5);
    ctx.bezierCurveTo(10, -91, -5, -183, 2, -319);
    ctx.stroke();

    for (let i = 0; i < 11; i++) {
      const y = -25 - i * 26;
      const x = Math.sin(i * 2.1) * 5;
      const a = 0.13 + 0.19 * (0.5 + 0.5 * Math.sin(t * 1.1 - i * 0.52 + m.phase));
      ctx.fillStyle = `rgba(229,238,173,${a})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 1.3, 3.1, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (m.s > 0.8) {
      ctx.save();
      ctx.translate(1, -210);
      ctx.rotate(-0.06);
      ctx.strokeStyle = "rgba(225,207,144,0.56)";
      ctx.shadowColor = "rgba(134,235,197,0.45)";
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 34, 8, 0, 0.12, Math.PI * 1.83);
      ctx.stroke();
      ctx.strokeStyle = "rgba(115,201,177,0.23)";
      ctx.beginPath();
      ctx.ellipse(0, 2, 42, 11, 0, Math.PI * 1.05, Math.PI * 1.92);
      ctx.stroke();
      ctx.restore();
    }
  }

  function capPath() {
    ctx.beginPath();
    ctx.moveTo(-150, -332);
    ctx.bezierCurveTo(-142, -393, -80, -470, -18, -490);
    ctx.quadraticCurveTo(0, -502, 18, -490);
    ctx.bezierCurveTo(80, -470, 142, -393, 150, -332);
    ctx.quadraticCurveTo(126, -314, 103, -330);
    ctx.quadraticCurveTo(78, -311, 53, -328);
    ctx.quadraticCurveTo(27, -309, 0, -328);
    ctx.quadraticCurveTo(-27, -309, -53, -328);
    ctx.quadraticCurveTo(-78, -311, -103, -330);
    ctx.quadraticCurveTo(-126, -314, -150, -332);
    ctx.closePath();
  }

  function drawCap(m, t) {
    const breathe = Math.sin(t * 0.72 + m.phase);
    const glowPulse = 0.5 + 0.5 * Math.sin(t * 0.9 + m.phase);

    ctx.save();
    ctx.translate(0, -332);
    ctx.rotate((pointer.x - 300) * 0.000045 * m.s + breathe * 0.003);
    ctx.scale(1 + breathe * 0.018, 1 - breathe * 0.009);
    ctx.translate(0, 332);

    ctx.save();
    ctx.shadowColor = "rgba(100,225,199,0.52)";
    ctx.shadowBlur = 25 + glowPulse * 12;
    capPath();
    const g = ctx.createLinearGradient(0, -500, 0, -315);
    g.addColorStop(0, "#b8ead6");
    g.addColorStop(0.18, "#79c9c2");
    g.addColorStop(0.48, "#527f9f");
    g.addColorStop(0.78, "#344e78");
    g.addColorStop(1, "#1a314f");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();

    ctx.save();
    capPath();
    ctx.clip();

    const bloom = ctx.createRadialGradient(-38, -433, 3, -38, -433, 150);
    bloom.addColorStop(0, `rgba(218,255,219,${0.25 + glowPulse * 0.1})`);
    bloom.addColorStop(0.4, "rgba(116,218,201,0.1)");
    bloom.addColorStop(1, "rgba(31,57,87,0)");
    ctx.fillStyle = bloom;
    ctx.fillRect(-160, -505, 320, 200);

    for (let i = -5; i <= 5; i++) {
      const x = i * 27;
      ctx.beginPath();
      ctx.moveTo(i * 2.2, -489);
      ctx.bezierCurveTo(x * 0.15, -451, x * 0.66, -383, x, -326);
      ctx.strokeStyle = i % 2
        ? "rgba(199,243,216,0.17)"
        : "rgba(20,65,91,0.22)";
      ctx.lineWidth = i === 0 ? 1.5 : 0.85;
      ctx.stroke();
    }

    for (const f of freckles) {
      const a = 0.23 + 0.32 * (0.5 + 0.5 * Math.sin(t * 0.65 + f.p));
      ctx.fillStyle = `rgba(225,244,188,${a})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(223,236,183,0.24)";
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-59, -408);
    ctx.lineTo(-31, -429);
    ctx.lineTo(1, -412);
    ctx.lineTo(28, -443);
    ctx.stroke();
    star(-59, -408, 3.5, "#fff0b5", 0.7);
    star(-31, -429, 4.2, "#e5ffd5", 0.76);
    star(1, -412, 3.2, "#fff0b5", 0.65);
    star(28, -443, 4.5, "#e5ffd5", 0.75);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = -6; i <= 6; i++) {
      const x = i * 21;
      ctx.beginPath();
      ctx.moveTo(0, -329);
      ctx.quadraticCurveTo(x * 0.35, -315, x, -323 + Math.abs(i % 2) * 5);
      ctx.strokeStyle = `rgba(247,211,137,${0.15 + glowPulse * 0.17})`;
      ctx.lineWidth = i % 2 ? 0.7 : 1.05;
      ctx.stroke();
    }

    ctx.shadowColor = "rgba(255,211,127,0.85)";
    ctx.shadowBlur = 9 + glowPulse * 8;
    ctx.strokeStyle = `rgba(249,220,153,${0.62 + glowPulse * 0.22})`;
    ctx.lineWidth = 1.55;
    ctx.beginPath();
    ctx.moveTo(-150, -332);
    ctx.quadraticCurveTo(-126, -314, -103, -330);
    ctx.quadraticCurveTo(-78, -311, -53, -328);
    ctx.quadraticCurveTo(-27, -309, 0, -328);
    ctx.quadraticCurveTo(27, -309, 53, -328);
    ctx.quadraticCurveTo(78, -311, 103, -330);
    ctx.quadraticCurveTo(126, -314, 150, -332);
    ctx.stroke();
    ctx.restore();

    for (let i = -4; i <= 4; i++) {
      const x = i * 29;
      const y = -316 + Math.abs(i % 2) * 4;
      const stretch = 2 + 3 * (0.5 + 0.5 * Math.sin(t * 0.8 + i));
      ctx.fillStyle = "rgba(198,244,198,0.65)";
      ctx.beginPath();
      ctx.ellipse(x, y + stretch, 1.05, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawMushroom(m, t) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.scale(m.s, m.s);
    drawStem(m, t);
    drawCap(m, t);
    ctx.restore();
  }

  function drawIslandFront(t) {
    ctx.beginPath();
    ctx.moveTo(105, 662);
    ctx.bezierCurveTo(153, 650, 190, 663, 232, 653);
    ctx.bezierCurveTo(275, 644, 323, 660, 365, 650);
    ctx.bezierCurveTo(411, 640, 464, 650, 496, 662);
    ctx.bezierCurveTo(454, 677, 410, 674, 366, 681);
    ctx.bezierCurveTo(295, 690, 204, 680, 152, 677);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 646, 0, 687);
    g.addColorStop(0, "rgba(49,83,65,0.95)");
    g.addColorStop(0.4, "rgba(27,54,48,0.96)");
    g.addColorStop(1, "rgba(13,29,32,0.98)");
    ctx.fillStyle = g;
    ctx.fill();

    for (const m of moss) {
      const sway = Math.sin(t * 0.5 + m.p) * 1.2;
      ctx.strokeStyle = "rgba(102,158,112,0.45)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y + 4);
      ctx.quadraticCurveTo(m.x + sway * 0.3, m.y - m.h * 0.5, m.x + sway, m.y - m.h);
      ctx.stroke();
      ctx.fillStyle = `rgba(114,173,126,${0.25 + 0.15 * Math.sin(t * 0.7 + m.p)})`;
      ctx.beginPath();
      ctx.arc(m.x + sway, m.y - m.h, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    roots.forEach((r, i) => {
      const p = cubicPoint(r, (t * (0.045 + i * 0.002) + i * 0.137) % 1);
      ctx.fillStyle = i % 3 ? "rgba(100,232,183,0.58)" : "rgba(244,211,139,0.62)";
      ctx.shadowColor = i % 3 ? "#63d9ad" : "#e8c982";
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    const pebbles = [
      [143, 667, 9, 4], [205, 670, 6, 3], [387, 665, 10, 4], [459, 666, 7, 3]
    ];
    for (const p of pebbles) {
      ctx.fillStyle = "rgba(83,111,105,0.48)";
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], p[2], p[3], -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(160,189,155,0.2)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  function drawSpores(t) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const m of mushrooms) {
      for (const s of m.spores) {
        const p = (t * s.speed + s.phase) % 1;
        const fade = Math.sin(Math.PI * p);
        const rise = p * 285 * m.s;
        const spread = 1 + p * 0.8;
        const curl = Math.sin(p * 8 + s.curl + t * 0.18) * s.sway * p;
        let x = m.x + (s.x * spread + s.drift * p) * m.s + curl;
        let y = m.y - 318 * m.s - rise + Math.sin(p * 10 + s.curl) * 5;

        if (pointer.active) {
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 105) {
            const pull = (1 - dist / 105) * 7 * fade;
            x += dx / (dist + 1) * pull;
            y += dy / (dist + 1) * pull;
          }
        }

        const r = s.size * m.s * (0.75 + fade * 0.45);
        const color = s.gold ? "255,222,151" : "145,244,211";
        ctx.strokeStyle = `rgba(${color},${fade * 0.16})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y + 7 * m.s);
        ctx.quadraticCurveTo(x - curl * 0.08, y + 3, x, y);
        ctx.stroke();

        ctx.fillStyle = `rgba(${color},${fade * 0.78})`;
        ctx.shadowColor = s.gold ? "#f3ca78" : "#70dfbd";
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.35, r), 0, Math.PI * 2);
        ctx.fill();

        if (s.size > 1.75 && p > 0.15 && p < 0.85) {
          star(x, y, r * 3.1, `rgb(${color})`, fade * 0.42);
        }
      }
    }
    ctx.restore();
  }

  function drawForegroundMotes(t) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 12; i++) {
      const a = t * (0.08 + i * 0.002) + i * 2.399;
      const radius = 75 + (i % 4) * 34;
      const x = 300 + Math.cos(a) * radius;
      const y = 346 + Math.sin(a * 1.3) * radius * 0.65;
      const alpha = 0.12 + 0.12 * Math.sin(a * 2 + i);
      ctx.fillStyle = `rgba(178,235,199,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.7 + (i % 3) * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function frame(ms) {
    const t = ms * 0.001;
    pointer.x += (pointer.tx - pointer.x) * 0.025;
    pointer.y += (pointer.ty - pointer.y) * 0.025;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = "#070d18";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    drawBackground(t);
    drawIslandBack();
    drawMushroom(mushrooms[0], t);
    drawMushroom(mushrooms[1], t);
    drawMushroom(mushrooms[2], t);
    drawIslandFront(t);
    drawForegroundMotes(t);
    drawSpores(t);

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
  "title": "Moonwell Parasol",
  "statement": "It roots in fallen starlight and pours a slow tide of luminous spores from its gills. Each drifting seed briefly remembers the shape of a constellation."
}
```