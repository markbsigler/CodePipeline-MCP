"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
exports.startServer = startServer;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const mcpHandlers_1 = require("./handlers/mcpHandlers");
const auth_1 = require("./middleware/auth");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimit_1 = require("./middleware/rateLimit");
const requestLogger_1 = require("./middleware/requestLogger");
const session_1 = require("./middleware/session");
const openapi_to_mcp_1 = require("./utils/openapi-to-mcp");
function createApp() {
  const app = (0, express_1.default)();
  app.use((0, express_1.json)({ limit: "1mb" }));
  app.use((0, cors_1.default)());
  app.use((0, helmet_1.default)());
  app.use(requestLogger_1.requestLogger); // Log all requests
  // Health check endpoint
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  app.use(auth_1.authenticateJWT); // Protect all routes after this line
  app.use(session_1.sessionMiddleware); // Add session management after authentication
  // Apply rate limiting to all routes after this line, but disable it for tests
  if (process.env.NODE_ENV !== "test") {
    app.use(rateLimit_1.mcpRateLimiter);
  }
  // Load OpenAPI and MCP tool definitions at startup
  const openapi = (0, openapi_to_mcp_1.loadOpenApiSpec)("config/openapi.json");
  const mcpTools = (0, openapi_to_mcp_1.extractMcpToolsFromOpenApi)(openapi);
  // Versioned API router (v1)
  const v1 = (0, express_1.Router)();
  // MCP protocol endpoints under /v1/mcp
  v1.post("/mcp/tools/list", (0, mcpHandlers_1.toolsListHandler)(mcpTools));
  v1.post(
    "/mcp/tools/call",
    (0, mcpHandlers_1.toolsCallHandler)(mcpTools, openapi),
  );
  v1.get(
    "/mcp/notifications/tools/list_changed",
    (0, mcpHandlers_1.notificationsListChangedHandler)(),
  );
  app.use("/v1", v1);
  // Legacy (unversioned) endpoints for backward compatibility (optional, can deprecate later)
  app.post("/mcp/tools/list", (0, mcpHandlers_1.toolsListHandler)(mcpTools));
  app.post(
    "/mcp/tools/call",
    (0, mcpHandlers_1.toolsCallHandler)(mcpTools, openapi),
  );
  app.get(
    "/mcp/notifications/tools/list_changed",
    (0, mcpHandlers_1.notificationsListChangedHandler)(),
  );
  // Add a catch-all 404 handler before the error handler
  app.use((_req, _res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });
  app.use(errorHandler_1.errorHandler); // Add error handling middleware at the end
  return app;
}
function startServer() {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`MCP server listening on port ${port}`);
  });
}
// Start the server only if this file is run directly (not imported as a module)
const isMainModule = typeof require !== "undefined" && require.main === module;
if (isMainModule) {
  // Dynamically import to avoid circular dependency and keep startup logic testable
  Promise.resolve()
    .then(() => __importStar(require("./startServer")))
    .then((mod) => mod.startServer());
}
//# sourceMappingURL=index.js.map
