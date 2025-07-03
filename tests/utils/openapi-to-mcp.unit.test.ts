import { jsonSchemaToTypeScriptType, jsonSchemaTypeToTs } from '../../src/utils/openapi-to-mcp';

describe('jsonSchemaToTypeScriptType', () => {
  it('handles array schema', () => {
    const schema = { type: 'array', items: { type: 'string' } };
    const result = jsonSchemaToTypeScriptType(schema, 'MyArray');
    expect(result).toContain('string[]');
  });

  it('handles object with properties', () => {
    const schema = {
      type: 'object',
      properties: { foo: { type: 'string' }, bar: { type: 'number' } },
      required: ['foo']
    };
    const ts = jsonSchemaToTypeScriptType(schema, 'MyObj');
    expect(ts).toContain('foo');
    expect(ts).toContain('bar');
    expect(ts).toContain('string');
    expect(ts).toContain('number');
  });
});

describe('jsonSchemaTypeToTs', () => {
  it('returns string for string schema', () => {
    expect(jsonSchemaTypeToTs({ type: 'string' })).toBe('string');
  });
  it('returns number for number/integer schema', () => {
    expect(jsonSchemaTypeToTs({ type: 'number' })).toBe('number');
    expect(jsonSchemaTypeToTs({ type: 'integer' })).toBe('number');
  });
  it('returns boolean for boolean schema', () => {
    expect(jsonSchemaTypeToTs({ type: 'boolean' })).toBe('boolean');
  });
  it('returns array type for array schema', () => {
    expect(jsonSchemaTypeToTs({ type: 'array', items: { type: 'string' } })).toBe('string[]');
    expect(jsonSchemaTypeToTs({ type: 'array', items: { type: 'number' } })).toBe('number[]');
  });
  it('returns object type for object schema with properties', () => {
    expect(jsonSchemaTypeToTs({ type: 'object', properties: { foo: { type: 'string' }, bar: { type: 'number' } } }))
      .toBe('{ foo: string; bar: number }');
  });
  it('returns any for unknown or missing schema', () => {
    expect(jsonSchemaTypeToTs(undefined)).toBe('any');
    expect(jsonSchemaTypeToTs({})).toBe('any');
  });
});
