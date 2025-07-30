# Architecture Overview

This document provides a high-level overview of the MCP server architecture, including diagrams and explanations of key flows.

## System Diagram

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

## Authentication Flow

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

## Tool Mapping Flow

```mermaid
flowchart TD
    A[openapi.json] --> B[Parse OpenAPI]
    B --> C[Generate MCP Tool Definitions]
    C --> D[Generate TypeScript Types]
    D --> E[Generate Handlers]
    E --> F[Register Tool Endpoints]
    F --> G[Expose /tools/list, /tools/call]
```

See README for more diagrams and details.
