import {
  jsonSchemaToTypeScriptType,
  jsonSchemaTypeToTs,
  extractMcpToolsFromOpenApi,
} from "../../src/utils/openapi-to-mcp";

describe("jsonSchemaToTypeScriptType", () => {
  it("handles array schema", () => {
    const schema = { type: "array", items: { type: "string" } };
    const result = jsonSchemaToTypeScriptType(schema, "MyArray");
    expect(result).toContain("string[]");
  });

  it("handles object with properties", () => {
    const schema = {
      type: "object",
      properties: { foo: { type: "string" }, bar: { type: "number" } },
      required: ["foo"],
    };
    const ts = jsonSchemaToTypeScriptType(schema, "MyObj");
    expect(ts).toContain("foo");
    expect(ts).toContain("bar");
    expect(ts).toContain("string");
    expect(ts).toContain("number");
  });

  it("returns any type for undefined or non-object schema", () => {
    expect(jsonSchemaToTypeScriptType(undefined, "Test")).toBe(
      "type Test = unknown;",
    );
    expect(jsonSchemaToTypeScriptType("string", "Test")).toBe(
      "type Test = unknown;",
    );
  });
});

describe("jsonSchemaTypeToTs", () => {
  it("returns string for string schema", () => {
    expect(jsonSchemaTypeToTs({ type: "string" })).toBe("string");
  });
  it("returns number for number/integer schema", () => {
    expect(jsonSchemaTypeToTs({ type: "number" })).toBe("number");
    expect(jsonSchemaTypeToTs({ type: "integer" })).toBe("number");
  });
  it("returns boolean for boolean schema", () => {
    expect(jsonSchemaTypeToTs({ type: "boolean" })).toBe("boolean");
  });
  it("returns array type for array schema", () => {
    expect(
      jsonSchemaTypeToTs({ type: "array", items: { type: "string" } }),
    ).toBe("string[]");
    expect(
      jsonSchemaTypeToTs({ type: "array", items: { type: "number" } }),
    ).toBe("number[]");
  });
  it("returns object type for object schema with properties", () => {
    expect(
      jsonSchemaTypeToTs({
        type: "object",
        properties: { foo: { type: "string" }, bar: { type: "number" } },
      }),
    ).toBe("{ foo: string; bar: number }");
  });
  it("returns any for unknown or missing schema", () => {
    expect(jsonSchemaTypeToTs(undefined)).toBe("unknown");
    expect(jsonSchemaTypeToTs({})).toBe("unknown");
  });
});

describe("extractMcpToolsFromOpenApi", () => {
  it("handles param.required falsy in extractMcpToolsFromOpenApi", () => {
    const openapi = {
      paths: {
        "/foo": {
          post: {
            operationId: "testTool",
            parameters: [
              { name: "bar", schema: { type: "string" } }, // no required field
            ],
            responses: {
              "200": {
                content: { "application/json": { schema: { type: "string" } } },
              },
            },
          },
        },
      },
    };
    const tools = extractMcpToolsFromOpenApi(openapi) as any[];
    expect(tools[0].inputSchema.required).toEqual([]);
    expect(tools[0].inputSchema.properties).toHaveProperty("bar");
  });

  it("handles missing description and summary in extractMcpToolsFromOpenApi", () => {
    const openapi = {
      paths: {
        "/bar": {
          get: {
            operationId: "noDesc",
            parameters: [],
            responses: {
              "200": {
                content: { "application/json": { schema: { type: "string" } } },
              },
            },
          },
        },
      },
    };
    const tools = extractMcpToolsFromOpenApi(openapi) as any[];
    expect(tools[0].description).toBe("");
  });
});
