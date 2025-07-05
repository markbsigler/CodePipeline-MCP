"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
// Define a sample list of tools for our tests
const mockMcpTools = [
    {
        id: 'get-assignments',
        name: 'Get Assignments',
        description: 'Retrieve assignments for a specific SRID',
    },
    {
        id: 'create-assignment',
        name: 'Create Assignment',
        description: 'Create a new assignment',
    },
];
// Mock dependencies BEFORE importing the app
globals_1.jest.mock('../../src/utils/openapi-to-mcp', () => ({
    loadOpenApiSpec: globals_1.jest.fn(),
    extractMcpToolsFromOpenApi: globals_1.jest.fn().mockReturnValue(mockMcpTools),
}));
globals_1.jest.mock('../../src/middleware/auth', () => ({
    authenticateJWT: (_req, _res, next) => next(), // Bypass auth for this test
}));
const app = (0, index_1.createApp)();
describe('POST /mcp/tools/list', () => {
    it('should return 200 OK with the list of mocked tools', async () => {
        const res = await (0, supertest_1.default)(app).post('/mcp/tools/list').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ tools: mockMcpTools });
    });
});
//# sourceMappingURL=tools.test.js.map