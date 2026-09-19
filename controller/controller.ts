import { Request, Response } from 'express';
import { encryptData, getEncryptionKey } from '../utils/dataEncryption';

export function ping(req: Request, res: Response) {
  res.json({
    msg: 'pong',
  });
}

export function signup(req: Request, res: Response) {
  const { email } = req.body;

  let encryptEmail;

  try {
    encryptEmail = encryptData({ email }, getEncryptionKey());
  } catch {
    res.status(500).json({ msg: 'Server configuration error!' });
    return;
  }

  res.json({
    email,
    signedKey: encryptEmail,
  });
}

export function ipAddress(req: Request, res: Response) {
  const { ip, user } = req;

  res.json({
    ip,
    user,
  });
}
