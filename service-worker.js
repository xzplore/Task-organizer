const CACHE_NAME = "task-organizer-cache-v1";
const OFFLINE_URLS = [
  "/Task-organizer/",
  "/Task-organizer/index.html"
];

// install: تخزين الملفات الأساسية
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// activate: تنظيف الكاشات القديمة
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// fetch: محاولة من الشبكة ثم الكاش كـ fallback
self.addEventListener("fetch", event => {
  const req = event.request;

  // لا نلمس طلبات غير GET
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match("/Task-organizer/index.html")))
  );
});

// اختياري: التعامل مع نقر الإشعار
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes("/Task-organizer/") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/Task-organizer/");
      }
    })
  );
});
