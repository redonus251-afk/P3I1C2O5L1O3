/* ============================================
   SERVICE WORKER - Configuration PWA
   ============================================
   
   Le Service Worker gère :
   - La mise en cache des ressources
   - Le fonctionnement hors ligne
   - La synchronisation en arrière-plan
   
   ============================================ */

// Nom du cache utilisé
const CACHE_NAME = 'game-modes-v1';

// Ressources à mettre en cache lors de l'installation
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

/* ============================================
   1. ÉVÉNEMENT INSTALL
   ============================================ */

/**
 * L'événement 'install' se déclenche quand le Service Worker est enregistré.
 * C'est le moment idéal pour mettre en cache les ressources.
 */
self.addEventListener('install', event => {
    // waitUntil() attend que la promesse se termine avant de terminer l'installation
    event.waitUntil(
        // Ouvre le cache
        caches.open(CACHE_NAME).then(cache => {
            // Ajoute tous les URLs au cache
            return cache.addAll(urlsToCache);
        }).then(() => {
            // Force le Service Worker à devenir actif immédiatement
            return self.skipWaiting();
        })
    );
});

/* ============================================
   2. ÉVÉNEMENT ACTIVATE
   ============================================ */

/**
 * L'événement 'activate' se déclenche quand le Service Worker devient actif.
 * C'est le moment idéal pour nettoyer les anciens caches.
 */
self.addEventListener('activate', event => {
    // waitUntil() attend que la promesse se termine
    event.waitUntil(
        // Récupère la liste de tous les caches
        caches.keys().then(cacheNames => {
            // Boucle sur tous les noms de cache
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si ce n'est pas le cache actuel, le supprime
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Prend le contrôle des pages immédiatement
    self.clients.claim();
});

/* ============================================
   3. ÉVÉNEMENT FETCH
   ============================================ */

/**
 * L'événement 'fetch' se déclenche à chaque requête réseau.
 * On peut intercepter les requêtes et servir une réponse en cache si disponible.
 */
self.addEventListener('fetch', event => {
    // Répond à chaque requête fetch
    event.respondWith(
        // Cherche d'abord dans le cache
        caches.match(event.request).then(response => {
            // Si la ressource est en cache, la retourne
            if (response) {
                return response;
            }
            
            // Sinon, fait une requête réseau
            return fetch(event.request).then(response => {
                // Vérifie que la réponse est valide
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                
                // Crée une copie de la réponse
                const responseToCache = response.clone();
                
                // Ajoute la réponse au cache pour la prochaine fois
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                
                // Retourne la réponse
                return response;
            }).catch(() => {
                // Si la requête échoue (pas d'internet), retourne une page offline
                // Vous pouvez créer une page offline.html si vous le souhaitez
                return new Response('Vous êtes hors ligne', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            });
        })
    );
});
