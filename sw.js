/* Setly — service worker.
   Pour publier une nouvelle version : change simplement le numéro ci-dessous (ex. v10 -> v11). */
const CACHE_NAME = "setly-pwa-v10";

/* Fichiers indispensables : si l'un manque, l'installation échoue et l'ancienne version reste active. */
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./sync.js",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

/* Fichiers facultatifs : mis en cache s'ils existent, sans bloquer l'installation. */
const OPTIONAL = [
  "./supabase.js",
  "./icon-1024.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // cache: "reload" évite de recopier une ancienne version gardée par le navigateur.
      await cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "reload" })));
      await Promise.allSettled(OPTIONAL.map((url) => cache.add(new Request(url, { cache: "reload" }))));
    })
    // Pas de skipWaiting automatique : l'app propose « Mettre à jour » (message SKIP_WAITING ci-dessous).
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => (key.startsWith("basicfit-pwa-") || key.startsWith("setly-pwa-")) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages : copie locale d'abord (ouverture instantanée, même sans réseau).
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html", { ignoreSearch: true })
        .then((cached) => cached || fetch(request))
    );
    return;
  }

  // Fichiers de l'app : cache d'abord, réseau en secours (et mise en cache des réponses valides).
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
