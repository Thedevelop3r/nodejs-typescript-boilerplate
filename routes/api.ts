import express from 'express';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
// import controller functions

import { login, logout, ping, signup, ipAddress } from '../controller/controller';
import { auth } from '../middleware/auth';
import { requirePermissions } from '../middleware/authorize';
import { csrf } from '../middleware/csrf';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ msg: 'send all related apis' });
});

router.get('/ping', ping);

router.post(
  '/ip',
  rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }),
  csrf,
  auth,
  requirePermissions('profile:read'),
  ipAddress
);
router.post(
  '/signup',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }),
  signup
);
router.post(
  '/login',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }),
  login
);
router.post(
  '/logout',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }),
  csrf,
  logout
);

export default router;
