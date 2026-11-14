```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Glimmer-Gulp Glowdew</title>
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
    background: #080b16;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Canonical logical stage (3:4 portrait) centered inside any viewport
  const LOGICAL_W = 300;
  const LOGICAL_H = 400;

  let width = 300;
  let height = 400;
  let dpr = 1;
  let stageScale = 1;
  let stageX = 0;
  let stageY = 0;

  // Pre-rendered radial glow sprites for smooth performance
  function makeGlowSprite(r, g, b, size = 64) {
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    const half = size / 2;
    const grad = octx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.28, `rgba(${r},${g},${b},0.55)`);
    grad.addColorStop(0.65, `rgba(${r},${g},${b},0.14)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    octx.fillStyle = grad;
    octx.fillRect(0, 0, size, size);
    return off;
  }

  const glowCyan = makeGlowSprite(94, 242, 228);
  const glowRose = makeGlowSprite(255, 118, 178);
  const glowGold = makeGlowSprite(255, 214, 110);
  const glowIndigo = makeGlowSprite(58, 120, 155, 128);

  function drawGlow(sprite, x, y, radius, alpha = 1) {
    if (alpha <= 0.005 || radius <= 0.2) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth || 300;
    height = window.innerHeight || 400;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    stageScale = Math.min(width / LOGICAL_W, height / LOGICAL_H);
    stageX = (width - LOGICAL_W * stageScale) * 0.5;
    stageY = (height - LOGICAL_H * stageScale) * 0.5;
  }

  window.addEventListener('resize', resize);
  resize();

  // Simple damped spring helper
  class Spring {
    constructor(value, stiffness = 140, damping = 14) {
      this.value = value;
      this.target = value;
      this.vel = 0;
      this.stiffness = stiffness;
      this.damping = damping;
    }
    step(dt) {
      const force = (this.target - this.value) * this.stiffness;
      this.vel += (force - this.vel * this.damping) * dt;
      this.value += this.vel * dt;
      return this.value;
    }
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  // Pointer state (visitor's pointer = a fly)
  const pointer = {
    x: LOGICAL_W * 0.5,
    y: LOGICAL_H * 0.35,
    active: false,
    lastMoveAt: 0,
    hoverMouthTime: 0,
    vx: 0,
    vy: 0
  };

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    return {
      x: (px - stageX) / stageScale,
      y: (py - stageY) / stageScale
    };
  }

  window.addEventListener('pointermove', (e) => {
    const p = toLogical(e.clientX, e.clientY);
    pointer.vx = p.x - pointer.x;
    pointer.vy = p.y - pointer.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = p.x >= 0 && p.x <= LOGICAL_W && p.y >= 0 && p.y <= LOGICAL_H;
    pointer.lastMoveAt = performance.now();
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    const p = toLogical(e.clientX, e.clientY);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = p.x >= 0 && p.x <= LOGICAL_W && p.y >= 0 && p.y <= LOGICAL_H;
    pointer.lastMoveAt = performance.now();
  }, { passive: true });

  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') {
      pointer.active = false;
    }
  }, { passive: true });

  window.addEventListener('pointercancel', () => {
    pointer.active = false;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    pointer.active = false;
  }, { passive: true });

  // Ambient floating spore motes
  const spores = Array.from({ length: 26 }, (_, i) => ({
    x: 35 + Math.random() * 230,
    y: 75 + Math.random() * 255,
    r: 0.7 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    speed: 0.35 + Math.random() * 0.55,
    vx: (Math.random() - 0.5) * 6,
    vy: -3 - Math.random() * 6,
    hue: i % 3 === 0 ? 'gold' : i % 2 === 0 ? 'cyan' : 'rose'
  }));

  // Burst particles & expanding rings on catch
  const sparks = [];
  const rings = [];

  function spawnCatchBurst(x, y, count = 16) {
    rings.push({ x, y, r: 4, maxR: 46, alpha: 0.8 });
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const spd = 28 + Math.random() * 64;
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 12,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.45,
        size: 1.5 + Math.random() * 2.2,
        type: i % 3 === 0 ? 'gold' : i % 2 === 0 ? 'cyan' : 'rose'
      });
    }
  }

  function spawnDigestBubble(x, y) {
    sparks.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y - 8,
      vx: (Math.random() - 0.5) * 12,
      vy: -24 - Math.random() * 16,
      life: 0,
      maxLife: 0.9 + Math.random() * 0.4,
      size: 2.2 + Math.random() * 1.6,
      type: Math.random() > 0.4 ? 'rose' : 'gold'
    });
  }

  // Autonomous twilight gnats/flies (for touch screens & continuous life)
  const flies = [];
  let nextFlyTimer = 1.4;

  function spawnFly() {
    const fromLeft = Math.random() > 0.5;
    const x = fromLeft ? 22 : LOGICAL_W - 22;
    const y = 125 + Math.random() * 115;
    flies.push({
      x,
      y,
      vx: fromLeft ? 28 : -28,
      vy: (Math.random() - 0.5) * 20,
      phase: Math.random() * Math.PI * 2,
      age: 0,
      lureLevel: 0,
      state: 'flying', // 'flying' | 'caught'
      trail: []
    });
  }

  // Sundew tentacles arranged around the base of the plant
  const tentacles = [
    { ax: 112, ay: 326, baseAngle: -2.18, len: 92, curlDir: -1, layer: 0, phase: 0.2, reachX: new Spring(0, 60, 9), reachY: new Spring(0, 60, 9), tipX: 0, tipY: 0 },
    { ax: 188, ay: 326, baseAngle: -0.96, len: 92, curlDir: 1, layer: 0, phase: 1.7, reachX: new Spring(0, 60, 9), reachY: new Spring(0, 60, 9), tipX: 0, tipY: 0 },
    { ax: 127, ay: 329, baseAngle: -1.90, len: 108, curlDir: -1, layer: 0, phase: 3.1, reachX: new Spring(0, 60, 9), reachY: new Spring(0, 60, 9), tipX: 0, tipY: 0 },
    { ax: 173, ay: 329, baseAngle: -1.24, len: 108, curlDir: 1, layer: 0, phase: 4.5, reachX: new Spring(0, 60, 9), reachY: new Spring(0, 60, 9), tipX: 0, tipY: 0 },
    { ax: 102, ay: 334, baseAngle: -2.42, len: 74, curlDir: -1, layer: 1, phase: 2.3, reachX: new Spring(0, 75, 10), reachY: new Spring(0, 75, 10), tipX: 0, tipY: 0 },
    { ax: 198, ay: 334, baseAngle: -0.72, len: 74, curlDir: 1, layer: 1, phase: 5.1, reachX: new Spring(0, 75, 10), reachY: new Spring(0, 75, 10), tipX: 0, tipY: 0 }
  ];

  // Decorative tiny moss tufts & glowing mushrooms
  const mossMounds = [
    { x: 110, y: 335, rx: 32, ry: 13, c: '#173d31' },
    { x: 190, y: 335, rx: 32, ry: 13, c: '#173d31' },
    { x: 150, y: 332, rx: 46, ry: 17, c: '#1e4e3d' },
    { x: 126, y: 338, rx: 28, ry: 11, c: '#266048' },
    { x: 174, y: 338, rx: 28, ry: 11, c: '#266048' },
    { x: 150, y: 341, rx: 34, ry: 11, c: '#2e7152' }
  ];

  const mushrooms = [
    { x: 96, y: 332, h: 16, r: 7, tilt: -0.18, phase: 0.4 },
    { x: 105, y: 335, h: 11, r: 5, tilt: 0.1, phase: 1.9 },
    { x: 201, y: 333, h: 14, r: 6.5, tilt: 0.2, phase: 3.3 }
  ];

  // Main carnivorous blossom state
  const plant = {
    baseX: 150,
    baseY: 328,
    headX: new Spring(150, 95, 11),
    headY: new Spring(194, 95, 11),
    headAngle: new Spring(0, 110, 12),
    jawOpen: new Spring(0.55, 220, 15),
    lureGlow: new Spring(0.35, 60, 10),
    squash: new Spring(1, 210, 14),
    state: 'idle', // 'idle' | 'stalking' | 'lunging' | 'chewing' | 'cooldown'
    stateTimer: 0,
    caughtFly: null,
    bubbleTimer: 0,
    lungeOffsetX: 0,
    lungeOffsetY: 0,
    mouthX: 150,
    mouthY: 176
  };

  let lastTime = performance.now();

  function update(dt, now) {
    const t = now * 0.001;

    // Fade pointer activity if idle for a long time (friendly to touch & parked mice)
    if (pointer.active && now - pointer.lastMoveAt > 4000) {
      pointer.active = false;
    }

    // Spawn autonomous flies regularly
    nextFlyTimer -= dt;
    if (nextFlyTimer <= 0 && flies.length < 2) {
      spawnFly();
      nextFlyTimer = 3.8 + Math.random() * 3.0;
    }

    // Determine active hunting target (closest fly or active pointer inside jar dome)
    let target = null;
    let targetIsPointer = false;
    let bestDist = 160;

    for (const f of flies) {
      if (f.state !== 'flying') continue;
      const d = dist(f.x, f.y, plant.mouthX, plant.mouthY);
      if (d < bestDist) {
        bestDist = d;
        target = f;
        targetIsPointer = false;
      }
    }

    if (pointer.active) {
      // Keep awareness inside the bell jar safe area
      const pd = dist(pointer.x, pointer.y, plant.mouthX, plant.mouthY);
      if (pd < 175 && (target === null || pd < bestDist + 20)) {
        bestDist = pd;
        target = pointer;
        targetIsPointer = true;
      }
    }

    // Plant state machine
    const idleSwayX = Math.sin(t * 1.15) * 9 + Math.sin(t * 0.53) * 4;
    const idleSwayY = Math.cos(t * 0.9) * 4;

    if (plant.state === 'idle' || plant.state === 'stalking') {
      if (target) {
        plant.state = 'stalking';
        const dx = target.x - plant.baseX;
        const dy = target.y - (plant.baseY - 128);
        const desiredX = plant.baseX + clamp(dx * 0.42, -46, 46) + idleSwayX * 0.35;
        const desiredY = 194 + clamp(dy * 0.28, -32, 28) + idleSwayY * 0.35;
        plant.headX.target = desiredX;
        plant.headY.target = desiredY;

        const lookAngle = Math.atan2(target.x - plant.headX.value, -(target.y - plant.headY.value));
        plant.headAngle.target = clamp(lookAngle * 0.72, -0.82, 0.82);

        const closeness = clamp(1 - bestDist / 150, 0, 1);
        plant.jawOpen.target = 0.58 + closeness * 0.42 + Math.sin(t * 4) * 0.03;
        plant.lureGlow.target = 0.55 + closeness * 0.55;
        plant.squash.target = 1 + closeness * 0.05;

        // Check strike condition
        const strikeRadius = targetIsPointer ? 31 : 30;
        if (targetIsPointer) {
          if (bestDist < strikeRadius) {
            pointer.hoverMouthTime += dt;
          } else {
            pointer.hoverMouthTime = Math.max(0, pointer.hoverMouthTime - dt * 2);
          }
        }

        const shouldSnap = targetIsPointer
          ? (bestDist < 22 || (bestDist < strikeRadius && pointer.hoverMouthTime > 0.14))
          : (bestDist < strikeRadius && target.age > 0.7);

        if (shouldSnap) {
          plant.state = 'lunging';
          plant.stateTimer = 0.09;
          pointer.hoverMouthTime = 0;

          // Lunge slightly toward target
          const lx = target.x - plant.mouthX;
          const ly = target.y - plant.mouthY;
          const lLen = Math.hypot(lx, ly) || 1;
          plant.lungeOffsetX = (lx / lLen) * 12;
          plant.lungeOffsetY = (ly / lLen) * 12;

          plant.headX.target += plant.lungeOffsetX;
          plant.headY.target += plant.lungeOffsetY;
          plant.jawOpen.target = 0.0;
          plant.jawOpen.stiffness = 480;
          plant.jawOpen.damping = 19;
          plant.squash.target = 1.18;

          if (!targetIsPointer && target) {
            target.state = 'caught';
            plant.caughtFly = target;
          } else {
            plant.caughtFly = null;
          }
        }
      } else {
        plant.state = 'idle';
        pointer.hoverMouthTime = 0;
        plant.headX.target = plant.baseX + idleSwayX;
        plant.headY.target = 194 + idleSwayY;
        plant.headAngle.target = Math.sin(t * 1.15 - 0.3) * 0.12;
        plant.jawOpen.target = 0.52 + Math.sin(t * 2.1) * 0.07;
        plant.jawOpen.stiffness = 180;
        plant.jawOpen.damping = 14;
        plant.lureGlow.target = 0.35 + Math.sin(t * 2.4) * 0.1;
        plant.squash.target = 1;
      }
    } else if (plant.state === 'lunging') {
      plant.stateTimer -= dt;
      if (plant.stateTimer <= 0) {
        plant.state = 'chewing';
        plant.stateTimer = plant.caughtFly ? 1.85 : 0.95;
        plant.bubbleTimer = 0.25;
        spawnCatchBurst(plant.mouthX, plant.mouthY, plant.caughtFly ? 18 : 13);
        plant.headX.target = plant.baseX + idleSwayX * 0.4;
        plant.headY.target = 200 + idleSwayY * 0.4;
        plant.headAngle.target *= 0.45;
        plant.squash.target = 0.92;
      }
    } else if (plant.state === 'chewing') {
      plant.stateTimer -= dt;
      plant.jawOpen.target = 0.0;
      plant.lureGlow.target = 0.95 + Math.sin(t * 9) * 0.15;
      // Happy rhythmic gulp wiggle
      const gulp = Math.sin((1.85 - plant.stateTimer) * 11) * 0.09;
      plant.squash.target = 1 + gulp;
      plant.headAngle.target = Math.sin(t * 7) * 0.07;

      plant.bubbleTimer -= dt;
      if (plant.bubbleTimer <= 0) {
        spawnDigestBubble(plant.mouthX, plant.mouthY - 12);
        plant.bubbleTimer = 0.42;
      }

      if (plant.caughtFly) {
        plant.caughtFly.x = lerp(plant.caughtFly.x, plant.mouthX, dt * 18);
        plant.caughtFly.y = lerp(plant.caughtFly.y, plant.mouthY, dt * 18);
      }

      if (plant.stateTimer <= 0) {
        if (plant.caughtFly) {
          const idx = flies.indexOf(plant.caughtFly);
          if (idx !== -1) flies.splice(idx, 1);
          plant.caughtFly = null;
        }
        plant.state = 'cooldown';
        plant.stateTimer = 1.05;
        plant.jawOpen.stiffness = 140;
        plant.jawOpen.damping = 14;
      }
    } else if (plant.state === 'cooldown') {
      plant.stateTimer -= dt;
      plant.headX.target = plant.baseX + idleSwayX;
      plant.headY.target = 194 + idleSwayY;
      plant.headAngle.target = Math.sin(t * 1.15) * 0.1;
      plant.jawOpen.target = 0.54;
      plant.lureGlow.target = 0.4;
      plant.squash.target = 1;
      if (plant.stateTimer <= 0) {
        plant.state = 'idle';
      }
    }

    // Step springs
    const hx = plant.headX.step(dt);
    const hy = plant.headY.step(dt);
    const ha = plant.headAngle.step(dt);
    plant.jawOpen.step(dt);
    plant.lureGlow.step(dt);
    plant.squash.step(dt);

    // Update mouth center coordinates in front of blossom base
    plant.mouthX = hx + Math.sin(ha) * 20;
    plant.mouthY = hy - Math.cos(ha) * 20;

    // Update tentacles
    for (const ten of tentacles) {
      let bestF = null;
      let fDist = 115;
      for (const f of flies) {
        if (f.state !== 'flying') continue;
        const d = dist(f.x, f.y, ten.tipX || ten.ax, ten.tipY || ten.ay - 60);
        if (d < fDist) {
          fDist = d;
          bestF = f;
        }
      }
      if (pointer.active) {
        const pd = dist(pointer.x, pointer.y, ten.tipX || ten.ax, ten.tipY || ten.ay - 60);
        if (pd < fDist) {
          fDist = pd;
          bestF = pointer;
        }
      }

      if (bestF && plant.state !== 'chewing') {
        const inf = clamp(1 - fDist / 115, 0, 1);
        ten.reachX.target = clamp((bestF.x - ten.ax) * 0.35 * inf, -32, 32);
        ten.reachY.target = clamp((bestF.y - (ten.ay - 70)) * 0.3 * inf, -24, 24);
      } else {
        ten.reachX.target = 0;
        ten.reachY.target = 0;
      }
      ten.reachX.step(dt);
      ten.reachY.step(dt);
    }

    // Update autonomous flies
    for (let i = flies.length - 1; i >= 0; i--) {
      const f = flies[i];
      f.age += dt;
      if (f.state === 'caught') continue;

      // Wander + gentle attraction toward glowing mouth lure
      const toMouthX = plant.mouthX - f.x;
      const toMouthY = plant.mouthY - f.y;
      const dMouth = Math.hypot(toMouthX, toMouthY) || 1;
      const lurePull = clamp((f.age - 0.5) * 0.45, 0, 1);

      const buzzX = Math.sin(t * 4.2 + f.phase) * 44 + Math.cos(t * 7.5 + f.phase * 2) * 22;
      const buzzY = Math.cos(t * 3.7 + f.phase) * 34 + Math.sin(t * 6.8 + f.phase) * 18;

      const pullStrength = plant.state === 'chewing' ? 12 : 42 + lurePull * 65;
      const ax = (toMouthX / dMouth) * pullStrength + buzzX;
      const ay = (toMouthY / dMouth) * pullStrength + buzzY;

      f.vx = (f.vx + ax * dt) * Math.exp(-dt * 2.1);
      f.vy = (f.vy + ay * dt) * Math.exp(-dt * 2.1);

      f.x += f.vx * dt;
      f.y += f.vy * dt;

      // Keep flies clear of bell jar rounded top corners and pot bottom
      f.x = clamp(f.x, 38, LOGICAL_W - 38);
      f.y = clamp(f.y, 78, 305);

      // Gentle dome-top arc constraint
      const domeDx = f.x - LOGICAL_W * 0.5;
      if (f.y < 140) {
        const maxDx = Math.sqrt(Math.max(0, 115 * 115 - (140 - f.y) * (140 - f.y)));
        if (Math.abs(domeDx) > maxDx) {
          f.x = LOGICAL_W * 0.5 + Math.sign(domeDx) * maxDx;
        }
      }

      f.trail.push({ x: f.x, y: f.y });
      if (f.trail.length > 9) f.trail.shift();
    }

    // Update ambient spores
    for (const sp of spores) {
      sp.x += (sp.vx + Math.sin(t * sp.speed + sp.phase) * 5) * dt;
      sp.y += sp.vy * dt;
      if (sp.y < 64) {
        sp.y = 328;
        sp.x = 45 + Math.random() * 210;
      }
      if (sp.x < 32) sp.x = LOGICAL_W - 32;
      if (sp.x > LOGICAL_W - 32) sp.x = 32;
    }

    // Update catch sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        sparks.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= Math.exp(-dt * 2.5);
      s.vy = s.vy * Math.exp(-dt * 2.0) - 18 * dt;
    }

    // Update expanding lure rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += 95 * dt;
      r.alpha -= 1.45 * dt;
      if (r.alpha <= 0 || r.r >= r.maxR) {
        rings.splice(i, 1);
      }
    }
  }

  function drawBackground(t) {
    // Full-viewport twilight sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#070a14');
    sky.addColorStop(0.5, '#0f1628');
    sky.addColorStop(1, '#1a1527');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);
  }

  function drawTentacle(ten, t, backLayer) {
    if ((ten.layer === 0) !== backLayer) return;

    const segments = 12;
    const segLen = ten.len / segments;
    const pts = [{ x: ten.ax, y: ten.ay }];

    const reachMag = Math.hypot(ten.reachX.value, ten.reachY.value);
    const uncurl = clamp(reachMag / 34, 0, 0.72);
    const sway = Math.sin(t * 1.4 + ten.phase) * 0.14;
    const reachAngle = Math.atan2(ten.reachY.value, ten.reachX.value);

    let x = ten.ax;
    let y = ten.ay;
    let angle = ten.baseAngle + sway;

    for (let i = 1; i <= segments; i++) {
      const frac = i / segments;
      // Smoothly blend toward target reach & relax spiral curl when reaching
      const curl = Math.pow(frac, 1.45) * (2.35 * (1 - uncurl * 0.65)) * ten.curlDir;
      let segAngle = angle + curl;
      if (reachMag > 1) {
        const pull = frac * uncurl * 0.45;
        segAngle = lerp(segAngle, reachAngle, pull);
      }
      x += Math.cos(segAngle) * segLen + (ten.reachX.value / segments) * frac * 0.9;
      y += Math.sin(segAngle) * segLen + (ten.reachY.value / segments) * frac * 0.9;
      pts.push({ x, y, angle: segAngle });
    }

    ten.tipX = pts[pts.length - 1].x;
    ten.tipY = pts[pts.length - 1].y;

    // Draw tapering curved tentacle stalk
    for (let i = 0; i < pts.length - 1; i++) {
      const frac = i / segments;
      const p0 = pts[i];
      const p1 = pts[i + 1];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineCap = 'round';
      ctx.lineWidth = lerp(4.8, 1.4, frac);
      ctx.strokeStyle = backLayer
        ? (frac > 0.6 ? '#7b3564' : '#164d47')
        : (frac > 0.58 ? '#a8447c' : '#1d695f');
      ctx.stroke();
    }

    // Draw glandular hairs + glowing dew pearls along upper half
    for (let i = 5; i < pts.length; i++) {
      const p = pts[i];
      const frac = i / segments;
      const hairLen = lerp(4.5, 7.5, frac);
      const side = i % 2 === 0 ? 1 : -1;
      const normalA = p.angle + (Math.PI * 0.42 * side);
      const hx = p.x + Math.cos(normalA) * hairLen;
      const hy = p.y + Math.sin(normalA) * hairLen;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(hx, hy);
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = 'rgba(235, 110, 175, 0.75)';
      ctx.stroke();

      const pulse = 0.55 + 0.45 * Math.sin(t * 2.8 + i * 0.9 + ten.phase);
      const isCyan = i % 2 === 0;
      const beadR = lerp(1.6, 2.3, frac);

      drawGlow(isCyan ? glowCyan : glowRose, hx, hy, beadR * 4.2, (backLayer ? 0.25 : 0.42) * pulse);

      ctx.beginPath();
      ctx.arc(hx, hy, beadR, 0, Math.PI * 2);
      ctx.fillStyle = isCyan ? '#7bfaf0' : '#ff9ed2';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(hx - beadR * 0.3, hy - beadR * 0.3, beadR * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Terminal tip pearl
    const tip = pts[pts.length - 1];
    const tipPulse = 0.7 + 0.3 * Math.sin(t * 3.1 + ten.phase);
    drawGlow(glowCyan, tip.x, tip.y, 12, (backLayer ? 0.35 : 0.55) * tipPulse);
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#a8fff6';
    ctx.fill();
  }

  function drawPotAndMoss(t) {
    // Glazed artisanal ceramic bowl/pot at bottom of stage
    const potTopY = 338;
    const potBotY = 382;

    // Soft ambient shadow under pot
    const sh = ctx.createRadialGradient(150, 384, 10, 150, 384, 88);
    sh.addColorStop(0, 'rgba(0,0,0,0.65)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.ellipse(150, 384, 88, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pot body
    const potGrad = ctx.createLinearGradient(76, potTopY, 224, potBotY);
    potGrad.addColorStop(0, '#2e2b3f');
    potGrad.addColorStop(0.45, '#222030');
    potGrad.addColorStop(1, '#14131e');

    ctx.beginPath();
    ctx.moveTo(78, potTopY);
    ctx.bezierCurveTo(80, 366, 98, potBotY, 150, potBotY);
    ctx.bezierCurveTo(202, potBotY, 220, 366, 222, potTopY);
    ctx.closePath();
    ctx.fillStyle = potGrad;
    ctx.fill();

    // Subtle hand-thrown glaze ribs on pot
    ctx.strokeStyle = 'rgba(145, 110, 130, 0.14)';
    ctx.lineWidth = 1.2;
    for (let r = 0; r < 3; r++) {
      const ry = 351 + r * 9;
      const rw = 64 - r * 8;
      ctx.beginPath();
      ctx.ellipse(150, ry, rw, 5, 0, 0.12, Math.PI - 0.12);
      ctx.stroke();
    }

    // Pot rim with warm copper-ochre glaze accent
    ctx.beginPath();
    ctx.ellipse(150, potTopY, 73, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#12101a';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(150, potTopY, 73, 12, 0, 0, Math.PI);
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = '#6c4f4b';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(150, potTopY - 0.6, 73, 12, 0, 0.15, Math.PI - 0.15);
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = 'rgba(220, 165, 130, 0.45)';
    ctx.stroke();

    // Dark soil mound
    ctx.beginPath();
    ctx.ellipse(150, 338, 68, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#18141a';
    ctx.fill();

    // Velvety moss cushions
    for (const m of mossMounds) {
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = m.c;
      ctx.fill();
    }

    // Tiny moss highlight tufts
    ctx.fillStyle = '#479466';
    for (let i = 0; i < 18; i++) {
      const mx = 96 + (i * 6.3) + Math.sin(i * 3.1) * 3;
      const my = 327 + Math.cos(i * 2.4) * 7;
      ctx.beginPath();
      ctx.arc(mx, my, 1.4 + (i % 3) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tiny glowing pin mushrooms
    for (const mush of mushrooms) {
      const glow = 0.55 + 0.35 * Math.sin(t * 2.0 + mush.phase);
      ctx.save();
      ctx.translate(mush.x, mush.y);
      ctx.rotate(mush.tilt);

      ctx.beginPath();
      ctx.moveTo(-1.3, 0);
      ctx.quadraticCurveTo(0, -mush.h * 0.5, -0.8, -mush.h);
      ctx.lineTo(0.8, -mush.h);
      ctx.quadraticCurveTo(0.6, -mush.h * 0.5, 1.3, 0);
      ctx.fillStyle = '#c8c3cf';
      ctx.fill();

      drawGlow(glowGold, 0, -mush.h, mush.r * 2.6, 0.38 * glow);

      ctx.beginPath();
      ctx.ellipse(0, -mush.h, mush.r, mush.r * 0.62, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#ff9c6e';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, -mush.h - 0.5, mush.r * 0.55, mush.r * 0.25, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#ffd89e';
      ctx.fill();
      ctx.restore();
    }
  }

  function drawStemAndBlossom(t) {
    const hx = plant.headX.value;
    const hy = plant.headY.value;
    const ha = plant.headAngle.value;
    const open = clamp(plant.jawOpen.value, 0, 1.15);
    const lure = clamp(plant.lureGlow.value, 0, 1.3);
    const sq = clamp(plant.squash.value, 0.8, 1.25);

    // Curved main stem from moss mound to blossom base
    const ctrlX = lerp(plant.baseX, hx, 0.42) - Math.sin(ha) * 18;
    const ctrlY = lerp(plant.baseY, hy, 0.52);

    ctx.save();
    ctx.lineCap = 'round';

    // Stem outer dark outline/body
    const stemGrad = ctx.createLinearGradient(plant.baseX, plant.baseY, hx, hy);
    stemGrad.addColorStop(0, '#144c44');
    stemGrad.addColorStop(0.65, '#1f7067');
    stemGrad.addColorStop(1, '#34897f');

    ctx.beginPath();
    ctx.moveTo(plant.baseX, plant.baseY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, hx, hy);
    ctx.lineWidth = 9.5;
    ctx.strokeStyle = stemGrad;
    ctx.stroke();

    // Delicate luminous vein along stem
    ctx.beginPath();
    ctx.moveTo(plant.baseX - 1.2, plant.baseY);
    ctx.quadraticCurveTo(ctrlX - 1.5, ctrlY, hx - 1, hy);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = 'rgba(130, 245, 225, 0.35)';
    ctx.stroke();

    // Small decorative side-leaf on stem
    const leafX = lerp(plant.baseX, ctrlX, 0.55);
    const leafY = lerp(plant.baseY, ctrlY, 0.55);
    ctx.save();
    ctx.translate(leafX, leafY);
    ctx.rotate(-0.65 + ha * 0.3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-14, -8, -22, -2);
    ctx.quadraticCurveTo(-12, 6, 0, 0);
    ctx.fillStyle = '#206b5f';
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // Blossom head
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(ha);
    ctx.scale(2 - sq, sq);

    // Calyx sepals at base of head
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.quadraticCurveTo(dir * 16, 4, dir * 20, -10);
      ctx.quadraticCurveTo(dir * 9, -4, 0, -2);
      ctx.fillStyle = '#1b5853';
      ctx.fill();
    }

    // Inner glowing throat & lure core (brighter when open, glowing warmly through petals when shut)
    const throatSpread = lerp(5, 22, open);
    drawGlow(glowRose, 0, -20, 38 + open * 16, 0.38 + lure * 0.35);
    drawGlow(glowGold, 0, -24, 24 + lure * 12, 0.32 + lure * 0.45);

    if (open > 0.04) {
      const throatGrad = ctx.createRadialGradient(0, -18, 2, 0, -20, 24);
      throatGrad.addColorStop(0, '#fff2b2');
      throatGrad.addColorStop(0.45, '#ff77a8');
      throatGrad.addColorStop(1, '#4a1b47');

      ctx.beginPath();
      ctx.ellipse(0, -20, throatSpread, 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = throatGrad;
      ctx.fill();

      // If an autonomous fly is trapped inside right as jaws close, draw it disappearing in throat
      if (plant.caughtFly && open > 0.08) {
        ctx.beginPath();
        ctx.arc(0, -20, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe596';
        ctx.fill();
      }

      // Bobbing angler-like nectar lure drop inside mouth
      const lureBobX = Math.sin(t * 3.8) * 2.5 * open;
      const lureBobY = -28 - Math.cos(t * 2.6) * 2;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(lureBobX * 0.5, -19, lureBobX, lureBobY);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(255, 220, 145, 0.85)';
      ctx.stroke();

      drawGlow(glowGold, lureBobX, lureBobY, 15, 0.65 * lure);
      ctx.beginPath();
      ctx.arc(lureBobX, lureBobY, 3.3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffea9f';
      ctx.fill();
    }

    // Articulated left and right crescent jaws
    const jawAngle = open * 0.66;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 2.5, 0);
      ctx.rotate(side * jawAngle);

      // Petal-jaw gradient
      const jGrad = ctx.createLinearGradient(0, 2, side * 24, -46);
      jGrad.addColorStop(0, '#1d6963');
      jGrad.addColorStop(0.55, '#4b3b75');
      jGrad.addColorStop(1, '#c74c8c');

      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(side * 28, -4, side * 32, -34, 0, -48);
      ctx.bezierCurveTo(side * 7, -32, side * 5, -14, 0, 3);
      ctx.closePath();
      ctx.fillStyle = jGrad;
      ctx.fill();

      // Translucent bioluminescent inner-digesting glow when closed
      if (open < 0.25) {
        ctx.save();
        ctx.globalAlpha = (1 - open / 0.25) * (0.35 + 0.15 * Math.sin(t * 8));
        ctx.fillStyle = '#ff85b3';
        ctx.fill();
        ctx.restore();
      }

      // Delicate luminous rim highlight
      ctx.beginPath();
      ctx.moveTo(0, -48);
      ctx.bezierCurveTo(side * 27, -34, side * 25, -6, 0, 3);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(130, 245, 232, 0.5)';
      ctx.stroke();

      // Cilia / interlocking trap teeth along the lip
      const teethT = [0.22, 0.39, 0.56, 0.73, 0.88];
      for (let k = 0; k < teethT.length; k++) {
        const ty = -48 * teethT[k];
        const tx = side * Math.sin(teethT[k] * Math.PI) * 5.2;
        const toothLen = 7.5 + Math.sin(teethT[k] * Math.PI) * 3.5;
        const tipX = tx - side * toothLen;
        const tipY = ty - 2.2;

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo(tx - side * toothLen * 0.5, ty - 2.5, tipX, tipY);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#f282b8';
        ctx.stroke();

        // Tiny glowing dew bead at tooth tip
        const beadColor = k % 2 === 0 ? '#85fff4' : '#ffb8dc';
        drawGlow(k % 2 === 0 ? glowCyan : glowRose, tipX, tipY, 6.5, 0.35 + lure * 0.25);
        ctx.beginPath();
        ctx.arc(tipX, tipY, 1.35, 0, Math.PI * 2);
        ctx.fillStyle = beadColor;
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  function drawFlies(t) {
    for (const f of flies) {
      if (f.state === 'caught') continue;

      // Soft golden motion trail
      for (let i = 0; i < f.trail.length; i++) {
        const pt = f.trail[i];
        const a = (i / f.trail.length) * 0.28;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 224, 130, ${a})`;
        ctx.fill();
      }

      const angle = Math.atan2(f.vy, f.vx);
      const wingBeat = Math.sin(t * 58 + f.phase);

      drawGlow(glowGold, f.x, f.y, 14, 0.55);

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(angle);

      // Fluttering translucent wings
      ctx.fillStyle = 'rgba(210, 248, 255, 0.72)';
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.scale(1, side * (0.45 + Math.abs(wingBeat) * 0.55));
        ctx.beginPath();
        ctx.ellipse(-1.5, 4.2, 4.8, 2.3, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Tiny thorax + glowing lantern abdomen
      ctx.beginPath();
      ctx.ellipse(-2.5, 0, 2.6, 1.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd978';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(1.4, 0, 1.8, 1.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#252b3d';
      ctx.fill();

      ctx.restore();
    }

    // Subtle shimmering fly-aura at visitor pointer when inside jar
    if (pointer.active && plant.state !== 'chewing') {
      const wing = Math.sin(t * 55);
      drawGlow(glowGold, pointer.x, pointer.y, 13, 0.42);
      ctx.save();
      ctx.translate(pointer.x, pointer.y);
      ctx.fillStyle = 'rgba(220, 252, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(-3, -3 * (0.6 + wing * 0.35), 4.2, 1.8, -0.5, 0, Math.PI * 2);
      ctx.ellipse(-3, 3 * (0.6 + wing * 0.35), 4.2, 1.8, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe599';
      ctx.fill();
      ctx.restore();
    }
  }

  function drawParticlesAndSpores(t) {
    // Expanding lure/snap rings
    for (const r of rings) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(130, 250, 235, ${clamp(r.alpha, 0, 1)})`;
      ctx.stroke();
    }

    // Ambient twilight spores
    for (const sp of spores) {
      const tw = 0.4 + 0.6 * Math.sin(t * 2.2 + sp.phase);
      const sprite = sp.hue === 'gold' ? glowGold : sp.hue === 'cyan' ? glowCyan : glowRose;
      drawGlow(sprite, sp.x, sp.y, sp.r * 5, 0.32 * tw);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fillStyle = sp.hue === 'gold' ? '#ffe79e' : sp.hue === 'cyan' ? '#9cfcf2' : '#ffb5da';
      ctx.fill();
    }

    // Catch burst sparks & happy digest bubbles
    for (const s of sparks) {
      const p = 1 - s.life / s.maxLife;
      const sprite = s.type === 'gold' ? glowGold : s.type === 'cyan' ? glowCyan : glowRose;
      drawGlow(sprite, s.x, s.y, s.size * 4.5, p * 0.75);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * p, 0, Math.PI * 2);
      ctx.fillStyle = s.type === 'gold' ? '#fff0b8' : s.type === 'cyan' ? '#b0fff7' : '#ffc2e2';
      ctx.fill();
    }
  }

  function render(now) {
    const dt = Math.min((now - lastTime) * 0.001, 0.05);
    lastTime = now;
    const t = now * 0.001;

    update(dt, now);

    ctx.save();
    ctx.scale(dpr, dpr);

    drawBackground(t);

    // Transform into centered 300x400 logical stage
    ctx.translate(stageX, stageY);
    ctx.scale(stageScale, stageScale);

    // Soft moonlit mist halo behind the plant (kept comfortably inside the bell dome)
    drawGlow(glowIndigo, 150, 225, 138, 0.55);

    // Back tentacles
    for (const ten of tentacles) drawTentacle(ten, t, true);

    // Main plant stem & carnivorous blossom
    drawStemAndBlossom(t);

    // Front tentacles
    for (const ten of tentacles) drawTentacle(ten, t, false);

    // Grounded pot, mossy cushion & glowing mushrooms
    drawPotAndMoss(t);

    // Flies & particles
    drawParticlesAndSpores(t);
    drawFlies(t);

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
  "title": "Glimmer-Gulp Glowdew",
  "statement": "A twilight-dwelling sundew-orchid hybrid that lures nocturnal midges with shimmering nectar pearls and an angler-lit blossom throat before snapping shut for a cozy bioluminescent digest."
}
```