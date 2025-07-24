// @ts-nocheck
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolZodSchemas = void 0;
const openapi_to_mcp_1 = require("../utils/openapi-to-mcp");
const path_1 = __importDefault(require("path"));
// This script generates and exports all Zod schemas for tool input/output
const openapiPath = path_1.default.resolve(__dirname, '../../config/openapi.json');
const openapi = (0, openapi_to_mcp_1.loadOpenApiSpec)(openapiPath);
const mcpTools = (0, openapi_to_mcp_1.extractMcpToolsFromOpenApi)(openapi);
// Export all schemas for use in validation middleware
exports.toolZodSchemas = mcpTools.reduce((acc, tool) => {
    acc[tool.name] = {
        input: tool.inputZod,
        output: tool.outputZod,
    };
    return acc;
}, {});
//# sourceMappingURL=toolZodSchemas.js.map