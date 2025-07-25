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
  if (!schema || typeof schema !== "object") {
    return zod_1.z.any();
  }
  const s = schema;
  // Handle enum
  if (Array.isArray(s.enum) && s.enum.length > 0) {
    const enumArr = s.enum;
    if (enumArr.every((v) => typeof v === "string")) {
      // All string enum
      return zod_1.z.enum(enumArr);
    } else {
      // Mixed/other types: use union of literals
      if (enumArr.length >= 2) {
        // TypeScript: force tuple type for z.union
        return zod_1.z.union(enumArr.map((v) => zod_1.z.literal(v)));
      } else if (enumArr.length === 1) {
        return zod_1.z.literal(enumArr[0]);
      } else {
        return zod_1.z.any();
      }
    }
  }
  // Handle const
  if ("const" in s && s.const !== undefined) {
    const constVal = s.const;
    if (
      typeof constVal === "string" ||
      typeof constVal === "number" ||
      typeof constVal === "boolean" ||
      constVal === null
    ) {
      return zod_1.z.literal(constVal);
    } else {
      return zod_1.z.any();
    }
  }
  // Handle oneOf/anyOf
  const arr =
    Array.isArray(s.oneOf) && s.oneOf.length > 0
      ? s.oneOf
      : Array.isArray(s.anyOf) && s.anyOf.length > 0
        ? s.anyOf
        : undefined;
  if (arr) {
    if (arr.length >= 2) {
      return zod_1.z.union(arr.map((v) => jsonSchemaToZod(v)));
    } else if (arr.length === 1) {
      return jsonSchemaToZod(arr[0]);
    }
  }
  // Handle nullability (type: [T, "null"] or nullable: true)
  let type = s.type;
  let isNullable = false;
  if (Array.isArray(type)) {
    if (type.includes("null")) {
      isNullable = true;
      type = type.filter((t) => t !== "null")[0];
    }
  } else if (s.nullable === true) {
    isNullable = true;
  }
  let base;
  if (type === "string") {
    let str = zod_1.z.string();
    if ("minLength" in s && typeof s.minLength === "number") {
      str = str.min(s.minLength);
    }
    if ("maxLength" in s && typeof s.maxLength === "number") {
      str = str.max(s.maxLength);
    }
    if ("pattern" in s && typeof s.pattern === "string") {
      str = str.regex(new RegExp(s.pattern));
    }
    base = str;
  } else if (type === "number" || type === "integer") {
    let num = zod_1.z.number();
    if ("minimum" in s && typeof s.minimum === "number") {
      num = num.min(s.minimum);
    }
    if ("maximum" in s && typeof s.maximum === "number") {
      num = num.max(s.maximum);
    }
    if (type === "integer") {
      num = num.int();
    } // Enforce integer if type is 'integer'
    base = num;
  } else if (type === "boolean") {
    base = zod_1.z.boolean();
  } else if (type === "array") {
    base = zod_1.z.array(jsonSchemaToZod(s.items));
  } else if (type === "object") {
    if (
      !("properties" in s) ||
      typeof s.properties !== "object" ||
      s.properties === null
    ) {
      return zod_1.z.record(zod_1.z.any());
    }
    const shape = {};
    // If required is missing, all properties are required by default (per JSON Schema spec)
    const required = Array.isArray(s.required)
      ? s.required
      : Object.keys(s.properties);
    for (const [key, propSchema] of Object.entries(s.properties)) {
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
