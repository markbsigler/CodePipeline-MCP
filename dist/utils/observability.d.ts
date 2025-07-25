import { Request, Response, NextFunction, Application } from "express";
import { Counter } from "prom-client";
/**
 * Initializes observability (OpenTelemetry) for the app.
 * Wrapped in a function for testability and error handling.
 */
export declare function initObservability(): void;
export declare const httpRequestCounter: Counter<"status" | "route" | "method">;
export declare function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void;
export declare function exposePrometheusMetrics(app: Application): void;
