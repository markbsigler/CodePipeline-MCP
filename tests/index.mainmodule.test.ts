describe("main module startup", function mainModuleStartup(): void {
  it("should not throw when required as a module", async function shouldNotThrowWhenRequiredAsModule(): Promise<void> {
    await expect(async function expectBlock(): Promise<void> {
      // Simulate requiring as a module (not main)
      jest.resetModules();
      jest.doMock("express", function expressMock(): () => {
        use: jest.Mock<void, any[]>;
        get: jest.Mock<void, any[]>;
        post: jest.Mock<void, any[]>;
        listen: jest.Mock<void, any[]>;
      } {
        return () => ({
          use: jest.fn<void, any[]>(),
          get: jest.fn<void, any[]>(),
          post: jest.fn<void, any[]>(),
          listen: jest.fn<void, any[]>(),
        });
      });
      jest.doMock("../src/utils/openapi-to-mcp", function openapiToMcpMock(): {
        loadOpenApiSpec: jest.Mock<object, any[]>;
        extractMcpToolsFromOpenApi: jest.Mock<any[], any[]>;
      } {
        return {
          loadOpenApiSpec: jest.fn<object, any[]>(() => ({})),
          extractMcpToolsFromOpenApi: jest.fn<any[], any[]>(() => []),
        };
      });
      jest.doMock("../src/handlers/mcpHandlers", function mcpHandlersMock(): {
        toolsListHandler: jest.Mock<jest.Mock, any[]>;
        toolsCallHandler: jest.Mock<jest.Mock, any[]>;
        notificationsListChangedHandler: jest.Mock<jest.Mock, any[]>;
      } {
        return {
          toolsListHandler: jest.fn<jest.Mock, any[]>(() => jest.fn()),
          toolsCallHandler: jest.fn<jest.Mock, any[]>(() => jest.fn()),
          notificationsListChangedHandler: jest.fn<jest.Mock, any[]>(() =>
            jest.fn(),
          ),
        };
      });
      jest.doMock("../src/middleware/auth", function authMock(): {
        authenticateJWT: jest.Mock;
      } {
        return {
          authenticateJWT: jest.fn(),
        };
      });
      jest.doMock("../src/middleware/rateLimit", function rateLimitMock(): {
        mcpRateLimiter: jest.Mock;
      } {
        return {
          mcpRateLimiter: jest.fn(),
        };
      });
      jest.doMock("../src/middleware/session", function sessionMock(): {
        sessionMiddleware: jest.Mock;
      } {
        return {
          sessionMiddleware: jest.fn(),
        };
      });
      jest.doMock(
        "../src/middleware/errorHandler",
        function errorHandlerMock(): { errorHandler: jest.Mock } {
          return {
            errorHandler: jest.fn(),
          };
        },
      );
      jest.doMock(
        "../src/middleware/requestLogger",
        function requestLoggerMock(): { requestLogger: jest.Mock } {
          return {
            requestLogger: jest.fn(),
          };
        },
      );
      await import("../src/index");
    }).not.toThrow();
  });
});
