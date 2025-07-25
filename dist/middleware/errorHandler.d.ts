import { Request, Response, NextFunction } from "express";
export declare function errorHandler(
  err: Error & {
    status?: number;
    [key: string]: unknown;
  },
  req: Request,
  res: Response,
  next: NextFunction,
): void;
