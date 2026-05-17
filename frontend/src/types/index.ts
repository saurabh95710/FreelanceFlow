export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD' | 'PAYPAL' | 'STRIPE' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  phone?: string;
  address?: string;
  currency: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  _count?: { invoices: number };
  invoices?: InvoiceSummary[];
}

export interface InvoiceSummary {
  id: string;
  invoiceNo: string;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAt?: string;
  createdAt: string;
  client: Client;
  lineItems: LineItem[];
  payments: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  paidAt: string;
  createdAt: string;
  invoice?: {
    invoiceNo: string;
    total: number;
    client: { name: string };
  };
}

export interface DashboardStats {
  summary: {
    totalClients: number;
    totalInvoices: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    growthRate: number;
    outstandingAmount: number;
    paidAmount: number;
  };
  invoicesByStatus: Record<string, { count: number; total: number }>;
  overdueInvoices: Invoice[];
  recentInvoices: Invoice[];
  monthlyRevenue: { month: string; revenue: number }[];
}