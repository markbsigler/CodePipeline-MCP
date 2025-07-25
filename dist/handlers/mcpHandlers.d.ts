import { Request, Response } from "express";
export declare function toolsListHandler(
  mcpTools: unknown[],
): (_req: Request, _res: Response) => void;
export declare function toolsCallHandler(
  mcpTools: unknown[],
  _openapi: unknown,
): (_req: Request, _res: Response) => Promise<void>;
export declare function notificationsListChangedHandler(): (
  req: Request,
  res: Response,
) => void;
