import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as invoiceService from '../services/invoice.service';
import { sendSuccess } from '../utils/response';
import { InvoiceStatus } from '@prisma/client';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as InvoiceStatus | undefined;
    const invoices = await invoiceService.getInvoices(req.userId!, status);
    sendSuccess(res, invoices, 'Invoices retrieved');
  } catch (err) { next(err); }
}

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id as string, req.userId!);
    sendSuccess(res, invoice, 'Invoice retrieved');
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.createInvoice(req.userId!, req.body);
    sendSuccess(res, invoice, 'Invoice created', 201);
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id as string, req.userId!, req.body);
    sendSuccess(res, invoice, 'Invoice updated');
  } catch (err) { next(err); }
}

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(
      req.params.id as string, req.userId!, req.body.status
    );
    sendSuccess(res, invoice, 'Invoice status updated');
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await invoiceService.deleteInvoice(req.params.id as string, req.userId!);
    sendSuccess(res, null, 'Invoice deleted');
  } catch (err) { next(err); }
}                                                         