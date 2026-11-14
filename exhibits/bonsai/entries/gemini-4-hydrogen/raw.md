```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
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
<canvas id="c"></canvas>
<script>
(() => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  // Deterministic PRNG for sculpted, repeatable tree architecture
  function createRng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  const rng = createRng(73915);

  let viewW = 0;
  let viewH = 0;
  let dpr = 1;
  let scale = 1;
  let originX = 0;
  let originY = 0;

  // Optional gentle pointer breeze interaction (non-blocking)
  const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, active: false };
  let lastPointerX = 0;
  let lastPointerY = 0;

  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left - originX) / scale;
    const ny = (e.clientY - rect.top - originY) / scale;
    if (pointer.active) {
      pointer.vx = Math.max(-40, Math.min(40, nx - lastPointerX));
      pointer.vy = Math.max(-40, Math.min(40, ny - lastPointerY));
    }
    pointer.x = nx;
    pointer.y = ny;
    lastPointerX = nx;
    lastPointerY = ny;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, { passive: true });

  function resize() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(viewW * dpr));
    canvas.height = Math.max(1, Math.floor(viewH * dpr));
    const square = Math.min(viewW, viewH);
    scale = square / 1000;
    originX = (viewW - square) * 0.5;
    originY = viewH - square;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // --- Color Helpers ---
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

  function lerpColor(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t))
    ];
  }

  function rgb(c, a = 1) {
    return a >= 1
      ? `rgb(${c[0]},${c[1]},${c[2]})`
      : `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  // Smooth circular 4-season palette for ginkgo leaves
  const SEASON_STOPS = [
    { t: 0.00, dark: [42, 108, 72],  mid: [76, 158, 96],  light: [148, 206, 108], rim: [32, 74, 48] },   // Spring Jade
    { t: 0.28, dark: [28, 86, 60],   mid: [54, 132, 78],  light: [108, 178, 92],  rim: [22, 58, 38] },   // Summer Emerald
    { t: 0.56, dark: [168, 98, 18],  mid: [228, 168, 36], light: [250, 218, 88],  rim: [120, 62, 12] },  // Autumn Ginkgo Gold
    { t: 0.80, dark: [132, 62, 36],  mid: [196, 114, 46], light: [236, 174, 86],  rim: [88, 38, 22] }    // Twilight Copper-Amber
  ];

  function sampleSeasonPalette(phase) {
    const p = ((phase % 1) + 1) % 1;
    let i0 = SEASON_STOPS.length - 1;
    let i1 = 0;
    for (let i = 0; i < SEASON_STOPS.length; i++) {
      const next = (i + 1) % SEASON_STOPS.length;
      const t0 = SEASON_STOPS[i].t;
      const t1 = next === 0 ? 1.0 : SEASON_STOPS[next].t;
      if (p >= t0 && p < t1) {
        i0 = i;
        i1 = next;
        const u = (p - t0) / (t1 - t0);
        const s = u * u * (3 - 2 * u);
        return {
          dark: lerpColor(SEASON_STOPS[i0].dark, SEASON_STOPS[i1].dark, s),
          mid: lerpColor(SEASON_STOPS[i0].mid, SEASON_STOPS[i1].mid, s),
          light: lerpColor(SEASON_STOPS[i0].light, SEASON_STOPS[i1].light, s),
          rim: lerpColor(SEASON_STOPS[i0].rim, SEASON_STOPS[i1].rim, s)
        };
      }
    }
    return SEASON_STOPS[0];
  }

  // --- Sculpted Bonsai Architecture ---
  // Node format: chain of segments with attached child branches and foliage pads
  function makeBranch(points, stiffness, children = [], pad = null) {
    const segs = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      segs.push({
        len: Math.hypot(dx, dy),
        baseAngle: Math.atan2(dy, dx),
        r0: p0.r,
        r1: p1.r,
        phase: rng() * Math.PI * 2,
        wx: 0,
        wy: 0
      });
    }
    return {
      startX: points[0].x,
      startY: points[0].y,
      rStart: points[0].r,
      stiffness,
      segs,
      children, // { segIndex, branch }
      pad,
      worldPts: []
    };
  }

  // Create sculpted foliage pad (cloud of ginkgo fan leaves)
  function makePad(count, rx, ry, rotOffset, scaleBase) {
    const leaves = [];
    for (let i = 0; i < count; i++) {
      // Stratified elliptic distribution for airy cloud pads
      const a = (i / count) * Math.PI * 2 + (rng() - 0.5) * 0.6;
      const dist = Math.pow(rng(), 0.58);
      const lx = Math.cos(a) * rx * dist;
      const ly = Math.sin(a) * ry * dist * (0.8 + 0.35 * rng());
      // Bias leaves slightly upward-fanning like natural ginkgo clusters
      const fanAngle = -Math.PI * 0.5 + (lx / (rx + 1)) * 0.72 + (rng() - 0.5) * 0.55 + rotOffset;
      const layerRoll = rng();
      leaves.push({
        ox: lx,
        oy: ly,
        angle: fanAngle,
        size: scaleBase * (0.76 + rng() * 0.52),
        cleft: 0.18 + rng() * 0.16,
        spread: 0.78 + rng() * 0.24,
        colorShift: (rng() - 0.5) * 0.11 + (ly / (ry + 1)) * 0.03,
        shade: 0.85 + rng() * 0.3,
        flutterPhase: rng() * Math.PI * 2,
        flutterFreq: 1.5 + rng() * 1.4,
        layer: layerRoll < 0.34 ? 0 : layerRoll < 0.68 ? 1 : 2,
        hasDew: rng() < 0.11,
        dewPhase: rng() * Math.PI * 2
      });
    }
    // Sort back-to-front by Y within each layer
    leaves.sort((a, b) => a.oy - b.oy);
    return leaves;
  }

  // Build main S-curve Moyogi trunk and balanced cloud-pad branches
  const padLowerLeft = makeBranch(
    [
      { x: 422, y: 690, r: 17 },
      { x: 356, y: 668, r: 12.5 },
      { x: 288, y: 652, r: 8.5 },
      { x: 230, y: 632, r: 4.5 }
    ],
    0.72,
    [
      {
        segIndex: 1,
        branch: makeBranch(
          [{ x: 356, y: 668, r: 8 }, { x: 320, y: 622, r: 5 }, { x: 295, y: 598, r: 2.8 }],
          0.9,
          [],
          makePad(26, 62, 26, -0.15, 22)
        )
      }
    ],
    makePad(38, 78, 30, -0.2, 23)
  );

  const padLowerRight = makeBranch(
    [
      { x: 500, y: 592, r: 15.5 },
      { x: 582, y: 575, r: 11.5 },
      { x: 665, y: 558, r: 7.5 },
      { x: 734, y: 534, r: 4.0 }
    ],
    0.76,
    [
      {
        segIndex: 1,
        branch: makeBranch(
          [{ x: 582, y: 575, r: 7 }, { x: 626, y: 525, r: 4.5 }, { x: 655, y: 505, r: 2.5 }],
          0.95,
          [],
          makePad(28, 66, 26, 0.12, 22)
        )
      }
    ],
    makePad(40, 82, 32, 0.2, 23)
  );

  const padMidLeft = makeBranch(
    [
      { x: 472, y: 472, r: 12 },
      { x: 398, y: 454, r: 8.5 },
      { x: 325, y: 440, r: 5.5 },
      { x: 268, y: 420, r: 3.0 }
    ],
    0.85,
    [],
    makePad(34, 72, 28, -0.15, 22)
  );

  const padMidRight = makeBranch(
    [
      { x: 454, y: 382, r: 10.5 },
      { x: 530, y: 365, r: 7.5 },
      { x: 604, y: 350, r: 4.8 },
      { x: 656, y: 332, r: 2.6 }
    ],
    0.9,
    [],
    makePad(32, 68, 27, 0.14, 21)
  );

  const padUpperLeft = makeBranch(
    [
      { x: 460, y: 298, r: 8 },
      { x: 400, y: 280, r: 5.5 },
      { x: 348, y: 264, r: 3.0 }
    ],
    0.96,
    [],
    makePad(26, 56, 23, -0.1, 20)
  );

  const padApexSubRight = makeBranch(
    [
      { x: 472, y: 235, r: 6.5 },
      { x: 518, y: 220, r: 4.2 },
      { x: 558, y: 204, r: 2.4 }
    ],
    1.0,
    [],
    makePad(24, 52, 22, 0.12, 19)
  );

  // Main trunk from nebari base up to crown apex
  const trunk = makeBranch(
    [
      { x: 468, y: 846, r: 42 },
      { x: 452, y: 785, r: 32 },
      { x: 422, y: 690, r: 26 },
      { x: 458, y: 635, r: 23 },
      { x: 500, y: 592, r: 20 },
      { x: 492, y: 530, r: 17.5 },
      { x: 472, y: 472, r: 15.5 },
      { x: 454, y: 382, r: 13 },
      { x: 460, y: 298, r: 10 },
      { x: 472, y: 235, r: 7 },
      { x: 468, y: 186, r: 3.5 }
    ],
    0.26,
    [
      { segIndex: 2, branch: padLowerLeft },
      { segIndex: 4, branch: padLowerRight },
      { segIndex: 6, branch: padMidLeft },
      { segIndex: 7, branch: padMidRight },
      { segIndex: 8, branch: padUpperLeft },
      { segIndex: 9, branch: padApexSubRight }
    ],
    makePad(38, 76, 32, 0.0, 21)
  );

  // Bleached deadwood Jin stub emerging mid-trunk
  const jinBranch = makeBranch(
    [
      { x: 486, y: 650, r: 9.5 },
      { x: 525, y: 634, r: 5.5 },
      { x: 554, y: 615, r: 2.0 }
    ],
    0.15
  );

  // Exposed Nebari surface roots gripping moss & stone
  const nebariRoots = [
    [{ x: 468, y: 836, r: 18 }, { x: 432, y: 846, r: 11 }, { x: 394, y: 852, r: 4.5 }],
    [{ x: 462, y: 838, r: 16 }, { x: 446, y: 850, r: 9 }, { x: 428, y: 856, r: 3.5 }],
    [{ x: 476, y: 838, r: 17 }, { x: 512, y: 848, r: 10 }, { x: 552, y: 853, r: 3.8 }],
    [{ x: 480, y: 835, r: 14 }, { x: 528, y: 842, r: 7.5 }, { x: 568, y: 846, r: 2.5 }],
    [{ x: 468, y: 840, r: 15 }, { x: 472, y: 853, r: 8.5 }, { x: 480, y: 858, r: 3.0 }]
  ];

  // Moss cushions & delicate swaying spore-stalks
  const mossCushions = [
    { x: 355, y: 847, rx: 48, ry: 12 },
    { x: 418, y: 846, rx: 56, ry: 13 },
    { x: 502, y: 847, rx: 62, ry: 14 },
    { x: 584, y: 848, rx: 55, ry: 12 },
    { x: 642, y: 848, rx: 36, ry: 10 }
  ];

  const mossSpeckles = [];
  for (let i = 0; i < 115; i++) {
    const mx = 326 + rng() * 348;
    const norm = (mx - 500) / 176;
    const maxY = 853 - norm * norm * 5;
    const my = 838 + rng() * (maxY - 838);
    mossSpeckles.push({
      x: mx,
      y: my,
      r: 1.4 + rng() * 2.6,
      tone: rng()
    });
  }

  const sporeStalks = [];
  for (let i = 0; i < 15; i++) {
    const sx = 340 + rng() * 315;
    if (Math.abs(sx - 468) < 28) continue;
    sporeStalks.push({
      x: sx,
      y: 843 + rng() * 6,
      h: 12 + rng() * 14,
      lean: (rng() - 0.5) * 0.45,
      phase: rng() * Math.PI * 2
    });
  }

  // Ceramic glaze speckles on pot
  const glazeSpeckles = [];
  for (let i = 0; i < 65; i++) {
    const gx = 320 + rng() * 360;
    const gy = 865 + rng() * 112;
    glazeSpeckles.push({
      x: gx,
      y: gy,
      r: 0.7 + rng() * 1.4,
      a: 0.08 + rng() * 0.14,
      light: rng() > 0.45
    });
  }

  // Drifting fallen ginkgo leaves & ambient light motes
  const driftingLeaves = [];
  const leafAnchorHints = [
    { x: 245, y: 632 }, { x: 315, y: 605 }, { x: 710, y: 536 },
    { x: 640, y: 505 }, { x: 280, y: 422 }, { x: 640, y: 335 },
    { x: 356, y: 266 }, { x: 472, y: 195 }, { x: 545, y: 205 }
  ];

  for (let i = 0; i < 12; i++) {
    const anchor = leafAnchorHints[i % leafAnchorHints.length];
    driftingLeaves.push({
      active: false,
      timer: rng() * 14,
      x: anchor.x,
      y: anchor.y,
      vx: 0,
      vy: 0,
      rot: rng() * Math.PI * 2,
      spin: (rng() - 0.5) * 2.2,
      rollPhase: rng() * Math.PI * 2,
      size: 16 + rng() * 7,
      colorShift: (rng() - 0.5) * 0.08,
      life: 0,
      maxLife: 4.5 + rng() * 2.5
    });
  }

  const dewMotes = [];
  for (let i = 0; i < 18; i++) {
    dewMotes.push({
      x: 200 + rng() * 600,
      y: 160 + rng() * 520,
      r: 1.3 + rng() * 2.1,
      phase: rng() * Math.PI * 2,
      speed: 0.4 + rng() * 0.6,
      drift: 8 + rng() * 14
    });
  }

  // --- Kinematics & Wind Simulation ---
  function windAt(x, y, t) {
    // Rolling gust waves across canopy
    const w1 = Math.sin(t * 0.72 + x * 0.0045 - y * 0.003) * 0.55;
    const w2 = Math.sin(t * 1.48 + x * 0.009 + y * 0.004) * 0.28;
    const w3 = Math.cos(t * 0.31 - x * 0.002) * 0.35;
    let gust = (w1 + w2 + w3) * 0.045;

    // Gentle passive pointer ripple
    if (pointer.active) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 18000) {
        const strength = 1 - distSq / 18000;
        gust += (pointer.vx * 0.0045 + Math.sin(t * 5 + x * 0.05) * 0.03) * strength;
      }
    }
    return gust;
  }

  function updateBranchSkeleton(branch, rootX, rootY, parentAngleDelta, t) {
    let cx = rootX;
    let cy = rootY;
    let accAngle = parentAngleDelta;

    branch.worldPts = [{ x: cx, y: cy, r: branch.rStart }];

    for (let i = 0; i < branch.segs.length; i++) {
      const seg = branch.segs[i];
      const localWind = windAt(cx, cy, t + seg.phase * 0.15) * branch.stiffness * (0.55 + i * 0.28);
      accAngle += localWind;
      const angle = seg.baseAngle + accAngle;
      cx += Math.cos(angle) * seg.len;
      cy += Math.sin(angle) * seg.len;
      seg.wx = cx;
      seg.wy = cy;
      seg.worldAngle = angle;
      branch.worldPts.push({ x: cx, y: cy, r: seg.r1 });
    }

    for (let i = 0; i < branch.children.length; i++) {
      const ch = branch.children[i];
      const attachPt = branch.worldPts[ch.segIndex];
      updateBranchSkeleton(ch.branch, attachPt.x, attachPt.y, accAngle * 0.65, t);
    }
  }

  // --- Drawing Routines ---

  function drawPotBack(t) {
    // Back rim & soil recess
    ctx.save();
    // Back ceramic rim curve
    ctx.beginPath();
    ctx.moveTo(310, 850);
    ctx.quadraticCurveTo(500, 826, 690, 850);
    ctx.quadraticCurveTo(695, 862, 686, 866);
    ctx.quadraticCurveTo(500, 845, 314, 866);
    ctx.quadraticCurveTo(305, 862, 310, 850);
    ctx.closePath();

    const backGrad = ctx.createLinearGradient(310, 830, 690, 866);
    backGrad.addColorStop(0, '#2a454a');
    backGrad.addColorStop(0.5, '#3b5c62');
    backGrad.addColorStop(1, '#233a3e');
    ctx.fillStyle = backGrad;
    ctx.fill();

    // Rich dark soil bed inside rim
    ctx.beginPath();
    ctx.ellipse(500, 852, 178, 18, 0, 0, Math.PI * 2);
    const soilGrad = ctx.createRadialGradient(500, 846, 30, 500, 852, 180);
    soilGrad.addColorStop(0, '#3a2c22');
    soilGrad.addColorStop(0.7, '#291f18');
    soilGrad.addColorStop(1, '#1a1410');
    ctx.fillStyle = soilGrad;
    ctx.fill();
    ctx.restore();
  }

  function drawMossAndStones(t) {
    ctx.save();

    // Small pale river quartz stone (left)
    ctx.beginPath();
    ctx.moveTo(366, 850);
    ctx.quadraticCurveTo(368, 834, 386, 832);
    ctx.quadraticCurveTo(404, 833, 408, 850);
    ctx.closePath();
    const stoneLeftGrad = ctx.createLinearGradient(366, 832, 406, 852);
    stoneLeftGrad.addColorStop(0, '#d8d2c6');
    stoneLeftGrad.addColorStop(0.6, '#b0a89a');
    stoneLeftGrad.addColorStop(1, '#7a7468');
    ctx.fillStyle = stoneLeftGrad;
    ctx.fill();

    // Weathered basalt suiseki ridge-stone (right, balancing trunk)
    ctx.beginPath();
    ctx.moveTo(570, 852);
    ctx.lineTo(582, 828);
    ctx.lineTo(598, 818);
    ctx.lineTo(612, 825);
    ctx.lineTo(626, 812);
    ctx.lineTo(644, 832);
    ctx.lineTo(652, 852);
    ctx.closePath();
    const basaltGrad = ctx.createLinearGradient(585, 812, 645, 852);
    basaltGrad.addColorStop(0, '#5a6266');
    basaltGrad.addColorStop(0.45, '#3b4246');
    basaltGrad.addColorStop(1, '#22282b');
    ctx.fillStyle = basaltGrad;
    ctx.fill();

    // Highlight ridge on basalt
    ctx.beginPath();
    ctx.moveTo(598, 818);
    ctx.lineTo(604, 834);
    ctx.moveTo(626, 812);
    ctx.lineTo(624, 835);
    ctx.strokeStyle = 'rgba(180, 194, 196, 0.25)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Velvet moss cushions
    for (let i = 0; i < mossCushions.length; i++) {
      const m = mossCushions[i];
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, Math.PI, Math.PI * 2);
      ctx.quadraticCurveTo(m.x + m.rx * 0.5, m.y + 5, m.x, m.y + 4);
      ctx.quadraticCurveTo(m.x - m.rx * 0.5, m.y + 5, m.x - m.rx, m.y);
      ctx.closePath();

      const mGrad = ctx.createLinearGradient(m.x, m.y - m.ry, m.x, m.y + 5);
      mGrad.addColorStop(0, '#729e4c');
      mGrad.addColorStop(0.55, '#4c7536');
      mGrad.addColorStop(1, '#2b4722');
      ctx.fillStyle = mGrad;
      ctx.fill();
    }

    // Stippled moss texture
    for (let i = 0; i < mossSpeckles.length; i++) {
      const sp = mossSpeckles[i];
      ctx.fillStyle = sp.tone > 0.6
        ? 'rgba(164, 206, 98, 0.55)'
        : sp.tone > 0.25
          ? 'rgba(84, 134, 54, 0.5)'
          : 'rgba(36, 62, 26, 0.5)';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swaying moss spore-stalks with tiny glowing amber capsules
    for (let i = 0; i < sporeStalks.length; i++) {
      const st = sporeStalks[i];
      const sway = Math.sin(t * 2.1 + st.phase) * 0.18 + windAt(st.x, st.y, t) * 4.5;
      const tipX = st.x + Math.sin(st.lean + sway) * st.h;
      const tipY = st.y - Math.cos(st.lean + sway) * st.h;

      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.quadraticCurveTo(st.x + sway * 4, st.y - st.h * 0.55, tipX, tipY);
      ctx.strokeStyle = '#7ba652';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#e8c456';
      ctx.fill();
    }

    ctx.restore();
  }

  function drawPotFront(t) {
    ctx.save();

    // Subtle tucked contact shadow between feet (strictly above y = 1000)
    const shadowGrad = ctx.createRadialGradient(500, 986, 20, 500, 986, 175);
    shadowGrad.addColorStop(0, 'rgba(10, 14, 16, 0.34)');
    shadowGrad.addColorStop(0.7, 'rgba(10, 14, 16, 0.14)');
    shadowGrad.addColorStop(1, 'rgba(10, 14, 16, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(500, 987, 170, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left and right carved stoneware feet touching y = 1000 exactly
    function drawFoot(xCenter, dir) {
      ctx.beginPath();
      ctx.moveTo(xCenter - 22, 976);
      ctx.quadraticCurveTo(xCenter - 20, 991, xCenter - 17, 1000);
      ctx.lineTo(xCenter + 17, 1000);
      ctx.quadraticCurveTo(xCenter + 20, 991, xCenter + 22, 976);
      ctx.closePath();

      const fGrad = ctx.createLinearGradient(xCenter - 20, 976, xCenter + 20, 1000);
      fGrad.addColorStop(0, dir < 0 ? '#2b4348' : '#1b2d31');
      fGrad.addColorStop(1, '#111d20');
      ctx.fillStyle = fGrad;
      ctx.fill();

      // Subtle rim highlight on foot edge
      ctx.beginPath();
      ctx.moveTo(xCenter - 16, 999);
      ctx.lineTo(xCenter + 16, 999);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    drawFoot(386, -1);
    drawFoot(614, 1);

    // Main Stoneware Pot Body (flared rounded basin)
    ctx.beginPath();
    ctx.moveTo(314, 862);
    ctx.bezierCurveTo(318, 922, 336, 964, 358, 978);
    ctx.quadraticCurveTo(500, 988, 642, 978);
    ctx.bezierCurveTo(664, 964, 682, 922, 686, 862);
    ctx.quadraticCurveTo(500, 882, 314, 862);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(314, 862, 686, 978);
    bodyGrad.addColorStop(0, '#36585e');
    bodyGrad.addColorStop(0.28, '#284449');
    bodyGrad.addColorStop(0.68, '#1b3035');
    bodyGrad.addColorStop(1, '#132226');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Vertical soft specular glaze sheen
    ctx.save();
    ctx.clip();

    const sheenGrad = ctx.createLinearGradient(350, 860, 460, 980);
    sheenGrad.addColorStop(0, 'rgba(130, 185, 190, 0.22)');
    sheenGrad.addColorStop(0.5, 'rgba(130, 185, 190, 0.06)');
    sheenGrad.addColorStop(1, 'rgba(130, 185, 190, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(310, 858, 175, 132);

    // Subtle wheel-thrown horizontal ribs
    ctx.strokeStyle = 'rgba(14, 24, 27, 0.25)';
    ctx.lineWidth = 1.4;
    for (let y = 888; y <= 960; y += 18) {
      ctx.beginPath();
      ctx.moveTo(320, y);
      ctx.quadraticCurveTo(500, y + 14, 680, y);
      ctx.stroke();
    }

    // Mineral glaze speckles
    for (let i = 0; i < glazeSpeckles.length; i++) {
      const sp = glazeSpeckles[i];
      ctx.fillStyle = sp.light
        ? `rgba(175, 205, 200, ${sp.a})`
        : `rgba(12, 20, 22, ${sp.a * 1.4})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Kintsugi Gold Lacquer Mend Seam ---
    // Organic meandering crack with a branching hairline
    function traceKintsugiMain() {
      ctx.beginPath();
      ctx.moveTo(576, 868);
      ctx.lineTo(564, 888);
      ctx.lineTo(571, 906);
      ctx.lineTo(552, 926);
      ctx.lineTo(557, 945);
      ctx.lineTo(536, 964);
      ctx.lineTo(532, 983);
    }
    function traceKintsugiFork() {
      ctx.beginPath();
      ctx.moveTo(552, 926);
      ctx.lineTo(526, 934);
      ctx.lineTo(510, 950);
      ctx.lineTo(494, 954);
    }

    // Dark urushi lacquer under-edge
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#24180d';
    ctx.lineWidth = 5.8;
    traceKintsugiMain();
    ctx.stroke();
    ctx.lineWidth = 3.8;
    traceKintsugiFork();
    ctx.stroke();

    // Animated warm gold glint traveling gently along seam
    const shimmerY = 865 + ((Math.sin(t * 0.55) * 0.5 + 0.5) * 120);
    const goldGrad = ctx.createLinearGradient(500, 865, 580, 985);
    goldGrad.addColorStop(0, '#d99e26');
    const glintPos = clamp((shimmerY - 865) / 120, 0.08, 0.92);
    goldGrad.addColorStop(Math.max(0, glintPos - 0.14), '#e3b33a');
    goldGrad.addColorStop(glintPos, '#fff3b8');
    goldGrad.addColorStop(Math.min(1, glintPos + 0.14), '#e3b33a');
    goldGrad.addColorStop(1, '#c4861c');

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 3.4;
    traceKintsugiMain();
    ctx.stroke();
    ctx.lineWidth = 2.1;
    traceKintsugiFork();
    ctx.stroke();

    ctx.restore(); // end pot clip

    // Front flared rim lip
    ctx.beginPath();
    ctx.moveTo(306, 852);
    ctx.quadraticCurveTo(500, 874, 694, 852);
    ctx.quadraticCurveTo(697, 863, 687, 868);
    ctx.quadraticCurveTo(500, 890, 313, 868);
    ctx.quadraticCurveTo(303, 863, 306, 852);
    ctx.closePath();

    const rimGrad = ctx.createLinearGradient(306, 852, 694, 875);
    rimGrad.addColorStop(0, '#4d7379');
    rimGrad.addColorStop(0.35, '#3b5d63');
    rimGrad.addColorStop(0.75, '#274045');
    rimGrad.addColorStop(1, '#1b2e32');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Top bevel highlight on front rim
    ctx.beginPath();
    ctx.moveTo(310, 854);
    ctx.quadraticCurveTo(500, 876, 690, 854);
    ctx.strokeStyle = 'rgba(182, 218, 220, 0.35)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Gold lacquer lip touch where kintsugi crosses the rim
    ctx.beginPath();
    ctx.moveTo(576, 862);
    ctx.lineTo(575, 872);
    ctx.strokeStyle = '#f2cc5a';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  // Draw smooth tapered wood path from animated skeleton points
  function drawTaperedWood(pts, fillStyle, isJin = false) {
    if (pts.length < 2) return;
    const leftSide = [];
    const rightSide = [];

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      let dx, dy;
      if (i === 0) {
        dx = pts[1].x - p.x;
        dy = pts[1].y - p.y;
      } else if (i === pts.length - 1) {
        dx = p.x - pts[i - 1].x;
        dy = p.y - pts[i - 1].y;
      } else {
        dx = pts[i + 1].x - pts[i - 1].x;
        dy = pts[i + 1].y - pts[i - 1].y;
      }
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      leftSide.push({ x: p.x + nx * p.r, y: p.y + ny * p.r });
      rightSide.push({ x: p.x - nx * p.r, y: p.y - ny * p.r });
    }

    ctx.beginPath();
    ctx.moveTo(leftSide[0].x, leftSide[0].y);
    for (let i = 1; i < leftSide.length; i++) {
      const prev = leftSide[i - 1];
      const curr = leftSide[i];
      ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) * 0.5, (prev.y + curr.y) * 0.5);
    }
    const lastL = leftSide[leftSide.length - 1];
    const lastP = pts[pts.length - 1];
    const lastR = rightSide[rightSide.length - 1];
    ctx.lineTo(lastL.x, lastL.y);
    ctx.quadraticCurveTo(lastP.x, lastP.y, lastR.x, lastR.y);

    for (let i = rightSide.length - 2; i >= 0; i--) {
      const next = rightSide[i + 1];
      const curr = rightSide[i];
      ctx.quadraticCurveTo(next.x, next.y, (next.x + curr.x) * 0.5, (next.y + curr.y) * 0.5);
    }
    ctx.lineTo(rightSide[0].x, rightSide[0].y);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();

    // Subtle bark highlight & grain lines along wood
    ctx.save();
    ctx.clip();

    // Lit upper-left edge rim
    ctx.beginPath();
    ctx.moveTo(leftSide[0].x, leftSide[0].y);
    for (let i = 1; i < leftSide.length; i++) {
      ctx.lineTo(leftSide[i].x, leftSide[i].y);
    }
    ctx.strokeStyle = isJin ? 'rgba(248, 244, 236, 0.7)' : 'rgba(154, 134, 114, 0.35)';
    ctx.lineWidth = isJin ? 3 : 4;
    ctx.stroke();

    // Deep shadow edge on right/underside
    ctx.beginPath();
    ctx.moveTo(rightSide[0].x, rightSide[0].y);
    for (let i = 1; i < rightSide.length; i++) {
      ctx.lineTo(rightSide[i].x, rightSide[i].y);
    }
    ctx.strokeStyle = isJin ? 'rgba(85, 78, 70, 0.45)' : 'rgba(28, 20, 16, 0.55)';
    ctx.lineWidth = isJin ? 3.5 : 5;
    ctx.stroke();

    // Organic bark fissures on thicker wood
    if (pts[0].r > 12 && !isJin) {
      ctx.strokeStyle = 'rgba(28, 20, 16, 0.32)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const offset = ((i % 2 === 0) ? 0.28 : -0.25) * p0.r;
        ctx.beginPath();
        ctx.moveTo(p0.x + offset, p0.y);
        ctx.quadraticCurveTo(
          (p0.x + p1.x) * 0.5 - offset * 0.4,
          (p0.y + p1.y) * 0.5,
          p1.x + offset * 0.5,
          p1.y
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawAllWood() {
    // Nebari exposed roots
    const rootGrad = ctx.createLinearGradient(390, 835, 570, 860);
    rootGrad.addColorStop(0, '#5a4a3d');
    rootGrad.addColorStop(0.5, '#47392e');
    rootGrad.addColorStop(1, '#332820');
    for (let i = 0; i < nebariRoots.length; i++) {
      drawTaperedWood(nebariRoots[i], rootGrad);
    }

    // Bleached silver-ivory deadwood Jin
    const jinGrad = ctx.createLinearGradient(486, 650, 554, 615);
    jinGrad.addColorStop(0, '#9e958a');
    jinGrad.addColorStop(0.5, '#cfc8be');
    jinGrad.addColorStop(1, '#e8e2d8');
    drawTaperedWood(jinBranch.worldPts, jinGrad, true);

    // Recursive trunk & branches
    const barkGrad = ctx.createLinearGradient(250, 200, 650, 850);
    barkGrad.addColorStop(0, '#6a5849');
    barkGrad.addColorStop(0.45, '#4f4035');
    barkGrad.addColorStop(1, '#362b23');

    function drawBranchRecursive(br) {
      drawTaperedWood(br.worldPts, barkGrad);
      for (let i = 0; i < br.children.length; i++) {
        drawBranchRecursive(br.children[i].branch);
      }
    }
    drawBranchRecursive(trunk);
  }

  // Draw iconic bilobed ginkgo fan leaf
  function drawGinkgoLeaf(x, y, angle, size, cleft, spread, palette, shade, scaleX = 1, alpha = 1, dewGlow = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI * 0.5); // base at (0,0), fan opens toward -Y
    if (scaleX !== 1) ctx.scale(scaleX, 1);
    if (alpha < 1) ctx.globalAlpha = alpha;

    const stemLen = size * 0.38;
    const fanR = size * 0.88;
    const halfA = spread;

    // Slender petiole stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -stemLen);
    ctx.strokeStyle = rgb(palette.rim, 0.72);
    ctx.lineWidth = Math.max(1.0, size * 0.065);
    ctx.lineCap = 'round';
    ctx.stroke();

    // Fan blade with central bilobed notch
    const lx = -Math.sin(halfA) * fanR;
    const ly = -stemLen - Math.cos(halfA) * fanR;
    const rx = Math.sin(halfA) * fanR;
    const ry = ly;

    const notchY = -stemLen - fanR * (1 - cleft);
    const lobePeakY = -stemLen - fanR * 1.07;

    ctx.beginPath();
    ctx.moveTo(0, -stemLen);
    ctx.quadraticCurveTo(lx * 0.52, -stemLen - fanR * 0.38, lx, ly);
    ctx.quadraticCurveTo(lx * 0.5, lobePeakY, 0, notchY);
    ctx.quadraticCurveTo(rx * 0.5, lobePeakY, rx, ry);
    ctx.quadraticCurveTo(rx * 0.52, -stemLen - fanR * 0.38, 0, -stemLen);
    ctx.closePath();

    const leafGrad = ctx.createLinearGradient(0, -stemLen, 0, lobePeakY);
    const cDark = palette.dark.map(v => clamp(Math.round(v * shade), 0, 255));
    const cMid = palette.mid.map(v => clamp(Math.round(v * shade), 0, 255));
    const cLight = palette.light.map(v => clamp(Math.round(v * shade), 0, 255));
    leafGrad.addColorStop(0, rgb(cDark, 0.94));
    leafGrad.addColorStop(0.58, rgb(cMid, 0.92));
    leafGrad.addColorStop(1, rgb(cLight, 0.94));
    ctx.fillStyle = leafGrad;
    ctx.fill();

    // Crisp delicate outer edge for pale-paper contrast
    ctx.strokeStyle = rgb(palette.rim, 0.34);
    ctx.lineWidth = Math.max(0.7, size * 0.042);
    ctx.stroke();

    // Delicate radiating ginkgo veins
    ctx.beginPath();
    const veinAngles = [-halfA * 0.56, -halfA * 0.2, halfA * 0.2, halfA * 0.56];
    for (let v = 0; v < veinAngles.length; v++) {
      const va = veinAngles[v];
      const vr = fanR * 0.72;
      ctx.moveTo(0, -stemLen - 1);
      ctx.lineTo(Math.sin(va) * vr, -stemLen - Math.cos(va) * vr);
    }
    ctx.strokeStyle = rgb(palette.rim, 0.22);
    ctx.lineWidth = Math.max(0.5, size * 0.03);
    ctx.stroke();

    // Optional morning dew-pearl at leaf cleft
    if (dewGlow > 0.15) {
      ctx.beginPath();
      ctx.arc(0, notchY + 2.5, size * 0.095, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 250, 215, ${dewGlow * 0.85})`;
      ctx.fill();
    }

    ctx.restore();
  }

  function collectPadDraws(branch, seasonBase, t, layers) {
    if (branch.pad && branch.worldPts.length > 0) {
      const tip = branch.worldPts[branch.worldPts.length - 1];
      const tipAngle = branch.segs[branch.segs.length - 1].worldAngle - branch.segs[branch.segs.length - 1].baseAngle;
      const pad = branch.pad;

      for (let i = 0; i < pad.length; i++) {
        const lf = pad[i];
        // Rotate leaf offset slightly with branch tip bend
        const c = Math.cos(tipAngle * 0.5);
        const s = Math.sin(tipAngle * 0.5);
        const wx = tip.x + lf.ox * c - lf.oy * s;
        const wy = tip.y + lf.ox * s + lf.oy * c;

        const flutter = Math.sin(t * lf.flutterFreq + lf.flutterPhase) * 0.11
          + windAt(wx, wy, t) * 2.1;
        const pal = sampleSeasonPalette(seasonBase + lf.colorShift);
        const dewGlow = lf.hasDew ? (0.45 + 0.55 * Math.sin(t * 1.4 + lf.dewPhase)) : 0;

        layers[lf.layer].push({
          x: wx,
          y: wy,
          angle: lf.angle + flutter + tipAngle * 0.4,
          size: lf.size,
          cleft: lf.cleft,
          spread: lf.spread,
          pal,
          shade: lf.shade,
          dewGlow
        });
      }
    }

    for (let i = 0; i < branch.children.length; i++) {
      collectPadDraws(branch.children[i].branch, seasonBase, t, layers);
    }
  }

  function updateAndDrawDriftingLeaves(dt, t, seasonBase) {
    // Shed slightly more gently during golden autumn phase
    const autumnFactor = 0.5 - 0.5 * Math.cos((seasonBase - 0.58) * Math.PI * 2);
    const spawnInterval = lerp(4.8, 1.4, autumnFactor);

    for (let i = 0; i < driftingLeaves.length; i++) {
      const dl = driftingLeaves[i];
      if (!dl.active) {
        dl.timer -= dt;
        if (dl.timer <= 0) {
          const anchor = leafAnchorHints[(i + Math.floor(t)) % leafAnchorHints.length];
          dl.active = true;
          dl.x = anchor.x + (Math.random() - 0.5) * 70;
          dl.y = anchor.y + (Math.random() - 0.5) * 25;
          dl.vx = (Math.random() - 0.35) * 18;
          dl.vy = 18 + Math.random() * 14;
          dl.rot = Math.random() * Math.PI * 2;
          dl.life = 0;
          dl.maxLife = 4.2 + Math.random() * 2.2;
          dl.timer = spawnInterval * (0.6 + Math.random() * 1.2);
        }
        continue;
      }

      dl.life += dt;
      if (dl.life >= dl.maxLife || dl.y > 960) {
        dl.active = false;
        continue;
      }

      const windX = windAt(dl.x, dl.y, t) * 420;
      dl.vx = lerp(dl.vx, windX + Math.sin(t * 1.8 + i) * 24, dt * 1.8);
      dl.x += dl.vx * dt;
      dl.y += (dl.vy + Math.sin(t * 2.6 + i * 2) * 8) * dt;
      dl.rot += dl.spin * dt;
      dl.rollPhase += dt * 2.7;

      const fadeIn = clamp(dl.life / 0.4, 0, 1);
      const fadeOut = clamp((dl.maxLife - dl.life) / 1.1, 0, 1) * clamp((960 - dl.y) / 85, 0, 1);
      const alpha = fadeIn * fadeOut * 0.92;
      const rollScale = 0.32 + 0.68 * Math.abs(Math.cos(dl.rollPhase));
      const pal = sampleSeasonPalette(seasonBase + dl.colorShift + 0.05);

      drawGinkgoLeaf(dl.x, dl.y, dl.rot, dl.size, 0.24, 0.85, pal, 1.04, rollScale, alpha, 0);
    }
  }

  function drawDewMotes(t, seasonBase) {
    ctx.save();
    const pal = sampleSeasonPalette(seasonBase);
    for (let i = 0; i < dewMotes.length; i++) {
      const m = dewMotes[i];
      const px = m.x + Math.sin(t * m.speed + m.phase) * m.drift;
      const py = m.y + Math.cos(t * m.speed * 0.8 + m.phase) * (m.drift * 0.6);
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + m.phase * 2);
      if (pulse < 0.15) continue;

      ctx.beginPath();
      ctx.arc(px, py, m.r * (0.7 + 0.4 * pulse), 0, Math.PI * 2);
      ctx.fillStyle = rgb(pal.light, pulse * 0.35);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Main Render Loop ---
  let lastTime = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    const t = now * 0.001;

    // 48-second continuous seamless seasonal cycle
    const seasonBase = (t / 48) % 1;

    // Decay passive pointer velocity
    pointer.vx *= Math.pow(0.05, dt);
    pointer.vy *= Math.pow(0.05, dt);

    // Update animated skeleton
    updateBranchSkeleton(trunk, trunk.startX, trunk.startY, 0, t);
    updateBranchSkeleton(jinBranch, jinBranch.startX, jinBranch.startY, 0, t);

    // Collect leaves into 3 depth layers so branches weave naturally through foliage
    const leafLayers = [[], [], []];
    collectPadDraws(trunk, seasonBase, t, leafLayers);

    // Clear full canvas transparently
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Transform into 1000x1000 square anchored flush at bottom center
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, originX * dpr, originY * dpr);

    // 1. Pot interior & moss/stones
    drawPotBack(t);
    drawMossAndStones(t);

    // 2. Back foliage layer (behind branches)
    for (let i = 0; i < leafLayers[0].length; i++) {
      const l = leafLayers[0][i];
      drawGinkgoLeaf(l.x, l.y, l.angle, l.size, l.cleft, l.spread, l.pal, l.shade * 0.88, 1, 0.96, 0);
    }

    // 3. Roots, Jin, Trunk & Branches
    drawAllWood();

    // 4. Pot front body & kintsugi seam (over root base)
    drawPotFront(t);

    // 5. Mid & front foliage layers (weaving in front of twigs)
    for (let layerIdx = 1; layerIdx <= 2; layerIdx++) {
      const arr = leafLayers[layerIdx];
      for (let i = 0; i < arr.length; i++) {
        const l = arr[i];
        drawGinkgoLeaf(l.x, l.y, l.angle, l.size, l.cleft, l.spread, l.pal, l.shade, 1, 0.98, l.dewGlow);
      }
    }

    // 6. Drifting fallen leaves & subtle floating light motes
    updateAndDrawDriftingLeaves(dt, t, seasonBase);
    drawDewMotes(t, seasonBase);

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
  "title": "Kintsugi Cloud Ginkgo",
  "statement": "An ancient ginkgo trained in sweeping cloud pads, rooted in a celadon basin mended with a shimmering seam of gold lacquer. As the breeze stirs its pleated fan leaves, the canopy drifts seamlessly from spring jade to autumn saffron and back again."
}
```