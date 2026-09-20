import { Request, Response } from 'express';
import {
  buildAuthenticatedUser,
  buildCsrfToken,
  getCsrfClearCookieOptions,
  getCsrfCookieOptions,
  getSessionClearCookieOptions,
  getSessionCookieOptions,
  issueAuthTokens,
} from '../utils/auth';

export function ping(req: Request, res: Response) {
  res.json({
    msg: 'pong',
  });
}

export function signup(req: Request, res: Response) {
  try {
    const { email, role } = req.body;

    if (typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ msg: 'A valid email is required!' });
      return;
    }

    const user = buildAuthenticatedUser({
      email: email.trim().toLowerCase(),
      role,
    });
    const { accessToken, sessionToken } = issueAuthTokens(user);
    const csrfToken = buildCsrfToken();

    res.cookie('auth_session', sessionToken, {
      ...getSessionCookieOptions(),
      signed: true,
    });
    res.cookie('csrf_token', csrfToken, getCsrfCookieOptions());

    res.json({
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      accessToken,
      csrfToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid role')) {
      res.status(400).json({ msg: error.message });
      return;
    }

    res.status(500).json({ msg: 'Server configuration error!' });
    return;
  }
}

export function ipAddress(req: Request, res: Response) {
  const { ip, user } = req;

  res.json({
    ip,
    user,
  });
}

export function logout(req: Request, res: Response) {
  res.clearCookie('auth_session', getSessionClearCookieOptions());
  res.clearCookie('csrf_token', getCsrfClearCookieOptions());
  res.json({
    msg: 'Logged out successfully.',
  });
}
