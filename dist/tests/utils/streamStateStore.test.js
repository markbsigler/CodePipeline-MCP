"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streamStateStore_1 = require("../../src/utils/streamStateStore");
describe('streamStateStore', () => {
    const sessionId = 'test-session';
    const state = {
        tool: 'echo',
        params: { foo: 'bar' },
        progress: 0,
        resultChunks: [],
        completed: false,
        userId: 'user1',
    };
    afterEach(() => {
        (0, streamStateStore_1.deleteStreamState)(sessionId);
    });
    it('creates and retrieves stream state', () => {
        (0, streamStateStore_1.createStreamState)(sessionId, state);
        expect((0, streamStateStore_1.getStreamState)(sessionId)).toMatchObject(state);
    });
    it('updates stream state', () => {
        (0, streamStateStore_1.createStreamState)(sessionId, state);
        (0, streamStateStore_1.updateStreamState)(sessionId, { progress: 50 });
        expect((0, streamStateStore_1.getStreamState)(sessionId)?.progress).toBe(50);
    });
    it('deletes stream state', () => {
        (0, streamStateStore_1.createStreamState)(sessionId, state);
        (0, streamStateStore_1.deleteStreamState)(sessionId);
        expect((0, streamStateStore_1.getStreamState)(sessionId)).toBeUndefined();
    });
});
//# sourceMappingURL=streamStateStore.test.js.map