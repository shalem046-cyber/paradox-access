(() => {
  const state = {
    attempts: 0,
    loggedIn: false,
    creatorUnlocked: false,
    logoClicks: 0,
    logoTimer: 0,
    creatorArmed: false,
    creatorIndex: 0,
    errors: Number(localStorage.getItem('paradoxErrors') || 3)
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const reactions = [
    'wrong password. dog has reviewed the situation.',
    'attempt #2. the cat would like a word.',
    'okay. we are officially not trusting that password.',
    'system note: confidence high. accuracy questionable.',
    'the login form has entered a personal crisis.',
    'you typed it again. respect the commitment.'
  ];

  const liveEvents = [
    'someone typed 1234',
    'cat requested admin access',
    'dog judged a password',
    'guest mode was discovered',
    'someone clicked everything',
    'system is pretending to be calm'
  ];

  const creatorSequence = atob('UEFYMjY=');

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function setFeedback(message, type) {
    const el = $('#loginFeedback');
    el.textContent = message;
    el.className = 'login-feedback' + (type ? ' ' + type : '');
  }

  function updateAttempts() {
    $('#attemptCount').textContent = 'ATTEMPTS: ' + state.attempts;
    $('#loginLockText').textContent = state.attempts >= 3 ? 'LOCK: SEALED' : 'LOCK: OPEN';
    $('#lockState').textContent = state.attempts >= 3 ? 'STATUS: LISTENING' : 'STATUS: READY';
  }

  function bumpErrorCount() {
    state.errors += 1;
    localStorage.setItem('paradoxErrors', String(state.errors));
    $('#errorCount').textContent = String(state.errors).padStart(2, '0');
  }

  function updateLiveEvent(text) {
    $('#liveEvent').textContent = text;
  }

  function failedLogin() {
    state.attempts += 1;
    updateAttempts();
    bumpErrorCount();
    document.body.classList.remove('meme-panic');
    void document.body.offsetWidth;
    document.body.classList.add('meme-panic');

    const reaction = reactions[Math.min(state.attempts - 1, reactions.length - 1)];
    setFeedback('> ' + reaction, 'bad');
    updateLiveEvent(reaction);

    if (state.attempts === 1) {
      showToast('dog has been notified.');
    } else if (state.attempts === 2) {
      showToast('the cat is disappointed.');
    } else if (state.attempts === 3) {
      state.creatorArmed = false;
      $('#creatorHint').textContent = 'Direct login sealed. Maybe the interface still has another idea.';
      showToast('ACCESS SEALED. this is getting suspicious.');
    } else {
      $('#creatorHint').textContent = 'The system is listening. Stop guessing.';
    }
  }

  function grantAccess(label) {
    state.loggedIn = true;
    $('#loginFeedback').className = 'login-feedback good';
    $('#loginFeedback').textContent = '> ACCESS GRANTED — ' + label;
    $('#lockState').textContent = 'STATUS: WELCOME';
    $('#loginLockText').textContent = 'LOCK: OPEN';
    document.body.classList.remove('meme-panic');
    showToast('Welcome. The system will act normal now.');
    localStorage.setItem('paradoxGuest', '1');
    updateLiveEvent('someone successfully logged in');
  }

  function submitLogin(event) {
    event.preventDefault();
    if (state.creatorUnlocked) {
      grantAccess('ARCHITECT');
      return;
    }

    const id = $('#accessId').value.trim().toLowerCase();
    const pass = $('#passcode').value.trim();

    if (!id || !pass) {
      setFeedback('> enter something first. the form is not psychic.', 'bad');
      showToast('You left the boxes empty 😭');
      return;
    }

    if (state.attempts >= 3) {
      setFeedback('> direct credentials are sealed. the system is waiting for a different signal.', 'bad');
      showToast('No more password guessing.');
      return;
    }

    if ((id === 'guest' || id === 'paradox') && pass.toLowerCase() === 'paradox') {
      grantAccess('GUEST');
      return;
    }

    failedLogin();
  }

  function guestAccess() {
    $('#accessId').value = 'guest';
    $('#passcode').value = 'paradox';
    grantAccess('GUEST');
  }

  function exitCreator() {
    state.creatorUnlocked = false;
    state.creatorArmed = false;
    state.creatorIndex = 0;
    document.body.classList.remove('creator-mode');
    $('#creatorPanel').classList.add('hidden');
    $('#creatorHint').textContent = '';
    $('#loginFeedback').textContent = '> normal mode restored.';
    $('#loginFeedback').className = 'login-feedback';
  }

  function unlockCreator() {
    state.creatorUnlocked = true;
    state.creatorArmed = false;
    document.body.classList.add('creator-mode');
    $('#creatorPanel').classList.remove('hidden');
    $('#creatorHint').textContent = 'CREATOR CHANNEL: ACCEPTED';
    $('#loginLockText').textContent = 'LOCK: OVERRIDE';
    $('#lockState').textContent = 'STATUS: ARCHITECT';
    setFeedback('> creator override accepted. you found the weird door.', 'good');
    showToast('Architect mode unlocked.');
    updateLiveEvent('creator channel authenticated');
  }

  function logoClick() {
    if (state.attempts < 3 || state.loggedIn || state.creatorUnlocked) return;
    const now = Date.now();

    if (now - state.logoTimer > 1300) state.logoClicks = 0;
    state.logoTimer = now;
    state.logoClicks += 1;

    if (state.logoClicks === 1) setFeedback('> ...the logo is listening.', '');
    if (state.logoClicks === 2) setFeedback('> auxiliary channel detected.', '');
    if (state.logoClicks === 3) setFeedback('> channel primed. there is one more signal.', '');

    if (state.logoClicks > 3) {
      state.logoClicks = 0;
      setFeedback('> channel reset. maybe try three.', 'bad');
    }
  }

  function systemDotClick(event) {
    if (state.attempts < 3 || state.loggedIn || state.creatorUnlocked) return;

    if (event.shiftKey && state.logoClicks === 3) {
      state.creatorArmed = true;
      state.creatorIndex = 0;
      setFeedback('> secondary signal accepted. creator channel armed.', '');
      showToast('One last input.');
      return;
    }

    if (state.logoClicks === 3) {
      setFeedback('> wrong signal. hold the modifier and try again.', 'bad');
    }
  }

  function handleCreatorKey(event) {
    if (!state.creatorArmed || state.creatorUnlocked) return;

    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key.toUpperCase();

    if (key === creatorSequence[state.creatorIndex]) {
      state.creatorIndex += 1;
      setFeedback('> creator signal ' + state.creatorIndex + '/' + creatorSequence.length, '');

      if (state.creatorIndex === creatorSequence.length) {
        unlockCreator();
      }
      return;
    }

    if (!['SHIFT','ALT','CONTROL','TAB'].includes(key)) {
      state.creatorArmed = false;
      state.creatorIndex = 0;
      setFeedback('> creator signal mismatch. channel reset.', 'bad');
    }
  }

  function togglePassword() {
    const input = $('#passcode');
    const button = $('#showPass');
    input.type = input.type === 'password' ? 'text' : 'password';
    button.textContent = input.type === 'password' ? 'show' : 'hide';
  }

  function setupMenu() {
    $('#menuToggle').addEventListener('click', () => {
      const nav = $('#mainNav');
      const open = nav.classList.toggle('open');
      $('#menuToggle').setAttribute('aria-expanded', String(open));
    });

    $$('#mainNav a').forEach(link => link.addEventListener('click', () => {
      $('#mainNav').classList.remove('open');
      $('#menuToggle').setAttribute('aria-expanded', 'false');
    }));
  }

  function setupReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });

    items.forEach(item => observer.observe(item));
  }

  function setupActiveNav() {
    const sections = ['home','explore','memes','about','login'].map(id => document.getElementById(id));
    const navLinks = $$('#mainNav a');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.nav === entry.target.id));
      });
    }, { threshold: .45 });

    sections.forEach(section => observer.observe(section));
  }

  function setupMemeShuffle() {
    const wall = $('#memeWall');
    const cards = [...wall.children];

    $('#shuffleMeme').addEventListener('click', () => {
      const randomized = cards.sort(() => Math.random() - .5);
      randomized.forEach(card => wall.appendChild(card));
      showToast('meme order successfully made less responsible.');
    });
  }

  function setupSurprise() {
    const lines = [
      'Congratulations. You pressed a button.',
      'The button has learned your weakness.',
      'System note: curiosity detected.',
      'That changed absolutely nothing. Incredible.',
      'You are now 4% more suspicious.'
    ];

    $('#surpriseBtn').addEventListener('click', () => {
      const text = lines[Math.floor(Math.random() * lines.length)];
      $('#surpriseText').textContent = '> ' + text;
      showToast('excellent decision. probably.');
    });
  }

  function loadSession() {
    if (localStorage.getItem('paradoxGuest') === '1') {
      setFeedback('> previous session detected. guest access remains available.', 'good');
    }
  }

  $('#loginForm').addEventListener('submit', submitLogin);
  $('#guestBtn').addEventListener('click', guestAccess);
  $('#showPass').addEventListener('click', togglePassword);
  $('#exitCreator').addEventListener('click', exitCreator);
  $('.brand').addEventListener('click', logoClick);
  $('.status-dot').addEventListener('click', systemDotClick);
  document.addEventListener('keydown', handleCreatorKey);

  $('#visitorCount').textContent = String(120 + Math.floor(Math.random() * 31));
  updateAttempts();
  loadSession();
  setupMenu();
  setupReveal();
  setupActiveNav();
  setupMemeShuffle();
  setupSurprise();

  setInterval(() => {
    if (Math.random() > .55) {
      const event = liveEvents[Math.floor(Math.random() * liveEvents.length)];
      updateLiveEvent(event);
    }
  }, 3200);
})();