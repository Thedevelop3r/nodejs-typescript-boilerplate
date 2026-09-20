# Project Manual

This manual explains how to use this boilerplate as a starting point, how the current auth system works, and how to safely extend the project for your own applications.

## 1. What this repository gives you

This boilerplate is a minimal Express + TypeScript backend with:

- TypeScript compilation to `dist/`
- Express route/controller/middleware separation
- Environment-variable based configuration with `dotenv`
- JWT access-token authentication
- Signed HTTP-only cookie session authentication
- Role-based permissions middleware
- Basic CSRF protection for cookie-backed unsafe requests
- Basic rate limiting on auth-related routes

It is intentionally small so you can adapt it to your own project architecture.

## 2. Project structure

```text
controller/              Request handlers
middleware/              Express middleware
routes/                  API route definitions
types/                   Shared TypeScript types and Express augmentation
utils/                   Auth and utility helpers
server.ts                Application entry point
README.md                Quick-start overview
MANUAL.md                This longer guide
```

## 3. Install and run

### Prerequisites

- Node.js 24.x
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Typecheck

```bash
npm test
```

### Build

```bash
npm run build
```

### Run compiled app

```bash
npm start
```

## 4. Environment variables

Create a `.env` file in the repository root.

Recommended variables:

```env
PORT=3000
NODE_ENV=development
ENCRYPTION_KEY=12345678901234567890123456789012
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_SECRET=replace-with-a-separate-long-random-secret
```

### What each variable does

- `PORT`: HTTP port
- `NODE_ENV`: controls production cookie security behavior
- `JWT_SECRET`: signs and verifies JWT access/session tokens
- `COOKIE_SECRET`: signs the `auth_session` cookie
- `ENCRYPTION_KEY`: fallback secret if `JWT_SECRET` or `COOKIE_SECRET` are not set

For real projects, prefer setting `JWT_SECRET` and `COOKIE_SECRET` explicitly instead of relying on the fallback.

## 5. Current auth flow

The old `signedkey` header flow has been replaced.

Protected routes now require:

1. A JWT access token in the `Authorization` header
2. A signed `auth_session` cookie
3. A CSRF token for unsafe cookie-backed requests

### Available auth endpoints

#### `POST /api/signup`

Creates a demo authenticated session.

#### `POST /api/login`

Creates a demo authenticated session through the login endpoint.

> In this boilerplate, `signup` and `login` share the same session-issuance logic because there is no database yet. In a real project, this is where you would separate user registration from credential verification.

#### `POST /api/logout`

Clears the session and CSRF cookies.

### Example signup/login body

```json
{
  "email": "admin@example.com",
  "role": "admin"
}
```

### Example signup/login response

```json
{
  "email": "admin@example.com",
  "role": "admin",
  "permissions": ["profile:read", "profile:write", "user:manage"],
  "accessToken": "jwt-access-token",
  "csrfToken": "csrf-token"
}
```

### Calling a protected route

You must send:

- an `Authorization` header carrying the JWT access token
- `auth_session` cookie from signup/login
- `x-csrf-token: <csrfToken>` header for unsafe requests

Example protected route:

- `POST /api/ip`

This route also requires the `profile:read` permission.

## 6. Roles and permissions

Built-in roles live in `/types/auth.ts`.

Current defaults:

- `viewer` → `profile:read`
- `editor` → `profile:read`, `profile:write`
- `admin` → `profile:read`, `profile:write`, `user:manage`

### How permissions are enforced

- `middleware/auth.ts` validates the JWT + signed cookie pair
- `middleware/authorize.ts` checks route-level permissions
- `req.user` is populated with the authenticated user payload

### How to add a new role

Edit `ROLE_PERMISSIONS` in `/types/auth.ts`.

Example:

```ts
export const ROLE_PERMISSIONS = {
  admin: ['profile:read', 'profile:write', 'user:manage'],
  editor: ['profile:read', 'profile:write'],
  viewer: ['profile:read'],
  analyst: ['profile:read', 'reports:read'],
} as const;
```

