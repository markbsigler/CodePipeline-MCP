import { Request, Response, NextFunction } from "express";
export declare function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void;
