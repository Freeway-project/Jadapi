import express from "express";
import { User } from "../models/user.model";

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