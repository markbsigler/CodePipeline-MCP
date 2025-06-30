# MCP Server TypeScript Node Project Generation Prompt

Generate a production-ready TypeScript/Node.js MCP server project with the following best practices and security mitigations:

## Project Structure and Standards
- Use a modular `src/` layout with `src/handlers/`, `src/middleware/`, `src/types/`, and `src/utils/` directories
- Include a `tests/` directory with Jest-based unit and integration tests
- Use `package.json` for dependency management; include separate `devDependencies` section
- Enforce strict TypeScript configuration with `tsconfig.json` and `tsconfig.build.json`
- Include linting/formatting tools (`eslint`, `prettier`, `@typescript-eslint/parser`)
- Provide a multi-stage `Dockerfile` and `docker-compose.yml` with healthcheck endpoint
- Include proper `.gitignore`, `.dockerignore`, and `.env.example` files

## MCP Tools Implementation
- **OpenAPI-to-MCP Tools Mapping**: Automatically convert OpenAPI endpoints to MCP tools:
  - Parse `config/openapi.json` to generate MCP tool definitions
  - Map OpenAPI operation parameters to MCP tool `inputSchema` (JSON Schema)
  - Map OpenAPI responses to MCP tool `outputSchema` (JSON Schema)
  - Generate tool `name` from operationId or path/method combination
  - Extract `description` from OpenAPI operation description
  - Support optional `title` for human-readable tool names
- **MCP Protocol Messages**: Implement required MCP tool endpoints:
  - `tools/list` - List available tools with pagination support
  - `tools/call` - Execute tool calls and return results
  - `notifications/tools/list_changed` - Notify when tools change (if supported)
- **MCP Capabilities Declaration**: Declare `tools` capability with `listChanged` support

## API, Transport, and Security Implementation
- Implement **Streamable HTTP** as the MCP transport with support for:
  - JSON-RPC 2.0 over HTTP for MCP protocol messages
  - Chunked/streamed responses for tool calls using Node.js streams
  - Server-Sent Events (SSE) for real-time updates and notifications
  - Resumable streams with proper session management
- Implement **Bearer token authentication** with JWT validation
- **Security Mitigations** (per MCP Security Best Practices):
  - **NO token passthrough**: All tokens MUST be explicitly issued for this MCP server
  - **Secure session management**: Use cryptographically secure, non-deterministic session IDs
  - **Session binding**: Bind session IDs to user-specific information (`<user_id>:<session_id>` format)
  - **Request verification**: Verify all inbound requests when authorization is implemented
  - **No session-based authentication**: Sessions for state only, not authentication
- Implement **CORS** and security headers (`helmet.js`)
- Include comprehensive input validation and sanitization
- Add rate limiting and request size limits
- Include a `/healthz` endpoint for health checks

## Configuration and Environment
- Support environment variable configuration via `.env` with validation
- Include `config/openapi.json` file for API specification
- Implement configuration schema validation using `joi` or `zod`
- Support multiple environment configurations (development, staging, production)

## Documentation and Architecture
- Add comprehensive `README.md` with:
  - Quick start guide and setup instructions
  - API usage examples with curl and TypeScript/Node.js clients
  - Security configuration guide
  - Docker deployment instructions
- Include **Mermaid architecture diagrams** for:
  - Bearer Token Authentication Flow
  - OpenAPI-to-MCP Tools Mapping Process
  - MCP Protocol Message Flow (`tools/list`, `tools/call`)
  - Tool Execution and Response Handling
  - Container Deployment Architecture
  - Session Management and Security Model
- Document the process for adding new endpoints/tools
- Include API documentation generation using Swagger/OpenAPI tools

## Testing and Quality Assurance
- Implement comprehensive test suite using **Jest** with:
  - Unit tests for all handlers and middleware
  - Integration tests for MCP protocol endpoints (`tools/list`, `tools/call`)
  - OpenAPI-to-MCP tool mapping validation tests
  - Tool execution tests with mock OpenAPI operations
  - Security tests for authentication and authorization
  - Stream processing tests
  - JSON Schema validation tests for tool inputs/outputs
- Include **code coverage** reporting with `jest --coverage`
- Add **linting and formatting** checks with pre-commit hooks using `husky`
- Include **TypeScript type checking** in CI pipeline
- Add **security scanning** with tools like `npm audit` and `snyk`

