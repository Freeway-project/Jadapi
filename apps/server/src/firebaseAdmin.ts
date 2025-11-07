import admin from "firebase-admin";

let initialized = false;

// Initialize from environment variables
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (privateKey && clientEmail && projectId) {
  try {
    // privateKey in env may contain literal \n sequences - replace them with actual newlines
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        } as admin.ServiceAccount),
      });
      initialized = true;
      console.log('✓ Firebase Admin SDK initialized successfully');
      console.log(`  Project ID: ${projectId}`);
      console.log(`  Client Email: ${clientEmail}`);
    }
  } catch (err) {
    console.error('✗ Failed to initialize Firebase Admin SDK:', err);
  }
} else {
  console.warn('⚠ Firebase Admin SDK not initialized. Missing environment variables:');
  if (!projectId) console.warn('  - FIREBASE_PROJECT_ID');
  if (!clientEmail) console.warn('  - FIREBASE_CLIENT_EMAIL');
  if (!privateKey) console.warn('  - FIREBASE_PRIVATE_KEY');
  console.warn('  FCM notifications will be disabled.');
}

export const fcm: admin.messaging.Messaging | null = initialized ? admin.messaging() : null;