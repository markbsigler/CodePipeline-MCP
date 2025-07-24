// @ts-nocheck
// OpenTelemetry and Prometheus metrics setup
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
const sdk = new NodeSDK(stryMutAct_9fa48("476") ? {} : (stryCov_9fa48("476"), {
  traceExporter: new PrometheusExporter(stryMutAct_9fa48("477") ? {} : (stryCov_9fa48("477"), {
    startServer: stryMutAct_9fa48("478") ? false : (stryCov_9fa48("478"), true),
    port: 9464
  })),
  instrumentations: stryMutAct_9fa48("479") ? [] : (stryCov_9fa48("479"), [getNodeAutoInstrumentations(), new ExpressInstrumentation()])
}));
sdk.start();

// prom-client for custom metrics
import client from 'prom-client';
export const httpRequestCounter = new client.Counter(stryMutAct_9fa48("480") ? {} : (stryCov_9fa48("480"), {
  name: stryMutAct_9fa48("481") ? "" : (stryCov_9fa48("481"), 'http_requests_total'),
  help: stryMutAct_9fa48("482") ? "" : (stryCov_9fa48("482"), 'Total HTTP requests'),
  labelNames: stryMutAct_9fa48("483") ? [] : (stryCov_9fa48("483"), [stryMutAct_9fa48("484") ? "" : (stryCov_9fa48("484"), 'method'), stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), 'route'), stryMutAct_9fa48("486") ? "" : (stryCov_9fa48("486"), 'status')])
}));
export function metricsMiddleware(req, res, next) {
  if (stryMutAct_9fa48("487")) {
    {}
  } else {
    stryCov_9fa48("487");
    res.on(stryMutAct_9fa48("488") ? "" : (stryCov_9fa48("488"), 'finish'), () => {
      if (stryMutAct_9fa48("489")) {
        {}
      } else {
        stryCov_9fa48("489");
        httpRequestCounter.inc(stryMutAct_9fa48("490") ? {} : (stryCov_9fa48("490"), {
          method: req.method,
          route: req.route ? req.route.path : req.path,
          status: res.statusCode
        }));
      }
    });
    next();
  }
}
export function exposePrometheusMetrics(app) {
  if (stryMutAct_9fa48("491")) {
    {}
  } else {
    stryCov_9fa48("491");
    app.get(stryMutAct_9fa48("492") ? "" : (stryCov_9fa48("492"), '/metrics'), async (_req, res) => {
      if (stryMutAct_9fa48("493")) {
        {}
      } else {
        stryCov_9fa48("493");
        res.set(stryMutAct_9fa48("494") ? "" : (stryCov_9fa48("494"), 'Content-Type'), client.register.contentType);
        res.end(await client.register.metrics());
      }
    });
  }
}