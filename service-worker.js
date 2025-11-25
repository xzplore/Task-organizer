// Basic service worker for PWA functionality.

self.addEventListener('install', (event) => {
  // Caching assets could be done here in a more advanced implementation.
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

// This is the crucial part for notifications.
// When the user clicks on a notification, it brings the app to the front.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
