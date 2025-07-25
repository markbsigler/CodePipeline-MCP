import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
export declare function validateBody(
  schema: ZodTypeAny,
): (req: Request, res: Response, next: NextFunction) => void;
