import { z, ZodTypeAny } from "zod";

/**
 * Converts a JSON Schema object to a Zod schema.
 * Supports enum, const, oneOf/anyOf, nullability, and improved required/optional handling.
 *
 * Note: Cognitive complexity is high due to JSON Schema branching. Consider refactoring for maintainability if needed.
 */
export function jsonSchemaToZod(schema: unknown): ZodTypeAny {
  if (!schema || typeof schema !== "object") {
    return z.any();
  }
  const s = schema as Record<string, unknown>;

  // Handle enum
  if (Array.isArray(s.enum) && s.enum.length > 0) {
    const enumArr = s.enum;
    if (enumArr.every((v) => typeof v === "string")) {
      // All string enum
      return z.enum(enumArr as [string, ...string[]]);
    } else {
      // Mixed/other types: use union of literals
      if (enumArr.length >= 2) {
        // TypeScript: force tuple type for z.union
        return z.union(
          enumArr.map((v) => z.literal(v)) as unknown as [
            ZodTypeAny,
            ZodTypeAny,
            ...ZodTypeAny[],
          ],
        );
      } else if (enumArr.length === 1) {
        return z.literal(enumArr[0]);
      } else {
        return z.any();
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
      return z.literal(constVal);
    } else {
      return z.any();
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
      return z.union(
        arr.map((v) => jsonSchemaToZod(v)) as [
          ZodTypeAny,
          ZodTypeAny,
          ...ZodTypeAny[],
        ],
      );
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
      type = type.filter((t: string) => t !== "null")[0];
    }
  } else if (s.nullable === true) {
    isNullable = true;
  }

  let base: ZodTypeAny;
  if (type === "string") {
    let str = z.string();
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
    let num = z.number();
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
    base = z.boolean();
  } else if (type === "array") {
    base = z.array(jsonSchemaToZod(s.items));
  } else if (type === "object") {
    if (
      !("properties" in s) ||
      typeof s.properties !== "object" ||
      s.properties === null
    ) {
      return z.record(z.any());
    }
    const shape: Record<string, ZodTypeAny> = {};
    // If required is missing, all properties are required by default (per JSON Schema spec)
    const required: string[] = Array.isArray(s.required)
      ? s.required
      : Object.keys(s.properties);
    for (const [key, propSchema] of Object.entries(s.properties)) {
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
