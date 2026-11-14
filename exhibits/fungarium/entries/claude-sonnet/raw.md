```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;overflow:hidden;background:#0a0814}
canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W,H,dpr,u,ox,oy,bgC,fgC,vig;
const TAU=Math.PI*2;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

const pal=[[255,196,107],[255,126,182],[107,240,255],[190,255,140],[196,164,255],[255,244,214]];
function glowSprite(c){
  const s=64,k=document.createElement('canvas');k.width=k.height=s;
  const g=k.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');
  gr.addColorStop(.18,`rgba(${c[0]},${c[1]},${c[2]},.85)`);
  gr.addColorStop(.5,`rgba(${c[0]},${c[1]},${c[2]},.22)`);
  gr.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`);
  g.fillStyle=gr;g.fillRect(0,0,s,s);return k;
}
const sprites=pal.map(glowSprite);

function surf(x){return 318+6*Math.sin(x*.035+1)+3*Math.sin(x*.09)-10*Math.exp(-Math.pow((x-150)/110,2));}
const stemX=(m,v)=>m.bend*m.H*v*v;
const hwF=v=>5+2*(1-v)+9*Math.exp(-v*14)+2*Math.exp(-(1-v)*10);

function pathLen(pts){let L=0;pts.cum=[0];for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);pts.cum.push(L);}pts.total=L;}
function pointAt(p,f){
  const T=f*p.total;let i=1;
  while(i<p.length-1&&p.cum[i]<T)i++;
  const a=p[i-1],b=p[i],sl=p.cum[i]-p.cum[i-1]||1,k=Math.max(0,Math.min(1,(T-p.cum[i-1])/sl));
  return{x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};
}

function genVeins(m,r){
  const paths=[];
  const n=5;
  for(let i=0;i<n;i++){
    let x=m.x,y=m.y+4,a=Math.PI/2+(i-(n-1)/2)*.6+(r()-.5)*.3;
    const pts=[{x,y}];const steps=9+Math.floor(r()*7);
    for(let j=0;j<steps;j++){
      a+=(r()-.5)*.7;a+=(Math.PI/2-a)*.1;
      x+=Math.cos(a)*(7+r()*5);y+=Math.sin(a)*(7+r()*5);
      if(y>396)break;
      pts.push({x,y});
      if(r()<.2&&j>1){
        const b=[{x,y}];let bx=x,by=y,ba=a+(r()<.5?-1:1)*(.7+r()*.6);
        const bs=3+Math.floor(r()*4);
        for(let k=0;k<bs;k++){ba+=(r()-.5)*.6;bx+=Math.cos(ba)*(6+r()*4);by+=Math.sin(ba)*(6+r()*4);if(by>396)break;b.push({x:bx,y:by});}
        if(b.length>2){pathLen(b);b.d=r();b.thin=true;paths.push(b);}
      }
    }
    pathLen(pts);pts.d=r();paths.push(pts);
  }
  return paths;
}

const ringDefs={
  main:[[105,20,-.25,.35,3],[88,30,.35,-.5,3],[122,13,.08,.28,3]],
  l:[[100,22,-.3,.4,2],[86,30,.3,-.45,2]],
  r:[[104,20,.3,-.38,2],[90,28,-.35,.5,2]],
  t:[[110,22,-.2,.5,2]]
};

