// @ts-nocheck
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = sessionMiddleware;
const uuid_1 = require("uuid");
function sessionMiddleware(req, res, next) {
    let sessionId = req.headers['x-session-id'];
    if (!sessionId) {
        // Generate a secure, non-deterministic session ID
        const userId = req.user?.sub || 'anon';
        sessionId = `${userId}:${(0, uuid_1.v4)()}`;
        res.setHeader('x-session-id', sessionId);
    }
    req.sessionId = sessionId;
    next();
}
//# sourceMappingURL=session.js.map