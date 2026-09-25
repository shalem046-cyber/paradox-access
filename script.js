(() => {
  const form = document.getElementById('loginForm');
  const user = document.getElementById('username');
  const pass = document.getElementById('password');
  const message = document.getElementById('message');
  const session = document.getElementById('session');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const identifier = user.value.trim();
    const key = pass.value.trim();

    message.className = 'message';

    if (!identifier || !key) {
      message.textContent = 'AUTHENTICATION ERROR // ALL FIELDS REQUIRED';
      message.classList.add('error');
      session.textContent = 'BLOCKED';
      return;
    }

    message.textContent = 'ACCESS DENIED // INVALID CREDENTIALS';
    message.classList.add('error');
    session.textContent = 'LOCKED';

    pass.select();
  });
})();