function makeM(o,seed,defs){
  const r=rng(seed);
  const m=Object.assign({ph:r()*TAU,sw:0,lean:0,flare:0,pp:0},o);
  m.y=surf(m.x)+4;
  m.xc=m.bend*m.H;m.tilt=Math.atan(2*m.bend);
  m.cx=m.xc;m.cy=-m.H-18;
  m.osz=Math.pow(1/m.s,.3);
  m.stars=[];
  for(let i=0;i<18;i++){
    const s=r()*1.6-.8,fy=.15+r()*.7;
    m.stars.push({x:m.R*s*(3-s*s)/2,y:-m.Hc*(1-s*s)*fy,r:(i%5==0?2.1:.8+r()*1.2),ph:r()*TAU,sp:.8+r()*2,big:i%5==0});
  }
  const es={};m.edges=[];
  m.stars.forEach((a,i)=>{
    const ds=m.stars.map((b,j)=>({j,d:Math.hypot(a.x-b.x,a.y-b.y)})).filter(e=>e.j!==i&&e.d<m.R*.5).sort((p,q)=>p.d-q.d).slice(0,2);
    ds.forEach(e=>{const k=Math.min(i,e.j)+'-'+Math.max(i,e.j);if(!es[k]){es[k]=1;m.edges.push([i,e.j]);}});
  });
  m.tass=[];
  for(let k=0;k<9;k++)m.tass.push({phi:Math.PI*(.1+.8*k/8),len:9+r()*10,ph:r()*TAU,ci:Math.floor(r()*5)});
  m.speck=[];
  for(let i=0;i<14;i++)m.speck.push({v:.06+r()*.88,off:r()*1.6-.8,ph:r()*TAU});
  m.rings=defs.map(d=>{
    const rg={rx:d[0],ry:d[1],tilt:d[2],sp:d[3],orbs:[]};
    for(let i=0;i<d[4];i++){
      const life=22+r()*20;
      rg.orbs.push({a:TAU*i/d[4]+r()*.6,size:3.2+r()*3,ci:Math.floor(r()*5),life,age:r()*(life+3),moon:r()<.4,saturn:r()<.35,ph:r()*TAU,launched:false});
    }
    return rg;
  });
  m.veins=genVeins(m,r);
  return m;
}

const M=[
  makeM({x:66,s:.5,bend:-.22,H:165,R:76,Hc:52,off:3,per:11},11,ringDefs.l),
  makeM({x:238,s:.62,bend:.16,H:165,R:76,Hc:52,off:7,per:12.5},22,ringDefs.r),
  makeM({x:150,s:1,bend:.05,H:165,R:76,Hc:52,off:0,per:9},33,ringDefs.main),
  makeM({x:186,s:.28,bend:.12,H:165,R:76,Hc:52,off:5,per:8},44,ringDefs.t)
];
// connect small ones to the main one underground
(function(){
  const main=M[2],r=rng(77);
  [M[0],M[1],M[3]].forEach(o=>{
    const pts=[];
    for(let k=0;k<=10;k++){
      const f=k/10;
      pts.push({x:o.x+(main.x-o.x)*f+(r()-.5)*3,y:(o.y+main.y)/2+10+(o.s<.4?10:0)+24*Math.sin(Math.PI*f)+(r()-.5)*4+(o.y-main.y)*(.5-f)*-1+0});
    }
    pts[0]={x:o.x,y:o.y+4};pts[10]={x:main.x,y:main.y+4};
    pathLen(pts);pts.d=r();o.veins.push(pts);
  });
})();

// particles
const parts=[],MAXP=170;
function spawn(x,y,ci,vx,vy){
  if(parts.length>=MAXP)parts.shift();
  parts.push({x,y,vx:vx||0,vy:vy||0,age:0,life:5+Math.random()*6,ci,sz:1.2+Math.random()*2.2,ph:Math.random()*TAU});
}
const motes=[];
for(let i=0;i<28;i++)motes.push({x:Math.random()*300,y:Math.random()*400,vy:2+Math.random()*4,ph:Math.random()*TAU,s:.8+Math.random()*1.5});

const ptr={x:0,y:0,on:false};
window.addEventListener('pointermove',e=>{ptr.x=(e.clientX-ox)/u;ptr.y=(e.clientY-oy)/u;ptr.on=true;});
window.addEventListener('pointerleave',()=>{ptr.on=false;});
document.addEventListener('mouseleave',()=>{ptr.on=false;});

function toWorld(m,lx,ly){const c=Math.cos(m.sw),s=Math.sin(m.sw);return[m.x+m.s*(lx*c-ly*s),m.y+m.s*(lx*s+ly*c)];}
function tip(m,k,t){
  const q=m.tass[k];const rx=m.R*Math.cos(q.phi),ry=15*Math.sin(q.phi);
  return{x0:rx,y0:ry,x:rx+Math.sin(t*1.4+q.ph)*2.5,y:ry+q.len+Math.cos(t*1.1+q.ph)}
}
function flareOf(ph){if(ph<.62)return 0;if(ph<.7)return(ph-.62)/.08;return Math.exp(-(ph-.7)*7);}

