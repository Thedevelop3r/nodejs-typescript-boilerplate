import express from 'express';
import { Request, Response } from 'express';
// import controller functions

import { ping, signup, ipAddress } from '../controller/controller';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ msg: 'send all related apis' });
});

router.get('/ping', ping);

router.post('/ip', auth, ipAddress);
router.post('/signup', signup);

export default router;
