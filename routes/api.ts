import express from 'express';
import { Request, Response } from 'express';
// import controller functions

import { logout, ping, signup, ipAddress } from '../controller/controller';
import { auth } from '../middleware/auth';
import { requirePermissions } from '../middleware/authorize';
import { csrf } from '../middleware/csrf';
import { createRateLimit } from '../middleware/rateLimit';

const router = express.Router();
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 });
const protectedRateLimit = createRateLimit({ windowMs: 60 * 1000, maxRequests: 30 });

router.get('/', (req: Request, res: Response) => {
  res.json({ msg: 'send all related apis' });
});

router.get('/ping', ping);

router.post('/ip', protectedRateLimit, csrf, auth, requirePermissions('profile:read'), ipAddress);
router.post('/signup', authRateLimit, signup);
router.post('/login', authRateLimit, signup);
router.post('/logout', authRateLimit, csrf, logout);

export default router;
