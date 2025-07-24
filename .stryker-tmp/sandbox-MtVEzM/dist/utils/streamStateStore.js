// @ts-nocheck
"use strict";
// src/utils/streamStateStore.ts
// Simple in-memory store for stream state (replace with Redis or DB for production)
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStreamState = createStreamState;
exports.getStreamState = getStreamState;
exports.updateStreamState = updateStreamState;
exports.deleteStreamState = deleteStreamState;
const streamStore = {};
function createStreamState(sessionId, state) {
    streamStore[sessionId] = state;
}
function getStreamState(sessionId) {
    return streamStore[sessionId];
}
function updateStreamState(sessionId, update) {
    if (streamStore[sessionId]) {
        Object.assign(streamStore[sessionId], update);
    }
}
function deleteStreamState(sessionId) {
    delete streamStore[sessionId];
}
//# sourceMappingURL=streamStateStore.js.map