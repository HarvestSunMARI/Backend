import { Request, Response, NextFunction } from 'express';

export function supabaseAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    (req as any).supabaseToken = token;
  }
  next();
} 