```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>.</title>
<style>
html,body{margin:0;height:100%;overflow:hidden;background:#000}
canvas{position:fixed;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c');
const ctx=cv.getContext('2d');
let W=0,H=0,CX=0,CY=0,R=0;

function resize(){
  W=window.innerWidth;H=window.innerHeight;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  CX=W/2;CY=H/2;R=Math.min(W,H)/2;
}
window.addEventListener('resize',resize);
resize();

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd=mulberry32(90317);

function smooth(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

// Background field of stars in unit-disc coordinates
const bg=[];
for(let i=0;i<340;i++){
  let x,y;
  do{x=rnd()*2-1;y=rnd()*2-1;}while(x*x+y*y>1);
  bg.push({x,y,r:0.3+Math.pow(rnd(),3)*1.5,ph:rnd()*6.283,sp:0.6+rnd()*2.2,a:0.25+rnd()*0.75});
}

// Faint dust motes
const dust=[];
for(let i=0;i<70;i++){
  let x,y;
  do{x=rnd()*2-1;y=rnd()*2-1;}while(x*x+y*y>1);
  dust.push({x,y,r:0.4+rnd()*0.8,a:0.05+rnd()*0.12});
}

// The Dawn-Thief Heron: star positions [x, y, magnitude-size]
const HS=[
  [0.16,-0.62,1.0], // 0 head
  [0.52,-0.50,0.7], // 1 beak tip
  [0.08,-0.36,0.5], // 2 neck
  [-0.04,-0.10,0.8],// 3 breast
  [-0.18,0.05,0.9], // 4 body
  [-0.62,0.12,0.6], // 5 tail
  [-0.26,0.14,0.5], // 6 hip
  [-0.22,0.42,0.5], // 7 left knee
  [-0.32,0.76,0.7], // 8 left foot
  [-0.06,0.44,0.5], // 9 right knee
  [-0.04,0.80,0.7], // 10 right foot
  [-0.50,-0.30,0.6] // 11 wing tip
];
const HE=[[0,1],[0,2],[2,3],[3,4],[4,5],[4,6],[6,7],[7,8],[6,9],[9,10],[3,11],[11,5]];
const HSCALE=0.9;

// Depth from the head, used for the dawn-pulse travelling down the bird
const depth=new Array(HS.length).fill(-1);
depth[0]=0;
{
  const q=[0];
  while(q.length){
    const u=q.shift();
    for(const [a,b] of HE){
      let v=-1;
      if(a===u)v=b;else if(b===u)v=a;
      if(v>=0&&depth[v]<0){depth[v]=depth[u]+1;q.push(v);}
    }
  }
}
const maxDepth=Math.max(...depth);

const T=16000;
let t0=null;
const shooters=[];

function rot(x,y,a){const c=Math.cos(a),s=Math.sin(a);return [x*c-y*s,x*s+y*c];}

function drawGlow(x,y,r,col,alpha){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(${col},${alpha})`);
  g.addColorStop(0.35,`rgba(${col},${alpha*0.35})`);
  g.addColorStop(1,`rgba(${col},0)`);
  ctx.fillStyle=g;
  ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
}

