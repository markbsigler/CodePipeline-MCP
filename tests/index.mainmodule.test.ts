import * as indexModule from '../src/index';

describe('main module startup', () => {
  it('should not throw when required as a module', () => {
    expect(() => {
      // Simulate requiring as a module (not main)
      jest.resetModules();
      jest.doMock('express', () => () => ({ use: jest.fn(), get: jest.fn(), post: jest.fn(), listen: jest.fn() }));
      jest.doMock('../src/utils/openapi-to-mcp', () => ({ loadOpenApiSpec: jest.fn(() => ({})), extractMcpToolsFromOpenApi: jest.fn(() => ([])) }));
      jest.doMock('../src/handlers/mcpHandlers', () => ({ toolsListHandler: jest.fn(() => jest.fn()), toolsCallHandler: jest.fn(() => jest.fn()), notificationsListChangedHandler: jest.fn(() => jest.fn()) }));
      jest.doMock('../src/middleware/auth', () => ({ authenticateJWT: jest.fn() }));
      jest.doMock('../src/middleware/rateLimit', () => ({ mcpRateLimiter: jest.fn() }));
      jest.doMock('../src/middleware/session', () => ({ sessionMiddleware: jest.fn() }));
      jest.doMock('../src/middleware/errorHandler', () => ({ errorHandler: jest.fn() }));
      jest.doMock('../src/middleware/requestLogger', () => ({ requestLogger: jest.fn() }));
      require('../src/index');
    }).not.toThrow();
  });
});
