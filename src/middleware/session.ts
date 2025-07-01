import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  let sessionId = req.headers['x-session-id'] as string | undefined;
  if (!sessionId) {
    // Generate a secure, non-deterministic session ID
    const userId = (req as any).user?.sub || 'anon';
    sessionId = `${userId}:${uuidv4()}`;
    res.setHeader('x-session-id', sessionId);
  }
  (req as any).sessionId = sessionId;
  next();
}
