```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The Weaver's Loom</title>
<style>
  html, body { margin:0; padding:0; height:100%; overflow:hidden; background:#04060d; overscroll-behavior:none; }
  #c { position:fixed; inset:0; display:block; touch-action:manipulation; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
"use strict";
const TAU = Math.PI * 2;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let W=0, H=0, CX=0, CY=0, R=0, DPR=1;
let bgGrad=null, vinGrad=null;
let stars=[], sky=null;
let px=-9999, py=-9999, pHas=false;
let meteor=null, nextMeteor=5;
const ROTP = 330; // seconds per full turn of the sky

const clamp01 = x => x<0?0:x>1?1:x;
const smooth01 = x => { x=clamp01(x); return x*x*(3-2*x); };
const easeIO = x => { x=clamp01(x); return x<0.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2; };
const frac = x => x - Math.floor(x);
const rand = (a,b) => a + Math.random()*(b-a);
const h1 = i => frac(Math.sin(i*127.1+311.7)*43758.5453);

function sprite(stops){
  const c=document.createElement('canvas'); c.width=c.height=64;
  const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);
  for(const s of stops) gr.addColorStop(s[0],s[1]);
  g.fillStyle=gr; g.fillRect(0,0,64,64);
  return c;
}
const sprB = sprite([[0,'rgba(255,255,255,1)'],[0.28,'rgba(205,222,255,0.55)'],[1,'rgba(150,180,255,0)']]);
const sprW = sprite([[0,'rgba(255,250,235,1)'],[0.28,'rgba(255,224,170,0.55)'],[1,'rgba(255,180,110,0)']]);
const sprG = sprite([[0,'rgba(255,255,250,1)'],[0.2,'rgba(255,232,180,0.85)'],[0.55,'rgba(255,200,120,0.28)'],[1,'rgba(255,180,100,0)']]);

function buildSky(){
  sky=document.createElement('canvas');
  sky.width=Math.max(2,W); sky.height=Math.max(2,H);
  const g=sky.getContext('2d');
  g.globalCompositeOperation='lighter';
  const blob=(x,y,r,rgb,a)=>{
    const gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(${rgb},${a})`);
    gr.addColorStop(1,`rgba(${rgb},0)`);
    g.fillStyle=gr;
    g.beginPath(); g.arc(x,y,r,0,TAU); g.fill();
  };
  blob(CX-R*0.45, CY-R*0.38, R*0.75, '90,140,150', 0.055);
  blob(CX+R*0.5, CY+R*0.42, R*0.65, '150,110,75', 0.045);
  const ang=-0.6, ca=Math.cos(ang), sa=Math.sin(ang);
  const L=Math.hypot(W,H)*0.6;
  for(let i=0;i<70;i++){
    const tt=rand(-0.55,0.55), off=rand(-1,1);
    blob(CX+ca*tt*L - sa*off*R*0.17, CY+sa*tt*L + ca*off*R*0.17,
         rand(R*0.06,R*0.26), '185,205,235', rand(0.015,0.05));
  }
  for(let i=0;i<220;i++){
    const tt=rand(-0.5,0.5), off=rand(-1,1);
    g.fillStyle=`rgba(210,225,250,${rand(0.08,0.3)})`;
    const s=rand(0.3,1.1);
    g.fillRect(CX+ca*tt*L - sa*off*R*0.14, CY+sa*tt*L + ca*off*R*0.14, s, s);
  }
  for(let i=0;i<140;i++){
    const rr=Math.sqrt(Math.random())*R, th=rand(0,TAU);
    g.fillStyle=`rgba(200,215,240,${rand(0.06,0.25)})`;
    const s=rand(0.3,0.9);
    g.fillRect(CX+Math.cos(th)*rr, CY+Math.sin(th)*rr, s, s);
  }
}

function buildStars(){
  stars=[];
  const n=Math.round(Math.min(430, Math.max(110, R*R/520)));
  for(let i=0;i<n;i++){
    const m=Math.random();
    stars.push({
      r: Math.sqrt(Math.random())*R*1.03,
      th: rand(0,TAU),
      s: m<0.72 ? rand(0.35,0.75) : m<0.94 ? rand(0.75,1.25) : rand(1.25,1.85),
      f: rand(0.4,2.2),
      ph: rand(0,TAU),
      b: rand(0.45,1),
      warm: Math.random()<0.14
    });
  }
}

