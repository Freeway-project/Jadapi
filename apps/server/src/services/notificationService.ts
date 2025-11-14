import { fcm } from "../firebaseAdmin";
import { User } from "../models/user.model";
import { ENV } from "../config/env";
import { logger } from "../utils/logger";


export async function sendDriverNotification(
  driverId: string,
  options: {
    title: string;
    body: string;
    url?: string; // page to open when clicking notification
    data?: Record<string, string>;
  }
) {
  logger.info({
    driverId,
    title: options.title,
    body: options.body,
    url: options.url,
    data: options.data
  }, '📨 Attempting to send driver notification');

  const driver = await User.findById(driverId).select('pushTokens profile.name');
  const tokens = driver?.pushTokens || [];

  logger.info({
    driverId,
    driverName: driver?.profile?.name,
    tokenCount: tokens.length
  }, `Driver has ${tokens.length} FCM token(s)`);

  if (!tokens || tokens.length === 0) {
    logger.warn({
      driverId,
      driverName: driver?.profile?.name
    }, "❌ No FCM tokens for driver - notification NOT sent");
    return;
  }

  if (!fcm) {
    logger.error({
      driverId,
      driverName: driver?.profile?.name,
      title: options.title,
      body: options.body
    }, '⚠️  FCM NOT CONFIGURED - Cannot send notification. Check Firebase Admin SDK initialization (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
    return;
  }

  const message = {
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
    logger.info({ driverId, tokenCount: tokens.length }, '🚀 Sending FCM notification via sendMulticast');

    // Prefer the efficient sendMulticast API when available
    if (typeof (fcm as any).sendMulticast === 'function') {
      const response = await (fcm as any).sendMulticast({ tokens, ...message });

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

          logger.warn({
            driverId,
            tokenIndex: idx,
            errorCode: code,
            errorMessage: err?.message,
            token: tokens[idx]?.substring(0, 20) + '...'
          }, `❌ Token ${idx} failed with code: ${code}`);

          // Codes indicating token invalidation
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      logger.info({
        driverId,
        driverName: driver?.profile?.name,
        successCount,
        failCount,
        title: options.title,
        body: options.body
      }, `✅ FCM notification sent: ${successCount} success, ${failCount} failed`);

      if (invalidTokens.length > 0) {
        // Remove invalid tokens from the user's document
        await User.findByIdAndUpdate(driverId, { $pull: { pushTokens: { $in: invalidTokens } } });
        logger.info({
          driverId,
          invalidTokenCount: invalidTokens.length
        }, `🧹 Cleaned up ${invalidTokens.length} invalid token(s) for driver ${driverId}`);
      }
    } else {
      // Fall back: send messages individually if sendMulticast is not available
      logger.warn({ driverId }, '⚠️  FCM sendMulticast not available; falling back to individual sends');
      const results = await Promise.allSettled(tokens.map((t) => fcm!.send({ token: t, ...message })));

      const invalidTokens: string[] = [];
      let successCount = 0;
      let failCount = 0;

      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          successCount++;
        } else {
          failCount++;
          const err: any = res.reason;
          const code = err?.code || '';
          logger.warn({
            driverId,
            tokenIndex: idx,
            errorCode: code,
            errorMessage: err?.message,
            token: tokens[idx]?.substring(0, 20) + '...'
          }, `❌ Token ${idx} failed (individual send) with code: ${code}`);

          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      logger.info({
        driverId,
        driverName: driver?.profile?.name,
        successCount,
        failCount,
        title: options.title,
        body: options.body
      }, `✅ FCM fallback notification sent: ${successCount} success, ${failCount} failed`);

      if (invalidTokens.length > 0) {
        await User.findByIdAndUpdate(driverId, { $pull: { pushTokens: { $in: invalidTokens } } });
        logger.info({
          driverId,
          invalidTokenCount: invalidTokens.length
        }, `🧹 Cleaned up ${invalidTokens.length} invalid token(s) for driver ${driverId}`);
      }
    }
  } catch (err) {
    logger.error({
      driverId,
      driverName: driver?.profile?.name,
      error: err,
      title: options.title,
      body: options.body
    }, '❌ Error sending FCM notification');
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
    logger.warn('No token provided to sendNotificationToToken');
    return;
  }

  logger.info({
    token: token?.substring(0, 30) + '...',
    title: options.title,
    body: options.body
  }, '📨 Sending test notification to token');

  if (!fcm) {
    logger.error({
      token: token?.substring(0, 30) + '...',
      title: options.title,
      body: options.body
    }, '⚠️  FCM NOT CONFIGURED - Cannot send test notification. Check Firebase Admin SDK initialization');
    return { success: false, error: 'FCM_NOT_CONFIGURED', message: 'Firebase Admin SDK not initialized' };
  }

  const message = {
    token,
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
    const response = await fcm!.send(message);
    logger.info({
      messageId: response,
      token: token?.substring(0, 20) + '...',
      title: options.title
    }, '✅ FCM test notification sent successfully');
    return { success: true, messageId: response };
  } catch (err: any) {
    const errorCode = err?.code || err?.errorInfo?.code || '';
    logger.error({
      errorCode,
      errorMessage: err?.message,
      token: token?.substring(0, 20) + '...',
      title: options.title
    }, '❌ Failed to send FCM test notification');

    // Return error info for caller to handle
    return {
      success: false,
      error: errorCode,
      message: err?.message
    };
  }
}