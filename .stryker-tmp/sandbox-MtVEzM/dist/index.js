// @ts-nocheck
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const url_1 = require("url");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = require("body-parser");
const openapi_to_mcp_1 = require("./utils/openapi-to-mcp");
const mcpHandlers_1 = require("./handlers/mcpHandlers");
const auth_1 = require("./middleware/auth");
const rateLimit_1 = require("./middleware/rateLimit");
const session_1 = require("./middleware/session");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, body_parser_1.json)({ limit: '1mb' }));
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(requestLogger_1.requestLogger); // Log all requests
    // Health check endpoint
    app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
    app.use(auth_1.authenticateJWT); // Protect all routes after this line
    app.use(session_1.sessionMiddleware); // Add session management after authentication
    // Apply rate limiting to all routes after this line, but disable it for tests
    if (process.env.NODE_ENV !== 'test') {
        app.use(rateLimit_1.mcpRateLimiter);
    }
    // Load OpenAPI and MCP tool definitions at startup
    const openapi = (0, openapi_to_mcp_1.loadOpenApiSpec)('config/openapi.json');
    const mcpTools = (0, openapi_to_mcp_1.extractMcpToolsFromOpenApi)(openapi);
    // MCP protocol endpoints
    app.post('/mcp/tools/list', (0, mcpHandlers_1.toolsListHandler)(mcpTools));
    app.post('/mcp/tools/call', (0, mcpHandlers_1.toolsCallHandler)(mcpTools, openapi));
    app.get('/mcp/notifications/tools/list_changed', (0, mcpHandlers_1.notificationsListChangedHandler)());
    // TODO: Add session management, rate limiting, input validation, error handling, SSE, etc.
    app.use(errorHandler_1.errorHandler); // Add error handling middleware at the end
    return app;
}
// Start the server only if this file is run directly (not imported as a module)
const isMainModule = process.argv[1] === (0, url_1.fileURLToPath)(import.meta.url);
if (isMainModule) {
    const app = createApp();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`MCP server listening on port ${port}`);
    });
}
//# sourceMappingURL=index.js.map