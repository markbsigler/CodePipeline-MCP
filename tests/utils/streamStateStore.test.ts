import {
  createStreamState,
  getStreamState,
  updateStreamState,
  deleteStreamState,
} from "../../src/utils/streamStateStore";

describe("streamStateStore", () => {
  const sessionId = "test-session";
  const state = {
    tool: "echo",
    params: { foo: "bar" },
    progress: 0,
    resultChunks: [],
    completed: false,
    userId: "user1",
  };

  afterEach(() => {
    deleteStreamState(sessionId);
  });

  it("creates and retrieves stream state", () => {
    createStreamState(sessionId, state);
    expect(getStreamState(sessionId)).toMatchObject(state);
  });

  it("updates stream state", () => {
    createStreamState(sessionId, state);
    updateStreamState(sessionId, { progress: 50 });
    expect(getStreamState(sessionId)?.progress).toBe(50);
  });

  it("deletes stream state", () => {
    createStreamState(sessionId, state);
    deleteStreamState(sessionId);
    expect(getStreamState(sessionId)).toBeUndefined();
  });
});
