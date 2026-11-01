import '../config.js';
import { AIMessage } from '@langchain/core/messages';
import { AgentState } from '../graph/state.js';
export declare function runSearchAgent(state: typeof AgentState.State): Promise<{
    messages: AIMessage[];
}>;
//# sourceMappingURL=search.agent.d.ts.map