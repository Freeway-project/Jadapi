import express from "express";
import { User } from "../models/user.model";
import { sendNotificationToToken } from "../services/notificationService";

const router = express.Router();

router.post("/api/fcm-token", async (req, res) => {
  try {
    // Accept either userId or driverId from client (some clients send driverId)
    const { userId, driverId, token } = req.body;
    const id = userId || driverId;

    if (!id || !token) {
      return res.status(400).json({ message: "userId/driverId and token required" });
    }

    // Save token on User document (drivers are represented as users with driver role)
    // Use $addToSet to avoid duplicates and keep multiple device tokens per user
    await User.findByIdAndUpdate(id, { $addToSet: { pushTokens: token } }, { new: true });

    console.log("Received FCM token from user/driver:", id, token);

    return res.json({ success: true });
  } catch (err) {
    console.error("Error saving FCM token:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/fcm-token  -> remove token for a user/driver
router.delete("/api/fcm-token", async (req, res) => {
  try {
    const { userId, driverId, token, all } = req.body;
    const id = userId || driverId;
    if (!id) return res.status(400).json({ message: 'userId/driverId required' });

    if (all) {
      // remove all tokens for the user
      await User.findByIdAndUpdate(id, { $set: { pushTokens: [] } });
      console.log('Removed all FCM tokens for user/driver:', id);
      return res.json({ success: true });
    }

    if (!token) return res.status(400).json({ message: 'token required to remove' });

    await User.findByIdAndUpdate(id, { $pull: { pushTokens: token } });
    console.log('Removed FCM token for user/driver:', id, token);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error removing FCM token:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

// Dev-only endpoint to send a notification to a raw token (convenience)
// Useful for testing from Postman/curl without needing ts-node or env var.
// Always register the endpoint but require a short dev auth header to avoid accidental public use.
router.post('/dev/send-fcm', async (req, res) => {
  try {
    const devKey = process.env.DEV_SEND_FCM_KEY;
    const provided = req.header('X-DEV-AUTH');

    if (devKey) {
      if (!provided || provided !== devKey) {
        return res.status(403).json({ message: 'forbidden' });
      }
    } else {
      // If no DEV_SEND_FCM_KEY is configured, require a placeholder header value to be 'your-secret'
      if (!provided || provided !== 'your-secret') {
        return res.status(403).json({ message: 'forbidden — set DEV_SEND_FCM_KEY or use header X-DEV-AUTH: your-secret' });
      }
    }

    const { token, title, body, url, data } = req.body;
    if (!token) return res.status(400).json({ message: 'token required' });

    const result = await sendNotificationToToken(token, { title: title || 'Test', body: body || 'Test body', url, data });

    if (result?.success) {
      return res.json({ success: true, messageId: result.messageId });
    } else {
      return res.status(400).json({
        success: false,
        error: result?.error || 'unknown',
        message: result?.message || 'Failed to send notification'
      });
    }
  } catch (err: any) {
    console.error('Dev send-fcm error:', err);
    return res.status(500).json({ message: err?.message || 'error' });
  }
});