// Mock @opentelemetry/sdk-node before importing observability
jest.mock('@opentelemetry/sdk-node', () => {
  return {
    NodeSDK: jest.fn(() => {
      throw new Error('fail');
    }),
  };
});

import * as observability from '../../src/utils/observability';

describe('initObservability', () => {
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetModules();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('should log and not throw if NodeSDK throws', () => {
    expect(() => observability.initObservability()).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to initialize observability:',
      expect.any(Error),
    );
  });
});
