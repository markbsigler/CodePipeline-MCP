"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSchemaToZod = jsonSchemaToZod;
const zod_1 = require("zod");
/**
 * Converts a JSON Schema object to a Zod schema.
 * Supports enum, const, oneOf/anyOf, nullability, and improved required/optional handling.
 *
 * Note: Cognitive complexity is high due to JSON Schema branching. Consider refactoring for maintainability if needed.
 */
function jsonSchemaToZod(schema) {
  if (!schema || typeof schema !== "object") return zod_1.z.any();
  // Handle enum
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    if (schema.enum.every((v) => typeof v === "string")) {
      // All string enum
      return zod_1.z.enum(schema.enum);
    } else {
      // Mixed/other types: use union of literals
      return zod_1.z.union(schema.enum.map((v) => zod_1.z.literal(v)));
    }
  }
  // Handle const
  if (schema.const !== undefined) {
    return zod_1.z.literal(schema.const);
  }
  // Handle oneOf/anyOf
  if (schema.oneOf ?? schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf).map((s) =>
      jsonSchemaToZod(s),
    );
    return zod_1.z.union(variants);
  }
  // Handle nullability (type: [T, "null"] or nullable: true)
  let type = schema.type;
  let isNullable = false;
  if (Array.isArray(type)) {
    if (type.includes("null")) {
      isNullable = true;
      type = type.filter((t) => t !== "null")[0];
    }
  } else if (schema.nullable === true) {
    isNullable = true;
  }
  let base;
  if (type === "string") {
    let str = zod_1.z.string();
    if (schema.minLength !== undefined) str = str.min(schema.minLength);
    if (schema.maxLength !== undefined) str = str.max(schema.maxLength);
    if (schema.pattern) str = str.regex(new RegExp(schema.pattern));
    base = str;
  } else if (type === "number" || type === "integer") {
    let num = zod_1.z.number();
    if (schema.minimum !== undefined) num = num.min(schema.minimum);
    if (schema.maximum !== undefined) num = num.max(schema.maximum);
    if (type === "integer") num = num.int(); // Enforce integer if type is 'integer'
    base = num;
  } else if (type === "boolean") {
    base = zod_1.z.boolean();
  } else if (type === "array") {
    base = zod_1.z.array(jsonSchemaToZod(schema.items));
  } else if (type === "object") {
    if (!schema.properties) return zod_1.z.record(zod_1.z.any());
    const shape = {};
    // If required is missing, all properties are required by default (per JSON Schema spec)
    const required = schema.required ?? Object.keys(schema.properties);
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      let prop = jsonSchemaToZod(propSchema);
      if (!required.includes(key)) {
        prop = prop.optional();
      }
      shape[key] = prop;
    }
    base = zod_1.z.object(shape);
  } else {
    base = zod_1.z.any();
  }
  if (isNullable) {
    return base.nullable();
  }
  return base;
}
//# sourceMappingURL=jsonSchemaToZod.js.map
