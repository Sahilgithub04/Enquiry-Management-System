import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User, UserRole } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorMiddleware';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.AGENT),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const passwordHash = await hashPassword(validated.password);
    const newUser = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      role: validated.role,
    });

    const token = generateToken({
      userId: newUser._id.toString(),
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await comparePassword(validated.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthenticated', 401);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
