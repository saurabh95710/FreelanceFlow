import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Send, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useInvoice, useUpdateInvoiceStatus, useCreatePayment, useDeletePayment } from '../../hooks/useApi';
import { StatusBadge, Spinner, Modal, FormField, ConfirmDialog } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/auth.store';
import { LineItem, Payment } from '../../types';


interface PaymentForm {
  amount: number; method: string; reference?: string; notes?: string;
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const { data: invoice, isLoading } = useInvoice(id!);
  const updateStatus = useUpdateInvoiceStatus();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<PaymentForm>();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;
  if (!invoice) return <div className="p-8 text-gray-500">Invoice not found.</div>;

  const totalPaid = invoice.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const remaining = invoice.total - totalPaid;
  const currency = user?.currency ?? 'USD';

  async function changeStatus(status: string) {
    try {
      setStatusError('');
      await updateStatus.mutateAsync({ id: invoice!.id, status });
    } catch (err: any) {
      setStatusError(err?.response?.data?.message ?? 'Failed to update status');
    }
  }

  async function onPaymentSubmit(data: PaymentForm) {
    await createPayment.mutateAsync({
      invoiceId: invoice!.id,
      amount: Number(data.amount),
      method: data.method as any,
      reference: data.reference,
      notes: data.notes,
    });
    reset();
    setShowPaymentModal(false);
  }

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-gray-900">{invoice.invoiceNo}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-gray-500">Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}</p>
          {statusError && <p className="text-xs text-red-500 mt-1">{statusError}</p>}
        </div>
        <div className="flex gap-2">
          {invoice.status === 'DRAFT' && (
            <button className="btn-secondary" onClick={() => changeStatus('SENT')} disabled={updateStatus.isPending}>
              <Send size={15} /> Mark Sent
            </button>
          )}
          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
            <button className="btn-primary" onClick={() => setShowPaymentModal(true)}>
              <DollarSign size={15} /> Record Payment
            </button>
          )}
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button className="btn-secondary text-red-500 hover:bg-red-50" onClick={() => changeStatus('CANCELLED')}>
              <XCircle size={15} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main invoice */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <div className="card p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Bill To</h3>
            <p className="font-semibold text-gray-900">{invoice.client.name}</p>
            {invoice.client.company && <p className="text-sm text-gray-500">{invoice.client.company}</p>}
            <p className="text-sm text-gray-500">{invoice.client.email}</p>
          </div>

          {/* Line Items */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-400 uppercase">Qty</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Unit Price</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.lineItems.map((li: LineItem) => (
                  <tr key={li.id}>
                    <td className="px-5 py-3 text-sm text-gray-900">{li.description}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 text-center">{li.quantity}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 text-right">{formatCurrency(li.unitPrice, currency)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(li.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-100 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatCurrency(invoice.total, currency)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Invoice Total</span><span>{formatCurrency(invoice.total, currency)}</span></div>
              <div className="flex justify-between text-green-600"><span>Total Paid</span><span>{formatCurrency(totalPaid, currency)}</span></div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Remaining</span><span className={remaining > 0 ? 'text-red-500' : 'text-green-600'}>{formatCurrency(remaining, currency)}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {invoice.payments.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payments Received</h3>
              <div className="space-y-3">
                {invoice.payments.map((p: Payment) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(p.amount, currency)}</p>
                      <p className="text-xs text-gray-400">{p.method.replace('_', ' ')} · {formatDate(p.paidAt)}</p>
                      {p.reference && <p className="text-xs text-gray-400">Ref: {p.reference}</p>}
                    </div>
                    <button onClick={() => setPaymentToDelete(p.id)}
                      className="text-xs text-gray-300 hover:text-red-500 transition-colors">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
        <form onSubmit={handleSubmit(onPaymentSubmit)} className="space-y-4">
          <FormField label="Amount" required>
            <input {...register('amount', { required: true, min: 0.01 })}
              type="number" step="0.01" defaultValue={remaining > 0 ? remaining.toFixed(2) : ''}
              className="input" placeholder="0.00" />
          </FormField>
          <FormField label="Payment Method">
            <select {...register('method')} className="input">
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="PAYPAL">PayPal</option>
              <option value="STRIPE">Stripe</option>
              <option value="OTHER">Other</option>
            </select>
          </FormField>
          <FormField label="Reference #">
            <input {...register('reference')} className="input" placeholder="TXN-12345" />
          </FormField>
          <FormField label="Notes">
            <textarea {...register('notes')} className="input resize-none" rows={2} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size={14} /> : <CheckCircle size={14} />}
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!paymentToDelete} onClose={() => setPaymentToDelete(null)}
        onConfirm={async () => { await deletePayment.mutateAsync(paymentToDelete!); setPaymentToDelete(null); }}
        title="Delete Payment" message="Remove this payment record? The invoice status will be reverted."
        loading={deletePayment.isPending}
      />
    </div>
  );
}