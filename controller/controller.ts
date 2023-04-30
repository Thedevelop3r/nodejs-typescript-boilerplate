import { Request, Response } from 'express';
import { encryptData } from '../utils/dataEncryption';

export async function ping(req: Request, res: Response) {
  res.json({
    msg: 'pong',
  });
}

export async function signup(req: Request, res: Response) {
  const { email } = req.body;
  const encryptEmail = encryptData({ email: email }, process.env.ENCRYPTION_KEY);

  res.json({
    email: email,
    signedKey: encryptEmail,
  });
}

interface AuthenticatedRequest extends Request {
  user: string; // replace string with the actual type of the user object
}
export async function ipAddress(req: AuthenticatedRequest, res: Response) {
  const { ip, user } = req;

  res.json({
    ip,
    user
  });
}
