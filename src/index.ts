import cors from 'cors';
import express, { Application, Router, Request, Response, NextFunction, json } from 'express';
import helmet from 'helmet';

import {
  toolsListHandler,
  toolsCallHandler,
  notificationsListChangedHandler,
} from './handlers/mcpHandlers';
import { authenticateJWT } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { mcpRateLimiter } from './middleware/rateLimit';
import { requestLogger } from './middleware/requestLogger';
import { sessionMiddleware } from './middleware/session';
import {
  loadOpenApiSpec,
  extractMcpToolsFromOpenApi,
} from './utils/openapi-to-mcp';


export function createApp(): Application {
  const app = express();
  app.use(json({ limit: '1mb' }));
  app.use(cors());
  app.use(helmet());
  app.use(requestLogger); // Log all requests

  // Health check endpoint
  app.get('/healthz', (_req: Request, res: Response): void => { res.status(200).json({ status: 'ok' }); });

  app.use(authenticateJWT); // Protect all routes after this line
  app.use(sessionMiddleware); // Add session management after authentication

  // Apply rate limiting to all routes after this line, but disable it for tests
  if (process.env.NODE_ENV !== 'test') {
    app.use(mcpRateLimiter);
  }

  // Load OpenAPI and MCP tool definitions at startup
  const openapi = loadOpenApiSpec('config/openapi.json');
  const mcpTools = extractMcpToolsFromOpenApi(openapi as Record<string, unknown>);

  // Versioned API router (v1)
  const v1 = Router();

  // MCP protocol endpoints under /v1/mcp
  v1.post('/mcp/tools/list', toolsListHandler(mcpTools));
  v1.post('/mcp/tools/call', toolsCallHandler(mcpTools, openapi));
  v1.get(
    '/mcp/notifications/tools/list_changed',
    notificationsListChangedHandler(),
  );

  app.use('/v1', v1);

  // Legacy (unversioned) endpoints for backward compatibility (optional, can deprecate later)
  app.post('/mcp/tools/list', toolsListHandler(mcpTools));
  app.post('/mcp/tools/call', toolsCallHandler(mcpTools, openapi));
  app.get(
    '/mcp/notifications/tools/list_changed',
    notificationsListChangedHandler(),
  );

  // Add a catch-all 404 handler before the error handler
  app.use((_req: Request, _res: Response, next: NextFunction): void => {
    const err = new Error('Not Found') as Error & { status?: number };
    err.status = 404;
    next(err);
  });
  app.use(errorHandler); // Add error handling middleware at the end

  return app;
}

export function startServer(): void {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`MCP server listening on port ${port}`);
  });
}

// Start the server only if this file is run directly (not imported as a module)
const isMainModule = typeof require !== 'undefined' && require.main === module;
if (isMainModule) {
  // Dynamically import to avoid circular dependency and keep startup logic testable
  import('./startServer').then((mod) => mod.startServer());
}
