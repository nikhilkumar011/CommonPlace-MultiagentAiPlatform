import type { NextFunction, Request, Response } from 'express';
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logout(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getCurrentUser(_req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=authController.d.ts.map