import { Request, Response, NextFunction } from 'express';

import logger from '../utils/logger';

export function errorHandler(
  err: Error & { status?: number; [key: string]: unknown },
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  logger.error(
    {
      err,
      url: req.originalUrl,
      method: req.method,
      user: (req as { user?: { sub?: string } }).user?.sub || 'anon',
      sessionId: (req as { sessionId?: string }).sessionId || null,
      stack: err.stack,
    },
    'Error occurred',
  );

  if (res.headersSent) {
    return next(err);
  }

  res.setHeader('Content-Type', 'application/json');
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'ERR_INTERNAL',
    ...(err.details && !isProd ? { details: err.details } : {}),
    ...(isProd ? {} : { stack: err.stack }),
  });
}
