// @ts-nocheck
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const session_1 = require("../../src/middleware/session");
describe('sessionMiddleware', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = { headers: {} };
        res = { setHeader: jest.fn() };
        next = jest.fn();
    });
    it('sets sessionId from x-session-id header if present', () => {
        req.headers = { 'x-session-id': 'user1:abc' };
        (0, session_1.sessionMiddleware)(req, res, next);
        expect(req.sessionId).toBe('user1:abc');
        expect(res.setHeader).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
    it('generates sessionId if header is missing and user is present', () => {
        req.user = { sub: 'user2' };
        (0, session_1.sessionMiddleware)(req, res, next);
        expect(req.sessionId).toMatch(/^user2:/);
        expect(res.setHeader).toHaveBeenCalledWith('x-session-id', expect.stringMatching(/^user2:/));
        expect(next).toHaveBeenCalled();
    });
    it('generates sessionId if header is missing and user is absent (anon)', () => {
        (0, session_1.sessionMiddleware)(req, res, next);
        expect(req.sessionId).toMatch(/^anon:/);
        expect(res.setHeader).toHaveBeenCalledWith('x-session-id', expect.stringMatching(/^anon:/));
        expect(next).toHaveBeenCalled();
    });
});
//# sourceMappingURL=session.test.js.map