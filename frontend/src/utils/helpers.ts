import { format, formatDistanceToNow, isPast } from 'date-fns';
import { InvoiceStatus } from '../types';

const USD_TO_INR = 93;

export function formatCurrency(amount: number, currency = 'USD'): string {
  const convertedAmount =
    currency === 'INR'
      ? amount * USD_TO_INR
      : amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(convertedAmount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(dueDate: string, status: InvoiceStatus): boolean {
  return isPast(new Date(dueDate)) && status === 'SENT';
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  DRAFT: 'badge-draft',
  SENT: 'badge-sent',
  PAID: 'badge-paid',
  OVERDUE: 'badge-overdue',
  CANCELLED: 'badge-cancelled',
};

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as any).response?.data;
    return res?.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}

export function generateInvoiceNo(existing: string[]): string {
  const nums = existing
    .map(n => parseInt(n.replace(/\D/g, ''), 10))
    .filter(Boolean);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(3, '0')}`;
}