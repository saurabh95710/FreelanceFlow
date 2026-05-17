import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  businessName?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const hashed = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      businessName: data.businessName,
    },
    select: { id: true, name: true, email: true, businessName: true, createdAt: true },
  });

  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const token = signToken({ userId: user.id, email: user.email });
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
}