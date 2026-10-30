const CACHE_NAME = "setly-pwa-v9";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter(
            (key) =>
              (key.startsWith("basicfit-pwa-") ||
                key.startsWith("setly-pwa-")) &&
              key !== CACHE_NAME
          )
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

  // Pour les pages, privilégier la version en ligne
  // et conserver une copie utilisable hors connexion.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) =>
            cache.put("./index.html", copy)
          );

          return response;
        })
        .catch(() => caches.match("./index.html"))
    );

    return;
  }

  // Pour les fichiers de l'application,
  // utiliser le cache lorsqu'une copie existe.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) =>
            cache.put(request, copy)
          );
        }

        return response;
      });
    })
  );
});
