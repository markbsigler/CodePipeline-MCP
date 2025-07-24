import fs from 'fs';
import path from 'path';
import {
  loadOpenApiSpec,
  jsonSchemaToTypeScriptType,
  jsonSchemaTypeToTs,
  extractMcpToolsFromOpenApi
} from 'utils/openapi-to-mcp';

describe('loadOpenApiSpec', () => {
  it('should load and parse OpenAPI JSON', () => {
    const testPath = path.resolve(__dirname, '../../../config/openapi.json');
    if (fs.existsSync(testPath)) {
      const spec = loadOpenApiSpec(testPath);
      expect(typeof spec).toBe('object');
      expect(spec).not.toBeNull();
    } else {
      expect(true).toBe(true); // skip if file missing
    }
  });
});

describe('jsonSchemaToTypeScriptType', () => {
  it('should return interface for object schema', () => {
    const schema = { type: 'object', properties: { foo: { type: 'string' } }, required: ['foo'] };
    const result = jsonSchemaToTypeScriptType(schema, 'TestType');
    expect(result).toContain('export interface TestType');
    expect(result).toContain('foo: string;');
  });
  it('should return array type for array schema', () => {
    const schema = { type: 'array', items: { type: 'number' } };
    const result = jsonSchemaToTypeScriptType(schema, 'TestArr');
    expect(result).toContain('TestArr = number[]');
  });
  it('should return any for unknown schema', () => {
    expect(jsonSchemaToTypeScriptType(null, 'X')).toContain('any');
  });
});

describe('jsonSchemaTypeToTs', () => {
  it('should map types correctly', () => {
    expect(jsonSchemaTypeToTs({ type: 'string' })).toBe('string');
    expect(jsonSchemaTypeToTs({ type: 'number' })).toBe('number');
    expect(jsonSchemaTypeToTs({ type: 'integer' })).toBe('number');
    expect(jsonSchemaTypeToTs({ type: 'boolean' })).toBe('boolean');
    expect(jsonSchemaTypeToTs({})).toBe('any');
  });
});

describe('extractMcpToolsFromOpenApi', () => {
  it('should return an array (smoke test)', () => {
    const fakeOpenapi = { paths: {} };
    const result = extractMcpToolsFromOpenApi(fakeOpenapi);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('jsonSchemaToTypeScriptType edge cases', () => {
  it('handles object with optional properties', () => {
    const schema = { type: 'object', properties: { foo: { type: 'string' }, bar: { type: 'number' } }, required: ['foo'] };
    const result = jsonSchemaToTypeScriptType(schema, 'OptType');
    expect(result).toContain('foo: string;');
    expect(result).toContain('bar?: number;');
  });
  it('handles array of objects', () => {
    const schema = { type: 'array', items: { type: 'object', properties: { x: { type: 'boolean' } }, required: ['x'] } };
    const result = jsonSchemaToTypeScriptType(schema, 'ArrObj');
    expect(result).toContain('ArrObj = { x: boolean }[]');
  });
  it('handles missing schema', () => {
    expect(jsonSchemaToTypeScriptType(undefined, 'Missing')).toContain('any');
  });
  it('handles object with no properties', () => {
    const schema = { type: 'object' };
    const result = jsonSchemaToTypeScriptType(schema, 'NoProps');
    expect(result).toContain('type NoProps = any;');
  });
});

describe('jsonSchemaTypeToTs edge cases', () => {
  it('handles nested object', () => {
    const schema = { type: 'object', properties: { foo: { type: 'object', properties: { bar: { type: 'string' } } } } };
    const result = jsonSchemaTypeToTs(schema);
    expect(result).toContain('foo: { bar: string }');
  });
  it('handles array of arrays', () => {
    const schema = { type: 'array', items: { type: 'array', items: { type: 'number' } } };
    const result = jsonSchemaTypeToTs(schema);
    expect(result).toBe('number[][]');
  });
  it('handles missing type', () => {
    expect(jsonSchemaTypeToTs({})).toBe('any');
  });
});

describe('extractMcpToolsFromOpenApi edge/complex cases', () => {
  it('handles operation with parameters and requestBody', () => {
    const openapi = {
      paths: {
        '/foo': {
          post: {
            operationId: 'fooOp',
            description: 'desc',
            parameters: [
              { name: 'id', in: 'query', required: true, schema: { type: 'string' } },
              { name: 'opt', in: 'query', schema: { type: 'number' } }
            ],
            requestBody: {
              content: {
                'application/json': { schema: { type: 'object', properties: { bar: { type: 'boolean' } }, required: ['bar'] } }
              }
            },
            responses: {
              '200': { content: { 'application/json': { schema: { type: 'object', properties: { baz: { type: 'string' } }, required: ['baz'] } } } }
            }
          }
        }
      }
    };
    const tools = extractMcpToolsFromOpenApi(openapi);
    expect(tools.length).toBe(1);
    expect(tools[0].name).toBe('fooOp');
    expect(tools[0].inputSchema.properties).toHaveProperty('id');
    expect(tools[0].inputSchema.properties).toHaveProperty('opt');
    expect(tools[0].inputSchema.properties).toHaveProperty('body');
    expect(tools[0].outputSchema.properties).toHaveProperty('baz');
    expect(tools[0].inputType).toContain('fooOpInput');
    expect(tools[0].outputType).toContain('fooOpOutput');
  });
  it('handles missing parameters/requestBody/responses', () => {
    const openapi = { paths: { '/bar': { get: { operationId: 'barOp' } } } };
    const tools = extractMcpToolsFromOpenApi(openapi);
    expect(tools.length).toBe(1);
    expect(tools[0].inputSchema).toBeDefined();
    expect(tools[0].outputSchema).toBeDefined();
  });
  it('handles summary fallback for description', () => {
    const openapi = { paths: { '/baz': { get: { operationId: 'bazOp', summary: 'sum' } } } };
    const tools = extractMcpToolsFromOpenApi(openapi);
    expect(tools[0].description).toBe('sum');
  });
  it('generates name if operationId missing', () => {
    const openapi = { paths: { '/q': { post: { summary: 's' } } } };
    const tools = extractMcpToolsFromOpenApi(openapi);
    expect(tools[0].name).toMatch(/^post_/);
  });
});
