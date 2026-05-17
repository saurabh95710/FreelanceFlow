import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, MapPin, FileText, Plus } from 'lucide-react';
import { useClient, useDeleteClient } from '../../hooks/useApi';
import { PageHeader, StatusBadge, Spinner, ConfirmDialog } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useState } from 'react';
import { Invoice } from '../../types';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id!);
  const deleteClient = useDeleteClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    try {
      await deleteClient.mutateAsync(id!);
      navigate('/clients');
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Failed to delete client');
      setConfirmDelete(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;
  if (!client) return <div className="p-8 text-gray-500">Client not found.</div>;

  return (
    <div className="p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to Clients
      </button>

      <PageHeader
        title={client.name}
        subtitle={client.company ?? client.email}
        action={
          <div className="flex gap-2">
            <Link to={`/invoices/new?clientId=${client.id}`} className="btn-primary">
              <Plus size={16} /> New Invoice
            </Link>
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>Delete</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Info</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Mail size={15} className="text-gray-400" /> {client.email}</div>
            {client.phone && <div className="flex items-center gap-2"><Phone size={15} className="text-gray-400" /> {client.phone}</div>}
            {client.company && <div className="flex items-center gap-2"><Building2 size={15} className="text-gray-400" /> {client.company}</div>}
            {client.address && <div className="flex items-start gap-2"><MapPin size={15} className="text-gray-400 mt-0.5" /> {client.address}</div>}
          </div>
          {client.notes && (
            <>
              <hr className="border-gray-100" />
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-600">{client.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Invoices */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={16} /> Invoices ({client.invoices?.length ?? 0})
            </h3>
          </div>
          {client.invoices?.length ? (
            <div className="divide-y divide-gray-50">
              {client.invoices.map((inv: Invoice) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`}
                  className="flex items-center px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{inv.invoiceNo}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 mr-4">
                    {formatCurrency(inv.total)}
                  </span>
                  <StatusBadge status={inv.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              No invoices for this client yet.
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete}
        title="Delete Client" loading={deleteClient.isPending}
        message={`Are you sure you want to delete ${client.name}? This action cannot be undone.`}
      />
    </div>
  );
}