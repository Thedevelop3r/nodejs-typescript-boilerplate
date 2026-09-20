import crypto from 'crypto';
import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedUser, ROLE_PERMISSIONS, UserRole } from '../types/auth';

const ACCESS_TOKEN_TYPE = 'access';
const SESSION_TOKEN_TYPE = 'session';
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

interface TokenClaims extends AuthenticatedUser {
  type: typeof ACCESS_TOKEN_TYPE | typeof SESSION_TOKEN_TYPE;
}

function getAuthSecret(): string {
  return process.env.JWT_SECRET ?? process.env.AUTH_JWT_SECRET ?? getFallbackSecret();
}

function getCookieSecret(): string {
  return process.env.COOKIE_SECRET ?? getFallbackSecret();
}

function getFallbackSecret(): string {
  const fallbackSecret = process.env.ENCRYPTION_KEY;

  if (!fallbackSecret) {
    throw new Error(
      'JWT_SECRET or ENCRYPTION_KEY environment variable is required for auth'
    );
  }

  return fallbackSecret;
}

function isUserRole(role: string): role is UserRole {
  return role in ROLE_PERMISSIONS;
}

function getRolePermissions(role: UserRole): string[] {
  return [...ROLE_PERMISSIONS[role]];
}

function resolveUserRole(role?: string): UserRole {
  if (!role) {
    return 'viewer';
  }

  if (!isUserRole(role)) {
    throw new Error('Invalid role supplied');
  }

  return role;
}

function buildAuthenticatedUser({
  email,
  role,
}: {
  email: string;
  role?: string;
}): AuthenticatedUser {
  const resolvedRole = resolveUserRole(role);

  return {
    email,
    role: resolvedRole,
    permissions: getRolePermissions(resolvedRole),
    sessionId: crypto.randomUUID(),
  };
}

function signToken(user: AuthenticatedUser, type: TokenClaims['type']): string {
  return jwt.sign({ ...user, type }, getAuthSecret(), {
    algorithm: 'HS256',
    expiresIn: type === ACCESS_TOKEN_TYPE ? '15m' : '7d',
  });
}

function issueAuthTokens(user: AuthenticatedUser) {
  return {
    accessToken: signToken(user, ACCESS_TOKEN_TYPE),
    sessionToken: signToken(user, SESSION_TOKEN_TYPE),
  };
}

function verifyToken(token: string, expectedType: TokenClaims['type']): AuthenticatedUser {
  const decoded = jwt.verify(token, getAuthSecret(), {
    algorithms: ['HS256'],
  });

  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token payload');
  }

  const { type, email, role, permissions, sessionId } = decoded as Partial<TokenClaims>;

  if (
    type !== expectedType ||
    typeof email !== 'string' ||
    typeof role !== 'string' ||
    !isUserRole(role) ||
    !Array.isArray(permissions) ||
    permissions.some((permission) => typeof permission !== 'string') ||
    typeof sessionId !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return {
    email,
    role,
    permissions,
    sessionId,
  };
}

function hasPermissions(grantedPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every((permission) => grantedPermissions.includes(permission));
}

function hasMatchingPermissions(
  leftPermissions: string[],
  rightPermissions: string[]
): boolean {
  if (leftPermissions.length !== rightPermissions.length) {
    return false;
  }

  return leftPermissions.every((permission) => rightPermissions.includes(permission));
}

function buildCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };
}

function getSessionCookieOptions(): CookieOptions {
  return {
    ...getCookieOptions(),
    maxAge: SESSION_COOKIE_MAX_AGE,
  };
}

function getSessionClearCookieOptions(): CookieOptions {
  return getCookieOptions();
}

function getCsrfCookieOptions(): CookieOptions {
  return {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_COOKIE_MAX_AGE,
  };
}

function getCsrfClearCookieOptions(): CookieOptions {
  return {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };
}

export {
  ACCESS_TOKEN_TYPE,
  SESSION_TOKEN_TYPE,
  buildAuthenticatedUser,
  buildCsrfToken,
  getCookieSecret,
  getCsrfClearCookieOptions,
  getCsrfCookieOptions,
  getRolePermissions,
  getSessionClearCookieOptions,
  getSessionCookieOptions,
  hasPermissions,
  hasMatchingPermissions,
  issueAuthTokens,
  isUserRole,
  verifyToken,
};
