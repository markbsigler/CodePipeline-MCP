# MCP Server Template

A production-ready TypeScript/Node.js MCP server project scaffolded from an AI prompt, following best practices for security, extensibility, and maintainability.

## Project Structure

```
.
├── src/
│   ├── handlers/
│   ├── middleware/
│   ├── types/
│   ├── utils/
├── config/
│   └── openapi.json
├── tests/
├── .github/
│   └── workflows/
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── README.md
├── LICENSE
└── ...
```

## OpenAPI Specification: CodePipeline (ISPW) Example

The project uses OpenAPI to MCP tool mapping. Here is the current `config/openapi.json` (excerpt):

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "BMC Compuware ISPW REST API",
    "description": "REST API for BMC Compuware ISPW (Interactive Source Program Workbench) - a source code management, release automation, and deployment automation tool for mainframe DevOps. The API is hosted in Compuware Enterprise Services (CES) and uses token-based authentication.",
    "version": "1.0.0",
    "contact": {
      "name": "BMC Compuware Support",
      "url": "https://www.bmc.com/support/"
    },
    "license": {
      "name": "BMC Software License"
    }
  },
  "servers": [
    { "url": "https://ispw.api.compuware.com", "description": "Production ISPW API Server" },
    { "url": "https://{cesHost}:{cesPort}", "description": "Custom CES Server" }
  ],
  "security": [ { "PersonalAccessToken": [] } ],
  "paths": {
    "/ispw/{srid}/assignments": {
      "get": {
        "tags": ["Assignments"],
        "summary": "Get assignments",
        "description": "Retrieve assignments for a specific SRID (System Resource Identifier)",
        "parameters": [
          { "name": "srid", "in": "path", "required": true, "schema": { "type": "string" }, "description": "System Resource Identifier" },
          { "name": "level", "in": "query", "schema": { "type": "string", "enum": ["DEV", "INT", "ACC", "PRD"] }, "description": "Assignment level" },
          { "name": "assignmentId", "in": "query", "schema": { "type": "string" }, "description": "Assignment ID filter" }
        ],
        "responses": {
          "200": { "description": "Successful response", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AssignmentListResponse" } } } },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "post": {
        "tags": ["Assignments"],
        "summary": "Create assignment",
        "description": "Create a new assignment",
        "parameters": [ { "name": "srid", "in": "path", "required": true, "schema": { "type": "string" }, "description": "System Resource Identifier" } ],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreateAssignmentRequest" } } } },
        "responses": {
          "201": { "description": "Assignment created successfully", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Assignment" } } } },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" }
        }
      }
    },
    // ... (many more endpoints for tasks, releases, sets, packages, operations)
  },
  // ... (components, schemas, responses, tags)
}
```

> **Note:** The full OpenAPI spec is available in `config/openapi.json` and includes endpoints for assignments, tasks, releases, sets, packages, and DevOps operations (generate, promote, deploy, etc.).

## Environment Variables Example

See `.env.example` for required environment variables:

```
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
```

## Key Features
- Modular TypeScript structure
- OpenAPI-driven MCP tool generation (CodePipeline/ISPW)
- Strict TypeScript, linting, and formatting
- Comprehensive testing with Jest
- Secure authentication and session management
- Docker and Docker Compose support
- CI/CD ready with GitHub Actions

For full requirements and implementation details, see `PROMPT.md`.
