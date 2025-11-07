import admin from "firebase-admin";

let initialized = false;

console.log('========================================');
console.log('🔥 Firebase Admin SDK Initialization');
console.log('========================================');

// Initialize from environment variables
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;

console.log('Checking environment variables:');
console.log(`  FIREBASE_PROJECT_ID: ${projectId ? `✓ Present (${projectId})` : '✗ Missing'}`);
console.log(`  FIREBASE_CLIENT_EMAIL: ${clientEmail ? `✓ Present (${clientEmail})` : '✗ Missing'}`);
console.log(`  FIREBASE_PRIVATE_KEY: ${privateKey ? `✓ Present (${privateKey.length} chars, starts with: ${privateKey.substring(0, 30)}...)` : '✗ Missing'}`);

if (privateKey && clientEmail && projectId) {
  try {
    console.log('\nAttempting to initialize Firebase Admin SDK...');

    // privateKey in env may contain literal \n sequences - replace them with actual newlines
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    console.log(`  Private key formatted: ${formattedKey.substring(0, 50)}...`);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        } as admin.ServiceAccount),
      });
      initialized = true;
      console.log('\n✓ Firebase Admin SDK initialized successfully!');
      console.log(`  Project ID: ${projectId}`);
      console.log(`  Client Email: ${clientEmail}`);
      console.log('  FCM messaging is now available');
    }
  } catch (err: any) {
    console.error('\n✗ Failed to initialize Firebase Admin SDK');
    console.error('  Error:', err.message);
    console.error('  Full error:', err);
  }
} else {
  console.log('\n⚠ Firebase Admin SDK not initialized');
  console.log('  Missing environment variables:');
  if (!projectId) console.log('    - FIREBASE_PROJECT_ID is empty or undefined');
  if (!clientEmail) console.log('    - FIREBASE_CLIENT_EMAIL is empty or undefined');
  if (!privateKey) console.log('    - FIREBASE_PRIVATE_KEY is empty or undefined');
  console.log('  FCM notifications will be disabled.');
}

console.log('========================================\n');

export const fcm: admin.messaging.Messaging | null = initialized ? admin.messaging() : null;