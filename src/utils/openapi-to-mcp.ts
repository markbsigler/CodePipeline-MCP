import fs from 'fs';
import path from 'path';
import { jsonSchemaToZod } from './jsonSchemaToZod';

/**
 * Loads and parses the OpenAPI JSON file.
 * @param openapiPath Path to the OpenAPI JSON file
 */
export function loadOpenApiSpec(openapiPath: string) {
  const fullPath = path.resolve(openapiPath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Converts a JSON Schema object to a TypeScript type definition string.
 * This is a basic implementation for demonstration; for production use, consider a library like json-schema-to-typescript.
 */
export function jsonSchemaToTypeScriptType(schema: any, typeName: string): string {
  if (!schema || typeof schema !== 'object') return `type ${typeName} = any;`;
  if (schema.type === 'object' && schema.properties) {
    const props = Object.entries(schema.properties)
      .map(([key, val]: [string, any]) => {
        const optional = schema.required && !schema.required.includes(key) ? '?' : '';
        return `  ${key}${optional}: ${jsonSchemaTypeToTs(val)};`;
      })
      .join('\n');
    return `export interface ${typeName} {\n${props}\n}`;
  }
  if (schema.type === 'array') {
    return `type ${typeName} = ${jsonSchemaTypeToTs(schema.items)}[];`;
  }
  return `type ${typeName} = any;`;
}

export function jsonSchemaTypeToTs(schema: any): string {
  if (!schema) return 'any';
  if (schema.type === 'string') return 'string';
  if (schema.type === 'number' || schema.type === 'integer') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') return `${jsonSchemaTypeToTs(schema.items)}[]`;
  if (schema.type === 'object' && schema.properties) {
    return `{ ${Object.entries(schema.properties)
      .map(([k, v]: [string, any]) => `${k}: ${jsonSchemaTypeToTs(v)}`)
      .join('; ')} }`;
  }
  return 'any';
}

/**
 * Extracts MCP tool definitions from OpenAPI spec.
 * Each tool includes name, inputSchema, outputSchema, description, and zod schemas.
 */
function buildInputSchema(op: any) {
  const inputSchema: { type: string; properties: Record<string, any>; required: string[] } = {
    type: 'object',
    properties: {},
    required: []
  };
  if (Array.isArray(op.parameters)) {
    for (const param of op.parameters) {
      inputSchema.properties[param.name] = param.schema || { type: 'string' };
      if (param.required) inputSchema.required.push(param.name);
    }
  }
  if (op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
    const bodySchema = op.requestBody.content['application/json'].schema;
    inputSchema.properties['body'] = bodySchema;
    inputSchema.required.push('body');
  }
  return inputSchema;
}

function buildOutputSchema(op: any) {
  let outputSchema = {};
  if (op.responses && (op.responses['200'] || op.responses['201'])) {
    const resp = op.responses['200'] || op.responses['201'];
    if (resp.content && resp.content['application/json']) {
      outputSchema = resp.content['application/json'].schema;
    }
  }
  return outputSchema;
}

export function extractMcpToolsFromOpenApi(openapi: any) {
  const tools = [];
  for (const [pathKey, pathItemRaw] of Object.entries(openapi.paths)) {
    const pathItem = pathItemRaw as Record<string, any>;
    for (const method of Object.keys(pathItem)) {
      const op = pathItem[method];
      const name = op.operationId || `${method}_${pathKey.replace(/[/{}/]/g, '_')}`;
      const description = op.description || op.summary || '';
      const inputSchema = buildInputSchema(op);
      const outputSchema = buildOutputSchema(op);
      const inputType = jsonSchemaToTypeScriptType(inputSchema, `${name}Input`);
      const outputType = jsonSchemaToTypeScriptType(outputSchema, `${name}Output`);
      const inputZod = jsonSchemaToZod(inputSchema);
      const outputZod = jsonSchemaToZod(outputSchema);
      tools.push({ name, description, inputSchema, outputSchema, inputType, outputType, inputZod, outputZod });
    }
  }
  return tools;
}
