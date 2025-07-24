// @ts-nocheck
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
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json } from 'body-parser';
import { loadOpenApiSpec, extractMcpToolsFromOpenApi } from './utils/openapi-to-mcp';
import { toolsListHandler, toolsCallHandler, notificationsListChangedHandler } from './handlers/mcpHandlers';
import { authenticateJWT } from './middleware/auth';
import { mcpRateLimiter } from './middleware/rateLimit';
import { sessionMiddleware } from './middleware/session';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
export function createApp() {
  if (stryMutAct_9fa48("145")) {
    {}
  } else {
    stryCov_9fa48("145");
    const app = express();
    app.use(json(stryMutAct_9fa48("146") ? {} : (stryCov_9fa48("146"), {
      limit: stryMutAct_9fa48("147") ? "" : (stryCov_9fa48("147"), '1mb')
    })));
    app.use(cors());
    app.use(helmet());
    app.use(requestLogger); // Log all requests

    // Health check endpoint
    app.get(stryMutAct_9fa48("148") ? "" : (stryCov_9fa48("148"), '/healthz'), stryMutAct_9fa48("149") ? () => undefined : (stryCov_9fa48("149"), (_req, res) => res.status(200).json(stryMutAct_9fa48("150") ? {} : (stryCov_9fa48("150"), {
      status: stryMutAct_9fa48("151") ? "" : (stryCov_9fa48("151"), 'ok')
    }))));
    app.use(authenticateJWT); // Protect all routes after this line
    app.use(sessionMiddleware); // Add session management after authentication

    // Apply rate limiting to all routes after this line, but disable it for tests
    if (stryMutAct_9fa48("154") ? process.env.NODE_ENV === 'test' : stryMutAct_9fa48("153") ? false : stryMutAct_9fa48("152") ? true : (stryCov_9fa48("152", "153", "154"), process.env.NODE_ENV !== (stryMutAct_9fa48("155") ? "" : (stryCov_9fa48("155"), 'test')))) {
      if (stryMutAct_9fa48("156")) {
        {}
      } else {
        stryCov_9fa48("156");
        app.use(mcpRateLimiter);
      }
    }

    // Load OpenAPI and MCP tool definitions at startup
    const openapi = loadOpenApiSpec(stryMutAct_9fa48("157") ? "" : (stryCov_9fa48("157"), 'config/openapi.json'));
    const mcpTools = extractMcpToolsFromOpenApi(openapi);

    // Versioned API router (v1)
    const v1 = express.Router();

    // MCP protocol endpoints under /v1/mcp
    v1.post(stryMutAct_9fa48("158") ? "" : (stryCov_9fa48("158"), '/mcp/tools/list'), toolsListHandler(mcpTools));
    v1.post(stryMutAct_9fa48("159") ? "" : (stryCov_9fa48("159"), '/mcp/tools/call'), toolsCallHandler(mcpTools, openapi));
    v1.get(stryMutAct_9fa48("160") ? "" : (stryCov_9fa48("160"), '/mcp/notifications/tools/list_changed'), notificationsListChangedHandler());
    app.use(stryMutAct_9fa48("161") ? "" : (stryCov_9fa48("161"), '/v1'), v1);

    // Legacy (unversioned) endpoints for backward compatibility (optional, can deprecate later)
    app.post(stryMutAct_9fa48("162") ? "" : (stryCov_9fa48("162"), '/mcp/tools/list'), toolsListHandler(mcpTools));
    app.post(stryMutAct_9fa48("163") ? "" : (stryCov_9fa48("163"), '/mcp/tools/call'), toolsCallHandler(mcpTools, openapi));
    app.get(stryMutAct_9fa48("164") ? "" : (stryCov_9fa48("164"), '/mcp/notifications/tools/list_changed'), notificationsListChangedHandler());

    // Add a catch-all 404 handler before the error handler
    app.use((_req, res, next) => {
      if (stryMutAct_9fa48("165")) {
        {}
      } else {
        stryCov_9fa48("165");
        const err: any = new Error(stryMutAct_9fa48("166") ? "" : (stryCov_9fa48("166"), 'Not Found'));
        err.status = 404;
        next(err);
      }
    });
    app.use(errorHandler); // Add error handling middleware at the end

    return app;
  }
}

// Start the server only if this file is run directly (not imported as a module)
const isMainModule = stryMutAct_9fa48("169") ? require.main !== module : stryMutAct_9fa48("168") ? false : stryMutAct_9fa48("167") ? true : (stryCov_9fa48("167", "168", "169"), require.main === module);
if (stryMutAct_9fa48("171") ? false : stryMutAct_9fa48("170") ? true : (stryCov_9fa48("170", "171"), isMainModule)) {
  if (stryMutAct_9fa48("172")) {
    {}
  } else {
    stryCov_9fa48("172");
    const app = createApp();
    const port = stryMutAct_9fa48("175") ? process.env.PORT && 3000 : stryMutAct_9fa48("174") ? false : stryMutAct_9fa48("173") ? true : (stryCov_9fa48("173", "174", "175"), process.env.PORT || 3000);
    app.listen(port, () => {
      if (stryMutAct_9fa48("176")) {
        {}
      } else {
        stryCov_9fa48("176");
        // eslint-disable-next-line no-console
        console.log(stryMutAct_9fa48("177") ? `` : (stryCov_9fa48("177"), `MCP server listening on port ${port}`));
      }
    });
  }
}