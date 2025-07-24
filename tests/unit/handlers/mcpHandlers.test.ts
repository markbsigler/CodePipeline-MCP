
import express, { json } from 'express';
import { toolsListHandler, toolsCallHandler, notificationsListChangedHandler } from 'handlers/mcpHandlers';
import request from 'supertest';
import { toolZodSchemas } from 'types/toolZodSchemas';
import * as sanitize from 'utils/sanitizeOutput';
import * as streamStateStore from 'utils/streamStateStore';

import { immediateSetTimeout } from '../../utils/immediateSetTimeout';

describe('toolsListHandler', function toolsListHandlerDescribe(): void {
  const mcpTools = Array.from({ length: 50 }, (_, i) => ({
    id: `tool${i + 1}`,
    name: `Tool ${i + 1}`,
  }));
  let app: express.Express;

  beforeEach(function beforeEachHook(): void {
    app = express();
    app.get('/tools', toolsListHandler(mcpTools));
  });

  it('should default to page=1 and pageSize=20 if not provided', async function shouldDefaultToPage1AndPageSize20IfNotProvided(): Promise<void> {
    const res = await request(app).get('/tools');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(20);
    expect(res.body.tools.length).toBe(20);
  });

  it('should default to page=1 if page is 0 or negative', async function shouldDefaultToPage1IfPageIs0OrNegative(): Promise<void> {
    const res = await request(app).get('/tools?page=0');
    expect(res.body.page).toBe(1);
    const res2 = await request(app).get('/tools?page=-5');
    expect(res2.body.page).toBe(1);
  });

  it('should default to pageSize=20 if pageSize is 0 or negative', async function shouldDefaultToPageSize20IfPageSizeIs0OrNegative(): Promise<void> {
    const res = await request(app).get('/tools?pageSize=0');
    expect(res.body.pageSize).toBe(20);
    const res2 = await request(app).get('/tools?pageSize=-10');
    expect(res2.body.pageSize).toBe(20);
  });

  it('should default to page=1 and pageSize=20 if not a number', async function shouldDefaultToPage1AndPageSize20IfNotANumber(): Promise<void> {
    const res = await request(app).get('/tools?page=foo&pageSize=bar');
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(20);
  });
});

describe('toolsCallHandler', function toolsCallHandlerDescribe(): void {
  let app: express.Express;
  const mcpTools = [
    { id: 'tool1', name: 'Tool 1' },
    { id: 'tool2', name: 'Tool 2' },
  ];
  const openapi = {};

  beforeEach(function beforeEachHook(): void {
    app = express();
    app.use(json());
    app.post('/call', toolsCallHandler(mcpTools, openapi));
  });

  it('should return 404 if tool not found', async function shouldReturn404IfToolNotFound(): Promise<void> {
    const res = await request(app)
      .post('/call')
      .send({ tool: 'not-a-tool', params: {} });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return 500 if validation schema not found', async function shouldReturn500IfValidationSchemaNotFound(): Promise<void> {
    const res = await request(app)
      .post('/call')
      .send({ tool: 'tool1', params: {} });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/validation schema not found/i);
  });
});

const mockRes = function mockRes(): any {
  const res: any = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.write = jest.fn();
  res.end = jest.fn();
  res.req = { body: {}, user: { sub: 'user1' }, sessionId: 'sess' };
  return res;
};

