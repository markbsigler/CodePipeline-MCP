// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
export declare function authenticateJWT(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
