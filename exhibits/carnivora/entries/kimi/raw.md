```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title></title>
<style>
  html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#071b20}
  canvas{position:fixed;inset:0;width:100%;height:100%;display:block}
</style>
</head>
<body>
<canvas id="world"></canvas>
<script>
(() => {
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1, S = 1, OX = 0, OY = 0;
  let seed = 914731;
  const rand = () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
    n = n + Math.imul(n ^ n >>> 7, 61 | n) ^ n;
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
  const TAU = Math.PI * 2;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const smooth = v => { v=clamp(v,0,1); return v*v*(3-2*v); };

  function resize(){
    W = innerWidth; H = innerHeight;
    DPR = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.max(1,Math.round(W*DPR));
    canvas.height = Math.max(1,Math.round(H*DPR));
    S = Math.min(W/600,H/800);
    OX = (W-600*S)/2;
    OY = (H-800*S)/2;
  }
  addEventListener('resize',resize,{passive:true});
  resize();

  const motes = Array.from({length:34},() => ({
    x:35+rand()*530, y:90+rand()*590, r:.45+rand()*1.45,
    p:rand()*TAU, v:.15+rand()*.45
  }));
  const pebbles = Array.from({length:18},() => ({
    x:65+rand()*470, y:718+rand()*72, r:2+rand()*7,
    c:rand(), p:rand()*TAU
  }));
  const moss = Array.from({length:48},() => ({
    x:65+rand()*470, y:699+rand()*38, h:5+rand()*18,
    p:rand()*TAU, c:rand()
  }));
  const flecks = Array.from({length:28},() => ({
    x:-82+rand()*164, y:-122+rand()*103, r:.6+rand()*1.5
  }));

  const pointer = {x:0,y:0,active:false,last:0,vx:0,vy:0};
  addEventListener('pointermove',e => {
    const x=(e.clientX-OX)/S, y=(e.clientY-OY)/S;
    if(pointer.active){
      pointer.vx=clamp((x-pointer.x)*11,-430,430);
      pointer.vy=clamp((y-pointer.y)*11,-430,430);
    }
    pointer.x=x; pointer.y=y; pointer.active=true;
    pointer.last=performance.now();
  },{passive:true});
  addEventListener('pointerleave',() => pointer.active=false,{passive:true});

  function placeBug(b,initial){
    b.x = initial ? 75+rand()*450 : (rand()<.5 ? 55+rand()*35 : 510+rand()*35);
    b.y = initial ? 175+rand()*400 : 170+rand()*320;
    b.vx = (rand()-.5)*28;
    b.vy = (rand()-.5)*24;
    b.caught = false;
    b.alpha = initial ? 1 : 0;
  }
  const bugs = Array.from({length:7},(_,i) => {
    const b={type:(i===1||i===5)?1:0,phase:rand()*TAU,hue:rand()};
    placeBug(b,true);
    return b;
  });

  let time=0, mode='rest', modeTime=0, target=null;
  let pulse=0;
  const sparks=[];

  function setMode(m){mode=m;modeTime=0;}
  function startHunt(){
    const available=bugs.filter(b=>!b.caught);
    target=available.length?available[Math.floor(rand()*available.length)]:null;
    setMode('hunt');
  }
  function headPose(){
    const direction=target&&!target.caught?clamp((target.x-300)/210,-1,1):Math.sin(time*.31)*.3;
    return {
      x:300+Math.sin(time*.64)*4.5,
      y:356+Math.sin(time*.83)*2+(mode==='closed'?4:0),
      r:-.055+direction*.085+Math.sin(time*.51)*.018
    };
  }
  function capture(){
    if(!target||target.caught)return;
    const h=headPose();
    target.caught=true;
    target.x=h.x;target.y=h.y;
    pulse=1;
    for(let i=0;i<18;i++){
      const a=rand()*TAU, speed=18+rand()*75;
      sparks.push({x:h.x,y:h.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
        life:.65+rand()*.65,max:1.3,r:.8+rand()*2.2});
    }
    setMode('snap');
  }

  function update(dt){
    time+=dt;modeTime+=dt;
    pulse=Math.max(0,pulse-dt*1.25);
    pointer.vx*=Math.pow(.04,dt);
    pointer.vy*=Math.pow(.04,dt);
    if(performance.now()-pointer.last>1600)pointer.active=false;

    if(mode==='rest'&&modeTime>2.1)startHunt();
    if(mode==='snap'&&modeTime>.22)setMode('closed');
    if(mode==='closed'&&modeTime>3.15)setMode('opening');
    if(mode==='opening'&&modeTime>2.65){
      if(target)placeBug(target,false);
      target=null;setMode('rest');
    }

    const h=headPose();
    for(const b of bugs){
      b.alpha=Math.min(1,b.alpha+dt*.7);
      if(b.caught)continue;
      const lured=mode==='hunt'&&b===target;
      if(lured){
        const dx=h.x-b.x,dy=h.y-b.y;
        const urgency=modeTime>7?2.2:1.35;
        b.vx+=dx*urgency*dt;
        b.vy+=dy*urgency*dt;
        b.vx+=Math.sin(time*4+b.phase)*5*dt;
        b.vy+=Math.cos(time*3.3+b.phase)*5*dt;
      }else{
        b.vx+=(Math.sin(time*(.7+b.hue*.5)+b.phase)*15+Math.cos(b.y*.018+time)*6)*dt;
        b.vy+=(Math.cos(time*(.8+b.hue*.4)+b.phase)*13+Math.sin(b.x*.02-time*.7)*5)*dt;
        b.vx+=(300-b.x)*.012*dt;
        b.vy+=(360-b.y)*.008*dt;
      }
      if(pointer.active){
        const dx=b.x-pointer.x,dy=b.y-pointer.y;
        const d=Math.hypot(dx,dy)||1;
        if(d<135){
          const force=(1-d/135)*(lured?.42:1);
          b.vx+=(dx/d*220+pointer.vx*.72)*force*dt;
          b.vy+=(dy/d*220+pointer.vy*.72)*force*dt;
        }
      }
      const damping=Math.pow(lured?.975:.988,dt*60);
      b.vx*=damping;b.vy*=damping;
      const max=lured?100:(b.type?35:48);
      const speed=Math.hypot(b.vx,b.vy);
      if(speed>max){b.vx*=max/speed;b.vy*=max/speed;}
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<48){b.x=48;b.vx=Math.abs(b.vx)+5;}
      if(b.x>552){b.x=552;b.vx=-Math.abs(b.vx)-5;}
      if(b.y<142){b.y=142;b.vy=Math.abs(b.vy)+4;}
      if(b.y>647){b.y=647;b.vy=-Math.abs(b.vy)-5;}
    }
    if(mode==='hunt'&&target){
      const d=Math.hypot(target.x-h.x,target.y-h.y);
      if(d<34&&modeTime>.8)capture();
      else if(modeTime>10){
        let nearest=null,nd=1e9;
        for(const b of bugs)if(!b.caught){
          const d2=Math.hypot(b.x-h.x,b.y-h.y);
          if(d2<nd){nd=d2;nearest=b;}
        }
        target=nearest;modeTime=5;
      }
    }
    for(let i=sparks.length-1;i>=0;i--){
      const p=sparks[i];p.life-=dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.vx*=Math.pow(.25,dt);p.vy=p.vy*Math.pow(.35,dt)+12*dt;
      if(p.life<=0)sparks.splice(i,1);
    }
  }

  function opening(){
    if(mode==='rest')return .79+Math.sin(time*1.1)*.055;
    if(mode==='hunt')return .9+Math.sin(time*1.7)*.035;
    if(mode==='snap')return Math.max(.04,.92*(1-modeTime/.21));
    if(mode==='closed')return .04+Math.sin(time*2)*.006;
    return .04+smooth(modeTime/2.65)*.77;
  }

  function background(){
    let g=ctx.createLinearGradient(0,0,0,800);
    g.addColorStop(0,'#071922');g.addColorStop(.52,'#0b292c');g.addColorStop(1,'#102a25');
    ctx.fillStyle=g;ctx.fillRect(-100,-100,800,1000);
    g=ctx.createRadialGradient(300,330,10,300,350,390);
    g.addColorStop(0,'rgba(70,117,94,.19)');
    g.addColorStop(.55,'rgba(22,69,62,.08)');g.addColorStop(1,'rgba(2,12,19,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,600,800);
    for(const m of motes){
      const x=m.x+Math.sin(time*m.v+m.p)*13;
      const y=m.y+Math.cos(time*m.v*.7+m.p)*18;
      const a=.1+.16*(.5+.5*Math.sin(time*.8+m.p));
      ctx.fillStyle=`rgba(164,220,184,${a})`;
      ctx.beginPath();ctx.arc(x,y,m.r,0,TAU);ctx.fill();
    }
  }

  function ground(){
    let g=ctx.createLinearGradient(0,686,0,810);
    g.addColorStop(0,'#294538');g.addColorStop(.18,'#1c332b');g.addColorStop(1,'#091c1c');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(-30,800);ctx.lineTo(-30,766);
    ctx.bezierCurveTo(40,718,102,694,185,699);
    ctx.bezierCurveTo(255,677,348,680,405,698);
    ctx.bezierCurveTo(498,692,561,730,630,765);
    ctx.lineTo(630,820);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(103,139,89,.24)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(45,742);ctx.bezierCurveTo(160,680,418,677,557,742);ctx.stroke();
    for(const p of pebbles){
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.p);
      ctx.fillStyle=p.c>.5?'#30463c':'#26372f';
      ctx.beginPath();ctx.ellipse(0,0,p.r,p.r*.5,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(144,164,123,.13)';ctx.lineWidth=.8;
      ctx.beginPath();ctx.arc(-1,-1,p.r*.6,Math.PI,TAU);ctx.stroke();ctx.restore();
    }
    ctx.lineCap='round';
    for(const m of moss){
      const sway=Math.sin(time*.7+m.p)*1.5;
      ctx.strokeStyle=m.c>.5?'#527654':'#3b664d';
      ctx.lineWidth=1.4;
      for(let j=-1;j<=1;j++){
        ctx.beginPath();ctx.moveTo(m.x,m.y);
        ctx.quadraticCurveTo(m.x+j*3,m.y-m.h*.55,m.x+j*4+sway,m.y-m.h*(.72+Math.abs(j)*.12));
        ctx.stroke();
      }
      if(m.c>.72){
        ctx.fillStyle='rgba(151,190,112,.55)';
        ctx.beginPath();ctx.arc(m.x+sway,m.y-m.h*.75,1.2,0,TAU);ctx.fill();
      }
    }
  }

  function leaf(bx,by,rot,len,wid,phase,back){
    ctx.save();ctx.translate(bx,by);
    ctx.rotate(rot+Math.sin(time*.62+phase)*.025);
    let g=ctx.createLinearGradient(0,0,0,-len);
    g.addColorStop(0,back?'#173d34':'#245c45');
    g.addColorStop(.55,back?'#285344':'#37745a');
    g.addColorStop(1,back?'#57434c':'#82505c');
    ctx.fillStyle=g;ctx.strokeStyle=back?'#365d49':'#639069';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,0);
    ctx.bezierCurveTo(-wid*.9,-len*.22,-wid,-len*.7,0,-len);
    ctx.bezierCurveTo(wid,-len*.7,wid*.9,-len*.22,0,0);ctx.fill();ctx.stroke();
    ctx.strokeStyle=back?'rgba(126,158,105,.24)':'rgba(157,193,127,.45)';
    ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-4);
    ctx.quadraticCurveTo(-4,-len*.48,0,-len+5);ctx.stroke();
    for(let i=1;i<=8;i++){
      const f=i/9,y=-len*f,w=wid*Math.sin(Math.PI*f)*.76;
      for(const side of [-1,1]){
        const ex=side*(w+7+(i%3)*2),ey=y-5-(i%2)*3;
        ctx.strokeStyle=back?'rgba(108,143,96,.35)':'rgba(163,177,116,.62)';
        ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(side*w*.72,y);ctx.quadraticCurveTo(side*w,ey+4,ex,ey);ctx.stroke();
        if(!back||i%2===0){
          ctx.fillStyle='rgba(225,190,143,.74)';
          ctx.beginPath();ctx.arc(ex,ey,1.6+(i%3)*.25,0,TAU);ctx.fill();
          ctx.fillStyle='rgba(255,246,208,.8)';
          ctx.beginPath();ctx.arc(ex-.5,ey-.6,.55,0,TAU);ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  function stem(){
    const digest=(mode==='closed'||mode==='opening')?1:0;
    ctx.lineCap='round';
    ctx.strokeStyle='#102e29';ctx.lineWidth=20;
    ctx.beginPath();ctx.moveTo(302,715);ctx.bezierCurveTo(329,635,263,550,291,473);
    ctx.bezierCurveTo(315,418,286,394,300,354);ctx.stroke();
    let g=ctx.createLinearGradient(270,0,325,0);
    g.addColorStop(0,'#24543f');g.addColorStop(.5,'#4a8660');g.addColorStop(1,'#183f35');
    ctx.strokeStyle=g;ctx.lineWidth=14;ctx.stroke();
    ctx.strokeStyle='rgba(158,197,130,.33)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(298,704);ctx.bezierCurveTo(317,628,273,551,298,477);
    ctx.bezierCurveTo(315,427,295,395,304,365);ctx.stroke();
    if(digest){
      for(let i=0;i<3;i++){
        const p=(time*.18+i/3)%1,y=687-p*294,x=300+Math.sin(p*Math.PI*3)*13;
        const a=Math.sin(p*Math.PI)*.5;
        ctx.fillStyle=`rgba(239,174,100,${a})`;
        ctx.beginPath();ctx.arc(x,y,2.4,0,TAU);ctx.fill();
      }
    }
  }

  function topJaw(sc){
    ctx.save();ctx.scale(1,sc);
    let g=ctx.createLinearGradient(0,-140,0,12);
    g.addColorStop(0,'#173e37');g.addColorStop(.35,'#554050');g.addColorStop(.72,'#a94f65');g.addColorStop(1,'#e58a7c');
    ctx.fillStyle=g;ctx.strokeStyle='#628a65';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(-108,0);
    ctx.bezierCurveTo(-110,-61,-68,-121,-5,-139);
    ctx.bezierCurveTo(58,-130,107,-65,108,0);
    ctx.bezierCurveTo(58,-16,-57,-16,-108,0);ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(239,150,135,.24)';ctx.lineWidth=1.2;
    for(let i=-3;i<=3;i++){
      ctx.beginPath();ctx.moveTo(i*3,-126+Math.abs(i)*5);
      ctx.quadraticCurveTo(i*19,-68,i*28,-8);ctx.stroke();
    }
    for(const f of flecks){
      const yy=f.y,xx=f.x*(1-Math.max(0,(-yy-90)/100));
      ctx.fillStyle='rgba(255,182,146,.19)';
      ctx.beginPath();ctx.arc(xx,yy,f.r,0,TAU);ctx.fill();
    }
    ctx.restore();
  }

  function lowerJaw(sc){
    ctx.save();ctx.scale(1,sc);
    let g=ctx.createLinearGradient(0,0,0,112);
    g.addColorStop(0,'#e8917d');g.addColorStop(.36,'#a84e60');g.addColorStop(.75,'#4f3d48');g.addColorStop(1,'#183e35');
    ctx.fillStyle=g;ctx.strokeStyle='#648c65';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(-108,0);
    ctx.bezierCurveTo(-103,53,-66,96,-7,108);
    ctx.bezierCurveTo(51,108,103,59,108,0);
    ctx.bezierCurveTo(55,17,-57,17,-108,0);ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(245,158,128,.22)';ctx.lineWidth=1.2;
    for(let i=-3;i<=3;i++){
      ctx.beginPath();ctx.moveTo(i*29,8);
      ctx.quadraticCurveTo(i*20,65,i*3,96-Math.abs(i)*5);ctx.stroke();
    }
    ctx.restore();
  }

  function head(open){
    const h=headPose();
    ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.r);
    const glow=ctx.createRadialGradient(0,0,2,0,0,145);
    glow.addColorStop(0,`rgba(255,167,103,${.1+open*.16})`);
    glow.addColorStop(.5,'rgba(204,95,93,.055)');glow.addColorStop(1,'rgba(204,95,93,0)');
    ctx.fillStyle=glow;ctx.fillRect(-150,-155,300,310);

    ctx.fillStyle=`rgba(24,5,24,${.4+open*.45})`;
    ctx.beginPath();ctx.ellipse(0,1,100,9+open*22,0,0,TAU);ctx.fill();

    const sc=.12+open*.88;
    topJaw(sc);lowerJaw(sc);

    if(open>.12){
      ctx.strokeStyle='rgba(245,191,120,.65)';ctx.lineWidth=1.4;
      for(let i=-1;i<=1;i++){
        ctx.beginPath();ctx.moveTo(i*22,6);
        ctx.quadraticCurveTo(i*26,-11*open,i*14,-19*open);ctx.stroke();
        ctx.fillStyle='rgba(255,205,119,.88)';
        ctx.beginPath();ctx.arc(i*14,-19*open,2.7,0,TAU);ctx.fill();
      }
      const lg=ctx.createRadialGradient(0,1,0,0,1,26);
      lg.addColorStop(0,'rgba(255,239,162,.95)');lg.addColorStop(.2,'rgba(255,186,96,.6)');lg.addColorStop(1,'rgba(255,146,82,0)');
      ctx.fillStyle=lg;ctx.beginPath();ctx.arc(0,1,26,0,TAU);ctx.fill();
      ctx.fillStyle='#ffe2a0';ctx.beginPath();ctx.arc(0,1,2.8+Math.sin(time*3)*.4,0,TAU);ctx.fill();
    }

    ctx.strokeStyle='#d6b785';ctx.lineWidth=1.6;ctx.lineCap='round';
    for(let i=-5;i<=5;i++){
      const x=i*17,y=4+Math.abs(i)*.35;
      const tooth=(9+Math.cos(i*.8)*3)*open;
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+3,y-tooth*.55,x+1,y-tooth);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,-y);ctx.quadraticCurveTo(x-2,-y+tooth*.55,x,-y+tooth);ctx.stroke();
    }
    ctx.restore();
  }

  function drawBug(b){
    if(b.caught||b.alpha<=0)return;
    ctx.save();ctx.globalAlpha=b.alpha;
    ctx.strokeStyle=b.type?'rgba(244,211,151,.12)':'rgba(157,231,207,.1)';
    ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(b.x-b.vx*.3,b.y-b.vy*.3);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.translate(b.x,b.y);
    ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);
    const size=b.type?1.35:1;
    ctx.scale(size,size);
    const flap=.32+.68*Math.abs(Math.sin(time*(b.type?12:27)+b.phase));
    const halo=ctx.createRadialGradient(0,0,0,0,0,b.type?13:9);
    halo.addColorStop(0,b.type?'rgba(255,213,133,.3)':'rgba(145,240,199,.25)');
    halo.addColorStop(1,'rgba(160,220,180,0)');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,b.type?13:9,0,TAU);ctx.fill();
    for(const side of [-1,1]){
      ctx.save();ctx.scale(flap,1);
      ctx.fillStyle=b.type?'rgba(238,218,174,.55)':'rgba(198,241,224,.38)';
      ctx.beginPath();ctx.ellipse(side*4,-1,b.type?5:3.6,b.type?3.2:1.8,side*.48,0,TAU);ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle='#27352e';ctx.beginPath();ctx.ellipse(0,0,1.4,3.7,0,0,TAU);ctx.fill();
    ctx.fillStyle=b.type?'#ffd68c':(b.hue>.5?'#b7f4c9':'#f4cf86');
    ctx.beginPath();ctx.arc(0,1.5,1.45,0,TAU);ctx.fill();
    ctx.restore();
  }

  function render(){
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#071b20';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.translate(OX,OY);ctx.scale(S,S);
    background();ground();

    leaf(298,703,-.93,238,31,.4,true);
    leaf(307,704,.98,225,33,2.1,true);
    leaf(294,707,-.43,186,29,4.2,true);
    stem();
    leaf(294,711,-1.12,207,38,1.2,false);
    leaf(310,711,1.13,199,38,3.4,false);
    leaf(298,714,-.48,156,33,5.1,false);
    leaf(307,713,.5,147,31,2.7,false);

    head(opening());

    if(pulse>0){
      const h=headPose(),r=(1-pulse)*95+15;
      ctx.strokeStyle=`rgba(255,197,120,${pulse*.35})`;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(h.x,h.y,r,0,TAU);ctx.stroke();
    }
    for(const p of sparks){
      ctx.globalAlpha=clamp(p.life/.7,0,1);
      ctx.fillStyle='#ffd28c';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    for(const b of bugs)drawBug(b);
    ctx.restore();
  }

  let previous=performance.now();
  function frame(now){
    const dt=Math.min(.033,(now-previous)/1000||.016);
    previous=now;update(dt);render();
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
  "title": "The Gilded Listener",
  "statement": "It tilts toward every wingbeat, offering a drop of lantern-sweet nectar before folding the sound away. Between meals, its dewed leaves keep time with the drifting motes."
}
```