function orbState(rg,o){
  let k=1,al=1,lift=0,sz=1;
  if(o.age<3){const e=o.age/3,s=e*e*(3-2*e);k=.25+.75*s;sz=s;al=s;}
  else if(o.age>o.life){const q=Math.min(1,(o.age-o.life)/4.5);k=1+.9*q*q;lift=-q*q*70;al=1-q;sz=1-.3*q;}
  const ex=rg.rx*k*Math.cos(o.a),ey=rg.ry*k*Math.sin(o.a);
  const c=Math.cos(rg.tilt),s=Math.sin(rg.tilt);
  return{x:ex*c-ey*s,y:ex*s+ey*c+lift,z:Math.sin(o.a),al,sz};
}

function update(t,dt){
  for(const m of M){
    const target=ptr.on?Math.max(-1,Math.min(1,(ptr.x-m.x)/220))*.035:0;
    m.lean+=(target-m.lean)*Math.min(1,dt*2);
    m.sw=Math.sin(t*.5+m.ph)*.012+m.lean;
    m.pp=((t+m.off)/m.per)%1;
    m.flare=flareOf(m.pp);
    const rate=(.18*(.4+m.s))*(1+m.flare*10);
    for(let k=0;k<9;k++){
      if(Math.random()<rate*dt){
        const p=tip(m,k,t),c=Math.cos(m.tilt),s=Math.sin(m.tilt);
        const lx=m.xc+c*p.x-s*p.y,ly=-m.H+s*p.x+c*p.y;
        const w=toWorld(m,lx,ly);
        spawn(w[0],w[1],m.tass[k].ci,(Math.random()-.5)*4,10+Math.random()*8);
      }
    }
    for(const rg of m.rings)for(const o of rg.orbs){
      o.a+=rg.sp*dt;o.age+=dt;
      if(!o.launched&&o.age>o.life){
        o.launched=true;
        const st=orbState(rg,o);const w=toWorld(m,m.cx+st.x,m.cy+st.y);
        for(let i=0;i<5;i++)spawn(w[0],w[1],o.ci,(Math.random()-.5)*14,(Math.random()-.5)*14);
      }
      if(o.age>o.life+4.5){o.age=0;o.launched=false;o.ci=Math.floor(Math.random()*5);o.life=22+Math.random()*20;}
    }
  }
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.age+=dt;
    if(p.age>p.life){parts.splice(i,1);continue;}
    p.vy+=-4*dt;p.vy*=(1-.4*dt);
    p.vx+=Math.sin(p.age*1.7+p.ph)*10*dt;p.vx*=(1-.5*dt);
    if(ptr.on){const dx=p.x-ptr.x,dy=p.y-ptr.y,d=Math.hypot(dx,dy);if(d<45&&d>.1){const f=60*(1-d/45)*dt;p.vx+=dx/d*f;p.vy+=dy/d*f;}}
    p.x+=p.vx*dt;p.y+=p.vy*dt;
  }
  for(const q of motes){
    q.y-=q.vy*dt;q.x+=Math.sin(t*.4+q.ph)*3*dt;
    if(q.y<-10){q.y=410;q.x=Math.random()*300;}
  }
}

