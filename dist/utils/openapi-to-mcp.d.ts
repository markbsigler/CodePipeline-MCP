/**
 * Loads and parses the OpenAPI JSON file.
 * @param openapiPath Path to the OpenAPI JSON file
 */
export declare function loadOpenApiSpec(openapiPath: string): any;
/**
 * Converts a JSON Schema object to a TypeScript type definition string.
 * This is a basic implementation for demonstration; for production use, consider a library like json-schema-to-typescript.
 */
export declare function jsonSchemaToTypeScriptType(schema: any, typeName: string): string;
export declare function jsonSchemaTypeToTs(schema: any): string;
export declare function extractMcpToolsFromOpenApi(openapi: any): {
    name: any;
    description: any;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
    outputSchema: {};
    inputType: string;
    outputType: string;
    inputZod: import("zod").ZodTypeAny;
    outputZod: import("zod").ZodTypeAny;
}[];
