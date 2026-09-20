import express from 'express';
import { Request, Response } from 'express';
// import controller functions

import { logout, ping, signup, ipAddress } from '../controller/controller';
import { auth } from '../middleware/auth';
import { requirePermissions } from '../middleware/authorize';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ msg: 'send all related apis' });
});

router.get('/ping', ping);

router.post('/ip', auth, requirePermissions('profile:read'), ipAddress);
router.post('/signup', signup);
router.post('/login', signup);
router.post('/logout', logout);

export default router;
