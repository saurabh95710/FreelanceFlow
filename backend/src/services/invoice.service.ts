import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { InvoiceStatus } from '@prisma/client';

function calcTotals(lineItems: { quantity: number; unitPrice: number }[], taxRate: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export async function getInvoices(userId: string, status?: InvoiceStatus) {
  return prisma.invoice.findMany({
    where: { userId, ...(status ? { status } : {}) },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      _count: { select: { lineItems: true, payments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInvoiceById(id: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      lineItems: true,
      payments: { orderBy: { paidAt: 'desc' } },
    },
  });
  if (!invoice) throw new AppError('Invoice not found', 404);
  return invoice;
}

export async function createInvoice(userId: string, data: {
  clientId: string; invoiceNo: string; issueDate: string; dueDate: string;
  taxRate: number; notes?: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
}) {
  const client = await prisma.client.findFirst({ where: { id: data.clientId, userId } });
  if (!client) throw new AppError('Client not found', 404);

  const { lineItems, taxRate, ...invoiceData } = data;
  const { subtotal, taxAmount, total } = calcTotals(lineItems, taxRate);

  return prisma.invoice.create({
    data: {
      userId,
      clientId: invoiceData.clientId,
      invoiceNo: invoiceData.invoiceNo,
      issueDate: new Date(invoiceData.issueDate),
      dueDate: new Date(invoiceData.dueDate),
      notes: invoiceData.notes,
      taxRate,
      subtotal,
      taxAmount,
      total,
      lineItems: {
        create: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { client: true, lineItems: true },
  });
}

export async function updateInvoice(id: string, userId: string, data: Partial<{
  clientId: string; invoiceNo: string; issueDate: string; dueDate: string;
  taxRate: number; notes: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
}>) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!invoice) throw new AppError('Invoice not found', 404);
  if (invoice.status === 'PAID') throw new AppError('Cannot edit a paid invoice', 400);

  const { lineItems, taxRate, issueDate, dueDate, ...rest } = data;

  let totals = {};
  if (lineItems) {
    totals = calcTotals(lineItems, taxRate ?? invoice.taxRate);
  }

  return prisma.$transaction(async (tx) => {
    if (lineItems) {
      await tx.lineItem.deleteMany({ where: { invoiceId: id } });
      await tx.lineItem.createMany({
        data: lineItems.map(item => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      });
    }

    return tx.invoice.update({
      where: { id },
      data: {
        ...rest,
        ...(taxRate !== undefined ? { taxRate } : {}),
        ...(issueDate ? { issueDate: new Date(issueDate) } : {}),
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        ...totals,
      },
      include: { client: true, lineItems: true },
    });
  });
}

export async function updateInvoiceStatus(id: string, userId: string, status: InvoiceStatus) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!invoice) throw new AppError('Invoice not found', 404);

  return prisma.invoice.update({
    where: { id },
    data: {
      status,
      ...(status === 'PAID' ? { paidAt: new Date() } : {}),
    },
  });
}

export async function deleteInvoice(id: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!invoice) throw new AppError('Invoice not found', 404);
  if (invoice.status === 'PAID') throw new AppError('Cannot delete a paid invoice', 400);
  await prisma.invoice.delete({ where: { id } });
}