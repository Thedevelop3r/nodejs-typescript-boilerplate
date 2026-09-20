import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AuthenticatedUser, ROLE_PERMISSIONS, UserRole } from '../types/auth';

const ACCESS_TOKEN_TYPE = 'access';
const SESSION_TOKEN_TYPE = 'session';

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

function resolvePermissions(role: UserRole, permissions?: unknown): string[] {
  const basePermissions = getRolePermissions(role);

  if (!permissions) {
    return basePermissions;
  }

  if (!Array.isArray(permissions) || permissions.some((permission) => typeof permission !== 'string')) {
    throw new Error('permissions must be an array of strings');
  }

  return [...new Set([...basePermissions, ...permissions])];
}

function buildAuthenticatedUser({
  email,
  role,
  permissions,
}: {
  email: string;
  role?: string;
  permissions?: unknown;
}): AuthenticatedUser {
  const resolvedRole = resolveUserRole(role);

  return {
    email,
    role: resolvedRole,
    permissions: resolvePermissions(resolvedRole, permissions),
    sessionId: crypto.randomUUID(),
  };
}

function signToken(user: AuthenticatedUser, type: TokenClaims['type']): string {
  return jwt.sign({ ...user, type }, getAuthSecret(), { expiresIn: type === ACCESS_TOKEN_TYPE ? '15m' : '7d' });
}

function issueAuthTokens(user: AuthenticatedUser) {
  return {
    accessToken: signToken(user, ACCESS_TOKEN_TYPE),
    sessionToken: signToken(user, SESSION_TOKEN_TYPE),
  };
}

function verifyToken(token: string, expectedType: TokenClaims['type']): AuthenticatedUser {
  const decoded = jwt.verify(token, getAuthSecret());

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

export {
  ACCESS_TOKEN_TYPE,
  SESSION_TOKEN_TYPE,
  buildAuthenticatedUser,
  getCookieSecret,
  getRolePermissions,
  hasPermissions,
  issueAuthTokens,
  isUserRole,
  verifyToken,
};
