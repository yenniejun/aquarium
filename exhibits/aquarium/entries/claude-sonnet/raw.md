```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tank</title>
<style>
  html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#041a26}
  canvas{display:block;width:100vw;height:100vh;touch-action:auto}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W=0,H=0,dpr=1,S=1,bg=null;
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function mul(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hsl=(h,s,l,a)=>'hsla('+h.toFixed(1)+','+s.toFixed(1)+'%,'+l.toFixed(1)+'%,'+(a===undefined?1:a).toFixed(3)+')';
const hsh=(x,y)=>{const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s)};

/* ---------- creature state ---------- */
const c={x:0,y:0,vx:0,vy:0,face:1,tilt:0,jet:0,jetCd:2,blink:0,nextBlink:2};
let mode='wander',tx=0,ty=0,tTimer=0,wave=0,waveT=0,waveTimer=6,warm=0;
let ptr={x:0,y:0,last:-99,inside:false};
const bubbles=[],motes=[];
let bubbleTimer=0;
const lantern={x:0,y:0,lh:0,fx:0,fy:0};
const kelps=[];

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  const oW=W,oH=H;
  W=Math.max(1,window.innerWidth);H=Math.max(1,window.innerHeight);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  S=Math.min(W/800,H/600);
  if(oW){c.x*=W/oW;c.y*=H/oH;tx*=W/oW;ty*=H/oH}
  else{c.x=W*0.35;c.y=H*0.4;tx=W*0.5;ty=H*0.4}
  lantern.x=W*0.8;lantern.y=H*0.865;lantern.lh=Math.min(H*0.18,W*0.17);
  buildBg();
  if(!kelps.length){
    const r=mul(7);
    [[0.04,3],[0.1,2],[0.2,2],[0.58,2],[0.64,3],[0.95,3],[0.9,2]].forEach((k,i)=>{
      for(let b=0;b<k[1];b++)kelps.push({fx:k[0]+(r()-0.5)*0.025,h:0.22+r()*0.28,w:5+r()*5,ph:r()*6,lean:(r()-0.5)*0.03,front:(i===1||i===5)&&b===0,hue:140+r()*30});
    });
    for(let i=0;i<45;i++)motes.push({x:Math.random(),y:Math.random(),z:0.3+Math.random()*0.7,ph:Math.random()*6});
  }
}

/* ---------- static background ---------- */
function rockPath(g,cx,cy,rx,ry,seed){
  const r=mul(seed),n=14,p=[];
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=0.78+r()*0.35;let s=Math.sin(a);
    p.push([cx+Math.cos(a)*rx*k,cy+(s>0?s*ry*0.35:s*ry*k)]);}
  g.beginPath();
  for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
    if(i===0)g.moveTo(mx,my);else g.quadraticCurveTo(a[0],a[1],mx,my);}
  const a=p[0],b=p[1];g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);g.closePath();
}
function sandY(x){return H*0.8+Math.sin(x*0.011)*H*0.008+Math.sin(x*0.029+1)*H*0.005}
function buildBg(){
  bg=document.createElement('canvas');bg.width=cv.width;bg.height=cv.height;
  const g=bg.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  let gr=g.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'#14869a');gr.addColorStop(0.35,'#0b5f7a');gr.addColorStop(0.75,'#07364d');gr.addColorStop(1,'#041a28');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  // distant ridges
  const r=mul(11);
  for(let layer=0;layer<2;layer++){
    g.fillStyle=layer?'rgba(4,38,58,0.55)':'rgba(10,70,92,0.35)';
    g.beginPath();g.moveTo(0,H);
    for(let x=0;x<=W+20;x+=20){
      const y=H*(0.74-layer*0.03)-Math.abs(Math.sin(x*0.004+layer*2))*H*0.1-Math.sin(x*0.013+layer)*H*0.02;
      g.lineTo(x,y);}
    g.lineTo(W,H);g.closePath();g.fill();
  }
  // sand
  g.beginPath();g.moveTo(0,H);
  for(let x=0;x<=W+10;x+=8)g.lineTo(x,sandY(x));
  g.lineTo(W,H);g.closePath();
  gr=g.createLinearGradient(0,H*0.78,0,H);
  gr.addColorStop(0,'#9fb5a0');gr.addColorStop(0.3,'#7d8d7a');gr.addColorStop(1,'#33453f');
  g.fillStyle=gr;g.fill();
  g.save();g.clip();
  g.lineWidth=Math.max(1,S*1.5);
  for(let i=0;i<14;i++){
    const y0=H*(0.81+i*0.014),ph=r()*6,a=H*0.004*(1+i*0.15);
    g.strokeStyle=i%2?'rgba(255,255,230,0.10)':'rgba(10,30,40,0.18)';
    g.beginPath();
    for(let x=0;x<=W;x+=10){const y=y0+Math.sin(x*0.02*(1-i*0.02)+ph)*a;x?g.lineTo(x,y):g.moveTo(x,y)}
    g.stroke();
  }
  for(let i=0;i<260;i++){
    const x=r()*W,y=H*0.81+r()*H*0.19;
    g.fillStyle=r()<0.5?'rgba(255,255,235,0.18)':'rgba(10,25,30,0.25)';
    g.fillRect(x,y,Math.max(1,S*1.4),Math.max(1,S*1.2));
  }
  g.restore();
  // rocks
  [[0.1,0.84,0.12,0.17,5],[0.3,0.855,0.05,0.06,9],[0.94,0.85,0.09,0.13,21],[0.5,0.87,0.035,0.035,31]].forEach(k=>{
    const cx=W*k[0],cy=H*k[1],rx=W*k[2],ry=H*k[3];
    rockPath(g,cx,cy,rx,ry,k[4]);
    const rg=g.createRadialGradient(cx-rx*0.3,cy-ry*0.8,rx*0.1,cx,cy,rx*1.2);
    rg.addColorStop(0,'#6f9298');rg.addColorStop(0.5,'#38606b');rg.addColorStop(1,'#12303c');
    g.fillStyle=rg;g.fill();
    g.save();g.clip();
    const rr=mul(k[4]+3);
    for(let i=0;i<8;i++){
      g.fillStyle='rgba(90,190,130,'+(0.12+rr()*0.18)+')';
      g.beginPath();g.ellipse(cx+(rr()-0.5)*rx*1.4,cy-ry*(0.3+rr()*0.5),rx*(0.08+rr()*0.15),ry*0.07,0,0,7);g.fill();
    }
    g.fillStyle='rgba(2,15,25,0.3)';g.fillRect(cx-rx*2,cy+ry*0.15,rx*4,ry);
    g.restore();
    rockPath(g,cx,cy,rx,ry,k[4]);
    g.strokeStyle='rgba(180,240,240,0.12)';g.lineWidth=Math.max(1,S*1.5);g.stroke();
  });
  // vignette
  const vg=g.createRadialGradient(W/2,H*0.5,Math.min(W,H)*0.3,W/2,H*0.5,Math.max(W,H)*0.75);
  vg.addColorStop(0,'rgba(0,10,20,0)');vg.addColorStop(1,'rgba(0,8,18,0.55)');
  g.fillStyle=vg;g.fillRect(0,0,W,H);
}

/* ---------- ambient elements ---------- */
function drawRays(t){
  ctx.globalCompositeOperation='lighter';
  for(let k=0;k<6;k++){
    const x0=W*(0.05+0.17*k)+Math.sin(t*0.12+k*1.7)*W*0.03,w=W*(0.035+0.03*((k*7)%3)/2),sl=W*0.1;
    const a=0.055+0.035*Math.sin(t*0.45+k*2.1);
    const g=ctx.createLinearGradient(0,0,0,H*0.85);
    g.addColorStop(0,'rgba(190,245,255,'+a+')');g.addColorStop(1,'rgba(190,245,255,0)');
    ctx.fillStyle=g;ctx.beginPath();
    ctx.moveTo(x0,0);ctx.lineTo(x0+w,0);ctx.lineTo(x0+w*2.4+sl,H*0.85);ctx.lineTo(x0+sl,H*0.85);ctx.closePath();ctx.fill();
  }
  // surface shimmer
  const sg=ctx.createLinearGradient(0,0,0,H*0.07);
  sg.addColorStop(0,'rgba(200,250,255,0.22)');sg.addColorStop(1,'rgba(200,250,255,0)');
  ctx.fillStyle=sg;ctx.fillRect(0,0,W,H*0.07);
  // sand caustics
  ctx.strokeStyle='rgba(210,255,240,0.09)';ctx.lineWidth=Math.max(1,S*1.5);
  for(let i=0;i<16;i++){
    const x=((i*0.0713+0.03+Math.sin(t*0.2+i)*0.01)%1)*W,y=H*(0.83+((i*37)%10)/10*0.15);
    ctx.beginPath();ctx.ellipse(x,y,W*0.03*(1+0.3*Math.sin(t*0.9+i*2)),H*0.006*(1+0.5*Math.sin(t*1.1+i)),0.1*Math.sin(t+i),0,7);ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
}
function drawKelp(t,front){
  for(const k of kelps){
    if(k.front!==front)continue;
    const x=k.fx*W,yb=H*0.875,hgt=k.h*H*(front?1.15:1),N=12,w=k.w*S*(front?1.4:1);
    const L=[],R=[];
    for(let i=0;i<=N;i++){
      const u=i/N,px=x+Math.sin(t*0.8+k.ph+u*2.4)*u*W*0.022+k.lean*W*u,py=yb-u*hgt,ww=w*(1-u*0.85)*(0.6+0.4*Math.sin(u*3+0.5));
      L.push([px-ww,py]);R.push([px+ww,py]);
    }
    ctx.beginPath();ctx.moveTo(L[0][0],L[0][1]);
    for(let i=1;i<=N;i++)ctx.lineTo(L[i][0],L[i][1]);
    for(let i=N;i>=0;i--)ctx.lineTo(R[i][0],R[i][1]);
    ctx.closePath();
    ctx.fillStyle=front?hsl(k.hue,45,16,0.95):hsl(k.hue,45,24,0.85);ctx.fill();
  }
}
function drawLantern(t,flick){
  const x=lantern.x,yb=lantern.y,lh=lantern.lh;
  ctx.save();ctx.translate(x,yb);ctx.rotate(-0.07);
  const brass='#9a7a35',dark='#5a4420';
  // base
  ctx.fillStyle=brass;ctx.beginPath();ctx.moveTo(-0.23*lh,0);ctx.lineTo(0.23*lh,0);ctx.lineTo(0.18*lh,-0.08*lh);ctx.lineTo(-0.18*lh,-0.08*lh);ctx.closePath();ctx.fill();
  // glass
  const gg=ctx.createLinearGradient(0,-0.62*lh,0,-0.08*lh);
  gg.addColorStop(0,'rgba(255,205,120,'+(0.55*flick)+')');gg.addColorStop(1,'rgba(255,150,60,'+(0.45*flick)+')');
  ctx.fillStyle=gg;ctx.fillRect(-0.15*lh,-0.62*lh,0.3*lh,0.54*lh);
  // flame
  const fg=ctx.createRadialGradient(0,-0.3*lh,0,0,-0.3*lh,0.12*lh);
  fg.addColorStop(0,'rgba(255,252,220,1)');fg.addColorStop(0.5,'rgba(255,210,110,0.9)');fg.addColorStop(1,'rgba(255,150,50,0)');
  ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(Math.sin(t*9)*0.01*lh,-0.3*lh,0.06*lh,0.13*lh*flick,0,0,7);ctx.fill();
  // frame
  ctx.fillStyle=brass;
  ctx.fillRect(-0.17*lh,-0.64*lh,0.03*lh,0.58*lh);ctx.fillRect(0.14*lh,-0.64*lh,0.03*lh,0.58*lh);
  ctx.fillRect(-0.005*lh,-0.62*lh,0.01*lh,0.54*lh);
  // cap
  ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(-0.22*lh,-0.62*lh);ctx.lineTo(0.22*lh,-0.62*lh);ctx.lineTo(0.07*lh,-0.76*lh);ctx.lineTo(-0.07*lh,-0.76*lh);ctx.closePath();ctx.fill();
  ctx.fillStyle=brass;ctx.fillRect(-0.22*lh,-0.64*lh,0.44*lh,0.025*lh);
  ctx.strokeStyle=brass;ctx.lineWidth=Math.max(1,0.025*lh);
  ctx.beginPath();ctx.arc(0,-0.82*lh,0.08*lh,0,Math.PI*2);ctx.stroke();
  // verdigris
  ctx.fillStyle='rgba(80,200,170,0.35)';ctx.fillRect(-0.22*lh,-0.76*lh,0.1*lh,0.03*lh);ctx.fillRect(0.06*lh,-0.1*lh,0.12*lh,0.02*lh);
  ctx.restore();
  lantern.fx=x-0.021*lh;lantern.fy=yb-0.3*lh;
}
function drawGlow(t,flick){
  ctx.globalCompositeOperation='lighter';
  const R=Math.max(W,H)*0.32,g=ctx.createRadialGradient(lantern.fx,lantern.fy,0,lantern.fx,lantern.fy,R);
  g.addColorStop(0,'rgba(255,190,100,'+(0.42*flick)+')');g.addColorStop(0.3,'rgba(255,150,70,'+(0.15*flick)+')');g.addColorStop(1,'rgba(255,120,50,0)');
  ctx.fillStyle=g;ctx.fillRect(lantern.fx-R,lantern.fy-R,R*2,R*2);
  ctx.globalCompositeOperation='source-over';
}
function drawMotes(t,dt){
  ctx.globalCompositeOperation='lighter';
  for(const m of motes){
    m.x+=Math.sin(t*0.3+m.ph)*0.004*dt*m.z;m.y+=(Math.cos(t*0.25+m.ph*2)*0.003-0.002)*dt*m.z;
    if(m.y<0)m.y=1;if(m.x<0)m.x=1;if(m.x>1)m.x=0;
    const dx=m.x*W-lantern.fx,dy=m.y*H-lantern.fy,near=Math.max(0,1-Math.hypot(dx,dy)/(W*0.3));
    ctx.fillStyle='rgba(220,250,255,'+(0.12+0.15*Math.sin(t*1.5+m.ph)*0.5+0.1+near*0.5).toFixed(3)+')';
    ctx.beginPath();ctx.arc(m.x*W,m.y*H,Math.max(0.6,1.6*S*m.z),0,7);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
}
function spawnB(x,y,r){if(bubbles.length<70)bubbles.push({x,y,r,v:25+Math.random()*30,ph:Math.random()*6})}
function drawBubbles(t,dt){
  ctx.lineWidth=Math.max(0.8,S);
  for(let i=bubbles.length-1;i>=0;i--){
    const b=bubbles[i];b.y-=b.v*S*dt*(0.6+b.r*0.12);b.x+=Math.sin(t*2.5+b.ph)*10*S*dt;
    if(b.y<H*0.02){bubbles.splice(i,1);continue}
    ctx.strokeStyle='rgba(210,250,255,0.55)';ctx.beginPath();ctx.arc(b.x,b.y,b.r*S,0,7);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(b.x-b.r*S*0.3,b.y-b.r*S*0.3,b.r*S*0.25,0,7);ctx.fill();
  }
}

/* ---------- creature ---------- */
function pickTarget(){
  const r=Math.random();
  const ptrOn=(performance.now()/1000-ptr.last)<4&&ptr.inside;
  if(ptrOn&&r<0.7){mode='ptr';tTimer=3+Math.random()*3;if(mode!=='ptr')waveT=3;waveT=Math.max(waveT,3);}
  else if(r<0.5){mode='lantern';tTimer=6+Math.random()*3;tx=lantern.x+(c.x<lantern.x?-0.17:0.1)*W;ty=H*0.6}
  else{mode='wander';tTimer=4+Math.random()*4;tx=W*(0.14+Math.random()*0.72);ty=H*(0.16+Math.random()*0.46)}
}
function update(dt,t){
  tTimer-=dt;
  const ptrOn=(t-ptr.last)<4&&ptr.inside;
  if(mode==='ptr'&&!ptrOn)tTimer=0;
  if(mode!=='ptr'&&ptrOn&&Math.random()<dt*0.5){mode='ptr';tTimer=3+Math.random()*3;waveT=Math.max(waveT,3)}
  if(tTimer<=0)pickTarget();
  if(mode==='ptr'){
    const dx=ptr.x-c.x,dy=ptr.y-c.y,d=Math.hypot(dx,dy)||1,keep=0.17*W;
    tx=ptr.x-dx/d*keep;ty=ptr.y-dy/d*keep*0.5;
  }
  tx=clamp(tx,W*0.12,W*0.88);ty=clamp(ty,H*0.15,H*0.64);
  const dx=tx-c.x,dy=ty-c.y,dist=Math.hypot(dx,dy);
  let max=(70+30*Math.min(1,dist/(W*0.3)))*S;
  let ds=Math.min(1,dist/(60*S));
  let dvx=dx/(dist||1)*max*ds,dvy=dy/(dist||1)*max*ds+Math.cos(t*1.3)*6*S;
  c.jetCd-=dt;
  if(dist>0.28*W&&c.jetCd<=0){c.vx+=dx/dist*230*S;c.vy+=dy/dist*230*S*0.6;c.jet=1;c.jetCd=4+Math.random()*3}
  c.jet=Math.max(0,c.jet-dt*1.3);
  const k=Math.min(1,dt*(c.jet>0.1?0.9:1.6));
  c.vx+=(dvx-c.vx)*k;c.vy+=(dvy-c.vy)*k;
  c.x+=c.vx*dt;c.y+=c.vy*dt;
  c.x=clamp(c.x,W*0.1,W*0.9);c.y=clamp(c.y,H*0.12,H*0.68);
  // look & face
  let lx=tx,ly=ty;
  if(mode==='ptr'){lx=ptr.x;ly=ptr.y}else if(mode==='lantern'){lx=lantern.fx;ly=lantern.fy}
  let ft=c.face>=0?1:-1;
  if(Math.abs(c.vx)>10*S)ft=Math.sign(c.vx);
  if(dist<50*S&&Math.abs(lx-c.x)>10*S)ft=Math.sign(lx-c.x);
  c.face+=(ft-c.face)*Math.min(1,dt*3.5);
  c.lookx=lx;c.looky=ly;
  const tl=Math.atan2(c.vy,Math.abs(c.vx)+25*S)*0.5;
  c.tilt+=(tl-c.tilt)*Math.min(1,dt*3);
  c.nextBlink-=dt;if(c.nextBlink<0){c.blink=1;c.nextBlink=2+Math.random()*4}
  c.blink=Math.max(0,c.blink-dt*6);
  // skin modes
  waveTimer-=dt;if(waveTimer<=0){waveT=3.5;waveTimer=10+Math.random()*8}
  waveT=Math.max(0,waveT-dt);
  wave+=((waveT>0?1:0)-wave)*Math.min(1,dt*1.4);
  const fd=Math.hypot(c.x-lantern.fx,c.y-lantern.fy);
  const wt=clamp(1.15-fd/(W*0.32),0,1);
  warm+=(wt-warm)*Math.min(1,dt*1.2);
  // bubbles
  bubbleTimer-=dt;
  if(bubbleTimer<=0){
    bubbleTimer=0.5+Math.random()*1.2;
    if(Math.random()<0.5)spawnB(lantern.x+(Math.random()-0.5)*lantern.lh*0.2,lantern.y-lantern.lh*0.85,1.5+Math.random()*2);
    else spawnB(W*Math.random(),H*(0.82+Math.random()*0.1),1+Math.random()*3);
  }
  if(c.jet>0.8&&Math.random()<0.6){const s=Math.sign(c.face)||1;spawnB(c.x+s*c.face*0,c.y+H*0.02,1+Math.random()*1.5)}
}

function drawCuttle(t){
  const L=Math.min(215*S,W*0.34);
  const ph=Math.max(0,wave),w=wave,wm=warm;
  let hue0=lerp(24,185,w*0.6);hue0=lerp(hue0,36,wm*0.8);
  const spd=Math.hypot(c.vx,c.vy)/S;
  const jet=c.jet;
  ctx.save();
  ctx.translate(c.x,c.y);
  ctx.scale(c.face*(1+jet*0.06),1-jet*0.08);
  ctx.rotate(c.tilt);
  // shadow-like soft glow when waving
  const hh=u=>0.19*L*Math.pow(Math.sin(Math.PI*(0.04+0.92*u)),0.5)*(1-0.28*u);
  const X0=-0.5*L,LEN=0.92*L;
  const sk=(l,s,a)=>hsl(hue0,s===undefined?50:s,l,a);

  // tentacles
  ctx.lineCap='round';ctx.lineJoin='round';
  const ax=0.4*L;
  for(let q=0;q<2;q++){
    const sgn=q?1:-1;
    let px=ax,py=sgn*0.012*L,ang=(0.02+sgn*0.03)*(1-jet*0.8);
    const n=14,len=0.8*L*(1-jet*0.15);
    ctx.strokeStyle=sk(38,45);
    for(let i=0;i<n;i++){
      ang+=Math.sin(t*1.6+q*2-i*0.45)*0.05+(i>9?0.05*sgn:0);
      const sl=len/n;
      const nx=px+Math.cos(ang)*sl,ny=py+Math.sin(ang)*sl;
      ctx.lineWidth=Math.max(1,(i>10?0.022:0.011)*L);
      ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();
      px=nx;py=ny;
    }
  }
  // arms
  for(let j=0;j<8;j++){
    const f=(j-3.5)/3.5;
    let px=ax-0.02*L,py=f*0.055*L+0.02*L;
    let ang=f*0.36*(1-jet*0.75)+0.1;
    const n=9,len=0.4*L*(1-0.18*Math.abs(f));
    for(let i=0;i<n;i++){
      ang+=Math.sin(t*2.3+j*0.8-i*0.55)*0.075+0.014;
      const sl=len/n,nx=px+Math.cos(ang)*sl,ny=py+Math.sin(ang)*sl;
      ctx.strokeStyle=sk(34+i*1.2+(f>0?5:0),48);
      ctx.lineWidth=Math.max(1,0.036*L*(1-i/n*0.85));
      ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();
      px=nx;py=ny;
    }
  }
  // fins
  const om=6+Math.min(6,spd*0.04)-jet*3,amp=(0.05-jet*0.03)*L;
  for(let side=-1;side<=1;side+=2){
    const top=[],base=[];
    for(let i=0;i<=22;i++){
      const u=0.04+i/22*0.82,e=Math.sin(Math.PI*(i/22))*0.9+0.1;
      const by=side*hh(u)*(side<0?0.97:0.82);
      const off=amp*(0.55+0.45*Math.sin(u*17-t*om+(side>0?1.5:0)))*e;
      const x=X0+u*LEN;
      base.push([x,by]);top.push([x,by+side*off]);
    }
    ctx.beginPath();ctx.moveTo(base[0][0],base[0][1]);
    for(const p of top)ctx.lineTo(p[0],p[1]);
    for(let i=base.length-1;i>=0;i--)ctx.lineTo(base[i][0],base[i][1]);
    ctx.closePath();ctx.fillStyle=sk(64+wm*8,55,0.55);ctx.fill();
    ctx.strokeStyle=sk(78,60,0.5);ctx.lineWidth=Math.max(0.8,0.006*L);
    ctx.beginPath();for(let i=0;i<top.length;i++){i?ctx.lineTo(top[i][0],top[i][1]):ctx.moveTo(top[i][0],top[i][1])}ctx.stroke();
  }
  // mantle path
  ctx.beginPath();
  for(let i=0;i<=26;i++){const u=i/26;const x=X0+u*LEN,y=-hh(u);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
  for(let i=26;i>=0;i--){const u=i/26;ctx.lineTo(X0+u*LEN,hh(u)*0.82)}
  ctx.closePath();
  const bgd=ctx.createLinearGradient(0,-0.19*L,0,0.17*L);
  bgd.addColorStop(0,sk(24+wm*8+w*6,50));bgd.addColorStop(0.6,sk(40+wm*8+w*8,52));bgd.addColorStop(1,sk(70+wm*8,45));
  ctx.fillStyle=bgd;ctx.fill();
  ctx.save();ctx.clip();
  // chromatophores
  const d=L*0.052;
  for(let ix=0;ix<=18;ix++){
    const x=X0+ix*d,u=(x-X0)/LEN;if(u>1)break;
    const hgt=hh(u);
    for(let iy=-5;iy<=4;iy++){
      const y=iy*d+(ix%2)*d*0.5;
      if(y<-hgt*0.95||y>hgt*0.8)continue;
      const v=y/L;
      const n1=Math.sin(u*7+t*0.4+Math.sin(v*14+t*0.3)*2)*0.5+0.5;
      const n2=Math.sin(v*30-u*4-t*0.5)*0.5+0.5;
      const mott=n1*n2*1.2;
      const stripe=0.5+0.5*Math.sin(u*9-t*4+v*5);
      const val=clamp(lerp(mott,stripe,w),0,1);
      const r=d*(0.17+0.42*val);
      let hue=22+12*n1;
      const wh=190+140*(0.5+0.5*Math.sin(u*4-t*1.5));
      hue=lerp(hue,wh,w);
      hue=lerp(hue,34+14*Math.sin(u*6-t*2),wm*0.85);
      const sat=lerp(55,92,Math.max(w,wm*0.8));
      const li=lerp(16+10*val,38+26*stripe,Math.max(w,wm*0.6));
      ctx.fillStyle=hsl(hue,sat,li,0.85);
      ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
      if(hsh(ix,iy)>0.86){
        ctx.fillStyle='rgba(255,245,225,'+(0.65*(1-w*0.5)).toFixed(2)+')';
        ctx.beginPath();ctx.arc(x+d*0.25,y,d*0.13,0,7);ctx.fill();
      }
    }
  }
  // iridescent sheen
  ctx.globalCompositeOperation='lighter';
  const sx=X0+((t*0.12)%1.6-0.3)*LEN;
  const sg=ctx.createLinearGradient(sx-0.2*L,0,sx+0.2*L,0);
  sg.addColorStop(0,'rgba(80,255,220,0)');sg.addColorStop(0.5,'rgba(120,255,230,'+(0.12+0.1*w+0.05*wm)+')');sg.addColorStop(1,'rgba(255,120,220,0)');
  ctx.fillStyle=sg;ctx.fillRect(X0,-0.2*L,LEN,0.4*L);
  const bl=ctx.createLinearGradient(0,0.0*L,0,0.17*L);
  bl.addColorStop(0,'rgba(255,255,230,0)');bl.addColorStop(1,'rgba(255,240,210,'+(0.12+wm*0.15)+')');
  ctx.fillStyle=bl;ctx.fillRect(X0,0,LEN,0.2*L);
  ctx.globalCompositeOperation='source-over';
  ctx.restore();
  ctx.strokeStyle=sk(15,50,0.6);ctx.lineWidth=Math.max(0.8,0.006*L);
  ctx.beginPath();
  for(let i=0;i<=26;i++){const u=i/26,x=X0+u*LEN,y=-hh(u);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
  for(let i=26;i>=0;i--){const u=i/26;ctx.lineTo(X0+u*LEN,hh(u)*0.82)}
  ctx.closePath();ctx.stroke();

  // eye
  const ex=0.255*L,ey=-0.035*L,er=0.06*L;
  ctx.fillStyle=sk(20,50);ctx.beginPath();ctx.arc(ex,ey,er*1.18,0,7);ctx.fill();
  const ig=ctx.createRadialGradient(ex,ey,er*0.1,ex,ey,er);
  ig.addColorStop(0,'#fff0a8');ig.addColorStop(0.6,'#e7b13a');ig.addColorStop(1,'#a8671c');
  ctx.fillStyle=ig;ctx.beginPath();ctx.arc(ex,ey,er,0,7);ctx.fill();
  // gaze
  const gdx=c.lookx-c.x,gdy=c.looky-c.y,gd=Math.hypot(gdx,gdy)||1,sg2=c.face>=0?1:-1;
  const gx=gdx/gd*sg2*er*0.28,gy=gdy/gd*er*0.28;
  ctx.strokeStyle='#14090a';ctx.lineWidth=er*0.36;
  ctx.beginPath();
  const pts=[[-0.72,-0.25],[-0.4,0.3],[0,-0.08],[0.4,0.3],[0.72,-0.25]];
  pts.forEach((p,i)=>{const X=ex+gx+p[0]*er*0.85,Y=ey+gy+p[1]*er*0.85;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});
  ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.85)';ctx.beginPath();ctx.arc(ex+er*0.35,ey-er*0.4,er*0.14,0,7);ctx.fill();
  // lids
  ctx.save();ctx.beginPath();ctx.arc(ex,ey,er*1.02,0,7);ctx.clip();
  ctx.fillStyle=sk(26,50);
  const lid=0.22+c.blink*0.9;
  ctx.fillRect(ex-er*1.1,ey-er*1.1,er*2.2,er*2.2*lid*0.5+er*0.0);
  if(c.blink>0.05)ctx.fillRect(ex-er*1.1,ey+er*1.1-er*2.2*c.blink*0.5,er*2.2,er*2.2*c.blink*0.5);
  ctx.restore();
  ctx.strokeStyle=sk(14,50,0.8);ctx.lineWidth=Math.max(0.8,0.008*L);
  ctx.beginPath();ctx.arc(ex,ey,er*1.18,0,7);ctx.stroke();
  ctx.restore();
}

/* ---------- main loop ---------- */
let last=0;
function frame(ms){
  const t=ms/1000,dt=Math.min(0.05,last?t-last:0.016);last=t;
  update(dt,t);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.drawImage(bg,0,0,W,H);
  const flick=0.85+0.08*Math.sin(t*7)+0.05*Math.sin(t*13.3+1)+0.03*Math.sin(t*23);
  drawRays(t);
  drawKelp(t,false);
  drawLantern(t,flick);
  drawMotes(t,dt);
  drawCuttle(t);
  drawGlow(t,flick);
  drawKelp(t,true);
  drawBubbles(t,dt);
  // glass reflection
  const gl=ctx.createLinearGradient(0,0,W*0.5,H*0.5);
  gl.addColorStop(0,'rgba(255,255,255,0.07)');gl.addColorStop(0.5,'rgba(255,255,255,0.01)');gl.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=gl;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*0.5,0);ctx.lineTo(0,H*0.6);ctx.closePath();ctx.fill();
  requestAnimationFrame(frame);
}
window.addEventListener('pointermove',e=>{ptr.x=e.clientX;ptr.y=e.clientY;ptr.last=performance.now()/1000;ptr.inside=true},{passive:true});
document.addEventListener('pointerleave',()=>{ptr.inside=false});
window.addEventListener('blur',()=>{ptr.inside=false});
window.addEventListener('resize',resize);
resize();
requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Flicker-Flash Cuttlefish",
  "medium": "Canvas 2D + vanilla JS, with procedural chromatophore skin",
  "statement": "A curious cuttlefish drifts through a teal tank, rippling its skin from sandy mottling to waves of teal and magenta whenever something catches its interest. Its favorite thing is a sunken brass lantern that somehow still burns, and it will turn gold when it hovers close to the light. Move your cursor and it may come over to look."
}
```