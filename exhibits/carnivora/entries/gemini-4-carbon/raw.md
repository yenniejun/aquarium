```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    background: #061015;
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

  let W = 0;
  let H = 0;
  let DPR = 1;
  let U = 300; // responsive unit scale
  let CX = 0;
  let POT_Y = 0;

  // Pre-rendered radial glow sprites for fast bioluminescence
  function makeGlowSprite(stops) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const gctx = c.getContext('2d');
    const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    for (const [pos, col] of stops) grad.addColorStop(pos, col);
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 64, 64);
    return c;
  }

  const glows = {
    amber: makeGlowSprite([
      [0.0, 'rgba(255, 232, 150, 0.95)'],
      [0.28, 'rgba(255, 168, 58, 0.52)'],
      [0.65, 'rgba(210, 75, 40, 0.16)'],
      [1.0, 'rgba(180, 40, 30, 0)']
    ]),
    rose: makeGlowSprite([
      [0.0, 'rgba(255, 195, 210, 0.95)'],
      [0.3, 'rgba(238, 72, 125, 0.55)'],
      [0.68, 'rgba(145, 24, 78, 0.18)'],
      [1.0, 'rgba(90, 10, 45, 0)']
    ]),
    dew: makeGlowSprite([
      [0.0, 'rgba(235, 255, 250, 0.98)'],
      [0.25, 'rgba(130, 245, 225, 0.55)'],
      [0.6, 'rgba(60, 175, 170, 0.16)'],
      [1.0, 'rgba(30, 110, 120, 0)']
    ]),
    moth: makeGlowSprite([
      [0.0, 'rgba(255, 248, 215, 0.95)'],
      [0.32, 'rgba(225, 215, 145, 0.42)'],
      [0.7, 'rgba(130, 185, 165, 0.12)'],
      [1.0, 'rgba(80, 140, 130, 0)']
    ]),
    jade: makeGlowSprite([
      [0.0, 'rgba(190, 255, 195, 0.9)'],
      [0.35, 'rgba(85, 215, 135, 0.42)'],
      [1.0, 'rgba(25, 110, 70, 0)']
    ])
  };

  function drawGlow(sprite, x, y, radius, alpha) {
    if (alpha <= 0.005 || radius <= 0.2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  }

  // Deterministic pseudo-random helper for botanical textures
  let seed = 4219;
  function srand() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  // Precomputed moss mounds, sprigs, crackles, pebbles, spore-pins, basal leaves
  const mossMounds = [
    { x: -0.22, y: -0.012, rx: 0.11, ry: 0.046, c1: '#23663d', c2: '#0c291b' },
    { x:  0.21, y: -0.010, rx: 0.115, ry: 0.045, c1: '#1e5c37', c2: '#0b2519' },
    { x: -0.11, y: -0.028, rx: 0.135, ry: 0.056, c1: '#2f7c46', c2: '#103321' },
    { x:  0.10, y: -0.025, rx: 0.13, ry: 0.054, c1: '#2b7542', c2: '#0f301f' },
    { x:  0.00, y: -0.036, rx: 0.15, ry: 0.062, c1: '#3b8e4c', c2: '#133a24' },
    { x: -0.17, y:  0.006, rx: 0.10, ry: 0.038, c1: '#358247', c2: '#10311e' },
    { x:  0.16, y:  0.008, rx: 0.105, ry: 0.039, c1: '#317b43', c2: '#0f2d1c' },
    { x: -0.04, y:  0.012, rx: 0.13, ry: 0.042, c1: '#499d50', c2: '#153b23' }
  ];

  const mossSprigs = [];
  for (let i = 0; i < 95; i++) {
    const m = mossMounds[Math.floor(srand() * mossMounds.length)];
    const ang = Math.PI + srand() * Math.PI;
    const rr = 0.65 + srand() * 0.42;
    mossSprigs.push({
      x: m.x + Math.cos(ang) * m.rx * rr,
      y: m.y + Math.sin(ang) * m.ry * rr * 0.9,
      ang: -Math.PI * 0.5 + (srand() - 0.5) * 1.1,
      len: 0.012 + srand() * 0.016,
      hue: srand()
    });
  }

  const potCrackles = [];
  for (let i = 0; i < 14; i++) {
    const sx = (srand() - 0.5) * 0.52;
    const sy = 0.025 + srand() * 0.085;
    const pts = [{ x: sx, y: sy }];
    let cx = sx, cy = sy;
    for (let s = 0; s < 3; s++) {
      cx += (srand() - 0.5) * 0.07;
      cy += (srand() - 0.35) * 0.035;
      pts.push({ x: cx, y: cy });
    }
    potCrackles.push(pts);
  }

  const sporePins = [
    { x: -0.23, y: -0.025, h: 0.048, lean: -0.18, phase: 0.4 },
    { x: -0.19, y: -0.015, h: 0.033, lean: -0.08, phase: 1.7 },
    { x:  0.20, y: -0.022, h: 0.044, lean:  0.22, phase: 2.9 },
    { x:  0.24, y: -0.012, h: 0.030, lean:  0.31, phase: 4.1 },
    { x: -0.08, y:  0.008, h: 0.028, lean: -0.12, phase: 5.2 }
  ];

  const pebbles = [
    { x: -0.14, y: 0.014, rx: 0.022, ry: 0.011, rot: -0.2 },
    { x:  0.13, y: 0.016, rx: 0.018, ry: 0.010, rot:  0.25 },
    { x:  0.165, y: 0.020, rx: 0.012, ry: 0.007, rot: 0.1 }
  ];

  const basalLeaves = [
    { ang: -2.72, len: 0.16, wid: 0.036, curve: -0.04, layer: 0 },
    { ang: -0.42, len: 0.165, wid: 0.036, curve:  0.04, layer: 0 },
    { ang: -2.35, len: 0.135, wid: 0.034, curve: -0.03, layer: 0 },
    { ang: -0.78, len: 0.14, wid: 0.034, curve:  0.03, layer: 0 },
    { ang: -2.92, len: 0.145, wid: 0.032, curve:  0.03, layer: 1 },
    { ang: -0.22, len: 0.15, wid: 0.032, curve: -0.03, layer: 1 },
    { ang: -1.57, len: 0.105, wid: 0.035, curve:  0.01, layer: 1 }
  ];

  // Four Siren's Dew-Cradles: coordinates normalized to U around (CX, POT_Y)
  const cradleDefs = [
    {
      // Tall graceful central-left queen
      bx: -0.015, by: -0.035,
      c1x: -0.13, c1y: -0.22,
      c2x: -0.12, c2y: -0.45,
      hx: -0.045, hy: -0.58,
      scale: 1.06,
      tilt: 0.52,
      roll: 0.22,
      tentacles: 22,
      swayPhase: 0.0,
      swaySpeed: 0.85
    },
    {
      // Mid-upper right watcher
      bx:  0.018, by: -0.032,
      c1x:  0.11, c1y: -0.18,
      c2x:  0.24, c2y: -0.34,
      hx:   0.185, hy: -0.45,
      scale: 0.96,
      tilt: 0.56,
      roll: -0.34,
      tentacles: 20,
      swayPhase: 1.9,
      swaySpeed: 0.94
    },
    {
      // Mid-left gatherer
      bx: -0.022, by: -0.028,
      c1x: -0.15, c1y: -0.13,
      c2x: -0.26, c2y: -0.25,
      hx:  -0.21, hy: -0.35,
      scale: 0.90,
      tilt: 0.58,
      roll: 0.38,
      tentacles: 18,
      swayPhase: 3.7,
      swaySpeed: 1.02
    },
    {
      // Foreground lower gem
      bx:  0.008, by: -0.022,
      c1x:  0.05, c1y: -0.10,
      c2x:  0.11, c2y: -0.18,
      hx:   0.055, hy: -0.245,
      scale: 0.88,
      tilt: 0.66,
      roll: -0.14,
      tentacles: 18,
      swayPhase: 5.1,
      swaySpeed: 1.10
    }
  ];

  const STATE_OPEN = 0;
  const STATE_SNARED = 1;
  const STATE_CLOSING = 2;
  const STATE_DIGESTING = 3;
  const STATE_OPENING = 4;

  const cradles = cradleDefs.map((def, idx) => {
    const tents = [];
    for (let i = 0; i < def.tentacles; i++) {
      const a = (i / def.tentacles) * Math.PI * 2;
      const ring = i % 2 === 0 ? 1.0 : 0.78;
      tents.push({
        angle: a,
        ring,
        lenMul: (0.92 + 0.16 * Math.sin(i * 2.7 + idx)) * ring,
        phase: i * 0.45 + idx
      });
    }
    return {
      idx,
      def,
      tents,
      state: STATE_OPEN,
      timer: 0,
      curl: 0,          // 0 = open, 1 = clasped shut
      dewScale: 1,      // size of mucilage droplets
      lureStrength: idx === 0 ? 1 : 0,
      digestGlow: 0,
      recoilX: 0,
      recoilY: 0,
      velX: 0,
      velY: 0,
      worldHeadX: 0,
      worldHeadY: 0,
      capturedBug: null,
      stickyThreads: [],
      veinPulses: []    // [0..1] traveling from head (1) to base (0)
    };
  });

  let activeLureIdx = 0;
  let lureSwitchTimer = 6.5;
  let rosetteGlow = 0;

  // Ambient spores, lure scent-motes, and breeze motes
  const ambientMotes = [];
  const scentMotes = [];
  const bugs = [];

  // Pointer breeze tracking (mouse / pen)
  const pointer = {
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    energy: 0,
    active: false
  };

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    const nx = e.clientX - rect.left;
    const ny = e.clientY - rect.top;
    if (pointer.active) {
      const dx = nx - pointer.x;
      const dy = ny - pointer.y;
      pointer.vx = pointer.vx * 0.55 + dx * 0.45;
      pointer.vy = pointer.vy * 0.55 + dy * 0.45;
      const spd = Math.hypot(dx, dy);
      pointer.energy = Math.min(1, pointer.energy + spd * 0.025 + 0.08);
    } else {
      pointer.active = true;
      pointer.energy = 0.35;
    }
    pointer.x = nx;
    pointer.y = ny;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, { passive: true });

  function updateLayout(prevW, prevH) {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));

    U = Math.min(W * 0.94, H * 0.78);
    CX = W * 0.5;
    POT_Y = H * 0.815;

    if (prevW > 0 && prevH > 0) {
      const sx = W / prevW;
      const sy = H / prevH;
      for (const b of bugs) {
        b.x *= sx;
        b.y *= sy;
      }
      for (const m of ambientMotes) {
        m.x *= sx;
        m.y *= sy;
      }
      for (const s of scentMotes) {
        s.x *= sx;
        s.y *= sy;
      }
    }
  }

  window.addEventListener('resize', () => updateLayout(W, H), { passive: true });
  updateLayout(0, 0);

  // Bell-jar interior soft boundary helper so bugs stay inside dome shape
  function enforceDomeBounds(entity, dt) {
    const marginX = W * 0.085;
    const domeR = W * 0.5 - marginX;
    const domeCenterY = marginX + domeR;
    const floorY = POT_Y - U * 0.05;

    if (entity.y < domeCenterY) {
      const dx = entity.x - CX;
      const dy = entity.y - domeCenterY;
      const dist = Math.hypot(dx, dy);
      if (dist > domeR && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const pen = dist - domeR;
        entity.vx -= nx * pen * 14 * dt;
        entity.vy -= ny * pen * 14 * dt;
        if (dist > domeR + 8) {
          entity.x = CX + nx * (domeR + 8);
          entity.y = domeCenterY + ny * (domeR + 8);
        }
      }
    } else {
      if (entity.x < marginX) entity.vx += (marginX - entity.x) * 14 * dt;
      if (entity.x > W - marginX) entity.vx -= (entity.x - (W - marginX)) * 14 * dt;
    }

    if (entity.y > floorY) {
      entity.vy -= (entity.y - floorY) * 18 * dt;
    }
    if (entity.y < H * 0.06) {
      entity.vy += (H * 0.06 - entity.y) * 20 * dt;
    }
  }

  function spawnBug(fromMoss) {
    const isMoth = bugs.filter(b => b.kind === 'moth').length < 5;
    let x, y;
    if (fromMoss) {
      x = CX + (Math.random() - 0.5) * U * 0.34;
      y = POT_Y - U * 0.03;
    } else {
      const ang = Math.random() * Math.PI * 2;
      x = CX + Math.cos(ang) * W * 0.26;
      y = H * (0.20 + Math.random() * 0.42);
    }
    bugs.push({
      kind: isMoth ? 'moth' : 'gnat',
      x,
      y,
      vx: (Math.random() - 0.5) * 24,
      vy: fromMoss ? -35 - Math.random() * 25 : (Math.random() - 0.5) * 24,
      wanderAng: Math.random() * Math.PI * 2,
      wingPhase: Math.random() * 10,
      size: isMoth ? (0.88 + Math.random() * 0.32) : (0.65 + Math.random() * 0.25),
      curiosity: 0.45 + Math.random() * 0.65,
      age: fromMoss ? 0 : 5,
      caughtBy: null,
      struggle: 0,
      fade: 1,
      trail: []
    });
  }

  for (let i = 0; i < 9; i++) spawnBug(false);

  for (let i = 0; i < 34; i++) {
    ambientMotes.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.88,
      r: 0.6 + Math.random() * 1.4,
      vy: -3 - Math.random() * 6,
      vx: (Math.random() - 0.5) * 4,
      phase: Math.random() * Math.PI * 2,
      tint: Math.random() > 0.4 ? 'jade' : 'amber'
    });
  }

  // Evaluate cubic Bezier point & tangent
  function cubicPoint(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
      x: mt2 * mt * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t2 * t * p3x,
      y: mt2 * mt * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t2 * t * p3y
    };
  }

  function getCradleGeometry(c, time) {
    const d = c.def;
    const sway = Math.sin(time * d.swaySpeed + d.swayPhase);
    const sway2 = Math.cos(time * d.swaySpeed * 0.67 + d.swayPhase * 1.3);
    const heavy = (c.state === STATE_CLOSING || c.state === STATE_DIGESTING) ? 0.022 * c.curl : 0;

    const p0x = CX + d.bx * U;
    const p0y = POT_Y + d.by * U;
    const p1x = CX + (d.c1x + sway * 0.008) * U + c.recoilX * 0.35;
    const p1y = POT_Y + d.c1y * U + c.recoilY * 0.35;
    const p2x = CX + (d.c2x + sway * 0.017 + sway2 * 0.006) * U + c.recoilX * 0.75;
    const p2y = POT_Y + (d.c2y + heavy * 0.6) * U + c.recoilY * 0.75;
    const p3x = CX + (d.hx + sway * 0.023 + sway2 * 0.009) * U + c.recoilX;
    const p3y = POT_Y + (d.hy + Math.abs(sway) * 0.005 + heavy) * U + c.recoilY;

    return { p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y };
  }

  function computeTentacleTip(c, tent, headX, headY, time) {
    const d = c.def;
    const padR = U * 0.031 * d.scale;
    const baseLen = U * 0.068 * d.scale * tent.lenMul;
    const wave = Math.sin(time * 2.1 + tent.phase) * 0.07 * (1 - c.curl);
    const a = tent.angle + wave * 0.3;

    // Local coordinates before roll rotation
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);

    // Base attachment on rim of nectar pad
    const rimLX = cosA * padR;
    const rimLY = sinA * padR * d.tilt;

    // Open tip spreads wide; curled tip arches up and clasps over center
    const openSpread = padR + baseLen;
    const openLX = cosA * openSpread;
    const openLY = sinA * openSpread * d.tilt - (0.18 + Math.sin(time * 1.8 + tent.phase) * 0.05) * baseLen;

    // Clasped dome tip
    const stagger = tent.ring > 0.9 ? 0.0 : 0.12;
    const effCurl = Math.max(0, Math.min(1, (c.curl - stagger) / (1 - stagger)));
    const easeCurl = effCurl * effCurl * (3 - 2 * effCurl);

    const claspLX = cosA * padR * 0.16;
    const claspLY = sinA * padR * 0.14 * d.tilt - baseLen * 0.72;

    const tipLX = openLX + (claspLX - openLX) * easeCurl;
    const tipLY = openLY + (claspLY - openLY) * easeCurl;

    // Control point bows outward when clasping to form a lantern cage
    const midSpread = openSpread * (0.62 + 0.25 * Math.sin(easeCurl * Math.PI));
    const ctrlLX = cosA * midSpread;
    const ctrlLY = sinA * midSpread * d.tilt - baseLen * (0.12 + 0.78 * easeCurl);

    const cosR = Math.cos(d.roll);
    const sinR = Math.sin(d.roll);

    return {
      sinDepth: sinA,
      bx: headX + rimLX * cosR - rimLY * sinR,
      by: headY + rimLX * sinR + rimLY * cosR,
      cx: headX + ctrlLX * cosR - ctrlLY * sinR,
      cy: headY + ctrlLX * sinR + ctrlLY * cosR,
      tx: headX + tipLX * cosR - tipLY * sinR,
      ty: headY + tipLX * sinR + tipLY * cosR
    };
  }

  function snareBug(cradle, bug, time) {
    cradle.state = STATE_SNARED;
    cradle.timer = 0;
    cradle.capturedBug = bug;
    bug.caughtBy = cradle;
    bug.struggle = 1.0;

    // Recoil spring impulse from impact
    cradle.velX += bug.vx * 0.12;
    cradle.velY += bug.vy * 0.12 + U * 0.08;

    // Pick 5 nearest tentacles to cast sticky mucilage strands
    const scored = cradle.tents.map((t, idx) => {
      const tip = computeTentacleTip(cradle, t, cradle.worldHeadX, cradle.worldHeadY, time);
      const dist = Math.hypot(tip.tx - bug.x, tip.ty - bug.y);
      return { idx, dist };
    }).sort((a, b) => a.dist - b.dist);

    cradle.stickyThreads = scored.slice(0, 5).map(s => s.idx);
  }

  function update(dt, time) {
    // Decay pointer breeze smoothly
    pointer.energy *= Math.pow(0.18, dt);
    pointer.vx *= Math.pow(0.06, dt);
    pointer.vy *= Math.pow(0.06, dt);

    // Rotate active lure cradle periodically among open cradles
    lureSwitchTimer -= dt;
    if (lureSwitchTimer <= 0 || cradles[activeLureIdx].state !== STATE_OPEN) {
      const openIndices = cradles.filter(c => c.state === STATE_OPEN).map(c => c.idx);
      if (openIndices.length > 0) {
        activeLureIdx = openIndices[Math.floor(Math.random() * openIndices.length)];
      }
      lureSwitchTimer = 6.0 + Math.random() * 4.0;
    }

    rosetteGlow = Math.max(0, rosetteGlow - dt * 0.55);

    // Update cradles
    for (const c of cradles) {
      // Spring physics for stem recoil
      const k = 28;
      const damp = 6.2;
      c.velX += (-k * c.recoilX - damp * c.velX) * dt;
      c.velY += (-k * c.recoilY - damp * c.velY) * dt;
      c.recoilX += c.velX * dt;
      c.recoilY += c.velY * dt;

      const targetLure = (c.state === STATE_OPEN && c.idx === activeLureIdx) ? 1.0 : 0.22;
      c.lureStrength += (targetLure - c.lureStrength) * Math.min(1, dt * 1.8);

      const geom = getCradleGeometry(c, time);
      c.worldHeadX = geom.p3x;
      c.worldHeadY = geom.p3y;

      // Emit drifting golden scent spores when luring strongly
      if (c.state === STATE_OPEN && c.lureStrength > 0.55 && Math.random() < dt * 3.8) {
        scentMotes.push({
          x: c.worldHeadX + (Math.random() - 0.5) * U * 0.04,
          y: c.worldHeadY - U * 0.01,
          vx: (Math.random() - 0.5) * 8,
          vy: -10 - Math.random() * 14,
          life: 1.0,
          decay: 0.28 + Math.random() * 0.2,
          size: 1.1 + Math.random() * 1.3,
          kind: 'lure'
        });
      }

      c.timer += dt;

      if (c.state === STATE_SNARED) {
        c.curl = Math.min(0.22, c.timer * 0.26);
        if (c.capturedBug) {
          // Elastic mucilage pulls prey into the velvety cup center
          const tx = c.worldHeadX;
          const ty = c.worldHeadY - U * 0.012 * c.def.scale;
          c.capturedBug.x += (tx - c.capturedBug.x) * Math.min(1, dt * 5.2);
          c.capturedBug.y += (ty - c.capturedBug.y) * Math.min(1, dt * 5.2);
          c.capturedBug.struggle = Math.max(0.35, 1.0 - c.timer * 0.5);
        }
        if (c.timer >= 0.85) {
          c.state = STATE_CLOSING;
          c.timer = 0;
        }
      } else if (c.state === STATE_CLOSING) {
        const p = Math.min(1, c.timer / 0.95);
        c.curl = 0.22 + 0.78 * (1 - Math.pow(1 - p, 3));
        c.digestGlow = p * 0.65;
        if (c.capturedBug) {
          c.capturedBug.x = c.worldHeadX;
          c.capturedBug.y = c.worldHeadY - U * 0.015 * c.def.scale;
          c.capturedBug.struggle = Math.max(0.08, 0.35 * (1 - p));
        }
        if (p >= 1) {
          c.state = STATE_DIGESTING;
          c.timer = 0;
          c.stickyThreads = [];
          c.veinPulses.push(1.0);
        }
      } else if (c.state === STATE_DIGESTING) {
        const dur = 4.4;
        const p = Math.min(1, c.timer / dur);
        c.curl = 1.0;
        c.dewScale = Math.max(0.25, 1.0 - p * 0.75);
        c.digestGlow = (0.65 + 0.35 * Math.sin(c.timer * 4.2)) * (1 - p * 0.25);

        // Periodic vascular nutrient pulses flowing down the stem
        if (Math.floor((c.timer - dt) / 1.15) < Math.floor(c.timer / 1.15) && p < 0.82) {
          c.veinPulses.push(1.0);
        }

        if (c.capturedBug) {
          c.capturedBug.x = c.worldHeadX;
          c.capturedBug.y = c.worldHeadY - U * 0.016 * c.def.scale;
          c.capturedBug.struggle = 0;
          c.capturedBug.fade = Math.max(0, 1 - p * 1.15);
        }

        if (p >= 1) {
          if (c.capturedBug) {
            const idx = bugs.indexOf(c.capturedBug);
            if (idx !== -1) bugs.splice(idx, 1);
            c.capturedBug = null;
            // Hatch a fresh creature from the damp moss to sustain the micro-world
            if (bugs.length < 9) spawnBug(true);
          }
          c.state = STATE_OPENING;
          c.timer = 0;
          // Release delicate stardust puff as the cradle yawns open
          for (let k = 0; k < 7; k++) {
            scentMotes.push({
              x: c.worldHeadX + (Math.random() - 0.5) * U * 0.025,
              y: c.worldHeadY - U * 0.015,
              vx: (Math.random() - 0.5) * 18,
              vy: -14 - Math.random() * 18,
              life: 1.0,
              decay: 0.45 + Math.random() * 0.25,
              size: 0.9 + Math.random() * 1.2,
              kind: 'ash'
            });
          }
        }
      } else if (c.state === STATE_OPENING) {
        const p = Math.min(1, c.timer / 1.75);
        const ease = 1 - Math.pow(1 - p, 2.4);
        c.curl = 1 - ease;
        c.dewScale = 0.25 + 0.75 * Math.pow(p, 1.4);
        c.digestGlow = Math.max(0, (1 - p * 1.6) * 0.45);
        if (p >= 1) {
          c.curl = 0;
          c.dewScale = 1;
          c.digestGlow = 0;
          c.state = STATE_OPEN;
          c.timer = 0;
        }
      }

      // Advance nutrient pulses down stem (1 = trap head -> 0 = rosette heart)
      for (let i = c.veinPulses.length - 1; i >= 0; i--) {
        c.veinPulses[i] -= dt * 0.62;
        if (c.veinPulses[i] <= 0) {
          c.veinPulses.splice(i, 1);
          rosetteGlow = Math.min(1, rosetteGlow + 0.45);
        }
      }
    }

    // Update flying bugs
    const lureCradle = cradles[activeLureIdx];
    const pointerRadius = U * 0.24;

    for (const b of bugs) {
      b.age += dt;
      if (b.caughtBy) {
        b.wingPhase += dt * (28 + b.struggle * 46);
        continue;
      }

      b.wingPhase += dt * (b.kind === 'moth' ? 24 : 42);
      b.wanderAng += (Math.sin(time * 1.7 + b.wingPhase * 0.03) + (Math.random() - 0.5) * 3.2) * dt;

      const baseSpeed = (b.kind === 'moth' ? 0.11 : 0.15) * U;
      let ax = Math.cos(b.wanderAng) * baseSpeed * 1.5;
      let ay = Math.sin(b.wanderAng) * baseSpeed * 1.3 - 3;

      // Gentle hypnotic pull toward active lure cradle (after newly hatched bugs rise a bit)
      if (b.age > 2.2 && lureCradle && lureCradle.state === STATE_OPEN) {
        const lx = lureCradle.worldHeadX - b.x;
        const ly = (lureCradle.worldHeadY - U * 0.025) - b.y;
        const dist = Math.hypot(lx, ly);
        if (dist > 1 && dist < U * 0.68) {
          const pull = b.curiosity * lureCradle.lureStrength * U * 0.20 / (1 + dist / (U * 0.25));
          // Slight spiral tangential drift so moths circle alluringly
          ax += (lx / dist) * pull - (ly / dist) * pull * 0.32;
          ay += (ly / dist) * pull + (lx / dist) * pull * 0.32;
        }
      }

      // Pointer breeze & herding interaction
      if (pointer.energy > 0.015) {
        const px = b.x - pointer.x;
        const py = b.y - pointer.y;
        const pdist = Math.hypot(px, py);
        if (pdist < pointerRadius && pdist > 0.001) {
          const falloff = Math.pow(1 - pdist / pointerRadius, 1.5);
          const push = U * 1.45 * falloff * (0.35 + pointer.energy * 0.9);
          ax += (px / pdist) * push + pointer.vx * 9.5 * falloff;
          ay += (py / pdist) * push + pointer.vy * 9.5 * falloff;
        }
      }

      b.vx += ax * dt;
      b.vy += ay * dt;

      // Air drag & speed cap
      const drag = Math.pow(0.22, dt);
      b.vx *= drag;
      b.vy *= drag;

      const maxSpd = U * 0.42;
      const spd = Math.hypot(b.vx, b.vy);
      if (spd > maxSpd) {
        b.vx = (b.vx / spd) * maxSpd;
        b.vy = (b.vy / spd) * maxSpd;
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      enforceDomeBounds(b, dt);

      // Trail history
      b.trail.unshift({ x: b.x, y: b.y });
      if (b.trail.length > 6) b.trail.pop();

      // Check collision with any OPEN Dew-Cradle's sticky halo
      if (b.age > 1.4) {
        for (const c of cradles) {
          if (c.state !== STATE_OPEN) continue;
          const hx = c.worldHeadX;
          const hy = c.worldHeadY - U * 0.015 * c.def.scale;
          const dx = b.x - hx;
          const dy = (b.y - hy) * 1.22;
          const catchR = U * 0.072 * c.def.scale;
          if (dx * dx + dy * dy < catchR * catchR) {
            snareBug(c, b, time);
            break;
          }
        }
      }
    }

    // Update ambient spores
    for (const m of ambientMotes) {
      m.y += m.vy * dt * (U / 320);
      m.x += (m.vx + Math.sin(time * 0.8 + m.phase) * 5) * dt * (U / 320);
      if (pointer.energy > 0.02) {
        const dx = m.x - pointer.x;
        const dy = m.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < U * 0.20 && d > 1) {
          const f = (1 - d / (U * 0.20)) * pointer.energy;
          m.x += (pointer.vx * 0.35 + (dx / d) * 18 * dt) * f;
          m.y += (pointer.vy * 0.35 + (dy / d) * 18 * dt) * f;
        }
      }
      if (m.y < H * 0.05) {
        m.y = POT_Y - Math.random() * U * 0.05;
        m.x = CX + (Math.random() - 0.5) * W * 0.72;
      }
      if (m.x < W * 0.05) m.x = W * 0.95;
      if (m.x > W * 0.95) m.x = W * 0.05;
    }

    // Update lure scent & stardust motes
    for (let i = scentMotes.length - 1; i >= 0; i--) {
      const s = scentMotes[i];
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        scentMotes.splice(i, 1);
        continue;
      }
      s.x += (s.vx + Math.sin(time * 2.4 + i) * 6) * dt;
      s.y += s.vy * dt;
    }
  }

  function drawBackground() {
    const bgGrad = ctx.createRadialGradient(
      CX, POT_Y - U * 0.34, U * 0.04,
      CX, H * 0.52, Math.max(W, H) * 0.78
    );
    bgGrad.addColorStop(0.0, '#112a30');
    bgGrad.addColorStop(0.45, '#09191f');
    bgGrad.addColorStop(1.0, '#040b0f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle warm conservatory glow around the plant's core
    drawGlow(glows.amber, CX, POT_Y - U * 0.30, U * 0.52, 0.08 + rosetteGlow * 0.05);
  }

  function drawPotShadowAndBase() {
    // Grounding shadow beneath pot
    const shGrad = ctx.createRadialGradient(CX, POT_Y + U * 0.135, U * 0.02, CX, POT_Y + U * 0.135, U * 0.36);
    shGrad.addColorStop(0, 'rgba(1, 5, 7, 0.82)');
    shGrad.addColorStop(0.65, 'rgba(2, 8, 11, 0.38)');
    shGrad.addColorStop(1, 'rgba(4, 11, 15, 0)');
    ctx.fillStyle = shGrad;
    ctx.save();
    ctx.translate(CX, POT_Y + U * 0.135);
    ctx.scale(1, 0.24);
    ctx.beginPath();
    ctx.arc(0, 0, U * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Inner dark soil rim of pot (behind moss)
    ctx.fillStyle = '#0c1614';
    ctx.beginPath();
    ctx.ellipse(CX, POT_Y, U * 0.31, U * 0.056, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMossAndRosette(time, layerFilter) {
    if (layerFilter === 0) {
      // Cushion moss mounds
      for (const m of mossMounds) {
        const mx = CX + m.x * U;
        const my = POT_Y + m.y * U;
        const rx = m.rx * U;
        const ry = m.ry * U;
        const mg = ctx.createRadialGradient(mx - rx * 0.22, my - ry * 0.45, ry * 0.1, mx, my + ry * 0.2, Math.max(rx, ry) * 1.15);
        mg.addColorStop(0, m.c1);
        mg.addColorStop(1, m.c2);
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.ellipse(mx, my, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fine fuzzy moss sprigs
      ctx.lineWidth = Math.max(1.0, U * 0.0032);
      ctx.lineCap = 'round';
      for (const sp of mossSprigs) {
        const sx = CX + sp.x * U;
        const sy = POT_Y + sp.y * U;
        const len = sp.len * U;
        ctx.strokeStyle = sp.hue > 0.5 ? 'rgba(116, 192, 95, 0.52)' : 'rgba(68, 148, 78, 0.48)';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(sp.ang) * len, sy + Math.sin(sp.ang) * len);
        ctx.stroke();
      }

      // Translucent quartz pebbles
      for (const p of pebbles) {
        const px = CX + p.x * U;
        const py = POT_Y + p.y * U;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rot);
        const pg = ctx.createLinearGradient(-p.rx * U, -p.ry * U, p.rx * U, p.ry * U);
        pg.addColorStop(0, 'rgba(195, 228, 218, 0.68)');
        pg.addColorStop(1, 'rgba(62, 98, 95, 0.58)');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx * U, p.ry * U, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Tiny swaying jade spore-pins
      for (const pin of sporePins) {
        const bx = CX + pin.x * U;
        const by = POT_Y + pin.y * U;
        const sway = Math.sin(time * 1.4 + pin.phase) * 0.006 * U;
        const tx = bx + pin.lean * pin.h * U + sway;
        const ty = by - pin.h * U;

        ctx.strokeStyle = 'rgba(92, 168, 118, 0.72)';
        ctx.lineWidth = Math.max(1.0, U * 0.003);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + sway * 0.4, (by + ty) * 0.5, tx, ty);
        ctx.stroke();

        drawGlow(glows.jade, tx, ty, U * 0.018, 0.45 + 0.2 * Math.sin(time * 2.2 + pin.phase));
        ctx.fillStyle = '#c8ffd4';
        ctx.beginPath();
        ctx.arc(tx, ty, Math.max(1.2, U * 0.0042), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Basal rosette leaves (layer 0 = rear, layer 1 = foreground)
    for (const lf of basalLeaves) {
      if (lf.layer !== layerFilter) continue;
      const rootX = CX;
      const rootY = POT_Y - U * 0.028;
      const tipX = rootX + Math.cos(lf.ang) * lf.len * U;
      const tipY = rootY + Math.sin(lf.ang) * lf.len * U * 0.48 + U * 0.015;
      const perpX = -Math.sin(lf.ang) * lf.wid * U;
      const perpY = Math.cos(lf.ang) * lf.wid * U * 0.55;
      const midX = (rootX + tipX) * 0.5 + lf.curve * U;
      const midY = (rootY + tipY) * 0.5 - U * 0.012;

      const lg = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
      lg.addColorStop(0, '#2a1524');
      lg.addColorStop(0.55, '#194534');
      lg.addColorStop(1, '#2b6b45');

      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.quadraticCurveTo(midX + perpX, midY + perpY, tipX, tipY);
      ctx.quadraticCurveTo(midX - perpX, midY - perpY, rootX, rootY);
      ctx.fill();

      // Glowing midrib vein reactive to nutrient arrival
      const veinAlpha = 0.28 + rosetteGlow * 0.55;
      ctx.strokeStyle = `rgba(195, 232, 125, ${veinAlpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(0.9, U * 0.0028);
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();
    }

    if (layerFilter === 1 && rosetteGlow > 0.02) {
      drawGlow(glows.amber, CX, POT_Y - U * 0.03, U * 0.09, rosetteGlow * 0.48);
    }
  }

  function drawPotFront() {
    const rx = U * 0.315;
    const rimY = POT_Y + U * 0.002;
    const botRx = U * 0.205;
    const botY = POT_Y + U * 0.125;

    // Un-glazed dark iron-clay foot
    ctx.fillStyle = '#241a18';
    ctx.beginPath();
    ctx.ellipse(CX, botY + U * 0.008, botRx * 0.92, U * 0.024, 0, 0, Math.PI);
    ctx.fill();

    // Main artisanal celadon-slate stoneware bowl
    const pg = ctx.createLinearGradient(CX - rx, rimY, CX + rx, botY);
    pg.addColorStop(0.0, '#2b3e40');
    pg.addColorStop(0.28, '#466463');
    pg.addColorStop(0.62, '#2d4445');
    pg.addColorStop(1.0, '#172527');

    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.moveTo(CX - rx, rimY);
    ctx.bezierCurveTo(CX - rx * 1.02, POT_Y + U * 0.078, CX - botRx * 1.15, botY, CX - botRx, botY);
    ctx.quadraticCurveTo(CX, botY + U * 0.036, CX + botRx, botY);
    ctx.bezierCurveTo(CX + botRx * 1.15, botY, CX + rx * 1.02, POT_Y + U * 0.078, CX + rx, rimY);
    ctx.quadraticCurveTo(CX, rimY + U * 0.056, CX - rx, rimY);
    ctx.closePath();
    ctx.fill();

    // Subtle crackle glaze lines clipped to pot body
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(14, 24, 26, 0.36)';
    ctx.lineWidth = Math.max(0.8, U * 0.0022);
    for (const pts of potCrackles) {
      ctx.beginPath();
      ctx.moveTo(CX + pts[0].x * U, POT_Y + pts[0].y * U);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(CX + pts[i].x * U, POT_Y + pts[i].y * U);
      }
      ctx.stroke();
    }

    // Soft celadon specular glaze sheen on left shoulder
    const sheen = ctx.createRadialGradient(CX - rx * 0.48, POT_Y + U * 0.055, U * 0.01, CX - rx * 0.48, POT_Y + U * 0.055, U * 0.14);
    sheen.addColorStop(0, 'rgba(185, 222, 215, 0.20)');
    sheen.addColorStop(1, 'rgba(185, 222, 215, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(CX - rx, POT_Y, rx * 2, U * 0.16);
    ctx.restore();

    // Warm lip rim of the bonsai bowl
    ctx.strokeStyle = 'rgba(138, 152, 142, 0.48)';
    ctx.lineWidth = Math.max(1.3, U * 0.0055);
    ctx.beginPath();
    ctx.ellipse(CX, rimY, rx, U * 0.054, 0, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.stroke();
  }

  function drawBug(b) {
    if (b.fade <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = b.fade;

    // Subtle luminous flight trail when free
    if (!b.caughtBy && b.trail.length > 1) {
      for (let i = 1; i < b.trail.length; i++) {
        const t = b.trail[i];
        const a = (1 - i / b.trail.length) * 0.18;
        ctx.fillStyle = b.kind === 'moth'
          ? `rgba(255, 236, 175, ${a})`
          : `rgba(145, 245, 230, ${a})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(0.8, U * 0.003 * (1 - i / b.trail.length)), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const glowR = U * (b.kind === 'moth' ? 0.042 : 0.026) * b.size;
    drawGlow(b.kind === 'moth' ? glows.moth : glows.dew, b.x, b.y, glowR, 0.48 * b.fade);

    const heading = b.caughtBy
      ? Math.sin(b.wingPhase * 0.7) * 0.35 - Math.PI * 0.5
      : Math.atan2(b.vy, b.vx);

    ctx.translate(b.x, b.y);
    ctx.rotate(heading + Math.PI * 0.5);

    const sc = (U / 340) * b.size;
    const flap = Math.sin(b.wingPhase);
    const wingSpread = 0.32 + 0.68 * Math.abs(flap);

    if (b.kind === 'moth') {
      // Twin pearlescent dusk-moth wings
      ctx.fillStyle = 'rgba(255, 246, 214, 0.86)';
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.scale(side * wingSpread, 1);
        // Forewing
        ctx.beginPath();
        ctx.moveTo(0, -1.5 * sc);
        ctx.bezierCurveTo(9.5 * sc, -7.5 * sc, 11 * sc, 1.5 * sc, 1.5 * sc, 3.2 * sc);
        ctx.closePath();
        ctx.fill();
        // Hindwing
        ctx.fillStyle = 'rgba(232, 214, 168, 0.72)';
        ctx.beginPath();
        ctx.moveTo(0, 1.2 * sc);
        ctx.bezierCurveTo(7.2 * sc, 2.0 * sc, 6.5 * sc, 8.2 * sc, 0.8 * sc, 6.2 * sc);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 246, 214, 0.86)';
        ctx.restore();
      }

      // Slender body & tiny antennae
      ctx.fillStyle = '#fff5d6';
      ctx.beginPath();
      ctx.ellipse(0, 1.2 * sc, 1.35 * sc, 4.2 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Iridescent cyan-gold gnat
      ctx.fillStyle = 'rgba(185, 255, 245, 0.78)';
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.scale(side * wingSpread, 1);
        ctx.beginPath();
        ctx.ellipse(4.2 * sc, 0, 4.4 * sc, 1.7 * sc, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#e0fff9';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.1, 1.5 * sc), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawCradle(c, time) {
    const d = c.def;
    const g = getCradleGeometry(c, time);

    // Outer stem contour
    const stemGrad = ctx.createLinearGradient(g.p0x, g.p0y, g.p3x, g.p3y);
    stemGrad.addColorStop(0.0, '#1f3d2d');
    stemGrad.addColorStop(0.55, '#2b6442');
    stemGrad.addColorStop(1.0, '#5a2844');

    ctx.lineCap = 'round';
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = Math.max(2.0, U * 0.0135 * d.scale);
    ctx.beginPath();
    ctx.moveTo(g.p0x, g.p0y);
    ctx.bezierCurveTo(g.p1x, g.p1y, g.p2x, g.p2y, g.p3x, g.p3y);
    ctx.stroke();

    // Inner translucent vascular highlight along stem
    const baseVeinAlpha = 0.24 + c.digestGlow * 0.35;
    ctx.strokeStyle = `rgba(182, 228, 126, ${baseVeinAlpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(1.0, U * 0.0042 * d.scale);
    ctx.beginPath();
    ctx.moveTo(g.p0x, g.p0y);
    ctx.bezierCurveTo(g.p1x, g.p1y, g.p2x, g.p2y, g.p3x, g.p3y);
    ctx.stroke();

    // Traveling digestive nutrient pulses down the stem
    for (const vp of c.veinPulses) {
      const pt = cubicPoint(g.p0x, g.p0y, g.p1x, g.p1y, g.p2x, g.p2y, g.p3x, g.p3y, vp);
      drawGlow(glows.amber, pt.x, pt.y, U * 0.036 * d.scale, 0.72);
      ctx.fillStyle = '#ffe9a6';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1.3, U * 0.005 * d.scale), 0, Math.PI * 2);
      ctx.fill();
    }

    // Compute all 3D-projected tentacles for painter's depth sorting
    const hx = g.p3x;
    const hy = g.p3y;
    const tentProj = c.tents.map((t, tIdx) => ({
      tIdx,
      t,
      ...computeTentacleTip(c, t, hx, hy, time)
    }));

    const rearTents = tentProj.filter(tp => tp.sinDepth < 0);
    const frontTents = tentProj.filter(tp => tp.sinDepth >= 0);

    // Helper to render a set of tentacles and their refractive mucilage beads
    const renderTentacles = (list, isFront) => {
      for (const tp of list) {
        const tentGrad = ctx.createLinearGradient(tp.bx, tp.by, tp.tx, tp.ty);
        if (c.digestGlow > 0.1) {
          tentGrad.addColorStop(0, '#7c1e48');
          tentGrad.addColorStop(1, '#f08a4b');
        } else {
          tentGrad.addColorStop(0, isFront ? '#7e2049' : '#591635');
          tentGrad.addColorStop(0.65, '#c44563');
          tentGrad.addColorStop(1, '#8ce8d8');
        }

        ctx.strokeStyle = tentGrad;
        ctx.lineWidth = Math.max(1.1, U * 0.0046 * d.scale * (isFront ? 1 : 0.88));
        ctx.beginPath();
        ctx.moveTo(tp.bx, tp.by);
        ctx.quadraticCurveTo(tp.cx, tp.cy, tp.tx, tp.ty);
        ctx.stroke();

        // Refractive mucilage droplet at filament tip
        const dropR = Math.max(1.3, U * 0.0068 * d.scale * c.dewScale * (tp.t.ring > 0.9 ? 1.05 : 0.85));
        const shimmer = 0.75 + 0.25 * Math.sin(time * 3.1 + tp.t.phase);
        drawGlow(
          c.digestGlow > 0.25 ? glows.amber : glows.dew,
          tp.tx, tp.ty,
          dropR * 3.1,
          (isFront ? 0.46 : 0.30) * shimmer * c.dewScale
        );

        ctx.fillStyle = c.digestGlow > 0.25
          ? 'rgba(255, 214, 145, 0.88)'
          : 'rgba(188, 252, 242, 0.84)';
        ctx.beginPath();
        ctx.arc(tp.tx, tp.ty, dropR, 0, Math.PI * 2);
        ctx.fill();

        // Crisp specular highlight on droplet
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.beginPath();
        ctx.arc(tp.tx - dropR * 0.3, tp.ty - dropR * 0.32, dropR * 0.36, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // 1. Rear tentacles
    renderTentacles(rearTents, false);

    // 2. Calyx cup & velvety nectar pad
    const padR = U * 0.033 * d.scale;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(d.roll);

    // Fleshy burgundy calyx base beneath pad
    ctx.fillStyle = '#381329';
    ctx.beginPath();
    ctx.ellipse(0, padR * 0.22, padR * 0.92, padR * d.tilt * 0.95, 0, 0, Math.PI);
    ctx.fill();

    // Velvety crimson-violet nectar pad
    const padGrad = ctx.createRadialGradient(0, -padR * 0.08, padR * 0.08, 0, 0, padR * 1.05);
    padGrad.addColorStop(0.0, '#ffbe5c');
    padGrad.addColorStop(0.38, '#bf2657');
    padGrad.addColorStop(1.0, '#491230');
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, padR * (1 - c.curl * 0.22), padR * d.tilt * (1 - c.curl * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();

    // Shimmering golden nectar beads on pad surface
    const lurePulse = 0.65 + 0.35 * Math.sin(time * 3.4 + d.swayPhase);
    ctx.fillStyle = `rgba(255, 232, 148, ${(0.55 + 0.4 * c.lureStrength * lurePulse) * (1 - c.curl * 0.5)})`;
    for (let n = 0; n < 3; n++) {
      const na = n * 2.09 + 0.4;
      const nx = Math.cos(na) * padR * 0.34;
      const ny = Math.sin(na) * padR * d.tilt * 0.34;
      ctx.beginPath();
      ctx.arc(nx, ny, Math.max(1.0, padR * 0.13), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Lure bioluminescence & digestive lantern glow
    const lureAlpha = (0.20 + 0.46 * c.lureStrength * lurePulse) * (1 - c.curl * 0.6);
    drawGlow(glows.amber, hx, hy - padR * 0.2, U * 0.085 * d.scale, lureAlpha);

    if (c.digestGlow > 0.01) {
      drawGlow(glows.rose, hx, hy - padR * 0.45, U * 0.105 * d.scale, c.digestGlow * 0.85);
      drawGlow(glows.amber, hx, hy - padR * 0.35, U * 0.062 * d.scale, c.digestGlow * 0.70);
    }

    // 3. Captured prey & elastic sticky mucilage strands inside cradle
    if (c.capturedBug) {
      drawBug(c.capturedBug);

      if (c.stickyThreads.length > 0) {
        ctx.strokeStyle = 'rgba(205, 255, 245, 0.78)';
        ctx.lineWidth = Math.max(1.0, U * 0.0032);
        for (const tIdx of c.stickyThreads) {
          const tp = tentProj[tIdx];
          if (!tp) continue;
          const mx = (tp.tx + c.capturedBug.x) * 0.5;
          const my = (tp.ty + c.capturedBug.y) * 0.5 + U * 0.008;
          ctx.beginPath();
          ctx.moveTo(tp.tx, tp.ty);
          ctx.quadraticCurveTo(mx, my, c.capturedBug.x, c.capturedBug.y);
          ctx.stroke();
        }
      }
    }

    // 4. Front tentacles curling up and clasping over the prey
    renderTentacles(frontTents, true);
  }

  function drawParticles(time) {
    // Ambient conservatory spores
    for (const m of ambientMotes) {
      const pulse = 0.45 + 0.55 * Math.sin(time * 1.9 + m.phase);
      const r = m.r * (U / 320);
      drawGlow(m.tint === 'jade' ? glows.jade : glows.amber, m.x, m.y, r * 4.2, 0.22 * pulse);
      ctx.fillStyle = m.tint === 'jade'
        ? `rgba(200, 255, 215, ${0.45 * pulse})`
        : `rgba(255, 232, 168, ${0.45 * pulse})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, Math.max(0.7, r), 0, Math.PI * 2);
      ctx.fill();
    }

    // Lure nectar motes & post-digestion stardust wisps
    for (const s of scentMotes) {
      const r = s.size * (U / 320);
      if (s.kind === 'lure') {
        drawGlow(glows.amber, s.x, s.y, r * 4.5, s.life * 0.42);
        ctx.fillStyle = `rgba(255, 235, 165, ${s.life * 0.8})`;
      } else {
        drawGlow(glows.dew, s.x, s.y, r * 3.8, s.life * 0.32);
        ctx.fillStyle = `rgba(225, 245, 240, ${s.life * 0.65})`;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0.7, r), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let lastTime = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    const time = now * 0.001;

    update(dt, time);

    ctx.save();
    ctx.scale(DPR, DPR);

    drawBackground();
    drawPotShadowAndBase();
    drawMossAndRosette(time, 0);

    // Draw background flying bugs (higher/deeper)
    for (const b of bugs) {
      if (!b.caughtBy && b.y < POT_Y - U * 0.32) drawBug(b);
    }

    // Draw plant stems and Dew-Cradles back-to-front
    drawCradle(cradles[2], time);
    drawCradle(cradles[1], time);
    drawCradle(cradles[0], time);
    drawCradle(cradles[3], time);

    // Foreground basal leaves & bonsai bowl front
    drawMossAndRosette(time, 1);
    drawPotFront();

    // Draw foreground flying bugs
    for (const b of bugs) {
      if (!b.caughtBy && b.y >= POT_Y - U * 0.32) drawBug(b);
    }

    drawParticles(time);

    ctx.restore();
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
  "title": "Siren's Dew-Cradle",
  "statement": "Native to twilight cloud-hollows, this bioluminescent sundew kindles one velvet chalice at a time with warm nectar-light to charm passing dusk-moths. Whatever brushes its starred mucilage halo is drawn inward and woven into a glowing lantern-bud, sending golden pulses of nourishment coursing down its veins."
}
```