function resize(){
  DPR=Math.min(2, window.devicePixelRatio||1);
  W=window.innerWidth; H=window.innerHeight;
  if(W<2||H<2) return;
  canvas.width=Math.round(W*DPR); canvas.height=Math.round(H*DPR);
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  CX=W/2; CY=H/2; R=Math.min(W,H)/2;
  bgGrad=ctx.createRadialGradient(CX,CY,0,CX,CY,R*1.05);
  bgGrad.addColorStop(0,'#0a1424');
  bgGrad.addColorStop(0.6,'#070e1c');
  bgGrad.addColorStop(1,'#04060d');
  vinGrad=ctx.createRadialGradient(CX,CY,R*0.68,CX,CY,R);
  vinGrad.addColorStop(0,'rgba(2,4,9,0)');
  vinGrad.addColorStop(1,'rgba(2,4,9,0.62)');
  buildSky(); buildStars();
}

/* ---- the constellation ---- */
const PERIOD=27;
const K=()=>R*0.017;
const UX=u=>CX+(u-50)*K();
const UY=v=>CY+(v-53)*K();

// [u, v, size, light-up time]
const NODES=[
  [27,25,1.05,0.4],[73,25,1.05,1.2],[50,25,0.85,0.8],
  [32,25,0.75,1.15],[68,25,0.75,1.4],
  [27,72,1.05,2.05],[73,72,1.05,2.85],[50,72,0.85,2.45],
  [32,72,0.75,1.95],[68,72,0.75,2.2],
  [38,56,0.6,3.8],[44,56,0.6,4.3],[50,56,0.6,4.8],[56,56,0.6,5.3],[62,56,0.6,5.8],
  [32,67,0.55,6.35],[68,67,0.55,7.05],
  [32,62,0.55,7.15],[68,62,0.55,7.85],
  [37,80,0.5,10.77],[43.5,79,0.45,10.93],[50,81,0.5,11.09],[56.5,79,0.45,11.25],[63,80,0.5,11.41]
];
// [u1,v1,u2,v2, start, duration]
const LINES=[
  [27,25,73,25,0.4,0.8],
  [32,25,32,72,1.15,0.8],
  [68,25,68,72,1.4,0.8],
  [27,72,73,72,2.05,0.8],
  [38,25,38,56,3.15,0.65],
  [44,25,44,56,3.65,0.65],
  [50,25,50,56,4.15,0.65],
  [56,25,56,56,4.65,0.65],
  [62,25,62,56,5.15,0.65],
  [32,67,68,67,6.35,0.7],
  [32,62,68,62,7.15,0.7],
  [38,72,37,80,10.35,0.42],
  [44,72,43.5,79,10.51,0.42],
  [50,72,50,81,10.67,0.42],
  [56,72,56.5,79,10.83,0.42],
  [62,72,63,80,10.99,0.42]
];
const SEG=LINES.map(l=>[l[0],l[1],l[2],l[3]]).concat([[32,56,68,56]]);

function gline(x1,y1,x2,y2,a,p){
  const xe=x1+(x2-x1)*p, ye=y1+(y2-y1)*p;
  ctx.lineCap='round';
  ctx.strokeStyle=`rgba(255,196,120,${0.16*a})`;
  ctx.lineWidth=4.5;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(xe,ye); ctx.stroke();
  ctx.strokeStyle=`rgba(255,238,205,${0.8*a})`;
  ctx.lineWidth=1.1;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(xe,ye); ctx.stroke();
}

function shuttleAt(u,v,a,s){
  if(a<=0.004) return;
  const x=UX(u), y=UY(v), r=10*s;
  ctx.globalAlpha=a;
  ctx.drawImage(sprG,x-r,y-r,r*2,r*2);
  ctx.fillStyle='#fffaf0';
  ctx.beginPath(); ctx.arc(x,y,1.5*s,0,TAU); ctx.fill();
  ctx.globalAlpha=1;
}

function drawShuttle(ct,fade){
  if(ct<7.95||fade<=0.01) return;
  if(ct<8.3){ // appearing at the left selvage
    const q=smooth01((ct-7.95)/0.35);
    shuttleAt(32,56,fade*q,0.6+0.5*q);
    return;
  }
  if(ct<9.75){ // casting the weft across
    const e=easeIO((ct-8.3)/1.45), x=32+36*e;
    const x0=UX(Math.max(32,x-9)), xh=UX(x), y=UY(56);
    if(xh-x0>1){
      const g=ctx.createLinearGradient(x0,0,xh,0);
      g.addColorStop(0,'rgba(255,224,160,0)');
      g.addColorStop(1,`rgba(255,240,210,${0.45*fade})`);
      ctx.strokeStyle=g; ctx.lineWidth=2.2; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(xh,y); ctx.stroke();
    }
    shuttleAt(x,56,fade,1.2);
    return;
  }
  if(ct<10.95){ // arrival flash, then gliding home to rest
    if(ct<10.2){
      const q=(ct-9.75)/0.4;
      ctx.globalAlpha=(1-q)*0.5*fade;
      ctx.strokeStyle='#ffe9c0'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(UX(68),UY(56),3+q*15,0,TAU); ctx.stroke();
      ctx.globalAlpha=1;
    }
    const x= ct<9.95 ? 68 : 68-18*easeIO((ct-9.95)/1.0);
    shuttleAt(x,56,fade,1.25);
    return;
  }
  shuttleAt(50,56,fade*0.95,1+0.12*Math.sin(ct*1.4)); // resting, breathing
}

