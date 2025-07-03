import { Request, Response } from 'express';
import { toolZodSchemas } from '../types/toolZodSchemas';
import { createStreamState, getStreamState, updateStreamState, deleteStreamState } from '../utils/streamStateStore';
import { sanitizeOutput } from '../utils/sanitizeOutput';

// Handler for /mcp/tools/list
export function toolsListHandler(mcpTools: any[]) {
  return (_req: Request, res: Response) => {
    // TODO: Add pagination support
    res.json({ tools: mcpTools });
  };
}

// Handler for /mcp/tools/call
export function toolsCallHandler(mcpTools: any[], _openapi: any) {
  return async (_req: Request, res: Response) => {
    const { tool, params, resumeSessionId } = res.req.body;
    const found = mcpTools.find((t) => t.name === tool);
    if (!found) {
      res.status(404).json({ error: 'Tool not found' });
      return;
    }
    // Validate params against inputZod schema
    const zodSchemas = toolZodSchemas[tool];
    if (!zodSchemas?.input) {
      res.status(500).json({ error: 'Validation schema not found for tool' });
      return;
    }
    const result = zodSchemas.input.safeParse(params);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid tool input', details: result.error.errors });
      return;
    }
    // Session and resumable stream logic
    const sessionId = (res.req as any).sessionId;
    const userId = (res.req as any).user?.sub ?? 'anon';
    let streamState;
    if (resumeSessionId) {
      streamState = getStreamState(resumeSessionId);
      if (!streamState || streamState.userId !== userId) {
        res.status(404).json({ error: 'Resumable stream not found or not authorized' });
        return;
      }
    } else {
      streamState = {
        tool,
        params: result.data,
        progress: 0,
        resultChunks: [] as Array<{ progress: string; partialResult?: any }>,
        completed: false,
        userId,
      };
      createStreamState(sessionId, streamState);
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    // Simulate streaming with resumable support
    for (let i = streamState.progress; i <= 100; i += 25) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const chunk: { progress: string; partialResult?: any } = { progress: `${i}%`, partialResult: i === 100 ? sanitizeOutput({ echo: streamState.params }) : undefined };
      res.write(i === 0 ? '{"jsonrpc":"2.0","result":{' : ',');
      res.write(`"progress":"${chunk.progress}"`);
      if (chunk.partialResult) {
        res.write(`,"partialResult":${JSON.stringify(chunk.partialResult)}`);
      }
      streamState.progress = i;
      streamState.resultChunks.push(chunk);
      if (i < 100) updateStreamState(sessionId, { progress: i, resultChunks: streamState.resultChunks });
    }
    streamState.completed = true;
    updateStreamState(sessionId, { completed: true });
    res.write('},"id":null}\n');
    res.end();
    // Clean up finished streams
    const timeout = setTimeout(() => deleteStreamState(sessionId), 60000);
    if (typeof timeout.unref === 'function') timeout.unref();
  };
}

// Handler for /mcp/notifications/tools/list_changed (SSE or polling)
export function notificationsListChangedHandler() {
  return (_req: Request, res: Response) => {
    // For now, just return a static notification
    res.json({ changed: false });
  };
}
