```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #04131d;
    touch-action: pan-y;
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
<canvas id="tank"></canvas>
<script>
(() => {
  const canvas = document.getElementById('tank');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Virtual coordinate space anchored to height = 600
  let vw = 800;
  let vh = 600;
  let scale = 1;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth || 800;
    const h = window.innerHeight || 600;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    vh = 600;
    vw = Math.max(360, (w / Math.max(1, h)) * vh);
    scale = canvas.height / vh;
    buildEnvironment();
  }

  // Deterministic pseudo-random helper for consistent scenery across resizes
  function mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Scene elements
  let lightRays = [];
  let bgRocks = [];
  let leftRocks = [];
  let rightRocks = [];
  let crystals = [];
  let kelps = [];
  let seaFerns = [];
  let pebbles = [];
  let motes = [];
  let bubbles = [];
  let rings = [];

  // Pointer tracking (passive, never blocks scrolling or clicks)
  const pointer = { x: 400, y: 300, active: false, lastMove: -10 };
  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      pointer.x = ((e.clientX - rect.left) / rect.width) * vw;
      pointer.y = ((e.clientY - rect.top) / rect.height) * vh;
      pointer.active = true;
      pointer.lastMove = performance.now() * 0.001;
    }
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, { passive: true });

  function buildEnvironment() {
    const rand = mulberry32(4219);

    // Sunbeams
    lightRays = [];
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      lightRays.push({
        xFrac: 0.12 + (i / (rayCount - 1)) * 0.76 + (rand() - 0.5) * 0.06,
        width: 45 + rand() * 65,
        spread: 90 + rand() * 80,
        phase: rand() * Math.PI * 2,
        speed: 0.35 + rand() * 0.3,
        alpha: 0.045 + rand() * 0.04
      });
    }

    // Distant rock silhouettes
    bgRocks = [
      { x: vw * 0.18, y: vh * 0.88, rx: vw * 0.24, ry: 150 },
      { x: vw * 0.55, y: vh * 0.90, rx: vw * 0.28, ry: 115 },
      { x: vw * 0.86, y: vh * 0.86, rx: vw * 0.22, ry: 175 }
    ];

    // Foreground rock formations
    leftRocks = [
      { x: vw * 0.04, y: vh * 0.92, rx: 105, ry: 90, rot: -0.15, c1: '#143342', c2: '#081b26' },
      { x: vw * 0.15, y: vh * 0.94, rx: 85, ry: 62, rot: 0.12, c1: '#193d4e', c2: '#0a202d' },
      { x: vw * 0.08, y: vh * 0.83, rx: 58, ry: 46, rot: 0.25, c1: '#1e485b', c2: '#0d2635' }
    ];

    rightRocks = [
      { x: vw * 0.94, y: vh * 0.90, rx: 120, ry: 110, rot: 0.18, c1: '#133140', c2: '#071924' },
      { x: vw * 0.81, y: vh * 0.93, rx: 95, ry: 68, rot: -0.1, c1: '#1a3f50', c2: '#0a202d' },
      { x: vw * 0.87, y: vh * 0.80, rx: 64, ry: 52, rot: -0.22, c1: '#214d60', c2: '#0e2938' }
    ];

    // Glowing crystals nestled on the right rock ledge
    const cx = vw * 0.815;
    const cy = vh * 0.815;
    crystals = [
      { x: cx - 14, y: cy + 6, len: 36, w: 11, angle: -0.42, hue: 185 },
      { x: cx, y: cy + 2, len: 50, w: 14, angle: -0.14, hue: 198 },
      { x: cx + 13, y: cy + 7, len: 32, w: 10, angle: 0.24, hue: 172 },
      { x: cx - 6, y: cy + 10, len: 24, w: 9, angle: -0.72, hue: 215 },
      { x: cx + 22, y: cy + 12, len: 22, w: 8, angle: 0.56, hue: 188 }
    ];

    // Ribbon kelp
    kelps = [];
    const kelpPositions = [0.05, 0.09, 0.13, 0.22, 0.74, 0.91, 0.96];
    for (let i = 0; i < kelpPositions.length; i++) {
      const isEdge = i < 2 || i > 4;
      kelps.push({
        x: vw * kelpPositions[i],
        y: vh * (0.89 + rand() * 0.07),
        segments: 9,
        segLen: (isEdge ? 26 : 19) + rand() * 11,
        width: 11 + rand() * 6,
        phase: rand() * Math.PI * 2,
        speed: 0.9 + rand() * 0.5,
        hue: 158 + rand() * 26,
        bend: 0
      });
    }

    // Bioluminescent sea-ferns / polyps
    seaFerns = [];
    const fernSpots = [
      { x: vw * 0.17, y: vh * 0.89, count: 5, hue: 325 },
      { x: vw * 0.31, y: vh * 0.94, count: 4, hue: 175 },
      { x: vw * 0.66, y: vh * 0.94, count: 5, hue: 285 },
      { x: vw * 0.88, y: vh * 0.76, count: 4, hue: 42 }
    ];
    for (const spot of fernSpots) {
      for (let j = 0; j < spot.count; j++) {
        const spread = (j - (spot.count - 1) / 2) * 0.26;
        seaFerns.push({
          x: spot.x + spread * 22,
          y: spot.y + Math.abs(spread) * 6,
          len: 28 + rand() * 20,
          baseAngle: -Math.PI / 2 + spread * 0.9,
          phase: rand() * Math.PI * 2,
          hue: spot.hue + (rand() - 0.5) * 18
        });
      }
    }

    // Seabed pebbles
    pebbles = [];
    for (let i = 0; i < 28; i++) {
      pebbles.push({
        x: rand() * vw,
        y: vh * (0.915 + rand() * 0.075),
        rx: 4 + rand() * 10,
        ry: 2.2 + rand() * 4.5,
        rot: (rand() - 0.5) * 0.5,
        shade: 14 + Math.floor(rand() * 18)
      });
    }

    // Floating plankton motes
    if (motes.length === 0) {
      for (let i = 0; i < 38; i++) {
        motes.push(makeMote(rand, true));
      }
    } else {
      for (const m of motes) {
        m.x = Math.min(vw, Math.max(0, m.x));
      }
    }
  }

  function makeMote(randFn, randomY) {
    const r = randFn || Math.random;
    const isGolden = r() < 0.22;
    return {
      x: r() * vw,
      y: randomY ? r() * vh * 0.88 : vh * 0.9 + r() * 30,
      vx: (r() - 0.5) * 8,
      vy: -4 - r() * 9,
      size: isGolden ? 2.4 + r() * 1.6 : 1.1 + r() * 1.5,
      hue: isGolden ? 46 + r() * 20 : 175 + r() * 35,
      phase: r() * Math.PI * 2,
      golden: isGolden
    };
  }

  // 3D Octahedron vertices & faces for the creature's inner prism heart
  const prismVerts = [
    [0, -1.15, 0],
    [0, 1.15, 0],
    [-0.85, 0, -0.85],
    [0.85, 0, -0.85],
    [0.85, 0, 0.85],
    [-0.85, 0, 0.85]
  ];
  const prismFaces = [
    [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2],
    [1, 3, 2], [1, 4, 3], [1, 5, 4], [1, 2, 5]
  ];

  // The Pondering Prism-Puffer
  const creature = {
    x: 400,
    y: 280,
    vx: 0,
    vy: 0,
    facing: 1,       // +1 right, -1 left (smoothed)
    facingTarget: 1,
    tilt: 0,
    size: 46,        // base radius
    puff: 0,         // subtle puff expansion when delighted
    hue: 190,
    targetHue: 190,
    prismRotX: 0.4,
    prismRotY: 0,
    prismSpeed: 1.1,
    finPhase: 0,
    tailPhase: 0,
    eyeX: 0,
    eyeY: 0,
    blink: 0,
    blinkTimer: 3.2,
    state: 'WANDER',
    stateTimer: 4,
    targetX: 460,
    targetY: 270,
    targetMote: null,
    ringCooldown: 1.5,
    crystalExcite: 0
  };

  function spawnBubbleRing(x, y, dirX, dirY, hue) {
    rings.push({
      x,
      y,
      vx: dirX * 42,
      vy: dirY * 22 - 14,
      radius: 5,
      maxRadius: 28 + Math.random() * 12,
      life: 0,
      maxLife: 2.6,
      hue,
      tilt: Math.atan2(dirY, dirX)
    });
  }

  function updateCreature(dt, t) {
    const c = creature;
    const pointerFresh = pointer.active && (t - pointer.lastMove < 6);

    // State machine
    c.stateTimer -= dt;
    c.ringCooldown -= dt;

    if (pointerFresh) {
      c.state = 'GREET';
    } else if (c.state === 'GREET') {
      c.state = 'PONDER';
      c.stateTimer = 2.5;
    } else if (c.stateTimer <= 0) {
      const roll = Math.random();
      if (roll < 0.28) {
        c.state = 'INSPECT_CRYSTAL';
        c.stateTimer = 4.5 + Math.random() * 2.5;
      } else if (roll < 0.56) {
        // Find a golden mote mid-water
        let best = null;
        let bestD = Infinity;
        for (const m of motes) {
          if (m.golden && m.y > vh * 0.18 && m.y < vh * 0.76 && m.x > vw * 0.14 && m.x < vw * 0.86) {
            const d = Math.hypot(m.x - c.x, m.y - c.y);
            if (d < bestD) { bestD = d; best = m; }
          }
        }
        if (best) {
          c.state = 'INSPECT_MOTE';
          c.targetMote = best;
          c.stateTimer = 3.8 + Math.random() * 2;
        } else {
          c.state = 'PONDER';
          c.stateTimer = 3 + Math.random() * 2;
        }
      } else if (roll < 0.76) {
        c.state = 'PONDER';
        c.stateTimer = 3.0 + Math.random() * 2.5;
      } else {
        c.state = 'WANDER';
        c.stateTimer = 3.5 + Math.random() * 3;
        c.targetX = vw * (0.2 + Math.random() * 0.6);
        c.targetY = vh * (0.22 + Math.random() * 0.5);
      }
    }

    let lookX = c.x + c.facingTarget * 80;
    let lookY = c.y;
    let maxSpeed = 95;
    let crystalTarget = 0;
    let puffTarget = 0;

    if (c.state === 'GREET') {
      const px = Math.max(vw * 0.12, Math.min(vw * 0.88, pointer.x));
      const py = Math.max(vh * 0.16, Math.min(vh * 0.78, pointer.y));
      const side = c.x < px ? -1 : 1;
      const dist = Math.hypot(px - c.x, py - c.y);
      c.targetX = px + side * 78;
      c.targetY = py + Math.sin(t * 2) * 10;
      lookX = pointer.x;
      lookY = pointer.y;
      c.targetHue = 315 + Math.sin(t * 1.5) * 25; // warm rose-magenta curiosity
      c.prismSpeed = 2.6;
      maxSpeed = 135;
      puffTarget = dist < 130 ? 0.14 : 0.05;

      if (dist < 135 && c.ringCooldown <= 0) {
        const mouthX = c.x + c.facing * c.size * 0.85;
        const mouthY = c.y + c.size * 0.12;
        spawnBubbleRing(mouthX, mouthY, c.facing, -0.15, c.hue);
        c.ringCooldown = 2.6 + Math.random() * 1.8;
        c.puff = 0.22;
      }
    } else if (c.state === 'INSPECT_CRYSTAL' && crystals.length > 0) {
      const cr = crystals[1];
      c.targetX = cr.x - 95;
      c.targetY = cr.y - 52 + Math.sin(t * 1.8) * 8;
      lookX = cr.x;
      lookY = cr.y - 18;
      c.targetHue = 188;
      c.prismSpeed = 2.4;
      maxSpeed = 95;
      const d = Math.hypot(cr.x - c.x, cr.y - c.y);
      if (d < 150) {
        crystalTarget = 1;
        puffTarget = 0.08;
        if (c.ringCooldown <= 0 && Math.random() < 0.04) {
          spawnBubbleRing(c.x + c.facing * c.size * 0.85, c.y + 4, c.facing, -0.25, 190);
          c.ringCooldown = 3.5;
        }
      }
    } else if (c.state === 'INSPECT_MOTE' && c.targetMote) {
      const m = c.targetMote;
      if (m.y < vh * 0.12) {
        c.state = 'PONDER';
        c.stateTimer = 2.2;
      } else {
        const side = c.x < m.x ? -1 : 1;
        c.targetX = m.x + side * 62;
        c.targetY = m.y + 8;
        lookX = m.x;
        lookY = m.y;
        c.targetHue = 52; // golden wonder
        c.prismSpeed = 2.1;
        maxSpeed = 105;
        if (Math.hypot(m.x - c.x, m.y - c.y) < 85 && c.ringCooldown <= 0) {
          spawnBubbleRing(c.x + c.facing * c.size * 0.85, c.y + 4, c.facing, -0.1, 52);
          c.ringCooldown = 3.2;
          c.puff = 0.18;
        }
      }
    } else if (c.state === 'PONDER') {
      c.targetX = c.x + Math.sin(t * 0.7) * 18;
      c.targetY = Math.max(vh * 0.24, Math.min(vh * 0.68, c.y + Math.cos(t * 0.9) * 14));
      lookX = c.x + Math.sin(t * 1.1) * 120;
      lookY = c.y - 25 + Math.cos(t * 0.8) * 35;
      c.targetHue = 255 + Math.sin(t * 0.6) * 25; // dreamy violet-cyan
      c.prismSpeed = 1.25;
      maxSpeed = 42;
      if (c.ringCooldown <= 0) {
        spawnBubbleRing(c.x + c.facing * c.size * 0.85, c.y + 4, c.facing * 0.7, -0.4, c.hue);
        c.ringCooldown = 3.8 + Math.random() * 2;
      }
    } else {
      // WANDER
      if (Math.hypot(c.targetX - c.x, c.targetY - c.y) < 35) {
        c.targetX = vw * (0.18 + Math.random() * 0.64);
        c.targetY = vh * (0.20 + Math.random() * 0.52);
      }
      lookX = c.targetX;
      lookY = c.targetY;
      c.targetHue = 178 + Math.sin(t * 0.4) * 18;
      c.prismSpeed = 1.4;
      maxSpeed = 88;
    }

    c.crystalExcite += (crystalTarget - c.crystalExcite) * Math.min(1, dt * 2.5);
    c.puff += (puffTarget - c.puff) * Math.min(1, dt * 3.5);

    // Steering with gentle arrival damping
    const dx = c.targetX - c.x;
    const dy = c.targetY - c.y;
    const dist = Math.hypot(dx, dy) || 1;
    const desiredSpeed = Math.min(maxSpeed, dist * 1.5);
    const dvx = (dx / dist) * desiredSpeed;
    const dvy = (dy / dist) * desiredSpeed + Math.sin(t * 2.1) * 9;

    c.vx += (dvx - c.vx) * Math.min(1, dt * 2.6);
    c.vy += (dvy - c.vy) * Math.min(1, dt * 2.6);

    c.x += c.vx * dt;
    c.y += c.vy * dt;

    // Keep comfortably inside the glass
    const padX = c.size * 1.45;
    const padTop = c.size * 1.3;
    const padBot = vh * 0.82;
    if (c.x < padX) { c.x = padX; c.vx *= 0.5; }
    if (c.x > vw - padX) { c.x = vw - padX; c.vx *= 0.5; }
    if (c.y < padTop) { c.y = padTop; c.vy *= 0.5; }
    if (c.y > padBot) { c.y = padBot; c.vy *= 0.5; }

    // Facing direction (turn toward point of interest or velocity)
    const lookDx = lookX - c.x;
    if (Math.abs(lookDx) > 16) {
      c.facingTarget = lookDx >= 0 ? 1 : -1;
    } else if (Math.abs(c.vx) > 12) {
      c.facingTarget = c.vx >= 0 ? 1 : -1;
    }
    c.facing += (c.facingTarget - c.facing) * Math.min(1, dt * 5.5);

    // Pitch tilt
    const targetTilt = Math.max(-0.32, Math.min(0.32, (c.vy / 130) * c.facing + (lookY - c.y) * 0.0008 * c.facing));
    c.tilt += (targetTilt - c.tilt) * Math.min(1, dt * 5);

    // Hue interpolation around color wheel
    let dHue = ((c.targetHue - c.hue + 540) % 360) - 180;
    c.hue = (c.hue + dHue * Math.min(1, dt * 2.2) + 360) % 360;

    // Inner prism rotation & fin flutter
    const speedMag = Math.hypot(c.vx, c.vy);
    c.prismRotY += dt * c.prismSpeed;
    c.prismRotX = 0.35 + Math.sin(t * 0.9) * 0.25;
    c.finPhase += dt * (11 + speedMag * 0.08);
    c.tailPhase += dt * (5.5 + speedMag * 0.06);

    // Eye tracking
    const eAngle = Math.atan2(lookY - c.y, lookX - c.x);
    const eDist = Math.min(3.6, Math.hypot(lookX - c.x, lookY - c.y) * 0.03);
    c.eyeX += (Math.cos(eAngle) * eDist - c.eyeX) * Math.min(1, dt * 10);
    c.eyeY += (Math.sin(eAngle) * eDist - c.eyeY) * Math.min(1, dt * 10);

    // Blinking
    c.blinkTimer -= dt;
    if (c.blinkTimer <= 0) {
      c.blink = 1;
      c.blinkTimer = 2.8 + Math.random() * 4.2;
    }
    if (c.blink > 0) {
      c.blink = Math.max(0, c.blink - dt * 8.5);
    }
  }

  function updateParticles(dt, t) {
    // Plankton motes
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.x += (m.vx + Math.sin(t * 0.8 + m.phase) * 7) * dt;
      m.y += m.vy * dt;
      if (m.y < -10 || m.x < -20 || m.x > vw + 20) {
        motes[i] = makeMote(null, false);
      }
    }

    // Ambient bubble stream from left rock crevice
    if (Math.random() < dt * 2.2 && bubbles.length < 28) {
      const fromRight = Math.random() < 0.35;
      bubbles.push({
        x: fromRight ? vw * 0.83 + (Math.random() - 0.5) * 14 : vw * 0.13 + (Math.random() - 0.5) * 14,
        y: vh * 0.86,
        r: 1.8 + Math.random() * 3.6,
        vy: 38 + Math.random() * 32,
        phase: Math.random() * Math.PI * 2
      });
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.vy * dt;
      b.x += Math.sin(t * 3 + b.phase) * 14 * dt;
      if (b.y < -15) bubbles.splice(i, 1);
    }

    // Creature's prismatic bubble rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life += dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.vx *= Math.pow(0.45, dt);
      r.vy -= 14 * dt; // buoyant rise
      r.radius += (r.maxRadius - r.radius) * Math.min(1, dt * 2.8);
      if (r.life >= r.maxLife || r.y < -30) {
        rings.splice(i, 1);
      }
    }

    // Kelp gentle reaction to creature swimming past
    for (const k of kelps) {
      const topY = k.y - k.segments * k.segLen;
      if (creature.y > topY - 25 && Math.abs(creature.x - k.x) < 75) {
        const push = (creature.vx * 0.003) + (k.x > creature.x ? 0.12 : -0.12) * (1 - Math.abs(creature.x - k.x) / 75);
        k.bend += (push - k.bend) * Math.min(1, dt * 4);
      } else {
        k.bend *= Math.pow(0.25, dt);
      }
    }
  }

  function drawBackground(t) {
    // Deep twilight ocean gradient
    const bg = ctx.createLinearGradient(0, 0, 0, vh);
    bg.addColorStop(0, '#0e495c');
    bg.addColorStop(0.32, '#093142');
    bg.addColorStop(0.72, '#061f2d');
    bg.addColorStop(1, '#04131d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, vw, vh);

    // Subtle water surface shimmer at very top
    const surf = ctx.createLinearGradient(0, 0, 0, 48);
    surf.addColorStop(0, 'rgba(130, 240, 255, 0.22)');
    surf.addColorStop(1, 'rgba(130, 240, 255, 0)');
    ctx.fillStyle = surf;
    ctx.fillRect(0, 0, vw, 48);

    // Volumetric sunbeams
    ctx.save();
    for (const ray of lightRays) {
      const sway = Math.sin(t * ray.speed + ray.phase) * 28;
      const topX = ray.xFrac * vw + sway * 0.3;
      const botX = topX + sway + (ray.xFrac - 0.5) * 90;
      const g = ctx.createLinearGradient(topX, 0, botX, vh * 0.88);
      const pulse = ray.alpha * (0.78 + 0.22 * Math.sin(t * ray.speed * 1.4 + ray.phase));
      g.addColorStop(0, `rgba(150, 245, 255, ${pulse * 1.6})`);
      g.addColorStop(0.55, `rgba(95, 215, 235, ${pulse})`);
      g.addColorStop(1, 'rgba(60, 180, 210, 0)');

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(topX - ray.width * 0.5, 0);
      ctx.lineTo(topX + ray.width * 0.5, 0);
      ctx.lineTo(botX + ray.spread, vh * 0.9);
      ctx.lineTo(botX - ray.spread, vh * 0.9);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Distant silhouette mounds
    ctx.fillStyle = '#051a27';
    for (const r of bgRocks) {
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSeabed(t) {
    // Sandy cove floor
    const sandGrad = ctx.createLinearGradient(0, vh * 0.84, 0, vh);
    sandGrad.addColorStop(0, '#133847');
    sandGrad.addColorStop(0.45, '#0d2a38');
    sandGrad.addColorStop(1, '#071923');
    ctx.fillStyle = sandGrad;

    ctx.beginPath();
    ctx.moveTo(0, vh * 0.88);
    ctx.bezierCurveTo(vw * 0.28, vh * 0.84, vw * 0.68, vh * 0.91, vw, vh * 0.86);
    ctx.lineTo(vw, vh);
    ctx.lineTo(0, vh);
    ctx.closePath();
    ctx.fill();

    // Animated caustic light ribbons dancing on the sand
    ctx.save();
    ctx.strokeStyle = 'rgba(130, 235, 250, 0.08)';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 7; i++) {
      const yBase = vh * (0.89 + i * 0.016);
      ctx.beginPath();
      for (let x = 0; x <= vw; x += 28) {
        const wave = Math.sin(x * 0.025 + t * 1.6 + i * 1.3) * 4 + Math.cos(x * 0.014 - t * 1.1 + i) * 3;
        if (x === 0) ctx.moveTo(x, yBase + wave);
        else ctx.lineTo(x, yBase + wave);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Smooth pebbles
    for (const p of pebbles) {
      ctx.fillStyle = `rgb(${p.shade}, ${p.shade + 22}, ${p.shade + 32})`;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.rx, p.ry, p.rot, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRockGroup(rocks) {
    for (const r of rocks) {
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.rot);
      const g = ctx.createLinearGradient(0, -r.ry, 0, r.ry);
      g.addColorStop(0, r.c1);
      g.addColorStop(1, r.c2);
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top rim highlight from overhead water light
      ctx.strokeStyle = 'rgba(120, 220, 240, 0.14)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -1, r.rx * 0.96, r.ry * 0.95, 0, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawCrystals(t) {
    if (crystals.length === 0) return;
    const base = crystals[1];
    const excite = creature.crystalExcite;

    // Ambient radial glow around crystal cluster
    const glowR = 85 + excite * 35 + Math.sin(t * 2.2) * 8;
    const glow = ctx.createRadialGradient(base.x, base.y - 12, 4, base.x, base.y - 12, glowR);
    const alpha = 0.22 + excite * 0.24;
    glow.addColorStop(0, `hsla(190, 95%, 72%, ${alpha})`);
    glow.addColorStop(0.5, `hsla(198, 90%, 55%, ${alpha * 0.4})`);
    glow.addColorStop(1, 'hsla(200, 90%, 50%, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(base.x, base.y - 12, glowR, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < crystals.length; i++) {
      const c = crystals[i];
      const shimmer = 0.78 + 0.22 * Math.sin(t * 2.5 + i * 1.3) + excite * 0.2;
      const hue = c.hue + excite * 18 * Math.sin(t * 3 + i);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      const hw = c.w * 0.5;
      // Left facet
      ctx.fillStyle = `hsla(${hue}, 88%, ${Math.min(85, 58 * shimmer)}%, 0.9)`;
      ctx.beginPath();
      ctx.moveTo(-hw, 0);
      ctx.lineTo(-hw * 0.75, -c.len * 0.78);
      ctx.lineTo(0, -c.len);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Right facet
      ctx.fillStyle = `hsla(${hue + 14}, 82%, ${Math.min(72, 42 * shimmer)}%, 0.9)`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -c.len);
      ctx.lineTo(hw * 0.75, -c.len * 0.78);
      ctx.lineTo(hw, 0);
      ctx.closePath();
      ctx.fill();

      // Crisp specular edge
      ctx.strokeStyle = `hsla(${hue - 10}, 100%, 88%, ${0.45 + excite * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -c.len);
      ctx.lineTo(0, -c.len * 0.15);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawKelp(k, t) {
    const pts = [{ x: k.x, y: k.y }];
    let angle = -Math.PI / 2;
    for (let i = 1; i <= k.segments; i++) {
      const frac = i / k.segments;
      const sway = Math.sin(t * k.speed - i * 0.55 + k.phase) * 0.16 * frac + k.bend * frac;
      angle += sway;
      const prev = pts[i - 1];
      pts.push({
        x: prev.x + Math.cos(angle) * k.segLen,
        y: prev.y + Math.sin(angle) * k.segLen
      });
    }

    // Draw supple ribbon stalk + leaf blades
    ctx.strokeStyle = `hsla(${k.hue}, 58%, 28%, 0.92)`;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const prev = pts[i - 1];
      const segAng = Math.atan2(p.y - prev.y, p.x - prev.x);
      const side = i % 2 === 0 ? 1 : -1;
      const leafLen = k.width * (1.7 - (i / pts.length) * 0.7);
      const leafAng = segAng + side * 0.65 + Math.sin(t * 1.8 + i) * 0.12;

      const lx = p.x + Math.cos(leafAng) * leafLen;
      const ly = p.y + Math.sin(leafAng) * leafLen;

      ctx.fillStyle = `hsla(${k.hue + i * 2}, 64%, ${26 + i * 2.4}%, 0.85)`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(
        (p.x + lx) * 0.5 + Math.cos(leafAng - side * 0.5) * 6,
        (p.y + ly) * 0.5 + Math.sin(leafAng - side * 0.5) * 6,
        lx, ly
      );
      ctx.quadraticCurveTo(
        (p.x + lx) * 0.5 + Math.cos(leafAng + side * 0.5) * 5,
        (p.y + ly) * 0.5 + Math.sin(leafAng + side * 0.5) * 5,
        p.x, p.y
      );
      ctx.fill();
    }
  }

  function drawSeaFerns(t) {
    for (const f of seaFerns) {
      const sway = Math.sin(t * 1.7 + f.phase) * 0.22;
      const ang = f.baseAngle + sway;
      const tipX = f.x + Math.cos(ang) * f.len;
      const tipY = f.y + Math.sin(ang) * f.len;
      const ctrlX = f.x + Math.cos(f.baseAngle) * f.len * 0.55;
      const ctrlY = f.y + Math.sin(f.baseAngle) * f.len * 0.55;

      ctx.strokeStyle = `hsla(${f.hue}, 65%, 45%, 0.75)`;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();

      // Glowing bioluminescent bulb tip
      const glow = ctx.createRadialGradient(tipX, tipY, 0.5, tipX, tipY, 9);
      glow.addColorStop(0, `hsla(${f.hue}, 100%, 82%, 0.95)`);
      glow.addColorStop(0.45, `hsla(${f.hue}, 95%, 62%, 0.45)`);
      glow.addColorStop(1, `hsla(${f.hue}, 95%, 60%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMotesAndBubbles(t) {
    // Plankton motes
    for (const m of motes) {
      const twinkle = 0.55 + 0.45 * Math.sin(t * 3.2 + m.phase);
      if (m.golden) {
        const g = ctx.createRadialGradient(m.x, m.y, 0.2, m.x, m.y, m.size * 3.5);
        g.addColorStop(0, `hsla(${m.hue}, 100%, 85%, ${0.9 * twinkle})`);
        g.addColorStop(0.5, `hsla(${m.hue}, 95%, 60%, ${0.35 * twinkle})`);
        g.addColorStop(1, `hsla(${m.hue}, 95%, 60%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `hsla(${m.hue}, 75%, 78%, ${0.38 * twinkle})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Rising bubbles
    for (const b of bubbles) {
      ctx.strokeStyle = 'rgba(185, 245, 255, 0.42)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(230, 252, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Prismatic bubble rings puffed by the creature
    for (const r of rings) {
      const lifeFrac = r.life / r.maxLife;
      const alpha = Math.sin(Math.min(1, lifeFrac * 5) * Math.PI * 0.5) * (1 - lifeFrac);
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.tilt * 0.35);
      const hue = (r.hue + r.life * 85) % 360;

      ctx.strokeStyle = `hsla(${hue}, 95%, 76%, ${alpha * 0.85})`;
      ctx.lineWidth = 2.6 * (1 - lifeFrac * 0.4);
      ctx.beginPath();
      ctx.ellipse(0, 0, r.radius * 0.68, r.radius, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `hsla(${(hue + 60) % 360}, 100%, 88%, ${alpha * 0.55})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(-1.2, -1, r.radius * 0.56, r.radius * 0.86, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawPrismCore(c, radius) {
    const cosY = Math.cos(c.prismRotY);
    const sinY = Math.sin(c.prismRotY);
    const cosX = Math.cos(c.prismRotX);
    const sinX = Math.sin(c.prismRotX);

    const projected = prismVerts.map(([vx, vy, vz]) => {
      // Rotate Y then X
      const x1 = vx * cosY - vz * sinY;
      const z1 = vx * sinY + vz * cosY;
      const y2 = vy * cosX - z1 * sinX;
      const z2 = vy * sinX + z1 * cosX;
      return { x: x1 * radius, y: y2 * radius, z: z2 };
    });

    // Sort faces back-to-front (painter's algorithm)
    const sorted = prismFaces.map((f, idx) => {
      const p0 = projected[f[0]];
      const p1 = projected[f[1]];
      const p2 = projected[f[2]];
      // Normal z check & depth
      const zAvg = (p0.z + p1.z + p2.z) / 3;
      return { p0, p1, p2, zAvg, idx };
    }).sort((a, b) => a.zAvg - b.zAvg);

    for (const face of sorted) {
      const { p0, p1, p2, idx } = face;
      const cross = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
      const isFront = cross > 0;
      const faceHue = (c.hue + idx * 22) % 360;
      const light = isFront ? 74 : 52;
      const alpha = isFront ? 0.72 : 0.34;

      ctx.fillStyle = `hsla(${faceHue}, 95%, ${light}%, ${alpha})`;
      ctx.strokeStyle = `hsla(${faceHue}, 100%, 88%, ${isFront ? 0.85 : 0.25})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawCreature(t) {
    const c = creature;
    const breath = 1 + Math.sin(t * 2.6) * 0.025 + c.puff;
    const R = c.size * breath;

    // Soft bioluminescent aura illuminating nearby water
    const auraR = R * 2.9;
    const aura = ctx.createRadialGradient(c.x, c.y, R * 0.2, c.x, c.y, auraR);
    aura.addColorStop(0, `hsla(${c.hue}, 95%, 68%, 0.26)`);
    aura.addColorStop(0.5, `hsla(${(c.hue + 30) % 360}, 90%, 55%, 0.09)`);
    aura.addColorStop(1, `hsla(${c.hue}, 90%, 50%, 0)`);
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(c.x, c.y, auraR, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.tilt);

    // Smooth horizontal turn scaling (keeps volume lively during turns)
    const turnScale = Math.abs(c.facing) < 0.22 ? (c.facing >= 0 ? 0.22 : -0.22) : c.facing;
    ctx.scale(turnScale, 1);

    // --- 1. Fluttering Tail Fin ---
    const tailSwing = Math.sin(c.tailPhase) * 0.36;
    ctx.save();
    ctx.translate(-R * 0.96, R * 0.04);
    ctx.rotate(tailSwing);

    const tailGrad = ctx.createLinearGradient(0, 0, -R * 0.82, 0);
    tailGrad.addColorStop(0, `hsla(${c.hue}, 85%, 65%, 0.72)`);
    tailGrad.addColorStop(1, `hsla(${(c.hue + 45) % 360}, 95%, 78%, 0.12)`);
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(4, -R * 0.16);
    ctx.bezierCurveTo(-R * 0.42, -R * 0.58, -R * 0.78, -R * 0.46, -R * 0.82, -R * 0.08);
    ctx.quadraticCurveTo(-R * 0.52, 0, -R * 0.78, R * 0.18);
    ctx.bezierCurveTo(-R * 0.68, R * 0.52, -R * 0.35, R * 0.48, 4, R * 0.16);
    ctx.closePath();
    ctx.fill();

    // Delicate fin rays on tail
    ctx.strokeStyle = `hsla(${c.hue}, 100%, 86%, 0.38)`;
    ctx.lineWidth = 1.1;
    for (let j = -2; j <= 2; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * 3);
      ctx.quadraticCurveTo(-R * 0.38, j * R * 0.12, -R * 0.68, j * R * 0.15);
      ctx.stroke();
    }
    ctx.restore();

    // --- 2. Dorsal & Ventral Crystalline Crest ---
    const crestWave = Math.sin(c.tailPhase - 0.8) * 4;
    const crestGrad = ctx.createLinearGradient(0, -R * 0.8, 0, -R * 1.32);
    crestGrad.addColorStop(0, `hsla(${c.hue}, 85%, 65%, 0.65)`);
    crestGrad.addColorStop(1, `hsla(${(c.hue + 50) % 360}, 95%, 82%, 0.15)`);
    ctx.fillStyle = crestGrad;
    ctx.beginPath();
    ctx.moveTo(R * 0.25, -R * 0.82);
    ctx.quadraticCurveTo(-R * 0.12, -R * 1.32 + crestWave, -R * 0.58, -R * 1.02 + crestWave);
    ctx.quadraticCurveTo(-R * 0.48, -R * 0.82, -R * 0.62, -R * 0.68);
    ctx.closePath();
    ctx.fill();

    // Tiny ventral keel fin
    ctx.beginPath();
    ctx.moveTo(R * 0.02, R * 0.84);
    ctx.quadraticCurveTo(-R * 0.28, R * 1.12 - crestWave * 0.6, -R * 0.56, R * 0.88);
    ctx.lineTo(-R * 0.48, R * 0.72);
    ctx.closePath();
    ctx.fill();

    // --- 3. Far-side Pectoral Fin & Eye Hint ---
    const farFlutter = Math.cos(c.finPhase) * 0.35;
    ctx.save();
    ctx.translate(R * 0.18, R * 0.22);
    ctx.rotate(-0.2 + farFlutter);
    ctx.fillStyle = `hsla(${(c.hue + 25) % 360}, 85%, 70%, 0.28)`;
    ctx.beginPath();
    ctx.ellipse(-R * 0.2, 0, R * 0.28, R * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- 4. Translucent Opalescent Boxfish/Puffer Body ---
    ctx.beginPath();
    // Chubby rounded-diamond / boxfish contour
    ctx.moveTo(R * 1.02, R * 0.04);
    ctx.bezierCurveTo(R * 1.04, -R * 0.58, R * 0.48, -R * 0.94, -R * 0.08, -R * 0.90);
    ctx.bezierCurveTo(-R * 0.68, -R * 0.86, -R * 1.02, -R * 0.46, -R * 1.02, 0);
    ctx.bezierCurveTo(-R * 1.02, R * 0.48, -R * 0.62, R * 0.88, -R * 0.04, R * 0.90);
    ctx.bezierCurveTo(R * 0.56, R * 0.92, R * 1.00, R * 0.56, R * 1.02, R * 0.04);
    ctx.closePath();

    const bodyGrad = ctx.createRadialGradient(R * 0.12, -R * 0.18, R * 0.1, -R * 0.05, 0, R * 1.1);
    bodyGrad.addColorStop(0, `hsla(${c.hue}, 85%, 78%, 0.35)`);
    bodyGrad.addColorStop(0.58, `hsla(${(c.hue + 18) % 360}, 78%, 52%, 0.48)`);
    bodyGrad.addColorStop(0.88, `hsla(${(c.hue + 38) % 360}, 85%, 64%, 0.68)`);
    bodyGrad.addColorStop(1, `hsla(${(c.hue + 55) % 360}, 95%, 82%, 0.82)`);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Subtle geometric boxfish hex-facet lines on translucent skin
    ctx.strokeStyle = `hsla(${c.hue}, 95%, 85%, 0.22)`;
    ctx.lineWidth = 1.15;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(R * 0.45, -R * 0.72);
    ctx.lineTo(-R * 0.12, -R * 0.52);
    ctx.lineTo(-R * 0.64, -R * 0.62);
    ctx.moveTo(-R * 0.12, -R * 0.52);
    ctx.lineTo(-R * 0.24, R * 0.48);
    ctx.lineTo(-R * 0.68, R * 0.54);
    ctx.moveTo(-R * 0.24, R * 0.48);
    ctx.lineTo(R * 0.42, R * 0.66);
    ctx.strokeStyle = `hsla(${(c.hue + 30) % 360}, 95%, 88%, 0.16)`;
    ctx.stroke();

    // Cute puffer/boxfish tiny crystal nubs along brow and belly
    const nubs = [
      [R * 0.46, -R * 0.74, -0.5],
      [-R * 0.08, -R * 0.90, -1.5],
      [-R * 0.66, -R * 0.68, -2.2],
      [-R * 0.64, R * 0.68, 2.2],
      [-R * 0.05, R * 0.90, 1.5]
    ];
    ctx.fillStyle = `hsla(${(c.hue + 40) % 360}, 100%, 85%, 0.75)`;
    for (const [nx, ny, na] of nubs) {
      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(na);
      ctx.beginPath();
      ctx.moveTo(0, -3.5);
      ctx.lineTo(5.5, 0);
      ctx.lineTo(0, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // --- 5. Glowing 3D Rotating Inner Prism Heart ---
    ctx.save();
    ctx.translate(-R * 0.12, R * 0.02);
    const coreGlow = ctx.createRadialGradient(0, 0, 1, 0, 0, R * 0.55);
    coreGlow.addColorStop(0, `hsla(${c.hue}, 100%, 92%, 0.85)`);
    coreGlow.addColorStop(0.5, `hsla(${c.hue}, 95%, 68%, 0.35)`);
    coreGlow.addColorStop(1, `hsla(${c.hue}, 95%, 60%, 0)`);
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.55, 0, Math.PI * 2);
    ctx.fill();

    drawPrismCore(c, R * 0.34);
    ctx.restore();

    // Glossy glass-like specular highlight on upper flank
    const spec = ctx.createLinearGradient(0, -R * 0.82, 0, -R * 0.2);
    spec.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.ellipse(R * 0.06, -R * 0.52, R * 0.56, R * 0.22, -0.12, 0, Math.PI * 2);
    ctx.fill();

    // --- 6. Expressive Face (Big Curious Eyes & Tiny "o" Mouth) ---
    // Far eye peeking slightly over nose ridge
    const eyeR = R * 0.23;
    const blinkScale = Math.max(0.08, 1 - Math.sin(c.blink * Math.PI));

    ctx.save();
    ctx.translate(R * 0.78, -R * 0.22);
    ctx.scale(0.62, blinkScale * 0.88);
    ctx.fillStyle = '#04121c';
    ctx.beginPath();
    ctx.arc(0, 0, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeR * 0.28, -eyeR * 0.3, eyeR * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Near eye (large, glossy, tracking)
    ctx.save();
    ctx.translate(R * 0.48, -R * 0.16);
    ctx.scale(1, blinkScale);

    // Outer iridescent iris ring
    ctx.fillStyle = `hsla(${(c.hue + 35) % 360}, 90%, 76%, 0.92)`;
    ctx.beginPath();
    ctx.arc(0, 0, eyeR * 1.12, 0, Math.PI * 2);
    ctx.fill();

    // Deep pupil tracking target
    const px = c.eyeX * (turnScale >= 0 ? 1 : -1);
    const py = c.eyeY;
    ctx.fillStyle = '#041019';
    ctx.beginPath();
    ctx.arc(px * 0.55, py * 0.55, eyeR * 0.86, 0, Math.PI * 2);
    ctx.fill();

    // Specular catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px * 0.3 - eyeR * 0.26, py * 0.3 - eyeR * 0.3, eyeR * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsla(${c.hue}, 100%, 88%, 0.9)`;
    ctx.beginPath();
    ctx.arc(px * 0.3 + eyeR * 0.32, py * 0.3 + eyeR * 0.28, eyeR * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rosy bioluminescent cheek spot
    ctx.fillStyle = `hsla(${(c.hue + 120) % 360}, 95%, 75%, 0.34)`;
    ctx.beginPath();
    ctx.ellipse(R * 0.44, R * 0.12, R * 0.14, R * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute pursed puffer mouth
    const mouthOpen = 1 + c.puff * 2.5;
    ctx.fillStyle = `hsla(${c.hue}, 70%, 22%, 0.8)`;
    ctx.strokeStyle = `hsla(${(c.hue + 40) % 360}, 95%, 82%, 0.85)`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(R * 0.93, R * 0.15, 2.8 * mouthOpen, 3.8 * mouthOpen, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // --- 7. Near-side Fluttering Pectoral Fin ---
    const nearFlutter = Math.sin(c.finPhase) * 0.42;
    ctx.save();
    ctx.translate(-R * 0.02, R * 0.22);
    ctx.rotate(0.25 + nearFlutter);
    const pGrad = ctx.createLinearGradient(0, 0, -R * 0.56, 0);
    pGrad.addColorStop(0, `hsla(${c.hue}, 90%, 78%, 0.78)`);
    pGrad.addColorStop(1, `hsla(${(c.hue + 50) % 360}, 100%, 86%, 0.12)`);
    ctx.fillStyle = pGrad;
    ctx.strokeStyle = `hsla(${c.hue}, 100%, 90%, 0.55)`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(4, -3);
    ctx.bezierCurveTo(-R * 0.22, -R * 0.34, -R * 0.56, -R * 0.22, -R * 0.54, 0);
    ctx.bezierCurveTo(-R * 0.56, R * 0.24, -R * 0.22, R * 0.34, 4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawVignette() {
    // Gentle underwater corner shading inside the tank water
    const vig = ctx.createRadialGradient(
      vw * 0.5, vh * 0.45, Math.min(vw, vh) * 0.38,
      vw * 0.5, vh * 0.5, Math.max(vw, vh) * 0.78
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(2, 10, 16, 0.42)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, vw, vh);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  creature.x = vw * 0.48;
  creature.y = vh * 0.46;

  let lastTime = performance.now() * 0.001;

  function frame(nowMs) {
    const now = nowMs * 0.001;
    const dt = Math.min(0.05, Math.max(0.001, now - lastTime));
    lastTime = now;

    updateCreature(dt, now);
    updateParticles(dt, now);

    ctx.save();
    ctx.scale(scale, scale);

    drawBackground(now);
    drawSeabed(now);

    // Back kelp layer
    for (let i = 0; i < kelps.length; i++) {
      if (i % 2 === 0) drawKelp(kelps[i], now);
    }

    drawRockGroup(leftRocks);
    drawRockGroup(rightRocks);
    drawCrystals(now);
    drawSeaFerns(now);

    drawMotesAndBubbles(now);
    drawCreature(now);

    // Front kelp layer for parallax depth
    for (let i = 0; i < kelps.length; i++) {
      if (i % 2 === 1) drawKelp(kelps[i], now);
    }

    drawVignette();
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
  "title": "Pondering Prism-Puffer",
  "statement": "Through a translucent geometric carapace, this inquisitive little puffer's crystalline heart spins and shifts hue with every passing thought—gold for drifting plankton, aqua for glowing geodes, and warm rose for curious visitors. When particularly delighted by a discovery, itcelebrates by puffing a shimmering, iridescent bubble ring toward the surface."
}
```