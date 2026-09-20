import { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const requests = new Map<string, number[]>();

export function createRateLimit({ maxRequests, windowMs }: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const recentRequests = (requests.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      res.status(429).json({ msg: 'Too many requests, please try again later.' });
      return;
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);
    next();
  };
}
