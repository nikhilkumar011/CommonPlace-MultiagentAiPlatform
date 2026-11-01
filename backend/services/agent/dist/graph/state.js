import { Annotation } from '@langchain/langgraph';
export const agentRoutes = ['chat', 'coding', 'image', 'pdf', 'search'];
export const AgentState = Annotation.Root({
    messages: Annotation({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),
    route: Annotation({
        reducer: (_current, update) => update,
        default: () => 'chat',
    }),
    userId: Annotation({
        reducer: (_current, update) => update,
        default: () => '',
    }),
    attachment: Annotation({
        reducer: (_current, update) => update,
        default: () => null,
    }),
    documentNamespace: Annotation({
        reducer: (_current, update) => update,
        default: () => null,
    }),
    artifact: Annotation({
        reducer: (_current, update) => update,
        default: () => null,
    }),
});
//# sourceMappingURL=state.js.map