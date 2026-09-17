import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Check,
  XCircle,
  Banknote,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import {
  formatUGX,
  formatDateTime,
  formatOrderStatus,
  getStatusBadgeClass,
  getPaymentBadgeClass,
} from '../../utils/formatting';
import { SellerOrderDetailModal } from './SellerOrderDetailModal';

interface SellerOrdersProps {
  orders: Order[];
  initialFilter?: string;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  onMarkAsPaid: (orderId: string) => Promise<void>;
}

export const SellerOrders: React.FC<SellerOrdersProps> = ({
  orders,
  initialFilter,
  onUpdateStatus,
  onMarkAsPaid,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter || 'ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (activeFilter === 'PENDING' && order.status !== 'PENDING') return false;
    if (
      activeFilter === 'KITCHEN' &&
      order.status !== 'CONFIRMED' &&
      order.status !== 'PREPARING'
    )
      return false;
    if (
      activeFilter === 'DELIVERY' &&
      order.status !== 'READY' &&
      order.status !== 'OUT_FOR_DELIVERY'
    )
      return false;
    if (activeFilter === 'DELIVERED' && order.status !== 'DELIVERED') return false;
    if (activeFilter === 'UNPAID' && order.payment_status !== 'UNPAID') return false;
    if (
      activeFilter === 'CLOSED' &&
      order.status !== 'CANCELLED' &&
      order.status !== 'REJECTED'
    )
      return false;

    // Payment Filter
    if (paymentFilter === 'PAID' && order.payment_status !== 'PAID') return false;
    if (paymentFilter === 'UNPAID' && order.payment_status !== 'UNPAID') return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = order.customer?.name?.toLowerCase().includes(q);
      const matchPhone = order.customer?.phone?.includes(q);
      const matchLocation = order.delivery_location?.toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      if (!matchCustomer && !matchPhone && !matchLocation && !matchId) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Manage incoming orders, update live preparation status, and track cash payments.
          </p>
        </div>

        <div className="text-xs font-semibold text-stone-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-2">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'KITCHEN', label: 'In Kitchen' },
            { id: 'DELIVERY', label: 'Out for Delivery' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'UNPAID', label: 'Unpaid Orders' },
            { id: 'CLOSED', label: 'Cancelled / Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Payment filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by customer name, phone, room, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="UNPAID">Unpaid Only</option>
              <option value="PAID">Paid Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-12 text-center space-y-2">
          <Clock className="w-8 h-8 text-stone-400 mx-auto" />
          <h2 className="text-sm font-bold text-stone-900">No Orders Matching Filter</h2>
          <p className="text-xs text-stone-500">
            Try adjusting your search criteria or filter tabs above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const shortId = order.id.substring(4, 12).toUpperCase();

            return (
              <div
                key={order.id}
                id={`seller-order-row-${order.id}`}
                className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:border-amber-300 transition-all space-y-3"
              >
                {/* Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      #{shortId}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {formatOrderStatus(order.status)}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getPaymentBadgeClass(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status === 'PAID' ? 'PAID ✓' : 'UNPAID'}
                    </span>
                  </div>

                  <span className="text-xs text-stone-500">
                    Placed {formatDateTime(order.created_at)}
                  </span>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <span className="font-bold text-stone-900 block text-sm">
                      {order.customer?.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.customer?.phone}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{order.delivery_location}</span>
                    </div>
                  </div>

                  {/* Items Ordered */}
                  <div className="space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">
                      Ordered Items:
                    </span>
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-stone-800">
                        <span>
                          {item.product?.name || 'Samosa'} × {item.quantity}
                        </span>
                        <span className="font-semibold">{formatUGX(item.subtotal)}</span>
                      </div>
                    ))}
                    {order.customer_note && (
                      <p className="text-stone-500 italic text-[11px] pt-1">
                        Note: "{order.customer_note}"
                      </p>
                    )}
                  </div>

                  {/* Pricing & Quick Actions */}
                  <div className="flex flex-col justify-between items-start md:items-end gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-stone-400 block">Total Due (Cash):</span>
                      <span className="text-base font-extrabold text-amber-700">
                        {formatUGX(order.total_amount)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Status Flow Buttons */}
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Confirm
                          </button>
                          <button
                            onClick={() => onUpdateStatus(order.id, 'REJECTED')}
                            className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <ChefHat className="w-3 h-3" />
                          Start Prep
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'READY')}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          Mark Ready
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                          className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          Send Out
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Delivered
                        </button>
                      )}

                      {/* Cash collection button */}
                      {order.payment_status === 'UNPAID' &&
                        order.status !== 'CANCELLED' &&
                        order.status !== 'REJECTED' && (
                          <button
                            onClick={() => onMarkAsPaid(order.id)}
                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            title="Mark cash as physically received"
                          >
                            <Banknote className="w-3 h-3" />
                            Mark Paid
                          </button>
                        )}

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        title="View full order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <SellerOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={onUpdateStatus}
          onMarkAsPaid={onMarkAsPaid}
        />
      )}
    </div>
  );
};
