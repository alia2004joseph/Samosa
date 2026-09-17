/**
 * College Samosa Ordering & Sales Management System
 * Core Domain Types matching PostgreSQL / Supabase Schema
 */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'UNPAID' | 'PAID';

export type PaymentMethod = 'CASH';

export type InventoryTransactionType =
  | 'INITIAL_STOCK'
  | 'RESTOCK'
  | 'ORDER'
  | 'ORDER_CANCELLED'
  | 'MANUAL_ADJUSTMENT';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // Integer in UGX (e.g. 1000)
  packs_per_unit: number; // For samosas, 2 samosas per pack
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity_available: number; // Number of packs
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  total_amount: number; // Integer in UGX
  delivery_location: string;
  customer_note: string | null;
  tracking_token: string; // UUID for guest order tracking
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations for convenience in views
  customer?: Customer;
  items?: OrderItemWithProduct[];
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number; // Number of packs ordered
  unit_price: number; // Snapshot of price at order time in UGX
  subtotal: number; // quantity * unit_price
  created_at: string;
}

export interface OrderItemWithProduct extends OrderItem {
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  note: string | null;
  changed_at: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  quantity_change: number; // Positive = added, Negative = deducted
  transaction_type: InventoryTransactionType;
  reference: string | null;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreateOrderPayload {
  name: string;
  phone: string;
  email: string;
  delivery_location: string;
  customer_note?: string;
  items: { product_id: string; quantity: number }[];
}

export interface CheckoutResult {
  success: boolean;
  order_id?: string;
  tracking_token?: string;
  total_amount?: number;
  error?: string;
  available_stock?: number;
  product_name?: string;
}

export interface SalesReport {
  period: 'today' | '7days' | 'month' | 'custom';
  total_orders_count: number;
  delivered_orders_count: number;
  paid_orders_count: number;
  unpaid_delivered_count: number;
  total_sales_amount: number; // Sum of delivered orders in UGX
  total_cash_collected: number; // Sum of PAID orders in UGX
  pending_cash_collection: number; // Delivered but UNPAID
}
