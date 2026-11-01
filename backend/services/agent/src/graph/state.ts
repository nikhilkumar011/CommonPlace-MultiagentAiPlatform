import { Annotation } from '@langchain/langgraph';
import type { BaseMessage } from '@langchain/core/messages';

export const agentRoutes = ['chat', 'coding', 'image', 'pdf', 'search'] as const;
export type AgentRoute = (typeof agentRoutes)[number];

export interface AgentAttachment {
  name: string;
  mimeType: string;
  data: string;
}

export interface AgentArtifact {
  kind: 'image';
  name: string;
  mimeType: string;
  data: string;
}

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
  route: Annotation<AgentRoute>({
    reducer: (_current, update) => update,
    default: () => 'chat',
  }),
  userId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => '',
  }),
  attachment: Annotation<AgentAttachment | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  documentNamespace: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  artifact: Annotation<AgentArtifact | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
});

export type AgentGraphState = typeof AgentState.State;