function drawOrb(m,o,t,st){
  const px=m.cx+st.x,py=m.cy+st.y;
  const sc=(1+.28*st.z)*st.sz*o.size*m.osz;
  if(sc<.05)return;
  const c=pal[o.ci];
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*st.al;
  ctx.drawImage(sprites[o.ci],px-sc*3,py-sc*3,sc*6,sc*6);
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=st.al;
  if(o.saturn){
    ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},.75)`;ctx.lineWidth=.6;
    ctx.beginPath();ctx.ellipse(px,py,sc*1.9,sc*.55,-.4,Math.PI,TAU);ctx.stroke();
  }
  const g=ctx.createRadialGradient(px-sc*.35,py-sc*.35,0,px,py,sc);
  g.addColorStop(0,'rgba(255,255,255,.95)');
  g.addColorStop(.35,`rgb(${c[0]},${c[1]},${c[2]})`);
  g.addColorStop(1,`rgb(${c[0]*.3|0},${c[1]*.3|0},${c[2]*.3|0})`);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,sc,0,TAU);ctx.fill();
  if(o.saturn){
    ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},.9)`;ctx.lineWidth=.6;
    ctx.beginPath();ctx.ellipse(px,py,sc*1.9,sc*.55,-.4,0,Math.PI);ctx.stroke();
  }
  if(o.moon){
    const mx=px+Math.cos(t*2+o.ph)*sc*2.6,my=py+Math.sin(t*2+o.ph)*sc*1.1;
    ctx.fillStyle='rgba(255,250,235,.9)';ctx.beginPath();ctx.arc(mx,my,Math.max(.4,sc*.3),0,TAU);ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawRings(m,t,front){
  const fl=m.flare;
  for(const rg of m.rings){
    ctx.beginPath();
    ctx.ellipse(m.cx,m.cy,rg.rx,rg.ry,rg.tilt,front?0:Math.PI,front?Math.PI:TAU);
    ctx.strokeStyle=`rgba(200,190,255,${.14+.35*fl})`;ctx.lineWidth=.7;ctx.stroke();
    for(const o of rg.orbs){const st=orbState(rg,o);if((st.z>=0)===front)drawOrb(m,o,t,st);}
  }
}

function domePath(R,Hc){
  ctx.beginPath();ctx.moveTo(-R,0);
  ctx.bezierCurveTo(-R,-Hc*1.3333,R,-Hc*1.3333,R,0);
  ctx.quadraticCurveTo(0,7,-R,0);
}

function drawMushroom(m,t){
  const H=m.H,fl=m.flare,ph=m.pp;
  ctx.save();
  ctx.translate(m.x,m.y);ctx.scale(m.s,m.s);ctx.rotate(m.sw);
  drawRings(m,t,false);

  const sv=.55,sx=stemX(m,sv),sy=-H*sv,srx=hwF(sv)+16;
  const skw=Math.sin(t*.8+m.ph)*.05+m.tilt*.3;
  ctx.save();ctx.translate(sx,sy);ctx.rotate(skw);
  ctx.beginPath();ctx.ellipse(0,0,srx,4,0,Math.PI,TAU);
  ctx.strokeStyle='rgba(225,205,255,.35)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore();

  // stem
  ctx.beginPath();
  const N=24;
  for(let i=0;i<=N;i++){const v=i/N;const x=stemX(m,v)-hwF(v);i?ctx.lineTo(x,-H*v):ctx.moveTo(x,-H*v);}
  for(let i=N;i>=0;i--){const v=i/N;ctx.lineTo(stemX(m,v)+hwF(v),-H*v);}
  ctx.closePath();
  const xs=stemX(m,.5);
  let g=ctx.createLinearGradient(xs-18,0,xs+18,0);
  g.addColorStop(0,'#7d6fb8');g.addColorStop(.35,'#f0e6ff');g.addColorStop(.65,'#d9c8f5');g.addColorStop(1,'#5f5299');
  ctx.fillStyle=g;ctx.fill();
  ctx.save();ctx.clip();
  g=ctx.createLinearGradient(0,-H,0,-H*.6);
  g.addColorStop(0,`rgba(120,255,230,${.45+.3*fl})`);g.addColorStop(1,'rgba(120,255,230,0)');
  ctx.fillStyle=g;ctx.fillRect(xs-40,-H,80,H*.4);
  g=ctx.createLinearGradient(0,0,0,-45);
  g.addColorStop(0,'rgba(10,8,30,.6)');g.addColorStop(1,'rgba(10,8,30,0)');
  ctx.fillStyle=g;ctx.fillRect(xs-40,-45,80,45);
  ctx.strokeStyle='rgba(80,60,140,.3)';ctx.lineWidth=.8;
  for(let k=0;k<14;k++){
    const v=.06+k*.065,y=-H*v,cx=stemX(m,v),w=hwF(v);
    ctx.beginPath();ctx.moveTo(cx-w,y);ctx.quadraticCurveTo(cx,y+3,cx+w,y-H*.02);ctx.stroke();
  }
  ctx.restore();
  ctx.globalCompositeOperation='lighter';
  for(const s of m.speck){
    const px=stemX(m,s.v)+s.off*hwF(s.v)*.8,py=-H*s.v;
    ctx.globalAlpha=.25+.3*(.5+.5*Math.sin(t*1.6+s.ph));
    ctx.drawImage(sprites[2],px-2.5,py-2.5,5,5);
  }
  if(ph>=.35&&ph<.7){
    let v=(ph-.35)/.35;v=v*v*(3-2*v);
    ctx.globalAlpha=.85;
    ctx.drawImage(sprites[2],stemX(m,v)-16,-H*v-16,32,32);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';

  // skirt front
  ctx.save();ctx.translate(sx,sy);ctx.rotate(skw);
  ctx.beginPath();ctx.ellipse(0,0,srx,6,0,Math.PI,0,true);ctx.quadraticCurveTo(0,1,-srx,0);
  g=ctx.createLinearGradient(0,0,0,6);
  g.addColorStop(0,'rgba(255,235,255,.55)');g.addColorStop(1,'rgba(190,160,255,.3)');
  ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=.8;ctx.stroke();
  ctx.fillStyle='rgba(255,220,160,.85)';
  for(let i=0;i<9;i++){const a=Math.PI*(i+.5)/9;ctx.beginPath();ctx.arc(srx*Math.cos(a),6*Math.sin(a)+1,1,0,TAU);ctx.fill();}
  ctx.restore();

  // cap
  ctx.save();
  ctx.translate(m.xc,-H);ctx.rotate(m.tilt+Math.sin(t*.9+m.ph)*.025);
  ctx.scale(1,1+.025*Math.sin(t*1.1+m.ph));
  const R=m.R,Hc=m.Hc;
  ctx.beginPath();ctx.ellipse(0,0,R,16,0,0,TAU);ctx.fillStyle='#07131f';ctx.fill();
  g=ctx.createLinearGradient(0,0,0,16);
  g.addColorStop(0,`rgba(90,255,225,${.55+.3*fl})`);g.addColorStop(1,'rgba(30,110,170,.55)');
  ctx.fillStyle=g;ctx.fill();
  ctx.lineWidth=.7;
  for(let i=-18;i<=18;i++){
    const x=i/18*R*.96;
    const a=Math.min(1,.2+.35*(.5+.5*Math.sin(x*.12-t*2.5))+fl*.4);
    ctx.strokeStyle=`rgba(150,255,235,${a})`;
    ctx.beginPath();ctx.moveTo(x*.15,-2);ctx.lineTo(x,15*Math.sqrt(Math.max(0,1-(x/R)*(x/R))));ctx.stroke();
  }
  // dome
  const hue=255+12*Math.sin(t*.15+m.ph);
  domePath(R,Hc);
  g=ctx.createRadialGradient(-R*.3,-Hc*.8,2,0,-Hc*.3,R*1.1);
  g.addColorStop(0,`hsl(${hue+7},75%,58%)`);g.addColorStop(.45,`hsl(${hue-3},70%,32%)`);g.addColorStop(1,`hsl(${hue-10},70%,14%)`);
  ctx.fillStyle=g;ctx.fill();
  ctx.save();ctx.clip();
  g=ctx.createLinearGradient(0,-Hc*.4,0,7);
  g.addColorStop(0,'rgba(255,100,200,0)');g.addColorStop(1,`rgba(255,100,200,${.5+.3*fl})`);
  ctx.fillStyle=g;ctx.fillRect(-R,-Hc,R*2,Hc+10);
  const bx=((t*.12+m.ph)%1)*R*3-R*1.5;
  g=ctx.createLinearGradient(bx-25,-Hc,bx+25,0);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(220,255,255,.09)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.fillRect(-R,-Hc,R*2,Hc+10);
  // constellations
  ctx.strokeStyle=`rgba(220,210,255,${.13+.25*fl})`;ctx.lineWidth=.5;
  ctx.beginPath();
  for(const e of m.edges){const a=m.stars[e[0]],b=m.stars[e[1]];ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
  ctx.stroke();
  ctx.globalCompositeOperation='lighter';
  for(const s of m.stars){
    const tw=Math.min(1,.5+.4*Math.sin(t*s.sp+s.ph)+fl*.7);
    ctx.globalAlpha=tw*.85;
    ctx.drawImage(sprites[5],s.x-s.r*2.5,s.y-s.r*2.5,s.r*5,s.r*5);
    if(s.big){
      ctx.globalAlpha=tw*.6;ctx.strokeStyle='rgba(255,244,214,1)';ctx.lineWidth=.4;
      const L=s.r*(2+fl*2);
      ctx.beginPath();ctx.moveTo(s.x-L,s.y);ctx.lineTo(s.x+L,s.y);ctx.moveTo(s.x,s.y-L);ctx.lineTo(s.x,s.y+L);ctx.stroke();
    }
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.restore();
  domePath(R,Hc);ctx.strokeStyle='rgba(20,10,60,.6)';ctx.lineWidth=.8;ctx.stroke();
  ctx.beginPath();ctx.moveTo(R,0);ctx.quadraticCurveTo(0,7,-R,0);
  ctx.strokeStyle='rgba(255,150,220,.55)';ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();ctx.ellipse(-R*.15,-Hc*.55,R*.55,Hc*.35,-.1,Math.PI*1.1,Math.PI*1.65);
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke();
  // tassels
  for(let k=0;k<9;k++){
    const p=tip(m,k,t),c=pal[m.tass[k].ci];
    ctx.beginPath();ctx.moveTo(p.x0,p.y0);ctx.quadraticCurveTo(p.x0+(p.x-p.x0)*.2,p.y0+(p.y-p.y0)*.6,p.x,p.y);
    ctx.strokeStyle='rgba(255,220,255,.55)';ctx.lineWidth=.8;ctx.stroke();
    const pulse=.6+.4*Math.sin(t*2+m.tass[k].ph)+fl*.6;
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,.5*pulse);
    ctx.drawImage(sprites[m.tass[k].ci],p.x-6,p.y-6,12,12);
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    ctx.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,TAU);ctx.fill();
  }
  ctx.restore();
  // light under cap
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=.2+.3*fl;
  ctx.drawImage(sprites[2],m.xc-R*1.5,-H-R*.2,R*3,R*1.4);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';

  drawRings(m,t,true);
  ctx.restore();
}

function drawPulses(m){
  const ph=m.pp;
  if(ph>.42)return;
  const tau=ph/.35;
  ctx.globalCompositeOperation='lighter';
  ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';
  for(const p of m.veins){
    const q=(tau-p.d*.4)/.6;
    if(q<=0||q>1.25)continue;
    const head=Math.max(0,1-q),fade=q>1?1-(q-1)/.25:1,tail=Math.min(1,head+.22);
    ctx.strokeStyle=`rgba(170,255,240,${.85*fade})`;
    ctx.beginPath();
    for(let i=0;i<=6;i++){const pt=pointAt(p,head+(tail-head)*i/6);i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y);}
    ctx.stroke();
    const h=pointAt(p,head);ctx.globalAlpha=.9*fade;
    ctx.drawImage(sprites[2],h.x-8,h.y-8,16,16);ctx.globalAlpha=1;
  }
  ctx.globalCompositeOperation='source-over';
}

function drawParticles(t){
  ctx.globalCompositeOperation='lighter';
  for(const p of parts){
    const a=Math.pow(Math.sin(Math.PI*Math.min(1,p.age/p.life)),.8);
    const r=p.sz*2.5;
    ctx.globalAlpha=a*.85;
    ctx.drawImage(sprites[p.ci],p.x-r,p.y-r,r*2,r*2);
  }
  for(const q of motes){
    ctx.globalAlpha=.14+.1*Math.sin(t+q.ph);
    ctx.drawImage(sprites[5],q.x-q.s*2,q.y-q.s*2,q.s*4,q.s*4);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

function renderStatic(){
  const mk=()=>{const k=document.createElement('canvas');k.width=cv.width;k.height=cv.height;return k;};
  bgC=mk();fgC=mk();
  const x0=-ox/u-6,x1=(W-ox)/u+6,y0=-oy/u-6,y1=(H-oy)/u+6;
  let g=bgC.getContext('2d');
  g.setTransform(dpr*u,0,0,dpr*u,dpr*ox,dpr*oy);
  let gr=g.createLinearGradient(0,y0,0,y1);
  gr.addColorStop(0,'#070b1c');gr.addColorStop(.55,'#13102e');gr.addColorStop(1,'#1c0f26');
  g.fillStyle=gr;g.fillRect(x0,y0,x1-x0,y1-y0);
  gr=g.createRadialGradient(150,110,0,150,110,250);
  gr.addColorStop(0,'rgba(110,90,220,.3)');gr.addColorStop(1,'rgba(110,90,220,0)');
  g.fillStyle=gr;g.fillRect(x0,y0,x1-x0,y1-y0);
  gr=g.createRadialGradient(150,300,0,150,300,210);
  gr.addColorStop(0,'rgba(40,200,190,.12)');gr.addColorStop(1,'rgba(40,200,190,0)');
  g.fillStyle=gr;g.fillRect(x0,y0,x1-x0,y1-y0);
  let r=rng(5);
  // distant threads
  g.lineWidth=.8;
  for(let i=0;i<7;i++){
    const x=x0+(x1-x0)*r(),len=60+r()*90,dx=(r()-.5)*40;
    g.strokeStyle='rgba(170,200,255,.08)';
    g.beginPath();g.moveTo(x,y0);g.bezierCurveTo(x+dx,y0+len*.4,x-dx,y0+len*.7,x+dx*.3,y0+len);g.stroke();
    g.globalCompositeOperation='lighter';g.globalAlpha=.4;g.drawImage(sprites[2],x+dx*.3-3,y0+len-3,6,6);
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
  }
  // distant silhouettes
  g.fillStyle='rgba(40,36,100,.42)';
  for(let i=0;i<9;i++){
    const bx=x0+(x1-x0)*(i+r()*.8)/9,by=330,h=70+r()*130,cr=14+r()*26,w=2.5+r()*2;
    g.beginPath();g.moveTo(bx-w-2,by);g.quadraticCurveTo(bx-w,by-h*.5,bx-w*.7,by-h);
    g.lineTo(bx+w*.7,by-h);g.quadraticCurveTo(bx+w,by-h*.5,bx+w+2,by);g.fill();
    g.beginPath();g.ellipse(bx,by-h,cr,cr*.55,0,Math.PI,TAU);g.fill();
    g.beginPath();g.ellipse(bx,by-h,cr,cr*.18,0,0,Math.PI);g.fillStyle='rgba(60,170,190,.14)';g.fill();
    g.fillStyle='rgba(40,36,100,.42)';
  }
  g.globalCompositeOperation='lighter';
  for(let i=0;i<40;i++){
    const s=3+r()*5;g.globalAlpha=.12+r()*.28;
    g.drawImage(sprites[Math.floor(r()*5)],x0+(x1-x0)*r()-s,120+r()*200-s,s*2,s*2);
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';

  // foreground: soil, mycelium, moss
  g=fgC.getContext('2d');
  g.setTransform(dpr*u,0,0,dpr*u,dpr*ox,dpr*oy);
  r=rng(99);
  g.beginPath();g.moveTo(x0,surf(x0));
  for(let x=x0;x<=x1;x+=4)g.lineTo(x,surf(x));
  g.lineTo(x1,y1);g.lineTo(x0,y1);g.closePath();
  gr=g.createLinearGradient(0,300,0,y1);
  gr.addColorStop(0,'#33203a');gr.addColorStop(1,'#0e0814');
  g.fillStyle=gr;g.fill();
  g.lineWidth=1.5;
  for(let i=1;i<=5;i++){
    g.strokeStyle='rgba(255,255,255,.04)';g.beginPath();
    for(let x=x0;x<=x1;x+=6){const y=surf(x)+18*i+4*Math.sin(x*.05+i*2);x===x0?g.moveTo(x,y):g.lineTo(x,y);}
    g.stroke();
  }
  for(let i=0;i<220;i++){
    const x=x0+(x1-x0)*r(),y=surf(x)+8+r()*(y1-surf(x)-8);
    g.fillStyle=`rgba(255,230,255,${.04+r()*.08})`;g.fillRect(x,y,.8+r(),.8+r());
  }
  for(let i=0;i<14;i++){
    const x=x0+(x1-x0)*r(),y=surf(x)+22+r()*55,rx=4+r()*6,ry=3+r()*3.5;
    g.save();g.translate(x,y);g.rotate((r()-.5)*.6);
    const pg=g.createRadialGradient(-rx*.3,-ry*.4,0,0,0,rx);
    pg.addColorStop(0,'#5d4d6c');pg.addColorStop(1,'#241a30');
    g.fillStyle=pg;g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();
    g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=.6;g.stroke();g.restore();
  }
  g.lineJoin='round';g.lineCap='round';
  for(const m of M)for(const p of m.veins){
    g.beginPath();p.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));
    g.strokeStyle='rgba(80,255,210,.07)';g.lineWidth=p.thin?2.2:3.4;g.stroke();
    g.beginPath();p.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));
    g.strokeStyle='rgba(130,255,225,.33)';g.lineWidth=p.thin?.6:1;g.stroke();
  }
  // moss
  g.fillStyle='#10302b';
  g.beginPath();g.moveTo(x0,surf(x0)-1);
  for(let x=x0;x<=x1;x+=4)g.lineTo(x,surf(x)-1);
  for(let x=x1;x>=x0;x-=4)g.lineTo(x,surf(x)+9);
  g.closePath();g.fill();
  for(let x=x0;x<x1;x+=2.2){
    const sy=surf(x),rr=3+r()*4.5;
    g.fillStyle=`hsl(${145+r()*35},${40+r()*25}%,${14+r()*16}%)`;
    g.beginPath();g.arc(x,sy+r()*3,rr,0,TAU);g.fill();
  }
  for(let x=x0;x<x1;x+=2.8){
    const sy=surf(x);
    g.fillStyle=`hsl(${150+r()*30},${50+r()*20}%,${28+r()*22}%)`;
    g.beginPath();g.arc(x,sy-1-r()*3,1.5+r()*2.5,0,TAU);g.fill();
  }
  g.lineWidth=.9;
  for(let x=x0;x<x1;x+=1.7){
    const sy=surf(x),h=3+r()*7,dx=(r()-.5)*5;
    g.strokeStyle=`hsl(${140+r()*40},${45+r()*25}%,${30+r()*20}%)`;
    g.beginPath();g.moveTo(x,sy);g.quadraticCurveTo(x+dx*.2,sy-h*.6,x+dx,sy-h);g.stroke();
  }
  for(const m of M){
    for(let i=0;i<8;i++){
      const rr=(5+r()*5)*(.5+.5*m.s);
      g.fillStyle=`hsl(${145+r()*35},${45+r()*25}%,${18+r()*18}%)`;
      g.beginPath();g.arc(m.x+(r()-.5)*(24*m.s+12),m.y-2+(r()-.5)*3,rr,0,TAU);g.fill();
    }
  }
  // fiddleheads
  [[112,-1],[205,1],[40,1],[272,-1]].forEach(f=>{
    const bx=f[0],dir=f[1],by=surf(bx)+2,h=16+r()*12,rad=3.2;
    g.strokeStyle='hsl(150,45%,38%)';g.lineWidth=1.2;
    g.beginPath();g.moveTo(bx,by);
    g.quadraticCurveTo(bx+dir*3,by-h*.6,bx+dir*6,by-h);
    const px=bx+dir*6,py=by-h;
    if(dir===1)g.arc(px-rad,py,rad,0,-Math.PI*1.5,true);else g.arc(px+rad,py,rad,Math.PI,Math.PI*2.5,false);
    g.stroke();
  });
  g.globalCompositeOperation='lighter';
  for(let i=0;i<30;i++){
    const x=x0+(x1-x0)*r(),y=surf(x)-1-r()*3,s=2+r()*3.5;
    g.globalAlpha=.4+r()*.4;
    g.drawImage(sprites[[2,1,3,4][Math.floor(r()*4)]],x-s,y-s,s*2,s*2);
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';

  const mx=Math.max(W,H);
  vig=ctx.createRadialGradient(W/2,H/2,mx*.25,W/2,H/2,mx*.78);
  vig.addColorStop(0,'rgba(3,2,10,0)');vig.addColorStop(1,'rgba(3,2,10,.6)');
}

function resize(){
  W=Math.max(1,window.innerWidth);H=Math.max(1,window.innerHeight);
  dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  u=Math.min(W/300,H/400);ox=(W-300*u)/2;oy=(H-400*u)/2;
  renderStatic();
}
window.addEventListener('resize',resize);
resize();

let last=performance.now(),T=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  update(T,dt);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.drawImage(bgC,0,0,cv.width,cv.height);
  ctx.setTransform(dpr*u,0,0,dpr*u,dpr*ox,dpr*oy);
  for(const m of M)drawMushroom(m,T);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(fgC,0,0,cv.width,cv.height);
  ctx.setTransform(dpr*u,0,0,dpr*u,dpr*ox,dpr*oy);
  for(const m of M)drawPulses(m);
  drawParticles(T);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
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
  "title": "Midnight Orrery Cap",
  "statement": "An indigo-capped fungus whose dome is freckled with constellations that flare whenever a pulse of light climbs the stem from the glowing mycelium in the soil. It does not drop its spores but sets them in slow orbit as tiny luminous planets, some ringed and some with moons, until they spiral away to seed new skies. It grows in mossy hollows among fiddleheads, in small families linked underground."
}
```