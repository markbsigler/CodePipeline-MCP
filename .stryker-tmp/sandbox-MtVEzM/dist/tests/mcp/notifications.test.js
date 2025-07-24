// @ts-nocheck
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
// Mock dependencies BEFORE importing the app
globals_1.jest.mock('../../src/utils/openapi-to-mcp', () => ({
    loadOpenApiSpec: globals_1.jest.fn(),
    extractMcpToolsFromOpenApi: globals_1.jest.fn().mockReturnValue([]),
}));
globals_1.jest.mock('../../src/middleware/auth', () => ({
    authenticateJWT: (_req, _res, next) => next(), // Bypass auth for this test
}));
const index_1 = require("../../src/index");
const app = (0, index_1.createApp)();
describe('GET /mcp/notifications/tools/list_changed', () => {
    it('should return 200 OK with changed: false', async () => {
        const res = await (0, supertest_1.default)(app).get('/mcp/notifications/tools/list_changed');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ changed: false });
    });
});
//# sourceMappingURL=notifications.test.js.map