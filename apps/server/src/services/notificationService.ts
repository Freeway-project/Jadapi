import { fcm } from "../firebaseAdmin";
import { User } from "../models/user.model";


export async function sendDriverNotification(
  driverId: string,
  options: {
    title: string;
    body: string;
    url?: string; // page to open when clicking notification
    data?: Record<string, string>;
  }
) {
  // const driver = await Driver.findById(driverId);
  // const token = driver?.fcmToken;
  // const token = "FETCH_FROM_DB_FOR_DRIVER"; // replace with real lookup

  const driver = await User.findById(driverId).select('pushTokens');
  const tokens = driver?.pushTokens || [];
  // const tokenFromDb = null; // placeholder - replace with actual lookup

  if (!tokens || tokens.length === 0) {
    console.log("No FCM tokens for driver:", driverId);
    return;
  }

  if (!fcm) {
    console.warn('FCM not configured. Skipping push notification.');
    return;
  }

  const message = {
    notification: {
      title: options.title,
      body: options.body,
    },
    data: {
      ...(options.data || {}),
      url: options.url || "/driver/requests",
    },
  };

  try {
    // sendMulticast handles multiple tokens and provides per-token responses
    const response = await (fcm as any).sendMulticast({ tokens, ...message });
    console.log("FCM multicast response:", response);

    // Collect tokens that failed with unrecoverable errors and remove them
    const invalidTokens: string[] = [];
    response.responses.forEach((resp: any, idx: number) => {
      if (!resp.success) {
        const err = resp.error as any;
        // firebase-admin error structure contains error.code
        const code = err?.code || '';
        // codes indicating token invalidation
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      // remove invalid tokens from the user's document
      await User.findByIdAndUpdate(driverId, { $pull: { pushTokens: { $in: invalidTokens } } });
      console.log('Removed invalid push tokens for', driverId, invalidTokens);
    }
  } catch (err) {
    console.error('Error sending FCM multicast message:', err);
  }
}

// Dev helper: send directly to an FCM token (skips DB lookup). Useful for local testing.
export async function sendNotificationToToken(
  token: string,
  options: {
    title: string;
    body: string;
    url?: string;
    data?: Record<string, string>;
  }
) {
  if (!token) {
    console.log('No token provided to sendNotificationToToken');
    return;
  }

  if (!fcm) {
    console.warn('FCM not configured. Skipping push notification.');
    return;
  }

  const message = {
    token,
    notification: {
      title: options.title,
      body: options.body,
    },
    data: {
      ...(options.data || {}),
      url: options.url || '/driver/requests',
    },
  };

  try {
    const response = await fcm.send(message);
    console.log('FCM response:', response);
  } catch (err) {
    console.error('Error sending FCM message (to token):', err);
  }
}