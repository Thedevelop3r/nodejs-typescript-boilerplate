import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

function getCsrfTokenFromRequest(req: Request): string | undefined {
  const csrfHeader = req.headers['x-csrf-token'];

  if (typeof csrfHeader === 'string') {
    return csrfHeader;
  }

  const body = req.body as Record<string, unknown> | undefined;
  const csrfBodyToken = body?.csrfToken ?? body?._csrf;

  return typeof csrfBodyToken === 'string' ? csrfBodyToken : undefined;
}

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
  const csrfToken = getCsrfTokenFromRequest(req);

  if (typeof csrfCookie !== 'string' || typeof csrfToken !== 'string') {
    res.status(403).json({ msg: 'Invalid CSRF token!' });
    return;
  }

  const csrfCookieBuffer = Buffer.from(csrfCookie);
  const csrfTokenBuffer = Buffer.from(csrfToken);

  if (
    csrfCookieBuffer.length !== csrfTokenBuffer.length ||
    !crypto.timingSafeEqual(csrfCookieBuffer, csrfTokenBuffer)
  ) {
    res.status(403).json({ msg: 'Invalid CSRF token!' });
    return;
  }

  next();
}
