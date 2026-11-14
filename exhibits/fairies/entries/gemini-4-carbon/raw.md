```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Fairy of Loose Ends</title>
<style>
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #070d19;
    touch-action: auto;
    user-select: none;
    -webkit-user-select: none;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="scene"></canvas>
<script>
(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Virtual composition space (2:3 tarot proportion)
  const VW = 600;
  const VH = 900;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  // Subtle pointer influence (optional, never required)
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false };
  window.addEventListener('pointermove', (e) => {
    if (!width || !height) return;
    pointer.tx = Math.max(0, Math.min(1, e.clientX / width));
    pointer.ty = Math.max(0, Math.min(1, e.clientY / height));
    pointer.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.tx = 0.5;
    pointer.ty = 0.5;
  }, { passive: true });

  // Deterministic pseudo-random helper for repeatable organic details
  let seed = 42197;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // Subtle illustration grain pattern (cached once)
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 128;
  grainCanvas.height = 128;
  const gCtx = grainCanvas.getContext('2d');
  const gData = gCtx.createImageData(128, 128);
  for (let i = 0; i < gData.data.length; i += 4) {
    const v = (rand() * 255) | 0;
    gData.data[i] = v;
    gData.data[i + 1] = v;
    gData.data[i + 2] = v + 12 > 255 ? 255 : v + 12;
    gData.data[i + 3] = 11;
  }
  gCtx.putImageData(gData, 0, 0);
  let grainPattern = null;

  // Cached background layer redrawn only on resize
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d', { alpha: false });

  // Pre-generated scene elements
  const stars = Array.from({ length: 85 }, () => ({
    u: rand() * 1.4 - 0.2,
    v: rand() * 0.78,
    r: 0.4 + rand() * 1.35,
    phase: rand() * Math.PI * 2,
    speed: 0.6 + rand() * 1.6,
    warm: rand() > 0.72
  }));

  const willowStrands = Array.from({ length: 18 }, (_, i) => {
    const side = i < 9 ? -1 : 1;
    const idx = i % 9;
    const baseX = side < 0 ? -30 + idx * 28 + rand() * 14 : VW + 30 - idx * 28 - rand() * 14;
    const len = 150 + (8 - idx) * 26 + rand() * 75;
    const leaves = Math.floor(len / 20);
    return {
      x: baseX,
      len,
      swayAmp: 6 + rand() * 9,
      phase: rand() * Math.PI * 2,
      speed: 0.45 + rand() * 0.35,
      side,
      leaves,
      depth: idx < 4 ? 1 : 0
    };
  });

  const motes = Array.from({ length: 48 }, () => ({
    x: rand() * VW,
    y: rand() * VH,
    r: 0.8 + rand() * 2.4,
    vx: (rand() - 0.5) * 8,
    vy: -6 - rand() * 14,
    phase: rand() * Math.PI * 2,
    hue: rand() > 0.35 ? 'gold' : 'teal',
    depth: rand()
  }));

  const threadSparks = Array.from({ length: 24 }, (_, i) => ({
    strand: i % 4,
    progress: rand(),
    speed: 0.08 + rand() * 0.12,
    driftX: (rand() - 0.5) * 34,
    driftY: -22 - rand() * 45,
    size: 0.9 + rand() * 1.7,
    phase: rand() * Math.PI * 2
  }));

  const ferns = [
    { x: 35, y: 885, angle: -0.95, len: 145, scale: 1.0, phase: 0.2 },
    { x: 85, y: 905, angle: -1.18, len: 120, scale: 0.85, phase: 1.4 },
    { x: 575, y: 865, angle: -2.25, len: 135, scale: 0.95, phase: 2.3 },
    { x: 520, y: 905, angle: -2.05, len: 110, scale: 0.8, phase: 0.8 },
    { x: 325, y: 910, angle: -1.65, len: 95, scale: 0.72, phase: 3.1 }
  ];

  // Loose silk threads rising from the spool (anchor near x:428, y:688)
  const looseStrands = [
    {
      ox: -6, oy: -18,
      pts: [
        { x: 405, y: 632 },
        { x: 372, y: 562 },
        { x: 344, y: 492 },
        { x: 318, y: 432 }
      ],
      width: 2.3,
      colorA: '#ffd98e',
      colorB: '#ff9d6c',
      freq: 0.95,
      phase: 0.0
    },
    {
      ox: 8, oy: -20,
      pts: [
        { x: 446, y: 620 },
        { x: 432, y: 540 },
        { x: 396, y: 468 },
        { x: 376, y: 392 }
      ],
      width: 1.9,
      colorA: '#ffeab3',
      colorB: '#f4b56a',
      freq: 1.12,
      phase: 1.7
    },
    {
      ox: 16, oy: -12,
      pts: [
        { x: 472, y: 642 },
        { x: 486, y: 575 },
        { x: 466, y: 505 },
        { x: 450, y: 448 }
      ],
      width: 1.5,
      colorA: '#ffd089',
      colorB: '#9ef3e6',
      freq: 0.82,
      phase: 3.2
    },
    {
      ox: -15, oy: -8,
      pts: [
        { x: 386, y: 662 },
        { x: 350, y: 618 },
        { x: 322, y: 564 },
        { x: 294, y: 522 }
      ],
      width: 1.6,
      colorA: '#ffca80',
      colorB: '#e88388',
      freq: 1.25,
      phase: 4.5
    },
    // One relaxed tail draped down across the mossy stone
    {
      ox: -22, oy: 18,
      draped: true,
      pts: [
        { x: 385, y: 724 },
        { x: 356, y: 748 },
        { x: 334, y: 772 },
        { x: 314, y: 786 }
      ],
      width: 1.8,
      colorA: '#e8b36b',
      colorB: '#c97c5d',
      freq: 0.5,
      phase: 2.1
    }
  ];

  function paintStaticBackground() {
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    bgCtx.save();
    bgCtx.scale(dpr, dpr);

    // Rich nocturnal twilight wash across full viewport
    const skyGrad = bgCtx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0.0, '#060c18');
    skyGrad.addColorStop(0.32, '#0c1a2e');
    skyGrad.addColorStop(0.66, '#13273b');
    skyGrad.addColorStop(0.86, '#141e2e');
    skyGrad.addColorStop(1.0, '#070b14');
    bgCtx.fillStyle = skyGrad;
    bgCtx.fillRect(0, 0, width, height);

    bgCtx.translate(offsetX, offsetY);
    bgCtx.scale(scale, scale);

    // Soft diffused lunar glow in upper-center twilight
    const moonGlow = bgCtx.createRadialGradient(255, 295, 18, 265, 320, 390);
    moonGlow.addColorStop(0.0, 'rgba(168, 214, 229, 0.24)');
    moonGlow.addColorStop(0.32, 'rgba(89, 146, 176, 0.14)');
    moonGlow.addColorStop(0.68, 'rgba(35, 64, 94, 0.06)');
    moonGlow.addColorStop(1.0, 'rgba(10, 20, 36, 0)');
    bgCtx.fillStyle = moonGlow;
    bgCtx.fillRect(-300, -200, VW + 600, VH + 400);

    // Warm secondary glow from the spool region in lower right
    const warmAmbience = bgCtx.createRadialGradient(430, 690, 10, 420, 660, 310);
    warmAmbience.addColorStop(0.0, 'rgba(255, 188, 104, 0.20)');
    warmAmbience.addColorStop(0.45, 'rgba(214, 118, 75, 0.08)');
    warmAmbience.addColorStop(1.0, 'rgba(20, 18, 34, 0)');
    bgCtx.fillStyle = warmAmbience;
    bgCtx.fillRect(-200, 200, VW + 400, VH);

    // Distant misty woodland silhouettes
    bgCtx.fillStyle = 'rgba(9, 19, 33, 0.55)';
    bgCtx.beginPath();
    bgCtx.moveTo(-250, VH + 100);
    bgCtx.lineTo(-250, 635);
    for (let x = -250; x <= VW + 250; x += 45) {
      const h = Math.sin(x * 0.014) * 32 + Math.cos(x * 0.037) * 18;
      bgCtx.lineTo(x, 645 + h);
    }
    bgCtx.lineTo(VW + 250, VH + 100);
    bgCtx.closePath();
    bgCtx.fill();

    // Soft dark vignette around outer atmosphere (organic lighting, never a frame)
    const vig = bgCtx.createRadialGradient(VW * 0.48, VH * 0.46, 170, VW * 0.5, VH * 0.5, 620);
    vig.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(0.72, 'rgba(4, 8, 16, 0.18)');
    vig.addColorStop(1.0, 'rgba(3, 6, 13, 0.58)');
    bgCtx.fillStyle = vig;
    bgCtx.fillRect(-300, -300, VW + 600, VH + 600);

    bgCtx.restore();
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));

    // Fit 2:3 composition comfortably while background extends edge-to-edge
    const sx = width / VW;
    const sy = height / VH;
    // Blend gently toward cover when aspect ratio is very close to 2:3, contain when extreme
    const ratioDiff = Math.abs((width / height) - (VW / VH));
    scale = ratioDiff < 0.14 ? Math.max(sx, sy) : Math.min(sx, sy) * 1.02;
    offsetX = (width - VW * scale) * 0.5;
    offsetY = (height - VH * scale) * 0.5;

    grainPattern = ctx.createPattern(grainCanvas, 'repeat');
    paintStaticBackground();
  }

  window.addEventListener('resize', resize);
  resize();

  // Draw celestial air-current rings subtly turning behind the fairy
  function drawCelestialCurrents(t, px, py) {
    ctx.save();
    ctx.translate(238 + px * -10, 315 + py * -8);

    // Pale crescent moon nestled in twilight mist
    ctx.save();
    ctx.translate(-78, -145);
    ctx.rotate(-0.38);
    const moonGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 42);
    moonGrad.addColorStop(0, 'rgba(232, 245, 250, 0.92)');
    moonGrad.addColorStop(0.65, 'rgba(182, 218, 232, 0.45)');
    moonGrad.addColorStop(1, 'rgba(140, 190, 215, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(238, 247, 252, 0.86)';
    ctx.beginPath();
    ctx.arc(0, 0, 23, 0, Math.PI * 2);
    ctx.arc(9, -4, 20.5, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();

    // Whisper-faint astrolabe air-rings
    ctx.strokeStyle = 'rgba(186, 222, 235, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const r = 122 + i * 44;
      const a0 = t * (0.04 - i * 0.025) + i * 1.9;
      ctx.beginPath();
      ctx.arc(0, 0, r, a0, a0 + Math.PI * (1.15 - i * 0.2));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r, a0 + Math.PI, a0 + Math.PI * (1.7 - i * 0.18));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawStarsAndMist(t, px, py) {
    // Twinkling stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * s.speed + s.phase), 2);
      const sx = s.u * VW + px * -6;
      const sy = s.v * VH + py * -5;
      ctx.fillStyle = s.warm
        ? `rgba(255, 230, 186, ${twinkle * 0.8})`
        : `rgba(202, 234, 248, ${twinkle * 0.75})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.r > 1.4 && twinkle > 0.72) {
        ctx.strokeStyle = s.warm
          ? `rgba(255, 228, 180, ${twinkle * 0.35})`
          : `rgba(195, 232, 250, ${twinkle * 0.32})`;
        ctx.lineWidth = 0.7;
        const arm = s.r * 3.6;
        ctx.beginPath();
        ctx.moveTo(sx - arm, sy);
        ctx.lineTo(sx + arm, sy);
        ctx.moveTo(sx, sy - arm);
        ctx.lineTo(sx, sy + arm);
        ctx.stroke();
      }
    }

    // Drifting twilight mist bands over lower water
    for (let i = 0; i < 3; i++) {
      const my = 710 + i * 52;
      const drift = Math.sin(t * 0.22 + i * 2.1) * 45;
      const mGrad = ctx.createLinearGradient(0, my - 38, 0, my + 42);
      mGrad.addColorStop(0, 'rgba(92, 145, 168, 0)');
      mGrad.addColorStop(0.5, `rgba(104, 158, 180, ${0.065 - i * 0.012})`);
      mGrad.addColorStop(1, 'rgba(20, 38, 56, 0)');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.ellipse(VW * 0.48 + drift, my, 420, 38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawWaterAndStone(t, px, py) {
    ctx.save();
    ctx.translate(px * 6, py * 4);

    // Still nocturnal mirror pool at very bottom
    const poolGrad = ctx.createLinearGradient(0, 760, 0, VH + 80);
    poolGrad.addColorStop(0, 'rgba(13, 28, 43, 0.85)');
    poolGrad.addColorStop(0.45, 'rgba(9, 18, 31, 0.96)');
    poolGrad.addColorStop(1, '#050912');
    ctx.fillStyle = poolGrad;
    ctx.fillRect(-200, 765, VW + 400, 240);

    // Shimmering water ripples catching moonlight (left) & spool amber light (right)
    for (let i = 0; i < 14; i++) {
      const ry = 780 + i * 8.5;
      const wave = Math.sin(t * 1.1 + i * 0.9) * 14;
      const alpha = 0.08 + 0.07 * Math.sin(t * 1.6 + i);
      // Moonlight reflection
      ctx.strokeStyle = `rgba(164, 216, 232, ${alpha})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(115 + wave - i * 4, ry);
      ctx.lineTo(235 + wave + i * 3, ry);
      ctx.stroke();

      // Warm golden spool reflection
      ctx.strokeStyle = `rgba(255, 192, 112, ${alpha * 1.25})`;
      ctx.beginPath();
      ctx.moveTo(355 - wave * 0.7, ry + 3);
      ctx.lineTo(485 - wave * 0.7, ry + 3);
      ctx.stroke();
    }

    // Moss-draped twilight boulder on the lower right (pedestal of the spool)
    const rockGrad = ctx.createLinearGradient(310, 695, 520, 880);
    rockGrad.addColorStop(0, '#1d313a');
    rockGrad.addColorStop(0.35, '#13222b');
    rockGrad.addColorStop(0.8, '#0b131d');
    rockGrad.addColorStop(1, '#060a12');
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.moveTo(272, 855);
    ctx.bezierCurveTo(288, 792, 326, 742, 372, 724);
    ctx.bezierCurveTo(414, 708, 476, 706, 522, 728);
    ctx.bezierCurveTo(568, 750, 610, 795, 635, 865);
    ctx.lineTo(635, 940);
    ctx.lineTo(260, 940);
    ctx.closePath();
    ctx.fill();

    // Velvet cushion moss catching warm amber light from the spool above
    const mossGrad = ctx.createRadialGradient(428, 712, 8, 430, 735, 145);
    mossGrad.addColorStop(0, '#557258');
    mossGrad.addColorStop(0.35, '#2b4a43');
    mossGrad.addColorStop(0.75, '#172d31');
    mossGrad.addColorStop(1, 'rgba(15, 28, 34, 0)');
    ctx.fillStyle = mossGrad;
    ctx.beginPath();
    ctx.moveTo(322, 768);
    ctx.bezierCurveTo(348, 730, 392, 710, 442, 712);
    ctx.bezierCurveTo(492, 714, 535, 730, 562, 766);
    ctx.bezierCurveTo(518, 782, 468, 774, 422, 782);
    ctx.bezierCurveTo(378, 789, 344, 782, 322, 768);
    ctx.closePath();
    ctx.fill();

    // Tiny bioluminescent moss-spores / cup fungi on rock edge
    const mushrooms = [
      { x: 344, y: 760, s: 1.0, tilt: -0.25 },
      { x: 356, y: 766, s: 0.72, tilt: 0.12 },
      { x: 516, y: 748, s: 0.9, tilt: 0.28 },
      { x: 529, y: 756, s: 0.65, tilt: 0.42 }
    ];
    for (const m of mushrooms) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.tilt + Math.sin(t * 1.2 + m.x) * 0.03);
      ctx.scale(m.s, m.s);
      ctx.strokeStyle = '#689c94';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-2, -9, 0, -16);
      ctx.stroke();

      const capGlow = ctx.createRadialGradient(0, -17, 1, 0, -17, 11);
      capGlow.addColorStop(0, 'rgba(170, 248, 232, 0.85)');
      capGlow.addColorStop(0.5, 'rgba(84, 196, 184, 0.35)');
      capGlow.addColorStop(1, 'rgba(40, 120, 120, 0)');
      ctx.fillStyle = capGlow;
      ctx.beginPath();
      ctx.arc(0, -17, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#aef7e6';
      ctx.beginPath();
      ctx.ellipse(0, -16, 6.2, 3.6, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw the Wooden & Brass Weaver's Spool and its Rising Loose Ends
  function getStrandPoints(strand, t) {
    const base = { x: 428 + strand.ox, y: 688 + strand.oy };
    const result = [base];
    for (let i = 0; i < strand.pts.length; i++) {
      const p = strand.pts[i];
      const weight = (i + 1) / strand.pts.length;
      const swayX = strand.draped
        ? Math.sin(t * strand.freq + strand.phase + i) * 1.5 * weight
        : Math.sin(t * strand.freq + strand.phase + i * 0.85) * 15 * weight +
          (pointer.x - 0.5) * -14 * weight;
      const swayY = strand.draped
        ? Math.cos(t * strand.freq + strand.phase) * 0.8 * weight
        : Math.cos(t * strand.freq * 0.8 + strand.phase + i) * 7 * weight;
      result.push({ x: p.x + swayX, y: p.y + swayY });
    }
    return result;
  }

  function samplePolyline(pts, u) {
    const total = pts.length - 1;
    const scaled = Math.max(0, Math.min(0.9999, u)) * total;
    const idx = Math.floor(scaled);
    const f = scaled - idx;
    const a = pts[idx];
    const b = pts[idx + 1];
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f
    };
  }

  function drawSpoolAndLooseEnds(t, px, py) {
    ctx.save();
    ctx.translate(px * 6, py * 4);

    // Contact shadow on moss under spool
    ctx.fillStyle = 'rgba(5, 11, 16, 0.68)';
    ctx.beginPath();
    ctx.ellipse(432, 725, 58, 15, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Warm golden aura around the wound silk skein
    const pulse = 0.88 + 0.12 * Math.sin(t * 1.9);
    const skeinAura = ctx.createRadialGradient(430, 688, 8, 430, 688, 92 * pulse);
    skeinAura.addColorStop(0, 'rgba(255, 214, 132, 0.42)');
    skeinAura.addColorStop(0.45, 'rgba(242, 146, 78, 0.16)');
    skeinAura.addColorStop(1, 'rgba(242, 146, 78, 0)');
    ctx.fillStyle = skeinAura;
    ctx.beginPath();
    ctx.arc(430, 688, 95, 0, Math.PI * 2);
    ctx.fill();

    // Draw tilted antique wooden & brass weaver's spool
    ctx.save();
    ctx.translate(430, 690);
    ctx.rotate(0.24); // resting at a graceful tilt on the mossy rock

    // Back wooden flange (upper/right in tilted space)
    const woodDark = ctx.createLinearGradient(-42, -46, 42, -26);
    woodDark.addColorStop(0, '#2c1814');
    woodDark.addColorStop(0.5, '#593326');
    woodDark.addColorStop(1, '#261411');
    ctx.fillStyle = woodDark;
    ctx.beginPath();
    ctx.ellipse(0, -34, 41, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tarnished brass rim on upper flange
    ctx.strokeStyle = '#d4a359';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -35, 41, 12.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dark hollow spindle hole at top center
    ctx.fillStyle = '#140b0a';
    ctx.beginPath();
    ctx.ellipse(0, -35, 11, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wound glowing golden-amber silk core
    const silkGrad = ctx.createLinearGradient(-32, 0, 34, 0);
    silkGrad.addColorStop(0.0, '#8c452b');
    silkGrad.addColorStop(0.25, '#e08b46');
    silkGrad.addColorStop(0.52, '#ffe39e');
    silkGrad.addColorStop(0.78, '#dfa053');
    silkGrad.addColorStop(1.0, '#6e3422');
    ctx.fillStyle = silkGrad;
    ctx.beginPath();
    ctx.moveTo(-31, -29);
    ctx.bezierCurveTo(-35, -8, -35, 12, -31, 31);
    ctx.ellipse(0, 31, 31, 10, 0, Math.PI, 0, true);
    ctx.bezierCurveTo(35, 12, 35, -8, 31, -29);
    ctx.ellipse(0, -29, 31, 9.5, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();

    // Fine individual wrapped silk thread ridges along the bobbin core
    for (let y = -24; y <= 28; y += 3.6) {
      const bulge = 31 + Math.cos((y / 28) * 1.2) * 2.5;
      const shimmer = 0.35 + 0.3 * Math.sin(y * 0.9 + t * 2.2);
      ctx.strokeStyle = `rgba(255, 242, 198, ${shimmer})`;
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.ellipse(0, y, bulge, 8.8, 0, 0.12, Math.PI - 0.12);
      ctx.stroke();
    }

    // Lower wooden flange (front/base)
    const flangeSide = ctx.createLinearGradient(-44, 28, 44, 44);
    flangeSide.addColorStop(0, '#241210');
    flangeSide.addColorStop(0.42, '#693c2c');
    flangeSide.addColorStop(0.7, '#875138');
    flangeSide.addColorStop(1, '#241210');
    ctx.fillStyle = flangeSide;
    ctx.beginPath();
    ctx.ellipse(0, 37, 43, 14, 0, 0, Math.PI);
    ctx.lineTo(-43, 30);
    ctx.ellipse(0, 30, 43, 13.5, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Brass decorative ring on lower flange
    ctx.strokeStyle = '#e5b869';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 32, 42.5, 13, 0, 0.05, Math.PI - 0.05);
    ctx.stroke();

    ctx.restore(); // end tilted spool local space

    // Draw the Loose Ends rising weightlessly into the twilight air
    const computedStrands = [];
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let s = 0; s < looseStrands.length; s++) {
      const strand = looseStrands[s];
      const pts = getStrandPoints(strand, t);
      computedStrands.push(pts);

      const first = pts[0];
      const last = pts[pts.length - 1];

      // Soft outer luminescence along each silk filament
      const glowGrad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
      glowGrad.addColorStop(0, 'rgba(255, 196, 108, 0.35)');
      glowGrad.addColorStop(0.7, 'rgba(255, 220, 150, 0.22)');
      glowGrad.addColorStop(1, 'rgba(180, 240, 235, 0)');
      ctx.strokeStyle = glowGrad;
      ctx.lineWidth = strand.width * 4.2;
      drawSmoothCurve(pts);
      ctx.stroke();

      // Crisp luminous silk core
      const coreGrad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
      coreGrad.addColorStop(0, strand.colorA);
      coreGrad.addColorStop(0.65, strand.colorB);
      coreGrad.addColorStop(1, 'rgba(255, 246, 220, 0.15)');
      ctx.strokeStyle = coreGrad;
      ctx.lineWidth = strand.width;
      drawSmoothCurve(pts);
      ctx.stroke();

      // Delicate frayed triple micro-wisps at the floating tip of rising threads
      if (!strand.draped) {
        const prev = pts[pts.length - 2];
        const dx = last.x - prev.x;
        const dy = last.y - prev.y;
        const baseAng = Math.atan2(dy, dx);
        for (let f = -1; f <= 1; f++) {
          const wispAng = baseAng + f * 0.36 + Math.sin(t * 2.3 + s + f) * 0.14;
          const wispLen = 14 + (1 - Math.abs(f)) * 7;
          ctx.strokeStyle = 'rgba(255, 238, 196, 0.52)';
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.quadraticCurveTo(
            last.x + Math.cos(wispAng) * wispLen * 0.55,
            last.y + Math.sin(wispAng) * wispLen * 0.55,
            last.x + Math.cos(wispAng + f * 0.2) * wispLen,
            last.y + Math.sin(wispAng + f * 0.2) * wispLen
          );
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Sparks detaching from the frayed loose ends and drifting upward
    for (let i = 0; i < threadSparks.length; i++) {
      const sp = threadSparks[i];
      const u = (sp.progress + t * sp.speed) % 1;
      const pts = computedStrands[sp.strand];
      if (!pts) continue;
      let x, y, alpha;
      if (u < 0.68) {
        // Travelling up along the silk filament
        const pos = samplePolyline(pts, u / 0.68);
        x = pos.x + Math.sin(t * 3 + sp.phase) * 2.5;
        y = pos.y;
        alpha = Math.sin((u / 0.68) * Math.PI) * 0.85;
      } else {
        // Floating free from the frayed tip into open air
        const free = (u - 0.68) / 0.32;
        const tip = pts[pts.length - 1];
        x = tip.x + sp.driftX * free + Math.sin(t * 2.1 + sp.phase) * 6 * free;
        y = tip.y + sp.driftY * free;
        alpha = (1 - free) * 0.9;
      }

      ctx.fillStyle = `rgba(255, 232, 175, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, sp.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawSmoothCurve(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) * 0.5;
      const yc = (pts[i].y + pts[i + 1].y) * 0.5;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    const n = pts.length - 1;
    ctx.lineTo(pts[n].x, pts[n].y);
  }

  // Draw one translucent stained-glass / luna-moth wing
  function drawWing(isUpper, side, flapScale, tintBoost, t) {
    ctx.save();
    ctx.scale(side * flapScale, 1);

    if (isUpper) {
      // Sweeping forewing
      ctx.rotate(-0.26 + Math.sin(t * 1.8) * 0.04);
      const wg = ctx.createLinearGradient(0, 0, -175, -135);
      wg.addColorStop(0.0, `rgba(92, 186, 198, ${0.58 + tintBoost})`);
      wg.addColorStop(0.45, `rgba(164, 225, 224, ${0.46 + tintBoost})`);
      wg.addColorStop(0.78, `rgba(244, 194, 168, ${0.50 + tintBoost})`);
      wg.addColorStop(1.0, `rgba(255, 232, 182, ${0.68 + tintBoost})`);

      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-38, -56, -112, -128, -172, -132);
      ctx.bezierCurveTo(-194, -132, -196, -98, -178, -68);
      ctx.bezierCurveTo(-158, -34, -148, 8, -112, 26);
      ctx.bezierCurveTo(-72, 44, -26, 24, 0, 6);
      ctx.closePath();
      ctx.fill();

      // Iridescent wing rim
      ctx.strokeStyle = 'rgba(255, 234, 188, 0.72)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Leading costal edge dark-velvet & gold accent
      ctx.strokeStyle = 'rgba(54, 42, 76, 0.65)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.bezierCurveTo(-38, -56, -112, -128, -174, -131);
      ctx.stroke();

      // Delicate golden wing venation
      ctx.strokeStyle = 'rgba(255, 238, 198, 0.42)';
      ctx.lineWidth = 0.95;
      const veins = [
        [[-22, -18], [-88, -74], [-168, -108]],
        [[-26, -12], [-96, -50], [-166, -68]],
        [[-24, -4], [-86, -18], [-146, -24]],
        [[-20, 4], [-68, 12], [-116, 18]]
      ];
      for (const v of veins) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(v[0][0], v[0][1], v[1][0], v[1][1], v[2][0], v[2][1]);
        ctx.stroke();
      }

      // Opalescent crescent eye-spot (lunule)
      ctx.save();
      ctx.translate(-108, -56);
      ctx.rotate(-0.35);
      ctx.fillStyle = 'rgba(28, 44, 68, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 224, 166, 0.85)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(198, 248, 242, 0.82)';
      ctx.beginPath();
      ctx.arc(-2, -1, 5.5, 0.4, Math.PI * 1.55);
      ctx.fill();
      ctx.restore();
    } else {
      // Elongated swallowtail / luna hindwing
      ctx.rotate(0.18 + Math.cos(t * 1.8) * 0.05);
      const hg = ctx.createLinearGradient(0, 0, -115, 168);
      hg.addColorStop(0.0, `rgba(82, 164, 188, ${0.52 + tintBoost})`);
      hg.addColorStop(0.5, `rgba(148, 212, 214, ${0.44 + tintBoost})`);
      hg.addColorStop(0.82, `rgba(238, 182, 158, ${0.46 + tintBoost})`);
      hg.addColorStop(1.0, `rgba(255, 226, 168, ${0.66 + tintBoost})`);

      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(-48, 12, -112, 34, -122, 78);
      ctx.bezierCurveTo(-130, 114, -96, 132, -98, 174);
      ctx.bezierCurveTo(-99, 198, -82, 208, -74, 188);
      ctx.bezierCurveTo(-64, 160, -68, 126, -44, 98);
      ctx.bezierCurveTo(-24, 74, -8, 38, 0, 12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 232, 186, 0.66)';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Hindwing veins flowing down into the swallowtail ribbon
      ctx.strokeStyle = 'rgba(255, 238, 198, 0.38)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-42, 32, -88, 62, -112, 86);
      ctx.moveTo(0, 10);
      ctx.bezierCurveTo(-38, 48, -78, 106, -86, 186);
      ctx.moveTo(0, 11);
      ctx.bezierCurveTo(-24, 46, -46, 78, -56, 112);
      ctx.stroke();

      // Hindwing pearl lunule
      ctx.fillStyle = 'rgba(255, 234, 188, 0.72)';
      ctx.beginPath();
      ctx.arc(-68, 68, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(42, 68, 92, 0.65)';
      ctx.beginPath();
      ctx.arc(-67, 69, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw the Fairy hovering in the upper-left / center-left twilight space
  // Nearby the spool & rising threads, never sitting on or attached to them
  function drawFairy(t, px, py) {
    const hoverX = 216 + Math.sin(t * 0.85) * 7 + px * -12;
    const hoverY = 338 + Math.sin(t * 1.45) * 11 + py * -9;

    ctx.save();
    ctx.translate(hoverX, hoverY);

    // Ethereal soft halo around the fairy
    const fairyGlow = ctx.createRadialGradient(8, 15, 10, 8, 15, 185);
    fairyGlow.addColorStop(0, 'rgba(182, 236, 240, 0.22)');
    fairyGlow.addColorStop(0.5, 'rgba(112, 178, 202, 0.08)');
    fairyGlow.addColorStop(1, 'rgba(30, 60, 90, 0)');
    ctx.fillStyle = fairyGlow;
    ctx.beginPath();
    ctx.arc(8, 15, 185, 0, Math.PI * 2);
    ctx.fill();

    // Wing beat kinematics (smooth 3D foreshortening)
    const beatMain = Math.sin(t * 2.05);
    const beatSub = Math.sin(t * 2.05 - 0.55);
    const leftFlapU = 0.76 + 0.24 * beatMain;
    const leftFlapL = 0.74 + 0.24 * beatSub;
    const rightFlapU = 0.44 + 0.20 * Math.sin(t * 2.05 + 0.25);
    const rightFlapL = 0.42 + 0.20 * Math.sin(t * 2.05 - 0.3);

    // Far (right-side) wings behind body
    ctx.save();
    ctx.translate(10, -16);
    drawWing(false, -1, rightFlapL, -0.1, t);
    drawWing(true, -1, rightFlapU, -0.08, t);
    ctx.restore();

    // Near (left-side) wings behind shoulder
    ctx.save();
    ctx.translate(-4, -14);
    drawWing(false, 1, leftFlapL, 0.04, t);
    drawWing(true, 1, leftFlapU, 0.06, t);
    ctx.restore();

    // Back layer of flowing midnight hair drifting in weightless twilight
    const hairWave = Math.sin(t * 1.35) * 9;
    ctx.fillStyle = '#0f1b33';
    ctx.beginPath();
    ctx.moveTo(-8, -56);
    ctx.bezierCurveTo(-48, -42, -78 + hairWave, -4, -92 + hairWave * 1.3, 38);
    ctx.bezierCurveTo(-62 + hairWave, 26, -38, 6, -12, -22);
    ctx.closePath();
    ctx.fill();

    // Far leg (gently bent at knee, suspended in air)
    ctx.fillStyle = '#9bbbc9';
    ctx.beginPath();
    ctx.moveTo(6, 76);
    ctx.quadraticCurveTo(28, 118, 16, 154);
    ctx.quadraticCurveTo(10, 174, 20, 188);
    ctx.quadraticCurveTo(9, 182, 7, 164);
    ctx.quadraticCurveTo(13, 124, -4, 82);
    ctx.closePath();
    ctx.fill();

    // Near leg (gracefully extended downward with pointed fae foot)
    const legSway = Math.sin(t * 1.15 + 0.6) * 4;
    const legGrad = ctx.createLinearGradient(-12, 75, -6, 212);
    legGrad.addColorStop(0, '#bedae4');
    legGrad.addColorStop(0.65, '#d8ecf2');
    legGrad.addColorStop(1, '#ffe5be'); // warm light on toes from spool below
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(-12, 76);
    ctx.bezierCurveTo(-18, 122, -16 + legSway, 162, -8 + legSway, 198);
    ctx.quadraticCurveTo(-3 + legSway, 214, 4 + legSway, 220);
    ctx.quadraticCurveTo(-1 + legSway, 202, -1 + legSway, 188);
    ctx.bezierCurveTo(-4 + legSway, 152, 2, 116, 6, 76);
    ctx.closePath();
    ctx.fill();

    // Flowing layered petal-mantle / twilight tunic
    const dressSway = Math.sin(t * 1.3) * 8;
    // Deep under-skirt layer
    const skirtBack = ctx.createLinearGradient(0, 10, 10, 138);
    skirtBack.addColorStop(0, '#13213c');
    skirtBack.addColorStop(0.7, '#1d3854');
    skirtBack.addColorStop(1, '#3c6278');
    ctx.fillStyle = skirtBack;
    ctx.beginPath();
    ctx.moveTo(-14, 24);
    ctx.bezierCurveTo(-42, 68, -56 + dressSway, 108, -42 + dressSway * 1.2, 146);
    ctx.quadraticCurveTo(-12 + dressSway, 126, 8 + dressSway * 0.8, 148);
    ctx.quadraticCurveTo(28 + dressSway * 0.6, 122, 42 + dressSway * 0.9, 132);
    ctx.bezierCurveTo(36, 88, 24, 52, 12, 24);
    ctx.closePath();
    ctx.fill();

    // Overlapping botanical leaf-petal panels on gown catching warm rim light
    const dressFront = ctx.createLinearGradient(-18, -18, 28, 118);
    dressFront.addColorStop(0.0, '#1c3150');
    dressFront.addColorStop(0.55, '#294c69');
    dressFront.addColorStop(0.88, '#4e7c8c');
    dressFront.addColorStop(1.0, '#d8b48a');
    ctx.fillStyle = dressFront;
    ctx.beginPath();
    ctx.moveTo(-13, -18);
    ctx.quadraticCurveTo(2, -24, 14, -14);
    ctx.bezierCurveTo(18, 8, 14, 24, 13, 34);
    ctx.bezierCurveTo(28, 64, 34 + dressSway * 0.6, 94, 24 + dressSway * 0.8, 120);
    ctx.quadraticCurveTo(2 + dressSway * 0.5, 98, -8 + dressSway * 0.7, 124);
    ctx.bezierCurveTo(-28 + dressSway * 0.8, 96, -28, 62, -13, 32);
    ctx.closePath();
    ctx.fill();

    // Fine golden-silk trim along petal hems
    ctx.strokeStyle = 'rgba(255, 222, 162, 0.58)';
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(-24 + dressSway * 0.6, 102);
    ctx.quadraticCurveTo(-8 + dressSway * 0.7, 124, 6 + dressSway * 0.6, 106);
    ctx.quadraticCurveTo(18 + dressSway * 0.7, 118, 28 + dressSway * 0.7, 108);
    ctx.stroke();

    // Gossamer collar / shoulder mantle
    ctx.fillStyle = 'rgba(154, 214, 222, 0.45)';
    ctx.beginPath();
    ctx.moveTo(-15, -18);
    ctx.quadraticCurveTo(-30, -4, -24, 14);
    ctx.quadraticCurveTo(-6, 4, 2, 16);
    ctx.quadraticCurveTo(16, 4, 20, -10);
    ctx.quadraticCurveTo(4, -22, -15, -18);
    ctx.fill();

    // Right (far) arm extended gracefully toward the open twilight space
    // Poised in quiet curiosity toward the floating loose ends, never touching them
    const armReach = Math.sin(t * 1.4) * 3.5;
    const farArmGrad = ctx.createLinearGradient(12, -12, 78, 34);
    farArmGrad.addColorStop(0, '#b8d6e2');
    farArmGrad.addColorStop(1, '#ffe5be');
    ctx.strokeStyle = farArmGrad;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6.2;
    ctx.beginPath();
    ctx.moveTo(12, -12);
    ctx.quadraticCurveTo(38, 12, 66, 22 + armReach);
    ctx.stroke();

    // Delicate open hand & fingers poised near a floating spark
    const hx = 68;
    const hy = 22 + armReach;
    ctx.fillStyle = '#ffe5be';
    ctx.beginPath();
    ctx.ellipse(hx + 4, hy + 1, 5.5, 3.4, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe8c4';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(hx + 7, hy);
    ctx.quadraticCurveTo(hx + 15, hy + 1, hx + 20, hy + 5);
    ctx.moveTo(hx + 7, hy + 2);
    ctx.quadraticCurveTo(hx + 14, hy + 5, hx + 18, hy + 10);
    ctx.moveTo(hx + 5, hy - 2);
    ctx.quadraticCurveTo(hx + 11, hy - 5, hx + 15, hy - 4);
    ctx.stroke();

    // Tiny unattached spark hovering in the air beyond the fingertips
    const orbPulse = 0.65 + 0.35 * Math.sin(t * 3.1);
    const orbX = hx + 33 + Math.sin(t * 1.9) * 4;
    const orbY = hy + 12 + Math.cos(t * 2.3) * 4;
    const orbGrad = ctx.createRadialGradient(orbX, orbY, 0.5, orbX, orbY, 13);
    orbGrad.addColorStop(0, `rgba(255, 245, 205, ${orbPulse})`);
    orbGrad.addColorStop(0.45, `rgba(255, 202, 122, ${orbPulse * 0.45})`);
    orbGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(orbX, orbY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Slender neck & head (with gentle contemplative head-turn / tilt)
    const headTilt = 0.16 + Math.sin(t * 0.92) * 0.065 + (pointer.y - 0.5) * 0.08;
    ctx.fillStyle = '#cbe3ec';
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(5, -17);
    ctx.lineTo(6, -32);
    ctx.lineTo(-3, -32);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(2, -44);
    ctx.rotate(headTilt);

    // Moonlit porcelain face with warm amber rim-glow on lower-right cheek
    const skinGrad = ctx.createLinearGradient(-12, -16, 16, 16);
    skinGrad.addColorStop(0.0, '#d2e9f2');
    skinGrad.addColorStop(0.62, '#e6f3f6');
    skinGrad.addColorStop(1.0, '#ffe0b8');
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.moveTo(-11, -12);
    ctx.bezierCurveTo(-13, 4, -6, 15, 5, 17);
    ctx.bezierCurveTo(13, 17, 17, 8, 17, -2);
    ctx.bezierCurveTo(17, -14, 6, -20, -6, -18);
    ctx.closePath();
    ctx.fill();

    // Pointed fae ear peeking through indigo locks
    ctx.fillStyle = '#cbe4ed';
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.quadraticCurveTo(-24, -10, -29, -16);
    ctx.quadraticCurveTo(-22, -1, -9, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(130, 172, 194, 0.6)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Serene expression (natural blink cycle every ~5.2 seconds)
    const blinkCycle = t % 5.2;
    const isBlinking = blinkCycle > 4.98 && blinkCycle < 5.14;
    ctx.strokeStyle = '#18263d';
    ctx.lineWidth = 1.35;
    if (isBlinking) {
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.quadraticCurveTo(7.5, 2.4, 12, 0.2);
      ctx.stroke();
    } else {
      // Soft almond eye gazing down-right toward the rising threads
      ctx.fillStyle = '#142238';
      ctx.beginPath();
      ctx.ellipse(8, 0, 3.2, 2.2, 0.12, 0, Math.PI * 2);
      ctx.fill();
      // Tiny golden-amber catchlight in iris
      ctx.fillStyle = '#ffe8b8';
      ctx.beginPath();
      ctx.arc(9.1, -0.5, 0.95, 0, Math.PI * 2);
      ctx.fill();
      // Upper lash line
      ctx.beginPath();
      ctx.moveTo(3.2, -0.6);
      ctx.quadraticCurveTo(8, -3.2, 12.6, -0.4);
      ctx.stroke();
    }

    // Delicate brow & subtle wistful smile
    ctx.strokeStyle = 'rgba(28, 46, 74, 0.65)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(3, -5.2);
    ctx.quadraticCurveTo(8.5, -7.2, 13, -5.4);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(148, 102, 108, 0.72)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(6.5, 9.8);
    ctx.quadraticCurveTo(9.5, 11.2, 12.2, 9.6);
    ctx.stroke();

    // Sweeping dark-indigo crown hair & floating tendrils
    const crownGrad = ctx.createLinearGradient(-16, -24, 14, 12);
    crownGrad.addColorStop(0, '#182e4d');
    crownGrad.addColorStop(0.55, '#101d36');
    crownGrad.addColorStop(1, '#243e5e');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(16, -6);
    ctx.bezierCurveTo(18, -18, 6, -25, -8, -22);
    ctx.bezierCurveTo(-20, -19, -22, -6, -15, 6);
    ctx.bezierCurveTo(-28 + hairWave * 0.4, 22, -42 + hairWave * 0.7, 36, -54 + hairWave * 0.9, 50);
    ctx.bezierCurveTo(-32 + hairWave * 0.5, 34, -18, 18, -9, -2);
    ctx.bezierCurveTo(-4, -11, 6, -13, 16, -6);
    ctx.closePath();
    ctx.fill();

    // Two slender golden moth-antennae curving gently from brow
    ctx.strokeStyle = '#f7d48e';
    ctx.lineWidth = 1.25;
    const antSway = Math.sin(t * 2.1) * 2.5;
    ctx.beginPath();
    ctx.moveTo(7, -17);
    ctx.bezierCurveTo(14, -36, 4 + antSway, -54, -8 + antSway, -60);
    ctx.moveTo(11, -15);
    ctx.bezierCurveTo(24, -32, 24 + antSway, -48, 16 + antSway, -56);
    ctx.stroke();

    ctx.fillStyle = '#fff0c2';
    ctx.beginPath();
    ctx.arc(-8 + antSway, -60, 2.0, 0, Math.PI * 2);
    ctx.arc(16 + antSway, -56, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end head space

    // Left (near) arm folded gracefully toward chest in quiet contemplation
    const nearArmGrad = ctx.createLinearGradient(-12, -12, 24, 18);
    nearArmGrad.addColorStop(0, '#c2dfe9');
    nearArmGrad.addColorStop(1, '#ffe6c2');
    ctx.strokeStyle = nearArmGrad;
    ctx.lineWidth = 6.0;
    ctx.beginPath();
    ctx.moveTo(-11, -11);
    ctx.quadraticCurveTo(-24, 14, 2, 22);
    ctx.quadraticCurveTo(16, 20, 24, 10 - armReach * 0.5);
    ctx.stroke();

    ctx.fillStyle = '#ffe6c2';
    ctx.beginPath();
    ctx.ellipse(26, 9 - armReach * 0.5, 4.8, 3.0, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Swaying weeping-willow boughs at upper canopy & lush ferns at base
  function drawBotanicals(t, px, py, foregroundPass) {
    // Upper weeping willow boughs
    for (let i = 0; i < willowStrands.length; i++) {
      const w = willowStrands[i];
      if ((w.depth === 1) !== foregroundPass) continue;

      const sway = Math.sin(t * w.speed + w.phase) * w.swayAmp + px * (foregroundPass ? 12 : 5);
      const x0 = w.x;
      const y0 = -20;
      const xMid = x0 + sway * 0.45 - w.side * 12;
      const yMid = w.len * 0.52;
      const xTip = x0 + sway - w.side * 18;
      const yTip = w.len;

      ctx.strokeStyle = foregroundPass ? '#060c18' : 'rgba(13, 27, 44, 0.78)';
      ctx.lineWidth = foregroundPass ? 1.5 : 1.1;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(xMid, yMid, xTip, yTip);
      ctx.stroke();

      ctx.fillStyle = foregroundPass ? '#07101f' : 'rgba(14, 30, 48, 0.78)';
      for (let k = 1; k <= w.leaves; k++) {
        const u = k / (w.leaves + 1);
        const iu = 1 - u;
        const lx = iu * iu * x0 + 2 * iu * u * xMid + u * u * xTip;
        const ly = iu * iu * y0 + 2 * iu * u * yMid + u * u * yTip;
        const sideFlip = k % 2 === 0 ? 1 : -1;
        const leafAng = Math.PI * 0.5 + sideFlip * 0.52 + (sway * 0.012);
        const leafLen = (1 - u * 0.35) * (foregroundPass ? 19 : 14);

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(leafAng);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, -3.2, leafLen, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, 3.2, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    if (!foregroundPass) return;

    // Foreground nocturnal ferns around the water's edge
    for (let f = 0; f < ferns.length; f++) {
      const fn = ferns[f];
      const sway = Math.sin(t * 0.8 + fn.phase) * 0.055;
      ctx.save();
      ctx.translate(fn.x + px * 11, fn.y + py * 6);
      ctx.rotate(fn.angle + sway);
      ctx.scale(fn.scale, fn.scale);

      ctx.strokeStyle = '#07111e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(fn.len * 0.5, -14, fn.len, -6);
      ctx.stroke();

      ctx.fillStyle = '#081322';
      const pairs = 11;
      for (let p = 1; p <= pairs; p++) {
        const u = p / (pairs + 1);
        const bx = fn.len * u;
        const by = -14 * 2 * u * (1 - u) - 6 * u * u;
        const pLen = Math.sin(u * Math.PI) * 26 + 5;
        for (let s = -1; s <= 1; s += 2) {
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(s * 0.88 - u * 0.25);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(pLen * 0.5, -3.5, pLen, 0);
          ctx.quadraticCurveTo(pLen * 0.5, 3.5, 0, 0);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  function drawAmbientMotes(dt, t, foregroundPass) {
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      const isFg = m.depth > 0.65;
      if (isFg !== foregroundPass) continue;

      if (!foregroundPass) {
        // Update position once per frame during background pass
        m.x += (m.vx + Math.sin(t * 0.7 + m.phase) * 9) * dt;
        m.y += m.vy * dt;
        if (m.y < -30) {
          m.y = VH + 30;
          m.x = (m.x + 137) % VW;
        }
        if (m.x < -40) m.x += VW + 80;
        if (m.x > VW + 40) m.x -= VW + 80;
      } else {
        m.x += (m.vx + Math.sin(t * 0.7 + m.phase) * 9) * dt;
        m.y += m.vy * dt;
        if (m.y < -30) m.y = VH + 30;
        if (m.x < -40) m.x += VW + 80;
        if (m.x > VW + 40) m.x -= VW + 80;
      }

      const glow = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.8 + m.phase), 2);
      const r = m.r * (isFg ? 1.55 : 0.9);
      const colInner = m.hue === 'gold'
        ? `rgba(255, 230, 170, ${glow * (isFg ? 0.65 : 0.78)})`
        : `rgba(165, 242, 236, ${glow * (isFg ? 0.55 : 0.72)})`;
      const colOuter = m.hue === 'gold'
        ? 'rgba(255, 195, 110, 0)'
        : 'rgba(100, 210, 215, 0)';

      const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 3.4);
      mg.addColorStop(0, colInner);
      mg.addColorStop(1, colOuter);
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(m.x, m.y, r * 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let lastTime = performance.now();
  let elapsed = 0;

  function render(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    elapsed += dt;

    // Smooth pointer easing
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3.2);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3.2);
    const px = pointer.x - 0.5;
    const py = pointer.y - 0.5;

    ctx.save();
    // Blit cached twilight sky & woodland atmosphere
    ctx.drawImage(bgCanvas, 0, 0);

    ctx.scale(dpr, dpr);
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawStarsAndMist(elapsed, px, py);
    drawCelestialCurrents(elapsed, px, py);
    drawBotanicals(elapsed, px, py, false);
    drawAmbientMotes(dt, elapsed, false);
    drawWaterAndStone(elapsed, px, py);
    drawSpoolAndLooseEnds(elapsed, px, py);
    drawFairy(elapsed, px, py);
    drawAmbientMotes(dt, elapsed, true);
    drawBotanicals(elapsed, px, py, true);

    ctx.restore();

    // Subtle painterly tooth overlay
    if (grainPattern) {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

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
  "title": "The Fairy of Loose Ends",
  "statement": "Unfinished stories still shimmer; trust the grace of what remains unresolved."
}
```