import request from 'supertest';
import express from 'express';
import { toolsListHandler, toolsCallHandler } from 'handlers/mcpHandlers';

describe('toolsListHandler', () => {
  const mcpTools = Array.from({ length: 50 }, (_, i) => ({ id: `tool${i+1}`, name: `Tool ${i+1}` }));
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.get('/tools', toolsListHandler(mcpTools));
  });

  it('should default to page=1 and pageSize=20 if not provided', async () => {
    const res = await request(app).get('/tools');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(20);
    expect(res.body.tools.length).toBe(20);
  });

  it('should default to page=1 if page is 0 or negative', async () => {
    const res = await request(app).get('/tools?page=0');
    expect(res.body.page).toBe(1);
    const res2 = await request(app).get('/tools?page=-5');
    expect(res2.body.page).toBe(1);
  });

  it('should default to pageSize=20 if pageSize is 0 or negative', async () => {
    const res = await request(app).get('/tools?pageSize=0');
    expect(res.body.pageSize).toBe(20);
    const res2 = await request(app).get('/tools?pageSize=-10');
    expect(res2.body.pageSize).toBe(20);
  });

  it('should default to page=1 and pageSize=20 if not a number', async () => {
    const res = await request(app).get('/tools?page=foo&pageSize=bar');
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(20);
  });
});

describe('toolsCallHandler', () => {
  let app: express.Express;
  const mcpTools = [
    { id: 'tool1', name: 'Tool 1' },
    { id: 'tool2', name: 'Tool 2' }
  ];
  const openapi = {};

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/call', toolsCallHandler(mcpTools, openapi));
  });

  it('should return 404 if tool not found', async () => {
    const res = await request(app).post('/call').send({ tool: 'not-a-tool', params: {} });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return 500 if validation schema not found', async () => {
    const res = await request(app).post('/call').send({ tool: 'tool1', params: {} });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/validation schema not found/i);
  });
});
import { notificationsListChangedHandler } from 'handlers/mcpHandlers';
import { toolZodSchemas } from 'types/toolZodSchemas';
import * as streamStateStore from 'utils/streamStateStore';
import * as sanitize from 'utils/sanitizeOutput';

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
    it('handles extremely large page and pageSize', () => {
      const res = mockRes();
      const req = { query: { page: '9999', pageSize: '9999' } } as any;
      toolsListHandler([{ name: 'foo' }])(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        tools: [],
        page: 9999,
        pageSize: 9999,
      }));
    });
    it('handles NaN and undefined page/pageSize', () => {
      const res = mockRes();
      const req = { query: { page: undefined, pageSize: undefined } } as any;
      toolsListHandler([{ name: 'foo' }])(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        pageSize: 20,
      }));
    });
    it('handles negative and zero page/pageSize', () => {
      const res = mockRes();
      const req = { query: { page: '-1', pageSize: '0' } } as any;
      toolsListHandler([{ name: 'foo' }])(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        pageSize: 20,
      }));
    });
  });
  describe('toolsCallHandler streaming and edge cases', () => {
    const mcpTools = [{ name: 'echo', id: 'echo-id' }];
    const openapi = {};
    beforeAll(() => {
      toolZodSchemas['echo'] = {
        input: { safeParse: (params: any) => ({ success: true, data: params }) }
      } as any;
    });
    afterAll(() => { delete toolZodSchemas['echo']; });
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });
    afterEach(() => {
      process.env.NODE_ENV = 'test';
    });
    it('handles missing params', async () => {
      const res = mockRes();
      res.req.body = { tool: 'echo' };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });
    it('handles missing userId and sessionId', async () => {
      const res = mockRes();
      res.req = { body: { tool: 'echo', params: { ok: true } } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });
    it('streams with i === 0 and i === 100', async () => {
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      // Check for chunked output at i === 0 and i === 100
      const writeCalls = res.write.mock.calls.map((c: any[]) => c[0]);
      expect(writeCalls[0]).toContain('jsonrpc');
      expect(writeCalls.some((c: string) => c.includes('progress'))).toBe(true);
      expect(writeCalls.some((c: string) => c.includes('partialResult'))).toBe(true);
    });
    it('handles setTimeout and unref logic', async () => {
      // Patch global setTimeout to call immediately for this test
      const origSetTimeout = global.setTimeout;
      // @ts-ignore
      global.setTimeout = ((fn: any, _ms: any) => { fn(); return { unref: () => {} }; }) as any;
      jest.spyOn(streamStateStore, 'createStreamState').mockImplementation(() => {});
      jest.spyOn(streamStateStore, 'updateStreamState').mockImplementation(() => {});
      const deleteSpy = jest.spyOn(streamStateStore, 'deleteStreamState').mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(deleteSpy).toHaveBeenCalled();
      global.setTimeout = origSetTimeout;
    });
    it('handles error in setHeader', async () => {
      const res = mockRes();
      res.setHeader = jest.fn(() => { throw new Error('header error'); });
      res.req.body = { tool: 'echo', params: { ok: true } };
      await expect(toolsCallHandler(mcpTools, openapi)({} as any, res)).rejects.toThrow('header error');
    });
    it('handles error in end', async () => {
      // Patch global setTimeout to call immediately for this test
      const origSetTimeout = global.setTimeout;
      // @ts-ignore
      global.setTimeout = ((fn: any, _ms: any) => { fn(); return { unref: () => {} }; }) as any;
      const res = mockRes();
      res.end = jest.fn(() => { throw new Error('end error'); });
      res.req.body = { tool: 'echo', params: { ok: true } };
      await expect(toolsCallHandler(mcpTools, openapi)({} as any, res)).rejects.toThrow('end error');
      global.setTimeout = origSetTimeout;
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
      const origSetTimeout = global.setTimeout;
      // @ts-ignore
      global.setTimeout = ((fn: any, _ms: any) => { fn(); return { unref: () => {} }; }) as any;
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
      global.setTimeout = origSetTimeout;
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
      const origSetTimeout = global.setTimeout;
      // @ts-ignore
      global.setTimeout = ((fn: any, _ms: any) => { fn(); return { unref: () => {} }; }) as any;
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
      global.setTimeout = origSetTimeout;
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
