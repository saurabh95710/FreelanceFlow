import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useClients, useCreateInvoice, useInvoices } from '../../hooks/useApi';
import { Spinner, FormField } from '../../components/ui';
import { formatCurrency, generateInvoiceNo, getErrorMessage } from '../../utils/helpers';
import { Client, Invoice } from '../../types';


interface LineItemForm { description: string; quantity: number; unitPrice: number; }
interface InvoiceForm {
  clientId: string; invoiceNo: string;
  issueDate: string; dueDate: string;
  taxRate: number; notes?: string;
  lineItems: LineItemForm[];
}

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: clients } = useClients();
  const { data: invoices } = useInvoices();
  const createInvoice = useCreateInvoice();
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const existingNos = invoices?.map((i: Invoice) => i.invoiceNo) ?? [];
  const autoNo = generateInvoiceNo(existingNos);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceForm>({
    defaultValues: {
      clientId: searchParams.get('clientId') ?? '',
      invoiceNo: autoNo,
      issueDate: today,
      dueDate: due,
      taxRate: 0,
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });

  const lineItems = watch('lineItems');
  const taxRate = watch('taxRate') ?? 0;
  const subtotal = lineItems.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  async function onSubmit(data: InvoiceForm) {
    try {
      setError('');
      const payload = {
        ...data,
        issueDate: new Date(data.issueDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
        taxRate: Number(data.taxRate),
        lineItems: data.lineItems.map(li => ({
          description: li.description,
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
        })),
      };
      const invoice = await createInvoice.mutateAsync(payload);
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-8">New Invoice</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <FormField label="Client" required error={errors.clientId?.message}>
                <select {...register('clientId', { required: 'Client is required' })} className="input">
                  <option value="">Select a client...</option>
                  {clients?.map((c: Client) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Invoice #" required error={errors.invoiceNo?.message}>
              <input {...register('invoiceNo', { required: 'Invoice number is required' })} className="input" />
            </FormField>
            <FormField label="Issue Date" required>
              <input {...register('issueDate', { required: true })} type="date" className="input" />
            </FormField>
            <FormField label="Due Date" required>
              <input {...register('dueDate', { required: true })} type="date" className="input" />
            </FormField>
            <FormField label="Tax Rate (%)">
              <input {...register('taxRate')} type="number" min="0" max="100" step="0.1" className="input" />
            </FormField>
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Line Items</h2>
            <button type="button" className="btn-secondary text-xs px-3 py-1.5"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-400 uppercase px-1">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1" />
            </div>

            {fields.map((field, idx) => {
              const qty = Number(watch(`lineItems.${idx}.quantity`)) || 0;
              const price = Number(watch(`lineItems.${idx}.unitPrice`)) || 0;
              return (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6">
                    <input
                      {...register(`lineItems.${idx}.description`, { required: true })}
                      className="input text-sm" placeholder="Service description..."
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register(`lineItems.${idx}.quantity`, { required: true, min: 0.01 })}
                      type="number" min="0.01" step="0.01" className="input text-sm text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register(`lineItems.${idx}.unitPrice`, { required: true, min: 0 })}
                      type="number" min="0" step="0.01" className="input text-sm text-center"
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium text-gray-700">
                    {formatCurrency(qty * price)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <div className="w-56 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax ({taxRate}%)</span><span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-8">
          <FormField label="Notes / Payment Instructions">
            <textarea {...register('notes')} className="input resize-none" rows={3}
              placeholder="Payment terms, bank details, thank you note..." />
          </FormField>
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn-secondary px-6" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn-primary px-8" disabled={createInvoice.isPending}>
            {createInvoice.isPending ? <Spinner size={14} /> : null}
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}