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
    icon: "/icon-192x192.png", // optional - provide a 192x192 icon in /public if you like
    badge: "/icon-72x72.png", // optional small monochrome badge
    data: payload.data || {},   // e.g. { url: "/driver/requests", playSound: 'true' }
    // Keep notification visible until user interacts (useful for important alerts)
    requireInteraction: true,
    // Add actions (optional buttons shown on some platforms)
    actions: payload.data?.actions || [
      { action: 'open', title: 'Open App' }
    ],
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);

  // If payload requests sound (or by default), ask focused clients to play a sound.
  // Note: service workers can't play audio directly; we postMessage to any open client
  // which can then play the audio (autoplay policies usually allow sound in response
  // to user gesture or if the page has been interacted with previously).
  const shouldPlaySound = payload.data?.playSound === 'true' || payload.data?.playSound === true;
  const soundFile = payload.data?.sound || '/notification.mp3';
  if (shouldPlaySound) {
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({ type: 'play-sound', sound: soundFile });
      }
    });
  }
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
