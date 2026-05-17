import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { usePayments } from '../../hooks/useApi';
import { PageHeader, EmptyState, Spinner } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/auth.store';

export default function PaymentsPage() {
  const user = useAuthStore((s: any)=> s.user);
  const { data: payments, isLoading } = usePayments();
  const currency = user?.currency ?? 'USD';

  const total = payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0;
  return (
    <div className="p-8">
      <PageHeader
        title="Payments"
        subtitle={`${payments?.length ?? 0} payments · ${formatCurrency(total, currency)} total received`}
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : payments?.length === 0 ? (
        <EmptyState
          icon={CreditCard} title="No payments yet"
          description="Payments you record on invoices will appear here."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Reference</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments?.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 text-sm text-gray-500">{formatDate(p.paidAt)}</td>
                  <td className="px-6 py-3.5">
                    <Link to={`/invoices/${p.invoiceId}`}
                      className="text-sm font-medium text-primary-600 hover:underline">
                      {p.invoice?.invoiceNo}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-900">{p.invoice?.client.name}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">
                    {p.method.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-400">{p.reference ?? '—'}</td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-green-600 text-right">
                    {formatCurrency(p.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">Total Received</td>
                <td className="px-6 py-3 text-sm font-bold text-green-700 text-right">{formatCurrency(total, currency)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}