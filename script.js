(() => {
  const state={
    level:1,score:0,lives:3,time:30,timer:null,sound:true,
    login:{target:'',input:'',attempts:0},
    runner:{hits:0},
    secret:{clicks:0,last:0,armed:false,index:0},
    memory:{seq:[],input:[],round:1,busy:false}
  };
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const reactions=[
    ['assets/dog-reaction.svg','bro... that was NOT it.'],
    ['assets/cat-reaction.svg','cat has reviewed your decision.'],
    ['assets/dog-reaction.svg','confidence: 100%. accuracy: 0%.'],
    ['assets/cat-reaction.svg','the keyboard wants a lawyer.'],
    ['assets/dog-reaction.svg','please stop speedrunning failure.']
  ];
  const successLines=[
    'okay. that was actually decent.',
    'the system is mildly impressed.',
    'you got through. suspicious.',
    'fine. you can keep playing.'
  ];
  const audio={
    ctx:null,
    beep(freq=460,duration=.07,type='square'){
      if(!state.sound)return;
      try{
        this.ctx??=new (window.AudioContext||window.webkitAudioContext)();
        const o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type=type;o.frequency.value=freq;g.gain.value=.035;
        o.connect(g);g.connect(this.ctx.destination);o.start();
        g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+duration);o.stop(this.ctx.currentTime+duration);
      }catch{}
    }
  };

  function fmt(n){return String(Math.max(0,n)).padStart(4,'0')}
  function hud(){
    $('#hudLevel').textContent=state.level>3?'WIN':String(state.level).padStart(2,'0');
    $('#hudScore').textContent=fmt(state.score);
    $('#hudLives').textContent='♥'.repeat(state.lives)+'♡'.repeat(3-state.lives);
  }
  function show(id){
    $$('.screen').forEach(x=>x.classList.toggle('show',x.id===id));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function toast(t){
    const x=$('#toast');x.textContent=t;x.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.remove('show'),1800);
  }
  function meme(kind=0,text='bro...'){
    const r=reactions[kind%reactions.length];
    $('#popupImg').src=r[0];$('#popupTag').textContent='SYSTEM REACTION';$('#popupText').textContent=text||r[1];
    const p=$('#memePopup');p.classList.remove('show');void p.offsetWidth;p.classList.add('show');
  }
  function soundPop(ok=true){audio.beep(ok?720:190,ok?.08:.13,ok?'sine':'sawtooth')}
  function loseLife(reason){
    state.lives=Math.max(0,state.lives-1);hud();soundPop(false);
    if(state.lives===0){
      toast('NO LIVES LEFT. THE DOG WINS.');
      clearInterval(state.timer);
      setTimeout(()=>restart(),700);
      return true;
    }
    if(reason)meme(state.lives%reactions.length,reason);
    return false;
  }
  function addScore(n){state.score+=n;hud()}
  function setTimer(seconds,onZero){
    clearInterval(state.timer);state.time=seconds;$('#timer').textContent=seconds;
    state.timer=setInterval(()=>{
      state.time--;$('#timer').textContent=state.time;
      if(state.time<=5) $('#timer').style.color='var(--red)'; else $('#timer').style.color='var(--lime)';
      if(state.time<=0){clearInterval(state.timer);onZero()}
    },1000)
  }
  function start(){
    state.level=1;state.score=0;state.lives=3;hud();loadLogin();show('game');startLevel(1)
  }
  function restart(){
    clearInterval(state.timer);state.level=1;state.score=0;state.lives=3;state.runner.hits=0;state.memory.round=1;hud();show('home')
  }
  function finishLevel(){
    clearInterval(state.timer);
    const line=successLines[Math.floor(Math.random()*successLines.length)];
    addScore(state.level===1?250:state.level===2?350:500);
    toast(line);
    soundPop(true);
    setTimeout(()=>{
      state.level++;
      if(state.level>3){showWin();return}
      hud();loadLevel(state.level)
    },650)
  }
  function loadLevel(level){
    show('game');
    $('#levelEyebrow').textContent='LEVEL 0'+level;
    $('#timer').style.color='var(--lime)';
    if(level===1)loadLogin();
    if(level===2)loadRunner();
    if(level===3)loadMemory();
  }

  // LEVEL 1 — actual playable login code
  const words=[
    {word:'DOG26',hint:'dog + 26'},
    {word:'CAT77',hint:'cat + 77'},
    {word:'PAX26',hint:'pax + 26'},
    {word:'LOL42',hint:'lol + 42'}
  ];
  function loadLogin(){
    $('#levelTitle').textContent='LOGIN PANIC';$('#levelDesc').textContent='Build the 5-character access code before the timer dies.';
    state.login=words[Math.floor(Math.random()*words.length)];state.login.input='';state.login.attempts=0;state.secret={clicks:0,last:0,armed:false,index:0};
    $('#stageMain').innerHTML=`
      <div class="login-game">
        <div class="login-card-big">
          <div class="login-top"><span>ACCESS TERMINAL</span><span class="lime">ONLINE</span></div>
          <div class="login-clue"><strong>${state.login.word.replace(/./g,'?')}</strong><span>CLUE: ${state.login.hint.toUpperCase()}</span></div>
          <input class="code-input" id="codeInput" maxlength="5" placeholder="TYPE CODE" autocomplete="off" inputmode="text">
          <div class="code-grid" id="codeGrid"></div>
          <button class="hero-btn" id="codeSubmit" style="width:100%;margin-top:14px">CHECK LOGIN →</button>
        </div>
      </div>`;
    const keys='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    $('#codeGrid').innerHTML=keys.map(k=>`<button class="code-key" data-k="${k}" type="button">${k}</button>`).join('');
    $$('.code-key').forEach(b=>b.addEventListener('click',()=>{$('#codeInput').value=($('#codeInput').value+b.dataset.k).slice(0,5)}));
    $('#codeSubmit').addEventListener('click',checkLogin);
    $('#codeInput').addEventListener('keydown',e=>{if(e.key==='Enter')checkLogin()});
    $('#reactionImg').src='assets/dog-reaction.svg';$('#reactionText').textContent='the dog is pretending not to judge you.';
    setTimer(30,()=>{if(!loseLife('time expired. the dog waited patiently.'))loadLogin()});
  }
  function checkLogin(){
    const value=$('#codeInput').value.toUpperCase();
    if(value===state.login.word){
      $('#reactionImg').src='assets/cat-reaction.svg';$('#reactionText').textContent='cat: acceptable. continue.';
      finishLevel();return;
    }
    state.login.attempts++;
    const idx=Math.floor(Math.random()*reactions.length);
    $('#reactionImg').src=reactions[idx][0];$('#reactionText').textContent=reactions[idx][1];
    if(state.login.attempts>=3){
      $('#loginDesc').textContent='DIRECT LOGIN LOCKED. The system may be hiding another route.';
      toast('three bad ideas detected. maybe stop guessing.');
    }
    if(!loseLife(reactions[idx][1])){$('#codeInput').value='';}
  }

  // LEVEL 2 — chase the button
  function loadRunner(){
    $('#levelTitle').textContent='RUNNING BUTTON';$('#levelDesc').textContent='Hit the green button 7 times. It will try to escape.';
    state.runner.hits=0;
    $('#stageMain').innerHTML=`
      <div class="running-game" id="arena">
        <div class="arena-note">TAP THE GREEN BUTTON • 7 HITS • DON'T CLICK THE TRAPS</div>
        <button class="runner" id="runner">CLICK ME<small>again.</small></button>
        <button class="trap t1" data-trap>not me</button>
        <button class="trap t2" data-trap>definitely not me</button>
        <div class="running-score">HITS <b id="runHits">0</b> / 7</div>
      </div>`;
    $('#reactionImg').src='assets/cat-reaction.svg';$('#reactionText').textContent='the cat is betting against you.';
    $('#runner').addEventListener('click',hitRunner);
    $$('[data-trap]').forEach(t=>t.addEventListener('click',()=>{if(!loseLife('you clicked a trap. impressive.'))toast('THAT WAS NOT THE BUTTON');}));
    setTimer(20,()=>{if(!loseLife('time up. the button remains undefeated.'))loadRunner()});
  }
  function hitRunner(){
    state.runner.hits++;
    $('#runHits').textContent=state.runner.hits;
    addScore(35);soundPop(true);
    if(state.runner.hits>=7){finishLevel();return}
    const r=document.querySelector('#runner');
    const arena=document.querySelector('#arena');
    const maxX=arena.clientWidth-r.offsetWidth-18,maxY=arena.clientHeight-r.offsetHeight-45;
    r.style.left=(18+Math.random()*Math.max(10,maxX))+'px';
    r.style.top=(35+Math.random()*Math.max(10,maxY))+'px';
    if(state.runner.hits===3)meme(1,'cat: why are you good at this?');
    if(state.runner.hits===6)meme(0,'one more. do not fumble now.');
  }

  // LEVEL 3 — memory game
  function loadMemory(){
    $('#levelTitle').textContent='CAT MEMORY';$('#levelDesc').textContent='Watch the lights. Repeat the sequence.';
    state.memory={seq:[],input:[],round:1,busy:false};
    $('#stageMain').innerHTML=`
      <div class="memory-game">
        <div class="memory-info">
          <div class="cat">=^.^=</div>
          <h3>Remember this.</h3>
          <p>The sequence gets longer. The cat will not give hints.</p>
          <button class="hero-btn" id="memoryStart">START ROUND →</button>
          <div class="memory-status" id="memoryStatus">waiting...</div>
        </div>
        <div class="memory-grid" id="memoryGrid">
          ${Array.from({length:9},(_,i)=>`<button class="memory-tile" data-i="${i}" type="button"></button>`).join('')}
        </div>
      </div>`;
    $('#reactionImg').src='assets/cat-reaction.svg';$('#reactionText').textContent='cat memory department is open.';
    $('#memoryStart').addEventListener('click',memoryStart);$$('.memory-tile').forEach(t=>t.addEventListener('click',memoryClick));
    setTimer(35,()=>{if(!loseLife('time up. memory rejected.'))loadMemory()});
  }
  function memoryStart(){
    if(state.memory.busy)return;
    state.memory.seq=Array.from({length:3+state.memory.round},()=>Math.floor(Math.random()*9));
    state.memory.input=[];state.memory.busy=true;
    $('#memoryStatus').textContent='WATCH...';
    const tiles=$$('.memory-tile');
    state.memory.seq.forEach((idx,i)=>{
      setTimeout(()=>{tiles[idx].classList.add('lit');soundPop(true)},450*i+150);
      setTimeout(()=>tiles[idx].classList.remove('lit'),450*i+350);
    });
    setTimeout(()=>{state.memory.busy=false;$('#memoryStatus').textContent='YOUR TURN';},450*state.memory.seq.length+480);
  }
  function memoryClick(e){
    if(state.memory.busy||!state.memory.seq.length)return;
    const idx=Number(e.currentTarget.dataset.i);
    const pos=state.memory.input.length;
    state.memory.input.push(idx);e.currentTarget.classList.add('hit');setTimeout(()=>e.currentTarget.classList.remove('hit'),120);
    if(idx!==state.memory.seq[pos]){
      e.currentTarget.classList.add('bad');setTimeout(()=>e.currentTarget.classList.remove('bad'),300);
      state.memory.seq=[];$('#memoryStatus').textContent='WRONG. cat has no comment.';
      if(!loseLife('cat memory says: absolutely not.'))loadMemory();
      return;
    }
    if(state.memory.input.length===state.memory.seq.length){
      addScore(75);state.memory.round++;
      if(state.memory.round>3){finishLevel();return}
      state.memory.seq=[];$('#memoryStatus').textContent='CORRECT. NEXT ROUND.';
      setTimeout(memoryStart,650);
    }
  }

  function showWin(){
    state.level=4;hud();show('win');$('#winScore').textContent=fmt(state.score);$('#winLives').textContent='♥'.repeat(state.lives)+'♡'.repeat(3-state.lives);
    $('#winText').textContent=state.score>900?'Okay. That was suspiciously good.':state.score>600?'Not bad. The cat approves.':'You survived. We are counting that as a win.';
  }

  $('#startBtn').addEventListener('click',start);
  $('#rulesBtn').addEventListener('click',()=>show('rules'));
  $('#rulesBack').addEventListener('click',()=>show('home'));
  $('#againBtn').addEventListener('click',start);
  $('#soundBtn').addEventListener('click',()=>{state.sound=!state.sound;$('#soundBtn').textContent=state.sound?'🔊':'🔇';audio.beep(600,.05)});
  $('#copyBtn').addEventListener('click',async()=>{const t='I scored '+state.score+' in PARADOX//ACCESS.';try{await navigator.clipboard.writeText(t);toast('RESULT COPIED');}catch{toast(t)}});
  $('#logo').addEventListener('click',()=> {
    if(state.level!==1 || state.login.attempts<3) {
      toast('the logo is innocent. probably.');
      return;
    }
    const now=Date.now();
    if(now-state.secret.last>1400) state.secret.clicks=0;
    state.secret.last=now;
    state.secret.clicks++;
    if(state.secret.clicks===1) toast('...the logo blinked.');
    if(state.secret.clicks===2) toast('that was suspicious.');
    if(state.secret.clicks===3) toast('one more signal.');
    if(state.secret.clicks>3){state.secret.clicks=0;toast('channel reset.');}
  });

  document.addEventListener('click',e=>{
    if(state.level!==1 || state.login.attempts<3 || state.secret.clicks!==3 || state.secret.armed) return;
    if(e.shiftKey && e.target.closest('#logo')){
      state.secret.armed=true;
      state.secret.index=0;
      toast('creator channel armed.');
    }
  });

  document.addEventListener('keydown',e=>{
    if(!state.secret.armed || state.level!==1) return;
    const secret='PAX26';
    const k=e.key.toUpperCase();
    if(k===secret[state.secret.index]){
      state.secret.index++;
      if(state.secret.index===secret.length){
        state.secret.armed=false;
        state.login.attempts=0;
        $('#reactionImg').src='assets/dog-reaction.svg';
        $('#reactionText').textContent='HOW DID YOU FIND THE BACK DOOR?';
        addScore(600);
        meme(0,'creator route unlocked. okay, boss.');
        finishLevel();
      }
      return;
    }
    if(!['SHIFT','ALT','CONTROL'].includes(k)){
      state.secret.armed=false;state.secret.index=0;
      toast('creator signal mismatch.');
    }
  });

  hud();
})();