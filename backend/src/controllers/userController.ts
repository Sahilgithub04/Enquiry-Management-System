import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { User, UserRole } from '../models/User';
import { hashPassword } from '../utils/password';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorMiddleware';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const getUsers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = createUserSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const passwordHash = await hashPassword(validated.password);
    const user = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      role: validated.role,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = updateUserSchema.parse(req.body);

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (validated.email && validated.email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({ email: validated.email.toLowerCase() });
      if (existingEmail) {
        throw new AppError('Email is already in use', 400);
      }
      user.email = validated.email.toLowerCase();
    }

    if (validated.name) user.name = validated.name;
    if (validated.role) user.role = validated.role;
    if (validated.password) {
      user.passwordHash = await hashPassword(validated.password);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    if (id === currentUserId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      throw new AppError('User not found', 404);
    }

    // Check if user to delete is an ADMIN and if it's the last admin
    if (userToDelete.role === UserRole.ADMIN) {
      const adminCount = await User.countDocuments({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        throw new AppError('Cannot delete the only remaining administrator', 400);
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
