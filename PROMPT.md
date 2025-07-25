# MCP Server TypeScript Node Project Generation Prompt (Comprehensive, Reproducible, Production-Ready)

> **For LLM/Copilot/GenAI Agents:**
> This prompt is for full, end-to-end project bootstrapping. **Follow every step and requirement exactly.**
> **Do not skip or summarize any section.**
> All code, configuration, and documentation must be generated so that a developer can clone, install, build, test, and run the project (including Docker and CI) with no manual steps omitted, on any major OS (macOS, Linux, Windows).
> All generated files must be present, non-empty, and up-to-date with the latest stable dependency versions.
> All code and docs must pass all lint, type, and test checks on first clone/install, with no manual fixes.
> All scripts and commands must be cross-platform or document any OS-specific caveats.
> All code must be self-contained and not depend on unpublished/private packages unless documented.

---

## Project Bootstrap & Reproducibility Checklist

1. **Prerequisites**

- Node.js v20+ and npm v9+ ([nodejs.org](https://nodejs.org/))
- Docker & Docker Compose ([docker.com](https://www.docker.com/get-started/))
- Git
- (Optional) Stryker for mutation testing: `npm install -g stryker-cli`
- (Optional) k6 or Artillery for load testing
- (Optional) jq, curl, and make (for scripts)

1. **Clone and Install**

```sh
git clone <REPO_URL>
cd <PROJECT_DIR>
npm install
cp .env.example .env
```

1. **Run and Test**

- Start dev server: `npm run dev`
- Run tests: `npm test`
- Run mutation tests: `npx stryker run`
- Lint/format: `npm run lint && npm run format`
- Build: `npm run build`
- Start production: `npm start`
- Generate and view coverage: `npm run coverage`
- View coverage report: open `coverage/lcov-report/index.html`

1. **Docker**

- Build and run: `docker-compose up --build`
- Stop: `docker-compose down`
- (Optional) Run with production profile: `docker-compose --profile prod up --build`

1. **OpenAPI Spec**

- Validate: `npm run openapi:validate`
- Regenerate clients: `npm run openapi:client`
- Lint OpenAPI: `npm run openapi:lint`

1. **CI/CD**

- Configure GitHub Actions secrets if needed (see README).
- Push to trigger CI: `git push`
- Download CI artifacts: coverage, mutation, build logs

1. **Verification**

- Ensure all tests pass, coverage is reported, and the app runs in both local and Docker environments.
- All endpoints and tools must have example requests/responses in README and API docs.
- After all steps, output a summary table of successful steps and their expected outputs (e.g., “npm test: All tests pass”, “npm run build: dist/ created”).

1. **FAQ/Troubleshooting**

- See README for common issues (ports, Docker, JWT, Node version, etc).
- “Common Pitfalls” and “Support/Contact” sections must be present in README.

1. **Extending**

- To add new endpoints/tools, edit `config/openapi.json` and follow documented process in README.

1. **Project Structure Overview**

- README must include a tree view and brief description of each top-level directory/file.

Generate a **production-ready, fully reproducible, and extensible TypeScript/Node.js MCP server project** with the following best practices, security mitigations, and reproducibility requirements. **All requirements below are mandatory unless otherwise noted.**

**Key additional requirements:**

- Every endpoint/tool in the generated README and API docs must include at least one copy-paste runnable example request and response (curl and TypeScript/Node.js).
- All error responses must conform to a standard JSON error schema (with `code`, `message`, and `details` fields), and this schema must be documented in the OpenAPI spec and README. Example:

```json
{
  "error": {
    "code": "ERR_CODE",
    "message": "Human-readable error message.",
    "details": { "field": "description" }
  }
}
```

- The OpenAPI spec must be validated and linted in CI; the project must fail to build if the spec is invalid or missing required fields.
- The README must include a “How to Upgrade” section for dependencies and OpenAPI spec changes, with commands and manual steps.
- The README must include instructions for reporting security issues (e.g., via email or GitHub Security Advisories).
- All served UIs/docs must be accessible (a11y best practices) and pass basic a11y checks (axe-core, Lighthouse).
- Generated API clients must be published to a package registry (npm, GitHub Packages, etc.) and include usage instructions in the README.
- If there are specific performance SLAs, these must be documented and tested, and load/stress test scripts must be included.
- Use consistent terminology throughout (e.g., “tool” vs. “endpoint”, “handler” vs. “controller”).
- All generated files must include copyright/license headers.
- All scripts and commands must be cross-platform (macOS, Linux, Windows) or document any OS-specific caveats.
- All code and docs must be up-to-date with the latest stable dependency versions at the time of generation.
- All code must be self-contained and not depend on unpublished/private packages unless documented.

---

## 1. Project Structure, Standards, and Verification

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
- **API versioning:** All endpoints must be versioned (e.g., `/v1/tools/list`).
- All generated files must be present and non-empty (no placeholder stubs unless documented as such).
- All scripts and commands must be cross-platform or document any OS-specific caveats.
- README must include a “Project Structure Overview” section with a tree view and brief description of each top-level directory/file.
- README must include a “Common Pitfalls” and “Support/Contact” section.
- After running all install/build/test steps, output a summary table of all successful steps and their expected outputs.

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
- **API client generation:** Auto-generate and publish TypeScript/JavaScript API clients from the OpenAPI spec.

---

## 3. API, Transport, and Security Implementation

- Use **Streamable HTTP** for MCP transport:
  - JSON-RPC 2.0 over HTTP
  - Chunked/streamed responses (Node.js streams)
  - Server-Sent Events (SSE) for notifications
  - Resumable streams with secure session management
- **Bearer token authentication** with JWT validation (asymmetric signing, RS256, with key rotation support).
- **Security Mitigations**:
  - NO token passthrough; all tokens must be issued for this server.
  - Secure, non-deterministic session IDs, bound to user info (`<user_id>:<session_id>`).
  - No session-based authentication; sessions for state only.
  - Verify all inbound requests when authorization is implemented.
  - All endpoints must check user roles/permissions (least privilege).
  - Store secrets securely using a secrets manager in production.
- Implement **CORS** and security headers (`helmet.js`).
- Input validation and sanitization everywhere.
- Rate limiting and request size limits.
- `/healthz` endpoint for health checks.
- Structured logging (e.g., with Winston or Pino) and robust error handling.
- **Standard error schema:** All API errors must conform to a standard JSON error schema (code, message, details).
- **API versioning:** All endpoints must be versioned (e.g., `/v1/tools/list`).

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
- Store secrets (JWT keys, etc.) using a secrets manager in production.

---

## 5. Documentation and Architecture

- Add a comprehensive `README.md` with:
  - Quick start and setup
  - API usage examples (curl, TypeScript/Node.js)
  - Security configuration
  - Docker deployment
  - **How to Upgrade** section for dependencies and OpenAPI spec changes
  - **Security Reporting** section with instructions for reporting vulnerabilities
  - Example-driven documentation: every endpoint/tool must have at least one example request and response (curl and TypeScript/Node.js)
- Include **Mermaid diagrams** for:
  - Bearer Token Authentication Flow
  - OpenAPI-to-MCP Tools Mapping
  - MCP Protocol Message Flow
  - Tool Execution and Response Handling
  - Container Deployment
  - Session Management and Security
- Document the process for adding new endpoints/tools.
- Auto-generate API docs using Swagger UI or Redoc, served at `/docs`.
- Auto-generate and validate OpenAPI documentation in CI (build must fail if invalid).
- Ensure all served UIs/docs are accessible and support internationalization (a11y best practices).

---

## 6. Observability and Monitoring

- Integrate metrics (Prometheus), distributed tracing (OpenTelemetry), and correlation IDs for all requests.
- Structured logging with log levels and log correlation.
- Health check endpoints beyond `/healthz`.
- Metrics collection and performance monitoring.

---

## 7. Testing, Quality Assurance, and Verification

- Use **Jest** for all tests.
- Minimum 90% code coverage (unit, integration, e2e). **Critical files (handlers, utils, middleware, error handling, streaming logic) must have 100% coverage.**
- All test files must include at least one negative test (failure path) for each handler/middleware.
- All tests must be deterministic and not depend on external services unless mocked.
- All test output must be clean (no console.log or warnings).
- Test coverage and mutation score thresholds must be enforced in CI (e.g., minimum 80% mutation score, fail if lower).
- Test all handlers, middleware, protocol endpoints, tool mapping, security, streams, and schema validation.
- Include `jest --coverage` in scripts.
- Linting/formatting checks with pre-commit hooks (`husky`).
- TypeScript type checking in CI.
- Security scanning (`npm audit --production`, `snyk`).
- **Contract and mutation testing:** Implement contract tests (e.g., Pact) for MCP protocol compatibility and mutation testing (e.g., Stryker) for critical logic.
- **Load/stress testing:** Include load/stress testing scripts (e.g., k6, Artillery) and document performance SLAs.
- CI pipeline must upload build/test artifacts (coverage, mutation, etc.) as downloadable assets.
- CI pipeline must check for uncommitted changes after build/test/lint (to catch auto-fixers).

---

## 8. Development Tools and Scripts

- `package.json` scripts for:
  - `dev`, `build`, `test`, `test:watch`, `lint`, `format`, `docker:build`, `docker:run`
- Use `nodemon`, `ts-node`, `concurrently` for development.
- Auto-generate and publish TypeScript/JavaScript API clients from the OpenAPI spec.

---

## 9. CI/CD Pipeline

- **GitHub Actions** workflow (`.github/workflows/ci.yml`) with:
  - TypeScript compilation
  - Linting/formatting
  - Test/coverage
  - Security scanning
  - Docker build/test (multi-platform: linux/amd64, linux/arm64)
  - Auto-generate and validate OpenAPI docs

---

## 10. Extensibility Framework

- **OpenAPI-to-MCP Tools Pipeline**: Add new tools by editing `config/openapi.json`.
- Auto-generate MCP tool definitions and TypeScript types.
- Provide handler templates and registration system.
- Support tool annotations for metadata.
- Plugin architecture for MCP extensions.
- Middleware system for custom request processing.
- **Plugin/middleware API:** Document and implement a plugin/middleware API with lifecycle hooks (init, pre-request, post-response, error) for extensibility.

---

## 11. Example Files

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
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": { "message": { "type": "string" } }
                }
              }
            }
          },
          "default": {
            "description": "Error response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "object",
                      "properties": {
                        "code": { "type": "string" },
                        "message": { "type": "string" },
                        "details": { "type": "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

- Example `.env.example` (see above).

---

## 12. Security Configuration Examples

- Document input validation, access controls, rate limiting, output sanitization, audit logging, token validation, session security, CORS, and logging/monitoring.
- Enforce least-privilege for all endpoints and service accounts.
- All endpoints must check user roles/permissions.
- Use asymmetric JWT signing (RS256) and support key rotation.
- Store secrets securely using a secrets manager in production.

---

## 13. Container, Deployment, and Infrastructure as Code

- Multi-stage Dockerfile (build/dev and minimal prod).
- Docker Compose with app, Redis (if needed), health checks, env management.
- Deployment scripts for common platforms.
- Container security best practices.
- Specify if Docker image should be multi-arch or target a specific platform.
- **Infrastructure as Code:** Provide IaC scripts (e.g., Terraform, Pulumi) for all deployment environments.

---

## 14. Performance and Monitoring

- Performance monitoring setup.
- Structured logging with log levels and correlation IDs.
- Health check endpoints beyond `/healthz`.
- Metrics collection.
- Scaling considerations.
- Include load/stress testing scripts and document performance SLAs.

---

## 15. Code Quality

- Require JSDoc/TSDoc comments for all exported functions, classes, and modules.
- All code should be self-documenting and follow best practices.
- Mutation testing for critical logic.

---

## Mutation Testing (Stryker)

- Mutation testing is performed using Stryker to ensure test suite quality.
- Run `npx stryker run` to execute mutation tests and generate a report.
- See the README for setup and usage details.

---

## Additional Requirements and Best Practices (Mandatory)

### 1. Badges, Documentation, and Changelog

- Generated README must include build, coverage, and license badges.
- Add a table of contents for easy navigation.
- Provide direct links to API docs (e.g., `/docs` for Swagger UI/Redoc).
- README and API docs must include at least one copy-paste runnable example request and response (curl and TypeScript/Node.js) for every endpoint/tool.
- README must include a “Changelog” or release notes section/file.
- README must include a “License” section and a valid `LICENSE` file.

### 2. Security and Compliance

- Explicitly document all security mitigations: CORS, helmet, rate limiting, input/output validation, JWT validation, session security, secrets management, and audit logging.
- All endpoints must check user roles/permissions (least privilege).
- No stack traces or sensitive info in production error responses.
- Document how to report security issues (README must include a Security Reporting section).
- All secrets in `.env.example` must be clearly marked as example/placeholder and never valid for production.
- All JWT and session secrets must be at least 32 bytes and generated securely.
- All endpoints must return a generic error message for authentication/authorization failures (no user enumeration).
- All dependencies must be checked for known vulnerabilities in CI (`npm audit --production`).

### 3. Testing and Quality

- Minimum 100% code coverage for all critical files (handlers, utils, middleware, error handling, streaming logic).
- All branches and lines in critical files must be covered by tests.
- CI must fail on lint, format, or type errors.
- Include contract and mutation testing for protocol and critical logic.
- All test output must be clean (no console.log or warnings).
- “Test Coverage Report” artifact must be available in CI.

### 4. Extensibility and Upgrades

- Document the process for adding new tools, plugins, or middleware.
- Provide a clear upgrade path for dependencies and OpenAPI specs.
- Require a "How to Upgrade" section in the README, with commands and manual steps.
- Require a “Plugin/Extension Example” in the codebase and README.
- Require a “How to Write a Custom Middleware/Plugin” section in the docs.
- All extension points must be covered by at least one test.

### 5. Docker and Deployment

- Add a quick start for Docker Compose in the README and provide a production-ready `docker-compose.yml` in the project root.
- Multi-stage Dockerfile must use a non-root user and include healthchecks. Provide a production-ready `Dockerfile` in the project root using best practices for Node.js/TypeScript apps (multi-stage build, non-root user, healthcheck, minimal image).
- Document multi-arch builds and deployment best practices.
- Docker images must be scanned for vulnerabilities in CI.
- Docker images must be published with both `latest` and version tags.
- Docker Compose must support both development and production profiles.
- All containers must run as non-root and drop all unnecessary Linux capabilities.
- “Zero Downtime Deployment” note or strategy must be included if relevant.

### 6. Example-Driven Documentation

- README and generated docs must include at least one copy-paste runnable example request and response (curl and TypeScript/Node.js) for all endpoints/tools.
- Provide a minimal but complete example OpenAPI spec, including error schema.
- Inline example `.env` in README for clarity.

### 7. FAQ and Troubleshooting

- Add a FAQ/Troubleshooting section to the README for common issues (Docker, JWT, ports, etc).
- README must include a “Common Pitfalls” and “Support/Contact” section.

### 8. Contributing

- Add a contributing section and reference `CONTRIBUTING.md` if present.

### 9. Observability, Monitoring, and Accessibility

- All logs must include a correlation/request ID.
- Prometheus metrics must be available at `/metrics` and documented.
- All errors must be logged with stack traces in development, but not in production responses.
- README must include a “Monitoring and Alerting” section.
- All served UIs/docs must pass basic a11y checks (axe-core, Lighthouse).
- All user-facing text must be externalized for i18n, or document how to do so.

### 10. Miscellaneous

- All scripts must be documented in `package.json` and README.
- All generated files must include copyright/license headers.

---

---

The resulting project **must be robust, secure, observable, and easily extensible, automatically exposing OpenAPI operations as MCP tools, following all security best practices, and ready for production and CI/CD. All requirements above are mandatory unless otherwise noted.**

---

---
