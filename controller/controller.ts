import { Request, Response } from 'express';
import { buildAuthenticatedUser, issueAuthTokens } from '../utils/auth';

export function ping(req: Request, res: Response) {
  res.json({
    msg: 'pong',
  });
}

export function signup(req: Request, res: Response) {
  try {
    const { email, role, permissions } = req.body;

    if (typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ msg: 'A valid email is required!' });
      return;
    }

    const user = buildAuthenticatedUser({
      email: email.trim().toLowerCase(),
      role,
      permissions,
    });
    const { accessToken, sessionToken } = issueAuthTokens(user);

    res.cookie('auth_session', sessionToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid role')) {
      res.status(400).json({ msg: error.message });
      return;
    }

    if (error instanceof Error && error.message.includes('permissions')) {
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
  res.clearCookie('auth_session');
  res.json({
    msg: 'Logged out successfully.',
  });
}
