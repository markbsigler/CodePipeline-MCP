// @ts-nocheck
import { sessionMiddleware } from '../../src/middleware/session';
import { Request, Response, NextFunction } from 'express';

describe('sessionMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = { setHeader: jest.fn() };
    next = jest.fn();
  });

  it('sets sessionId from x-session-id header if present', () => {
    req.headers = { 'x-session-id': 'user1:abc' };
    sessionMiddleware(req as Request, res as Response, next as NextFunction);
    expect((req as any).sessionId).toBe('user1:abc');
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('generates sessionId if header is missing and user is present', () => {
    (req as any).user = { sub: 'user2' };
    sessionMiddleware(req as Request, res as Response, next as NextFunction);
    expect((req as any).sessionId).toMatch(/^user2:/);
    expect(res.setHeader).toHaveBeenCalledWith('x-session-id', expect.stringMatching(/^user2:/));
    expect(next).toHaveBeenCalled();
  });

  it('generates sessionId if header is missing and user is absent (anon)', () => {
    sessionMiddleware(req as Request, res as Response, next as NextFunction);
    expect((req as any).sessionId).toMatch(/^anon:/);
    expect(res.setHeader).toHaveBeenCalledWith('x-session-id', expect.stringMatching(/^anon:/));
    expect(next).toHaveBeenCalled();
  });
});
