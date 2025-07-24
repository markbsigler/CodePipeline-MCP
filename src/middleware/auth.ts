import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
const JWT_ISSUER = process.env.JWT_ISSUER ?? 'codepipeline-mcp-server';

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const token = authHeader.substring(7);
  try {
    const payload = verify(token, JWT_SECRET as string, { issuer: JWT_ISSUER });
    (req as { user?: unknown }).user = payload;
    next();
  } catch {
    // Logging removed to comply with lint rules
    res.status(401).json({ error: 'Invalid, expired, or unauthorized token' });
  }
}
