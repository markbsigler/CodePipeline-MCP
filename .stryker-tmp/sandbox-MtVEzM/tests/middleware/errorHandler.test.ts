// @ts-nocheck
import { errorHandler } from '../../src/middleware/errorHandler';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';

// Mock logger to silence output and capture logs
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('errorHandler', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.get('/error', (_req, _res, next) => {
      const err: any = new Error('fail!');
      err.code = 'ERR_TEST';
      err.details = { foo: 'bar' };
      next(err);
    });
    app.use(errorHandler);
  });

  it('should log error and return 500 with details and stack in non-prod', async () => {
    process.env.NODE_ENV = 'development';
    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('fail!');
    expect(res.body.code).toBe('ERR_TEST');
    expect(res.body.details).toEqual({ foo: 'bar' });
    expect(res.body.stack).toBeDefined();
  });

  it('should omit details and stack in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('fail!');
    expect(res.body.code).toBe('ERR_TEST');
    expect(res.body.details).toBeUndefined();
    expect(res.body.stack).toBeUndefined();
  });

  it('should use fallback values for missing code and message', async () => {
    process.env.NODE_ENV = 'development';
    app = express();
    app.get('/error2', (_req, _res, next) => {
      next({});
    });
    app.use(errorHandler);
    const res = await request(app).get('/error2');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
    expect(res.body.code).toBe('ERR_INTERNAL');
  });

  it('should log anon user and null sessionId if missing', async () => {
    process.env.NODE_ENV = 'development';
    const logger = require('../../src/utils/logger');
    app = express();
    app.get('/error3', (_req, _res, next) => {
      const err: any = new Error('fail!');
      next(err);
    });
    app.use(errorHandler);
    await request(app).get('/error3');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ user: 'anon', sessionId: null }),
      expect.any(String)
    );
  });

  it('should call next(err) if headersSent', async () => {
    process.env.NODE_ENV = 'development';
    const next = jest.fn();
    const req = {} as Request;
    const res = { headersSent: true } as unknown as Response;
    const err = new Error('fail!');
    errorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
