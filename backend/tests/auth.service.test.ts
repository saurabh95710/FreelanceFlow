import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { registerUser, loginUser } from '../src/services/auth.service';
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof jest.fn>;
    create: ReturnType<typeof jest.fn>;
  };
};

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should throw if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });

      await expect(
        registerUser({
          name: 'Test',
          email: 'test@test.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should create user and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'new@test.com',
        businessName: null,
        createdAt: new Date(),
      });

      const result = await registerUser({
        name: 'Test User',
        email: 'new@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('new@test.com');
    });
  });

  describe('loginUser', () => {
    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(loginUser('notfound@test.com', 'pass')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw if password is wrong', async () => {
      const hashed = await bcrypt.hash('correctpassword', 12);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: hashed,
      });

      await expect(
        loginUser('test@test.com', 'wrongpassword')
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should return user and token on success', async () => {
      const hashed = await bcrypt.hash('password123', 12);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        password: hashed,
        businessName: null,
        phone: null,
        address: null,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await loginUser('test@test.com', 'password123');

      expect(result.token).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });
  });
});