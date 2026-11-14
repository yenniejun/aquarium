```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;overflow:hidden;background:#0b0907}
canvas{display:block;position:fixed;left:0;top:0}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c');
const ctx=cv.getContext('2d');
let W=1,H=1,D=1,S=1,OX=0,OY=0;

function resize(){
  D=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.floor(W*D);cv.height=Math.floor(H*D);
  cv.style.width=W+'px';cv.style.height=H+'px';
  S=Math.max(W/300,H/450);
  OX=(W-300*S)/2;OY=(H-450*S)/2;
}
window.addEventListener('resize',resize);
resize();

function rng(seed){
  let s=seed;
  return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};
}

const R=rng(9137);
const spots=[];
for(let i=0;i<70;i++){
  spots.push({x:R()*60-30,y:R()*150-40,r:1+R()*4,a:0.15+R()*0.35});
}
const chainLinks=[];
for(let i=0;i<26;i++){
  const u=i/25;
  chainLinks.push({u});
}
const motes=[];
let spawnAcc=0;

function spawn(kind){
  const r=Math.random;
  if(kind===0){
    motes.push({x:r()*300,y:-10,vx:(r()-0.5)*0.15,vy:0.25+r()*0.35,life:0,max:9+r()*6,sz:0.6+r()*1.2,hue:r()});
  }else if(kind===1){
    const side=r()<0.5?-1:1;
    motes.push({x:120+side*(40+r()*55),y:150+r()*45,vx:side*(0.1+r()*0.2),vy:0.2+r()*0.3,life:0,max:5+r()*4,sz:0.5+r()*1.1,hue:r()});
  }else{
    motes.push({x:206+r()*22,y:250+r()*120,vx:(r()-0.5)*0.2,vy:-0.08-r()*0.12,life:0,max:7+r()*5,sz:0.5+r()*1.0,hue:r()});
  }
}

function col(h){
  if(h<0.35)return '#d0792f';
  if(h<0.7)return '#b24d1c';
  return '#e9a863';
}

function wingPath(){
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(30,-72,92,-86,112,-42);
  ctx.bezierCurveTo(120,-22,104,-10,96,0);
  ctx.bezierCurveTo(106,12,92,32,72,42);
  ctx.bezierCurveTo(56,48,42,32,32,22);
  ctx.bezierCurveTo(22,32,9,22,0,0);
  ctx.closePath();
}

function drawWing(side,flap,alpha,t,back){
  ctx.save();
  ctx.translate(120,172);
  const sx=side*(0.18+0.82*flap);
  ctx.scale(sx,back?0.92:1);
  if(back){ctx.rotate(0.18);}
  const g=ctx.createRadialGradient(40,-10,4,50,-10,90);
  g.addColorStop(0,'rgba(245,214,170,'+(0.42*alpha)+')');
  g.addColorStop(0.7,'rgba(200,120,70,'+(0.22*alpha)+')');
  g.addColorStop(1,'rgba(90,40,20,'+(0.05*alpha)+')');
  wingPath();
  ctx.fillStyle=g;
  ctx.fill();
  ctx.strokeStyle='rgba(190,90,40,'+(0.7*alpha)+')';
  ctx.lineWidth=0.9;
  ctx.stroke();
  ctx.strokeStyle='rgba(170,80,35,'+(0.45*alpha)+')';
  ctx.lineWidth=0.5;
  const veins=[[0,0,70,-58],[0,0,92,-30],[0,0,84,20],[0,0,50,30],[0,0,22,6]];
  for(const v of veins){
    ctx.beginPath();ctx.moveTo(v[0],v[1]);
    ctx.quadraticCurveTo(v[2]*0.5,v[3]*0.9,v[2],v[3]);ctx.stroke();
  }
  ctx.fillStyle='rgba(20,8,4,'+(0.55*alpha)+')';
  for(let i=0;i<9;i++){
    const a=i/9;
    const px=20+a*70, py=-30+Math.sin(a*6.2)*16+a*10;
    ctx.beginPath();ctx.arc(px,py,1.6+0.6*Math.sin(i*2.1),0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawAnchor(t){
  ctx.save();
  ctx.translate(215,0);
  const grd=ctx.createLinearGradient(0,240,0,400);
  grd.addColorStop(0,'#6a3a22');
  grd.addColorStop(1,'#3a1f14');
  ctx.strokeStyle=grd;
  ctx.fillStyle=grd;
  ctx.lineWidth=7;
  ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,262);ctx.lineTo(0,372);ctx.stroke();
  ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(-22,276);ctx.lineTo(22,276);ctx.stroke();
  ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(0,252,9,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0,372);
  ctx.bezierCurveTo(-6,380,-30,384,-38,366);
  ctx.bezierCurveTo(-30,372,-18,368,-10,362);
  ctx.lineTo(-7,364);
  ctx.bezierCurveTo(-16,376,-10,392,0,388);
  ctx.bezierCurveTo(10,392,16,376,7,364);
  ctx.lineTo(10,362);
  ctx.bezierCurveTo(18,368,30,372,38,366);
  ctx.bezierCurveTo(30,384,6,380,0,372);
  ctx.fill();
  ctx.fillStyle='rgba(200,95,35,0.5)';
  for(const s of spots){
    ctx.globalAlpha=s.a;
    ctx.beginPath();ctx.arc(s.x*0.35,s.y*0.7+240,s.r*0.7,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.restore();

  ctx.save();
  ctx.strokeStyle='#4a2a1a';
  ctx.lineWidth=2.2;
  const sway=Math.sin(t*0.3)*1.5;
  let px=215, py=252;
  for(let i=1;i<=26;i++){
    const u=i/26;
    const nx=215+sway*u*0.5+ (u*u)*0;
    const ny=252+ u*148;
    const sag=Math.sin(u*Math.PI)*10*(1-u*0.4);
    const cx=nx-sag*0.6;
    ctx.beginPath();
    ctx.ellipse(cx,ny,2.6,4.2,(i%2)?0.3:-0.3,0,Math.PI*2);
    ctx.globalAlpha=0.85;
    ctx.stroke();
    px=nx;py=ny;
  }
  ctx.restore();
}

function drawWater(t){
  const g=ctx.createLinearGradient(0,330,0,450);
  g.addColorStop(0,'#15191b');
  g.addColorStop(1,'#080a0b');
  ctx.fillStyle=g;
  ctx.fillRect(0,330,300,120);
  ctx.strokeStyle='rgba(120,160,160,0.08)';
  ctx.lineWidth=0.6;
  for(let i=0;i<6;i++){
    const y=340+i*8;
    ctx.beginPath();
    ctx.moveTo(0,y);
    for(let x=0;x<=300;x+=10){
      ctx.lineTo(x,y+Math.sin(x*0.05+t*0.8+i)*0.8);
    }
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(215,0);
  ctx.globalAlpha=0.18+0.05*Math.sin(t*1.3);
  ctx.fillStyle='#c26a2c';
  ctx.beginPath();ctx.ellipse(0,372,46,7,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawFairy(t){
  const bob=Math.sin(t*1.1)*4;
  ctx.save();
  ctx.translate(0,bob);

  const flapA=0.5+0.5*Math.sin(t*2.4);
  drawWing(-1,0.2+0.8*(0.5+0.5*Math.sin(t*2.4+0.6)),0.7,t,true);
  drawWing(1,0.2+0.8*(0.5+0.5*Math.sin(t*2.4+0.6)),0.7,t,true);
  drawWing(-1,0.25+0.75*flapA,1,t,false);
  drawWing(1,0.25+0.75*flapA,1,t,false);

  ctx.save();
  ctx.translate(120,164);
  const gown=ctx.createLinearGradient(0,0,0,62);
  gown.addColorStop(0,'#a89a86');
  gown.addColorStop(0.6,'#7d6c5c');
  gown.addColorStop(1,'#3c2a20');
  ctx.fillStyle=gown;
  ctx.beginPath();
  ctx.moveTo(-8,0);
  ctx.quadraticCurveTo(-12,20,-14,34);
  const hem=[-14,-9,-4,2,8,13,18];
  for(let i=0;i<hem.length;i++){
    const x=hem[i];
    const y=56+((i%2)?-6:0)+Math.sin(t*1.7+i)*2;
    ctx.lineTo(x+Math.sin(t*0.9+i)*1.5,y);
  }
  ctx.quadraticCurveTo(14,30,9,0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle='rgba(190,90,40,0.55)';
  ctx.lineWidth=0.8;
  ctx.stroke();
  ctx.strokeStyle='rgba(60,30,18,0.5)';
  ctx.beginPath();
  ctx.moveTo(-6,6);ctx.quadraticCurveTo(0,14,6,6);ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(124,176);
  ctx.strokeStyle='#8c7a68';
  ctx.lineWidth=3.2;
  ctx.lineCap='round';
  const hx=162+Math.sin(t*0.7)*4;
  const hy=198+Math.cos(t*0.55)*3;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(24,-6,hx-124,hy-176);
  ctx.stroke();
  ctx.fillStyle='#b8a890';
  ctx.beginPath();ctx.arc(hx-124,hy-176,2.6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#b8a890';
  ctx.lineWidth=1;
  for(let f=-1;f<=1;f++){
    ctx.beginPath();
    ctx.moveTo(hx-124,hy-176);
    ctx.lineTo(hx-124+5,hy-176+f*2.2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(116,176);
  ctx.strokeStyle='#8c7a68';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(-18,12,-22,30);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(120,150);
  ctx.rotate(-0.22+0.16*Math.sin(t*0.45));
  ctx.strokeStyle='rgba(205,130,70,0.55)';
  ctx.lineWidth=0.7;
  for(let i=0;i<7;i++){
    const a=-0.5+i*0.3+Math.sin(t*0.9+i)*0.12;
    const L=18+i*1.6;
    ctx.beginPath();
    ctx.moveTo(-3,-4);
    ctx.quadraticCurveTo(-3-L*0.6,-6+Math.sin(a)*6,-3-L,4+Math.sin(t*1.2+i)*4);
    ctx.stroke();
  }
  const skin=ctx.createRadialGradient(-2,-3,1,0,0,12);
  skin.addColorStop(0,'#e8dccb');
  skin.addColorStop(1,'#9a8a78');
  ctx.fillStyle=skin;
  ctx.beginPath();
  ctx.ellipse(0,0,7.5,9.5,0.1,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle='#2a1610';
  ctx.beginPath();ctx.ellipse(-3,-1,1.4,0.9,-0.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(3,-1,1.4,0.9,0.2,0,Math.PI*2);ctx.fill();
  const eg=0.6+0.4*Math.sin(t*2.1);
  ctx.fillStyle='rgba(255,170,80,'+eg+')';
  ctx.beginPath();ctx.arc(-3,-1,0.6,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(3,-1,0.6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#5a3424';
  ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(1,4);ctx.quadraticCurveTo(3,5,4,4);ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawGlow(t){
  const g=ctx.createRadialGradient(120,190,10,120,190,150);
  g.addColorStop(0,'rgba(255,150,70,'+(0.22+0.04*Math.sin(t*0.9))+')');
  g.addColorStop(1,'rgba(255,150,70,0)');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,300,450);
  const g2=ctx.createRadialGradient(215,300,4,215,300,80);
  g2.addColorStop(0,'rgba(200,100,40,'+(0.18+0.05*Math.sin(t*1.4+1))+')');
  g2.addColorStop(1,'rgba(200,100,40,0)');
  ctx.fillStyle=g2;
  ctx.fillRect(0,200,300,250);
}

let last=performance.now(),T=0;
function frame(now){
  let dt=(now-last)/1000;
  last=now;
  if(dt>0.05)dt=0.05;
  T+=dt;
  const t=T;

  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#0b0907';
  ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(D*S,0,0,D*S,D*OX,D*OY);

  const bg=ctx.createLinearGradient(0,0,0,450);
  bg.addColorStop(0,'#14100d');
  bg.addColorStop(0.45,'#2b1b12');
  bg.addColorStop(0.7,'#1c1410');
  bg.addColorStop(1,'#0a0c0d');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,300,450);

  for(let i=0;i<4;i++){
    const y=60+i*55;
    ctx.fillStyle='rgba(120,70,40,'+(0.04+0.02*Math.sin(t*0.3+i))+')';
    ctx.beginPath();
    ctx.ellipse(150+Math.sin(t*0.2+i)*20,y,190,14,0,0,Math.PI*2);
    ctx.fill();
  }

  drawGlow(t);
  drawWater(t);
  drawAnchor(t);
  drawFairy(t);

  spawnAcc+=dt;
  while(spawnAcc>0.12){
    spawnAcc-=0.12;
    const k=Math.random();
    spawn(k<0.5?0:(k<0.8?1:2));
  }
  for(let i=motes.length-1;i>=0;i--){
    const m=motes[i];
    m.life+=dt;
    m.x+=(m.vx+Math.sin(t*0.8+m.hue*10)*0.08)*60*dt;
    m.y+=m.vy*60*dt;
    if(m.life>m.max||m.y>460||m.y<-20){motes.splice(i,1);continue;}
    const k=m.life/m.max;
    const a=Math.sin(Math.PI*Math.min(1,k))*0.9;
    ctx.globalAlpha=a;
    ctx.fillStyle=col(m.hue);
    ctx.beginPath();
    ctx.arc(m.x,m.y,m.sz,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=a*0.25;
    ctx.beginPath();
    ctx.arc(m.x,m.y,m.sz*2.6,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha=1;

  const vg=ctx.createRadialGradient(150,225,120,150,225,330);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle=vg;
  ctx.fillRect(0,0,300,450);

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
  "title": "The Fairy of Rust",
  "statement": "Patience turns iron to dust. What you guard quietly unmakes itself while you watch."
}
```