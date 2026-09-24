(() => {
  const state = {
    screen:'start',
    score:Number(localStorage.getItem('paradoxScore')||0),
    xp:Number(localStorage.getItem('paradoxXp')||0),
    best:Number(localStorage.getItem('paradoxBest')||0),
    lives:3,
    completed:new Set(),
    loginAttempts:0,
    levelTimer:null,
    levelTime:60,
    sound:true,
    creatorClicks:0,
    creatorTimer:0,
    creatorArmed:false,
    creatorIndex:0,
    buttonScore:0,
    memorySequence:[],
    memoryInput:[],
    memoryRound:1,
    memoryBusy:false
  };

  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const creatorCode=atob('UEFYMjY=');

  const audio={
    ctx:null,
    beep(freq=420,duration=.07,type='square'){
      if(!state.sound)return;
      try{
        this.ctx??=new (window.AudioContext||window.webkitAudioContext)();
        const o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type=type;o.frequency.value=freq;g.gain.value=.035;
        o.connect(g);g.connect(this.ctx.destination);o.start();
        g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+duration);
        o.stop(this.ctx.currentTime+duration);
      }catch{}
    }
  };

  function save(){
    localStorage.setItem('paradoxScore',state.score);
    localStorage.setItem('paradoxXp',state.xp);
    localStorage.setItem('paradoxBest',Math.max(state.best,state.score));
  }

  function format(n){return String(Math.max(0,n)).padStart(4,'0')}

  function updateHud(){
    $('#hudScore').textContent=format(state.score);
    $('#hudXp').textContent=state.xp;
    $('#hudBest').textContent=format(Math.max(state.best,state.score));
    $('#hudLives').textContent='♥'.repeat(state.lives)+'♡'.repeat(Math.max(0,3-state.lives));
  }

  function showScreen(id){
    $$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
    state.screen=id;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function toast(text){
    const el=$('#toast');
    el.textContent=text;
    el.classList.add('show');
    clearTimeout(toast.t);
    toast.t=setTimeout(()=>el.classList.remove('show'),2100);
  }

  function meme(img,text){
    $('#floatingMeme img').src=img;
    $('#floatingMemeText').textContent=text;
    const el=$('#floatingMeme');
    el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  }

  function addScore(points){
    state.score+=points;state.xp+=Math.max(1,Math.floor(points/10));save();updateHud();
  }

  function loseLife(){
    state.lives=Math.max(0,state.lives-1);updateHud();audio.beep(170,.16,'sawtooth');
    if(state.lives===0){
      toast('No lives left. The system is laughing.');
      setTimeout(()=>{state.lives=3;state.loginAttempts=0;updateHud();showScreen('lobbyScreen');},900);
    }
  }

  function resetRun(){
    state.score=0;state.xp=0;state.lives=3;state.completed.clear();state.loginAttempts=0;
    state.buttonScore=0;state.memoryRound=1;save();updateHud();unlockCards();showScreen('lobbyScreen');
    toast('Run reset. New mistakes available.');
  }

  function unlockCards(){
    $$('.level-card').forEach(card=>{
      const level=Number(card.dataset.level);
      const ok=level===1||state.completed.has(level-1);
      card.classList.toggle('locked',!ok);
      card.classList.toggle('unlocked',ok);
      const tag=card.querySelector('.level-tag');
      if(tag)tag.textContent=ok?'READY':'LOCKED';
    });
  }

  function completeLevel(level,points,xpText){
    state.completed.add(level);
    addScore(points);
    toast('LEVEL COMPLETE +'+points);
    unlockCards();
    audio.beep(760,.1,'sine');
    if(level===3){
      $('#winScore').textContent=format(state.score);
      $('#winXp').textContent=state.xp;
      $('#winLives').textContent='♥'.repeat(state.lives)+'♡'.repeat(3-state.lives);
      $('#winMessage').textContent=xpText||'The system has reluctantly accepted your existence.';
      showScreen('winScreen');
    }else{
      showScreen('lobbyScreen');
    }
  }

  function startGame(){
    state.lives=3;state.loginAttempts=0;updateHud();unlockCards();showScreen('lobbyScreen');audio.beep(580,.08);
  }

  function showHow(){showScreen('howScreen')}

  function startLevel1(){
    state.loginAttempts=0;state.levelTime=60;updateLoginUi();clearInterval(state.levelTimer);
    $('#gameUser').value='';$('#gamePass').value='';
    $('#reactionImg').src='assets/dog-reaction.svg';
    $('#reactionText').textContent='Please enter something less suspicious.';
    $('#loginOutput').className='terminal-output';
    $('#loginOutput').textContent='> terminal ready...';
    showScreen('loginLevel');
    state.levelTimer=setInterval(()=>{
      state.levelTime--;$('#levelTimer').textContent=state.levelTime;
      if(state.levelTime<=0){
        clearInterval(state.levelTimer);
        $('#loginOutput').className='terminal-output bad';
        $('#loginOutput').textContent='> TIME OUT. The dog has taken over.';
        loseLife();
        showScreen('lobbyScreen');
      }
    },1000);
  }

  function updateLoginUi(){
    $('#attemptsText').textContent='ATTEMPTS '+state.loginAttempts+' / 3';
    $('#loginStatus').textContent=state.loginAttempts>=3?'SEALED':'WAITING';
    $('#loginStatus').className=state.loginAttempts>=3?'':'lime';
  }

  function loginWin(label){
    clearInterval(state.levelTimer);
    $('#loginOutput').className='terminal-output good';
    $('#loginOutput').textContent='> ACCESS GRANTED — '+label;
    addScore(250);
    meme('assets/cat-reaction.svg','you got in. the cat is confused.');
    setTimeout(()=>completeLevel(1,0,'Level one complete. The login was the easy part.'),700);
  }

  function failLogin(){
    state.loginAttempts++;
    loseLife();
    updateLoginUi();
    const reactions=[
      ['assets/dog-reaction.svg','dog says: bro...'],
      ['assets/cat-reaction.svg','cat says: absolutely not.'],
      ['assets/dog-reaction.svg','system says: please stop guessing.']
    ];
    const r=reactions[Math.min(state.loginAttempts-1,2)];
    $('#reactionImg').src=r[0];$('#reactionText').textContent=r[1];
    $('#loginOutput').className='terminal-output bad';
    $('#loginOutput').textContent='> ACCESS DENIED — '+r[1];
    meme(r[0],r[1]);
    audio.beep(210,.1,'square');

    if(state.loginAttempts>=3){
      $('#loginOutput').textContent='> DIRECT ACCESS SEALED. THE INTERFACE IS LISTENING.';
      toast('Password route sealed. Maybe click around.');
    }
  }

  function submitLogin(e){
    e.preventDefault();
    const user=$('#gameUser').value.trim().toLowerCase();
    const pass=$('#gamePass').value.trim().toLowerCase();

    if((user==='guest'||user==='paradox')&&pass==='paradox'){loginWin('GUEST');return}
    if(state.loginAttempts>=3){
      $('#loginOutput').className='terminal-output bad';
      $('#loginOutput').textContent='> direct credential path sealed. no more guesses.';
      return;
    }
    if(!user||!pass){
      $('#loginOutput').className='terminal-output bad';
      $('#loginOutput').textContent='> enter something first. the form is not psychic.';
      return;
    }
    failLogin();
  }

  function startLevel2(){
    state.buttonScore=0;$('#buttonScore').textContent='000';$('#buttonLog').textContent='system: patience test started.';
    $('#buttonMemeImg').src='assets/cat-reaction.svg';$('#buttonMemeText').textContent='the cat thinks you will press it.';
    showScreen('buttonLevel');
  }

  function pressDanger(){
    state.buttonScore+=25;$('#buttonScore').textContent=String(state.buttonScore).padStart(3,'0');
    const lines=[
      'system: why did you do that?',
      'system: it literally said do not press.',
      'dog: i knew this would happen.',
      'cat: embarrassing.',
      'system: button pressed. civilization continues.'
    ];
    const line=lines[Math.min(Math.floor(state.buttonScore/25)-1,lines.length-1)];
    $('#buttonLog').textContent='> '+line;
    $('#buttonMemeImg').src=state.buttonScore%50?'assets/dog-reaction.svg':'assets/cat-reaction.svg';
    $('#buttonMemeText').textContent=line;
    meme($('#buttonMemeImg').src,line);
    audio.beep(320+state.buttonScore*3,.05);
    if(state.buttonScore>=125){
      completeLevel(2,300,'You pressed the button five times. Congratulations, menace.');
    }
  }

  function randomSequence(len=4){
    return Array.from({length:len},()=>Math.floor(Math.random()*9));
  }

  function flashSequence(){
    state.memoryBusy=true;
    const tiles=$$('#memoryGrid button');
    state.memoryInput=[];
    $('#memoryStatus').textContent='watch closely...';
    state.memorySequence=randomSequence(Math.min(4+state.memoryRound-1,7));
    state.memorySequence.forEach((idx,i)=>{
      setTimeout(()=>{
        tiles.forEach(t=>t.classList.remove('lit'));
        tiles[idx].classList.add('lit');audio.beep(450+i*45,.06);
      },500*i+250);
      setTimeout(()=>tiles.forEach(t=>t.classList.remove('lit')),500*i+540);
    });
    setTimeout(()=>{state.memoryBusy=false;$('#memoryStatus').textContent='your turn.'},500*state.memorySequence.length+700);
  }

  function tileClick(event){
    if(state.memoryBusy||!state.memorySequence.length)return;
    const idx=Number(event.currentTarget.dataset.tile);
    const position=state.memoryInput.length;
    state.memoryInput.push(idx);
    event.currentTarget.classList.add('hit');setTimeout(()=>event.currentTarget.classList.remove('hit'),180);
    if(idx!==state.memorySequence[position]){
      event.currentTarget.classList.add('fail');setTimeout(()=>event.currentTarget.classList.remove('fail'),350);
      loseLife();state.memoryRound=1;$('#memoryRound').textContent='01';
      $('#memoryStatus').textContent='wrong. the cat has forgotten you.';
      meme('assets/cat-reaction.svg','cat memory: rejected.');
      state.memorySequence=[];return;
    }
    if(state.memoryInput.length===state.memorySequence.length){
      addScore(150+state.memoryRound*25);
      state.memoryRound++;
      $('#memoryRound').textContent=String(state.memoryRound).padStart(2,'0');
      state.memorySequence=[];
      $('#memoryStatus').textContent=state.memoryRound>3?'you survived the cat.':'correct. next round...';
      audio.beep(800,.1,'sine');
      if(state.memoryRound>3){
        completeLevel(3,0,'You survived the cat memory test. Honestly, impressive.');
      }else{
        setTimeout(flashSequence,800);
      }
    }
  }

  function creatorLogoClick(e){
    if(state.loginAttempts<3||state.screen!=='loginLevel')return;
    if(e.metaKey||e.ctrlKey)return;
    const now=Date.now();
    if(now-state.creatorTimer>1200)state.creatorClicks=0;
    state.creatorTimer=now;state.creatorClicks++;
    if(state.creatorClicks===1)toast('the logo is listening...');
    if(state.creatorClicks===2)toast('auxiliary channel detected.');
    if(state.creatorClicks===3)toast('one more strange input.');
    if(state.creatorClicks>3){state.creatorClicks=0;toast('channel reset.');}
  }

  function creatorSystem(e){
    if(state.loginAttempts<3||state.screen!=='loginLevel')return;
    if(e.shiftKey&&state.creatorClicks===3){
      state.creatorArmed=true;state.creatorIndex=0;
      toast('creator channel armed.');
      return;
    }
  }

  function handleCreatorKey(e){
    if(!state.creatorArmed||state.screen!=='loginLevel')return;
    const key=e.key.length===1?e.key.toUpperCase():e.key.toUpperCase();
    if(key===creatorCode[state.creatorIndex]){
      state.creatorIndex++;
      $('#loginOutput').className='terminal-output good';
      $('#loginOutput').textContent='> creator signal '+state.creatorIndex+'/'+creatorCode.length;
      if(state.creatorIndex===creatorKey.length){
        state.creatorArmed=false;loginWin('ARCHITECT');meme('assets/dog-reaction.svg','HOW DID YOU EVEN FIND THIS?');
      }
      return;
    }
    if(!['SHIFT','ALT','CONTROL','TAB'].includes(key)){
      state.creatorArmed=false;state.creatorIndex=0;
      $('#loginOutput').className='terminal-output bad';
      $('#loginOutput').textContent='> creator signal mismatch. channel reset.';
    }
  }

  $('#startBtn').addEventListener('click',startGame);
  $('#howBtn').addEventListener('click',showHow);
  $('#howBack').addEventListener('click',startGame);
  $('#resetBtn').addEventListener('click',resetRun);
  $('#playAgain').addEventListener('click',()=>showScreen('lobbyScreen'));
  $('#shareBtn').addEventListener('click',async()=>{
    const text='I survived PARADOX//ACCESS with a score of '+state.score+'.';
    try{await navigator.clipboard.writeText(text);toast('result copied.');}catch{toast(text)}
  });
  $('#soundBtn').addEventListener('click',()=>{
    state.sound=!state.sound;$('#soundBtn').textContent=state.sound?'🔊':'🔇';audio.beep(600,.06);
  });
  $('#gameLoginForm').addEventListener('submit',submitLogin);
  $('#guestLogin').addEventListener('click',()=>{ $('#gameUser').value='guest';$('#gamePass').value='paradox';submitLogin({preventDefault(){}});});
  $('#togglePass').addEventListener('click',()=>{
    const i=$('#gamePass');i.type=i.type==='password'?'text':'password';$('#togglePass').textContent=i.type==='password'?'show':'hide';
  });
  $('#dontPress').addEventListener('click',pressDanger);
  $('#memoryStart').addEventListener('click',flashSequence);
  $$('#memoryGrid button').forEach(b=>b.addEventListener('click',tileClick));
  $$('.level-card').forEach(card=>card.addEventListener('click',()=>{
    const level=Number(card.dataset.level);
    if(card.classList.contains('locked')){toast('locked. earn your way there.');return}
    if(level===1)startLevel1();
    if(level===2)startLevel2();
    if(level===3){state.memoryRound=1;$('#memoryRound').textContent='01';$('#memoryStatus').textContent='waiting for player...';showScreen('memoryLevel');}
  }));
  $$('[data-back]').forEach(b=>b.addEventListener('click',()=>{clearInterval(state.levelTimer);showScreen('lobbyScreen')}));
  $('.brand-chip').addEventListener('click',creatorLogoClick);
  document.addEventListener('click',e=>{if(e.target.closest('.brand-chip'))return;if(state.screen==='loginLevel')creatorSystem(e)});
  document.addEventListener('keydown',handleCreatorKey);

  updateHud();unlockCards();$('#fakePlayers').textContent=18+Math.floor(Math.random()*16);
})();