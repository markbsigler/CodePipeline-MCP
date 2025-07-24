

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
});
