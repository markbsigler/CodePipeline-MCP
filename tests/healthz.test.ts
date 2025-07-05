import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the openapi utility functions before importing the app.
// This prevents the app from trying to read a file from disk during testing.
jest.mock('../src/utils/openapi-to-mcp', () => ({
  loadOpenApiSpec: jest.fn(),
  extractMcpToolsFromOpenApi: jest.fn().mockReturnValue([]),
}));

import { createApp } from '../src/index';

// Create a fresh app instance for this test suite
const app = createApp();

describe('/healthz endpoint', () => {
  it('should return 200 OK with status ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});