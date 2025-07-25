import { ZodTypeAny } from "zod";
/**
 * Converts a JSON Schema object to a Zod schema.
 * Supports enum, const, oneOf/anyOf, nullability, and improved required/optional handling.
 *
 * Note: Cognitive complexity is high due to JSON Schema branching. Consider refactoring for maintainability if needed.
 */
export declare function jsonSchemaToZod(schema: unknown): ZodTypeAny;
