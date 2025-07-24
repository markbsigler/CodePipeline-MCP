// @ts-nocheck
interface StreamState {
    tool: string;
    params: any;
    progress: number;
    resultChunks: any[];
    completed: boolean;
    userId: string;
}
export declare function createStreamState(sessionId: string, state: StreamState): void;
export declare function getStreamState(sessionId: string): StreamState | undefined;
export declare function updateStreamState(sessionId: string, update: Partial<StreamState>): void;
export declare function deleteStreamState(sessionId: string): void;
export {};
