import path from 'path';

import {
  loadOpenApiSpec,
  extractMcpToolsFromOpenApi,
} from '../utils/openapi-to-mcp';

// This script generates and exports all Zod schemas for tool input/output
const openapiPath = path.resolve(__dirname, '../../config/openapi.json');
const openapi = loadOpenApiSpec(openapiPath);
const mcpTools = extractMcpToolsFromOpenApi(openapi);

// Export all schemas for use in validation middleware
export const toolZodSchemas = mcpTools.reduce(
  (acc, tool) => {
    acc[tool.name] = {
      input: tool.inputZod,
      output: tool.outputZod,
    };
    return acc;
  },
  {} as Record<string, { input: unknown; output: unknown }>,
);
