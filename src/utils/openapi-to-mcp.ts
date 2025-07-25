import fs from 'fs';
import path from 'path';

import { jsonSchemaToZod } from './jsonSchemaToZod';

/**
 * Loads and parses the OpenAPI JSON file.
 * @param openapiPath Path to the OpenAPI JSON file
 */
export function loadOpenApiSpec(openapiPath: string): Record<string, unknown> {
  const fullPath = path.resolve(openapiPath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('OpenAPI spec must be a non-null object');
  }
  return parsed as Record<string, unknown>;
}

/**
 * Converts a JSON Schema object to a TypeScript type definition string.
 * This is a basic implementation for demonstration; for production use, consider a library like json-schema-to-typescript.
 */
export function jsonSchemaToTypeScriptType(
  schema: unknown,
  typeName: string,
): string {
  if (!schema || typeof schema !== 'object') {return `type ${typeName} = unknown;`;}
  const s = schema as Record<string, unknown>;
  if (s.type === 'object' && s.properties) {
    const props = Object.entries(s.properties as Record<string, unknown>)
      .map(([key, val]) => {
        const optional =
          Array.isArray(s.required) && !s.required.includes(key) ? '?' : '';
        return `  ${key}${optional}: ${jsonSchemaTypeToTs(val)};`;
      })
      .join('\n');
    return `export interface ${typeName} {\n${props}\n}`;
  }
  if (s.type === 'array') {
    return `type ${typeName} = ${jsonSchemaTypeToTs(s.items)}[];`;
  }
  return `type ${typeName} = unknown;`;
}

export function jsonSchemaTypeToTs(schema: unknown): string {
  if (!schema || typeof schema !== 'object') {return 'unknown';}
  const s = schema as Record<string, unknown>;
  if (s.type === 'string') {return 'string';}
  if (s.type === 'number' || s.type === 'integer') {return 'number';}
  if (s.type === 'boolean') {return 'boolean';}
  if (s.type === 'array') {return `${jsonSchemaTypeToTs(s.items)}[]`;}
  if (s.type === 'object' && s.properties) {
    return `{ ${Object.entries(s.properties as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${jsonSchemaTypeToTs(v)}`)
      .join('; ')} }`;
  }
  return 'unknown';
}

/**
 * Extracts MCP tool definitions from OpenAPI spec.
 * Each tool includes name, inputSchema, outputSchema, description, and zod schemas.
 */
function buildInputSchema(op: Record<string, unknown>): { type: string; properties: Record<string, unknown>; required: string[] } {
  const inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  } = {
    type: 'object',
    properties: {},
    required: [],
  };
  if (Array.isArray(op.parameters)) {
    for (const param of op.parameters as Array<Record<string, unknown>>) {
      const name = typeof param.name === 'string' ? param.name : '';
      inputSchema.properties[name] = param.schema ?? { type: 'string' };
      if (param.required) {inputSchema.required.push(name);}
    }
  }
  if (
    op.requestBody &&
    typeof op.requestBody === 'object' &&
    'content' in op.requestBody &&
    op.requestBody.content &&
    typeof op.requestBody.content === 'object' &&
    'application/json' in op.requestBody.content &&
    op.requestBody.content['application/json'] &&
    typeof op.requestBody.content['application/json'] === 'object' &&
    'schema' in op.requestBody.content['application/json']
  ) {
    const bodySchema = (op.requestBody.content['application/json'] as { schema: unknown }).schema;
    inputSchema.properties['body'] = bodySchema;
    inputSchema.required.push('body');
  }
  return inputSchema;
}

function buildOutputSchema(op: Record<string, unknown>): unknown {
  if (
    op.responses &&
    typeof op.responses === 'object'
  ) {
    const responses = op.responses as Record<string, unknown>;
    const resp = (responses['200'] ?? responses['201']) as Record<string, unknown> | undefined;
    if (
      resp &&
      resp.content &&
      typeof resp.content === 'object' &&
      'application/json' in resp.content &&
      resp.content['application/json'] &&
      typeof resp.content['application/json'] === 'object' &&
      'schema' in resp.content['application/json']
    ) {
      return (resp.content['application/json'] as { schema: unknown }).schema;
    }
  }
  return {}; // Return type is already specified as unknown
}

export function extractMcpToolsFromOpenApi(openapi: Record<string, unknown>): Array<{
  name: string;
  description: string;
  inputSchema: { type: string; properties: Record<string, unknown>; required: string[] };
  outputSchema: unknown;
  inputType: string;
  outputType: string;
  inputZod: unknown;
  outputZod: unknown;
}> {
  const tools: Array<{
    name: string;
    description: string;
    inputSchema: { type: string; properties: Record<string, unknown>; required: string[] };
    outputSchema: unknown;
    inputType: string;
    outputType: string;
    inputZod: unknown;
    outputZod: unknown;
  }> = [];
  if (!openapi.paths || typeof openapi.paths !== 'object') {return tools;}
  for (const [pathKey, pathItemRaw] of Object.entries(openapi.paths as Record<string, unknown>)) {
    const pathItem = pathItemRaw as Record<string, unknown>;
    for (const method of Object.keys(pathItem)) {
      const op = pathItem[method] as Record<string, unknown>;
      const name =
        typeof op.operationId === 'string' ? op.operationId : `${method}_${pathKey.replace(/[/{}/]/g, '_')}`;
      const description = typeof op.description === 'string' ? op.description : (typeof op.summary === 'string' ? op.summary : '');
      const inputSchema = buildInputSchema(op);
      const outputSchema = buildOutputSchema(op);
      const inputType = jsonSchemaToTypeScriptType(inputSchema, `${name}Input`);
      const outputType = jsonSchemaToTypeScriptType(
        outputSchema,
        `${name}Output`,
      );
      const inputZod = jsonSchemaToZod(inputSchema);
      const outputZod = jsonSchemaToZod(outputSchema);
      tools.push({
        name,
        description,
        inputSchema,
        outputSchema,
        inputType,
        outputType,
        inputZod,
        outputZod,
      });
    }
  }
  return tools;
}