function drawSparks(ct){
  if(ct<21.4||ct>25.8) return;
  for(let i=0;i<26;i++){
    const st=21.4+h1(i)*2.4;
    const life=(ct-st)/2.0;
    if(life<=0||life>=1) continue;
    const seg=SEG[Math.floor(h1(i+40)*SEG.length)];
    const q=h1(i+80);
    const x0=UX(seg[0]+(seg[2]-seg[0])*q);
    const y0=UY(seg[1]+(seg[3]-seg[1])*q);
    const x=x0+Math.sin(life*5+i*1.7)*7;
    const y=y0-life*life*30;
    ctx.globalAlpha=Math.sin(Math.PI*life)*0.7;
    ctx.drawImage(sprW,x-4,y-4,8,8);
  }
  ctx.globalAlpha=1;
}

function drawConstellation(t){
  const ct=t%PERIOD;
  const fade=1-smooth01((ct-21.5)/2.8);
  const cloth=smooth01((ct-11.0)/1.2)*fade;
  const hold=smooth01((ct-11.6)/1.0)*fade;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  ctx.translate(CX,CY); ctx.rotate(Math.sin(t*0.11)*0.012); ctx.translate(-CX,-CY);

  if(cloth>0.01){ // the cloth beginning to shine
    const x0=UX(32.5), x1=UX(67.5), y0=UY(56.5), y1=UY(71.5);
    const g=ctx.createLinearGradient(0,y0,0,y1);
    g.addColorStop(0,`rgba(255,214,150,${0.14*cloth})`);
    g.addColorStop(1,`rgba(255,178,110,${0.06*cloth})`);
    ctx.fillStyle=g; ctx.fillRect(x0,y0,x1-x0,y1-y0);
    const ybu=73.5-((ct*3.4)%19);
    if(ybu>57.5&&ybu<71){
      const yy=UY(ybu), hh=3.2*K();
      const sa=0.09*cloth*(1-Math.abs(ybu-64)/9);
      if(sa>0.003){
        const sg=ctx.createLinearGradient(0,yy-hh,0,yy+hh);
        sg.addColorStop(0,'rgba(255,240,210,0)');
        sg.addColorStop(0.5,`rgba(255,240,210,${sa})`);
        sg.addColorStop(1,'rgba(255,240,210,0)');
        ctx.fillStyle=sg; ctx.fillRect(x0,yy-hh,x1-x0,hh*2);
      }
    }
  }

  if(fade>0.003){
    for(const L of LINES){
      const p=easeIO((ct-L[4])/L[5]);
      if(p>0) gline(UX(L[0]),UY(L[1]),UX(L[2]),UY(L[3]),fade,p);
    }
    if(ct>=8.3){ // the shuttle's weft
      const we= ct<9.75 ? easeIO((ct-8.3)/1.45) : 1;
      gline(UX(32),UY(56),UX(32+36*we),UY(56),fade,1);
    }
  }

  if(hold>0.01){ // glints running down the warp
    for(let i=0;i<5;i++){
      const q=((ct-12)*0.42+i*0.17)%1;
      const a=Math.sin(Math.PI*q)*0.55*hold;
      if(a>0.01){
        ctx.globalAlpha=a;
        ctx.drawImage(sprW,UX(38+i*6)-5,UY(25+q*31)-5,10,10);
      }
    }
    ctx.globalAlpha=1;
  }

  for(const n of NODES){
    const dt=ct-n[3];
    const lit=smooth01(dt/0.5)*fade;
    const fl=dt>0?Math.exp(-3.2*dt)*fade:0;
    const x=UX(n[0]), y=UY(n[1]);
    const al=0.22+0.78*lit;
    const r=(5+9*n[2])*(0.72+0.4*lit+0.6*fl);
    ctx.globalAlpha=Math.min(1,al+0.5*fl);
    ctx.drawImage(sprW,x-r,y-r,r*2,r*2);
    ctx.globalAlpha=Math.min(1,al*0.9+0.4*fl);
    ctx.fillStyle='#fff6e6';
    ctx.beginPath(); ctx.arc(x,y,0.7+n[2]*1.05,0,TAU); ctx.fill();
  }
  ctx.globalAlpha=1;

  drawShuttle(ct,fade);
  drawSparks(ct);
  ctx.restore();
}

