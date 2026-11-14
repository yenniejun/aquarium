```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Swirl-Sparkle Serum</title>
<style>
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#0a0710;}
canvas{display:block;width:100vw;height:100vh;touch-action:pan-y;}
</style>
</head>
<body>
<canvas id="scene"></canvas>
<script>
(function(){
'use strict';

var cv=document.getElementById('scene');
var ctx=cv.getContext('2d');

var W=0,H=0,DPR=1;
var G=null,bgGrad=null;

var bubbles=[],motes=[],dust=[],cond=[];
var stir=0.6,tilt=0,tiltTarget=0,lastMove=-10,px=0.5,py=0.5;
var curT=0,curStir=0,curTilt=0;

function layout(){
  var w=W,h=H,cx=w/2;
  var bw=Math.max(56,Math.min(w*0.62,h*0.34));
  var bh=h*0.46;
  var baseY=h*0.90;
  var bodyTop=baseY-bh;
  var t=Math.max(3,bw*0.045);
  var nw=bw*0.36;
  var neckH=Math.max(18,h*0.085);
  var neckTopY=bodyTop-neckH*0.88;
  var neckBotY=neckTopY+neckH;
  var shY=bodyTop+bh*0.16;
  var lipH=Math.max(3,bw*0.022);
  var lipW=Math.max(2,bw*0.03);
  var liquidTop=bodyTop+bh*0.18;
  G={cx:cx,bw:bw,bh:bh,baseY:baseY,bodyTop:bodyTop,t:t,nw:nw,
     neckH:neckH,neckTopY:neckTopY,neckBotY:neckBotY,shY:shY,
     lipH:lipH,lipW:lipW,liquidTop:liquidTop,
     x0:cx-bw/2,x1:cx+bw/2,nX0:cx-nw/2,nX1:cx+nw/2,
     baseYi:baseY-t*1.5,bwI:bw-2*t,cy0:0};
  G.liquidH=G.baseYi-liquidTop;
  bgGrad=ctx.createLinearGradient(0,0,0,h);
  bgGrad.addColorStop(0,'#1a1326');
  bgGrad.addColorStop(0.55,'#110c1b');
  bgGrad.addColorStop(1,'#0a0710');
}

function rr(c,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  c.beginPath();
  c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r);
  c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);
  c.arcTo(x,y,x+w,y,r);
  c.closePath();
}

function bottlePath(c,half,nHalf,baseY,shY,neckTopY,neckBotY,lipH,lipW,cx){
  var x0=cx-half,x1=cx+half,n0=cx-nHalf,n1=cx+nHalf;
  var r=half*0.16;
  c.beginPath();
  c.moveTo(x0,shY);
  c.lineTo(x0,baseY-r);
  c.quadraticCurveTo(x0,baseY,x0+r,baseY);
  c.lineTo(x1-r,baseY);
  c.quadraticCurveTo(x1,baseY,x1,baseY-r);
  c.lineTo(x1,shY);
  c.quadraticCurveTo(x1,neckBotY,n1,neckBotY);
  c.lineTo(n1,neckTopY+lipH);
  c.lineTo(n1+lipW,neckTopY+lipH);
  c.lineTo(n1+lipW,neckTopY);
  c.lineTo(n0-lipW,neckTopY);
  c.lineTo(n0-lipW,neckTopY+lipH);
  c.lineTo(n0,neckTopY+lipH);
  c.lineTo(n0,neckBotY);
  c.quadraticCurveTo(x0,neckBotY,x0,shY);
  c.closePath();
}

function innerPath(c){
  bottlePath(c,G.bwI/2,(G.nw-2*G.t)/2,G.baseYi,G.shY,
    G.neckTopY+G.t,G.neckBotY,
    Math.max(0,G.lipH-G.t),Math.max(0.5,G.lipW-G.t),G.cx);
}
function outerPath(c){
  bottlePath(c,G.bw/2,G.nw/2,G.baseY,G.shY,
    G.neckTopY,G.neckBotY,G.lipH,G.lipW,G.cx);
}

function surfAtX(x){
  var lx=x-G.cx;
  var amp=G.bw*(0.006+curStir*0.028);
  return G.liquidTop-lx*curTilt
    +amp*(0.6*Math.sin(lx*0.055+curT*1.7)+0.4*Math.sin(lx*0.023-curT*1.15+1.7));
}

function seed(){
  var i;
  bubbles=[];motes=[];dust=[];cond=[];
  for(i=0;i<34;i++)bubbles.push({lx:(Math.random()*2-1)*0.8,f:Math.random()*0.95,r:1+Math.random()*2.2,sp:0.10+Math.random()*0.22,ph:Math.random()*6.2832});
  for(i=0;i<26;i++)motes.push({lx:(Math.random()*2-1)*0.85,f:Math.random(),s:0.4+Math.random()*1.6,ph:Math.random()*6.2832,r:0.6+Math.random()*1.5});
  for(i=0;i<16;i++)dust.push({x:Math.random(),y:Math.random()*H,s:0.5+Math.random(),ph:Math.random()*6.2832,r:0.5+Math.random()*1.3});
  for(i=0;i<9;i++)cond.push({lx:(Math.random()<0.5?-1:1)*(0.55+Math.random()*0.35),nd:Math.random(),ph:Math.random()*6.2832});
}

function drawSideCork(){
  var w=G.bw*0.18,h=G.bw*0.08;
  var x=G.cx+G.bw*0.60,y=G.baseY-h*0.35;
  ctx.fillStyle='rgba(0,0,0,0.42)';
  ctx.beginPath();ctx.ellipse(x,G.baseY+2,w*0.62,h*0.55,0,0,6.2832);ctx.fill();
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.4);
  var g=ctx.createLinearGradient(0,-h/2,0,h/2);
  g.addColorStop(0,'#a97a46');g.addColorStop(0.5,'#8a5c30');g.addColorStop(1,'#5f3b1f');
  rr(ctx,-w/2,-h/2,w,h,h*0.45);
  ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(40,22,8,0.5)';ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();ctx.ellipse(-w/2+1,0,h*0.48,h*0.4,0,0,6.2832);
  ctx.fillStyle='#7c5028';ctx.fill();ctx.stroke();
  ctx.restore();
}

function drawBottle(t,dt,hue){
  var cx=G.cx,i,x;
  /* back wall of glass */
  innerPath(ctx);
  var ig=ctx.createLinearGradient(0,G.neckTopY,0,G.baseY);
  ig.addColorStop(0,'rgba(26,18,38,0.42)');
  ig.addColorStop(1,'rgba(8,5,14,0.55)');
  ctx.fillStyle=ig;ctx.fill();

  /* cork stopper (behind the front glass) */
  var corkW=G.nw+G.bw*0.05;
  var corkH=G.neckH*0.95+G.lipH+G.bw*0.02;
  var cy1=G.neckTopY+G.lipH+G.t*0.9;
  var cy0=cy1-corkH;
  G.cy0=cy0;
  var cg=ctx.createLinearGradient(cx-corkW/2,0,cx+corkW/2,0);
  cg.addColorStop(0,'#5f3b1f');cg.addColorStop(0.3,'#96683a');
  cg.addColorStop(0.55,'#a97a46');cg.addColorStop(0.8,'#7c5028');
  cg.addColorStop(1,'#4e2f16');
  rr(ctx,cx-corkW/2,cy0,corkW,corkH,Math.min(corkH*0.3,corkW*0.4));
  ctx.fillStyle=cg;ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx,cy0,corkW/2,Math.max(2,corkH*0.14),0,0,6.2832);
  ctx.fillStyle='#b98a52';ctx.fill();
  ctx.strokeStyle='rgba(40,22,8,0.6)';ctx.lineWidth=1;ctx.stroke();
  ctx.strokeStyle='rgba(70,42,18,0.4)';
  for(i=1;i<=3;i++){
    var gy=cy0+corkH*i/4;
    ctx.beginPath();
    ctx.moveTo(cx-corkW/2+2,gy);
    ctx.quadraticCurveTo(cx,gy+2.5,cx+corkW/2-2,gy);
    ctx.stroke();
  }

  /* ---- liquid, clipped to the glass ---- */
  ctx.save();
  innerPath(ctx);
  ctx.clip();
  var x0=cx-G.bwI/2,x1=cx+G.bwI/2;
  function surfPath(){
    ctx.beginPath();
    ctx.moveTo(x0-3,surfAtX(x0-3));
    for(var sx=x0-3;sx<=x1+3;sx+=4)ctx.lineTo(sx,surfAtX(sx));
  }
  surfPath();
  ctx.lineTo(x1+3,G.baseYi+6);ctx.lineTo(x0-3,G.baseYi+6);ctx.closePath();
  var lg=ctx.createLinearGradient(0,G.liquidTop-12,0,G.baseYi);
  lg.addColorStop(0,'hsla('+hue+',95%,76%,0.95)');
  lg.addColorStop(0.22,'hsla('+((hue+14)%360)+',92%,57%,0.96)');
  lg.addColorStop(0.65,'hsla('+((hue+26)%360)+',88%,34%,0.97)');
  lg.addColorStop(1,'hsla('+((hue+38)%360)+',90%,19%,0.98)');
  ctx.fillStyle=lg;ctx.fill();

  ctx.globalCompositeOperation='lighter';
  var cgy=G.liquidTop+G.liquidH*0.42;
  var rg=ctx.createRadialGradient(cx,cgy,0,cx,cgy,G.bw*0.8);
  rg.addColorStop(0,'hsla('+hue+',100%,72%,'+(0.26+curStir*0.3)+')');
  rg.addColorStop(1,'hsla('+hue+',100%,60%,0)');
  ctx.fillStyle=rg;
  ctx.fillRect(x0-3,G.liquidTop-40,G.bwI+6,G.liquidH+46);
  var sg=ctx.createLinearGradient(0,G.liquidTop-4,0,G.liquidTop+22);
  sg.addColorStop(0,'hsla('+hue+',100%,88%,'+(0.30+curStir*0.25)+')');
  sg.addColorStop(1,'hsla('+hue+',100%,80%,0)');
  ctx.fillStyle=sg;
  ctx.fillRect(x0-3,G.liquidTop-4,G.bwI+6,26);

  var swx=cx+Math.cos(t*0.21)*G.bw*0.08;
  var swy=cgy+Math.sin(t*0.17)*G.liquidH*0.12;
  for(i=0;i<4;i++){
    var a0=t*(0.5+curStir*2.4)*(i%2===0?1:-1)+i*1.7;
    ctx.beginPath();
    ctx.arc(swx,swy,G.bw*(0.10+0.075*i),a0,a0+2.3);
    ctx.strokeStyle='hsla('+((hue+55)%360)+',100%,86%,'+((0.10+curStir*0.2)*(1-i*0.18))+')';
    ctx.lineWidth=Math.max(1.2,G.bw*0.02);
    ctx.stroke();
  }

  for(i=0;i<motes.length;i++){
    var m=motes[i];
    m.f+=dt*(0.02+curStir*0.07)*m.s;
    if(m.f>1){m.f=0;m.lx=(Math.random()*2-1)*0.85;}
    var mx=cx+m.lx*(G.bwI/2)*0.9+Math.sin(t*m.s+m.ph)*3;
    var my=G.baseYi-m.f*G.liquidH;
    var ta=0.25+0.75*Math.abs(Math.sin(t*m.s*2.2+m.ph));
    ctx.beginPath();
    ctx.arc(mx,my,m.r,0,6.2832);
    ctx.fillStyle='hsla('+((hue+m.ph*9)%360)+',100%,82%,'+(ta*0.75)+')';
    ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';

  for(i=0;i<bubbles.length;i++){
    var b=bubbles[i];
    b.f+=dt*b.sp*(0.6+curStir*2.6);
    b.lx+=Math.sin(t*1.3+b.ph)*dt*0.12*(1+curStir*3);
    if(b.lx>0.88)b.lx=0.88;
    if(b.lx<-0.88)b.lx=-0.88;
    var taper=b.f>0.8?1-(b.f-0.8)/0.2*0.55:1;
    var bx=cx+b.lx*(G.bwI/2)*0.94*taper+Math.sin(t*2.4+b.ph)*(1.2+curStir*3.5);
    var by=G.baseYi-b.f*G.liquidH;
    if(by<surfAtX(bx)-b.r-2){
      b.f=0.01+Math.random()*0.03;
      b.lx=(Math.random()*2-1)*0.8;
      if(Math.random()<0.15)b.r=G.bw*(0.028+Math.random()*0.02);
      else b.r=1+Math.random()*2.2;
    }
    ctx.beginPath();ctx.arc(bx,by,b.r,0,6.2832);
    ctx.fillStyle='hsla('+hue+',100%,88%,'+(0.14+curStir*0.12)+')';
    ctx.fill();
    ctx.strokeStyle='hsla('+((hue+30)%360)+',100%,92%,'+(0.35+curStir*0.3)+')';
    ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx-b.r*0.35,by-b.r*0.4,Math.max(0.5,b.r*0.26),0,6.2832);
    ctx.fillStyle='rgba(255,255,255,'+(0.5+curStir*0.3)+')';
    ctx.fill();
  }

  for(i=0;i<cond.length;i++){
    var cd=cond[i];
    var band=Math.max(4,G.liquidTop-G.bodyTop-9);
    var cdy=G.liquidTop-(5+cd.nd*band);
    var ca=0.06+0.12*Math.abs(Math.sin(t*0.9+cd.ph));
    ctx.beginPath();
    ctx.arc(cx+cd.lx*(G.bwI/2),cdy,1.1,0,6.2832);
    ctx.fillStyle='rgba(255,255,255,'+ca+')';
    ctx.fill();
  }

  surfPath();
  ctx.strokeStyle='hsla('+hue+',100%,92%,'+(0.5+curStir*0.4)+')';
  ctx.lineWidth=1.6;
  ctx.stroke();
  ctx.restore();

  /* ---- front glass ---- */
  outerPath(ctx);
  var gg=ctx.createLinearGradient(G.x0,0,G.x1,0);
  gg.addColorStop(0,'rgba(255,255,255,0.15)');
  gg.addColorStop(0.14,'rgba(255,255,255,0.035)');
  gg.addColorStop(0.5,'rgba(255,255,255,0.012)');
  gg.addColorStop(0.86,'rgba(255,255,255,0.05)');
  gg.addColorStop(1,'rgba(255,255,255,0.14)');
  ctx.fillStyle=gg;ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.32)';
  ctx.lineWidth=1.4;ctx.stroke();
  innerPath(ctx);
  ctx.strokeStyle='rgba(255,255,255,0.10)';
  ctx.lineWidth=1;ctx.stroke();

  var hy0=G.shY+G.bh*0.03,hy1=G.baseY-G.bh*0.12;
  var hx=G.x0+G.bw*0.07,hw=G.bw*0.09;
  var hg=ctx.createLinearGradient(0,hy0,0,hy1);
  hg.addColorStop(0,'rgba(255,255,255,0.04)');
  hg.addColorStop(0.3,'rgba(255,255,255,0.28)');
  hg.addColorStop(0.75,'rgba(255,255,255,0.10)');
  hg.addColorStop(1,'rgba(255,255,255,0.03)');
  rr(ctx,hx,hy0,hw,hy1-hy0,hw/2);
  ctx.fillStyle=hg;ctx.fill();
  var cg2=ctx.createLinearGradient(hx,0,hx+hw,0);
  cg2.addColorStop(0,'rgba(255,255,255,0)');
  cg2.addColorStop(0.5,'rgba(255,255,255,0.32)');
  cg2.addColorStop(1,'rgba(255,255,255,0)');
  rr(ctx,hx,hy0,hw*0.5,hy1-hy0,hw*0.25);
  ctx.fillStyle=cg2;ctx.fill();
  rr(ctx,G.x1-G.bw*0.115,G.shY+G.bh*0.08,G.bw*0.04,G.bh*0.55,G.bw*0.02);
  ctx.fillStyle='hsla('+hue+',90%,70%,0.10)';ctx.fill();
  rr(ctx,G.nX0+G.nw*0.12,G.neckTopY+G.lipH+2,G.nw*0.2,G.neckH*0.55,G.nw*0.1);
  ctx.fillStyle='rgba(255,255,255,0.16)';ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx,G.baseYi,G.bwI/2,Math.max(2,G.t*1.2),0,0,3.14159);
  ctx.fillStyle='rgba(255,255,255,0.06)';ctx.fill();

  /* glowing glass knob on top of the cork */
  var kr=Math.max(6,G.nw*0.46);
  var kx=cx,ky=cy0-kr*0.5;
  ctx.globalCompositeOperation='lighter';
  var pulse=0.75+0.25*Math.sin(t*2.1);
  var halo=ctx.createRadialGradient(kx,ky,kr*0.2,kx,ky,kr*3.4);
  halo.addColorStop(0,'hsla('+hue+',100%,70%,'+Math.min(0.8,0.35*pulse+curStir*0.35)+')');
  halo.addColorStop(1,'hsla('+hue+',100%,70%,0)');
  ctx.fillStyle=halo;
  ctx.beginPath();ctx.arc(kx,ky,kr*3.4,0,6.2832);ctx.fill();
  ctx.globalCompositeOperation='source-over';
  var bg2=ctx.createRadialGradient(kx-kr*0.35,ky-kr*0.35,kr*0.1,kx,ky,kr);
  bg2.addColorStop(0,'hsla('+((hue+30)%360)+',100%,90%,0.95)');
  bg2.addColorStop(0.55,'hsla('+hue+',95%,64%,0.92)');
  bg2.addColorStop(1,'hsla('+((hue-25+360)%360)+',90%,36%,0.95)');
  ctx.beginPath();ctx.arc(kx,ky,kr,0,6.2832);
  ctx.fillStyle=bg2;ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(kx-kr*0.32,ky-kr*0.38,kr*0.26,kr*0.15,-0.6,0,6.2832);
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fill();
}

function draw(t,dt){
  curT=t;curStir=stir;curTilt=tilt;
  var hue=(195+t*(5+stir*30))%360;
  var i;

  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=1;
  ctx.fillStyle=bgGrad;
  ctx.fillRect(0,0,W,H);

  ctx.globalCompositeOperation='lighter';
  var gr=Math.max(W,H)*0.85;
  var ag=ctx.createRadialGradient(G.cx,G.baseY-G.bh*0.45,0,G.cx,G.baseY-G.bh*0.45,gr);
  ag.addColorStop(0,'hsla('+hue+',75%,55%,'+(0.10+stir*0.10)+')');
  ag.addColorStop(1,'hsla('+hue+',75%,55%,0)');
  ctx.fillStyle=ag;
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='source-over';

  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(G.cx,G.baseY+3,G.bw*0.60,G.bw*0.075,0,0,6.2832);
  ctx.fill();

  ctx.globalCompositeOperation='lighter';
  var fg=ctx.createRadialGradient(G.cx,G.baseY+3,0,G.cx,G.baseY+3,G.bw*0.9);
  fg.addColorStop(0,'hsla('+hue+',95%,60%,'+(0.15+stir*0.25)+')');
  fg.addColorStop(1,'hsla('+hue+',95%,60%,0)');
  ctx.fillStyle=fg;
  ctx.beginPath();
  ctx.ellipse(G.cx,G.baseY+3,G.bw*0.9,G.bw*0.17,0,0,6.2832);
  ctx.fill();
  ctx.globalCompositeOperation='source-over';

  drawSideCork();

  ctx.save();
  ctx.translate(G.cx,G.baseY);
  ctx.rotate(tilt);
  ctx.translate(-G.cx,-G.baseY);
  drawBottle(t,dt,hue);
  ctx.restore();

  var vg=ctx.createRadialGradient(W/2,H*0.42,Math.min(W,H)*0.35,W/2,H*0.52,Math.max(W,H)*0.78);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle=vg;
  ctx.fillRect(0,0,W,H);

  ctx.globalCompositeOperation='lighter';
  for(i=0;i<dust.length;i++){
    var d=dust[i];
    d.y-=d.s*dt*12;
    if(d.y<-4){d.y=H+4;d.x=Math.random();}
    var dx=W*d.x+Math.sin(t*0.25+d.ph)*10;
    var da=0.04+0.09*Math.abs(Math.sin(t*0.6+d.ph));
    ctx.beginPath();
    ctx.arc(dx,d.y,d.r,0,6.2832);
    ctx.fillStyle='hsla('+((hue+70)%360)+',70%,82%,'+da+')';
    ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
}

function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=Math.max(1,window.innerWidth);
  H=Math.max(1,window.innerHeight);
  cv.width=Math.round(W*DPR);
  cv.height=Math.round(H*DPR);
  cv.style.width=W+'px';
  cv.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  layout();
}

window.addEventListener('resize',resize);
window.addEventListener('pointermove',function(e){
  var nx=e.clientX/Math.max(1,W),ny=e.clientY/Math.max(1,H);
  var dx=nx-px,dy=ny-py;
  stir=Math.min(2,stir+Math.sqrt(dx*dx+dy*dy)*7);
  tiltTarget=Math.max(-1,Math.min(1,(nx-0.5)*2))*0.04;
  px=nx;py=ny;
  lastMove=performance.now()/1000;
},{passive:true});
window.addEventListener('pointerdown',function(e){
  stir=Math.min(2.2,stir+0.8);
  tiltTarget=Math.max(-1,Math.min(1,(e.clientX/Math.max(1,W)-0.5)*2))*0.05;
  lastMove=performance.now()/1000;
},{passive:true});

resize();
seed();

var startT=performance.now();
var last=startT;
function frame(now){
  var dt=Math.min(0.05,(now-last)/1000);
  last=now;
  var t=(now-startT)/1000;
  if(t-lastMove>2.5)tiltTarget=0;
  stir*=Math.exp(-dt*0.8);
  tilt+=(tiltTarget-tilt)*Math.min(1,dt*2.5);
  draw(t,dt);
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
  "title": "Swirl-Sparkle Serum",
  "statement": "A slow-brewed serum that drifts through every shade of dusk all on its own. Nudge it with your cursor and it fizzes awake — bubbles, vortex and glow — then settles back into its lazy swirl."
}
```