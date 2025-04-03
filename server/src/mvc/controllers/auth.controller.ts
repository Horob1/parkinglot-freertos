import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import { signToken } from '../../helpers/jwt';
import env from '../../helpers/env';
import { StringValue } from 'ms';
import { IATPayload } from '../../interfaces/interface';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    // Find user
    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = await signToken<IATPayload>({
      payload: {
        _id: user._id.toString(),
      },
      privateKey: env.ACCESS_TOKEN_SECRET,
      options: {
        expiresIn: env.ACCESS_TOKEN_LIFE as StringValue,
      },
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
