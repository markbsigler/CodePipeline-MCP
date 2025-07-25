"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestCounter = void 0;
exports.initObservability = initObservability;
exports.metricsMiddleware = metricsMiddleware;
exports.exposePrometheusMetrics = exposePrometheusMetrics;
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const prom_client_1 = require("prom-client");
/**
 * Initializes observability (OpenTelemetry) for the app.
 * Wrapped in a function for testability and error handling.
 */
function initObservability() {
  try {
    const sdk = new sdk_node_1.NodeSDK({
      instrumentations: [
        (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)(),
        new instrumentation_express_1.ExpressInstrumentation(),
      ],
    });
    sdk.start();
  } catch (err) {
    console.error("Failed to initialize observability:", err);
  }
}
exports.httpRequestCounter = new prom_client_1.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});
function metricsMiddleware(req, res, next) {
  res.on("finish", () => {
    exports.httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
}
function exposePrometheusMetrics(app) {
  app.get("/metrics", async function metricsHandler(_req, res) {
    res.set("Content-Type", prom_client_1.register.contentType);
    res.end(await prom_client_1.register.metrics());
  });
}
//# sourceMappingURL=observability.js.map
