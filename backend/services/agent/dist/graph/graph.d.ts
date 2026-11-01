export declare const agentGraph: import("@langchain/langgraph").CompiledStateGraph<{
    messages: import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[];
    route: "chat" | "coding" | "image" | "pdf" | "search";
    userId: string;
    attachment: import("./state.js").AgentAttachment | null;
    documentNamespace: string | null;
    artifact: import("./state.js").AgentArtifact | null;
}, {
    messages?: import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>;
    route?: "chat" | "coding" | "image" | "pdf" | "search" | import("@langchain/langgraph").OverwriteValue<"chat" | "coding" | "image" | "pdf" | "search">;
    userId?: string | import("@langchain/langgraph").OverwriteValue<string>;
    attachment?: import("./state.js").AgentAttachment | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentAttachment | null> | null;
    documentNamespace?: string | import("@langchain/langgraph").OverwriteValue<string | null> | null;
    artifact?: import("./state.js").AgentArtifact | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentArtifact | null> | null;
}, "__start__" | "chat" | "coding" | "image" | "pdf" | "rateLimit" | "router" | "search", {
    messages: import("@langchain/langgraph").BaseChannel<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[], import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>, unknown>;
    route: import("@langchain/langgraph").BaseChannel<"chat" | "coding" | "image" | "pdf" | "search", "chat" | "coding" | "image" | "pdf" | "search" | import("@langchain/langgraph").OverwriteValue<"chat" | "coding" | "image" | "pdf" | "search">, unknown>;
    userId: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    attachment: import("@langchain/langgraph").BaseChannel<import("./state.js").AgentAttachment | null, import("./state.js").AgentAttachment | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentAttachment | null> | null, unknown>;
    documentNamespace: import("@langchain/langgraph").BaseChannel<string | null, string | import("@langchain/langgraph").OverwriteValue<string | null> | null, unknown>;
    artifact: import("@langchain/langgraph").BaseChannel<import("./state.js").AgentArtifact | null, import("./state.js").AgentArtifact | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentArtifact | null> | null, unknown>;
}, {
    messages: import("@langchain/langgraph").BaseChannel<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[], import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>, unknown>;
    route: import("@langchain/langgraph").BaseChannel<"chat" | "coding" | "image" | "pdf" | "search", "chat" | "coding" | "image" | "pdf" | "search" | import("@langchain/langgraph").OverwriteValue<"chat" | "coding" | "image" | "pdf" | "search">, unknown>;
    userId: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    attachment: import("@langchain/langgraph").BaseChannel<import("./state.js").AgentAttachment | null, import("./state.js").AgentAttachment | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentAttachment | null> | null, unknown>;
    documentNamespace: import("@langchain/langgraph").BaseChannel<string | null, string | import("@langchain/langgraph").OverwriteValue<string | null> | null, unknown>;
    artifact: import("@langchain/langgraph").BaseChannel<import("./state.js").AgentArtifact | null, import("./state.js").AgentArtifact | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentArtifact | null> | null, unknown>;
}, import("@langchain/langgraph").StateDefinition, {
    chat: {
        messages: Awaited<ReturnType<(input: import("@langchain/core/language_models/base").BaseLanguageModelInput, options?: Partial<import("@langchain/google-genai").GoogleGenerativeAIChatCallOptions> | undefined) => Promise<import("@langchain/core/messages").AIMessageChunk<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>>>>>[];
    };
    coding: {
        messages: Awaited<ReturnType<(input: import("@langchain/core/language_models/base").BaseLanguageModelInput, options?: Partial<import("@langchain/google-genai").GoogleGenerativeAIChatCallOptions> | undefined) => Promise<import("@langchain/core/messages").AIMessageChunk<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>>>>>[];
    };
    image: {
        messages: import("@langchain/core/messages").AIMessage[];
        artifact: import("./state.js").AgentArtifact | null;
    };
    pdf: {
        messages: import("@langchain/core/messages").AIMessage[];
    };
    rateLimit: import("@langchain/langgraph").UpdateType<{
        messages: import("@langchain/langgraph").BaseChannel<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[], import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>, unknown>;
        route: import("@langchain/langgraph").BaseChannel<"chat" | "coding" | "image" | "pdf" | "search", "chat" | "coding" | "image" | "pdf" | "search" | import("@langchain/langgraph").OverwriteValue<"chat" | "coding" | "image" | "pdf" | "search">, unknown>;
        userId: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
        attachment: import("@langchain/langgraph").BaseChannel<import("./state.js").AgentAttachment | null, import("./state.js").AgentAttachment | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentAttachment | null> | null, unknown>;
        documentNamespace: import("@langchain/langgraph").BaseChannel<string | null, string | import("@langchain/langgraph").OverwriteValue<string | null> | null, unknown>;
        artifact: import("@langchain/langgraph").BaseChannel<import("./state.js").AgentArtifact | null, import("./state.js").AgentArtifact | import("@langchain/langgraph").OverwriteValue<import("./state.js").AgentArtifact | null> | null, unknown>;
    }>;
    router: {
        route: import("./state.js").AgentRoute;
    };
    search: {
        messages: import("@langchain/core/messages").AIMessage[];
    };
}, unknown, unknown, []>;
//# sourceMappingURL=graph.d.ts.map