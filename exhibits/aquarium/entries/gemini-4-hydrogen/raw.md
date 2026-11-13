```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blip-Bloop Dumbo</title>
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #061c29;
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

      let W = 0;
      let H = 0;
      let S = 0;
      let dpr = 1;

      const TAU = Math.PI * 2;
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const lerp = (a, b, t) => a + (b - a) * t;
      const smoothstep = (t) => t * t * (3 - 2 * t);

      // Deterministic PRNG for consistent, balanced tank scenery
      function createRng(seed) {
        let s = seed >>> 0;
        return () => {
          s = (s * 1664525 + 1013904223) >>> 0;
          return s / 4294967296;
        };
      }
      const rand = createRng(42079);

      // Pointer awareness (passive, mouse/pen only so touch scrolling is never affected)
      const pointer = {
        active: false,
        x: 0.5,
        y: 0.5,
        lastMove: 0
      };

      window.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        pointer.x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        pointer.y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
        pointer.active = true;
        pointer.lastMove = performance.now();
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        pointer.active = false;
      }, { passive: true });

      // Environment data (normalized coordinates [0..1])
      const rays = Array.from({ length: 6 }, (_, i) => ({
        x: 0.12 + i * 0.15 + (rand() - 0.5) * 0.05,
        width: 0.06 + rand() * 0.07,
        skew: 0.12 + rand() * 0.08,
        speed: 0.25 + rand() * 0.25,
        phase: rand() * TAU,
        alpha: 0.045 + rand() * 0.04
      }));

      const marineSnow = Array.from({ length: 30 }, () => ({
        x: rand(),
        y: rand(),
        r: 0.0018 + rand() * 0.0026,
        vy: -(0.006 + rand() * 0.012),
        vx: (rand() - 0.5) * 0.008,
        phase: rand() * TAU,
        alpha: 0.18 + rand() * 0.35
      }));

      // Luminous plankton star-motes the creature likes to boop
      const starMotes = Array.from({ length: 6 }, (_, i) => ({
        x: 0.18 + rand() * 0.64,
        y: 0.18 + rand() * 0.54,
        vx: (rand() - 0.5) * 0.025,
        vy: (rand() - 0.5) * 0.02,
        r: 0.011 + rand() * 0.006,
        hue: i % 2 === 0 ? 'mint' : 'gold',
        phase: rand() * TAU,
        glow: 0
      }));

      // Kelp blades (back and front layers)
      const kelp = [
        // Back layer
        { x: 0.05, h: 0.52, w: 0.032, layer: 0, phase: 0.2, hue: 0 },
        { x: 0.095, h: 0.64, w: 0.036, layer: 0, phase: 1.5, hue: 1 },
        { x: 0.145, h: 0.38, w: 0.028, layer: 0, phase: 2.7, hue: 0 },
        { x: 0.83, h: 0.44, w: 0.03, layer: 0, phase: 0.9, hue: 1 },
        { x: 0.88, h: 0.68, w: 0.038, layer: 0, phase: 2.1, hue: 0 },
        { x: 0.94, h: 0.54, w: 0.034, layer: 0, phase: 3.4, hue: 1 },
        // Front edge framing
        { x: 0.025, h: 0.42, w: 0.038, layer: 1, phase: 4.1, hue: 2 },
        { x: 0.07, h: 0.31, w: 0.03, layer: 1, phase: 0.8, hue: 2 },
        { x: 0.92, h: 0.36, w: 0.032, layer: 1, phase: 1.9, hue: 2 },
        { x: 0.97, h: 0.48, w: 0.04, layer: 1, phase: 5.0, hue: 2 }
      ];

      // Glowing sea-anemone polyps
      const anemones = [
        // Cluster right-mid
        { x: 0.72, baseY: 0.855, stems: 5, scale: 1.0, palette: 'coral' },
        // Cluster near arch left
        { x: 0.33, baseY: 0.865, stems: 4, scale: 0.82, palette: 'amber' },
        // Tiny cluster far right
        { x: 0.86, baseY: 0.84, stems: 4, scale: 0.75, palette: 'coral' }
      ].map((c) => ({
        ...c,
        polyps: Array.from({ length: c.stems }, (_, i) => {
          const spread = (i / Math.max(1, c.stems - 1)) - 0.5;
          return {
            dx: spread * 0.055 * c.scale,
            h: (0.065 + rand() * 0.055) * c.scale,
            lean: spread * 0.028 * c.scale,
            phase: rand() * TAU,
            bulb: (0.0085 + rand() * 0.0045) * c.scale
          };
        })
      }));

      // Smooth pebbles and glowing sea-glass on the sand
      const pebbles = [
        { x: 0.16, y: 0.89, rx: 0.028, ry: 0.015, rot: -0.1, color: '#274c5c' },
        { x: 0.21, y: 0.91, rx: 0.019, ry: 0.011, rot: 0.2, color: '#315c6d' },
        { x: 0.48, y: 0.885, rx: 0.026, ry: 0.014, rot: 0.08, color: '#2a4f5e' },
        { x: 0.53, y: 0.905, rx: 0.018, ry: 0.010, rot: -0.15, color: '#396575' },
        { x: 0.65, y: 0.895, rx: 0.032, ry: 0.016, rot: 0.05, color: '#244756' },
        { x: 0.78, y: 0.91, rx: 0.024, ry: 0.013, rot: -0.12, color: '#2f5969' }
      ];

      const seaGlass = [
        { x: 0.43, y: 0.90, r: 0.012, color: '#7bf0d4', phase: 0.4 },
        { x: 0.59, y: 0.895, r: 0.010, color: '#ffd285', phase: 2.1 },
        { x: 0.68, y: 0.92, r: 0.011, color: '#9de7ff', phase: 3.8 }
      ];

      // Bubbles pool
      const bubbles = [];
      function spawnBubble(nx, ny, radiusScale = 1, vyBoost = 0) {
        if (bubbles.length > 26) bubbles.shift();
        bubbles.push({
          x: nx,
          y: ny,
          r: (0.0045 + rand() * 0.0075) * radiusScale,
          vy: -(0.065 + rand() * 0.055 + vyBoost),
          wobblePhase: rand() * TAU,
          wobbleAmp: 0.004 + rand() * 0.006,
          alpha: 0.65 + rand() * 0.25
        });
      }

      // Our Hero: Blip-Bloop Dumbo Octopus
      const dumbo = {
        x: 0.52,
        y: 0.45,
        vx: 0,
        vy: 0,
        targetX: 0.45,
        targetY: 0.38,
        goalTimer: 1.5,
        targetMoteIdx: -1,
        tilt: 0,
        flapPhase: 0,
        flapSpeed: 3.0,
        blinkTimer: 2.5,
        blinkProgress: 0,
        blinking: false,
        happyTimer: 0,
        oMouthTimer: 0,
        bubbleTimer: 1.8,
        lookX: 0,
        lookY: 0,
        corePulse: 0,
        constellation: Array.from({ length: 5 }, (_, i) => ({
          ang: (i / 5) * TAU,
          dist: 0.22 + (i % 2) * 0.14,
          speed: 0.35 + i * 0.08
        }))
      };

      function pickNewGoal() {
        // Occasionally pick a luminous star-mote to boop
        if (rand() < 0.48) {
          const idx = Math.floor(rand() * starMotes.length);
          dumbo.targetMoteIdx = idx;
          dumbo.goalTimer = 3.5 + rand() * 2.0;
          return;
        }
        dumbo.targetMoteIdx = -1;
        // Otherwise pick a cozy point of interest inside the tank
        const spots = [
          { x: 0.27, y: 0.58 }, // Peek by the stone moon-arch
          { x: 0.50, y: 0.30 }, // Sunbeam float
          { x: 0.68, y: 0.56 }, // Visit glowing anemones
          { x: 0.54, y: 0.68 }, // Inspect sea-glass on sand
          { x: 0.36, y: 0.33 }, // Upper left drift
          { x: 0.64, y: 0.34 }  // Upper right drift
        ];
        const spot = spots[Math.floor(rand() * spots.length)];
        dumbo.targetX = clamp(spot.x + (rand() - 0.5) * 0.12, 0.18, 0.82);
        dumbo.targetY = clamp(spot.y + (rand() - 0.5) * 0.10, 0.20, 0.72);
        dumbo.goalTimer = 2.8 + rand() * 3.0;
      }

      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, window.innerWidth);
        H = Math.max(1, window.innerHeight);
        S = Math.min(W, H);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      window.addEventListener('resize', resize);
      resize();

      // Drawing Helpers
      function drawSoftGlow(x, y, radius, innerColor, midColor) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, innerColor);
        if (midColor) g.addColorStop(0.45, midColor);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TAU);
        ctx.fill();
      }

      function drawWaterAndRays(t) {
        // Rich ocean twilight gradient
        const waterGrad = ctx.createLinearGradient(0, 0, 0, H);
        waterGrad.addColorStop(0, '#19798e');
        waterGrad.addColorStop(0.28, '#10546b');
        waterGrad.addColorStop(0.68, '#0b384c');
        waterGrad.addColorStop(1, '#06202e');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, 0, W, H);

        // Caustic light shafts descending from top
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (const r of rays) {
          const sway = Math.sin(t * r.speed + r.phase) * 0.035;
          const xTop = (r.x + sway) * W;
          const wTop = r.width * W;
          const xBot = xTop + r.skew * W * 0.6;
          const wBot = wTop * 2.1;
          const pulse = 0.75 + 0.25 * Math.sin(t * (r.speed * 1.4) + r.phase);

          const rg = ctx.createLinearGradient(0, 0, 0, H * 0.88);
          rg.addColorStop(0, `rgba(145, 245, 240, ${r.alpha * pulse * 1.4})`);
          rg.addColorStop(0.55, `rgba(90, 210, 220, ${r.alpha * pulse * 0.55})`);
          rg.addColorStop(1, 'rgba(40, 140, 165, 0)');

          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(xTop - wTop * 0.5, 0);
          ctx.lineTo(xTop + wTop * 0.5, 0);
          ctx.lineTo(xBot + wBot * 0.5, H * 0.9);
          ctx.lineTo(xBot - wBot * 0.5, H * 0.9);
          ctx.closePath();
          ctx.fill();
        }

        // Gentle surface meniscus shimmer
        const surfH = Math.max(4, H * 0.045);
        const surfGrad = ctx.createLinearGradient(0, 0, 0, surfH);
        surfGrad.addColorStop(0, 'rgba(185, 255, 250, 0.28)');
        surfGrad.addColorStop(1, 'rgba(120, 230, 235, 0)');
        ctx.fillStyle = surfGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        const steps = 16;
        for (let i = steps; i >= 0; i--) {
          const px = (i / steps) * W;
          const py = surfH * (0.55 + 0.28 * Math.sin(i * 0.9 + t * 1.6) + 0.15 * Math.cos(i * 1.7 - t * 1.1));
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      function drawDistantRocks() {
        // Misty far reef ridge
        ctx.fillStyle = '#093042';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, H * 0.72);
        ctx.quadraticCurveTo(W * 0.14, H * 0.62, W * 0.28, H * 0.75);
        ctx.quadraticCurveTo(W * 0.44, H * 0.66, W * 0.58, H * 0.76);
        ctx.quadraticCurveTo(W * 0.76, H * 0.61, W * 0.92, H * 0.72);
        ctx.lineTo(W, H * 0.69);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      }

      function drawKelpLayer(t, layerIdx) {
        for (const k of kelp) {
          if (k.layer !== layerIdx) continue;
          const baseX = k.x * W;
          const baseY = H * 0.91;
          const bladeH = k.h * H;
          const bladeW = k.w * S;

          let fillA, fillB;
          if (k.hue === 0) {
            fillA = '#0c454e';
            fillB = '#1a7576';
          } else if (k.hue === 1) {
            fillA = '#0f4c50';
            fillB = '#23867e';
          } else {
            fillA = '#12565c';
            fillB = '#2da08d';
          }

          const grad = ctx.createLinearGradient(baseX, baseY, baseX, baseY - bladeH);
          grad.addColorStop(0, fillA);
          grad.addColorStop(1, fillB);
          ctx.fillStyle = grad;

          const segs = 10;
          const leftPts = [];
          const rightPts = [];
          for (let i = 0; i <= segs; i++) {
            const p = i / segs;
            const y = baseY - p * bladeH;
            const sway = Math.sin(t * 1.25 + k.phase - p * 3.1) * (p * p) * bladeW * 1.45;
            const rib = Math.sin(p * Math.PI * 5 + t * 2 + k.phase) * bladeW * 0.12 * p;
            const halfW = bladeW * 0.5 * Math.sin(Math.pow(1 - p, 0.75) * Math.PI * 0.5 + 0.12) * (1 - p * 0.85);
            const cx = baseX + sway + rib;
            leftPts.push({ x: cx - halfW, y });
            rightPts.push({ x: cx + halfW, y });
          }

          ctx.beginPath();
          ctx.moveTo(leftPts[0].x, leftPts[0].y);
          for (let i = 1; i <= segs; i++) {
            ctx.lineTo(leftPts[i].x, leftPts[i].y);
          }
          for (let i = segs; i >= 0; i--) {
            ctx.lineTo(rightPts[i].x, rightPts[i].y);
          }
          ctx.closePath();
          ctx.fill();
        }
      }

      function drawSandAndArch(t) {
        // Back dune
        ctx.fillStyle = '#143948';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, H * 0.83);
        ctx.bezierCurveTo(W * 0.25, H * 0.78, W * 0.45, H * 0.87, W * 0.68, H * 0.81);
        ctx.bezierCurveTo(W * 0.82, H * 0.78, W * 0.92, H * 0.84, W, H * 0.82);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Cozy Sunken Moon-Arch on left-center
        const archX = W * 0.24;
        const archY = H * 0.855;
        const archR = S * 0.155;
        const holeR = archR * 0.53;

        // Arch body with carved circular portal using evenodd rule
        const archGrad = ctx.createLinearGradient(archX, archY - archR * 1.35, archX, archY);
        archGrad.addColorStop(0, '#3a6879');
        archGrad.addColorStop(0.6, '#234a59');
        archGrad.addColorStop(1, '#163543');

        ctx.fillStyle = archGrad;
        ctx.beginPath();
        ctx.arc(archX, archY - archR * 0.48, archR * 0.92, Math.PI * 0.96, Math.PI * 0.04, false);
        ctx.lineTo(archX + archR * 1.05, archY + archR * 0.12);
        ctx.lineTo(archX - archR * 1.05, archY + archR * 0.12);
        ctx.closePath();
        // Inner circular cutout
        ctx.moveTo(archX + holeR, archY - archR * 0.48);
        ctx.arc(archX, archY - archR * 0.48, holeR, 0, TAU, true);
        ctx.fill('evenodd');

        // Soft top-rim highlight on the stone arch
        ctx.strokeStyle = 'rgba(155, 235, 235, 0.22)';
        ctx.lineWidth = Math.max(1.2, S * 0.005);
        ctx.beginPath();
        ctx.arc(archX, archY - archR * 0.48, archR * 0.90, Math.PI * 1.08, Math.PI * 1.88);
        ctx.stroke();

        // Tiny glowing turquoise moss spots on the arch
        const mossSpots = [
          { dx: -0.68, dy: -0.78, r: 0.06 },
          { dx: -0.58, dy: -0.92, r: 0.045 },
          { dx: 0.62, dy: -0.82, r: 0.055 },
          { dx: 0.72, dy: -0.65, r: 0.04 }
        ];
        for (let i = 0; i < mossSpots.length; i++) {
          const m = mossSpots[i];
          const mx = archX + m.dx * archR;
          const my = archY + m.dy * archR;
          const pulse = 0.55 + 0.45 * Math.sin(t * 1.8 + i * 1.4);
          drawSoftGlow(mx, my, m.r * archR * 2.2, `rgba(120, 250, 225, ${0.42 * pulse})`);
          ctx.fillStyle = `rgba(155, 255, 235, ${0.75 * pulse})`;
          ctx.beginPath();
          ctx.arc(mx, my, m.r * archR * 0.65, 0, TAU);
          ctx.fill();
        }

        // Right-side mossy rock mound for anemones
        const rockGrad = ctx.createLinearGradient(W * 0.72, H * 0.78, W * 0.72, H * 0.92);
        rockGrad.addColorStop(0, '#335d6e');
        rockGrad.addColorStop(1, '#183746');
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.moveTo(W * 0.63, H * 0.90);
        ctx.quadraticCurveTo(W * 0.71, H * 0.77, W * 0.81, H * 0.82);
        ctx.quadraticCurveTo(W * 0.90, H * 0.78, W * 0.97, H * 0.90);
        ctx.closePath();
        ctx.fill();

        // Main foreground sandy seabed
        const sandGrad = ctx.createLinearGradient(0, H * 0.83, 0, H);
        sandGrad.addColorStop(0, '#2a5a68');
        sandGrad.addColorStop(0.45, '#1e4654');
        sandGrad.addColorStop(1, '#122f3c');
        ctx.fillStyle = sandGrad;
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, H * 0.86);
        ctx.bezierCurveTo(W * 0.22, H * 0.89, W * 0.42, H * 0.835, W * 0.64, H * 0.875);
        ctx.bezierCurveTo(W * 0.80, H * 0.90, W * 0.92, H * 0.85, W, H * 0.87);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Subtle sunlit ripple highlights on sand
        ctx.strokeStyle = 'rgba(130, 225, 225, 0.12)';
        ctx.lineWidth = Math.max(1, S * 0.004);
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          const rx = W * (0.18 + i * 0.21);
          const ry = H * (0.91 + (i % 2) * 0.025);
          ctx.beginPath();
          ctx.moveTo(rx - W * 0.05, ry);
          ctx.quadraticCurveTo(rx, ry - H * 0.008, rx + W * 0.05, ry);
          ctx.stroke();
        }

        // Smooth pebbles
        for (const p of pebbles) {
          ctx.save();
          ctx.translate(p.x * W, p.y * H);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.rx * W, p.ry * H, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }

        // Luminous sea-glass gems
        for (const g of seaGlass) {
          const gx = g.x * W;
          const gy = g.y * H;
          const gr = g.r * S;
          const pulse = 0.72 + 0.28 * Math.sin(t * 2.0 + g.phase);
          drawSoftGlow(gx, gy, gr * 3.2, `rgba(170, 255, 235, ${0.22 * pulse})`);
          ctx.fillStyle = g.color;
          ctx.globalAlpha = 0.82 * pulse;
          ctx.beginPath();
          ctx.ellipse(gx, gy, gr * 1.15, gr * 0.78, -0.2, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = 0.65;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(gx - gr * 0.3, gy - gr * 0.22, gr * 0.32, gr * 0.16, -0.3, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      function drawAnemones(t) {
        for (const cluster of anemones) {
          const cx = cluster.x * W;
          const cy = cluster.baseY * H;
          const isCoral = cluster.palette === 'coral';
          const stemColor = isCoral ? '#8c3d59' : '#7a523f';
          const bulbInner = isCoral ? '#ffb3c6' : '#ffe49e';
          const bulbOuter = isCoral ? '#ff7597' : '#ffae5c';
          const glowCol = isCoral ? 'rgba(255, 130, 165, 0.32)' : 'rgba(255, 200, 115, 0.30)';

          for (const p of cluster.polyps) {
            const sx = cx + p.dx * W;
            const sy = cy;
            const sway = Math.sin(t * 1.8 + p.phase) * S * 0.015;
            const tipX = sx + p.lean * W + sway;
            const tipY = sy - p.h * H;
            const bulbR = p.bulb * S;

            // Curved stalk
            ctx.strokeStyle = stemColor;
            ctx.lineWidth = Math.max(1.5, bulbR * 0.65);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(sx + sway * 0.4, (sy + tipY) * 0.5, tipX, tipY);
            ctx.stroke();

            // Glowing bulb tip
            const pulse = 0.82 + 0.18 * Math.sin(t * 2.4 + p.phase);
            drawSoftGlow(tipX, tipY, bulbR * 3.0 * pulse, glowCol);

            const bg = ctx.createRadialGradient(
              tipX - bulbR * 0.25,
              tipY - bulbR * 0.25,
              bulbR * 0.1,
              tipX,
              tipY,
              bulbR
            );
            bg.addColorStop(0, '#fff7f0');
            bg.addColorStop(0.45, bulbInner);
            bg.addColorStop(1, bulbOuter);
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.arc(tipX, tipY, bulbR, 0, TAU);
            ctx.fill();
          }
        }
      }

      function drawParticles(t) {
        // Marine snow
        for (const m of marineSnow) {
          const x = m.x * W;
          const y = m.y * H;
          const r = Math.max(0.8, m.r * S);
          const twinkle = 0.65 + 0.35 * Math.sin(t * 1.5 + m.phase);
          ctx.fillStyle = `rgba(185, 245, 248, ${m.alpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fill();
        }

        // Luminous plankton star-motes
        for (const sm of starMotes) {
          const x = sm.x * W;
          const y = sm.y * H;
          const r = Math.max(2, sm.r * S);
          const pulse = 0.8 + 0.2 * Math.sin(t * 2.7 + sm.phase);
          const boost = 1 + sm.glow * 0.9;
          const coreColor = sm.hue === 'mint' ? '#a6ffe5' : '#ffe79e';
          const haloColor =
            sm.hue === 'mint'
              ? `rgba(125, 255, 220, ${(0.28 + sm.glow * 0.35) * pulse})`
              : `rgba(255, 220, 130, ${(0.28 + sm.glow * 0.35) * pulse})`;

          drawSoftGlow(x, y, r * 3.1 * boost, haloColor);

          ctx.fillStyle = coreColor;
          ctx.beginPath();
          ctx.arc(x, y, r * 0.52 * (1 + sm.glow * 0.25), 0, TAU);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, r * 0.24, 0, TAU);
          ctx.fill();
        }
      }

      function drawBubbles(t) {
        for (const b of bubbles) {
          const bx = b.x * W + Math.sin(t * 4.5 + b.wobblePhase) * b.wobbleAmp * W;
          const by = b.y * H;
          const br = Math.max(1.5, b.r * S);

          ctx.save();
          ctx.globalAlpha = b.alpha;
          ctx.fillStyle = 'rgba(180, 250, 255, 0.14)';
          ctx.strokeStyle = 'rgba(210, 255, 255, 0.72)';
          ctx.lineWidth = Math.max(0.9, br * 0.16);
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, TAU);
          ctx.fill();
          ctx.stroke();

          // Specular highlight dot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.beginPath();
          ctx.arc(bx - br * 0.34, by - br * 0.34, br * 0.24, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
      }

      function drawDumbo(t) {
        const cx = dumbo.x * W;
        const cy = dumbo.y * H;
        const R = S * 0.142;

        // Subtle soft shadow on the sand when swimming low
        const floorProximity = clamp((dumbo.y - 0.56) / 0.25, 0, 1);
        if (floorProximity > 0) {
          ctx.fillStyle = `rgba(4, 18, 28, ${0.28 * floorProximity})`;
          ctx.beginPath();
          ctx.ellipse(cx, H * 0.88, R * (0.9 - 0.2 * floorProximity), R * 0.18, 0, 0, TAU);
          ctx.fill();
        }

        // Soft ambient bioluminescent aura around the octopus
        const auraAlpha = 0.16 + dumbo.corePulse * 0.14;
        drawSoftGlow(cx, cy - R * 0.1, R * 1.9, `rgba(255, 195, 215, ${auraAlpha})`);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(dumbo.tilt);

        const vyNorm = clamp(dumbo.vy * 8, -1, 1);

        // Helper to draw a tentacle
        const drawTentacle = (idx, isFront) => {
          const spread = (idx / 3) - 0.5; // -0.5 .. 0.5
          const xBase = spread * R * (isFront ? 0.96 : 0.78);
          const yBase = R * (isFront ? 0.44 : 0.36);
          const len = R * (isFront ? 0.64 : 0.56);
          const sway = Math.sin(t * 3.1 + idx * 1.15 + (isFront ? 0 : 1.7)) * R * 0.11;
          const flare = spread * R * (0.34 - vyNorm * 0.12);
          const tipX = xBase + flare + sway;
          const tipY = yBase + len - vyNorm * R * 0.08;
          const ctrlX = xBase + flare * 0.35 - sway * 0.4;
          const ctrlY = yBase + len * 0.55;

          ctx.lineCap = 'round';
          ctx.strokeStyle = isFront ? '#f69bb4' : '#be6f95';
          ctx.lineWidth = R * (isFront ? 0.19 : 0.155);
          ctx.beginPath();
          ctx.moveTo(xBase, yBase);
          ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
          ctx.stroke();

          if (isFront) {
            // Pale creamy inner underside dots
            ctx.fillStyle = 'rgba(255, 236, 232, 0.78)';
            for (let d = 0.45; d <= 0.85; d += 0.25) {
              const it = d;
              const px = (1 - it) * (1 - it) * xBase + 2 * (1 - it) * it * ctrlX + it * it * tipX;
              const py = (1 - it) * (1 - it) * yBase + 2 * (1 - it) * it * ctrlY + it * it * tipY;
              ctx.beginPath();
              ctx.arc(px, py, R * 0.032, 0, TAU);
              ctx.fill();
            }
          }
        };

        // 1. Back tentacles
        for (let i = 0; i < 4; i++) {
          drawTentacle(i, false);
        }

        // 2. Floppy Ear-Fins (Left and Right)
        const rawWave = Math.sin(dumbo.flapPhase);
        // Slightly snappier downstroke, floaty upstroke
        const flapAngle = (rawWave + 0.18 * Math.sin(dumbo.flapPhase * 2)) * 0.58;

        for (const side of [-1, 1]) {
          ctx.save();
          ctx.translate(side * R * 0.74, -R * 0.16);
          ctx.rotate(side * (-0.18 + flapAngle));

          const earGrad = ctx.createLinearGradient(0, 0, side * R * 0.72, 0);
          earGrad.addColorStop(0, '#f59ab5');
          earGrad.addColorStop(0.55, '#ffc6cf');
          earGrad.addColorStop(1, 'rgba(255, 228, 224, 0.82)');

          ctx.fillStyle = earGrad;
          ctx.beginPath();
          ctx.moveTo(0, -R * 0.16);
          ctx.bezierCurveTo(
            side * R * 0.48, -R * 0.42,
            side * R * 0.78, -R * 0.08,
            side * R * 0.66, R * 0.18
          );
          ctx.bezierCurveTo(
            side * R * 0.50, R * 0.36,
            side * R * 0.18, R * 0.24,
            0, R * 0.14
          );
          ctx.closePath();
          ctx.fill();

          // Delicate translucent ear fin veins
          ctx.strokeStyle = 'rgba(255, 245, 245, 0.36)';
          ctx.lineWidth = Math.max(0.8, R * 0.022);
          ctx.beginPath();
          ctx.moveTo(side * R * 0.08, -R * 0.02);
          ctx.quadraticCurveTo(side * R * 0.34, -R * 0.16, side * R * 0.52, -R * 0.08);
          ctx.moveTo(side * R * 0.08, R * 0.03);
          ctx.quadraticCurveTo(side * R * 0.34, R * 0.04, side * R * 0.54, R * 0.08);
          ctx.stroke();

          ctx.restore();
        }

        // 3. Front webbed tentacle skirt (subtle scalloped belly behind front tentacles)
        ctx.fillStyle = '#e588a6';
        ctx.beginPath();
        ctx.moveTo(-R * 0.62, R * 0.36);
        ctx.quadraticCurveTo(0, R * 0.60, R * 0.62, R * 0.36);
        ctx.lineTo(R * 0.54, R * 0.52);
        ctx.quadraticCurveTo(0, R * 0.68, -R * 0.54, R * 0.52);
        ctx.closePath();
        ctx.fill();

        // 4. Front tentacles
        for (let i = 0; i < 4; i++) {
          drawTentacle(i, true);
        }

        // 5. Main Bell / Mantle Head
        const squish = Math.sin(dumbo.flapPhase - 0.4) * 0.035;
        const mW = R * (0.86 + squish);
        const mTop = -R * (0.92 - squish * 0.8);
        const mBot = R * 0.48;

        const bodyGrad = ctx.createRadialGradient(
          -R * 0.22, -R * 0.34, R * 0.1,
          0, -R * 0.08, R * 1.05
        );
        bodyGrad.addColorStop(0, '#ffe4dc');
        bodyGrad.addColorStop(0.42, '#ffb6c1');
        bodyGrad.addColorStop(0.78, '#f087a8');
        bodyGrad.addColorStop(1, '#c86694');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(0, mTop);
        ctx.bezierCurveTo(mW * 0.82, mTop, mW * 1.04, -R * 0.22, mW * 0.92, R * 0.22);
        ctx.quadraticCurveTo(mW * 0.82, mBot, 0, mBot);
        ctx.quadraticCurveTo(-mW * 0.82, mBot, -mW * 0.92, R * 0.22);
        ctx.bezierCurveTo(-mW * 1.04, -R * 0.22, -mW * 0.82, mTop, 0, mTop);
        ctx.closePath();
        ctx.fill();

        // Iridescent crown highlight arc
        ctx.strokeStyle = 'rgba(255, 252, 245, 0.48)';
        ctx.lineWidth = Math.max(1.2, R * 0.045);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(-R * 0.08, -R * 0.26, R * 0.58, Math.PI * 1.12, Math.PI * 1.56);
        ctx.stroke();

        // 6. Inner Bioluminescent Star-Core (a tiny swirling daydream inside the translucent dome)
        const coreY = -R * 0.42;
        const coreGlow = 0.26 + dumbo.corePulse * 0.35;
        drawSoftGlow(0, coreY, R * 0.56, `rgba(170, 255, 235, ${coreGlow})`, `rgba(255, 225, 160, ${coreGlow * 0.45})`);

        const nodePts = dumbo.constellation.map((n, i) => {
          const a = n.ang + t * n.speed;
          const r = n.dist * R * (0.88 + 0.12 * Math.sin(t * 2 + i));
          return {
            x: Math.cos(a) * r,
            y: coreY + Math.sin(a) * r * 0.65
          };
        });

        ctx.strokeStyle = `rgba(215, 255, 245, ${0.28 + dumbo.corePulse * 0.3})`;
        ctx.lineWidth = Math.max(0.7, R * 0.018);
        ctx.beginPath();
        for (let i = 0; i < nodePts.length; i++) {
          const a = nodePts[i];
          const b = nodePts[(i + 1) % nodePts.length];
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();

        for (let i = 0; i < nodePts.length; i++) {
          const p = nodePts[i];
          ctx.fillStyle = i % 2 === 0 ? 'rgba(180, 255, 235, 0.88)' : 'rgba(255, 240, 175, 0.88)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, R * (0.032 + dumbo.corePulse * 0.015), 0, TAU);
          ctx.fill();
        }

        // Cute pastel freckles on upper cheeks
        ctx.fillStyle = 'rgba(255, 242, 235, 0.42)';
        for (const fx of [-0.56, -0.44, 0.44, 0.56]) {
          const fy = Math.abs(fx) > 0.5 ? 0.08 : 0.16;
          ctx.beginPath();
          ctx.arc(fx * R, fy * R, R * 0.035, 0, TAU);
          ctx.fill();
        }

        // Soft rosy cheek blush
        ctx.fillStyle = 'rgba(255, 110, 145, 0.30)';
        ctx.beginPath();
        ctx.ellipse(-R * 0.46, R * 0.19, R * 0.12, R * 0.075, 0, 0, TAU);
        ctx.ellipse(R * 0.46, R * 0.19, R * 0.12, R * 0.075, 0, 0, TAU);
        ctx.fill();

        // 7. Expressive Eyes
        const eyeY = R * 0.03;
        const eyeX = R * 0.33;
        const eyeR = R * 0.145;

        for (const side of [-1, 1]) {
          const ex = side * eyeX;
          if (dumbo.happyTimer > 0) {
            // Happy "^ ^" squint arcs!
            ctx.strokeStyle = '#241438';
            ctx.lineWidth = Math.max(1.5, R * 0.045);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(ex, eyeY + eyeR * 0.25, eyeR * 0.85, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
          } else if (dumbo.blinking && dumbo.blinkProgress > 0.45) {
            // Gentle blink curve
            ctx.strokeStyle = '#241438';
            ctx.lineWidth = Math.max(1.4, R * 0.04);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(ex, eyeY - eyeR * 0.1, eyeR * 0.8, Math.PI * 0.18, Math.PI * 0.82);
            ctx.stroke();
          } else {
            // Glossy dark eyes with tracking catchlights
            ctx.fillStyle = '#1b1133';
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeR, 0, TAU);
            ctx.fill();

            // Subtle lower teal reflection crescent
            ctx.fillStyle = 'rgba(110, 225, 235, 0.28)';
            ctx.beginPath();
            ctx.arc(ex, eyeY + eyeR * 0.25, eyeR * 0.62, 0.2, Math.PI - 0.2);
            ctx.fill();

            // Tracking specular highlights
            const lx = dumbo.lookX * eyeR * 0.28;
            const ly = dumbo.lookY * eyeR * 0.28;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - eyeR * 0.28 + lx, eyeY - eyeR * 0.30 + ly, eyeR * 0.32, 0, TAU);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + eyeR * 0.32 + lx, eyeY + eyeR * 0.22 + ly, eyeR * 0.14, 0, TAU);
            ctx.fill();
          }
        }

        // 8. Tiny siphon / mouth
        const mouthY = R * 0.21;
        if (dumbo.oMouthTimer > 0) {
          // Cute little "bloop" O-mouth
          ctx.fillStyle = '#6d254d';
          ctx.beginPath();
          ctx.arc(0, mouthY, R * 0.068, 0, TAU);
          ctx.fill();
        } else {
          // Gentle tiny smile
          ctx.strokeStyle = '#5e2347';
          ctx.lineWidth = Math.max(1.1, R * 0.032);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, mouthY - R * 0.02, R * 0.07, 0.22, Math.PI - 0.22);
          ctx.stroke();
        }

        ctx.restore();
      }

      function drawTankGlass() {
        // Subtle inner vignette to frame the aquarium depth
        const vig = ctx.createRadialGradient(
          W * 0.5, H * 0.48, S * 0.35,
          W * 0.5, H * 0.5, Math.max(W, H) * 0.78
        );
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(3, 14, 22, 0.38)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        // Delicate diagonal glass sheen in upper-left corner
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(W * 0.03, 0);
        ctx.lineTo(W * 0.16, 0);
        ctx.lineTo(0, H * 0.22);
        ctx.lineTo(0, H * 0.05);
        ctx.closePath();
        ctx.fillStyle = 'rgba(215, 250, 255, 0.045)';
        ctx.fill();
        ctx.restore();
      }

      // Simulation update
      function update(dt, t) {
        // Marine snow drift
        for (const m of marineSnow) {
          m.x += (m.vx + Math.sin(t * 0.8 + m.phase) * 0.004) * dt;
          m.y += m.vy * dt;
          if (m.y < -0.02) { m.y = 1.02; m.x = rand(); }
          if (m.x < -0.02) m.x = 1.02;
          if (m.x > 1.02) m.x = -0.02;
        }

        // Luminous star-motes gentle wander + boop reaction
        for (const sm of starMotes) {
          sm.x += sm.vx * dt;
          sm.y += sm.vy * dt + Math.sin(t * 1.4 + sm.phase) * 0.006 * dt;
          if (sm.x < 0.12 || sm.x > 0.88) sm.vx *= -1;
          if (sm.y < 0.14 || sm.y > 0.76) sm.vy *= -1;
          sm.x = clamp(sm.x, 0.10, 0.90);
          sm.y = clamp(sm.y, 0.12, 0.78);
          sm.glow = Math.max(0, sm.glow - dt * 0.8);

          // Check distance to Dumbo for a joyful boop!
          const dx = sm.x - dumbo.x;
          const dy = sm.y - dumbo.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.075 && sm.glow < 0.25) {
            sm.glow = 1.0;
            const nx = dx / (dist || 0.01);
            const ny = dy / (dist || 0.01);
            sm.vx = clamp(sm.vx + nx * 0.06, -0.07, 0.07);
            sm.vy = clamp(sm.vy + ny * 0.06, -0.06, 0.06);
            dumbo.happyTimer = 0.85;
            dumbo.corePulse = 1.0;
            dumbo.oMouthTimer = 0.45;
            spawnBubble(sm.x, sm.y - 0.02, 0.9, 0.02);
            spawnBubble(dumbo.x + nx * 0.04, dumbo.y - 0.03, 0.75, 0.01);
            if (dumbo.targetMoteIdx !== -1) {
              dumbo.targetMoteIdx = -1;
              dumbo.goalTimer = 0.6;
            }
          }
        }

        // Bubbles rise
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y += b.vy * dt;
          b.alpha -= dt * 0.08;
          if (b.y < -0.04 || b.alpha <= 0) {
            bubbles.splice(i, 1);
          }
        }

        // Dumbo autonomous AI & physics
        dumbo.goalTimer -= dt;
        if (dumbo.goalTimer <= 0) {
          pickNewGoal();
        }

        let gx = dumbo.targetX;
        let gy = dumbo.targetY;
        if (dumbo.targetMoteIdx >= 0 && starMotes[dumbo.targetMoteIdx]) {
          gx = starMotes[dumbo.targetMoteIdx].x;
          gy = starMotes[dumbo.targetMoteIdx].y;
        } else if (pointer.active && performance.now() - pointer.lastMove < 4000) {
          // Gently drift slightly nearer curious cursor without locking onto it
          gx = lerp(gx, clamp(pointer.x, 0.18, 0.82), 0.28);
          gy = lerp(gy, clamp(pointer.y, 0.18, 0.72), 0.28);
        }

        const toX = gx - dumbo.x;
        const toY = gy - dumbo.y;
        const distToGoal = Math.hypot(toX, toY);

        // Soft spring steering + buoyant bobbing
        const swimAccel = 0.16;
        if (distToGoal > 0.02) {
          dumbo.vx += (toX / distToGoal) * swimAccel * Math.min(1, distToGoal * 3) * dt;
          dumbo.vy += (toY / distToGoal) * swimAccel * Math.min(1, distToGoal * 3) * dt;
        }
        // Gentle buoyant hover
        dumbo.vy += Math.sin(t * 2.1) * 0.022 * dt;

        // Water drag
        const drag = Math.exp(-2.3 * dt);
        dumbo.vx *= drag;
        dumbo.vy *= drag;

        dumbo.x = clamp(dumbo.x + dumbo.vx * dt, 0.14, 0.86);
        dumbo.y = clamp(dumbo.y + dumbo.vy * dt, 0.16, 0.75);

        // Smooth tilt into motion
        const targetTilt = clamp(dumbo.vx * 2.8, -0.26, 0.26);
        dumbo.tilt = lerp(dumbo.tilt, targetTilt, 1 - Math.exp(-5 * dt));

        // Ear-flap rhythm speeds up slightly when swimming faster
        const speed = Math.hypot(dumbo.vx, dumbo.vy);
        dumbo.flapSpeed = lerp(dumbo.flapSpeed, 2.8 + speed * 26, 1 - Math.exp(-4 * dt));
        dumbo.flapPhase += dumbo.flapSpeed * dt;

        // Eye tracking (pointer if active, otherwise goal/mote)
        let lookTargetX = toX;
        let lookTargetY = toY;
        if (pointer.active && performance.now() - pointer.lastMove < 4000) {
          lookTargetX = pointer.x - dumbo.x;
          lookTargetY = pointer.y - dumbo.y;
        }
        const lookDist = Math.hypot(lookTargetX, lookTargetY) || 1;
        const normScale = Math.min(1, lookDist * 4);
        dumbo.lookX = lerp(dumbo.lookX, (lookTargetX / lookDist) * normScale, 1 - Math.exp(-6 * dt));
        dumbo.lookY = lerp(dumbo.lookY, (lookTargetY / lookDist) * normScale, 1 - Math.exp(-6 * dt));

        // Blinking & emotions
        dumbo.happyTimer = Math.max(0, dumbo.happyTimer - dt);
        dumbo.oMouthTimer = Math.max(0, dumbo.oMouthTimer - dt);
        dumbo.corePulse = Math.max(0, dumbo.corePulse - dt * 0.7);

        if (dumbo.blinking) {
          dumbo.blinkProgress += dt * 6.5;
          if (dumbo.blinkProgress >= 1) {
            dumbo.blinking = false;
            dumbo.blinkProgress = 0;
            dumbo.blinkTimer = 2.4 + rand() * 3.8;
          }
        } else {
          dumbo.blinkTimer -= dt;
          if (dumbo.blinkTimer <= 0) {
            dumbo.blinking = true;
            dumbo.blinkProgress = 0;
          }
        }

        // Occasional cheerful bubble puffs
        dumbo.bubbleTimer -= dt;
        if (dumbo.bubbleTimer <= 0) {
          dumbo.bubbleTimer = 2.2 + rand() * 3.2;
          dumbo.oMouthTimer = 0.35;
          spawnBubble(dumbo.x + (rand() - 0.5) * 0.03, dumbo.y - 0.05, 1.0);
          if (rand() < 0.55) {
            spawnBubble(dumbo.x + (rand() - 0.5) * 0.04, dumbo.y - 0.03, 0.65, -0.01);
          }
        }
      }

      // Main Animation Loop
      let lastTime = performance.now();
      function frame(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        const t = now * 0.001;

        update(dt, t);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawWaterAndRays(t);
        drawDistantRocks();
        drawKelpLayer(t, 0);
        drawSandAndArch(t);
        drawAnemones(t);
        drawParticles(t);
        drawDumbo(t);
        drawBubbles(t);
        drawKelpLayer(t, 1);
        drawTankGlass();

        requestAnimationFrame(frame);
      }

      // Seed a few initial bubbles so the tank feels alive on frame 1
      spawnBubble(0.24, 0.55, 0.9);
      spawnBubble(0.55, 0.35, 0.7);
      spawnBubble(0.73, 0.68, 0.8);

      requestAnimationFrame(frame);
    })();
  </script>
</body>
</html>
```

```json
{
  "title": "Blip-Bloop Dumbo",
  "medium": "HTML5 Canvas + vanilla JS",
  "statement": "A curious little dumbo octopus with a tiny swirling constellation inside its translucent dome, happiest when flapping through sunbeams and booping luminous plankton motes."
}
```