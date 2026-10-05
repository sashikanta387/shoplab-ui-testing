/* Login page: sign in + create account. */
(function () {
  'use strict';
  const { $, $$, param, wait, store, KEYS, EMAIL_RE, Auth, safeRedirect, setBusy, initTabs } = window.ShopLab;

  window.ShopLab.pages.login = function initLogin() {
    const redirect = safeRedirect(param('redirect'));
    if (Auth.session()) { location.replace(redirect); return; }

    const info = $('#login-info');
    const showInfo = (msg) => { info.textContent = msg; info.hidden = !msg; };
    const tabs = initTabs($('[data-testid="auth-tabs"]'), {
      initial: location.hash === '#register' ? 'register' : 'signin',
      onChange: (name) => history.replaceState(null, '', location.pathname + location.search + (name === 'register' ? '#register' : '')),
    });

    // ---------------------------------------------------------------- sign in
    const form = $('#login-form');
    const username = $('#username');
    const password = $('#password');
    const submit = $('#login-submit');
    const errorBox = $('#login-error');

    const remembered = store.get(KEYS.remembered, '');
    if (remembered) {
      username.value = remembered;
      $('#remember-me').checked = true;
    }
    if (param('loggedOut')) showInfo('You have been logged out.');
    else if (param('registered')) showInfo('Account created — please sign in.');
    else if (param('redirect')) showInfo('Please sign in to continue.');

    $('#login-error-close').addEventListener('click', () => {
      errorBox.hidden = true;
      [username, password].forEach((el) => el.removeAttribute('aria-invalid'));
    });

    $('#toggle-password').addEventListener('click', (e) => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      e.currentTarget.textContent = show ? 'Hide' : 'Show';
      e.currentTarget.setAttribute('aria-pressed', String(show));
      e.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });

    $('#forgot-password').addEventListener('click', (e) => {
      e.preventDefault();
      showInfo('This is a demo: built-in accounts use the password ShopLab@123.');
    });

    // Clicking a demo account fills the form.
    $$('[data-fill]').forEach((b) => b.addEventListener('click', () => {
      username.value = b.dataset.fill;
      password.value = 'ShopLab@123';
      [username, password].forEach((el) => el.removeAttribute('aria-invalid'));
      submit.focus();
    }));

    [username, password].forEach((el) => el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true' && el.value) {
        el.setAttribute('aria-invalid', 'false');
        $('#' + el.id + '-error').textContent = '';
      }
    }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.hidden = true;
      const user = username.value.trim();
      const fields = [[username, user ? '' : 'Username is required.'], [password, password.value ? '' : 'Password is required.']];
      fields.forEach(([el, msg]) => {
        $('#' + el.id + '-error').textContent = msg;
        el.setAttribute('aria-invalid', String(Boolean(msg)));
      });
      const firstInvalid = fields.find(([, msg]) => msg);
      if (firstInvalid) { firstInvalid[0].focus(); return; }

      const u = Auth.users()[user];
      setBusy(submit, true, 'Signing in…');
      username.disabled = true;
      password.disabled = true;
      await wait((u && u.delay) || 800);
      username.disabled = false;
      password.disabled = false;
      setBusy(submit, false);

      const error = Auth.check(user, password.value);
      if (error) {
        $('#login-error-text').textContent = error;
        errorBox.hidden = false;
        [username, password].forEach((el) => el.setAttribute('aria-invalid', 'true'));
        password.value = '';
        password.focus();
        return;
      }
      Auth.start(user, $('#remember-me').checked);
      submit.textContent = '✓ Signed in';
      location.href = redirect;
    });

    // ---------------------------------------------------------- create account
    const reg = $('#register-form');
    const regPassword = $('#reg-password');
    const strength = $('[data-testid="register-password-strength"]');
    const LABELS = ['Use 8+ characters with a number and a symbol', 'Weak', 'Fair', 'Good', 'Strong'];

    function scorePassword(pw) {
      let s = 0;
      if (pw.length >= 8) s++;
      if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
      if (/\d/.test(pw)) s++;
      if (/[^A-Za-z0-9]/.test(pw)) s++;
      return pw ? Math.max(1, s) : 0;
    }
    regPassword.addEventListener('input', () => {
      const s = scorePassword(regPassword.value);
      strength.dataset.strength = String(s);
      $('#reg-strength-label').textContent = LABELS[s];
    });

    $('#reg-terms-link').addEventListener('click', (e) => {
      e.preventDefault();
      window.alert('ShopLab Terms of Service: this is a demo store. Nothing is sold, shipped or charged.');
    });

    const maxDob = new Date();
    maxDob.setFullYear(maxDob.getFullYear() - 13);
    $('#reg-dob').max = maxDob.toISOString().slice(0, 10);

    reg.addEventListener('submit', async (e) => {
      e.preventDefault();
      $('#register-error').hidden = true;
      const v = (id) => $('#' + id).value.trim();
      const users = Auth.users();
      const dob = v('reg-dob');
      const rules = [
        ['reg-name', v('reg-name').length >= 2 ? '' : 'Enter your full name.'],
        ['reg-email', !v('reg-email') ? 'Email is required.' : EMAIL_RE.test(v('reg-email')) ? '' : 'Enter a valid email address.'],
        ['reg-username', !/^[A-Za-z0-9_]{3,20}$/.test(v('reg-username')) ? 'Use 3–20 letters, numbers or underscores.'
          : users[v('reg-username')] ? 'That username is already taken.' : ''],
        ['reg-password', scorePassword(regPassword.value) >= 3 && regPassword.value.length >= 8 ? '' : 'Password is too weak: use 8+ characters with upper/lower case, a number or symbol.'],
        ['reg-confirm', $('#reg-confirm').value && $('#reg-confirm').value === regPassword.value ? '' : 'Passwords do not match.'],
        ['reg-dob', !dob ? 'Date of birth is required.' : dob > $('#reg-dob').max ? 'You must be at least 13 years old.' : ''],
        ['reg-terms', $('#reg-terms').checked ? '' : 'You must accept the Terms of Service.'],
      ];
      let first = null;
      rules.forEach(([id, msg]) => {
        $('#' + id + '-error').textContent = msg;
        $('#' + id).setAttribute('aria-invalid', String(Boolean(msg)));
        if (msg && !first) first = $('#' + id);
      });
      if (first) { first.focus(); return; }

      const btn = $('#register-submit');
      setBusy(btn, true, 'Creating account…');
      await wait(1000);
      setBusy(btn, false);
      Auth.register({ name: v('reg-name'), email: v('reg-email'), username: v('reg-username'), password: regPassword.value, dob });
      const newUser = v('reg-username');
      reg.reset();
      strength.dataset.strength = '0';
      $('#reg-strength-label').textContent = LABELS[0];
      $$('[aria-invalid]', reg).forEach((el) => el.removeAttribute('aria-invalid'));
      tabs.select('signin');
      username.value = newUser;
      password.value = '';
      password.focus();
      showInfo('Account created for ' + newUser + ' — please sign in.');
    });

    if (!remembered) username.focus();
    else password.focus();
  };
})();
