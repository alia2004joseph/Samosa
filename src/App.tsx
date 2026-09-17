/**
 * College Samosa Ordering & Sales Management System
 * Main Application Shell & Master Controller
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerHome } from './components/CustomerHome';
import { MenuView } from './components/MenuView';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { TrackingView } from './components/TrackingView';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { SellerLogin } from './components/seller/SellerLogin';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { SellerOrders } from './components/seller/SellerOrders';
import { SellerInventory } from './components/seller/SellerInventory';
import { SellerProducts } from './components/seller/SellerProducts';
import { SellerSales } from './components/seller/SellerSales';
import { SellerEmailLogs } from './components/seller/SellerEmailLogs';
import { SupabaseInfoModal } from './components/SupabaseInfoModal';
import { StreamlitModal } from './components/StreamlitModal';
import { store } from './services/store';
import { Product, CartItem, Order, OrderStatus, CheckoutResult } from './types';
import { LogOut, Layers, Package, FileText, TrendingUp, Mail } from 'lucide-react';

type ViewMode = 'home' | 'menu' | 'cart' | 'checkout' | 'tracking' | 'seller';
type SellerTab = 'dashboard' | 'orders' | 'inventory' | 'products' | 'sales' | 'emails';

export default function App() {
  // Navigation & UI state
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [sellerTab, setSellerTab] = useState<SellerTab>('dashboard');
  const [sellerOrderFilter, setSellerOrderFilter] = useState<string | undefined>(undefined);

  // Cart state in session
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('collegesamosa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Confirmed order state for modal popup
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Tracking query token
  const [activeTrackingToken, setActiveTrackingToken] = useState<string>('');

  // Seller authentication state
  const [isSellerAuth, setIsSellerAuth] = useState<boolean>(() => {
    return sessionStorage.getItem('collegesamosa_seller_auth') === 'true';
  });

  // Supabase info modal
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isStreamlitModalOpen, setIsStreamlitModalOpen] = useState(false);

  // Store subscription trigger
  const [, setStoreVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setStoreVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  // Save cart to session
  useEffect(() => {
    try {
      sessionStorage.setItem('collegesamosa_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to session storage', e);
    }
  }, [cart]);

  // Handle URL hash routing (e.g. #track-uuid)
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#track-')) {
        const token = hash.replace('#track-', '');
        setActiveTrackingToken(token);
        setCurrentView('tracking');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Data helpers
  const products = store.getProducts();
  const availableProducts = store.getAvailableProducts();
  const inventory = store.getInventory();
  const orders = store.getOrders();
  const transactions = store.getInventoryTransactions();

  const getStock = (productId: string) => store.getProductStock(productId);

  // Cart actions
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order submission
  const handleCheckoutSubmit = async (
    name: string,
    phone: string,
    email: string,
    location: string,
    note?: string
  ): Promise<CheckoutResult> => {
    const payload = {
      name,
      phone,
      email,
      delivery_location: location,
      customer_note: note,
      items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
    };

    const result = await store.createOrderAtomic(payload);

    if (result.success && result.order_id) {
      // Clear cart
      setCart([]);
      sessionStorage.removeItem('collegesamosa_cart');

      // Fetch created order to display confirmation modal
      const newOrder = store.getOrderById(result.order_id);
      if (newOrder) {
        setConfirmedOrder(newOrder);
      }
    }

    return result;
  };

  // Order Status update handler
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) => {
    await store.updateOrderStatus(orderId, newStatus, note);
  };

  // Cash payment handler
  const handleMarkAsPaid = async (orderId: string) => {
    await store.recordCashPayment(orderId);
  };

  // Tracking search
  const handleSearchTrackingToken = (token: string): Order | undefined => {
    return store.getOrderByTrackingToken(token);
  };

  // Seller navigation
  const handleSellerNavigate = (tab: SellerTab, filter?: string) => {
    setSellerTab(tab);
    setSellerOrderFilter(filter);
  };

  const handleSellerLogout = () => {
    sessionStorage.removeItem('collegesamosa_seller_auth');
    setIsSellerAuth(false);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'seller' && isSellerAuth) {
            setSellerTab('dashboard');
          }
        }}
        cart={cart}
        isSellerAuthenticated={isSellerAuth}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenStreamlitModal={() => setIsStreamlitModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* VIEW 1: Customer Home */}
        {currentView === 'home' && (
          <CustomerHome
            onBrowseMenu={() => setCurrentView('menu')}
            onTrackOrder={() => setCurrentView('tracking')}
            products={availableProducts}
            getStock={getStock}
          />
        )}

        {/* VIEW 2: Menu Page */}
        {currentView === 'menu' && (
          <MenuView
            products={availableProducts}
            getStock={getStock}
            onAddToCart={handleAddToCart}
            onGoToCart={() => setCurrentView('cart')}
            cartItemCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
          />
        )}

        {/* VIEW 3: Cart Page */}
        {currentView === 'cart' && (
          <CartView
            cart={cart}
            getStock={getStock}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onProceedToCheckout={() => setCurrentView('checkout')}
            onContinueShopping={() => setCurrentView('menu')}
          />
        )}

        {/* VIEW 4: Checkout Page */}
        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            onBackToCart={() => setCurrentView('cart')}
            onSubmitOrder={handleCheckoutSubmit}
          />
        )}

        {/* VIEW 5: Order Tracking Page */}
        {currentView === 'tracking' && (
          <TrackingView
            initialToken={activeTrackingToken}
            onSearchToken={handleSearchTrackingToken}
          />
        )}

        {/* VIEW 6: Seller Administration Portal */}
        {currentView === 'seller' && (
          <div>
            {!isSellerAuth ? (
              <SellerLogin
                onLoginSuccess={() => {
                  setIsSellerAuth(true);
                  setSellerTab('dashboard');
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Seller Sub-Navbar */}
                <div className="bg-stone-900 text-stone-200 rounded-2xl p-2 sm:p-3 flex flex-wrap items-center justify-between gap-2 shadow-md">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: Layers },
                      { id: 'orders', label: 'Orders', icon: Layers },
                      { id: 'inventory', label: 'Inventory & Stock', icon: Package },
                      { id: 'products', label: 'Products', icon: FileText },
                      { id: 'sales', label: 'Sales Reports', icon: TrendingUp },
                      { id: 'emails', label: 'Email Logs', icon: Mail },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setSellerTab(tab.id as SellerTab);
                            setSellerOrderFilter(undefined);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            sellerTab === tab.id
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'text-stone-300 hover:text-white hover:bg-stone-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSellerLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>

                {/* Seller Active Tab View */}
                {sellerTab === 'dashboard' && (
                  <SellerDashboard
                    orders={orders}
                    products={products}
                    inventory={inventory}
                    onNavigateTab={handleSellerNavigate}
                  />
                )}

                {sellerTab === 'orders' && (
                  <SellerOrders
                    orders={orders}
                    initialFilter={sellerOrderFilter}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onMarkAsPaid={handleMarkAsPaid}
                  />
                )}

                {sellerTab === 'inventory' && (
                  <SellerInventory
                    products={products}
                    inventory={inventory}
                    transactions={transactions}
                    onRestock={(prodId, qty, ref) => store.restockProduct(prodId, qty, ref)}
                    onAdjustStock={(prodId, count, reason) =>
                      store.adjustProductStock(prodId, count, reason)
                    }
                  />
                )}

                {sellerTab === 'products' && (
                  <SellerProducts
                    products={products}
                    onCreateProduct={(name, desc, price, packs, img, stock) =>
                      store.createProduct(name, desc, price, packs, img, stock)
                    }
                    onUpdateProduct={(prodId, updates) => store.updateProduct(prodId, updates)}
                  />
                )}

                {sellerTab === 'sales' && (
                  <SellerSales
                    getSalesReport={(period, start, end) =>
                      store.getSalesReport(period, start, end)
                    }
                    orders={orders}
                  />
                )}

                {sellerTab === 'emails' && <SellerEmailLogs />}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onTrackOrder={(token) => {
            setActiveTrackingToken(token);
            setCurrentView('tracking');
          }}
          onClose={() => setConfirmedOrder(null)}
        />
      )}

      {/* Supabase Schema & Config Modal */}
      {isSupabaseModalOpen && (
        <SupabaseInfoModal onClose={() => setIsSupabaseModalOpen(false)} />
      )}

      {/* Streamlit Python App Modal */}
      {isStreamlitModalOpen && (
        <StreamlitModal onClose={() => setIsStreamlitModalOpen(false)} />
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 mt-12 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-stone-200 text-sm">
              College Samosa Ordering & Sales Management
            </p>
            <p className="text-stone-400">
              Campus fast delivery • 2 Samosas per pack • Pay cash on delivery
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsStreamlitModalOpen(true)}
              className="text-red-400 hover:underline flex items-center gap-1"
            >
              <span>⚡</span>
              <span>Streamlit App (app.py)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-amber-400 hover:underline"
            >
              PostgreSQL Schema
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentView('seller');
                if (isSellerAuth) setSellerTab('dashboard');
              }}
              className="hover:text-stone-200"
            >
              Seller Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
