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

## Example OpenAPI Specification

The project uses OpenAPI to MCP tool mapping. Here is the sample `config/openapi.json`:

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

## Environment Variables Example

See `.env.example` for required environment variables:

```
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
```

## Key Features
- Modular TypeScript structure
- OpenAPI-driven MCP tool generation
- Strict TypeScript, linting, and formatting
- Comprehensive testing with Jest
- Secure authentication and session management
- Docker and Docker Compose support
- CI/CD ready with GitHub Actions

For full requirements and implementation details, see `PROMPT.md`.