describe('mcpHandlers', function mcpHandlersDescribe(): void {
  describe('toolsListHandler', function toolsListHandlerDescribe(): void {
    it('returns tools array', function returnsToolsArray(): void {
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
    it('returns empty tools array', function returnsEmptyToolsArray(): void {
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
    it('handles extremely large page and pageSize', function handlesExtremelyLargePageAndPageSize(): void {
      const res = mockRes();
      const req = { query: { page: '9999', pageSize: '9999' } } as any;
      toolsListHandler([{ name: 'foo' }])(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: [],
          page: 9999,
          pageSize: 9999,
        }),
      );
    });
    it('handles NaN and undefined page/pageSize', function handlesNaNAndUndefinedPagePageSize(): void {
      const res = mockRes();
      const req = { query: { page: undefined, pageSize: undefined } } as any;
      toolsListHandler([{ name: 'foo' }])(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 20,
        }),
      );
    });
    it('handles negative and zero page/pageSize', function handlesNegativeAndZeroPagePageSize(): void {
      const res = mockRes();
      const req = { query: { page: '-1', pageSize: '0' } } as any;
      toolsListHandler([{ name: 'foo' }])(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 20,
        }),
      );
    });
  });
  describe('toolsCallHandler streaming and edge cases', function toolsCallHandlerStreamingAndEdgeCasesDescribe(): void {
    const mcpTools = [{ name: 'echo', id: 'echo-id' }];
    const openapi = {};
    beforeAll(function beforeAllHook(): void {
      toolZodSchemas['echo'] = {
        input: {
          safeParse: (params: any) => ({ success: true, data: params }),
        },
      } as any;
    });
    afterAll(() => {
      delete toolZodSchemas['echo'];
    });
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
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });
    it('handles missing userId and sessionId', async () => {
      const res = mockRes();
      res.req = { body: { tool: 'echo', params: { ok: true } } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });
    it('streams with i === 0 and i === 100', async () => {
      jest
        .spyOn(streamStateStore, 'createStreamState')
        .mockImplementation((): void => {});
      jest
        .spyOn(streamStateStore, 'updateStreamState')
        .mockImplementation((): void => {});
      jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation((): void => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x) => x);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      // Check for chunked output at i === 0 and i === 100
      const writeCalls = res.write.mock.calls.map((c: any[]) => c[0]);
      expect(writeCalls[0]).toContain('jsonrpc');
      expect(writeCalls.some((c: string) => c.includes('progress'))).toBe(true);
      expect(writeCalls.some((c: string) => c.includes('partialResult'))).toBe(
        true,
      );
    });
    it('handles setTimeout and unref logic', async () => {
      // Patch global setTimeout to call immediately for this test
      const origSetTimeout = global.setTimeout;

      global.setTimeout = (function patchedSetTimeout(fn: any, _ms: any): { unref: () => void } {
        fn();
        return { unref: function unref(): void {} };
      }) as any;
      jest
        .spyOn(streamStateStore, 'createStreamState')
      .mockImplementation(function mockCreateStreamState(): void {});
      jest
        .spyOn(streamStateStore, 'updateStreamState')
      .mockImplementation(function mockUpdateStreamState(): void {});
      const deleteSpy = jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation(function mockDeleteStreamState(): void {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation(function mockSanitizeOutput(x: any): any { return x; });
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(deleteSpy).toHaveBeenCalled();
      global.setTimeout = origSetTimeout;
    });
    it('handles error in setHeader', async () => {
      const res = mockRes();
      res.setHeader = jest.fn(function setHeaderThrows(): void {
        throw new Error('header error');
      });
      res.req.body = { tool: 'echo', params: { ok: true } };
      await expect(
        toolsCallHandler(mcpTools, openapi)({} as any, res),
      ).rejects.toThrow('header error');
    });
    it('handles error in end', async () => {
      // Patch global setTimeout to call immediately for this test
      const origSetTimeout = global.setTimeout;

      global.setTimeout = (function patchedSetTimeout(fn: any, _ms: any): { unref: () => void } {
        fn();
        return { unref: function unref(): void {} };
      }) as any;
      const res = mockRes();
      res.end = jest.fn(function endThrows(): void {
        throw new Error('end error');
      });
      res.req.body = { tool: 'echo', params: { ok: true } };
      await expect(
        toolsCallHandler(mcpTools, openapi)({} as any, res),
      ).rejects.toThrow('end error');
      global.setTimeout = origSetTimeout;
    });
  });

  describe('toolsCallHandler', () => {
    const mcpTools = [{ name: 'echo' }];
    const openapi = {};
    beforeAll(() => {
      toolZodSchemas['echo'] = {
        input: {
          safeParse: (params: any) => ({
            success: params && params.ok,
            data: params,
            error: { errors: ['fail'] },
          }),
        },
      } as any;
    });
    afterAll(() => {
      delete toolZodSchemas['echo'];
    });

    beforeEach(() => {
      // For streaming tests, set NODE_ENV to 'development' to exercise streaming path
      process.env.NODE_ENV = 'development';
    });
    afterEach(() => {
      // Restore NODE_ENV to 'test' after each test
      process.env.NODE_ENV = 'test';
    });

    it('returns 404 if tool not found', async function returns404IfToolNotFound(): Promise<void> {
      const res = mockRes();
      res.req.body = { tool: 'notfound', params: {} };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tool not found' });
    });

    it('returns 500 if no validation schema', async function returns500IfNoValidationSchema(): Promise<void> {
      const res = mockRes();
      res.req.body = { tool: 'echo', params: {} };
      const orig = toolZodSchemas['echo'];
      toolZodSchemas['echo'] = undefined as any;
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation schema not found for tool',
      });
      toolZodSchemas['echo'] = orig;
    });

    it('returns 400 if input invalid', async function returns400IfInputInvalid(): Promise<void> {
      const res = mockRes();
      res.req.body = { tool: 'echo', params: undefined };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid tool input',
        details: ['fail'],
      });
    });

    it('streams and completes for valid input', async function streamsAndCompletesForValidInput(): Promise<void> {
        const origSetTimeout1 = global.setTimeout;
        global.setTimeout = immediateSetTimeout as any;
        const res1 = mockRes();
        res1.req.body = { tool: 'echo', params: { ok: true } };
        await toolsCallHandler(mcpTools, openapi)({} as any, res1);
        expect(res1.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'application/json',
        );
        expect(res1.write).toHaveBeenCalled();
        expect(res1.end).toHaveBeenCalled();
        global.setTimeout = origSetTimeout1;
    const origSetTimeout = global.setTimeout;
    global.setTimeout = immediateSetTimeout as any;
      jest
        .spyOn(streamStateStore, 'createStreamState')
        .mockImplementation((): void => {});
      jest
        .spyOn(streamStateStore, 'updateStreamState')
        .mockImplementation((): void => {});
      jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation((): void => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x: unknown) => x);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      global.setTimeout = origSetTimeout;
    });

    it('returns 404 for invalid resumeSessionId', async function returns404ForInvalidResumeSessionId(): Promise<void> {
      jest.spyOn(streamStateStore, 'getStreamState').mockReturnValue(undefined);
      const res = mockRes();
      res.req.body = {
        tool: 'echo',
        params: { ok: true },
        resumeSessionId: 'bad',
      };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resumable stream not found or not authorized',
      });
    });

    it('returns 404 if resumable stream userId does not match', async function returns404IfResumableStreamUserIdDoesNotMatch(): Promise<void> {
      jest.spyOn(streamStateStore, 'getStreamState').mockReturnValue({
        tool: 'echo',
        params: { ok: true },
        progress: 0,
        resultChunks: [],
        completed: false,
        userId: 'otherUser',
      });
      const res = mockRes();
      res.req.body = {
        tool: 'echo',
        params: { ok: true },
        resumeSessionId: 'bad',
      };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resumable stream not found or not authorized',
      });
    });

    it('streams and completes for valid input with anon user', async function streamsAndCompletesForValidInputWithAnonUser(): Promise<void> {
        const origSetTimeout2 = global.setTimeout;
        global.setTimeout = immediateSetTimeout as any;
        const res2 = mockRes();
        res2.req = {
            body: { tool: 'echo', params: { ok: true } },
            sessionId: 'sess',
        }; // no user
        await toolsCallHandler(mcpTools, openapi)({} as any, res2);
        expect(res2.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'application/json',
        );
        expect(res2.write).toHaveBeenCalled();
        expect(res2.end).toHaveBeenCalled();
        global.setTimeout = origSetTimeout2;
      const origSetTimeout = global.setTimeout;
      global.setTimeout = immediateSetTimeout as any;
      jest
        .spyOn(streamStateStore, 'createStreamState')
        .mockImplementation((): void => {});
      jest
        .spyOn(streamStateStore, 'updateStreamState')
        .mockImplementation((): void => {});
      jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation((): void => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x: unknown) => x);
      const res = mockRes();
      res.req = {
        body: { tool: 'echo', params: { ok: true } },
        sessionId: 'sess',
      }; // no user
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      global.setTimeout = origSetTimeout;
    });

    it('returns 404 for invalid resumeSessionId with anon user', async () => {
      jest.spyOn(streamStateStore, 'getStreamState').mockReturnValue(undefined);
      const res = mockRes();
      res.req = {
        body: { tool: 'echo', params: { ok: true }, resumeSessionId: 'bad' },
        sessionId: 'sess',
      }; // no user
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resumable stream not found or not authorized',
      });
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
      res.req = {
        body: { tool: 'echo', params: { ok: true }, resumeSessionId: 'bad' },
        sessionId: 'sess',
      }; // no user
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resumable stream not found or not authorized',
      });
    });

    it('streams all branches and cleans up stream state', async () => {
      jest.useFakeTimers();
      jest
        .spyOn(streamStateStore, 'createStreamState')
        .mockImplementation(() => {});
      const updateSpy = jest
        .spyOn(streamStateStore, 'updateStreamState')
        .mockImplementation(() => {});
      const deleteSpy = jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation(() => {});
      const sanitizeSpy = jest
        .spyOn(sanitize, 'sanitizeOutput')
        .mockImplementation((x: unknown) => x);
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      const handlerPromise = toolsCallHandler(mcpTools, openapi)(
        {} as any,
        res,
      );
      await jest.runAllTimersAsync();
      await handlerPromise;
      // Check first chunk prefix
      expect(res.write).toHaveBeenCalledWith('{"jsonrpc":"2.0","result":{');
      // Check partialResult only on last chunk
      const writeCalls = res.write.mock.calls.map((c: any[]) => c[0]);
      expect(writeCalls.some((c: string) => c.includes('partialResult'))).toBe(
        true,
      );
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
        input: {
          safeParse: (params: any) => ({ success: true, data: params }),
        },
      } as any;
      const res = mockRes();
      res.req.body = { tool: 'echo-id', params: { ok: true } };
      jest
        .spyOn(streamStateStore, 'createStreamState')
        .mockImplementation(() => {});
      jest
        .spyOn(streamStateStore, 'updateStreamState')
        .mockImplementation(() => {});
      jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x: unknown) => x);
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      process.env.NODE_ENV = oldEnv;
    });

    it('returns single JSON object in test mode', async () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      const mcpTools = [{ name: 'echo' }];
      toolZodSchemas['echo'] = {
        input: {
          safeParse: (params: any) => ({ success: true, data: params }),
        },
      } as any;
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      await toolsCallHandler(mcpTools, openapi)({} as any, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonrpc: '2.0',
          result: expect.objectContaining({ progress: 1 }),
        }),
      );
      process.env.NODE_ENV = oldEnv;
    });

    it('handles missing sessionId gracefully', async () => {
      const mcpTools = [{ name: 'echo' }];
      toolZodSchemas['echo'] = {
        input: {
          safeParse: (params: any) => ({ success: true, data: params }),
        },
      } as any;
      const res = mockRes();
      delete res.req.sessionId;
      res.req.body = { tool: 'echo', params: { ok: true } };
      jest
        .spyOn(streamStateStore, 'createStreamState')
        .mockImplementation(() => {});
      jest
        .spyOn(streamStateStore, 'updateStreamState')
        .mockImplementation(() => {});
      jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x: unknown) => x);
      await toolsCallHandler(mcpTools, {} as any)({} as any, res);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    it('handles error thrown in streamToolResult', async () => {
      const mcpTools = [{ name: 'echo' }];
      toolZodSchemas['echo'] = {
        input: {
          safeParse: (params: any) => ({ success: true, data: params }),
        },
      } as any;
      const res = mockRes();
      res.req.body = { tool: 'echo', params: { ok: true } };
      jest
        .spyOn(streamStateStore, 'createStreamState')
        .mockImplementation(() => {});
      jest
        .spyOn(streamStateStore, 'updateStreamState')
        .mockImplementation(() => {});
      jest
        .spyOn(streamStateStore, 'deleteStreamState')
        .mockImplementation(() => {});
      jest.spyOn(sanitize, 'sanitizeOutput').mockImplementation((x: unknown) => x);
      res.write.mockImplementation(() => {
        throw new Error('write error');
      });
      await expect(
        toolsCallHandler(mcpTools, {} as any)({} as any, res),
      ).rejects.toThrow('write error');
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
