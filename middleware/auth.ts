import { Request, Response } from 'express';
import { decryptData } from '../utils/dataEncryption';

interface AuthenticatedRequest extends Request {
  user: string; // replace string with the actual type of the user object
}

export async function auth(req: AuthenticatedRequest, res: Response, next: any) {
  const signedKey = req.headers.signedkey;
  if (!signedKey) return res.status(400).json({ msg: 'Not Authorized!' });

  try {
    const decryptEmail = decryptData(signedKey as String, process.env.ENCRYPTION_KEY);
    req.user = decryptEmail;
    next();
  } catch (error) {
    return res.status(400).json({ msg: 'Invalid Parameters!' });
  }
}
