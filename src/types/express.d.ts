import type { Request as ExpressRequest } from 'express';

 
export type Request = ExpressRequest & {
  user?: {
    id: string;
    username: string;
    roles?: string[];
    [key: string]: unknown;
  };
};
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: string | (JwtPayload & { role?: string });
  }
}
