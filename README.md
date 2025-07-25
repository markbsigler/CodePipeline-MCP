# BMC AMI DevX Code Pipeline MCP Server

[![Build Status](https://github.com/markbsigler/CodePipeline-MCP/actions/workflows/ci.yml/badge.svg)](https://github.com/markbsigler/CodePipeline-MCP/actions)
[![Coverage Status](https://coveralls.io/repos/github/markbsigler/CodePipeline-MCP/badge.svg?branch=main)](https://coveralls.io/github/markbsigler/CodePipeline-MCP?branch=main)
[![Mutation Score](https://img.shields.io/badge/mutation--score-85%25-brightgreen?logo=stryker)](./reports/mutation/mutation.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A production-ready, secure, and extensible MCP server BMC AMI DevX Code Pipeline, auto-generating MCP tools from OpenAPI specs. Implements best practices for security, streaming, testing, and CI/CD.

---

## Table of Contents

<!-- toc -->

- [BMC AMI DevX Code Pipeline MCP Server](#bmc-ami-devx-code-pipeline-mcp-server)
  - [Table of Contents](#table-of-contents)
  - [Features \& Architecture](#features--architecture)
  - [Project Structure](#project-structure)
  - [Quick Start](#quick-start)
  - [VS Code Client Configuration](#vs-code-client-configuration)
  - [API Usage Examples](#api-usage-examples)
    - [Health Check](#health-check)
    - [404/Error Handling Example](#404error-handling-example)
    - [MCP Tool Call (JSON-RPC 2.0)](#mcp-tool-call-json-rpc-20)
    - [SSE Notifications](#sse-notifications)
  - [Security \& Best Practices](#security--best-practices)
  - [Extending the Server](#extending-the-server)
  - [Testing \& Quality](#testing--quality)
    - [Type Safety, Linting, and Test Coverage](#type-safety-linting-and-test-coverage)
    - [Mutation Testing with Stryker](#mutation-testing-with-stryker)
      - [Running Mutation Tests](#running-mutation-tests)
      - [Stryker Configuration](#stryker-configuration)
  - [CI/CD \& Deployment](#cicd--deployment)
  - [Documentation \& Diagrams](#documentation--diagrams)
    - [Bearer Token Authentication Flow](#bearer-token-authentication-flow)
    - [OpenAPI-to-MCP Tools Mapping](#openapi-to-mcp-tools-mapping)
    - [MCP Protocol Message Flow](#mcp-protocol-message-flow)
    - [Tool Execution and Response Handling](#tool-execution-and-response-handling)
    - [Container Deployment \& Observability](#container-deployment--observability)
    - [Session Management and Security](#session-management-and-security)
    - [Rate Limiting Flow](#rate-limiting-flow)
    - [Error Handling Flow](#error-handling-flow)
    - [Observability Pipeline](#observability-pipeline)
    - [JWT Token Lifecycle](#jwt-token-lifecycle)
  - [Advanced Observability](#advanced-observability)
    - [Distributed Tracing with OpenTelemetry](#distributed-tracing-with-opentelemetry)
    - [Metrics and Grafana Dashboards](#metrics-and-grafana-dashboards)
  - [Production Hardening](#production-hardening)
    - [Reverse Proxy and HTTPS](#reverse-proxy-and-https)
    - [Scaling and Resource Limits](#scaling-and-resource-limits)
    - [Environment Hardening](#environment-hardening)
  - [Contributing](#contributing)
  - [FAQ / Troubleshooting](#faq--troubleshooting)
  - [License](#license)
  - [Contact / Support](#contact--support)
  - [API Endpoint Reference](#api-endpoint-reference)
  - [Authentication Guide](#authentication-guide)
  - [Changelog](#changelog)
  - [References](#references)
  - [API Versioning](#api-versioning)
  - [Documentation](#documentation)

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
  - **Strict input validation and sanitization everywhere (including integer enforcement and pattern checks)**
  - Rate limiting and request size limits
  - Structured logging (Winston or Pino)
  - Robust error handling (including 404 and rate limiting responses)
- **Health & Monitoring:**
  - `/healthz` endpoint
  - Metrics and performance monitoring (extensible)
- **Configuration:**
  - `.env` with schema validation (zod or joi)
  - Multi-environment support (development, staging, production)
- **Testing & Quality:**
  - Jest with 90%+ code coverage (**100% for critical logic and edge cases**)
  - Robust integration and edge case test coverage (input validation, error handling, rate limiting, etc.)
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

## Project Structure

```
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

   - The app will be available at [http://localhost:3000](http://localhost:3000)
   - Healthcheck: [http://localhost:3000/healthz](http://localhost:3000/healthz)

5. **Build for production:**

   ```sh
   npm run build
   ```

6. **Run tests:**

   ```sh
   npm test
   ```

---

1. **Obtain a JWT Token:**  
   Use your authentication provider or the server's `/auth/login` endpoint (if enabled):

   ```sh
   # Example: obtain a JWT token (replace with your actual credentials)
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"pass"}'
   ```

---

## VS Code Client Configuration

To connect to this MCP server from VS Code as a client: 2. Add or update the following settings to configure the MCP server endpoint and authentication:

```json
{
  "mcp.serverUrl": "http://localhost:3000/v1",
  "mcp.jwtToken": "<your-jwt-token>"
  // Optionally, set request timeout (in ms)
}
```

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
  - **Strict input validation and sanitization everywhere (including integer enforcement and pattern checks)**
  - Rate limiting and request size limits
  - Structured logging (Winston or Pino)
  - Robust error handling (including 404 and rate limiting responses)
- **Health & Monitoring:**
  - `/healthz` endpoint
  - Metrics and performance monitoring (extensible)
- **Configuration:**
  - `.env` with schema validation (zod or joi)
  - Multi-environment support (development, staging, production)
- **Testing & Quality:**
  - Jest with 90%+ code coverage (**100% for critical logic and edge cases**)
  - Linting/formatting (eslint, prettier, husky)
  - TypeScript strict mode
- **CI/CD & Docker:**
  - GitHub Actions workflow for build, lint, test, coverage, security, Docker
  - Multi-stage Dockerfile and Docker Compose
- **Extensibility:**
  - Add new tools by editing `config/openapi.json`

```env
PORT=3000
JWT_SECRET=your_jwt_secret
```

---

## API Usage Examples

### Health Check

```sh
curl http://localhost:3000/healthz
```

### 404/Error Handling Example

```sh
curl http://localhost:3000/nonexistent
# Returns 404 Not Found with error JSON
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
- **HTTPS is enforced in production via reverse proxy (see Production Hardening).**
- **Secrets and sensitive config are managed via `.env` files. Never commit secrets to version control.**
- See `PROMPT.md` for full security requirements

---

## Extending the Server

- Add/modify tools in `config/openapi.json`
- Handlers auto-generated and registered
- Plugin/middleware system for custom logic
- See `PROMPT.md` for extensibility framework
- **Code generation:** Use the provided scripts/CLI tools (see `scripts/` or `package.json` scripts) to auto-generate TypeScript types and handler templates from OpenAPI specs.

---

## Testing & Quality

### Type Safety, Linting, and Test Coverage

- **Type Safety:** All code and tests are fully type-safe (TypeScript strict mode, no `any` usage, explicit return types everywhere).
- **Lint Compliance:** Zero lint errors and warnings (ESLint, Prettier, Husky pre-commit hooks enforced).
- **Test Suite:** All tests pass (unit, integration, edge cases, error handling, observability, and rate limiting).
- **How to Run:**
  - Run all tests: `npm test`
  - Coverage: `npm run test:coverage`
  - Lint: `npm run lint`
  - Format: `npm run format`
  - Pre-commit hooks: `husky`
  - Type checking: `npm run typecheck`

Recent improvements:

- All code and test files refactored for strict type safety and standards compliance
- All test mocks and assertions updated to match new type-safe return values and code defaults
- Prometheus metrics and observability tests use robust ES module mocking
- 100% passing tests, including logger, observability, and rate limiter edge cases

### Mutation Testing with Stryker

This project uses [Stryker](https://stryker-mutator.io/) for mutation testing to ensure the robustness of the test suite.

#### Running Mutation Tests

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

**Note:** The current mutation score is 85%. All critical logic and edge cases are covered; some low-level error branches and legacy code are not fully covered due to complexity or low risk. See the mutation report for details.

#### Stryker Configuration

- The configuration is in `stryker.conf.js`.
- Thresholds are set to break the build if the mutation score is below 50%.

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
        API->>API: Validate claims (exp, aud, etc)
        alt Claims valid
            API-->>Client: Process request
        else Claims invalid/expired
            API-->>Client: 401 Unauthorized (invalid claims)
        end
    else Invalid
        API-->>Client: 401 Unauthorized (invalid signature)
    end
```

### OpenAPI-to-MCP Tools Mapping

```mermaid
flowchart TD
    A[openapi.json] --> B[Parse OpenAPI]
    B --> C[Generate MCP Tool Definitions]
    C --> D[Generate TypeScript Types]
    D --> E[Generate Handlers]
    E --> F[Register Tool Endpoints]
    F --> G[Expose /tools/list, /tools/call]
```

### MCP Protocol Message Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: JSON-RPC 2.0 request (tools/call)
    alt Success
        Server-->>Client: Streamed/Chunked response
        Note right of Server: SSE for notifications
    else Error
        Server-->>Client: Error response (JSON-RPC error)
    end
```

### Tool Execution and Response Handling

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Handler
    Client->>Server: tools/call (with params)
    Server->>Handler: Validate & execute tool
    alt Success
        Handler-->>Server: Stream/Result
        Server-->>Client: Streamed/Final response
    else Error
        Handler-->>Server: Error/Exception
        Server-->>Client: Error response
    end
```

### Container Deployment & Observability

```mermaid
flowchart TD
    subgraph Docker Compose
      App[App Container] --env--> Redis[(Redis)]
      App --healthcheck--> Healthz
      App --metrics--> Prometheus
      App --traces--> Jaeger
    end
    Prometheus --metrics--> Grafana
    Jaeger --traces--> Grafana
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
    alt Session expired/invalid
        Server-->>Client: 440 Session Expired
    end
```

### Rate Limiting Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: API Request
    Server->>Server: Check Rate Limit
    alt Limit Exceeded
        Server-->>Client: 429 Too Many Requests
    else Allowed
        Server->>Server: Process Request
        Server-->>Client: Response
    end
```

### Error Handling Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Logger
    participant Tracer
    Client->>Server: API Request
    Server->>Server: Validate & Process
    alt Error Occurs
        Server->>Logger: Log Error
        Server->>Tracer: Record Span/Error
        Server-->>Client: Error Response
    else Success
        Server-->>Client: Success Response
    end
```

### Observability Pipeline

```mermaid
flowchart LR
    App -->|Traces| Jaeger
    App -->|Metrics| Prometheus
    Prometheus --> Grafana
    Jaeger --> Grafana
```

### JWT Token Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant AuthServer
    participant API as MCP Server
    User->>AuthServer: Login (username/password)
    AuthServer-->>User: JWT Token
    User->>API: API Request with JWT
    API->>API: Validate JWT (signature, claims)
    alt Valid
        API-->>User: Success
    else Expired/Invalid
        API-->>User: 401 Unauthorized
    end
```

---

## Advanced Observability

### Distributed Tracing with OpenTelemetry

- The server integrates [OpenTelemetry](https://opentelemetry.io/) for distributed tracing.
- Traces are exported in OTLP format and can be sent to Jaeger, Zipkin, or any compatible backend.
- **How to view traces:**
  1. Run a local Jaeger instance:

     ```sh
     docker run -d --name jaeger -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 -p 16686:16686 -p 4317:4317 -p 4318:4318 -p 14268:14268 jaegertracing/all-in-one:latest
     ```

  2. Set `OTEL_EXPORTER_OTLP_ENDPOINT` in your `.env`:

     ```env
     OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
     ```

  3. Start the server and generate traffic.
  4. Open [http://localhost:16686](http://localhost:16686) to view traces.

- **Custom Spans:**
  - The codebase uses custom spans for key operations (tool execution, streaming, error handling).
  - You can add more spans using the OpenTelemetry API in your handlers or middleware.

### Metrics and Grafana Dashboards

- Prometheus metrics are exposed at `/metrics`.
- To visualize metrics in Grafana:
  1. Run Prometheus and Grafana (example Docker Compose):

     ```yaml
     version: "3"
     services:
       prometheus:
         image: prom/prometheus
         volumes:
           - ./prometheus.yml:/etc/prometheus/prometheus.yml
         ports:
           - "9090:9090"
       grafana:
         image: grafana/grafana
         ports:
           - "3001:3000"
     ```

  2. Add a Prometheus data source in Grafana pointing to `http://localhost:9090`.

  3. Import example dashboards (see `docs/grafana/` for JSON files):
     - HTTP request rate, error rate, latency, and custom business metrics.

  4. Example Prometheus scrape config:

     ```yaml
     scrape_configs:
       - job_name: "mcp-server"
         static_configs:
           - targets: ["host.docker.internal:3000"]
     ```

---

## Production Hardening

### Reverse Proxy and HTTPS

- Deploy behind a reverse proxy (e.g., NGINX, Traefik, AWS ALB) for TLS termination, request buffering, and DDoS protection.
- Always use HTTPS in production. Redirect HTTP to HTTPS at the proxy level.
- Example NGINX config:

  ```nginx
  server {
    listen 443 ssl;
    server_name yourdomain.com;
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;
    location / {
      proxy_pass http://localhost:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
  ```

### Scaling and Resource Limits

- Use Docker resource limits or Kubernetes requests/limits to prevent resource exhaustion.
- Run multiple replicas behind a load balancer for high availability.
- Use a process manager (e.g., PM2) or container orchestrator (Kubernetes, ECS) for automatic restarts and health checks.
- Monitor memory and CPU usage; set alerts for abnormal patterns.

### Environment Hardening

- Set `NODE_ENV=production` in production environments.
- Use strong, unique secrets for `JWT_SECRET` and other credentials.
- Restrict network access to the app and database (firewalls, security groups).
- Regularly update dependencies and run `npm audit`/`snyk` scans.
- Enable logging and log rotation; forward logs to a centralized system (e.g., ELK, Datadog).
- Disable or restrict `/docs` and other debug endpoints in production if not needed.
- Review and restrict CORS origins to trusted domains only.

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

This project is licensed under the [MIT License](./LICENSE).

---

## Contact / Support

- Open an [issue](https://github.com/markbsigler/CodePipeline-MCP/issues)
- Join the discussion on [GitHub Discussions](https://github.com/markbsigler/CodePipeline-MCP/discussions)
- Email: <mark.sigler@protonmail.com>

```sh
curl -X POST http://localhost:3000/v1/tools/call \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"method":"toolName","params":{"key":"value"}}'
```

If the changelog is not up to date, see the GitHub Releases page for the latest information.

Replace `<your-jwt-token>` with a valid token (see [Security & Best Practices](#security--best-practices)).

---

## API Endpoint Reference

| Endpoint            | Method | Description                          |
| ------------------- | ------ | ------------------------------------ |
| `/v1/tools/list`    | POST   | List available MCP tools             |
| `/v1/tools/call`    | POST   | Call a specific MCP tool             |
| `/v1/notifications` | GET    | Stream notifications (SSE)           |
| `/healthz`          | GET    | Health check (liveness probe)        |
| `/metrics`          | GET    | Prometheus metrics for monitoring    |
| `/docs`             | GET    | API documentation (Swagger/Redoc UI) |

See the [OpenAPI spec](./config/openapi.json) or [Swagger UI](/docs) for full details and try-it-out functionality.

---

## Authentication Guide

1. **Obtain a JWT Token:**  
   Use your authentication provider or the server's `/auth/login` endpoint (if enabled):

   ```sh
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"pass"}'
   ```

   The response will include a JWT token.

2. **Use the Token:**  
   Add the token to the `Authorization` header for all API requests:

   ```text
   Authorization: Bearer <your-jwt-token>
   ```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes and recent changes.

---

## References

- [PROMPT.md](./PROMPT.md) – Full requirements and implementation details
- [config/openapi.json](./config/openapi.json) – OpenAPI spec for tool mapping
- [.env.example](./.env.example) – Example environment variables

---

## API Versioning

- All endpoints are now available under `/v1/` (e.g., `/v1/mcp/tools/list`). Legacy unversioned endpoints are still available for backward compatibility but will be deprecated.

---

## Documentation

- `/docs` always serves the latest OpenAPI spec and is updated with usage examples and error response schemas.
