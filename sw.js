const CACHE_NAME = "minecraft-quest-v1";
const CORE_ASSETS = [
  ".",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "images/favicon.png",
  "images/intro-comics.png",
  "images/final-happy-birthday.png",
  "images/task2-sofa.png",
  "images/task3-floor-is-lava.png",
  "images/task4-treadmill.png",
  "images/task5-uno.png",
  "images/task6-checkmate.png",
  "images/task7-behind-door.png",
  "images/task8-lego.png",
  "images/task9-furnace.png",
  "images/task10-invisible-ink.png",
  "images/task11-suitcase.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    }),
  );
});
