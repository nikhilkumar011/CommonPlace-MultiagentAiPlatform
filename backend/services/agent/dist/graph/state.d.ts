import type { BaseMessage } from '@langchain/core/messages';
export declare const agentRoutes: readonly ['chat', 'coding', 'image', 'pdf', 'search'];
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
export declare const AgentState: import("@langchain/langgraph").AnnotationRoot<{
    messages: import("@langchain/langgraph").BaseChannel<BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[], BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>, unknown>;
    route: import("@langchain/langgraph").BaseChannel<"chat" | "coding" | "image" | "pdf" | "search", "chat" | "coding" | "image" | "pdf" | "search" | import("@langchain/langgraph").OverwriteValue<"chat" | "coding" | "image" | "pdf" | "search">, unknown>;
    userId: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    attachment: import("@langchain/langgraph").BaseChannel<AgentAttachment | null, AgentAttachment | import("@langchain/langgraph").OverwriteValue<AgentAttachment | null> | null, unknown>;
    documentNamespace: import("@langchain/langgraph").BaseChannel<string | null, string | import("@langchain/langgraph").OverwriteValue<string | null> | null, unknown>;
    artifact: import("@langchain/langgraph").BaseChannel<AgentArtifact | null, AgentArtifact | import("@langchain/langgraph").OverwriteValue<AgentArtifact | null> | null, unknown>;
}>;
export type AgentGraphState = typeof AgentState.State;
//# sourceMappingURL=state.d.ts.map