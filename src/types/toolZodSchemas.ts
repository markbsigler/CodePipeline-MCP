import path from "path";

import {
  loadOpenApiSpec,
  extractMcpToolsFromOpenApi,
} from "../utils/openapi-to-mcp";

// This script generates and exports all Zod schemas for tool input/output
const openapiPath = path.resolve(__dirname, "../../config/openapi.json");
const openapi = loadOpenApiSpec(openapiPath);
const mcpTools = extractMcpToolsFromOpenApi(openapi as Record<string, unknown>);

// Add index signature to fix TS7053 errors
export interface ToolZodSchemas {
  [key: string]: {
    input: unknown;
    output: unknown;
  };
}

export const toolZodSchemas: ToolZodSchemas = mcpTools.reduce(
  (acc, tool) => {
    acc[tool.name] = {
      input: tool.inputZod,
      output: tool.outputZod,
    };
    return acc;
  },
  {} as ToolZodSchemas,
);
