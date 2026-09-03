const CACHE_NAME = 'carmaint-cache-v2';
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Instalação: pré-cacheia apenas o app shell (recursos que certamente existem)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
});

// Ativação: limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Estratégias:
// - Navegação (HTML): network-first — usuários sempre recebem o deploy mais recente,
//   com fallback offline para o index.html cacheado.
// - Assets estáticos (JS/CSS/ícones/fontes): cache-first (são imutáveis e com hash).
// - API e dev-server: sempre rede.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (
    request.url.includes('/api/') ||
    request.url.includes('chrome-extension') ||
    request.url.includes('@vite') ||
    request.url.includes('node_modules')
  ) {
    return;
  }

  // Navegação: network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets: cache-first com fallback para rede
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        const url = response.url;
        const isCacheable =
          response &&
          response.status === 200 &&
          (url.endsWith('.js') ||
            url.endsWith('.css') ||
            url.endsWith('.png') ||
            url.endsWith('.svg') ||
            url.endsWith('.woff2') ||
            url.endsWith('.woff') ||
            url.includes('/assets/'));

        if (isCacheable) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
