// Mock prom-client before importing code under test
/* eslint-disable no-unused-vars */
// Mock prom-client before importing code under test
class MockCounter {
  inc = jest.fn();
}
jest.doMock("prom-client", () => ({
  __esModule: true,
  Counter: MockCounter,
  default: {},
  register: {
    contentType: "text/plain; version=0.0.4; charset=utf-8",
    metrics: jest.fn().mockResolvedValue("my_metrics"),
  },
}));
import {
  httpRequestCounter,
  metricsMiddleware,
  exposePrometheusMetrics,
} from "utils/observability";

describe("httpRequestCounter", () => {
  it("should be a prom-client Counter", () => {
    expect(httpRequestCounter).toHaveProperty("inc");
    expect(typeof httpRequestCounter.inc).toBe("function");
  });
});

describe("metricsMiddleware", () => {
  it("should call next and increment counter on finish", () => {
    const req: any = { method: "GET", route: { path: "/foo" } };
    const res: any = {
      statusCode: 200,
      on: jest.fn((event, cb) => {
        if (event === "finish") {
          cb();
        }
      }),
    };
    const next = jest.fn();
    const incSpy = jest
      .spyOn(httpRequestCounter, "inc")
      .mockImplementation(() => {});
    metricsMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(incSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "GET", route: "/foo", status: 200 }),
    );
    incSpy.mockRestore();
  });
});

describe("metricsMiddleware edge cases", () => {
  it("should use req.path if req.route is undefined", () => {
    const req: any = { method: "POST", path: "/bar" };
    const res: any = {
      statusCode: 404,
      on: jest.fn((event, cb) => {
        if (event === "finish") {
          cb();
        }
      }),
    };
    const next = jest.fn();
    const incSpy = jest
      .spyOn(httpRequestCounter, "inc")
      .mockImplementation(() => {});
    metricsMiddleware(req, res, next);
    expect(incSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", route: "/bar", status: 404 }),
    );
    incSpy.mockRestore();
  });
  it("should not call inc if finish is never emitted", () => {
    const req: any = { method: "GET", route: { path: "/never" } };
    const res: any = { statusCode: 500, on: jest.fn() };
    const next = jest.fn();
    const incSpy = jest
      .spyOn(httpRequestCounter, "inc")
      .mockImplementation(() => {});
    metricsMiddleware(req, res, next);
    expect(incSpy).not.toHaveBeenCalled();
    incSpy.mockRestore();
  });
});

describe("exposePrometheusMetrics", () => {
  it("should add /metrics route to app", async () => {
    const app: any = { get: jest.fn() };
    exposePrometheusMetrics(app);
    expect(app.get).toHaveBeenCalledWith("/metrics", expect.any(Function));
  });
});

describe("exposePrometheusMetrics handler", () => {
  it("should set content-type and end with metrics", async () => {
    const fakeMetrics = "my_metrics";
    const app: any = {
      get: jest.fn((route, handler) => {
        app._handler = handler;
      }),
    };
    exposePrometheusMetrics(app);
    const res: any = { set: jest.fn(), end: jest.fn() };
    jest.resetModules();
    jest.doMock("prom-client", () => ({
      __esModule: true,
      default: {},
      register: {
        contentType: "text/plain",
        metrics: jest.fn().mockResolvedValue(fakeMetrics),
      },
    }));
    // Re-import after mocking

    const promClient = await import("prom-client");
    await app._handler({}, res);
    expect(res.set).toHaveBeenCalledWith(
      "Content-Type",
      "text/plain; version=0.0.4; charset=utf-8",
    );
    expect(res.end).toHaveBeenCalledWith(fakeMetrics);
    jest.dontMock("prom-client");
  });
});
