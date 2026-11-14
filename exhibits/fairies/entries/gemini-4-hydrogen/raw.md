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
      background: #0a0c1a;
      touch-action: pan-y;
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

      let width = 0;
      let height = 0;
      let dpr = 1;
      let unit = 1;
      let cx = 0;
      let cy = 0;

      // Offscreen static backdrop for fast compositing
      const bgCanvas = document.createElement('canvas');
      const bgCtx = bgCanvas.getContext('2d');

      // Subtle pointer influence (optional parallax, decays naturally)
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      window.addEventListener('pointermove', (e) => {
        if (!width || !height) return;
        pointer.tx = (e.clientX / width - 0.5) * 2;
        pointer.ty = (e.clientY / height - 0.5) * 2;
      }, { passive: true });
      window.addEventListener('pointerleave', () => {
        pointer.tx = 0;
        pointer.ty = 0;
      }, { passive: true });

      // Deterministic pseudo-random helper
      function mulberry32(seed) {
        let a = seed >>> 0;
        return () => {
          a |= 0;
          a = (a + 0x6d2b79f5) | 0;
          let t = Math.imul(a ^ (a >>> 15), 1 | a);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      const rand = mulberry32(471923);

      // Ambient drifting motes
      const motes = Array.from({ length: 58 }, () => ({
        x: rand(),
        y: rand(),
        r: 0.0022 + rand() * 0.0055,
        speedY: 0.008 + rand() * 0.018,
        drift: 0.008 + rand() * 0.022,
        phase: rand() * Math.PI * 2,
        warm: rand() > 0.38,
        alpha: 0.25 + rand() * 0.65
      }));

      // Ink-light wisps rising from the letters
      const inkSparks = Array.from({ length: 28 }, (_, i) => ({
        offset: i / 28,
        sway: 0.012 + rand() * 0.025,
        freq: 1.5 + rand() * 2.2,
        size: 0.0025 + rand() * 0.0045,
        phase: rand() * Math.PI * 2
      }));

      // Distant soft stars
      const stars = Array.from({ length: 64 }, () => ({
        x: rand(),
        y: rand() * 0.78,
        r: 0.4 + rand() * 1.3,
        phase: rand() * Math.PI * 2,
        speed: 0.7 + rand() * 1.6,
        alpha: 0.15 + rand() * 0.55
      }));

      function buildBackdrop() {
        bgCanvas.width = Math.max(1, Math.floor(width * dpr));
        bgCanvas.height = Math.max(1, Math.floor(height * dpr));
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Deep twilight sky gradient
        const sky = bgCtx.createLinearGradient(0, 0, width * 0.25, height);
        sky.addColorStop(0, '#090b1a');
        sky.addColorStop(0.38, '#131632');
        sky.addColorStop(0.72, '#1d1936');
        sky.addColorStop(1, '#0e0c1b');
        bgCtx.fillStyle = sky;
        bgCtx.fillRect(0, 0, width, height);

        // Soft moonlit nebula glow in upper right
        const moonGlow = bgCtx.createRadialGradient(
          cx + unit * 0.18, cy - unit * 0.28, unit * 0.02,
          cx + unit * 0.18, cy - unit * 0.28, unit * 0.85
        );
        moonGlow.addColorStop(0, 'rgba(165, 206, 232, 0.22)');
        moonGlow.addColorStop(0.35, 'rgba(116, 128, 196, 0.10)');
        moonGlow.addColorStop(1, 'rgba(14, 16, 36, 0)');
        bgCtx.fillStyle = moonGlow;
        bgCtx.fillRect(0, 0, width, height);

        // Warm candlelight pocket around the letters (lower left)
        const letterGlow = bgCtx.createRadialGradient(
          cx - unit * 0.2, cy + unit * 0.34, unit * 0.02,
          cx - unit * 0.2, cy + unit * 0.34, unit * 0.65
        );
        letterGlow.addColorStop(0, 'rgba(248, 194, 118, 0.19)');
        letterGlow.addColorStop(0.45, 'rgba(196, 126, 94, 0.07)');
        letterGlow.addColorStop(1, 'rgba(14, 12, 27, 0)');
        bgCtx.fillStyle = letterGlow;
        bgCtx.fillRect(0, 0, width, height);

        // Subtle atmospheric mist bands
        for (let i = 0; i < 6; i++) {
          const mx = width * (0.15 + i * 0.14);
          const my = height * (0.28 + (i % 3) * 0.22);
          const mr = unit * (0.45 + (i % 2) * 0.25);
          const mist = bgCtx.createRadialGradient(mx, my, 0, mx, my, mr);
          mist.addColorStop(0, i % 2 === 0 ? 'rgba(92, 110, 178, 0.06)' : 'rgba(155, 110, 165, 0.05)');
          mist.addColorStop(1, 'rgba(0, 0, 0, 0)');
          bgCtx.fillStyle = mist;
          bgCtx.fillRect(0, 0, width, height);
        }

        // Delicate silhouetted twilight foliage tendrils framing edges softly
        bgCtx.save();
        bgCtx.fillStyle = 'rgba(7, 8, 20, 0.55)';
        const drawBranch = (sx, sy, ex, ey, cp1x, cp1y, wBase) => {
          bgCtx.beginPath();
          bgCtx.moveTo(sx, sy);
          bgCtx.quadraticCurveTo(cp1x, cp1y, ex, ey);
          bgCtx.lineWidth = wBase;
          bgCtx.strokeStyle = 'rgba(7, 9, 22, 0.65)';
          bgCtx.lineCap = 'round';
          bgCtx.stroke();
        };
        drawBranch(-unit * 0.05, height * 0.08, width * 0.24, height * 0.24, width * 0.1, height * 0.1, unit * 0.008);
        drawBranch(width + unit * 0.05, height * 0.12, width * 0.82, height * 0.26, width * 0.9, height * 0.16, unit * 0.007);
        drawBranch(-unit * 0.04, height * 0.85, width * 0.25, height * 0.72, width * 0.1, height * 0.82, unit * 0.009);

        // Hanging willow-like leaves on top left & right
        const localRand = mulberry32(8812);
        const drawSprig = (x0, y0, len, count, swayDir) => {
          bgCtx.strokeStyle = 'rgba(8, 10, 24, 0.58)';
          bgCtx.lineWidth = Math.max(1, unit * 0.0028);
          bgCtx.beginPath();
          bgCtx.moveTo(x0, y0);
          bgCtx.quadraticCurveTo(x0 + swayDir * unit * 0.04, y0 + len * 0.5, x0 + swayDir * unit * 0.02, y0 + len);
          bgCtx.stroke();
          for (let k = 1; k <= count; k++) {
            const p = k / count;
            const lx = x0 + swayDir * unit * (0.04 * Math.sin(p * Math.PI * 0.85));
            const ly = y0 + len * p;
            const lSize = unit * (0.012 + localRand() * 0.012);
            bgCtx.save();
            bgCtx.translate(lx, ly);
            bgCtx.rotate(swayDir * (0.35 + localRand() * 0.35));
            bgCtx.beginPath();
            bgCtx.ellipse(0, lSize * 0.5, lSize * 0.22, lSize * 0.6, 0, 0, Math.PI * 2);
            bgCtx.fill();
            bgCtx.restore();
          }
        };
        drawSprig(width * 0.08, -unit * 0.02, unit * 0.32, 9, 1);
        drawSprig(width * 0.14, -unit * 0.04, unit * 0.22, 6, 1);
        drawSprig(width * 0.91, -unit * 0.02, unit * 0.26, 7, -1);
        bgCtx.restore();

        // Subtle soft vignette
        const vig = bgCtx.createRadialGradient(
          cx, cy, unit * 0.32,
          cx, cy, Math.max(width, height) * 0.78
        );
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(1, 'rgba(4, 5, 14, 0.58)');
        bgCtx.fillStyle = vig;
        bgCtx.fillRect(0, 0, width, height);
      }

      function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        cx = width * 0.5;
        cy = height * 0.5;
        // Reference unit fits a 2:3 card cleanly inside any viewport
        unit = Math.min(width, height * 0.667);
        buildBackdrop();
      }

      window.addEventListener('resize', resize);
      resize();

      // Draw a single floating parchment envelope
      function drawEnvelope(x, y, w, h, angle, options) {
        const {
          openFlap = 0,
          hasSeal = true,
          sealBroken = false,
          glowIntensity = 0.5,
          opacity = 1
        } = options;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = opacity;

        // Soft warm aura around envelope
        if (glowIntensity > 0) {
          const aura = ctx.createRadialGradient(0, 0, w * 0.1, 0, 0, w * 1.15);
          aura.addColorStop(0, `rgba(255, 210, 140, ${0.22 * glowIntensity})`);
          aura.addColorStop(1, 'rgba(255, 190, 110, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, w * 1.15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Paper shadow
        ctx.fillStyle = 'rgba(8, 6, 18, 0.36)';
        ctx.beginPath();
        ctx.roundRect(-w * 0.5 + unit * 0.008, -h * 0.5 + unit * 0.012, w, h, w * 0.03);
        ctx.fill();

        // Main aged parchment body
        const paperGrad = ctx.createLinearGradient(-w * 0.5, -h * 0.5, w * 0.5, h * 0.5);
        paperGrad.addColorStop(0, '#f4e6ca');
        paperGrad.addColorStop(0.55, '#e3caa0');
        paperGrad.addColorStop(1, '#c5a476');
        ctx.fillStyle = paperGrad;
        ctx.beginPath();
        ctx.roundRect(-w * 0.5, -h * 0.5, w, h, w * 0.025);
        ctx.fill();

        // Inner golden light leaking out if slightly open
        if (openFlap > 0.05) {
          const innerGlow = ctx.createLinearGradient(0, -h * 0.5, 0, 0);
          innerGlow.addColorStop(0, `rgba(255, 224, 148, ${0.75 * openFlap})`);
          innerGlow.addColorStop(1, 'rgba(220, 160, 95, 0)');
          ctx.fillStyle = innerGlow;
          ctx.beginPath();
          ctx.moveTo(-w * 0.46, -h * 0.46);
          ctx.lineTo(w * 0.46, -h * 0.46);
          ctx.lineTo(0, h * 0.05);
          ctx.closePath();
          ctx.fill();
        }

        // Envelope side & bottom folds
        ctx.strokeStyle = 'rgba(130, 95, 58, 0.42)';
        ctx.lineWidth = Math.max(0.8, unit * 0.0022);
        ctx.beginPath();
        ctx.moveTo(-w * 0.49, -h * 0.48);
        ctx.lineTo(0, h * 0.06);
        ctx.lineTo(w * 0.49, -h * 0.48);
        ctx.moveTo(-w * 0.49, h * 0.48);
        ctx.lineTo(-w * 0.14, -h * 0.08);
        ctx.moveTo(w * 0.49, h * 0.48);
        ctx.lineTo(w * 0.14, -h * 0.08);
        ctx.stroke();

        // Top flap (can lift open)
        const flapTipY = openFlap > 0 ? -h * (0.48 + openFlap * 0.34) : h * 0.11;
        const flapGrad = ctx.createLinearGradient(0, -h * 0.5, 0, flapTipY);
        flapGrad.addColorStop(0, '#f7ebd4');
        flapGrad.addColorStop(1, openFlap > 0 ? '#d8ba8d' : '#dfc397');
        ctx.fillStyle = flapGrad;
        ctx.beginPath();
        ctx.moveTo(-w * 0.5, -h * 0.49);
        ctx.quadraticCurveTo(0, -h * 0.5, w * 0.5, -h * 0.49);
        ctx.lineTo(w * 0.05, flapTipY);
        ctx.quadraticCurveTo(0, flapTipY + (openFlap > 0 ? -h * 0.03 : h * 0.03), -w * 0.05, flapTipY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(135, 96, 56, 0.45)';
        ctx.stroke();

        // Delicate abstract ink script squiggles on the lower corner (purely ornamental)
        if (!openFlap) {
          ctx.strokeStyle = 'rgba(92, 64, 48, 0.35)';
          ctx.lineWidth = Math.max(0.6, unit * 0.0015);
          for (let line = 0; line < 2; line++) {
            const ly = h * (0.2 + line * 0.11);
            ctx.beginPath();
            ctx.moveTo(-w * 0.22, ly);
            for (let s = 0; s < 6; s++) {
              const sx = -w * 0.22 + (s + 1) * (w * 0.075);
              const sy = ly + Math.sin(s * 2.1 + line) * h * 0.025;
              ctx.quadraticCurveTo(sx - w * 0.038, ly - h * 0.028, sx, sy);
            }
            ctx.stroke();
          }
        }

        // Crimson wax seal
        if (hasSeal) {
          const sy = openFlap > 0 ? h * 0.09 : h * 0.07;
          const sr = w * 0.115;

          ctx.save();
          ctx.translate(0, sy);

          // Wax drop shadow
          ctx.fillStyle = 'rgba(40, 12, 18, 0.42)';
          ctx.beginPath();
          ctx.arc(unit * 0.003, unit * 0.004, sr * 1.05, 0, Math.PI * 2);
          ctx.fill();

          // Organic irregular wax rim
          const waxGrad = ctx.createRadialGradient(-sr * 0.3, -sr * 0.3, sr * 0.1, 0, 0, sr * 1.1);
          waxGrad.addColorStop(0, '#d84756');
          waxGrad.addColorStop(0.55, '#9d2130');
          waxGrad.addColorStop(1, '#5e101b');
          ctx.fillStyle = waxGrad;
          ctx.beginPath();
          for (let a = 0; a <= 16; a++) {
            const theta = (a / 16) * Math.PI * 2;
            const wobble = 1 + Math.sin(theta * 5) * 0.07 + Math.cos(theta * 3) * 0.05;
            const px = Math.cos(theta) * sr * wobble;
            const py = Math.sin(theta) * sr * wobble;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // Inner stamped ring
          ctx.strokeStyle = 'rgba(248, 175, 165, 0.35)';
          ctx.lineWidth = Math.max(0.7, unit * 0.0018);
          ctx.beginPath();
          ctx.arc(0, 0, sr * 0.65, 0, Math.PI * 2);
          ctx.stroke();

          // Tiny crescent emblem in wax
          ctx.fillStyle = 'rgba(72, 12, 20, 0.55)';
          ctx.beginPath();
          ctx.arc(0, 0, sr * 0.32, 0, Math.PI * 2);
          ctx.fill();

          if (sealBroken) {
            ctx.strokeStyle = '#e3caa0';
            ctx.lineWidth = Math.max(0.8, unit * 0.002);
            ctx.beginPath();
            ctx.moveTo(-sr * 0.9, -sr * 0.25);
            ctx.lineTo(0, sr * 0.05);
            ctx.lineTo(sr * 0.95, -sr * 0.15);
            ctx.stroke();
          }

          // Specular glint
          ctx.fillStyle = 'rgba(255, 232, 224, 0.45)';
          ctx.beginPath();
          ctx.ellipse(-sr * 0.32, -sr * 0.32, sr * 0.22, sr * 0.11, -0.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        ctx.restore();
      }

      // Draw a floating unfolded letter sheet with gentle parchment curl
      function drawOpenLetter(x, y, w, h, angle, t) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const curl = Math.sin(t * 1.1) * h * 0.03;
        const grad = ctx.createLinearGradient(-w * 0.5, -h * 0.5, w * 0.5, h * 0.5);
        grad.addColorStop(0, '#f6ebd5');
        grad.addColorStop(0.6, '#e7d1a8');
        grad.addColorStop(1, '#cba979');

        ctx.fillStyle = 'rgba(10, 8, 22, 0.32)';
        ctx.beginPath();
        ctx.moveTo(-w * 0.48 + unit * 0.007, -h * 0.48 + unit * 0.01);
        ctx.quadraticCurveTo(0, -h * 0.5 + curl, w * 0.5 + unit * 0.007, -h * 0.46 + unit * 0.01);
        ctx.lineTo(w * 0.48 + unit * 0.007, h * 0.5 + unit * 0.01);
        ctx.quadraticCurveTo(0, h * 0.48 - curl, -w * 0.5 + unit * 0.007, h * 0.48 + unit * 0.01);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-w * 0.48, -h * 0.48);
        ctx.quadraticCurveTo(0, -h * 0.5 + curl, w * 0.5, -h * 0.46);
        ctx.lineTo(w * 0.48, h * 0.5);
        ctx.quadraticCurveTo(0, h * 0.48 - curl, -w * 0.5, h * 0.48);
        ctx.closePath();
        ctx.fill();

        // Ornamental glowing ink lines (fading upward as if dissolving into light)
        for (let r = 0; r < 6; r++) {
          const ry = -h * 0.3 + r * h * 0.11;
          const rowAlpha = 0.22 + 0.18 * Math.sin(t * 1.6 + r * 0.8);
          ctx.strokeStyle = r < 2
            ? `rgba(218, 165, 86, ${rowAlpha + 0.2})`
            : `rgba(108, 76, 56, ${rowAlpha})`;
          ctx.lineWidth = Math.max(0.7, unit * 0.0017);
          ctx.beginPath();
          const rowWidth = w * (r === 5 ? 0.45 : 0.72);
          ctx.moveTo(-w * 0.36, ry);
          for (let seg = 0; seg < 8; seg++) {
            const sx = -w * 0.36 + ((seg + 1) / 8) * rowWidth;
            const sy = ry + Math.sin(seg * 2.4 + r * 1.7) * h * 0.016;
            ctx.quadraticCurveTo(sx - rowWidth / 16, ry - h * 0.018, sx, sy);
          }
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw a translucent, moth-like vellum wing
      function drawWing(side, flap, t, upper) {
        ctx.save();
        // side: -1 left/back, 1 right/front
        const scaleX = side * (upper ? 1 : 0.88) * (0.88 + 0.12 * Math.cos(flap));
        const angle = upper
          ? side * (-0.32 + Math.sin(flap) * 0.22)
          : side * (0.28 + Math.sin(flap - 0.55) * 0.18);

        ctx.rotate(angle);
        ctx.scale(scaleX, upper ? 1 : 0.92);

        const wLen = unit * (upper ? 0.36 : 0.27);
        const wSpan = unit * (upper ? 0.22 : 0.18);

        // Iridescent wing gradient
        const wingGrad = ctx.createRadialGradient(wLen * 0.28, -wSpan * 0.15, unit * 0.01, wLen * 0.45, 0, wLen * 1.05);
        wingGrad.addColorStop(0, 'rgba(248, 224, 178, 0.52)');
        wingGrad.addColorStop(0.42, 'rgba(176, 218, 232, 0.34)');
        wingGrad.addColorStop(0.78, 'rgba(180, 152, 226, 0.24)');
        wingGrad.addColorStop(1, 'rgba(242, 206, 158, 0.08)');

        ctx.beginPath();
        if (upper) {
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(wLen * 0.35, -wSpan * 1.05, wLen * 0.95, -wSpan * 1.05, wLen, -wSpan * 0.32);
          ctx.bezierCurveTo(wLen * 1.02, wSpan * 0.15, wLen * 0.65, wSpan * 0.48, 0, unit * 0.03);
        } else {
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(wLen * 0.55, -wSpan * 0.22, wLen * 0.96, wSpan * 0.18, wLen * 0.85, wSpan * 0.72);
          // Luna-moth swallowtail tip
          ctx.quadraticCurveTo(wLen * 0.92, wSpan * 1.15, wLen * 0.72, wSpan * 1.28);
          ctx.quadraticCurveTo(wLen * 0.62, wSpan * 0.92, wLen * 0.38, wSpan * 0.68);
          ctx.quadraticCurveTo(wLen * 0.15, wSpan * 0.45, 0, unit * 0.03);
        }
        ctx.closePath();
        ctx.fillStyle = wingGrad;
        ctx.fill();

        // Luminous edge highlight
        ctx.strokeStyle = 'rgba(248, 230, 192, 0.48)';
        ctx.lineWidth = Math.max(0.8, unit * 0.0022);
        ctx.stroke();

        // Calligraphic filigree veins
        ctx.strokeStyle = 'rgba(252, 232, 188, 0.28)';
        ctx.lineWidth = Math.max(0.5, unit * 0.0014);
        const veins = upper ? 4 : 3;
        for (let v = 0; v < veins; v++) {
          const vp = (v + 1) / (veins + 1);
          ctx.beginPath();
          ctx.moveTo(unit * 0.01, unit * 0.01);
          if (upper) {
            ctx.quadraticCurveTo(
              wLen * 0.45, -wSpan * (0.75 - vp * 0.6),
              wLen * (0.85 - vp * 0.15), -wSpan * (0.55 - vp * 0.75)
            );
          } else {
            ctx.quadraticCurveTo(
              wLen * 0.42, wSpan * (0.12 + vp * 0.32),
              wLen * (0.72 - vp * 0.12), wSpan * (0.25 + vp * 0.55)
            );
          }
          ctx.stroke();
        }

        // Faint crescent eyespot on upper wing
        if (upper) {
          const ex = wLen * 0.62;
          const ey = -wSpan * 0.25;
          const er = unit * 0.022;
          const spotGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 1.6);
          spotGlow.addColorStop(0, `rgba(255, 224, 152, ${0.42 + 0.15 * Math.sin(t * 2)})`);
          spotGlow.addColorStop(1, 'rgba(255, 224, 152, 0)');
          ctx.fillStyle = spotGlow;
          ctx.beginPath();
          ctx.arc(ex, ey, er * 1.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(248, 226, 178, 0.55)';
          ctx.lineWidth = Math.max(0.6, unit * 0.0014);
          ctx.beginPath();
          ctx.arc(ex, ey, er * 0.65, 0.2, Math.PI * 1.55);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw the Fairy of Unsent Letters
      function drawFairy(fx, fy, t, px, py) {
        ctx.save();
        ctx.translate(fx, fy);

        // Soft luminous aura behind the fairy
        const aura = ctx.createRadialGradient(0, -unit * 0.02, unit * 0.01, 0, -unit * 0.02, unit * 0.36);
        aura.addColorStop(0, 'rgba(218, 232, 255, 0.22)');
        aura.addColorStop(0.45, 'rgba(182, 168, 235, 0.10)');
        aura.addColorStop(1, 'rgba(20, 22, 48, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, -unit * 0.02, unit * 0.36, 0, Math.PI * 2);
        ctx.fill();

        const sway = Math.sin(t * 0.9) * 0.045 + px * 0.03;
        const wingFlap = t * 2.15;

        // Back pair of wings (further from viewer, facing right/up)
        ctx.save();
        ctx.translate(unit * 0.025, -unit * 0.065);
        ctx.rotate(sway * 0.5);
        drawWing(1, wingFlap + 0.35, t, true);
        drawWing(1, wingFlap + 0.35, t, false);
        ctx.restore();

        // Trailing gossamer ribbons behind body
        for (let r = 0; r < 2; r++) {
          const wave1 = Math.sin(t * 1.4 + r * 1.7) * unit * 0.035;
          const wave2 = Math.cos(t * 1.1 + r * 2.1) * unit * 0.045;
          const ribGrad = ctx.createLinearGradient(0, 0, unit * 0.15, unit * 0.32);
          ribGrad.addColorStop(0, 'rgba(222, 206, 245, 0.42)');
          ribGrad.addColorStop(1, 'rgba(248, 212, 152, 0.0)');
          ctx.strokeStyle = ribGrad;
          ctx.lineWidth = unit * (0.016 - r * 0.004);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(unit * 0.01, -unit * 0.02);
          ctx.bezierCurveTo(
            unit * (0.08 + r * 0.03) + wave1, unit * 0.1,
            unit * (0.04 + r * 0.05) + wave2, unit * 0.22,
            unit * (0.14 + r * 0.04) + wave1, unit * 0.33
          );
          ctx.stroke();
        }

        // Body inclination (tilted gracefully toward the letters on the lower-left)
        ctx.save();
        ctx.rotate(sway - 0.14);

        // Slender legs floating gracefully
        const legTone = ctx.createLinearGradient(0, unit * 0.06, -unit * 0.04, unit * 0.26);
        legTone.addColorStop(0, '#c8c4dc');
        legTone.addColorStop(1, '#9894b8');
        ctx.strokeStyle = legTone;
        ctx.lineCap = 'round';

        // Back leg
        ctx.lineWidth = unit * 0.017;
        ctx.beginPath();
        ctx.moveTo(unit * 0.012, unit * 0.075);
        ctx.quadraticCurveTo(-unit * 0.01, unit * 0.165, unit * 0.045, unit * 0.245 + Math.sin(t * 1.2) * unit * 0.008);
        ctx.stroke();

        // Front leg
        ctx.lineWidth = unit * 0.019;
        ctx.beginPath();
        ctx.moveTo(-unit * 0.01, unit * 0.075);
        ctx.quadraticCurveTo(-unit * 0.048, unit * 0.16, -unit * 0.018, unit * 0.255 + Math.cos(t * 1.2) * unit * 0.008);
        ctx.stroke();

        // Layered translucent gossamer dress / petal skirt
        const skirtWave = Math.sin(t * 1.5) * unit * 0.016;
        const dressGrad = ctx.createLinearGradient(-unit * 0.05, -unit * 0.06, unit * 0.08, unit * 0.18);
        dressGrad.addColorStop(0, 'rgba(232, 224, 248, 0.92)');
        dressGrad.addColorStop(0.45, 'rgba(154, 152, 214, 0.78)');
        dressGrad.addColorStop(1, 'rgba(244, 206, 156, 0.22)');

        ctx.fillStyle = dressGrad;
        ctx.beginPath();
        ctx.moveTo(-unit * 0.022, -unit * 0.055);
        ctx.quadraticCurveTo(-unit * 0.032, unit * 0.02, -unit * 0.095 + skirtWave, unit * 0.165);
        ctx.quadraticCurveTo(-unit * 0.03, unit * 0.145, -unit * 0.005, unit * 0.185);
        ctx.quadraticCurveTo(unit * 0.035, unit * 0.14, unit * 0.088 + skirtWave * 0.7, unit * 0.165);
        ctx.quadraticCurveTo(unit * 0.04, unit * 0.02, unit * 0.024, -unit * 0.055);
        ctx.closePath();
        ctx.fill();

        // Subtle golden trim along dress hem
        ctx.strokeStyle = 'rgba(250, 218, 158, 0.45)';
        ctx.lineWidth = Math.max(0.7, unit * 0.0018);
        ctx.stroke();

        // Torso & neck
        const skinGrad = ctx.createLinearGradient(-unit * 0.03, -unit * 0.14, unit * 0.03, -unit * 0.03);
        skinGrad.addColorStop(0, '#eee8f5');
        skinGrad.addColorStop(1, '#c9c2de');

        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.moveTo(-unit * 0.022, -unit * 0.055);
        ctx.quadraticCurveTo(-unit * 0.025, -unit * 0.095, -unit * 0.01, -unit * 0.115);
        ctx.lineTo(unit * 0.012, -unit * 0.115);
        ctx.quadraticCurveTo(unit * 0.026, -unit * 0.095, unit * 0.022, -unit * 0.055);
        ctx.closePath();
        ctx.fill();

        // Back arm reaching gently backward for balance
        ctx.strokeStyle = '#c5bedc';
        ctx.lineWidth = unit * 0.011;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(unit * 0.018, -unit * 0.092);
        ctx.quadraticCurveTo(unit * 0.065, -unit * 0.055, unit * 0.092, -unit * 0.015 + Math.sin(t * 1.3) * unit * 0.008);
        ctx.stroke();

        // Front arm extended softly toward the rising ink-light from the letters
        const handX = -unit * 0.135;
        const handY = -unit * 0.02 + Math.sin(t * 1.4) * unit * 0.009;
        ctx.strokeStyle = '#ece6f6';
        ctx.lineWidth = unit * 0.012;
        ctx.beginPath();
        ctx.moveTo(-unit * 0.018, -unit * 0.092);
        ctx.quadraticCurveTo(-unit * 0.075, -unit * 0.065, handX, handY);
        ctx.stroke();

        // Warm golden light reflected on extended fingertips
        const fingerGlow = ctx.createRadialGradient(handX, handY, 0, handX, handY, unit * 0.035);
        fingerGlow.addColorStop(0, 'rgba(255, 220, 148, 0.55)');
        fingerGlow.addColorStop(1, 'rgba(255, 220, 148, 0)');
        ctx.fillStyle = fingerGlow;
        ctx.beginPath();
        ctx.arc(handX, handY, unit * 0.035, 0, Math.PI * 2);
        ctx.fill();

        // Head & slow contemplative turn/nod
        ctx.save();
        ctx.translate(-unit * 0.004, -unit * 0.138);
        const headTilt = -0.18 + Math.sin(t * 0.65) * 0.08 + py * 0.05;
        ctx.rotate(headTilt);

        // Flowing twilight hair behind head
        const hairWave = Math.sin(t * 1.25) * unit * 0.025;
        const hairGrad = ctx.createLinearGradient(0, -unit * 0.05, unit * 0.14, unit * 0.16);
        hairGrad.addColorStop(0, '#22234a');
        hairGrad.addColorStop(0.55, '#3b3c72');
        hairGrad.addColorStop(1, 'rgba(130, 142, 206, 0.35)');
        ctx.fillStyle = hairGrad;

        ctx.beginPath();
        ctx.moveTo(-unit * 0.022, -unit * 0.028);
        ctx.bezierCurveTo(unit * 0.045, -unit * 0.065, unit * 0.11, -unit * 0.01 + hairWave, unit * 0.145, unit * 0.085 + hairWave);
        ctx.bezierCurveTo(unit * 0.105, unit * 0.095 + hairWave * 0.5, unit * 0.065, unit * 0.07, unit * 0.015, unit * 0.022);
        ctx.closePath();
        ctx.fill();

        // Delicate fairy ear
        ctx.fillStyle = '#ddd7ee';
        ctx.beginPath();
        ctx.moveTo(unit * 0.01, -unit * 0.004);
        ctx.lineTo(unit * 0.048, -unit * 0.016);
        ctx.lineTo(unit * 0.016, unit * 0.008);
        ctx.closePath();
        ctx.fill();

        // Face (soft three-quarter profile facing left/down toward letters)
        ctx.fillStyle = '#eee8f8';
        ctx.beginPath();
        ctx.ellipse(-unit * 0.004, 0, unit * 0.027, unit * 0.034, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Warm rim light on cheek/chin from the letters
        const cheekGlow = ctx.createLinearGradient(-unit * 0.03, 0, unit * 0.01, 0);
        cheekGlow.addColorStop(0, 'rgba(255, 214, 152, 0.42)');
        cheekGlow.addColorStop(1, 'rgba(255, 214, 152, 0)');
        ctx.fillStyle = cheekGlow;
        ctx.beginPath();
        ctx.ellipse(-unit * 0.012, unit * 0.004, unit * 0.018, unit * 0.024, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Serene lowered eyelash / gentle gaze
        ctx.strokeStyle = '#2c294f';
        ctx.lineWidth = Math.max(0.8, unit * 0.002);
        ctx.beginPath();
        ctx.arc(-unit * 0.015, -unit * 0.002, unit * 0.007, 0.2, Math.PI - 0.1);
        ctx.stroke();

        // Hair crown & framing lock
        ctx.fillStyle = '#252750';
        ctx.beginPath();
        ctx.arc(unit * 0.003, -unit * 0.012, unit * 0.029, Math.PI * 0.92, Math.PI * 2.15);
        ctx.quadraticCurveTo(unit * 0.032, unit * 0.015, unit * 0.015, unit * 0.02);
        ctx.quadraticCurveTo(0, -unit * 0.012, -unit * 0.025, -unit * 0.008);
        ctx.closePath();
        ctx.fill();

        // Silver-gold hair highlights
        ctx.strokeStyle = 'rgba(220, 224, 255, 0.45)';
        ctx.lineWidth = Math.max(0.6, unit * 0.0014);
        ctx.beginPath();
        ctx.moveTo(0, -unit * 0.034);
        ctx.quadraticCurveTo(unit * 0.055, -unit * 0.028, unit * 0.11, unit * 0.045 + hairWave * 0.7);
        ctx.stroke();

        ctx.restore(); // end head
        ctx.restore(); // end body

        // Front pair of wings (translucent so body shows gracefully beneath)
        ctx.save();
        ctx.translate(unit * 0.01, -unit * 0.068);
        ctx.rotate(sway * 0.5 - 0.12);
        drawWing(1, wingFlap, t, true);
        drawWing(1, wingFlap, t, false);
        ctx.restore();

        ctx.restore();
      }

      // Main animation loop
      function render(now) {
        const t = now * 0.001;

        // Smooth pointer inertia
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // 1. Static twilight backdrop
        ctx.drawImage(bgCanvas, 0, 0, width, height);

        // 2. Twinkling distant stars
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
          ctx.fillStyle = `rgba(226, 236, 255, ${s.alpha * tw})`;
          ctx.beginPath();
          ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Soft diagonal shafts of moonlight
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const rayGrad = ctx.createLinearGradient(width * 0.85, 0, width * 0.2, height * 0.85);
        rayGrad.addColorStop(0, 'rgba(155, 198, 238, 0.075)');
        rayGrad.addColorStop(0.55, 'rgba(165, 180, 230, 0.035)');
        rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(width * 0.48, 0);
        ctx.lineTo(width * 0.95, 0);
        ctx.lineTo(width * 0.45, height);
        ctx.lineTo(0, height * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 4. Unsent Letters cluster (lower left — distinct and separate from the fairy)
        const lx = cx - unit * 0.17 + pointer.x * unit * 0.008;
        const ly = cy + unit * 0.34 + pointer.y * unit * 0.006;

        // Distant floating sealed letter behind
        drawEnvelope(
          lx - unit * 0.13,
          ly - unit * 0.13 + Math.sin(t * 0.85 + 1.4) * unit * 0.012,
          unit * 0.16,
          unit * 0.105,
          -0.28 + Math.sin(t * 0.5) * 0.03,
          { openFlap: 0, hasSeal: true, sealBroken: false, glowIntensity: 0.25, opacity: 0.78 }
        );

        // Floating half-unfolded letter above the main envelope
        drawOpenLetter(
          lx + unit * 0.05,
          ly - unit * 0.16 + Math.sin(t * 0.95 + 0.6) * unit * 0.014,
          unit * 0.175,
          unit * 0.21,
          0.14 + Math.cos(t * 0.55) * 0.035,
          t
        );

        // Trailing crimson-gold silk ribbon curling around the main envelope
        ctx.save();
        ctx.strokeStyle = 'rgba(176, 56, 74, 0.62)';
        ctx.lineWidth = Math.max(1.2, unit * 0.0045);
        ctx.lineCap = 'round';
        const rWave = Math.sin(t * 1.1) * unit * 0.015;
        ctx.beginPath();
        ctx.moveTo(lx - unit * 0.16, ly + unit * 0.06);
        ctx.bezierCurveTo(
          lx - unit * 0.06, ly + unit * 0.12 + rWave,
          lx + unit * 0.08, ly + unit * 0.08 - rWave,
          lx + unit * 0.18, ly + unit * 0.13 + rWave * 0.5
        );
        ctx.stroke();
        ctx.restore();

        // Main foreground envelope (partially unsealed, emitting warm ink-light)
        const mainBob = Math.sin(t * 0.9) * unit * 0.011;
        drawEnvelope(
          lx,
          ly + mainBob,
          unit * 0.26,
          unit * 0.17,
          -0.11 + Math.sin(t * 0.45) * 0.025,
          { openFlap: 0.62, hasSeal: true, sealBroken: true, glowIntensity: 1.0, opacity: 1 }
        );

        // 5. Golden ink-filaments & sparks rising from the open letter toward the fairy
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const fairyX = cx + unit * 0.14 + Math.sin(t * 0.75) * unit * 0.015 - pointer.x * unit * 0.012;
        const fairyY = cy - unit * 0.11 + Math.sin(t * 1.05 + 0.4) * unit * 0.022 - pointer.y * unit * 0.01;

        for (let i = 0; i < inkSparks.length; i++) {
          const sp = inkSparks[i];
          const progress = (t * 0.11 + sp.offset) % 1;
          const ease = progress * (2 - progress);
          const startX = lx + unit * 0.01;
          const startY = ly + mainBob - unit * 0.04;
          const targetX = fairyX - unit * 0.12;
          const targetY = fairyY - unit * 0.02;

          const px = startX + (targetX - startX) * progress
            + Math.sin(progress * Math.PI * sp.freq + t * 1.4 + sp.phase) * unit * sp.sway;
          const py = startY + (targetY - startY) * ease - progress * unit * 0.04;

          const alpha = Math.sin(progress * Math.PI) * 0.72;
          const r = unit * sp.size * (0.6 + 0.6 * Math.sin(progress * Math.PI));

          const sg = ctx.createRadialGradient(px, py, 0, px, py, r * 3.2);
          sg.addColorStop(0, `rgba(255, 232, 165, ${alpha})`);
          sg.addColorStop(0.5, `rgba(244, 178, 95, ${alpha * 0.45})`);
          sg.addColorStop(1, 'rgba(244, 178, 95, 0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(px, py, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 6. The Fairy (hovering nearby in upper-right space, separate from the letters)
        drawFairy(fairyX, fairyY, t, pointer.x, pointer.y);

        // 7. Ambient drifting motes across the whole card
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < motes.length; i++) {
          const m = motes[i];
          const yNorm = (m.y - t * m.speedY) % 1;
          const my = (yNorm < 0 ? yNorm + 1 : yNorm) * height;
          const mx = (m.x + Math.sin(t * 0.6 + m.phase) * m.drift) * width + pointer.x * unit * 0.015;
          const mr = unit * m.r;
          const pulse = 0.55 + 0.45 * Math.sin(t * 1.8 + m.phase);

          const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 3.5);
          if (m.warm) {
            mg.addColorStop(0, `rgba(255, 226, 162, ${m.alpha * pulse})`);
            mg.addColorStop(1, 'rgba(255, 200, 120, 0)');
          } else {
            mg.addColorStop(0, `rgba(182, 224, 255, ${m.alpha * pulse * 0.85})`);
            mg.addColorStop(1, 'rgba(150, 200, 255, 0)');
          }
          ctx.fillStyle = mg;
          ctx.beginPath();
          ctx.arc(mx, my, mr * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
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
  "title": "The Fairy of Unsent Letters",
  "statement": "Unspoken truths linger softly, waiting for courage to break the seal."
}
```