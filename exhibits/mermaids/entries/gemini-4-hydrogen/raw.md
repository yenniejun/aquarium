```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title></title>
<style>
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
  }
</style>
</head>
<body>
<canvas id="stage"></canvas>
<script>
(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');

  const VIRTUAL_W = 600;
  const VIRTUAL_H = 800;

  let vw = 0;
  let vh = 0;
  let dpr = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
    lastMove: 0
  };

  function resize() {
    vw = canvas.clientWidth || window.innerWidth;
    vh = canvas.clientHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(vw * dpr));
    canvas.height = Math.max(1, Math.round(vh * dpr));
    scale = Math.min(vw / VIRTUAL_W, vh / VIRTUAL_H);
    offsetX = (vw - VIRTUAL_W * scale) * 0.5;
    offsetY = (vh - VIRTUAL_H * scale) * 0.5;
  }

  window.addEventListener('resize', resize, { passive: true });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(canvas);
  }
  resize();

  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    pointer.tx = Math.max(-1, Math.min(1, nx));
    pointer.ty = Math.max(-1, Math.min(1, ny));
    pointer.active = true;
    pointer.lastMove = performance.now();
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, { passive: true });

  // Deterministic pseudo-random helper for organic texture & motes
  function hash(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // Hair strand definitions
  const hairStrands = [];
  for (let i = 0; i < 15; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const rank = Math.floor(i / 2) / 7;
    hairStrands.push({
      side,
      anchorX: side * (6 + rank * 22),
      anchorY: -28 + rank * 20,
      len: 85 + hash(i + 1) * 95,
      width: 4.5 + (1 - rank) * 5,
      curl: side * (16 + rank * 38) + (hash(i + 19) - 0.5) * 18,
      phase: hash(i + 7) * Math.PI * 2,
      freq: 0.9 + hash(i + 13) * 0.6,
      highlight: i % 3 === 0
    });
  }

  // Soft bioluminescent motes drifting around the tail & pearl
  const motes = [];
  for (let i = 0; i < 18; i++) {
    motes.push({
      u: hash(i + 41),
      offset: (hash(i + 53) - 0.5) * 56,
      radius: 1.3 + hash(i + 67) * 2.1,
      speed: 0.35 + hash(i + 71) * 0.55,
      phase: hash(i + 83) * Math.PI * 2,
      hueShift: hash(i + 97) * 80
    });
  }

  // Compute articulated tail spine in virtual coordinates
  function buildTailSpine(hipX, hipY, t, sway) {
    const N = 34;
    const totalLen = 338;
    const ds = totalLen / (N - 1);
    const pts = [];

    let x = hipX;
    let y = hipY;

    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);

      // Base graceful J-hook curl inside lower 30% of frame
      let baseTheta;
      if (u < 0.35) {
        const k = u / 0.35;
        baseTheta = 1.62 + k * 0.56;
      } else if (u < 0.72) {
        const k = (u - 0.35) / 0.37;
        baseTheta = 2.18 - k * 2.12;
      } else {
        const k = (u - 0.72) / 0.28;
        baseTheta = 0.06 - k * 1.18;
      }

      // Traveling undulation wave increasing toward the tip
      const wave = Math.sin(t * 1.65 - u * 4.6) * (0.03 + 0.19 * Math.pow(u, 1.35))
                 + sway * 0.14 * u;
      const theta = baseTheta + wave;

      // Tapering radius from hip to slender peduncle
      const radius = 23.5 * Math.pow(1 - u, 1.18) + 2.2 * (1 - u * 0.4);

      pts.push({ x, y, theta, radius, u });

      x += Math.cos(theta) * ds;
      y += Math.sin(theta) * ds;
    }

    // Compute smooth normals
    for (let i = 0; i < N; i++) {
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(N - 1, i + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      pts[i].nx = -dy / len;
      pts[i].ny = dx / len;
      pts[i].tx = dx / len;
      pts[i].ty = dy / len;
    }

    return pts;
  }

  function drawFinRibbon(pts, startIdx, endIdx, sideSign, maxWidth, t, hueBase) {
    ctx.save();
    const outer = [];
    const inner = [];

    for (let i = startIdx; i <= endIdx; i++) {
      const p = pts[i];
      const localU = (i - startIdx) / Math.max(1, endIdx - startIdx);
      const envelope = Math.sin(localU * Math.PI);
      const flutter = Math.sin(t * 2.5 - localU * 7.5 + sideSign) * (4 + 6 * envelope);
      const w = (p.radius + maxWidth * envelope + flutter);

      inner.push({
        x: p.x + p.nx * sideSign * (p.radius * 0.75),
        y: p.y + p.ny * sideSign * (p.radius * 0.75)
      });
      outer.push({
        x: p.x + p.nx * sideSign * w,
        y: p.y + p.ny * sideSign * w,
        u: p.u
      });
    }

    ctx.beginPath();
    ctx.moveTo(inner[0].x, inner[0].y);
    for (let i = 0; i < outer.length; i++) {
      const curr = outer[i];
      const next = outer[Math.min(outer.length - 1, i + 1)];
      const mx = (curr.x + next.x) * 0.5;
      const my = (curr.y + next.y) * 0.5;
      ctx.quadraticCurveTo(curr.x, curr.y, mx, my);
    }
    for (let i = inner.length - 1; i >= 0; i--) {
      ctx.lineTo(inner[i].x, inner[i].y);
    }
    ctx.closePath();

    const p0 = outer[0];
    const p1 = outer[outer.length - 1];
    const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
    grad.addColorStop(0, 'rgba(65, 210, 215, 0.34)');
    grad.addColorStop(0.5, 'rgba(130, 120, 235, 0.28)');
    grad.addColorStop(1, 'rgba(235, 160, 210, 0.22)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Iridescent comb-jelly edge pulses along outer rim
    for (let i = 1; i < outer.length - 1; i++) {
      const a = outer[i - 1];
      const b = outer[i];
      const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3.4 - i * 0.7));
      const hue = (hueBase + i * 11 + t * 28) % 360;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `hsla(${hue}, 90%, 74%, ${0.42 * pulse})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Delicate fin rays
    ctx.lineWidth = 0.85;
    for (let i = 2; i < outer.length - 2; i += 2) {
      const hue = (hueBase + i * 10 + t * 24) % 360;
      ctx.strokeStyle = `hsla(${hue}, 80%, 78%, 0.24)`;
      ctx.beginPath();
      ctx.moveTo(inner[i].x, inner[i].y);
      ctx.lineTo(outer[i].x, outer[i].y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCaudalFan(tip, t) {
    ctx.save();
    ctx.translate(tip.x, tip.y);
    const angle = Math.atan2(tip.ty, tip.tx);
    ctx.rotate(angle);

    // Two flowing gossamer lobes like a betta / sea-angel tail
    for (let lobe = -1; lobe <= 1; lobe += 2) {
      const wave1 = Math.sin(t * 2.2 + lobe * 0.8) * 9;
      const wave2 = Math.cos(t * 1.9 - lobe * 0.6) * 11;

      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.bezierCurveTo(
        26, lobe * (18 + wave1 * 0.3),
        52, lobe * (42 + wave1),
        68 + wave2 * 0.4, lobe * (32 + wave2)
      );
      ctx.bezierCurveTo(
        56, lobe * (14 + wave1 * 0.5),
        28, lobe * 6,
        -2, 0
      );
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 70, lobe * 34);
      grad.addColorStop(0, 'rgba(42, 165, 195, 0.55)');
      grad.addColorStop(0.55, 'rgba(136, 130, 238, 0.38)');
      grad.addColorStop(1, 'rgba(250, 195, 220, 0.16)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Delicate luminous rays inside each lobe
      for (let r = 0; r < 5; r++) {
        const f = (r + 1) / 6;
        const hue = (180 + r * 22 + t * 30) % 360;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          28, lobe * (12 + f * 18 + wave1 * 0.4),
          54 * (0.75 + f * 0.25), lobe * (14 + f * 24 + wave2 * 0.5)
        );
        ctx.strokeStyle = `hsla(${hue}, 85%, 78%, 0.32)`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawTail(pts, t) {
    // Dorsal comb-jelly ribbon along the outer curve
    drawFinRibbon(pts, 4, pts.length - 3, -1, 30, t, 175);
    // Subtle inner pelvic/ventral veil
    drawFinRibbon(pts, 2, 14, 1, 20, t + 1.2, 210);

    // Caudal fan at tip
    drawCaudalFan(pts[pts.length - 1], t);

    // Main sculpted tail body
    const leftPts = [];
    const rightPts = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      leftPts.push({ x: p.x + p.nx * p.radius, y: p.y + p.ny * p.radius });
      rightPts.push({ x: p.x - p.nx * p.radius, y: p.y - p.ny * p.radius });
    }

    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    for (let i = 1; i < leftPts.length; i++) {
      const prev = leftPts[i - 1];
      const curr = leftPts[i];
      ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) * 0.5, (prev.y + curr.y) * 0.5);
    }
    const lastL = leftPts[leftPts.length - 1];
    ctx.lineTo(lastL.x, lastL.y);
    const lastR = rightPts[rightPts.length - 1];
    ctx.lineTo(lastR.x, lastR.y);
    for (let i = rightPts.length - 2; i >= 0; i--) {
      const next = rightPts[i + 1];
      const curr = rightPts[i];
      ctx.quadraticCurveTo(next.x, next.y, (next.x + curr.x) * 0.5, (next.y + curr.y) * 0.5);
    }
    ctx.closePath();

    const tailGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[pts.length - 1].x, pts[pts.length - 1].y);
    tailGrad.addColorStop(0, '#9fc4d9');
    tailGrad.addColorStop(0.14, '#3c8ea6');
    tailGrad.addColorStop(0.48, '#1b5875');
    tailGrad.addColorStop(0.82, '#2a4a7c');
    tailGrad.addColorStop(1, '#5869a6');
    ctx.fillStyle = tailGrad;
    ctx.fill();

    // Soft internal pearlescent sheen along the spine
    ctx.beginPath();
    for (let i = 1; i < pts.length - 2; i++) {
      const p = pts[i];
      const sx = p.x + p.nx * p.radius * 0.25;
      const sy = p.y + p.ny * p.radius * 0.25;
      if (i === 1) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = 'rgba(180, 240, 250, 0.28)';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Subtle contour so tail reads cleanly on both bright and dark backdrops
    ctx.strokeStyle = 'rgba(18, 42, 68, 0.42)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Shimmering scale arcs along upper tail
    for (let i = 1; i < 14; i++) {
      const p = pts[i];
      const rows = Math.max(2, Math.round(p.radius / 6));
      for (let r = -rows; r <= rows; r += 2) {
        const frac = r / (rows + 1);
        const sx = p.x + p.nx * p.radius * 0.65 * frac;
        const sy = p.y + p.ny * p.radius * 0.65 * frac;
        const shimmer = 0.14 + 0.18 * Math.sin(t * 2.0 + i * 0.6 + r);
        ctx.beginPath();
        ctx.arc(sx, sy, 3.8 * (1 - i / 18), p.theta - 0.8, p.theta + 0.8);
        ctx.strokeStyle = `rgba(195, 248, 255, ${shimmer})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }

    // Bioluminescent lateral pearls pulsing in a slow current
    for (let i = 3; i < pts.length - 2; i += 2) {
      const p = pts[i];
      const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.6 - i * 0.48));
      const r = (1.6 + (1 - p.u) * 1.4) * (0.8 + 0.35 * pulse);
      const px = p.x - p.nx * p.radius * 0.18;
      const py = p.y - p.ny * p.radius * 0.18;

      const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 3.8);
      glow.addColorStop(0, `rgba(165, 255, 245, ${0.75 * pulse})`);
      glow.addColorStop(1, 'rgba(90, 220, 240, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, r * 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(235, 255, 255, ${0.85 * pulse})`;
      ctx.beginPath();
      ctx.arc(px, py, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHairLayer(headX, headY, t, sway, isFront) {
    ctx.save();
    ctx.translate(headX, headY);

    for (let i = 0; i < hairStrands.length; i++) {
      const s = hairStrands[i];
      if (isFront && i % 4 !== 0) continue;
      if (!isFront && i % 4 === 0) continue;

      const drift1 = Math.sin(t * s.freq + s.phase) * 10 + sway * 12;
      const drift2 = Math.cos(t * (s.freq * 0.85) + s.phase + 1.1) * 15 + sway * 18;

      const x0 = s.anchorX;
      const y0 = s.anchorY;
      const cx1 = x0 + s.curl * 0.45 + drift1 * 0.5;
      const cy1 = y0 + s.len * 0.35;
      const cx2 = x0 + s.curl * 0.9 + drift2;
      const cy2 = y0 + s.len * 0.72;
      const x1 = x0 + s.curl * 0.78 + drift1 * 1.15;
      const y1 = y0 + s.len;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1);

      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      if (s.highlight) {
        grad.addColorStop(0, '#1e3559');
        grad.addColorStop(0.55, '#3b7d9c');
        grad.addColorStop(1, 'rgba(135, 232, 238, 0.15)');
      } else {
        grad.addColorStop(0, '#111c36');
        grad.addColorStop(0.6, '#1a3358');
        grad.addColorStop(1, 'rgba(42, 92, 130, 0.25)');
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (s.highlight) {
        ctx.beginPath();
        ctx.moveTo(x0 + s.side * 1.2, y0 + 2);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1);
        ctx.strokeStyle = 'rgba(195, 248, 255, 0.28)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawCrownPlumes(headX, headY, t, sway) {
    ctx.save();
    ctx.translate(headX, headY - 30);

    const plumes = [
      { bx: -6, len: 68, sweep: -34, hue: 345, w: 3.2 },
      { bx: 0, len: 82, sweep: -14, hue: 15, w: 3.8 },
      { bx: 6, len: 62, sweep: 14, hue: 185, w: 2.8 }
    ];

    for (let i = 0; i < plumes.length; i++) {
      const p = plumes[i];
      const wave = Math.sin(t * 1.45 - i * 0.9) * 8 + sway * 10;
      const tipX = p.bx + p.sweep + wave;
      const tipY = -p.len;

      ctx.beginPath();
      ctx.moveTo(p.bx, 4);
      ctx.quadraticCurveTo(
        p.bx + p.sweep * 0.25 + wave * 0.4,
        -p.len * 0.55,
        tipX,
        tipY
      );

      const grad = ctx.createLinearGradient(p.bx, 4, tipX, tipY);
      grad.addColorStop(0, `hsla(${p.hue}, 78%, 62%, 0.85)`);
      grad.addColorStop(0.65, `hsla(${(p.hue + 24) % 360}, 85%, 72%, 0.65)`);
      grad.addColorStop(1, `hsla(${(p.hue + 40) % 360}, 90%, 84%, 0.2)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.w;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tiny luminous pearl at plume tip
      const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 7);
      glow.addColorStop(0, 'rgba(255, 240, 210, 0.85)');
      glow.addColorStop(1, 'rgba(255, 190, 170, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawArm(x0, y0, x1, y1, x2, y2, w0, w1, w2, skinGrad) {
    const dx1 = x1 - x0, dy1 = y1 - y0;
    const len1 = Math.hypot(dx1, dy1) || 1;
    const nx1 = -dy1 / len1, ny1 = dx1 / len1;

    const dx2 = x2 - x1, dy2 = y2 - y1;
    const len2 = Math.hypot(dx2, dy2) || 1;
    const nx2 = -dy2 / len2, ny2 = dx2 / len2;

    const nmx = (nx1 + nx2) * 0.5;
    const nmy = (ny1 + ny2) * 0.5;
    const nmLen = Math.hypot(nmx, nmy) || 1;
    const mx = nmx / nmLen;
    const my = nmy / nmLen;

    ctx.beginPath();
    ctx.moveTo(x0 + nx1 * w0, y0 + ny1 * w0);
    ctx.quadraticCurveTo(
      (x0 + x1) * 0.5 + nx1 * ((w0 + w1) * 0.52),
      (y0 + y1) * 0.5 + ny1 * ((w0 + w1) * 0.52),
      x1 + mx * w1,
      y1 + my * w1
    );
    ctx.quadraticCurveTo(
      (x1 + x2) * 0.5 + nx2 * ((w1 + w2) * 0.5),
      (y1 + y2) * 0.5 + ny2 * ((w1 + w2) * 0.5),
      x2 + nx2 * w2,
      y2 + ny2 * w2
    );
    ctx.arc(x2, y2, w2, Math.atan2(ny2, nx2), Math.atan2(-ny2, -nx2));
    ctx.quadraticCurveTo(
      (x1 + x2) * 0.5 - nx2 * ((w1 + w2) * 0.5),
      (y1 + y2) * 0.5 - ny2 * ((w1 + w2) * 0.5),
      x1 - mx * w1,
      y1 - my * w1
    );
    ctx.quadraticCurveTo(
      (x0 + x1) * 0.5 - nx1 * ((w0 + w1) * 0.52),
      (y0 + y1) * 0.5 - ny1 * ((w0 + w1) * 0.52),
      x0 - nx1 * w0,
      y0 - ny1 * w0
    );
    ctx.closePath();

    ctx.fillStyle = skinGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(42, 76, 108, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawStarPearl(x, y, t) {
    ctx.save();
    ctx.translate(x, y);

    const pulse = 0.85 + 0.15 * Math.sin(t * 2.4);

    // Soft outer luminous halo
    const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 36 * pulse);
    halo.addColorStop(0, 'rgba(255, 248, 214, 0.82)');
    halo.addColorStop(0.32, 'rgba(135, 245, 235, 0.38)');
    halo.addColorStop(1, 'rgba(90, 200, 235, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 36 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Fine rotating compass / astrolabe filaments
    ctx.save();
    ctx.rotate(t * 0.45);
    ctx.strokeStyle = 'rgba(255, 226, 165, 0.55)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 7, 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.rotate(-t * 0.35);
    ctx.strokeStyle = 'rgba(145, 248, 242, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 5.5, -0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Pearlescent orb core
    const core = ctx.createRadialGradient(-2.5, -2.5, 1, 0, 0, 8.5);
    core.addColorStop(0, '#ffffff');
    core.addColorStop(0.55, '#d8fcf8');
    core.addColorStop(1, '#79d6db');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, 8.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawUpperBody(t, sway, bobY, lookX, lookY, blink) {
    const hipX = 300 + sway * 4;
    const hipY = 498 + bobY;

    const waistX = 300 + sway * 5;
    const waistY = 462 + bobY;

    const shoulderX = 300 + sway * 7;
    const shoulderY = 358 + bobY + Math.sin(t * 1.3) * 1.5;

    const headX = 297 + sway * 9;
    const headY = 288 + bobY + Math.sin(t * 1.3 - 0.3) * 1.8;
    const headTilt = 0.08 + sway * 0.05 + lookX * 0.05;

    // Pearl orb position
    const pearlX = 385 + sway * 8 + Math.sin(t * 1.4) * 2.5;
    const pearlY = 320 + bobY + Math.cos(t * 1.7) * 4;

    // Skin gradient lit softly from the pearl on the right
    const skinGrad = ctx.createRadialGradient(
      pearlX - 24, pearlY + 12, 16,
      shoulderX - 18, shoulderY + 45, 190
    );
    skinGrad.addColorStop(0, '#f4f8fb');
    skinGrad.addColorStop(0.45, '#d9e8f2');
    skinGrad.addColorStop(0.85, '#a8c6db');
    skinGrad.addColorStop(1, '#84a8c4');

    // Back hair layer
    drawHairLayer(headX, headY, t, sway, false);

    // Crown plumes behind brow
    drawCrownPlumes(headX, headY, t, sway);

    // Left arm (resting gently toward hip)
    const lShX = shoulderX - 31;
    const lShY = shoulderY + 4;
    const lElX = lShX - 18 + sway * 4;
    const lElY = lShY + 62;
    const lWrX = hipX - 36 + sway * 5;
    const lWrY = hipY - 12;
    drawArm(lShX, lShY, lElX, lElY, lWrX, lWrY, 9.2, 6.8, 4.6, skinGrad);

    // Delicate left hand fingers
    ctx.beginPath();
    ctx.moveTo(lWrX - 2, lWrY + 2);
    ctx.quadraticCurveTo(lWrX + 1, lWrY + 15, lWrX + 6, lWrY + 18);
    ctx.quadraticCurveTo(lWrX + 8, lWrY + 10, lWrX + 4, lWrY + 1);
    ctx.fillStyle = skinGrad;
    ctx.fill();

    // Torso & Neck
    ctx.beginPath();
    // Left hip -> waist -> ribs -> shoulder -> neck
    ctx.moveTo(hipX - 23.5, hipY + 3);
    ctx.bezierCurveTo(
      hipX - 25, waistY + 18,
      waistX - 18, waistY - 8,
      waistX - 21, waistY - 42
    );
    ctx.bezierCurveTo(
      shoulderX - 27, shoulderY + 32,
      shoulderX - 36, shoulderY + 6,
      shoulderX - 28, shoulderY - 2
    );
    ctx.quadraticCurveTo(shoulderX - 14, shoulderY - 7, headX - 8, shoulderY - 34);
    ctx.lineTo(headX + 10, shoulderY - 34);
    ctx.quadraticCurveTo(shoulderX + 15, shoulderY - 7, shoulderX + 29, shoulderY - 2);
    ctx.bezierCurveTo(
      shoulderX + 37, shoulderY + 6,
      shoulderX + 27, shoulderY + 32,
      waistX + 21, waistY - 42
    );
    ctx.bezierCurveTo(
      waistX + 18, waistY - 8,
      hipX + 25, waistY + 18,
      hipX + 23.5, hipY + 3
    );
    ctx.closePath();

    ctx.fillStyle = skinGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(42, 76, 108, 0.36)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Subtle collarbone & sternum shading
    ctx.beginPath();
    ctx.moveTo(shoulderX - 21, shoulderY + 7);
    ctx.quadraticCurveTo(shoulderX - 7, shoulderY + 13, shoulderX - 1, shoulderY + 10);
    ctx.moveTo(shoulderX + 21, shoulderY + 7);
    ctx.quadraticCurveTo(shoulderX + 7, shoulderY + 13, shoulderX + 1, shoulderY + 10);
    ctx.strokeStyle = 'rgba(110, 148, 178, 0.45)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Luminous sea-scallop / gill-like shimmer on collarbone & waist transition
    for (let side = -1; side <= 1; side += 2) {
      for (let g = 0; g < 3; g++) {
        ctx.beginPath();
        ctx.arc(
          shoulderX + side * (22 + g * 3.5),
          shoulderY + 26 + g * 5.5,
          1.4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(145, 245, 240, 0.65)';
        ctx.fill();
      }
    }

    // Translucent sea-glass tunic / fin drape across the bust & hip transition
    ctx.beginPath();
    ctx.moveTo(waistX - 21, waistY - 40);
    ctx.quadraticCurveTo(waistX, waistY - 26, waistX + 21, waistY - 40);
    ctx.bezierCurveTo(
      waistX + 22, waistY - 22,
      waistX + 12, waistY - 12,
      waistX, waistY - 18
    );
    ctx.bezierCurveTo(
      waistX - 12, waistY - 12,
      waistX - 22, waistY - 22,
      waistX - 21, waistY - 40
    );
    ctx.closePath();
    const shellGrad = ctx.createLinearGradient(waistX - 22, waistY - 42, waistX + 22, waistY - 14);
    shellGrad.addColorStop(0, 'rgba(65, 190, 205, 0.65)');
    shellGrad.addColorStop(0.5, 'rgba(135, 145, 232, 0.55)');
    shellGrad.addColorStop(1, 'rgba(60, 170, 195, 0.65)');
    ctx.fillStyle = shellGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 248, 255, 0.55)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Iridescent hip-fin sash where skin meets scale
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(hipX + side * 20, hipY - 8);
      ctx.quadraticCurveTo(
        hipX + side * 38,
        hipY + 2 + Math.sin(t * 2.1 + side) * 3,
        hipX + side * 30,
        hipY + 24
      );
      ctx.quadraticCurveTo(hipX + side * 22, hipY + 10, hipX + side * 20, hipY - 8);
      ctx.fillStyle = 'rgba(105, 220, 230, 0.36)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(205, 248, 255, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Right arm raised gracefully toward the floating star-pearl
    const rShX = shoulderX + 31;
    const rShY = shoulderY + 4;
    const rElX = rShX + 28 + sway * 4;
    const rElY = rShY + 46;
    const rWrX = pearlX - 2;
    const rWrY = pearlY + 34;
    drawArm(rShX, rShY, rElX, rElY, rWrX, rWrY, 9.0, 6.6, 4.4, skinGrad);

    // Delicate open right hand cradling beneath the pearl
    ctx.beginPath();
    ctx.moveTo(rWrX - 3, rWrY + 1);
    ctx.quadraticCurveTo(rWrX - 10, rWrY - 10, rWrX - 6, rWrY - 15);
    ctx.quadraticCurveTo(rWrX - 2, rWrY - 9, rWrX + 1, rWrY - 14);
    ctx.quadraticCurveTo(rWrX + 6, rWrY - 8, rWrX + 5, rWrY + 1);
    ctx.closePath();
    ctx.fillStyle = skinGrad;
    ctx.fill();

    // Floating star-pearl
    drawStarPearl(pearlX, pearlY, t);

    // Head & Expressive Face
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt);

    // Fin-shaped ear peeking on left
    ctx.beginPath();
    ctx.moveTo(-22, -2);
    ctx.quadraticCurveTo(-36, -12, -33, 6);
    ctx.quadraticCurveTo(-28, 12, -21, 9);
    ctx.closePath();
    ctx.fillStyle = 'rgba(135, 215, 225, 0.65)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(52, 94, 126, 0.4)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Face contour
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.bezierCurveTo(22, -34, 26, -10, 22, 8);
    ctx.bezierCurveTo(18, 25, 7, 34, 0, 35);
    ctx.bezierCurveTo(-8, 34, -19, 25, -23, 8);
    ctx.bezierCurveTo(-26, -10, -22, -34, 0, -34);
    ctx.closePath();

    const faceGrad = ctx.createRadialGradient(14, -4, 4, -4, 4, 42);
    faceGrad.addColorStop(0, '#f7fafd');
    faceGrad.addColorStop(0.55, '#dceaf4');
    faceGrad.addColorStop(1, '#aac7db');
    ctx.fillStyle = faceGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(42, 76, 108, 0.35)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Soft cheek luminescence
    for (let side = -1; side <= 1; side += 2) {
      const blush = ctx.createRadialGradient(side * 12, 8, 0, side * 12, 8, 9);
      blush.addColorStop(0, 'rgba(160, 225, 235, 0.38)');
      blush.addColorStop(1, 'rgba(160, 225, 235, 0)');
      ctx.fillStyle = blush;
      ctx.beginPath();
      ctx.arc(side * 12, 8, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes with gentle gaze and periodic blink
    const eyeOpen = 1 - blink;
    for (let side = -1; side <= 1; side += 2) {
      const ex = side * 10.5 + 1.5;
      const ey = -1;

      // Soft eyebrow
      ctx.beginPath();
      ctx.moveTo(ex - 6, ey - 8.5);
      ctx.quadraticCurveTo(ex, ey - 11, ex + 6, ey - 8);
      ctx.strokeStyle = 'rgba(32, 56, 88, 0.72)';
      ctx.lineWidth = 1.25;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (eyeOpen > 0.12) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(ex, ey, 5.2, 3.6 * eyeOpen, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fcff';
        ctx.fill();
        ctx.clip();

        // Sea-glass iris
        const ix = ex + lookX * 1.6;
        const iy = ey + lookY * 1.1;
        const irisGrad = ctx.createRadialGradient(ix, iy, 0.5, ix, iy, 3.8);
        irisGrad.addColorStop(0, '#133a54');
        irisGrad.addColorStop(0.55, '#2b8a9c');
        irisGrad.addColorStop(1, '#5de5d8');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(ix, iy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Pupil & tiny star catchlight
        ctx.fillStyle = '#0d1d33';
        ctx.beginPath();
        ctx.arc(ix, iy, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ix + 1.1, iy - 1.1, 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Upper lash line
      ctx.beginPath();
      ctx.moveTo(ex - 5.6, ey + 0.5);
      ctx.quadraticCurveTo(ex, ey - 4.4 * eyeOpen + 1.5 * (1 - eyeOpen), ex + 5.6, ey + 0.3);
      ctx.strokeStyle = '#182b48';
      ctx.lineWidth = 1.45;
      ctx.stroke();
    }

    // Delicate nose shadow
    ctx.beginPath();
    ctx.moveTo(1.5, 1);
    ctx.quadraticCurveTo(3.2, 8.5, 1.2, 10.5);
    ctx.strokeStyle = 'rgba(95, 134, 165, 0.48)';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Serene rose-pearl lips
    ctx.beginPath();
    ctx.moveTo(-4.8, 19);
    ctx.quadraticCurveTo(0.8, 21.5, 6.2, 18.8);
    ctx.quadraticCurveTo(0.8, 23.2, -4.8, 19);
    ctx.fillStyle = '#bd8394';
    ctx.fill();

    // Hair cap & parted bangs framing forehead
    ctx.beginPath();
    ctx.moveTo(-24, -4);
    ctx.bezierCurveTo(-28, -26, -12, -40, 2, -39);
    ctx.bezierCurveTo(18, -40, 28, -24, 24, -4);
    ctx.quadraticCurveTo(16, -23, 2, -26);
    ctx.quadraticCurveTo(-14, -22, -24, -4);
    ctx.closePath();

    const capGrad = ctx.createLinearGradient(-20, -38, 20, -6);
    capGrad.addColorStop(0, '#121e3a');
    capGrad.addColorStop(0.65, '#1d375e');
    capGrad.addColorStop(1, '#316a88');
    ctx.fillStyle = capGrad;
    ctx.fill();

    ctx.restore();

    // Front drifting hair locks
    drawHairLayer(headX, headY, t, sway, true);
  }

  function drawBioluminescentMotes(pts, t, pearlX, pearlY) {
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      const u = (m.u + t * 0.03 * m.speed) % 1;
      const idx = Math.min(pts.length - 1, Math.floor(u * (pts.length - 1)));
      const p = pts[idx];

      const drift = Math.sin(t * m.speed * 2 + m.phase) * 10;
      const mx = p.x + p.nx * (m.offset + drift);
      const my = p.y + p.ny * (m.offset + drift) - Math.sin(t * m.speed + m.phase) * 8;

      const alpha = Math.sin(u * Math.PI) * (0.35 + 0.45 * Math.sin(t * 2.3 + m.phase));
      if (alpha <= 0.03) continue;

      const hue = (175 + m.hueShift + t * 20) % 360;
      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, m.radius * 3.2);
      glow.addColorStop(0, `hsla(${hue}, 95%, 80%, ${alpha})`);
      glow.addColorStop(1, `hsla(${hue}, 95%, 65%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mx, my, m.radius * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Two tiny sparks orbiting near the star-pearl
    for (let k = 0; k < 3; k++) {
      const ang = t * (1.2 + k * 0.35) + k * 2.1;
      const sx = pearlX + Math.cos(ang) * (20 + k * 4);
      const sy = pearlY + Math.sin(ang * 1.3) * (14 + k * 3);
      const a = 0.4 + 0.4 * Math.sin(t * 3 + k);
      ctx.fillStyle = `rgba(255, 244, 200, ${a})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function render(now) {
    const t = now * 0.001;

    // Gentle pointer smoothing; drifts back toward calm idle if inactive
    const idleAge = now - pointer.lastMove;
    if (!pointer.active || idleAge > 3500) {
      pointer.tx = Math.sin(t * 0.42) * 0.28;
      pointer.ty = Math.cos(t * 0.31) * 0.18;
    }
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    // Natural periodic blink every ~4.8 seconds
    const blinkCycle = t % 4.8;
    let blink = 0;
    if (blinkCycle > 4.55) {
      const b = (blinkCycle - 4.55) / 0.25;
      blink = Math.sin(b * Math.PI);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, offsetX * dpr, offsetY * dpr);

    const bobY = Math.sin(t * 0.95) * 6.5;
    const sway = Math.sin(t * 0.65) * 0.65 + pointer.x * 0.35;

    const hipX = 300 + sway * 4;
    const hipY = 498 + bobY;

    const spinePts = buildTailSpine(hipX, hipY, t, sway);

    const pearlX = 385 + sway * 8 + Math.sin(t * 1.4) * 2.5;
    const pearlY = 320 + bobY + Math.cos(t * 1.7) * 4;

    drawTail(spinePts, t);
    drawBioluminescentMotes(spinePts, t, pearlX, pearlY);
    drawUpperBody(t, sway, bobY, pointer.x, pointer.y, blink);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Salt-Glass Star-Keeper",
  "statement": "She curled her comb-jelly ribbons beneath the surface like a sleeping lantern, yet kept one tiny drowning star cupped above the tide as if waiting for the sky to remember her name."
}
```