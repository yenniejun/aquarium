```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Scribe's Inkwell</title>
<style>
  html,body{margin:0;padding:0;height:100%;overflow:hidden;background:transparent}
  canvas{position:fixed;inset:0;width:100%;height:100%;display:block;pointer-events:none}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
'use strict';
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W=0,H=0,u=0,DPR=1;
function resize(){
  DPR=Math.min(2,window.devicePixelRatio||1);
  W=window.innerWidth;H=window.innerHeight;u=Math.min(W,H);
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
}
window.addEventListener('resize',resize);resize();

let mx=-9999,my=-9999,plast=-99;
window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;plast=performance.now()/1000;},{passive:true});

function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const rnd=mulberry32(77341);
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);

/* ---------- actors ---------- */
const shrooms=[
  {dx:-0.015,dy:0.000,s:1.00,phase:0.0,stemH:0.30,r:0.145,lean:-0.05},
  {dx: 0.135,dy:0.010,s:0.66,phase:2.3,stemH:0.22,r:0.100,lean: 0.16},
  {dx:-0.155,dy:0.014,s:0.50,phase:4.1,stemH:0.16,r:0.075,lean:-0.22}
];
shrooms.forEach(sh=>{sh.tilt=sh.lean;sh.nextDrop=2+rnd()*4;sh.nextRipple=1+rnd()*2;sh.capX=0;sh.capY=0;sh.rNow=10;});

const threads=[];
for(let i=0;i<8;i++){
  const side=(i%2===0)?1:-1;
  const pts=[];const n=12+((rnd()*8)|0);
  let f=0.05+rnd()*0.08, o=(rnd()-0.5)*0.4;
  for(let k=0;k<n;k++){
    pts.push([f,o]);
    f+=(0.85/n)*(0.75+rnd()*0.55);
    o+=(rnd()-0.5)*0.22;o=clamp(o,-0.55,0.55);
  }
  threads.push({side,pts,ph:rnd()*6.28,sp:0.10+rnd()*0.10});
}

const motes=[];
for(let i=0;i<26;i++)motes.push({x:rnd(),y:rnd(),sp:0.004+rnd()*0.008,ph:rnd()*6.28,r:0.0015+rnd()*0.0015});

let spores=[],drops=[],ripples=[];
let bookG=null;

function bezY(f,bg){const c=-bg.lift*1.25;return (1-f)*(1-f)*bg.y0+2*(1-f)*f*c+f*f*(-bg.lift);}

/* ---------- background ---------- */
function drawBackground(t){
  let g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#070410');g.addColorStop(0.55,'#130b24');g.addColorStop(1,'#0a0616');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  g=ctx.createRadialGradient(W*0.5,H*0.42,0,W*0.5,H*0.42,u*0.75);
  g.addColorStop(0,'rgba(80,50,140,0.22)');g.addColorStop(1,'rgba(80,50,140,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // ambient breathing light around the caps
  const p=0.5+0.5*Math.sin(t*0.6);
  g=ctx.createRadialGradient(W*0.5,H*0.6,0,W*0.5,H*0.6,u*0.55);
  g.addColorStop(0,'rgba(70,190,220,'+(0.04+0.03*p)+')');g.addColorStop(1,'rgba(70,190,220,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}

/* ---------- book, moss, mycelium ---------- */
function moss(x,y,n){
  for(let i=0;i<n;i++){
    const a=rnd()*6.28,d=rnd()*u*0.018;
    const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*0.5;
    const rr=u*(0.004+rnd()*0.005);
    ctx.fillStyle=rnd()<0.5?'#223d20':'#35592c';
    ctx.beginPath();ctx.arc(px,py,rr,0,7);ctx.fill();
    ctx.fillStyle='rgba(120,170,90,0.5)';
    ctx.beginPath();ctx.arc(px-rr*0.25,py-rr*0.35,rr*0.4,0,7);ctx.fill();
  }
}

function drawBook(t){
  const bx=W*0.5,by=H*0.80,bw=u*0.66,lift=u*0.058,pt=u*0.034,y0=u*0.006,rot=-0.045;
  bookG={bx,by,bw,lift,pt,y0,rot};
  ctx.save();ctx.translate(bx,by);ctx.rotate(rot);

  // cover
  ctx.beginPath();
  ctx.moveTo(-bw/2-u*0.014,-lift-u*0.004);
  ctx.quadraticCurveTo(-bw/4,y0*2,0,y0+u*0.012);
  ctx.quadraticCurveTo(bw/4,y0*2,bw/2+u*0.014,-lift-u*0.004);
  ctx.lineTo(bw/2+u*0.014,-lift+pt+u*0.014);
  ctx.quadraticCurveTo(bw/4,y0+pt*1.5,0,y0+pt+u*0.022);
  ctx.quadraticCurveTo(-bw/4,y0+pt*1.5,-bw/2-u*0.014,-lift+pt+u*0.014);
  ctx.closePath();
  let g=ctx.createLinearGradient(0,-lift,0,pt+u*0.03);
  g.addColorStop(0,'#31193a');g.addColorStop(1,'#150c1c');
  ctx.fillStyle=g;ctx.fill();

  // page blocks
  for(const side of [-1,1]){
    ctx.beginPath();
    ctx.moveTo(0,y0);
    ctx.quadraticCurveTo(side*bw/4,-lift*1.25,side*bw/2,-lift);
    ctx.lineTo(side*bw/2,-lift+pt);
    ctx.quadraticCurveTo(side*bw/4,-lift*1.25+pt,0,y0+pt);
    ctx.closePath();
    g=ctx.createLinearGradient(0,0,side*bw/2,0);
    g.addColorStop(0,'#93815e');g.addColorStop(0.18,'#d3c5a0');g.addColorStop(1,'#ece1c4');
    ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle='rgba(90,74,48,0.30)';ctx.lineWidth=1;
    for(let i=1;i<=5;i++){
      const d=pt*i/6;
      ctx.beginPath();
      ctx.moveTo(0,y0+d*0.85);
      ctx.quadraticCurveTo(side*bw/4,-lift*1.25+d,side*bw/2,-lift+d);
      ctx.stroke();
    }
  }
  // spine shadow
  g=ctx.createLinearGradient(-u*0.02,0,u*0.02,0);
  g.addColorStop(0,'rgba(40,25,10,0)');g.addColorStop(0.5,'rgba(40,25,10,0.45)');g.addColorStop(1,'rgba(40,25,10,0)');
  ctx.fillStyle=g;ctx.fillRect(-u*0.02,-lift*1.1,u*0.04,lift*1.1+pt);

  // teal ink stain beneath the big cap
  ctx.fillStyle='rgba(30,110,135,0.30)';
  ctx.beginPath();ctx.ellipse(shrooms[0].dx*u,y0+u*0.004,u*0.055,u*0.012,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(70,190,220,0.16)';
  ctx.beginPath();ctx.ellipse(shrooms[0].dx*u,y0+u*0.004,u*0.03,u*0.007,0,0,7);ctx.fill();

  moss(-bw*0.46,-lift*0.85,9);
  moss(bw*0.40,-lift*0.75,7);
  moss(bw*0.12,y0+pt*0.8,5);

  // mycelium threads tracing the pages
  for(const th of threads){
    const gv=0.5+0.5*Math.sin(t*th.sp+th.ph);
    const cnt=Math.max(2,Math.floor(th.pts.length*(0.3+0.7*gv)));
    ctx.beginPath();
    let lx=0,ly=0;
    for(let k=0;k<cnt;k++){
      const f=th.pts[k][0],of=th.pts[k][1];
      lx=th.side*(bw/2)*Math.min(f,1);
      ly=bezY(Math.min(f,1),bookG)+of*pt;
      if(k===0)ctx.moveTo(lx,ly);else ctx.lineTo(lx,ly);
    }
    ctx.strokeStyle='rgba(130,235,255,'+(0.22+0.22*gv)+')';
    ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(190,250,255,'+(0.5+0.4*gv)+')';
    ctx.beginPath();ctx.arc(lx,ly,1.6,0,7);ctx.fill();
  }
  ctx.restore();
}

function topYWorld(x){
  if(!bookG)return H;
  const f=clamp(Math.abs(x-bookG.bx)/(bookG.bw/2),0,1);
  return bookG.by+bezY(f,bookG)+bookG.pt*0.3;
}

/* ---------- mushrooms ---------- */
function drip(x,y,len){
  ctx.beginPath();
  ctx.moveTo(x-len*0.25,y);
  ctx.quadraticCurveTo(x,y+len,x+len*0.25,y);
  ctx.closePath();
  ctx.fillStyle='rgba(120,235,255,0.8)';ctx.fill();
}

function drawCap(sh,t,cx,cy,r){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(sh.tilt*0.7);
  const pulse=0.5+0.5*Math.sin(t*1.1+sh.phase);

  ctx.globalCompositeOperation='lighter';
  let g=ctx.createRadialGradient(0,0,r*0.1,0,0,r*1.9);
  g.addColorStop(0,'rgba(90,220,255,'+(0.10+0.09*pulse)+')');
  g.addColorStop(1,'rgba(90,220,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.9,0,7);ctx.fill();
  ctx.globalCompositeOperation='source-over';

  // bowl-shaped cap body
  ctx.beginPath();
  ctx.moveTo(-r,0);
  ctx.bezierCurveTo(-r*0.95,r*0.85,r*0.95,r*0.85,r,0);
  ctx.bezierCurveTo(r*0.5,-r*0.18,-r*0.5,-r*0.18,-r,0);
  ctx.closePath();
  g=ctx.createLinearGradient(0,-r*0.2,0,r*0.85);
  g.addColorStop(0,'#7a5cd6');g.addColorStop(0.45,'#3d2a7a');g.addColorStop(1,'#180f3c');
  ctx.fillStyle=g;ctx.fill();

  ctx.strokeStyle='rgba(16,8,44,0.5)';ctx.lineWidth=Math.max(1,r*0.03);
  for(let i=-2;i<=2;i++){
    if(i===0)continue;
    ctx.beginPath();
    ctx.moveTo(i*r*0.30,-r*0.10);
    ctx.quadraticCurveTo(i*r*0.34,r*0.35,i*r*0.29,r*0.70);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(-r,0);
  ctx.bezierCurveTo(-r*0.5,-r*0.18,r*0.5,-r*0.18,r,0);
  ctx.strokeStyle='rgba(195,175,255,0.55)';
  ctx.lineWidth=Math.max(1,r*0.035);ctx.stroke();

  drip(-r*0.72,r*0.06,r*0.22);
  drip(r*0.62,r*0.09,r*0.16);

  // luminous ink pool
  ctx.beginPath();ctx.ellipse(0,r*0.02,r*0.74,r*0.20,0,0,7);
  g=ctx.createRadialGradient(0,r*0.02,0,0,r*0.02,r*0.74);
  g.addColorStop(0,'rgba(220,255,255,'+(0.72+0.28*pulse)+')');
  g.addColorStop(0.5,'rgba(90,225,245,0.85)');
  g.addColorStop(1,'rgba(20,60,120,0.15)');
  ctx.fillStyle=g;ctx.fill();
  ctx.restore();
}

function drawShrooms(t,dt){
  const pFresh=(t-plast)<3;
  for(const sh of shrooms){
    const baseX=W*0.5+sh.dx*u;
    const baseY=bookG.by+bookG.y0+sh.dy*u+u*0.004;
    const h=sh.stemH*u;
    let target=sh.lean+Math.sin(t*0.4+sh.phase)*0.035;
    if(pFresh)target+=clamp((mx-baseX)/(W*0.5),-1,1)*0.18;
    sh.tilt+=(target-sh.tilt)*Math.min(1,dt*3);
    const capX=baseX+Math.sin(sh.tilt)*h;
    const capY=baseY-Math.cos(sh.tilt)*h;
    sh.capX=capX;sh.capY=capY;
    const r=sh.r*u*(1+0.035*Math.sin(t*0.7+sh.phase));
    sh.rNow=r;

    // stem
    const g=ctx.createLinearGradient(baseX,baseY,capX,capY);
    g.addColorStop(0,'#170f2e');g.addColorStop(1,'#4a3778');
    ctx.lineCap='round';
    ctx.strokeStyle=g;ctx.lineWidth=u*0.024*sh.s;
    ctx.beginPath();
    ctx.moveTo(baseX,baseY+u*0.006);
    ctx.quadraticCurveTo(baseX+Math.sin(sh.tilt)*h*0.15,baseY-h*0.5,capX,capY+r*0.35);
    ctx.stroke();
    ctx.strokeStyle='rgba(150,120,220,0.35)';ctx.lineWidth=u*0.024*sh.s*0.45;
    ctx.beginPath();
    ctx.moveTo(baseX,baseY+u*0.004);
    ctx.quadraticCurveTo(baseX+Math.sin(sh.tilt)*h*0.15,baseY-h*0.5,capX,capY+r*0.3);
    ctx.stroke();

    ctx.fillStyle='#120b22';
    ctx.beginPath();ctx.ellipse(baseX,baseY+u*0.004,r*0.30,r*0.10,0,0,7);ctx.fill();

    drawCap(sh,t,capX,capY,r);

    // ripple rings on the ink surface
    if(t>sh.nextRipple){sh.nextRipple=t+2+rnd()*2.5;ripples.push({sh,t0:t});}
    // drip scheduling
    if(t>sh.nextDrop){
      sh.nextDrop=t+3+rnd()*5;
      drops.push({sh,side:rnd()<0.5?-1:1,t0:t,state:0,x:0,y:0,vy:0});
    }
  }
  // draw ripples
  ctx.globalCompositeOperation='lighter';
  for(let i=ripples.length-1;i>=0;i--){
    const rp=ripples[i],age=t-rp.t0;
    if(age>1.4||age<0){ripples.splice(i,1);continue;}
    const sh=rp.sh;
    ctx.save();ctx.translate(sh.capX,sh.capY);ctx.rotate(sh.tilt*0.7);
    ctx.strokeStyle='rgba(170,250,255,'+((1-age/1.4)*0.5)+')';
    ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(0,sh.rNow*0.02,sh.rNow*(0.15+age*0.42),sh.rNow*(0.05+age*0.12),0,0,7);ctx.stroke();
    ctx.restore();
  }
  ctx.globalCompositeOperation='source-over';
}

/* ---------- drops & spores ---------- */
function spawnSpore(x,y,burst){
  if(spores.length>120)return;
  const cols=['#8ef2ff','#c9b6ff','#a8ffe8'];
  spores.push({
    x,y,
    vx:(rnd()-0.5)*u*0.012*(burst?3:1),
    vy:-(u*(0.022+rnd()*0.02))*(burst?1.4:1),
    age:0,maxAge:burst?(2+rnd()*2):(5+rnd()*4),
    type:(rnd()*4)|0,
    rot:rnd()*6.28,vr:(rnd()-0.5)*1.4,
    sz:u*(0.005+rnd()*0.006),
    swf:0.6+rnd()*1.2,swp:rnd()*6.28,
    col:cols[(rnd()*3)|0]
  });
}

function updateDrops(t,dt){
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i],sh=d.sh,tl=sh.tilt*0.7;
    if(d.state===0){
      const age=t-d.t0;
      if(age>0.7){
        const lx=d.side*sh.rNow*0.95,ly=sh.rNow*0.12;
        d.x=sh.capX+lx*Math.cos(tl)-ly*Math.sin(tl);
        d.y=sh.capY+lx*Math.sin(tl)+ly*Math.cos(tl);
        d.state=1;d.vy=0;
      }else{
        const lx=d.side*sh.rNow*0.95,ly=sh.rNow*0.12+age*sh.rNow*0.1;
        const wx=sh.capX+lx*Math.cos(tl)-ly*Math.sin(tl);
        const wy=sh.capY+lx*Math.sin(tl)+ly*Math.cos(tl);
        ctx.fillStyle='rgba(140,240,255,0.9)';
        ctx.beginPath();ctx.arc(wx,wy,u*0.005*(age/0.7)+1,0,7);ctx.fill();
        continue;
      }
    }
    d.vy+=u*2.2*dt;d.y+=d.vy*dt;
    ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,u*0.008);
    g.addColorStop(0,'rgba(200,255,255,0.95)');g.addColorStop(1,'rgba(90,220,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(d.x,d.y,u*0.008,0,7);ctx.fill();
    ctx.globalCompositeOperation='source-over';
    if(d.y>=topYWorld(d.x)){
      for(let k=0;k<4;k++)spawnSpore(d.x+(rnd()-0.5)*u*0.01,d.y,true);
      drops.splice(i,1);
    }
  }
}

let sporeAcc=0;
function updateSpores(t,dt){
  sporeAcc+=dt;
  while(sporeAcc>0.22){
    sporeAcc-=0.22;
    const sh=shrooms[(rnd()*3)|0];
    spawnSpore(sh.capX+(rnd()-0.5)*sh.rNow*0.8,sh.capY-sh.rNow*0.05,false);
  }
  const pFresh=(t-plast)<3;
  ctx.globalCompositeOperation='lighter';
  for(let i=spores.length-1;i>=0;i--){
    const s=spores[i];
    s.age+=dt;
    if(s.age>s.maxAge||s.y<-20){spores.splice(i,1);continue;}
    if(pFresh)s.vx+=(mx-s.x)*0.35*dt;
    s.vx*=Math.pow(0.55,dt);
    s.x+=(s.vx+Math.sin(t*s.swf+s.swp)*u*0.006)*dt;
    s.y+=s.vy*dt;
    s.rot+=s.vr*dt;
    const a=Math.min(1,s.age/0.8,(s.maxAge-s.age)/1.2);
    if(a<=0){spores.splice(i,1);continue;}
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);
    ctx.globalAlpha=a*0.9;
    ctx.strokeStyle=s.col;ctx.fillStyle=s.col;
    ctx.lineCap='round';ctx.lineWidth=Math.max(1,s.sz*0.4);
    switch(s.type){
      case 0:
        ctx.beginPath();ctx.arc(0,0,s.sz*0.5,0,7);ctx.fill();
        ctx.globalAlpha=a*0.3;
        ctx.beginPath();ctx.arc(0,0,s.sz*1.3,0,7);ctx.stroke();
        break;
      case 1:
        ctx.beginPath();ctx.arc(0,0,s.sz,0.3,Math.PI*1.15);ctx.stroke();
        ctx.beginPath();ctx.arc(Math.cos(Math.PI*1.15)*s.sz,Math.sin(Math.PI*1.15)*s.sz,s.sz*0.35,0,7);ctx.fill();
        break;
      case 2:
        for(let k=0;k<3;k++){
          ctx.beginPath();
          ctx.moveTo(Math.cos(k*1.047)*s.sz,Math.sin(k*1.047)*s.sz);
          ctx.lineTo(-Math.cos(k*1.047)*s.sz,-Math.sin(k*1.047)*s.sz);
          ctx.stroke();
        }
        break;
      default:
        ctx.beginPath();ctx.arc(0,0,s.sz*0.9,0,7);ctx.stroke();
        ctx.beginPath();ctx.arc(0,0,s.sz*0.28,0,7);ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

function drawMotes(t){
  ctx.fillStyle='rgba(200,220,255,0.6)';
  for(const m of motes){
    const y=((m.y-t*m.sp)%1+1)%1*H;
    const x=m.x*W+Math.sin(t*0.3+m.ph)*u*0.02;
    ctx.globalAlpha=0.05+0.05*Math.sin(t*0.7+m.ph);
    ctx.beginPath();ctx.arc(x,y,m.r*u,0,7);ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawVignette(){
  const g=ctx.createRadialGradient(W*0.5,H*0.48,u*0.25,W*0.5,H*0.5,Math.max(W,H)*0.75);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}

/* ---------- loop ---------- */
let last=performance.now()/1000;
function frame(nowMs){
  const now=nowMs/1000;
  const dt=Math.min(0.05,now-last);last=now;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);
  drawBackground(now);
  drawBook(now);
  drawShrooms(now,dt);
  updateDrops(now,dt);
  updateSpores(now,dt);
  drawMotes(now);
  drawVignette();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script>
</body>
</html>
```

```json
{
  "title": "Scribe's Inkwell",
  "statement": "Fruiting only from abandoned ledgers and forgotten diaries, this small cluster keeps its bowl-shaped caps brimmed with luminous teal ink. When the air is still, it releases drifting glyphs in place of spores; when watched closely, the caps lean toward the onlooker as if expecting to be read."
}
```