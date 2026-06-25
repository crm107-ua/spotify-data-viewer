// Stub vacío: evita 404 cuando el navegador o una extensión (Warera)
// solicita este service worker en localhost. No afecta a Spotify Data Viewer.
self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
