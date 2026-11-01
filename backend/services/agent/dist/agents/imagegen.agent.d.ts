import '../config.js';
import { AIMessage } from '@langchain/core/messages';
import { AgentState, type AgentArtifact } from '../graph/state.js';
export declare class CloudflareImageApiError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare function runImageAgent(state: typeof AgentState.State): Promise<{
    messages: AIMessage[];
    artifact: AgentArtifact | null;
}>;
//# sourceMappingURL=imagegen.agent.d.ts.map