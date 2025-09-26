import app from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";

(async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => logger.info(`Server running on http://localhost:${ENV.PORT}`));
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();
