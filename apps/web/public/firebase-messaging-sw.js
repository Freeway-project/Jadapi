/* global importScripts, firebase */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification?.title || "New notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    data: payload.data || {},
    requireInteraction: true,
    // Browser will use default notification sound
    silent: false,
    actions: payload.data?.actions || [
      { action: 'open', title: 'Open App' }
    ],
  };

  // Show the notification with default system sound
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// When user clicks the notification
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the user clicked an action button, you can handle it here via event.action
      if (event.action) {
        // Example: if action === 'open' we open the URL (fallback default)
        if (event.action === 'open') {
          for (const client of clientList) {
            if ("focus" in client) {
              client.focus();
              client.navigate(urlToOpen);
              return;
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        }
      }

      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          // Use navigate if available
          if (typeof client.navigate === 'function') {
            client.navigate(urlToOpen);
          } else {
            // Fallback: post a message asking the client to route
            client.postMessage({ type: 'route', url: urlToOpen });
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
