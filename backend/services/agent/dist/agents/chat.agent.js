import '../config.js';
import { SystemMessage } from '@langchain/core/messages';
import { AgentState } from '../graph/state.js';
import { createGeminiModel } from '../lib/gemini.js';
const chatModel = createGeminiModel(0.7);
export async function runChatAgent(state) {
    const response = await chatModel.invoke([
        new SystemMessage('You are the chat agent for a helpful multi-agent AI platform. Answer the user clearly and conversationally. Do not claim to have used tools or external sources that were not provided.'),
        ...state.messages,
    ]);
    return { messages: [response] };
}
//# sourceMappingURL=chat.agent.js.map