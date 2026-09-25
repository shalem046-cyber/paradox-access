(() => {
  const $=s=>document.querySelector(s);
  const form=$('#loginForm'),user=$('#username'),pass=$('#password'),button=$('#loginButton'),card=$('#card');
  const zone=$('#fakeZone'),message=$('#message'),session=$('#session'),attemptsEl=$('#attempts'),wrongEl=$('#wrongClicks');
  const eyebrow=$('#eyebrow'),subtitle=$('#subtitle'),userLabel=$('#userLabel'),passLabel=$('#passLabel'),systemStatus=$('#systemStatus');
  const modal=$('#memeModal'),memeImg=$('#memeImg'),memeTitle=$('#memeTitle'),memeCaption=$('#memeCaption'),memeClose=$('#memeClose');
  let attempts=0,wrong=0,submitting=false,fakeCount=0,escapeCount=0,creatorUnlocked=false;

  // Creator credentials for this demo. This is client-side, so it is NOT real security.
  const CREATOR_ID='ARCHITECT';
  const CREATOR_KEY='PX//7F-ACCESS';
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const memes=[
    {src:'assets/memes/reaction-1.jpg',fallback:'assets/cat-reaction.svg',title:'BRO WHAT ARE YOU DOING?',caption:'You clicked the fake button. On purpose.'},
    {src:'assets/memes/reaction-2.jpg',fallback:'assets/dog-reaction.svg',title:'AYYO 😭',caption:'The real button was literally right there.'}
  ];
  const roastLines=[
    'BRO… THE BUTTON WAS NOT THAT HARD TO FIND 😭',
    'You have defeated absolutely nothing. Congratulations.',
    'That was a decoy. Your confidence is impressive though.',
    'PARADOX//ACCESS: watching you make the same mistake again.',
    'You clicked it. The terminal has receipts.',
    'Please stop helping the fake buttons.',
    'At this point the login page is playing against you.',
    'Wrong button. Again. This is becoming a tradition.',
    'The interface is not broken. Your decision-making is being tested.',
    'You are currently losing an argument with a website.',
    'System note: user continues to press suspicious rectangles.',
    'Architect somewhere is probably laughing right now.',
    'Nope. Not that one either. 😭',
    'You saw a glowing button and immediately trusted it. Incredible.',
    'The decoy has more wins than you do.'
  ];
  const fakeLabels=['CONTINUE','I AM HUMAN','VERIFY','LOGIN','UNLOCK','ACCESS','SKIP','YES','REAL LOGIN','CONFIRM','FIX ERROR','FREE ACCESS','CLICK ME','NOT A TRAP'];
  const fakeMessages=roastLines;

  function setMessage(t,type='error'){message.className='message '+type;message.textContent=t}
  function glitch(){card.classList.remove('glitch');void card.offsetWidth;card.classList.add('glitch')}
  function bad(el){el.classList.remove('bad');void el.offsetWidth;el.classList.add('bad');setTimeout(()=>el.classList.remove('bad'),700)}
  function jumpField(el){
    if(creatorUnlocked||submitting)return;
    el.classList.remove('field-jump');void el.offsetWidth;el.classList.add('field-jump');
    setTimeout(()=>el.classList.remove('field-jump'),520);
  }
  function update(){attemptsEl.textContent='ATTEMPTS: '+attempts;wrongEl.textContent=wrong}
  function closeMeme(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
  memeClose.addEventListener('click',closeMeme);
  modal.addEventListener('click',e=>{if(e.target.classList.contains('meme-backdrop'))closeMeme()});

  function showMeme(){
    const m=memes[(wrong-1)%memes.length];
    memeImg.onerror=()=>{memeImg.onerror=null;memeImg.src=m.fallback};
    memeImg.src=m.src;
    memeTitle.textContent=pick([m.title,...roastLines.slice(0,6)]);
    memeCaption.textContent=wrong<3?m.caption:pick([
      'You have officially lost to a login page.',
      'The decoys are now bullying you.',
      'This is becoming personal.',
      'PARADOX//ACCESS: 1 — YOU: 0'
    ]);
    modal.classList.add('show');modal.setAttribute('aria-hidden','false');
    glitch();card.classList.add('rage');setTimeout(()=>card.classList.remove('rage'),350);
    setTimeout(closeMeme,1900);
  }

  function clearFakes(){zone.innerHTML='';fakeCount=0}
  function clearTypedCredentials(){
    user.value='';
    pass.value='';
    userLabel.textContent='IDENTIFIER';
    passLabel.textContent='ACCESS KEY';
    pass.placeholder='Enter access key';
    setTimeout(()=>user.focus(),40);
  }

  function spawnFake(n=2){
    const rect=card.getBoundingClientRect(),mobile=innerWidth<600;
    for(let i=0;i<n&&fakeCount<10;i++){
      const b=document.createElement('button');
      b.type='button';b.className='fake-btn';b.textContent=pick(fakeLabels);
      const left=Math.max(8,Math.min(rect.width-110,Math.random()*(rect.width-120)));
      const top=Math.max(125,Math.min(rect.height-70,Math.random()*(rect.height-175)));
      b.style.left=left+'px';b.style.top=top+'px';
      const dodge=()=>{
        if(creatorUnlocked||submitting)return;
        const r=card.getBoundingClientRect();
        const maxX=Math.max(12,card.clientWidth-b.offsetWidth-12);
        const maxY=Math.max(145,card.clientHeight-b.offsetHeight-18);
        let nx=Math.random()*maxX,ny=125+Math.random()*Math.max(20,maxY-125);
        const currentX=parseFloat(b.style.left)||0,currentY=parseFloat(b.style.top)||0;
        if(Math.hypot(nx-currentX,ny-currentY)<90){nx=Math.min(maxX,currentX+120);ny=Math.min(maxY,currentY+65);}
        b.style.left=nx+'px';b.style.top=ny+'px';
        b.classList.remove('jump');void b.offsetWidth;b.classList.add('jump');
        setMessage(pick([
          'NOPE. YOU ALMOST GOT IT 😭',
          'TOO SLOW.',
          'NICE TRY. WRONG BUTTON.',
          'BRO THOUGHT IT COULD CLICK ME.',
          'THE BUTTON SAID “RUN.”',
          'WHY ARE YOU CHASING THE DECOY?',
          'MISSED. AGAIN. 😭'
        ]),'warn');
        systemStatus.textContent='DECOY EVASION ACTIVE';
      };
      b.addEventListener('mouseenter',()=>{if(innerWidth>=600)dodge()});
      b.addEventListener('touchstart',e=>{e.preventDefault();dodge()},{passive:false});
      b.addEventListener('click',()=>{
        wrong++;update();showMeme();
        setMessage(pick(fakeMessages),'warn');systemStatus.textContent='SYSTEM MOCKING YOU';
        b.remove();fakeCount--;
        if(wrong%2===0)spawnFake(Math.min(3,1+Math.floor(wrong/3)));
        if(wrong>=4)subtitle.textContent='There are fake buttons everywhere now. And yes, they are avoiding you.';
      });
      if(mobile)b.style.minWidth='74px';
      zone.appendChild(b);fakeCount++;
    }
  }

  function moveRealButton(){
    const x=(Math.random()*70-35),y=(Math.random()*22-11);
    button.style.transform='translate('+x+'px,'+y+'px)';
    escapeCount++;
    setMessage(pick(['THE REAL BUTTON PANICKED.','STOP CHASING IT.','AUTHENTICATE // TRY AGAIN','IT MOVED. OF COURSE IT MOVED.']),'warn');
  }
  button.addEventListener('mouseenter',()=>{if(attempts>=2&&!submitting&&escapeCount<4)moveRealButton()});
  document.addEventListener('mousemove',e=>{
    if(attempts<3||submitting||escapeCount>=7)return;
    const r=button.getBoundingClientRect();
    const d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));
    if(d<70)moveRealButton();
  });

  // Hidden creator shortcut: press Ctrl + Shift + L to bypass the trolling layer.\n  document.addEventListener('keydown',e=>{\n    if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='l'){\n      e.preventDefault();\n      if(!creatorUnlocked)grantAccess();\n    }\n  });\n\n  user.addEventListener('focus',()=>{if(attempts>=1)jumpField(user)});
  pass.addEventListener('focus',()=>{if(attempts>=1)jumpField(pass)});
  user.addEventListener('input',()=>{
    if(attempts>=1&&Math.random()<0.22)jumpField(user);
    if(user.value.length===4){userLabel.textContent='IDENTIFIER (KEEP GOING...)';subtitle.textContent='The terminal has noticed you. That was a mistake.'}
    if(user.value.length===8)userLabel.textContent='IDENTIFIER (STILL WRONG)';
  });
  pass.addEventListener('focus',()=>{pass.placeholder=pick(['Enter access key','No, the other one','You know the password','This field is judging you'])});
  pass.addEventListener('input',()=>{
    if(attempts>=1&&Math.random()<0.22)jumpField(pass);
    if(pass.value.length===5){passLabel.textContent='ACCESS KEY (SERIOUSLY?)';bad(pass)}
  });
  pass.addEventListener('keydown',e=>{if(e.getModifierState&&e.getModifierState('CapsLock'))setMessage('CAPS LOCK DETECTED // OF COURSE','warn')});

  function grantAccess(){
    creatorUnlocked=true;
    submitting=false;
    button.disabled=false;
    button.style.transform='';
    clearFakes();
    session.textContent='GRANTED';
    session.style.color='var(--lime)';
    systemStatus.textContent='CREATOR ACCESS';
    systemStatus.style.color='var(--lime)';
    eyebrow.textContent='AUTHORITY VERIFIED // CREATOR MODE';
    subtitle.textContent='The trolling layer has been disabled. You actually know what you are doing.';
    setMessage('ACCESS GRANTED // WELCOME, ARCHITECT.','success');
    button.textContent='ACCESS GRANTED ✓';
    button.classList.add('granted');
    user.value=CREATOR_ID;
    pass.value='';
    user.disabled=true;
    pass.disabled=true;
    zone.style.pointerEvents='none';
    card.classList.remove('rage');
    card.classList.add('creator');
    window.setTimeout(()=>button.classList.remove('granted'),900);
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault();if(submitting)return;
    attempts++;update();glitch();card.classList.add('rage');setTimeout(()=>card.classList.remove('rage'),280);
    const identifier=user.value.trim(),key=pass.value.trim();
    if(identifier.toUpperCase()===CREATOR_ID && key===CREATOR_KEY){
      grantAccess();
      return;
    }
    if(!identifier||!key){
      setMessage(pick(['AUTHENTICATION ERROR // SOMETHING IS MISSING','EMPTY FIELD // IMPRESSIVE','SYSTEM ERROR // TRY USING YOUR EYES']));
      session.textContent='BLOCKED';if(!identifier)bad(user);if(!key)bad(pass);jumpField(user);jumpField(pass);spawnFake(Math.min(3,1+attempts));
      setTimeout(clearTypedCredentials,220);
      return;
    }

    submitting=true;button.disabled=true;
    const stages=['CONTACTING NODE...','CHECKING CREDENTIALS...','RECHECKING CREDENTIALS...','DOUBTING YOUR EXISTENCE...'];
    for(let i=0;i<stages.length;i++){
      button.textContent=i===3?'PLEASE WAIT...':'CHECKING...';
      setMessage(stages[i]+' '+((i+1)*25)+'%','warn');
      await new Promise(r=>setTimeout(r,220+i*70));
    }

    submitting=false;button.disabled=false;button.textContent='AUTHENTICATE →';
    setMessage(pick(['ACCESS DENIED // WRONG REALITY.','ACCESS DENIED // THAT WAS VERY CONFIDENT.','ACCESS DENIED // PARADOX WINS.','NOPE. STILL WRONG.']),'error');
    session.textContent=attempts>=3?'LOOPING':'REJECTED';bad(pass);
    jumpField(user);jumpField(pass);
    clearTypedCredentials();

    if(attempts===1){
      clearFakes();
      spawnFake(3);
      subtitle.textContent='Fine. Now there are buttons that look useful.';
    }else if(attempts===2){
      clearFakes();
      spawnFake(5);
      moveRealButton();
      eyebrow.textContent='RESTRICTED TERMINAL // DECOYS DEPLOYED';
      subtitle.textContent='Five buttons. One real control. Probably.';
    }else{
      clearFakes();
      spawnFake(Math.min(12,6+attempts-2));
      moveRealButton();
      systemStatus.textContent='SYSTEM: ENJOYING THIS';
      subtitle.textContent=pick([
        'The interface is getting worse. You are still clicking.',
        'More decoys deployed. You keep volunteering for this.',
        'Congratulations. You unlocked the annoying version.',
        'The terminal has run out of patience. Apparently you have not.',
        'You could stop. You have chosen not to. Fascinating.'
      ]);
      setMessage(pick(roastLines),'error');
      if(attempts>=4)eyebrow.textContent='RESTRICTED TERMINAL // ABSOLUTELY NOT';
    }
  });

  window.addEventListener('resize',()=>{
    zone.querySelectorAll('.fake-btn').forEach(b=>{
      b.style.left=Math.min(parseFloat(b.style.left)||8,card.clientWidth-85)+'px';
    });
  });
  update();
})();