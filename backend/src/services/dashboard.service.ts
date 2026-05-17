import { prisma } from '../config/prisma';

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalClients,
    totalInvoices,
    invoicesByStatus,
    revenueThisMonth,
    revenueLastMonth,
    overdueInvoices,
    recentInvoices,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.client.count({ where: { userId } }),

    prisma.invoice.count({ where: { userId } }),

    prisma.invoice.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
      _sum: { total: true },
    }),

    prisma.payment.aggregate({
      where: { invoice: { userId }, paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),

    prisma.payment.aggregate({
      where: { invoice: { userId }, paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    }),

    prisma.invoice.findMany({
      where: { userId, status: 'OVERDUE' },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),

    prisma.invoice.findMany({
      where: { userId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // Last 6 months revenue
    prisma.$queryRaw<{ month: string; revenue: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', p."paidAt"), 'Mon YYYY') as month,
        COALESCE(SUM(p.amount), 0)::float as revenue
      FROM payments p
      JOIN invoices i ON i.id = p."invoiceId"
      WHERE i."userId" = ${userId}
        AND p."paidAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', p."paidAt")
      ORDER BY DATE_TRUNC('month', p."paidAt") ASC
    `,
  ]);

  // Auto-mark overdue invoices
  await prisma.invoice.updateMany({
    where: { userId, status: 'SENT', dueDate: { lt: now } },
    data: { status: 'OVERDUE' },
  });

  const statusMap = Object.fromEntries(
    invoicesByStatus.map((s: any) => [s.status, { count: s._count, total: s._sum.total ?? 0 }])
  );

  const thisMonthRevenue = revenueThisMonth._sum.amount ?? 0;
  const lastMonthRevenue = revenueLastMonth._sum.amount ?? 0;
  const growthRate = lastMonthRevenue === 0
    ? 100
    : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  return {
    summary: {
      totalClients,
      totalInvoices,
      revenueThisMonth: thisMonthRevenue,
      revenueLastMonth: lastMonthRevenue,
      growthRate: Math.round(growthRate * 10) / 10,
      outstandingAmount: (statusMap['SENT']?.total ?? 0) + (statusMap['OVERDUE']?.total ?? 0),
      paidAmount: statusMap['PAID']?.total ?? 0,
    },
    invoicesByStatus: statusMap,
    overdueInvoices,
    recentInvoices,
    monthlyRevenue,
  };
}