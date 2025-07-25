jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
import { verify } from "jsonwebtoken";
import { authenticateJWT } from "middleware/auth";

describe("authenticateJWT", () => {
  let req: any, res: any, next: any;
  const OLD_ENV = process.env;

  beforeEach(() => {
    req = { headers: {}, user: undefined };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    process.env = {
      ...OLD_ENV,
      JWT_SECRET: "changeme",
      JWT_ISSUER: "codepipeline-mcp-server",
      NODE_ENV: "test",
    };
  });
  afterEach(() => {
    process.env = OLD_ENV;
    jest.clearAllMocks();
  });

  it("should return 401 if no Authorization header", () => {
    authenticateJWT(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/authorization/i),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if Authorization header is not Bearer", () => {
    req.headers["authorization"] = "Basic abc";
    authenticateJWT(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/authorization/i),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and set req.user if token is valid", () => {
    req.headers["authorization"] = "Bearer validtoken";
    const payload = { sub: "user1" };
    (verify as jest.Mock).mockReturnValue(payload);
    authenticateJWT(req, res, next);
    expect(verify).toHaveBeenCalledWith("validtoken", "changeme", {
      issuer: "codepipeline-mcp-server",
    });
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 and not call next if token is invalid", () => {
    req.headers["authorization"] = "Bearer invalidtoken";
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error("bad token");
    });
    authenticateJWT(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/token/i),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should log error if not in test env", async () => {
    process.env.NODE_ENV = "production";
    req.headers["authorization"] = "Bearer invalidtoken";
    // Dynamically import logger to avoid hoisting issues
    const { default: logger } = await import("../../../src/utils/logger");
    const spy = jest.spyOn(logger, "error").mockImplementation(() => {});
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error("bad token");
    });
    authenticateJWT(req, res, next);
    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/JWT authentication error/),
      expect.any(Error),
    );
    spy.mockRestore();
  });
});
