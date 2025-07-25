
# BMC AMI DevX Code Pipeline MCP Server - EARS Requirements (Comprehensive)


## 1. System Overview Requirements

**REQ-001**: The system SHALL be a production-ready, secure, observable, and extensible MCP server for BMC AMI DevX Code Pipeline, following all best practices for Node.js, TypeScript, and Express.

**REQ-002**: The system SHALL auto-generate MCP tool endpoints, TypeScript types, and handler templates from OpenAPI specifications in `config/openapi.json`.

**REQ-003**: The system SHALL implement best practices for security, streaming, error handling, observability, testing, CI/CD, and documentation, as described in the project README and PROMPT.


## 2. Configuration and Environment Requirements

**REQ-004**: WHEN the system starts, it SHALL validate all environment variables using schema validation (zod or joi) and support multi-environment configurations (development, staging, production).

**REQ-005**: WHEN the system starts, it SHALL use flat config ESLint configuration (`eslint.config.js`) and Prettier for formatting, enforcing zero lint errors and warnings.

**REQ-006**: WHEN running tests, the system SHALL use Jest configuration in `jest.config.cjs` and enforce 90%+ code coverage, with 100% for critical logic and edge cases.

**REQ-007**: WHEN testing logger functionality, the system SHALL mock both `pino` and `pino-http` to avoid file descriptor errors.

**REQ-008**: WHEN the system is deployed, it SHALL include observability (OpenTelemetry, Prometheus) and rate limiting middleware in the Express app.


## 3. OpenAPI-to-MCP Tool Mapping Requirements

**REQ-009**: WHEN the system processes OpenAPI specifications, it SHALL auto-generate MCP tool endpoints, TypeScript types, and handler templates from `config/openapi.json`.

**REQ-010**: The system SHALL support `tools/list` (with pagination), `tools/call`, and notifications endpoints, and declare `tools` capability with `listChanged` support.

**REQ-011**: WHEN a new tool is added to `config/openapi.json`, the system SHALL automatically generate and register TypeScript types and handler templates, and update API documentation.

**REQ-012**: The system SHALL auto-generate and publish TypeScript/JavaScript API clients from the OpenAPI spec, and validate the spec in CI.


## 4. HTTP API and Protocol Requirements

**REQ-013**: The system SHALL implement JSON-RPC 2.0 over HTTP protocol for all tool calls.

**REQ-014**: WHEN handling responses, the system SHALL support chunked/streamed responses using Node.js streams, and provide robust error handling and recovery for streaming failures.

**REQ-015**: WHEN providing notifications, the system SHALL use Server-Sent Events (SSE) and support resumable streams with secure session management.

**REQ-016**: The system SHALL provide versioned endpoints under `/v1/` prefix, and maintain backward compatibility for legacy endpoints.

**REQ-017**: The system SHALL conform to a standard JSON error schema (`code`, `message`, `details`) for all error responses, and document this schema in OpenAPI and README.


## 5. Security and Compliance Requirements

**REQ-018**: WHEN a client makes a request, the system SHALL authenticate using Bearer token authentication with JWT validation (RS256, key rotation support), and SHALL NOT allow token passthrough; all tokens MUST be issued for this server.

**REQ-019**: WHEN creating sessions, the system SHALL generate secure, non-deterministic session IDs in format `<user_id>:<session_id>`, and use sessions for state management only, NOT for authentication.

**REQ-020**: WHEN processing requests, the system SHALL implement CORS and security headers using helmet.js, and restrict CORS origins to trusted domains in production.

**REQ-021**: WHEN validating input, the system SHALL perform strict input validation and sanitization everywhere, including integer enforcement, pattern checks, and output escaping.

**REQ-022**: WHEN handling requests, the system SHALL implement rate limiting and request size limits, and track limits per client/IP address.

**REQ-023**: WHEN logging events, the system SHALL use structured logging (Winston or Pino), include correlation/request IDs, and forward logs to centralized logging in production.

**REQ-024**: WHEN errors occur, the system SHALL provide robust error handling, including 404, 429, 440, and rate limiting responses, and SHALL NOT leak stack traces or sensitive info in production.

**REQ-025**: The system SHALL store secrets securely using a secrets manager in production, and all JWT/session secrets MUST be at least 32 bytes and generated securely.


## 6. Authentication and Authorization Flow Requirements

