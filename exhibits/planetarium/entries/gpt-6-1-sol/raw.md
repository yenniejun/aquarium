```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #030811;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
</head>
<body>
<canvas aria-label="A heron made of stars holds a small, glowing lantern in the night sky."></canvas>
<script>
(() => {
  'use strict';

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const sky = document.createElement('canvas');
  const sc = sky.getContext('2d');

  let size = 0, width = 0, height = 0, ratio = 1;
  let pointerX = 0, pointerY = 0, driftX = 0, driftY = 0;
  let seed = 8147;

  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  }
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => {
    x = clamp(x);
    return x * x * (3 - 2 * x);
  };
  const mix = (a, b, t) => a + (b - a) * t;

  function hash(x, y) {
    let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = smooth(x - ix), fy = smooth(y - iy);
    return mix(
      mix(hash(ix, iy), hash(ix + 1, iy), fx),
      mix(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx), fy
    );
  }
  function cloud(x, y) {
    let v = 0, a = .54;
    for (let i = 0; i < 5; i++) {
      v += noise(x, y) * a;
      x = x * 2.07 + 13.4;
      y = y * 2.07 - 7.8;
      a *= .49;
    }
    return v;
  }

  const stars = Array.from({length: 270}, () => ({
    x: random() * 1.5 - .25,
    y: random() * 1.5 - .25,
    r: .00045 + Math.pow(random(), 4) * .00165,
    phase: random() * Math.PI * 2,
    speed: .3 + random() * .75,
    brightness: .22 + random() * .6,
    warm: random() > .83
  }));

  const points = {
    crown: [.600, .246],
    brow: [.650, .279],
    beak: [.777, .321],
    chin: [.638, .326],
    throat: [.600, .378],
    bend: [.558, .429],
    breast: [.584, .493],
    chest: [.591, .552],
    hip: [.538, .620],
    belly: [.432, .639],
    tail: [.238, .588],
    back: [.310, .484],
    shoulder: [.428, .451],
    nape: [.506, .479],
    neck: [.493, .417],
    upper: [.541, .347],
    crest: [.549, .279],
    feather: [.389, .536],
    wing: [.480, .553],
    knee: [.439, .745],
    ankle: [.402, .809],
    toe: [.474, .813],
    knee2: [.564, .712],
    foot2: [.516, .773],
    hook: [.768, .428],
    lampTop: [.768, .449],
    lampRight: [.808, .494],
    lampBottom: [.768, .557],
    lampLeft: [.728, .494],
    heart: [.768, .501]
  };

  const routes = [
    ['crown','brow','beak','chin','throat','bend','breast','chest','hip','belly','tail','back','shoulder','nape','neck','upper','crest','crown'],
    ['back','feather','wing','hip'],
    ['tail','feather','belly'],
    ['shoulder','wing'],
    ['belly','knee','ankle','toe'],
    ['hip','knee2','foot2'],
    ['beak','hook','lampTop'],
    ['lampTop','lampRight','lampBottom','lampLeft','lampTop']
  ].map(keys => {
    const p = keys.map(k => points[k]);
    const lengths = [];
    let total = 0;
    for (let i = 1; i < p.length; i++) {
      const d = Math.hypot(p[i][0] - p[i-1][0], p[i][1] - p[i-1][1]);
      lengths.push(d);
      total += d;
    }
    return {p, lengths, total};
  });

  function makeSky() {
    const n = 300;
    sky.width = sky.height = n;
    const image = sc.createImageData(n, n);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const u = x / n, v = y / n;
        const f = cloud(u * 5 + 19, v * 5 + 32);
        const ribbon = Math.exp(-Math.pow((u - .23 - .19 * Math.sin(v * 5.7)) / .24, 2));
        const mist = Math.pow(clamp((f - .27) * 1.65), 2) * ribbon;
        const violet = Math.exp(-((u-.30)**2 / .10 + (v-.25)**2 / .13)) * f;
        const distance = Math.hypot(u - .5, v - .5);
        const vignette = 1 - .45 * smooth((distance - .2) / .52);
        const i = (y * n + x) * 4;
        image.data[i]   = (3 + mist * 20 + violet * 16) * vignette;
        image.data[i+1] = (8 + mist * 53 + violet * 7) * vignette;
        image.data[i+2] = (18 + mist * 68 + violet * 34) * vignette;
        image.data[i+3] = 255;
      }
    }
    sc.putImageData(image, 0, 0);

    seed = 7913;
    for (let i = 0; i < 1800; i++) {
      const x = random(), y = random();
      const band = Math.exp(-Math.pow((x - .23 - .19 * Math.sin(y * 5.7)) / .19, 2));
      sc.fillStyle = `rgba(157,193,210,${random() * .13 * band})`;
      sc.fillRect(x*n, y*n, .25 + random()*.35, .25 + random()*.35);
    }
  }

  function resize() {
    width = innerWidth;
    height = innerHeight;
    size = Math.min(width, height);
    ratio = Math.min(devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }

  function glow(x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, `rgba(${color},${alpha})`);
    g.addColorStop(.22, `rgba(${color},${alpha * .34})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function path(route, amount) {
    if (amount <= 0) return;
    const {p, lengths, total} = route;
    let remaining = total * Math.min(1, amount);
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) {
      const part = Math.min(1, remaining / lengths[i-1]);
      ctx.lineTo(
        mix(p[i-1][0], p[i][0], part),
        mix(p[i-1][1], p[i][1], part)
      );
      remaining -= lengths[i-1];
      if (remaining <= 0) break;
    }
    ctx.stroke();
  }

  function spark(x, y, r, alpha, warm, rays) {
    const color = warm ? '255,210,139' : '185,222,242';
    glow(x, y, r * 8, color, alpha * .19);
    ctx.fillStyle = `rgba(${warm ? '255,235,195' : '225,243,255'},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (rays) {
      ctx.strokeStyle = `rgba(${color},${alpha * .44})`;
      ctx.lineWidth = .00065;
      ctx.beginPath();
      ctx.moveTo(x-r*5, y); ctx.lineTo(x+r*5, y);
      ctx.moveTo(x, y-r*7); ctx.lineTo(x, y+r*7);
      ctx.stroke();
    }
  }

  function featherCurves(alpha, time) {
    ctx.strokeStyle = `rgba(140,213,228,${alpha})`;
    ctx.lineWidth = .0007;
    for (let i = 0; i < 5; i++) {
      const d = i * .013;
      ctx.beginPath();
      ctx.moveTo(.431 + d*.4, .465 + d*.3);
      ctx.bezierCurveTo(
        .385 - d*.5, .485 + d*.8,
        .366 - d, .555 + d*.35,
        .258 + d*.7, .582 + d*.22 + Math.sin(time*.7+i)*.0015
      );
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(.554,.284);
    ctx.bezierCurveTo(.516,.275,.501,.251,.481,.263);
    ctx.moveTo(.558,.285);
    ctx.bezierCurveTo(.522,.288,.507,.273,.493,.286);
    ctx.stroke();
  }

  let last = -1;
  const start = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    if (now - last < 32) return;
    last = now;

    const t = (now - start) / 1000;
    const cycle = (t + 6) % 27;
    const appearing = smooth(cycle / 5);
    const vanishing = 1 - smooth((cycle - 20) / 5);
    const presence = appearing * vanishing;
    const wake = smooth((cycle - 6) / 3) * (1 - smooth((cycle - 17) / 4));

    driftX += (pointerX - driftX) * .025;
    driftY += (pointerY - driftY) * .025;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#030811';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate((width-size)/2, (height-size)/2);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.arc(.5, .5, .5, 0, Math.PI*2);
    ctx.clip();

    ctx.drawImage(sky, 0, 0, 1, 1);

    ctx.save();
    ctx.translate(.5 + driftX*.003, .5 + driftY*.003);
    ctx.rotate(t * .0009);
    ctx.translate(-.5, -.5);
    for (const star of stars) {
      const a = star.brightness * (.76 + .24 * Math.sin(t*star.speed + star.phase));
      ctx.fillStyle = `rgba(${star.warm ? '245,215,180' : '183,210,231'},${a})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI*2);
      ctx.fill();
      if (star.r > .0018) {
        glow(star.x, star.y, .009, '155,199,231', a*.11);
      }
    }
    ctx.restore();

    ctx.translate(driftX*.005, driftY*.005 + Math.sin(t*.28)*.0015);

    glow(.46, .46, .26, '63,154,174', .035 + .035*presence);
    glow(.768, .50, .135, '255,172,74', .025 + wake*.045);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let i = 0; i < routes.length; i++) {
      const lantern = i >= 6;
      ctx.lineWidth = .00065;
      ctx.strokeStyle = lantern ? 'rgba(237,194,123,.12)' : 'rgba(157,204,224,.09)';
      path(routes[i], 1);

      const progress = clamp((cycle - i*.36) / (i === 0 ? 4.8 : 2.0));
      ctx.lineWidth = .00115;
      ctx.strokeStyle = lantern
        ? `rgba(255,215,151,${presence*.69})`
        : `rgba(173,220,238,${presence*.53})`;
      path(routes[i], progress);

      ctx.lineWidth = .004;
      ctx.strokeStyle = lantern
        ? `rgba(255,190,104,${presence*.045})`
        : `rgba(122,203,230,${presence*.035})`;
      path(routes[i], progress);
    }

    featherCurves(wake * .24, t);

    let index = 0;
    for (const [key, p] of Object.entries(points)) {
      if (key === 'heart') continue;
      const major = ['crown','shoulder','hip','tail','beak','ankle'].includes(key);
      const lamp = key.startsWith('lamp') || key === 'hook';
      const shimmer = .87 + .13*Math.sin(t*1.3 + index*2.7);
      spark(p[0], p[1], major ? .00225 : .00145,
        (.43 + presence*.51)*shimmer, lamp, major);
      index++;
    }

    const lampPulse = .8 + .12*Math.sin(t*1.8) + .08*Math.sin(t*3.1);
    glow(.768, .501, .044, '255,185,89', .22*lampPulse);
    glow(.768, .501, .014, '255,222,158', .45*lampPulse);
    spark(.768, .501, .0031, .96, true, true);

    // A wandering light is gathered, then sent back into the sky.
    const journey = (cycle - 7) / 12;
    if (journey > 0 && journey < 1) {
      let x, y;
      if (journey < .55) {
        const q = smooth(journey/.55);
        x = mix(.66, .768, q) + Math.sin(q*Math.PI*2)*.055*(1-q);
        y = mix(.82, .501, q);
      } else {
        const q = smooth((journey-.55)/.45);
        x = mix(.768, .85, q) - Math.sin(q*Math.PI)*.06;
        y = mix(.501, .23, q);
      }
      const a = Math.sin(Math.PI*journey);
      glow(x, y, .022, '255,213,145', a*.24);
      spark(x, y, .0018, a, true, false);

      for (let i = 0; i < 9; i++) {
        const delay = i*.006;
        const p = journey-delay;
        if (p <= 0 || p >= .55) continue;
        const q = smooth(p/.55);
        const tx = mix(.66,.768,q) + Math.sin(q*Math.PI*2)*.055*(1-q);
        const ty = mix(.82,.501,q);
        ctx.fillStyle = `rgba(255,207,135,${a*(1-i/9)*.24})`;
        ctx.beginPath();
        ctx.arc(tx,ty,.0008,0,Math.PI*2);
        ctx.fill();
      }
    }

    // Quiet motes hover inside the lantern without ever becoming a flame.
    for (let i = 0; i < 7; i++) {
      const a = t*.37 + i*2.399;
      const x = .768 + Math.sin(a)*(.008 + i*.0015);
      const y = .505 + Math.cos(a*.83+i)*.022;
      ctx.fillStyle = `rgba(255,225,164,${.16+.21*(.5+.5*Math.sin(t+i))})`;
      ctx.beginPath();
      ctx.arc(x, y, .00065, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  }

  addEventListener('resize', resize, {passive: true});
  addEventListener('pointermove', e => {
    pointerX = (e.clientX / width - .5) * 2;
    pointerY = (e.clientY / height - .5) * 2;
  }, {passive: true});
  addEventListener('pointerout', () => {
    pointerX = pointerY = 0;
  }, {passive: true});

  makeSky();
  resize();
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Lantern Heron",
  "statement": "When the sky misplaces a star, the Lantern Heron wades into the dark and carries it home. Its lamp is never the brightest light, only the one that stays."
}
```