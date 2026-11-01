export interface SessionUser {
    id: string;
    name: string;
    email: string;
    profilePic: string;
}
interface UserSession {
    userId: string;
    user: SessionUser;
}
export declare function createUserSession(user: SessionUser): Promise<string>;
export declare function getUserSession(sessionId: string): Promise<UserSession | null>;
export declare function deleteUserSession(sessionId: string): Promise<void>;
export {};
//# sourceMappingURL=session.d.ts.map