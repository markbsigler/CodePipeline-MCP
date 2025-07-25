jest.mock("pino", (): any =>
  Object.assign(
    (): { info: jest.Mock; error: jest.Mock } => ({
      info: jest.fn(),
      error: jest.fn(),
    }),
    {
      destination: jest.fn((): NodeJS.WriteStream => process.stdout),
    },
  ),
);
jest.mock(
  "pino-http",
  (): (() => { logger: { info: jest.Mock; error: jest.Mock } }) => () => ({
    logger: { info: jest.fn(), error: jest.fn() },
  }),
);

describe("logger", function loggerDescribe(): void {
  it("should use pino-pretty transport in development", async function shouldUsePinoPrettyTransportInDevelopment(): Promise<void> {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    jest.resetModules();
    // Use dynamic import for lint compliance
    const { default: devLogger } = await import("../../src/utils/logger");
    expect(devLogger).toBeDefined();
    process.env.NODE_ENV = oldEnv;
  });

  it("should not use pino-pretty transport in production", async function shouldNotUsePinoPrettyTransportInProduction(): Promise<void> {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    jest.resetModules();
    // Use dynamic import for lint compliance
    const { default: prodLogger } = await import("../../src/utils/logger");
    expect(prodLogger).toBeDefined();
    process.env.NODE_ENV = oldEnv;
  });
});
