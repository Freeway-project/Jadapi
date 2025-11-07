"use client";

import { useEffect, useState } from "react";

import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "lib/utils/firebaseConfig";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY; // from Firebase console

export function useFcmToken(driverId?: string) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestToken = async () => {
    if (!messaging || typeof window === "undefined") return null;
    try {
      setLoading(true);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission not granted");
        setLoading(false);
        return null;
      }

      // Register SW
      const swReg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      // Get FCM token
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (!currentToken) {
        console.log("No token returned");
        setLoading(false);
        return null;
      }

      console.log("FCM token:", currentToken);
      setToken(currentToken);

      // Send to Express backend to save with this driver
      if (driverId) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api';
        try {
          await fetch(`${apiUrl}/fcm-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ driverId, token: currentToken }),
          });
        } catch (err) {
          console.error('Failed to POST FCM token to backend:', err);
        }
      }

      // Foreground message handler
      onMessage(messaging, (payload) => {
        console.log("Message in foreground:", payload);
        try {
          const title = payload.notification?.title || 'Notification';
          const body = payload.notification?.body || '';
          if (Notification.permission === 'granted') {
            new Notification(title, { body });
          }
        } catch (e) {
          console.warn('foreground notification display failed', e);
        }
      });

      setLoading(false);
      return currentToken;
    } catch (err) {
      console.error("Error getting FCM token:", err);
      setLoading(false);
      return null;
    }
  };

  // Auto-request token when driverId becomes available (login)
  useEffect(() => {
    if (driverId) {
      // fire and forget
      requestToken().catch((e) => console.error('requestToken error', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  return { token, loading, requestToken } as const;
}
