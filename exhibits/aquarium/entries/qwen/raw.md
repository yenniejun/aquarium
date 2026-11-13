<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Plinking Ponderfin</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#060b1a}
canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
<canvas id="t"></canvas>
<script>
(function(){
const cv=document.getElementById('t'),cx=cv.getContext('2d');
let W,H,dpr;
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;
  cx.setTransform(dpr,0,0,dpr,0,0);
}
resize();window.addEventListener('resize',resize);

// Fish state
const fish={
  x:0.5,y:0.5,tx:0.5,ty:0.45,
  vx:0,vy:0,angle:0,
  pause:0,pauseTimer:0,
  plinkTimer:2.5,
  glowPhase:0,
  finPhase:0,
  size:1
};
fish.x=W*0.5;fish.y=H*0.45;fish.tx=W*0.5;fish.ty=H*0.45;

let ripples=[];
let particles=[];
let time=0;

// Init particles
for(let i=0;i<25;i++){
  particles.push({
    x:Math.random(),y:Math.random(),
    s:Math.random()*1.5+0.5,
    sp:Math.random()*0.02+0.005,
    drift:Math.random()*Math.PI*2
  });
}

// Kelp strands
const kelps=[];
for(let i=0;i<4;i++){
  kelps.push({
    x:0.12+i*0.25+Math.random()*0.08,
    h:0.25+Math.random()*0.2,
    w:8+Math.random()*6,
    phase:Math.random()*Math.PI*2,
    speed:0.4+Math.random()*0.3,
    segs:6+Math.floor(Math.random()*3)
  });
}

// Stones
const stones=[
  {x:0.2,y:0.92,rx:0.06,ry:0.025,c:'#2a3a4a'},
  {x:0.75,y:0.94,rx:0.045,ry:0.02,c:'#1e3040'},
  {x:0.55,y:0.95,rx:0.03,ry:0.015,c:'#253545'}
];

function pickTarget(){
  fish.tx=W*(0.15+Math.random()*0.7);
  fish.ty=H*(0.15+Math.random()*0.6);
  if(Math.random()<0.3){
    fish.pause=1.5+Math.random()*2.5;
    fish.pauseTimer=fish.pause;
  }
}

function update(dt){
  time+=dt;
  fish.glowPhase+=dt*1.2;
  fish.finPhase+=dt*4;

  // Movement
  if(fish.pauseTimer>0){
    fish.pauseTimer-=dt;
  }else{
    let dx=fish.tx-fish.x,dy=fish.ty-fish.y;
    let dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<20){
      pickTarget();
    }else{
      let speed=Math.min(dist*0.8,45);
      fish.vx+=(dx/dist*speed-fish.vx)*dt*1.5;
      fish.vy+=(dy/dist*speed-fish.vy)*dt*1.5;
    }
  }
  fish.x+=fish.vx*dt;
  fish.y+=fish.vy*dt;

  // Angle
  let spd=Math.sqrt(fish.vx*fish.vx+fish.vy*fish.vy);
  if(spd>2){
    let targetAngle=Math.atan2(fish.vy,fish.vx);
    let da=targetAngle-fish.angle;
    while(da>Math.PI)da-=Math.PI*2;
    while(da<-Math.PI)da+=Math.PI*2;
    fish.angle+=da*dt*3;
  }

  // Plink
  fish.plinkTimer-=dt;
  if(fish.plinkTimer<=0){
    fish.plinkTimer=2.5+Math.random()*3;
    ripples.push({x:fish.x,y:fish.y,r:0,maxR:30+Math.random()*25,alpha:0.8});
  }

  // Update ripples
  for(let i=ripples.length-1;i>=0;i--){
    ripples[i].r+=dt*35;
    ripples[i].alpha-=dt*0.6;
    if(ripples[i].alpha<=0)ripples.splice(i,1);
  }

  // Particles
  for(let p of particles){
    p.y-=p.sp*dt;
    p.x+=Math.sin(time*0.5+p.drift)*0.0003;
    if(p.y<-0.02){p.y=1.02;p.x=Math.random();}
  }

  fish.size=Math.min(W,H)*0.045;
}

