import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/utils/jwt.js';
import { getUserSession } from '../lib/utils/session.js';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.auth_token;
  if (typeof token !== 'string' || !token) {
    res.status(401).json({ message: 'Authentication cookie is required.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string'
    ) {
      res.status(401).json({ message: 'Invalid or expired token.' });
      return;
    }

    try {
      const session = await getUserSession(payload.sid);
      if (!session || session.userId !== payload.sub) {
        res.status(401).json({ message: 'Session is invalid or expired.' });
        return;
      }

      res.locals.userId = session.userId;
      res.locals.sessionId = payload.sid;
      res.locals.sessionUser = session.user;
      next();
    } catch (error) {
      next(error);
    }
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
