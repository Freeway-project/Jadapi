import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

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