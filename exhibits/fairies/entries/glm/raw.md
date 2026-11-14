**My card:** *The Fairy of Last Light* — the dusk fairy who tends the sun's final ember as it slips below the hills. I wanted her sorrowful and tender: a dark silhouette rimmed by the very light she's charged with keeping, wings like stained glass, dust falling from her hem as she hovers guard over the glowing sliver.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#0b0812}
  canvas{display:block;width:100vw;height:100vh;touch-action:pan-y}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
"use strict";
const cv=document.getElementById('c'), x=cv.getContext('2d');
let W=0,H=0,dpr=1,off=null,octx=null,horizonY=0;
let stars=[],motes=[],dust=[],clouds=[];
let px=0.5,py=0.35,tilt=0;

function nearHillY(xx){
  return H*0.80 - H*(0.035*(0.5+0.5*Math.sin(xx/W*7+1.2)) + 0.015*(0.5+0.5*Math.sin(xx/W*17+4)));
}
function hill(o,base,a1,f1,p1,a2,f2,p2,color){
  o.beginPath();o.moveTo(0,H);
  for(let i=0;i<=64;i++){
    const xx=W*i/64;
    const yy=H*base - H*(a1*(0.5+0.5*Math.sin(xx/W*f1+p1)) + a2*(0.5+0.5*Math.sin(xx/W*f2+p2)));
    o.lineTo(xx,yy);
  }
  o.lineTo(W,H);o.closePath();o.fillStyle=color;o.fill();
}
function branch(o,x0,y0,ang,len,w,d){
  const x1=x0+Math.cos(ang)*len, y1=y0+Math.sin(ang)*len;
  o.lineWidth=Math.max(w,0.5);o.beginPath();o.moveTo(x0,y0);o.lineTo(x1,y1);o.stroke();
  if(d>0&&len>3){
    const n=2+(Math.random()*2|0);
    for(let i=0;i<n;i++){
      branch(o,x1,y1,ang+(Math.random()-0.5)*1.0+(i-0.6)*0.45,len*(0.58+Math.random()*0.18),w*0.62,d-1);
    }
  }
}
function build(){
  W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  x.setTransform(dpr,0,0,dpr,0,0);
  horizonY=H*0.66;
  off=document.createElement('canvas');
  off.width=cv.width;off.height=cv.height;
  const o=off.getContext('2d');
  o.setTransform(dpr,0,0,dpr,0,0);
  octx=o;

  // ---- dusk sky ----
  const g=o.createLinearGradient(0,0,0,horizonY);
  g.addColorStop(0,'#0c0920');g.addColorStop(0.34,'#221540');
  g.addColorStop(0.60,'#4a2a55');g.addColorStop(0.79,'#8a4356');
  g.addColorStop(0.92,'#c96b48');g.addColorStop(1,'#eb9c5c');
  o.fillStyle=g;o.fillRect(0,0,W,horizonY+1);
  const gg=o.createLinearGradient(0,horizonY,0,H);
  gg.addColorStop(0,'#2f182a');gg.addColorStop(1,'#090611');
  o.fillStyle=gg;o.fillRect(0,horizonY,W,H-horizonY);

  // ---- static glow of the last light ----
  o.globalCompositeOperation='lighter';
  const rg=o.createRadialGradient(W/2,horizonY,0,W/2,horizonY,W*0.55);
  rg.addColorStop(0,'rgba(255,145,66,0.55)');
  rg.addColorStop(0.35,'rgba(232,110,70,0.24)');
  rg.addColorStop(1,'rgba(0,0,0,0)');
  o.fillStyle=rg;o.fillRect(0,0,W,horizonY+H*0.05);
  o.globalCompositeOperation='source-over';

  // ---- hills ----
  hill(o,0.705,0.04,6,0.4,0.016,15,2.5,'#1f1230');
  hill(o,0.80,0.035,7,1.2,0.015,17,4,'#120b1e');

  // ---- one bare tree, keeping watch ----
  o.strokeStyle='#0a0614';o.lineCap='round';
  branch(o,W*0.13,nearHillY(W*0.13)+2,-Math.PI/2+0.07,H*0.105,H*0.009,5);

  // ---- dynamic populations ----
  stars=[];
  const ns=Math.round(70+W/12);
  for(let i=0;i<ns;i++){
    stars.push({x:Math.random()*W,y:Math.random()*horizonY*0.55,
      r:0.4+Math.random()*1.0,ph:Math.random()*6.28,sp:0.4+Math.random()*1.2,
      big:Math.random()<0.08});
  }
  motes=[];
  for(let i=0;i<55;i++){
    motes.push({x:W/2+(Math.random()-0.5)*W*0.8,
      y:horizonY-Math.random()*H*0.30,
      vy:(5+Math.random()*12),ph:Math.random()*6.28,sz:0.7+Math.random()*1.4});
  }
  dust=[];
  clouds=[];
  for(let i=0;i<3;i++){
    const c={x:Math.random()*W,y:horizonY-H*(0.05+Math.random()*0.09),
      spd:(2+Math.random()*4),blobs:[]};
    const nb=3+(Math.random()*3|0);
    for(let b=0;b<nb;b++){
      c.blobs.push({dx:(b-nb/2)*W*0.035,dy:(Math.random()-0.5)*H*0.012,
        rx:W*(0.03+Math.random()*0.04),ry:H*(0.008+Math.random()*0.008)});
    }
    clouds.push(c);
  }
}

