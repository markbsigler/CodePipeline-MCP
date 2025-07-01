// src/utils/streamStateStore.ts
// Simple in-memory store for stream state (replace with Redis or DB for production)

interface StreamState {
  tool: string;
  params: any;
  progress: number;
  resultChunks: any[];
  completed: boolean;
  userId: string;
}

const streamStore: Record<string, StreamState> = {};

export function createStreamState(sessionId: string, state: StreamState) {
  streamStore[sessionId] = state;
}

export function getStreamState(sessionId: string): StreamState | undefined {
  return streamStore[sessionId];
}

export function updateStreamState(sessionId: string, update: Partial<StreamState>) {
  if (streamStore[sessionId]) {
    Object.assign(streamStore[sessionId], update);
  }
}

export function deleteStreamState(sessionId: string) {
  delete streamStore[sessionId];
}
