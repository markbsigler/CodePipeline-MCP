// @ts-nocheck
import { JwtPayload } from 'jsonwebtoken';

// This declaration merging allows us to attach a 'user' property
// to the Express Request object and have it be type-safe.
declare global {
  namespace Express {
    export interface Request {
      user?: string | JwtPayload;
    }
  }
}