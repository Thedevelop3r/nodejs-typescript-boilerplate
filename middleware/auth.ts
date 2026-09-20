import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/auth';

function getBearerToken(req: Request): string | undefined {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return undefined;
  }

  return authorization.slice('Bearer '.length).trim();
}

export function auth(req: Request, res: Response, next: NextFunction): void {
  const accessToken = getBearerToken(req);
  const sessionToken = req.signedCookies?.auth_session;

  if (!accessToken || typeof sessionToken !== 'string') {
    res.status(401).json({ msg: 'Authorization header and auth_session cookie are required!' });
    return;
  }

  try {
    const accessUser = verifyToken(accessToken, 'access');
    const sessionUser = verifyToken(sessionToken, 'session');

    if (
      accessUser.sessionId !== sessionUser.sessionId ||
      accessUser.email !== sessionUser.email ||
      accessUser.role !== sessionUser.role
    ) {
      res.status(401).json({ msg: 'Auth tokens do not match!' });
      return;
    }

    req.user = accessUser;
    next();
  } catch {
    res.status(401).json({ msg: 'Invalid auth token!' });
  }
}
