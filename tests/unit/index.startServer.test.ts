

describe('startServer', () => {
  let listenSpy: jest.SpyInstance;
  let mockApp: any;

  beforeEach(() => {
    jest.resetModules();
    mockApp = { listen: jest.fn((port, cb) => cb && cb()) };
    jest.doMock('../../src/index', () => {
      const actual = jest.requireActual('../../src/index');
      return {
        ...actual,
        createApp: jest.fn(() => mockApp),
      };
    });
    listenSpy = jest.spyOn(mockApp, 'listen');
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    delete process.env.PORT;
  });

  it('should create app and listen on the specified port', async () => {
    process.env.PORT = '1234';
    const { startServer } = await import('../../src/startServer');
    startServer();
    expect(listenSpy).toHaveBeenCalledWith('1234', expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('MCP server listening on port 1234');
  });

  it('should default to port 3000 if PORT is not set', async () => {
    delete process.env.PORT;
    const { startServer } = await import('../../src/startServer');
    startServer();
    expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('MCP server listening on port 3000');
  });

  it('should handle PORT as a stringified number', async () => {
    process.env.PORT = '5678';
    const { startServer } = await import('../../src/startServer');
    startServer();
    expect(listenSpy).toHaveBeenCalledWith('5678', expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('MCP server listening on port 5678');
  });

  it('should log and not throw if app.listen throws', async () => {
    process.env.PORT = '9999';
    mockApp.listen.mockImplementationOnce(() => { throw new Error('fail'); });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { startServer } = await import('../../src/startServer');
    expect(() => startServer()).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith('Failed to start server:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('should log and not throw if createApp throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.doMock('../../src/index', () => {
      return { createApp: jest.fn(() => { throw new Error('fail'); }) };
    });
    const { startServer } = await import('../../src/startServer');
    expect(() => startServer()).not.toThrow();
    expect(listenSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('Failed to create app:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('should default to port 3000 if PORT is not set', async () => {
    delete process.env.PORT;
    const { startServer } = await import('../../src/startServer');
    startServer();
    expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('MCP server listening on port 3000');
  });
});
