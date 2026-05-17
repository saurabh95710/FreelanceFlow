import { z } from 'zod';

// Auth
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// User profile
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().length(3).optional(),
});

// Client
export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

// Invoice
const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
});

// Payment
export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['BANK_TRANSFER', 'CASH', 'CREDIT_CARD', 'PAYPAL', 'STRIPE', 'OTHER']).default('BANK_TRANSFER'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().datetime().optional(),
});