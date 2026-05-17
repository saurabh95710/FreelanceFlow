import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
      select: { id: true, name: true, email: true, businessName: true, phone: true, address: true, currency: true },
    });
    sendSuccess(res, user, 'Profile updated');
  } catch (err) { next(err); }
}