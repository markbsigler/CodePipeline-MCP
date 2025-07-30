# API Usage Examples

This guide provides practical examples for interacting with the MCP server API.

## Health Check

```sh
curl http://localhost:3000/healthz
```

## 404/Error Handling Example

```sh
curl http://localhost:3000/nonexistent
# Returns 404 Not Found with error JSON
```

## MCP Tool Call (JSON-RPC 2.0)

```sh
curl -X POST http://localhost:3000/tools/call \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{...},"id":1}'
```

## SSE Notifications

```sh
curl http://localhost:3000/notifications/tools/list_changed -H "Accept: text/event-stream"
```

## Authentication Guide

1. **Obtain a JWT Token:**
   Use your authentication provider or the server's `/auth/login` endpoint (if enabled):

   ```sh
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"pass"}'
   ```

2. **Use the Token:**
   Add the token to the `Authorization` header for all API requests:

   ```text
   Authorization: Bearer <your-jwt-token>
   ```

See README and OpenAPI spec for more details.
