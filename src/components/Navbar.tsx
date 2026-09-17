import React from 'react';
import { ShoppingBag, Search, ShieldCheck, UtensilsCrossed, Database } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  currentView: 'home' | 'menu' | 'cart' | 'checkout' | 'tracking' | 'seller';
  onNavigate: (view: 'home' | 'menu' | 'cart' | 'checkout' | 'tracking' | 'seller') => void;
  cart: CartItem[];
  isSellerAuthenticated: boolean;
  onOpenSupabaseModal: () => void;
  onOpenStreamlitModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cart,
  isSellerAuthenticated,
  onOpenSupabaseModal,
  onOpenStreamlitModal,
}) => {
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          id="nav-brand-btn"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/30 transition-colors">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-amber-400 block leading-tight">
              College Samosa
            </span>
            <span className="text-[11px] text-stone-400 tracking-wide block">
              Campus Delivery Service
            </span>
          </div>
        </button>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Menu Button */}
          <button
            id="nav-menu-btn"
            onClick={() => onNavigate('menu')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'menu'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            Menu
          </button>

          {/* Track Order Button */}
          <button
            id="nav-track-btn"
            onClick={() => onNavigate('tracking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'tracking'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Track</span> Order
          </button>

          {/* Cart Icon Button */}
          <button
            id="nav-cart-btn"
            onClick={() => onNavigate('cart')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'cart' || currentView === 'checkout'
                ? 'bg-amber-500 text-stone-950 font-semibold'
                : 'bg-stone-800 text-amber-300 hover:bg-stone-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalCartCount > 0 && (
              <span className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 min-w-4">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Supabase Schema Modal Trigger */}
          <button
            id="nav-db-btn"
            onClick={onOpenSupabaseModal}
            title="Database Schema & Supabase Configuration"
            className="p-2 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Streamlit Python Modal Trigger */}
          {onOpenStreamlitModal && (
            <button
              id="nav-streamlit-btn"
              onClick={onOpenStreamlitModal}
              title="Streamlit (Python) App - app.py"
              className="px-2 py-1 rounded-lg text-xs font-bold text-red-400 hover:bg-stone-800 transition-colors flex items-center gap-1 border border-red-500/30"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Streamlit</span>
            </button>
          )}

          {/* Seller Portal Button */}
          <button
            id="nav-seller-btn"
            onClick={() => onNavigate('seller')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'seller'
                ? 'bg-stone-700 text-amber-300 border border-stone-600'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {isSellerAuthenticated ? 'Seller Dashboard' : 'Seller Login'}
            </span>
            <span className="md:hidden">Seller</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
