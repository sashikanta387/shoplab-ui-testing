/* ShopLab auth guard.
   Loaded synchronously in <head> of every protected page so an anonymous
   visitor is redirected to login.html before any content is painted.
   The session is written by app.js to localStorage under "shoplab.session"
   (shared across tabs, like a cookie). */
(function () {
  'use strict';
  var KEY = 'shoplab.session';

  function read(storage) {
    try { return JSON.parse(storage.getItem(KEY)); } catch (_) { return null; }
  }

  var session = null;
  try { session = read(window.localStorage); } catch (_) { /* storage blocked */ }

  if (!session || !session.user) {
    var here = location.pathname.split('/').pop() + location.search + location.hash;
    location.replace('login.html?redirect=' + encodeURIComponent(here || 'index.html'));
  }
})();
