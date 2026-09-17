/**
 * Transactional Email Notification Service
 *
 * Requirements:
 * - Order placed: Customer (confirmation, items, total, tracking link) & Seller (alert)
 * - Order confirmed: Customer
 * - Preparing / Ready / Out for delivery: Customer
 * - Delivered: Customer
 * - Cash Payment recorded: Customer
 * - Resilience: Email failure does NOT roll back or cancel successful database orders.
 */

import { Order, OrderStatus } from '../types';
import { formatUGX } from '../utils/formatting';

export interface EmailLog {
  id: string;
  orderId: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'SENT' | 'FAILED' | 'SIMULATED';
  timestamp: string;
  error?: string;
}

// In-memory or persisted log of dispatched emails for audit & UI visibility
const emailLogs: EmailLog[] = [];

export function getEmailLogs(): EmailLog[] {
  return [...emailLogs].reverse();
}

/**
 * Dispatch an email safely with fail-open guarantee (never throws to break order flow)
 */
async function sendEmailSafely(
  orderId: string,
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<{ success: boolean; log: EmailLog }> {
  const logId = 'email-' + Math.random().toString(36).substring(2, 9);
  const timestamp = new Date().toISOString();

  try {
    const apiKey = import.meta.env.VITE_EMAIL_API_KEY || '';
    const fromEmail = import.meta.env.VITE_EMAIL_FROM || 'orders@collegesamosa.com';

    // If external transactional provider key is configured (e.g. Resend)
    if (apiKey && apiKey.startsWith('re_')) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: htmlBody,
          text: textBody,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Email Provider Error] HTTP ${response.status}: ${errorText}`);
        const log: EmailLog = {
          id: logId,
          orderId,
          recipient: to,
          subject,
          body: textBody,
          status: 'FAILED',
          timestamp,
          error: `Provider HTTP ${response.status}`,
        };
        emailLogs.push(log);
        return { success: false, log };
      }

      const log: EmailLog = {
        id: logId,
        orderId,
        recipient: to,
        subject,
        body: textBody,
        status: 'SENT',
        timestamp,
      };
      emailLogs.push(log);
      return { success: true, log };
    }

    // Default: Clean simulated transactional dispatch (logged in-app for auditing)
    console.info(`[Email Service Simulated] To: ${to} | Subject: "${subject}"`);
    const log: EmailLog = {
      id: logId,
      orderId,
      recipient: to,
      subject,
      body: textBody,
      status: 'SIMULATED',
      timestamp,
    };
    emailLogs.push(log);
    return { success: true, log };
  } catch (err: any) {
    console.error('[Email Dispatch Failed]', err);
    const log: EmailLog = {
      id: logId,
      orderId,
      recipient: to,
      subject,
      body: textBody,
      status: 'FAILED',
      timestamp,
      error: err.message || 'Unknown network error',
    };
    emailLogs.push(log);
    return { success: false, log };
  }
}

/**
 * Trigger: Order Placed
 * Sends confirmation to customer and notification to seller
 */
export async function notifyOrderPlaced(
  order: Order,
  trackingUrl: string
): Promise<void> {
  const shortId = order.id.substring(0, 8).toUpperCase();
  const customerEmail = order.customer?.email;
  const sellerEmail = import.meta.env.VITE_SELLER_NOTIFICATION_EMAIL || 'seller@collegesamosa.com';

  const itemsList = order.items
    ?.map(
      (item) =>
        `- ${item.product?.name || 'Samosa Pack'} × ${item.quantity} (${formatUGX(item.subtotal)})`
    )
    .join('\n') || '';

  // 1. To Customer
  if (customerEmail) {
    const custSubject = `Order Received #${shortId} - College Samosa`;
    const custText = `Hello ${order.customer?.name},\n\nThank you for your order! Your samosas will be delivered to: ${order.delivery_location}.\n\nOrder Items:\n${itemsList}\n\nTotal: ${formatUGX(order.total_amount)}\nPayment: PAY ON DELIVERY (Cash)\n\nTrack your order status here:\n${trackingUrl}\n\nPlease have exact cash ready upon delivery!`;

    await sendEmailSafely(
      order.id,
      customerEmail,
      custSubject,
      custText.replace(/\n/g, '<br/>'),
      custText
    );
  }

  // 2. To Seller
  if (sellerEmail) {
    const sellerSubject = `🔔 New Order Received #${shortId} (${formatUGX(order.total_amount)})`;
    const sellerText = `New order from ${order.customer?.name} (${order.customer?.phone})\nDelivery location: ${order.delivery_location}\n\nItems:\n${itemsList}\n\nTotal: ${formatUGX(order.total_amount)}\nNote: ${order.customer_note || 'None'}`;

    await sendEmailSafely(
      order.id,
      sellerEmail,
      sellerSubject,
      sellerText.replace(/\n/g, '<br/>'),
      sellerText
    );
  }
}

