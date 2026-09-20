import { NextFunction, Request, Response } from 'express';

export function csrf(req: Request, res: Response, next: NextFunction): void {
  if (!req.signedCookies?.auth_session) {
    next();
    return;
  }

  const csrfCookie = req.cookies?.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];

  if (
    typeof csrfCookie !== 'string' ||
    typeof csrfHeader !== 'string' ||
    csrfCookie !== csrfHeader
  ) {
    res.status(403).json({ msg: 'Invalid CSRF token!' });
    return;
  }

  next();
}
