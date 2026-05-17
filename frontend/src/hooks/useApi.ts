import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, clientsApi, invoicesApi, paymentsApi, userApi } from '../services/resources';
import { InvoiceStatus } from '../types';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats });
}

// ─── Clients ─────────────────────────────────────────────────────────────────
export function useClients() {
  return useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });
}

export function useClient(id: string) {
  return useQuery({ queryKey: ['clients', id], queryFn: () => clientsApi.get(id), enabled: !!id });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      qc.invalidateQueries({ queryKey: ['clients', id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export function useInvoices(status?: InvoiceStatus) {
  return useQuery({
    queryKey: ['invoices', status],
    queryFn: () => invoicesApi.list(status),
  });
}

export function useInvoice(id: string) {
  return useQuery({ queryKey: ['invoices', id], queryFn: () => invoicesApi.get(id), enabled: !!id });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      invoicesApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export function usePayments() {
  return useQuery({ queryKey: ['payments'], queryFn: paymentsApi.list });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── User ─────────────────────────────────────────────────────────────────────
export function useUpdateProfile() {
  return useMutation({ mutationFn: userApi.updateProfile });
}