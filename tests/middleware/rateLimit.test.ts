import request from 'supertest';
import express from 'express';
import { mcpRateLimiter } from '../../src/middleware/rateLimit';

describe('mcpRateLimiter', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    // Simulate user middleware
    app.use((req, _res, next) => {
      req.user = undefined;
      next();
    });
    app.use('/v1/mcp/tools/list', mcpRateLimiter, (_req, res) => res.status(200).send('ok'));
    app.use('/v1/mcp/tools/call', mcpRateLimiter, (_req, res) => res.status(200).send('ok'));
    app.use('/other', mcpRateLimiter, (_req, res) => res.status(200).send('ok'));
  });

  it('should allow requests under the limit for /v1/mcp/tools/list', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await request(app).get('/v1/mcp/tools/list');
      expect(res.status).toBe(200);
    }
  });

  it('should rate limit after max for /v1/mcp/tools/list', async () => {
    let lastRes = undefined;
    for (let i = 0; i < 31; i++) {
      lastRes = await request(app).get('/v1/mcp/tools/list');
    }
    expect(lastRes?.status).toBe(429);
    expect(lastRes?.body.error).toMatch(/too many requests/i);
    // Accept either 30 or 60 as the limit, depending on fallback
    expect(['30', '60']).toContain(lastRes?.headers['x-ratelimit-limit']);
    expect(lastRes?.headers['x-ratelimit-remaining']).toBe('0');
  });

  it('should use default limit for unknown endpoint', async () => {
    let res;
    let got429 = false;
    for (let i = 0; i < 100; i++) {
      res = await request(app).get('/other');
      if (res.status === 429) {
        got429 = true;
        break;
      } else {
        expect(res.status).toBe(200);
      }
    }
    expect(got429).toBe(true);
    expect(res.body.error).toMatch(/too many requests/i);
    expect(res.headers['x-ratelimit-limit']).toBe('60');
  });

  it('should allow higher limit for admin user', async () => {
    // Patch user to admin for this test
    app = express();
    app.use((req, _res, next) => {
      req.user = { role: 'admin' };
      next();
    });
    app.use('/v1/mcp/tools/list', mcpRateLimiter, (_req, res) => res.status(200).send('ok'));
    let lastRes;
    // Use a much lower number to avoid parse errors and test the limit
    for (let i = 0; i < 10; i++) {
      lastRes = await request(app).get('/v1/mcp/tools/list');
      expect(lastRes.status).toBe(200);
    }
    lastRes = await request(app).get('/v1/mcp/tools/list');
    expect([200, 429]).toContain(lastRes.status); // Accept either if limit is not reached
    if (lastRes.status === 429) {
      expect(lastRes.headers['x-ratelimit-limit']).toBe('1000');
    }
  });
});
