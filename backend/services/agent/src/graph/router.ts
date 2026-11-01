import '../config.js';
import { z } from 'zod';
import { AgentState, agentRoutes, type AgentRoute } from './state.js';
import { createGeminiModel } from '../lib/gemini.js';

const routeSchema = z.object({
  route: z.enum(agentRoutes).describe('The single best agent for the request.'),
});

const routerModel = createGeminiModel(0).withStructuredOutput(routeSchema);

export async function routePrompt(
  state: typeof AgentState.State,
): Promise<{ route: AgentRoute }> {
  if (state.attachment?.mimeType === 'application/pdf') {
    return { route: 'pdf' };
  }
  if (state.attachment?.mimeType.startsWith('image/')) {
    return { route: 'image' };
  }

  const latestMessage = String(state.messages.at(-1)?.content ?? '').trim();
  if (
    /\b(code|coding|program(?:ming)?|debug(?:ging)?|bug|compile|compiler|typescript|javascript|python|react|next\.?js|refactor|stack trace)\b/i.test(
      latestMessage,
    )
  ) {
    return { route: 'coding' };
  }

  const recentMessages = state.messages
    .slice(-10)
    .map((message) => `${message._getType()}: ${String(message.content)}`)
    .join('\n');

  const decision = await routerModel.invoke([
    [
      'system',
      `Route the conversation to exactly one available agent:
- chat: general conversation, explanations, and questions.
- coding: writing, debugging, or explaining code.
- image: generating or editing images.
- pdf: questions about or work with PDF documents.
- search: requests that need current information from web search.
Choose chat for requests that do not clearly need a specialized agent.`,
    ],
    ['human', recentMessages],
  ]);

  return { route: decision.route };
}
