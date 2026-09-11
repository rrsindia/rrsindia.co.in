/* ────────────────────────────────────────────────────────────────────────────
   "A new version is available. Refresh."  —  the website equivalent of the
   app's update prompt.

   The problem it solves: the site is static on GitHub Pages with
   Cache-Control: max-age=600, so somebody sitting on a page after a deploy
   keeps reading the old one and is never told. The app tells you. The website
   did not.

   HOW IT KNOWS, with nothing to maintain:
   It compares the Last-Modified of the page you are on, and of the JS bundle
   that page loads, against what they were when you arrived. No version.json,
   no build step, no number for anyone to remember to bump. A version file you
   have to remember to update is a version file that goes stale, and a stale
   one is worse than none because it says "up to date" while lying.

   Measured 2026-09-11: GitHub Pages stamps EVERY file with the deploy time, not
   with when that file last changed, so any deploy moves this and the prompt
   appears site-wide. That is the intended behaviour, the same as the app: the
   signal is "there is a newer build", not "this paragraph changed". The bundle
   is checked as well so that replacing main-NN.min.js in place is still caught.

   Cloudflare passes Last-Modified through and answers these as DYNAMIC (not
   cached), which is what makes this work without a CDN purge.

   Deliberate restraint:
     · only while the tab is visible, so a background tab costs nothing
     · checks when you come back to the tab, which is when it actually matters
     · dismissing silences THAT version only; a later deploy asks again
     · never reloads by itself. Somebody may be halfway through the enquiry
       form, and throwing that away to show them newer marketing copy would be
       a poor trade.
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var EVERY_MS = 5 * 60 * 1000;      // 5 minutes
  var KEY = 'rrsUpdateDismissed';
  var baseline = null;               // "<page last-modified>|<bundle last-modified>"
  var shown = false;
  var timer = null;

  function bundleUrl() {
    var s = document.querySelector('script[src*="main-"]');
    return s ? s.getAttribute('src') : null;
  }

  /* Last-Modified for one URL. cache:'no-store' plus a unique query defeats both
     the browser's 10-minute freshness window and any intermediate cache. */
  function stamp(url) {
    return fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 'uc=' + Date.now(),
      { method: 'HEAD', cache: 'no-store' })
      .then(function (r) {
        return r.ok ? (r.headers.get('last-modified') || r.headers.get('etag') || '') : '';
      })
      .catch(function () { return ''; });
  }

  function currentVersion() {
    var b = bundleUrl();
    return Promise.all([stamp(location.pathname), b ? stamp(b) : Promise.resolve('')])
      .then(function (v) { return v.join('|'); });
  }

  function dismissed(v) {
    try { return sessionStorage.getItem(KEY) === v; } catch (e) { return false; }
  }

  function show(version) {
    if (shown || document.getElementById('rrsUpdateBar')) return;
    shown = true;

    var bar = document.createElement('div');
    bar.id = 'rrsUpdateBar';
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
    /* Top centre, clear of the nav above it and of the promo bar, WhatsApp
       button and Rova widget that already occupy the bottom corners. */
    bar.style.cssText = [
      'position:fixed', 'top:78px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:1002', 'max-width:calc(100vw - 24px)',
      'display:flex', 'align-items:center', 'gap:12px', 'flex-wrap:wrap',
      'padding:11px 14px', 'border-radius:12px',
      'background:rgba(3,15,7,.97)', 'border:1px solid #22c55e',
      'box-shadow:0 10px 30px rgba(0,0,0,.45)',
      'font-family:"DM Sans",system-ui,-apple-system,Segoe UI,sans-serif',
      'font-size:.88rem', 'color:#e8f5ec',
      'opacity:0', 'transition:opacity .25s ease'
    ].join(';');

    var msg = document.createElement('span');
    msg.textContent = '✨ A newer version of this page is available.';
    msg.style.cssText = 'flex:1 1 auto;min-width:190px';

    var refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.textContent = 'Refresh';
    refresh.style.cssText = 'flex:0 0 auto;background:#22c55e;color:#04130a;border:0;' +
      'padding:8px 18px;border-radius:8px;font-weight:700;font-size:.85rem;cursor:pointer';
    refresh.addEventListener('click', function () {
      /* A normal reload always revalidates the top-level document, so the new
         page comes back even inside the 10-minute freshness window. */
      location.reload();
    });

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss');
    close.innerHTML = '&times;';
    close.style.cssText = 'flex:0 0 auto;background:none;border:0;color:#9fb5a6;' +
      'font-size:1.25rem;line-height:1;cursor:pointer;padding:0 2px';
    close.addEventListener('click', function () {
      try { sessionStorage.setItem(KEY, version); } catch (e) {}
      bar.remove();
      shown = false;        // a LATER version may still ask again
    });

    bar.appendChild(msg); bar.appendChild(refresh); bar.appendChild(close);
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.style.opacity = '1'; });
  }

  function check() {
    if (document.hidden) return;
    currentVersion().then(function (v) {
      if (!v || v === '|') return;               // headers unavailable, stay quiet
      if (baseline === null) { baseline = v; return; }
      if (v !== baseline && !dismissed(v)) show(v);
    });
  }

  function start() {
    check();
    if (timer) clearInterval(timer);
    timer = setInterval(check, EVERY_MS);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) check();             // the moment they come back
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
