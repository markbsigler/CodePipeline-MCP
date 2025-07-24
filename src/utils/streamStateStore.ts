// src/utils/streamStateStore.ts
// Simple in-memory store for stream state (replace with Redis or DB for production)

interface StreamState {
  tool: string;
  params: unknown;
  progress: number;
  resultChunks: Array<{ progress: string; partialResult?: unknown }>;
  completed: boolean;
  userId: string;
}

const streamStore: Record<string, StreamState> = {};

export function createStreamState(sessionId: string, state: StreamState): void {
  streamStore[sessionId] = state;
}

export function getStreamState(sessionId: string): StreamState | undefined {
  return streamStore[sessionId];
}

export function updateStreamState(
  sessionId: string,
  update: Partial<StreamState>,
): void {
  if (streamStore[sessionId]) {
    Object.assign(streamStore[sessionId], update);
  }
}

export function deleteStreamState(sessionId: string): void {
  delete streamStore[sessionId];
}
