import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@freelanceflow.com' },
    update: {},
    create: {
      email: 'demo@freelanceflow.com',
      name: 'Alex Johnson',
      businessName: 'AJ Design Studio',
      password,
      currency: 'USD',
    },
  });

  const client1 = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Sarah Mitchell',
      email: 'sarah@techcorp.com',
      company: 'TechCorp Inc.',
      phone: '+1-555-0101',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'David Park',
      email: 'david@startupxyz.com',
      company: 'StartupXYZ',
      phone: '+1-555-0202',
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: client1.id,
      invoiceNo: 'INV-001',
      status: 'PAID',
      issueDate: new Date('2025-01-01'),
      dueDate: new Date('2025-01-31'),
      taxRate: 10,
      subtotal: 3000,
      taxAmount: 300,
      total: 3300,
      paidAt: new Date('2025-01-20'),
      lineItems: {
        create: [
          { description: 'UI/UX Design - Homepage', quantity: 1, unitPrice: 1500, amount: 1500 },
          { description: 'UI/UX Design - Dashboard', quantity: 1, unitPrice: 1500, amount: 1500 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: client2.id,
      invoiceNo: 'INV-002',
      status: 'SENT',
      issueDate: new Date('2025-03-01'),
      dueDate: new Date('2025-03-31'),
      taxRate: 10,
      subtotal: 5000,
      taxAmount: 500,
      total: 5500,
      lineItems: {
        create: [
          { description: 'Full-stack Web App Development', quantity: 50, unitPrice: 100, amount: 5000 },
        ],
      },
    },
  });

  console.log('✅ Seed complete');
  console.log('📧 Demo login: demo@freelanceflow.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());