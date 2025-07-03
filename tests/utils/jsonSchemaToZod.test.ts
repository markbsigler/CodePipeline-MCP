import { jsonSchemaToZod } from '../../src/utils/jsonSchemaToZod';

describe('jsonSchemaToZod', () => {
  it('converts string schema', () => {
    const schema = { type: 'string', minLength: 2, maxLength: 5 };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('ok').success).toBe(true);
    expect(zodSchema.safeParse('o').success).toBe(false);
    expect(zodSchema.safeParse('toolong').success).toBe(false);
  });

  it('converts number schema', () => {
    const schema = { type: 'number', minimum: 1, maximum: 10 };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(5).success).toBe(true);
    expect(zodSchema.safeParse(0).success).toBe(false);
    expect(zodSchema.safeParse(11).success).toBe(false);
  });

  it('converts object schema with required/optional', () => {
    const schema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
      required: ['a']
    };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse({ a: 'x', b: 2 }).success).toBe(true);
    expect(zodSchema.safeParse({ a: 'x' }).success).toBe(true);
    expect(zodSchema.safeParse({ b: 2 }).success).toBe(false);
  });

  it('returns z.any for unknown schema', () => {
    const zodSchema = jsonSchemaToZod(undefined);
    expect(zodSchema.safeParse('anything').success).toBe(true);
  });

  it('returns z.record(z.any()) if object schema has no properties', () => {
    const schema = { type: 'object' };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse({ any: 'value' }).success).toBe(true);
  });

  it('handles object schema with no required field (all required by default)', () => {
    const schema = {
      type: 'object',
      properties: { a: { type: 'string' } }
      // no required field
    };
    const zodSchema = jsonSchemaToZod(schema);
    // Should NOT allow missing 'a' (required by default)
    expect(zodSchema.safeParse({}).success).toBe(false);
    expect(zodSchema.safeParse({ a: 'x' }).success).toBe(true);
  });
});
