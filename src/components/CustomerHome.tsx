import React from 'react';
import { ArrowRight, Clock, MapPin, Banknote, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { formatUGX } from '../utils/formatting';

interface CustomerHomeProps {
  onBrowseMenu: () => void;
  onTrackOrder: () => void;
  products: Product[];
  getStock: (productId: string) => number;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onBrowseMenu,
  onTrackOrder,
  products,
  getStock,
}) => {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-stone-100 p-6 sm:p-10 border border-stone-800 shadow-xl">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Freshly Fried & Delivered Hot
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fresh Samosas Delivered to Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              Lecture Room
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
            Crispy, spiced golden pastry triangles packed in 2-pack servings. Order right from your seat, class, or hostel with no account needed.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="hero-order-btn"
              onClick={onBrowseMenu}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              Browse Today's Menu
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-track-btn"
              onClick={onTrackOrder}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 font-medium text-sm border border-stone-700 transition-colors"
            >
              Track Existing Order
            </button>
          </div>
        </div>

        {/* Decorative Badge Overlay */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-stone-100 block">Pay on Delivery</strong>
              Pay cash when received physically
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-stone-100 block">Campus Locations</strong>
              Direct to CEDAT, Library, Halls & Classes
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-stone-100 block">Fast Runner Service</strong>
              Hot samosas prepped and delivered fast
            </span>
          </div>
        </div>
      </section>

      {/* Featured Packs Quick View */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Today's Available Samosa Packs</h2>
            <p className="text-xs text-stone-600">Freshly prepared in packs of 2 samosas each</p>
          </div>
          <button
            onClick={onBrowseMenu}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
          >
            View Full Menu <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {products.map((product) => {
            const stock = getStock(product.id);
            const isOutOfStock = stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-40 h-36 sm:h-auto shrink-0 relative overflow-hidden bg-stone-100">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {product.packs_per_unit} Samosas / Pack
                    </div>
                  </div>

                  <div className="p-4 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {product.name}
                      </h3>
                      <span className="text-sm font-extrabold text-amber-700 whitespace-nowrap">
                        {formatUGX(product.price)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      {isOutOfStock ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Available: {stock} packs
                        </span>
                      )}

                      <button
                        onClick={onBrowseMenu}
                        disabled={isOutOfStock}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isOutOfStock
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                        }`}
                      >
                        Order Pack
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How Ordering Works */}
      <section className="bg-stone-50 rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-stone-900">How It Works</h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Enjoying fresh samosas on campus takes less than 60 seconds
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              1
            </div>
            <h3 className="text-sm font-bold text-stone-900">Select Packs</h3>
            <p className="text-xs text-stone-600">
              Choose Rice or Cowpeas Samosa packs and quantity.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              2
            </div>
            <h3 className="text-sm font-bold text-stone-900">Provide Room</h3>
            <p className="text-xs text-stone-600">
              Enter your lecture room, hall, or library floor with your phone number.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              3
            </div>
            <h3 className="text-sm font-bold text-stone-900">Track Progress</h3>
            <p className="text-xs text-stone-600">
              Use your private tracking link to watch preparation and delivery in real-time.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              4
            </div>
            <h3 className="text-sm font-bold text-stone-900">Pay on Delivery</h3>
            <p className="text-xs text-stone-600">
              Receive your warm samosas physically and hand cash to the runner.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onBrowseMenu}
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-5 py-2.5 rounded-xl transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            No account or password required. Start your order now!
          </button>
        </div>
      </section>
    </div>
  );
};
