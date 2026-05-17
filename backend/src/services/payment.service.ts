import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { PaymentMethod } from '@prisma/client';

export async function getPayments(userId: string) {
  return prisma.payment.findMany({
    where: { invoice: { userId } },
    include: {
      invoice: {
        select: { id: true, invoiceNo: true, total: true, client: { select: { name: true } } },
      },
    },
    orderBy: { paidAt: 'desc' },
  });
}

export async function createPayment(userId: string, data: {
  invoiceId: string; amount: number; method: PaymentMethod;
  reference?: string; notes?: string; paidAt?: string;
}) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: data.invoiceId, userId },
    include: { payments: true },
  });
  if (!invoice) throw new AppError('Invoice not found', 404);
  if (invoice.status === 'CANCELLED') throw new AppError('Cannot record payment for a cancelled invoice', 400);

  const totalPaid = invoice.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const remaining = invoice.total - totalPaid;
  if (data.amount > remaining + 0.01) {
    throw new AppError(`Payment amount exceeds remaining balance of ${remaining.toFixed(2)}`, 400);
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
    },
    include: { invoice: { select: { invoiceNo: true } } },
  });

  // Auto-mark invoice as PAID if fully paid
  const newTotal = totalPaid + data.amount;
  if (newTotal >= invoice.total - 0.01) {
    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: { status: 'PAID', paidAt: payment.paidAt },
    });
  }

  return payment;
}

export async function deletePayment(id: string, userId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id, invoice: { userId } },
    include: { invoice: true },
  });
  if (!payment) throw new AppError('Payment not found', 404);

  await prisma.payment.delete({ where: { id } });

  // Revert invoice status if it was PAID
  if (payment.invoice.status === 'PAID') {
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'SENT', paidAt: null },
    });
  }
}