import { Request, Response, NextFunction } from "express";
export declare function validateBody(
  schema: any,
): (
  req: Request,
  res: Response,
  next: NextFunction,
) => Response<any, Record<string, any>> | undefined;
