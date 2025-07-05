import { toolsListHandler, toolsCallHandler, notificationsListChangedHandler } from '../../src/handlers/mcpHandlers';
import { toolZodSchemas } from '../../src/types/toolZodSchemas';
import * as streamStateStore from '../../src/utils/streamStateStore';
import * as sanitize from '../../src/utils/sanitizeOutput';

const mockRes = () => {
  const res: any = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.write = jest.fn();
  res.end = jest.fn();
  res.req = { body: {}, user: { sub: 'user1' }, sessionId: 'sess' };
  return res;
};

describe('mcpHandlers', () => {
  describe('toolsListHandler', () => {
    it('returns tools array', () => {
      const res = mockRes();
      const req = { query: { page: '1', pageSize: '20' } } as any;
      toolsListHandler([{ name: 'foo' }])(req, res);
      expect(res.json).toHaveBeenCalledWith({
        tools: [{ name: 'foo' }],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      });
    });
    it('returns empty tools array', () => {
      const res = mockRes();
      const req = { query: { page: '1', pageSize: '20' } } as any;
      toolsListHandler([])(req, res);
      expect(res.json).toHaveBeenCalledWith({
        tools: [],
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('toolsCallHandler', () => {
    const mcpTools = [{ name: 'echo' }];
    const openapi = {};
    beforeAll(() => {
      toolZodSchemas['echo'] = {
        input: { safeParse: (params: any) => ({ success: params && params.ok, data: params, error: { errors: ['fail'] } }) }
      } as any;
    });
    afterAll(() => { delete toolZodSchemas['echo']; });

    beforeEach(() => {
      // For streaming tests, set NODE_ENV to 'development' to exercise streaming path
      process.env.NODE_ENV = 'development';
    });
    afterEach(() => {
      // Restore NODE_ENV to 'test' after each test
      process.env.NODE_ENV = 'test';
    });

    it('returns 404 if tool not found', async () => {
      const res = mockRes();
      res.req.body = { tool: 'notfound', params: {} };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tool not found' });
    });

    it('returns 500 if no validation schema', async () => {
      const res = mockRes();
      res.req.body = { tool: 'echo', params: {} };
      const orig = toolZodSchemas['echo'];
      toolZodSchemas['echo'] = undefined as any;
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation schema not found for tool' });
      toolZodSchemas['echo'] = orig;
    });

    it('returns 400 if input invalid', async () => {
      const res = mockRes();
      res.req.body = { tool: 'echo', params: undefined };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid tool input', details: ['fail'] });
    });

    it('streams and completes for valid input', async () => {
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    it('returns 404 for invalid resumeSessionId', async () => {
      jest.spyOn(streamStateStore, 'getStreamState').mockReturnValue(undefined);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true }, resumeSessionId: 'bad' };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resumable stream not found or not authorized' });
    });

    it('returns 404 if resumable stream userId does not match', async () => {
      jest.spyOn(streamStateStore, 'getStreamState').mockReturnValue({
        tool: 'echo',
        params: { ok: true },
        progress: 0,
        resultChunks: [],
        completed: false,
        userId: 'otherUser',
      });
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true }, resumeSessionId: 'bad' };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resumable stream not found or not authorized' });
    });

    it('streams and completes for valid input with anon user', async () => {
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      const res = mockRes();
      res.req = { body: { tool: 'echo', params: { ok: true } }, sessionId: 'sess' }; // no user
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    it('returns 404 for invalid resumeSessionId with anon user', async () => {
      jest.spyOn(streamStateStore, 'getStreamState').mockReturnValue(undefined);
      const res = mockRes();
      res.req = { body: { tool: 'echo', params: { ok: true }, resumeSessionId: 'bad' }, sessionId: 'sess' }; // no user
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resumable stream not found or not authorized' });
    });

    it('returns 404 if resumable stream userId does not match with anon user', async () => {
      jest.spyOn(streamStateStore, 'getStreamState').mockReturnValue({
        tool: 'echo',
        params: { ok: true },
        progress: 0,
        resultChunks: [],
        completed: false,
        userId: 'otherUser',
      });
      const res = mockRes();
      res.req = { body: { tool: 'echo', params: { ok: true }, resumeSessionId: 'bad' }, sessionId: 'sess' }; // no user
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resumable stream not found or not authorized' });
    });

    it('streams all branches and cleans up stream state', async () => {
      jest.useFakeTimers();
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      const updateSpy = jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      const deleteSpy = jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      const sanitizeSpy = jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      const handlerPromise = toolsCallHandler(mcpTools, openapi)({} as any, res);
      await jest.runAllTimersAsync();
      await handlerPromise;
      // Check first chunk prefix
      expect(res.write).toHaveBeenCalledWith('{"jsonrpc":"2.0","result":{');
      // Check partialResult only on last chunk
      const writeCalls = res.write.mock.calls.map((c: any[]) => c[0]);
      expect(writeCalls.some((c: string) => c.includes('partialResult'))).toBe(true);
      // updateStreamState called for progress and completed
      expect(updateSpy).toHaveBeenCalled();
      // Clean up after 60s
      expect(deleteSpy).toHaveBeenCalled();
      jest.useRealTimers();
      sanitizeSpy.mockRestore();
    }, 10000);

    it('matches tool by id as well as name', async () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const mcpTools = [{ name: 'echo', id: 'echo-id' }];
      toolZodSchemas['echo'] = {
        input: { safeParse: (params: any) => ({ success: true, data: params }) }
      } as any;
      const res = mockRes();
      res.req.body = { tool: 'echo-id', params: { ok: true } };
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      process.env.NODE_ENV = oldEnv;
    });

    it('returns single JSON object in test mode', async () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      const mcpTools = [{ name: 'echo' }];
      toolZodSchemas['echo'] = {
        input: { safeParse: (params: any) => ({ success: true, data: params }) }
      } as any;
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        jsonrpc: '2.0',
        result: expect.objectContaining({ progress: 1 })
      }));
      process.env.NODE_ENV = oldEnv;
    });

    it('handles missing sessionId gracefully', async () => {
      const mcpTools = [{ name: 'echo' }];
      toolZodSchemas['echo'] = {
        input: { safeParse: (params: any) => ({ success: true, data: params }) }
      } as any;
      const res = mockRes();
      delete res.req.sessionId;
      res.req.body = { tool: 'echo', params: { ok: true } };
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      await toolsCallHandler(mcpTools, {} as any)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    it('handles error thrown in streamToolResult', async () => {
      const mcpTools = [{ name: 'echo' }];
      toolZodSchemas['echo'] = {
        input: { safeParse: (params: any) => ({ success: true, data: params }) }
      } as any;
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      res.write.mockImplementation(() => { throw new Error('write error'); });
      await expect(toolsCallHandler(mcpTools, {} as any)({} as any, res)).rejects.toThrow('write error');
    });
  });

  describe('notificationsListChangedHandler', () => {
    it('returns changed: false', () => {
      const res = mockRes();
      notificationsListChangedHandler()({} as any, res);
      expect(res.json).toHaveBeenCalledWith({ changed: false });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
});
