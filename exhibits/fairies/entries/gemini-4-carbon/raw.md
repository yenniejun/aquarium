```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>fAIries</title>
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
    background: #070a16;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: pan-y;
  }
</style>
</head>
<body>
<canvas id="scene"></canvas>
<script>
(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Virtual tarot artwork canvas (2:3 portrait)
  const VW = 600;
  const VH = 900;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let viewScale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));

    viewScale = Math.max(width / VW, height / VH);
    offsetX = (width - VW * viewScale) * 0.5;
    offsetY = (height - VH * viewScale) * 0.5;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Subtle, optional pointer tracking
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / Math.max(1, width)) * 2 - 1;
    const ny = (e.clientY / Math.max(1, height)) * 2 - 1;
    pointer.tx = Math.max(-1, Math.min(1, nx));
    pointer.ty = Math.max(-1, Math.min(1, ny));
    pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
    pointer.active = false;
  }, { passive: true });

  // Deterministic PRNG for consistent organic composition
  let seed = 49187;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // Pre-rendered soft glow sprites for crisp, lightweight particle rendering
  function makeGlowSprite(inner, mid, outer) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const gctx = c.getContext('2d');
    const g = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, inner);
    g.addColorStop(0.28, mid);
    g.addColorStop(1, outer);
    gctx.fillStyle = g;
    gctx.fillRect(0, 0, 64, 64);
    return c;
  }

  const goldSprite = makeGlowSprite(
    'rgba(255, 250, 220, 1)',
    'rgba(247, 186, 82, 0.55)',
    'rgba(247, 186, 82, 0)'
  );
  const cyanSprite = makeGlowSprite(
    'rgba(225, 255, 250, 0.95)',
    'rgba(110, 225, 220, 0.45)',
    'rgba(80, 190, 210, 0)'
  );
  const violetSprite = makeGlowSprite(
    'rgba(235, 210, 255, 0.85)',
    'rgba(148, 110, 220, 0.35)',
    'rgba(90, 60, 160, 0)'
  );

  // Sky stars
  const stars = Array.from({ length: 95 }, () => ({
    x: rand() * VW,
    y: rand() * 680,
    r: 0.45 + rand() * 1.35,
    phase: rand() * Math.PI * 2,
    speed: 0.6 + rand() * 1.6,
    tint: rand() > 0.3 ? '#dceeff' : '#ffe6b8'
  }));

  // Weeping night-willow strands hanging from upper canopy
  const willowStrands = Array.from({ length: 18 }, (_, i) => {
    const leftSide = i < 10;
    const baseX = leftSide ? -15 + (i / 10) * 230 : 390 + ((i - 10) / 8) * 225;
    return {
      x: baseX + (rand() - 0.5) * 24,
      len: 140 + rand() * 250 * (leftSide ? (1 - i / 13) : ((i - 9) / 9)),
      swayAmp: 6 + rand() * 10,
      phase: rand() * Math.PI * 2,
      leaves: Math.floor(6 + rand() * 8),
      alpha: 0.3 + rand() * 0.45
    };
  });

  // Rising golden time-motes drifting along S-curve from watch (198,722) toward fairy's hand (285,395)
  const timeMotes = Array.from({ length: 52 }, () => ({
    progress: rand(),
    speed: 0.025 + rand() * 0.045,
    spread: (rand() - 0.5) * 2,
    wobblePhase: rand() * Math.PI * 2,
    wobbleSpeed: 0.8 + rand() * 1.4,
    size: 4 + rand() * 14,
    isRing: rand() < 0.16,
    pauseFactor: rand() * Math.PI * 2
  }));

  // Ambient woodland spores
  const spores = Array.from({ length: 34 }, () => ({
    x: rand() * VW,
    y: 120 + rand() * 760,
    vx: (rand() - 0.5) * 8,
    vy: -4 - rand() * 8,
    size: 5 + rand() * 11,
    phase: rand() * Math.PI * 2,
    kind: rand() > 0.4 ? cyanSprite : violetSprite
  }));

  // Foreground & midground ferns around moss bed
  const ferns = [
    { x: 42, y: 885, angle: -0.95, len: 175, scale: 1.05, dark: false },
    { x: 95, y: 895, angle: -1.18, len: 140, scale: 0.85, dark: false },
    { x: 325, y: 890, angle: -1.78, len: 130, scale: 0.82, dark: false },
    { x: 495, y: 895, angle: -2.05, len: 185, scale: 1.05, dark: false },
    { x: 565, y: 885, angle: -2.28, len: 210, scale: 1.15, dark: true },
    { x: 18, y: 905, angle: -0.72, len: 195, scale: 1.18, dark: true }
  ];

  // Bioluminescent dew-cups nestled in moss (away from fairy)
  const dewCups = [
    { x: 86, y: 782, h: 36, tilt: -0.22, r: 7 },
    { x: 102, y: 794, h: 25, tilt: 0.14, r: 5 },
    { x: 312, y: 786, h: 32, tilt: 0.25, r: 6.5 },
    { x: 330, y: 798, h: 22, tilt: 0.42, r: 4.5 },
    { x: 446, y: 822, h: 40, tilt: -0.18, r: 7.5 },
    { x: 465, y: 834, h: 26, tilt: 0.12, r: 5 }
  ];

  function drawSkyAndMoon(t) {
    // Rich nocturnal sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, '#070b19');
    sky.addColorStop(0.35, '#0e1730');
    sky.addColorStop(0.68, '#14233b');
    sky.addColorStop(0.88, '#131d2e');
    sky.addColorStop(1, '#080e17');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VW, VH);

    // Subtle twilight plum nebula wash
    const neb = ctx.createRadialGradient(390, 340, 20, 370, 360, 380);
    neb.addColorStop(0, 'rgba(64, 48, 108, 0.36)');
    neb.addColorStop(0.5, 'rgba(28, 56, 86, 0.22)');
    neb.addColorStop(1, 'rgba(10, 15, 30, 0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, VW, VH);

    // Faint celestial astrolabe arcs in upper sky (atmospheric geometry)
    ctx.save();
    ctx.translate(132, 148);
    ctx.strokeStyle = 'rgba(165, 215, 235, 0.055)';
    ctx.lineWidth = 1;
    for (const rad of [92, 148, 225]) {
      ctx.beginPath();
      ctx.arc(0, 0, rad, -0.3, Math.PI * 1.15);
      ctx.stroke();
    }
    ctx.restore();

    // Twinkling stars
    for (const s of stars) {
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.globalAlpha = tw * 0.85;
      ctx.fillStyle = s.tint;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Crescent Moon in upper left
    const mx = 132 + pointer.x * -6;
    const my = 148 + pointer.y * -4;
    const moonHalo = ctx.createRadialGradient(mx, my, 12, mx, my, 145);
    moonHalo.addColorStop(0, 'rgba(200, 240, 245, 0.28)');
    moonHalo.addColorStop(0.4, 'rgba(130, 195, 220, 0.10)');
    moonHalo.addColorStop(1, 'rgba(130, 195, 220, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(mx, my, 145, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(-0.45);
    ctx.fillStyle = '#e8f9f7';
    ctx.shadowColor = 'rgba(180, 245, 240, 0.6)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.arc(13, -6, 30, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  function drawWillowCanopy(t) {
    ctx.save();
    for (const st of willowStrands) {
      const sway = Math.sin(t * 0.75 + st.phase) * st.swayAmp + pointer.x * 5;
      const endX = st.x + sway;
      const endY = st.len;
      const cpX = st.x + sway * 0.45;
      const cpY = st.len * 0.55;

      ctx.strokeStyle = `rgba(18, 38, 54, ${st.alpha})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(st.x, -10);
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();

      for (let k = 1; k <= st.leaves; k++) {
        const u = k / (st.leaves + 1);
        const lx = (1 - u) * (1 - u) * st.x + 2 * (1 - u) * u * cpX + u * u * endX;
        const ly = (1 - u) * (1 - u) * (-10) + 2 * (1 - u) * u * cpY + u * u * endY;
        const side = k % 2 === 0 ? 1 : -1;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(side * 0.48 + sway * 0.012);
        ctx.fillStyle = `rgba(24, 52, 68, ${st.alpha * 0.95})`;
        ctx.beginPath();
        ctx.ellipse(side * 7, 4, 8, 2.3, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawMossAndWatchGlow(t) {
    // Distant mist layers
    for (let i = 0; i < 3; i++) {
      const drift = Math.sin(t * 0.28 + i * 2.1) * 28;
      const y = 600 + i * 68;
      const g = ctx.createRadialGradient(300 + drift, y, 10, 300 + drift, y, 320);
      g.addColorStop(0, `rgba(42, 82, 98, ${0.14 - i * 0.02})`);
      g.addColorStop(1, 'rgba(15, 28, 42, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y - 130, VW, 260);
    }

    // Warm golden volumetric aura rising from the stopped pocket watch
    const pulse = 0.92 + 0.08 * Math.sin(t * 1.4);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const cone = ctx.createRadialGradient(202, 718, 8, 255, 555, 310);
    cone.addColorStop(0, `rgba(255, 208, 118, ${0.42 * pulse})`);
    cone.addColorStop(0.35, `rgba(232, 150, 62, ${0.18 * pulse})`);
    cone.addColorStop(0.75, 'rgba(160, 95, 70, 0.05)');
    cone.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cone;
    ctx.fillRect(0, 220, VW, 650);
    ctx.restore();

    // Rolling dark velvet moss mounds at the bottom
    const backMoss = ctx.createLinearGradient(0, 665, 0, VH);
    backMoss.addColorStop(0, '#10242c');
    backMoss.addColorStop(0.45, '#0b1922');
    backMoss.addColorStop(1, '#050a11');
    ctx.fillStyle = backMoss;
    ctx.beginPath();
    ctx.moveTo(-10, VH);
    ctx.lineTo(-10, 725);
    ctx.bezierCurveTo(95, 675, 225, 680, 345, 730);
    ctx.bezierCurveTo(445, 772, 530, 742, VW + 10, 760);
    ctx.lineTo(VW + 10, VH);
    ctx.closePath();
    ctx.fill();

    // Warm rim highlight on moss cushion around the watch
    const mossRim = ctx.createRadialGradient(198, 738, 22, 198, 755, 165);
    mossRim.addColorStop(0, 'rgba(218, 152, 68, 0.28)');
    mossRim.addColorStop(0.55, 'rgba(46, 90, 82, 0.22)');
    mossRim.addColorStop(1, 'rgba(10, 22, 28, 0)');
    ctx.fillStyle = mossRim;
    ctx.beginPath();
    ctx.ellipse(202, 755, 165, 68, -0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGear(cx, cy, r, teeth, rot, color, holeR) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.28;
      const a2 = a0 + step * 0.52;
      const a3 = a0 + step * 0.78;
      ctx.lineTo(Math.cos(a0) * (r - 2.4), Math.sin(a0) * (r - 2.4));
      ctx.lineTo(Math.cos(a1) * (r + 1.6), Math.sin(a1) * (r + 1.6));
      ctx.lineTo(Math.cos(a2) * (r + 1.6), Math.sin(a2) * (r + 1.6));
      ctx.lineTo(Math.cos(a3) * (r - 2.4), Math.sin(a3) * (r - 2.4));
    }
    ctx.closePath();
    ctx.fill();

    // Cutout spokes
    ctx.fillStyle = '#18141c';
    ctx.beginPath();
    ctx.arc(0, 0, holeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    for (let s = 0; s < 4; s++) {
      const sa = (s * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sa) * 2, Math.sin(sa) * 2);
      ctx.lineTo(Math.cos(sa) * holeR, Math.sin(sa) * holeR);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffe19c';
    ctx.beginPath();
    ctx.arc(0, 0, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStoppedPocketWatch(t) {
    const wx = 198;
    const wy = 732;

    ctx.save();
    ctx.translate(wx, wy);

    // Deep nest shadow in moss
    ctx.fillStyle = 'rgba(3, 6, 12, 0.78)';
    ctx.beginPath();
    ctx.ellipse(4, 16, 86, 48, -0.14, 0, Math.PI * 2);
    ctx.fill();

    // Open hinged gold lid tilted up behind-left of the watch
    ctx.save();
    ctx.translate(-56, -42);
    ctx.rotate(-0.68);
    // Outer lid edge
    const lidOuter = ctx.createLinearGradient(-48, -55, 48, 55);
    lidOuter.addColorStop(0, '#8f5e24');
    lidOuter.addColorStop(0.5, '#e8b45a');
    lidOuter.addColorStop(1, '#5e3b14');
    ctx.fillStyle = lidOuter;
    ctx.beginPath();
    ctx.ellipse(-4, -2, 54, 62, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner burnished gold concave surface catching warm watch-glow & cyan moonlight
    const lidInner = ctx.createRadialGradient(8, 10, 4, 0, 0, 52);
    lidInner.addColorStop(0, '#ffebb3');
    lidInner.addColorStop(0.45, '#d6973c');
    lidInner.addColorStop(0.82, '#7d5222');
    lidInner.addColorStop(1, '#4d3114');
    ctx.fillStyle = lidInner;
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 56, 0, 0, Math.PI * 2);
    ctx.fill();

    // Delicate engine-turned guilloche rings inside lid
    ctx.strokeStyle = 'rgba(255, 240, 195, 0.22)';
    ctx.lineWidth = 0.9;
    for (const r of [16, 28, 39]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.85, r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Brass hinge barrel
    ctx.save();
    ctx.translate(-35, -18);
    ctx.rotate(-0.65);
    ctx.fillStyle = '#c88c38';
    ctx.beginPath();
    ctx.roundRect(-6, -12, 12, 24, 4);
    ctx.fill();
    ctx.restore();

    // Winding stem, crown & bow ring resting toward bottom-right-front / lower-left
    ctx.save();
    ctx.rotate(-0.14);
    // Bow ring
    ctx.strokeStyle = '#d99e46';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.ellipse(-92, 14, 18, 12, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 238, 185, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(-92, 13, 17, 11, -0.25, -1.2, 1.4);
    ctx.stroke();

    // Crown knob
    const crownGrad = ctx.createLinearGradient(-82, 0, -72, 18);
    crownGrad.addColorStop(0, '#ffe096');
    crownGrad.addColorStop(0.5, '#b87a28');
    crownGrad.addColorStop(1, '#5e3910');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.ellipse(-77, 9, 8, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Watch perspective plane (foreshortened ellipse)
    ctx.scale(1, 0.62);

    // Case lower body thickness
    const bodySide = ctx.createLinearGradient(-76, 0, 76, 24);
    bodySide.addColorStop(0, '#4d3011');
    bodySide.addColorStop(0.32, '#b87d2e');
    bodySide.addColorStop(0.62, '#f0be67');
    bodySide.addColorStop(0.88, '#8c591d');
    bodySide.addColorStop(1, '#3b240c');
    ctx.fillStyle = bodySide;
    ctx.beginPath();
    ctx.arc(0, 14, 76, 0, Math.PI * 2);
    ctx.fill();

    // Outer gold bezel
    const bezel = ctx.createLinearGradient(-74, -60, 74, 60);
    bezel.addColorStop(0, '#f7cf7c');
    bezel.addColorStop(0.35, '#c28533');
    bezel.addColorStop(0.7, '#754b19');
    bezel.addColorStop(1, '#e8b258');
    ctx.fillStyle = bezel;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();

    // Inner recessed gold rim
    ctx.fillStyle = '#523310';
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.fill();

    // Antique warm enamel dial
    const dial = ctx.createRadialGradient(-8, -8, 6, 0, 0, 63);
    dial.addColorStop(0, '#fff3d1');
    dial.addColorStop(0.65, '#ebd09a');
    dial.addColorStop(0.92, '#b89258');
    dial.addColorStop(1, '#78572c');
    ctx.fillStyle = dial;
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fill();

    // Minute railroad track & 12 geometric diamond hour pips (no numerals or text)
    ctx.strokeStyle = 'rgba(72, 46, 20, 0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 51, 0, Math.PI * 2);
    ctx.stroke();

    for (let m = 0; m < 60; m++) {
      const a = (m / 60) * Math.PI * 2;
      const isHour = m % 5 === 0;
      if (isHour) {
        ctx.save();
        ctx.rotate(a);
        ctx.fillStyle = '#5c3814';
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.lineTo(3.1, -48.5);
        ctx.lineTo(0, -42);
        ctx.lineTo(-3.1, -48.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 51.5, Math.sin(a) * 51.5);
        ctx.lineTo(Math.cos(a) * 55.5, Math.sin(a) * 55.5);
        ctx.stroke();
      }
    }

    // Recessed central skeleton aperture exposing stationary brass clockwork
    ctx.fillStyle = '#17131d';
    ctx.beginPath();
    ctx.arc(0, 2, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9c6828';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Warm inner ember glow inside the stopped mechanism
    const gearGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
    gearGlow.addColorStop(0, `rgba(255, 205, 105, ${0.42 + 0.1 * Math.sin(t * 2)})`);
    gearGlow.addColorStop(1, 'rgba(255, 160, 60, 0)');
    ctx.fillStyle = gearGlow;
    ctx.beginPath();
    ctx.arc(0, 2, 30, 0, Math.PI * 2);
    ctx.fill();

    // Three interlocking gears — completely frozen in time
    drawGear(-11, -5, 14, 12, 0.35, '#d69b43', 9);
    drawGear(12, 6, 12, 10, 0.18, '#e8b65f', 7.5);
    drawGear(-5, 15, 9.5, 9, 0.62, '#b57b2e', 5.5);

    // Uncoiled hairspring trembling faintly with suspended energy
    const tremor = Math.sin(t * 3.4) * 0.04;
    ctx.save();
    ctx.rotate(tremor);
    ctx.strokeStyle = '#ffeaad';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let th = 0; th < Math.PI * 3.6; th += 0.2) {
      const sr = 2 + th * 1.65;
      const sx = 8 + Math.cos(th) * sr;
      const sy = -10 + Math.sin(th) * sr;
      if (th === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();

    // Frozen ornate watch hands (stopped forever at a quiet twilight angle)
    const handAngles = [-2.35, 0.58];
    const handLengths = [38, 50];
    for (let h = 0; h < 2; h++) {
      const ha = handAngles[h];
      const hl = handLengths[h];
      // Soft shadow on dial
      ctx.save();
      ctx.translate(2, 3.5);
      ctx.rotate(ha);
      ctx.strokeStyle = 'rgba(20, 12, 8, 0.45)';
      ctx.lineWidth = h === 0 ? 3.2 : 2.2;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(hl, 0);
      ctx.stroke();
      ctx.restore();

      // Blued-gold filigree hand
      ctx.save();
      ctx.rotate(ha);
      ctx.strokeStyle = '#291c14';
      ctx.fillStyle = '#291c14';
      ctx.lineWidth = h === 0 ? 2.8 : 1.9;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(hl, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hl * 0.62, 0, h === 0 ? 4.2 : 3.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2c166';
      ctx.beginPath();
      ctx.arc(hl * 0.62, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Center cap jewel
    ctx.fillStyle = '#ffe39e';
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Cracked domed crystal glass catching cool moonlight & warm fractures
    const glassSheen = ctx.createLinearGradient(-55, -55, 45, 45);
    glassSheen.addColorStop(0, 'rgba(200, 245, 255, 0.24)');
    glassSheen.addColorStop(0.42, 'rgba(255, 255, 255, 0.03)');
    glassSheen.addColorStop(1, 'rgba(255, 215, 145, 0.14)');
    ctx.fillStyle = glassSheen;
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight arc on crystal dome
    ctx.strokeStyle = 'rgba(225, 250, 255, 0.48)';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, 54, -2.55, -1.55);
    ctx.stroke();

    // Fracture lines radiating from (-4, -8) where golden dust escapes
    ctx.strokeStyle = 'rgba(235, 252, 255, 0.65)';
    ctx.lineWidth = 1.15;
    const cracks = [
      [[-4, -8], [-22, -32], [-42, -46]],
      [[-4, -8], [16, -28], [38, -44]],
      [[-4, -8], [26, -4], [54, 8]],
      [[-4, -8], [-28, 12], [-52, 22]],
      [[-4, -8], [4, 24], [12, 52]]
    ];
    for (const segs of cracks) {
      ctx.beginPath();
      ctx.moveTo(segs[0][0], segs[0][1]);
      for (let i = 1; i < segs.length; i++) ctx.lineTo(segs[i][0], segs[i][1]);
      ctx.stroke();
    }

    ctx.restore(); // end perspective scale & rotation

    // Tiny moss tufts overlapping the lower rim of the watch so it sits nestled in the earth
    ctx.fillStyle = '#0c1d24';
    for (const [mx, my, mr] of [[-52, 42, 16], [-24, 49, 19], [12, 50, 17], [46, 43, 15], [68, 32, 12]]) {
      ctx.beginPath();
      ctx.arc(mx, my, mr, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawTimeStream(t, handWorldX, handWorldY) {
    // Stream rises from watch fracture (195, 718) in a graceful S-curve toward near the fairy's outstretched hand
    const p0x = 195, p0y = 716;
    const p1x = 152 + pointer.x * 16, p1y = 575;
    const p2x = 228 + pointer.x * 18, p2y = 468;
    const p3x = handWorldX - 16, p3y = handWorldY + 8;

    // Gossamer golden thread of suspended time
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const grad = ctx.createLinearGradient(p0x, p0y, p3x, p3y);
    grad.addColorStop(0, 'rgba(255, 212, 125, 0.42)');
    grad.addColorStop(0.5, 'rgba(245, 185, 95, 0.22)');
    grad.addColorStop(1, 'rgba(185, 242, 235, 0.35)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
    ctx.stroke();

    for (const m of timeMotes) {
      // Slow breathing pause: time almost halts, then drifts gently onward
      const breath = 0.55 + 0.45 * Math.sin(t * 0.9 + m.pauseFactor);
      const u = (m.progress + t * m.speed * (0.45 + 0.55 * breath)) % 1;
      const iu = 1 - u;

      const bx = iu * iu * iu * p0x + 3 * iu * iu * u * p1x + 3 * iu * u * u * p2x + u * u * u * p3x;
      const by = iu * iu * iu * p0y + 3 * iu * iu * u * p1y + 3 * iu * u * u * p2y + u * u * u * p3y;

      const env = Math.sin(u * Math.PI);
      const wx = bx + Math.sin(t * m.wobbleSpeed + m.wobblePhase) * (18 * m.spread * (0.3 + env));
      const wy = by + Math.cos(t * m.wobbleSpeed * 0.8 + m.wobblePhase) * 8 * env;

      const alpha = Math.min(1, env * 1.35);
      if (m.isRing) {
        // Faint golden echo of a vanished second
        ctx.strokeStyle = `rgba(255, 224, 150, ${alpha * 0.48})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(wx, wy, m.size * 0.65, m.size * 0.38, t * 0.3 + m.wobblePhase, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha * 0.9;
        const s = m.size * (0.75 + 0.25 * Math.sin(t * 2.4 + m.wobblePhase));
        ctx.drawImage(goldSprite, wx - s, wy - s, s * 2, s * 2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawSingleForewing(isFar, flap, t) {
    ctx.save();
    const scaleX = isFar ? -0.58 * flap : 0.96 * flap;
    const rot = isFar ? -0.22 - (1 - flap) * 0.14 : -0.14 + (1 - flap) * 0.18;
    ctx.rotate(rot);
    ctx.scale(scaleX, 1);

    // Grand sweeping luna/stained-glass forewing
    const wg = ctx.createRadialGradient(25, -35, 10, 95, -75, 210);
    if (isFar) {
      wg.addColorStop(0, 'rgba(65, 138, 158, 0.52)');
      wg.addColorStop(0.55, 'rgba(82, 175, 182, 0.42)');
      wg.addColorStop(0.88, 'rgba(198, 142, 88, 0.38)');
      wg.addColorStop(1, 'rgba(235, 195, 130, 0.55)');
    } else {
      wg.addColorStop(0, 'rgba(92, 178, 195, 0.68)');
      wg.addColorStop(0.48, 'rgba(138, 228, 220, 0.56)');
      wg.addColorStop(0.82, 'rgba(182, 148, 212, 0.50)');
      wg.addColorStop(1, 'rgba(250, 204, 128, 0.75)');
    }

    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(42, -78, 128, -148, 196, -134); // arched costal margin
    ctx.bezierCurveTo(212, -130, 206, -106, 186, -86); // falcate wingtip
    ctx.bezierCurveTo(164, -62, 168, -16, 136, 12);    // scalloped outer margin
    ctx.bezierCurveTo(96, 36, 40, 20, 0, 4);           // inner margin
    ctx.closePath();
    ctx.fill();

    // Warm dark-plum leading costal edge (classic luna moth detail)
    ctx.strokeStyle = isFar ? 'rgba(95, 62, 92, 0.65)' : 'rgba(135, 82, 112, 0.85)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(42, -78, 128, -148, 196, -134);
    ctx.stroke();

    // Luminous stained-glass veins
    ctx.strokeStyle = isFar ? 'rgba(200, 242, 240, 0.35)' : 'rgba(238, 252, 242, 0.58)';
    ctx.lineWidth = 1.15;
    const veins = [
      [[0, 0], [65, -55], [178, -112]],
      [[0, 0], [72, -38], [168, -74]],
      [[38, -28], [108, -42], [156, -36]],
      [[48, -22], [98, -12], [138, 4]],
      [[0, 2], [58, 8], [104, 18]]
    ];
    for (const v of veins) {
      ctx.beginPath();
      ctx.moveTo(v[0][0], v[0][1]);
      ctx.quadraticCurveTo(v[1][0], v[1][1], v[2][0], v[2][1]);
      ctx.stroke();
    }

    // Moon-eye ocellus marking on forewing
    ctx.save();
    ctx.translate(106, -58);
    ctx.rotate(-0.25);
    ctx.fillStyle = 'rgba(24, 22, 46, 0.72)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe29a';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = '#d4fff9';
    ctx.beginPath();
    ctx.arc(-3, -1, 6.5, 0.5, Math.PI * 1.65);
    ctx.fill();
    ctx.restore();

    // Shimmering gold-opal edge trim
    ctx.strokeStyle = `rgba(255, 232, 175, ${0.45 + 0.2 * Math.sin(t * 2.2)})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(196, -134);
    ctx.bezierCurveTo(212, -130, 206, -106, 186, -86);
    ctx.bezierCurveTo(164, -62, 168, -16, 136, 12);
    ctx.stroke();

    ctx.restore();
  }

  function drawSingleHindwing(isFar, flap, t) {
    ctx.save();
    const scaleX = isFar ? -0.54 * flap : 0.94 * flap;
    const rot = isFar ? 0.12 + (1 - flap) * 0.1 : 0.08 + (1 - flap) * 0.14;
    ctx.rotate(rot);
    ctx.scale(scaleX, 1);

    const tailWave = Math.sin(t * 1.8 - 0.8) * 12;

    const hg = ctx.createLinearGradient(0, 0, 135, 195);
    hg.addColorStop(0, isFar ? 'rgba(65, 145, 165, 0.48)' : 'rgba(104, 198, 208, 0.64)');
    hg.addColorStop(0.55, isFar ? 'rgba(85, 165, 168, 0.40)' : 'rgba(142, 226, 212, 0.52)');
    hg.addColorStop(1, 'rgba(246, 194, 116, 0.72)');

    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(54, 2, 118, 24, 128, 66);
    ctx.bezierCurveTo(136, 98, 108, 122, 98, 148);
    // Long ribbon-like swallowtail
    ctx.bezierCurveTo(92, 176, 108 + tailWave, 208, 96 + tailWave * 1.3, 236);
    ctx.bezierCurveTo(86 + tailWave * 1.2, 242, 74 + tailWave, 218, 76, 182);
    ctx.bezierCurveTo(78, 144, 48, 126, 24, 96);
    ctx.bezierCurveTo(8, 72, 2, 34, 0, 4);
    ctx.closePath();
    ctx.fill();

    // Hindwing veins
    ctx.strokeStyle = isFar ? 'rgba(200, 242, 240, 0.32)' : 'rgba(238, 252, 242, 0.52)';
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(45, 42, 82, 106, 88 + tailWave * 0.6, 204);
    ctx.moveTo(22, 22);
    ctx.quadraticCurveTo(78, 42, 120, 68);
    ctx.moveTo(32, 42);
    ctx.quadraticCurveTo(72, 80, 104, 112);
    ctx.stroke();

    // Hindwing moon ocellus
    ctx.save();
    ctx.translate(68, 66);
    ctx.fillStyle = 'rgba(24, 22, 46, 0.68)';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe29a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#d4fff9';
    ctx.beginPath();
    ctx.arc(-2, -1, 4.5, 0.4, Math.PI * 1.6);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  function drawFairy(t) {
    // Hovering serenely in upper-right / center-right, completely detached from the watch below
    const hoverX = 378 + Math.sin(t * 0.85) * 7 + pointer.x * 10;
    const hoverY = 362 + Math.sin(t * 1.45) * 9 + pointer.y * 6;

    // Outstretched hand world position (for aligning the rising golden time-stream)
    const reachOffsetY = Math.sin(t * 1.45 - 0.6) * 4;
    const handWorldX = hoverX - 96;
    const handWorldY = hoverY + 46 + reachOffsetY;

    // Draw the rising golden time stream behind/into her hand space
    drawTimeStream(t, handWorldX, handWorldY);

    ctx.save();
    ctx.translate(hoverX, hoverY);

    // Ethereal lunar-amber aura behind the fairy
    const aura = ctx.createRadialGradient(8, -12, 12, 12, 10, 185);
    aura.addColorStop(0, 'rgba(162, 235, 232, 0.24)');
    aura.addColorStop(0.5, 'rgba(98, 145, 195, 0.10)');
    aura.addColorStop(1, 'rgba(30, 45, 85, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(10, 0, 185, 0, Math.PI * 2);
    ctx.fill();

    // Subtle pendulum-halo of suspended golden dots behind her head
    ctx.save();
    ctx.translate(-12, -68);
    ctx.strokeStyle = 'rgba(255, 224, 156, 0.26)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 44, -Math.PI * 0.85, Math.PI * 0.35);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.8 + (i / 6) * Math.PI * 1.1;
      const hx = Math.cos(a) * 44;
      const hy = Math.sin(a) * 44;
      ctx.fillStyle = i === 3 ? '#fff3c4' : 'rgba(255, 222, 152, 0.75)';
      ctx.beginPath();
      ctx.arc(hx, hy, i === 3 ? 2.6 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Wing breath cycle
    const flapFore = 0.76 + 0.24 * Math.sin(t * 1.45);
    const flapHind = 0.78 + 0.22 * Math.sin(t * 1.45 - 0.35);

    // 1. Far wings (peeking past her far shoulder)
    ctx.save();
    ctx.translate(-6, -20);
    drawSingleHindwing(true, flapHind, t);
    drawSingleForewing(true, flapFore, t);
    ctx.restore();

    // 2. Flowing midnight-indigo back hair studded with tiny starlight specks
    const hairWave = Math.sin(t * 1.2) * 8;
    ctx.fillStyle = '#0d132b';
    ctx.beginPath();
    ctx.moveTo(-24, -78);
    ctx.bezierCurveTo(16, -92, 46, -42, 58 + hairWave, 14);
    ctx.bezierCurveTo(68 + hairWave * 1.3, 62, 42 + hairWave, 108, 22 + hairWave * 0.8, 124);
    ctx.bezierCurveTo(6, 94, -4, 42, -18, -32);
    ctx.closePath();
    ctx.fill();

    // 3. Near wings (sweeping grandly to the right)
    ctx.save();
    ctx.translate(16, -18);
    drawSingleHindwing(false, flapHind, t);
    drawSingleForewing(false, flapFore, t);
    ctx.restore();

    // 4. Bare opalescent legs & pointed feet suspended weightlessly in midair
    const legSway = Math.sin(t * 1.1 - 0.5) * 5;
    // Back leg
    ctx.strokeStyle = '#9dbbd1';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(12, 74);
    ctx.quadraticCurveTo(22 + legSway * 0.5, 145, 34 + legSway, 212);
    ctx.stroke();
    // Back foot
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(34 + legSway, 212);
    ctx.quadraticCurveTo(38 + legSway, 228, 30 + legSway, 238);
    ctx.stroke();

    // Front leg (gently bent at knee, catching warm watch glow underneath)
    const legGrad = ctx.createLinearGradient(-14, 70, 8, 205);
    legGrad.addColorStop(0, '#c2dced');
    legGrad.addColorStop(0.65, '#dcebf2');
    legGrad.addColorStop(1, '#f5d9a8');
    ctx.strokeStyle = legGrad;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(2, 72);
    ctx.quadraticCurveTo(-18 + legSway * 0.4, 134, 2 + legSway * 0.8, 192);
    ctx.stroke();
    // Pointed front foot
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(2 + legSway * 0.8, 192);
    ctx.quadraticCurveTo(5 + legSway * 0.8, 208, -2 + legSway * 0.8, 220);
    ctx.stroke();

    // Delicate golden anklet bead
    ctx.fillStyle = '#ffe29c';
    ctx.beginPath();
    ctx.arc(2 + legSway * 0.8, 189, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Layered gossamer moth-silk dress billowing softly in the warm updraft
    const skirtWave1 = Math.sin(t * 1.35) * 10;
    const skirtWave2 = Math.cos(t * 1.15) * 12;

    // Back translucent trailing ribbon-skirt
    const backDress = ctx.createLinearGradient(0, 28, 25, 255);
    backDress.addColorStop(0, 'rgba(34, 48, 92, 0.92)');
    backDress.addColorStop(0.6, 'rgba(46, 98, 126, 0.58)');
    backDress.addColorStop(1, 'rgba(242, 188, 108, 0.22)');
    ctx.fillStyle = backDress;
    ctx.beginPath();
    ctx.moveTo(-10, 32);
    ctx.bezierCurveTo(-36, 98, -46 + skirtWave1, 178, -24 + skirtWave1 * 1.3, 244);
    ctx.bezierCurveTo(6 + skirtWave2, 220, 22, 268, 56 + skirtWave2, 252);
    ctx.bezierCurveTo(48, 176, 36, 96, 18, 34);
    ctx.closePath();
    ctx.fill();

    // Front petal-silk overskirt catching warm golden rim light on its scalloped hem
    const frontDress = ctx.createLinearGradient(-15, 24, 10, 188);
    frontDress.addColorStop(0, 'rgba(68, 96, 148, 0.94)');
    frontDress.addColorStop(0.55, 'rgba(84, 156, 176, 0.72)');
    frontDress.addColorStop(1, 'rgba(248, 204, 128, 0.55)');
    ctx.fillStyle = frontDress;
    ctx.beginPath();
    ctx.moveTo(-11, 30);
    ctx.bezierCurveTo(-32, 76, -38 + skirtWave1 * 0.7, 134, -18 + skirtWave1, 176);
    ctx.bezierCurveTo(-2, 158, 12, 162, 28 + skirtWave2 * 0.7, 184);
    ctx.bezierCurveTo(36 + skirtWave2 * 0.5, 128, 28, 72, 16, 32);
    ctx.closePath();
    ctx.fill();

    // Golden-opal gossamer hem highlight
    ctx.strokeStyle = 'rgba(255, 226, 162, 0.62)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-18 + skirtWave1, 176);
    ctx.bezierCurveTo(-2, 158, 12, 162, 28 + skirtWave2 * 0.7, 184);
    ctx.stroke();

    // 6. Far arm (left arm reaching gracefully toward the rising stream of golden time-motes)
    ctx.save();
    const skinArm = ctx.createLinearGradient(-20, -18, -96, 48);
    skinArm.addColorStop(0, '#cadfed');
    skinArm.addColorStop(0.65, '#e5eef2');
    skinArm.addColorStop(1, '#ffe2ad');
    ctx.strokeStyle = skinArm;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7.2;
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.quadraticCurveTo(-48, 18 + reachOffsetY * 0.5, -86, 40 + reachOffsetY);
    ctx.stroke();

    // Delicate open hand & slender fingers poised above the rising spark
    ctx.translate(-86, 40 + reachOffsetY);
    ctx.fillStyle = '#ffe5b8';
    ctx.beginPath();
    ctx.ellipse(-5, 3, 6.5, 4, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe5b8';
    ctx.lineWidth = 2.1;
    for (const [fx, fy] of [[-14, 2], [-16, 6], [-14, 10], [-9, -3]]) {
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.quadraticCurveTo(fx * 0.6, fy * 0.5, fx, fy);
      ctx.stroke();
    }
    ctx.restore();

    // A bright suspended golden spark hovering untouched just beyond her fingertips
    const heroSparkX = -112;
    const heroSparkY = 48 + reachOffsetY + Math.sin(t * 2.6) * 3;
    const spSize = 22 + Math.sin(t * 3.1) * 4;
    ctx.drawImage(goldSprite, heroSparkX - spSize, heroSparkY - spSize, spSize * 2, spSize * 2);

    // 7. Torso & Bodice
    // Slender neck & upper chest
    const chestGrad = ctx.createLinearGradient(-12, -48, 10, -8);
    chestGrad.addColorStop(0, '#c8dfee');
    chestGrad.addColorStop(1, '#ebd9c8');
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.moveTo(-9, -48);
    ctx.lineTo(4, -46);
    ctx.lineTo(18, -18);
    ctx.lineTo(-20, -20);
    ctx.closePath();
    ctx.fill();

    // Sculpted twilight-silk bodice with silver-gold filigree waist
    const bodiceGrad = ctx.createLinearGradient(-20, -20, 18, 34);
    bodiceGrad.addColorStop(0, '#365486');
    bodiceGrad.addColorStop(0.55, '#243864');
    bodiceGrad.addColorStop(1, '#4c7a94');
    ctx.fillStyle = bodiceGrad;
    ctx.beginPath();
    ctx.moveTo(-20, -18);
    ctx.quadraticCurveTo(-2, -8, 19, -16);
    ctx.quadraticCurveTo(16, 12, 16, 33);
    ctx.quadraticCurveTo(2, 40, -11, 31);
    ctx.quadraticCurveTo(-12, 10, -20, -18);
    ctx.closePath();
    ctx.fill();

    // Bodice sweetheart trim & waist jewel
    ctx.strokeStyle = 'rgba(255, 224, 158, 0.72)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-19, -17);
    ctx.quadraticCurveTo(-3, -6, 18, -15);
    ctx.moveTo(-11, 31);
    ctx.quadraticCurveTo(2, 39, 16, 33);
    ctx.stroke();

    // 8. Near arm (right arm curved gently toward her heart)
    ctx.strokeStyle = '#dfecf2';
    ctx.lineWidth = 7.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(17, -15);
    ctx.quadraticCurveTo(34, 18, 2, 14);
    ctx.stroke();
    // Sheer gossamer sleeve drape on near arm
    ctx.fillStyle = 'rgba(130, 210, 220, 0.28)';
    ctx.beginPath();
    ctx.moveTo(17, -14);
    ctx.quadraticCurveTo(38, 22, 24, 48 + skirtWave1 * 0.4);
    ctx.quadraticCurveTo(8, 36, 4, 15);
    ctx.closePath();
    ctx.fill();
    // Delicate near hand near chest
    ctx.fillStyle = '#f2e2cb';
    ctx.beginPath();
    ctx.ellipse(-3, 13, 6, 3.8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 9. Head & 3/4 Face (tilted serenely down-left toward the stopped pocket watch)
    ctx.save();
    const headTilt = -0.18 + Math.sin(t * 0.9) * 0.035 + pointer.x * 0.05 + pointer.y * 0.03;
    ctx.translate(-9, -66);
    ctx.rotate(headTilt);

    // Back cranium hair volume
    ctx.fillStyle = '#101836';
    ctx.beginPath();
    ctx.arc(4, -4, 24, 0, Math.PI * 2);
    ctx.fill();

    // Face silhouette (3/4 turn facing left)
    const faceGrad = ctx.createLinearGradient(-16, -20, 12, 22);
    faceGrad.addColorStop(0, '#d8eef7');   // cool moonlight on forehead
    faceGrad.addColorStop(0.6, '#e6edf2'); // porcelain opal cheek
    faceGrad.addColorStop(1, '#fae0b6');   // warm golden watch bounce-light on chin
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.moveTo(-14, -16);
    ctx.quadraticCurveTo(-20, -4, -18, 6);   // brow to nose bridge
    ctx.quadraticCurveTo(-17, 16, -9, 22);   // soft chin
    ctx.quadraticCurveTo(4, 21, 12, 8);      // jawline
    ctx.quadraticCurveTo(16, -8, 4, -18);    // temple
    ctx.closePath();
    ctx.fill();

    // Pointed fae ear sweeping back-right through dark hair
    ctx.fillStyle = '#dfeaf0';
    ctx.beginPath();
    ctx.moveTo(9, -1);
    ctx.quadraticCurveTo(26, -11, 32, -16);
    ctx.quadraticCurveTo(25, 2, 10, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(130, 150, 180, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 1);
    ctx.quadraticCurveTo(22, -6, 26, -11);
    ctx.stroke();

    // Delicate nose & serene lips
    ctx.strokeStyle = 'rgba(90, 105, 135, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.quadraticCurveTo(-21, 5, -17, 7.5);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(168, 118, 128, 0.72)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-15, 13.5);
    ctx.quadraticCurveTo(-11, 14.5, -7.5, 13.2);
    ctx.stroke();

    // Periodic gentle blink
    const blinkCycle = (t * 0.22) % 1;
    const isBlinking = blinkCycle > 0.94;

    // Eyes (3/4 perspective: far eye on left, near eye centered)
    if (isBlinking) {
      ctx.strokeStyle = '#1b2242';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(-15, 1, 3.2, 0.15, Math.PI - 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-4, 1, 4.8, 0.15, Math.PI - 0.15);
      ctx.stroke();
    } else {
      // Near eye
      ctx.fillStyle = '#19203d';
      ctx.beginPath();
      ctx.ellipse(-4.5, 0.5, 4.6, 3.1, 0.08, 0, Math.PI * 2);
      ctx.fill();
      // Luminous warm amber-opal iris reflecting the watch
      ctx.fillStyle = '#ffcf75';
      ctx.beginPath();
      ctx.arc(-5.2 + pointer.x * 0.7, 0.8 + pointer.y * 0.5, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, -0.3, 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Far eye
      ctx.fillStyle = '#19203d';
      ctx.beginPath();
      ctx.ellipse(-15.2, 0.4, 2.6, 2.5, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcf75';
      ctx.beginPath();
      ctx.arc(-15.5, 0.7, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft arched eyebrows
    ctx.strokeStyle = '#1b2448';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-9.5, -5);
    ctx.quadraticCurveTo(-4, -7.2, 1.5, -5.2);
    ctx.moveTo(-18, -4.8);
    ctx.quadraticCurveTo(-15.5, -6.5, -13, -5.2);
    ctx.stroke();

    // Sweeping front indigo locks framing her temple and neck
    ctx.fillStyle = '#141e42';
    ctx.beginPath();
    ctx.moveTo(-16, -15);
    ctx.quadraticCurveTo(-4, -27, 16, -20);
    ctx.quadraticCurveTo(28, -10, 24, 14);
    ctx.quadraticCurveTo(18, 34, 28 + hairWave * 0.4, 54);
    ctx.quadraticCurveTo(10, 30, 10, 4);
    ctx.quadraticCurveTo(6, -11, -14, -13);
    ctx.closePath();
    ctx.fill();

    // Delicate silver-moon diadem with a tiny suspended teardrop gem on her brow
    ctx.strokeStyle = 'rgba(218, 245, 250, 0.82)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.quadraticCurveTo(-4, -8, 12, -12);
    ctx.stroke();
    ctx.fillStyle = '#fff1b8';
    ctx.beginPath();
    ctx.arc(-11, -9.5, 2.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end head

    // Tiny starlight pinpoints nestled in her dark hair
    ctx.fillStyle = '#e6faff';
    for (const [sx, sy, ph] of [[4, -80, 0], [18, -62, 1.4], [26, -34, 2.7], [38 + hairWave * 0.6, 8, 4.1], [32 + hairWave * 0.8, 52, 5.2]]) {
      ctx.globalAlpha = 0.4 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.1 + ph));
      ctx.beginPath();
      ctx.arc(sx, sy, 1.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // end fairy
  }

  function drawBotanicalForeground(t) {
    // Bioluminescent ghost-dew cups in the moss
    for (const dc of dewCups) {
      const sway = Math.sin(t * 1.1 + dc.x * 0.05) * 3;
      const tipX = dc.x + dc.tilt * dc.h + sway;
      const tipY = dc.y - dc.h;

      ctx.strokeStyle = 'rgba(92, 178, 185, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(dc.x, dc.y + 8);
      ctx.quadraticCurveTo(dc.x + sway * 0.3, dc.y - dc.h * 0.5, tipX, tipY);
      ctx.stroke();

      // Soft cyan glow around bell cap
      const g = dc.r * 3.2;
      ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 1.9 + dc.x);
      ctx.drawImage(cyanSprite, tipX - g, tipY - g, g * 2, g * 2);
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#cefaf6';
      ctx.beginPath();
      ctx.ellipse(tipX, tipY, dc.r, dc.r * 0.65, dc.tilt * 0.6, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // Lush fern fronds at bottom edges
    for (const f of ferns) {
      const sway = Math.sin(t * 0.85 + f.x * 0.03) * 0.045;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle + sway);
      ctx.scale(f.scale, f.scale);

      const stemColor = f.dark ? '#050b12' : '#122c36';
      const leafColor = f.dark ? '#060d16' : '#163842';
      ctx.strokeStyle = stemColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(f.len * 0.5, -14, f.len, 6);
      ctx.stroke();

      const pairs = 13;
      for (let i = 1; i < pairs; i++) {
        const u = i / pairs;
        const px = u * f.len;
        const py = 2 * (1 - u) * u * (-14) + u * u * 6;
        const leafLen = Math.sin(u * Math.PI) * 26 * (1 - u * 0.35);

        ctx.fillStyle = leafColor;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(px + 4, py + side * leafLen * 0.52, leafLen * 0.58, 3.2, side * 0.95, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Drifting ambient woodland spores
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const sp of spores) {
      const px = (sp.x + t * sp.vx + Math.sin(t * 0.7 + sp.phase) * 18 + VW * 10) % VW;
      const py = 90 + ((sp.y + t * sp.vy + 820 * 10) % 810);
      const pulse = 0.3 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.5 + sp.phase));
      ctx.globalAlpha = pulse;
      ctx.drawImage(sp.kind, px - sp.size, py - sp.size, sp.size * 2, sp.size * 2);
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    // Soft atmospheric vignette to focus light inward (organic lighting, not a frame)
    const vig = ctx.createRadialGradient(VW * 0.5, VH * 0.48, 210, VW * 0.5, VH * 0.5, 540);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(0.75, 'rgba(4, 7, 16, 0.18)');
    vig.addColorStop(1, 'rgba(3, 5, 12, 0.58)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, VW, VH);
  }

  let lastTime = performance.now();
  let elapsed = 0;

  function render(now) {
    const dt = Math.min(0.05, Math.max(0, (now - lastTime) * 0.001));
    lastTime = now;
    elapsed += dt;

    // Smooth pointer easing
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3.5);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3.5);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(offsetX, offsetY);
    ctx.scale(viewScale, viewScale);

    drawSkyAndMoon(elapsed);
    drawWillowCanopy(elapsed);
    drawMossAndWatchGlow(elapsed);
    drawStoppedPocketWatch(elapsed);
    drawFairy(elapsed);
    drawBotanicalForeground(elapsed);

    ctx.restore();
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
  "title": "The Fairy of Stopped Clocks",
  "statement": "A quiet sanctuary outside time; rest, release, and unhurried grace."
}
```