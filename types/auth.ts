export const ROLE_PERMISSIONS = {
  admin: ['profile:read', 'profile:write', 'user:manage'],
  editor: ['profile:read', 'profile:write'],
  viewer: ['profile:read'],
} as const;

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

export interface AuthenticatedUser {
  email: string;
  role: UserRole;
  permissions: string[];
  sessionId: string;
}
