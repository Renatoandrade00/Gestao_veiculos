const CACHE_NAME = 'carmaint-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// Instalação do Service Worker e Caching do App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpando Cache Antigo', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Interceptar requisições (Servir Cache First ou Network Fallback para SPA)
self.addEventListener('fetch', (event) => {
  // Ignorar requisições da API e do dev-server (Vite)
  if (
    event.request.url.includes('/api/') || 
    event.request.url.includes('chrome-extension') ||
    event.request.url.includes('@vite') ||
    event.request.url.includes('node_modules')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se for uma requisição de navegação (HTML), retornar o index.html (SPA Fallback)
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }

      // Buscar da rede
      return fetch(event.request)
        .then((response) => {
          // Salvar no cache dinâmico se for um asset válido (CSS, JS, imagens)
          if (
            response && 
            response.status === 200 && 
            (response.url.endsWith('.js') || response.url.endsWith('.css') || response.url.includes('/assets/'))
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback offline para navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
