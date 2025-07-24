// @ts-nocheck
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const zod_1 = require("zod");
// --- Test Setup ---
// 1. Define a sample list of tools that our mocked module will return.
const mockMcpTools = [
    {
        id: 'get_weather',
        name: 'Get Weather',
        description: 'Get the current weather for a location',
    },
    {
        id: 'get_stock_price', // This tool will exist but won't have a schema, to test an error case.
        name: 'Get Stock Price',
        description: 'Get the latest stock price for a ticker symbol',
    },
];
// 2. Define the Zod validation schemas that would normally be generated from OpenAPI.
const mockZodSchemas = {
    get_weather: {
        input: zod_1.z.object({
            location: zod_1.z.string().describe('The city and state, e.g. San Francisco, CA'),
        }),
    },
    // Note: 'get_stock_price' is intentionally omitted to test the schema-not-found case.
};
// 3. Mock the modules that have external dependencies (like file reading or auth).
globals_1.jest.mock('../../src/utils/openapi-to-mcp', () => ({
    loadOpenApiSpec: globals_1.jest.fn(),
    extractMcpToolsFromOpenApi: globals_1.jest.fn().mockReturnValue(mockMcpTools),
}));
globals_1.jest.mock('../../src/middleware/auth', () => ({
    authenticateJWT: (_req, _res, next) => next(), // Bypass auth for these tests
}));
// 4. Mock the generated Zod schemas to provide our test schemas.
globals_1.jest.mock('../../src/types/toolZodSchemas', () => ({
    toolZodSchemas: mockZodSchemas,
}));
const index_1 = require("../../src/index");
// 5. Create a fresh, isolated app instance for this test suite.
const app = (0, index_1.createApp)();
describe('POST /mcp/tools/call', () => {
    it('should return 200 and a streamed result for a valid tool call', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/mcp/tools/call')
            .send({
            tool: 'get_weather',
            params: { location: 'San Francisco, CA' },
        });
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('application/json');
        // The response is a single JSON object built from streamed chunks.
        const body = JSON.parse(res.text);
        expect(body.jsonrpc).toBe('2.0');
        expect(body.result.completed).toBe(true);
        expect(body.result.progress).toBe(1);
        // The mock tool logic simply echos the input parameters.
        expect(body.result.resultChunks[0].content).toContain('San Francisco, CA');
    });
    it('should return 404 if the tool does not exist', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/mcp/tools/call')
            .send({ tool: 'non_existent_tool', params: {} });
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Tool not found' });
    });
    it('should return 500 if a tool exists but has no validation schema', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/mcp/tools/call')
            .send({ tool: 'get_stock_price', params: { ticker: 'GOOG' } });
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Validation schema not found for tool' });
    });
    it('should return 400 if the input parameters are invalid', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/mcp/tools/call')
            .send({ tool: 'get_weather', params: { location: 12345 } }); // Invalid type
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid tool input');
        expect(res.body.details[0].message).toBe('Expected string, received number');
    });
});
//# sourceMappingURL=tools-call.test.js.map