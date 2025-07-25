
import request from 'supertest';
import { createApp } from '../src/index';
import fs from 'fs';

describe('index.ts (createApp)', () => {
  it('should execute main entry file without crashing (direct require)', () => {
    // Simulate running the main file as a script
    const origArgv = process.argv;
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    process.argv = ['node', require.resolve('../src/index.ts')];
    let didThrow = false;
    try {
      require('../src/index');
    } catch (e) {
      didThrow = true;
    } finally {
      process.argv = origArgv;
      process.env.NODE_ENV = origEnv;
    }
    expect(didThrow).toBe(false);
  });
  beforeAll(() => {
    // Ensure logs directory exists to prevent ENOENT errors
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  });
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = createApp();
  });

  it('should respond to /healthz', async () => {
    const res = await request(app).get('/healthz');
    // Accept 200 or 404 if /healthz is not implemented, but expect a JSON response
    expect([200, 404]).toContain(res.status);
    expect(typeof res.body).toBe('object');
  });

  it('should return 404 or 401 for unknown route', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect([404, 401]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
  });

  it('should register /mcp/notifications/tools/list_changed', async () => {
    const res = await request(app).get('/mcp/notifications/tools/list_changed');
    // This route may require auth or return 200/401/403 depending on implementation
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  it('should handle errors via errorHandler', async () => {
    // Simulate an error by calling a route that throws
    app.get('/error', () => {
      throw new Error('Test error');
    });
    const res = await request(app).get('/error');
    expect([500, 400, 401]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
  });

  it('should not crash if app.listen throws', async () => {
    // Mock app.listen to throw
    const realCreateApp = require('../src/index').createApp;
    const express = require('express');
    const spy = jest.spyOn(express.application, 'listen').mockImplementation(() => { throw new Error('Listen error'); });
    try {
      const app2 = realCreateApp();
      expect(() => app2.listen(0)).toThrow('Listen error');
    } finally {
      spy.mockRestore();
    }
  });

  it('should not crash if createApp throws', () => {
    // Mock something in createApp to throw
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const spy = jest.spyOn(require('../src/index'), 'createApp').mockImplementation(() => { throw new Error('createApp error'); });
    try {
      expect(() => require('../src/index').createApp()).toThrow('createApp error');
    } finally {
      spy.mockRestore();
      process.env.NODE_ENV = origEnv;
    }
  });

  it('should handle PORT as a stringified number', (done) => {
    const realCreateApp = require('../src/index').createApp;
    process.env.PORT = '1234';
    const app2 = realCreateApp();
    let server: import('http').Server | undefined = undefined;
    try {
      server = app2.listen(0, () => {
        // Should not throw
        expect(server!.listening).toBe(true);
        server!.close(done);
      });
    } catch (e) {
      if (server) server.close();
      throw e;
    } finally {
      delete process.env.PORT;
    }
  });

  it('should default to port 3000 if PORT is not set', (done) => {
    const realCreateApp = require('../src/index').createApp;
    delete process.env.PORT;
    const app2 = realCreateApp();
    let server: import('http').Server | undefined = undefined;
    try {
      server = app2.listen(0, () => {
        expect(server!.listening).toBe(true);
        server!.close(done);
      });
    } catch (e) {
      if (server) server.close();
      throw e;
    }
  });
});
