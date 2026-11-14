```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#061011}
  canvas{display:block;width:100%;height:100%;touch-action:pan-y}
</style>
</head>
<body>
<canvas id="art"></canvas>
<script>
(()=>{
  const canvas=document.getElementById('art'),ctx=canvas.getContext('2d');
  const W=600,H=900,TAU=Math.PI*2;
  let dpr=1,scale=1,ox=0,oy=0;
  const bg=document.createElement('canvas');
  bg.width=W;bg.height=H;
  const b=bg.getContext('2d');
  let seed=7319;
  const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};

  function background(){
    let g=b.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#061215');
    g.addColorStop(.38,'#102928');
    g.addColorStop(.72,'#10201d');
    g.addColorStop(1,'#03090b');
    b.fillStyle=g;b.fillRect(0,0,W,H);

    g=b.createRadialGradient(310,355,10,310,355,390);
    g.addColorStop(0,'rgba(50,105,91,.25)');
    g.addColorStop(.55,'rgba(12,50,47,.09)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    b.fillStyle=g;b.fillRect(0,0,W,H);

    for(let i=0;i<95;i++){
      const x=rnd()*W,y=rnd()*680,r=rnd()*1.25+.15;
      b.fillStyle=`rgba(181,218,181,${.05+rnd()*.22})`;
      b.beginPath();b.arc(x,y,r,0,TAU);b.fill();
    }

    function branch(side){
      b.save();b.translate(side<0?0:W,0);b.scale(side,1);
      b.strokeStyle='rgba(2,10,11,.88)';
      b.lineCap='round';
      b.lineWidth=20;
      b.beginPath();b.moveTo(-5,850);b.bezierCurveTo(75,680,5,490,60,335);b.bezierCurveTo(95,225,40,145,70,-20);b.stroke();
      b.lineWidth=7;
      const limbs=[
        [42,610,125,525,151,416],
        [49,474,118,397,105,278],
        [66,332,10,255,18,162],
        [70,214,135,156,159,58],
        [39,728,112,690,166,624]
      ];
      for(const p of limbs){
        b.beginPath();b.moveTo(p[0],p[1]);b.quadraticCurveTo(p[2],p[3],p[4],p[5]);b.stroke();
      }
      b.lineWidth=2;
      for(let i=0;i<18;i++){
        const y=70+i*39,x=52+Math.sin(i*2.4)*24;
        b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x+35,y-30,x+47,y-72);b.stroke();
      }
      b.restore();
    }
    branch(1);branch(-1);

    b.strokeStyle='rgba(98,131,104,.10)';b.lineWidth=1;
    for(let i=0;i<36;i++){
      const x=rnd()*W;
      b.beginPath();b.moveTo(x,900);b.quadraticCurveTo(x-35+rnd()*70,790,x-20+rnd()*40,690-rnd()*160);b.stroke();
    }

    for(let i=0;i<15000;i++){
      const v=rnd()>.5?210:0;
      b.fillStyle=`rgba(${v},${v},${v},${rnd()*.025})`;
      b.fillRect(rnd()*W,rnd()*H,1,1);
    }
    g=b.createLinearGradient(0,0,W,0);
    g.addColorStop(0,'rgba(0,0,0,.52)');g.addColorStop(.17,'rgba(0,0,0,0)');
    g.addColorStop(.83,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.52)');
    b.fillStyle=g;b.fillRect(0,0,W,H);
  }
  background();

  const motes=Array.from({length:52},()=>({
    x:rnd()*W,y:rnd()*H,r:.4+rnd()*1.8,s:.8+rnd()*2.1,p:rnd()*TAU,a:.12+rnd()*.48
  }));
  const sparks=Array.from({length:25},()=>({
    p:rnd(),x:(rnd()-.5)*70,s:.55+rnd()*.9,r:.5+rnd()*1.7
  }));

  function resize(){
    dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(innerWidth*dpr);
    canvas.height=Math.round(innerHeight*dpr);
    scale=Math.max(innerWidth/W,innerHeight/H);
    ox=(innerWidth-W*scale)/2;
    oy=(innerHeight-H*scale)/2;
  }
  addEventListener('resize',resize,{passive:true});resize();

  function path(points){
    ctx.beginPath();ctx.moveTo(points[0],points[1]);
    for(let i=2;i<points.length;i+=6)ctx.bezierCurveTo(...points.slice(i,i+6));
  }

  function glow(x,y,r,color,alpha=1){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,color.replace('A',String(.42*alpha)));
    g.addColorStop(.3,color.replace('A',String(.16*alpha)));
    g.addColorStop(1,color.replace('A','0'));
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }

  function wing(side,lower,rootY,t){
    const flap=.89+.075*Math.sin(t*1.45)+.018*Math.sin(t*3.1);
    ctx.save();
    ctx.translate(300,rootY);
    ctx.scale(side*flap,1);
    ctx.rotate(side*Math.sin(t*.73)*.018);

    if(lower){
      path([5,4,77,20,176,74,166,145,160,201,108,192,65,145,111,226,72,271,37,237,7,207,5,91,5,4]);
    }else{
      path([8,4,43,-112,119,-226,190,-214,250,-204,225,-113,157,-54,105,-5,48,28,8,18]);
    }
    ctx.closePath();
    let g=ctx.createLinearGradient(0,lower?0:-210,180,lower?210:20);
    g.addColorStop(0,'rgba(160,214,181,.34)');
    g.addColorStop(.38,lower?'rgba(47,125,115,.35)':'rgba(58,147,137,.39)');
    g.addColorStop(.76,'rgba(21,65,69,.54)');
    g.addColorStop(1,'rgba(5,23,29,.77)');
    ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle='rgba(179,198,142,.48)';ctx.lineWidth=1.5;ctx.stroke();

    ctx.save();ctx.clip();
    for(let i=0;i<9;i++){
      const yy=lower?18+i*22:-185+i*25;
      ctx.strokeStyle=`rgba(142,202,169,${.07+(i%3)*.025})`;
      ctx.lineWidth=12;
      ctx.beginPath();ctx.moveTo(20,0);ctx.quadraticCurveTo(100,yy,205,yy-15);ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle='rgba(167,202,158,.34)';ctx.lineWidth=1.1;
    const veins=lower?
      [[9,8,65,55,147,119],[9,8,79,111,145,166],[9,8,51,117,67,224],[9,8,31,104,36,207]]:
      [[9,8,83,-61,191,-195],[9,8,110,-66,207,-146],[9,8,95,-22,167,-62],[9,8,69,-104,124,-183],[9,8,37,4,70,9]];
    for(const v of veins){
      ctx.beginPath();ctx.moveTo(v[0],v[1]);ctx.quadraticCurveTo(v[2],v[3],v[4],v[5]);ctx.stroke();
    }

    const ex=lower?112:148,ey=lower?126:-135;
    ctx.save();ctx.translate(ex,ey);ctx.rotate(lower?-.35:.28);
    ctx.fillStyle='rgba(3,20,25,.64)';
    ctx.beginPath();ctx.ellipse(0,0,lower?22:29,lower?30:37,0,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(202,171,100,.58)';ctx.lineWidth=4;
    ctx.beginPath();ctx.ellipse(0,0,lower?16:22,lower?23:29,0,0,TAU);ctx.stroke();
    ctx.fillStyle='rgba(104,176,151,.5)';
    ctx.beginPath();ctx.ellipse(0,0,lower?8:11,lower?13:17,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(226,212,145,.58)';
    ctx.beginPath();ctx.ellipse(-3,-5,2.5,6,0,0,TAU);ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  function limb(points,width,color){
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(points[0],points[1]);
    ctx.quadraticCurveTo(points[2],points[3],points[4],points[5]);ctx.stroke();
  }

  function lantern(t){
    const pulse=.78+.22*Math.sin(t*2.1)+.08*Math.sin(t*5.7);
    glow(446,666,168,'rgba(239,142,55,A)',pulse);
    glow(446,666,65,'rgba(255,198,86,A)',pulse);

    ctx.save();ctx.translate(446,666);
    ctx.strokeStyle='rgba(156,120,65,.8)';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(0,-54,20,Math.PI,0);ctx.stroke();
    ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(-20,-54);ctx.lineTo(20,-54);ctx.stroke();

    let metal=ctx.createLinearGradient(-40,0,40,0);
    metal.addColorStop(0,'#29372e');metal.addColorStop(.45,'#9b8050');metal.addColorStop(1,'#26342e');
    ctx.strokeStyle=metal;ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-31,-44);ctx.quadraticCurveTo(-42,8,-28,48);ctx.quadraticCurveTo(0,59,28,48);ctx.quadraticCurveTo(42,8,31,-44);ctx.closePath();ctx.stroke();
    ctx.lineWidth=2;
    for(const x of [-17,0,17]){
      ctx.beginPath();ctx.moveTo(x,-44);ctx.quadraticCurveTo(x*1.5,5,x,52);ctx.stroke();
    }
    ctx.fillStyle='rgba(4,15,15,.55)';
    ctx.beginPath();ctx.ellipse(0,-43,32,7,0,0,TAU);ctx.fill();
    ctx.strokeStyle='#8c764b';ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,49,29,7,0,0,TAU);ctx.fill();ctx.stroke();

    ctx.save();ctx.scale(1,pulse);
    const fire=ctx.createRadialGradient(0,13,0,0,13,28);
    fire.addColorStop(0,'#fff4b0');fire.addColorStop(.16,'#ffd16b');
    fire.addColorStop(.45,'rgba(238,110,36,.75)');fire.addColorStop(1,'rgba(225,64,22,0)');
    ctx.fillStyle=fire;ctx.beginPath();ctx.arc(0,13,28,0,TAU);ctx.fill();
    ctx.fillStyle='#ffe6a0';
    ctx.beginPath();ctx.moveTo(0,25);ctx.bezierCurveTo(-10,13,-3,4,2,-9);ctx.bezierCurveTo(4,4,12,16,0,25);ctx.fill();
    ctx.restore();ctx.restore();
  }

  function fairy(t){
    const bob=Math.sin(t*.72)*6,rootY=414+bob;
    glow(300,rootY-55,190,'rgba(84,181,151,A)',.45);

    ctx.save();
    ctx.translate(0,bob);
    ctx.strokeStyle='rgba(7,16,19,.92)';ctx.lineCap='round';
    for(let i=0;i<11;i++){
      const x=278+i*4.2,sway=Math.sin(t*.65+i*.45)*14;
      ctx.lineWidth=7-(i%3);
      ctx.beginPath();ctx.moveTo(x,310);
      ctx.bezierCurveTo(x-40+sway,390,x+45-sway,473,x-12+sway,570+i*4);ctx.stroke();
      ctx.strokeStyle=i%3===0?'rgba(117,148,119,.22)':'rgba(7,16,19,.92)';
    }
    ctx.restore();

    for(const s of [-1,1])wing(s,true,rootY,t);
    for(const s of [-1,1])wing(s,false,rootY,t);

    ctx.save();ctx.translate(0,bob);
    let skin=ctx.createLinearGradient(260,300,350,490);
    skin.addColorStop(0,'#c5d1ad');skin.addColorStop(.45,'#829c85');skin.addColorStop(1,'#354f48');

    ctx.fillStyle=skin;
    ctx.beginPath();ctx.moveTo(280,365);ctx.quadraticCurveTo(300,350,320,365);
    ctx.bezierCurveTo(332,395,317,424,311,450);
    ctx.quadraticCurveTo(300,468,289,450);
    ctx.bezierCurveTo(282,423,269,394,280,365);ctx.fill();

    ctx.strokeStyle='rgba(205,215,164,.45)';ctx.lineWidth=1;
    for(let i=0;i<5;i++){
      ctx.beginPath();ctx.moveTo(291,387+i*11);ctx.quadraticCurveTo(300,392+i*11,309,387+i*11);ctx.stroke();
    }

    const reach=Math.sin(t*.8)*4;
    limb([318,377,354,421,379,471],9,'#819b83');
    limb([379,471,402,501,417+reach,545],6,'#91a68a');
    limb([282,378,252,421,231,462],9,'#728d7a');
    limb([231,462,217,490,205,523],5,'#8da185');

    ctx.strokeStyle='#a8b696';ctx.lineWidth=2;ctx.lineCap='round';
    for(let i=0;i<3;i++){
      ctx.beginPath();ctx.moveTo(416+reach,543);ctx.quadraticCurveTo(425+i*4,552+i*2,431+i*5,561+i*4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(205,521);ctx.quadraticCurveTo(198-i*3,532,197-i*5,542+i*3);ctx.stroke();
    }

    limb([293,445,275,483,257,518],10,'#506e60');
    limb([257,518,249,556,222,582],5,'#78917a');
    limb([307,445,325,490,341,528],10,'#587667');
    limb([341,528,350,557,377,574],5,'#78917a');

    ctx.strokeStyle='rgba(183,196,146,.7)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(286,303);ctx.bezierCurveTo(257,262,263,225,246,197);ctx.stroke();
    ctx.beginPath();ctx.moveTo(314,303);ctx.bezierCurveTo(343,262,337,225,354,197);ctx.stroke();
    ctx.lineWidth=1;
    for(const s of [-1,1]){
      for(let i=0;i<4;i++){
        const x=300+s*(17+i*5),y=268-i*17;
        ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+s*23,y-9,x+s*29,y-28);ctx.stroke();
      }
    }

    ctx.fillStyle=skin;
    ctx.beginPath();ctx.ellipse(300,326,30,42,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(31,54,49,.25)';
    ctx.beginPath();ctx.ellipse(300,342,22,20,0,0,Math.PI);ctx.fill();

    ctx.strokeStyle='rgba(32,55,49,.8)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(283,323);ctx.quadraticCurveTo(290,317,296,323);ctx.stroke();
    ctx.beginPath();ctx.moveTo(304,323);ctx.quadraticCurveTo(310,317,317,323);ctx.stroke();
    ctx.fillStyle='#e6d88c';
    ctx.beginPath();ctx.arc(291,321,1.6,0,TAU);ctx.arc(309,321,1.6,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(38,56,48,.75)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(295,348);ctx.quadraticCurveTo(300,351,305,348);ctx.stroke();

    ctx.strokeStyle='rgba(193,181,115,.65)';
    ctx.beginPath();ctx.moveTo(300,285);ctx.lineTo(300,270);ctx.stroke();
    ctx.fillStyle='#d8c47d';ctx.beginPath();ctx.arc(300,267,2.3,0,TAU);ctx.fill();
    ctx.restore();
  }

  function draw(ms){
    const t=ms/1000;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle='#03090b';ctx.fillRect(0,0,innerWidth,innerHeight);
    ctx.setTransform(dpr*scale,0,0,dpr*scale,dpr*ox,dpr*oy);
    ctx.drawImage(bg,0,0);

    const halo=.82+.12*Math.sin(t*.43);
    glow(300,161,155,'rgba(188,160,91,A)',halo);
    ctx.strokeStyle=`rgba(189,172,110,${.27*halo})`;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(300,161,77,0,TAU);ctx.stroke();
    for(let i=0;i<28;i++){
      const a=i/28*TAU+t*.006,r1=82,r2=i%4===0?91:86;
      ctx.beginPath();ctx.moveTo(300+Math.cos(a)*r1,161+Math.sin(a)*r1);
      ctx.lineTo(300+Math.cos(a)*r2,161+Math.sin(a)*r2);ctx.stroke();
    }
    let eg=ctx.createRadialGradient(285,146,8,300,161,70);
    eg.addColorStop(0,'#102726');eg.addColorStop(1,'#02090c');
    ctx.fillStyle=eg;ctx.beginPath();ctx.arc(300,161,68,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(225,193,111,.38)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(300,161,69,.1,Math.PI*1.55);ctx.stroke();

    for(const m of motes){
      const y=(m.y-t*m.s*4+H)%H;
      const x=m.x+Math.sin(t*.35+m.p)*13;
      const a=m.a*(.55+.45*Math.sin(t*.9+m.p));
      ctx.fillStyle=`rgba(177,207,157,${Math.max(0,a)})`;
      ctx.beginPath();ctx.arc(x,y,m.r,0,TAU);ctx.fill();
    }

    fairy(t);
    lantern(t);

    for(const s of sparks){
      const p=(s.p+t*.075*s.s)%1;
      const x=446+s.x*(.3+p)+Math.sin(p*12+s.p*20)*13*p;
      const y=665-p*260;
      ctx.fillStyle=`rgba(244,185,91,${Math.sin(p*Math.PI)*.72})`;
      ctx.beginPath();ctx.arc(x,y,s.r*(1-p*.55),0,TAU);ctx.fill();
    }

    ctx.strokeStyle='rgba(8,17,15,.92)';ctx.lineCap='round';
    for(let i=0;i<25;i++){
      const x=i*27-20,hh=35+((i*47)%95),sw=Math.sin(t*.55+i)*4;
      ctx.lineWidth=2+(i%3);
      ctx.beginPath();ctx.moveTo(x,910);ctx.quadraticCurveTo(x+sw,900-hh*.55,x+14+sw,900-hh);ctx.stroke();
    }

    const vg=ctx.createRadialGradient(300,420,250,300,430,570);
    vg.addColorStop(.45,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,3,5,.66)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Fairy of Last Light",
  "statement": "What remains may still illuminate the dark."
}
```