## Development Tools and Scripts
- Include `package.json` scripts for:
  - `npm run dev` - Development server with hot reload
  - `npm run build` - Production build
  - `npm run test` - Run test suite
  - `npm run test:watch` - Watch mode testing
  - `npm run lint` - Linting
  - `npm run format` - Code formatting
  - `npm run docker:build` - Build Docker image
  - `npm run docker:run` - Run container locally
- Add development tools:
  - `nodemon` for development server
  - `ts-node` for TypeScript execution
  - `concurrently` for running multiple processes

## CI/CD Pipeline
- Include **GitHub Actions** workflow (`.github/workflows/ci.yml`) with:
  - TypeScript compilation check
  - Linting and formatting validation
  - Test execution with coverage reporting
  - Security vulnerability scanning
  - Docker image building and testing
  - Multi-platform Docker builds (linux/amd64, linux/arm64)

## Extensibility Framework
- **OpenAPI-to-MCP Tools Pipeline**: Make it easy to add new tools by:
  - Editing the `config/openapi.json` specification
  - Auto-generating MCP tool definitions from OpenAPI operations
  - Auto-generating TypeScript types from OpenAPI schema
  - Providing tool handler templates and registration system
  - Supporting tool annotations for behavior metadata
- **MCP Tool Features**: Support full MCP tools specification:
  - **Input Validation**: JSON Schema validation for tool parameters
  - **Output Schema**: Define expected response structure for tools
  - **Error Handling**: Both protocol errors (JSON-RPC) and tool execution errors
  - **Content Types**: Support text, image, audio, and resource link responses
  - **Resource Integration**: Embed or link to MCP resources in tool responses
  - **Structured Content**: Return JSON objects with backward-compatible text content
- Include **plugin architecture** for extending MCP functionality
- Provide **middleware system** for custom MCP request processing
- Document **MCP extension patterns** with examples

## Example Implementation
- Provide comprehensive `config/openapi.json` with example operations that map to MCP tools:
  - CRUD operations (GET, POST, PUT, DELETE)
  - Complex operations with multiple parameters
  - Operations returning different content types
  - File upload/download operations
  - Streaming/long-running operations
- Include **example MCP tool handlers** demonstrating:
  - Parameter validation using JSON Schema
  - OpenAPI operation execution
  - Response formatting for MCP (structured + unstructured content)
  - Error handling (protocol vs. execution errors)
  - Resource embedding and linking
- Provide **MCP client examples** in TypeScript showing:
  - Tool discovery via `tools/list`
  - Tool execution via `tools/call`
  - Handling tool responses and errors
  - Working with structured content and resources
- Include **OpenAPI operation mapping examples**:
  - Simple GET operation → MCP tool
  - POST with request body → MCP tool with complex input schema
  - File upload operation → MCP tool with binary content handling
  - Paginated list operation → MCP tool with pagination parameters

## Security Configuration Examples
- Document **MCP tool security** implementation:
  - Input validation for all tool parameters
  - Access controls for tool invocations
  - Rate limiting for tool calls
  - Output sanitization for tool results
  - Audit logging for tool usage
- Document **token validation** setup
- Provide **session security** configuration examples
- Include **CORS configuration** for different environments
- Show **rate limiting** setup for different tool categories
- Document **logging and monitoring** for security events

## Container and Deployment
- **Multi-stage Dockerfile** with:
  - Build stage with full development tools
  - Production stage with minimal runtime
  - Security scanning in build process
- **Docker Compose** setup with:
  - Application container
  - Redis for session storage (if needed)
  - Health check configuration
  - Environment variable management
- Include **deployment scripts** for common platforms
- Document **container security** best practices

## Performance and Monitoring
- Include **performance monitoring** setup
- Add **structured logging** with appropriate log levels
- Implement **health check endpoints** beyond basic `/healthz`
- Include **metrics collection** for monitoring
- Document **scaling considerations** for production deployment

The resulting project should be a robust, secure, and easily extensible TypeScript/Node.js MCP server that automatically exposes OpenAPI operations as MCP tools, follows all security best practices, and can be quickly adapted to new use cases by simply updating the OpenAPI specification. The server should handle the complete MCP tools protocol including discovery, execution, error handling, and notifications.
