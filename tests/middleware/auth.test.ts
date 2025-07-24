import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { authenticateJWT } from '../../src/middleware/auth';

// Setup a minimal express app to test the middleware
const app = express();
// Apply the middleware to a protected route
app.get('/protected', authenticateJWT, (req: Request, res: Response) => {
  // This route will only be reached if authenticateJWT calls next()
  res.status(200).json({ user: req.user });
});

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
const JWT_ISSUER = process.env.JWT_ISSUER ?? 'codepipeline-mcp-server';

describe('authenticateJWT middleware', () => {
  it('should return 401 if no Authorization header is present', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: 'Missing or invalid Authorization header',
    });
  });

  it('should return 401 if Authorization header does not start with "Bearer "', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Token some-invalid-token');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: 'Missing or invalid Authorization header',
    });
  });

  it('should return 401 for an invalid or malformed token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: 'Invalid, expired, or unauthorized token',
    });
  });

  it('should return 401 for an expired token', async () => {
    const expiredToken = jwt.sign({ sub: 'test-user' }, JWT_SECRET, {
      issuer: JWT_ISSUER,
      expiresIn: '-1s', // Expires 1 second ago
    });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: 'Invalid, expired, or unauthorized token',
    });
  });

  it('should call next() and attach user payload for a valid token', async () => {
    const userPayload = { sub: 'test-user', role: 'admin' };
    const validToken = jwt.sign(userPayload, JWT_SECRET, {
      issuer: JWT_ISSUER,
      expiresIn: '1h',
    });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    // jwt.verify adds 'iat' and 'exp' to the payload, so we use `toMatchObject`
    expect(res.body.user).toMatchObject(userPayload);
  });
});
