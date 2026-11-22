/* Summoned offline copy (sw.js): made by the Pages build from its template - do not edit */
/* build 1.5.1-f8cbe66b1616fd1f: a cache-first copy of the game's 9 files, each checked against its sha256 */
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
})("1.5.1-f8cbe66b1616fd1f", [
  ["apple-touch-icon.png","a826da0a39a10c2c8c539aa2be334104459e9a7ca3047a5a1f51be4f3e853054"],
  ["art_worker.js","8b95381f89187214135c69a08b2c27eb1bd94796e645eddcb8a9739fa942d463"],
  ["favicon.png","6b20b086a5625e785aebdf3734a1aa998920e26880efb37b26326eae35e7edc7"],
  ["game.css","b959df97aa686c88ff7119cbdec51ed230514ea0e159f0414b2bff607c38121d"],
  ["game.js","658e9768f099f361be10f7c5873ce4b180617db3161d0e11dc4e4c63e1031668"],
  ["icon-192.png","44908ad4475c037d3f70e378a5868b7543bb55a6d58a0100fe57bc1f117c769c"],
  ["icon-512.png","ac28a26e1156508d6496100313e703098f7039e93a42642c44c594c4e0a31457"],
  ["index.html","709a43b824a0db324d8dde984112ba6a0f4fea8ade506a398a7a1211222e91d7"],
  ["manifest.webmanifest","b9ea87990cb5dc3e8e0684cc915d6d55303f75f1fd35434b19394c0d0904db8a"]
]);
