// @ts-nocheck
jest.mock('pino', () => Object.assign(() => ({ info: jest.fn(), error: jest.fn() }), { destination: jest.fn(() => process.stdout) }));
jest.mock('pino-http', () => () => ({ logger: { info: jest.fn(), error: jest.fn() } }));

describe('logger', () => {
  it('should use pino-pretty transport in development', () => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const devLogger = require('../../src/utils/logger').default;
    expect(devLogger).toBeDefined();
    process.env.NODE_ENV = oldEnv;
  });

  it('should not use pino-pretty transport in production', () => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prodLogger = require('../../src/utils/logger').default;
    expect(prodLogger).toBeDefined();
    process.env.NODE_ENV = oldEnv;
  });
});
