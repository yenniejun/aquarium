```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>fAIries card</title>
<style>
  html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#0a0709;}
  canvas{display:block;width:100vw;height:100vh;}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const c=document.getElementById('c');
const ctx=c.getContext('2d');
let W,H,dpr,s,ox,oy;
function resize(){
  W=innerWidth;H=innerHeight;
  dpr=Math.min(window.devicePixelRatio||1,2);
  c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);
  s=Math.max(W/400,H/600);
  ox=(W-400*s)/2;oy=(H-600*s)/2;
}
addEventListener('resize',resize);resize();

// wing shapes
const fore=new Path2D();
fore.moveTo(0,0);
fore.bezierCurveTo(25,-55,85,-100,125,-96);
fore.bezierCurveTo(132,-70,118,-25,72,8);
fore.bezierCurveTo(45,16,15,10,0,6);
fore.closePath();
const hind=new Path2D();
hind.moveTo(0,4);
hind.bezierCurveTo(45,0,92,22,90,58);
hind.bezierCurveTo(86,92,42,100,16,74);
hind.bezierCurveTo(4,54,-2,30,0,4);
hind.closePath();

const dust=[];
const strands=[];
for(let i=0;i<14;i++)strands.push({a:Math.random()*6.28,l:28+Math.random()*26,o:(i/13-0.5)*10});

function eyespot(x,y,r,t,glow){
  const rs=[[1,'#1a1216'],[0.78,'#a86a34'],[0.55,'#24161a'],[0.22,'rgba(240,225,200,'+(0.7+glow*0.3)+')']];
  for(const [k,col] of rs){ctx.beginPath();ctx.arc(x,y,r*k,0,6.283);ctx.fillStyle=col;ctx.fill();}
}

function drawWing(side,open,lit,t,silhouette){
  ctx.save();
  ctx.rotate(side*(-0.08+Math.sin(t*0.9)*0.04));
  ctx.scale(side*open*0.82,0.82);
  if(silhouette){
    ctx.fill(hind);ctx.fill(fore);ctx.restore();return;
  }
  // hind wing
  let g=ctx.createLinearGradient(0,0,90,90);
  g.addColorStop(0,'#3e3036');g.addColorStop(1,'#8a7672');
  ctx.fillStyle=g;ctx.fill(hind);
  ctx.save();ctx.clip(hind);
  ctx.strokeStyle='rgba(230,210,190,0.18)';ctx.lineWidth=1.2;
  for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(0,4,60+i*9,-0.2,1.7);ctx.stroke();}
  eyespot(52,50,17,t,lit);
  ctx.restore();
  ctx.strokeStyle='rgba(225,205,185,0.35)';ctx.lineWidth=1;ctx.stroke(hind);
  // fore wing
  g=ctx.createLinearGradient(0,0,125,-96);
  g.addColorStop(0,'#4a3c40');g.addColorStop(0.6,'#8e7c78');g.addColorStop(1,'#c4b2a6');
  ctx.fillStyle=g;ctx.fill(fore);
  ctx.save();ctx.clip(fore);
  ctx.strokeStyle='rgba(30,20,22,0.35)';ctx.lineWidth=0.9;
  for(let i=0;i<7;i++){const a=-1.45+i*0.17;ctx.beginPath();ctx.moveTo(0,4);ctx.quadraticCurveTo(Math.cos(a)*60,Math.sin(a)*60+8,Math.cos(a)*150,Math.sin(a)*150);ctx.stroke();}
  ctx.strokeStyle='rgba(40,26,28,0.55)';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(30,-60);
  for(let i=0;i<6;i++)ctx.lineTo(40+i*12,(i%2?-28:-44)-i*2);
  ctx.stroke();
  ctx.strokeStyle='rgba(240,225,205,0.3)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(60,-95);ctx.quadraticCurveTo(100,-60,118,-20);ctx.stroke();
  eyespot(86,-58,8,t,lit);
  ctx.restore();
  ctx.strokeStyle='rgba(235,215,195,0.4)';ctx.lineWidth=1;ctx.stroke(fore);
  // candle-light on the near side
  ctx.fillStyle='rgba(255,150,70,'+(0.04+0.2*lit)+')';
  ctx.fill(hind);ctx.fill(fore);
  ctx.restore();
}

function feather(x0,y0,cx,cy,x1,y1,t,col){
  ctx.strokeStyle=col;ctx.lineWidth=0.9;
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(cx,cy,x1,y1);ctx.stroke();
  ctx.lineWidth=0.5;
  for(let i=2;i<=12;i++){
    const u=i/12,iu=1-u;
    const x=iu*iu*x0+2*iu*u*cx+u*u*x1,y=iu*iu*y0+2*iu*u*cy+u*u*y1;
    const dx=2*iu*(cx-x0)+2*u*(x1-cx),dy=2*iu*(cy-y0)+2*u*(y1-cy);
    const L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,len=3.2*Math.sin(u*Math.PI)+0.6;
    ctx.beginPath();ctx.moveTo(x-nx*len,y-ny*len);ctx.lineTo(x+nx*len,y+ny*len);ctx.stroke();
  }
}

function frame(now){
  const t=now/1000;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,c.width,c.height);
  ctx.setTransform(dpr*s,0,0,dpr*s,dpr*ox,dpr*oy);

  const f=1+0.06*Math.sin(t*13)+0.04*Math.sin(t*7.3+1)+0.03*Math.sin(t*23.1);
  const sway=Math.sin(t*2.1)*2.5+Math.sin(t*6.7)*1.2;
  const by=342, fh=40*f, F={x:285+sway*0.4,y:by-fh*0.45};

  // background wall
  let g=ctx.createRadialGradient(F.x,F.y,5,F.x,F.y,520);
  g.addColorStop(0,'#5a3220');g.addColorStop(0.18,'#38201c');g.addColorStop(0.5,'#1a1018');g.addColorStop(1,'#08060a');
  ctx.fillStyle=g;ctx.fillRect(-600,-600,1600,1800);

  // fairy position
  const P={x:138+Math.sin(t*0.7)*8,y:288+Math.sin(t*1.1)*10};
  const open=0.72+0.28*Math.sin(t*2.6);

  // great shadow on the wall
  const k=1.7+0.05*(f-1)*4;
  ctx.save();
  ctx.translate(F.x+(P.x-F.x)*k,F.y+(P.y-10-F.y)*k);
  ctx.scale(k,k);
  ctx.fillStyle='rgba(4,2,4,0.32)';
  drawWing(-1,open,0,t,true);drawWing(1,open,0,t,true);
  ctx.beginPath();ctx.ellipse(0,25,8,40,0,0,6.283);ctx.fill();
  ctx.beginPath();ctx.arc(0,-22,10,0,6.283);ctx.fill();
  ctx.restore();

  // table
  g=ctx.createLinearGradient(0,568,0,640);
  g.addColorStop(0,'#2a1812');g.addColorStop(1,'#0c0708');
  ctx.fillStyle=g;ctx.fillRect(-600,568,1600,400);
  g=ctx.createRadialGradient(285,580,2,285,580,180);
  g.addColorStop(0,'rgba(255,160,80,0.25)');g.addColorStop(1,'rgba(255,160,80,0)');
  ctx.fillStyle=g;ctx.fillRect(-600,568,1600,400);

  // dish
  g=ctx.createLinearGradient(225,0,345,0);
  g.addColorStop(0,'#3a2614');g.addColorStop(0.45,'#c08a40');g.addColorStop(0.6,'#f0c070');g.addColorStop(1,'#4a3018');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.ellipse(285,572,62,11,0,0,6.283);ctx.fill();
  ctx.fillStyle='#2a1a0e';ctx.beginPath();ctx.ellipse(285,569,50,7,0,0,6.283);ctx.fill();

  // candle
  g=ctx.createLinearGradient(262,0,308,0);
  g.addColorStop(0,'#6e5444');g.addColorStop(0.35,'#d8c0a0');g.addColorStop(0.7,'#b89c80');g.addColorStop(1,'#4e3a30');
  ctx.fillStyle=g;ctx.fillRect(262,346,46,222);
  g=ctx.createLinearGradient(0,346,0,568);
  g.addColorStop(0,'rgba(255,190,110,0.45)');g.addColorStop(0.35,'rgba(255,170,90,0.08)');g.addColorStop(1,'rgba(0,0,0,0.45)');
  ctx.fillStyle=g;ctx.fillRect(262,346,46,222);
  // drips
  ctx.fillStyle='rgba(236,214,184,0.9)';
  [[266,40,5],[279,22,4],[296,58,5],[304,30,4]].forEach(([x,l,w])=>{
    ctx.beginPath();ctx.moveTo(x-w,346);ctx.lineTo(x-w,346+l);
    ctx.arc(x,346+l,w,Math.PI,0,true);ctx.lineTo(x+w,346);ctx.fill();
  });
  ctx.fillStyle='#f2dcb8';ctx.beginPath();ctx.ellipse(285,346,23,5,0,0,6.283);ctx.fill();
  g=ctx.createRadialGradient(285,346,1,285,346,20);
  g.addColorStop(0,'rgba(255,220,150,0.95)');g.addColorStop(1,'rgba(255,200,120,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(285,346,22,5,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#1a1010';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(285,346);ctx.quadraticCurveTo(285,340,285+sway*0.3,336);ctx.stroke();

  // smoke
  ctx.lineWidth=1.4;
  let px=F.x+sway,py=by-fh;
  for(let i=1;i<40;i++){
    const y=by-fh-i*5,amp=i*0.35;
    const x=F.x+sway*(1-i/40)+Math.sin(i*0.25-t*1.8)*amp+Math.sin(i*0.11+t*0.7)*amp*0.6;
    ctx.strokeStyle='rgba(190,170,165,'+(0.16*(1-i/40))+')';
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();
    px=x;py=y;
  }

  // dust spawn
  if(dust.length<170){
    for(let n=0;n<2;n++){
      const side=Math.random()<0.5?-1:1;
      dust.push({x:P.x+side*Math.random()*90*open,y:P.y-30+Math.random()*80,
        vx:(Math.random()-0.5)*0.15,vy:Math.random()*0.2,life:1,sz:0.5+Math.random()*1.3,ph:Math.random()*6});
    }
  }

  // fairy wings
  ctx.save();
  ctx.translate(P.x,P.y-10);
  drawWing(-1,open,0.15,t,false);
  drawWing(1,open,0.9,t,false);
  ctx.restore();

  // fairy body
  ctx.save();
  ctx.translate(P.x,P.y);
  ctx.rotate(0.08+Math.sin(t*0.8)*0.04);
  // abdomen
  g=ctx.createLinearGradient(-8,0,8,0);
  g.addColorStop(0,'#3a2c2a');g.addColorStop(0.6,'#9a8478');g.addColorStop(1,'#c69a78');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-7,18);
  ctx.bezierCurveTo(-11,40,-4,66,Math.sin(t*1.3)*3,80);
  ctx.bezierCurveTo(4,66,11,40,7,18);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(30,20,20,0.45)';ctx.lineWidth=1.2;
  for(let i=0;i<6;i++){const y=28+i*8,w=8-i*1.1;ctx.beginPath();ctx.moveTo(-w,y);ctx.quadraticCurveTo(0,y+3,w,y);ctx.stroke();}
  // torso
  g=ctx.createLinearGradient(-8,0,9,0);
  g.addColorStop(0,'#8a7a76');g.addColorStop(0.6,'#e4d4ca');g.addColorStop(1,'#ffd8b0');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-7,-14);ctx.quadraticCurveTo(-9,5,-6,22);ctx.lineTo(6,22);ctx.quadraticCurveTo(9,5,7,-14);ctx.closePath();ctx.fill();
  // left arm resting
  ctx.strokeStyle='#bfa898';ctx.lineCap='round';ctx.lineWidth=2.6;
  ctx.beginPath();ctx.moveTo(-6,-11);ctx.quadraticCurveTo(-13,4,-8,16);ctx.stroke();
  // right arm reaching toward the flame, stopping short
  const reach=Math.sin(t*0.5)*0.5+0.5;
  const hx=46+reach*12,hy=6+reach*6;
  ctx.strokeStyle='#ecd2bc';ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(6,-11);ctx.quadraticCurveTo(24,-12,hx,hy);ctx.stroke();
  ctx.lineWidth=0.9;ctx.strokeStyle='#f6dcc4';
  for(let i=0;i<4;i++){const a=-0.3+i*0.28+reach*0.1;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+Math.cos(a)*5.5,hy+Math.sin(a)*5.5);ctx.stroke();}
  ctx.fillStyle='rgba(255,170,90,'+(0.25+0.15*f)+')';ctx.beginPath();ctx.arc(hx+2,hy+1,3,0,6.283);ctx.fill();
  // fur ruff
  for(let i=0;i<16;i++){
    const a=i/16*6.283,r=7+Math.sin(i*2.3)*1.5;
    ctx.fillStyle=i%2?'rgba(240,232,222,0.75)':'rgba(205,190,180,0.7)';
    ctx.beginPath();ctx.arc(Math.cos(a)*r,-15+Math.sin(a)*r*0.55,4.2,0,6.283);ctx.fill();
  }
  // head
  ctx.translate(0,-31);
  ctx.rotate(0.22+Math.sin(t*0.4)*0.09);
  // hair behind
  ctx.lineWidth=1.1;
  strands.forEach((h,i)=>{
    const w=Math.sin(t*1.2+h.a)*4;
    ctx.strokeStyle='rgba(232,224,216,0.55)';
    ctx.beginPath();ctx.moveTo(h.o*0.6,-8);
    ctx.bezierCurveTo(-10+h.o,-12,-h.l*0.5,4+w*0.5,-h.l*0.7+w,10+h.l*0.4+w);
    ctx.stroke();
  });
  g=ctx.createLinearGradient(-9,0,9,0);
  g.addColorStop(0,'#8a7470');g.addColorStop(0.55,'#efd8c6');g.addColorStop(1,'#ffd6ae');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,8.5,10.5,0,0,6.283);ctx.fill();
  // eyes: dark moth eyes holding the flame
  ctx.fillStyle='#0a0608';
  ctx.beginPath();ctx.ellipse(-2,0,2.2,3.3,0.15,0,6.283);ctx.fill();
  ctx.beginPath();ctx.ellipse(4.6,0,2.5,3.4,-0.1,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(255,190,100,'+(0.6+0.4*(f-0.9))+')';
  ctx.beginPath();ctx.arc(-1.4,-0.8,0.6,0,6.283);ctx.fill();
  ctx.beginPath();ctx.arc(5.4,-0.8,0.7,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(120,70,60,0.6)';ctx.lineWidth=0.6;
  ctx.beginPath();ctx.moveTo(1.5,6);ctx.lineTo(3.6,6.2);ctx.stroke();
  // fringe
  ctx.fillStyle='rgba(236,228,220,0.85)';
  ctx.beginPath();ctx.moveTo(-8.5,-2);ctx.quadraticCurveTo(-7,-12,2,-11);ctx.quadraticCurveTo(8,-10,8.5,-4);ctx.quadraticCurveTo(3,-8,-2,-6);ctx.quadraticCurveTo(-6,-5,-8.5,-2);ctx.fill();
  // antennae
  const aw=Math.sin(t*1.7)*2;
  feather(-2,-9,-8,-30,-18+aw,-40,t,'rgba(225,205,180,0.8)');
  feather(3,-9,10,-30,22+aw,-38,t,'rgba(255,210,170,0.85)');
  ctx.restore();

  // glow
  ctx.globalCompositeOperation='lighter';
  g=ctx.createRadialGradient(F.x,F.y,2,F.x,F.y,240*f);
  g.addColorStop(0,'rgba(255,190,100,0.5)');g.addColorStop(0.15,'rgba(255,140,60,0.18)');g.addColorStop(1,'rgba(255,120,40,0)');
  ctx.fillStyle=g;ctx.fillRect(F.x-260,F.y-260,520,520);

  // flame
  const w=8.5,bx=285;
  const flame=new Path2D();
  flame.moveTo(bx-w,by);
  flame.bezierCurveTo(bx-w,by-fh*0.45,bx+sway-3,by-fh*0.75,bx+sway,by-fh);
  flame.bezierCurveTo(bx+sway+3,by-fh*0.75,bx+w,by-fh*0.45,bx+w,by);
  flame.arc(bx,by,w,0,Math.PI);
  g=ctx.createLinearGradient(0,by+w,0,by-fh);
  g.addColorStop(0,'rgba(70,100,255,0.7)');g.addColorStop(0.2,'rgba(255,240,200,0.95)');
  g.addColorStop(0.6,'rgba(255,170,60,0.85)');g.addColorStop(1,'rgba(255,90,20,0)');
  ctx.fillStyle=g;ctx.fill(flame);
  ctx.fillStyle='rgba(255,252,235,0.85)';
  ctx.beginPath();ctx.ellipse(bx+sway*0.3,by-fh*0.28,3.2,fh*0.22,0,0,6.283);ctx.fill();

  // dust
  for(let i=dust.length-1;i>=0;i--){
    const d=dust[i];
    d.vy+=0.004;d.vx+=Math.sin(t*1.5+d.ph)*0.004;
    d.x+=d.vx;d.y+=d.vy;d.life-=0.0035;
    if(d.life<=0||d.y>600){dust.splice(i,1);continue;}
    const dist=Math.hypot(d.x-F.x,d.y-F.y);
    const b=Math.max(0,1-dist/260)*0.9+0.12;
    ctx.fillStyle='rgba(255,'+(170+Math.round(60*b))+',120,'+(b*d.life*(0.6+0.4*Math.sin(t*4+d.ph)))+')';
    ctx.beginPath();ctx.arc(d.x,d.y,d.sz,0,6.283);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';

  // little moths drawn to the flame
  for(let i=0;i<3;i++){
    const a=t*(1.1+i*0.45)+i*2.1,r=30+i*15+Math.sin(t*2+i)*6;
    const x=F.x+Math.cos(a)*r,y=F.y-6+Math.sin(a)*r*0.5;
    const fl=Math.abs(Math.sin(t*28+i*3));
    const near=Math.max(0,1-r/80);
    ctx.fillStyle='rgba('+(200+near*55|0)+','+(180+near*40|0)+',150,0.85)';
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5*fl,y-3);ctx.lineTo(x-4*fl,y+2);ctx.fill();
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+5*fl,y-3);ctx.lineTo(x+4*fl,y+2);ctx.fill();
  }

  // vignette
  g=ctx.createRadialGradient(220,330,150,220,330,480);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.65)');
  ctx.fillStyle=g;ctx.fillRect(-600,-600,1600,1800);

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
  "title": "The Fairy of the Candle's Edge",
  "statement": "Draw near what burns; take its warmth, refuse its hunger."
}
```