function drawMeteor(t){
  if(!meteor && t>nextMeteor){
    const a=rand(0,TAU), rr=rand(0.1,0.8)*R;
    meteor={x:CX+Math.cos(a)*rr, y:CY+Math.sin(a)*rr, dir:rand(0,TAU), v:rand(320,520), born:t, dur:rand(0.5,0.9)};
  }
  if(!meteor) return;
  const k=(t-meteor.born)/meteor.dur;
  if(k>=1){ meteor=null; nextMeteor=t+rand(8,22); return; }
  const d=meteor.v*meteor.dur*k;
  const hx=meteor.x+Math.cos(meteor.dir)*d, hy=meteor.y+Math.sin(meteor.dir)*d;
  const tail=Math.min(95,d+35);
  const tx=hx-Math.cos(meteor.dir)*tail, ty=hy-Math.sin(meteor.dir)*tail;
  const fade=Math.sin(Math.PI*k);
  const g=ctx.createLinearGradient(tx,ty,hx,hy);
  g.addColorStop(0,'rgba(180,210,255,0)');
  g.addColorStop(1,`rgba(235,244,255,${0.8*fade})`);
  ctx.strokeStyle=g; ctx.lineWidth=1.4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(hx,hy); ctx.stroke();
  ctx.globalAlpha=fade;
  ctx.drawImage(sprB,hx-6,hy-6,12,12);
  ctx.globalAlpha=1;
}

function frame(ms){
  requestAnimationFrame(frame);
  if(!bgGrad) return;
  const t=ms/1000;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=bgGrad; ctx.fillRect(0,0,W,H);
  ctx.save();
  ctx.beginPath(); ctx.arc(CX,CY,R,0,TAU); ctx.clip();

  const rot=(t%ROTP)/ROTP*TAU;
  ctx.save();
  ctx.translate(CX,CY); ctx.rotate(rot);
  ctx.globalAlpha=0.95;
  ctx.drawImage(sky,-W/2,-H/2);
  ctx.restore();

  for(const st of stars){
    const a=st.th+rot;
    const x=CX+Math.cos(a)*st.r, y=CY+Math.sin(a)*st.r;
    let tw=0.55+0.45*Math.sin(t*st.f+st.ph);
    if(pHas){
      const dx=x-px, dy=y-py, d2=dx*dx+dy*dy;
      if(d2<8100) tw+= (1-d2/8100)*0.9;
    }
    const al=Math.min(1.15,st.b*tw);
    const ss=st.s*2.4*(1+0.35*tw);
    ctx.globalAlpha=al;
    ctx.drawImage(st.warm?sprW:sprB,x-ss,y-ss,ss*2,ss*2);
    if(st.s>1.3){
      ctx.globalAlpha=al*0.45;
      ctx.strokeStyle=st.warm?'rgba(255,233,196,0.8)':'rgba(223,233,255,0.8)';
      ctx.lineWidth=0.7;
      const L=st.s*6.5*(0.7+0.4*tw);
      ctx.beginPath();
      ctx.moveTo(x-L,y); ctx.lineTo(x+L,y);
      ctx.moveTo(x,y-L); ctx.lineTo(x,y+L);
      ctx.stroke();
    }
  }
  ctx.globalAlpha=1;

  ctx.globalCompositeOperation='lighter';
  drawMeteor(t);
  ctx.globalCompositeOperation='source-over';

  drawConstellation(t);

  if(pHas){
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=0.05;
    ctx.drawImage(sprB,px-80,py-80,160,160);
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
  }

  ctx.fillStyle=vinGrad;
  ctx.fillRect(CX-R,CY-R,R*2,R*2);
  ctx.restore();
}

window.addEventListener('pointermove', e=>{ px=e.clientX; py=e.clientY; pHas=true; }, {passive:true});
window.addEventListener('pointerleave', ()=>{ pHas=false; });
document.addEventListener('mouseleave', ()=>{ pHas=false; });
window.addEventListener('resize', resize);

resize();
requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Weaver's Loom",
  "statement": "At the edge of night sits a loom where stray sparks are gathered and threaded; whenever scattered light is woven into a story below, another thread kindles in its cloth, and the shuttle glides home to rest."
}
```