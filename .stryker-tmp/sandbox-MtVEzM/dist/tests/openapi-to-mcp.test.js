// @ts-nocheck
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_to_mcp_1 = require("../src/utils/openapi-to-mcp");
describe('OpenAPI to MCP Tool Mapping', () => {
    const openapi = (0, openapi_to_mcp_1.loadOpenApiSpec)('config/openapi.json');
    const tools = (0, openapi_to_mcp_1.extractMcpToolsFromOpenApi)(openapi);
    it('should extract tools from OpenAPI spec', () => {
        expect(Array.isArray(tools)).toBe(true);
        expect(tools.length).toBeGreaterThan(0);
        for (const tool of tools) {
            expect(tool).toHaveProperty('name');
            expect(tool).toHaveProperty('inputSchema');
            expect(tool).toHaveProperty('outputSchema');
            expect(tool).toHaveProperty('inputType');
            expect(tool).toHaveProperty('outputType');
        }
    });
    it('should generate valid TypeScript types for tool input/output', () => {
        for (const tool of tools) {
            expect(typeof tool.inputType).toBe('string');
            expect(typeof tool.outputType).toBe('string');
            expect(tool.inputType).toContain('interface');
            // Output type may be 'type ... = any;' if schema is missing
        }
    });
});
//# sourceMappingURL=openapi-to-mcp.test.js.map