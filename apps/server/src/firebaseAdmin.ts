import admin from "firebase-admin";
import fs from 'fs';
import path from 'path';

let initialized = false;

// Try to load service account JSON from config directory (optional)
try {
  const saPath = path.resolve(__dirname, '../config/firebase-service-account.json');
  if (fs.existsSync(saPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(saPath) as admin.ServiceAccount;
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      console.log('Firebase Admin initialized from service account file');
    }
  }
} catch (err) {
  console.warn('Failed to initialize Firebase Admin from file:', err);
}

// Fallback: initialize from environment variables if available
if (!initialized) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      // privateKey in env may contain literal \n sequences
      const formattedKey = privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey;
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formattedKey,
          } as unknown as admin.ServiceAccount),
        });
        initialized = true;
        console.log('Firebase Admin initialized from environment variables');
      }
    } catch (err) {
      console.warn('Failed to initialize Firebase Admin from environment:', err);
    }
  }
}

if (!initialized) {
  console.warn('Firebase Admin SDK not initialized. FCM functionality will be disabled.');
}

export const fcm: admin.messaging.Messaging | null = initialized ? admin.messaging() : null;