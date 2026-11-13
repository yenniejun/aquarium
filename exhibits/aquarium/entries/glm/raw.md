Here's my tank. I went for a deep, moonlit-water mood with a single shy creature: a pale silver fish with flowing ribbon fins, a glowing crescent tail, and a habit of humming little bubbles toward the surface. It wanders on its own, comes to circle you if you hold still, and flashes bright before darting away if you move too fast near it.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Murmuring Moonfin</title>
<style>
  html, body { margin:0; padding:0; height:100%; overflow:hidden; background:#04080e; }
  canvas { position:fixed; inset:0; display:block; }
</style>
</head>
<body>
<canvas id="sea"></canvas>
<script>
(() => {
'use strict';
const cv = document.getElementById('sea');
const ctx = cv.getContext('2d');
const TAU = Math.PI * 2;
const clamp = (v,a,b) => v<a?a:(v>b?b:v);
const lerp = (a,b,t) => a+(b-a)*t;
const rand = (a,b) => a+Math.random()*(b-a);
const smoothstep = t => t*t*(3-2*t);
const angDiff = (a,b) => { let d=(a-b)%TAU; if(d>Math.PI)d-=TAU; if(d<-Math.PI)d+=TAU; return d; };

let W=0, H=0, DPR=1, S=1, waterY=0, bg=null, vig=null;
let kelp=[], motes=[], rocks=[], pebbles=[], vent={x:0,y:0,t:4};
let bubbles=[], rings=[];

const N = 16; // spine segments
const fish = {
  x:0, y:0, heading:0, speed:50,
  spine:[], draw:[], L:200, seg:13,
  state:'wander', target:{x:0,y:0}, stT:10,
  murT:5, murmuring:0, ringT:0,
  flash:0, blinkT:3, blinkA:0,
  orbit:0, t:0
};

const ptr = { x:-9999, y:-9999, speed:0, inside:false, lx:0, ly:0, lt:0 };

window.addEventListener('pointermove', e => {
  const now = performance.now();
  if (ptr.inside) {
    const dt = Math.max(8, now - ptr.lt) / 1000;
    ptr.speed = lerp(ptr.speed, Math.hypot(e.clientX-ptr.lx, e.clientY-ptr.ly)/dt, 0.45);
  }
  ptr.lx=e.clientX; ptr.ly=e.clientY; ptr.lt=now;
  ptr.x=e.clientX; ptr.y=e.clientY; ptr.inside=true;
}, {passive:true});
window.addEventListener('pointerout', e => { if(!e.relatedTarget) ptr.inside=false; }, {passive:true});
window.addEventListener('blur', () => ptr.inside=false);

function initFish(){
  fish.spine=[]; fish.draw=[];
  for(let i=0;i<N;i++){
    fish.spine.push({x:fish.x - i*fish.seg, y:fish.y});
    fish.draw.push({x:fish.x - i*fish.seg, y:fish.y, tx:1, ty:0, nx:0, ny:1});
  }
  fish.target.x=W*0.6; fish.target.y=H*0.45;
}

function bodyW(i){
  const u=i/(N-1);
  const sh = u<0.24 ? lerp(0.55,1,smoothstep(u/0.24)) : lerp(1,0.13,smoothstep((u-0.24)/0.76));
  return fish.L*0.082*sh;
}

function addBubble(x,y,r,vy0){
  bubbles.push({x,y,r,vy:vy0,ph:rand(0,TAU)});
  if(bubbles.length>70) bubbles.shift();
}
function addRing(x,y,r,vr,a,decay){
  rings.push({x,y,r,vr,a,decay});
  if(rings.length>60) rings.shift();
}
function mouthPos(){
  const d0=fish.draw[0];
  return { x: d0.x - d0.tx*bodyW(0)*1.1, y: d0.y - d0.ty*bodyW(0)*1.1 };
}

function newTarget(){
  const sweep = Math.random()<0.42; // long glides across the tank
  if(sweep){
    fish.target.x = fish.x < W*0.5 ? rand(W*0.6,W*0.82) : rand(W*0.18,W*0.4);
    fish.target.y = clamp(fish.y + rand(-H*0.12,H*0.12), waterY+H*0.12, H*0.78);
  } else {
    fish.target.x = rand(W*0.16,W*0.84);
    fish.target.y = rand(waterY+H*0.12, H*0.78);
  }
  fish.stT = rand(6,14);
}
function startle(){
  fish.state='startled'; fish.stT=1.35; fish.flash=1;
  const a = Math.atan2(fish.y-ptr.y, fish.x-ptr.x) + rand(-0.6,0.6);
  fish.target.x = clamp(fish.x+Math.cos(a)*W*0.4, W*0.16, W*0.84);
  fish.target.y = clamp(fish.y+Math.sin(a)*H*0.35, waterY+H*0.1, H*0.78);
  const m=mouthPos();
  for(let i=0;i<6;i++) addBubble(m.x+rand(-3,3), m.y+rand(-3,3), rand(0.8,2.2)*S, rand(40,70)*S);
}

function buildScene(){
  rocks=[];
  const spots=[0.16,0.5,0.84];
  const nR = W<420?2:3;
  for(let i=0;i<nR;i++){
    const rx=rand(36,68)*S*1.15, ry=rx*rand(0.45,0.6);
    rocks.push({x:W*spots[i]+rand(-28,28)*S, y:H-rand(1,6), rx, ry});
  }
  const vr0=rocks[Math.min(1,rocks.length-1)];
  vent={x:vr0.x+vr0.rx*0.25, y:H-vr0.ry-2, t:rand(3,7)};

  pebbles=[];
  const np=Math.round(W/55);
  for(let i=0;i<np;i++) pebbles.push({x:Math.random()*W, y:H-rand(0,8), r:rand(1.4,3.8)*S, a:rand(0.15,0.4)});

  kelp=[];
  const nk=clamp(Math.round(W/150),3,8);
  for(let i=0;i<nk;i++){
    kelp.push({
      x:(0.07+0.86*(nk>1?i/(nk-1):0.5))*W + rand(-24,24)*S,
      h:H*rand(0.3,0.55)*(i%3===0?1.18:1),
      ph:rand(0,TAU), spd:rand(0.35,0.6),
      amp:rand(0.16,0.28), lean:rand(-0.12,0.12),
      w0:rand(4.5,7)*S, front:(i===nk-1),
      col:['#0a1c1d','#0c2320','#0b1f24'][i%3]
    });
  }

  motes=[];
  const nm=clamp(Math.round(W*H/22000),26,90);
  for(let i=0;i<nm;i++) motes.push({
    x:Math.random()*W, y:rand(waterY+12,H-12),
    vx:rand(2,7)*(Math.random()<0.5?1:-1),
    ph:rand(0,TAU), tw:rand(0.4,1.6), r:rand(0.6,1.6)*S
  });

  // pre-render the still water, floor and rocks
  bg=document.createElement('canvas');
  bg.width=cv.width; bg.height=cv.height;
  const g=bg.getContext('2d');
  g.setTransform(DPR,0,0,DPR,0,0);
  const wg=g.createLinearGradient(0,0,0,H);
  wg.addColorStop(0,'#1c3c4f'); wg.addColorStop(0.4,'#0e2334'); wg.addColorStop(1,'#050a12');
  g.fillStyle=wg; g.fillRect(0,0,W,H);
  const fs=rand(0,10);
  g.fillStyle='#071019';
  g.beginPath(); g.moveTo(0,H);
  for(let x=0;x<=W;x+=14){
    const hf=H*0.045*(0.55+0.45*Math.sin(x*0.006+fs)+0.15*Math.sin(x*0.021+fs*3));
    g.lineTo(x,H-clamp(hf,H*0.01,H*0.09));
  }
  g.lineTo(W,H); g.closePath(); g.fill();
  for(const r of rocks){
    g.fillStyle='#0d1724';
    g.beginPath(); g.ellipse(r.x,r.y-r.ry*0.15,r.rx,r.ry,0,0,TAU); g.fill();
    g.fillStyle='#0a1220';
    g.beginPath(); g.ellipse(r.x-r.rx*0.3,r.y-r.ry*0.05,r.rx*0.55,r.ry*0.62,0,0,TAU); g.fill();
    g.strokeStyle='rgba(130,170,195,0.13)'; g.lineWidth=1.4;
    g.beginPath(); g.ellipse(r.x,r.y-r.ry*0.15,r.rx*0.97,r.ry*0.9,0,Math.PI*1.08,Math.PI*1.92); g.stroke();
  }
  for(const p of pebbles){
    g.beginPath(); g.arc(p.x,p.y,p.r,0,TAU);
    g.fillStyle=`rgba(120,150,170,${p.a*0.5})`; g.fill();
  }

  vig=ctx.createRadialGradient(W*0.5,H*0.45,Math.min(W,H)*0.38, W*0.5,H*0.5,Math.max(W,H)*0.72);
  vig.addColorStop(0,'rgba(0,0,4,0)');
  vig.addColorStop(1,'rgba(0,0,4,0.34)');
}

function resize(){
  W=window.innerWidth; H=window.innerHeight;
  DPR=Math.min(window.devicePixelRatio||1,1.75);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  S=clamp(Math.min(W,H)/430,0.34,1.5);
  waterY=Math.max(14,H*0.07);
  fish.L=205*S; fish.seg=fish.L/(N-1);
  if(!fish.spine.length){ fish.x=W*0.3; fish.y=H*0.45; initFish(); }
  fish.x=clamp(fish.x,W*0.15,W*0.85);
  fish.y=clamp(fish.y,waterY+H*0.1,H*0.82);
  buildScene();
}
window.addEventListener('resize', resize);
resize();

function updateFish(dt){
  fish.t+=dt;
  ptr.speed*=Math.exp(-dt*2.2);

  const headD=Math.hypot(ptr.x-fish.x, ptr.y-fish.y);
  fish.stT-=dt;

  if(fish.state==='startled'){
    if(fish.stT<=0){ fish.state='wander'; newTarget(); }
  } else if(fish.state==='wander'){
    if(ptr.inside && ptr.speed<250){ fish.state='curious'; fish.stT=rand(8,16); }
  } else if(fish.state==='curious'){
    if(!ptr.inside || ptr.speed>320 || fish.stT<=0){ fish.state='wander'; newTarget(); }
    else if(ptr.speed>900 && headD<180*S) startle();
  }

  let dx,dy,spd;
  if(fish.state==='curious'){
    fish.orbit+=dt*0.55;
    const R=95*S;
    const tx=clamp(ptr.x+Math.cos(fish.orbit)*R, W*0.1, W*0.9);
    const ty=clamp(ptr.y+Math.sin(fish.orbit)*R*0.6, waterY+H*0.1, H*0.84);
    const d=Math.hypot(tx-fish.x,ty-fish.y)||1;
    dx=(tx-fish.x)/d; dy=(ty-fish.y)/d;
    spd=(30+45*clamp(d/(R*2.2),0,1))*S;
  } else if(fish.state==='startled'){
    const d=Math.hypot(fish.target.x-fish.x, fish.target.y-fish.y)||1;
    dx=(fish.target.x-fish.x)/d; dy=(fish.target.y-fish.y)/d;
    spd=(90+230*clamp(fish.stT/1.35,0,1))*S;
  } else {
    const d=Math.hypot(fish.target.x-fish.x, fish.target.y-fish.y);
    if(d<28*S || fish.stT<=0) newTarget();
    const dd=d||1;
    dx=(fish.target.x-fish.x)/dd; dy=(fish.target.y-fish.y)/dd;
    spd=52*S*(0.8+0.25*Math.sin(fish.t*0.23));
  }

  // soft wall avoidance
  const mL=W*0.14, mR=W*0.86, mT=waterY+H*0.07, mB=H*0.84;
  if(fish.x<mL) dx+=(mL-fish.x)/mL*1.6;
  if(fish.x>mR) dx-=(fish.x-mR)/(W-mR)*1.6;
  if(fish.y<mT) dy+=(mT-fish.y)/mT*1.6;
  if(fish.y>mB) dy-=(fish.y-mB)/(H-mB)*1.6;

  const want=Math.atan2(dy,dx);
  const mt=(fish.state==='startled'?3.4:1.5)*dt;
  fish.heading+=clamp(angDiff(want,fish.heading),-mt,mt);

  const ease=fish.state==='startled'?4:1.1;
  fish.speed+=(spd-fish.speed)*Math.min(1,dt*ease);
  fish.x+=Math.cos(fish.heading)*fish.speed*dt;
  fish.y+=Math.sin(fish.heading)*fish.speed*dt;
  fish.x=clamp(fish.x,W*0.06,W*0.94);
  fish.y=clamp(fish.y,waterY+H*0.04,H*0.9);

  // follow-chain spine, so the body bends through turns
  const sp=fish.spine, dr=fish.draw;
  sp[0].x=fish.x; sp[0].y=fish.y;
  for(let i=1;i<N;i++){
    let ax=sp[i].x-sp[i-1].x, ay=sp[i].y-sp[i-1].y;
    const d=Math.hypot(ax,ay)||0.001;
    sp[i].x=sp[i-1].x+ax/d*fish.seg;
    sp[i].y=sp[i-1].y+ay/d*fish.seg;
  }
  const uAmp=clamp(fish.speed/(70*S),0.25,1.5);
  for(let i=0;i<N;i++){
    const a=sp[Math.max(0,i-1)], b=sp[Math.min(N-1,i+1)];
    let txv=b.x-a.x, tyv=b.y-a.y;
    const tl=Math.hypot(txv,tyv)||1; txv/=tl; tyv/=tl;
    const off=Math.sin(fish.t*3.1-i*0.55)*3.5*S*uAmp*(i/(N-1));
    dr[i].x=sp[i].x-tyv*off;
    dr[i].y=sp[i].y+txv*off;
    dr[i].tx=txv; dr[i].ty=tyv; dr[i].nx=-tyv; dr[i].ny=txv;
  }

  fish.blinkT-=dt;
  if(fish.blinkT<=0){ fish.blinkA=1; fish.blinkT=rand(2.5,6); }
  fish.blinkA=Math.max(0,fish.blinkA-dt*6);
  fish.flash*=Math.exp(-dt*1.6);

  // murmurs: soft rings and a drift of tiny bubbles
  fish.murT-=dt;
  if(fish.murT<=0){ fish.murT=rand(6,13); fish.murmuring=1.1; fish.ringT=0; }
  if(fish.murmuring>0){
    fish.murmuring-=dt;
    fish.ringT-=dt;
    if(fish.ringT<=0){
      fish.ringT=0.45;
      const m=mouthPos();
      addRing(m.x,m.y,6*S,36*S,0.32,0.3);
    }
    if(Math.random()<dt*9){
      const m=mouthPos();
      addBubble(m.x+rand(-2,2),m.y+rand(-2,2),rand(0.8,2)*S,rand(16,30)*S);
    }
  }

  // a small vent seeps occasional bubbles
  vent.t-=dt;
  if(vent.t<=0){
    vent.t=rand(4,10);
    const nv=1+Math.floor(Math.random()*3);
    for(let i=0;i<nv;i++) addBubble(vent.x+rand(-3,3),vent.y,rand(0.7,1.6)*S,rand(10,20)*S);
  }

  for(let i=bubbles.length-1;i>=0;i--){
    const b=bubbles[i];
    b.vy=Math.min(b.vy+18*dt,58*S);
    b.y-=b.vy*dt;
    b.x+=Math.sin(fish.t*2.4+b.ph)*9*S*dt;
    if(b.y<waterY+6){
      addRing(b.x,waterY+5,b.r,20*S,0.35,1.8);
      bubbles.splice(i,1);
    }
  }
  for(let i=rings.length-1;i>=0;i--){
    const r=rings[i];
    r.r+=r.vr*dt; r.a-=r.decay*dt;
    if(r.a<=0) rings.splice(i,1);
  }
  for(const m of motes){
    m.x+=m.vx*dt;
    m.y+=Math.sin(fish.t*0.3+m.ph)*3*dt;
    if(m.x<-4)m.x=W+4; else if(m.x>W+4)m.x=-4;
    m.y=clamp(m.y,waterY+6,H-2);
  }
}

function drawBeams(t){
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<3;i++){
    const sway=Math.sin(t*0.07+i*1.9);
    const tx=W*(0.28+0.2*i)+sway*W*0.02;
    const tw=W*0.035+8;
    const bx=tx+W*(0.09+0.035*i)+sway*W*0.07;
    const bw=W*0.13+30;
    const g=ctx.createLinearGradient(0,waterY,0,H*0.9);
    g.addColorStop(0,'rgba(175,208,236,0.09)');
    g.addColorStop(1,'rgba(150,190,225,0)');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(tx-tw,waterY); ctx.lineTo(tx+tw,waterY);
    ctx.lineTo(bx+bw,H); ctx.lineTo(bx-bw,H);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawKelp(k,t){
  const segs=14, segL=k.h/segs;
  const pts=[{x:k.x,y:H-2}];
  let x=k.x, y=H-2;
  for(let i=0;i<segs;i++){
    const sw=Math.sin(t*k.spd+k.ph+i*0.55)*k.amp*Math.pow((i+1)/segs,1.4);
    const ang=-Math.PI/2+k.lean+sw;
    x+=Math.cos(ang)*segL; y+=Math.sin(ang)*segL;
    pts.push({x,y});
  }
  const L=[],R=[];
  for(let i=0;i<pts.length;i++){
    const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)];
    let txv=b.x-a.x, tyv=b.y-a.y;
    const tl=Math.hypot(txv,tyv)||1; txv/=tl; tyv/=tl;
    const wd=lerp(k.w0,1.1*S,i/(pts.length-1));
    L.push({x:pts[i].x-tyv*wd, y:pts[i].y+txv*wd});
    R.push({x:pts[i].x+tyv*wd, y:pts[i].y-txv*wd});
  }
  ctx.beginPath();
  ctx.moveTo(L[0].x,L[0].y);
  for(let i=1;i<L.length;i++) ctx.lineTo(L[i].x,L[i].y);
  for(let i=R.length-1;i>=0;i--) ctx.lineTo(R[i].x,R[i].y);
  ctx.closePath();
  ctx.fillStyle=k.front?'#14322c':k.col;
  ctx.fill();
}

function buildBodyPath(){
  const dr=fish.draw;
  const p=new Path2D();
  const Lp=[],Rp=[];
  for(let i=0;i<N;i++){
    const w=bodyW(i);
    Lp.push({x:dr[i].x+dr[i].nx*w, y:dr[i].y+dr[i].ny*w});
    Rp.push({x:dr[i].x-dr[i].nx*w, y:dr[i].y-dr[i].ny*w});
  }
  p.moveTo(Lp[0].x,Lp[0].y);
  p.lineTo((Lp[0].x+Lp[1].x)/2,(Lp[0].y+Lp[1].y)/2);
  for(let i=1;i<N-1;i++)
    p.quadraticCurveTo(Lp[i].x,Lp[i].y,(Lp[i].x+Lp[i+1].x)/2,(Lp[i].y+Lp[i+1].y)/2);
  p.lineTo(Lp[N-1].x,Lp[N-1].y);
  p.lineTo(Rp[N-1].x,Rp[N-1].y);
  for(let i=N-2;i>=1;i--)
    p.quadraticCurveTo(Rp[i].x,Rp[i].y,(Rp[i].x+Rp[i-1].x)/2,(Rp[i].y+Rp[i-1].y)/2);
  p.lineTo(Rp[0].x,Rp[0].y);
  p.closePath();
  const w0=bodyW(0);
  const nx=dr[0].x-dr[0].tx*w0*0.55, ny=dr[0].y-dr[0].ty*w0*0.55;
  p.moveTo(nx,ny);
  p.arc(nx,ny,w0*1.02,0,TAU);
  return p;
}

function drawRibbon(dr, side, ph){
  const pts=[];
  for(let i=2;i<N+3;i++){
    let x,y,nx,ny;
    if(i<N){
      const d=dr[i]; x=d.x; y=d.y; nx=d.nx; ny=d.ny;
    } else {
      const d=dr[N-1]; const kk=i-(N-1);
      x=d.x+d.tx*fish.seg*kk; y=d.y+d.ty*fish.seg*kk; nx=d.nx; ny=d.ny;
    }
    const u=(i-2)/(N+1);
    const wave=Math.sin(fish.t*2.4-i*0.5+ph)*(3+15*u)*S;
    const lift=(1.5+9*Math.sin(Math.min(1,u*1.15)*Math.PI))*S;
    const w=(i<N?bodyW(i):1.5*S);
    const off=side*(w*0.35+lift)+wave;
    pts.push({x:x+nx*off, y:y+ny*off});
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length-1;i++)
    ctx.quadraticCurveTo(pts[i].x,pts[i].y,(pts[i].x+pts[i+1].x)/2,(pts[i].y+pts[i+1].y)/2);
  ctx.lineTo(pts[pts.length-1].x,pts[pts.length-1].y);
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle='rgba(206,228,244,0.30)';
  ctx.lineWidth=2.4*S; ctx.stroke();
  ctx.strokeStyle='rgba(150,195,225,0.10)';
  ctx.lineWidth=6*S; ctx.stroke();
}

function drawPectoral(d, dir, alpha){
  const flap=Math.sin(fish.t*3.4+dir)*0.55;
  const base=Math.atan2(d.ty,d.tx);
  ctx.save();
  const w3=bodyW(3);
  ctx.translate(d.x+d.nx*dir*w3*0.5, d.y+d.ny*dir*w3*0.5);
  ctx.rotate(base+Math.PI+dir*0.75+flap*dir*0.5);
  const len=fish.L*0.17;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(len*0.4, dir*len*0.28, len*0.95, dir*len*0.62);
  ctx.quadraticCurveTo(len*0.5, dir*len*0.1, 0, 0);
  ctx.closePath();
  ctx.fillStyle=`rgba(198,224,242,${0.26*alpha})`;
  ctx.fill();
  ctx.restore();
}

function drawTail(x,y,ang,R){
  const wave=Math.sin(fish.t*3.4)*0.17;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(ang+wave);
  const sw1=Math.sin(fish.t*2.6)*R*0.4, sw2=Math.sin(fish.t*2.6+1.3)*R*0.35;
  ctx.lineWidth=1.3*S; ctx.lineCap='round';
  ctx.strokeStyle='rgba(200,228,246,0.26)';
  ctx.beginPath();
  ctx.moveTo(R*0.12,-R);
  ctx.quadraticCurveTo(R*1.1,-R*0.75+sw1*0.4, R*2.05, -R*0.5+sw1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(R*0.12,R);
  ctx.quadraticCurveTo(R*1.1, R*0.75+sw2*0.4, R*2.05, R*0.55+sw2);
  ctx.stroke();
  const g=ctx.createLinearGradient(0,0,R,0);
  g.addColorStop(0,'rgba(210,230,244,0.85)');
  g.addColorStop(1,'rgba(185,218,240,0.2)');
  ctx.beginPath();
  ctx.moveTo(R*0.12,-R);
  ctx.quadraticCurveTo(R*1.15,0,R*0.12,R);
  ctx.quadraticCurveTo(R*0.45,0,R*0.12,-R);
  ctx.closePath();
  ctx.fillStyle=g; ctx.fill();
  ctx.strokeStyle=`rgba(195,238,255,${0.3+fish.flash*0.55})`;
  ctx.lineWidth=1.5*S;
  ctx.beginPath();
  ctx.moveTo(R*0.12,-R);
  ctx.quadraticCurveTo(R*1.15,0,R*0.12,R);
  ctx.stroke();
  ctx.restore();
}

function drawDots(){
  const boost=fish.flash+(fish.murmuring>0?0.35:0);
  const dr=fish.draw;
  for(let i=1;i<=12;i++){
    const d=dr[i];
    const pulse=0.5+0.5*Math.sin(fish.t*2.2-i*0.65);
    const a=clamp(0.18*pulse+0.12+boost*0.9,0,1);
    const r=(1+0.8*pulse)*S+boost*1.1*S;
    const px=d.x+d.nx*bodyW(i)*0.15;
    const py=d.y+d.ny*bodyW(i)*0.15;
    ctx.beginPath(); ctx.arc(px,py,r*3,0,TAU);
    ctx.fillStyle=`rgba(150,225,255,${a*0.10})`; ctx.fill();
    ctx.beginPath(); ctx.arc(px,py,r,0,TAU);
    ctx.fillStyle=`rgba(196,242,255,${a*0.8})`; ctx.fill();
  }
}

function drawEye(){
  const d0=fish.draw[0], d1=fish.draw[1];
  const ex=d0.x*0.55+d1.x*0.45, ey=d0.y*0.55+d1.y*0.45;
  let fx=d0.x-d1.x, fy=d0.y-d1.y;
  const fl=Math.hypot(fx,fy)||1; fx/=fl; fy/=fl;
  const exx=ex+fx*fish.L*0.012, eyy=ey+fy*fish.L*0.012;
  const r=4.6*S;
  let lx=fx, ly=fy;
  if(fish.state==='curious' && ptr.inside){
    const dx=ptr.x-exx, dy=ptr.y-eyy, dl=Math.hypot(dx,dy)||1;
    lx=lerp(fx,dx/dl,0.8); ly=lerp(fy,dy/dl,0.8);
  }
  ctx.beginPath(); ctx.arc(exx,eyy,r,0,TAU);
  ctx.fillStyle='#e7eff6'; ctx.fill();
  ctx.beginPath(); ctx.arc(exx+lx*1.6*S, eyy+ly*1.6*S, r*0.62,0,TAU);
  ctx.fillStyle='#0b141c'; ctx.fill();
  ctx.beginPath(); ctx.arc(exx+lx*0.5*S-r*0.3, eyy+ly*0.5*S-r*0.3, r*0.18,0,TAU);
  ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fill();
  if(fish.blinkA>0.02){
    ctx.beginPath();
    ctx.ellipse(exx,eyy, r*1.15, r*1.15*fish.blinkA, Math.atan2(fy,fx), 0, TAU);
    ctx.fillStyle='#c6d4e2'; ctx.fill();
  }
}

function renderFish(){
  const dr=fish.draw;

  const sh=clamp((fish.y-H*0.35)/(H*0.5),0,1);
  if(sh>0.04){
    ctx.beginPath();
    ctx.ellipse(fish.x,H-6,fish.L*0.26*(0.6+0.4*sh),4.5*S,0,0,TAU);
    ctx.fillStyle=`rgba(0,0,2,${0.15*sh})`;
    ctx.fill();
  }

  const t0=dr[N-1];
  const tang=Math.atan2(dr[N-1].y-dr[N-3].y, dr[N-1].x-dr[N-3].x);
  drawTail(t0.x,t0.y,tang,fish.L*0.17);

  drawPectoral(dr[3],-1,0.5);
  drawRibbon(dr,1,0);
  drawRibbon(dr,-1,1.7);

  const bp=buildBodyPath();
  const mid=dr[5];
  const gr=ctx.createLinearGradient(
    mid.x+mid.nx*fish.L*0.06, mid.y+mid.ny*fish.L*0.06,
    mid.x-mid.nx*fish.L*0.06, mid.y-mid.ny*fish.L*0.06);
  gr.addColorStop(0,'#e0eaf3'); gr.addColorStop(0.55,'#c6d4e2'); gr.addColorStop(1,'#a9becf');
  ctx.fillStyle=gr; ctx.fill(bp);
  if(fish.flash>0.03){
    ctx.save(); ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=`rgba(160,230,255,${fish.flash*0.38})`;
    ctx.fill(bp); ctx.restore();
  }

  drawDots();
  drawPectoral(dr[3],1,1);
  drawEye();
}

function render(t){
  ctx.drawImage(bg,0,0,W,H);
  drawBeams(t);
  for(const m of motes){
    const a=clamp(0.10+0.09*Math.sin(fish.t*m.tw+m.ph),0.02,0.22);
    ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,TAU);
    ctx.fillStyle=`rgba(190,215,235,${a})`; ctx.fill();
  }
  for(const k of kelp) if(!k.front) drawKelp(k,t);
  renderFish();
  for(const b of bubbles){
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TAU);
    ctx.strokeStyle='rgba(205,232,250,0.5)'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x-b.r*0.35,b.y-b.r*0.35,Math.max(0.4,b.r*0.26),0,TAU);
    ctx.fillStyle='rgba(235,248,255,0.45)'; ctx.fill();
  }
  for(const r of rings){
    ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,TAU);
    ctx.strokeStyle=`rgba(160,215,240,${clamp(r.a,0,1)*0.8})`;
    ctx.lineWidth=1.1; ctx.stroke();
  }
  for(const k of kelp) if(k.front) drawKelp(k,t);
  ctx.fillStyle='rgba(3,7,12,0.55)';
  ctx.fillRect(0,0,W,waterY-1);
  ctx.beginPath();
  for(let x=0;x<=W;x+=8){
    const yy=waterY+Math.sin(x*0.02+t*1.2)*1.3+Math.sin(x*0.045-t*0.8)*0.8;
    if(x===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy);
  }
  ctx.strokeStyle='rgba(190,222,240,0.26)'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
}

let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000)||0.016;
  last=now;
  updateFish(dt);
  render(now/1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

A few notes on how it's built: the fish isn't a sprite — it's a follow-chain spine with a smooth body outline, twin translucent ribbon fins that wave out of phase, a glowing crescent tail with silk streamers, a traveling pulse down its bioluminescent lateral line, and an eye that blinks and tracks you. The mood is a moonlit twilight: swaying kelp silhouettes, drifting motes in slow light shafts, a bubbling vent in the rocks, and a rippling waterline where the murmured bubbles pop. It's all one 2D canvas with the static scenery pre-rendered offscreen, so it stays cheap next to the other tanks.

```json
{
  "title": "Murmuring Moonfin",
  "statement": "A shy sliver of moonlight with silk ribbon fins, the Moonfin glides its darkening tank in slow arcs, humming small silver bubbles toward the rippling surface. Hold still and it drifts over to circle you; move too quickly and it flares bright and bolts for the kelp."
}
```