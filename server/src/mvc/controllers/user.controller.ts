import { Request, Response } from 'express';

export const getMe = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'ok',
    data: req.user,
  });
};
