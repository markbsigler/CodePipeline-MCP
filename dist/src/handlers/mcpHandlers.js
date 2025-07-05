"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolsListHandler = toolsListHandler;
exports.toolsCallHandler = toolsCallHandler;
exports.notificationsListChangedHandler = notificationsListChangedHandler;
const toolZodSchemas_1 = require("../types/toolZodSchemas");
const streamStateStore_1 = require("../utils/streamStateStore");
const sanitizeOutput_1 = require("../utils/sanitizeOutput");
// Handler for /mcp/tools/list
function toolsListHandler(mcpTools) {
    return (_req, res) => {
        // Pagination support
        const page = parseInt(_req.query.page || '1', 10);
        const pageSize = parseInt(_req.query.pageSize || '20', 10);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedTools = mcpTools.slice(start, end);
        res.json({
            tools: paginatedTools,
            page,
            pageSize,
            total: mcpTools.length,
            totalPages: Math.ceil(mcpTools.length / pageSize),
        });
    };
}
// Handler for /mcp/tools/call
function toolsCallHandler(mcpTools, _openapi) {
    return async (_req, res) => {
        const { tool, params, resumeSessionId } = res.req.body;
        const found = mcpTools.find((t) => t.name === tool);
        if (!found) {
            res.status(404).json({ error: 'Tool not found' });
            return;
        }
        // Validate params against inputZod schema
        const zodSchemas = toolZodSchemas_1.toolZodSchemas[tool];
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
        const sessionId = res.req.sessionId;
        const userId = res.req.user?.sub ?? 'anon';
        let streamState;
        if (resumeSessionId) {
            streamState = (0, streamStateStore_1.getStreamState)(resumeSessionId);
            if (!streamState || streamState.userId !== userId) {
                res.status(404).json({ error: 'Resumable stream not found or not authorized' });
                return;
            }
        }
        else {
            streamState = {
                tool,
                params: result.data,
                progress: 0,
                resultChunks: [],
                completed: false,
                userId,
            };
            (0, streamStateStore_1.createStreamState)(sessionId, streamState);
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        await streamToolResult(res, streamState, sessionId);
    };
}
// Extracted streaming logic to reduce complexity
async function streamToolResult(res, streamState, sessionId) {
    for (let i = streamState.progress; i <= 100; i += 25) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const chunk = {
            progress: `${i}%`,
            partialResult: i === 100 ? (0, sanitizeOutput_1.sanitizeOutput)({ echo: streamState.params }) : undefined,
        };
        res.write(i === 0 ? '{"jsonrpc":"2.0","result":{' : ',');
        res.write(`"progress":"${chunk.progress}"`);
        if (chunk.partialResult) {
            res.write(`,"partialResult":${JSON.stringify(chunk.partialResult)}`);
        }
        streamState.progress = i;
        streamState.resultChunks.push(chunk);
        if (i < 100)
            (0, streamStateStore_1.updateStreamState)(sessionId, { progress: i, resultChunks: streamState.resultChunks });
    }
    streamState.completed = true;
    (0, streamStateStore_1.updateStreamState)(sessionId, { completed: true });
    res.write('},"id":null}\n');
    res.end();
    // Clean up finished streams
    const timeout = setTimeout(() => (0, streamStateStore_1.deleteStreamState)(sessionId), 60000);
    if (typeof timeout.unref === 'function')
        timeout.unref();
}
// Handler for /mcp/notifications/tools/list_changed (SSE or polling)
function notificationsListChangedHandler() {
    return (_req, res) => {
        // For now, just return a static notification
        res.json({ changed: false });
    };
}
//# sourceMappingURL=mcpHandlers.js.map