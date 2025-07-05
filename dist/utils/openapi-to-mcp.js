"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOpenApiSpec = loadOpenApiSpec;
exports.jsonSchemaToTypeScriptType = jsonSchemaToTypeScriptType;
exports.jsonSchemaTypeToTs = jsonSchemaTypeToTs;
exports.extractMcpToolsFromOpenApi = extractMcpToolsFromOpenApi;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsonSchemaToZod_1 = require("./jsonSchemaToZod");
/**
 * Loads and parses the OpenAPI JSON file.
 * @param openapiPath Path to the OpenAPI JSON file
 */
function loadOpenApiSpec(openapiPath) {
    const fullPath = path_1.default.resolve(openapiPath);
    const raw = fs_1.default.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw);
}
/**
 * Converts a JSON Schema object to a TypeScript type definition string.
 * This is a basic implementation for demonstration; for production use, consider a library like json-schema-to-typescript.
 */
function jsonSchemaToTypeScriptType(schema, typeName) {
    if (!schema || typeof schema !== 'object')
        return `type ${typeName} = any;`;
    if (schema.type === 'object' && schema.properties) {
        const props = Object.entries(schema.properties)
            .map(([key, val]) => {
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
function jsonSchemaTypeToTs(schema) {
    if (!schema)
        return 'any';
    if (schema.type === 'string')
        return 'string';
    if (schema.type === 'number' || schema.type === 'integer')
        return 'number';
    if (schema.type === 'boolean')
        return 'boolean';
    if (schema.type === 'array')
        return `${jsonSchemaTypeToTs(schema.items)}[]`;
    if (schema.type === 'object' && schema.properties) {
        return `{ ${Object.entries(schema.properties)
            .map(([k, v]) => `${k}: ${jsonSchemaTypeToTs(v)}`)
            .join('; ')} }`;
    }
    return 'any';
}
/**
 * Extracts MCP tool definitions from OpenAPI spec.
 * Each tool includes name, inputSchema, outputSchema, description, and zod schemas.
 */
function buildInputSchema(op) {
    const inputSchema = {
        type: 'object',
        properties: {},
        required: []
    };
    if (Array.isArray(op.parameters)) {
        for (const param of op.parameters) {
            inputSchema.properties[param.name] = param.schema || { type: 'string' };
            if (param.required)
                inputSchema.required.push(param.name);
        }
    }
    if (op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
        const bodySchema = op.requestBody.content['application/json'].schema;
        inputSchema.properties['body'] = bodySchema;
        inputSchema.required.push('body');
    }
    return inputSchema;
}
function buildOutputSchema(op) {
    let outputSchema = {};
    if (op.responses && (op.responses['200'] || op.responses['201'])) {
        const resp = op.responses['200'] || op.responses['201'];
        if (resp.content && resp.content['application/json']) {
            outputSchema = resp.content['application/json'].schema;
        }
    }
    return outputSchema;
}
function extractMcpToolsFromOpenApi(openapi) {
    const tools = [];
    for (const [pathKey, pathItemRaw] of Object.entries(openapi.paths)) {
        const pathItem = pathItemRaw;
        for (const method of Object.keys(pathItem)) {
            const op = pathItem[method];
            const name = op.operationId || `${method}_${pathKey.replace(/[/{}/]/g, '_')}`;
            const description = op.description || op.summary || '';
            const inputSchema = buildInputSchema(op);
            const outputSchema = buildOutputSchema(op);
            const inputType = jsonSchemaToTypeScriptType(inputSchema, `${name}Input`);
            const outputType = jsonSchemaToTypeScriptType(outputSchema, `${name}Output`);
            const inputZod = (0, jsonSchemaToZod_1.jsonSchemaToZod)(inputSchema);
            const outputZod = (0, jsonSchemaToZod_1.jsonSchemaToZod)(outputSchema);
            tools.push({ name, description, inputSchema, outputSchema, inputType, outputType, inputZod, outputZod });
        }
    }
    return tools;
}
//# sourceMappingURL=openapi-to-mcp.js.map