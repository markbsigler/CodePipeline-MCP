import { Request, Response, NextFunction } from "express";

import logger from "../utils/logger";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: Date.now() - start,
        user: (req as { user?: { sub?: string } }).user?.sub || "anon",
        sessionId: (req as { sessionId?: string }).sessionId || null,
      },
      "Request completed",
    );
  });
  next();
}
