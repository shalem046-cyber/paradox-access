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
    timer: null
  };

  // Puzzle-only creator route. This is not real authentication.
  // Secret path: logo x3 -> Shift + status dot -> PARADOX.
  const creatorKey = atob("UEFSQURPWA==");

  function show(id){
    screens.forEach(name => document.getElementById(name).classList.toggle("active", name === id));
  }

  function feedback(message, type = ""){
    const el = $("#console");
    el.textContent = "> " + message;
    el.className = "console" + (type ? " " + type : "");
  }

  function setAttempts(){
    $("#attempts").textContent = "ATTEMPTS: " + state.attempts;
    $("#lockState").textContent = state.locked ? "LOCK: SEALED" : "LOCK: OPEN";
  }

  // =========================
  // PARADOX EVADE ENGINE
  // Fast, smooth and intentionally difficult — but always recoverable.
  // =========================
  const troll = {
    idDodges: 0,
    passDodges: 0,
    buttonDodges: 0,
    fakeChecks: 0,
    lastMove: 0
  };

  const trollMessages = [
    "The interface noticed your cursor.",
    "Too slow. The box moved first.",
    "You were close. The system disagrees.",
    "The control terminal has developed survival instincts.",
    "Please remain calm. The interface will not.",
    "Excellent approach. Terrible timing."
  ];

  function trollMessage(index = Math.floor(Math.random() * trollMessages.length), type = ""){
    feedback(trollMessages[index % trollMessages.length], type);
  }

  function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
  }

  function evade(el, intensity = 1){
    if(state.locked || state.unlocked) return;

    const body = document.querySelector(".terminal-body");
    if(!body || !el) return;

    const bodyRect = body.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const now = performance.now();

    if(now - troll.lastMove < 70) return;
    troll.lastMove = now;

    const padding = 12;
    const maxX = Math.max(0, bodyRect.width - elRect.width - padding * 2);
    const maxY = Math.max(0, bodyRect.height - elRect.height - padding * 2);

    // Choose a distant point rather than a random tiny nudge.
    const currentX = elRect.left - bodyRect.left - el.offsetLeft;
    const currentY = elRect.top - bodyRect.top - el.offsetTop;

    let x = Math.random() * maxX;
    let y = Math.random() * maxY;

    for(let i = 0; i < 8; i++){
      const dx = x - currentX;
      const dy = y - currentY;
      if(Math.hypot(dx, dy) > 110 + intensity * 24) break;
      x = Math.random() * maxX;
      y = Math.random() * maxY;
    }

    el.style.position = "relative";
    el.style.transition = "transform 90ms cubic-bezier(.1,.9,.15,1)";
    el.style.transform = `translate(${x - currentX}px,${y - currentY}px)`;
    el.classList.add("troll-dodge");

    setTimeout(() => {
      if(!state.locked && !state.unlocked){
        el.style.transition = "transform 220ms cubic-bezier(.2,.8,.15,1)";
      }
    }, 95);
  }

  function trollFieldFocus(el, kind){
    if(state.locked || state.unlocked) return;

    if(kind === "id"){
      troll.idDodges++;
      if(troll.idDodges <= 10){
        evade(el, Math.min(5, troll.idDodges));
        const messages = [
          "ACCESS ID detected. Evasive maneuver initiated.",
          "You found the username field. It found somewhere else.",
          "ACCESS ID is refusing to be perceived.",
          "Cursor proximity: unacceptable.",
          "The box has learned your movement."
        ];
        feedback(messages[(troll.idDodges - 1) % messages.length], "bad");
      }
    } else {
      troll.passDodges++;
      if(troll.passDodges <= 8){
        evade(el, Math.min(5, troll.passDodges));
        const messages = [
          "PASSCODE target acquired. Target relocating.",
          "Password box has entered evasive mode.",
          "Correct field. Wrong moment.",
          "Authentication control moving beyond your reach."
        ];
        feedback(messages[(troll.passDodges - 1) % messages.length], "bad");
      }
    }
  }

  function fakeValidate(){
    if(state.locked || state.unlocked) return;

    const id = $("#accessId");
    const pass = $("#passcode");
    const idValue = id.value.trim();
    const passValue = pass.value.trim();

    if(!idValue && !passValue){
      feedback("You entered absolutely nothing. Bold strategy.");
      evade(id, 3);
      return;
    }

    troll.fakeChecks++;
    const terminal = document.querySelector(".terminal");
    terminal.classList.add("troll-glitch");
    setTimeout(() => terminal.classList.remove("troll-glitch"), 220);

    if(idValue.length >= 3 && passValue.length >= 3){
      feedback("credentials accepted... validating confidence...", "ok");
      setTimeout(() => {
        if(!state.locked && !state.unlocked){
          feedback("Confidence rejected. Credentials remain suspicious.", "bad");
          $("#signal").textContent = "● MOCKING";
          $("#signal").style.color = "var(--amber)";
          evade(id, 4);
          evade(pass, 4);
        }
      }, 520);
      return;
    }

    const fakeErrors = [
      "ACCESS DENIED: your password looked nervous.",
      "ACCESS DENIED: insufficient confidence.",
      "ACCESS DENIED: username passed. Password failed the vibe check.",
      "ACCESS DENIED: system has chosen violence."
    ];

    feedback(fakeErrors[(troll.fakeChecks - 1) % fakeErrors.length], "bad");
    evade(id, troll.fakeChecks);
    evade(pass, troll.fakeChecks);
  }

  function fakeValidate(){
    if(state.locked || state.unlocked) return;

    const id = $("#accessId");
    const pass = $("#passcode");
    const idValue = id.value.trim();
    const passValue = pass.value.trim();

    if(!idValue && !passValue){
      feedback("You entered absolutely nothing. Bold strategy.");
      dodge(id, 2);
      return;
    }

    troll.fakeChecks++;
    const terminal = document.querySelector(".terminal");
    terminal.classList.add("troll-glitch");

    if(idValue.length >= 3 && passValue.length >= 3){
      feedback("credentials accepted... wait...", "ok");
      setTimeout(() => {
        if(!state.locked && !state.unlocked){
          feedback("Nope. The system changed its mind.", "bad");
          $("#signal").textContent = "● MOCKING";
          $("#signal").style.color = "var(--amber)";
        }
      }, 650);
      return;
    }

    const fakeErrors = [
      "ACCESS DENIED: your password looked nervous.",
      "ACCESS DENIED: insufficient confidence.",
      "ACCESS DENIED: username passed. Password failed the vibe check.",
      "ACCESS DENIED: system has chosen violence."
    ];

    feedback(fakeErrors[(troll.fakeChecks - 1) % fakeErrors.length], "bad");
    dodge(id, troll.fakeChecks);
    dodge(pass, troll.fakeChecks);
  }

  function failAttempt(){
    if(state.unlocked) return;
    state.attempts++;
    setAttempts();

    const terminal = document.querySelector(".terminal");
    terminal.classList.remove("shake");
    void terminal.offsetWidth;
    terminal.classList.add("shake");

    if(state.attempts < 3){
      feedback(
        state.attempts === 1
          ? "credential rejected. that was almost impressively normal."
          : "credential rejected. stop treating this like a normal login.",
        "bad"
      );
      return;
    }

    state.locked = true;
    terminal.classList.add("locked");
    $("#accessBtn").disabled = true;
    $("#status").textContent = "SEALED";
    $("#signal").textContent = "● HOSTILE";
    feedback("direct credential path sealed. the interface is still listening.", "bad");
  }

  $("#accessBtn").addEventListener("click", () => {
    if(state.locked || state.unlocked) {
      failAttempt();
      return;
    }

    fakeValidate();

    setTimeout(() => {
      if(!state.locked && !state.unlocked && troll.fakeChecks >= 2){
        failAttempt();
      }
    }, 850);
  });

  $("#passcode").addEventListener("keydown", (event) => {
    if(event.key === "Enter"){
      event.preventDefault();
      $("#accessBtn").click();
    }
  });

  $("#accessId").addEventListener("focus", () => trollFieldFocus($("#accessId"), "id"));
  $("#passcode").addEventListener("focus", () => trollFieldFocus($("#passcode"), "pass"));

  document.addEventListener("pointermove", (event) => {
    if(state.locked || state.unlocked) return;

    const targets = [
      { el: $("#accessId"), kind: "id", radius: 95 },
      { el: $("#passcode"), kind: "pass", radius: 105 },
      { el: $("#accessBtn"), kind: "button", radius: 115 }
    ];

    for(const target of targets){
      const el = target.el;
      if(!el) continue;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - cx, event.clientY - cy);

      if(distance < target.radius){
        if(target.kind === "id" && troll.idDodges < 12){
          troll.idDodges++;
          evade(el, Math.min(7, troll.idDodges));
          trollMessage(troll.idDodges + 1, "bad");
        } else if(target.kind === "pass" && troll.passDodges < 10){
          troll.passDodges++;
          evade(el, Math.min(7, troll.passDodges));
          trollMessage(troll.passDodges + 2, "bad");
        } else if(target.kind === "button" && troll.buttonDodges < 9){
          troll.buttonDodges++;
          evade(el, Math.min(7, troll.buttonDodges));
          feedback(
            troll.buttonDodges < 4
              ? "The button detected your cursor."
              : troll.buttonDodges < 7
                ? "You are getting warmer. The button is not."
                : "At this point, the button is just bullying you.",
            "bad"
          );
        }
        break;
      }
    }
  });

  $("#accessId").addEventListener("input", () => {
    if(state.locked && !state.unlocked){
      feedback("interesting. you are still typing into a locked terminal.", "");
      return;
    }

    if($("#accessId").value.length === 4){
      feedback("ACCESS ID accepted. Absolutely do not celebrate yet.", "ok");
    }

    if($("#accessId").value.length === 6){
      $("#accessId").value = $("#accessId").value.slice(0, 5);
      feedback("One character was returned to the void.", "bad");
    }
  });

  $("#passcode").addEventListener("input", () => {
    if(state.locked || state.unlocked) return;

    if($("#passcode").value.length === 4){
      feedback("PASSCODE received. The machine is pretending to care.", "ok");
    }

    if($("#passcode").value.length === 7){
      const v=$("#passcode").value;
      $("#passcode").value=v.slice(0,3)+v.slice(4);
      feedback("A password character has mysteriously vanished.", "bad");
    }
  });

  $("#authBrand"); // deliberate no-op keeps the interface structure obvious.

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
    if(!state.locked || !state.armed || state.unlocked) return;

    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key.toUpperCase();

    if(key === creatorKey[state.keyIndex]){
      state.keyIndex++;
      feedback("creator channel: " + state.keyIndex + "/" + creatorKey.length, "");
      if(state.keyIndex === creatorKey.length) unlock();
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
    feedback("creator override accepted. welcome, architect.");
    $("#welcomeText").textContent = "You did not defeat the password. You noticed the system.";
    setTimeout(() => show("welcome"), 900);
  }

  $("#enterExperience").addEventListener("click", () => {
    show("experience");
    $("#status").textContent = "ACTIVE";
  });
})();