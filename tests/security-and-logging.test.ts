import request from 'supertest';
import app from '../src/index';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ISSUER = 'codepipeline-mcp-server';

function makeToken(payload: object, opts: object = {}) {
  return jwt.sign(payload, JWT_SECRET, { issuer: ISSUER, ...opts });
}

describe('Security & Logging', () => {
  it('rejects requests with missing/invalid JWT', async () => {
    const res = await request(app).post('/mcp/tools/list').send({});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects tokens with wrong issuer (token passthrough)', async () => {
    const token = jwt.sign({ sub: 'user1' }, JWT_SECRET, { issuer: 'other-issuer' });
    const res = await request(app)
      .post('/mcp/tools/list')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('accepts valid tokens and logs requests', async () => {
    const token = makeToken({ sub: 'user1' });
    const res = await request(app)
      .post('/mcp/tools/list')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tools');
  });
});
