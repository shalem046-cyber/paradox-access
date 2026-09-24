(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const screens = ["login","welcome","game","ending"];

  const state = {
    attempts: 0,
    locked: false,
    logoClicks: 0,
    armed: false,
    keyIndex: 0,
    unlocked: false,
    chaos: 0,
    patience: 100,
    lastEvade: 0,
    mouse: {x: 0, y: 0},

    stage: 0,
    score: 0,
    lives: 3,
    time: 480,
    timer: null,
    hintUsed: false,
    sequence: [],
    sequenceInput: [],
    finalAttempts: 0
  };

  // Puzzle-only creator route. This is not real authentication.
  // After the system seals: click PARADOX//ACCESS x3, then type PARADOX.
  // Shift + status dot remains a backup creator channel.
  const creatorKey = atob("UEFSQURPWA==");

  const trollMessages = [
    "The interface noticed your cursor.",
    "That was close. The system disagrees.",
    "Please remain calm. The interface will not.",
    "Excellent technique. Wrong target.",
    "The box has learned your movement.",
    "You are approaching the wrong thing very confidently.",
    "System note: user frustration detected.",
    "This terminal has chosen self-preservation.",
    "Your persistence is statistically impressive.",
    "The interface would like some personal space."
  ];

  function show(id){
    screens.forEach(name => document.getElementById(name).classList.toggle("active", name === id));
  }

  function feedback(message, type = ""){
    const el = $("#console");
    if(!el) return;
    el.textContent = "> " + message;
    el.className = "console" + (type ? " " + type : "");
  }

  function setAttempts(){
    $("#attempts").textContent = "ATTEMPTS: " + state.attempts;
    $("#lockState").textContent = state.locked ? "LOCK: SEALED" : "LOCK: OPEN";
  }

  function updatePatience(cost = 0){
    state.chaos += cost;
    state.patience = Math.max(0, 100 - state.chaos);
    $("#patienceText").textContent = state.patience + "%";
    $("#patienceBar").style.width = state.patience + "%";

    if(state.patience < 70){
      $("#patienceBar").style.background = "linear-gradient(90deg,var(--amber),var(--red))";
      $("#patienceText").style.color = "var(--amber)";
    }
    if(state.patience < 35){
      $("#patienceBar").style.background = "var(--red)";
      $("#patienceText").style.color = "var(--red)";
      $("#intruderLine").textContent = "INTRUDERS: YOU ARE GETTING ANNOYING";
    }
  }

  function shakeTerminal(){
    const terminal = $("#authTerminal");
    terminal?.classList.remove("paradox-chaos");
    void terminal?.offsetWidth;
    terminal?.classList.add("paradox-chaos");
    setTimeout(() => terminal?.classList.remove("paradox-chaos"), 420);
  }

  function eventSafeX(){ return state.mouse.x; }
  function eventSafeY(){ return state.mouse.y; }

  function flee(el, power = 1){
    if(state.locked || state.unlocked || !el) return;

    const now = performance.now();
    if(now - state.lastEvade < 45) return;
    state.lastEvade = now;

    const rect = el.getBoundingClientRect();
    const dx = eventSafeX() - (rect.left + rect.width / 2);
    const dy = eventSafeY() - (rect.top + rect.height / 2);
    const dist = Math.max(1, Math.hypot(dx,dy));
    const awayX = -dx / dist;
    const awayY = -dy / dist;
    const jump = 150 + power * 48;

    const tx = Math.max(-280, Math.min(280, awayX * jump + (Math.random() - .5) * 90));
    const ty = Math.max(-150, Math.min(150, awayY * jump + (Math.random() - .5) * 65));

    el.style.position = "relative";
    el.style.zIndex = "8";
    el.style.transition = "transform 65ms cubic-bezier(.02,.96,.1,1)";
    el.style.transform = `translate3d(${tx}px,${ty}px,0)`;

    updatePatience(2 + Math.min(7,power));
  }

  function maybeSeal(){
    if(!state.locked && !state.unlocked && state.chaos >= 100){
      sealTerminal("system patience exhausted. congratulations.");
    }
  }

  function sealTerminal(reason){
    state.locked = true;
    setAttempts();
    $("#authTerminal")?.classList.add("locked");
    $("#accessBtn").disabled = true;
    $("#status").textContent = "SEALED";
    $("#signal").textContent = "● HOSTILE";
    $("#signal").style.color = "var(--red)";
    feedback(reason, "bad");
    shakeTerminal();
  }

  function fakeValidate(){
    if(state.locked || state.unlocked) return;

    const id = $("#accessId");
    const pass = $("#passcode");
    const hasId = id.value.trim().length >= 2;
    const hasPass = pass.value.trim().length >= 2;

    if(!hasId && !hasPass){
      feedback("You entered absolutely nothing. Bold strategy.");
      flee(id, 5);
      updatePatience(5);
      maybeSeal();
      return;
    }

    shakeTerminal();
    updatePatience(5);

    if(hasId && hasPass){
      feedback("credentials accepted... calculating regret...", "ok");
      setTimeout(() => {
        if(state.locked || state.unlocked) return;
        feedback("Nope. The system changed its mind.", "bad");
        $("#signal").textContent = "● MOCKING";
        $("#signal").style.color = "var(--amber)";
        flee(id, 6);
        flee(pass, 6);
        updatePatience(7);
        maybeSeal();
      }, 480);
      return;
    }

    const errors = [
      "ACCESS DENIED: incomplete effort.",
      "ACCESS DENIED: your password looked nervous.",
      "ACCESS DENIED: username passed. password failed the vibe check.",
      "ACCESS DENIED: system has chosen violence."
    ];
    feedback(errors[Math.min(state.attempts, errors.length - 1)], "bad");
    flee(id,4);
    flee(pass,4);
    state.attempts++;
    setAttempts();
    if(state.attempts >= 3) sealTerminal("direct path rejected. you were never supposed to use it.");
  }

  $("#accessBtn").addEventListener("click", fakeValidate);

  $("#passcode").addEventListener("keydown", e => {
    if(e.key === "Enter"){ e.preventDefault(); fakeValidate(); }
  });

  $("#accessId").addEventListener("focus", () => {
    if(state.locked || state.unlocked) return;
    feedback("ACCESS ID detected. Evasive behavior enabled.","bad");
    flee($("#accessId"),4);
  });

  $("#passcode").addEventListener("focus", () => {
    if(state.locked || state.unlocked) return;
    feedback("PASSCODE target acquired. Target relocating.","bad");
    flee($("#passcode"),5);
  });

  $("#accessId").addEventListener("input", () => {
    if(state.locked) return feedback("interesting. you are still typing into a sealed terminal.");
    const value = $("#accessId").value;
    if(value.length === 3) feedback("ACCESS ID accepted. Don't celebrate yet.","ok");
    if(value.length === 6){
      $("#accessId").value = value.slice(0,5);
      feedback("One character was returned to the void.","bad");
      updatePatience(5);
    }
  });

  $("#passcode").addEventListener("input", () => {
    if(state.locked || state.unlocked) return;
    const value = $("#passcode").value;
    if(value.length === 4) feedback("PASSCODE received. The machine is pretending to care.","ok");
    if(value.length === 7){
      $("#passcode").value = value.slice(0,3) + value.slice(4);
      feedback("A password character has mysteriously vanished.","bad");
      updatePatience(6);
    }
  });

  document.addEventListener("pointermove", event => {
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
    if(state.locked || state.unlocked) return;

    const targets = [
      {el:$("#accessId"),radius:125,power:4},
      {el:$("#passcode"),radius:135,power:5},
      {el:$("#accessBtn"),radius:150,power:6}
    ];

    for(const t of targets){
      if(!t.el) continue;
      const r=t.el.getBoundingClientRect();
      const d=Math.hypot(event.clientX-(r.left+r.width/2),event.clientY-(r.top+r.height/2));
      if(d<t.radius){
        flee(t.el,t.power);
        feedback(
          t.el === $("#accessBtn")
            ? (state.chaos<35 ? "The button detected your cursor." : state.chaos<65 ? "You are getting warmer. The button is not." : "At this point, the button is just bullying you.")
            : trollMessages[Math.floor(state.chaos/10)%trollMessages.length],
          "bad"
        );
        setTimeout(()=>{if(!state.locked&&!state.unlocked){t.el.style.transition="transform 260ms cubic-bezier(.2,.8,.2,1)";t.el.style.transform="translate3d(0,0,0)";}},1100);
        break;
      }
    }

    if(state.chaos>45){
      document.body.classList.add("paradox-chaos");
      setTimeout(()=>document.body.classList.remove("paradox-chaos"),180);
    }
    maybeSeal();
  });

  document.querySelector(".brand").addEventListener("click", () => {
    if(!state.locked || state.unlocked) return;
    state.logoClicks++;
    if(state.logoClicks===1) feedback("auxiliary channel listening...");
    else if(state.logoClicks===2) feedback("signal repeated. one more.");
    else if(state.logoClicks===3) feedback("channel primed. now stop clicking things.");
    else { state.logoClicks=0; feedback("channel desynchronised. start again.","bad"); }
  });

  $("#statusDot").addEventListener("click", event => {
    if(!state.locked || state.unlocked) return;
    if(event.shiftKey && state.logoClicks===3){
      state.armed=true; state.keyIndex=0;
      feedback("modified signal accepted. creator channel armed.");
      return;
    }
    if(state.logoClicks===3) feedback("wrong signal modifier. the system expected a different input.","bad");
  });

  document.addEventListener("keydown", event => {
    if(!state.locked || state.unlocked) return;
    const key=event.key.length===1?event.key.toUpperCase():event.key.toUpperCase();

    if(state.logoClicks===3 && !state.armed){
      if(key===creatorKey[state.keyIndex]){
        state.keyIndex++;
        feedback("auxiliary creator channel: "+state.keyIndex+"/"+creatorKey.length);
        if(state.keyIndex===creatorKey.length) unlock();
        return;
      }
      if(!["SHIFT","CONTROL","ALT"].includes(key)){
        state.keyIndex=0;
        feedback("wrong creator signal. sequence reset.","bad");
        return;
      }
    }

    if(!state.armed) return;

    if(key===creatorKey[state.keyIndex]){
      state.keyIndex++;
      feedback("creator channel: "+state.keyIndex+"/"+creatorKey.length);
      if(state.keyIndex===creatorKey.length) unlock();
      return;
    }

    if(!["SHIFT","CONTROL","ALT"].includes(key)){
      state.keyIndex=0; state.armed=false;
      feedback("creator signal mismatch. channel reset.","bad");
    }
  });

  function unlock(){
    state.unlocked=true; state.locked=false; state.armed=false;
    $("#status").textContent="ONLINE";
    $("#signal").textContent="● ONLINE";
    $("#signal").style.color="var(--green)";
    $("#lockState").textContent="LOCK: OVERRIDE";
    $("#accessBtn").textContent="ACCESS GRANTED";
    $("#console").className="console ok";
    $("#patienceText").textContent="OVERRIDE";
    $("#patienceBar").style.width="100%";
    $("#patienceBar").style.background="var(--green)";
    $("#intruderLine").textContent="INTRUDERS: ARCHITECT IDENTIFIED";
    feedback("creator override accepted. welcome, architect.","ok");
    $("#welcomeText").textContent="You did not defeat the password. You survived the interface.";
    show("welcome");
  }

  // =========================
  // FULL GAME
  // =========================
  const TOTAL_STAGES = 6;

  function pad2(n){ return String(n).padStart(2,"0"); }
  function formatTime(sec){ return pad2(Math.floor(sec/60))+":"+pad2(sec%60); }

  function startGame(){
    clearInterval(state.timer);
    state.stage=1;
    state.score=0;
    state.lives=3;
    state.time=480;
    state.hintUsed=false;
    state.sequence=[];
    state.sequenceInput=[];
    state.finalAttempts=0;

    $("#status").textContent="GAME";
    $("#eventLog").innerHTML="";
    logEvent("PARADOX ENGINE ONLINE.");
    logEvent("Six stages. One system. No second chances—mostly.");
    updateHUD();

    clearInterval(state.timer);
    state.timer=setInterval(() => {
      state.time--;
      updateHUD();
      if(state.time<=0) endGame(false,"TIME EXPIRED","The paradox did not run out of answers. You ran out of time.");
    },1000);

    show("game");
    renderStage();
  }

  function updateHUD(){
    $("#stageCount").textContent=state.stage+" / "+TOTAL_STAGES;
    $("#score").textContent=String(state.score).padStart(4,"0");
    $("#lives").textContent="♥".repeat(state.lives)+"♡".repeat(3-state.lives);
    $("#gameTimer").textContent=formatTime(Math.max(0,state.time));
    $("#gameTimer").style.color=state.time<60?"var(--red)":"var(--cyan)";
    $("#progressBar").style.width=((state.stage/TOTAL_STAGES)*100)+"%";

    const mood=Math.min(100,Math.max(8,20+state.stage*12+(3-state.lives)*15));
    $("#moodBar").style.width=mood+"%";
    $("#moodValue").textContent=mood<40?"CALM":mood<70?"CURIOUS":mood<90?"HOSTILE":"FERAL";
    $("#moodText").textContent=
      mood<40?"The system is pretending to cooperate."
      :mood<70?"It has noticed you are persistent."
      :mood<90?"It is now actively questioning your choices."
      :"The interface is no longer emotionally neutral.";
  }

  function logEvent(msg){
    const el=$("#eventLog");
    const row=document.createElement("div");
    row.textContent="> "+msg;
    el.prepend(row);
    while(el.children.length>7) el.lastChild.remove();
  }

  function stageFrame(kicker,title,copy,content){
    $("#stageEyebrow").textContent=kicker;
    $("#stageTitle").textContent=title;
    $("#stageDescription").textContent=copy;
    $("#gamePanel").innerHTML=content;
  }

  function renderStage(){
    state.hintUsed=false;
    updateHUD();

    if(state.stage===1) stage1();
    if(state.stage===2) stage2();
    if(state.stage===3) stage3();
    if(state.stage===4) stage4();
    if(state.stage===5) stage5();
    if(state.stage===6) stage6();
  }

  function reward(points, message){
    state.score += Math.max(0,points);
    logEvent(message);
    updateHUD();
    flash();
  }

  function fail(reason){
    state.lives--;
    state.score=Math.max(0,state.score-60);
    logEvent("PENALTY: "+reason);
    feedback(reason,"bad");
    flash(true);
    updateHUD();

    if(state.lives<=0){
      setTimeout(()=>endGame(false,"NODE SEALED","Three lives. Zero excuses."),500);
      return false;
    }
    return true;
  }

  function nextStage(delay=500){
    setTimeout(()=>{
      if(state.lives>0){
        state.stage++;
        renderStage();
      }
    },delay);
  }

  function flash(red=false){
    const fx=$("#fx");
    fx.classList.add("active");
    fx.style.background=red
      ? "radial-gradient(circle,rgba(255,99,123,.14),transparent 35%)"
      : "radial-gradient(circle,rgba(114,233,255,.12),transparent 35%)";
    setTimeout(()=>fx.classList.remove("active"),160);
  }

  function requestHint(){
    if(state.hintUsed) {
      toast("The hint buffer is empty. The system is judging you now.");
      return;
    }
    state.hintUsed=true;
    state.time=Math.max(0,state.time-15);

    const hints={
      1:"Not every node that says STABLE is stable. Read the metadata, not the label.",
      2:"The sequence is shown once. Watch the order, then repeat it exactly.",
      3:"Base64 is not encryption. Decode the packet.",
      4:"Start with XOR. Then read the resulting bits left to right.",
      5:"Exactly one door statement is true. Test the three possibilities.",
      6:"Read the recovered words as a sentence. The obvious sentence is wrong."
    };
    logEvent("SYSTEM TRACE: "+hints[state.stage]);
    toast("Hint extracted. -15 sec.");
    updateHUD();
  }

  $("#panicBtn").addEventListener("click",requestHint);

  function stage1(){
    stageFrame(
      "PARADOX CHAMBER // 01",
      "THE TRUST PROBLEM",
      "One node is safe. The labels are designed to make you click the wrong thing.",
      `
      <div class="challenge-head"><div>
        <div class="challenge-kicker">RECOVERY BOARD / SOURCE CHECK</div>
        <div class="challenge-title">Which node is actually stable?</div>
        <div class="challenge-copy">The system displays six nodes. Only one has a valid checksum relationship. Do not trust the large label.</div>
      </div></div>
      <div class="choice-grid challenge-area" id="nodeChoices">
        <button class="choice" data-node="A"><small>NODE-A / 71</small><strong>STABLE</strong></button>
        <button class="choice" data-node="B"><small>NODE-B / 42</small><strong>STABLE</strong></button>
        <button class="choice" data-node="C"><small>NODE-C / 17</small><strong>UNSTABLE</strong></button>
        <button class="choice" data-node="D"><small>NODE-D / 84</small><strong>STABLE</strong></button>
        <button class="choice" data-node="E"><small>NODE-E / 29</small><strong>STABLE</strong></button>
        <button class="choice" data-node="F"><small>NODE-F / 56</small><strong>DECOY</strong></button>
      </div>
      <div class="micro-note">VERIFICATION RULE: NODE NUMBER × 2 + 3 must equal its displayed checksum.</div>
      <div class="action-row"><button class="action-btn danger" id="obviousBtn">CLICK THE OBVIOUS ONE</button></div>
      <div id="stageFeedback" class="feedback-box"></div>`
    );

    const correct="B";
    $$(".choice").forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(btn.dataset.node===correct){
          btn.classList.add("good");
          $("#stageFeedback").className="feedback-box good";
          $("#stageFeedback").textContent="CHECKSUM VERIFIED. NODE-B was the only valid relationship.";
          reward(250,"Stage 01 recovered. You trusted the relationship, not the label.");
          nextStage();
        }else{
          btn.classList.add("bad");
          fail("Wrong node. The interface says thanks for proving its point.");
        }
      });
    });

    $("#obviousBtn").addEventListener("click",()=>{
      fail("The button literally said OBVIOUS. You clicked it anyway.");
      $("#stageFeedback").className="feedback-box bad";
      $("#stageFeedback").textContent="DECOY TRIGGERED.";
    });
  }

  function stage2(){
    state.sequence=Array.from({length:4},()=>Math.floor(Math.random()*4));
    state.sequenceInput=[];

    stageFrame(
      "PARADOX CHAMBER // 02",
      "MEMORY LEAK",
      "The system will flash a four-step signal. Repeat it without blinking.",
      `
      <div class="challenge-head"><div>
        <div class="challenge-kicker">NEURAL BUFFER / 4-BIT ORDER</div>
        <div class="challenge-title">Watch the signal.</div>
        <div class="challenge-copy">A blue flash is not the answer. The order is.</div>
      </div></div>
      <div class="sequence" id="sequenceView">
        <div class="seq-node">01</div><div class="seq-node">02</div><div class="seq-node">03</div><div class="seq-node">04</div>
      </div>
      <div class="pad" id="memoryPad">
        <button data-pad="0">NORTH</button><button data-pad="1">EAST</button>
        <button data-pad="2">SOUTH</button><button data-pad="3">WEST</button>
      </div>
      <div class="timer-note"><span>INPUT BUFFER</span><span id="memoryStatus">WATCHING...</span></div>
      <div id="stageFeedback" class="feedback-box"></div>`
    );

    const nodes=$$(".seq-node");
    const buttons=$$("#memoryPad button");

    let i=0;
    const play=()=>{
      if(i>=state.sequence.length){
        $("#memoryStatus").textContent="YOUR TURN";
        return;
      }
      const idx=state.sequence[i];
      nodes[idx].classList.add("flash");
      setTimeout(()=>nodes[idx].classList.remove("flash"),320);
      i++;
      setTimeout(play,520);
    };
    setTimeout(play,700);

    buttons.forEach(btn=>{
      btn.addEventListener("click",()=>{
        const idx=Number(btn.dataset.pad);
        state.sequenceInput.push(idx);
        const expected=state.sequence[state.sequenceInput.length-1];

        if(idx!==expected){
          fail("Memory mismatch. Your brain has submitted a formal complaint.");
          state.sequenceInput=[];
          $("#memoryStatus").textContent="RESET — WATCH AGAIN";
          i=0;
          setTimeout(play,650);
          return;
        }

        if(state.sequenceInput.length===state.sequence.length){
          $("#memoryStatus").textContent="BUFFER VERIFIED";
          $("#stageFeedback").className="feedback-box good";
          $("#stageFeedback").textContent="Sequence accepted. Your short-term memory survived.";
          reward(300,"Stage 02 recovered. Memory buffer synchronized.");
          nextStage();
        }
      });
    });
  }

  function stage3(){
    stageFrame(
      "PARADOX CHAMBER // 03",
      "DEAD PACKET",
      "A captured packet survived the crash. It is encoded, not encrypted.",
      `
      <div class="challenge-head"><div>
        <div class="challenge-kicker">PACKET 03 / BASE64</div>
        <div class="challenge-title">Decode the corpse.</div>
        <div class="challenge-copy">Packet payload:</div>
      </div></div>
      <div class="final-phrase"><span>VEhF</span> <span>UEFSQURPWA==</span></div>
      <div class="micro-note">Expected output: one two-word command. Uppercase.</div>
      <div class="code-entry challenge-area">
        <input id="packetAnswer" placeholder="ENTER DECODED COMMAND" autocomplete="off" />
        <button id="packetBtn" class="action-btn primary">VERIFY PACKET</button>
      </div>
      <div id="stageFeedback" class="feedback-box"></div>`
    );

    $("#packetBtn").addEventListener("click",()=>{
      const answer=$("#packetAnswer").value.trim().toUpperCase().replace(/\s+/g," ");
      if(answer==="THE PARADOX"){
        $("#stageFeedback").className="feedback-box good";
        $("#stageFeedback").textContent="PACKET DECODED. That message was not subtle.";
        reward(350,"Stage 03 recovered. Base64 packet decoded.");
        nextStage();
      }else{
        fail("Packet rejected. The encoding was the clue.");
        $("#stageFeedback").className="feedback-box bad";
        $("#stageFeedback").textContent="DECODE MISMATCH.";
      }
    });
    $("#packetAnswer").addEventListener("keydown",e=>{if(e.key==="Enter") $("#packetBtn").click();});
  }

  function stage4(){
    stageFrame(
      "PARADOX CHAMBER // 04",
      "LOGIC RELAY",
      "Four bits are hidden behind three gates. Work left to right.",
      `
      <div class="challenge-head"><div>
        <div class="challenge-kicker">DIGITAL LOGIC / XOR / AND / NOT</div>
        <div class="challenge-title">Build the relay state.</div>
        <div class="challenge-copy">Inputs: A = 1, B = 0, C = 1, D = 1. Output bits are G1=A XOR B, G2=C AND D, G3=G1 XOR G2, G4=NOT G2.</div>
      </div></div>
      <div class="choice-grid challenge-area">
        <div class="choice"><small>G1</small><strong>?</strong><p>A XOR B</p></div>
        <div class="choice"><small>G2</small><strong>?</strong><p>C AND D</p></div>
        <div class="choice"><small>G3</small><strong>?</strong><p>G1 XOR G2</p></div>
        <div class="choice"><small>G4</small><strong>?</strong><p>NOT G2</p></div>
      </div>
      <div class="code-entry challenge-area">
        <input id="logicAnswer" maxlength="4" inputmode="numeric" placeholder="4-BIT OUTPUT" />
        <button id="logicBtn" class="action-btn primary">TEST RELAY</button>
      </div>
      <div id="stageFeedback" class="feedback-box"></div>`
    );

    $("#logicBtn").addEventListener("click",()=>{
      const answer=$("#logicAnswer").value.trim();
      if(answer==="1010"){
        $("#stageFeedback").className="feedback-box good";
        $("#stageFeedback").textContent="RELAY OPEN. XOR did not betray you this time.";
        reward(400,"Stage 04 recovered. Logic relay accepted.");
        nextStage();
      }else{
        fail("Relay rejected. Recalculate the gates.");
        $("#stageFeedback").className="feedback-box bad";
        $("#stageFeedback").textContent="WRONG 4-BIT STATE.";
      }
    });
    $("#logicAnswer").addEventListener("keydown",e=>{if(e.key==="Enter") $("#logicBtn").click();});
  }

  function stage5(){
    stageFrame(
      "PARADOX CHAMBER // 05",
      "THE THREE DOORS",
      "Exactly one door statement is true. Choose the safe door.",
      `
      <div class="challenge-head"><div>
        <div class="challenge-kicker">DECEPTION GRID / SINGLE-TRUTH RULE</div>
        <div class="challenge-title">One door is safe.</div>
        <div class="challenge-copy">A says “B is safe.” B says “B is not safe.” C says “A is safe.” Exactly one statement is true.</div>
      </div></div>
      <div class="door-grid">
        <button class="door" data-door="A"><div class="door-symbol">◇</div><h4>DOOR A</h4><p>B is safe.</p></button>
        <button class="door" data-door="B"><div class="door-symbol">◈</div><h4>DOOR B</h4><p>B is not safe.</p></button>
        <button class="door" data-door="C"><div class="door-symbol">◆</div><h4>DOOR C</h4><p>A is safe.</p></button>
      </div>
      <div id="stageFeedback" class="feedback-box"></div>`
    );

    $$(".door").forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(btn.dataset.door==="B"){
          btn.style.borderColor="var(--green)";
          $("#stageFeedback").className="feedback-box good";
          $("#stageFeedback").textContent="DOOR B IS SAFE. Exactly one statement was true.";
          reward(450,"Stage 05 recovered. Deception grid solved.");
          nextStage();
        }else{
          fail("Wrong door. The system has opened a very educational trap.");
          $("#stageFeedback").className="feedback-box bad";
          $("#stageFeedback").textContent="TRAP DOOR.";
        }
      });
    });
  }

  function stage6(){
    stageFrame(
      "PARADOX CHAMBER // 06",
      "THE FINAL PARADOX",
      "Everything you recovered was meant to point here. Reconstruct the sentence.",
      `
      <div class="challenge-head"><div>
        <div class="challenge-kicker">FINAL TERMINAL / NO MAP</div>
        <div class="challenge-title">What was the real password?</div>
        <div class="challenge-copy">The login screen lied. The clues did not. Read the fragments and answer with the sentence that explains the whole system.</div>
      </div></div>

      <div class="cards" style="margin-top:22px;grid-template-columns:repeat(3,1fr)">
        <article class="card"><span>FRAGMENT 01</span><h3>YOU</h3><p>Not the credential. The investigator.</p></article>
        <article class="card"><span>FRAGMENT 02</span><h3>UNDERSTOOD</h3><p>Not the password. The behavior.</p></article>
        <article class="card"><span>FRAGMENT 03</span><h3>THE SYSTEM</h3><p>The interface was always the puzzle.</p></article>
      </div>

      <div class="code-entry challenge-area">
        <input id="finalAnswer" placeholder="ENTER FINAL SENTENCE" autocomplete="off" />
        <button id="finalBtn" class="action-btn primary">OVERRIDE PARADOX</button>
      </div>
      <div class="micro-note">Hint hidden in the obvious sentence: “The login was the first puzzle.”</div>
      <div id="stageFeedback" class="feedback-box"></div>`
    );

    $("#finalBtn").addEventListener("click",submitFinal);
    $("#finalAnswer").addEventListener("keydown",e=>{if(e.key==="Enter") submitFinal();});
  }

  function submitFinal(){
    const value=$("#finalAnswer").value.trim().toUpperCase().replace(/\s+/g," ");
    const answers=[
      "THE SYSTEM WAS THE PASSWORD",
      "THE INTERFACE WAS THE PASSWORD",
      "THE INTERFACE IS THE PASSWORD"
    ];

    state.finalAttempts++;

    if(answers.includes(value)){
      reward(700,"Final paradox accepted.");
      setTimeout(()=>endGame(true,"PARADOX BROKEN","You did not find a password. You found the rule the password was hiding."),650);
      return;
    }

    fail("That sentence explains the wrong paradox.");
    $("#stageFeedback").className="feedback-box bad";
    $("#stageFeedback").textContent="FINAL OVERRIDE REJECTED. Read the fragments again.";
  }

  function endGame(win,title,text){
    clearInterval(state.timer);
    state.timer=null;
    show("ending");

    $("#endingTitle").textContent=title;
    $("#endingText").textContent=text;

    const grade = state.score>=2100 ? "ARCHITECT" : state.score>=1500 ? "OPERATOR" : "SURVIVOR";
    $("#endingStats").innerHTML=`
      <span class="stat-chip">RANK ${grade}</span>
      <span class="stat-chip">SCORE ${String(state.score).padStart(4,"0")}</span>
      <span class="stat-chip">TIME ${formatTime(Math.max(0,state.time))}</span>
      <span class="stat-chip">LIVES ${state.lives}/3</span>
      <span class="stat-chip">STAGE ${win ? "6/6" : state.stage+"/6"}</span>
    `;
    $("#status").textContent=win?"OVERRIDDEN":"SEALED";
    $("#status").style.color=win?"var(--green)":"var(--red)";
  }

  function toast(message){
    const el=$("#toast");
    el.textContent=message;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t=setTimeout(()=>el.classList.remove("show"),2200);
  }

  $("#enterGame").addEventListener("click",startGame);

  $("#replayBtn").addEventListener("click",()=>{
    state.unlocked=true;
    startGame();
  });

  window.addEventListener("blur",()=>{
    if(!state.locked && !state.unlocked){
      feedback("Focus lost. The machine has filed that under suspicious behavior.");
    }
  });

  $("#patienceBar").style.width="100%";
  $("#patienceText").textContent="100%";
})();