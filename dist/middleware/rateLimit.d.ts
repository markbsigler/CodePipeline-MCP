import { Request, Response, NextFunction } from "express";
export declare function mcpRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void;
