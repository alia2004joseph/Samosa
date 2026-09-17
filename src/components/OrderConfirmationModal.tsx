import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ExternalLink, MapPin } from 'lucide-react';
import { Order } from '../types';
import { formatUGX } from '../utils/formatting';

interface OrderConfirmationModalProps {
  order: Order;
  onTrackOrder: (token: string) => void;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onTrackOrder,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const shortId = order.id.substring(4, 12).toUpperCase();
  const trackingUrl = `${window.location.origin}/#track-${order.tracking_token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
        {/* Header Success Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900">Order Placed Successfully!</h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Your samosas have been reserved and our kitchen is notified.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500 font-medium">Order Number</span>
            <span className="font-mono font-bold text-stone-900 text-sm">#{shortId}</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-stone-500 block text-xs font-semibold">Ordered Items:</span>
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-stone-800">
                <span>
                  {item.product?.name || 'Samosa Pack'} × {item.quantity}
                </span>
                <span className="font-semibold">{formatUGX(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
            <span>Total to Pay on Delivery:</span>
            <span className="text-amber-700 text-base">{formatUGX(order.total_amount)}</span>
          </div>

          <div className="pt-2 border-t border-stone-200 text-stone-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              Delivery destination:{' '}
              <strong className="text-stone-900">{order.delivery_location}</strong>
            </span>
          </div>
        </div>

        {/* Tracking Token & Link */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-stone-700">
            Your Private Guest Tracking Link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={trackingUrl}
              className="flex-1 px-3 py-2 text-xs bg-stone-100 border border-stone-300 rounded-lg text-stone-700 font-mono truncate select-all"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            Bookmark this link or save your order number to track delivery status from any device.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-confirm-track"
            onClick={() => {
              onClose();
              onTrackOrder(order.tracking_token);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Track My Order Now
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
