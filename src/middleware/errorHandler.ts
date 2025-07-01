import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({
    err,
    url: req.originalUrl,
    method: req.method,
    user: (req as any).user?.sub || 'anon',
    sessionId: (req as any).sessionId || null
  }, 'Error occurred');
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
