import type { Response } from 'express';
import { type JwtPayload } from 'jsonwebtoken';
export declare function createToken(userId: string, sessionId: string): string;
export declare function verifyToken(token: string): JwtPayload | string;
export declare function setAuthCookie(res: Response, token: string): void;
export declare function clearAuthCookie(res: Response): void;
//# sourceMappingURL=jwt.d.ts.map