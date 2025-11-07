import { fcm } from "../firebaseAdmin";
import { User } from "../models/user.model";
import { ENV } from "../config/env";


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
      url: options.url || `${ENV.FRONTEND_URL}/api/driver/requests`,
    },
  };

  try {
    // sendMulticast handles multiple tokens and provides per-token responses
    const response = await (fcm as any).sendMulticast({ tokens, ...message });
    console.log("FCM multicast response:", response);

    // Collect tokens that failed with unrecoverable errors and remove them
    const invalidTokens: string[] = [];
    let successCount = 0;
    let failCount = 0;

    response.responses.forEach((resp: any, idx: number) => {
      if (resp.success) {
        successCount++;
      } else {
        failCount++;
        const err = resp.error as any;
        const code = err?.code || '';

        console.log(`Token ${idx} failed with code: ${code}`, {
          token: tokens[idx]?.substring(0, 20) + '...',
          error: err?.message
        });

        // Codes indicating token invalidation
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    console.log(`FCM send results: ${successCount} success, ${failCount} failed`);

    if (invalidTokens.length > 0) {
      // Remove invalid tokens from the user's document
      await User.findByIdAndUpdate(driverId, { $pull: { pushTokens: { $in: invalidTokens } } });
      console.log(`✓ Cleaned up ${invalidTokens.length} invalid token(s) for driver ${driverId}`);
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
      url: options.url || `${ENV.FRONTEND_URL}/driver/requests`,
    },
  };

  try {
    const response = await fcm.send(message);
    console.log('✓ FCM notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (err: any) {
    const errorCode = err?.code || err?.errorInfo?.code || '';
    console.error('✗ Failed to send FCM notification:', {
      code: errorCode,
      message: err?.message,
      token: token?.substring(0, 20) + '...'
    });

    // Return error info for caller to handle
    return {
      success: false,
      error: errorCode,
      message: err?.message
    };
  }
}