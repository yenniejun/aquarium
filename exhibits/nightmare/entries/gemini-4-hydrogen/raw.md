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
  <canvas id="plate"></canvas>
  <script>
    (() => {
      const canvas = document.getElementById('plate');
      const ctx = canvas.getContext('2d');

      const W = 600;
      const H = 800;

      let viewW = 0;
      let viewH = 0;
      let dpr = 1;
      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;

      // Deterministic PRNG for organic hand-drawn consistency
      function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
          a |= 0;
          a = (a + 0x6D2B79F5) | 0;
          let t = Math.imul(a ^ (a >>> 15), 1 | a);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function clamp(v, min, max) {
        return v < min ? min : v > max ? max : v;
      }

      function smoothstep(edge0, edge1, x) {
        const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
      }

      // Draw a polygon path smoothly with Catmull-Rom / quadratic midpoints
      function traceSmoothPoly(c, pts, closed = true) {
        if (pts.length < 2) return;
        c.beginPath();
        if (closed) {
          const mx0 = (pts[pts.length - 1][0] + pts[0][0]) * 0.5;
          const my0 = (pts[pts.length - 1][1] + pts[0][1]) * 0.5;
          c.moveTo(mx0, my0);
          for (let i = 0; i < pts.length; i++) {
            const p0 = pts[i];
            const p1 = pts[(i + 1) % pts.length];
            const mx = (p0[0] + p1[0]) * 0.5;
            const my = (p0[1] + p1[1]) * 0.5;
            c.quadraticCurveTo(p0[0], p0[1], mx, my);
          }
          c.closePath();
        } else {
          c.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i][0] + pts[i + 1][0]) * 0.5;
            const my = (pts[i][1] + pts[i + 1][1]) * 0.5;
            c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
          }
          const last = pts[pts.length - 1];
          c.lineTo(last[0], last[1]);
        }
      }

      // Hand-drawn watercolor wash with layered organic blooms and pigment edge pooling
      function drawWatercolorShape(c, pts, options) {
        const {
          fill = 'rgba(120, 110, 95, 0.22)',
          edgeColor = 'rgba(55, 42, 34, 0.25)',
          highlight = null,
          layers = 4,
          jitter = 3.5,
          seed = 101
        } = options;
        const rand = mulberry32(seed);

        c.save();
        for (let l = 0; l < layers; l++) {
          const jPts = pts.map(([x, y]) => [
            x + (rand() - 0.5) * jitter * (1 + l * 0.35),
            y + (rand() - 0.5) * jitter * (1 + l * 0.35)
          ]);
          traceSmoothPoly(c, jPts, true);
          c.fillStyle = fill;
          c.fill();
          if (l === layers - 1) {
            c.strokeStyle = edgeColor;
            c.lineWidth = 1.1;
            c.stroke();
          }
        }
        if (highlight) {
          c.save();
          traceSmoothPoly(c, pts, true);
          c.clip();
          c.fillStyle = highlight;
          c.fillRect(-1000, -1000, 2500, 2500);
          c.restore();
        }
        c.restore();
      }

      // Scratchy dip-pen ink line with organic wobble and dry-brush secondary stroke
      function drawInkStroke(c, pts, options = {}) {
        const {
          color = 'rgba(36, 26, 20, 0.88)',
          width = 1.6,
          jitter = 1.1,
          closed = false,
          doublePass = true,
          seed = 42
        } = options;
        const rand = mulberry32(seed);

        const passes = doublePass ? 2 : 1;
        for (let p = 0; p < passes; p++) {
          const jPts = pts.map(([x, y]) => [
            x + (rand() - 0.5) * jitter * (p === 0 ? 0.6 : 1.4),
            y + (rand() - 0.5) * jitter * (p === 0 ? 0.6 : 1.4)
          ]);
          traceSmoothPoly(c, jPts, closed);
          c.strokeStyle = color;
          c.lineWidth = p === 0 ? width : Math.max(0.55, width * 0.55);
          c.globalAlpha = p === 0 ? 1 : 0.42;
          c.lineCap = 'round';
          c.lineJoin = 'round';
          c.stroke();
        }
        c.globalAlpha = 1;
      }

      // Fine ink cross-hatching inside a clipped area or along a band
      function drawCrossHatch(c, cx, cy, rx, ry, angle, spacing, length, seed, color = 'rgba(38, 28, 22, 0.32)') {
        const rand = mulberry32(seed);
        c.save();
        c.translate(cx, cy);
        c.rotate(angle);
        c.strokeStyle = color;
        c.lineWidth = 0.75;
        c.lineCap = 'round';
        for (let x = -rx; x <= rx; x += spacing) {
          for (let y = -ry; y <= ry; y += length * 0.85) {
            if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1) continue;
            if (rand() < 0.25) continue;
            const xOff = (rand() - 0.5) * 2;
            const yOff = (rand() - 0.5) * 2;
            const len = length * (0.65 + rand() * 0.55);
            c.beginPath();
            c.moveTo(x + xOff, y + yOff);
            c.quadraticCurveTo(
              x + xOff + (rand() - 0.5) * 2.5,
              y + yOff + len * 0.5,
              x + xOff + (rand() - 0.5) * 1.5,
              y + yOff + len
            );
            c.stroke();
          }
        }
        c.restore();
      }

      // Stipple dots for organic bone/bark/moss texture
      function drawStipple(c, cx, cy, rx, ry, count, seed, color = 'rgba(42, 32, 24, 0.38)') {
        const rand = mulberry32(seed);
        c.fillStyle = color;
        for (let i = 0; i < count; i++) {
          const a = rand() * Math.PI * 2;
          const r = Math.sqrt(rand());
          const x = cx + Math.cos(a) * rx * r;
          const y = cy + Math.sin(a) * ry * r;
          const sz = 0.55 + rand() * 1.1;
          c.beginPath();
          c.arc(x, y, sz, 0, Math.PI * 2);
          c.fill();
        }
      }

      // Offscreen cache for heavy static watercolor + ink plates
      function makeOffscreen(w, h, drawFn) {
        const oc = document.createElement('canvas');
        const scaleFactor = 2;
        oc.width = w * scaleFactor;
        oc.height = h * scaleFactor;
        const octx = oc.getContext('2d');
        octx.scale(scaleFactor, scaleFactor);
        drawFn(octx);
        return { canvas: oc, w, h };
      }

      // 1. Gnarled mossy branch plate (static rich watercolor + ink)
      const branchPlate = makeOffscreen(600, 800, (c) => {
        // Main sweeping bog-oak branch
        const mainPts = [
          [22, 682], [95, 650], [185, 622], [285, 594],
          [395, 566], [485, 534], [556, 492], [562, 502],
          [502, 545], [412, 582], [305, 616], [195, 648],
          [102, 676], [28, 704]
        ];
        // Forked dead twig rising right
        const twigPts = [
          [416, 568], [452, 524], [486, 476], [512, 434],
          [518, 438], [496, 484], [462, 535], [432, 574]
        ];
        // Lower broken stub left
        const stubPts = [
          [148, 636], [122, 606], [96, 578], [88, 584],
          [110, 614], [130, 646]
        ];
        // Hanging rootlet / bark strip
        const rootPts = [
          [212, 642], [206, 678], [194, 718], [202, 720],
          [216, 682], [225, 642]
        ];

        // Soft fade mask at extreme left/right ends
        drawWatercolorShape(c, mainPts, {
          fill: 'rgba(84, 68, 52, 0.24)',
          edgeColor: 'rgba(42, 32, 24, 0.34)',
          layers: 4,
          jitter: 3.2,
          seed: 301
        });
        drawWatercolorShape(c, twigPts, {
          fill: 'rgba(78, 62, 48, 0.22)',
          edgeColor: 'rgba(42, 32, 24, 0.3)',
          layers: 3,
          jitter: 2.2,
          seed: 302
        });
        drawWatercolorShape(c, stubPts, {
          fill: 'rgba(88, 72, 56, 0.22)',
          edgeColor: 'rgba(42, 32, 24, 0.28)',
          layers: 3,
          jitter: 2.0,
          seed: 303
        });
        drawWatercolorShape(c, rootPts, {
          fill: 'rgba(72, 58, 44, 0.2)',
          edgeColor: 'rgba(38, 28, 22, 0.25)',
          layers: 2,
          jitter: 1.5,
          seed: 304
        });

        // Moss & pale lichen patches on bark
        const mossPatches = [
          [[150, 634], [176, 620], [204, 624], [195, 642], [160, 644]],
          [[315, 588], [348, 576], [372, 582], [358, 598], [322, 598]],
          [[422, 558], [448, 544], [468, 550], [452, 566], [428, 568]]
        ];
        mossPatches.forEach((mp, idx) => {
          drawWatercolorShape(c, mp, {
            fill: 'rgba(104, 118, 78, 0.26)',
            edgeColor: 'rgba(65, 76, 48, 0.3)',
            layers: 3,
            jitter: 2.5,
            seed: 400 + idx
          });
          const cx = mp.reduce((s, p) => s + p[0], 0) / mp.length;
          const cy = mp.reduce((s, p) => s + p[1], 0) / mp.length;
          drawStipple(c, cx, cy, 20, 10, 28, 450 + idx, 'rgba(54, 66, 38, 0.45)');
        });

        // Tiny shelf fungi on the branch
        const fungi = [
          [[222, 638], [244, 634], [252, 644], [232, 648]],
          [[236, 644], [258, 642], [262, 650], [242, 652]],
          [[434, 570], [454, 566], [460, 576], [440, 578]]
        ];
        fungi.forEach((fp, idx) => {
          drawWatercolorShape(c, fp, {
            fill: 'rgba(205, 186, 152, 0.34)',
            edgeColor: 'rgba(64, 48, 36, 0.4)',
            layers: 2,
            jitter: 1.2,
            seed: 500 + idx
          });
          drawInkStroke(c, fp, {
            color: 'rgba(42, 30, 22, 0.72)',
            width: 1.0,
            closed: true,
            doublePass: false,
            seed: 520 + idx
          });
        });

        // Bark grain ink lines and underside cross-hatching
        drawInkStroke(c, mainPts.slice(0, 7), {
          color: 'rgba(36, 26, 20, 0.85)',
          width: 1.6,
          jitter: 1.4,
          seed: 601
        });
        drawInkStroke(c, mainPts.slice(7), {
          color: 'rgba(36, 26, 20, 0.9)',
          width: 1.9,
          jitter: 1.4,
          seed: 602
        });
        drawInkStroke(c, twigPts, {
          color: 'rgba(36, 26, 20, 0.75)',
          width: 1.3,
          jitter: 1.1,
          closed: false,
          seed: 603
        });
        drawInkStroke(c, stubPts, {
          color: 'rgba(36, 26, 20, 0.78)',
          width: 1.3,
          jitter: 1.1,
          seed: 604
        });
        drawInkStroke(c, rootPts, {
          color: 'rgba(36, 26, 20, 0.7)',
          width: 1.1,
          jitter: 1.0,
          seed: 605
        });

        // Bark fissures
        const fissures = [
          [[76, 668], [136, 646], [190, 634]],
          [[210, 636], [275, 614], [342, 594]],
          [[360, 586], [420, 566], [488, 538]],
          [[142, 650], [218, 628]],
          [[310, 608], [388, 584]]
        ];
        fissures.forEach((f, idx) => {
          drawInkStroke(c, f, {
            color: 'rgba(42, 30, 22, 0.58)',
            width: 0.95,
            jitter: 1.3,
            doublePass: false,
            seed: 630 + idx
          });
        });

        drawCrossHatch(c, 160, 648, 85, 11, -0.28, 4.5, 9, 701);
        drawCrossHatch(c, 330, 600, 95, 11, -0.28, 4.5, 9, 702);
        drawCrossHatch(c, 465, 552, 55, 9, -0.35, 4.5, 8, 703);

        // Soft fade at far ends of the branch so it dissolves organically into the page
        c.save();
        c.globalCompositeOperation = 'destination-out';
        const gL = c.createLinearGradient(15, 0, 88, 0);
        gL.addColorStop(0, 'rgba(0,0,0,1)');
        gL.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gL;
        c.fillRect(0, 550, 95, 220);

        const gR = c.createLinearGradient(505, 0, 575, 0);
        gR.addColorStop(0, 'rgba(0,0,0,0)');
        gR.addColorStop(1, 'rgba(0,0,0,1)');
        c.fillStyle = gR;
        c.fillRect(500, 410, 90, 220);
        c.restore();
      });

      // 2. Ribcage & Spine Torso plate (centered around anchor (300, 385))
      const torsoPlate = makeOffscreen(260, 260, (c) => {
        c.translate(130, 130); // local (0,0) corresponds to (305, 385)

        // Dark shadowy thoracic cavity behind the ribs
        const cavityPts = [
          [-42, -62], [8, -72], [46, -42], [56, 8],
          [38, 62], [-4, 68], [-44, 34], [-54, -18]
        ];
        drawWatercolorShape(c, cavityPts, {
          fill: 'rgba(48, 38, 44, 0.28)',
          edgeColor: 'rgba(34, 24, 28, 0.34)',
          layers: 4,
          jitter: 3.5,
          seed: 801
        });
        drawCrossHatch(c, 6, 0, 38, 48, 0.4, 4.2, 12, 802, 'rgba(30, 22, 24, 0.36)');

        // Hunched dorsal spine ridge (from shoulder (-38,-72) arching right to pelvis (30,70))
        const spinePts = [
          [-44, -70], [-14, -76], [24, -64], [52, -32],
          [60, 12], [48, 52], [32, 74], [18, 68],
          [34, 42], [42, 8], [34, -26], [12, -50],
          [-18, -58], [-42, -52]
        ];
        drawWatercolorShape(c, spinePts, {
          fill: 'rgba(205, 192, 168, 0.35)',
          edgeColor: 'rgba(54, 42, 34, 0.35)',
          layers: 3,
          jitter: 2.0,
          seed: 805
        });
        drawInkStroke(c, spinePts, {
          color: 'rgba(34, 24, 18, 0.88)',
          width: 1.5,
          closed: true,
          jitter: 1.0,
          seed: 806
        });

        // Vertebral dorsal thorns sticking out along the hunched back
        const dorsalSpines = [
          [[-6, -74], [2, -94], [12, -70]],
          [[24, -64], [42, -82], [38, -54]],
          [[48, -36], [70, -48], [56, -20]],
          [[58, -4], [80, -8], [60, 12]],
          [[54, 28], [72, 34], [48, 44]]
        ];
        dorsalSpines.forEach((sp, i) => {
          drawWatercolorShape(c, sp, {
            fill: 'rgba(196, 180, 154, 0.36)',
            edgeColor: 'rgba(42, 32, 24, 0.45)',
            layers: 2,
            jitter: 1.0,
            seed: 820 + i
          });
          drawInkStroke(c, sp, {
            color: 'rgba(34, 24, 18, 0.85)',
            width: 1.2,
            closed: false,
            seed: 830 + i
          });
        });

        // Curved pale ribs wrapping forward from spine toward sternum
        const ribs = [
          // [start spine, mid curve, tip sternum]
          [[-20, -56], [-48, -40], [-52, -16]],
          [[8, -48], [-32, -26], [-56, 2]],
          [[26, -32], [-18, -6], [-52, 20]],
          [[36, -12], [-8, 12], [-44, 38]],
          [[38, 10], [2, 30], [-30, 52]],
          [[34, 32], [10, 48], [-12, 62]]
        ];
        ribs.forEach((r, idx) => {
          const ribPoly = [
            [r[0][0], r[0][1] - 4],
            [r[1][0] - 2, r[1][1] - 5],
            [r[2][0], r[2][1] - 2],
            [r[2][0] + 2, r[2][1] + 4],
            [r[1][0] + 2, r[1][1] + 3],
            [r[0][0], r[0][1] + 4]
          ];
          drawWatercolorShape(c, ribPoly, {
            fill: 'rgba(222, 210, 186, 0.42)',
            edgeColor: 'rgba(48, 36, 28, 0.45)',
            layers: 3,
            jitter: 1.2,
            seed: 850 + idx
          });
          drawInkStroke(c, [ribPoly[0], ribPoly[1], ribPoly[2]], {
            color: 'rgba(34, 24, 18, 0.88)',
            width: 1.35,
            jitter: 0.9,
            seed: 870 + idx
          });
          drawInkStroke(c, [ribPoly[3], ribPoly[4], ribPoly[5]], {
            color: 'rgba(34, 24, 18, 0.65)',
            width: 1.0,
            jitter: 0.9,
            doublePass: false,
            seed: 890 + idx
          });
        });

        // Sternum ridge
        const sternum = [[-54, -22], [-58, 2], [-48, 34], [-26, 56]];
        drawInkStroke(c, sternum, {
          color: 'rgba(36, 26, 20, 0.85)',
          width: 1.8,
          jitter: 1.1,
          seed: 910
        });
        drawStipple(c, 22, -10, 26, 54, 45, 920, 'rgba(44, 34, 26, 0.32)');
      });

      // 3. Tattered Shroud / Moth-Wing Membrane plate (pivot at shoulder (0,0))
      const wingPlate = makeOffscreen(260, 260, (c) => {
        c.translate(45, 45);
        const wingPts = [
          [0, 0], [52, -18], [116, 12], [164, 62],
          [182, 118], [150, 108], [142, 152], [112, 132],
          [98, 174], [72, 146], [56, 168], [32, 122],
          [16, 72]
        ];
        drawWatercolorShape(c, wingPts, {
          fill: 'rgba(54, 52, 66, 0.24)',
          edgeColor: 'rgba(32, 28, 38, 0.38)',
          layers: 4,
          jitter: 2.8,
          seed: 1001
        });
        // Secondary bruised indigo/umber wash
        const innerWash = [
          [12, 10], [72, 18], [134, 64], [112, 118], [58, 110], [24, 60]
        ];
        drawWatercolorShape(c, innerWash, {
          fill: 'rgba(72, 56, 58, 0.18)',
          edgeColor: 'rgba(42, 32, 34, 0.22)',
          layers: 2,
          jitter: 2.5,
          seed: 1002
        });

        // Moth-eaten holes inside membrane
        const holes = [
          [[74, 52], [86, 46], [92, 58], [78, 64]],
          [[108, 86], [122, 82], [124, 96], [108, 98]],
          [[52, 92], [62, 88], [64, 100], [52, 102]]
        ];
        c.save();
        c.globalCompositeOperation = 'destination-out';
        holes.forEach((h) => {
          traceSmoothPoly(c, h, true);
          c.fillStyle = 'rgba(0,0,0,0.92)';
          c.fill();
        });
        c.restore();

        // Ink borders around holes
        holes.forEach((h, i) => {
          drawInkStroke(c, h, {
            color: 'rgba(34, 24, 20, 0.72)',
            width: 0.9,
            closed: true,
            doublePass: false,
            seed: 1020 + i
          });
        });

        // Wing quill-ribs & tattered ink outline
        const quills = [
          [[0, 0], [88, 22], [176, 114]],
          [[0, 0], [72, 54], [140, 148]],
          [[0, 0], [46, 78], [96, 170]],
          [[0, 0], [26, 86], [56, 162]]
        ];
        quills.forEach((q, i) => {
          drawInkStroke(c, q, {
            color: 'rgba(34, 24, 20, 0.78)',
            width: 1.25 - i * 0.12,
            jitter: 1.1,
            seed: 1040 + i
          });
        });
        drawInkStroke(c, wingPts, {
          color: 'rgba(32, 24, 20, 0.85)',
          width: 1.35,
          closed: true,
          jitter: 1.5,
          seed: 1060
        });
        drawCrossHatch(c, 68, 64, 48, 42, 0.6, 5.2, 10, 1070, 'rgba(34, 26, 24, 0.28)');
      });

      // 4. Skull Cranium & Upper Snout plate (pivot at neck-head joint (130, 80))
      const skullPlate = makeOffscreen(200, 150, (c) => {
        c.translate(125, 65); // local (0,0) = head joint; snout points left-down (-80, 42)

        const craniumPts = [
          [16, -24], [-8, -32], [-34, -22], [-56, -4],
          [-78, 18], [-90, 34], [-84, 44], [-64, 40],
          [-40, 30], [-14, 20], [10, 10], [22, -6]
        ];
        drawWatercolorShape(c, craniumPts, {
          fill: 'rgba(224, 212, 186, 0.45)',
          edgeColor: 'rgba(54, 42, 34, 0.42)',
          layers: 4,
          jitter: 1.8,
          seed: 1101
        });
        // Cheek & nasal shadow washes
        drawWatercolorShape(c, [[-34, -10], [-14, -12], [-4, 8], [-28, 16]], {
          fill: 'rgba(72, 58, 52, 0.22)',
          edgeColor: 'rgba(42, 32, 28, 0.25)',
          layers: 2,
          jitter: 1.4,
          seed: 1102
        });

        // Empty weeping eye socket
        const socketPts = [[-36, -6], [-22, -12], [-12, -2], [-20, 10], [-36, 6]];
        drawWatercolorShape(c, socketPts, {
          fill: 'rgba(28, 20, 22, 0.58)',
          edgeColor: 'rgba(24, 16, 16, 0.72)',
          layers: 3,
          jitter: 0.9,
          seed: 1104
        });
        // Weeping dark ink-tear stain down the cheek
        drawWatercolorShape(c, [[-32, 8], [-22, 8], [-34, 34], [-44, 32]], {
          fill: 'rgba(44, 34, 36, 0.24)',
          edgeColor: 'rgba(36, 26, 26, 0.2)',
          layers: 2,
          jitter: 1.1,
          seed: 1105
        });

        // Nostril slit
        drawWatercolorShape(c, [[-78, 24], [-68, 22], [-72, 30]], {
          fill: 'rgba(30, 22, 20, 0.6)',
          edgeColor: 'rgba(30, 22, 20, 0.7)',
          layers: 2,
          jitter: 0.5,
          seed: 1106
        });

        // Upper needle teeth along maxilla
        const teeth = [
          [[-80, 42], [-80, 50], [-75, 41]],
          [[-70, 40], [-71, 49], [-66, 39]],
          [[-60, 38], [-61, 46], [-56, 36]],
          [[-50, 34], [-52, 42], [-46, 32]],
          [[-40, 30], [-42, 37], [-36, 28]]
        ];
        teeth.forEach((t, i) => {
          drawWatercolorShape(c, t, {
            fill: 'rgba(232, 224, 204, 0.55)',
            edgeColor: 'rgba(42, 32, 24, 0.5)',
            layers: 1,
            jitter: 0.4,
            seed: 1120 + i
          });
          drawInkStroke(c, t, {
            color: 'rgba(34, 24, 18, 0.85)',
            width: 0.9,
            doublePass: false,
            seed: 1130 + i
          });
        });

        drawInkStroke(c, craniumPts, {
          color: 'rgba(34, 24, 18, 0.9)',
          width: 1.55,
          closed: true,
          jitter: 0.9,
          seed: 1140
        });
        drawInkStroke(c, socketPts, {
          color: 'rgba(26, 18, 16, 0.9)',
          width: 1.25,
          closed: true,
          jitter: 0.7,
          seed: 1141
        });
        // Temporal bone sutures
        drawInkStroke(c, [[-12, -26], [-4, -10], [8, 2]], {
          color: 'rgba(44, 32, 24, 0.55)',
          width: 0.85,
          doublePass: false,
          seed: 1142
        });
        drawCrossHatch(c, 4, -8, 16, 14, 0.5, 3.8, 7, 1145);
        drawStipple(c, -40, 12, 24, 12, 24, 1146);
      });

      // 5. Lower Jaw plate (hinge at (0,0), extends down-left to (-70, 30))
      const jawPlate = makeOffscreen(140, 90, (c) => {
        c.translate(105, 25);
        const jawPts = [
          [0, 0], [-14, 14], [-42, 26], [-72, 34],
          [-78, 28], [-64, 20], [-36, 12], [-10, 0]
        ];
        drawWatercolorShape(c, jawPts, {
          fill: 'rgba(212, 198, 172, 0.44)',
          edgeColor: 'rgba(48, 36, 28, 0.45)',
          layers: 3,
          jitter: 1.2,
          seed: 1201
        });
        const lowerTeeth = [
          [[-68, 22], [-72, 14], [-63, 21]],
          [[-56, 18], [-60, 11], [-51, 17]],
          [[-44, 14], [-48, 8], [-40, 13]]
        ];
        lowerTeeth.forEach((t, i) => {
          drawInkStroke(c, t, {
            color: 'rgba(34, 24, 18, 0.85)',
            width: 0.85,
            doublePass: false,
            seed: 1210 + i
          });
        });
        drawInkStroke(c, jawPts, {
          color: 'rgba(34, 24, 18, 0.88)',
          width: 1.35,
          closed: true,
          jitter: 0.8,
          seed: 1220
        });
      });

      // 6. Thorn Antlers plate (attached at skull crown (0,0))
      const antlerPlate = makeOffscreen(240, 180, (c) => {
        c.translate(80, 125); // local (0,0) = skull crown

        const branches = [
          // Left forward/upward crooked branch -> tip (-42, -74)
          [[0, 0], [-12, -26], [-28, -48], [-42, -74]],
          // Fork off left branch
          [[-18, -36], [-48, -32], [-64, -44]],
          // Main tall rear antler -> tip (48, -94)
          [[4, -2], [18, -34], [34, -64], [48, -94]],
          // Rear sweep fork -> tip (92, -46)
          [[24, -44], [58, -42], [92, -46]],
          // Mid thorn spur
          [[14, -28], [40, -18], [52, -26]]
        ];

        branches.forEach((b, idx) => {
          // Tapered bark wash around antler
          const poly = [];
          for (let i = 0; i < b.length; i++) {
            const w = (1 - i / b.length) * 3.8 + 0.9;
            poly.push([b[i][0] - w, b[i][1] - w * 0.5]);
          }
          for (let i = b.length - 1; i >= 0; i--) {
            const w = (1 - i / b.length) * 3.8 + 0.9;
            poly.push([b[i][0] + w, b[i][1] + w * 0.5]);
          }
          drawWatercolorShape(c, poly, {
            fill: 'rgba(64, 50, 42, 0.34)',
            edgeColor: 'rgba(34, 24, 18, 0.42)',
            layers: 2,
            jitter: 1.0,
            seed: 1300 + idx
          });
          drawInkStroke(c, b, {
            color: 'rgba(30, 22, 18, 0.92)',
            width: 2.3 - idx * 0.2,
            jitter: 1.0,
            seed: 1320 + idx
          });
        });

        // Sharp thorns along the antlers
        const thorns = [
          [[-8, -18], [-22, -16], [-10, -24]],
          [[12, -20], [2, -32], [16, -28]],
          [[30, -56], [22, -72], [35, -64]],
          [[52, -42], [58, -56], [62, -43]]
        ];
        thorns.forEach((th, i) => {
          drawInkStroke(c, th, {
            color: 'rgba(28, 20, 16, 0.9)',
            width: 1.1,
            doublePass: false,
            seed: 1350 + i
          });
        });
      });

      // Helper to draw a spindly articulated leg with ink + bone wash + talons
      function drawLeg(c, hip, knee, ankle, toes, breathOffset, seedBase, isBack = false) {
        const alphaScale = isBack ? 0.82 : 1;
        c.save();
        c.globalAlpha = alphaScale;

        // Upper thigh wash
        const thighDirX = knee[0] - hip[0];
        const thighDirY = knee[1] - hip[1];
        const tLen = Math.hypot(thighDirX, thighDirY) || 1;
        const tnx = -thighDirY / tLen;
        const tny = thighDirX / tLen;

        const thighPoly = [
          [hip[0] + tnx * 7, hip[1] + tny * 7],
          [lerp(hip[0], knee[0], 0.5) + tnx * 4.5, lerp(hip[1], knee[1], 0.5) + tny * 4.5],
          [knee[0] + tnx * 3, knee[1] + tny * 3],
          [knee[0] - tnx * 3, knee[1] - tny * 3],
          [lerp(hip[0], knee[0], 0.5) - tnx * 4.5, lerp(hip[1], knee[1], 0.5) - tny * 4.5],
          [hip[0] - tnx * 7, hip[1] - tny * 7]
        ];
        drawWatercolorShape(c, thighPoly, {
          fill: isBack ? 'rgba(130, 118, 102, 0.34)' : 'rgba(196, 182, 156, 0.42)',
          edgeColor: 'rgba(42, 32, 24, 0.42)',
          layers: 2,
          jitter: 1.1,
          seed: seedBase
        });

        // Lower shin / tarsus wash
        const shinDirX = ankle[0] - knee[0];
        const shinDirY = ankle[1] - knee[1];
        const sLen = Math.hypot(shinDirX, shinDirY) || 1;
        const snx = -shinDirY / sLen;
        const sny = shinDirX / sLen;

        const shinPoly = [
          [knee[0] + snx * 3.5, knee[1] + sny * 3.5],
          [ankle[0] + snx * 2.2, ankle[1] + sny * 2.2],
          [ankle[0] - snx * 2.2, ankle[1] - sny * 2.2],
          [knee[0] - snx * 3.5, knee[1] - sny * 3.5]
        ];
        drawWatercolorShape(c, shinPoly, {
          fill: isBack ? 'rgba(120, 108, 94, 0.34)' : 'rgba(176, 162, 138, 0.42)',
          edgeColor: 'rgba(42, 32, 24, 0.42)',
          layers: 2,
          jitter: 0.9,
          seed: seedBase + 1
        });

        // Ink contours for leg
        drawInkStroke(c, [thighPoly[0], thighPoly[1], thighPoly[2]], {
          color: 'rgba(32, 22, 18, 0.88)',
          width: 1.4,
          jitter: 0.7,
          doublePass: false,
          seed: seedBase + 2
        });
        drawInkStroke(c, [thighPoly[5], thighPoly[4], thighPoly[3]], {
          color: 'rgba(32, 22, 18, 0.88)',
          width: 1.4,
          jitter: 0.7,
          doublePass: false,
          seed: seedBase + 3
        });
        drawInkStroke(c, [shinPoly[0], shinPoly[1]], {
          color: 'rgba(32, 22, 18, 0.9)',
          width: 1.3,
          jitter: 0.6,
          doublePass: false,
          seed: seedBase + 4
        });
        drawInkStroke(c, [shinPoly[3], shinPoly[2]], {
          color: 'rgba(32, 22, 18, 0.9)',
          width: 1.3,
          jitter: 0.6,
          doublePass: false,
          seed: seedBase + 5
        });

        // Knobby knee joint ink accents
        c.beginPath();
        c.arc(knee[0], knee[1], 4.2, 0, Math.PI * 2);
        c.fillStyle = 'rgba(165, 148, 124, 0.5)';
        c.fill();
        c.strokeStyle = 'rgba(32, 22, 18, 0.85)';
        c.lineWidth = 1.1;
        c.stroke();

        // Grasping talons wrapping around branch
        toes.forEach((toePts, ti) => {
          drawInkStroke(c, [ankle, ...toePts], {
            color: 'rgba(28, 20, 16, 0.92)',
            width: 1.45,
            jitter: 0.5,
            doublePass: false,
            seed: seedBase + 10 + ti
          });
          // Sharp claw tip
          const last = toePts[toePts.length - 1];
          const prev = toePts[toePts.length - 2] || ankle;
          const dx = last[0] - prev[0];
          const dy = last[1] - prev[1];
          const l = Math.hypot(dx, dy) || 1;
          c.beginPath();
          c.moveTo(last[0] - (dy / l) * 1.4, last[1] + (dx / l) * 1.4);
          c.lineTo(last[0] + (dx / l) * 6, last[1] + (dy / l) * 6 + 3);
          c.lineTo(last[0] + (dy / l) * 1.4, last[1] - (dx / l) * 1.4);
          c.closePath();
          c.fillStyle = 'rgba(26, 18, 15, 0.9)';
          c.fill();
        });

        c.restore();
      }

      // Draw a living amber eye (used for both hanging eye-pods and collar eyes)
      function drawLivingEye(c, x, y, radius, lookTarget, blinkAmt, startleAmt, seed) {
        c.save();
        c.translate(x, y);

        // Outer fleshy pod / eyelid rim
        c.beginPath();
        c.ellipse(0, 0, radius * 1.16, radius * 1.05, 0, 0, Math.PI * 2);
        c.fillStyle = 'rgba(128, 108, 92, 0.42)';
        c.fill();
        c.strokeStyle = 'rgba(34, 24, 18, 0.88)';
        c.lineWidth = 1.25;
        c.stroke();

        // Clip inside eye aperture (shrinks vertically during blink)
        const openScale = clamp(1 - blinkAmt, 0.04, 1);
        c.save();
        c.beginPath();
        c.ellipse(0, 0, radius * 0.96, radius * 0.92 * openScale, 0, 0, Math.PI * 2);
        c.clip();

        // Sickly tallow-amber sclera & iris radial wash
        const grad = c.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, 'rgba(248, 210, 96, 0.95)');
        grad.addColorStop(0.55, 'rgba(214, 146, 42, 0.88)');
        grad.addColorStop(1, 'rgba(116, 68, 28, 0.85)');
        c.fillStyle = grad;
        c.fillRect(-radius * 1.2, -radius * 1.2, radius * 2.4, radius * 2.4);

        // Gaze offset toward pointer
        const dx = lookTarget.x - x;
        const dy = lookTarget.y - y;
        const dist = Math.hypot(dx, dy) || 1;
        const maxShift = radius * 0.36;
        const shiftAmt = Math.min(1, dist / 90) * maxShift;
        const px = (dx / dist) * shiftAmt;
        const py = (dy / dist) * shiftAmt;

        // Vertical slit pupil (narrows to razor when startled)
        const slitW = lerp(radius * 0.24, radius * 0.11, startleAmt);
        const slitH = radius * 0.72;
        c.beginPath();
        c.ellipse(px, py, slitW, slitH, 0, 0, Math.PI * 2);
        c.fillStyle = 'rgba(22, 14, 12, 0.96)';
        c.fill();

        // Tiny wet ink specular glint
        c.beginPath();
        c.arc(px - radius * 0.22, py - radius * 0.25, Math.max(1.1, radius * 0.16), 0, Math.PI * 2);
        c.fillStyle = 'rgba(255, 248, 224, 0.85)';
        c.fill();

        c.restore();

        // Eyelid crease line when blinking
        if (blinkAmt > 0.15) {
          c.beginPath();
          c.moveTo(-radius * 1.05, 0);
          c.quadraticCurveTo(0, radius * 0.2 * openScale, radius * 1.05, 0);
          c.strokeStyle = 'rgba(34, 24, 18, 0.85)';
          c.lineWidth = 1.2;
          c.stroke();
        }

        c.restore();
      }

      // Pointer & interaction state
      const pointer = {
        active: false,
        x: 240,
        y: 340,
        smoothX: 240,
        smoothY: 340,
        lastMoveTime: 0
      };

      function clientToLogical(clientX, clientY) {
        return {
          x: (clientX - offsetX) / scale,
          y: (clientY - offsetY) / scale
        };
      }

      window.addEventListener('pointermove', (e) => {
        const pt = clientToLogical(e.clientX, e.clientY);
        pointer.x = pt.x;
        pointer.y = pt.y;
        pointer.active = true;
        pointer.lastMoveTime = performance.now();
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        pointer.active = false;
      }, { passive: true });

      // Pendulum eye-stalks state (3 hanging from antlers)
      const eyePods = [
        { anchorOff: [-56, -42], len: 52, radius: 10.5, angle: 0.1, vel: 0, blinkTimer: 1.8, blinkDur: 0, phase: 0.0 },
        { anchorOff: [28, -68], len: 46, radius: 9.2, angle: -0.08, vel: 0, blinkTimer: 3.4, blinkDur: 0, phase: 1.9 },
        { anchorOff: [86, -44], len: 58, radius: 11.2, angle: 0.05, vel: 0, blinkTimer: 4.9, blinkDur: 0, phase: 3.5 }
      ];

      // Two smaller collar eyes on the neck
      const collarEyes = [
        { radius: 6.4, blinkTimer: 2.6, blinkDur: 0 },
        { radius: 5.4, blinkTimer: 4.1, blinkDur: 0 }
      ];

      // Floating dark ink-motes & pale lantern embers
      const motes = [];
      const moteRand = mulberry32(777);
      for (let i = 0; i < 16; i++) {
        motes.push({
          x: 250 + (moteRand() - 0.5) * 90,
          y: 320 + (moteRand() - 0.5) * 110,
          vx: (moteRand() - 0.5) * 8,
          vy: -8 - moteRand() * 14,
          life: moteRand(),
          maxLife: 2.5 + moteRand() * 3.0,
          size: 1.0 + moteRand() * 1.8,
          amber: moteRand() < 0.45
        });
      }

      // Smooth state variables
      let leanX = 0;
      let leanY = 0;
      let headTilt = 0;
      let startle = 0;
      let jawOpen = 0;
      let tongueTimer = 3.2;
      let tongueOut = 0;
      let lanternAngle = 0;
      let lanternVel = 0;
      let prevTime = performance.now();

      function resize() {
        viewW = window.innerWidth;
        viewH = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.max(1, Math.floor(viewW * dpr));
        canvas.height = Math.max(1, Math.floor(viewH * dpr));

        scale = Math.min(viewW / W, viewH / H);
        offsetX = (viewW - W * scale) * 0.5;
        offsetY = (viewH - H * scale) * 0.5;
      }

      window.addEventListener('resize', resize, { passive: true });
      resize();

      function updateBlink(item, dt) {
        item.blinkTimer -= dt;
        if (item.blinkTimer <= 0) {
          item.blinkDur = 0.22;
          item.blinkTimer = 2.4 + Math.random() * 4.5;
        }
        if (item.blinkDur > 0) {
          item.blinkDur = Math.max(0, item.blinkDur - dt);
          const p = 1 - item.blinkDur / 0.22;
          return Math.sin(p * Math.PI);
        }
        return 0;
      }

      function render(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - prevTime) * 0.001));
        prevTime = now;
        const t = now * 0.001;

        // Clear transparent canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, offsetX * dpr, offsetY * dpr);

        // Breathing cycle (~4.6s)
        const breath = Math.sin(t * 1.36) * 0.5 + 0.5; // 0..1
        const breathSmooth = Math.sin(t * 1.36 - 0.5); // -1..1

        // Idle wandering gaze when pointer is absent or idle
        const pointerIdle = !pointer.active || (now - pointer.lastMoveTime > 6500);
        const targetGazeX = pointerIdle
          ? 165 + Math.sin(t * 0.43) * 85 + Math.cos(t * 0.19) * 35
          : pointer.x;
        const targetGazeY = pointerIdle
          ? 340 + Math.sin(t * 0.31 + 1.2) * 110
          : pointer.y;

        pointer.smoothX = lerp(pointer.smoothX, targetGazeX, 1 - Math.exp(-dt * 4.2));
        pointer.smoothY = lerp(pointer.smoothY, targetGazeY, 1 - Math.exp(-dt * 4.2));

        // Distance from pointer to creature head/chest
        const distToHead = Math.hypot(pointer.smoothX - 210, pointer.smoothY - 250);
        const targetStartle = pointer.active && !pointerIdle
          ? clamp(1 - (distToHead - 45) / 140, 0, 1)
          : 0;
        startle = lerp(startle, targetStartle, 1 - Math.exp(-dt * 5.0));

        // Lean & curiosity tilt toward gaze
        const desiredLeanX = clamp((pointer.smoothX - 260) * 0.055, -14, 16) - startle * 10;
        const desiredLeanY = clamp((pointer.smoothY - 300) * 0.035, -10, 10) - startle * 7;
        leanX = lerp(leanX, desiredLeanX, 1 - Math.exp(-dt * 3.5));
        leanY = lerp(leanY, desiredLeanY, 1 - Math.exp(-dt * 3.5));

        const desiredTilt = clamp((pointer.smoothY - 240) * 0.0014, -0.22, 0.24) - startle * 0.12;
        headTilt = lerp(headTilt, desiredTilt, 1 - Math.exp(-dt * 4.0));

        // Jaw breathing & occasional silent hiss / tongue flick
        const breathJaw = Math.max(0, Math.sin(t * 1.36 - 0.8)) * 0.22;
        const targetJaw = clamp(breathJaw + startle * 0.52, 0, 0.78);
        jawOpen = lerp(jawOpen, targetJaw, 1 - Math.exp(-dt * 6.0));

        tongueTimer -= dt * (1 + startle * 1.4);
        if (tongueTimer <= 0) {
          tongueOut = 0.32;
          tongueTimer = 3.8 + Math.random() * 4.5;
        }
        if (tongueOut > 0) {
          tongueOut = Math.max(0, tongueOut - dt);
        }

        // Torso & joint positions
        const torsoX = 305 + leanX * 0.45;
        const torsoY = 385 - breath * 5 + leanY * 0.35;
        const hipX = torsoX + 26;
        const hipY = torsoY + 68;
        const shoulderX = torsoX - 38;
        const shoulderY = torsoY - 66 - breath * 2.5;

        // --------------------------------------------------
        // A. DRAW GNARLED BRANCH (STATIC PLATE)
        // --------------------------------------------------
        ctx.drawImage(branchPlate.canvas, 0, 0, W, H);

        // --------------------------------------------------
        // B. WHIP-LIKE SEGMENTED TAIL BEHIND BRANCH
        // --------------------------------------------------
        const tailPts = [];
        const tailSegs = 12;
        for (let i = 0; i <= tailSegs; i++) {
          const u = i / tailSegs;
          const baseX = hipX + Math.sin(u * 2.4) * 78 - u * 44;
          const baseY = hipY + u * 270;
          const sway = Math.sin(t * 1.65 - u * 3.8) * (6 + u * 20) + startle * Math.sin(t * 9 - u * 5) * 6 * u;
          tailPts.push([baseX + sway, baseY]);
        }
        // Tapered watercolor wash along tail
        const tailPoly = [];
        for (let i = 0; i <= tailSegs; i++) {
          const w = (1 - i / tailSegs) * 6.5 + 1.2;
          tailPoly.push([tailPts[i][0] - w, tailPts[i][1]]);
        }
        for (let i = tailSegs; i >= 0; i--) {
          const w = (1 - i / tailSegs) * 6.5 + 1.2;
          tailPoly.push([tailPts[i][0] + w, tailPts[i][1]]);
        }
        drawWatercolorShape(ctx, tailPoly, {
          fill: 'rgba(138, 124, 108, 0.3)',
          edgeColor: 'rgba(38, 28, 22, 0.4)',
          layers: 2,
          jitter: 0.9,
          seed: 1401
        });
        drawInkStroke(ctx, tailPts, {
          color: 'rgba(32, 22, 18, 0.88)',
          width: 1.6,
          jitter: 0.7,
          doublePass: false,
          seed: 1402
        });
        // Vertebral ridges & frayed plume at tail tip
        for (let i = 2; i < tailSegs; i += 2) {
          const p = tailPts[i];
          ctx.beginPath();
          ctx.moveTo(p[0] - 4, p[1] - 2);
          ctx.lineTo(p[0] + 4, p[1] + 2);
          ctx.strokeStyle = 'rgba(32, 22, 18, 0.65)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        const tip = tailPts[tailPts.length - 1];
        const prevTip = tailPts[tailPts.length - 2];
        const tipAng = Math.atan2(tip[1] - prevTip[1], tip[0] - prevTip[0]);
        ctx.save();
        ctx.translate(tip[0], tip[1]);
        ctx.rotate(tipAng);
        for (let f = -2; f <= 2; f++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(12, f * 5, 24 - Math.abs(f) * 3, f * 8 + Math.sin(t * 3 + f) * 2);
          ctx.strokeStyle = 'rgba(34, 24, 20, 0.78)';
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
        ctx.restore();

        // --------------------------------------------------
        // C. BACK LEG (GRIPPING BRANCH)
        // --------------------------------------------------
        const backHip = [hipX + 8, hipY - 4];
        const backKnee = [hipX + 54, hipY + 38];
        const backAnkle = [355, 574];
        const backToes = [
          [[344, 580], [342, 594]],
          [[356, 584], [358, 598]],
          [[368, 578], [372, 590]]
        ];
        drawLeg(ctx, backHip, backKnee, backAnkle, backToes, breath, 1500, true);

        // --------------------------------------------------
        // D. TATTERED SHROUD / MOTH-WING MEMBRANE
        // --------------------------------------------------
        ctx.save();
        ctx.translate(shoulderX + 18, shoulderY + 12);
        const wingFlare = -0.06 - breath * 0.06 - startle * 0.24 + Math.sin(t * 2.1) * 0.025;
        ctx.rotate(wingFlare);
        ctx.drawImage(wingPlate.canvas, -45, -45, wingPlate.w, wingPlate.h);
        ctx.restore();

        // --------------------------------------------------
        // E. SWINGING HEART-LANTERN INSIDE RIBCAGE
        // --------------------------------------------------
        const lanternPivotX = torsoX - 4;
        const lanternPivotY = torsoY - 38;
        const lanternForce = (leanX - 0) * 0.008 - lanternAngle * 6.5 - lanternVel * 2.2 + Math.sin(t * 1.4) * 0.25;
        lanternVel += lanternForce * dt;
        lanternAngle += lanternVel * dt;

        const lanternX = lanternPivotX + Math.sin(lanternAngle) * 38;
        const lanternY = lanternPivotY + Math.cos(lanternAngle) * 38;

        // Soft warm sickly amber glow inside the ribcage
        const glowPulse = 0.78 + Math.sin(t * 2.8) * 0.14 + startle * 0.2;
        const glowR = 54 + breath * 8 + startle * 10;
        const lg = ctx.createRadialGradient(lanternX, lanternY, 4, lanternX, lanternY, glowR);
        lg.addColorStop(0, `rgba(248, 198, 78, ${0.52 * glowPulse})`);
        lg.addColorStop(0.45, `rgba(214, 134, 42, ${0.24 * glowPulse})`);
        lg.addColorStop(1, 'rgba(180, 96, 28, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(lanternX, lanternY, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Sinew strings suspending the lantern inside the cage
        ctx.strokeStyle = 'rgba(54, 34, 28, 0.75)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(lanternPivotX - 6, lanternPivotY);
        ctx.quadraticCurveTo(lanternX - 8, (lanternPivotY + lanternY) * 0.5, lanternX - 3, lanternY - 10);
        ctx.moveTo(lanternPivotX + 8, lanternPivotY + 4);
        ctx.quadraticCurveTo(lanternX + 9, (lanternPivotY + lanternY) * 0.5, lanternX + 4, lanternY - 8);
        ctx.stroke();

        // Lantern organ body (teardrop/heart shape)
        ctx.save();
        ctx.translate(lanternX, lanternY);
        ctx.rotate(-lanternAngle * 0.6);
        const organPts = [
          [0, -14], [10, -4], [11, 8], [3, 17],
          [-5, 16], [-11, 6], [-9, -5]
        ];
        drawWatercolorShape(ctx, organPts, {
          fill: `rgba(232, 168, 56, ${0.55 * glowPulse})`,
          edgeColor: 'rgba(68, 36, 22, 0.68)',
          layers: 3,
          jitter: 0.9,
          seed: 1601
        });
        drawInkStroke(ctx, organPts, {
          color: 'rgba(42, 24, 18, 0.85)',
          width: 1.2,
          closed: true,
          doublePass: false,
          seed: 1602
        });
        // Bright tallow core
        ctx.beginPath();
        ctx.ellipse(-1, 2, 4.2, 6.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 232, 148, ${0.72 * glowPulse})`;
        ctx.fill();
        ctx.restore();

        // --------------------------------------------------
        // F. RIBCAGE & SPINE TORSO PLATE
        // --------------------------------------------------
        ctx.save();
        ctx.translate(torsoX, torsoY);
        ctx.scale(1 + breath * 0.032, 1 + breath * 0.018);
        ctx.drawImage(torsoPlate.canvas, -130, -130, torsoPlate.w, torsoPlate.h);
        ctx.restore();

        // --------------------------------------------------
        // G. FRONT LEG & WITHERED FORE-CLAW LIMB
        // --------------------------------------------------
        const frontHip = [hipX - 10, hipY - 2];
        const frontKnee = [hipX - 4, hipY + 52];
        const frontAnkle = [275, 595];
        const frontToes = [
          [[262, 602], [258, 616]],
          [[276, 606], [278, 622]],
          [[290, 600], [295, 614]]
        ];
        drawLeg(ctx, frontHip, frontKnee, frontAnkle, frontToes, breath, 1550, false);

        // Nervous raised mantis-like forelimb hanging from front thorax
        const armShoulder = [torsoX - 46, torsoY - 22];
        const armTwitch = Math.sin(t * 3.7) * 2.5 + startle * Math.sin(t * 14) * 3.5;
        const armElbow = [armShoulder[0] - 40, armShoulder[1] + 44 + breath * 4];
        const armWrist = [armElbow[0] - 28 + armTwitch, armElbow[1] + 28 - startle * 16];
        const foreToes = [
          [[armWrist[0] - 10, armWrist[1] + 12], [armWrist[0] - 14, armWrist[1] + 26]],
          [[armWrist[0] - 2, armWrist[1] + 14], [armWrist[0] - 4, armWrist[1] + 29]],
          [[armWrist[0] + 6, armWrist[1] + 10], [armWrist[0] + 8, armWrist[1] + 22]]
        ];
        drawLeg(ctx, armShoulder, armElbow, armWrist, foreToes, breath, 1580, false);

        // --------------------------------------------------
        // H. CURVED SEGMENTED NECK & COLLAR EYES
        // --------------------------------------------------
        const headX = 196 + leanX * 1.15;
        const headY = 196 - breath * 4.5 + leanY * 0.9;

        const neckP0 = [shoulderX, shoulderY];
        const neckP1 = [lerp(shoulderX, headX, 0.35) - 18, lerp(shoulderY, headY, 0.35) + 10];
        const neckP2 = [lerp(shoulderX, headX, 0.72) + 12, lerp(shoulderY, headY, 0.72) - 6];
        const neckP3 = [headX + 8, headY - 4];

        // Sample cubic curve for neck geometry
        const neckPts = [];
        const nSteps = 10;
        for (let i = 0; i <= nSteps; i++) {
          const u = i / nSteps;
          const iu = 1 - u;
          const x = iu * iu * iu * neckP0[0] + 3 * iu * iu * u * neckP1[0] + 3 * iu * u * u * neckP2[0] + u * u * u * neckP3[0];
          const y = iu * iu * iu * neckP0[1] + 3 * iu * iu * u * neckP1[1] + 3 * iu * u * u * neckP2[1] + u * u * u * neckP3[1];
          neckPts.push([x, y]);
        }

        const neckLeft = [];
        const neckRight = [];
        for (let i = 0; i <= nSteps; i++) {
          const u = i / nSteps;
          const cur = neckPts[i];
          const nxt = neckPts[Math.min(nSteps, i + 1)];
          const prv = neckPts[Math.max(0, i - 1)];
          const dx = nxt[0] - prv[0];
          const dy = nxt[1] - prv[1];
          const l = Math.hypot(dx, dy) || 1;
          const nx = -dy / l;
          const ny = dx / l;
          const halfW = lerp(18, 10.5, u) + Math.sin(u * Math.PI) * 3;
          neckLeft.push([cur[0] + nx * halfW, cur[1] + ny * halfW]);
          neckRight.unshift([cur[0] - nx * halfW, cur[1] - ny * halfW]);
        }
        const neckPoly = [...neckLeft, ...neckRight];
        drawWatercolorShape(ctx, neckPoly, {
          fill: 'rgba(202, 188, 164, 0.44)',
          edgeColor: 'rgba(48, 36, 28, 0.42)',
          layers: 3,
          jitter: 1.4,
          seed: 1701
        });
        drawInkStroke(ctx, neckLeft, {
          color: 'rgba(34, 24, 18, 0.88)',
          width: 1.5,
          jitter: 0.7,
          doublePass: false,
          seed: 1702
        });
        drawInkStroke(c = ctx, neckRight, {
          color: 'rgba(34, 24, 18, 0.88)',
          width: 1.5,
          jitter: 0.7,
          doublePass: false,
          seed: 1703
        });

        // Tracheal folds & sinew lines along neck
        for (let i = 2; i < nSteps; i += 2) {
          const pL = neckLeft[i];
          const pR = neckRight[nSteps - i];
          ctx.beginPath();
          ctx.moveTo(lerp(pL[0], pR[0], 0.15), lerp(pL[1], pR[1], 0.15));
          ctx.quadraticCurveTo(
            neckPts[i][0], neckPts[i][1] + 4,
            lerp(pL[0], pR[0], 0.85), lerp(pL[1], pR[1], 0.85)
          );
          ctx.strokeStyle = 'rgba(48, 34, 26, 0.42)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // Two smaller collar eyes nestled on the neck
        const collarPos = [
          [neckPts[2][0] - 4, neckPts[2][1] + 2],
          [neckPts[5][0] - 5, neckPts[5][1] - 2]
        ];
        collarEyes.forEach((ce, idx) => {
          const b = updateBlink(ce, dt);
          drawLivingEye(
            ctx,
            collarPos[idx][0],
            collarPos[idx][1],
            ce.radius,
            { x: pointer.smoothX, y: pointer.smoothY },
            b,
            startle,
            1750 + idx
          );
        });

        // --------------------------------------------------
        // I. HEAD, ARTICULATED JAW, TONGUE & THORN ANTLERS
        // --------------------------------------------------
        ctx.save();
        ctx.translate(headX, headY);
        ctx.rotate(headTilt);

        // Articulated lower jaw + forked tongue
        ctx.save();
        ctx.translate(-10, 14);
        ctx.rotate(-jawOpen * 0.48);

        // Flickering dark forked tongue when jaw opens
        if (tongueOut > 0) {
          const ext = Math.sin((tongueOut / 0.32) * Math.PI) * 34;
          ctx.beginPath();
          ctx.moveTo(-25, 8);
          ctx.quadraticCurveTo(-55 - ext * 0.5, 16 + Math.sin(t * 28) * 3, -72 - ext, 26);
          ctx.lineTo(-82 - ext, 22);
          ctx.moveTo(-72 - ext, 26);
          ctx.lineTo(-80 - ext, 33);
          ctx.strokeStyle = 'rgba(54, 26, 28, 0.88)';
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.drawImage(jawPlate.canvas, -105, -25, jawPlate.w, jawPlate.h);
        ctx.restore();

        // Skull cranium
        ctx.drawImage(skullPlate.canvas, -125, -65, skullPlate.w, skullPlate.h);

        // Thorn antlers mounted on crown (-2, -26 in local head space)
        ctx.save();
        ctx.translate(-2, -26);
        ctx.drawImage(antlerPlate.canvas, -80, -125, antlerPlate.w, antlerPlate.h);

        // Hanging pendulum eye-pods suspended from antler tips
        const cosT = Math.cos(headTilt);
        const sinT = Math.sin(headTilt);
        eyePods.forEach((pod, idx) => {
          const ax = pod.anchorOff[0];
          const ay = pod.anchorOff[1];

          // Pendulum physics driven by head sway + subtle breeze
          const targetRest = Math.sin(t * 1.1 + pod.phase) * 0.08 - headTilt * 0.7;
          const acc = (targetRest - pod.angle) * 14 - pod.vel * 2.4 + (leanX * 0.025);
          pod.vel += acc * dt;
          pod.angle += pod.vel * dt;

          const ex = ax + Math.sin(pod.angle) * pod.len;
          const ey = ay + Math.cos(pod.angle) * pod.len;

          // Fleshy stalk connecting antler tip to eye-pod
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.quadraticCurveTo(
            lerp(ax, ex, 0.5) - pod.vel * 4,
            lerp(ay, ey, 0.5),
            ex, ey - pod.radius * 0.9
          );
          ctx.strokeStyle = 'rgba(58, 42, 34, 0.82)';
          ctx.lineWidth = 2.0;
          ctx.stroke();

          // Convert local eye position to logical space for accurate pupil tracking
          const localRelX = ex - 2;
          const localRelY = ey - 26;
          const worldEx = headX + localRelX * cosT - localRelY * sinT;
          const worldEy = headY + localRelX * sinT + localRelY * cosT;

          // Transform gaze target back into antler-local coordinates for drawLivingEye
          const gx = pointer.smoothX - headX;
          const gy = pointer.smoothY - headY;
          const localGx = gx * cosT + gy * sinT + 2;
          const localGy = -gx * sinT + gy * cosT + 26;

          const blink = updateBlink(pod, dt);
          drawLivingEye(ctx, ex, ey, pod.radius, { x: localGx, y: localGy }, blink, startle, 1800 + idx);
        });

        ctx.restore(); // end antlers
        ctx.restore(); // end head

        // --------------------------------------------------
        // J. FLOATING INK-MIST & LANTERN SPORE MOTES
        // --------------------------------------------------
        motes.forEach((m) => {
          m.life += dt;
          if (m.life >= m.maxLife) {
            m.life = 0;
            m.x = lanternX + (Math.random() - 0.5) * 34;
            m.y = lanternY + (Math.random() - 0.5) * 28;
            m.vx = (Math.random() - 0.5) * 10;
            m.vy = -10 - Math.random() * 14;
          }
          m.x += (m.vx + Math.sin(t * 1.8 + m.y * 0.05) * 6) * dt;
          m.y += m.vy * dt;

          const p = m.life / m.maxLife;
          const alpha = Math.sin(p * Math.PI) * (m.amber ? 0.42 : 0.34);
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * (0.7 + p * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = m.amber
            ? `rgba(224, 162, 54, ${alpha})`
            : `rgba(48, 38, 34, ${alpha})`;
          ctx.fill();
        });

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
  "title": "The Bleak Cage-Heron",
  "statement": "Perches silently on bog-oak limbs, swinging a glowing heart-lure while five eyes watch."
}
```