**REQ-026**: WHEN a client sends a request with Authorization header, the system SHALL validate JWT signature and claims, and return 401 Unauthorized with a generic error message if validation fails (no user enumeration).

**REQ-027**: IF JWT claims are invalid or expired, the system SHALL return 401 Unauthorized with an appropriate error message.

**REQ-028**: IF JWT is valid, the system SHALL process the request normally, and check user roles/permissions for all endpoints (least privilege).


## 7. Health, Monitoring, and Observability Requirements

**REQ-029**: The system SHALL provide a `/healthz` endpoint for health checks, and expose Prometheus-compatible metrics at `/metrics` for monitoring.

**REQ-030**: WHEN running, the system SHALL provide performance monitoring, distributed tracing (OpenTelemetry), and log all errors and spans for observability.

**REQ-031**: The system SHALL provide a "Monitoring and Alerting" section in documentation, and all logs must include correlation/request IDs.


## 8. Configuration Management Requirements

**REQ-032**: WHEN starting, the system SHALL validate environment variables using schema validation (zod or joi), and support multi-environment configurations (development, staging, production).

**REQ-033**: WHEN in production, the system SHALL set `NODE_ENV=production` and restrict debug endpoints.


## 9. Testing, Quality Assurance, and Verification Requirements

**REQ-034**: The system SHALL maintain 90%+ code coverage with Jest, and 100% for all critical files (handlers, utils, middleware, error handling, streaming logic).

**REQ-035**: The system SHALL include robust integration, edge case, and negative test coverage for input validation, error handling, and rate limiting.

**REQ-036**: WHEN code is committed, the system SHALL enforce linting and formatting using eslint, prettier, and husky, and fail CI on any errors.

**REQ-037**: The system SHALL use TypeScript strict mode for type checking, and all code and tests must be fully type-safe.

**REQ-038**: WHEN building, the system SHALL perform security scanning using `npm audit --production` and `snyk`, and fail the build on vulnerabilities.

**REQ-039**: The system SHALL include contract and mutation testing (Stryker) for protocol and critical logic, and upload coverage/mutation reports as CI artifacts.


## 10. Mutation Testing Requirements

**REQ-040**: WHEN running mutation tests, the system SHALL use Stryker for mutation testing, and break the build if the mutation score is below 50%.

**REQ-041**: WHEN mutation tests complete, the system SHALL generate HTML reports at `reports/mutation/mutation.html` and upload them as CI artifacts.


## 11. API Endpoint and Documentation Requirements

**REQ-042**: The system SHALL provide `/v1/tools/list` (POST), `/v1/tools/call` (POST), `/v1/notifications` (GET, SSE), `/healthz` (GET), `/metrics` (GET), and `/docs` (GET, Swagger/Redoc UI) endpoints.

**REQ-043**: WHEN a client requests a non-existent endpoint, the system SHALL return 404 Not Found with a standard error JSON.

**REQ-044**: The system SHALL auto-generate and serve up-to-date API documentation, including example requests/responses, error schemas, and usage examples for every endpoint/tool.


## 12. Rate Limiting Requirements

**REQ-045**: WHEN a client exceeds rate limits, the system SHALL return 429 Too Many Requests, and allow requests within configured limits, tracking limits per client/IP address.


## 13. Session Management Requirements

**REQ-046**: WHEN a client authenticates with JWT, the system SHALL generate sessionId as userId:random, and use sessions for state management only.

**REQ-047**: WHEN a session expires or becomes invalid, the system SHALL return 440 Session Expired.


## 14. Error Handling Requirements

**REQ-048**: WHEN an error occurs, the system SHALL log the error with structured logging, record spans/errors in distributed tracing, and return appropriate HTTP status codes and error messages using the standard error schema.


## 15. Streaming Requirements

**REQ-049**: WHEN handling tool calls, the system SHALL support streaming responses for large datasets, provide graceful error handling and recovery for streaming failures, and maintain state using secure session management for resumable streams.


## 16. Docker, Deployment, and Infrastructure Requirements

**REQ-050**: The system SHALL provide a production-ready multi-stage Dockerfile (non-root user, healthcheck, minimal image) and Docker Compose configuration for local development and production.

**REQ-051**: WHEN building Docker images, the system SHALL support multi-arch builds (linux/amd64, linux/arm64), scan images for vulnerabilities in CI, and publish with both `latest` and version tags.

