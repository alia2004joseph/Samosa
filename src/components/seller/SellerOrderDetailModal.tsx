import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  ChefHat,
  PackageCheck,
  Check,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import {
  formatUGX,
  formatDateTime,
  formatOrderStatus,
  getStatusBadgeClass,
  getPaymentBadgeClass,
} from '../../utils/formatting';

interface SellerOrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  onMarkAsPaid: (orderId: string) => Promise<void>;
}

export const SellerOrderDetailModal: React.FC<SellerOrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onMarkAsPaid,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const shortId = order.id.substring(4, 12).toUpperCase();

  const handleAction = async (status: OrderStatus) => {
    setIsProcessing(true);
    try {
      await onUpdateStatus(order.id, status, noteInput || undefined);
      setNoteInput('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaid = async () => {
    setIsProcessing(true);
    try {
      await onMarkAsPaid(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-stone-900 font-mono">Order #{shortId}</h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                  order.status
                )}`}
              >
                {formatOrderStatus(order.status)}
              </span>
            </div>
            <span className="text-xs text-stone-500 block mt-1">
              Received: {formatDateTime(order.created_at)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer & Delivery Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-stone-700 block uppercase tracking-wider text-[10px]">
              Customer Details
            </span>
            <div className="font-semibold text-stone-900 text-sm">{order.customer?.name}</div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <a href={`tel:${order.customer?.phone}`} className="text-amber-800 hover:underline">
                {order.customer?.phone}
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>{order.customer?.email}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-stone-700 block uppercase tracking-wider text-[10px]">
              Delivery Location
            </span>
            <div className="flex items-start gap-1.5 font-semibold text-stone-900">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{order.delivery_location}</span>
            </div>
            {order.customer_note && (
              <div className="pt-1 text-stone-600 italic">
                <span className="font-semibold not-italic text-stone-700 block text-[11px]">
                  Customer Note:
                </span>
                "{order.customer_note}"
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Ordered Samosa Packs
          </h3>
          <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 text-sm block">
                    {item.product?.name || 'Samosa Pack'}
                  </span>
                  <span className="text-stone-500">
                    {item.quantity} packs × {formatUGX(item.unit_price)} (
                    {(item.product?.packs_per_unit || 2) * item.quantity} samosas total)
                  </span>
                </div>
                <span className="font-bold text-stone-900 text-sm">
                  {formatUGX(item.subtotal)}
                </span>
              </div>
            ))}

            <div className="p-3 bg-stone-50 flex items-center justify-between text-sm font-extrabold text-stone-900">
              <span>Total Order Value</span>
              <span className="text-amber-800 text-base">{formatUGX(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status & Action */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold">Payment Status:</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPaymentBadgeClass(
                  order.payment_status
                )}`}
              >
                {order.payment_status === 'PAID' ? 'PAID (Cash Collected)' : 'UNPAID (Pending Cash)'}
              </span>
            </div>
            {order.paid_at && (
              <span className="text-[11px] text-stone-500 block mt-0.5">
                Paid at: {formatDateTime(order.paid_at)}
              </span>
            )}
          </div>

          {order.payment_status === 'UNPAID' &&
            order.status !== 'CANCELLED' &&
            order.status !== 'REJECTED' && (
              <button
                id="btn-modal-mark-paid"
                onClick={handlePaid}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Banknote className="w-4 h-4" />
                Mark Cash as Received
              </button>
            )}
        </div>

        {/* Workflow Progression Actions */}
        <div className="space-y-3 pt-2 border-t border-stone-200">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            Order Status Actions
          </label>

          <div className="flex flex-wrap gap-2">
            {order.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleAction('CONFIRMED')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirm Order
                </button>
                <button
                  onClick={() => handleAction('REJECTED')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject (Return Stock)
                </button>
              </>
            )}

            {order.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => handleAction('PREPARING')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  Start Kitchen Prep
                </button>
                <button
                  onClick={() => handleAction('REJECTED')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject (Return Stock)
                </button>
              </>
            )}

            {order.status === 'PREPARING' && (
              <button
                onClick={() => handleAction('READY')}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                Mark Ready for Runner
              </button>
            )}

            {order.status === 'READY' && (
              <button
                onClick={() => handleAction('OUT_FOR_DELIVERY')}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                Send Out for Delivery
              </button>
            )}

            {order.status === 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => handleAction('DELIVERED')}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Delivered
              </button>
            )}

            {order.status === 'DELIVERED' && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                Order successfully delivered to customer.
              </span>
            )}

            {(order.status === 'CANCELLED' || order.status === 'REJECTED') && (
              <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                Order is closed. Stock was automatically returned.
              </span>
            )}
          </div>
        </div>

        {/* Audit History Log */}
        <div className="space-y-2 pt-2 border-t border-stone-200">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Order Status Audit Trail
          </h3>
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2 text-xs">
            {order.status_history?.map((h) => (
              <div key={h.id} className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-stone-800">
                    {h.old_status ? `${h.old_status} → ` : ''}
                    {h.new_status}
                  </span>
                  {h.note && <p className="text-stone-500 text-[11px] mt-0.5">{h.note}</p>}
                </div>
                <span className="text-stone-400 text-[10px] shrink-0">
                  {formatDateTime(h.changed_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
