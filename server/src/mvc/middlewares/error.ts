import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('Error:', err.message);
  res.status(404).json({ message: err.message });
};
