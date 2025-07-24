import { mcpRateLimiter } from 'middleware/rateLimit';
import express from 'express';

describe('mcpRateLimiter', () => {
  let req: any, res: any, next: any;
  beforeEach(() => {
    req = {
      baseUrl: '',
      path: '/v1/mcp/tools/list',
      user: undefined,
      ip: '127.0.0.1',
      headers: {},
      get: (header: string) => req.headers[header.toLowerCase()],
      app: {
        get: (key: string) => {
          if (key === 'trust proxy') return false;
          return undefined;
        }
      }
    };
    res = { set: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });


  async function runLimiterTest() {
    await new Promise<void>((resolve, reject) => {
      next.mockImplementation(() => {
        resolve();
      });
      try {
        mcpRateLimiter(req, res, next);
      } catch (err) {
        reject(err);
      }
    });
    expect(next).toHaveBeenCalled();
  }

  it('should use user limiter for normal user', async () => {
    req.user = { role: 'user' };
    await runLimiterTest();
  });

  it('should use admin limiter for admin user', async () => {
    req.user = { role: 'admin' };
    await runLimiterTest();
  });

  it('should default to user role if req.user is a string', async () => {
    req.user = 'foo';
    await runLimiterTest();
  });

  it('should default to user role if req.user is an object without role', async () => {
    req.user = { foo: 'bar' };
    await runLimiterTest();
  });

  it('should default to user role if req.user is null', async () => {
    req.user = null;
    await runLimiterTest();
  });

  it('should use default limiter for unknown endpoint', async () => {
    req.path = '/unknown';
    req.baseUrl = '';
    req.user = { role: 'user' };
    await runLimiterTest();
  });

  it('should use default admin limit for unknown endpoint with admin user', async () => {
    req.path = '/unknown';
    req.baseUrl = '';
    req.user = { role: 'admin' };
    await runLimiterTest();
  });
});
