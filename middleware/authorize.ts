import { NextFunction, Request, Response } from 'express';
import { hasPermissions } from '../utils/auth';

export function requirePermissions(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ msg: 'Not Authorized!' });
      return;
    }

    if (!hasPermissions(req.user.permissions, permissions)) {
      res.status(403).json({ msg: 'Forbidden!' });
      return;
    }

    next();
  };
}
