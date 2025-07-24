/**
 * Initializes observability (OpenTelemetry) for the app.
 * Wrapped in a function for testability and error handling.
 */
export declare function initObservability(): void;
import client from "prom-client";
export declare const httpRequestCounter: client.Counter<
  "status" | "route" | "method"
>;
export declare function metricsMiddleware(req: any, res: any, next: any): void;
import { Application } from "express";
export declare function exposePrometheusMetrics(app: Application): void;
