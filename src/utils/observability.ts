import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { Request, Response, NextFunction, Application } from "express";
import { Counter, register } from "prom-client";

/**
 * Initializes observability (OpenTelemetry) for the app.
 * Wrapped in a function for testability and error handling.
 */
export function initObservability(): void {
  try {
    const sdk = new NodeSDK({
      instrumentations: [
        getNodeAutoInstrumentations(),
        new ExpressInstrumentation(),
      ],
    });
    sdk.start();
  } catch (err) {
    console.error("Failed to initialize observability:", err);
  }
}

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
}

export function exposePrometheusMetrics(app: Application): void {
  app.get(
    "/metrics",
    async function metricsHandler(_req: Request, res: Response): Promise<void> {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    },
  );
}
