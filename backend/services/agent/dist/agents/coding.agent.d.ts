import '../config.js';
import { AgentState } from '../graph/state.js';
declare const codingModel: import("@langchain/google-genai").ChatGoogleGenerativeAI;
export declare function runCodingAgent(state: typeof AgentState.State): Promise<{
    messages: Awaited<ReturnType<typeof codingModel.invoke>>[];
}>;
export {};
//# sourceMappingURL=coding.agent.d.ts.map