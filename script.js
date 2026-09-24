(() => {
  const c=document.getElementById('game'),ctx=c.getContext('2d');
  const $=s=>document.querySelector(s);
  const keys={left:false,right:false,jump:false};
  const world={w:4200,h:900,gravity:1850,groundY:735};
  let view={x:0,y:0,scale:1};
  let running=false,finished=false,startedAt=0,elapsed=0,last=0,deathCount=0,best=localStorage.getItem('paradoxRageBest')||'';
  let soundOn=true,audioCtx=null;

  const player={x:120,y:650,w:28,h:28,vx:0,vy:0,onGround:false,coyote:.0,jumpLock:false};
  const checkpoints=[120,1420,2760,3920];
  let checkpointIndex=0;

  const platforms=[
    // Tutorial / warm-up: wide platforms and simple jumps.
    {x:0,y:735,w:760,h:50},{x:790,y:690,w:330,h:40},{x:1150,y:630,w:290,h:35},
    // Difficulty starts rising here.
    {x:1490,y:690,w:190,h:40},{x:1735,y:560,w:145,h:32},{x:1960,y:675,w:300,h:40},
    {x:2370,y:620,w:145,h:32},{x:2600,y:550,w:210,h:34},{x:2920,y:680,w:235,h:40},
    {x:3250,y:590,w:155,h:34},{x:3490,y:520,w:170,h:34},{x:3740,y:735,w:120,h:50},
    {x:3920,y:590,w:125,h:32},{x:4100,y:735,w:120,h:50}
  ];
  const spikes=[
    // No lethal spikes in the tutorial zone.
    {x:1500,y:650,w:62,h:40},{x:1710,y:520,w:60,h:40},{x:1880,y:650,w:70,h:40},
    {x:2260,y:640,w:88,h:35},{x:2520,y:580,w:95,h:40},{x:2850,y:640,w:100,h:35},
    {x:3170,y:650,w:82,h:30},{x:3400,y:490,w:90,h:40},{x:3650,y:690,w:90,h:45},
    {x:3830,y:550,w:80,h:40},{x:4010,y:690,w:85,h:45}
  ];
  const movers=[
    // First moving platform is slow and optional.
    {x:740,y:625,w:100,h:22,min:735,max:790,s:.7,t:0},
    // Harder moving sections.
    {x:1480,y:500,w:72,h:20,min:1420,max:1690,s:1.7,t:1.3},
    {x:1910,y:455,w:72,h:20,min:1840,max:2290,s:2.0,t:2.1},
    {x:2380,y:500,w:72,h:20,min:2320,max:2670,s:1.9,t:0.7},
    {x:3030,y:540,w:68,h:20,min:2950,max:3250,s:2.2,t:1.5},
    {x:3550,y:455,w:65,h:20,min:3490,max:3750,s:2.3,t:.4}
  ];
  const fakeFloor=[
    // First fake floor is removed from the tutorial. Trolls start later.
    {x:2410,y:590,w:105,h:16},{x:2960,y:650,w:100,h:16},{x:3435,y:600,w:90,h:16}
  ];
  const goal={x:4145,y:660,w:30,h:75};

  function resize(){const d=devicePixelRatio||1;c.width=innerWidth*d;c.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0);view.scale=Math.min(innerWidth/1100,innerHeight/720);if(innerWidth<800)view.scale=Math.min(innerWidth/700,innerHeight/720)}
  addEventListener('resize',resize);resize();

  function beep(f=480,d=.06,type='square'){
    if(!soundOn)return;
    try{
      audioCtx??=new (AudioContext||webkitAudioContext)();
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.type=type;o.frequency.value=f;g.gain.value=.025;o.connect(g);g.connect(audioCtx.destination);o.start();
      g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d)
    }catch{}
  }
  function showMeme(kind,text){
    $('#memeImg').src=kind?'assets/cat-reaction.svg':'assets/dog-reaction.svg';
    $('#memeText').textContent=text;
    const m=$('#meme');m.classList.remove('show');void m.offsetWidth;m.classList.add('show')
  }
  function timeText(ms){const s=ms/1000;return String(Math.floor(s/60)).padStart(2,'0')+':'+(s%60).toFixed(1).padStart(4,'0')}
  function updateHud(){ $('#deaths').textContent=deathCount;$('#time').textContent=timeText(elapsed);$('#best').textContent=best?timeText(Number(best)):'--:--.-' }
  function resizeWorldView(){
    const targetX=player.x-innerWidth*.30/view.scale;
    view.x=Math.max(0,Math.min(world.w-innerWidth/view.scale,targetX));
    view.y=Math.max(0,Math.min(world.h-innerHeight/view.scale,world.h-innerHeight/view.scale));
  }

  function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
  function solidAt(x,y,w,h){
    const box={x,y,w,h};
    let hit=null;
    for(const p of platforms)if(rectHit(box,p))hit=p;
    for(const m of movers)if(rectHit(box,m))hit=m;
    return hit
  }
  function onDanger(){
    if(player.y>world.h+100)return true;
    for(const s of spikes)if(rectHit(player,s))return true;
    for(const f of fakeFloor)if(rectHit(player,f))return true;
    return false
  }
  function respawn(reason){
    deathCount++;updateHud();showMeme(deathCount%2,reason||'bro... you died.');
    beep(150,.14,'sawtooth');
    const x=checkpoints[Math.min(checkpointIndex,checkpoints.length-1)];
    player.x=x;player.y=500;player.vx=0;player.vy=0;
    running=true;
    flash('#ff5f73');
  }

  function flash(color){
    const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;pointer-events:none;background:'+color+';opacity:.16;z-index:17';document.body.appendChild(d);
    setTimeout(()=>d.remove(),130)
  }

  function updateMover(m,dt){
    m.t+=dt*m.s;
    const mid=(m.min+m.max)/2,range=(m.max-m.min)/2;
    m.x=mid+Math.sin(m.t)*range
  }
  function resolvePlatforms(prevY){
    player.onGround=false;
    const bottoms=[];
    for(const p of platforms)bottoms.push(p);
    for(const m of movers)bottoms.push(m);
    for(const p of bottoms){
      const prevBottom=prevY+player.h;
      const nowBottom=player.y+player.h;
      if(player.x+player.w>p.x&&player.x<p.x+p.w&&prevBottom<=p.y&&nowBottom>=p.y&&player.vy>=0){
        player.y=p.y-player.h;player.vy=0;player.onGround=true;player.coyote=.09
      }
    }
  }
  function update(dt){
    if(!running||finished)return;
    elapsed=performance.now()-startedAt;updateHud();
    movers.forEach(m=>updateMover(m,dt));
    const accel=keys.left?-1150:keys.right?1150:0;
    player.vx+=accel*dt;
    if(!keys.left&&!keys.right)player.vx*=Math.pow(.0001,dt);
    player.vx=Math.max(-320,Math.min(320,player.vx));
    if((keys.jump||jumpPressed)&&player.onGround&&!player.jumpLock){player.vy=-650;player.onGround=false;player.jumpLock=true;beep(560,.05)}
    if(!keys.jump)player.jumpLock=false;
    jumpPressed=false;
    player.vy+=world.gravity*dt;
    const prevY=player.y;
    player.x+=player.vx*dt;
    player.y+=player.vy*dt;
    resolvePlatforms(prevY);
    if(player.onGround&&player.x>checkpoints[Math.min(checkpointIndex+1,checkpoints.length-1)]-80)checkpointIndex=Math.min(checkpointIndex+1,checkpoints.length-1);
    if(player.x>goal.x-120&&checkpointIndex<3)checkpointIndex=3;
    if(onDanger())respawn();
    if(rectHit(player,goal)){finish()}
    resizeWorldView()
  }

  function draw(){
    const W=innerWidth,H=innerHeight;
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.scale(view.scale,view.scale);ctx.translate(-view.x,-view.y);
    // world background
    ctx.fillStyle='#080811';ctx.fillRect(0,0,world.w,world.h);
    for(let x=0;x<world.w;x+=140){ctx.strokeStyle='rgba(255,255,255,.035)';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,world.h);ctx.stroke()}
    for(let y=0;y<world.h;y+=90){ctx.strokeStyle='rgba(255,255,255,.028)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(world.w,y);ctx.stroke()}
    // background labels
    ctx.font='10px DM Mono, monospace';ctx.fillStyle='rgba(255,255,255,.12)';
    ['GOOD LUCK','THIS PART SUCKS','NO CHECKPOINT? LOL','ALMOST THERE','LIAR'].forEach((t,i)=>ctx.fillText(t,550+i*870,100+(i%2)*80));
    // platforms
    platforms.forEach(p=>{ctx.fillStyle='#191731';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#26224a';ctx.fillRect(p.x,p.y,p.w,4)});
    movers.forEach(p=>{ctx.fillStyle='#203348';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#68dfff';ctx.fillRect(p.x,p.y,p.w,3)});
    // fake floors
    fakeFloor.forEach(p=>{ctx.fillStyle='#a65f7c';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#ff7db6';ctx.fillRect(p.x,p.y,p.w,2)});
    // spikes
    spikes.forEach(s=>{ctx.fillStyle='#ff5f73';const n=Math.max(1,Math.floor(s.w/20));const sw=s.w/n;for(let i=0;i<n;i++){ctx.beginPath();ctx.moveTo(s.x+i*sw,s.y+s.h);ctx.lineTo(s.x+i*sw+sw/2,s.y);ctx.lineTo(s.x+(i+1)*sw,s.y+s.h);ctx.closePath();ctx.fill()}});
    // checkpoint flags
    checkpoints.forEach((x,i)=>{if(i>checkpointIndex)return;ctx.fillStyle='#c9ff67';ctx.fillRect(x,650,3,85);ctx.fillStyle='#c9ff67';ctx.beginPath();ctx.moveTo(x,650);ctx.lineTo(x+36,660);ctx.lineTo(x,670);ctx.closePath()});
    // goal
    ctx.fillStyle='#c9ff67';ctx.fillRect(goal.x,goal.y,goal.w,goal.h);ctx.fillStyle='#111';ctx.font='12px Space Grotesk';ctx.fillText('EXIT',goal.x-3,goal.y-12);
    // player
    ctx.shadowColor='rgba(201,255,103,.4)';ctx.shadowBlur=16;ctx.fillStyle='#f8f4ee';ctx.fillRect(player.x,player.y,player.w,player.h);ctx.shadowBlur=0;
    ctx.fillStyle='#111';ctx.fillRect(player.x+6,player.y+7,5,5);ctx.fillRect(player.x+17,player.y+7,5,5);
    ctx.restore();
    if(innerWidth>800){
      ctx.fillStyle='rgba(255,255,255,.32)';ctx.font='9px DM Mono,monospace';ctx.fillText('MOVE  ← → / A D     JUMP  SPACE / W',18,innerHeight-18)
    }
  }

  let jumpPressed=false;
  function key(e,down){
    if(['ArrowLeft','a','A'].includes(e.key))keys.left=down;
    if(['ArrowRight','d','D'].includes(e.key))keys.right=down;
    if([' ','ArrowUp','w','W'].includes(e.key)){keys.jump=down;if(down)jumpPressed=true}
    if(down&&e.key==='r')restartGame();
  }
  addEventListener('keydown',e=>{key(e,true);if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault()});
  addEventListener('keyup',e=>key(e,false));

  document.querySelectorAll('.touch-btn').forEach(btn=>{
    const k=btn.dataset.key;
    const down=e=>{e.preventDefault();if(k==='left')keys.left=true;if(k==='right')keys.right=true;if(k==='jump'){keys.jump=true;jumpPressed=true}};
    const up=e=>{e.preventDefault();if(k==='left')keys.left=false;if(k==='right')keys.right=false;if(k==='jump')keys.jump=false};
    btn.addEventListener('touchstart',down,{passive:false});btn.addEventListener('touchend',up,{passive:false});btn.addEventListener('touchcancel',up,{passive:false});
    btn.addEventListener('mousedown',down);btn.addEventListener('mouseup',up);btn.addEventListener('mouseleave',up)
  });

  function startGame(){
    $('#intro').style.display='none';$('#finish').style.display='none';deathCount=0;checkpointIndex=0;elapsed=0;finished=false;
    player.x=120;player.y=650;player.vx=0;player.vy=0;startedAt=performance.now();running=true;updateHud();beep(650,.08)
  }
  function finish(){
    if(finished)return;finished=true;running=false;clearInterval(stateTimer);
    const t=elapsed;const old=best?Number(best):Infinity;
    if(t<old){best=String(t);localStorage.setItem('paradoxRageBest',best)}
    $('#finishDeaths').textContent=deathCount;$('#finishTime').textContent=timeText(t);
    $('#finishText').textContent=deathCount===0?'0 deaths. The system is concerned.':deathCount<5?'Only '+deathCount+' deaths. Respectable.' : 'You died '+deathCount+' times and still won. That is the spirit.';
    $('#finish').style.display='grid';updateHud();beep(880,.15,'sine')
  }
  function restartGame(){
    $('#finish').style.display='none';$('#intro').style.display='none';startGame()
  }

  let stateTimer=null;
  $('#start').addEventListener('click',startGame);
  $('#again').addEventListener('click',restartGame);
  $('#restart').addEventListener('click',restartGame);
  $('#sound').addEventListener('click',()=>{soundOn=!soundOn;$('#sound').textContent=soundOn?'🔊':'🔇';});
  addEventListener('blur',()=>{keys.left=keys.right=keys.jump=false});
  window.addEventListener('beforeunload',()=>{if(best)localStorage.setItem('paradoxRageBest',best)});

  function loop(t){
    const dt=Math.min(.032,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)
  }
  updateHud();requestAnimationFrame(loop)
})();