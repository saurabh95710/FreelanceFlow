import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Users, Plus, Search, Mail, Phone, Building2, ChevronRight } from 'lucide-react';
import { useClients, useCreateClient } from '../../hooks/useApi';
import { PageHeader, EmptyState, Modal, FormField, Spinner } from '../../components/ui';
import { getErrorMessage } from '../../utils/helpers';
import { Client } from '../../types';

interface ClientForm {
  name: string; email: string; phone?: string;
  company?: string; address?: string; notes?: string;
}

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientForm>();

  const filtered = clients?.filter((c: Client) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  async function onSubmit(data: ClientForm) {
    try {
      setError('');
      await createClient.mutateAsync(data);
      reset();
      setShowModal(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Clients"
        subtitle={`${clients?.length ?? 0} clients total`}
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Client
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="input pl-9 max-w-sm"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users} title="No clients yet"
          description="Add your first client to start creating invoices."
          action={
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Client
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client: Client) => (
            <Link key={client.id} to={`/clients/${client.id}`}
              className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-semibold text-sm">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors mt-1" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5">{client.name}</h3>
              {client.company && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <Building2 size={12} /> {client.company}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail size={12} /> {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={12} /> {client.phone}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  {client._count?.invoices ?? 0} invoice{client._count?.invoices !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); setError(''); }} title="Add New Client">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Full Name" required error={errors.name?.message}>
                <input {...register('name', { required: 'Name is required' })} className="input" placeholder="Sarah Mitchell" />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Email" required error={errors.email?.message}>
                <input {...register('email', { required: 'Email is required' })} type="email" className="input" placeholder="sarah@company.com" />
              </FormField>
            </div>
            <FormField label="Phone">
              <input {...register('phone')} className="input" placeholder="+1 555 0100" />
            </FormField>
            <FormField label="Company">
              <input {...register('company')} className="input" placeholder="Acme Corp" />
            </FormField>
            <div className="col-span-2">
              <FormField label="Address">
                <input {...register('address')} className="input" placeholder="123 Main St, City" />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Notes">
                <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="Any notes about this client..." />
              </FormField>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={createClient.isPending}>
              {createClient.isPending ? <Spinner size={14} /> : <Plus size={14} />}
              Add Client
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}