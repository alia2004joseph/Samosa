import React, { useState } from 'react';
import { TrendingUp, Banknote, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { Order, SalesReport } from '../../types';
import { formatUGX, formatDateTime, getPaymentBadgeClass } from '../../utils/formatting';

interface SellerSalesProps {
  getSalesReport: (
    period: 'today' | '7days' | 'month' | 'custom',
    customStart?: Date,
    customEnd?: Date
  ) => SalesReport;
  orders: Order[];
}

export const SellerSales: React.FC<SellerSalesProps> = ({ getSalesReport, orders }) => {
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'custom'>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const report = getSalesReport(
    period,
    customStart ? new Date(customStart) : undefined,
    customEnd ? new Date(customEnd) : undefined
  );

  // Delivered orders in the current period for detailed audit
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Sales & Revenue Reports
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Sales are recognized strictly on successfully fulfilled and delivered orders.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                period === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers */}
      {period === 'custom' && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span className="font-semibold text-stone-700">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-semibold text-stone-700">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Total Delivered Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {formatUGX(report.total_sales_amount)}
          </div>
          <div className="text-xs text-stone-500">
            From <strong className="text-stone-800">{report.delivered_orders_count}</strong> fulfilled
            orders ({report.total_orders_count} total placed).
          </div>
        </div>

        {/* Cash Collected */}
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <span>Cash Physically Collected</span>
            <Banknote className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            {formatUGX(report.total_cash_collected)}
          </div>
          <div className="text-xs text-emerald-800">
            From <strong className="text-emerald-950">{report.paid_orders_count}</strong> fully paid
            orders.
          </div>
        </div>

        {/* Pending Cash Collection */}
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase tracking-wider">
            <span>Unpaid Delivered (Pending)</span>
            <AlertCircle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950">
            {formatUGX(report.pending_cash_collection)}
          </div>
          <div className="text-xs text-amber-800">
            <strong className="text-amber-950">{report.unpaid_delivered_count}</strong> orders
            delivered but cash not yet marked received.
          </div>
        </div>
      </div>

      {/* Accounting Rule Notice */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
        <span className="font-bold text-stone-800 block">
          College Samosa Revenue Recognition Policy:
        </span>
        <p>
          Sales revenue is recognized upon successful physical handoff (<strong>DELIVERED</strong>).
          Cancelled or rejected orders are excluded from revenue totals. Because payment is cash on
          delivery, delivered orders remain <strong>UNPAID</strong> until the seller explicitly marks
          cash received.
        </p>
      </div>

      {/* Delivered Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900">
          Fulfilled Orders History ({deliveredOrders.length})
        </h2>

        {deliveredOrders.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">
            No orders delivered in this period yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Delivery Room</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Delivered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {deliveredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                      #{o.id.substring(4, 12).toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 font-medium">{o.customer?.name}</td>
                    <td className="py-2.5 px-3 text-stone-600">{o.delivery_location}</td>
                    <td className="py-2.5 px-3 font-bold text-stone-900">
                      {formatUGX(o.total_amount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentBadgeClass(
                          o.payment_status
                        )}`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">
                      {formatDateTime(o.updated_at || o.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
