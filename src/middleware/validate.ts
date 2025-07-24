import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: 'Invalid request body', details: result.error.errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
