import { jsonSchemaToZod } from '../../src/utils/jsonSchemaToZod';

describe('jsonSchemaToZod edge cases', () => {
  it('returns z.any for missing or non-object schema', () => {
    expect(jsonSchemaToZod(undefined).safeParse('x').success).toBe(true);
    expect(jsonSchemaToZod(null).safeParse('x').success).toBe(true);
    expect(jsonSchemaToZod(42).safeParse('x').success).toBe(true);
  });

  it('handles string pattern', () => {
    const schema = { type: 'string', pattern: '^foo$' };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('foo').success).toBe(true);
    expect(zodSchema.safeParse('bar').success).toBe(false);
  });

  it('handles minLength and maxLength for string', () => {
    const schema = { type: 'string', minLength: 2, maxLength: 3 };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('ab').success).toBe(true);
    expect(zodSchema.safeParse('a').success).toBe(false);
    expect(zodSchema.safeParse('abcd').success).toBe(false);
  });

  it('handles minimum and maximum for number', () => {
    const schema = { type: 'number', minimum: 1, maximum: 2 };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse(1).success).toBe(true);
    expect(zodSchema.safeParse(2).success).toBe(true);
    expect(zodSchema.safeParse(0).success).toBe(false);
    expect(zodSchema.safeParse(3).success).toBe(false);
  });

  it('handles array with items', () => {
    const schema = { type: 'array', items: { type: 'number' } };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse([1, 2]).success).toBe(true);
    expect(zodSchema.safeParse(['a']).success).toBe(false);
  });

  it('handles object with no properties', () => {
    const schema = { type: 'object' };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse({ foo: 'bar' }).success).toBe(true);
  });

  it('handles object with required and optional properties', () => {
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

  it('returns z.any for unknown type', () => {
    const schema = { type: 'funky' };
    const zodSchema = jsonSchemaToZod(schema);
    expect(zodSchema.safeParse('anything').success).toBe(true);
    expect(zodSchema.safeParse(123).success).toBe(true);
  });
});
