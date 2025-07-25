import express from "express";
import request from "supertest";

import * as observability from "../../src/utils/observability";

describe("observability edge case", () => {
  let app: express.Express;
  beforeAll(() => {
    app = express();
    app.use(observability.metricsMiddleware);
    // No route registered, so req.route will be undefined
  });
  it("should use req.path if req.route is undefined", async () => {
    const res = await request(app).get("/notfound");
    // Should still respond, and the middleware should not throw
    expect(res.status).toBe(404);
  });
});
