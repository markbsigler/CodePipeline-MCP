import { Request, Response, NextFunction } from "express";
export declare function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void;
