import { Link } from 'react-router-dom';
import { DollarSign, Users, FileText, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../../hooks/useApi';
import { useAuthStore } from '../../store/auth.store';
import { StatCard, StatusBadge, Spinner } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function DashboardPage() {
  const user = useAuthStore((s: any) => s.user);
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={32} />
      </div>
    );
  }

  const s = data?.summary;
  const currency = user?.currency ?? 'USD';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your business today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(s?.revenueThisMonth ?? 0, currency)}
          icon={DollarSign}
          color="primary"
          trend={{ value: s?.growthRate ?? 0, label: 'vs last month' }}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(s?.outstandingAmount ?? 0, currency)}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          label="Total Clients"
          value={s?.totalClients ?? 0}
          icon={Users}
          color="green"
        />
        <StatCard
          label="Total Invoices"
          value={s?.totalInvoices ?? 0}
          icon={FileText}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue — Last 6 Months</h2>
          {data?.monthlyRevenue?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0), currency)} />
                <Area
                  type="monotone" dataKey="revenue" stroke="#0ea5e9"
                  strokeWidth={2} fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No revenue data yet. Start by creating an invoice.
            </div>
          )}
        </div>

        {/* Overdue Invoices */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Overdue</h2>
            {(data?.overdueInvoices?.length ?? 0) > 0 && (
              <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full text-xs flex items-center justify-center font-medium">
                {data!.overdueInvoices.length}
              </span>
            )}
          </div>

          {data?.overdueInvoices?.length ? (
            <div className="space-y-3">
              {data.overdueInvoices.map((inv: any) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`}
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{inv.client.name}</p>
                    <p className="text-xs text-gray-500">{inv.invoiceNo} · Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(inv.total, currency)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-500 text-lg">✓</span>
              </div>
              <p className="text-sm text-gray-500">No overdue invoices!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card mt-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Invoices</h2>
          <Link to="/invoices/new" className="btn-primary text-xs px-3 py-1.5">
            <Plus size={14} /> New Invoice
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data?.recentInvoices?.map((inv: any) => (
            <Link key={inv.id} to={`/invoices/${inv.id}`}
              className="flex items-center px-6 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{inv.invoiceNo}</p>
                <p className="text-xs text-gray-500">{inv.client.name}</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(inv.total, currency)}</p>
                <p className="text-xs text-gray-500">Due {formatDate(inv.dueDate)}</p>
              </div>
              <StatusBadge status={inv.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}