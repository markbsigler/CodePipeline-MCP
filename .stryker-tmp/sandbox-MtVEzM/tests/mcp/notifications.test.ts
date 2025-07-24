// @ts-nocheck
import request from 'supertest';
import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies BEFORE importing the app
jest.mock('../../src/utils/openapi-to-mcp', () => ({
  loadOpenApiSpec: jest.fn(),
  extractMcpToolsFromOpenApi: jest.fn().mockReturnValue([]),
}));

jest.mock('../../src/middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: NextFunction) => next(), // Bypass auth for this test
}));

import { createApp } from '../../src/index';

const app = createApp();

describe('GET /v1/mcp/notifications/tools/list_changed', () => {
  it('should return 200 OK with changed: false', async () => {
    const res = await request(app).get('/v1/mcp/notifications/tools/list_changed');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ changed: false });
  });
});