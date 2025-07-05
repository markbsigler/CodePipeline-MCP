import { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { Request } from 'express';

// Example config: { '/v1/mcp/tools/list': { max: 30 }, '/v1/mcp/tools/call': { max: 10 } }
const endpointRateLimits: Record<string, { max: number }> = {
  '/v1/mcp/tools/list': { max: 30 },
  '/v1/mcp/tools/call': { max: 10 },
};

export function mcpRateLimiter(req: Request, res: any, next: any) {
  const key = req.baseUrl + req.path;
  const config = endpointRateLimits[key] || { max: 60 };
  const limiter: RateLimitRequestHandler = require('express-rate-limit')({
    windowMs: 60 * 1000,
    max: (req.user && req.user.role === 'admin') ? 1000 : config.max, // Example per-user logic
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    handler: (request: Request, response: any, nextHandler: any, options: Options) => {
      response.set('X-RateLimit-Limit', options.max?.toString() || '60');
      response.set('X-RateLimit-Remaining', '0');
      response.set('X-RateLimit-Reset', (Math.floor(Date.now() / 1000) + 60).toString());
      response.status(429).json(options.message);
    },
    onLimitReached: (request: Request, response: any, options: Options) => {
      response.set('X-RateLimit-Limit', options.max?.toString() || '60');
      response.set('X-RateLimit-Remaining', '0');
      response.set('X-RateLimit-Reset', (Math.floor(Date.now() / 1000) + 60).toString());
    }
  });
  return limiter(req, res, next);
}
