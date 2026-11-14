```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: #050914;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<canvas id="sky"></canvas>
<script>
(() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d", { alpha: false });
  let W = 0, H = 0, S = 0, stars = [];

  function rng(seed) {
    return () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    S = Math.min(W, H) * 0.42;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const random = rng(72491);
    stars = Array.from({ length: Math.max(100, Math.floor(W * H / 3100)) }, () => ({
      x: random() * W,
      y: random() * H,
      r: 0.35 + random() * 1.15,
      phase: random() * Math.PI * 2,
      speed: 0.25 + random() * 0.8,
      warmth: random()
    }));
  }

  window.addEventListener("resize", resize);
  resize();

  const P = {
    head: [0, -0.15],
    neck: [0, -0.065],
    thorax: [0, 0.015],
    belly: [0, 0.13],
    tip: [0, 0.29],
    antL1: [-0.075, -0.205],
    antL2: [-0.17, -0.295],
    antR1: [0.075, -0.205],
    antR2: [0.17, -0.295],

    l0: [-0.035, -0.025],
    l1: [-0.18, -0.095],
    l2: [-0.34, -0.215],
    l3: [-0.55, -0.27],
    l4: [-0.48, -0.105],
    l5: [-0.59, 0.025],
    l6: [-0.43, 0.16],
    l7: [-0.19, 0.105],
    l8: [-0.035, 0.055],

    r0: [0.035, -0.025],
    r1: [0.18, -0.095],
    r2: [0.34, -0.215],
    r3: [0.55, -0.27],
    r4: [0.48, -0.105],
    r5: [0.59, 0.025],
    r6: [0.43, 0.16],
    r7: [0.19, 0.105],
    r8: [0.035, 0.055],

    mote: [0.54, 0.36]
  };

  const strokes = [
    ["head", "neck"], ["neck", "thorax"], ["thorax", "belly"], ["belly", "tip"],
    ["head", "antL1"], ["antL1", "antL2"], ["head", "antR1"], ["antR1", "antR2"],
    ["l0", "l1"], ["l1", "l2"], ["l2", "l3"], ["l3", "l4"], ["l4", "l5"],
    ["l5", "l6"], ["l6", "l7"], ["l7", "l8"], ["l8", "l0"],
    ["r0", "r1"], ["r1", "r2"], ["r2", "r3"], ["r3", "r4"], ["r4", "r5"],
    ["r5", "r6"], ["r6", "r7"], ["r7", "r8"], ["r8", "r0"],
    ["l1", "thorax"], ["l7", "belly"], ["r1", "thorax"], ["r7", "belly"],
    ["l2", "l5"], ["l4", "l7"], ["r2", "r5"], ["r4", "r7"]
  ];

  const at = (p) => [W / 2 + p[0] * S, H / 2 + p[1] * S];

  function drawBackground(t) {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#080e20");
    bg.addColorStop(0.52, "#0a1428");
    bg.addColorStop(1, "#10152a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const mist = ctx.createRadialGradient(cx - S * 0.22, cy - S * 0.12, 0, cx, cy, S * 1.04);
    mist.addColorStop(0, "rgba(54,91,127,0.17)");
    mist.addColorStop(0.45, "rgba(36,58,99,0.09)");
    mist.addColorStop(1, "rgba(5,9,20,0)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, W, H);

    const blush = ctx.createRadialGradient(cx + S * 0.40, cy + S * 0.12, 0, cx + S * 0.40, cy + S * 0.12, S * 0.48);
    blush.addColorStop(0, "rgba(108,63,106,0.09)");
    blush.addColorStop(1, "rgba(108,63,106,0)");
    ctx.fillStyle = blush;
    ctx.fillRect(0, 0, W, H);

    const turn = t * 0.000012;
    for (const s of stars) {
      const dx = s.x - cx, dy = s.y - cy;
      const x = cx + dx * Math.cos(turn) - dy * Math.sin(turn);
      const y = cy + dx * Math.sin(turn) + dy * Math.cos(turn);
      const twinkle = 0.48 + 0.52 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase));
      const alpha = (0.22 + twinkle * 0.68) * (0.55 + s.r * 0.25);
      ctx.beginPath();
      ctx.fillStyle = s.warmth > 0.82
        ? `rgba(255,218,173,${alpha})`
        : `rgba(190,220,255,${alpha})`;
      ctx.arc(x, y, s.r * (0.72 + twinkle * 0.35), 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 1.15 && twinkle > 0.83) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(185,218,255,${alpha * 0.16})`;
        ctx.arc(x, y, s.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function smooth(a, b, x) {
    x = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return x * x * (3 - 2 * x);
  }

  function drawMoth(t, reveal) {
    const pulse = 0.82 + 0.18 * Math.sin(t * 0.0014);
    const visibility = reveal * pulse;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const wingFill = (side) => {
      const names = side === "l"
        ? ["l0","l1","l2","l3","l4","l5","l6","l7","l8"]
        : ["r0","r1","r2","r3","r4","r5","r6","r7","r8"];
      ctx.beginPath();
      names.forEach((name, i) => {
        const [x, y] = at(P[name]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = `rgba(111,177,190,${0.027 * visibility})`;
      ctx.fill();
    };
    wingFill("l");
    wingFill("r");

    const segmentCount = strokes.length;
    const drawn = smooth(0, 1, reveal) * segmentCount;
    for (let i = 0; i < segmentCount; i++) {
      const amount = Math.max(0, Math.min(1, drawn - i));
      if (!amount) continue;
      const a = at(P[strokes[i][0]]);
      const b = at(P[strokes[i][1]]);
      const ex = a[0] + (b[0] - a[0]) * amount;
      const ey = a[1] + (b[1] - a[1]) * amount;

      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = i < 8
        ? `rgba(255,220,166,${0.68 * visibility})`
        : `rgba(151,220,224,${0.57 * visibility})`;
      ctx.lineWidth = Math.max(0.8, S * 0.0032);
      ctx.shadowBlur = S * 0.022;
      ctx.shadowColor = i < 8 ? "#ffd79d" : "#8ee8e3";
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    const veinAlpha = visibility * 0.34;
    for (const pair of [
      ["l1","l4"], ["l2","l6"], ["l4","l7"],
      ["r1","r4"], ["r2","r6"], ["r4","r7"]
    ]) {
      const a = at(P[pair[0]]), b = at(P[pair[1]]);
      ctx.beginPath();
      ctx.moveTo(...a);
      ctx.quadraticCurveTo(W / 2, H / 2, ...b);
      ctx.strokeStyle = `rgba(171,218,209,${veinAlpha})`;
      ctx.lineWidth = Math.max(0.6, S * 0.0016);
      ctx.stroke();
    }

    const nodeNames = Object.keys(P).filter(n => n !== "mote");
    for (const name of nodeNames) {
      const [x, y] = at(P[name]);
      const important = ["head", "thorax", "tip", "l3", "l5", "r3", "r5"].includes(name);
      const tw = 0.72 + 0.28 * Math.sin(t * 0.0018 + name.length * 1.7);
      const radius = (important ? 2.5 : 1.35) * (W < 250 ? 0.8 : 1);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,${important ? 232 : 216},${important ? 188 : 177},${0.32 + 0.68 * visibility * tw})`;
      ctx.shadowBlur = important ? S * 0.035 : S * 0.018;
      ctx.shadowColor = "#ffdfa9";
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    const tail = at(P.tip);
    const satellite = at(P.mote);
    const drift = Math.sin(t * 0.00045) * S * 0.012;
    ctx.beginPath();
    ctx.moveTo(tail[0], tail[1]);
    ctx.bezierCurveTo(
      tail[0] + S * 0.22, tail[1] + S * 0.15,
      satellite[0] - S * 0.20, satellite[1] + drift,
      satellite[0], satellite[1] + drift
    );
    ctx.setLineDash([S * 0.009, S * 0.016]);
    ctx.lineDashOffset = -t * 0.012;
    ctx.strokeStyle = `rgba(243,199,151,${0.26 + 0.42 * visibility})`;
    ctx.lineWidth = Math.max(0.7, S * 0.0018);
    ctx.stroke();
    ctx.setLineDash([]);

    const motePulse = 0.7 + 0.3 * Math.sin(t * 0.0021);
    const mx = satellite[0], my = satellite[1] + drift;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = `rgba(255,230,184,${0.7 + 0.3 * motePulse})`;
    ctx.shadowColor = "#ffdca4";
    ctx.shadowBlur = S * 0.045;
    ctx.fillRect(-S * 0.009, -S * 0.009, S * 0.018, S * 0.018);
    ctx.restore();

    ctx.restore();
  }

  function frame(now) {
    drawBackground(now);

    const cycle = (now % 18000) / 18000;
    const reveal = smooth(0.07, 0.48, cycle) * (1 - smooth(0.75, 0.94, cycle));
    drawMoth(now, reveal);

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
  "title": "The Threadbearer Moth",
  "statement": "It gathers the small, unfinished questions drifting through the dark and stitches them into wings of starlight. One thread is always left loose, so wonder can wander on."
}
```