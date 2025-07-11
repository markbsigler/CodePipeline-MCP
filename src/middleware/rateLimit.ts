import { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { Request } from 'express';

// Example config: { '/v1/mcp/tools/list': { max: 30 }, '/v1/mcp/tools/call': { max: 10 } }
const endpointRateLimits: Record<string, { max: number }> = {
  '/v1/mcp/tools/list': { max: 30 },
  '/v1/mcp/tools/call': { max: 10 },
};

// Factory to create a rate limiter for a given endpoint and user role
function createRateLimiter(max: number) {
  return require('express-rate-limit')({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    handler: (_req: Request, response: any, _next: any, options: Options) => {
      response.set('X-RateLimit-Limit', (options.max ?? 60).toString());
      response.set('X-RateLimit-Remaining', '0');
      response.set('X-RateLimit-Reset', (Math.floor(Date.now() / 1000) + 60).toString());
      response.status(429).json(options.message);
    },
    onLimitReached: (_req: Request, response: any, options: Options) => {
      response.set('X-RateLimit-Limit', (options.max ?? 60).toString());
      response.set('X-RateLimit-Remaining', '0');
      response.set('X-RateLimit-Reset', (Math.floor(Date.now() / 1000) + 60).toString());
    }
  });
}

// Pre-create limiters for each endpoint and role
const limiters: Record<string, RateLimitRequestHandler> = {};
Object.entries(endpointRateLimits).forEach(([route, { max }]) => {
  limiters[`${route}:user`] = createRateLimiter(max);
  limiters[`${route}:admin`] = createRateLimiter(1000);
});
limiters['default:user'] = createRateLimiter(60);
limiters['default:admin'] = createRateLimiter(1000);

export function mcpRateLimiter(req: Request, res: any, next: any) {
  const key = req.baseUrl + req.path;
  // Defensive: req.user may be string, JwtPayload, or undefined
  let role = 'user';
  if (typeof req.user === 'object' && req.user !== null && 'role' in req.user && req.user.role === 'admin') {
    role = 'admin';
  }
  const limiter = limiters[`${key}:${role}`] || limiters[`default:${role}`];
  return limiter(req, res, next);
}
