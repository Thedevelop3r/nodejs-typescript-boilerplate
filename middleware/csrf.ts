import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function csrf(req: Request, res: Response, next: NextFunction): void {
  const signedSessionCookie = req.signedCookies?.auth_session;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  if (typeof signedSessionCookie === 'undefined') {
    next();
    return;
  }

  if (signedSessionCookie === false || typeof signedSessionCookie !== 'string') {
    res.status(403).json({ msg: 'Invalid session cookie!' });
    return;
  }

  const csrfCookie = req.cookies?.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];

  if (typeof csrfCookie !== 'string' || typeof csrfHeader !== 'string') {
    res.status(403).json({ msg: 'Invalid CSRF token!' });
    return;
  }

  const csrfCookieBuffer = Buffer.from(csrfCookie);
  const csrfHeaderBuffer = Buffer.from(csrfHeader);

  if (
    csrfCookieBuffer.length !== csrfHeaderBuffer.length ||
    !crypto.timingSafeEqual(csrfCookieBuffer, csrfHeaderBuffer)
  ) {
    res.status(403).json({ msg: 'Invalid CSRF token!' });
    return;
  }

  next();
}
