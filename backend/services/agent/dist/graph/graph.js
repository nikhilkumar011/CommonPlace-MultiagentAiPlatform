import { END, START, StateGraph } from '@langchain/langgraph';
import { runChatAgent } from '../agents/chat.agent.js';
import { runCodingAgent } from '../agents/coding.agent.js';
import { runImageAgent } from '../agents/imagegen.agent.js';
import { runPdfAgent } from '../agents/pdf.agent.js';
import { runSearchAgent } from '../agents/search.agent.js';
import { CloudflareImageApiError } from '../agents/imagegen.agent.js';
import { AgentRateLimitError, enforceAgentRateLimit, } from '../lib/agentRateLimit.js';
import { AgentState } from './state.js';
import { routePrompt } from './router.js';
async function rateLimitAgent(state) {
    if (!state.userId) {
        throw new Error('Authenticated user ID is required for agent rate limiting');
    }
    await enforceAgentRateLimit(state.userId, state.route);
}
const workflow = new StateGraph(AgentState)
    .addNode('router', routePrompt)
    .addNode('rateLimit', rateLimitAgent, {
    retryPolicy: {
        retryOn: (error) => !(error instanceof AgentRateLimitError),
    },
})
    .addNode('chat', runChatAgent)
    .addNode('coding', runCodingAgent)
    .addNode('image', runImageAgent, {
    retryPolicy: {
        retryOn: (error) => !(error instanceof CloudflareImageApiError),
    },
})
    .addNode('pdf', runPdfAgent)
    .addNode('search', runSearchAgent)
    .addEdge(START, 'router')
    .addEdge('router', 'rateLimit')
    .addConditionalEdges('rateLimit', (state) => state.route, {
    chat: 'chat',
    coding: 'coding',
    image: 'image',
    pdf: 'pdf',
    search: 'search',
})
    .addEdge('chat', END)
    .addEdge('coding', END)
    .addEdge('image', END)
    .addEdge('pdf', END)
    .addEdge('search', END);
export const agentGraph = workflow.compile();
//# sourceMappingURL=graph.js.map