import { Request, Response, NextFunction } from 'express';

export function validateBody(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request body', details: result.error.errors });
    }
    req.body = result.data;
    next();
  };
}
