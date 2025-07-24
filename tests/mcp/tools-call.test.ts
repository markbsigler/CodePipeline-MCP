import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { z, ZodTypeAny } from 'zod';

// --- Test Setup ---

// Force test mode for deterministic handler output
process.env.NODE_ENV = 'test';

// 1. Define a sample list of tools that our mocked module will return.
const mockMcpTools = [
  {
    id: 'get_weather',
    name: 'Get Weather',
    description: 'Get the current weather for a location',
  },
  {
    id: 'get_stock_price', // This tool will exist but won't have a schema, to test an error case.
    name: 'Get Stock Price',
    description: 'Get the latest stock price for a ticker symbol',
  },
];

// 2. Define the Zod validation schemas that would normally be generated from OpenAPI.
const mockZodSchemas: Record<string, { input: ZodTypeAny }> = {
  get_weather: {
    input: z.object({
      location: z
        .string()
        .describe('The city and state, e.g. San Francisco, CA'),
    }),
  },
  // Note: 'get_stock_price' is intentionally omitted to test the schema-not-found case.
};

// 3. Mock the modules that have external dependencies (like file reading or auth).
jest.mock('../../src/utils/openapi-to-mcp', () => ({
  loadOpenApiSpec: jest.fn(),
  extractMcpToolsFromOpenApi: jest.fn().mockReturnValue(mockMcpTools),
}));

jest.mock('../../src/middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: NextFunction): void =>
    next(), // Bypass auth for these tests
}));

// 4. Mock the generated Zod schemas to provide our test schemas.
jest.mock('../../src/types/toolZodSchemas', () => ({
  toolZodSchemas: mockZodSchemas,
}));

import { createApp } from '../../src/index';

// 5. Create a fresh, isolated app instance for this test suite.
const app = createApp();

describe('POST /v1/mcp/tools/call', () => {
  it('should return 200 and a streamed result for a valid tool call', async function shouldReturn200AndStreamedResult(): Promise<void> {
    const res = await request(app)
      .post('/v1/mcp/tools/call')
      .send({
        tool: 'get_weather',
        params: { location: 'San Francisco, CA' },
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');

    // The response is a single JSON object built from streamed chunks.
    const body = JSON.parse(res.text);
    expect(body.jsonrpc).toBe('2.0');
    expect(body.result.completed).toBe(true);
    expect(body.result.progress).toBe(1);
    // The mock tool logic simply echos the input parameters.
    expect(body.result.resultChunks[0].content).toContain('San Francisco, CA');
  });

  it('should return 404 if the tool does not exist', async function shouldReturn404IfToolDoesNotExist(): Promise<void> {
    const res = await request(app)
      .post('/v1/mcp/tools/call')
      .send({ tool: 'non_existent_tool', params: {} });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Tool not found' });
  });

  it('should return 500 if a tool exists but has no validation schema', async () => {
    const res = await request(app)
      .post('/v1/mcp/tools/call')
      .send({ tool: 'get_stock_price', params: { ticker: 'GOOG' } });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Validation schema not found for tool' });
  });

  it('should return 400 if the input parameters are invalid', async () => {
    const res = await request(app)
      .post('/v1/mcp/tools/call')
      .send({ tool: 'get_weather', params: { location: 12345 } }); // Invalid type

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid tool input');
    expect(res.body.details[0].message).toBe(
      'Expected string, received number',
    );
  });
});
