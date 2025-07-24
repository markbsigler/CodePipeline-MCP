"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestCounter = void 0;
exports.initObservability = initObservability;
exports.metricsMiddleware = metricsMiddleware;
exports.exposePrometheusMetrics = exposePrometheusMetrics;
// OpenTelemetry and Prometheus metrics setup
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const exporter_prometheus_1 = require("@opentelemetry/exporter-prometheus");
/**
 * Initializes observability (OpenTelemetry) for the app.
 * Wrapped in a function for testability and error handling.
 */
function initObservability() {
  try {
    const sdk = new sdk_node_1.NodeSDK({
      traceExporter: new exporter_prometheus_1.PrometheusExporter({
        startServer: true,
        port: 9464,
      }),
      instrumentations: [
        (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)(),
        new instrumentation_express_1.ExpressInstrumentation(),
      ],
    });
    sdk.start();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize observability:", err);
  }
}
// prom-client for custom metrics
const prom_client_1 = __importDefault(require("prom-client"));
exports.httpRequestCounter = new prom_client_1.default.Counter({
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
  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", prom_client_1.default.register.contentType);
    res.end(await prom_client_1.default.register.metrics());
  });
}
//# sourceMappingURL=observability.js.map
