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
  // FRUSTRATION ENGINE
  // Intentionally annoying, always recoverable.
  // =========================
  const troll = {
    idDodges: 0,
    passDodges: 0,
    buttonDodges: 0,
    fakeChecks: 0,
    lastMove: 0
  };

  const trollMessages = [
    "That field moved. You definitely saw that.",
    "Excellent click. Completely useless.",
    "The interface has decided it dislikes you.",
    "Please remain calm. The interface will not.",
    "Your confidence is noted and ignored.",
    "Almost. Emotionally, at least.",
    "The system would like you to try something less reasonable."
  ];

  function trollMessage(index = Math.floor(Math.random() * trollMessages.length), type = ""){
    feedback(trollMessages[index % trollMessages.length], type);
  }

  function dodge(el, intensity = 1){
    if(state.locked || state.unlocked) return;

    const now = Date.now();
    if(now - troll.lastMove < 120) return;
    troll.lastMove = now;

    const x = Math.round((Math.random() * 2 - 1) * (45 + intensity * 12));
    const y = Math.round((Math.random() * 2 - 1) * (10 + intensity * 5));

    el.classList.remove("troll-move");
    void el.offsetWidth;
    el.classList.add("troll-move");
    el.style.transform = "translate(" + x + "px," + y + "px)";
    el.classList.add("troll-dodge");
    setTimeout(() => {
      if(!state.locked && !state.unlocked){
        el.style.transform = "translate(0,0)";
      }
    }, 700);
  }

  function trollFieldFocus(el, kind){
    if(state.locked || state.unlocked) return;

    if(kind === "id"){
      troll.idDodges++;
      if(troll.idDodges <= 7){
        dodge(el, troll.idDodges);
        const messages = [
          "ACCESS ID selected. Unfortunately, it moved.",
          "You found the username field. It found a new location.",
          "The ACCESS ID has requested personal space.",
          "Stop chasing the box. The box is faster."
        ];
        feedback(messages[(troll.idDodges - 1) % messages.length], "bad");
      }
    } else {
      troll.passDodges++;
      if(troll.passDodges <= 5){
        dodge(el, troll.passDodges);
        const messages = [
          "PASSCODE field unavailable due to mysterious reasons.",
          "Password box moved. Security is apparently athletic.",
          "Correct field. Wrong universe."
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

  $("#accessId").addEventListener("pointerenter", () => {
    if(!state.locked && !state.unlocked && troll.idDodges < 9) trollFieldFocus($("#accessId"), "id");
  });

  $("#passcode").addEventListener("pointerenter", () => {
    if(!state.locked && !state.unlocked && troll.passDodges < 7) trollFieldFocus($("#passcode"), "pass");
  });

  $("#accessBtn").addEventListener("pointerenter", () => {
    if(state.locked || state.unlocked) return;
    troll.buttonDodges++;
    if(troll.buttonDodges <= 4){
      dodge($("#accessBtn"), troll.buttonDodges);
      $("#accessBtn").classList.add("troll-hover");
      setTimeout(() => $("#accessBtn").classList.remove("troll-hover"), 240);
      feedback(
        troll.buttonDodges === 1
          ? "The button moved. You are being tested."
          : troll.buttonDodges === 2
            ? "You almost clicked it. The button disagreed."
            : troll.buttonDodges === 3
              ? "This is getting embarrassing for both of us."
              : "Fine. Click the button before it develops legs.",
        "bad"
      );
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