/**
 * College Samosa Ordering & Sales Management System
 * Core State Engine & Business Logic Layer
 *
 * Implements strict PostgreSQL business rules, row-level locking semantics,
 * atomic stock deduction, auditable inventory transactions, and status history.
 */

import {
  Product,
  Inventory,
  Customer,
  Order,
  OrderItemWithProduct,
  OrderStatus,
  PaymentStatus,
  InventoryTransaction,
  OrderStatusHistory,
  CreateOrderPayload,
  CheckoutResult,
  SalesReport,
} from '../types';
import { notifyOrderPlaced, notifyOrderStatusChange, notifyPaymentRecorded } from './email';

// Initial Seeds matching PostgreSQL migration
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Rice Samosa Pack',
    description: 'Crispy spiced rice samosas folded in golden pastry triangles. Served fresh and hot.',
    price: 1000,
    packs_per_unit: 2,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Cowpeas Samosa Pack',
    description: 'Savory seasoned cowpeas (kunde) with aromatic herbs in a flaky, crunchy crust.',
    price: 1000,
    packs_per_unit: 2,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z',
  },
];

const INITIAL_INVENTORY: Inventory[] = [
  {
    id: 'inv-1111',
    product_id: '11111111-1111-1111-1111-111111111111',
    quantity_available: 40,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-2222',
    product_id: '22222222-2222-2222-2222-222222222222',
    quantity_available: 30,
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-init-1',
    product_id: '11111111-1111-1111-1111-111111111111',
    quantity_change: 40,
    transaction_type: 'INITIAL_STOCK',
    reference: 'INITIAL_STOCK',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-init-2',
    product_id: '22222222-2222-2222-2222-222222222222',
    quantity_change: 30,
    transaction_type: 'INITIAL_STOCK',
    reference: 'INITIAL_STOCK',
    created_at: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'college_samosa_store_v1';

interface StorageState {
  products: Product[];
  inventory: Inventory[];
  customers: Customer[];
  orders: Order[];
  transactions: InventoryTransaction[];
}

class StoreEngine {
  private products: Product[] = [];
  private inventory: Inventory[] = [];
  private customers: Customer[] = [];
  private orders: Order[] = [];
  private transactions: InventoryTransaction[] = [];
  private listeners: (() => void)[] = [];
  private isExecutingTransaction: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StorageState = JSON.parse(raw);
        this.products = parsed.products || INITIAL_PRODUCTS;
        this.inventory = parsed.inventory || INITIAL_INVENTORY;
        this.customers = parsed.customers || [];
        this.orders = parsed.orders || [];
        this.transactions = parsed.transactions || INITIAL_TRANSACTIONS;
        return;
      }
    } catch (e) {
      console.warn('Failed reading from localStorage, using initial seeds', e);
    }

    this.products = [...INITIAL_PRODUCTS];
    this.inventory = [...INITIAL_INVENTORY];
    this.customers = [];
    this.orders = [];
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const state: StorageState = {
        products: this.products,
        inventory: this.inventory,
        customers: this.customers,
        orders: this.orders,
        transactions: this.transactions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed writing to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Error in store listener', err);
      }
    });
  }

  // ==========================================
  // GETTERS
  // ==========================================

  public getProducts(): Product[] {
    return [...this.products];
  }

  public getAvailableProducts(): Product[] {
    return this.products.filter((p) => p.is_available);
  }

  public getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getInventory(): (Inventory & { product?: Product })[] {
    return this.inventory.map((inv) => ({
      ...inv,
      product: this.getProduct(inv.product_id),
    }));
  }

  public getProductStock(productId: string): number {
    const inv = this.inventory.find((i) => i.product_id === productId);
    return inv ? inv.quantity_available : 0;
  }

  public getOrders(): Order[] {
    // Sort descending by created_at
    return [...this.orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public getOrderByTrackingToken(token: string): Order | undefined {
    return this.orders.find(
      (o) => o.tracking_token.toLowerCase() === token.trim().toLowerCase()
    );
  }

  public getInventoryTransactions(): InventoryTransaction[] {
    return [...this.transactions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((tx) => ({
        ...tx,
        product: this.getProduct(tx.product_id),
      }));
  }

  // ==========================================
  // ATOMIC CHECKOUT & STOCK DEDUCTION
  // ==========================================

  /**
   * Atomic Order Creation
   * Simulates the PostgreSQL BEGIN ... FOR UPDATE ... COMMIT transaction
   */
  public async createOrderAtomic(payload: CreateOrderPayload): Promise<CheckoutResult> {
    // Mutex lock to simulate database-level serialization
    if (this.isExecutingTransaction) {
      // Wait momentarily if another checkout is running
      await new Promise((r) => setTimeout(r, 80));
    }
    this.isExecutingTransaction = true;

    try {
      // 1. Basic validation
      if (!payload.items || payload.items.length === 0) {
        return { success: false, error: 'Cart is empty. Please select samosas to order.' };
      }

      // 2. Lock & Validate each product and requested stock
      let calculatedTotal = 0;
      const verifiedItems: { product: Product; quantity: number; unitPrice: number; subtotal: number }[] = [];

      for (const item of payload.items) {
        if (item.quantity <= 0) {
          return { success: false, error: 'Item quantity must be greater than zero.' };
        }

        const product = this.products.find((p) => p.id === item.product_id);
        if (!product) {
          return { success: false, error: 'One of the products in your cart was not found.' };
        }

        if (!product.is_available) {
          return {
            success: false,
            error: `"${product.name}" is currently marked as unavailable.`,
          };
        }

        const inv = this.inventory.find((i) => i.product_id === product.id);
        const availableStock = inv ? inv.quantity_available : 0;

        if (availableStock < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for "${product.name}". Available: ${availableStock} packs, Requested: ${item.quantity} packs.`,
            available_stock: availableStock,
            product_name: product.name,
          };
        }

        const unitPrice = product.price;
        const subtotal = unitPrice * item.quantity;
        calculatedTotal += subtotal;

        verifiedItems.push({
          product,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      // 3. Atomically deduct stock from inventory
      const now = new Date().toISOString();
      for (const item of verifiedItems) {
        const inv = this.inventory.find((i) => i.product_id === item.product.id);
        if (inv) {
          inv.quantity_available -= item.quantity;
          inv.updated_at = now;
        }
      }

      // 4. Create customer record
      const customerId = 'cust-' + crypto.randomUUID();
      const newCustomer: Customer = {
        id: customerId,
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        email: payload.email.trim(),
        created_at: now,
      };
      this.customers.push(newCustomer);

      // 5. Generate secure tracking token (UUID) & Order ID
      const orderId = 'ord-' + crypto.randomUUID();
      const trackingToken = crypto.randomUUID();

      // 6. Build Order items with frozen unit price
      const orderItems: OrderItemWithProduct[] = verifiedItems.map((v, idx) => ({
        id: `item-${orderId}-${idx + 1}`,
        order_id: orderId,
        product_id: v.product.id,
        quantity: v.quantity,
        unit_price: v.unitPrice,
        subtotal: v.subtotal,
        created_at: now,
        product: v.product,
      }));

      // 7. Initial status history record
      const initialHistory: OrderStatusHistory[] = [
        {
          id: 'hist-' + crypto.randomUUID(),
          order_id: orderId,
          old_status: null,
          new_status: 'PENDING',
          note: 'Order placed by customer via web app.',
          changed_at: now,
        },
      ];

      // 8. Create full Order
      const newOrder: Order = {
        id: orderId,
        customer_id: customerId,
        status: 'PENDING',
        payment_status: 'UNPAID',
        payment_method: 'CASH',
        total_amount: calculatedTotal,
        delivery_location: payload.delivery_location.trim(),
        customer_note: payload.customer_note?.trim() || null,
        tracking_token: trackingToken,
        paid_at: null,
        created_at: now,
        updated_at: now,
        customer: newCustomer,
        items: orderItems,
        status_history: initialHistory,
      };

      this.orders.push(newOrder);

      // 9. Record inventory transactions for audit
      const shortOrderId = orderId.substring(4, 12).toUpperCase();
      for (const item of verifiedItems) {
        this.transactions.push({
          id: 'tx-' + crypto.randomUUID(),
          product_id: item.product.id,
          quantity_change: -item.quantity,
          transaction_type: 'ORDER',
          reference: `ORDER #${shortOrderId}`,
          created_at: now,
        });
      }

      // Persist atomically
      this.saveToStorage();

      // 10. Asynchronous Email Dispatch (non-blocking)
      const trackingUrl = `${window.location.origin}/#track-${trackingToken}`;
      notifyOrderPlaced(newOrder, trackingUrl).catch((err) =>
        console.warn('Background email notification error (non-fatal):', err)
      );

      return {
        success: true,
        order_id: orderId,
        tracking_token: trackingToken,
        total_amount: calculatedTotal,
      };
    } finally {
      this.isExecutingTransaction = false;
    }
  }

  // ==========================================
  // STATUS TRANSITION & STOCK RETURN
  // ==========================================

  /**
   * Update order status with state-machine transition guard and automatic stock return on Cancel/Reject
   */
  public async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ): Promise<{ success: boolean; error?: string }> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.status === newStatus) {
      return { success: true };
    }

    // Terminal state protection
    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return {
        success: false,
        error: `Cannot update order because it has already been ${order.status.toLowerCase()}.`,
      };
    }

    if (order.status === 'DELIVERED' && newStatus !== 'DELIVERED') {
      return {
        success: false,
        error: 'Delivered orders cannot be rolled back to earlier states.',
      };
    }

    const now = new Date().toISOString();
    const oldStatus = order.status;

    // STOCK RETURN RULE:
    // If order is cancelled or rejected, atomically return stock and record ORDER_CANCELLED
    if ((newStatus === 'CANCELLED' || newStatus === 'REJECTED') && order.items) {
      const shortId = order.id.substring(4, 12).toUpperCase();
      for (const item of order.items) {
        const inv = this.inventory.find((i) => i.product_id === item.product_id);
        if (inv) {
          inv.quantity_available += item.quantity;
          inv.updated_at = now;
        }

        this.transactions.push({
          id: 'tx-' + crypto.randomUUID(),
          product_id: item.product_id,
          quantity_change: item.quantity,
          transaction_type: 'ORDER_CANCELLED',
          reference: `${newStatus} ORDER #${shortId}`,
          created_at: now,
        });
      }
    }

    // Update status
    order.status = newStatus;
    order.updated_at = now;

    if (!order.status_history) {
      order.status_history = [];
    }

    order.status_history.push({
      id: 'hist-' + crypto.randomUUID(),
      order_id: orderId,
      old_status: oldStatus,
      new_status: newStatus,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
      changed_at: now,
    });

    this.saveToStorage();

    // Trigger notification
    const trackingUrl = `${window.location.origin}/#track-${order.tracking_token}`;
    notifyOrderStatusChange(order, newStatus, trackingUrl).catch((err) =>
      console.warn('Notification failure (non-fatal):', err)
    );

    return { success: true };
  }

  // ==========================================
  // CASH PAYMENT RECORDING
  // ==========================================

  /**
   * Record physical cash payment received by the seller
   */
  public async recordCashPayment(
    orderId: string,
    note: string = 'Cash collected physically upon delivery'
  ): Promise<{ success: boolean; error?: string }> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.payment_status === 'PAID') {
      return { success: true };
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return {
        success: false,
        error: `Cannot record payment for a ${order.status.toLowerCase()} order.`,
      };
    }

    const now = new Date().toISOString();
    order.payment_status = 'PAID';
    order.paid_at = now;
    order.updated_at = now;

    if (!order.status_history) {
      order.status_history = [];
    }

    order.status_history.push({
      id: 'hist-' + crypto.randomUUID(),
      order_id: orderId,
      old_status: order.status,
      new_status: order.status,
      note: `Cash Payment Recorded: ${note}`,
      changed_at: now,
    });

    this.saveToStorage();

    // Receipt notification
    notifyPaymentRecorded(order).catch((err) =>
      console.warn('Payment receipt notification failure (non-fatal):', err)
    );

    return { success: true };
  }

  // ==========================================
  // INVENTORY RESTOCK & ADJUSTMENT
  // ==========================================

  public restockProduct(
    productId: string,
    packsToAdd: number,
    reference: string = 'RESTOCK'
  ): { success: boolean; error?: string } {
    if (packsToAdd <= 0) {
      return { success: false, error: 'Restock quantity must be a positive number.' };
    }

    const inv = this.inventory.find((i) => i.product_id === productId);
    if (!inv) {
      return { success: false, error: 'Inventory record not found.' };
    }

    const now = new Date().toISOString();
    inv.quantity_available += packsToAdd;
    inv.updated_at = now;

    this.transactions.push({
      id: 'tx-' + crypto.randomUUID(),
      product_id: productId,
      quantity_change: packsToAdd,
      transaction_type: 'RESTOCK',
      reference: reference.trim() || 'RESTOCK',
      created_at: now,
    });

    this.saveToStorage();
    return { success: true };
  }

  public adjustProductStock(
    productId: string,
    newPacksCount: number,
    reason: string = 'MANUAL STOCK CORRECTION'
  ): { success: boolean; error?: string } {
    if (newPacksCount < 0) {
      return { success: false, error: 'Stock count cannot be negative.' };
    }

    const inv = this.inventory.find((i) => i.product_id === productId);
    if (!inv) {
      return { success: false, error: 'Inventory record not found.' };
    }

    const diff = newPacksCount - inv.quantity_available;
    if (diff === 0) {
      return { success: true };
    }

    const now = new Date().toISOString();
    inv.quantity_available = newPacksCount;
    inv.updated_at = now;

    this.transactions.push({
      id: 'tx-' + crypto.randomUUID(),
      product_id: productId,
      quantity_change: diff,
      transaction_type: 'MANUAL_ADJUSTMENT',
      reference: reason.trim() || 'MANUAL STOCK CORRECTION',
      created_at: now,
    });

    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // PRODUCT MANAGEMENT
  // ==========================================

  public createProduct(
    name: string,
    description: string,
    price: number,
    packsPerUnit: number = 2,
    imageUrl?: string,
    initialStock: number = 0
  ): { success: boolean; product?: Product; error?: string } {
    if (!name || !name.trim()) {
      return { success: false, error: 'Product name is required.' };
    }
    if (price <= 0) {
      return { success: false, error: 'Price must be greater than zero.' };
    }
    if (packsPerUnit <= 0) {
      return { success: false, error: 'Packs per unit must be at least 1.' };
    }

    const now = new Date().toISOString();
    const productId = crypto.randomUUID();

    const newProduct: Product = {
      id: productId,
      name: name.trim(),
      description: description?.trim() || null,
      price: Math.round(price),
      packs_per_unit: packsPerUnit,
      image_url:
        imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      created_at: now,
      updated_at: now,
    };

    this.products.push(newProduct);

    this.inventory.push({
      id: 'inv-' + crypto.randomUUID(),
      product_id: productId,
      quantity_available: initialStock > 0 ? initialStock : 0,
      updated_at: now,
    });

    if (initialStock > 0) {
      this.transactions.push({
        id: 'tx-' + crypto.randomUUID(),
        product_id: productId,
        quantity_change: initialStock,
        transaction_type: 'INITIAL_STOCK',
        reference: 'INITIAL_STOCK',
        created_at: now,
      });
    }

    this.saveToStorage();
    return { success: true, product: newProduct };
  }

  public updateProduct(
    productId: string,
    updates: Partial<Pick<Product, 'name' | 'description' | 'price' | 'image_url' | 'is_available' | 'packs_per_unit'>>
  ): { success: boolean; error?: string } {
    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    if (updates.name !== undefined) product.name = updates.name.trim();
    if (updates.description !== undefined) product.description = updates.description?.trim() || null;
    if (updates.price !== undefined) {
      if (updates.price < 0) return { success: false, error: 'Price cannot be negative.' };
      product.price = Math.round(updates.price);
    }
    if (updates.image_url !== undefined) product.image_url = updates.image_url?.trim() || null;
    if (updates.is_available !== undefined) product.is_available = updates.is_available;
    if (updates.packs_per_unit !== undefined) product.packs_per_unit = updates.packs_per_unit;

    product.updated_at = new Date().toISOString();
    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // SALES REPORTING
  // ==========================================

  public getSalesReport(period: 'today' | '7days' | 'month' | 'custom', customStart?: Date, customEnd?: Date): SalesReport {
    const now = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7days') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'custom' && customStart) {
      startDate = new Date(customStart);
    }

    const endDate = period === 'custom' && customEnd ? new Date(customEnd) : now;

    const filtered = this.orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= startDate && d <= endDate;
    });

    const totalOrders = filtered.length;
    const deliveredOrders = filtered.filter((o) => o.status === 'DELIVERED');
    const paidOrders = filtered.filter((o) => o.payment_status === 'PAID');
    const unpaidDelivered = filtered.filter(
      (o) => o.status === 'DELIVERED' && o.payment_status === 'UNPAID'
    );

    const totalSales = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const cashCollected = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const pendingCash = unpaidDelivered.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      period,
      total_orders_count: totalOrders,
      delivered_orders_count: deliveredOrders.length,
      paid_orders_count: paidOrders.length,
      unpaid_delivered_count: unpaidDelivered.length,
      total_sales_amount: totalSales,
      total_cash_collected: cashCollected,
      pending_cash_collection: pendingCash,
    };
  }

  // Helper to reset data for testing
  public resetToSeeds() {
    this.products = [...INITIAL_PRODUCTS];
    this.inventory = [...INITIAL_INVENTORY];
    this.customers = [];
    this.orders = [];
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.saveToStorage();
  }
}

export const store = new StoreEngine();