// ---------- one wing, drawn pointing along +x ----------
function wing(s,len,wid,alpha){
  const grd=x.createLinearGradient(0,0,len*s,0);
  grd.addColorStop(0,'rgba(255,192,122,'+alpha+')');
  grd.addColorStop(0.45,'rgba(212,160,200,'+(alpha*0.45)+')');
  grd.addColorStop(1,'rgba(138,180,255,'+(alpha*0.14)+')');
  x.beginPath();
  x.moveTo(0,0);
  x.bezierCurveTo(len*0.30*s,-wid*0.9*s, len*0.80*s,-wid*0.75*s, len*s,-wid*0.15*s);
  x.bezierCurveTo(len*0.75*s,wid*0.35*s, len*0.25*s,wid*0.28*s, 0,wid*0.15*s);
  x.closePath();
  x.fillStyle=grd;x.fill();
  x.strokeStyle='rgba(255,222,182,'+(alpha*0.55)+')';
  x.lineWidth=0.8*s;
  x.beginPath();
  x.moveTo(0,wid*0.08*s);x.quadraticCurveTo(len*0.45*s,-wid*0.35*s,len*0.9*s,-wid*0.12*s);
  x.moveTo(0,wid*0.05*s);x.quadraticCurveTo(len*0.4*s,wid*0.1*s,len*0.7*s,wid*0.1*s);
  x.stroke();
}

