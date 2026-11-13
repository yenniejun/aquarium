```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tank</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #02161c;
  }
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    touch-action: auto;
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function () {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  let W = 1, H = 1, dpr = 1;
  let time = 0;
  let last = performance.now();
  let builtFor = "";

  const head = { x: 0, y: 0 };
  let dir = 1;
  let vy = 0;
  let hist = [];
  let mode = "cruise";
  let modeT = 3.5;
  let poi = null;
  let turnLock = 0;
  let pulse = 0;
  let yGoal = 0;
  let ready = false;

  let scene = null;
  const bubbles = [];
  const motes = [];

  const pointer = { x: -9999, y: -9999, on: false };

  window.addEventListener("pointermove", function (e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.on = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= r.width && pointer.y <= r.height;
  }, { passive: true });
  window.addEventListener("pointerleave", function () { pointer.on = false; }, { passive: true });

  function resize() {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    const nd = Math.min(window.devicePixelRatio || 1, 1.6);
    if (nw === W && nh === H && nd === dpr && canvas.width) return;
    const rx = W > 1 ? head.x / W : 0.42;
    const ry = H > 1 ? head.y / H : 0.46;
    W = nw;
    H = nh;
    dpr = nd;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (!ready) {
      head.x = W * 0.42;
      head.y = H * 0.46;
      ready = true;
    } else {
      head.x = rx * W;
      head.y = ry * H;
    }
    yGoal = head.y;
    hist = [];
    clampHead();
  }

  function build() {
    const key = W + "x" + H;
    if (builtFor === key) return;
    builtFor = key;
    const sand = H * 0.8;
    scene = { blades: [], leaves: [], rocks: [], grains: [], pois: [], sand: sand };

    function blade(x, h, w, phase, front, col) {
      scene.blades.push({ x: x, h: h, w: w, phase: phase, front: front, col: col });
    }
    for (let i = 0; i < 10; i++) {
      blade(W * (0.03 + i * 0.016), H * (0.2 + (i % 4) * 0.045), 1.6 + (i % 3) * 0.7, i * 1.1, false, i % 2 ? "#124e44" : "#0d3c38");
    }
    for (let i = 0; i < 8; i++) {
      blade(W * (0.74 + i * 0.028), H * (0.26 + (i % 5) * 0.055), 1.5 + (i % 2), i * 0.85, false, i % 3 ? "#166352" : "#1a7358");
    }
    for (let i = 0; i < 5; i++) {
      blade(W * (0.9 + i * 0.02), H * (0.32 + i * 0.035), 2.1, i * 0.7 + 2, true, "#1b7a5c");
    }
    for (let i = 0; i < 3; i++) {
      blade(W * (0.02 + i * 0.018), H * (0.3 + i * 0.04), 2, i + 4, true, "#145e4c");
    }

    for (let i = 0; i < 6; i++) {
      scene.leaves.push({
        x: W * 0.15,
        base: sand + H * 0.01,
        len: H * (0.16 + i * 0.032),
        ang: -1.05 + i * 0.3,
        phase: i * 0.8,
        col: i % 2 ? "#1c684c" : "#247556",
        rib: "rgba(214,232,190,0.28)"
      });
    }
    for (let i = 0; i < 4; i++) {
      scene.leaves.push({
        x: W * 0.83,
        base: sand + 2,
        len: H * (0.14 + i * 0.03),
        ang: -0.55 + i * 0.32,
        phase: i * 1.1 + 1,
        col: "#1a6048",
        rib: "rgba(214,232,190,0.22)"
      });
    }

    scene.rocks.push({ x: W * 0.22, y: sand + H * 0.012, rx: W * 0.075, ry: H * 0.042, c0: "#9a9084", c1: "#3a4442" });
    scene.rocks.push({ x: W * 0.3, y: sand + H * 0.028, rx: W * 0.05, ry: H * 0.03, c0: "#b0a394", c1: "#4a453c" });
    scene.rocks.push({ x: W * 0.255, y: sand + H * 0.03, rx: W * 0.034, ry: H * 0.022, c0: "#7f8a84", c1: "#2e3a38" });
    scene.rocks.push({ x: W * 0.68, y: sand + H * 0.02, rx: W * 0.09, ry: H * 0.038, c0: "#8d8680", c1: "#323c3a" });
    scene.rocks.push({ x: W * 0.6, y: sand + H * 0.034, rx: W * 0.04, ry: H * 0.02, c0: "#a49888", c1: "#3e3a34" });

    scene.moon = { x: W * 0.145, y: sand - Math.min(W, H) * 0.01, r: Math.min(W, H) * 0.058 };

    for (let i = 0; i < 48; i++) {
      scene.grains.push({
        x: Math.random() * W,
        y: sand + Math.random() * (H - sand),
        r: 0.4 + Math.random() * 1.3,
        a: 0.08 + Math.random() * 0.22
      });
    }

    scene.pois = [
      { x: scene.moon.x + scene.moon.r, y: sand - H * 0.16 },
      { x: W * 0.24, y: H * 0.5 },
      { x: W * 0.62, y: H * 0.38 },
      { x: W * 0.48, y: H * 0.58 },
      { x: W * 0.76, y: H * 0.46 }
    ];

    motes.length = 0;
    const mc = Math.max(18, Math.min(54, Math.floor(W * H / 14000)));
    for (let i = 0; i < mc; i++) {
      motes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.4 + Math.random() * 1.5,
        s: 4 + Math.random() * 12,
        drift: -8 + Math.random() * 16,
        a: 0.12 + Math.random() * 0.4,
        warm: Math.random() > 0.62,
        ph: Math.random() * 6.28
      });
    }

    if (bubbles.length === 0) {
      for (let i = 0; i < 6; i++) bubbles.push(makeBubble(true));
    }
  }

  function makeBubble(anyY) {
    return {
      x: Math.random() * W,
      y: anyY ? Math.random() * H : H * (0.72 + Math.random() * 0.2),
      r: 1.1 + Math.random() * 2.6,
      s: 14 + Math.random() * 22,
      w: Math.random() * 6.28,
      a: 0.35 + Math.random() * 0.5
    };
  }

  function bodyLen() {
    return Math.min(W * 0.34, H * 0.58, 300);
  }

  function clampHead() {
    head.x = Math.max(W * 0.1, Math.min(W * 0.9, head.x));
    head.y = Math.max(H * 0.24, Math.min(H * 0.64, head.y));
  }

  function pickPoi() {
    const list = scene.pois;
    if (pointer.on && Math.random() < 0.45) {
      poi = { x: pointer.x, y: Math.max(H * 0.28, Math.min(H * 0.6, pointer.y)) };
      return;
    }
    poi = list[Math.floor(Math.random() * list.length)];
  }

  function updateFish(dt) {
    const len = bodyLen();
    const cruise = len * 0.26;
    const hover = len * 0.035;
    modeT -= dt;

    if (mode === "cruise" && modeT <= 0) {
      mode = "approach";
      pickPoi();
      modeT = 7;
    } else if (mode === "approach") {
      const dx = poi.x - head.x;
      const dy = poi.y - head.y;
      if (Math.hypot(dx, dy) < Math.min(W, H) * 0.11 || modeT <= 0) {
        mode = "regard";
        modeT = 2.4 + Math.random() * 2.4;
        pulse = 1;
      }
    } else if (mode === "regard" && modeT <= 0) {
      mode = "cruise";
      modeT = 5 + Math.random() * 7;
    }

    let targetDir = dir;
    if (mode === "cruise") {
      if (head.x > W * 0.8) targetDir = -1;
      else if (head.x < W * 0.16) targetDir = 1;
      else if (Math.random() < dt * 0.04) targetDir = -targetDir;
      yGoal = H * (0.34 + 0.2 * (0.5 + 0.5 * Math.sin(time * 0.15)) + 0.03 * Math.sin(time * 0.41));
    } else if (poi) {
      const dx = poi.x - head.x;
      targetDir = dx >= 0 ? 1 : -1;
      if (head.x > W * 0.82) targetDir = -1;
      if (head.x < W * 0.12) targetDir = 1;
      yGoal = Math.max(H * 0.28, Math.min(H * 0.62, poi.y - H * 0.02));
    }

    if (targetDir !== dir && turnLock <= 0) {
      dir = targetDir;
      turnLock = 0.85;
    }
    turnLock = Math.max(0, turnLock - dt);

    const sp = mode === "regard" ? hover : mode === "approach" ? cruise * 0.62 : cruise;
    const wob = 0.86 + 0.14 * Math.sin(time * 1.15);
    head.x += dir * sp * wob * dt;

    const pull = mode === "regard" ? 1.1 : 1.6;
    vy += (yGoal - head.y) * pull * dt;
    vy *= Math.max(0, 1 - 2.4 * dt);
    head.y += vy * dt;
    clampHead();

    const lastH = hist.length ? hist[hist.length - 1] : null;
    if (!lastH || Math.hypot(head.x - lastH.x, head.y - lastH.y) > 1.2) {
      hist.push({ x: head.x, y: head.y });
      if (hist.length > 500) hist.shift();
    }

    if (pulse > 0) pulse = Math.max(0, pulse - dt * 0.38);

    if (mode === "regard" && Math.random() < dt * 0.35) {
      bubbles.push({
        x: head.x + dir * len * 0.08,
        y: head.y + len * 0.02,
        r: 1.2 + Math.random() * 1.6,
        s: 18 + Math.random() * 16,
        w: Math.random() * 6,
        a: 0.7
      });
      if (bubbles.length > 16) bubbles.shift();
    }
  }

  function spinePoints() {
    const n = 12;
    const len = bodyLen();
    const spacing = len / n;
    const pts = [{ x: head.x, y: head.y }];
    let hi = hist.length - 1;
    let cursor = { x: head.x, y: head.y };
    let remain = spacing;
    let guard = 0;
    while (pts.length < n && hi >= 0 && guard < 2000) {
      guard++;
      const h = hist[hi];
      const dx = h.x - cursor.x;
      const dy = h.y - cursor.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.001) {
        hi--;
        continue;
      }
      if (d >= remain) {
        const t = remain / d;
        cursor = { x: cursor.x + dx * t, y: cursor.y + dy * t };
        pts.push({ x: cursor.x, y: cursor.y });
        remain = spacing;
      } else {
        remain -= d;
        cursor = { x: h.x, y: h.y };
        hi--;
      }
    }
    while (pts.length < n) {
      const lastP = pts[pts.length - 1];
      pts.push({ x: lastP.x - dir * spacing, y: lastP.y });
    }
    const amp = Math.min(W, H) * 0.0065;
    for (let i = 0; i < pts.length; i++) {
      pts[i].y += Math.sin(time * 4.6 - i * 0.62) * amp * (1.1 + i * 0.28);
    }
    return pts;
  }

  function upAt(pts, i) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let px = -dy / len;
    let py = dx / len;
    if (py > 0) {
      px = -px;
      py = -py;
    }
    return { x: px, y: py };
  }

  function halfW(t, seg) {
    const s = Math.sin(Math.PI * Math.min(1, t * 0.98 + 0.02));
    const nose = t < 0.12 ? 0.62 + (t / 0.12) * 0.38 : 1;
    return seg * (0.42 + 1.55 * s) * nose;
  }

  function drawRibbon(x, y, length, droop, phase, width, alpha) {
    const steps = 16;
    const up = [];
    const dn = [];
    const finAmp = mode === "regard" ? 1.28 : 1;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const along = u * length;
      const wave =
        Math.sin(time * 2.8 * finAmp + phase + u * 8.2) * length * 0.085 * u * u * finAmp +
        Math.sin(time * 1.35 + phase * 1.4 + u * 3.2) * length * 0.035 * u;
      const cx = x - dir * along;
      const cy = y + droop * u * u + wave;
      const taper = width * (1 - u * 0.9);
      up.push({ x: cx, y: cy - taper });
      dn.push({ x: cx, y: cy + taper });
    }
    ctx.beginPath();
    ctx.moveTo(up[0].x, up[0].y);
    for (let i = 1; i < up.length; i++) ctx.lineTo(up[i].x, up[i].y);
    for (let i = dn.length - 1; i >= 0; i--) ctx.lineTo(dn[i].x, dn[i].y);
    ctx.closePath();
    const g = ctx.createLinearGradient(x, y, x - dir * length, y + droop);
    g.addColorStop(0, "rgba(255, 244, 226, " + alpha + ")");
    g.addColorStop(0.55, "rgba(255, 228, 196, " + alpha * 0.55 + ")");
    g.addColorStop(1, "rgba(255, 220, 186, 0)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i <= steps; i++) {
      ctx.lineTo(up[i].x, (up[i].y + dn[i].y) / 2);
    }
    ctx.strokeStyle = "rgba(255, 250, 240, " + alpha * 0.75 + ")";
    ctx.lineWidth = Math.max(0.6, W / 1400);
    ctx.stroke();
  }

  function drawSail(pts, from, to, dorsal, height) {
    const edge = [];
    ctx.beginPath();
    ctx.moveTo(pts[from].x, pts[from].y);
    for (let i = from; i <= to; i++) {
      const t = (i - from) / Math.max(1, to - from);
      const env = Math.sin(t * Math.PI);
      const wave = 0.78 + 0.22 * Math.sin(time * 3 + (dorsal ? 0.4 : 1.7) + i * 0.55);
      const u = upAt(pts, i);
      const h = height * env * wave * (mode === "regard" ? 1.12 : 1);
      const p = {
        x: pts[i].x + u.x * (dorsal ? h : -h),
        y: pts[i].y + u.y * (dorsal ? h : -h)
      };
      edge.push(p);
      ctx.lineTo(p.x, p.y);
    }
    for (let i = to; i >= from; i--) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = dorsal ? "rgba(255, 239, 220, 0.4)" : "rgba(255, 232, 206, 0.3)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 250, 240, 0.38)";
    ctx.lineWidth = 0.6;
    for (let i = 0; i < edge.length; i += 1) {
      ctx.beginPath();
      ctx.moveTo(pts[from + i].x, pts[from + i].y);
      ctx.lineTo(edge[i].x, edge[i].y);
      ctx.stroke();
    }
    let tip = edge[0];
    for (let i = 1; i < edge.length; i++) {
      if (dorsal ? edge[i].y < tip.y : edge[i].y > tip.y) tip = edge[i];
    }
    return tip;
  }

  function drawPennant(tip, length) {
    ctx.beginPath();
    const c1x = tip.x - dir * length * 0.35;
    const c1y = tip.y - length * 0.08 + Math.sin(time * 2.2) * length * 0.05;
    const c2x = tip.x - dir * length * 0.7;
    const c2y = tip.y + Math.sin(time * 2.6 + 1) * length * 0.14;
    const ex = tip.x - dir * length;
    const ey = tip.y + length * 0.06 + Math.sin(time * 1.8 + 0.4) * length * 0.18;
    ctx.moveTo(tip.x, tip.y);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
    ctx.strokeStyle = "rgba(255, 236, 210, 0.72)";
    ctx.lineWidth = Math.max(0.8, bodyLen() * 0.008);
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(1.1, bodyLen() * 0.012), 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 220, 160, 0.8)";
    ctx.fill();
  }

  function quad(a, b, c, d) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawFish(pts) {
    const n = pts.length;
    const seg = bodyLen() / n;
    const snout = {
      x: pts[0].x + dir * seg * 0.95,
      y: pts[0].y + Math.sin(time * 4.6) * 0.4
    };

    const dors = [snout];
    const vent = [snout];
    const ups = [];
    for (let i = 0; i < n; i++) {
      const u = upAt(pts, i);
      ups.push(u);
      const hw = halfW(i / (n - 1), seg);
      dors.push({ x: pts[i].x + u.x * hw * 0.8, y: pts[i].y + u.y * hw * 0.8 });
      vent.push({ x: pts[i].x - u.x * hw * 1.12, y: pts[i].y - u.y * hw * 1.12 });
    }

    const tail = pts[n - 1];
    const len = bodyLen();
    drawRibbon(tail.x, tail.y - seg * 0.15, len * 0.78, -len * 0.16, 0.4, seg * 0.42, 0.62);
    drawRibbon(tail.x, tail.y + seg * 0.2, len * 0.86, len * 0.2, 1.7, seg * 0.4, 0.58);
    drawRibbon(tail.x, tail.y, len * 0.42, len * 0.02, 0.9, seg * 0.7, 0.28);

    const sailTip = drawSail(pts, 2, 8, true, len * 0.2);
    drawSail(pts, 4, 9, false, len * 0.11);
    drawPennant(sailTip, len * 0.34);

    ctx.beginPath();
    ctx.moveTo(dors[0].x, dors[0].y);
    for (let i = 1; i < dors.length; i++) ctx.lineTo(dors[i].x, dors[i].y);
    for (let i = vent.length - 1; i >= 0; i--) ctx.lineTo(vent[i].x, vent[i].y);
    ctx.closePath();
    ctx.fillStyle = "#163246";
    ctx.fill();

    const dorsCols = ["#1a3850", "#21445c", "#18344a", "#1e4056"];
    const bellyCols = ["#f4ecdc", "#efe4ce", "#f7f1e4", "#e7dcc8"];
    const sheen = (time * 0.11) % 1.35 - 0.2;

    for (let i = 0; i < n - 1; i++) {
      const t0 = i / (n - 1);
      const d0 = dors[i + 1];
      const d1 = dors[i + 2];
      const v0 = vent[i + 1];
      const v1 = vent[i + 2];
      const s0 = pts[i];
      const s1 = pts[i + 1];
      ctx.fillStyle = dorsCols[i % 4];
      quad(d0, d1, s1, s0);
      ctx.fillStyle = bellyCols[i % 4];
      quad(s0, s1, v1, v0);
      if (Math.abs(t0 - sheen) < 0.07) {
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        quad(s0, s1, v1, v0);
      }
    }

    ctx.beginPath();
    ctx.moveTo(snout.x, snout.y);
    ctx.lineTo(dors[1].x, dors[1].y);
    ctx.lineTo(pts[0].x, pts[0].y);
    ctx.lineTo(vent[1].x, vent[1].y);
    ctx.closePath();
    ctx.fillStyle = "#1c3c52";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(snout.x, snout.y);
    ctx.lineTo(pts[0].x, pts[0].y);
    ctx.lineTo(vent[1].x, vent[1].y);
    ctx.closePath();
    ctx.fillStyle = "#f3eadb";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(dors[1].x, dors[1].y);
    for (let i = 2; i < dors.length; i++) ctx.lineTo(dors[i].x, dors[i].y);
    ctx.strokeStyle = "rgba(186, 242, 226, 0.55)";
    ctx.lineWidth = Math.max(0.8, len * 0.007);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pts[1].x, pts[1].y);
    for (let i = 2; i < n - 1; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = "rgba(224, 164, 92, 0.85)";
    ctx.lineWidth = Math.max(0.7, len * 0.006);
    ctx.stroke();

    if (W > 240) {
      ctx.strokeStyle = "rgba(224, 164, 92, 0.75)";
      ctx.lineWidth = Math.max(0.7, len * 0.006);
      ctx.lineCap = "round";
      for (let i = 3; i <= 7; i++) {
        const p = pts[i];
        const u = ups[i];
        ctx.beginPath();
        ctx.moveTo(p.x - u.x * seg * 0.05, p.y - u.y * seg * 0.05);
        ctx.quadraticCurveTo(
          p.x + dir * seg * 0.45 - u.x * seg * 0.35,
          p.y - u.y * seg * 0.45,
          p.x + dir * seg * 0.85,
          p.y + u.y * seg * 0.05
        );
        ctx.stroke();
      }
    }

    const dotT = [0.18, 0.28, 0.36, 0.46, 0.55];
    for (let k = 0; k < dotT.length; k++) {
      const i = Math.min(n - 2, Math.max(1, Math.round(dotT[k] * (n - 1))));
      const u = ups[i];
      const hw = halfW(i / (n - 1), seg);
      const x = pts[i].x + u.x * hw * 0.42;
      const y = pts[i].y + u.y * hw * 0.42;
      const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 1.6 + k));
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.7, seg * 0.11), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 214, 140, " + (0.35 + tw * 0.55) + ")";
      ctx.fill();
    }

    const li = 3;
    const lu = ups[li];
    const lx = pts[li].x + lu.x * seg * 0.05 + dir * seg * 0.1;
    const ly = pts[li].y + lu.y * seg * 0.15;
    const lr = seg * 1.15;
    const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
    const ga = 0.55 + 0.2 * Math.sin(time * 2.1);
    glow.addColorStop(0, "rgba(255, 214, 130, " + ga + ")");
    glow.addColorStop(0.35, "rgba(255, 176, 70, 0.28)");
    glow.addColorStop(1, "rgba(255, 176, 70, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.fill();
    if (pulse > 0) {
      ctx.beginPath();
      ctx.arc(lx, ly, (1.05 - pulse) * seg * 3.2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 220, 160, " + pulse * 0.55 + ")";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    const ei = 1;
    const eu = ups[ei];
    const ex = pts[ei].x + dir * seg * 0.22;
    const ey = pts[ei].y + eu.y * halfW(0.08, seg) * 0.18;
    const er = Math.max(2.1, seg * 0.78);
    ctx.beginPath();
    ctx.ellipse(ex, ey, er * 1.05, er * 1.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f7f1e4";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex, ey, er * 0.72, er * 0.82, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#e2a84a";
    ctx.fill();

    let lookX = dir;
    let lookY = 0;
    if (mode !== "cruise" && poi) {
      lookX = poi.x - ex;
      lookY = poi.y - ey;
    } else if (pointer.on) {
      lookX = pointer.x - ex;
      lookY = pointer.y - ey;
    }
    const ll = Math.hypot(lookX, lookY) || 1;
    const px = ex + (lookX / ll) * er * 0.22;
    const py = ey + (lookY / ll) * er * 0.22;
    ctx.beginPath();
    ctx.arc(px, py, er * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1814";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex - dir * er * 0.28, ey - er * 0.36, er * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(snout.x - dir * seg * 0.08, snout.y + seg * 0.08, seg * 0.1, 0, Math.PI);
    ctx.strokeStyle = "rgba(70, 48, 36, 0.55)";
    ctx.lineWidth = 0.7;
    ctx.stroke();

    const gill = pts[2];
    ctx.beginPath();
    ctx.moveTo(gill.x, gill.y - seg * 0.25);
    ctx.quadraticCurveTo(gill.x - dir * seg * 0.25, gill.y, gill.x, gill.y + seg * 0.45);
    ctx.strokeStyle = "rgba(10, 24, 32, 0.35)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    const flap = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 6.2));
    const fx = pts[3].x;
    const fy = pts[3].y + seg * 0.15;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    const reach = seg * (1.5 + flap * 1.1);
    ctx.quadraticCurveTo(fx - dir * reach * 0.3, fy + reach * 0.55, fx - dir * reach, fy + reach * 0.15);
    ctx.quadraticCurveTo(fx - dir * reach * 0.45, fy + reach * 0.95, fx + dir * seg * 0.1, fy + seg * 0.2);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 236, 214, " + (0.28 + flap * 0.22) + ")";
    ctx.fill();
  }

  function drawBlade(b) {
    const base = scene.sand + 4;
    const sway = Math.sin(time * 0.65 + b.phase) * (10 + b.h * 0.03);
    const tipX = b.x + sway;
    const tipY = base - b.h;
    const c1x = b.x + Math.sin(time * 0.85 + b.phase) * 7;
    const c1y = base - b.h * 0.5;
    ctx.fillStyle = b.col;
    ctx.beginPath();
    ctx.moveTo(b.x - b.w, base);
    ctx.quadraticCurveTo(c1x - b.w * 0.2, c1y, tipX, tipY);
    ctx.quadraticCurveTo(c1x + b.w * 0.7, c1y + 6, b.x + b.w * 0.35, base);
    ctx.closePath();
    ctx.fill();
  }

  function drawLeaf(lf) {
    const sway = Math.sin(time * 0.7 + lf.phase) * 0.09;
    const ang = lf.ang + sway;
    const tipX = lf.x + Math.sin(ang) * lf.len;
    const tipY = lf.base - Math.cos(ang) * lf.len;
    const mx = (lf.x + tipX) / 2;
    const my = (lf.base + tipY) / 2;
    const nx = Math.cos(ang) * lf.len * 0.11;
    const ny = Math.sin(ang) * lf.len * 0.11;
    ctx.fillStyle = lf.col;
    ctx.beginPath();
    ctx.moveTo(lf.x, lf.base);
    ctx.quadraticCurveTo(mx + nx, my + ny, tipX, tipY);
    ctx.quadraticCurveTo(mx - nx * 0.55, my - ny * 0.55, lf.x, lf.base);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lf.x, lf.base);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = lf.rib;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function drawRock(r) {
    const g = ctx.createRadialGradient(r.x - r.rx * 0.25, r.y - r.ry * 0.4, r.rx * 0.1, r.x, r.y, r.rx);
    g.addColorStop(0, r.c0);
    g.addColorStop(1, r.c1);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r.x - r.rx * 0.22, r.y - r.ry * 0.28, r.rx * 0.28, r.ry * 0.18, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fill();
  }

  function drawMoon(m) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, m.y + m.r * 0.42);
    ctx.clip();
    const g = ctx.createRadialGradient(m.x - m.r * 0.32, m.y - m.r * 0.35, m.r * 0.1, m.x, m.y, m.r);
    g.addColorStop(0, "#f6edd4");
    g.addColorStop(0.62, "#e0cfa6");
    g.addColorStop(1, "#b79a72");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(130, 98, 62, 0.16)";
    ctx.beginPath();
    ctx.arc(m.x + m.r * 0.22, m.y + m.r * 0.05, m.r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.x - m.r * 0.28, m.y - m.r * 0.18, m.r * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSand() {
    const sand = scene.sand;
    const g = ctx.createLinearGradient(0, sand - 8, 0, H);
    g.addColorStop(0, "#d9c7a4");
    g.addColorStop(0.35, "#c3ae88");
    g.addColorStop(1, "#8c7356");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, sand + 6);
    const step = Math.max(8, W / 80);
    for (let x = 0; x <= W; x += step) {
      const y = sand + Math.sin(x * 0.018 + 0.6) * 5 + Math.sin(x * 0.006) * 7;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, sand - 4, W, H);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      const y0 = sand + 8 + k * (H - sand) * 0.16;
      ctx.moveTo(0, y0);
      for (let x = 0; x <= W; x += 14) {
        const y = y0
          + Math.sin(x * 0.02 + time * 0.7 + k * 1.3) * 5
          + Math.sin(x * 0.047 - time * 0.45 + k) * 2.5;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255, 236, 196, 0.09)";
      ctx.lineWidth = 7;
      ctx.stroke();
    }
    ctx.restore();

    for (let i = 0; i < scene.grains.length; i++) {
      const gr = scene.grains[i];
      ctx.fillStyle = "rgba(70, 50, 32, " + gr.a + ")";
      ctx.fillRect(gr.x, gr.y, gr.r, gr.r);
    }
  }

  function drawShafts() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i++) {
      const x = W * (0.12 + i * 0.22) + Math.sin(time * 0.18 + i * 1.4) * W * 0.02;
      const g = ctx.createLinearGradient(x, 0, x + 30, H * 0.72);
      g.addColorStop(0, "rgba(255, 226, 176, 0.11)");
      g.addColorStop(1, "rgba(255, 226, 176, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + W * 0.045, 0);
      ctx.lineTo(x + W * 0.09 + Math.sin(time * 0.3 + i) * 12, H * 0.78);
      ctx.lineTo(x + W * 0.02, H * 0.78);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMotes(front) {
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      const frontish = m.r > 1.15;
      if (frontish !== front) continue;
      const tw = 0.55 + 0.45 * Math.sin(time * 1.4 + m.ph);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = m.warm
        ? "rgba(255, 220, 160, " + m.a * tw + ")"
        : "rgba(210, 245, 236, " + m.a * tw + ")";
      ctx.fill();
    }
  }

  function updateMotes(dt) {
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.y -= m.s * dt;
      m.x += (m.drift + Math.sin(time * 0.6 + m.ph) * 6) * dt;
      if (m.y < -4) {
        m.y = H + 2;
        m.x = Math.random() * W;
      }
      if (m.x < -6) m.x = W + 4;
      if (m.x > W + 6) m.x = -4;
    }
  }

  function drawBubbles() {
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(214, 244, 242, " + 0.38 * b.a + ")";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, Math.max(0.4, b.r * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + 0.45 * b.a + ")";
      ctx.fill();
    }
  }

  function updateBubbles(dt) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.s * dt;
      b.x += Math.sin(time * 1.4 + b.w) * 8 * dt;
      b.a *= 1;
      if (b.y < -8) {
        if (bubbles.length > 8) bubbles.splice(i, 1);
        else {
          b.x = Math.random() * W;
          b.y = H * 0.85;
          b.a = 0.4 + Math.random() * 0.4;
        }
      }
    }
  }

  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    time += dt;

    if (!scene) resize();

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0e6670");
    bg.addColorStop(0.28, "#0a525c");
    bg.addColorStop(0.62, "#063842");
    bg.addColorStop(1, "#02161c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const warm = ctx.createRadialGradient(W * 0.42, 0, 8, W * 0.48, H * 0.15, H * 0.85);
    warm.addColorStop(0, "rgba(255, 206, 150, 0.16)");
    warm.addColorStop(1, "rgba(255, 206, 150, 0)");
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, W, H);

    drawShafts();

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#e7fff8";
    for (let i = 0; i < 5; i++) {
      const x = ((time * 28 + i * W / 5) % (W + 50)) - 25;
      ctx.beginPath();
      ctx.ellipse(x, 5 + Math.sin(time * 0.8 + i) * 2, W * 0.035, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (let i = 0; i < scene.leaves.length; i++) drawLeaf(scene.leaves[i]);
    for (let i = 0; i < scene.blades.length; i++) if (!scene.blades[i].front) drawBlade(scene.blades[i]);

    drawSand();
    for (let i = 0; i < scene.rocks.length; i++) drawRock(scene.rocks[i]);
    drawMoon(scene.moon);

    updateFish(dt);
    const pts = spinePoints();
    const shY = scene.sand + 6;
    const depth = (shY - head.y) / H;
    ctx.fillStyle = "rgba(20, 16, 10, " + Math.max(0.04, 0.2 - depth * 0.22) + ")";
    ctx.beginPath();
    ctx.ellipse(pts[4].x, shY, bodyLen() * 0.32, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    updateMotes(dt);
    drawMotes(false);

    const aura = ctx.createRadialGradient(pts[4].x, pts[4].y, 0, pts[4].x, pts[4].y, bodyLen() * 0.55);
    aura.addColorStop(0, "rgba(130, 210, 196, 0.1)");
    aura.addColorStop(1, "rgba(130, 210, 196, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(pts[4].x, pts[4].y, bodyLen() * 0.55, 0, Math.PI * 2);
    ctx.fill();

    drawFish(pts);

    for (let i = 0; i < scene.blades.length; i++) if (scene.blades[i].front) drawBlade(scene.blades[i]);

    updateBubbles(dt);
    drawBubbles();
    drawMotes(true);

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(document.documentElement);
  resize();
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Swoop-Swoop Silkfin",
  "statement": "Folded like a spare note and fringed in silk, the Swoop-Swoop Silkfin edits the water one unhurried lap at a time. Now and then it hovers, lantern lit, as if waiting for the right word."
}
```