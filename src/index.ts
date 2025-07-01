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

const app = express();
app.use(json({ limit: '1mb' }));
app.use(cors());
app.use(helmet());
app.use(requestLogger); // Log all requests
app.use(authenticateJWT); // Protect all routes after this line
app.use(sessionMiddleware); // Add session management after authentication
app.use(mcpRateLimiter); // Apply rate limiting to all routes after this line

// Health check endpoint
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));

// Load OpenAPI and MCP tool definitions at startup
const openapi = loadOpenApiSpec('config/openapi.json');
const mcpTools = extractMcpToolsFromOpenApi(openapi);

// MCP protocol endpoints
app.post('/mcp/tools/list', toolsListHandler(mcpTools));
app.post('/mcp/tools/call', toolsCallHandler(mcpTools, openapi));
app.get('/mcp/notifications/tools/list_changed', notificationsListChangedHandler());

// TODO: Add session management, rate limiting, input validation, error handling, SSE, etc.
app.use(errorHandler); // Add error handling middleware at the end

export default app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`MCP server listening on port ${port}`);
  });
}
