```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #090c14;
    touch-action: pan-y;
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
<canvas id="c"></canvas>
<script>
(() => {
  'use strict';

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });

  let W = 0, H = 0, U = 0, dpr = 1;
  let cx = 0, potBaseY = 0, potTopY = 0, crownY = 0;

  const pointer = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    active: false,
    energy: 0,
    lastTime: 0
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth || document.documentElement.clientWidth || 300;
    H = window.innerHeight || document.documentElement.clientHeight || 400;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    U = Math.min(W, H * 0.75);
    cx = W * 0.5;
    potBaseY = H - Math.max(8, H * 0.025);
    potTopY = potBaseY - U * 0.165;
    crownY = potTopY - U * 0.035;
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = e.clientX - rect.left;
    const ny = e.clientY - rect.top;
    const now = performance.now();
    if (pointer.active) {
      const dt = Math.max(8, now - pointer.lastTime) / 1000;
      const dx = nx - pointer.x;
      const dy = ny - pointer.y;
      pointer.vx = Math.max(-1400, Math.min(1400, dx / dt));
      pointer.vy = Math.max(-1400, Math.min(1400, dy / dt));
      pointer.energy = Math.min(1, pointer.energy + Math.hypot(dx, dy) / (U * 0.12 + 1));
    }
    pointer.x = nx;
    pointer.y = ny;
    pointer.active = true;
    pointer.lastTime = now;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, { passive: true });

  // Deterministic pseudo-random helper for textures & botanical details
  function seeded(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const rand = seeded(4197);

  // Atmospheric motes
  const motes = [];
  for (let i = 0; i < 26; i++) {
    motes.push({
      x: rand(),
      y: 0.08 + rand() * 0.82,
      r: 0.7 + rand() * 1.5,
      phase: rand() * Math.PI * 2,
      speedY: 0.008 + rand() * 0.014,
      drift: 0.008 + rand() * 0.016,
      alpha: 0.12 + rand() * 0.25,
      hue: rand() > 0.45 ? '185,225,215' : '245,205,155'
    });
  }

  // Spark particles released during snaps / digestion
  const sparks = [];
  function emitSparks(x, y, count, warm) {
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const sp = (0.06 + rand() * 0.18) * U;
      sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.05 * U,
        life: 0,
        maxLife: 0.8 + rand() * 1.0,
        r: (1.2 + rand() * 2.2) * (U / 320),
        warm
      });
    }
  }

  // Pot speckles
  const potSpeckles = [];
  for (let i = 0; i < 48; i++) {
    potSpeckles.push({
      u: (rand() - 0.5) * 0.88,
      v: rand() * 0.85,
      r: 0.5 + rand() * 1.1,
      a: 0.04 + rand() * 0.09
    });
  }

  // Moss stipple tufts
  const mossTufts = [];
  for (let i = 0; i < 65; i++) {
    mossTufts.push({
      u: (rand() - 0.5) * 0.44,
      v: (rand() - 0.5) * 0.045,
      r: 0.004 + rand() * 0.008,
      tone: rand(),
      front: rand() > 0.35
    });
  }

  // Base rosette leaves
  const leaves = [
    { angle: -1.32, len: 0.22, width: 0.062, curve: -0.22, layer: 0, phase: 0.2, hue: 0 },
    { angle:  1.28, len: 0.21, width: 0.058, curve:  0.24, layer: 0, phase: 1.4, hue: 1 },
    { angle: -0.92, len: 0.24, width: 0.066, curve: -0.15, layer: 0, phase: 2.3, hue: 1 },
    { angle:  0.88, len: 0.24, width: 0.066, curve:  0.16, layer: 0, phase: 3.1, hue: 0 },
    { angle: -1.52, len: 0.17, width: 0.052, curve: -0.28, layer: 2, phase: 4.0, hue: 2 },
    { angle:  1.48, len: 0.17, width: 0.052, curve:  0.27, layer: 2, phase: 5.1, hue: 2 },
    { angle: -0.45, len: 0.16, width: 0.054, curve: -0.12, layer: 2, phase: 0.9, hue: 1 },
    { angle:  0.48, len: 0.155, width: 0.052, curve: 0.12, layer: 2, phase: 2.8, hue: 0 }
  ];

  // Curling sundew tentacles
  const SPINE_N = 22;
  const tentacles = [
    {
      layer: 0,
      baseX: -0.065,
      baseY: 0.0,
      baseAngle: -Math.PI * 0.5 - 0.38,
      len: 0.53,
      restCurve: -0.52,
      curlDir: 1,
      leanDir: 1,
      baseW: 0.022,
      tipW: 0.004,
      phase: 0.4,
      swayAmp: 0.055,
      state: 'idle',
      curl: 0,
      timer: 0,
      prey: null,
      preyIdx: 16,
      spine: []
    },
    {
      layer: 0,
      baseX: 0.068,
      baseY: 0.0,
      baseAngle: -Math.PI * 0.5 + 0.36,
      len: 0.51,
      restCurve: 0.54,
      curlDir: -1,
      leanDir: -1,
      baseW: 0.022,
      tipW: 0.004,
      phase: 2.1,
      swayAmp: 0.055,
      state: 'idle',
      curl: 0,
      timer: 0,
      prey: null,
      preyIdx: 16,
      spine: []
    },
    {
      layer: 2,
      baseX: -0.095,
      baseY: 0.012,
      baseAngle: -Math.PI * 0.5 - 0.72,
      len: 0.42,
      restCurve: -0.42,
      curlDir: 1,
      leanDir: 1,
      baseW: 0.019,
      tipW: 0.0038,
      phase: 3.7,
      swayAmp: 0.065,
      state: 'idle',
      curl: 0,
      timer: 0,
      prey: null,
      preyIdx: 15,
      spine: []
    },
    {
      layer: 2,
      baseX: 0.098,
      baseY: 0.012,
      baseAngle: -Math.PI * 0.5 + 0.70,
      len: 0.41,
      restCurve: 0.44,
      curlDir: -1,
      leanDir: -1,
      baseW: 0.019,
      tipW: 0.0038,
      phase: 5.0,
      swayAmp: 0.065,
      state: 'idle',
      curl: 0,
      timer: 0,
      prey: null,
      preyIdx: 15,
      spine: []
    },
    {
      layer: 2,
      baseX: -0.018,
      baseY: 0.018,
      baseAngle: -Math.PI * 0.5 - 0.14,
      len: 0.34,
      restCurve: 0.48,
      curlDir: -1,
      leanDir: 0.4,
      baseW: 0.017,
      tipW: 0.0036,
      phase: 1.5,
      swayAmp: 0.05,
      state: 'idle',
      curl: 0,
      timer: 0,
      prey: null,
      preyIdx: 15,
      spine: []
    }
  ];

  // Central Orchid-Maw
  const maw = {
    x: 0,
    y: 0,
    state: 'idle', // idle | twitch | snap | digest | open
    timer: 0,
    jawOpen: 1.0,
    glow: 0,
    prey: null
  };

  // Bugs
  const MAX_BUGS = 9;
  const bugs = [];

  function spawnBug(fromMoss) {
    const isMoth = rand() < 0.34;
    let x, y;
    if (fromMoss) {
      x = cx + (rand() - 0.5) * 0.38 * U;
      y = potTopY - (0.03 + rand() * 0.03) * U;
    } else {
      x = cx + (rand() - 0.5) * 0.58 * U;
      y = H * (0.24 + rand() * 0.45);
    }
    const ang = rand() * Math.PI * 2;
    const speed = (isMoth ? 0.075 : 0.115) * U;
    return {
      x, y,
      vx: Math.cos(ang) * speed,
      vy: fromMoss ? -0.08 * U : Math.sin(ang) * speed,
      heading: ang,
      wingPhase: rand() * Math.PI * 2,
      wingFreq: isMoth ? (17 + rand() * 6) : (42 + rand() * 14),
      size: isMoth ? (0.0145 + rand() * 0.004) : (0.0085 + rand() * 0.003),
      isMoth,
      tint: isMoth
        ? (rand() > 0.5 ? [200, 215, 255] : [195, 245, 220])
        : (rand() > 0.4 ? [255, 218, 130] : [165, 240, 225]),
      wanderPhase: rand() * Math.PI * 2,
      lureTimer: 2 + rand() * 6,
      lureChoice: -1, // -1 none, 0..4 tentacle, 5 maw
      status: 'free', // free | caught
      alpha: fromMoss ? 0 : 1,
      graceTimer: fromMoss ? 2.6 : 0.6,
      digestFade: 1
    };
  }

  for (let i = 0; i < MAX_BUGS; i++) {
    bugs.push(spawnBug(false));
  }

  function updateSpine(t, time) {
    const sway = Math.sin(time * 1.15 + t.phase) * t.swayAmp +
                 Math.sin(time * 0.47 + t.phase * 1.7) * 0.025;
    const curl = t.curl;
    const bx = cx + t.baseX * U;
    const by = crownY + t.baseY * U;
    const segLen = (t.len * U) / SPINE_N;

    let x = bx;
    let y = by;
    let angle = t.baseAngle + sway * (1 - curl * 0.65) + t.leanDir * curl * 0.34;

    t.spine.length = 0;
    t.spine.push({ x, y, angle });

    for (let i = 1; i <= SPINE_N; i++) {
      const f = i / SPINE_N;
      // Resting organic arch + active spiral curl on upper 70%
      const restBend = (t.restCurve / SPINE_N) * (0.4 + 1.1 * f);
      const spiralBend = curl * t.curlDir * (f > 0.24 ? Math.pow((f - 0.24) / 0.76, 1.35) * 0.47 : 0.03);
      angle += restBend * (1 - curl * 0.7) + spiralBend;

      // Slight length compression on inner curl for natural volume
      const step = segLen * (1 - curl * 0.14 * f);
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      t.spine.push({ x, y, angle });
    }
  }

  function updateMawPosition(time) {
    const bobX = Math.sin(time * 0.85) * 0.012 * U;
    const bobY = Math.cos(time * 1.3) * 0.006 * U;
    maw.x = cx + bobX;
    maw.y = crownY - 0.22 * U + bobY;
  }

  function clampToDome(b, dt) {
    const padX = Math.max(12, W * 0.065);
    const topPad = Math.max(14, H * 0.065);
    const floorY = potTopY - 0.025 * U;
    const archStartY = H * 0.38;

    let halfW = W * 0.5 - padX;
    if (b.y < archStartY) {
      const ry = Math.max(1, archStartY - topPad);
      const dy = Math.max(-0.98, Math.min(0, (b.y - archStartY) / ry));
      halfW *= Math.sqrt(Math.max(0.05, 1 - dy * dy));
    }

    const dx = b.x - cx;
    if (Math.abs(dx) > halfW) {
      const sign = dx > 0 ? 1 : -1;
      b.x = cx + sign * halfW;
      b.vx -= sign * 0.28 * U * dt * 10;
      if (b.vx * sign > 0) b.vx *= -0.65;
    }

    if (b.y < topPad + 0.02 * U) {
      b.y = topPad + 0.02 * U;
      if (b.vy < 0) b.vy *= -0.6;
    }
    if (b.y > floorY) {
      b.y = floorY;
      if (b.vy > 0) b.vy *= -0.65;
    }
  }

  function update(dt, time) {
    pointer.energy = Math.max(0, pointer.energy - dt * 1.9);

    updateMawPosition(time);

    // Update tentacles
    for (let i = 0; i < tentacles.length; i++) {
      const t = tentacles[i];
      if (t.state === 'idle') {
        t.curl = Math.max(0, t.curl - dt * 0.8);
      } else if (t.state === 'curling') {
        t.timer += dt;
        t.curl = Math.min(1, t.curl + dt * 1.45);
        if (t.prey) {
          t.prey.digestFade = Math.max(0, 1 - t.timer / 2.2);
        }
        if (t.timer > 0.7 && t.timer < 0.7 + dt * 1.1) {
          const p = t.spine[t.preyIdx];
          if (p) emitSparks(p.x, p.y, 5, true);
        }
        if (t.timer >= 3.2) {
          t.state = 'unfurling';
          t.timer = 0;
          if (t.prey) {
            const idx = bugs.indexOf(t.prey);
            if (idx !== -1) bugs[idx] = spawnBug(true);
            t.prey = null;
          }
        }
      } else if (t.state === 'unfurling') {
        t.curl = Math.max(0, t.curl - dt * 0.55);
        if (t.curl <= 0.001) {
          t.curl = 0;
          t.state = 'idle';
        }
      }
      updateSpine(t, time);
    }

    // Update maw
    if (maw.state === 'idle') {
      const breath = Math.sin(time * 1.7) * 0.055;
      maw.jawOpen = 0.96 + breath;
      maw.glow = 0.25 + 0.1 * Math.sin(time * 2.2);
    } else if (maw.state === 'twitch') {
      maw.timer += dt;
      maw.jawOpen = 1.04 + Math.sin(maw.timer * 65) * 0.05;
      maw.glow = 0.45;
      if (maw.prey) {
        maw.prey.x += (maw.x - maw.prey.x) * Math.min(1, dt * 10);
        maw.prey.y += (maw.y - 0.01 * U - maw.prey.y) * Math.min(1, dt * 10);
      }
      if (maw.timer >= 0.15) {
        maw.state = 'snap';
        maw.timer = 0;
        emitSparks(maw.x, maw.y - 0.012 * U, 10, true);
      }
    } else if (maw.state === 'snap') {
      maw.timer += dt;
      const p = Math.min(1, maw.timer / 0.14);
      maw.jawOpen = 1.0 - p * p;
      maw.glow = 0.45 + p * 0.55;
      if (maw.prey) {
        maw.prey.x = maw.x;
        maw.prey.y = maw.y + 0.008 * U;
      }
      if (p >= 1) {
        maw.state = 'digest';
        maw.timer = 0;
        maw.jawOpen = 0;
      }
    } else if (maw.state === 'digest') {
      maw.timer += dt;
      maw.jawOpen = 0;
      maw.glow = 0.65 + 0.35 * Math.sin(maw.timer * 4.5);
      if (maw.prey) {
        maw.prey.x = maw.x;
        maw.prey.y = maw.y + 0.012 * U;
        maw.prey.digestFade = Math.max(0, 1 - maw.timer / 2.5);
      }
      if (maw.timer >= 3.3) {
        maw.state = 'open';
        maw.timer = 0;
        if (maw.prey) {
          const idx = bugs.indexOf(maw.prey);
          if (idx !== -1) bugs[idx] = spawnBug(true);
          maw.prey = null;
        }
      }
    } else if (maw.state === 'open') {
      maw.timer += dt;
      const p = Math.min(1, maw.timer / 1.1);
      const ease = 1 - Math.pow(1 - p, 3);
      maw.jawOpen = ease * 0.96;
      maw.glow = 0.65 * (1 - ease) + 0.25 * ease;
      if (p >= 1) {
        maw.state = 'idle';
        maw.timer = 0;
      }
    }

    // Update bugs
    for (let i = 0; i < bugs.length; i++) {
      const b = bugs[i];
      if (b.status === 'caught') {
        b.wingPhase += dt * b.wingFreq * (0.4 + 0.6 * b.digestFade);
        continue;
      }

      b.alpha = Math.min(1, b.alpha + dt * 0.9);
      b.graceTimer = Math.max(0, b.graceTimer - dt);
      b.wingPhase += dt * b.wingFreq;
      b.wanderPhase += dt * (1.8 + Math.sin(time * 0.7 + i) * 0.9);

      // Lure selection
      b.lureTimer -= dt;
      if (b.lureTimer <= 0) {
        if (b.lureChoice >= 0) {
          b.lureChoice = -1;
          b.lureTimer = 2.5 + rand() * 4.5;
        } else {
          // ~55% chance to become curious about a glowing lure
          b.lureChoice = rand() < 0.55 ? Math.floor(rand() * (tentacles.length + 1)) : -1;
          b.lureTimer = 2.8 + rand() * 3.5;
        }
      }

      // Autonomous wander force
      const wanderForce = (b.isMoth ? 0.14 : 0.22) * U;
      b.vx += Math.cos(b.wanderPhase) * wanderForce * dt;
      b.vy += Math.sin(b.wanderPhase * 1.3 + i) * wanderForce * dt;

      // Gentle lure attraction
      if (b.lureChoice >= 0 && b.graceTimer <= 0) {
        let tx = maw.x, ty = maw.y - 0.01 * U;
        let lureValid = (maw.state === 'idle');
        if (b.lureChoice < tentacles.length) {
          const t = tentacles[b.lureChoice];
          lureValid = (t.state === 'idle');
          const pt = t.spine[16];
          if (pt) {
            tx = pt.x;
            ty = pt.y;
          }
        }
        if (lureValid) {
          const dx = tx - b.x;
          const dy = ty - b.y;
          const dist = Math.hypot(dx, dy) + 1e-4;
          const pull = (b.isMoth ? 0.16 : 0.12) * U;
          b.vx += (dx / dist) * pull * dt;
          b.vy += (dy / dist) * pull * dt;
        } else {
          b.lureChoice = -1;
        }
      }

      // Pointer wake / herding breeze
      if (pointer.active) {
        const dx = b.x - pointer.x;
        const dy = b.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const radius = 0.22 * U;
        if (dist < radius && dist > 1e-3) {
          const falloff = Math.pow(1 - dist / radius, 1.5);
          // Carry along pointer velocity + gentle radial scatter
          const swirl = (pointer.energy * 0.45 + 0.12) * falloff;
          b.vx += pointer.vx * swirl * dt * 1.8;
          b.vy += pointer.vy * swirl * dt * 1.8;
          const push = (0.35 * U) * falloff * (0.4 + pointer.energy);
          b.vx += (dx / dist) * push * dt;
          b.vy += (dy / dist) * push * dt;
        }
      }

      // Drag & speed cap
      const drag = Math.exp(-dt * 1.65);
      b.vx *= drag;
      b.vy *= drag;
      const maxSpd = (b.isMoth ? 0.16 : 0.24) * U;
      const spd = Math.hypot(b.vx, b.vy);
      if (spd > maxSpd) {
        b.vx = (b.vx / spd) * maxSpd;
        b.vy = (b.vy / spd) * maxSpd;
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (spd > 2) {
        b.heading = Math.atan2(b.vy, b.vx);
      }

      clampToDome(b, dt);

      // Catch detection
      if (b.graceTimer <= 0) {
        // Check central maw first
        if (maw.state === 'idle') {
          const mdx = (b.x - maw.x) / (0.048 * U);
          const mdy = (b.y - (maw.y - 0.008 * U)) / (0.036 * U);
          if (mdx * mdx + mdy * mdy < 1.0) {
            b.status = 'caught';
            b.digestFade = 1;
            maw.state = 'twitch';
            maw.timer = 0;
            maw.prey = b;
            continue;
          }
        }

        // Check tentacles' sticky upper glands
        for (let ti = 0; ti < tentacles.length; ti++) {
          const t = tentacles[ti];
          if (t.state !== 'idle') continue;
          let hitIdx = -1;
          let bestD = 0.025 * U;
          for (let si = 10; si < t.spine.length; si++) {
            const p = t.spine[si];
            const d = Math.hypot(b.x - p.x, b.y - p.y);
            if (d < bestD) {
              bestD = d;
              hitIdx = si;
            }
          }
          if (hitIdx !== -1) {
            b.status = 'caught';
            b.digestFade = 1;
            t.state = 'curling';
            t.timer = 0;
            t.prey = b;
            t.preyIdx = hitIdx;
            emitSparks(b.x, b.y, 4, true);
            break;
          }
        }
      }
    }

    // Update motes & sparks
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.y -= m.speedY * dt;
      m.x += Math.sin(time * 0.5 + m.phase) * m.drift * dt;
      if (m.y < 0.04) {
        m.y = 0.88;
        m.x = 0.15 + rand() * 0.7;
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        sparks.splice(i, 1);
        continue;
      }
      s.vy -= 0.04 * U * dt;
      s.vx *= Math.exp(-dt * 1.8);
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
  }

  // --- DRAWING HELPERS ---

  function drawBackground(time) {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#070a12');
    bg.addColorStop(0.45, '#0d1420');
    bg.addColorStop(0.82, '#131b24');
    bg.addColorStop(1, '#0b0e14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle cool moonbeam from upper-left
    ctx.save();
    const beamAlpha = 0.035 + 0.01 * Math.sin(time * 0.4);
    const beam = ctx.createLinearGradient(W * 0.15, 0, W * 0.75, H * 0.85);
    beam.addColorStop(0, `rgba(150, 205, 225, ${beamAlpha * 1.4})`);
    beam.addColorStop(0.55, `rgba(120, 175, 200, ${beamAlpha * 0.6})`);
    beam.addColorStop(1, 'rgba(120, 175, 200, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, 0);
    ctx.lineTo(W * 0.52, 0);
    ctx.lineTo(W * 0.95, H);
    ctx.lineTo(W * 0.25, H);
    ctx.closePath();
    ctx.fill();

    // Soft ambient bioluminescent aura around the plant heart
    const aura = ctx.createRadialGradient(cx, maw.y, 0, cx, maw.y, U * 0.44);
    const auraGlow = 0.08 + maw.glow * 0.09;
    aura.addColorStop(0, `rgba(225, 115, 140, ${auraGlow})`);
    aura.addColorStop(0.5, `rgba(125, 60, 115, ${auraGlow * 0.45})`);
    aura.addColorStop(1, 'rgba(20, 15, 30, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawMotes(time) {
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      const pulse = 0.6 + 0.4 * Math.sin(time * 1.6 + m.phase);
      ctx.fillStyle = `rgba(${m.hue}, ${m.alpha * pulse})`;
      ctx.beginPath();
      ctx.arc(m.x * W, m.y * H, m.r * (U / 350), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPotAndBackMoss() {
    const potW = U * 0.56;
    const rimW = U * 0.59;
    const potH = potBaseY - potTopY;

    // Soft contact shadow under pot
    const sh = ctx.createRadialGradient(cx, potBaseY + 2, potW * 0.1, cx, potBaseY + 2, potW * 0.56);
    sh.addColorStop(0, 'rgba(0,0,0,0.65)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.ellipse(cx, potBaseY, potW * 0.56, U * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stoneware bowl body
    const bodyGrad = ctx.createLinearGradient(cx - potW * 0.5, potTopY, cx + potW * 0.5, potBaseY);
    bodyGrad.addColorStop(0, '#2a3038');
    bodyGrad.addColorStop(0.28, '#1e242b');
    bodyGrad.addColorStop(0.72, '#14191f');
    bodyGrad.addColorStop(1, '#22262e');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(cx - rimW * 0.48, potTopY + potH * 0.08);
    ctx.bezierCurveTo(
      cx - potW * 0.53, potTopY + potH * 0.55,
      cx - potW * 0.38, potBaseY - potH * 0.03,
      cx - potW * 0.28, potBaseY
    );
    ctx.quadraticCurveTo(cx, potBaseY + potH * 0.06, cx + potW * 0.28, potBaseY);
    ctx.bezierCurveTo(
      cx + potW * 0.38, potBaseY - potH * 0.03,
      cx + potW * 0.53, potTopY + potH * 0.55,
      cx + rimW * 0.48, potTopY + potH * 0.08
    );
    ctx.closePath();
    ctx.fill();

    // Subtle mineral glaze speckles
    for (let i = 0; i < potSpeckles.length; i++) {
      const sp = potSpeckles[i];
      const sx = cx + sp.u * potW * (1 - sp.v * 0.36);
      const sy = potTopY + potH * (0.15 + sp.v * 0.78);
      ctx.fillStyle = `rgba(180, 195, 190, ${sp.a})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sp.r * (U / 320), 0, Math.PI * 2);
      ctx.fill();
    }

    // Pot collar / rim
    const rimGrad = ctx.createLinearGradient(cx - rimW * 0.5, potTopY, cx + rimW * 0.5, potTopY);
    rimGrad.addColorStop(0, '#363f48');
    rimGrad.addColorStop(0.35, '#252c34');
    rimGrad.addColorStop(0.8, '#181e24');
    rimGrad.addColorStop(1, '#282f37');

    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(cx, potTopY + potH * 0.06, rimW * 0.5, potH * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark soil interior
    ctx.fillStyle = '#120e10';
    ctx.beginPath();
    ctx.ellipse(cx, potTopY + potH * 0.03, rimW * 0.455, potH * 0.105, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back moss mounds
    ctx.fillStyle = '#162c20';
    ctx.beginPath();
    ctx.ellipse(cx - rimW * 0.19, potTopY - potH * 0.01, rimW * 0.24, potH * 0.14, -0.05, 0, Math.PI * 2);
    ctx.ellipse(cx + rimW * 0.18, potTopY - potH * 0.01, rimW * 0.24, potH * 0.14, 0.05, 0, Math.PI * 2);
    ctx.ellipse(cx, potTopY - potH * 0.03, rimW * 0.26, potH * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFrontMossAndAccents(time) {
    const rimW = U * 0.59;
    const potH = potBaseY - potTopY;

    // Front moss cushions overlapping pot rim
    const mGrad = ctx.createLinearGradient(cx, potTopY - potH * 0.18, cx, potTopY + potH * 0.14);
    mGrad.addColorStop(0, '#2d5839');
    mGrad.addColorStop(0.6, '#1c3a27');
    mGrad.addColorStop(1, '#112419');

    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.ellipse(cx - rimW * 0.22, potTopY + potH * 0.03, rimW * 0.21, potH * 0.11, 0.08, 0, Math.PI * 2);
    ctx.ellipse(cx + rimW * 0.21, potTopY + potH * 0.03, rimW * 0.21, potH * 0.11, -0.08, 0, Math.PI * 2);
    ctx.ellipse(cx, potTopY + potH * 0.045, rimW * 0.24, potH * 0.105, 0, 0, Math.PI * 2);
    ctx.fill();

    // Velvety moss tufts
    for (let i = 0; i < mossTufts.length; i++) {
      const m = mossTufts[i];
      const mx = cx + m.u * U;
      const my = potTopY + m.v * U;
      ctx.fillStyle = m.tone > 0.65 ? 'rgba(95, 148, 82, 0.45)' : 'rgba(52, 102, 62, 0.45)';
      ctx.beginPath();
      ctx.arc(mx, my, m.r * U, 0, Math.PI * 2);
      ctx.fill();
    }

    // Two delicate fern fiddleheads
    drawFiddlehead(cx - U * 0.175, potTopY + U * 0.005, -0.35 + Math.sin(time * 0.9) * 0.04, 0.068 * U, -1);
    drawFiddlehead(cx + U * 0.182, potTopY + U * 0.006, 0.38 + Math.cos(time * 0.85) * 0.04, 0.058 * U, 1);

    // Tiny bioluminescent pearl-mushrooms on left moss
    drawGlowMushrooms(cx - U * 0.115, potTopY + U * 0.012, time);
  }

  function drawFiddlehead(x, y, tilt, len, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.strokeStyle = '#3b6e44';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.2, 0.007 * U);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    const steps = 16;
    let px = 0, py = 0, a = -Math.PI * 0.5;
    for (let i = 1; i <= steps; i++) {
      const f = i / steps;
      a += dir * (0.04 + f * f * 0.58);
      const step = (len / steps) * (1 - f * 0.35);
      px += Math.cos(a) * step;
      py += Math.sin(a) * step;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#6ca862';
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.4, 0.006 * U), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGlowMushrooms(x, y, time) {
    const pulse = 0.72 + 0.28 * Math.sin(time * 2.1);
    const shrooms = [
      { dx: -0.016, dy: 0.004, h: 0.028, r: 0.013, rot: -0.18 },
      { dx: 0.0, dy: 0.0, h: 0.036, r: 0.016, rot: 0.05 },
      { dx: 0.015, dy: 0.005, h: 0.022, r: 0.010, rot: 0.22 }
    ];

    // Soft seafoam halo
    const halo = ctx.createRadialGradient(x, y - 0.02 * U, 0, x, y - 0.02 * U, 0.065 * U);
    halo.addColorStop(0, `rgba(120, 235, 200, ${0.22 * pulse})`);
    halo.addColorStop(1, 'rgba(120, 235, 200, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y - 0.02 * U, 0.065 * U, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < shrooms.length; i++) {
      const s = shrooms[i];
      ctx.save();
      ctx.translate(x + s.dx * U, y + s.dy * U);
      ctx.rotate(s.rot);

      ctx.strokeStyle = `rgba(165, 235, 215, ${0.65 * pulse})`;
      ctx.lineWidth = Math.max(1, 0.004 * U);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(0.002 * U, -s.h * 0.5 * U, 0, -s.h * U);
      ctx.stroke();

      ctx.fillStyle = `rgba(155, 245, 218, ${0.85 * pulse})`;
      ctx.beginPath();
      ctx.arc(0, -s.h * U, s.r * U, Math.PI, 0);
      ctx.quadraticCurveTo(0, -s.h * U + s.r * 0.25 * U, -s.r * U, -s.h * U);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawLeaf(leaf, time) {
    const sway = Math.sin(time * 0.9 + leaf.phase) * 0.03;
    const a = -Math.PI * 0.5 + leaf.angle + sway;
    const len = leaf.len * U;
    const w = leaf.width * U;

    ctx.save();
    ctx.translate(cx, crownY + 0.015 * U);
    ctx.rotate(a + Math.PI * 0.5);

    const grad = ctx.createLinearGradient(0, 0, 0, -len);
    if (leaf.hue === 0) {
      grad.addColorStop(0, '#193026');
      grad.addColorStop(0.55, '#2b4737');
      grad.addColorStop(1, '#682c42');
    } else if (leaf.hue === 1) {
      grad.addColorStop(0, '#1e2c26');
      grad.addColorStop(0.5, '#35483a');
      grad.addColorStop(1, '#78344b');
    } else {
      grad.addColorStop(0, '#1c2a24');
      grad.addColorStop(0.6, '#274234');
      grad.addColorStop(1, '#583044');
    }

    const tipX = leaf.curve * len * 0.35;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-w * 1.1, -len * 0.35, -w * 0.8 + tipX * 0.5, -len * 0.78, tipX, -len);
    ctx.bezierCurveTo(w * 0.8 + tipX * 0.5, -len * 0.78, w * 1.1, -len * 0.35, 0, 0);
    ctx.fill();

    // Central vein
    ctx.strokeStyle = 'rgba(205, 130, 150, 0.24)';
    ctx.lineWidth = Math.max(0.8, 0.003 * U);
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.05);
    ctx.quadraticCurveTo(tipX * 0.35, -len * 0.5, tipX, -len * 0.92);
    ctx.stroke();

    ctx.restore();
  }

  function drawTentacle(t, time) {
    const sp = t.spine;
    if (sp.length < 2) return;

    const leftPts = [];
    const rightPts = [];

    for (let i = 0; i < sp.length; i++) {
      const f = i / (sp.length - 1);
      const w = (t.baseW * (1 - f) + t.tipW * f) * U;
      const nx = -Math.sin(sp[i].angle);
      const ny = Math.cos(sp[i].angle);
      leftPts.push({ x: sp[i].x + nx * w, y: sp[i].y + ny * w });
      rightPts.push({ x: sp[i].x - nx * w, y: sp[i].y - ny * w });
    }

    const start = sp[0];
    const end = sp[sp.length - 1];
    const bodyGrad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    bodyGrad.addColorStop(0, '#243a2e');
    bodyGrad.addColorStop(0.38, '#532a3c');
    bodyGrad.addColorStop(0.8, '#93304f');
    bodyGrad.addColorStop(1, '#ba4465');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    for (let i = 1; i < leftPts.length; i++) {
      ctx.lineTo(leftPts[i].x, leftPts[i].y);
    }
    ctx.arc(end.x, end.y, t.tipW * U, sp[sp.length - 1].angle - Math.PI * 0.5, sp[sp.length - 1].angle + Math.PI * 0.5);
    for (let i = rightPts.length - 1; i >= 0; i--) {
      ctx.lineTo(rightPts[i].x, rightPts[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Subtle specular vein along spine
    ctx.strokeStyle = 'rgba(245, 165, 185, 0.22)';
    ctx.lineWidth = Math.max(0.7, 0.0028 * U);
    ctx.beginPath();
    ctx.moveTo(sp[0].x, sp[0].y);
    for (let i = 1; i < sp.length; i++) {
      ctx.lineTo(sp[i].x, sp[i].y);
    }
    ctx.stroke();

    // Glandular dew hairs along upper 65%
    const digestBoost = t.state === 'curling' ? (0.45 + 0.45 * Math.sin(time * 6)) : 0;
    const hairLineW = Math.max(0.6, 0.0022 * U);

    for (let i = 7; i < sp.length; i++) {
      const f = i / (sp.length - 1);
      const p = sp[i];
      const nx = -Math.sin(p.angle);
      const ny = Math.cos(p.angle);

      for (let side = -1; side <= 1; side += 2) {
        // Alternate spacing so hairs look organic
        if (side === 1 && i % 2 === 1 && i < sp.length - 2) continue;
        const hairLen = (0.016 + 0.014 * Math.sin(f * Math.PI)) * U;
        const tilt = 0.35 * side;
        const hx = p.x + (nx * side + Math.cos(p.angle) * tilt) * hairLen;
        const hy = p.y + (ny * side + Math.sin(p.angle) * tilt) * hairLen;

        ctx.strokeStyle = 'rgba(195, 70, 105, 0.72)';
        ctx.lineWidth = hairLineW;
        ctx.beginPath();
        ctx.moveTo(p.x + nx * side * t.tipW * U * 0.5, p.y + ny * side * t.tipW * U * 0.5);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // Dewdrop glow halo
        const pulse = 0.72 + 0.28 * Math.sin(time * 2.4 + i * 0.7 + t.phase) + digestBoost * 0.35;
        const dropR = (0.0042 + 0.0022 * f) * U;

        ctx.fillStyle = `rgba(255, 145, 110, ${0.18 * pulse})`;
        ctx.beginPath();
        ctx.arc(hx, hy, dropR * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Nectar bead
        ctx.fillStyle = `rgba(255, 190, 130, ${0.88 * Math.min(1.1, pulse)})`;
        ctx.beginPath();
        ctx.arc(hx, hy, dropR, 0, Math.PI * 2);
        ctx.fill();

        // Specular pinpoint
        ctx.fillStyle = 'rgba(255, 250, 240, 0.88)';
        ctx.beginPath();
        ctx.arc(hx - dropR * 0.28, hy - dropR * 0.28, dropR * 0.34, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw caught bug nestled in the curling tip
    if (t.prey) {
      const p = sp[Math.min(sp.length - 1, t.preyIdx)];
      if (p) {
        t.prey.x = p.x;
        t.prey.y = p.y;
        drawBug(t.prey, t.prey.digestFade);
      }
    }
  }

  function drawMaw(time) {
    const mx = maw.x;
    const my = maw.y;
    const stemBaseX = cx;
    const stemBaseY = crownY + 0.01 * U;

    // Graceful curved stalk
    const stemGrad = ctx.createLinearGradient(stemBaseX, stemBaseY, mx, my);
    stemGrad.addColorStop(0, '#22382c');
    stemGrad.addColorStop(0.55, '#463344');
    stemGrad.addColorStop(1, '#6f2e49');
    ctx.strokeStyle = stemGrad;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, 0.022 * U);
    ctx.beginPath();
    ctx.moveTo(stemBaseX, stemBaseY);
    ctx.quadraticCurveTo(
      cx - (mx - cx) * 1.4,
      (stemBaseY + my) * 0.5,
      mx,
      my + 0.03 * U
    );
    ctx.stroke();

    ctx.save();
    ctx.translate(mx, my);

    // Sweeping outer wing-sepals
    for (let s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.scale(s, 1);
      const sepGrad = ctx.createLinearGradient(0, 0, 0.11 * U, -0.05 * U);
      sepGrad.addColorStop(0, '#3a2234');
      sepGrad.addColorStop(0.6, '#692a49');
      sepGrad.addColorStop(1, '#315442');
      ctx.fillStyle = sepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0.02 * U);
      ctx.bezierCurveTo(0.055 * U, -0.015 * U, 0.115 * U, -0.065 * U, 0.135 * U, -0.025 * U);
      ctx.bezierCurveTo(0.105 * U, 0.028 * U, 0.045 * U, 0.045 * U, 0, 0.03 * U);
      ctx.fill();
      ctx.restore();
    }

    // Translucent lantern chalice pouch (lower throat)
    const pouchGrad = ctx.createRadialGradient(0, 0.02 * U, 0.005 * U, 0, 0.022 * U, 0.068 * U);
    const glowBoost = maw.glow;
    pouchGrad.addColorStop(0, `rgba(255, 175, 115, ${0.42 + glowBoost * 0.52})`);
    pouchGrad.addColorStop(0.45, `rgba(175, 58, 92, ${0.78 + glowBoost * 0.18})`);
    pouchGrad.addColorStop(1, '#3e182b');

    ctx.fillStyle = pouchGrad;
    ctx.beginPath();
    ctx.moveTo(-0.045 * U, -0.002 * U);
    ctx.bezierCurveTo(-0.055 * U, 0.048 * U, -0.025 * U, 0.072 * U, 0, 0.074 * U);
    ctx.bezierCurveTo(0.025 * U, 0.072 * U, 0.055 * U, 0.048 * U, 0.045 * U, -0.002 * U);
    ctx.closePath();
    ctx.fill();

    // Delicate chalice ribs
    ctx.strokeStyle = 'rgba(255, 195, 165, 0.18)';
    ctx.lineWidth = Math.max(0.7, 0.002 * U);
    for (let r = -1; r <= 1; r++) {
      ctx.beginPath();
      ctx.moveTo(r * 0.015 * U, 0.002 * U);
      ctx.quadraticCurveTo(r * 0.022 * U, 0.04 * U, r * 0.005 * U, 0.07 * U);
      ctx.stroke();
    }

    // If digesting inside chalice, render warm veiled bug silhouette
    if (maw.prey && (maw.state === 'digest' || maw.state === 'snap')) {
      const f = maw.prey.digestFade;
      const g = ctx.createRadialGradient(0, 0.028 * U, 0, 0, 0.028 * U, 0.028 * U);
      g.addColorStop(0, `rgba(255, 235, 165, ${0.85 * f})`);
      g.addColorStop(1, 'rgba(255, 150, 95, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0.028 * U, 0.028 * U, 0, Math.PI * 2);
      ctx.fill();
    }

    // Jaw opening kinematics
    const open = maw.jawOpen;
    const upperArchY = (-0.012 - open * 0.042) * U;
    const lowerLipY = (-0.002 + open * 0.022) * U;

    // Inner dark-amber gullet visible when open
    if (open > 0.08) {
      const throatGrad = ctx.createRadialGradient(0, -0.006 * U, 0.002 * U, 0, -0.005 * U, 0.045 * U);
      throatGrad.addColorStop(0, `rgba(255, 185, 110, ${0.75 * open})`);
      throatGrad.addColorStop(0.55, `rgba(115, 25, 52, ${0.9 * open})`);
      throatGrad.addColorStop(1, '#260c1a');
      ctx.fillStyle = throatGrad;
      ctx.beginPath();
      ctx.moveTo(-0.048 * U, -0.004 * U);
      ctx.quadraticCurveTo(0, upperArchY * 0.72, 0.048 * U, -0.004 * U);
      ctx.quadraticCurveTo(0, lowerLipY * 0.85, -0.048 * U, -0.004 * U);
      ctx.fill();

      // Golden lure drop inside the throat
      const lurePulse = 0.75 + 0.25 * Math.sin(time * 3.1);
      ctx.fillStyle = `rgba(255, 225, 145, ${0.9 * open * lurePulse})`;
      ctx.beginPath();
      ctx.arc(0, -0.006 * U, 0.0055 * U, 0, Math.PI * 2);
      ctx.fill();
    }

    // Upper hood lip
    const upperGrad = ctx.createLinearGradient(0, upperArchY - 0.03 * U, 0, 0);
    upperGrad.addColorStop(0, '#c84b74');
    upperGrad.addColorStop(0.5, '#8c284a');
    upperGrad.addColorStop(1, '#4a182d');
    ctx.fillStyle = upperGrad;
    ctx.beginPath();
    ctx.moveTo(-0.054 * U, -0.003 * U);
    ctx.bezierCurveTo(-0.048 * U, upperArchY * 1.15, -0.018 * U, upperArchY * 1.32, 0, upperArchY * 1.25);
    ctx.bezierCurveTo(0.018 * U, upperArchY * 1.32, 0.048 * U, upperArchY * 1.15, 0.054 * U, -0.003 * U);
    ctx.quadraticCurveTo(0, upperArchY * 0.55, -0.054 * U, -0.003 * U);
    ctx.fill();

    // Lower hinged lip
    const lowerGrad = ctx.createLinearGradient(0, -0.005 * U, 0, lowerLipY + 0.015 * U);
    lowerGrad.addColorStop(0, '#d95c7c');
    lowerGrad.addColorStop(0.55, '#962c4e');
    lowerGrad.addColorStop(1, '#501a31');
    ctx.fillStyle = lowerGrad;
    ctx.beginPath();
    ctx.moveTo(-0.052 * U, -0.003 * U);
    ctx.quadraticCurveTo(0, lowerLipY * 0.45, 0.052 * U, -0.003 * U);
    ctx.bezierCurveTo(0.04 * U, lowerLipY * 1.15, 0.018 * U, lowerLipY * 1.25, 0, lowerLipY * 1.18);
    ctx.bezierCurveTo(-0.018 * U, lowerLipY * 1.25, -0.04 * U, lowerLipY * 1.15, -0.052 * U, -0.003 * U);
    ctx.fill();

    // Trigger cilia whiskers along both lips
    ctx.strokeStyle = '#e5889e';
    ctx.lineWidth = Math.max(0.8, 0.0026 * U);
    ctx.lineCap = 'round';
    const ciliaCount = 7;
    for (let i = 0; i < ciliaCount; i++) {
      const f = (i / (ciliaCount - 1)) * 2 - 1; // -1..1
      const bx = f * 0.042 * U;
      const uEdgeY = -0.003 * U + (1 - f * f) * (upperArchY * 0.65);
      const lEdgeY = -0.003 * U + (1 - f * f) * (lowerLipY * 0.85);

      const spread = 0.015 * U * (0.4 + 0.6 * open);
      const interlock = (1 - open) * 0.008 * U;

      // Upper cilium
      ctx.beginPath();
      ctx.moveTo(bx, uEdgeY);
      ctx.quadraticCurveTo(
        bx * 1.08,
        uEdgeY + spread * 0.45,
        bx * 1.12,
        uEdgeY + spread * 0.85 + interlock
      );
      ctx.stroke();

      // Lower cilium (slightly offset horizontally so teeth interlace when snapped)
      const lx = bx + (f >= 0 ? -0.004 : 0.004) * U;
      ctx.beginPath();
      ctx.moveTo(lx, lEdgeY);
      ctx.quadraticCurveTo(
        lx * 1.08,
        lEdgeY - spread * 0.45,
        lx * 1.12,
        lEdgeY - spread * 0.85 - interlock
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBug(b, fade) {
    const a = b.alpha * (fade !== undefined ? fade : 1);
    if (a <= 0.02) return;

    const r = b.size * U;
    const [cr, cg, cb] = b.tint;
    const flap = Math.sin(b.wingPhase);

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.heading);

    // Soft bioluminescent aura
    const glowR = r * (b.isMoth ? 3.0 : 3.4);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
    halo.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.32 * a})`);
    halo.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    const wingSpan = r * (b.isMoth ? 1.55 : 1.35) * (0.35 + 0.65 * Math.abs(flap));
    const wingLen = r * (b.isMoth ? 1.15 : 0.95);
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(b.isMoth ? 0.62 : 0.45) * a})`;

    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(r * 0.1, 0);
      if (b.isMoth) {
        ctx.bezierCurveTo(
          -wingLen * 0.1, s * wingSpan * 1.1,
          -wingLen * 1.15, s * wingSpan * 0.95,
          -wingLen * 0.85, s * wingSpan * 0.15
        );
      } else {
        ctx.ellipse(-wingLen * 0.35, s * wingSpan * 0.55, wingLen * 0.55, wingSpan * 0.32, s * -0.45, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Body
    ctx.fillStyle = `rgba(255, 248, 232, ${0.92 * a})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.58, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing abdomen tip
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.95 * a})`;
    ctx.beginPath();
    ctx.arc(-r * 0.36, 0, r * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawSparks() {
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      const f = 1 - s.life / s.maxLife;
      ctx.fillStyle = s.warm
        ? `rgba(255, 205, 130, ${0.85 * f * f})`
        : `rgba(165, 245, 220, ${0.8 * f * f})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.4 + 0.6 * f), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function render(time) {
    drawBackground(time);
    drawMotes(time);

    drawPotAndBackMoss();

    // Back leaves & back tentacles
    for (let i = 0; i < leaves.length; i++) {
      if (leaves[i].layer === 0) drawLeaf(leaves[i], time);
    }
    for (let i = 0; i < tentacles.length; i++) {
      if (tentacles[i].layer === 0) drawTentacle(tentacles[i], time);
    }

    // Central snapping orchid-maw
    drawMaw(time);

    // Front leaves & front tentacles
    for (let i = 0; i < leaves.length; i++) {
      if (leaves[i].layer === 2) drawLeaf(leaves[i], time);
    }
    for (let i = 0; i < tentacles.length; i++) {
      if (tentacles[i].layer === 2) drawTentacle(tentacles[i], time);
    }

    // Front moss, fiddleheads & glow-mushrooms overlapping the base
    drawFrontMossAndAccents(time);

    // Free bugs & spores
    for (let i = 0; i < bugs.length; i++) {
      if (bugs[i].status === 'free') drawBug(bugs[i], 1);
    }
    drawSparks();
  }

  let lastFrame = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    const time = now / 1000;

    update(dt, time);
    render(time);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Lantern Sundew",
  "statement": "A nocturnal conservatory hybrid whose dew-beaded crimson tendrils coil slowly around stray midges while its luminous orchid-chalice snaps shut on bolder twilight moths."
}
```