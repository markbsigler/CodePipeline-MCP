import { z, ZodTypeAny } from 'zod';

/**
 * Converts a JSON Schema object to a Zod schema.
 * Supports enum, const, oneOf/anyOf, nullability, and improved required/optional handling.
 *
 * Note: Cognitive complexity is high due to JSON Schema branching. Consider refactoring for maintainability if needed.
 */
export function jsonSchemaToZod(schema: any): ZodTypeAny {
  if (!schema || typeof schema !== 'object') return z.any();

  // Handle enum
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    if (schema.enum.every((v: any) => typeof v === 'string')) {
      // All string enum
      return z.enum(schema.enum as [string, ...string[]]);
    } else {
      // Mixed/other types: use union of literals
      return z.union(schema.enum.map((v: any) => z.literal(v)));
    }
  }

  // Handle const
  if (schema.const !== undefined) {
    return z.literal(schema.const);
  }

  // Handle oneOf/anyOf
  if (schema.oneOf ?? schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf).map((s: any) => jsonSchemaToZod(s));
    return z.union(variants);
  }

  // Handle nullability (type: [T, "null"] or nullable: true)
  let type = schema.type;
  let isNullable = false;
  if (Array.isArray(type)) {
    if (type.includes('null')) {
      isNullable = true;
      type = type.filter((t: string) => t !== 'null')[0];
    }
  } else if (schema.nullable === true) {
    isNullable = true;
  }

  let base: ZodTypeAny;
  if (type === 'string') {
    let str = z.string();
    if (schema.minLength !== undefined) str = str.min(schema.minLength);
    if (schema.maxLength !== undefined) str = str.max(schema.maxLength);
    if (schema.pattern) str = str.regex(new RegExp(schema.pattern));
    base = str;
  } else if (type === 'number' || type === 'integer') {
    let num = z.number();
    if (schema.minimum !== undefined) num = num.min(schema.minimum);
    if (schema.maximum !== undefined) num = num.max(schema.maximum);
    base = num;
  } else if (type === 'boolean') {
    base = z.boolean();
  } else if (type === 'array') {
    base = z.array(jsonSchemaToZod(schema.items));
  } else if (type === 'object') {
    if (!schema.properties) return z.record(z.any());
    const shape: Record<string, ZodTypeAny> = {};
    // If required is missing, all properties are required by default (per JSON Schema spec)
    const required: string[] = schema.required ?? Object.keys(schema.properties);
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      let prop = jsonSchemaToZod(propSchema);
      if (!required.includes(key)) {
        prop = prop.optional();
      }
      shape[key] = prop;
    }
    base = z.object(shape);
  } else {
    base = z.any();
  }

  if (isNullable) {
    return base.nullable();
  }
  return base;
}
