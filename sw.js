const VERSION = 'v0.1.3';
const SCOPE = self.registration.scope;
const CACHE_PREFIX = `offline-playroom:${SCOPE}:`;
const CACHE_NAME = CACHE_PREFIX + VERSION;
const ASSETS = [
  '/',
  '/index.html',
  '/reset.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/css/style.css',
  '/js/audio.js',
  '/js/voice.js',
  '/js/progress.js',
  '/js/settings.js',
  '/js/controls.js',
  '/js/hub.js',
  '/js/pwa.js',
  '/js/enterprise.js',
  '/js/games/balloons.js',
  '/js/games/puzzle.js',
  '/js/games/dots.js',
  '/js/games/sushichop.js',
  '/js/games/shooting.js',
  '/js/games/drawing.js',
  '/js/games/jetpack.js',
  '/js/games/numbers.js',
  '/js/games/fourinline.js',
  '/js/games/findit.js',
  '/js/games/basket.js',
  '/js/games/mole.js',
  '/js/games/golf.js',
  '/js/games/maze.js',
  '/js/games/memory.js',
  '/js/games/race.js',
  '/js/games/snake.js',
  '/js/games/billiard.js',
  '/js/games/bubble.js',
  '/js/games/candies.js',
  '/js/games/game2048.js',
  '/js/games/fishing.js',
  '/js/games/slider.js',
  '/js/games/sort.js',
  '/js/games/shadows.js',
  '/js/games/runner.js',
  '/js/games/coloring.js',
  '/js/games/pinball.js',
  '/assets/icon.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // fetch cu cache:'reload' = ocoleste cache-ul HTTP al browserului, altfel
      // pre-incarcam exact fisierele vechi pe care incercam sa le inlocuim
      cache.addAll(ASSETS.map((u) => new Request(new URL(u.slice(1), SCOPE), { cache: 'reload' })))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'purge') {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)))));
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.href.startsWith(SCOPE)) return;
  const key = new Request(url.origin + url.pathname);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(key);
    if (cached) return cached;
    try {
      const response = await fetch(req);
      if (response.ok && response.type === 'basic') await cache.put(key, response.clone());
      return response;
    } catch {
      if (req.mode !== 'navigate') return Response.error();
      return await cache.match(new URL('index.html', SCOPE).href) || Response.error();
    }
  })());
});