Then protect a route with the required permission:

```ts
router.post('/reports', auth, requirePermissions('reports:read'), handler);
```

## 7. How to add new routes

### Step 1: Create or update a controller

Add a handler in `controller/controller.ts` or split into multiple controller files if the project grows.

### Step 2: Wire the route

Add the route in `routes/api.ts`.

Examples:

- Public route:

```ts
router.get('/health', healthHandler);
```

- Authenticated route:

```ts
router.post('/profile', auth, requirePermissions('profile:read'), profileHandler);
```

### Step 3: Decide middleware needs

For each new route, decide whether it needs:

- rate limiting
- auth
- permission checks
- CSRF-sensitive unsafe request handling

## 8. How to customize auth for a real project

This boilerplate does not include a database or passwords yet. For a production app, you would usually add:

- a user table/model
- password hashing (`bcrypt` or `argon2`)
- registration validation
- login credential verification
- token rotation and refresh strategy
- persistent session revocation or denylisting
- audit logging

### Recommended evolution path

1. Add a real user store
2. Split `signup` and `login`
3. Validate email/password input
4. Hash passwords before storage
5. Use database-backed roles/permissions if needed
6. Add refresh-token or session revocation support
7. Add automated tests around auth flows

## 9. How to reorganize as your app grows

As soon as your app becomes more than a few routes, consider restructuring:

- `controller/authController.ts`
- `controller/userController.ts`
- `routes/auth.ts`
- `routes/users.ts`
- `middleware/auth.ts`
- `middleware/authorize.ts`
- `services/authService.ts`
- `services/userService.ts`
- `models/`
- `validators/`

This keeps each concern smaller and easier to maintain.

## 10. How to modify middleware safely

When editing auth or security middleware:

1. Keep changes small
2. Re-run:
   - `npm test`
   - `npm run build`
3. Manually exercise:
   - signup/login
   - protected route access
   - missing/invalid token cases
   - logout

If you change cookie behavior, also verify:

- `secure` handling in production
- `sameSite` behavior
- cookie clearing on logout
- CSRF token validation on unsafe methods

## 11. How to replace the demo auth model

If you want token-only auth:

- change `middleware/auth.ts`
- remove cookie dependency from protected routes
- remove CSRF enforcement if cookies are no longer used for auth

If you want cookie-only auth:

- remove the bearer token requirement from `middleware/auth.ts`
- store only the session token in the signed cookie
- keep CSRF protection for unsafe methods

If you want stricter double-auth:

- keep both bearer token and signed cookie
- add refresh-token rotation
- add server-side session storage or revocation

## 12. How to append new features on top

Common next additions:

- database integration
- request validation
- structured logging
- centralized error handling
- testing framework
- background jobs
- file uploads
- email delivery
- admin-only routes

Recommended order:

1. Add validation
2. Add database models
3. Add real auth storage
4. Add tests
5. Add domain-specific business logic

## 13. Common files to edit for customization

### Rename or change project identity

- `package.json`
- `README.md`
- `MANUAL.md`

### Change security behavior

- `middleware/auth.ts`
- `middleware/csrf.ts`
- `middleware/authorize.ts`
- `utils/auth.ts`
- `types/auth.ts`

### Add endpoints

- `routes/api.ts`
- `controller/`

### Change app bootstrap behavior

- `server.ts`

## 14. Suggested first steps for your own project

If you fork this boilerplate for a real app:

1. Rename the package in `package.json`
2. Replace the README with your project-specific overview
3. Set real secrets in the environment
4. Add your user model/database
5. Replace demo signup/login behavior with real persistence
6. Add validation for every request body
7. Add a real automated test framework

## 15. Validation checklist after changes

Whenever you extend the project, verify:

- `npm test`
- `npm run build`
- protected routes still reject invalid tokens
- permissions still block unauthorized access
- logout clears cookies
- docs still match behavior

## 16. Final note

This repository is best treated as a secure starting point, not a finished auth platform. Use it to accelerate new projects, but plan to add persistence, validation, testing, and domain-specific structure as your application grows.
