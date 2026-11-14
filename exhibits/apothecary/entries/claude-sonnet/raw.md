```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#1d1520}
  canvas{display:block;width:100%;height:100%;touch-action:auto}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  const TAU = Math.PI * 2;
  let W = 0, H = 0, dpr = 1, S = 1, OX = 0, OY = 0;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth || window.innerWidth;
    H = cv.clientHeight || window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    S = Math.min(W / 100, H / 150) * 0.98;
    OX = W / 2 - 50 * S;
    OY = H / 2 - 65 * S;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- glow sprites ----------
  function makeSprite(h){
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0, 'hsla('+h+',100%,96%,1)');
    gr.addColorStop(0.12, 'hsla('+h+',100%,80%,0.85)');
    gr.addColorStop(0.4, 'hsla('+h+',100%,60%,0.25)');
    gr.addColorStop(1, 'hsla('+h+',100%,50%,0)');
    g.fillStyle = gr;
    g.fillRect(0,0,64,64);
    return c;
  }
  const sprites = [makeSprite(48), makeSprite(170), makeSprite(330), makeSprite(110)];

  // ---------- shapes ----------
  const bottle = new Path2D();
  bottle.moveTo(42, 28);
  bottle.lineTo(42, 56);
  bottle.bezierCurveTo(42, 66, 16, 72, 16, 100);
  bottle.bezierCurveTo(16, 122, 32, 133, 50, 133);
  bottle.bezierCurveTo(68, 133, 84, 122, 84, 100);
  bottle.bezierCurveTo(84, 72, 58, 66, 58, 56);
  bottle.lineTo(58, 28);
  bottle.closePath();

  function rr(x,y,w,h,r){
    const p = new Path2D();
    p.moveTo(x+r,y); p.lineTo(x+w-r,y); p.quadraticCurveTo(x+w,y,x+w,y+r);
    p.lineTo(x+w,y+h-r); p.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    p.lineTo(x+r,y+h); p.quadraticCurveTo(x,y+h,x,y+h-r);
    p.lineTo(x,y+r); p.quadraticCurveTo(x,y,x+r,y);
    return p;
  }
  const lip = rr(39, 24, 22, 6, 2.5);
  const cork = new Path2D();
  cork.moveTo(42, 27); cork.lineTo(40.5, 14);
  cork.quadraticCurveTo(50, 11, 59.5, 14);
  cork.lineTo(58, 27); cork.closePath();

  // deterministic pseudo-random
  let seed = 7;
  function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  const specks = [];
  for(let i=0;i<22;i++) specks.push([41+rnd()*18, 13+rnd()*14, 0.25+rnd()*0.5, rnd()]);

  // ---------- state ----------
  const motes = [];
  for(let i=0;i<26;i++){
    const a = rnd()*TAU, r = Math.sqrt(rnd());
    motes.push({
      x: 50 + Math.cos(a)*r*24, y: 106 + Math.sin(a)*r*16,
      vx: 0, vy: 0, ang: rnd()*TAU,
      r: 0.8 + rnd()*1.3,
      s: rnd() < 0.7 ? 0 : (rnd() < 0.6 ? 1 : (rnd() < 0.5 ? 2 : 3)),
      tf: 1 + rnd()*2.5, p: rnd()*TAU
    });
  }
  const bubbles = [], rings = [], drops = [], sparks = [];
  let tilt = 0, tiltV = 0, tiltTarget = 0;
  let ptr = {x:50, y:100, on:false};

  function onMove(e){
    const rect = cv.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    ptr.x = (px - OX) / S; ptr.y = (py - OY) / S; ptr.on = true;
    tiltTarget = ((px / rect.width) - 0.5) * 0.3;
  }
  window.addEventListener('pointermove', onMove, {passive:true});
  document.addEventListener('pointerleave', function(){ ptr.on = false; tiltTarget = 0; });
  window.addEventListener('blur', function(){ ptr.on = false; tiltTarget = 0; });

  let T = 0;
  function surf(x){
    return 82 + tilt * (x - 50) * 1.6
      + 0.9 * Math.sin(x * 0.22 + T * 1.7)
      + 0.6 * Math.sin(x * 0.11 - T * 1.1 + 1.3)
      + Math.abs(tiltV) * 1.2 * Math.sin(x * 0.4 + T * 5);
  }
  function interf(x){
    return 109 + 2.2 * Math.sin(x * 0.12 + T * 0.5) + 1.2 * Math.sin(x * 0.27 - T * 0.8);
  }

  // ---------- update ----------
  function update(dt){
    // slosh spring
    const target = tiltTarget + Math.sin(T * 0.5) * 0.03;
    tiltV += ((target - tilt) * 28 - tiltV * 2.6) * dt;
    tilt += tiltV * dt;

    // motes
    for(const m of motes){
      m.ang += (Math.random() - 0.5) * dt * 9;
      m.vx += Math.cos(m.ang) * dt * 9;
      m.vy += Math.sin(m.ang) * dt * 9;
      const damp = 1 - dt * 1.3;
      m.vx *= damp; m.vy *= damp;
      const dx = m.x - 50, dy = m.y - 106;
      const e = (dx/28)*(dx/28) + (dy/20)*(dy/20);
      if(e > 1){
        const k = (e - 1) * dt * 6;
        m.vx -= dx * k; m.vy -= dy * k;
      }
      const sy = surf(m.x) + 5;
      if(m.y < sy) m.vy += (sy - m.y) * dt * 8;
      if(ptr.on){
        const px = ptr.x - m.x, py = ptr.y - m.y;
        const d = Math.hypot(px, py);
        if(d < 45 && d > 0.1){
          const f = (1 - d / 45) * dt * 16;
          m.vx += px / d * f; m.vy += py / d * f;
        }
      }
      m.x += m.vx * dt; m.y += m.vy * dt;
    }

    // bubbles
    if(Math.random() < dt * 1.8 && bubbles.length < 14){
      bubbles.push({x: 36 + Math.random()*28, y: 125, r: 0.6 + Math.random()*1.7,
        v: 6 + Math.random()*7, p: Math.random()*TAU});
    }
    for(let i = bubbles.length - 1; i >= 0; i--){
      const b = bubbles[i];
      b.y -= b.v * dt * (1 + (2 - b.r) * 0.1);
      b.x += Math.sin(T * 3 + b.p) * dt * 4;
      b.r += dt * 0.12;
      const sy = surf(b.x);
      if(b.y < sy + b.r * 0.5){
        rings.push({x: b.x, y: sy, age: 0, r: b.r});
        const n = 2 + (Math.random() * 3 | 0);
        for(let k = 0; k < n; k++){
          drops.push({x: b.x, y: sy, vx: (Math.random() - 0.5) * 12, vy: -5 - Math.random() * 8, life: 0.7});
        }
        bubbles.splice(i, 1);
      }
    }
    for(let i = rings.length - 1; i >= 0; i--){
      rings[i].age += dt;
      if(rings[i].age > 0.7) rings.splice(i, 1);
    }
    for(let i = drops.length - 1; i >= 0; i--){
      const d = drops[i];
      d.vy += 40 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt;
      if(d.life <= 0 || d.y > surf(d.x)) drops.splice(i, 1);
    }

    // sparks from sprout
    if(Math.random() < dt * 1.6 && sparks.length < 14 && sproutTip){
      sparks.push({x: sproutTip.x, y: sproutTip.y, vx: (Math.random() - 0.5) * 4,
        vy: -4 - Math.random() * 4, life: 2.6, max: 2.6, s: Math.random() < 0.5 ? 0 : 3,
        p: Math.random() * TAU});
    }
    for(let i = sparks.length - 1; i >= 0; i--){
      const s = sparks[i];
      s.life -= dt;
      s.x += (s.vx + Math.sin(T * 2 + s.p) * 2.5) * dt; s.y += s.vy * dt;
      if(s.life <= 0) sparks.splice(i, 1);
    }
  }

  // ---------- sprout ----------
  let sproutTip = null;
  function drawSprout(h1){
    const L = 17, N = 30, ds = L / N;
    const K = 1.55 + 0.3 * Math.sin(T * 0.7) + (ptr.on ? 0.15 : 0);
    let x = 50, y = 12.5, hd = -Math.PI / 2 + 0.12 * Math.sin(T * 0.9);
    const pts = [[x, y, hd]];
    for(let i = 1; i <= N; i++){
      const u = i / N;
      hd += K * Math.pow(u, 2.2) * ds + 0.02 * Math.sin(T * 1.2 - u * 3) * ds * 4;
      x += Math.cos(hd) * ds; y += Math.sin(hd) * ds;
      pts.push([x, y, hd]);
    }
    sproutTip = {x: x, y: y};
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'hsl(' + (h1 - 40) + ',60%,62%)';
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for(let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    // leaves
    const leaves = [[9, -1], [15, 1]];
    for(const lf of leaves){
      const p = pts[lf[0]];
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.rotate(p[2] + lf[1] * (1.0 + 0.15 * Math.sin(T * 1.3 + lf[0])));
      ctx.fillStyle = 'hsl(' + (h1 - 30) + ',55%,58%)';
      ctx.beginPath();
      ctx.ellipse(2.4, 0, 2.6, 1.15, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // ---------- draw ----------
  function frame(ms){
    const t = ms / 1000;
    const dt = Math.min(0.05, t - (frame.last || t));
    frame.last = t;
    T = t;
    update(dt);

    const h1 = 168 + 18 * Math.sin(T * 0.15);
    const h2 = 275 + 25 * Math.sin(T * 0.11 + 1);
    const breathe = 0.5 + 0.5 * Math.sin(T * 0.9);

    // backdrop
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    let bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1b1320');
    bg.addColorStop(1, '#2a1a22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * OX, dpr * OY);

    // ambient glow
    let ag = ctx.createRadialGradient(50, 100, 5, 50, 100, 90);
    ag.addColorStop(0, 'hsla(' + h1 + ',80%,55%,' + (0.2 + 0.08 * breathe) + ')');
    ag.addColorStop(0.5, 'hsla(' + h2 + ',70%,40%,0.08)');
    ag.addColorStop(1, 'hsla(' + h2 + ',70%,40%,0)');
    ctx.fillStyle = ag;
    ctx.fillRect(-60, -40, 220, 240);

    // contact shadow + caustic light
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(50, 134.5, 36, 3.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'hsla(' + h1 + ',80%,60%,' + (0.16 + 0.08 * breathe) + ')';
    ctx.beginPath(); ctx.ellipse(50 + tilt * 40, 135, 26 + 3 * breathe, 2.2, 0, 0, TAU); ctx.fill();

    // glass back
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill(bottle);

    ctx.save();
    ctx.clip(bottle);

    // liquid
    ctx.beginPath();
    ctx.moveTo(0, surf(0));
    for(let x = 4; x <= 100; x += 4) ctx.lineTo(x, surf(x));
    ctx.lineTo(100, 150); ctx.lineTo(0, 150); ctx.closePath();
    let lg = ctx.createLinearGradient(0, 78, 0, 134);
    lg.addColorStop(0, 'hsla(' + h1 + ',85%,66%,0.9)');
    lg.addColorStop(0.45, 'hsla(' + (h1 + 35) + ',80%,48%,0.92)');
    lg.addColorStop(1, 'hsla(' + (h1 + 80) + ',70%,30%,0.96)');
    ctx.fillStyle = lg;
    ctx.fill();

    // dense lower layer
    ctx.beginPath();
    ctx.moveTo(0, interf(0));
    for(let x = 4; x <= 100; x += 4) ctx.lineTo(x, interf(x));
    ctx.lineTo(100, 150); ctx.lineTo(0, 150); ctx.closePath();
    let lg2 = ctx.createLinearGradient(0, 106, 0, 134);
    lg2.addColorStop(0, 'hsla(' + h2 + ',75%,45%,0.75)');
    lg2.addColorStop(1, 'hsla(' + (h2 + 35) + ',80%,28%,0.95)');
    ctx.fillStyle = lg2;
    ctx.fill();
    ctx.strokeStyle = 'hsla(' + (h2 + 40) + ',100%,80%,0.35)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, interf(0));
    for(let x = 4; x <= 100; x += 4) ctx.lineTo(x, interf(x));
    ctx.stroke();

    // inner glow
    ctx.globalCompositeOperation = 'lighter';
    let ig = ctx.createRadialGradient(50, 104, 2, 50, 104, 38);
    ig.addColorStop(0, 'hsla(' + (h1 + 10) + ',90%,60%,' + (0.2 + 0.12 * breathe) + ')');
    ig.addColorStop(1, 'hsla(' + h1 + ',90%,60%,0)');
    ctx.fillStyle = ig;
    ctx.fillRect(0, 60, 100, 80);

    // constellation lines
    ctx.lineWidth = 0.35;
    ctx.lineCap = 'round';
    for(let i = 0; i < motes.length; i++){
      const a = motes[i];
      for(let j = i + 1; j < motes.length; j++){
        const b = motes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if(d < 22){
          const al = (1 - d / 22) * 0.55;
          ctx.strokeStyle = 'rgba(255,240,205,' + al.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    // motes
    for(const m of motes){
      const tw = 0.6 + 0.4 * Math.sin(T * m.tf + m.p);
      const sz = m.r * 6 * (0.8 + 0.4 * tw);
      ctx.globalAlpha = 0.5 + 0.5 * tw;
      ctx.drawImage(sprites[m.s], m.x - sz / 2, m.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // bubbles
    for(const b of bubbles){
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 0.35;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, TAU); ctx.fill();
    }

    // surface line
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'hsla(' + h1 + ',100%,88%,0.18)';
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(0, surf(0));
    for(let x = 4; x <= 100; x += 4) ctx.lineTo(x, surf(x));
    ctx.stroke();
    ctx.strokeStyle = 'hsla(' + h1 + ',100%,92%,0.75)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // pop rings + droplets
    for(const r of rings){
      const k = r.age / 0.7;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - k)).toFixed(3) + ')';
      ctx.lineWidth = 0.35;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r + k * 5, (r.r + k * 5) * 0.28, 0, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = 'hsla(' + h1 + ',100%,88%,0.85)';
    for(const d of drops){
      ctx.beginPath(); ctx.arc(d.x, d.y, 0.4, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // glass front: rim thickness, highlights, outline
    ctx.save();
    ctx.clip(bottle);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 3.2;
    ctx.stroke(bottle);
    ctx.restore();

    ctx.strokeStyle = 'rgba(235,250,255,0.55)';
    ctx.lineWidth = 0.7;
    ctx.stroke(bottle);

    const sh = 0.32 + 0.08 * Math.sin(T * 0.8);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,' + sh.toFixed(3) + ')';
    ctx.lineWidth = 1.7;
    ctx.beginPath(); ctx.moveTo(23, 90); ctx.bezierCurveTo(21, 104, 27, 117, 37, 124); ctx.stroke();
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(45.3, 33); ctx.lineTo(45.3, 53); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(77, 90); ctx.quadraticCurveTo(79, 96, 78.5, 102); ctx.stroke();
    ctx.beginPath(); ctx.arc(70, 123, 0.5, 0, TAU); ctx.stroke();

    // lip
    ctx.fillStyle = 'rgba(210,240,245,0.22)';
    ctx.fill(lip);
    ctx.strokeStyle = 'rgba(235,250,255,0.6)';
    ctx.lineWidth = 0.6;
    ctx.stroke(lip);

    // cork
    let cg = ctx.createLinearGradient(40, 0, 60, 0);
    cg.addColorStop(0, '#9c6b3a'); cg.addColorStop(0.45, '#dcb27a'); cg.addColorStop(1, '#94632f');
    ctx.fillStyle = cg;
    ctx.fill(cork);
    ctx.save();
    ctx.clip(cork);
    for(const s of specks){
      ctx.fillStyle = 'rgba(90,55,25,' + (0.25 + s[3] * 0.3).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s[0], s[1], s[2], 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(60,35,15,0.5)';
    ctx.lineWidth = 0.4;
    ctx.stroke(cork);

    // sprout
    drawSprout(h1);
    ctx.globalCompositeOperation = 'lighter';
    const bs = 8 + 3 * Math.sin(T * 2.2);
    ctx.drawImage(sprites[0], sproutTip.x - bs / 2, sproutTip.y - bs / 2, bs, bs);
    for(const s of sparks){
      const k = s.life / s.max;
      ctx.globalAlpha = Math.min(1, k * 2) * (0.5 + 0.5 * Math.sin(T * 6 + s.p)) ;
      const z = 3.2 * (0.5 + k);
      ctx.drawImage(sprites[s.s], s.x - z / 2, s.y - z / 2, z, z);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

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
  "title": "Wonder-Wander Wobble",
  "statement": "A draught for the endlessly curious: tiny golden stars drift through the glowing brew and link up into constellations of half-formed ideas before slipping apart again. The sprout on the cork curls tighter whenever it's thinking, and the whole bottle sloshes toward whatever catches your eye."
}
```