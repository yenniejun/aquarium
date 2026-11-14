```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;overflow:hidden;background:transparent;}
canvas{display:block;width:100vw;height:100vh;touch-action:none;}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c');
const ctx=cv.getContext('2d');
let W=0,H=0,DPR=1;

function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.floor(W*DPR);cv.height=Math.floor(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize',resize);
resize();

const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const frac=x=>x-Math.floor(x);
const rnd=i=>frac(Math.sin(i*127.1+311.7)*43758.5453);

function bz(P,s){
  const u=1-s;
  const a=u*u*u,b=3*u*u*s,c=3*u*s*s,e=s*s*s;
  return [
    a*P[0][0]+b*P[1][0]+c*P[2][0]+e*P[3][0],
    a*P[0][1]+b*P[1][1]+c*P[2][1]+e*P[3][1]
  ];
}

// Stems in unit coordinates (u right, v up), full size at growth 1
const stems=[
  {p:[[0,0],[0.02,-0.2],[-0.04,-0.42],[0.01,-0.6]],delay:0,hue:190},
  {p:[[0,0],[-0.02,-0.18],[-0.14,-0.3],[-0.24,-0.44]],delay:0.18,hue:280},
  {p:[[0,0],[0.02,-0.16],[0.16,-0.3],[0.27,-0.4]],delay:0.26,hue:40}
];
const tipsFull=stems.map(s=>bz(s.p,1));

const NSEED=7;

function frame(){
  const t=(Date.now()/1000)%60;

  const d=ss(8,14,t)*(1-ss(46,52,t));                       // daylight
  const warm=Math.max(ss(7,11,t)*(1-ss(11,16,t)),ss(42,46,t)*(1-ss(48,52,t)))*0.6;
  const L=ss(8,30,t)*(1-ss(46,56,t))*(t>=8||t<8?1:1);       // life: seed -> grown -> seed
  const Lg=(t<8)?0:L;
  const open=ss(9,17,t)*(1-ss(44,52,t));                    // bloom openness

  const k=Math.min(H*0.62,W*1.0);
  const ox=W/2, oy=H*0.84;

  ctx.clearRect(0,0,W,H);

  // Light mood
  if(1-d>0.01){
    ctx.fillStyle=`rgba(4,8,22,${0.45*(1-d)})`;
    ctx.fillRect(0,0,W,H);
  }
  if(warm>0.01){
    ctx.fillStyle=`rgba(255,140,70,${0.12*warm})`;
    ctx.fillRect(0,0,W,H);
  }

  // Soil
  const sr=[60+60*d,40+40*d,30+30*d];
  ctx.beginPath();
  ctx.ellipse(ox,oy+k*0.03,k*0.46,k*0.08,0,0,TAU);
  ctx.fillStyle=`rgb(${sr[0]|0},${sr[1]|0},${sr[2]|0})`;
  ctx.fill();
  for(let i=0;i<22;i++){
    const x=ox+(rnd(i*3+1)-0.5)*k*0.86;
    const y=oy+k*(0.02+rnd(i*3+2)*0.06);
    const r=k*(0.004+rnd(i*3+3)*0.008);
    ctx.beginPath();
    ctx.arc(x,y,r,0,TAU);
    ctx.fillStyle=`rgba(${(150+80*d)|0},${(140+70*d)|0},${(160+60*d)|0},0.7)`;
    ctx.fill();
  }

  // Drifting motes
  for(let i=0;i<16;i++){
    const x=W*(0.22+0.56*rnd(i))+Math.sin(t*0.3+i)*8;
    const y=H*(0.85-0.5*frac(rnd(i+5)+t*0.01*(rnd(i+9)+0.5)));
    ctx.beginPath();
    ctx.arc(x,y,1.2,0,TAU);
    ctx.fillStyle=`rgba(255,250,235,${0.15+0.35*d})`;
    ctx.fill();
  }

  // Prism beams from open flowers
  if(d>0.01){
    stems.forEach((s,i)=>{
      const prog=clamp((Lg-s.delay)/(1-s.delay),0,1);
      if(prog<0.05)return;
      const tip=bz(s.p,prog);
      const cx=ox+tip[0]*k, cy=oy+tip[1]*k;
      const a=0.07*d*open*prog;
      if(a<0.002)return;
      const spread=k*0.22;
      ctx.beginPath();
      ctx.moveTo(cx-k*0.02,cy);
      ctx.lineTo(cx+k*0.02,cy);
      ctx.lineTo(cx+spread*0.6+(i-1)*k*0.05,oy);
      ctx.lineTo(cx-spread*0.6+(i-1)*k*0.05,oy);
      ctx.closePath();
      ctx.fillStyle=`hsla(${(s.hue+t*4)%360},90%,80%,${a})`;
      ctx.fill();
    });
  }

  // Stems
  stems.forEach(s=>{
    const prog=clamp((Lg-s.delay)/(1-s.delay),0,1);
    if(prog<=0.001)return;
    const n=28;
    ctx.beginPath();
    for(let j=0;j<=n;j++){
      const p=bz(s.p,prog*j/n);
      const X=ox+p[0]*k, Y=oy+p[1]*k;
      if(j===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);
    }
    ctx.lineWidth=Math.max(1.2,k*0.012);
    ctx.lineCap='round';
    ctx.strokeStyle=`hsla(${160+d*10},55%,${45+25*d}%,0.85)`;
    ctx.stroke();
    ctx.lineWidth=Math.max(0.6,k*0.003);
    ctx.strokeStyle='rgba(255,255,255,0.45)';
    ctx.stroke();
  });

  // Crystal leaves on main stem
  const main=stems[0];
  [0.3,0.55,0.8].forEach((s0,i)=>{
    const prog=clamp((Lg-main.delay)/(1-main.delay),0,1);
    if(prog<s0)return;
    const lg=ss(0.15+0.12*i,0.45+0.12*i,Lg);
    if(lg<0.01)return;
    const P=bz(main.p,s0), P2=bz(main.p,s0+0.01);
    const px=ox+P[0]*k, py=oy+P[1]*k;
    const ang=Math.atan2((P2[1]-P[1])*k,(P2[0]-P[0])*k);
    const side=i%2?1:-1;
    const dir=ang+side*0.9;
    const dx=Math.cos(dir),dy=Math.sin(dir);
    const len=k*0.13*lg;
    const w=len*0.28;
    const perpx=-dy,perpy=dx;
    const tipx=px+dx*len,tipy=py+dy*len;
    const c1x=px+dx*len*0.5+perpx*w, c1y=py+dy*len*0.5+perpy*w;
    const c2x=px+dx*len*0.5-perpx*w, c2y=py+dy*len*0.5-perpy*w;
    ctx.beginPath();
    ctx.moveTo(px,py);ctx.quadraticCurveTo(c1x,c1y,tipx,tipy);ctx.closePath();
    ctx.fillStyle=`hsla(${150+i*8},60%,${40+30*d}%,0.55)`;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px,py);ctx.quadraticCurveTo(c2x,c2y,tipx,tipy);ctx.closePath();
    ctx.fillStyle=`hsla(${170+i*8},70%,${55+25*d}%,0.5)`;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px,py);ctx.lineTo(tipx,tipy);
    ctx.strokeStyle='rgba(255,255,255,0.35)';
    ctx.lineWidth=0.8;ctx.stroke();
  });

  // Flowers
  stems.forEach((s,si)=>{
    const prog=clamp((Lg-s.delay)/(1-s.delay),0,1);
    if(prog<0.02)return;
    const tip=bz(s.p,prog);
    const cx=ox+tip[0]*k, cy=oy+tip[1]*k;
    const R=k*0.075*Math.min(1,prog*1.4);
    const o=open;
    const spacing=(TAU/6)*(0.2+0.8*o);
    const lightness=40+30*d;
    const n=6;
    for(let j=0;j<n;j++){
      const ang=-Math.PI/2+(j-2.5)*spacing+Math.sin(t*0.5+j+si)*0.03*o;
      const len=R*(0.5+0.5*o);
      const rx=len*0.5, ry=R*(0.18+0.22*o);
      const hue=(s.hue+j*22+t*4)%360;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(len*0.5+R*0.05,0,rx,ry,0,0,TAU);
      ctx.fillStyle=`hsla(${hue},85%,${lightness}%,0.55)`;
      ctx.fill();
      ctx.strokeStyle=`hsla(${hue},90%,90%,0.7)`;
      ctx.lineWidth=0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(len*0.5+R*0.05+rx*0.2,-ry*0.2,rx*0.35,ry*0.3,0,0,TAU);
      ctx.fillStyle='rgba(255,255,255,0.35)';
      ctx.fill();
      ctx.restore();
    }
    // Core glow (brighter at night, when the flower is closed)
    const glow=0.35+0.45*(1-d)*(1-o*0.5)+0.2*o;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.9);
    g.addColorStop(0,`rgba(255,246,190,${glow})`);
    g.addColorStop(0.4,`rgba(255,220,140,${glow*0.4})`);
    g.addColorStop(1,'rgba(255,220,140,0)');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(cx,cy,R*0.9,0,TAU);ctx.fill();
  });

  // Seed bulb at base (visible when plant has retracted)
  const bulbA=(1-ss(0.05,0.3,Lg));
  if(bulbA>0.01){
    const pulse=0.7+0.3*Math.sin(t*1.3);
    const br=k*0.03;
    const g=ctx.createRadialGradient(ox,oy-k*0.03,0,ox,oy-k*0.03,br*4);
    g.addColorStop(0,`rgba(255,200,120,${0.5*bulbA*pulse})`);
    g.addColorStop(1,'rgba(255,200,120,0)');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(ox,oy-k*0.03,br*4,0,TAU);ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ox,oy-k*0.03,br,br*1.35,0,0,TAU);
    ctx.fillStyle=`rgba(255,226,170,${bulbA*0.95})`;
    ctx.fill();
  }

  // Glowing seeds released at sunset, drifting into the night
  const age0=((t-46)+60)%60;
  for(let i=0;i<NSEED;i++){
    const age=age0-i*0.9;
    if(age<0||age>22)continue;
    const tip=tipsFull[i%tipsFull.length];
    const px=ox+tip[0]*k, py=oy+tip[1]*k;
    const x=px+Math.sin(age*0.9+i)*k*0.04+(rnd(i+7)-0.5)*k*0.1*age*0.3;
    const y=py-age*k*0.02-age*age*k*0.0006;
    let a=ss(0,1.5,age)*(1-ss(16,22,age));
    a*=(1-d*0.95)*(0.6+0.4*Math.sin(t*3+i));
    if(a<0.01)continue;
    const r=k*0.012;
    const g=ctx.createRadialGradient(x,y,0,x,y,r*3);
    g.addColorStop(0,`rgba(190,255,230,${a})`);
    g.addColorStop(1,'rgba(190,255,230,0)');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(x,y,r*3,0,TAU);ctx.fill();
    ctx.beginPath();ctx.arc(x,y,r*0.35,0,TAU);
    ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fill();
  }
}

function loop(){
  frame();
  requestAnimationFrame(loop);
}
loop();
})();
</script>
</body>
</html>
```

```json
{
  "title": "Lantern Glassbell",
  "statement": "A bell-flowered crystal bloom that unfolds with the sunrise, scatters prismatic light across the soil at noon, and folds shut at dusk to release its glowing seeds into the dark. By morning it has sunk back into a single warm ember, ready to begin again."
}
```