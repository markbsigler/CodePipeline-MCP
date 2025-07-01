import request from 'supertest';
import app from '../src/index';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ISSUER = 'codepipeline-mcp-server';
function makeToken(payload: object, opts: object = {}) {
  return jwt.sign(payload, JWT_SECRET, { issuer: ISSUER, ...opts });
}

describe('MCP Protocol Endpoints', () => {
  const token = makeToken({ sub: 'user1' });
  it('GET /healthz should return 200', async () => {
    const res = await request(app)
      .get('/healthz')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('POST /mcp/tools/list should return tools', async () => {
    const res = await request(app)
      .post('/mcp/tools/list')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tools');
    expect(Array.isArray(res.body.tools)).toBe(true);
  });

  it('POST /mcp/tools/call with invalid tool should return 404', async () => {
    const res = await request(app)
      .post('/mcp/tools/call')
      .set('Authorization', `Bearer ${token}`)
      .send({ tool: 'not_a_tool', params: {} });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
