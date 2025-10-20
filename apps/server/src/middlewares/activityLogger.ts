import { Request, Response, NextFunction } from "express";
import { ActivityLog } from "../models/ActivityLog";
import { logger } from "../utils/logger";

/**
 * Middleware to log API activity
 */
export const activityLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Capture response
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Log after response is sent
  res.on("finish", async () => {
    try {
      const duration = Date.now() - startTime;
      const userId = req.user?.id 

      // Determine action based on method
      let action = "unknown";
      if (req.method === "POST") action = "create";
      else if (req.method === "PUT" || req.method === "PATCH") action = "update";
      else if (req.method === "DELETE") action = "delete";
      else if (req.method === "GET") action = "read";

      // Extract resource from path
      const pathParts = req.path.split("/").filter(Boolean);
      const resource = pathParts[0] || "unknown";

      await ActivityLog.create({
        userId,
        action,
        resource,
        resourceId: pathParts[1],
        method: req.method,
        endpoint: req.path,
        statusCode: res.statusCode,
        ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString()?.split(",")[0],
        userAgent: req.headers["user-agent"],
        metadata: {
          duration,
          queryParams: req.query,
          bodySize: JSON.stringify(req.body || {}).length,
        },
      });
    } catch (error) {
      logger.error({ error }, "activityLogger middleware - Failed to log activity");
    }
  });

  next();
};

/**
 * Log custom admin actions
 */
export const logAdminAction = async (
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>
) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      resource,
      resourceId,
      metadata,
    });
  } catch (error) {
    logger.error({ error, userId, action, resource }, "logAdminAction - Failed to log admin action");
  }
};
