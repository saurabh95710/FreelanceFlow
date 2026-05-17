import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as paymentService from '../services/payment.service';
import { sendSuccess } from '../utils/response';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payments = await paymentService.getPayments(req.userId!);
    sendSuccess(res, payments, 'Payments retrieved');
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payment = await paymentService.createPayment(req.userId!, req.body);
    sendSuccess(res, payment, 'Payment recorded', 201);
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await paymentService.deletePayment(req.params.id as string, req.userId!);
    sendSuccess(res, null, 'Payment deleted');
  } catch (err) { next(err); }
}