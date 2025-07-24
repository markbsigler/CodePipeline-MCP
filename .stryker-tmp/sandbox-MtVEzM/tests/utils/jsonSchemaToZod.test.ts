// @ts-nocheck
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

  it('converts string enum schema', () => {
    const schema = { enum: ['a', 'b', 'c'] };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('a').success).toBe(true);
    expect(zodSchema.safeParse('d').success).toBe(false);
  });

  it('converts mixed enum schema', () => {
    const schema = { enum: ['a', 1, true] };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('a').success).toBe(true);
    expect(zodSchema.safeParse(1).success).toBe(true);
    expect(zodSchema.safeParse(true).success).toBe(true);
    expect(zodSchema.safeParse('b').success).toBe(false);
  });

  it('converts const schema', () => {
    const schema = { const: 42 };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(42).success).toBe(true);
    expect(zodSchema.safeParse(43).success).toBe(false);
  });

  it('converts oneOf schema', () => {
    const schema = { oneOf: [ { type: 'string' }, { type: 'number' } ] };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('x').success).toBe(true);
    expect(zodSchema.safeParse(5).success).toBe(true);
    expect(zodSchema.safeParse(true).success).toBe(false);
  });

  it('converts anyOf schema', () => {
    const schema = { anyOf: [ { type: 'boolean' }, { const: 7 } ] };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(true).success).toBe(true);
    expect(zodSchema.safeParse(7).success).toBe(true);
    expect(zodSchema.safeParse('no').success).toBe(false);
  });

  it('handles nullable via type array', () => {
    const schema = { type: ['string', 'null'] };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('ok').success).toBe(true);
    expect(zodSchema.safeParse(null).success).toBe(true);
    expect(zodSchema.safeParse(1).success).toBe(false);
  });

  it('handles nullable via nullable: true', () => {
    const schema = { type: 'number', nullable: true };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(5).success).toBe(true);
    expect(zodSchema.safeParse(null).success).toBe(true);
    expect(zodSchema.safeParse('no').success).toBe(false);
  });

  it('converts integer schema', () => {
    const schema = { type: 'integer', minimum: 0, maximum: 2 };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(1).success).toBe(true);
    expect(zodSchema.safeParse(3).success).toBe(false);
    expect(zodSchema.safeParse(1.5).success).toBe(false); // z.number().int() enforces integer
  });

  it('converts boolean schema', () => {
    const schema = { type: 'boolean' };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(true).success).toBe(true);
    expect(zodSchema.safeParse(false).success).toBe(true);
    expect(zodSchema.safeParse('true').success).toBe(false);
  });

  it('converts array schema', () => {
    const schema = { type: 'array', items: { type: 'string' } };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(['a', 'b']).success).toBe(true);
    expect(zodSchema.safeParse([1, 2]).success).toBe(false);
  });

  it('falls back to z.any for unknown type', () => {
    const schema = { type: 'funky' };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('anything').success).toBe(true);
    expect(zodSchema.safeParse(123).success).toBe(true);
  });
});