function frame(now){
  if(t0===null)t0=now;
  const t=now-t0;
  const ms=t%T;
  const skyA=t*0.00003;

  ctx.fillStyle='#000';
  ctx.fillRect(0,0,W,H);

  ctx.save();
  ctx.beginPath();ctx.arc(CX,CY,R,0,6.283);ctx.clip();

  // Sky body
  const sky=ctx.createRadialGradient(CX,CY,0,CX,CY,R);
  sky.addColorStop(0,'#14163a');
  sky.addColorStop(0.6,'#080a1f');
  sky.addColorStop(1,'#02030a');
  ctx.fillStyle=sky;
  ctx.fillRect(0,0,W,H);

  // Milky band slowly turning with the sky
  ctx.save();
  ctx.translate(CX,CY);
  ctx.rotate(skyA*0.6+0.7);
  ctx.scale(1,0.22);
  const band=ctx.createRadialGradient(0,0,0,0,0,R*1.25);
  band.addColorStop(0,'rgba(150,140,210,0.20)');
  band.addColorStop(0.5,'rgba(110,120,190,0.09)');
  band.addColorStop(1,'rgba(90,100,170,0)');
  ctx.fillStyle=band;
  ctx.beginPath();ctx.arc(0,0,R*1.25,0,6.283);ctx.fill();
  ctx.restore();

  // Dust
  ctx.fillStyle='#cfd8ff';
  for(const d of dust){
    const [x,y]=rot(d.x,d.y,skyA);
    ctx.globalAlpha=d.a;
    ctx.beginPath();ctx.arc(CX+x*R,CY+y*R,d.r,0,6.283);ctx.fill();
  }

  // Background stars
  for(const s of bg){
    const [x,y]=rot(s.x,s.y,skyA);
    const tw=0.55+0.45*Math.sin(t*0.001*s.sp+s.ph);
    ctx.globalAlpha=s.a*tw;
    ctx.fillStyle='#e8eeff';
    ctx.beginPath();ctx.arc(CX+x*R,CY+y*R,s.r,0,6.283);ctx.fill();
  }
  ctx.globalAlpha=1;

  // Occasional shooting stars
  if(Math.random()<0.0035&&shooters.length<2){
    const a=Math.random()*6.283;
    const r0=Math.random()*0.7;
    shooters.push({x:Math.cos(a)*r0,y:Math.sin(a)*r0,dx:Math.cos(a+1.2)*0.9,dy:Math.sin(a+1.2)*0.9,life:0,max:900});
  }
  for(let i=shooters.length-1;i>=0;i--){
    const s=shooters[i];
    s.life+=16.7;
    const p=s.life/s.max;
    if(p>=1){shooters.splice(i,1);continue;}
    const hx=s.x+s.dx*p*0.6, hy=s.y+s.dy*p*0.6;
    const tx=hx-s.dx*0.12, ty=hy-s.dy*0.12;
    const g=ctx.createLinearGradient(CX+tx*R,CY+ty*R,CX+hx*R,CY+hy*R);
    g.addColorStop(0,'rgba(200,220,255,0)');
    g.addColorStop(1,`rgba(235,242,255,${0.8*(1-p)})`);
    ctx.strokeStyle=g;ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(CX+tx*R,CY+ty*R);ctx.lineTo(CX+hx*R,CY+hy*R);ctx.stroke();
  }

  // ---- The constellation ----
  // Timeline: stars kindle (0-2.5s), lines draw (2.2-5.1s), dawn pulse travels (5.2-8s),
  // figure holds, then fades (11.5-14s), dark rest until loop.
  const starsIn=smooth(0,2500,ms);
  const fadeOut=1-smooth(11500,14000,ms);
  const alpha=starsIn*fadeOut;

  if(alpha>0.001){
    const pts=HS.map(([x,y])=>{
      const [rx,ry]=rot(x*HSCALE,y*HSCALE,skyA);
      return [CX+rx*R*0.92,CY+ry*R*0.92];
    });

    const pulseP=clamp((ms-5200)/2800,0,1);
    const pulseS=pulseP*maxDepth;
    const pulseOn=ms>5200&&ms<8200;

    // Lines
    HE.forEach(([a,b],i)=>{
      const prog=clamp((ms-2200-i*250)/400,0,1);
      if(prog<=0)return;
      const ax=pts[a][0],ay=pts[a][1];
      const bx=ax+(pts[b][0]-ax)*prog;
      const by=ay+(pts[b][1]-ay)*prog;
      const mid=(depth[a]+depth[b])/2;
      const boost=pulseOn?Math.exp(-Math.pow(mid-pulseS,2)*1.8):0;
      ctx.save();
      ctx.shadowColor='rgba(170,200,255,0.9)';
      ctx.shadowBlur=6+boost*14;
      ctx.strokeStyle=`rgba(200,225,255,${alpha*(0.55+boost*0.45)})`;
      ctx.lineWidth=1+boost*0.8;
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
      ctx.restore();
    });

    // Stars
    pts.forEach(([x,y],i)=>{
      const [, , mag]=HS[i];
      const boost=pulseOn?Math.exp(-Math.pow(depth[i]-pulseS,2)*2.5):0;
      const tw=0.9+0.1*Math.sin(t*0.004+i);
      const size=(2.2+mag*2.2)*(1+boost*0.8);
      drawGlow(x,y,size*6,'170,200,255',alpha*(0.28+boost*0.5));
      drawGlow(x,y,size*1.6,'230,240,255',alpha*tw);
      ctx.fillStyle=`rgba(255,255,255,${alpha*tw})`;
      ctx.beginPath();ctx.arc(x,y,size*0.45,0,6.283);ctx.fill();
    });
  }

  ctx.restore();

  // Thin rim tint inside the circle (sky edge)
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
  "title": "The Dawn-Thief Heron",
  "statement": "Before the first morning, a heron waded into the still lake of the night and swallowed the dawn whole, so the sun would never rise and the reeds would stay silver forever. Its stars still stand in the sky, waiting for the water to glow again."
}
```