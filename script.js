(() => {
  const $ = (s) => document.querySelector(s);
  const screens = ["login","welcome","experience"];

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
    velocity: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 }
  };

  // Puzzle-only creator route. This is not real authentication.
  // Secret path: logo x3 -> Shift + status dot -> PARADOX.
  const creatorKey = atob("UEFSQURPWA==");

  const messages = [
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
    if(state.patience <= 0 && !state.locked){
      sealTerminal("system patience exhausted. congratulations.");
    }
  }

  function shakeTerminal(){
    const terminal = document.querySelector(".terminal");
    terminal.classList.remove("paradox-chaos");
    void terminal.offsetWidth;
    terminal.classList.add("paradox-chaos");
    setTimeout(() => terminal.classList.remove("paradox-chaos"), 420);
  }

  function boundsFor(el){
    const body = document.querySelector(".terminal-body");
    const bodyRect = body.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
      body,
      bodyRect,
      rect,
      minX: 0,
      minY: 0,
      maxX: Math.max(0, bodyRect.width - rect.width),
      maxY: Math.max(0, bodyRect.height - rect.height)
    };
  }

  function flee(el, power = 1){
    if(state.locked || state.unlocked || !el) return;

    const now = performance.now();
    if(now - state.lastEvade < 42) return;
    state.lastEvade = now;

    const b = boundsFor(el);

    const dx = (eventSafeMouseX() - (b.rect.left + b.rect.width / 2));
    const dy = (eventSafeMouseY() - (b.rect.top + b.rect.height / 2));
    const dist = Math.max(1, Math.hypot(dx,dy));
    const awayX = -dx / dist;
    const awayY = -dy / dist;

    const jump = 130 + power * 48;
    let tx = awayX * jump + (Math.random() - .5) * 80;
    let ty = awayY * jump + (Math.random() - .5) * 55;

    tx = Math.max(-260, Math.min(260, tx));
    ty = Math.max(-140, Math.min(140, ty));

    el.style.position = "relative";
    el.style.zIndex = "8";
    el.style.transition = "transform 70ms cubic-bezier(.02,.96,.1,1)";
    el.style.transform = `translate3d(${tx}px,${ty}px,0)`;

    updatePatience(2 + Math.min(7, power));
    document.documentElement.style.setProperty("--cx", (state.mouse.x / innerWidth * 100) + "%");
    document.documentElement.style.setProperty("--cy", (state.mouse.y / innerHeight * 100) + "%");
    $("#intruderLine").style.color = "var(--red)";
    setTimeout(() => {
      if(!state.locked && !state.unlocked){
        $("#intruderLine").style.color = "";
      }
    }, 180);
  }

  function resetTarget(el, delay = 900){
    setTimeout(() => {
      if(!state.locked && !state.unlocked && el){
        el.style.transition = "transform 260ms cubic-bezier(.2,.8,.2,1)";
        el.style.transform = "translate3d(0,0,0)";
        el.style.zIndex = "";
      }
    }, delay);
  }

  function eventSafeMouseX(){ return state.mouse.x; }
  function eventSafeMouseY(){ return state.mouse.y; }

  function maybeSeal(){
    if(state.locked || state.unlocked) return;
    if(state.chaos >= 100){
      sealTerminal("system patience exhausted. you win by being unbearable.");
    }
  }

  function sealTerminal(reason = "direct credential path sealed."){
    if(state.locked || state.unlocked) return;
    state.locked = true;
    setAttempts();

    const terminal = document.querySelector(".terminal");
    terminal.classList.add("locked");
    $("#accessBtn").disabled = true;
    $("#status").textContent = "SEALED";
    $("#signal").textContent = "● HOSTILE";
    $("#signal").style.color = "var(--red)";
    feedback(reason, "bad");
    shakeTerminal();
  }

  function failAttempt(){
    if(state.unlocked || state.locked) return;

    state.attempts++;
    setAttempts();
    updatePatience(8);
    shakeTerminal();

    const lines = [
      "credential rejected. that was almost impressively normal.",
      "credential rejected. stop treating this like a normal login.",
      "three guesses later and the machine has opinions."
    ];

    feedback(lines[Math.min(state.attempts - 1, lines.length - 1)], "bad");

    if(state.attempts >= 3) sealTerminal("direct credential path sealed. the interface is still listening.");
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
    flee(id, 4);
    flee(pass, 4);
    state.attempts++;
    setAttempts();
    if(state.attempts >= 3) sealTerminal("direct path rejected. you were never supposed to use it.");
  }

  $("#accessBtn").addEventListener("click", fakeValidate);

  $("#passcode").addEventListener("keydown", (event) => {
    if(event.key === "Enter"){
      event.preventDefault();
      fakeValidate();
    }
  });

  $("#accessId").addEventListener("focus", () => {
    if(state.locked || state.unlocked) return;
    feedback("ACCESS ID detected. Evasive behavior enabled.", "bad");
    flee($("#accessId"), 4);
  });

  $("#passcode").addEventListener("focus", () => {
    if(state.locked || state.unlocked) return;
    feedback("PASSCODE target acquired. Target relocating.", "bad");
    flee($("#passcode"), 5);
  });

  document.addEventListener("pointermove", (event) => {
    state.velocity.x = event.clientX - state.mouse.x;
    state.velocity.y = event.clientY - state.mouse.y;
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;

    if(state.locked || state.unlocked) return;

    const targets = [
      {el:$("#accessId"), radius:125, power:4},
      {el:$("#passcode"), radius:135, power:5},
      {el:$("#accessBtn"), radius:150, power:6}
    ];

    for(const target of targets){
      if(!target.el) continue;
      const r = target.el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(event.clientX - cx, event.clientY - cy);

      if(dist < target.radius){
        flee(target.el, target.power);

        if(target.el === $("#accessBtn")){
          $("#accessBtn").classList.add("button-hunted");
          feedback(
            state.chaos < 35 ? "The button detected your cursor." :
            state.chaos < 65 ? "You are getting warmer. The button is not." :
            "At this point, the button is just bullying you.",
            "bad"
          );
        } else {
          target.el.classList.add("field-hunted");
          feedback(messages[Math.floor(state.chaos / 10) % messages.length], "bad");
        }
        resetTarget(target.el, 1150);
        break;
      }
    }

    if(state.chaos > 45){
      document.body.classList.add("paradox-chaos");
      setTimeout(() => document.body.classList.remove("paradox-chaos"), 180);
    }

    maybeSeal();
  });

  $("#accessId").addEventListener("input", () => {
    if(state.locked){
      feedback("interesting. you are still typing into a sealed terminal.", "");
      return;
    }

    const value = $("#accessId").value;

    if(value.length === 3){
      feedback("ACCESS ID accepted. Don't celebrate.", "ok");
    }

    if(value.length === 6){
      $("#accessId").value = value.slice(0,5);
      feedback("One character was returned to the void.", "bad");
      updatePatience(5);
    }
  });

  $("#passcode").addEventListener("input", () => {
    if(state.locked || state.unlocked) return;

    const value = $("#passcode").value;

    if(value.length === 4){
      feedback("PASSCODE received. The machine is pretending to care.", "ok");
    }

    if(value.length === 7){
      $("#passcode").value = value.slice(0,3) + value.slice(4);
      feedback("A password character has mysteriously vanished.", "bad");
      updatePatience(6);
    }
  });

  document.querySelector(".brand").addEventListener("click", () => {
    if(!state.locked || state.unlocked) return;

    state.logoClicks++;

    if(state.logoClicks === 1) feedback("auxiliary channel listening...", "");
    else if(state.logoClicks === 2) feedback("signal repeated. one more.", "");
    else if(state.logoClicks === 3) feedback("channel primed. now stop clicking things.", "");
    else {
      state.logoClicks = 0;
      feedback("channel desynchronised. start again.", "bad");
    }
  });

  $("#statusDot").addEventListener("click", (event) => {
    if(!state.locked || state.unlocked) return;

    if(event.shiftKey && state.logoClicks === 3){
      state.armed = true;
      state.keyIndex = 0;
      feedback("modified signal accepted. creator channel armed.", "");
      return;
    }

    if(state.logoClicks === 3){
      feedback("wrong signal modifier. the system expected a different input.", "bad");
    }
  });

  document.addEventListener("keydown", (event) => {
    if(!state.locked || state.unlocked) return;

    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key.toUpperCase();

    // Secret route:
    // 1) lock the system
    // 2) click PARADOX//ACCESS three times
    // 3) type PARADOX
    // Shift+status-dot still arms the same creator channel for the original route.
    if(state.logoClicks === 3 && !state.armed){
      if(key === creatorKey[state.keyIndex]){
        state.keyIndex++;
        feedback("auxiliary creator channel: " + state.keyIndex + "/" + creatorKey.length, "");
        if(state.keyIndex === creatorKey.length){
          unlock();
        }
        return;
      }

      if(!["SHIFT","CONTROL","ALT"].includes(key)){
        state.keyIndex = 0;
        feedback("wrong creator signal. sequence reset.", "bad");
        return;
      }
    }

    if(!state.armed) return;

    if(key === creatorKey[state.keyIndex]){
      state.keyIndex++;
      feedback("creator channel: " + state.keyIndex + "/" + creatorKey.length, "");
      if(state.keyIndex === creatorKey.length){
        unlock();
      }
      return;
    }

    if(!["SHIFT","CONTROL","ALT"].includes(key)){
      state.keyIndex = 0;
      state.armed = false;
      feedback("creator signal mismatch. channel reset.", "bad");
    }
  });

  function unlock(){
    state.unlocked = true;
    state.locked = false;
    state.armed = false;

    $("#status").textContent = "ONLINE";
    $("#signal").textContent = "● ONLINE";
    $("#signal").style.color = "var(--green)";
    $("#lockState").textContent = "LOCK: OVERRIDE";
    $("#accessBtn").textContent = "ACCESS GRANTED";
    $("#console").className = "console ok";
    $("#patienceText").textContent = "OVERRIDE";
    $("#patienceBar").style.width = "100%";
    $("#patienceBar").style.background = "var(--green)";
    $("#intruderLine").textContent = "INTRUDERS: ARCHITECT IDENTIFIED";

    feedback("creator override accepted. welcome, architect.", "ok");

    $("#welcomeText").textContent =
      "You did not defeat the password. You survived the interface.";

    setTimeout(() => show("welcome"), 900);
  }

  $("#enterExperience").addEventListener("click", () => {
    show("experience");
    $("#status").textContent = "ACTIVE";
  });

  // Keep focus behavior intentional while preventing browser-level surprises.
  window.addEventListener("blur", () => {
    if(!state.locked && !state.unlocked){
      feedback("Focus lost. The machine has filed that under suspicious behavior.", "");
    }
  });

  $("#patienceBar").style.width = "100%";
  $("#patienceText").textContent = "100%";
})();