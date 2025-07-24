// @ts-nocheck
import { Request, Response } from 'express';
export declare function toolsListHandler(mcpTools: any[]): (_req: Request, res: Response) => void;
export declare function toolsCallHandler(mcpTools: any[], _openapi: any): (_req: Request, res: Response) => Promise<void>;
export declare function notificationsListChangedHandler(): (_req: Request, res: Response) => void;
