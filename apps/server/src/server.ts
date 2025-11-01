import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { authenticate } from "./middlewares/auth";
import webhookRoutes from "./routes/webhook.routes";

const app = express();

// Middleware setup - relaxed CORS for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// IMPORTANT: Webhook routes MUST come BEFORE express.json()
// to receive raw body for signature verification
app.use("/api/webhooks", webhookRoutes);

// JSON body parser for all other routes
app.use(express.json());

// Health check endpoint (no auth required)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// JWT authentication middleware
app.use(authenticate);

// Routes setup
app.use("/api", routes);
app.use(errorHandler);

// Start server
(async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => logger.info(`Server running on http://localhost:${ENV.PORT}`));
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();

export default app;