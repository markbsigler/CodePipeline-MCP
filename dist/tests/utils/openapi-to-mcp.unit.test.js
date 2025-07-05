"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_to_mcp_1 = require("../../src/utils/openapi-to-mcp");
describe('jsonSchemaToTypeScriptType', () => {
    it('handles array schema', () => {
        const schema = { type: 'array', items: { type: 'string' } };
        const result = (0, openapi_to_mcp_1.jsonSchemaToTypeScriptType)(schema, 'MyArray');
        expect(result).toContain('string[]');
    });
    it('handles object with properties', () => {
        const schema = {
            type: 'object',
            properties: { foo: { type: 'string' }, bar: { type: 'number' } },
            required: ['foo']
        };
        const ts = (0, openapi_to_mcp_1.jsonSchemaToTypeScriptType)(schema, 'MyObj');
        expect(ts).toContain('foo');
        expect(ts).toContain('bar');
        expect(ts).toContain('string');
        expect(ts).toContain('number');
    });
    it('returns any type for undefined or non-object schema', () => {
        expect((0, openapi_to_mcp_1.jsonSchemaToTypeScriptType)(undefined, 'Test')).toBe('type Test = any;');
        expect((0, openapi_to_mcp_1.jsonSchemaToTypeScriptType)('string', 'Test')).toBe('type Test = any;');
    });
});
describe('jsonSchemaTypeToTs', () => {
    it('returns string for string schema', () => {
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({ type: 'string' })).toBe('string');
    });
    it('returns number for number/integer schema', () => {
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({ type: 'number' })).toBe('number');
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({ type: 'integer' })).toBe('number');
    });
    it('returns boolean for boolean schema', () => {
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({ type: 'boolean' })).toBe('boolean');
    });
    it('returns array type for array schema', () => {
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({ type: 'array', items: { type: 'string' } })).toBe('string[]');
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({ type: 'array', items: { type: 'number' } })).toBe('number[]');
    });
    it('returns object type for object schema with properties', () => {
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({ type: 'object', properties: { foo: { type: 'string' }, bar: { type: 'number' } } }))
            .toBe('{ foo: string; bar: number }');
    });
    it('returns any for unknown or missing schema', () => {
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)(undefined)).toBe('any');
        expect((0, openapi_to_mcp_1.jsonSchemaTypeToTs)({})).toBe('any');
    });
});
describe('extractMcpToolsFromOpenApi', () => {
    it('handles param.required falsy in extractMcpToolsFromOpenApi', () => {
        const openapi = {
            paths: {
                '/foo': {
                    post: {
                        operationId: 'testTool',
                        parameters: [
                            { name: 'bar', schema: { type: 'string' } } // no required field
                        ],
                        responses: { '200': { content: { 'application/json': { schema: { type: 'string' } } } } }
                    }
                }
            }
        };
        const tools = (0, openapi_to_mcp_1.extractMcpToolsFromOpenApi)(openapi);
        expect(tools[0].inputSchema.required).toEqual([]);
        expect(tools[0].inputSchema.properties).toHaveProperty('bar');
    });
    it('handles missing description and summary in extractMcpToolsFromOpenApi', () => {
        const openapi = {
            paths: {
                '/bar': {
                    get: {
                        operationId: 'noDesc',
                        parameters: [],
                        responses: { '200': { content: { 'application/json': { schema: { type: 'string' } } } } }
                    }
                }
            }
        };
        const tools = (0, openapi_to_mcp_1.extractMcpToolsFromOpenApi)(openapi);
        expect(tools[0].description).toBe('');
    });
});
//# sourceMappingURL=openapi-to-mcp.unit.test.js.map