import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getClients(userId: string) {
  return prisma.client.findMany({
    where: { userId },
    include: {
      _count: { select: { invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getClientById(id: string, userId: string) {
  const client = await prisma.client.findFirst({
    where: { id, userId },
    include: {
      invoices: {
        select: { id: true, invoiceNo: true, total: true, status: true, dueDate: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!client) throw new AppError('Client not found', 404);
  return client;
}

export async function createClient(userId: string, data: {
  name: string; email: string; phone?: string;
  company?: string; address?: string; notes?: string;
}) {
  return prisma.client.create({ data: { userId, ...data } });
}

export async function updateClient(id: string, userId: string, data: Partial<{
  name: string; email: string; phone: string;
  company: string; address: string; notes: string;
}>) {
  const client = await prisma.client.findFirst({ where: { id, userId } });
  if (!client) throw new AppError('Client not found', 404);
  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: string, userId: string) {
  const client = await prisma.client.findFirst({ where: { id, userId } });
  if (!client) throw new AppError('Client not found', 404);

  const activeInvoices = await prisma.invoice.count({
    where: { clientId: id, status: { in: ['SENT', 'OVERDUE'] } },
  });
  if (activeInvoices > 0) {
    throw new AppError('Cannot delete client with active invoices', 400);
  }

  await prisma.client.delete({ where: { id } });
}