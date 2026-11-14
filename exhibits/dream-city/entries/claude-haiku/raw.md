```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;overflow:hidden;background:#000}
canvas{position:fixed;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c');
const ctx=cv.getContext('2d');
let W=1,H=1,DPR=1;

function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=Math.max(1,window.innerWidth);
  H=Math.max(1,window.innerHeight);
  cv.width=Math.round(W*DPR);
  cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize',resize);
resize();

function mulberry(a){
  return function(){
    a|=0;a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}
const R=mulberry(20240611);
function hs(a,b,c){const h=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return h-Math.floor(h);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function mix(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function rgb(c,al){
  const r=Math.round(c[0]),g=Math.round(c[1]),b=Math.round(c[2]);
  return al===undefined?`rgb(${r},${g},${b})`:`rgba(${r},${g},${b},${al})`;
}

const PERIOD=36;
const dayTop=[118,178,236],dayBot=[255,214,178],nightTop=[8,9,34],nightBot=[60,40,96],dusk=[255,116,88];
const warmWin=['#ffd98a','#ffb3c1','#9fe8ff','#ffe9a8'];

// Buildings in normalized coordinates
const far=[],mid=[],near=[];
for(let i=0;i<34;i++){
  far.push({x:-0.04+i*(1.08/34)+R()*0.02,w:0.025+R()*0.03,h:0.08+R()*0.16,type:'box',id:i});
}
for(let i=0;i<16;i++){
  mid.push({x:R()*1.0-0.02,w:0.045+R()*0.05,h:0.14+R()*0.2,type:R()<0.3?'dome':(R()<0.3?'spire':'box'),id:100+i});
}
near.push({x:0.02,w:0.085,h:0.36,type:'spire',id:200});
near.push({x:0.10,w:0.06,h:0.22,type:'box',id:201});
near.push({x:0.66,w:0.07,h:0.31,type:'tower',id:202});
near.push({x:0.74,w:0.12,h:0.16,type:'dome',id:203});
near.push({x:0.88,w:0.10,h:0.44,type:'spire',id:204});

const stars=[];
for(let i=0;i<110;i++)stars.push({x:R(),y:R()*0.6,p:R()*6.28,s:0.5+R()*1.5});

const clouds=[];
for(let i=0;i<5;i++)clouds.push({x:R(),y:0.08+R()*0.25,s:0.006+R()*0.01,l:0.12+R()*0.12});

const ships=[{s:0.03,o:0.1,y:0.2,sz:1},{s:0.02,o:0.6,y:0.12,sz:0.7}];

const streaks=[];
for(let i=0;i<70;i++)streaks.push({x:R(),y:R(),l:0.01+R()*0.035,p:R()*6.28});

const lanterns=[];
for(let i=0;i<26;i++)lanterns.push({on:false,x:0,y:0,age:0,life:1,ph:0,sz:1});
let lastSpawn=0;

const bridgeP0=[-0.02,0.84],bridgeC=[0.5,0.62],bridgeP2=[1.02,0.84];
function bridgePt(t){
  const u=1-t;
  return[
    (u*u*bridgeP0[0]+2*u*t*bridgeC[0]+t*t*bridgeP2[0])*W,
    (u*u*bridgeP0[1]+2*u*t*bridgeC[1]+t*t*bridgeP2[1])*H
  ];
}

let hy=H*0.66;
let last=performance.now();
let elapsed=0;

function drawBuilding(b,depth,t,n,hyv){
  const x=b.x*W,w=b.w*W,top=hyv-b.h*H;
  let col;
  if(depth===0)col=mix([205,176,206],[44,38,84],n);
  else if(depth===1)col=mix([150,130,182],[28,26,62],n);
  else col=mix([112,102,152],[16,16,42],n);
  ctx.fillStyle=rgb(col);
  ctx.beginPath();
  if(b.type==='spire'){
    ctx.rect(x,top,w,hyv-top);
    ctx.moveTo(x+w*0.18,top);
    ctx.lineTo(x+w*0.5,top-w*1.1);
    ctx.lineTo(x+w*0.82,top);
    ctx.closePath();
  }else if(b.type==='dome'){
    ctx.rect(x,top+w*0.4,w,hyv-top-w*0.4);
    ctx.moveTo(x,top+w*0.4);
    ctx.arc(x+w/2,top+w*0.4,w/2,Math.PI,0);
    ctx.closePath();
  }else if(b.type==='tower'){
    ctx.rect(x,top+H*b.h*0.15,w,hyv-top-H*b.h*0.15);
    ctx.rect(x+w*0.2,top,w*0.6,H*b.h*0.15);
  }else{
    ctx.rect(x,top,w,hyv-top);
  }
  ctx.fill();

  if(depth>0){
    const cell=depth===1?W*0.022:W*0.03;
    const cols=Math.max(1,Math.floor((w-cell*0.4)/cell));
    const rows=Math.max(1,Math.floor((hyv-top-cell*0.5)/(cell*1.3)));
    const frac=0.08+0.55*n;
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const wx=x+cell*0.4+c*cell;
        const wy=top+cell*0.5+r*cell*1.3;
        if(wy>hyv-cell)continue;
        const hv=hs(b.id,r,c);
        let lit=hv<frac;
        if(hs(b.id,r,c+7)>0.92){
          lit=Math.sin(t*3+hv*30)>0.2;
        }
        if(lit){
          ctx.fillStyle=warmWin[Math.floor(hs(b.id,c,r)*warmWin.length)];
          ctx.globalAlpha=0.85;
          ctx.fillRect(wx,wy,cell*0.5,cell*0.7);
        }
      }
    }
    ctx.globalAlpha=1;
  }
}

function frame(now){
  const dt=Math.min(0.1,(now-last)/1000);
  last=now;
  elapsed+=dt;
  const t=elapsed;

  const th=2*Math.PI*(t/PERIOD);
  const s=Math.sin(th),co=Math.cos(th);
  const n=clamp(0.5-s*1.8,0,1);
  const glow=Math.max(0,1-Math.abs(s)*3.5);
  hy=H*0.66;

  // Sky
  let skyTop=mix(dayTop,nightTop,n);
  let skyBot=mix(dayBot,nightBot,n);
  skyBot=mix(skyBot,dusk,glow*0.7);
  const sg=ctx.createLinearGradient(0,0,0,hy);
  sg.addColorStop(0,rgb(skyTop));
  sg.addColorStop(1,rgb(skyBot));
  ctx.fillStyle=sg;
  ctx.fillRect(0,0,W,hy+1);

  // Stars
  if(n>0.02){
    for(const st of stars){
      const tw=0.5+0.5*Math.sin(t*st.s+st.p);
      ctx.fillStyle=`rgba(255,255,240,${(n*0.8*tw).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(st.x*W,st.y*H,0.6+st.s*0.4,0,6.283);
      ctx.fill();
    }
  }

  // Sun and moon
  const sunVis=clamp((s+0.12)/0.2,0,1);
  if(sunVis>0){
    const sx=W*(0.5+0.4*co),sy=hy-s*H*0.5;
    const r=Math.min(W,H)*0.055;
    const gr=ctx.createRadialGradient(sx,sy,r*0.5,sx,sy,r*3.2);
    gr.addColorStop(0,`rgba(255,235,170,${0.5*sunVis})`);
    gr.addColorStop(1,'rgba(255,200,120,0)');
    ctx.fillStyle=gr;
    ctx.beginPath();ctx.arc(sx,sy,r*3.2,0,6.283);ctx.fill();
    ctx.fillStyle=`rgba(255,246,205,${sunVis})`;
    ctx.beginPath();ctx.arc(sx,sy,r,0,6.283);ctx.fill();
  }
  const moonVis=clamp((-s+0.05)/0.3,0,1)*n;
  if(moonVis>0.01){
    const mx=W*(0.5-0.36*co),my=hy+s*H*0.5;
    const r=Math.min(W,H)*0.04;
    const gr=ctx.createRadialGradient(mx,my,r,mx,my,r*4);
    gr.addColorStop(0,`rgba(220,230,255,${0.35*moonVis})`);
    gr.addColorStop(1,'rgba(200,210,255,0)');
    ctx.fillStyle=gr;
    ctx.beginPath();ctx.arc(mx,my,r*4,0,6.283);ctx.fill();
    ctx.fillStyle=`rgba(236,240,255,${moonVis})`;
    ctx.beginPath();ctx.arc(mx,my,r,0,6.283);ctx.fill();
    ctx.fillStyle=rgb(skyTop,moonVis);
    ctx.beginPath();ctx.arc(mx+r*0.45,my-r*0.2,r*0.9,0,6.283);ctx.fill();
  }

  // Clouds
  const cc=mix([255,255,255],[70,70,110],n);
  for(const c of clouds){
    c.x+=c.s*dt;
    if(c.x>1.2)c.x=-0.2;
    const cx=c.x*W,cy=c.y*H,L=c.l*W;
    ctx.fillStyle=rgb(cc,0.22);
    ctx.beginPath();
    ctx.ellipse(cx,cy,L*0.5,L*0.12,0,0,6.283);
    ctx.ellipse(cx-L*0.3,cy+L*0.04,L*0.3,L*0.1,0,0,6.283);
    ctx.ellipse(cx+L*0.3,cy+L*0.03,L*0.32,L*0.1,0,0,6.283);
    ctx.fill();
  }

  // Airships
  for(const sh of ships){
    const x=((t*sh.s+sh.o)%1.3-0.15)*W;
    const y=sh.y*H;
    const rx=sh.sz*W*0.05,ry=rx*0.3;
    ctx.fillStyle=rgb(mix([235,200,190],[60,50,90],n),0.9);
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,6.283);ctx.fill();
    ctx.fillStyle=rgb(mix([120,90,100],[30,28,50],n),0.9);
    ctx.fillRect(x-rx*0.3,y+ry*0.8,rx*0.6,ry*0.5);
    const on=Math.floor(t*1.2)%2===0;
    ctx.fillStyle=on?'rgba(255,90,90,0.95)':'rgba(120,255,160,0.95)';
    ctx.beginPath();ctx.arc(x-rx*0.92,y,Math.max(1,W*0.003),0,6.283);ctx.fill();
  }

  // Far skyline
  for(const b of far)drawBuilding(b,0,t,n,hy);
  // Mid skyline
  for(const b of mid)drawBuilding(b,1,t,n,hy);

  // Ferris wheel
  {
    const cx=W*0.2,Rw=W*0.12,cy=hy-Rw-H*0.02;
    ctx.strokeStyle=rgb(mix([120,100,150],[30,28,60],n));
    ctx.lineWidth=Math.max(1,W*0.006);
    ctx.beginPath();ctx.moveTo(cx-Rw*0.5,hy);ctx.lineTo(cx,cy);ctx.lineTo(cx+Rw*0.5,hy);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,Rw,0,6.283);ctx.stroke();
    const rot=t*0.2;
    const gc=['#ffd98a','#ff9fb8','#9fe8ff','#c9b6ff','#ffe9a8','#a8ffd0'];
    for(let i=0;i<12;i++){
      const a=rot+i*Math.PI/6;
      const px=cx+Math.cos(a)*Rw,py=cy+Math.sin(a)*Rw;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.stroke();
      ctx.fillStyle=gc[i%gc.length];
      ctx.globalAlpha=0.35+0.65*n;
      ctx.fillRect(px-W*0.008,py-W*0.008,W*0.016,W*0.016);
      ctx.globalAlpha=1;
    }
  }

  // Near skyline
  for(const b of near)drawBuilding(b,2,t,n,hy);

  // Water
  const wt=mix(skyBot,[30,30,70],0.35);
  const wg=ctx.createLinearGradient(0,hy,0,H);
  wg.addColorStop(0,rgb(wt));
  wg.addColorStop(1,rgb(mix(wt,[8,10,30],0.7)));
  ctx.fillStyle=wg;
  ctx.fillRect(0,hy,W,H-hy);

  // Reflected lights under the skyline
  if(n>0.1){
    for(let i=0;i<22;i++){
      const x=hs(i,3,9)*W;
      const len=(0.03+hs(i,4,1)*0.07)*H;
      ctx.fillStyle=`rgba(255,215,140,${(0.12*n).toFixed(3)})`;
      ctx.fillRect(x,hy+2,W*0.008,len*(0.6+0.4*Math.sin(t*1.3+i)));
    }
  }

  // Water shimmer
  ctx.fillStyle=rgb(mix([200,210,240],[120,130,180],n),0.35);
  for(const st of streaks){
    const x=((st.x*W+Math.sin(t*0.6+st.p)*W*0.02)%W+W)%W;
    const y=hy+(0.02+st.y*0.97)*(H-hy);
    ctx.fillRect(x,y,st.l*W,Math.max(1,H*0.003));
  }

  // Bridge
  {
    ctx.strokeStyle=rgb(mix([150,130,170],[34,30,58],n));
    ctx.lineWidth=Math.max(2,H*0.018);
    ctx.beginPath();
    ctx.moveTo(bridgeP0[0]*W,bridgeP0[1]*H);
    ctx.quadraticCurveTo(bridgeC[0]*W,bridgeC[1]*H,bridgeP2[0]*W,bridgeP2[1]*H);
    ctx.stroke();
    const lampN=14;
    for(let i=0;i<=lampN;i++){
      const [lx,ly]=bridgePt(i/lampN);
      ctx.fillStyle=`rgba(255,220,150,${(0.3+0.7*n).toFixed(3)})`;
      ctx.beginPath();ctx.arc(lx,ly-H*0.012,Math.max(1.2,W*0.006),0,6.283);ctx.fill();
      if(n>0.2){
        ctx.fillStyle=`rgba(255,220,150,${(0.18*n).toFixed(3)})`;
        ctx.beginPath();ctx.arc(lx,ly-H*0.012,W*0.03,0,6.283);ctx.fill();
      }
    }
  }

  // Lanterns
  lastSpawn+=dt;
  if(lastSpawn>0.7){
    lastSpawn=0;
    const L=lanterns.find(l=>!l.on);
    if(L){
      L.on=true;L.age=0;L.life=7+R()*5;
      L.x=W*(0.08+R()*0.84);
      L.y=H*(0.86+R()*0.08);
      L.ph=R()*6.28;L.sz=0.7+R()*0.6;
    }
  }
  const lbright=0.45+0.55*n;
  for(const L of lanterns){
    if(!L.on)continue;
    L.age+=dt;
    if(L.age>L.life){L.on=false;continue;}
    const p=L.age/L.life;
    const x=L.x+Math.sin(L.ph+L.age*0.8)*W*0.03;
    const y=L.y-p*H*0.78;
    const fade=Math.min(1,p*6)*(1-Math.max(0,p-0.8)*5);
    const r=W*0.012*L.sz;
    ctx.fillStyle=`rgba(255,170,90,${(0.22*fade*lbright).toFixed(3)})`;
    ctx.beginPath();ctx.arc(x,y,r*3,0,6.283);ctx.fill();
    ctx.fillStyle=`rgba(255,205,120,${(0.9*fade*lbright).toFixed(3)})`;
    ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
  }

  // Soft vignette-free atmosphere haze near horizon
  const hz=ctx.createLinearGradient(0,hy-H*0.08,0,hy+H*0.02);
  hz.addColorStop(0,'rgba(255,255,255,0)');
  hz.addColorStop(1,`rgba(255,220,200,${(0.08*(1-n)+0.02).toFixed(3)})`);
  ctx.fillStyle=hz;
  ctx.fillRect(0,hy-H*0.08,W,H*0.1);

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
  "title": "Lantern-Lull Lagoon",
  "statement": "A lagoon city where paper lanterns drift up from the water each evening, a little Ferris wheel turns beside an arched bridge, and every tower keeps its own secret schedule of lights. Dusk lingers longest over the rooftops."
}
```