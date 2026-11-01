import '../config.js';
import { AgentState } from '../graph/state.js';
declare const chatModel: import("@langchain/google-genai").ChatGoogleGenerativeAI;
export declare function runChatAgent(state: typeof AgentState.State): Promise<{
    messages: Awaited<ReturnType<typeof chatModel.invoke>>[];
}>;
export {};
//# sourceMappingURL=chat.agent.d.ts.map