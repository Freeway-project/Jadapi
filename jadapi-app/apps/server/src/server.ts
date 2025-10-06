import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { authenticate } from "./middlewares/auth";

const app = express();

// Middleware setup - relaxed CORS for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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