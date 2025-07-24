// @ts-nocheck
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
// Mock the openapi utility functions before importing the app.
// This prevents the app from trying to read a file from disk during testing.
globals_1.jest.mock('../src/utils/openapi-to-mcp', () => ({
    loadOpenApiSpec: globals_1.jest.fn(),
    extractMcpToolsFromOpenApi: globals_1.jest.fn().mockReturnValue([]),
}));
const index_1 = require("../src/index");
// Create a fresh app instance for this test suite
const app = (0, index_1.createApp)();
describe('/healthz endpoint', () => {
    it('should return 200 OK with status ok', async () => {
        const res = await (0, supertest_1.default)(app).get('/healthz');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});
//# sourceMappingURL=healthz.test.js.map