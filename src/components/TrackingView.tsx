import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  Clock,
  ChefHat,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  Banknote,
  Phone,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatUGX, formatDateTime, getPaymentBadgeClass } from '../utils/formatting';

interface TrackingViewProps {
  initialToken?: string;
  onSearchToken: (token: string) => Order | undefined;
}

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'PENDING', label: 'Order Received', icon: Clock },
  { status: 'CONFIRMED', label: 'Seller Confirmed', icon: CheckCircle },
  { status: 'PREPARING', label: 'Preparing in Kitchen', icon: ChefHat },
  { status: 'READY', label: 'Ready for Delivery', icon: PackageCheck },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export const TrackingView: React.FC<TrackingViewProps> = ({
  initialToken,
  onSearchToken,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken || '');
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      const found = onSearchToken(initialToken);
      setOrder(found);
      setHasSearched(true);
    }
  }, [initialToken, onSearchToken]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    const found = onSearchToken(tokenInput.trim());
    setOrder(found);
    setHasSearched(true);
  };

  const getStepStatus = (stepIndex: number, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    if (currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') {
      return 'cancelled';
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Track Your Samosa Order
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Enter your secure tracking token or order link to check real-time kitchen and delivery progress.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              id="tracking-token-input"
              type="text"
              placeholder="Paste your UUID tracking token..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            id="tracking-search-btn"
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-colors shrink-0"
          >
            Track Order
          </button>
        </form>
      </div>

      {/* If searched and not found */}
      {hasSearched && !order && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-stone-900">Order Not Found</h2>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            We couldn't find an order matching that tracking token. Please double check that you copied the full UUID token.
          </p>
        </div>
      )}

      {/* Found Order Card */}
      {order && (
        <div className="space-y-6">
          {/* Top Status Header */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-stone-900">
                    Order #{order.id.substring(4, 12).toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleCopyToken(order.tracking_token)}
                    title="Copy tracking token"
                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <span className="text-xs text-stone-500 block">
                  Placed on {formatDateTime(order.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${getPaymentBadgeClass(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status === 'PAID'
                    ? 'Cash Payment Received ✓'
                    : 'Unpaid • Pay on Delivery'}
                </span>
              </div>
            </div>

            {/* Special Cancelled / Rejected Notice */}
            {(order.status === 'CANCELLED' || order.status === 'REJECTED') && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <strong className="block font-bold">
                    Order {order.status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
                  </strong>
                  <p>
                    {order.status === 'CANCELLED'
                      ? 'This order has been cancelled.'
                      : 'The kitchen could not fulfill this order at this time. Reserved stock has been returned to inventory.'}
                  </p>
                </div>
              </div>
            )}

            {/* Visual Step Timeline */}
            {order.status !== 'CANCELLED' && order.status !== 'REJECTED' && (
              <div className="py-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-6">
                  Live Preparation & Delivery Progress
                </h2>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-stone-200 -z-0" />

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                    {STEPS.map((step, idx) => {
                      const state = getStepStatus(idx, order.status);
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.status}
                          className="flex flex-col items-center text-center space-y-2"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              state === 'completed'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : state === 'current'
                                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-200 font-bold scale-110'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div>
                            <span
                              className={`text-[11px] block leading-tight font-semibold ${
                                state === 'current'
                                  ? 'text-amber-800 font-bold'
                                  : state === 'completed'
                                  ? 'text-stone-900'
                                  : 'text-stone-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            {state === 'current' && (
                              <span className="inline-block mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delivery & Items Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Destination Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                Delivery Information
              </h2>

              <div className="space-y-2 text-xs text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[11px]">Deliver To:</span>
                  <span className="font-semibold text-stone-900 text-sm">
                    {order.delivery_location}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[11px]">Customer:</span>
                  <span className="font-medium text-stone-800">
                    {order.customer?.name || 'Customer'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-medium text-stone-800">{order.customer?.phone}</span>
                </div>

                {order.customer_note && (
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 mt-2">
                    <span className="text-[11px] font-semibold text-stone-500 block">
                      Customer Note:
                    </span>
                    <span className="italic text-stone-700">{order.customer_note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items & Payment Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <Banknote className="w-4 h-4 text-amber-600" />
                Items & Payment
              </h2>

              <div className="divide-y divide-stone-100 text-xs space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="pt-2 flex justify-between">
                    <div>
                      <span className="font-semibold text-stone-800 block">
                        {item.product?.name || 'Samosa Pack'}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        {item.quantity} packs × {formatUGX(item.unit_price)}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">{formatUGX(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-xs font-bold text-stone-700">Total Due (Cash):</span>
                <span className="text-lg font-extrabold text-amber-700">
                  {formatUGX(order.total_amount)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900">
                Please have exact cash ({formatUGX(order.total_amount)}) ready for the runner.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
