import { NextFunction, Request, Response } from 'express';
import { decryptData, getEncryptionKey } from '../utils/dataEncryption';

export function auth(req: Request, res: Response, next: NextFunction): void {
  const signedKey = req.headers.signedkey;

  if (typeof signedKey !== 'string') {
    res.status(400).json({ msg: 'Not Authorized!' });
    return;
  }

  let encryptionKey;

  try {
    encryptionKey = getEncryptionKey();
  } catch {
    res.status(500).json({ msg: 'Server configuration error!' });
    return;
  }

  try {
    req.user = decryptData(signedKey, encryptionKey);
    next();
  } catch {
    res.status(400).json({ msg: 'Invalid Parameters!' });
  }
}
