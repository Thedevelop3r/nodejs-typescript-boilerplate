# Node.js TypeScript Boilerplate

A production-ready, bare-bones boilerplate for building typed Node.js Express servers with TypeScript on the latest Node.js 24 LTS release line.

## Overview

This boilerplate provides a minimal yet structured foundation for creating scalable, maintainable Node.js applications using Express and TypeScript. It comes pre-configured with essential tooling and best practices to help you get started quickly.

## Features

- ✅ **TypeScript Support** - Full type safety and modern JavaScript features
- ✅ **Express.js Framework** - Lightweight and flexible web server framework
- ✅ **Development Environment** - `tsx watch` for fast TypeScript hot-reload during development
- ✅ **Type Definitions** - Includes @types packages for Node.js and Express
- ✅ **Environment Variables** - dotenv for managing configuration
- ✅ **JWT + Cookie Auth** - Access token header plus signed HTTP-only session cookie
- ✅ **Role-Based Permissions** - Reusable RBAC helpers for roles and permissions
- ✅ **Production Ready** - Optimized build process and deployment configuration

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Development:** tsx
- **Configuration:** dotenv
- **Auth:** jsonwebtoken + cookie-parser

## Prerequisites

- Node.js 24 LTS
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Thedevelop3r/nodejs-typescript-boilerplate.git
cd nodejs-typescript-boilerplate
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```
PORT=3000
NODE_ENV=development
ENCRYPTION_KEY=12345678901234567890123456789012
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_SECRET=replace-with-a-separate-long-random-secret
```

`JWT_SECRET` and `COOKIE_SECRET` are recommended. If they are omitted, the boilerplate falls back to `ENCRYPTION_KEY` so the sample project still boots with a single secret in local development.

## Usage

### Development Mode
Start the development server with hot-reload:
```bash
npm run dev
```

### Build
Compile TypeScript to JavaScript:
```bash
npm run build
```

### Test
Run the verification script used by CI:
```bash
npm test
```

## Auth API

> Breaking change: the previous `signedkey` header flow has been replaced. Protected routes now use the JWT + signed-cookie auth flow documented below.

### `POST /api/signup` or `POST /api/login`

Creates a demo authenticated session and returns a short-lived JWT access token while also setting a signed `auth_session` HTTP-only cookie.

Example request:
```json
{
  "email": "admin@example.com",
  "role": "admin"
}
```

Built-in roles:

- `viewer` → `profile:read`
- `editor` → `profile:read`, `profile:write`
- `admin` → `profile:read`, `profile:write`, `user:manage`

Permissions are assigned server-side from the selected role.

### `POST /api/ip`

Protected example endpoint. It requires both:

- an `Authorization` header carrying the JWT access token
- the signed `auth_session` cookie issued by signup/login
- an `x-csrf-token` header matching the `csrfToken` returned by signup/login

It also enforces the `profile:read` permission through the reusable authorization middleware.

### `POST /api/logout`

Clears the `auth_session` and `csrf_token` cookies. Like other cookie-backed POST routes, it is rate-limited and expects the matching `x-csrf-token` header.

### Production
Run the compiled application:
```bash
npm start
```

## Project Structure

```
.
├── controller/            # Request handlers
├── middleware/            # Express middleware
├── routes/                # API routes
├── utils/                 # Shared helpers
├── server.ts              # Entry point
├── dist/                  # Compiled JavaScript (auto-generated)
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Continuous Integration

GitHub Actions verifies every push to `main` and `dev`, plus pull requests into `main`, by running:

- `npm ci`
- `npm test`
- `npm run build`

## License

ISC

## Usage Rights

You are free to use, edit, update, upgrade, modify, extend, and republish this boilerplate for your projects.

---

**Happy coding!** 🚀
