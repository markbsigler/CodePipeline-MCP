import request from 'supertest';
import { createApp } from '../src/index';
import { jest } from '@jest/globals';

describe('index.ts (Express app)', () => {
  let app: ReturnType<typeof createApp>;
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = createApp();
  });

  it('should respond to /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should 404 for unknown route', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect(res.status).toBe(404);
  });

  it('should not apply rate limiter in test env', async () => {
    // The rate limiter is not applied in test mode, so we can hit endpoints repeatedly
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
    }
  });

  it('should mount error handler at the end', async () => {
    // Simulate an error thrown in a route
    app.get('/throw', () => { throw new Error('fail!'); });
    const res = await request(app).get('/throw');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('should not start server when imported as a module', () => {
    // The isMainModule logic should prevent the server from starting in test/import
    // We can't test process listeners directly, but we can check that createApp works and does not throw
    expect(() => createApp()).not.toThrow();
  });

  describe('middleware and coverage edge cases', () => {
    afterEach(() => {
      jest.resetModules();
      delete process.env.NODE_ENV;
    });

    it('applies rate limiter when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'production';
      // Spy on app.use to check if mcpRateLimiter is applied
      const express = require('express');
      const useSpy = jest.spyOn(express.application, 'use');
      // Re-import createApp to apply new env
      const { createApp: freshCreateApp } = require('../src/index');
      freshCreateApp();
      // Find if mcpRateLimiter was used
      const calledWithRateLimiter = useSpy.mock.calls.some(call => {
        const arg = call[0];
        // Defensive: check if arg is a function and its name is 'rateLimit'
        return typeof arg === 'function' && arg.name === 'rateLimit';
      });
      expect(calledWithRateLimiter).toBe(true);
      useSpy.mockRestore();
    });

    it('404 handler is reached if auth is bypassed', async () => {
      jest.resetModules();
      jest.doMock('../src/middleware/auth', () => ({
        authenticateJWT: (_req: any, _res: any, next: any) => next(),
      }));
      const { createApp: freshCreateApp } = require('../src/index');
      const appNoAuth = freshCreateApp();
      const res = await request(appNoAuth).get('/not-a-real-route');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    it('server start logic (isMainModule) does not throw', () => {
      // Simulate require.main === module
      jest.resetModules();
      const realMain = require.main;
      Object.defineProperty(require, 'main', { value: module, configurable: true });
      expect(() => {
        require('../src/index');
      }).not.toThrow();
      Object.defineProperty(require, 'main', { value: realMain, configurable: true });
    });
  });
});
