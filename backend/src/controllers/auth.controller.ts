import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerUser(req.body);
    sendSuccess(res, result, 'Account created successfully', 201);
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (err) { next(err); }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, businessName: true, phone: true, address: true, currency: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, user, 'Profile retrieved');
  } catch (err) { next(err); }
}