function drawBackground(){
  let g=cx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0d1b3a');
  g.addColorStop(0.4,'#0a1230');
  g.addColorStop(1,'#060b1e');
  cx.fillStyle=g;
  cx.fillRect(0,0,W,H);

  // Subtle caustics at top
  cx.save();
  cx.globalAlpha=0.03;
  for(let i=0;i<5;i++){
    let cxp=W*(0.1+i*0.2)+Math.sin(time*0.3+i*1.7)*W*0.05;
    let cyp=H*0.05+Math.sin(time*0.4+i*2.1)*H*0.03;
    let r=W*0.08+Math.sin(time*0.5+i)*W*0.02;
    let cg=cx.createRadialGradient(cxp,cyp,0,cxp,cyp,r);
    cg.addColorStop(0,'rgba(140,180,255,1)');
    cg.addColorStop(1,'rgba(140,180,255,0)');
    cx.fillStyle=cg;
    cx.beginPath();
    cx.ellipse(cxp,cyp,r,r*0.6,0,0,Math.PI*2);
    cx.fill();
  }
  cx.restore();
}

function drawSubstrate(){
  // Sandy bottom
  let g=cx.createLinearGradient(0,H*0.85,0,H);
  g.addColorStop(0,'rgba(20,30,45,0)');
  g.addColorStop(1,'#141e2d');
  cx.fillStyle=g;
  cx.fillRect(0,H*0.85,W,H*0.15);

  // Stones
  for(let s of stones){
    cx.beginPath();
    cx.ellipse(s.x*W,s.y*H,s.rx*W,s.ry*H,0,0,Math.PI*2);
    cx.fillStyle=s.c;
    cx.fill();
    // highlight
    cx.beginPath();
    cx.ellipse(s.x*W-s.rx*W*0.2,s.y*H-s.ry*H*0.3,s.rx*W*0.6,s.ry*H*0.5,0,0,Math.PI*2);
    cx.fillStyle='rgba(80,110,130,0.15)';
    cx.fill();
  }
}

function drawKelp(){
  for(let k of kelps){
    let bx=k.x*W;
    let by=H*0.95;
    let segH=k.h*H/k.segs;
    
    cx.beginPath();
    cx.moveTo(bx,by);
    let px=bx,py=by;
    for(let i=1;i<=k.segs;i++){
      let sway=Math.sin(time*k.speed+k.phase+i*0.6)*(8+i*3)*(W/800);
      let nx=bx+sway;
      let ny=by-segH*i;
      let cpx=(px+nx)/2+sway*0.5;
      let cpy=(py+ny)/2;
      cx.quadraticCurveTo(cpx,cpy,nx,ny);
      px=nx;py=ny;
    }
    cx.strokeStyle='rgba(30,80,60,0.6)';
    cx.lineWidth=k.w*(W/800);
    cx.lineCap='round';
    cx.stroke();
    
    // Inner lighter strand
    cx.beginPath();
    cx.moveTo(bx,by);
    px=bx;py=by;
    for(let i=1;i<=k.segs;i++){
      let sway=Math.sin(time*k.speed+k.phase+i*0.6)*(8+i*3)*(W/800);
      let nx=bx+sway;
      let ny=by-segH*i;
      let cpx=(px+nx)/2+sway*0.5;
      let cpy=(py+ny)/2;
      cx.quadraticCurveTo(cpx,cpy,nx,ny);
      px=nx;py=ny;
    }
    cx.strokeStyle='rgba(50,120,80,0.3)';
    cx.lineWidth=k.w*0.4*(W/800);
    cx.stroke();
  }
}

function drawParticles(){
  cx.save();
  for(let p of particles){
    let a=0.15+Math.sin(time*0.8+p.drift)*0.1;
    cx.globalAlpha=Math.max(0,a);
    cx.fillStyle='#aaccdd';
    cx.beginPath();
    cx.arc(p.x*W,p.y*H,p.s,0,Math.PI*2);
    cx.fill();
  }
  cx.restore();
}

