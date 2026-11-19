/* Summoned offline copy (sw.js): made by the Pages build from its template - do not edit */
/* build 1.3.0-f840f76e0506f4d8: a cache-first copy of the game's 9 files, each checked against its sha256 */
'use strict';
(function smnServiceWorker(BUILD, FILES) {
  const SCOPE = new URL('./', self.location.href);
  const PREFIX = 'summoned:' + SCOPE.pathname + ':';
  const CACHE = PREFIX + BUILD;
  const INDEX = new URL('index.html', SCOPE).href;
  const INDEX_PATH = new URL(INDEX).pathname;
  const MSG_SKIP_WAITING = 'summoned-skip-waiting';
  const MSG_BUILD = 'summoned-build';
  const hex = (buf) => Array.from(new Uint8Array(buf), (b) => (b < 16 ? '0' : '') + b.toString(16)).join('');
  const sha256 = async (bytes) => hex(await crypto.subtle.digest('SHA-256', bytes));
  const ownOld = (name) => typeof name === 'string' && name.startsWith(PREFIX) && name !== CACHE;

  self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      const fresh = !(await caches.has(CACHE));
      const cache = await caches.open(CACHE);
      try {
        await Promise.all(FILES.map(async ([file, want]) => {
          const url = new URL(file, SCOPE).href;
          const res = await fetch(new Request(url, { cache: 'no-cache', credentials: 'same-origin' }));
          if (!res.ok) throw new Error('offline copy: ' + file + ' answered HTTP ' + res.status);
          const got = await sha256(await res.clone().arrayBuffer());
          if (got !== want) throw new Error('offline copy: ' + file + ' is not the file of build ' + BUILD + ' (sha256 ' + got.slice(0, 12) + '..., expected ' + want.slice(0, 12) + '...)');
          await cache.put(url, res.redirected ? new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers }) : res);
        }));
      } catch (e) {
        if (fresh) await caches.delete(CACHE);
        throw e;
      }
    })());
  });

  self.addEventListener('message', (event) => {
    const m = event && event.data;
    if (!m || typeof m !== 'object') return;
    if (m.type === MSG_SKIP_WAITING) {
      const p = self.skipWaiting();
      if (event.waitUntil) event.waitUntil(p);
    } else if (m.type === MSG_BUILD) {
      const reply = { type: MSG_BUILD, build: BUILD };
      const port = event.ports && event.ports[0];
      if (port) port.postMessage(reply);
      else if (event.source && typeof event.source.postMessage === 'function') event.source.postMessage(reply);
    }
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const names = await caches.keys();
      await Promise.all(names.filter(ownOld).map((n) => caches.delete(n)));
      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET' || (req.cache === 'only-if-cached' && req.mode !== 'same-origin')) return;
    const url = new URL(req.url);
    if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const nav = req.mode === 'navigate';
      const page = nav && (url.pathname === SCOPE.pathname || url.pathname === INDEX_PATH);
      const hit = await cache.match(page ? INDEX : req, { ignoreSearch: page });
      if (hit) return hit;
      try {
        return await fetch(req);
      } catch (e) {
        const fallback = nav ? await cache.match(INDEX) : null;
        if (fallback) return fallback;
        throw e;
      }
    })());
  });
})("1.3.0-f840f76e0506f4d8", [
  ["apple-touch-icon.png","8bcecaa9306c60506fd5d917de33032283a7be08c16a4acdd8d08ea3580c0839"],
  ["art_worker.js","1778d6983273c6da13c23cfd83b9ff823c0bec49913d714ab4f8ea3d00440a17"],
  ["favicon.png","05fffe198c71ec1d64a1977be7bec58c550b92d134516642c8d8f1b4d40958ed"],
  ["game.css","a7c60cc3bdb177555c71a2591e06c8e768e02d39474e2ff97eb4120533519e20"],
  ["game.js","072195ef1e322ea37ae978bba5af32ed06c8632fa32303113a081de814f6a143"],
  ["icon-192.png","142f1bd688cf85c95904e3a5f9f086e84c8c17718a29dbc7ff6f1e1be1a954ea"],
  ["icon-512.png","198e12a2893dbd368991238886ca1344f963b1e271f101acb100e39ea9552dae"],
  ["index.html","443d7e53ffd1db3e631a037df01e0b40bdf74cbbc5a728ad9a148e5ee17c7b60"],
  ["manifest.webmanifest","b9ea87990cb5dc3e8e0684cc915d6d55303f75f1fd35434b19394c0d0904db8a"]
]);
