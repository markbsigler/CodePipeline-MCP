import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing the app
jest.mock('../../src/utils/openapi-to-mcp', () => ({
  loadOpenApiSpec: jest.fn(),
  extractMcpToolsFromOpenApi: jest.fn().mockReturnValue([]),
}));

jest.mock('../../src/middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: NextFunction): void =>
    next(), // Bypass auth for this test
}));

import { createApp } from '../../src/index';

const app = createApp();

describe('GET /v1/mcp/notifications/tools/list_changed', function notificationsListChangedDescribe(): void {
  it('should return 200 OK with changed: false', async function shouldReturn200WithChangedFalse(): Promise<void> {
    const res = await request(app).get(
      '/v1/mcp/notifications/tools/list_changed',
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ changed: false });
  });
});
