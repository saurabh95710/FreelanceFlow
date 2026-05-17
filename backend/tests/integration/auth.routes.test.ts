import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';

// These tests require a real test DB — set DATABASE_URL in .env.test
// Run with: DATABASE_URL=... jest tests/integration

describe('POST /api/v1/auth/register', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'integration@test.com' } });
    await prisma.$disconnect();
  });

  it('should return 422 for invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Integration User', email: 'integration@test.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('integration@test.com');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Dup', email: 'integration@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should return 401 for wrong credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'integration@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should login and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'integration@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return user profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'integration@test.com', password: 'password123' });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('integration@test.com');
  });
});