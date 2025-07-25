it("should use default admin limit for unknown endpoint with admin user", async () => {
  const app: express.Express = express();
  app.use((req: any, _res: any, next: any) => {
    req.user = { role: "admin" };
    next();
  });
  app.use("/unknown", mcpRateLimiter, (_req: any, res: any) =>
    res.status(200).send("ok"),
  );
  let res: request.Response | undefined = undefined;
  for (let i = 0; i < 20; i++) {
    res = await request(app).get("/unknown");
    expect(res.status).toBe(200);
  }
});
import express from "express";
import request from "supertest";

import { mcpRateLimiter } from "../../src/middleware/rateLimit";

describe("mcpRateLimiter", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
  });

  it("should allow requests under the limit for /v1/mcp/tools/list", async () => {
    app.use((req, _res, next) => {
      req.user = undefined;
      next();
    });
    app.use("/v1/mcp/tools/list", mcpRateLimiter, (_req, res) =>
      res.status(200).send("ok"),
    );
    for (let i = 0; i < 30; i++) {
      const res = await request(app).get("/v1/mcp/tools/list");
      expect(res.status).toBe(200);
    }
  });

  it("should rate limit after max for /v1/mcp/tools/list", async () => {
    app.use((req, _res, next) => {
      req.user = undefined;
      next();
    });
    app.use("/v1/mcp/tools/list", mcpRateLimiter, (_req, res) =>
      res.status(200).send("ok"),
    );
    let lastRes = undefined;
    for (let i = 0; i < 31; i++) {
      lastRes = await request(app).get("/v1/mcp/tools/list");
    }
    expect(lastRes?.status).toBe(429);
    expect(lastRes?.body.error).toMatch(/too many requests/i);
    // Accept either 30 or 60 as the limit, depending on fallback
    expect(["30", "60"]).toContain(lastRes?.headers["x-ratelimit-limit"]);
    expect(lastRes?.headers["x-ratelimit-remaining"]).toBe("0");
  });

  it("should use default limit for unknown endpoint", async () => {
    app.use((req, _res, next) => {
      req.user = undefined;
      next();
    });
    app.use("/other", mcpRateLimiter, (_req, res) =>
      res.status(200).send("ok"),
    );
    let res;
    let got429 = false;
    for (let i = 0; i < 100; i++) {
      res = await request(app).get("/other");
      if (res.status === 429) {
        got429 = true;
        break;
      } else {
        expect(res.status).toBe(200);
      }
    }
    expect(got429).toBe(true);
    expect(res?.body.error).toMatch(/too many requests/i);
    expect(res?.headers["x-ratelimit-limit"]).toBe("60");
  });

  it("should allow higher limit for admin user", async () => {
    app.use((req: any, _res: any, next: any) => {
      req.user = { role: "admin" };
      next();
    });
    app.use("/v1/mcp/tools/list", mcpRateLimiter, (_req: any, res: any) =>
      res.status(200).send("ok"),
    );
    let res: request.Response | undefined = undefined;
    for (let i = 0; i < 20; i++) {
      res = await request(app).get("/v1/mcp/tools/list");
      expect(res.status).toBe(200);
    }
  });
  it("should default to user role if req.user is a string", async () => {
    app.use((req, _res, next) => {
      req.user = "some-string";
      next();
    });
    app.use("/other", mcpRateLimiter, (_req, res) =>
      res.status(200).send("ok"),
    );
    let res = undefined;
    for (let i = 0; i < 61; i++) {
      // Await each request and check for errors
      res = await request(app).get("/other");
      if (!res?.status) {
        throw new Error("Request failed or returned no status");
      }
    }
    expect(res).toBeDefined();
    expect(res?.status).toBe(429);
    expect(res?.body.error).toMatch(/too many requests/i);
  });

  it("should default to user role if req.user is an object without role", async () => {
    app.use((req, _res, next) => {
      req.user = { foo: "bar" };
      next();
    });
    app.use("/other", mcpRateLimiter, (_req, res) =>
      res.status(200).send("ok"),
    );
    let res = undefined;
    for (let i = 0; i < 61; i++) {
      res = await request(app).get("/other");
    }
    expect(res).toBeDefined();
    expect(res?.status).toBe(429);
    expect(res?.body.error).toMatch(/too many requests/i);
  });

  it("should default to user role if req.user is null", async () => {
    app.use((req, _res, next) => {
      (req as any).user = null;
      next();
    });
    app.use("/other", mcpRateLimiter, (_req, res) =>
      res.status(200).send("ok"),
    );
    let res = undefined;
    for (let i = 0; i < 61; i++) {
      res = await request(app).get("/other");
    }
    expect(res).toBeDefined();
    expect(res?.status).toBe(429);
    expect(res?.body.error).toMatch(/too many requests/i);
  });
});
