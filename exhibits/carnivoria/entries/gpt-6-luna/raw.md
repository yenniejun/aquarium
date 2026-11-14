```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #08131b; }
  canvas { display: block; width: 100%; height: 100%; cursor: none; }
</style>
</head>
<body>
<canvas aria-label="A living carnivorous plant beneath a glass bell jar"></canvas>
<script>
(() => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const W = 600, H = 800;
  let width = 0, height = 0, dpr = 1;
  let pointer = { x: 300, y: 250, active: false, caughtUntil: 0 };
  let autoCaughtUntil = 0;
  let previousTime = 0;
  const traps = [
    { x: 300, y: 405, size: 1.23, angle: -Math.PI / 2, open: 0.48, cooldown: 0, flash: 0 },
    { x: 210, y: 492, size: 0.94, angle: -2.25, open: 0.48, cooldown: 0, flash: 0 },
    { x: 398, y: 493, size: 0.97, angle: -0.80, open: 0.48, cooldown: 0, flash: 0 },
    { x: 252, y: 333, size: 0.77, angle: -2.10, open: 0.48, cooldown: 0, flash: 0 },
    { x: 361, y: 350, size: 0.78, angle: -0.92, open: 0.48, cooldown: 0, flash: 0 }
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  window.addEventListener("resize", resize);
  resize();

  function pointFromEvent(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width * W;
    pointer.y = (e.clientY - r.top) / r.height * H;
    pointer.active = true;
  }
  canvas.addEventListener("pointermove", pointFromEvent);
  canvas.addEventListener("pointerenter", pointFromEvent);
  canvas.addEventListener("pointerleave", () => { pointer.active = false; });

  function roundedPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function drawBackdrop(t) {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#101e2a");
    bg.addColorStop(0.52, "#172c31");
    bg.addColorStop(1, "#26352d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(300, 392, 15, 300, 392, 360);
    glow.addColorStop(0, "rgba(125, 183, 139, .18)");
    glow.addColorStop(0.52, "rgba(61, 116, 101, .10)");
    glow.addColorStop(1, "rgba(18, 35, 39, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 55; i++) {
      const x = (Math.sin(i * 127.1 + 2) * 0.5 + 0.5) * W;
      const y = (Math.sin(i * 71.7 + 8) * 0.5 + 0.5) * 630;
      const r = 0.7 + (i % 4) * 0.45;
      const alpha = 0.15 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.4 + i));
      ctx.fillStyle = `rgba(224, 216, 157, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.strokeStyle = "rgba(160, 196, 151, .11)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 10]);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(300, 418, 120 + i * 34, 190 + i * 22, -0.32, 3.35, 5.95);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGround(t) {
    const shadow = ctx.createRadialGradient(300, 685, 25, 300, 685, 235);
    shadow.addColorStop(0, "rgba(7, 13, 15, .65)");
    shadow.addColorStop(1, "rgba(7, 13, 15, 0)");
    ctx.fillStyle = shadow;
    ctx.fillRect(40, 560, 520, 230);

    ctx.fillStyle = "#172622";
    ctx.beginPath();
    ctx.ellipse(300, 676, 154, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    const pot = ctx.createLinearGradient(190, 0, 410, 0);
    pot.addColorStop(0, "#273c3b");
    pot.addColorStop(0.22, "#52645a");
    pot.addColorStop(0.52, "#344946");
    pot.addColorStop(0.84, "#526157");
    pot.addColorStop(1, "#283c38");
    ctx.fillStyle = pot;
    ctx.beginPath();
    ctx.moveTo(174, 657);
    ctx.quadraticCurveTo(300, 684, 426, 657);
    ctx.lineTo(400, 748);
    ctx.quadraticCurveTo(300, 775, 200, 748);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(225, 192, 119, .72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(300, 660, 128, 19, 0, 0, Math.PI * 2);
    ctx.stroke();

    const soil = ctx.createLinearGradient(0, 641, 0, 682);
    soil.addColorStop(0, "#524b32");
    soil.addColorStop(1, "#272c25");
    ctx.fillStyle = soil;
    ctx.beginPath();
    ctx.ellipse(300, 660, 120, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(223, 196, 131, .38)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(300, 660, 126, 18, 0, 0.1, Math.PI - 0.1);
    ctx.stroke();

    for (let i = 0; i < 44; i++) {
      const x = 190 + ((i * 47) % 220);
      const y = 653 + ((i * 19) % 16);
      const r = 0.8 + (i % 3) * 0.45;
      ctx.fillStyle = i % 3 === 0 ? "rgba(221, 188, 120, .65)" : "rgba(18, 24, 20, .7)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 12; i++) {
      const x = 155 + i * 27;
      const y = 659 + Math.sin(i * 3.1) * 9;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(i * 2) * 0.35);
      ctx.fillStyle = i % 2 ? "#6e8d66" : "#93a573";
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < 4; i++) {
      const x = 232 + i * 45;
      const y = 627 + Math.sin(t * 1.5 + i) * 2;
      ctx.fillStyle = i % 2 ? "#dfbd78" : "#d99473";
      ctx.beginPath();
      ctx.ellipse(x, y, 3, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(247, 220, 149, .7)";
      ctx.beginPath();
      ctx.arc(x - 1, y - 4, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStem(x0, y0, x1, y1, bend, t, widthPx) {
    const sway = Math.sin(t * 1.1 + x1 * 0.02) * 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x0 + bend + sway, y0 - 95, x1 - bend + sway, y1 + 70, x1 + sway, y1);
    ctx.strokeStyle = "rgba(26, 66, 52, .82)";
    ctx.lineWidth = widthPx + 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x0 + bend + sway, y0 - 95, x1 - bend + sway, y1 + 70, x1 + sway, y1);
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "#507b57");
    g.addColorStop(0.55, "#8caa70");
    g.addColorStop(1, "#a3b87b");
    ctx.strokeStyle = g;
    ctx.lineWidth = widthPx;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x0 - 1, y0 - 12);
    ctx.bezierCurveTo(x0 + bend + sway - 2, y0 - 98, x1 - bend + sway - 2, y1 + 70, x1 + sway - 2, y1);
    ctx.strokeStyle = "rgba(214, 218, 150, .42)";
    ctx.lineWidth = Math.max(1, widthPx * 0.22);
    ctx.stroke();
  }

  function drawLeaf(x, y, angle, scale, t, colorA = "#668a60", colorB = "#aec17d") {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.sin(t * 0.9 + x) * 0.035);
    ctx.scale(scale, scale);
    const g = ctx.createLinearGradient(0, 0, 70, 0);
    g.addColorStop(0, colorA);
    g.addColorStop(1, colorB);
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(190, 207, 139, .55)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(28, -21, 72, -2);
    ctx.quadraticCurveTo(48, 19, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(34, 0, 69, -2);
    ctx.strokeStyle = "rgba(223, 222, 156, .6)";
    ctx.lineWidth = 1;
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const p = 22 + i * 13;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p + 9, -7 + i * 2.3);
      ctx.strokeStyle = "rgba(223, 222, 156, .32)";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlant(t) {
    const soilY = 658;
    drawStem(300, soilY, 300, 405, 24, t, 9);
    drawStem(284, soilY, 210, 492, -54, t, 6);
    drawStem(315, soilY, 398, 493, 55, t, 6);
    drawStem(291, soilY, 252, 333, -32, t, 5);
    drawStem(310, soilY, 361, 350, 39, t, 5);

    drawLeaf(284, 579, -2.67, 0.82, t);
    drawLeaf(319, 558, -0.39, 0.79, t);
    drawLeaf(262, 539, -2.92, 0.70, t);
    drawLeaf(340, 526, -0.18, 0.72, t);
    drawLeaf(272, 473, -2.70, 0.68, t);
    drawLeaf(335, 468, -0.40, 0.67, t);
    drawLeaf(255, 426, -2.92, 0.59, t, "#587e5d", "#a5b57b");
    drawLeaf(367, 436, -0.18, 0.58, t, "#587e5d", "#a5b57b");

    for (const tr of traps) {
      const sway = Math.sin(t * 1.1 + tr.x * 0.02) * 5;
      const x = tr.x + sway;
      const y = tr.y;
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.1 + tr.x);
      ctx.save();
      ctx.globalAlpha = 0.12 + pulse * 0.08;
      ctx.fillStyle = "#e5c875";
      ctx.beginPath();
      ctx.arc(x, y, 18 + pulse * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawTrap(x, y, tr.angle, tr.open, tr.size, tr.flash);
    }
  }

  function drawJaw(side, open, size, flash) {
    ctx.save();
    ctx.rotate(side * open);
    ctx.scale(size, size);

    const fill = ctx.createLinearGradient(10, -30, 105, 20);
    fill.addColorStop(0, flash > 0 ? "#ffc38c" : "#d88977");
    fill.addColorStop(0.42, flash > 0 ? "#ef9b88" : "#b96270");
    fill.addColorStop(1, "#6d5267");

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, side * 25, 61, side * 35, 101, side * 10);
    ctx.quadraticCurveTo(114, side * 3, 104, 0);
    ctx.quadraticCurveTo(73, side * 10, 40, side * 8);
    ctx.quadraticCurveTo(18, side * 7, 0, 0);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(220, 191, 145, .72)";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(8, side * 4);
    ctx.bezierCurveTo(36, side * 15, 68, side * 17, 101, side * 7);
    ctx.strokeStyle = "rgba(250, 218, 166, .7)";
    ctx.lineWidth = 1.25;
    ctx.stroke();

    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 9;
      const y = side * (9 + 4 * Math.sin((i / 8) * Math.PI));
      const h = 7 + (i % 3) * 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 2.7, y);
      ctx.lineTo(x + 2.6, y + side * 1.2);
      ctx.lineTo(x + 0.6, y - side * h);
      ctx.closePath();
      ctx.fillStyle = "#f0d6a4";
      ctx.fill();
      ctx.strokeStyle = "rgba(94, 59, 68, .58)";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 13;
      const y = side * (22 + Math.sin(i * 1.8) * 3);
      ctx.fillStyle = "rgba(255, 224, 170, .78)";
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawTrap(x, y, angle, open, size, flash) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size, size);

    ctx.fillStyle = "#5c835d";
    ctx.beginPath();
    ctx.ellipse(-5, 0, 21, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(195, 211, 143, .67)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(-6, -2, 0, 0);
    ctx.stroke();

    drawJaw(-1, open, 1, flash);
    drawJaw(1, open, 1, flash);

    ctx.fillStyle = "#e5c77c";
    ctx.beginPath();
    ctx.arc(1, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 245, 197, .9)";
    ctx.beginPath();
    ctx.arc(1, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function getAutoFly(t) {
    const phase = (t % 12) / 12;
    if (phase > 0.37 || t < autoCaughtUntil) return null;
    const u = phase / 0.37;
    return {
      x: 28 + u * 544,
      y: 302 + Math.sin(u * Math.PI * 2.4) * 63 + Math.cos(u * 7) * 10,
      type: "auto"
    };
  }

  function getFly(t) {
    if (pointer.active && t > pointer.caughtUntil) {
      return { x: pointer.x, y: pointer.y, type: "pointer" };
    }
    return getAutoFly(t);
  }

  function drawFly(x, y, t) {
    const flutter = Math.sin(t * 32) * 0.35;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 3.4) * 0.16);
    ctx.globalAlpha = 0.86;
    ctx.strokeStyle = "rgba(245, 225, 174, .55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-13, 3);
    ctx.quadraticCurveTo(-23, -3, -29, -7);
    ctx.stroke();

    ctx.fillStyle = "rgba(226, 235, 211, .78)";
    ctx.beginPath();
    ctx.ellipse(-3, -5 + flutter, 6.2, 2.5, -0.55, 0, Math.PI * 2);
    ctx.ellipse(4, -5 - flutter, 6.2, 2.5, 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d69a69";
    ctx.beginPath();
    ctx.ellipse(1, 0, 5.5, 3.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3530";
    ctx.beginPath();
    ctx.arc(6, -0.4, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(216, 176, 119, .8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(-5, 6);
    ctx.moveTo(1, 2);
    ctx.lineTo(0, 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawCatchGlints(t) {
    for (const tr of traps) {
      if (tr.flash <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, tr.flash * 1.6);
      ctx.translate(tr.x, tr.y);
      ctx.strokeStyle = "#f4d990";
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) {
        const a = t * 3 + i * Math.PI / 2;
        const r1 = 16 + (1 - tr.flash) * 12;
        const r2 = r1 + 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function update(t, dt) {
    const fly = getFly(t);
    for (const tr of traps) {
      const dx = fly ? fly.x - tr.x : 0;
      const dy = fly ? fly.y - tr.y : 0;
      const dist = Math.hypot(dx, dy);
      let targetOpen = 0.49;

      if (fly && dist < 205) {
        const wantedAngle = Math.atan2(dy, dx);
        let difference = wantedAngle - tr.angle;
        while (difference > Math.PI) difference -= Math.PI * 2;
        while (difference < -Math.PI) difference += Math.PI * 2;
        tr.angle += difference * Math.min(1, dt * 3.6);
        targetOpen = Math.max(0.045, 0.48 * Math.min(1, dist / 155));
      } else {
        const home = tr.homeAngle;
        let difference = home - tr.angle;
        while (difference > Math.PI) difference -= Math.PI * 2;
        while (difference < -Math.PI) difference += Math.PI * 2;
        tr.angle += difference * Math.min(1, dt * 0.6);
      }

      if (fly && dist < 34 && t > tr.cooldown) {
        tr.open = 0.015;
        tr.cooldown = t + 2.2;
        tr.flash = 1;
        if (fly.type === "pointer") pointer.caughtUntil = t + 1.05;
        else autoCaughtUntil = t + 1.05;
      } else {
        tr.open += (targetOpen - tr.open) * Math.min(1, dt * (targetOpen < tr.open ? 11 : 3.2));
      }
      tr.flash = Math.max(0, tr.flash - dt * 1.55);
    }
  }

  traps.forEach(tr => { tr.homeAngle = tr.angle; });

  function frame(ms) {
    const t = ms / 1000;
    const dt = previousTime ? Math.min(0.04, t - previousTime) : 0.016;
    previousTime = t;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.scale(width / W, height / H);
    update(t, dt);
    drawBackdrop(t);
    drawGround(t);
    drawPlant(t);
    const fly = getFly(t);
    if (fly) drawFly(fly.x, fly.y, t);
    drawCatchGlints(t);
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
  "title": "Scribble Snapper",
  "statement": "A velvet-jawed garden oddity lures passing flies with tiny beads of golden nectar, then folds shut in a flash. It grows in a moonlit pot where moss, spores, and curling leaves keep their own quiet company."
}
```