import {
  loadOpenApiSpec,
  extractMcpToolsFromOpenApi,
} from '../src/utils/openapi-to-mcp';

type Tool = {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  inputType: string;
  outputType: string;
};

describe('OpenAPI to MCP Tool Mapping', () => {
  const openapi = loadOpenApiSpec('config/openapi.json');
  const tools = extractMcpToolsFromOpenApi(openapi) as Tool[];

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
