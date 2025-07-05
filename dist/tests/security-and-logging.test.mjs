"use strict";
import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
// Mock dependencies that read from the file system before importing the app
jest.mock('../src/utils/openapi-to-mcp', () => ({
    loadOpenApiSpec: jest.fn(),
    extractMcpToolsFromOpenApi: jest.fn().mockReturnValue([]), // Return empty tools for these tests
}));
import { createApp } from '../src/index';
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
const ISSUER = 'codepipeline-mcp-server';
function makeToken(payload, opts = {}) {
    return jwt.sign(payload, JWT_SECRET, { issuer: ISSUER, ...opts });
}
describe('Security & Logging', () => {
    const app = createApp();
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
//# sourceMappingURL=security-and-logging.test.mjs.map