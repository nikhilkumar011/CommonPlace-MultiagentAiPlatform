import '../config.js';
import { AIMessage } from '@langchain/core/messages';
import { AgentState } from '../graph/state.js';
export declare function runPdfAgent(state: typeof AgentState.State): Promise<{
    messages: AIMessage[];
}>;
//# sourceMappingURL=pdf.agent.d.ts.map