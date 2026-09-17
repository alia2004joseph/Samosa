import React from 'react';
import {
  Clock,
  ChefHat,
  Truck,
  CheckCircle2,
  Banknote,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  FileText,
} from 'lucide-react';
import { Order, Product, Inventory } from '../../types';
import { formatUGX } from '../../utils/formatting';

interface SellerDashboardProps {
  orders: Order[];
  products: Product[];
  inventory: Inventory[];
  onNavigateTab: (tab: 'orders' | 'inventory' | 'products' | 'sales' | 'emails', filter?: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  orders,
  products,
  inventory,
  onNavigateTab,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const kitchenOrders = orders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'PREPARING'
  );
  const deliveryOrders = orders.filter(
    (o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY'
  );

  const deliveredToday = orders.filter((o) => {
    const d = new Date(o.updated_at || o.created_at);
    return o.status === 'DELIVERED' && d >= today;
  });

  const unpaidOrders = orders.filter(
    (o) => o.payment_status === 'UNPAID' && o.status !== 'CANCELLED' && o.status !== 'REJECTED'
  );

  const todaySalesAmount = deliveredToday.reduce((sum, o) => sum + o.total_amount, 0);

  const lowStockProducts = inventory.filter((inv) => inv.quantity_available <= 5);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Seller Overview
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Monitor real-time orders, cash collection, and kitchen stock status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-700">Kitchen Live & Online</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Orders Card */}
        <button
          id="card-pending-orders"
          onClick={() => onNavigateTab('orders', 'PENDING')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Needs Action
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {pendingOrders.length}
          </div>
          <div className="text-xs text-stone-500 font-medium mt-1 flex items-center justify-between">
            <span>Pending Orders</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Confirmed / Kitchen Card */}
        <button
          id="card-kitchen-orders"
          onClick={() => onNavigateTab('orders', 'KITCHEN')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Kitchen
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {kitchenOrders.length}
          </div>
          <div className="text-xs text-stone-500 font-medium mt-1 flex items-center justify-between">
            <span>Confirmed / Preparing</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Ready / Delivery Card */}
        <button
          id="card-delivery-orders"
          onClick={() => onNavigateTab('orders', 'DELIVERY')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              On the Move
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {deliveryOrders.length}
          </div>
          <div className="text-xs text-stone-500 font-medium mt-1 flex items-center justify-between">
            <span>Ready / Out for Delivery</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Delivered Today Card */}
        <button
          id="card-delivered-today"
          onClick={() => onNavigateTab('orders', 'DELIVERED')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Fulfilled
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {deliveredToday.length}
          </div>
          <div className="text-xs text-stone-500 font-medium mt-1 flex items-center justify-between">
            <span>Delivered Today</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      {/* Financial & Stock Triage Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Unpaid Orders Alert Card */}
        <button
          id="card-unpaid-orders"
          onClick={() => onNavigateTab('orders', 'UNPAID')}
          className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 text-left hover:bg-amber-50 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Cash Collection
            </span>
            <Banknote className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-2xl font-extrabold text-amber-950">
            {unpaidOrders.length} Unpaid Orders
          </div>
          <p className="text-xs text-amber-800 mt-1">
            Cash to collect from customers upon delivery. Click to view.
          </p>
        </button>

        {/* Today's Sales Card */}
        <button
          id="card-today-sales"
          onClick={() => onNavigateTab('sales')}
          className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 text-left hover:bg-emerald-50 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Today's Completed Sales
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">
            {formatUGX(todaySalesAmount)}
          </div>
          <p className="text-xs text-emerald-800 mt-1">
            Total value of fulfilled orders delivered today.
          </p>
        </button>

        {/* Low Stock Warning Card */}
        <button
          id="card-low-stock"
          onClick={() => onNavigateTab('inventory')}
          className={`p-5 rounded-2xl border text-left transition-colors group ${
            lowStockProducts.length > 0
              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Kitchen Stock
            </span>
            <AlertTriangle
              className={`w-5 h-5 ${
                lowStockProducts.length > 0 ? 'text-rose-600' : 'text-stone-400'
              }`}
            />
          </div>
          <div
            className={`text-2xl font-extrabold ${
              lowStockProducts.length > 0 ? 'text-rose-950' : 'text-stone-900'
            }`}
          >
            {lowStockProducts.length > 0
              ? `${lowStockProducts.length} Products Low`
              : 'All Stock Healthy'}
          </div>
          <p className="text-xs text-stone-600 mt-1">
            {lowStockProducts.length > 0
              ? 'Packs are running low. Click to restock immediately.'
              : 'Sufficient packs in stock for incoming orders.'}
          </p>
        </button>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
          Management Sections
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('orders')}
            className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-left space-y-1"
          >
            <Layers className="w-5 h-5 text-amber-600 mb-2" />
            <span className="text-sm font-bold text-stone-900 block">Orders Dispatch</span>
            <span className="text-xs text-stone-500 block">Process & confirm incoming orders</span>
          </button>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-left space-y-1"
          >
            <Package className="w-5 h-5 text-amber-600 mb-2" />
            <span className="text-sm font-bold text-stone-900 block">Inventory & Restock</span>
            <span className="text-xs text-stone-500 block">Manage packs & view audit log</span>
          </button>

          <button
            onClick={() => onNavigateTab('products')}
            className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-left space-y-1"
          >
            <FileText className="w-5 h-5 text-amber-600 mb-2" />
            <span className="text-sm font-bold text-stone-900 block">Product Menu</span>
            <span className="text-xs text-stone-500 block">Add, edit pricing & availability</span>
          </button>

          <button
            onClick={() => onNavigateTab('sales')}
            className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-left space-y-1"
          >
            <TrendingUp className="w-5 h-5 text-amber-600 mb-2" />
            <span className="text-sm font-bold text-stone-900 block">Sales Reports</span>
            <span className="text-xs text-stone-500 block">Review revenue & cash collected</span>
          </button>
        </div>
      </div>
    </div>
  );
};
