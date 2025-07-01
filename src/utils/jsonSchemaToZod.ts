import { z, ZodTypeAny } from 'zod';

/**
 * Converts a JSON Schema object to a Zod schema.
 * This is a basic implementation; for production, consider using a library for full JSON Schema support.
 */
export function jsonSchemaToZod(schema: any): ZodTypeAny {
  if (!schema || typeof schema !== 'object') return z.any();
  if (schema.type === 'string') {
    let str = z.string();
    if (schema.minLength !== undefined) str = str.min(schema.minLength);
    if (schema.maxLength !== undefined) str = str.max(schema.maxLength);
    if (schema.pattern) str = str.regex(new RegExp(schema.pattern));
    return str;
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    let num = z.number();
    if (schema.minimum !== undefined) num = num.min(schema.minimum);
    if (schema.maximum !== undefined) num = num.max(schema.maximum);
    return num;
  }
  if (schema.type === 'boolean') {
    return z.boolean();
  }
  if (schema.type === 'array') {
    return z.array(jsonSchemaToZod(schema.items));
  }
  if (schema.type === 'object') {
    if (!schema.properties) return z.record(z.any());
    const shape: Record<string, ZodTypeAny> = {};
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      let prop = jsonSchemaToZod(propSchema);
      if (schema.required && !schema.required.includes(key)) {
        prop = prop.optional();
      }
      shape[key] = prop;
    }
    return z.object(shape);
  }
  return z.any();
}
