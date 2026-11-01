import type { Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const AUTH_COOKIE_NAME = 'auth_token';
const TOKEN_LIFETIME_SECONDS = 60 * 60;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set in the environment');
  }
  return secret;
}

export function createToken(userId: string, sessionId: string): string {
  return jwt.sign({ sub: userId, sid: sessionId }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: TOKEN_LIFETIME_SECONDS,
  });
}

export function verifyToken(token: string): JwtPayload | string {
  return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_LIFETIME_SECONDS * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
