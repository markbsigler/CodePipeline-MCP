import request from 'supertest';
import app from '../src/index';

describe('index.ts (server entry)', () => {
  it('responds to /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('listens on the specified port when run directly', async () => {
    // Simulate require.main === module
    const originalMain = require.main;
    (require as any).main = module;
    const listenSpy = jest.spyOn(app, 'listen').mockImplementation((_port, cb) => {
      if (cb) cb();
      return { close: jest.fn() } as any;
    });
    // Re-require the file to trigger the block
    jest.resetModules();
    require('../src/index');
    expect(listenSpy).toHaveBeenCalledWith(process.env.PORT || 3000, expect.any(Function));
    (require as any).main = originalMain;
    listenSpy.mockRestore();
  });
});