**REQ-052**: WHEN deployed, the system SHALL run health checks on container startup, enforce resource limits, and support zero-downtime deployment strategies.


## 17. CI/CD Pipeline Requirements

**REQ-053**: WHEN code is pushed, the system SHALL trigger GitHub Actions workflow for build, lint, test, coverage, mutation, security, and Docker builds, and fail the build on any errors or vulnerabilities.

**REQ-054**: WHEN tests or security scans fail, the system SHALL prevent deployment to production.

**REQ-055**: The CI pipeline SHALL upload build/test artifacts (coverage, mutation, etc.) as downloadable assets, and check for uncommitted changes after build/test/lint.


## 18. Observability, Monitoring, and Accessibility Requirements

**REQ-056**: WHEN processing requests, the system SHALL generate distributed traces using OpenTelemetry, support OTLP format for Jaeger/Zipkin, and expose Prometheus-compatible metrics.

**REQ-057**: WHEN tracing operations, the system SHALL create custom spans for key operations (tool execution, streaming, error handling), and all logs must include correlation/request IDs.

**REQ-058**: All served UIs/docs SHALL pass basic accessibility (a11y) checks and support internationalization (i18n) or document how to do so.


## 19. Production Hardening and Security Requirements

**REQ-059**: WHEN deployed in production, the system SHALL run behind a reverse proxy for TLS termination, redirect HTTP to HTTPS at the proxy level, and restrict network access to trusted sources.

**REQ-060**: WHEN scaling, the system SHALL support multiple replicas behind a load balancer, and enforce Docker/Kubernetes resource limits.

**REQ-061**: WHEN storing secrets, the system SHALL use strong, unique secrets for JWT_SECRET and all credentials, and never commit secrets to version control.


## 20. Input Validation and Error Schema Requirements

**REQ-062**: WHEN receiving API requests, the system SHALL validate all input parameters against defined schemas, enforce integer type validation, apply pattern checks and sanitization, and return 400 Bad Request with detailed error messages using the standard error schema.


## 21. Logging and Audit Requirements

**REQ-063**: WHEN events occur, the system SHALL log structured messages with appropriate log levels, include full error details (stack traces in development), and implement log rotation to prevent disk space issues.

**REQ-064**: WHEN in production, the system SHALL forward logs to centralized logging systems, and redact sensitive information from logs.


## 22. API Versioning and Deprecation Requirements

**REQ-065**: WHEN serving API endpoints, the system SHALL provide versioned endpoints under `/v1/` prefix, support legacy endpoints for backward compatibility, and provide migration notices and timelines for deprecated endpoints.


## 23. Documentation and Example Requirements

**REQ-066**: WHEN serving documentation, the system SHALL provide interactive API docs via Swagger UI/Redoc at `/docs`, and update OpenAPI specifications automatically.

**REQ-067**: All documentation SHALL include usage examples (curl, TypeScript/Node.js) and error response schemas for every endpoint/tool, and provide a "How to Upgrade" section for dependencies and OpenAPI spec changes.

**REQ-068**: The README SHALL include a project structure overview, FAQ/Troubleshooting, Common Pitfalls, Support/Contact, Changelog, and License sections.


## 24. Extensibility and Plugin Requirements

**REQ-069**: WHEN extending functionality, the system SHALL support a documented plugin/middleware system for custom processing, with lifecycle hooks (init, pre-request, post-response, error).

**REQ-070**: WHEN adding or modifying tools, the system SHALL auto-generate handlers and TypeScript types from OpenAPI specifications, and update documentation and tests accordingly.


## 25. Environment-Specific Requirements

**REQ-071**: WHEN running in development, the system SHALL enable debug logging and hot reloading.

**REQ-072**: WHEN running in staging, the system SHALL mirror production configuration with test data.

**REQ-073**: WHEN running in production, the system SHALL disable debug endpoints and enable all security hardening features.


## 26. JWT Token Lifecycle Requirements

**REQ-074**: WHEN a user logs in, the authentication server SHALL issue a JWT token, and the system SHALL validate signature and claims before processing requests.

**REQ-075**: WHEN a JWT token expires, the system SHALL return 401 Unauthorized and require re-authentication.


## 27. Backup, Recovery, and Reliability Requirements

**REQ-076**: WHEN system data exists, the system SHALL provide mechanisms for data backup and recovery, and support automatic restarts and health checks via process managers or orchestrators.

---

**End of Comprehensive EARS Requirements**
