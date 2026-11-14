Here's my piece — a patient little sundew-type hunter I call **Patient Pearls**, wearing lamplight like dew, with gnats and glowing motes drifting through its jar:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Patient Pearls</title>
<style>
  html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#071719;overscroll-behavior:none;}
  canvas{display:block;position:fixed;left:0;top:0;touch-action:pan-y;-webkit-user-select:none;user-select:none;}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(() => {
'use strict';
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

/* ---------- viewport / scene scaling (design space 300x400, bottom-anchored) ---------- */
let W=0,H=0,DPR=1,S=1,OX=0,OY=0;
let XMIN=14,XMAX=286,YMIN=18,YMAX=333;
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=Math.max(1,window.innerWidth); H=Math.max(1,window.innerHeight);
  canvas.width=Math.round(W*DPR); canvas.height=Math.round(H*DPR);
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  S=Math.min(W/300,H/400);
  OX=(W-300*S)/2; OY=H-400*S;
  XMIN=(14-OX)/S; XMAX=(W-14-OX)/S; YMIN=(18-OY)/S; YMAX=333;
}
addEventListener('resize',resize); resize();

/* ---------- small seeded rng for stable decor ---------- */
function mulberry(seed){let a=seed>>>0;return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const R=mulberry(987654321);
const angDiff=(a,b)=>((a-b+Math.PI*3)%(Math.PI*2))-Math.PI;

/* ---------- pre-rendered glow sprites ---------- */
function makeSprite(size,stops,extra){
  const c=document.createElement('canvas');c.width=c.height=size;
  const g=c.getContext('2d');
  const gr=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  for(const s of stops)gr.addColorStop(s[0],s[1]);
  g.fillStyle=gr;g.fillRect(0,0,size,size);
  if(extra)extra(g,size);
  return c;
}
const dewSprite=makeSprite(48,[
  [0,'rgba(255,255,255,0.95)'],[0.18,'rgba(255,250,230,0.85)'],[0.42,'rgba(255,232,180,0.38)'],
  [0.7,'rgba(255,214,150,0.12)'],[1,'rgba(255,205,140,0)']
],(g,s)=>{g.fillStyle='rgba(255,255,255,0.95)';g.beginPath();g.ellipse(s*0.36,s*0.32,s*0.10,s*0.07,-0.6,0,7);g.fill();});
const amberSprite=makeSprite(48,[
  [0,'rgba(255,240,210,0.95)'],[0.25,'rgba(255,205,120,0.7)'],[0.55,'rgba(255,160,70,0.28)'],[1,'rgba(255,150,60,0)']
],(g,s)=>{g.fillStyle='rgba(255,255,255,0.9)';g.beginPath();g.ellipse(s*0.36,s*0.32,s*0.09,s*0.06,-0.6,0,7);g.fill();});
const glowSprite=makeSprite(64,[
  [0,'rgba(255,235,200,0.85)'],[0.3,'rgba(255,215,150,0.30)'],[1,'rgba(255,200,120,0)']
]);
const moteSprite=makeSprite(32,[
  [0,'rgba(255,250,230,1)'],[0.35,'rgba(255,230,170,0.45)'],[1,'rgba(255,220,150,0)']
]);

/* ---------- world constants ---------- */
const BX=150,BY=347;
const stalkB={x:150,y:344},stalkC={x:134,y:270},stalkE={x:166,y:204};
function bez(t){const u=1-t;return{x:u*u*stalkB.x+2*u*t*stalkC.x+t*t*stalkE.x,y:u*u*stalkB.y+2*u*t*stalkC.y+t*t*stalkE.y};}
function blossomPos(i,t){
  const tt=[0.58,0.72,0.86,1][i];
  const p=bez(tt),p2=bez(Math.min(1,tt+0.02));
  let tx=p2.x-p.x,ty=p2.y-p.y;const d=Math.hypot(tx,ty)||1;tx/=d;ty/=d;
  const side=[1,-1,1,0][i];
  const sway=Math.sin(t*1.15+i*2.1)*2.4;
  return{x:p.x-ty*side*9+sway,y:p.y+tx*side*9+Math.abs(sway)*0.3,r:6};
}
function blossomTarget(t){const i=Math.floor(R()*4);const p=blossomPos(i,t);return{x:p.x,y:p.y,r:6,kind:'blossom'};}

/* ---------- leaves & droplets ---------- */
const leafDefs=[
  {a:-166,L:76,w:7.5,arc:-0.28},{a:-141,L:94,w:8.5,arc:0.16},{a:-117,L:86,w:9,arc:-0.12},
  {a:-96,L:102,w:9.5,arc:0.2},{a:-76,L:96,w:9.5,arc:-0.16},{a:-55,L:84,w:8.5,arc:0.24},
  {a:-32,L:68,w:7.5,arc:-0.2},{a:-11,L:50,w:6.5,arc:0.12},
  {a:-101,L:42,w:6,arc:0.08,bright:true},{a:-79,L:38,w:5.5,arc:-0.1,bright:true},{a:-90,L:47,w:6.5,arc:0.04,bright:true}
];
const leaves=leafDefs.map((d,i)=>({...d,i,seed:R()*10,bx:BX+(R()-0.5)*7,by:BY+(R()-0.5)*3,
  curl:0,curlDir:1,curlTarget:0,catches:[],tent:[],pts:[]}));
const droplets=[];
for(const leaf of leaves){
  for(let i=0;i<10;i++){
    const t=0.2+0.78*(i/9)+(R()-0.5)*0.02;
    const dr={kind:'droplet',leaf,t,r:1.8+R()*0.9+t*0.7,rCur:2,phase:R()*6.28,x:0,y:0,prey:null,spent:0,flash:0,rTarget:2};
    dr.rTarget=dr.r;dr.rCur=dr.r;
    leaf.tent.push({t,side:i%2?1:-1,len:4.5+t*7+R()*2.5,phase:R()*6.28,dr,x:0,y:0});
    droplets.push(dr);
  }
}

/* ---------- bugs ---------- */
let bugs=[];
function spawnBug(type){
  let x,y,tries=0;
  do{x=XMIN+8+R()*(XMAX-XMIN-16);y=YMIN+8+R()*(YMAX-YMIN-16);tries++;}
  while(Math.hypot(x-BX,y-(BY-45))<95&&tries<24);
  const gnat=type==='gnat';
  bugs.push({type,x,y,vx:(R()-0.5)*20,vy:(R()-0.5)*20,head:R()*6.283,
    speed:gnat?34+R()*14:20+R()*8,seekSpeed:gnat?58+R()*16:42+R()*8,
    size:gnat?1:1.35,wingPhase:R()*6.28,wingSpeed:gnat?24+R()*6:13+R()*3,
    jit:gnat?2.4:1.1,wf:0.5+R()*0.7,seed:R()*100,mode:'wander',target:null,seekT:0,sipT:0,
    caughtT:0,grace:1.6,struggle:0,dying:false,dieT:0,dead:false,thinkAt:R()*0.6,droplet:null});
}
['gnat','gnat','midge','gnat','gnat','midge'].forEach(spawnBug);
let respawnAt=1e9;

/* ---------- motes, bubbles, decor ---------- */
let motes=[];let pendingMotes=0;let moteAt=0;
function newMote(){return{x:XMIN+R()*(XMAX-XMIN),y:YMIN+R()*(YMAX-YMIN),vx:(R()-0.5)*6,vy:(R()-0.5)*6,
  seed:R()*100,r:0.8+R()*1.1,tw:0.5+R()*0.8,state:'drift',scale:1,absorbT:0,dr:null};}
for(let i=0;i<10;i++)motes.push(newMote());
const bubbles=[];
let pollenAt=6;

const soilDots=[];
for(let i=0;i<46;i++)soilDots.push({x:BX+(R()*2-1)*78,y:349+(R()*2-1)*9,r:0.5+R()*0.9,c:R()<0.5?'rgba(0,0,0,0.25)':'rgba(255,220,180,0.10)'});
const pebbles=[{x:116,y:346,r:4.5},{x:196,y:352,r:3.6},{x:172,y:345,r:2.8}];
const mossCols=['#3e6b34','#4a7c3f','#5d9448','#6fae54','#79b85e'];
const mossPatches=[];
function addMoss(x,y,sc){
  const circles=[],n=4+Math.floor(R()*3);
  for(let i=0;i<n;i++)circles.push({dx:(R()-0.5)*7*sc,dy:(R()-0.5)*3.4*sc,r:(1.2+R()*2.6)*sc,c:mossCols[Math.floor(R()*mossCols.length)]});
  mossPatches.push({x,y,circles,hl:{dx:(R()-0.5)*4,dy:-1.5-Math.abs(R())*1.5,r:0.7+R()*0.5}});
}
for(let i=0;i<13;i++){const x=BX+(R()*2-1)*76;const lim=10.5*Math.sqrt(Math.max(0,1-((x-BX)/82)**2));addMoss(x,349+(R()*2-1)*lim,0.8+R()*0.5);}
for(let i=0;i<5;i++)addMoss(BX+(R()*2-1)*80,356+R()*5,0.7+R()*0.4);
const shroom={x:106,y:346},sprout={x:193,y:347};
const blades=[
  {x0:-6,y0:404,cx:10,cy:340,x1:26,y1:300,w:8,ph:0},
  {x0:8,y0:404,cx:26,cy:352,x1:44,y1:318,w:6,ph:2},
  {x0:306,y0:404,cx:292,cy:346,x1:276,y1:312,w:7,ph:4},
  {x0:296,y0:404,cx:282,cy:360,x1:264,y1:330,w:5,ph:1}
];
const bokeh=[];
for(let i=0;i<6;i++)bokeh.push({fx:R(),fy:R()*0.7,r:0.06+R()*0.09,ph:R()*6.28,sp:0.02+R()*0.03});

/* ---------- pointer (passive; only sways the bugs) ---------- */
let px=-1e4,py=-1e4,pSpeed=0,pOn=false,lastPX=0,lastPY=0,lastPT=0;
function setPointer(cx,cy){
  const now=performance.now();
  const sx=(cx-OX)/S,sy=(cy-OY)/S;
  if(lastPT){const dtm=Math.max(1/240,(now-lastPT)/1000);const d=Math.hypot(sx-lastPX,sy-lastPY);pSpeed=pSpeed*0.6+Math.min(1600,d/dtm)*0.4;}
  lastPX=sx;lastPY=sy;lastPT=now;px=sx;py=sy;pOn=true;
}
addEventListener('pointermove',e=>setPointer(e.clientX,e.clientY),{passive:true});
addEventListener('pointerdown',e=>setPointer(e.clientX,e.clientY),{passive:true});
addEventListener('pointerleave',()=>{pOn=false;});
addEventListener('pointercancel',()=>{pOn=false;});
document.addEventListener('mouseleave',()=>{pOn=false;});

/* ---------- helpers ---------- */
function clampDome(o){
  const zoneDev=H*0.15,devY=OY+o.y*S;
  if(devY<zoneDev){
    const f=Math.max(0,Math.min(1,(zoneDev-devY)/zoneDev));
    const cx=W/2,maxOff=(W/2)*(1-0.85*f)+6,devX=OX+o.x*S;
    if(devX<cx-maxOff){o.x=(cx-maxOff-OX)/S;if(o.vx!==undefined)o.vx=Math.abs(o.vx)*0.5;}
    if(devX>cx+maxOff){o.x=(cx+maxOff-OX)/S;if(o.vx!==undefined)o.vx=-Math.abs(o.vx)*0.5;}
  }
}
function catchBug(b,dr){
  b.mode='caught';b.caughtT=0;b.struggle=1;b.dying=false;b.dieT=0;b.droplet=dr;
  dr.prey=b;dr.flash=1;
  const leaf=dr.leaf;
  if(!leaf.catches.length){
    leaf.curlTarget=0.95+R()*0.25;
    const M=leaf.pts[Math.min(14,Math.round(dr.t*14))];
    const s=(dr.x-M.x)*(-Math.sin(M.a))+(dr.y-M.y)*Math.cos(M.a);
    leaf.curlDir=s>=0?1:-1;
  }
  leaf.catches.push(dr);
}

/* ---------- update ---------- */
let shiver=0,nextShiver=9,curT=0;
function update(dt,t){
  pSpeed*=Math.exp(-1.6*dt);
  if(t>nextShiver){shiver=0.6;nextShiver=t+13+R()*16;}
  shiver=Math.max(0,shiver-dt*1.5);

  /* plant geometry (shared by drawing, droplets, catch checks) */
  for(const leaf of leaves){
    leaf.curl+=(leaf.curlTarget-leaf.curl)*Math.min(1,dt*1.7);
    const sway=Math.sin(t*0.8+leaf.seed)*0.012+(shiver>0?(R()-0.5)*shiver*0.09:0);
    leaf.pts.length=0;
    for(let i=0;i<=14;i++){
      const tt=i/14;
      const a=leaf.a+sway+leaf.arc*tt*tt+leaf.curl*leaf.curlDir*Math.pow(tt,1.5)*0.85;
      const d=leaf.L*tt;
      leaf.pts.push({x:leaf.bx+Math.cos(a)*d,y:leaf.by+Math.sin(a)*d,a});
    }
    for(const tn of leaf.tent){
      const M=leaf.pts[Math.min(14,Math.round(tn.t*14))];
      const pa=M.a+Math.PI/2;
      let tx=M.x+Math.cos(pa)*tn.side*tn.len;
      let ty=M.y+Math.sin(pa)*tn.side*tn.len;
      const idle=Math.sin(t*1.15+tn.phase)*(shiver>0?shiver*4:0.7);
      tx+=Math.cos(pa+Math.PI/2)*idle;ty+=Math.sin(pa+Math.PI/2)*idle;
      if(leaf.catches.length){
        const prey=leaf.catches[leaf.catches.length-1];
        const dx=prey.x-tx,dy=prey.y-ty,dd=Math.hypot(dx,dy)||1;
        const w=Math.exp(-((tn.t-prey.t)**2)/0.055)*leaf.curl;
        tx+=dx/dd*w*tn.len*1.7;ty+=dy/dd*w*tn.len*1.7;
      }
      tn.x=tx;tn.y=ty;tn.dr.x=tx;tn.dr.y=ty;
    }
  }
  for(const dr of droplets){
    if(dr.prey)dr.rTarget=dr.r*1.8;
    else if(dr.spent>0)dr.rTarget=dr.r*0.45;
    else dr.rTarget=dr.r;
    dr.rCur+=(dr.rTarget-dr.rCur)*Math.min(1,dt*4);
    if(dr.spent>0)dr.spent-=dt;
    if(dr.flash>0)dr.flash-=dt*1.4;
  }

  /* bugs */
  for(const b of bugs){
    if(b.dead)continue;
    if((b.mode==='wander'||b.mode==='seek')&&b.grace<=0){
      for(const dr of droplets){
        const dx=b.x-dr.x,dy=b.y-dr.y,rr=dr.rCur+b.size*1.6+1.6;
        if(dx*dx+dy*dy<rr*rr){
          if(!dr.prey&&dr.spent<=0){catchBug(b,dr);break;}
          if(dr.spent>0&&!dr.prey){const d=Math.hypot(dx,dy)||1;b.vx+=dx/d*300*dt;b.vy+=dy/d*300*dt;}
        }
      }
    }
    if(b.mode==='wander'&&t>b.thinkAt){
      b.thinkAt=t+0.35+R()*0.4;
      const dp=Math.hypot(b.x-BX,b.y-(BY-45));
      if(R()<(dp<175?0.6:0.05)){
        const avail=droplets.filter(d=>!d.prey&&d.spent<=0);
        if(avail.length){b.target=avail[Math.floor(R()*avail.length)];b.mode='seek';b.seekT=0;}
      }else if(R()<0.18){b.target=blossomTarget(t);b.mode='seek';b.seekT=0;}
    }
    let dvx=0,dvy=0;
    if(b.mode==='wander'){
      b.head+=Math.sin(t*b.wf+b.seed*7)*b.jit*dt*1.6+(R()-0.5)*b.jit*dt;
      const cx=(XMIN+XMAX)/2,cy=(YMIN+YMAX)/2-20;
      if(Math.hypot(b.x-cx,b.y-cy)>125)b.head+=angDiff(Math.atan2(cy-b.y,cx-b.x),b.head)*dt*0.9;
      const sp=b.speed*(0.6+0.4*Math.sin(t*0.9+b.seed*9));
      dvx=Math.cos(b.head)*sp;dvy=Math.sin(b.head)*sp;
    }else if(b.mode==='seek'){
      if(b.target.kind==='droplet'&&(b.target.prey||b.target.spent>0)){b.mode='wander';}
      else{
        const dx=b.target.x-b.x,dy=b.target.y-b.y,d=Math.hypot(dx,dy)||1;
        b.head+=angDiff(Math.atan2(dy,dx),b.head)*Math.min(1,dt*6.5);
        const sp=b.seekSpeed*(d<24?0.55:1);
        const wob=Math.sin(t*7+b.seed)*24;
        dvx=Math.cos(b.head)*sp-Math.sin(b.head)*wob;
        dvy=Math.sin(b.head)*sp+Math.cos(b.head)*wob;
        const rr=(b.target.kind==='droplet'?b.target.rCur:6)+b.size*1.4+2;
        if(d<rr){
          if(b.target.kind==='droplet'){if(!b.target.prey&&b.target.spent<=0)catchBug(b,b.target);else b.mode='wander';}
          else{b.mode='sip';b.sipT=1.2+R()*1.6;}
        }
        b.seekT+=dt;if(b.seekT>15){b.mode='wander';b.seekT=0;}
      }
    }else if(b.mode==='sip'){
      b.sipT-=dt;
      dvx=(b.target.x-b.x)*4;dvy=(b.target.y-1.5-b.y)*4;
      if(b.sipT<=0)b.mode='wander';
    }
    if(b.mode!=='caught'){b.vx+=(dvx-b.vx)*Math.min(1,dt*3.4);b.vy+=(dvy-b.vy)*Math.min(1,dt*3.4);}
    if(pOn){
      const dx=b.x-px,dy=b.y-py,d2=dx*dx+dy*dy;
      if(d2<3025&&d2>0.01){
        const d=Math.sqrt(d2),f=1-d/55,push=pSpeed*1.15+26;
        b.vx+=dx/d*push*f*dt*4.5;b.vy+=dy/d*push*f*dt*4.5;
      }
    }
    const damp=Math.exp(-2.4*dt);b.vx*=damp;b.vy*=damp;
    const sp2=Math.hypot(b.vx,b.vy),max=b.mode==='seek'?175:115;
    if(sp2>max){b.vx*=max/sp2;b.vy*=max/sp2;}
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<XMIN+4){b.x=XMIN+4;b.vx=Math.abs(b.vx)*0.5;}
    if(b.x>XMAX-4){b.x=XMAX-4;b.vx=-Math.abs(b.vx)*0.5;}
    if(b.y<YMIN+4){b.y=YMIN+4;b.vy=Math.abs(b.vy)*0.5;}
    if(b.y>YMAX){b.y=YMAX;b.vy=-Math.abs(b.vy)*0.5;}
    clampDome(b);
    const fl=b.mode==='caught'?Math.max(5,30-b.caughtT*3.2):b.wingSpeed*(b.mode==='sip'?0.35:1);
    b.wingPhase+=fl*dt;
    if(b.grace>0)b.grace-=dt;
  }
  bugs=bugs.filter(b=>!b.dead);
  if(bugs.length<6&&t>respawnAt){spawnBug(R()<0.55?'gnat':'midge');respawnAt=t+2+R()*4;}

  /* digestion */
  for(const dr of droplets){
    if(!dr.prey)continue;
    const b=dr.prey;
    b.caughtT+=dt;
    b.x=dr.x+Math.sin(t*31+b.seed*9)*0.9*b.struggle;
    b.y=dr.y-1+Math.cos(t*27+b.seed*5)*0.9*b.struggle;
    b.struggle=Math.max(0.1,1-b.caughtT/5.5);
    if(b.caughtT<6.2&&R()<dt*1.6)bubbles.push({x:dr.x+(R()-0.5)*4,y:dr.y-2,vy:-8-R()*8,r:0.5+R()*0.8,life:1});
    if(b.caughtT>6.2&&!b.dying){b.dying=true;b.dieT=0;
      for(let i=0;i<5;i++)bubbles.push({x:dr.x+(R()-0.5)*5,y:dr.y-2,vy:-9-R()*9,r:0.5+R()*0.9,life:1});}
    if(b.dying){
      b.dieT+=dt;
      if(b.dieT>1.4){
        b.dead=true;dr.prey=null;dr.spent=7;dr.flash=0.8;
        const li=dr.leaf.catches.indexOf(dr);
        if(li>=0)dr.leaf.catches.splice(li,1);
        if(!dr.leaf.catches.length)dr.leaf.curlTarget=0;
        respawnAt=Math.min(respawnAt,t+2.5+R()*4);
      }
    }
  }
  for(let i=bubbles.length-1;i>=0;i--){
    const b=bubbles[i];b.life-=dt*0.7;b.y+=b.vy*dt;b.x+=Math.sin(t*6+i)*4*dt;b.vy-=6*dt;
    if(b.life<=0)bubbles.splice(i,1);
  }

  /* motes */
  for(const m of motes){
    if(m.state==='gone')continue;
    if(m.state==='absorb'){
      m.absorbT+=dt;
      if(m.dr){m.x=m.dr.x;m.y=m.dr.y;}
      m.scale=Math.max(0,1-m.absorbT/0.45);
      if(m.absorbT>0.45){m.state='gone';if(m.dr)m.dr.flash=Math.max(m.dr.flash,0.8);}
      continue;
    }
    m.vx+=(Math.sin(t*0.4+m.seed*3)*5-m.vx)*dt*0.6+(R()-0.5)*8*dt;
    m.vy+=(Math.cos(t*0.33+m.seed*5)*4-5-m.vy)*dt*0.6;
    if(pOn){
      const dx=m.x-px,dy=m.y-py,d2=dx*dx+dy*dy;
      if(d2<2500&&d2>0.01){const d=Math.sqrt(d2),f=1-d/50,mv=pSpeed*1.6+30;
        m.vx+=dx/d*mv*f*dt*5;m.vy+=dy/d*mv*f*dt*5;}
    }
    m.x+=m.vx*dt;m.y+=m.vy*dt;
    if(m.x<XMIN){m.x=XMIN;m.vx*=-0.5;}if(m.x>XMAX){m.x=XMAX;m.vx*=-0.5;}
    if(m.y<YMIN){m.y=YMIN;m.vy*=-0.5;}if(m.y>YMAX+6){m.y=YMAX+6;m.vy*=-0.5;}
    clampDome(m);
    const sp=Math.hypot(m.vx,m.vy);if(sp>60){m.vx*=60/sp;m.vy*=60/sp;}
    for(const dr of droplets){
      if(!dr.prey&&dr.spent<=0){
        const dx=m.x-dr.x,dy=m.y-dr.y;
        if(dx*dx+dy*dy<(dr.rCur+2.5)**2){m.state='absorb';m.dr=dr;m.absorbT=0;break;}
      }
    }
  }
  if(motes.some(m=>m.state==='gone')){motes=motes.filter(m=>m.state!=='gone');pendingMotes++;}
  if(pendingMotes>0&&t>moteAt){motes.push(newMote());pendingMotes--;moteAt=t+4+R()*5;}

  /* drifting pollen from the top blossom */
  if(t>pollenAt){
    pollenAt=t+6+R()*7;
    const bp=blossomPos(3,t);
    motes.push({x:bp.x,y:bp.y,vx:(R()-0.5)*8,vy:3+R()*5,seed:R()*100,r:0.7+R()*0.5,tw:0.6+R()*0.8,state:'drift',scale:1,absorbT:0,dr:null});
    if(motes.length>16)motes.splice(0,motes.length-16);
  }
}

/* ---------- drawing ---------- */
function halfW(leaf,tt){
  return leaf.w*Math.pow(Math.sin(Math.PI*Math.min(1,tt*1.08)),0.75)*(1-0.22*tt)*(1-0.5*leaf.curl*tt*tt);
}
function drawPot(t){
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath();ctx.ellipse(150,396,102,9,0,0,6.29);ctx.fill();
  ctx.beginPath();
  ctx.moveTo(55,352);
  ctx.bezierCurveTo(58,376,70,395,92,397);
  ctx.lineTo(208,397);
  ctx.bezierCurveTo(230,395,242,376,245,352);
  ctx.closePath();
  const g=ctx.createLinearGradient(55,0,245,0);
  g.addColorStop(0,'#b26b49');g.addColorStop(0.45,'#8a4f38');g.addColorStop(1,'#57301f');
  ctx.fillStyle=g;ctx.fill();
  ctx.fillStyle='rgba(255,215,170,0.08)';
  ctx.beginPath();ctx.moveTo(60,354);ctx.bezierCurveTo(64,374,74,390,92,393);ctx.lineTo(120,393);
  ctx.bezierCurveTo(100,388,88,372,84,354);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.ellipse(150,352,95,16,0,0,6.29);ctx.fillStyle='#a9613f';ctx.fill();
  ctx.beginPath();ctx.ellipse(150,351,86,13,0,0,6.29);ctx.fillStyle='#221410';ctx.fill();
  const sg=ctx.createRadialGradient(146,346,2,150,349,86);
  sg.addColorStop(0,'#4c3524');sg.addColorStop(1,'#2a1a11');
  ctx.beginPath();ctx.ellipse(150,349,82,11.5,0,0,6.29);ctx.fillStyle=sg;ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath();ctx.ellipse(150,350,42,6,0,0,6.29);ctx.fill();
  for(const d of soilDots){ctx.fillStyle=d.c;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,6.29);ctx.fill();}
  for(const p of pebbles){
    ctx.fillStyle='#6f6875';ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*0.7,0,0,6.29);ctx.fill();
    ctx.fillStyle='rgba(255,230,200,0.25)';ctx.beginPath();ctx.ellipse(p.x-p.r*0.25,p.y-p.r*0.3,p.r*0.45,p.r*0.28,0,0,6.29);ctx.fill();
  }
  for(const mp of mossPatches){
    for(const c of mp.circles){ctx.fillStyle=c.c;ctx.beginPath();ctx.arc(mp.x+c.dx,mp.y+c.dy,c.r,0,6.29);ctx.fill();}
    ctx.fillStyle='rgba(200,255,160,0.4)';ctx.beginPath();ctx.arc(mp.x+mp.hl.dx,mp.y+mp.hl.dy,mp.hl.r,0,6.29);ctx.fill();
  }
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){const mp=mossPatches[i*3];if(mp){ctx.globalAlpha=0.4+0.3*Math.sin(t*2+i);const s=3.2;ctx.drawImage(dewSprite,mp.x-s/2,mp.y-s/2,s,s);}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  const sh=shroom;
  ctx.fillStyle='#e6d7bd';
  ctx.beginPath();ctx.moveTo(sh.x-2.2,sh.y+3);ctx.quadraticCurveTo(sh.x-2.6,sh.y-1,sh.x-1.4,sh.y-2.5);
  ctx.lineTo(sh.x+1.4,sh.y-2.5);ctx.quadraticCurveTo(sh.x+2.6,sh.y-1,sh.x+2.2,sh.y+3);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ead9c2';ctx.beginPath();ctx.arc(sh.x,sh.y-2.5,4.6,Math.PI,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(190,140,110,0.7)';
  ctx.beginPath();ctx.arc(sh.x-1.6,sh.y-4.6,0.7,0,6.29);ctx.fill();
  ctx.beginPath();ctx.arc(sh.x+1.4,sh.y-5.6,0.55,0,6.29);ctx.fill();
  ctx.strokeStyle='#5d9448';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(sprout.x,sprout.y+2);ctx.quadraticCurveTo(sprout.x,sprout.y-3,sprout.x-1,sprout.y-6);ctx.stroke();
  ctx.fillStyle='#6fae54';
  ctx.beginPath();ctx.ellipse(sprout.x-2.4,sprout.y-6.5,2.6,1.3,-0.7,0,6.29);ctx.fill();
  ctx.beginPath();ctx.ellipse(sprout.x+2.2,sprout.y-5.5,2.4,1.2,0.6,0,6.29);ctx.fill();
}
function drawLeaves(t){
  for(const leaf of leaves){
    const pts=leaf.pts,n=pts.length-1;
    ctx.beginPath();
    for(let i=0;i<=n;i++){
      const p=pts[i],hw=halfW(leaf,i/n),pa=p.a+Math.PI/2;
      const x=p.x+Math.cos(pa)*hw,y=p.y+Math.sin(pa)*hw;
      if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
    }
    for(let i=n;i>=0;i--){
      const p=pts[i],hw=halfW(leaf,i/n),pa=p.a+Math.PI/2;
      ctx.lineTo(p.x-Math.cos(pa)*hw,p.y-Math.sin(pa)*hw);
    }
    ctx.closePath();
    const b=pts[0],e=pts[n],fl=leaf.catches.length>0;
    const g=ctx.createLinearGradient(b.x,b.y,e.x,e.y);
    if(leaf.bright){g.addColorStop(0,'#5d9448');g.addColorStop(0.6,fl?'#c05a4a':'#a04a48');g.addColorStop(1,fl?'#ff8a70':'#e0685c');}
    else{g.addColorStop(0,'#3d6b34');g.addColorStop(0.55,fl?'#a03a3a':'#6d3a3f');g.addColorStop(1,fl?'#e86a5a':'#c25a50');}
    ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();ctx.moveTo(b.x,b.y);
    for(let i=1;i<=n;i++)ctx.lineTo(pts[i].x,pts[i].y);
    ctx.strokeStyle='rgba(30,16,16,0.45)';ctx.lineWidth=1.3;ctx.stroke();
    ctx.beginPath();
    for(const tn of leaf.tent){
      const M=pts[Math.min(14,Math.round(tn.t*14))],pa=M.a+Math.PI/2;
      const cxp=(M.x+tn.x)/2+Math.cos(pa)*tn.side*2,cyp=(M.y+tn.y)/2+Math.sin(pa)*tn.side*2;
      ctx.moveTo(M.x,M.y);ctx.quadraticCurveTo(cxp,cyp,tn.x,tn.y);
    }
    ctx.strokeStyle='rgba(222,98,86,0.85)';ctx.lineWidth=1.05;ctx.stroke();
  }
}
function drawDroplets(t){
  ctx.globalCompositeOperation='lighter';
  for(const dr of droplets){
    const pulse=1+0.13*Math.sin(t*2.3+dr.phase);
    const s=dr.rCur*2.6*pulse*(dr.spent>0?0.55:1);
    const jit=shiver>0?(R()-0.5)*shiver*2.4:0;
    ctx.globalAlpha=dr.spent>0?0.32:0.8;
    ctx.drawImage(dr.prey?amberSprite:dewSprite,dr.x+jit-s/2,dr.y+jit-s/2,s,s);
    if(dr.flash>0){
      const fs=dr.rCur*7*(0.5+dr.flash);
      ctx.globalAlpha=Math.min(1,dr.flash)*0.8;
      ctx.drawImage(glowSprite,dr.x-fs/2,dr.y-fs/2,fs,fs);
    }
    const sp=Math.sin(t*1.8+dr.phase*17);
    if(sp>0.985&&dr.spent<=0&&!dr.prey){
      const a=(sp-0.985)/0.015,L=dr.rCur*3.4;
      ctx.globalAlpha=a;ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=0.7;
      ctx.beginPath();
      ctx.moveTo(dr.x-L,dr.y);ctx.lineTo(dr.x+L,dr.y);
      ctx.moveTo(dr.x,dr.y-L);ctx.lineTo(dr.x,dr.y+L);
      ctx.stroke();
    }
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawBlossom(x,y,s,t,i){
  const rot=Math.sin(t*0.9+i)*0.2;
  for(let k=0;k<5;k++){
    const a=rot+k*Math.PI*2/5;
    ctx.save();ctx.translate(x+Math.cos(a)*2.6*s,y+Math.sin(a)*2.6*s);ctx.rotate(a);
    ctx.fillStyle='rgba(247,239,246,0.95)';
    ctx.beginPath();ctx.ellipse(0,0,2.5*s,1.35*s,0,0,6.29);ctx.fill();ctx.restore();
  }
  ctx.fillStyle='#d98aa0';ctx.beginPath();ctx.arc(x,y,1.25*s,0,6.29);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-0.3,y-0.3,0.5*s,0,6.29);ctx.fill();
}
function drawStalk(t){
  ctx.beginPath();ctx.moveTo(stalkB.x,stalkB.y);
  for(let i=1;i<=20;i++){const p=bez(i/20);ctx.lineTo(p.x,p.y);}
  const g=ctx.createLinearGradient(stalkB.x,stalkB.y,stalkE.x,stalkE.y);
  g.addColorStop(0,'#4a7a3a');g.addColorStop(1,'#7a4a3a');
  ctx.strokeStyle=g;ctx.lineWidth=2.2;ctx.lineCap='round';ctx.stroke();
  for(let i=0;i<4;i++){
    const bp=blossomPos(i,t),sc=i===3?1.35:1;
    if(i===3){
      ctx.globalCompositeOperation='lighter';
      const gs=22+6*Math.sin(t*2.1);
      ctx.globalAlpha=0.30+0.18*Math.sin(t*2.1);
      ctx.drawImage(glowSprite,bp.x-gs/2,bp.y-gs/2,gs,gs);
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }
    drawBlossom(bp.x,bp.y,sc,t,i);
  }
}
function drawMotes(t){
  ctx.globalCompositeOperation='lighter';
  for(const m of motes){
    const tw=0.35+0.65*(0.5+0.5*Math.sin(t*m.tw*2+m.seed*8));
    const s=m.r*6*m.scale;
    ctx.globalAlpha=tw;
    ctx.drawImage(moteSprite,m.x-s/2,m.y-s/2,s,s);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawBubbles(){
  ctx.globalCompositeOperation='lighter';
  for(const b of bubbles){
    ctx.globalAlpha=Math.max(0,b.life)*0.7;
    ctx.strokeStyle='rgba(255,230,180,0.8)';ctx.lineWidth=0.6;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.29);ctx.stroke();
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawBugs(t){
  for(const b of bugs){
    ctx.save();ctx.translate(b.x,b.y);
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=0.16;
    const hs=11*b.size;
    ctx.drawImage(glowSprite,-hs/2,-hs/2,hs,hs);
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    let scale=1,alpha=1;
    if(b.dying){scale=Math.max(0.15,1-b.dieT/1.4);alpha=Math.max(0,1-b.dieT/1.2);}
    ctx.rotate(b.head);ctx.scale(scale,scale);ctx.globalAlpha=alpha;
    const s=b.size;
    const flap=Math.sin(b.wingPhase)*(b.mode==='caught'?0.9*b.struggle:0.75);
    const wamp=b.mode==='caught'?(0.25+0.75*b.struggle):(b.mode==='sip'?0.2:1);
    for(const sd of[-1,1]){
      ctx.save();ctx.translate(s*0.4,sd*s*0.8);ctx.rotate(sd*(0.45+flap*0.7*wamp));
      ctx.fillStyle='rgba(238,238,232,0.30)';
      ctx.beginPath();ctx.ellipse(0,0,s*2.7,s*1.05,0,0,6.29);ctx.fill();ctx.restore();
    }
    if(b.type==='midge'){
      ctx.strokeStyle='rgba(20,14,10,0.5)';ctx.lineWidth=0.5;
      for(let l=0;l<3;l++){ctx.beginPath();ctx.moveTo(s*0.6-l*s*0.5,s*0.4);ctx.lineTo(s*1.4-l*s*0.7,s*0.4+s*2.2);ctx.stroke();}
    }
    ctx.fillStyle='#241a12';
    ctx.beginPath();ctx.ellipse(0,0,s*2.3,s*1.15,0,0,6.29);ctx.fill();
    ctx.fillStyle='rgba(255,215,160,0.35)';
    ctx.beginPath();ctx.ellipse(-s*0.3,-s*0.45,s*1.5,s*0.55,0,0,6.29);ctx.fill();
    ctx.fillStyle='#171008';ctx.beginPath();ctx.arc(s*2.1,0,s*0.85,0,6.29);ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha=1;
}
function drawForeground(t){
  ctx.lineCap='round';
  for(const bl of blades){
    const sway=Math.sin(t*0.65+bl.ph)*3;
    ctx.strokeStyle='#0a1b15';ctx.lineWidth=bl.w;
    ctx.beginPath();ctx.moveTo(bl.x0,bl.y0);ctx.quadraticCurveTo(bl.cx+sway,bl.cy,bl.x1+sway*1.6,bl.y1);ctx.stroke();
    ctx.strokeStyle='rgba(90,140,80,0.25)';ctx.lineWidth=bl.w*0.4;
    ctx.beginPath();ctx.moveTo(bl.x0+1,bl.y0);ctx.quadraticCurveTo(bl.cx+sway+1,bl.cy,bl.x1+sway*1.6,bl.y1);ctx.stroke();
  }
}
function draw(t){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0d2c28');g.addColorStop(0.5,'#11382f');g.addColorStop(1,'#07191a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const gg=ctx.createRadialGradient(W*0.5,H*0.30,0,W*0.5,H*0.30,Math.max(W,H)*0.8);
  gg.addColorStop(0,'rgba(255,206,138,0.20)');gg.addColorStop(0.45,'rgba(255,190,120,0.06)');gg.addColorStop(1,'rgba(255,180,110,0)');
  ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';
  for(const b of bokeh){
    const x=(b.fx+Math.sin(t*b.sp+b.ph)*0.02)*W,y=(b.fy+Math.cos(t*b.sp*0.8+b.ph)*0.015)*H,r=b.r*Math.max(W,H);
    ctx.globalAlpha=0.05;ctx.drawImage(glowSprite,x-r,y-r,r*2,r*2);
  }
  const flick=0.09+0.02*Math.sin(t*6.1)+0.012*Math.sin(t*16.7),bw=W*0.15;
  const bg2=ctx.createLinearGradient(0,0,0,H);
  bg2.addColorStop(0,'rgba(255,226,170,'+flick.toFixed(3)+')');bg2.addColorStop(1,'rgba(255,226,170,0)');
  ctx.fillStyle=bg2;
  ctx.beginPath();
  ctx.moveTo(W*0.5-bw*0.35,-6);ctx.lineTo(W*0.5+bw*0.35,-6);
  ctx.lineTo(W*0.5+bw*2.1,H*0.9);ctx.lineTo(W*0.5-bw*2.1,H*0.9);
  ctx.closePath();ctx.fill();
  ctx.globalCompositeOperation='source-over';

  ctx.setTransform(DPR*S,0,0,DPR*S,DPR*OX,DPR*OY);
  drawPot(t);
  drawMotes(t);
  drawLeaves(t);
  drawDroplets(t);
  drawStalk(t);
  drawBubbles();
  drawBugs(t);
  drawForeground(t);

  ctx.setTransform(DPR,0,0,DPR,0,0);
  const vg=ctx.createRadialGradient(W/2,H*0.44,Math.min(W,H)*0.32,W/2,H*0.5,Math.max(W,H)*0.85);
  vg.addColorStop(0,'rgba(2,8,8,0)');vg.addColorStop(1,'rgba(2,8,8,0.62)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}

/* ---------- main loop ---------- */
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,Math.max(0.001,(now-last)/1000));
  last=now;curT=now/1000;
  update(dt,curT);
  draw(curT);
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
  "title": "Patient Pearls",
  "statement": "A slow little hunter that strings lamplight into pearls along every leaf. It waits and glitters; when a gnat trusts a pearl, it folds around it like a secret, digests quietly, and goes back to glowing."
}
```