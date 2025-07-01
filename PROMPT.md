# MCP Server TypeScript Node Project Generation Prompt

Generate a production-ready TypeScript/Node.js MCP server project with the following best practices and security mitigations.

---

## 1. Project Structure and Standards

- Use Node.js v20+, TypeScript v5+, Jest v29+, and specify all dependency versions in `package.json`.
- Directory structure (example):
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
- Enforce strict TypeScript config with `tsconfig.json` and `tsconfig.build.json`.
- Use `eslint`, `prettier`, and `@typescript-eslint/parser` for linting/formatting.
- Provide `.gitignore`, `.dockerignore`, and `.env.example` with all required environment variables and example values.

---

## 2. MCP Tools Implementation

- **OpenAPI-to-MCP Tools Mapping**: Parse `config/openapi.json` (see below for example) to generate MCP tool definitions.
- Map OpenAPI operation parameters to MCP tool `inputSchema` (JSON Schema), and responses to `outputSchema`.
- Tool `name` from operationId or path/method; `description` from OpenAPI operation description.
- Support optional `title` for human-readable tool names.
- Implement required MCP tool endpoints:
  - `tools/list` (with pagination)
  - `tools/call`
  - `notifications/tools/list_changed`
- Declare `tools` capability with `listChanged` support.

---

## 3. API, Transport, and Security Implementation

- Use **Streamable HTTP** for MCP transport:
  - JSON-RPC 2.0 over HTTP
  - Chunked/streamed responses (Node.js streams)
  - Server-Sent Events (SSE) for notifications
  - Resumable streams with secure session management
- **Bearer token authentication** with JWT validation.
- **Security Mitigations**:
  - NO token passthrough; all tokens must be issued for this server.
  - Secure, non-deterministic session IDs, bound to user info (`<user_id>:<session_id>`).
  - No session-based authentication; sessions for state only.
  - Verify all inbound requests when authorization is implemented.
- Implement **CORS** and security headers (`helmet.js`).
- Input validation and sanitization everywhere.
- Rate limiting and request size limits.
- `/healthz` endpoint for health checks.
- Structured logging (e.g., with Winston or Pino) and robust error handling.

---

## 4. Configuration and Environment

- Support environment variable configuration via `.env` (with validation).
- Example `.env.example`:
  ```
  NODE_ENV=development
  PORT=3000
  JWT_SECRET=your_jwt_secret
  ```
- Use `joi` or `zod` for config schema validation.
- Support multiple environment configs (development, staging, production).

---

## 5. Documentation and Architecture

- Add a comprehensive `README.md` with:
  - Quick start and setup
  - API usage examples (curl, TypeScript/Node.js)
  - Security configuration
  - Docker deployment
- Include **Mermaid diagrams** for:
  - Bearer Token Authentication Flow
  - OpenAPI-to-MCP Tools Mapping
  - MCP Protocol Message Flow
  - Tool Execution and Response Handling
  - Container Deployment
  - Session Management and Security
- Document the process for adding new endpoints/tools.
- Auto-generate API docs using Swagger UI or Redoc.

---

## 6. Testing and Quality Assurance

- Use **Jest** for all tests.
- Minimum 90% code coverage (unit, integration, e2e).
- Test all handlers, middleware, protocol endpoints, tool mapping, security, streams, and schema validation.
- Include `jest --coverage` in scripts.
- Linting/formatting checks with pre-commit hooks (`husky`).
- TypeScript type checking in CI.
- Security scanning (`npm audit`, `snyk`).

---

## 7. Development Tools and Scripts

- `package.json` scripts for:
  - `dev`, `build`, `test`, `test:watch`, `lint`, `format`, `docker:build`, `docker:run`
- Use `nodemon`, `ts-node`, `concurrently` for development.

---

## 8. CI/CD Pipeline

- **GitHub Actions** workflow (`.github/workflows/ci.yml`) with:
  - TypeScript compilation
  - Linting/formatting
  - Test/coverage
  - Security scanning
  - Docker build/test (multi-platform: linux/amd64, linux/arm64)

---

## 9. Extensibility Framework

- **OpenAPI-to-MCP Tools Pipeline**: Add new tools by editing `config/openapi.json`.
- Auto-generate MCP tool definitions and TypeScript types.
- Provide handler templates and registration system.
- Support tool annotations for metadata.
- Plugin architecture for MCP extensions.
- Middleware system for custom request processing.

---

## 10. Example Files

- Provide a sample `config/openapi.json`:
  ```json
  {
    "openapi": "3.0.0",
    "info": { "title": "Example API", "version": "1.0.0" },
    "paths": {
      "/hello": {
        "get": {
          "operationId": "sayHello",
          "description": "Returns a greeting.",
          "responses": {
            "200": {
              "description": "Greeting response",
              "content": { "application/json": { "schema": { "type": "object", "properties": { "message": { "type": "string" } } } } }
            }
          }
        }
      }
    }
  }
  ```
- Example `.env.example` (see above).

---

## 11. Security Configuration Examples

- Document input validation, access controls, rate limiting, output sanitization, audit logging, token validation, session security, CORS, and logging/monitoring.

---

## 12. Container and Deployment

- Multi-stage Dockerfile (build/dev and minimal prod).
- Docker Compose with app, Redis (if needed), health checks, env management.
- Deployment scripts for common platforms.
- Container security best practices.
- Specify if Docker image should be multi-arch or target a specific platform.

---

## 13. Performance and Monitoring

- Performance monitoring setup.
- Structured logging with log levels.
- Health check endpoints beyond `/healthz`.
- Metrics collection.
- Scaling considerations.

---

## 14. Code Quality

- Require JSDoc/TSDoc comments for all exported functions, classes, and modules.
- All code should be self-documenting and follow best practices.

---

The resulting project should be robust, secure, and easily extensible, automatically exposing OpenAPI operations as MCP tools, following all security best practices, and ready for production and CI/CD.

---