function drawFish(){
  let s=fish.size;
  let glow=0.5+Math.sin(fish.glowPhase)*0.25;
  
  cx.save();
  cx.translate(fish.x,fish.y);
  cx.rotate(fish.angle);

  // Outer glow
  let og=cx.createRadialGradient(0,0,s*0.3,0,0,s*2.5);
  og.addColorStop(0,'rgba(255,200,100,'+(0.12*glow)+')');
  og.addColorStop(1,'rgba(255,200,100,0)');
  cx.fillStyle=og;
  cx.beginPath();
  cx.arc(0,0,s*2.5,0,Math.PI*2);
  cx.fill();

  // Tail fin
  let tailWag=Math.sin(fish.finPhase*1.2)*0.3;
  cx.save();
  cx.translate(-s*0.8,0);
  cx.rotate(tailWag);
  cx.beginPath();
  cx.moveTo(0,0);
  cx.quadraticCurveTo(-s*0.7,-s*0.5,-s*0.9,-s*0.3);
  cx.quadraticCurveTo(-s*0.5,0,-s*0.9,s*0.3);
  cx.quadraticCurveTo(-s*0.7,s*0.5,0,0);
  cx.fillStyle='rgba(255,180,80,0.6)';
  cx.fill();
  cx.restore();

  // Pectoral fins
  let finWave=Math.sin(fish.finPhase)*0.4;
  cx.save();
  cx.translate(s*0.1,s*0.5);
  cx.rotate(0.5+finWave);
  cx.beginPath();
  cx.ellipse(0,s*0.3,s*0.15,s*0.4,0,0,Math.PI*2);
  cx.fillStyle='rgba(255,190,90,0.5)';
  cx.fill();
  cx.restore();

  cx.save();
  cx.translate(s*0.1,-s*0.5);
  cx.rotate(-0.5-finWave);
  cx.beginPath();
  cx.ellipse(0,-s*0.3,s*0.15,s*0.4,0,0,Math.PI*2);
  cx.fillStyle='rgba(255,190,90,0.5)';
  cx.fill();
  cx.restore();

  // Body
  let bg=cx.createRadialGradient(s*0.1,-s*0.1,0,0,0,s);
  bg.addColorStop(0,'rgba(255,220,140,'+(0.9*glow+0.1)+')');
  bg.addColorStop(0.6,'rgba(255,180,80,0.85)');
  bg.addColorStop(1,'rgba(200,120,50,0.7)');
  cx.beginPath();
  cx.ellipse(0,0,s,s*0.75,0,0,Math.PI*2);
  cx.fillStyle=bg;
  cx.fill();

  // Dorsal ridge
  cx.beginPath();
  cx.moveTo(-s*0.3,-s*0.6);
  cx.quadraticCurveTo(0,-s*1.0,s*0.3,-s*0.6);
  cx.fillStyle='rgba(255,200,100,0.4)';
  cx.fill();

  // Eye
  let ex=s*0.35,ey=-s*0.1;
  cx.beginPath();
  cx.arc(ex,ey,s*0.22,0,Math.PI*2);
  cx.fillStyle='#1a1a2a';
  cx.fill();
  // Eye highlight
  cx.beginPath();
  cx.arc(ex+s*0.06,ey-s*0.06,s*0.08,0,Math.PI*2);
  cx.fillStyle='rgba(255,255,255,0.8)';
  cx.fill();
  // Eye glow
  cx.beginPath();
  cx.arc(ex,ey,s*0.25,0,Math.PI*2);
  cx.strokeStyle='rgba(255,220,150,0.3)';
  cx.lineWidth=1.5;
  cx.stroke();

  // Mouth - tiny, contemplative
  cx.beginPath();
  cx.arc(s*0.7,s*0.15,s*0.12,0.2,Math.PI-0.2);
  cx.strokeStyle='rgba(180,100,50,0.6)';
  cx.lineWidth=1.5;
  cx.stroke();

  cx.restore();
}

function drawRipples(){
  for(let r of ripples){
    cx.beginPath();
    cx.arc(r.x,r.y,r.r,0,Math.PI*2);
    cx.strokeStyle='rgba(255,220,140,'+Math.max(0,r.alpha*0.5)+')';
    cx.lineWidth=1.5;
    cx.stroke();
    // Inner ring
    if(r.r>5){
      cx.beginPath();
      cx.arc(r.x,r.y,r.r*0.6,0,Math.PI*2);
      cx.strokeStyle='rgba(255,240,180,'+Math.max(0,r.alpha*0.3)+')';
      cx.lineWidth=1;
      cx.stroke();
    }
  }
}

function drawVignette(){
  let vg=cx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.75);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,'rgba(0,5,15,0.4)');
  cx.fillStyle=vg;
  cx.fillRect(0,0,W,H);
}

let last=performance.now();
function frame(now){
  let dt=Math.min((now-last)/1000,0.05);
  last=now;
  update(dt);
  
  cx.clearRect(0,0,W,H);
  drawBackground();
  drawSubstrate();
  drawKelp();
  drawParticles();
  drawRipples();
  drawFish();
  drawVignette();
  
  requestAnimationFrame(frame);
}
pickTarget();
requestAnimationFrame(frame);
})();
</script>
</body>
</html>

```json
{
  "title": "Plinking Ponderfin",
  "statement": "A small, round, amber-glowing fish that drifts thoughtfully through deep indigo water, pausing to ponder and occasionally emitting a soft expanding ring of light — a quiet 'plink' — as if a small idea has just occurred to it."
}
```