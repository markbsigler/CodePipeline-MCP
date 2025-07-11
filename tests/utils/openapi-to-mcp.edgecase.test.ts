import { extractMcpToolsFromOpenApi } from '../../src/utils/openapi-to-mcp';

describe('openapi-to-mcp param schema fallback', () => {
  it('should use { type: "string" } if param.schema is missing', () => {
    const openapi = {
      paths: {
        '/foo': {
          post: {
            operationId: 'testTool',
            parameters: [
              { name: 'bar' } // no schema
            ],
            responses: { '200': { content: { 'application/json': { schema: { type: 'string' } } } } }
          }
        }
      }
    };
    const tools = extractMcpToolsFromOpenApi(openapi) as any[];
    expect(tools[0].inputSchema.properties.bar).toEqual({ type: 'string' });
  });
});
