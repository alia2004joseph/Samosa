/**
 * Money, date, and status formatting utilities
 */

import { OrderStatus, PaymentStatus } from '../types';

/**
 * Format whole integer UGX values: 1000 -> UGX 1,000
 */
export function formatUGX(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'UGX 0';
  }
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Format human-readable datetime
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * Format time only (e.g. 12:45 PM)
 */
export function formatTimeOnly(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * Format Order Status label
 */
export function formatOrderStatus(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Order Received';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PREPARING':
      return 'Preparing';
    case 'READY':
      return 'Ready for Pickup / Delivery';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
}

/**
 * Tailwind badge styling for Order Status
 */
export function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-900 border-blue-300';
    case 'PREPARING':
      return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    case 'READY':
      return 'bg-purple-100 text-purple-900 border-purple-300';
    case 'OUT_FOR_DELIVERY':
      return 'bg-orange-100 text-orange-900 border-orange-300';
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'CANCELLED':
      return 'bg-stone-100 text-stone-700 border-stone-300';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-900 border-rose-300';
    default:
      return 'bg-stone-100 text-stone-800 border-stone-300';
  }
}

/**
 * Tailwind badge styling for Payment Status
 */
export function getPaymentBadgeClass(paymentStatus: PaymentStatus): string {
  if (paymentStatus === 'PAID') {
    return 'bg-emerald-50 text-emerald-800 border-emerald-300';
  }
  return 'bg-amber-50 text-amber-800 border-amber-300';
}
