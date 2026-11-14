```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#0a1220}
  canvas{display:block;width:100vw;height:100vh;touch-action:pan-y}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c');
const ctx=cv.getContext('2d');
let W,H,S,OX,OY,DPR;
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  S=Math.max(W/400,H/600);
  OX=(W-400*S)/2;OY=(H-600*S)/2;
}
window.addEventListener('resize',resize);resize();

let px=0,py=0,tx=0,ty=0;
window.addEventListener('pointermove',e=>{
  tx=(e.clientX/W-0.5)*2;ty=(e.clientY/H-0.5)*2;
});
window.addEventListener('pointerleave',()=>{tx=0;ty=0});

// seeded random
let seed=7;
function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
const TAU=Math.PI*2;
function sstep(a,b,x){x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)}

// stars
const stars=[];for(let i=0;i<70;i++)stars.push({x:rnd()*400,y:rnd()*330,r:0.4+rnd()*1.1,p:rnd()*TAU,s:0.6+rnd()*2});
// skyline
const sky=[];{let x=0;while(x<410){const w=18+rnd()*34;const h=470+rnd()*45;sky.push({x:x,w:w,h:h,peak:rnd()>0.5,win:[rnd()>0.55,rnd()>0.7],ph:rnd()*TAU});x+=w}}
// letters
const letters=[];for(let i=0;i<12;i++)letters.push({ph:rnd(),sp:0.022+rnd()*0.018,off:i/12+rnd()*0.05,seal:rnd()>0.45,sc:0.8+rnd()*0.5});
// fog
const fog=[];for(let i=0;i<7;i++)fog.push({x:rnd()*400,y:520+rnd()*80,r:80+rnd()*80,s:0.004+rnd()*0.01,p:rnd()*TAU});
// particles
const motes=[];for(let i=0;i<40;i++)motes.push({u:rnd(),x:rnd()*400,sp:0.02+rnd()*0.05,p:rnd()*TAU,r:0.6+rnd()*1.4});
const drops=[];

function env(x,y,rot,sc,a,seal){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(sc,sc);ctx.globalAlpha=a;
  ctx.fillStyle='#e6d8b8';ctx.fillRect(-14,-9,28,18);
  ctx.strokeStyle='rgba(40,35,60,0.7)';ctx.lineWidth=0.8;ctx.strokeRect(-14,-9,28,18);
  ctx.beginPath();ctx.moveTo(-14,-9);ctx.lineTo(0,2);ctx.lineTo(14,-9);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-14,9);ctx.lineTo(-4,0);ctx.moveTo(14,9);ctx.lineTo(4,0);ctx.strokeStyle='rgba(40,35,60,0.35)';ctx.stroke();
  if(seal){ctx.fillStyle='#b3262f';ctx.beginPath();ctx.arc(0,2,2.8,0,TAU);ctx.fill();}
  ctx.restore();
}
function moth(x,y,rot,sc,a,t,ph){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(sc,sc);ctx.globalAlpha=a;
  const f=0.25+0.75*Math.abs(Math.sin(t*9+ph*20));
  for(let s=-1;s<=1;s+=2){
    ctx.beginPath();ctx.moveTo(0,0);
    ctx.quadraticCurveTo(s*18*f,-18,s*24*f,-4);
    ctx.quadraticCurveTo(s*16*f,12,0,5);
    ctx.fillStyle='rgba(232,220,190,0.9)';ctx.fill();
    ctx.strokeStyle='rgba(40,35,60,0.6)';ctx.lineWidth=0.7;ctx.stroke();
  }
  ctx.fillStyle='#2a2440';ctx.fillRect(-1,-4,2,11);
  ctx.restore();
}
function letterPos(L,t){
  const u=((t*L.sp+L.off)%1);
  const x=305-u*175+Math.sin(u*8+L.ph*6)*(16+u*36);
  const y=425-u*410+Math.cos(u*6+L.ph*5)*8;
  const a=Math.min(1,u*6)*Math.min(1,(1-u)*4);
  const m=sstep(0.38,0.62,u);
  const rot=Math.sin(u*7+L.ph*9)*0.7;
  return {u,x,y,a,m,rot};
}
function drawLetter(L,t){
  const p=letterPos(L,t);
  if(p.m<0.98)env(p.x,p.y,p.rot,L.sc,p.a*(1-p.m),L.seal);
  if(p.m>0.02)moth(p.x,p.y,p.rot*0.5,L.sc*0.9,p.a*p.m,t,L.ph);
}

function drawBG(t){
  let g=ctx.createLinearGradient(0,0,0,600);
  g.addColorStop(0,'#070c1a');g.addColorStop(0.5,'#14243b');g.addColorStop(0.85,'#22374a');g.addColorStop(1,'#101a26');
  ctx.fillStyle=g;ctx.fillRect(-50,-50,500,700);
  // stars
  for(const s of stars){
    const a=0.4+0.6*Math.abs(Math.sin(t*s.s*0.5+s.p));
    ctx.fillStyle='rgba(220,230,255,'+(a*0.8)+')';
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fill();
  }
  // moon
  const mx=282,my=140;
  let mg=ctx.createRadialGradient(mx,my,10,mx,my,170);
  mg.addColorStop(0,'rgba(190,210,255,0.45)');mg.addColorStop(1,'rgba(190,210,255,0)');
  ctx.fillStyle=mg;ctx.fillRect(mx-180,my-180,360,360);
  ctx.fillStyle='#e9eedf';ctx.beginPath();ctx.arc(mx,my,52,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(150,165,190,0.25)';
  [[-15,-10,12],[14,8,9],[-4,24,6],[20,-22,5]].forEach(c=>{ctx.beginPath();ctx.arc(mx+c[0],my+c[1],c[2],0,TAU);ctx.fill()});
  // skyline
  ctx.fillStyle='#0b1220';
  for(const b of sky){
    ctx.beginPath();ctx.moveTo(b.x,600);ctx.lineTo(b.x,b.h);
    if(b.peak){ctx.lineTo(b.x+b.w/2,b.h-16)}
    ctx.lineTo(b.x+b.w,b.h);ctx.lineTo(b.x+b.w,600);ctx.fill();
  }
  for(const b of sky){
    for(let k=0;k<2;k++)if(b.win[k]){
      const fl=0.6+0.4*Math.sin(t*1.3+b.ph+k*2);
      ctx.fillStyle='rgba(255,190,100,'+(0.55*fl)+')';
      ctx.fillRect(b.x+6+k*12,b.h+12+k*14,4,6);
    }
  }
  // ground
  g=ctx.createLinearGradient(0,540,0,600);g.addColorStop(0,'#0e1724');g.addColorStop(1,'#070b12');
  ctx.fillStyle=g;ctx.fillRect(-50,548,500,70);
  ctx.strokeStyle='rgba(120,150,190,0.12)';ctx.lineWidth=1;
  for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(-10,552+i*7);ctx.lineTo(410,552+i*7);ctx.stroke()}
  // moon reflection
  let rg=ctx.createLinearGradient(0,548,0,600);rg.addColorStop(0,'rgba(190,210,255,0.14)');rg.addColorStop(1,'rgba(190,210,255,0)');
  ctx.fillStyle=rg;ctx.beginPath();ctx.moveTo(250,548);ctx.lineTo(320,548);ctx.lineTo(350,600);ctx.lineTo(210,600);ctx.fill();
}

function drawBox(t){
  ctx.save();ctx.translate(322,588);ctx.rotate(-0.03);
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.ellipse(0,0,50,8,0,0,TAU);ctx.fill();
  // pile of dropped letters
  env(-48,-5,0.4,0.9,1,false);env(44,-4,-0.3,0.9,1,true);env(-30,-2,-0.15,0.8,0.9,false);
  let g=ctx.createLinearGradient(-38,0,38,0);
  g.addColorStop(0,'#2a0a12');g.addColorStop(0.35,'#7a2230');g.addColorStop(0.7,'#4a1220');g.addColorStop(1,'#220810');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-38,-6);ctx.lineTo(-38,-225);ctx.arc(0,-225,38,Math.PI,0);ctx.lineTo(38,-6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#1c0910';ctx.fillRect(-42,-14,84,14);
  ctx.fillStyle='rgba(20,5,10,0.6)';ctx.fillRect(-38,-150,76,5);
  ctx.fillStyle='rgba(255,170,150,0.18)';ctx.fillRect(-30,-215,3,200);
  // slot glow
  const fl=0.8+0.2*Math.sin(t*2.1)+0.05*Math.sin(t*7);
  let sg=ctx.createRadialGradient(0,-185,2,0,-185,60);
  sg.addColorStop(0,'rgba(255,190,100,'+(0.55*fl)+')');sg.addColorStop(1,'rgba(255,150,60,0)');
  ctx.fillStyle=sg;ctx.fillRect(-70,-250,140,130);
  ctx.fillStyle='#ffcf85';ctx.fillRect(-23,-189,46,7);
  ctx.fillStyle='#120508';ctx.fillRect(-23,-187,46,3);
  // letters peeking
  env(-6,-190,0.15,0.9,1,true);env(10,-186,-0.2,0.8,1,false);
  // plate
  ctx.strokeStyle='rgba(230,190,120,0.5)';ctx.lineWidth=1;ctx.strokeRect(-14,-120,28,18);
  ctx.beginPath();ctx.moveTo(-9,-114);ctx.lineTo(9,-114);ctx.moveTo(-9,-109);ctx.lineTo(5,-109);ctx.stroke();
  ctx.restore();
}

function wing(kind,side,flapv,t){
  ctx.save();
  ctx.translate(side*6,-24);ctx.scale(side,1);
  if(kind==0)ctx.rotate(-0.28+flapv*0.32);else ctx.rotate(0.12+flapv*0.2);
  ctx.beginPath();
  let pts;
  if(kind==0){
    ctx.moveTo(0,0);ctx.bezierCurveTo(30,-70,90,-120,128,-92);ctx.bezierCurveTo(138,-50,80,-12,0,0);
    pts=[[128,-92],[118,-70],[105,-50],[88,-32],[66,-16],[112,-100]];
  }else{
    ctx.moveTo(0,0);ctx.bezierCurveTo(40,6,88,34,70,86);ctx.bezierCurveTo(34,76,6,34,0,0);
    pts=[[70,86],[62,66],[50,48],[36,30],[24,14]];
  }
  let g=ctx.createLinearGradient(0,0,kind==0?120:50,kind==0?-80:70);
  g.addColorStop(0,'rgba(240,230,205,0.92)');g.addColorStop(1,'rgba(200,215,240,0.28)');
  ctx.fillStyle=g;ctx.fill();
  ctx.save();ctx.clip();
  ctx.strokeStyle='rgba(60,50,80,0.16)';ctx.lineWidth=0.7;
  for(let y=-120;y<100;y+=7){ctx.beginPath();ctx.moveTo(0,y);
    for(let x=10;x<=140;x+=10)ctx.lineTo(x,y+Math.sin(x*0.3+y)*1.4);ctx.stroke();}
  ctx.restore();
  ctx.strokeStyle='rgba(30,30,70,0.55)';ctx.lineWidth=0.8;
  for(const p of pts){ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(p[0]*0.5,p[1]*0.35,p[0],p[1]);ctx.stroke()}
  ctx.lineWidth=1.1;ctx.strokeStyle='rgba(25,25,60,0.7)';
  ctx.beginPath();
  if(kind==0){ctx.moveTo(0,0);ctx.bezierCurveTo(30,-70,90,-120,128,-92);ctx.bezierCurveTo(138,-50,80,-12,0,0);}
  else{ctx.moveTo(0,0);ctx.bezierCurveTo(40,6,88,34,70,86);ctx.bezierCurveTo(34,76,6,34,0,0);}
  ctx.stroke();
  ctx.restore();
}

function hair(hx,hy,t,front){
  const n=front?3:5;
  for(let k=0;k<n;k++){
    const kk=front?k+5:k;
    let px0=hx+(kk-3.5)*2.2,py0=hy-6;
    let lx=px0,ly=py0;
    const len=26+kk%3*6;
    for(let j=1;j<=len;j++){
      const sw=Math.sin(t*1.2-j*0.28+kk)*j*0.55;
      const x=px0+(kk-4)*0.9*j*0.25-j*(2.2+kk*0.15)+sw*0.6+(front?0:-2);
      const y=py0+j*(1.6+kk*0.1)+Math.sin(t*0.9-j*0.2+kk*1.7)*j*0.35+ (j>10?(j-10)*0.9:0);
      ctx.strokeStyle='rgba('+(front?'14,16,40':'10,12,32')+',1)';
      ctx.lineWidth=Math.max(0.6,3.2*(1-j/len)+0.5);
      ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(x,y);ctx.stroke();
      lx=x;ly=y;
    }
    // inked tip
    ctx.fillStyle='rgba(90,110,180,0.6)';ctx.beginPath();ctx.arc(lx,ly,1.2,0,TAU);ctx.fill();
  }
}

let lastDrop=0;
function drawFairy(t){
  px+=(tx-px)*0.04;py+=(ty-py)*0.04;
  const bob=Math.sin(t*1.1)*7;
  const fx=150+Math.sin(t*0.5)*6+px*6,fy=292+bob+py*4;
  // soft glow
  let g=ctx.createRadialGradient(fx,fy,5,fx,fy,130);
  g.addColorStop(0,'rgba(255,200,150,0.22)');g.addColorStop(1,'rgba(255,200,150,0)');
  ctx.fillStyle=g;ctx.fillRect(fx-140,fy-140,280,280);

  ctx.save();ctx.translate(fx,fy);ctx.rotate(0.05+px*0.04+Math.sin(t*0.8)*0.02);
  const flapv=Math.sin(t*2.2);
  // back wings
  wing(1,-1,flapv,t);wing(1,1,flapv,t);
  wing(0,-1,flapv,t);wing(0,1,flapv,t);

  const hx=px*2.5,hy=-41;
  hair(hx,hy,t,false);

  // legs
  ctx.strokeStyle='#c4c9dc';ctx.lineWidth=2.6;ctx.lineCap='round';
  for(let s=-1;s<=1;s+=2){
    ctx.beginPath();ctx.moveTo(s*3,40);ctx.quadraticCurveTo(s*5+Math.sin(t*1.5+s)*3,56,s*3+Math.sin(t*1.7+s)*5,74);ctx.stroke();
  }
  // dress layers
  for(let L=2;L>=0;L--){
    for(let j=0;j<5;j++){
      const cx=(j-2)*7.5*(1+L*0.32);
      const bottom=38+L*9+(j%2)*7;
      const sw=Math.sin(t*1.7+j*0.9+L)*3+ (j-2)*L*1.5;
      ctx.beginPath();
      ctx.moveTo(cx-6,4);ctx.lineTo(cx+6,4);
      ctx.lineTo(cx+7+sw,bottom-3);ctx.lineTo(cx+3+sw,bottom+1);ctx.lineTo(cx+sw,bottom-4);ctx.lineTo(cx-4+sw,bottom+2);ctx.lineTo(cx-7+sw,bottom-2);
      ctx.closePath();
      ctx.fillStyle=['#efe3c8','#d9c9a6','#bfae8b'][L];ctx.fill();
      ctx.strokeStyle='rgba(30,30,60,0.45)';ctx.lineWidth=0.6;ctx.stroke();
      ctx.strokeStyle='rgba(60,45,80,0.3)';
      for(let r=0;r<3;r++){ctx.beginPath();ctx.moveTo(cx-4+sw*(0.3*r),12+r*8);ctx.lineTo(cx+4+sw*(0.3*r),12+r*8+0.5);ctx.stroke()}
    }
  }
  // bodice
  ctx.beginPath();ctx.moveTo(-9,-26);ctx.quadraticCurveTo(0,-30,9,-26);ctx.lineTo(6,8);ctx.quadraticCurveTo(0,11,-6,8);ctx.closePath();
  g=ctx.createLinearGradient(-9,0,9,0);g.addColorStop(0,'#141a3a');g.addColorStop(1,'#2a3466');
  ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(230,190,120,0.5)';ctx.lineWidth=0.6;
  ctx.beginPath();ctx.moveTo(-6,-20);ctx.lineTo(5,2);ctx.moveTo(6,-20);ctx.lineTo(-5,2);ctx.stroke();
  // neck
  ctx.fillStyle='#cfd3e2';ctx.fillRect(-2.5,-32,5,8);
  // arms
  ctx.strokeStyle='#cfd3e2';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(-8,-24);ctx.quadraticCurveTo(-15,-8,-5,-6);ctx.stroke();
  ctx.beginPath();ctx.moveTo(8,-24);ctx.quadraticCurveTo(15,-8,5,-6);ctx.stroke();
  // letter held
  env(0,-9,0.08,1.0,1,true);
  // seal glow
  const pul=0.6+0.4*Math.sin(t*2.6);
  ctx.globalCompositeOperation='lighter';
  g=ctx.createRadialGradient(0,-7,1,0,-7,22);
  g.addColorStop(0,'rgba(255,90,70,'+(0.6*pul)+')');g.addColorStop(1,'rgba(255,90,70,0)');
  ctx.fillStyle=g;ctx.fillRect(-25,-30,50,50);
  ctx.globalCompositeOperation='source-over';
  // fingers
  ctx.fillStyle='#cfd3e2';ctx.beginPath();ctx.arc(-5,-6,2,0,TAU);ctx.arc(5,-6,2,0,TAU);ctx.fill();

  // head
  ctx.save();ctx.translate(hx,hy);ctx.rotate(px*0.14+Math.sin(t*0.7)*0.03);
  // quill
  ctx.save();ctx.translate(7,-8);ctx.rotate(0.5);
  ctx.strokeStyle='#d9ccb0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(4,-34);ctx.stroke();
  ctx.fillStyle='rgba(235,225,200,0.9)';ctx.beginPath();ctx.moveTo(1,0);ctx.quadraticCurveTo(14,-14,4,-34);ctx.quadraticCurveTo(-2,-16,1,0);ctx.fill();
  ctx.restore();
  ctx.fillStyle='#d6d9e8';ctx.beginPath();ctx.ellipse(0,0,9.5,12,0,0,TAU);ctx.fill();
  // cheek shade
  ctx.fillStyle='rgba(120,130,170,0.25)';ctx.beginPath();ctx.ellipse(-4,4,5,7,0,0,TAU);ctx.fill();
  // eyes
  const ex=px*2.2;
  ctx.strokeStyle='#161a3a';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(-3.8+ex,-0.5,2.4,0.15*Math.PI,0.85*Math.PI);ctx.stroke();
  ctx.beginPath();ctx.arc(3.8+ex,-0.5,2.4,0.15*Math.PI,0.85*Math.PI);ctx.stroke();
  // brows
  ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(-6.5+ex,-5);ctx.lineTo(-2+ex,-4.2);ctx.moveTo(6.5+ex,-5);ctx.lineTo(2+ex,-4.2);ctx.stroke();
  // lips
  ctx.fillStyle='#a8303a';ctx.beginPath();ctx.ellipse(ex*0.6,7,2,0.9,0,0,TAU);ctx.fill();
  // ink tear
  const tc=(t%5)/5;
  if(tc<0.8){
    const k=tc/0.8;
    ctx.fillStyle='rgba(18,22,60,'+(1-k*0.3)+')';
    ctx.beginPath();ctx.ellipse(4.6+ex*0.7+k*0.6,1.5+k*10,0.9,1.2+k*0.8,0,0,TAU);ctx.fill();
  }
  // hair cap
  ctx.fillStyle='#0d1030';
  ctx.beginPath();ctx.moveTo(-10,-1);ctx.bezierCurveTo(-12,-16,12,-18,10,-2);ctx.bezierCurveTo(6,-8,-3,-10,-10,-1);ctx.fill();
  ctx.restore();
  hair(hx,hy,t,true);
  ctx.restore();

  // ink drops from hem
  if(t-lastDrop>0.5){lastDrop=t;
    drops.push({x:fx+(Math.random()-0.5)*40,y:fy+60+Math.random()*20,vy:5,life:1,r:0.8+Math.random()*1.4});
  }
}

let prev=0;
function frame(ms){
  const t=ms/1000;const dt=Math.min(0.05,t-prev);prev=t;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle='#070c1a';ctx.fillRect(0,0,W,H);
  ctx.setTransform(DPR*S,0,0,DPR*S,DPR*OX,DPR*OY);

  drawBG(t);
  // back letters
  for(let i=0;i<letters.length;i+=2)drawLetter(letters[i],t);
  drawBox(t);
  drawFairy(t);
  for(let i=1;i<letters.length;i+=2)drawLetter(letters[i],t);

  // drops
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];d.vy+=60*dt;d.y+=d.vy*dt;d.life-=dt*0.5;
    if(d.life<=0||d.y>580){drops.splice(i,1);continue}
    ctx.fillStyle='rgba(120,140,215,'+(d.life*0.8)+')';
    ctx.beginPath();ctx.ellipse(d.x,d.y,d.r*0.8,d.r*1.5,0,0,TAU);ctx.fill();
  }
  // motes
  ctx.globalCompositeOperation='lighter';
  for(const m of motes){
    m.u=(m.u+m.sp*dt*0.6)%1;
    const y=600-m.u*620;const x=m.x+Math.sin(t*0.6+m.p)*14+Math.sin(m.u*5+m.p)*10;
    const a=Math.sin(m.u*Math.PI)*(0.5+0.5*Math.sin(t*2+m.p));
    ctx.fillStyle='rgba(255,205,130,'+(a*0.8)+')';
    ctx.beginPath();ctx.arc(x,y,m.r,0,TAU);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
  // fog
  for(const f of fog){
    const x=((f.x+t*f.s*600)%520)-60;
    const g=ctx.createRadialGradient(x,f.y,0,x,f.y,f.r);
    g.addColorStop(0,'rgba(150,175,205,0.13)');g.addColorStop(1,'rgba(150,175,205,0)');
    ctx.fillStyle=g;ctx.fillRect(x-f.r,f.y-f.r,f.r*2,f.r*2);
  }
  // vignette
  const vg=ctx.createRadialGradient(200,300,150,200,300,430);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(2,4,10,0.6)');
  ctx.fillStyle=vg;ctx.fillRect(-60,-60,520,720);

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
  "title": "The Fairy of Unsent Letters",
  "statement": "What was never said still flies; it finds you at night."
}
```