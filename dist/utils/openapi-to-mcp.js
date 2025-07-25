"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
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
  const raw = fs_1.default.readFileSync(fullPath, "utf-8");
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("OpenAPI spec must be a non-null object");
  }
  return parsed;
}
/**
 * Converts a JSON Schema object to a TypeScript type definition string.
 * This is a basic implementation for demonstration; for production use, consider a library like json-schema-to-typescript.
 */
function jsonSchemaToTypeScriptType(schema, typeName) {
  if (!schema || typeof schema !== "object") {
    return `type ${typeName} = unknown;`;
  }
  const s = schema;
  if (s.type === "object" && s.properties) {
    const props = Object.entries(s.properties)
      .map(([key, val]) => {
        const optional =
          Array.isArray(s.required) && !s.required.includes(key) ? "?" : "";
        return `  ${key}${optional}: ${jsonSchemaTypeToTs(val)};`;
      })
      .join("\n");
    return `export interface ${typeName} {\n${props}\n}`;
  }
  if (s.type === "array") {
    return `type ${typeName} = ${jsonSchemaTypeToTs(s.items)}[];`;
  }
  return `type ${typeName} = unknown;`;
}
function jsonSchemaTypeToTs(schema) {
  if (!schema || typeof schema !== "object") {
    return "unknown";
  }
  const s = schema;
  if (s.type === "string") {
    return "string";
  }
  if (s.type === "number" || s.type === "integer") {
    return "number";
  }
  if (s.type === "boolean") {
    return "boolean";
  }
  if (s.type === "array") {
    return `${jsonSchemaTypeToTs(s.items)}[]`;
  }
  if (s.type === "object" && s.properties) {
    return `{ ${Object.entries(s.properties)
      .map(([k, v]) => `${k}: ${jsonSchemaTypeToTs(v)}`)
      .join("; ")} }`;
  }
  return "unknown";
}
/**
 * Extracts MCP tool definitions from OpenAPI spec.
 * Each tool includes name, inputSchema, outputSchema, description, and zod schemas.
 */
function buildInputSchema(op) {
  const inputSchema = {
    type: "object",
    properties: {},
    required: [],
  };
  if (Array.isArray(op.parameters)) {
    for (const param of op.parameters) {
      const name = typeof param.name === "string" ? param.name : "";
      inputSchema.properties[name] = param.schema ?? { type: "string" };
      if (param.required) {
        inputSchema.required.push(name);
      }
    }
  }
  if (
    op.requestBody &&
    typeof op.requestBody === "object" &&
    "content" in op.requestBody &&
    op.requestBody.content &&
    typeof op.requestBody.content === "object" &&
    "application/json" in op.requestBody.content &&
    op.requestBody.content["application/json"] &&
    typeof op.requestBody.content["application/json"] === "object" &&
    "schema" in op.requestBody.content["application/json"]
  ) {
    const bodySchema = op.requestBody.content["application/json"].schema;
    inputSchema.properties["body"] = bodySchema;
    inputSchema.required.push("body");
  }
  return inputSchema;
}
function buildOutputSchema(op) {
  if (op.responses && typeof op.responses === "object") {
    const responses = op.responses;
    const resp = responses["200"] ?? responses["201"];
    if (
      resp &&
      resp.content &&
      typeof resp.content === "object" &&
      "application/json" in resp.content &&
      resp.content["application/json"] &&
      typeof resp.content["application/json"] === "object" &&
      "schema" in resp.content["application/json"]
    ) {
      return resp.content["application/json"].schema;
    }
  }
  return {}; // Return type is already specified as unknown
}
function extractMcpToolsFromOpenApi(openapi) {
  const tools = [];
  if (!openapi.paths || typeof openapi.paths !== "object") {
    return tools;
  }
  for (const [pathKey, pathItemRaw] of Object.entries(openapi.paths)) {
    const pathItem = pathItemRaw;
    for (const method of Object.keys(pathItem)) {
      const op = pathItem[method];
      const name =
        typeof op.operationId === "string"
          ? op.operationId
          : `${method}_${pathKey.replace(/[/{}/]/g, "_")}`;
      const description =
        typeof op.description === "string"
          ? op.description
          : typeof op.summary === "string"
            ? op.summary
            : "";
      const inputSchema = buildInputSchema(op);
      const outputSchema = buildOutputSchema(op);
      const inputType = jsonSchemaToTypeScriptType(inputSchema, `${name}Input`);
      const outputType = jsonSchemaToTypeScriptType(
        outputSchema,
        `${name}Output`,
      );
      const inputZod = (0, jsonSchemaToZod_1.jsonSchemaToZod)(inputSchema);
      const outputZod = (0, jsonSchemaToZod_1.jsonSchemaToZod)(outputSchema);
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
//# sourceMappingURL=openapi-to-mcp.js.map
