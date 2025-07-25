/* eslint-disable no-unused-vars */
declare module "express-serve-static-core" {
 
  interface _Request {
    user?: string | JwtPayload;
  }
}
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
 
  interface _Request {
    user?: string | JwtPayload;
  }
}
