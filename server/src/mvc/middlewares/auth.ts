import { Response, Request, NextFunction } from 'express';
import { verifyToken } from '../../helpers/jwt';
import env from '../../helpers/env';
import { IATPayload } from '../../interfaces/interface';
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1]; // Extract actual token
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    const tokenPayload = await verifyToken<IATPayload>(token, env.ACCESS_TOKEN_SECRET);
    req.user = tokenPayload;

    next();
  } catch (e) {
    return res.status(401).json({ message: e.message });
  }
};
