import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, AlertTriangle, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { formatUGX } from '../utils/formatting';

interface CartViewProps {
  cart: CartItem[];
  getStock: (productId: string) => number;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  getStock,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Check if any cart item exceeds live stock
  const stockDiscrepancies = cart
    .map((item) => {
      const stock = getStock(item.product.id);
      return {
        product: item.product,
        requested: item.quantity,
        available: stock,
        hasError: item.quantity > stock,
      };
    })
    .filter((d) => d.hasError);

  const hasStockErrors = stockDiscrepancies.length > 0;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-600">
          You haven't added any samosa packs yet. Browse our freshly prepared menu to get started!
        </p>
        <button
          id="btn-cart-empty-browse"
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all"
        >
          Browse Menu
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Your Order Cart</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Review your packs before proceeding to delivery checkout.
          </p>
        </div>
        <button
          onClick={onClearCart}
          className="text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Stock warning banner if stock changed */}
      {hasStockErrors && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            Stock changed while your cart was open!
          </div>
          <p className="text-xs text-rose-800">
            Another customer just ordered samosas. Please adjust your quantities below to match available stock:
          </p>
          <ul className="list-disc list-inside text-xs space-y-1 font-medium text-rose-900">
            {stockDiscrepancies.map((d) => (
              <li key={d.product.id}>
                <strong>{d.product.name}</strong>: You requested {d.requested} packs, but only{' '}
                <span className="underline">{d.available} packs</span> are currently remaining.
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cart Items List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
        {cart.map((item) => {
          const liveStock = getStock(item.product.id);
          const isOverStock = item.quantity > liveStock;
          const lineSubtotal = item.product.price * item.quantity;

          return (
            <div
              key={item.product.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                isOverStock ? 'bg-rose-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <img
                  src={
                    item.product.image_url ||
                    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                />

                <div className="min-w-0 space-y-1">
                  <h2 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                    {item.product.name}
                  </h2>
                  <div className="text-xs text-stone-500">
                    {item.product.packs_per_unit} samosas / pack •{' '}
                    <span className="font-semibold text-stone-700">
                      {formatUGX(item.product.price)}
                    </span>{' '}
                    each
                  </div>

                  {isOverStock ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      Only {liveStock} remaining in kitchen!
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-500">
                      Kitchen stock: {liveStock} packs available
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-5 shrink-0">
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 text-stone-700 hover:bg-stone-200 transition-colors"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs sm:text-sm font-bold text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= liveStock}
                    className="p-2 text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[5.5rem]">
                  <span className="text-xs text-stone-400 block sm:hidden">Subtotal:</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900">
                    {formatUGX(lineSubtotal)}
                  </span>
                </div>

                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary Card */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4">
        <div className="space-y-2 text-xs sm:text-sm text-stone-600">
          <div className="flex justify-between">
            <span>Packs Subtotal</span>
            <span className="font-semibold text-stone-900">{formatUGX(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Lecture Room Delivery Fee</span>
            <span className="font-semibold text-emerald-700">FREE on Campus</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="font-semibold text-amber-800">Pay Cash on Delivery</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-base sm:text-lg font-extrabold text-stone-900">
            <span>Order Total</span>
            <span className="text-xl sm:text-2xl text-amber-700">{formatUGX(totalAmount)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Add More Samosas
          </button>

          <button
            id="btn-cart-checkout"
            onClick={onProceedToCheckout}
            disabled={hasStockErrors || totalAmount <= 0}
            className={`flex-1 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
              hasStockErrors || totalAmount <= 0
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 hover:scale-[1.01]'
            }`}
          >
            <span>Proceed to Delivery Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-stone-500 text-center">
          Note: Stock is officially reserved upon clicking "Place Order" on the next screen.
        </p>
      </div>
    </div>
  );
};
