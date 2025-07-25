/**
 * Loads and parses the OpenAPI JSON file.
 * @param openapiPath Path to the OpenAPI JSON file
 */
export declare function loadOpenApiSpec(
  openapiPath: string,
): Record<string, unknown>;
/**
 * Converts a JSON Schema object to a TypeScript type definition string.
 * This is a basic implementation for demonstration; for production use, consider a library like json-schema-to-typescript.
 */
export declare function jsonSchemaToTypeScriptType(
  schema: unknown,
  typeName: string,
): string;
export declare function jsonSchemaTypeToTs(schema: unknown): string;
export declare function extractMcpToolsFromOpenApi(
  openapi: Record<string, unknown>,
): Array<{
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
  outputSchema: unknown;
  inputType: string;
  outputType: string;
  inputZod: unknown;
  outputZod: unknown;
}>;
