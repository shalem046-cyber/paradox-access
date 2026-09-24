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

  $("#accessBtn").addEventListener("click", failAttempt);

  $("#passcode").addEventListener("keydown", (event) => {
    if(event.key === "Enter"){
      event.preventDefault();
      $("#accessBtn").click();
    }
  });

  $("#accessId").addEventListener("input", () => {
    if(state.locked && !state.unlocked){
      feedback("interesting. you are still typing into a locked terminal.", "");
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