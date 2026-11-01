import type { AgentRoute } from '../graph/state.js';
export declare class AgentRateLimitError extends Error {
    readonly route: AgentRoute;
    readonly limit: number;
    readonly retryAfterSeconds: number;
    readonly statusCode = 429;
    constructor(route: AgentRoute, limit: number, retryAfterSeconds: number);
}
export declare function enforceAgentRateLimit(userId: string, route: AgentRoute): Promise<void>;
//# sourceMappingURL=agentRateLimit.d.ts.map