/**
 * Trigger: Order Status Transition
 */
export async function notifyOrderStatusChange(
  order: Order,
  newStatus: OrderStatus,
  trackingUrl: string
): Promise<void> {
  const customerEmail = order.customer?.email;
  if (!customerEmail) return;

  const shortId = order.id.substring(0, 8).toUpperCase();

  let subject = '';
  let message = '';

  switch (newStatus) {
    case 'CONFIRMED':
      subject = `Order #${shortId} Confirmed - College Samosa`;
      message = `Your order #${shortId} has been confirmed by the kitchen! We are scheduling it for your delivery location: ${order.delivery_location}.`;
      break;
    case 'PREPARING':
      subject = `Order #${shortId} is being prepared! 🥟`;
      message = `Great news! Your fresh, hot samosas are currently being packed for delivery.`;
      break;
    case 'READY':
      subject = `Order #${shortId} is Ready for Delivery`;
      message = `Your order is hot and ready. Our delivery runner is packing it up now!`;
      break;
    case 'OUT_FOR_DELIVERY':
      subject = `🚀 Order #${shortId} is Out for Delivery!`;
      message = `Our delivery runner is currently on the way to: ${order.delivery_location}. Please keep your phone (${order.customer?.phone}) nearby!`;
      break;
    case 'DELIVERED':
      subject = `Order #${shortId} Delivered! Enjoy your samosas!`;
      message = `Your samosas have been delivered to ${order.delivery_location}. Thank you for ordering from College Samosa!`;
      break;
    case 'REJECTED':
      subject = `Order #${shortId} Update`;
      message = `We regret to inform you that your order could not be fulfilled at this time. We apologize for any inconvenience.`;
      break;
    case 'CANCELLED':
      subject = `Order #${shortId} Cancelled`;
      message = `Your order #${shortId} has been cancelled.`;
      break;
    default:
      return;
  }

  const fullText = `Hello ${order.customer?.name},\n\n${message}\n\nTrack order progress:\n${trackingUrl}\n\nThank you!`;
  await sendEmailSafely(
    order.id,
    customerEmail,
    subject,
    fullText.replace(/\n/g, '<br/>'),
    fullText
  );
}

/**
 * Trigger: Cash Payment Recorded
 */
export async function notifyPaymentRecorded(order: Order): Promise<void> {
  const customerEmail = order.customer?.email;
  if (!customerEmail) return;

  const shortId = order.id.substring(0, 8).toUpperCase();
  const subject = `Receipt: Cash Payment Received for Order #${shortId}`;
  const text = `Hello ${order.customer?.name},\n\nThis confirms that your cash payment of ${formatUGX(order.total_amount)} has been received in full by the seller for order #${shortId}.\n\nThank you for your business!`;

  await sendEmailSafely(
    order.id,
    customerEmail,
    subject,
    text.replace(/\n/g, '<br/>'),
    text
  );
}
