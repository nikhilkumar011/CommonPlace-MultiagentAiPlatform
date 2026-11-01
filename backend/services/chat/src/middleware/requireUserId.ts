import type { NextFunction, Request, Response } from 'express';

export function requireUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = req.get('x-user-id');
  if (!userId) {
    res.status(401).json({ message: 'Authenticated user ID is required.' });
    return;
  }

  res.locals.userId = userId;
  next();
}