function drawFairy(t,dt){
  const s=Math.max(0.5,Math.min(1.5,Math.min(W,H*0.667)/430));
  const fx=W*0.5+Math.sin(t*0.23)*W*0.012;
  const fy=horizonY-H*0.205+Math.sin(t*0.8)*H*0.008;
  const sway=Math.sin(t*0.6)*4*s;

  // ease head toward pointer, plus slow wander
  const want=Math.max(-0.5,Math.min(0.5,(px-0.5)*1.8))+0.14*Math.sin(t*0.37);
  tilt+=(want-tilt)*Math.min(1,dt*2.5);

  x.save();
  x.translate(fx,fy);
  x.rotate(Math.sin(t*0.33)*0.03);

  const flap=Math.sin(t*2.6);
  const flap2=Math.sin(t*2.6+0.7);

  // ---- wings (luminous, behind the body) ----
  x.globalCompositeOperation='lighter';
  // upper small pair
  for(const m of [1,-1]){
    x.save();x.translate(3*s*m,-50*s);
    if(m<0)x.scale(-1,1);
    x.rotate(-1.05+flap2*0.30);
    wing(s,55,17,0.32);
    x.restore();
  }
  // main pair
  for(const m of [1,-1]){
    x.save();x.translate(4*s*m,-44*s);
    if(m<0)x.scale(-1,1);
    x.rotate(-1.38+flap*0.17);
    wing(s,94,30,0.55);
    x.restore();
  }
  x.globalCompositeOperation='source-over';

  // ---- body: a slim dark silhouette ----
  const body=new Path2D();
  body.moveTo(0,-50*s);
  body.bezierCurveTo(6*s,-40*s, 6.5*s,-10*s, 3*s,10*s);
  body.bezierCurveTo(1.5*s,34*s, sway*0.6,50*s, sway,62*s);
  body.bezierCurveTo(sway-2*s,46*s, -2.5*s,30*s, -3*s,10*s);
  body.bezierCurveTo(-6.5*s,-14*s, -6*s,-42*s, 0,-50*s);
  x.fillStyle='#120e20';
  x.fill(body);
  const rim=x.createLinearGradient(0,-55*s,0,62*s);
  rim.addColorStop(0,'rgba(148,178,255,0.55)');
  rim.addColorStop(0.5,'rgba(255,178,110,0.75)');
  rim.addColorStop(1,'rgba(255,150,72,0.95)');
  x.strokeStyle=rim;x.lineWidth=1.1*s;
  x.shadowColor='rgba(255,150,72,0.55)';x.shadowBlur=7;
  x.stroke(body);
  x.shadowBlur=0;

  // ---- arms cradling the ember ----
  x.strokeStyle='#120e20';x.lineWidth=2.2*s;x.lineCap='round';
  x.beginPath();
  x.moveTo(4.5*s,-44*s);x.quadraticCurveTo(13*s,-38*s, 7.5*s,-27*s);
  x.moveTo(-4.5*s,-44*s);x.quadraticCurveTo(-13*s,-38*s, -7.5*s,-27*s);
  x.stroke();
  x.fillStyle='#120e20';
  x.beginPath();x.arc(7.5*s,-27*s,2*s,0,6.283);x.arc(-7.5*s,-27*s,2*s,0,6.283);x.fill();
  x.strokeStyle='rgba(255,170,100,0.8)';x.lineWidth=0.7*s;
  x.beginPath();x.arc(7.5*s,-27*s,2*s,0,6.283);x.stroke();

  // ---- the ember she keeps ----
  x.globalCompositeOperation='lighter';
  let eg=x.createRadialGradient(0,-26*s,0,0,-26*s,26*s);
  eg.addColorStop(0,'rgba(255,242,212,0.95)');
  eg.addColorStop(0.3,'rgba(255,186,96,0.5)');
  eg.addColorStop(1,'rgba(255,140,60,0)');
  x.fillStyle=eg;
  x.beginPath();x.arc(0,-26*s,26*s,0,6.283);x.fill();
  x.fillStyle='#fff6df';
  x.beginPath();x.arc(0,-26*s,3.4*s,0,6.283);x.fill();
  x.globalCompositeOperation='source-over';

  // ---- head, hair, antennae ----
  x.save();
  x.translate(0,-58*s);
  x.rotate(tilt);
  x.fillStyle='#120e20';
  x.beginPath();x.arc(0,0,7*s,0,6.283);x.fill();
  x.strokeStyle='rgba(150,180,255,0.6)';x.lineWidth=0.9*s;
  x.beginPath();x.arc(0,0,7*s,-2.6,-0.6);x.stroke();
  // hair streams on the evening wind
  x.lineCap='round';
  for(let i=-1;i<=1;i++){
    const wob=Math.sin(t*1.4+i*1.9)*3*s;
    x.strokeStyle=i===0?'#231a3d':'#1a1230';
    x.lineWidth=(2.2-Math.abs(i)*0.5)*s;
    x.beginPath();
    x.moveTo(i*3*s,-4*s);
    x.bezierCurveTo(i*3*s-9*s,-13*s, -14*s+i*4*s+wob*0.5,-20*s, -17*s-i*3*s+wob,-30*s+i*2*s);
    x.stroke();
  }
  // antennae with lit tips
  x.strokeStyle='rgba(216,196,255,0.7)';x.lineWidth=0.8*s;
  for(const m of [1,-1]){
    x.beginPath();x.moveTo(2*s*m,-6*s);
    x.quadraticCurveTo(7*s*m,-14*s, 11*s*m,-21*s);x.stroke();
  }
  x.globalCompositeOperation='lighter';
  x.fillStyle='rgba(220,205,255,0.85)';
  for(const m of [1,-1]){
    x.beginPath();x.arc(11*s*m,-21*s,1.4*s,0,6.283);x.fill();
  }
  x.globalCompositeOperation='source-over';
  x.restore();
  x.restore();

  // ---- her dust drifts down ----
  if(dust.length<110 && Math.random()<0.3){
    dust.push({x:fx+(Math.random()-0.5)*16*s,y:fy+58*s,
      vy:(9+Math.random()*16)*s,ph:Math.random()*6.28,
      life:0,max:2.2+Math.random()*2.2,sz:(0.8+Math.random()*1.3)*s});
  }
}

