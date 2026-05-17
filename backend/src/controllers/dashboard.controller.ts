import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDashboardStats } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export async function stats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await getDashboardStats(req.userId!);
    sendSuccess(res, data, 'Dashboard stats retrieved');
  } catch (err) { next(err); }
}