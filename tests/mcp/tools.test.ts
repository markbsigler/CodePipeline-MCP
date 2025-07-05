// Define mockMcpTools before any imports or jest.mock calls to avoid hoisting errors
const mockMcpTools = [
  {
    id: 'get-assignments',
    name: 'Get Assignments',
    description: 'Retrieve assignments for a specific SRID',
  },
  {
    id: 'create-assignment',
    name: 'Create Assignment',
    description: 'Create a new assignment',
  },
];

import { jest } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../../src/index';
import type { NextFunction, Request, Response } from 'express';

// Mock dependencies BEFORE importing the app
jest.mock('../../src/handlers/mcpHandlers', () => ({
  mcpTools: mockMcpTools,
  toolsListHandler: () => (req: any, res: any) => res.json({ tools: mockMcpTools }),
  toolsCallHandler: () => (req: any, res: any) => res.json({ result: 'mocked' }),
  notificationsListChangedHandler: () => (req: any, res: any) => res.json({ changed: false }),
}));
jest.mock('../../src/utils/openapi-to-mcp', () => ({
  loadOpenApiSpec: jest.fn(),
  extractMcpToolsFromOpenApi: jest.fn().mockReturnValue(mockMcpTools),
}));
jest.mock('../../src/middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: NextFunction) => next(), // Bypass auth for this test
}));

const app = createApp();

describe('POST /mcp/tools/list', () => {
  it('should return 200 OK with the list of mocked tools', async () => {
    const res = await request(app).post('/mcp/tools/list').send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ tools: mockMcpTools });
  });
});