let last=performance.now();
function frame(now){
  const t=now/1000;
  const dt=Math.min((now-last)/1000,0.05);last=now;
  x.clearRect(0,0,W,H);
  x.drawImage(off,0,0,W,H);

  // slow drifting clouds, backlit silhouettes
  x.fillStyle='rgba(22,13,38,0.5)';
  for(const c of clouds){
    c.x+=c.spd*dt;
    if(c.x>W+W*0.2)c.x=-W*0.2;
    for(const b of c.blobs){
      x.beginPath();
      x.ellipse(c.x+b.dx,c.y+b.dy,b.rx,b.ry,0,0,6.283);
      x.fill();
    }
  }

  x.globalCompositeOperation='lighter';

  // breathing glow of the last light
  const gr=W*0.16*(1+0.07*Math.sin(t*0.7));
  const pg=x.createRadialGradient(W/2,horizonY,0,W/2,horizonY,gr);
  pg.addColorStop(0,'rgba(255,200,130,'+(0.28+0.08*Math.sin(t*0.5))+')');
  pg.addColorStop(1,'rgba(255,140,60,0)');
  x.fillStyle=pg;
  x.beginPath();x.arc(W/2,horizonY,gr,0,6.283);x.fill();

  // the sun's last sliver
  const sa=0.8+0.2*Math.sin(t*0.9);
  const sr=Math.max(26,W*0.05);
  const sg=x.createRadialGradient(W/2,horizonY,0,W/2,horizonY,sr*2.4);
  sg.addColorStop(0,'rgba(255,225,170,'+(sa*0.6)+')');
  sg.addColorStop(1,'rgba(255,180,90,0)');
  x.fillStyle=sg;
  x.beginPath();x.arc(W/2,horizonY,sr*2.4,0,6.283);x.fill();
  x.fillStyle='rgba(255,232,185,'+sa+')';
  x.beginPath();x.ellipse(W/2,horizonY,sr,sr*0.13,0,Math.PI,0);x.fill();

  // stars waking above
  for(const st of stars){
    const a=(0.25+0.55*(0.5+0.5*Math.sin(t*st.sp+st.ph)))*Math.max(0,1-st.y/(horizonY*0.6));
    if(a<=0.02)continue;
    x.fillStyle='rgba(225,232,255,'+a+')';
    x.beginPath();x.arc(st.x,st.y,st.r,0,6.283);x.fill();
    if(st.big&&a>0.5){
      x.strokeStyle='rgba(225,232,255,'+(a*0.5)+')';x.lineWidth=0.6;
      x.beginPath();
      x.moveTo(st.x-4,st.y);x.lineTo(st.x+4,st.y);
      x.moveTo(st.x,st.y-4);x.lineTo(st.x,st.y+4);x.stroke();
    }
  }

  // warm motes rising from where the light sank
  for(const m of motes){
    m.y-=m.vy*dt;
    m.x+=Math.sin(t*0.8+m.ph)*14*dt;
    if(m.y<horizonY-H*0.34){
      m.y=horizonY-Math.random()*8;
      m.x=W/2+(Math.random()-0.5)*W*0.8;
    }
    const a=Math.min(1,(horizonY-m.y)/(H*0.12))*(0.35+0.4*Math.sin(t*2.2+m.ph));
    if(a<=0.02)continue;
    x.fillStyle='rgba(255,192,122,'+Math.max(0,a)+')';
    x.beginPath();x.arc(m.x,m.y,m.sz,0,6.283);x.fill();
  }
  x.globalCompositeOperation='source-over';

  drawFairy(t,dt);

  // falling fairy dust
  x.globalCompositeOperation='lighter';
  for(let i=dust.length-1;i>=0;i--){
    const d=dust[i];
    d.life+=dt;d.y+=d.vy*dt;d.x+=Math.sin(t*2+d.ph)*12*dt;
    if(d.life>=d.max){dust.splice(i,1);continue;}
    const a=(1-d.life/d.max)*(0.45+0.4*Math.sin(t*6+d.ph));
    if(a<=0.02)continue;
    x.fillStyle='rgba(255,216,170,'+Math.max(0,a)+')';
    x.beginPath();x.arc(d.x,d.y,d.sz,0,6.283);x.fill();
  }
  x.globalCompositeOperation='source-over';

  requestAnimationFrame(frame);
}

addEventListener('resize',build);
addEventListener('pointermove',e=>{
  px=e.clientX/Math.max(1,W);
  py=e.clientY/Math.max(1,H);
},{passive:true});
build();
requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Fairy of Last Light",
  "statement": "What remains when day lets go. Hold it gently; it answers care."
}
```

**How it works, briefly:**

- **Scene** — a long dusk painted on canvas: a layered gradient sky, dark rolling hills, a recursive bare tree, and one glowing sliver of sun sinking at the horizon. The static background is pre-rendered to an offscreen canvas so each frame only redraws the living parts — it stays cheap even alongside a dozen other pieces.
- **The fairy** — a dark silhouette rim-lit by the very light she keeps, with translucent gradient wings that beat slowly, hair streaming on the evening wind, and a glowing ember cradled in her hands. She bobs and sways above the sun's sliver like a guardian, and her head turns — slowly wandering on its own, easing toward your pointer if you move.
- **Life** — stars waking overhead, warm motes rising from where the light sank, dust falling from her hem, backlit clouds drifting across the glow, and the ember itself breathing. Everything loops forever with pure `requestAnimationFrame`, no libraries, no network, no images.