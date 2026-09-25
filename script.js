(() => {
  const form = document.getElementById('loginForm');
  const user = document.getElementById('username');
  const pass = document.getElementById('password');
  const button = document.getElementById('loginButton');
  const card = document.getElementById('card');
  const message = document.getElementById('message');
  const session = document.getElementById('session');
  const attemptsEl = document.getElementById('attempts');
  const eyebrow = document.getElementById('eyebrow');
  const subtitle = document.getElementById('subtitle');
  const userLabel = document.getElementById('userLabel');
  const passLabel = document.getElementById('passLabel');
  const systemStatus = document.getElementById('systemStatus');

  let attempts = 0;
  let submitting = false;
  let buttonEscapes = 0;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function glitch() {
    card.classList.remove('glitch');
    void card.offsetWidth;
    card.classList.add('glitch');
  }

  function setMessage(text, type = 'error') {
    message.className = 'message ' + type;
    message.textContent = text;
  }

  function markBad(input) {
    input.classList.remove('bad');
    void input.offsetWidth;
    input.classList.add('bad');
    setTimeout(() => input.classList.remove('bad'), 900);
  }

  function updateAttempts() {
    attemptsEl.textContent = 'ATTEMPTS: ' + attempts;
  }

  function moveButton() {
    if (window.innerWidth < 600) {
      button.style.transform = 'translateX(' + (Math.random() * 28 - 14) + 'px)';
    } else {
      const x = Math.random() * 52 - 26;
      const y = Math.random() * 20 - 10;
      button.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
    buttonEscapes++;
    setMessage(pick([
      'AUTHENTICATE // TOO SLOW',
      'THE BUTTON HAS TRUST ISSUES',
      'NICE TRY. CLICK THE MOVING TARGET.',
      'WHY ARE YOU CHASING IT?'
    ]), 'warn');
  }

  button.addEventListener('mouseenter', () => {
    if (attempts >= 2 && !submitting && buttonEscapes < 4) moveButton();
  });

  button.addEventListener('mouseleave', () => {
    if (buttonEscapes >= 4) button.style.transform = '';
  });

  user.addEventListener('input', () => {
    if (user.value.length === 4) {
      userLabel.textContent = 'IDENTIFIER (KEEP GOING...)';
      subtitle.textContent = 'The terminal has noticed you. That was a mistake.';
    }
    if (user.value.length === 8) {
      userLabel.textContent = 'IDENTIFIER (STILL WRONG)';
    }
  });

  pass.addEventListener('focus', () => {
    pass.placeholder = pick([
      'Enter access key',
      'No, the other one',
      'You know the password',
      'This field is judging you'
    ]);
  });

  pass.addEventListener('input', () => {
    if (pass.value.length === 5) {
      passLabel.textContent = 'ACCESS KEY (SERIOUSLY?)';
      markBad(pass);
    }
  });

  pass.addEventListener('keydown', (event) => {
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      setMessage('CAPS LOCK DETECTED // OF COURSE', 'warn');
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (attempts >= 3 && !submitting) {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance < 75 && buttonEscapes < 6) moveButton();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    attempts++;
    updateAttempts();
    glitch();
    card.classList.add('rage');
    setTimeout(() => card.classList.remove('rage'), 260);

    const identifier = user.value.trim();
    const key = pass.value.trim();

    if (!identifier || !key) {
      setMessage(pick([
        'AUTHENTICATION ERROR // SOMETHING IS MISSING',
        'EMPTY FIELD // IMPRESSIVE',
        'SYSTEM ERROR // TRY USING YOUR EYES'
      ]));
      session.textContent = 'BLOCKED';
      if (!identifier) markBad(user);
      if (!key) markBad(pass);
      return;
    }

    submitting = true;
    button.disabled = true;
    button.classList.add('loading');
    button.textContent = attempts === 1 ? 'CHECKING...' : attempts < 4 ? 'VERIFYING... 0%' : 'ASKING THE SYSTEM...';

    const messages = [
      'CONTACTING AUTHENTICATION NODE...',
      'CHECKING CREDENTIALS...',
      'RECHECKING CREDENTIALS...',
      'DOUBTING YOUR EXISTENCE...'
    ];

    for (let i = 0; i < messages.length; i++) {
      setMessage(messages[i] + ' ' + (25 * (i + 1)) + '%', 'warn');
      await new Promise(r => setTimeout(r, 260 + i * 80));
    }

    button.disabled = false;
    button.classList.remove('loading');
    button.textContent = attempts >= 4 ? 'AUTHENTICATE AGAIN ↻' : 'AUTHENTICATE →';
    submitting = false;

    if (attempts === 1) {
      setMessage('ACCESS DENIED // THAT WAS QUICK.', 'error');
      session.textContent = 'REJECTED';
      markBad(pass);
    } else if (attempts === 2) {
      setMessage('ACCESS DENIED // THE SECOND TRY WAS WORSE.', 'error');
      session.textContent = 'REJECTED';
      markBad(pass);
      if (buttonEscapes < 1) moveButton();
    } else if (attempts === 3) {
      setMessage('ACCESS DENIED // YOU ARE NOW IN THE LOOP.', 'error');
      session.textContent = 'LOOPING';
      eyebrow.textContent = 'RESTRICTED TERMINAL // ANGER DETECTED';
      pass.value = '';
      markBad(user);
      markBad(pass);
    } else {
      setMessage(pick([
        'ACCESS DENIED // PARADOX WINS.',
        'NOPE. STILL WRONG.',
        'YOU HAVE BEEN AUTHENTICATED AS: FRUSTRATED.',
        'SYSTEM STATUS: ENJOYING THIS.'
      ]), 'error');
      session.textContent = 'LOCKED';
      pass.value = '';
      button.classList.add('locked');
      setTimeout(() => button.classList.remove('locked'), 700);
      moveButton();
    }
  });
})();