import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';
import { useInvoices, useDeleteInvoice } from '../../hooks/useApi';
import { PageHeader, StatusBadge, EmptyState, Spinner, ConfirmDialog } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Invoice, InvoiceStatus } from '../../types';

const TABS: { label: string; value: InvoiceStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Paid', value: 'PAID' },
];

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<InvoiceStatus | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);

  const { data: invoices, isLoading } = useInvoices(activeStatus);
  const deleteInvoice = useDeleteInvoice();

  const filtered = invoices?.filter((inv: Invoice) =>
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    inv.client.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  async function handleDelete() {
    if (!toDelete) return;
    await deleteInvoice.mutateAsync(toDelete);
    setToDelete(null);
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices?.length ?? 0} invoices`}
        action={
          <Link to="/invoices/new" className="btn-primary">
            <Plus size={16} /> New Invoice
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all
              ${activeStatus === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by invoice # or client..." className="input pl-9 max-w-sm" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText} title="No invoices found"
          description="Create your first invoice to get started."
          action={<Link to="/invoices/new" className="btn-primary"><Plus size={16} /> New Invoice</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv: Invoice) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{inv.invoiceNo}</td>
                  <td className="px-6 py-3.5">
                    <p className="text-sm text-gray-900">{inv.client.name}</p>
                    {inv.client.company && <p className="text-xs text-gray-400">{inv.client.company}</p>}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{formatDate(inv.dueDate)}</td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-6 py-3.5 text-right">
                    <button onClick={e => { e.stopPropagation(); setToDelete(inv.id); }}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete Invoice" loading={deleteInvoice.isPending}
        message="Are you sure you want to delete this invoice? This cannot be undone."
      />
    </div>
  );
}