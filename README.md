# MCP Server – TypeScript/Node.js Production Template

[![Build Status](https://github.com/<your-org>/<your-repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-org>/<your-repo>/actions)
[![Coverage Status](https://coveralls.io/repos/github/<your-org>/<your-repo>/badge.svg?branch=main)](https://coveralls.io/github/<your-org>/<your-repo>?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A production-ready, secure, and extensible MCP server for Node.js/TypeScript, auto-generating MCP tools from OpenAPI specs. Implements best practices for security, streaming, testing, and CI/CD.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Features & Architecture](#features--architecture)
- [Environment Variables Example](#environment-variables-example)
- [API Usage Examples](#api-usage-examples)
- [Security & Best Practices](#security--best-practices)
- [Extending the Server](#extending-the-server)
- [Testing & Quality](#testing--quality)
- [CI/CD & Deployment](#cicd--deployment)
- [Documentation & Diagrams](#documentation--diagrams)
- [Contributing](#contributing)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [License](#license)
- [References](#references)

---

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

---

## Quick Start

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and set values (see below for example).
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_jwt_secret
   ```
3. **Run in development:**
   ```sh
   npm run dev
   ```
4. **Run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
   - The app will be available at http://localhost:3000
   - Healthcheck: http://localhost:3000/healthz
5. **Build for production:**
   ```sh
   npm run build
   ```
6. **Run tests:**
   ```sh
   npm test
   ```

---

## Features & Architecture

- **OpenAPI-to-MCP Tool Mapping:**
  - Auto-generates MCP tool endpoints from `config/openapi.json`.
  - Supports `tools/list`, `tools/call`, and notifications.
- **Streamable HTTP API:**
  - JSON-RPC 2.0 over HTTP
  - Chunked/streamed responses (Node.js streams)
  - Server-Sent Events (SSE) for notifications
  - Resumable streams with secure session management
- **Security:**
  - Bearer token authentication with JWT validation
  - No token passthrough; all tokens must be issued for this server
  - Secure, non-deterministic session IDs (`<user_id>:<session_id>`)
  - Sessions for state only (not authentication)
  - CORS and security headers (helmet.js)
  - Input validation and sanitization everywhere
  - Rate limiting and request size limits
  - Structured logging (Winston or Pino)
  - Robust error handling
- **Health & Monitoring:**
  - `/healthz` endpoint
  - Metrics and performance monitoring (extensible)
- **Configuration:**
  - `.env` with schema validation (zod or joi)
  - Multi-environment support (development, staging, production)
- **Testing & Quality:**
  - Jest with 90%+ code coverage
  - Linting/formatting (eslint, prettier, husky)
  - TypeScript strict mode
  - Security scanning (`npm audit`, `snyk`)
- **CI/CD & Docker:**
  - GitHub Actions workflow for build, lint, test, coverage, security, Docker
  - Multi-stage Dockerfile and Docker Compose
- **Extensibility:**
  - Add new tools by editing `config/openapi.json`
  - Auto-generate TypeScript types and handler templates
  - Plugin/middleware system for custom processing
- **Documentation:**
  - Auto-generated API docs (Swagger UI/Redoc)
  - Mermaid diagrams for flows (see below)
  - Comprehensive security and deployment docs

---

## Environment Variables Example

See `.env.example`:
```
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
```

---

## API Usage Examples

### Health Check
```sh
curl http://localhost:3000/healthz
```

### MCP Tool Call (JSON-RPC 2.0)
```sh
curl -X POST http://localhost:3000/tools/call \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{...},"id":1}'
```

### SSE Notifications
```sh
curl http://localhost:3000/notifications/tools/list_changed -H "Accept: text/event-stream"
```

---

## Security & Best Practices

- JWT Bearer authentication (no passthrough)
- All tokens validated and issued by this server
- Secure session IDs, no session-based auth
- Input validation, sanitization, and output escaping
- CORS and helmet.js for HTTP security
- Rate limiting and request size limits
- Audit logging and error monitoring
- See `PROMPT.md` for full security requirements

---

## Extending the Server

- Add/modify tools in `config/openapi.json`
- Handlers auto-generated and registered
- Plugin/middleware system for custom logic
- See `PROMPT.md` for extensibility framework

---

## Testing & Quality

- Run all tests: `npm test`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint`
- Format: `npm run format`
- Pre-commit hooks: `husky`
- Type checking: `npm run typecheck`

---

## CI/CD & Deployment

- GitHub Actions: `.github/workflows/ci.yml`
- Multi-stage Dockerfile and Docker Compose
- Security scanning and type checking in CI
- Multi-arch Docker builds (linux/amd64, linux/arm64)

---

## Documentation & Diagrams

### Bearer Token Authentication Flow
```mermaid
sequenceDiagram
    participant Client
    participant API as MCP Server
    participant JWT as JWT Validator
    Client->>API: HTTP request with Authorization: Bearer <token>
    API->>JWT: Validate JWT signature & claims
    JWT-->>API: Valid/Invalid
    alt Valid
        API-->>Client: Process request
    else Invalid
        API-->>Client: 401 Unauthorized
    end
```

### OpenAPI-to-MCP Tools Mapping
```mermaid
flowchart TD
    A[openapi.json] --> B[Parse OpenAPI]
    B --> C[Generate MCP Tool Definitions]
    C --> D[Register Tool Endpoints]
    D --> E[Expose /tools/list, /tools/call]
```

### MCP Protocol Message Flow
```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: JSON-RPC 2.0 request (tools/call)
    Server-->>Client: Streamed/Chunked response
    Note right of Server: SSE for notifications
```

### Tool Execution and Response Handling
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Handler
    Client->>Server: tools/call (with params)
    Server->>Handler: Validate & execute tool
    Handler-->>Server: Stream/Result
    Server-->>Client: Streamed/Final response
```

### Container Deployment
```mermaid
flowchart TD
    subgraph Docker Compose
      App[App Container] --env--> Redis[(Redis)]
      App --healthcheck--> Healthz
    end
    App --expose--> Internet
```

### Session Management and Security
```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: Authenticate (JWT)
    Server->>Server: Generate sessionId = userId:random
    Server-->>Client: Set sessionId (state only)
    Note right of Server: No session-based auth
```

---

## Contributing

We welcome contributions! Please open issues or pull requests. To contribute:
- Fork the repo and create a feature branch.
- Run `npm install` and `npm test` to ensure all tests pass.
- Follow the code style (lint/format/typecheck scripts).
- Add/modify tests for your changes.
- See [CONTRIBUTING.md](./CONTRIBUTING.md) if available.

---

## FAQ / Troubleshooting

**Q: Docker Compose fails to start?**
- Ensure `docker-compose.yml` exists in the project root.
- Check for port conflicts (default: 3000).
- Ensure Docker is running and you have permissions.

**Q: JWT errors?**
- Ensure your `.env` has a valid `JWT_SECRET` and matches the signing algorithm.

**Q: How do I access API docs?**
- Visit `/docs` (Swagger UI/Redoc) when the server is running.

---

## License

See [LICENSE](./LICENSE).

---

## References
- [PROMPT.md](./PROMPT.md) – Full requirements and implementation details
- [config/openapi.json](./config/openapi.json) – OpenAPI spec for tool mapping
- [.env.example](./.env.example) – Example environment variables

---

## Mutation Testing with Stryker

This project uses [Stryker](https://stryker-mutator.io/) for mutation testing to ensure the robustness of the test suite.

### Running Mutation Tests

1. Install Stryker and dependencies (if not already installed):
   ```sh
   npm install --save-dev @stryker-mutator/core @stryker-mutator/typescript-checker @stryker-mutator/jest-runner
   ```
2. Run mutation tests:
   ```sh
   npx stryker run
   ```
3. View the mutation report:
   Open the generated HTML report at `reports/mutation/mutation.html` for detailed results.

### Stryker Configuration
- The configuration is in `stryker.conf.js`.
- Thresholds are set to break the build if the mutation score is below 50%.
