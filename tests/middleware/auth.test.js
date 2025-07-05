"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../../src/middleware/auth");
// Setup a minimal express app to test the middleware
const app = (0, express_1.default)();
// Apply the middleware to a protected route
app.get('/protected', auth_1.authenticateJWT, (req, res) => {
    // This route will only be reached if authenticateJWT calls next()
    res.status(200).json({ user: req.user });
});
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
const JWT_ISSUER = process.env.JWT_ISSUER ?? 'codepipeline-mcp-server';
describe('authenticateJWT middleware', () => {
    it('should return 401 if no Authorization header is present', async () => {
        const res = await (0, supertest_1.default)(app).get('/protected');
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Missing or invalid Authorization header' });
    });
    it('should return 401 if Authorization header does not start with "Bearer "', async () => {
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Authorization', 'Token some-invalid-token');
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Missing or invalid Authorization header' });
    });
    it('should return 401 for an invalid or malformed token', async () => {
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalid-token');
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Invalid, expired, or unauthorized token' });
    });
    it('should return 401 for an expired token', async () => {
        const expiredToken = jsonwebtoken_1.default.sign({ sub: 'test-user' }, JWT_SECRET, {
            issuer: JWT_ISSUER,
            expiresIn: '-1s', // Expires 1 second ago
        });
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Authorization', `Bearer ${expiredToken}`);
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Invalid, expired, or unauthorized token' });
    });
    it('should call next() and attach user payload for a valid token', async () => {
        const userPayload = { sub: 'test-user', role: 'admin' };
        const validToken = jsonwebtoken_1.default.sign(userPayload, JWT_SECRET, {
            issuer: JWT_ISSUER,
            expiresIn: '1h',
        });
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Authorization', `Bearer ${validToken}`);
        expect(res.status).toBe(200);
        // jwt.verify adds 'iat' and 'exp' to the payload, so we use `toMatchObject`
        expect(res.body.user).toMatchObject(userPayload);
    });
});
//# sourceMappingURL=auth.test.js.map