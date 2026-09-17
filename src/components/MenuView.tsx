import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { formatUGX } from '../utils/formatting';

interface MenuViewProps {
  products: Product[];
  getStock: (productId: string) => number;
  onAddToCart: (product: Product, quantity: number) => void;
  onGoToCart: () => void;
  cartItemCount: number;
}

export const MenuView: React.FC<MenuViewProps> = ({
  products,
  getStock,
  onAddToCart,
  onGoToCart,
  cartItemCount,
}) => {
  // Selected quantity state per product
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const getSelectedQuantity = (productId: string): number => {
    return quantities[productId] || 1;
  };

  const handleIncrement = (productId: string, maxStock: number) => {
    const current = getSelectedQuantity(productId);
    if (current < maxStock) {
      setQuantities((prev) => ({ ...prev, [productId]: current + 1 }));
    }
  };

  const handleDecrement = (productId: string) => {
    const current = getSelectedQuantity(productId);
    if (current > 1) {
      setQuantities((prev) => ({ ...prev, [productId]: current - 1 }));
    }
  };

  const handleAdd = (product: Product, stock: number) => {
    const qty = getSelectedQuantity(product.id);
    if (qty > 0 && qty <= stock) {
      onAddToCart(product, qty);
      setAddedNotice(`Added ${qty} × ${product.name} to cart!`);
      setTimeout(() => setAddedNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Our Samosa Menu
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Sold strictly in packs of 2 samosas. Live inventory updated continuously.
          </p>
        </div>

        {cartItemCount > 0 && (
          <button
            onClick={onGoToCart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            View Cart ({cartItemCount} items)
          </button>
        )}
      </div>

      {/* Added notice toast */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-amber-400 px-4 py-3 rounded-xl shadow-xl border border-amber-500/30 flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{addedNotice}</span>
          <button
            onClick={onGoToCart}
            className="ml-2 text-xs font-bold text-stone-950 bg-amber-400 px-2 py-1 rounded hover:bg-amber-300"
          >
            Checkout
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => {
          const stock = getStock(product.id);
          const isOutOfStock = stock <= 0 || !product.is_available;
          const isLowStock = stock > 0 && stock <= 5;
          const selectedQty = getSelectedQuantity(product.id);

          return (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                isOutOfStock ? 'border-stone-200 opacity-75' : 'border-stone-200'
              }`}
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-48 sm:h-52 bg-stone-100 overflow-hidden">
                  <img
                    src={
                      product.image_url ||
                      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-stone-900/85 backdrop-blur-xs text-stone-100 text-xs font-bold tracking-wide">
                      {product.packs_per_unit} Samosas / Pack
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-bold shadow-xs">
                        OUT OF STOCK
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-xs font-bold shadow-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Only {stock} left!
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-xs font-semibold shadow-xs">
                        Available: {stock} packs
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      {product.name}
                    </h2>
                    <span className="text-lg font-extrabold text-amber-700 whitespace-nowrap">
                      {formatUGX(product.price)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed min-h-[2.5rem]">
                    {product.description || 'Freshly made golden samosas prepared daily on campus.'}
                  </p>

                  <div className="pt-2 text-xs text-stone-500 flex items-center gap-4">
                    <span>
                      Packaging:{' '}
                      <strong className="text-stone-700">
                        {product.packs_per_unit} pcs per pack
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total samosas in stock:{' '}
                      <strong className="text-stone-700">{stock * product.packs_per_unit}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-0 border-t border-stone-100 mt-2">
                {isOutOfStock ? (
                  <div className="py-2.5 px-4 bg-stone-100 rounded-xl text-center text-xs font-semibold text-stone-500">
                    Currently sold out. Check back soon for fresh batches!
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50 shrink-0">
                      <button
                        id={`btn-dec-${product.id}`}
                        onClick={() => handleDecrement(product.id)}
                        disabled={selectedQty <= 1}
                        className="p-2.5 text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-bold text-stone-900">
                        {selectedQty}
                      </span>
                      <button
                        id={`btn-inc-${product.id}`}
                        onClick={() => handleIncrement(product.id, stock)}
                        disabled={selectedQty >= stock}
                        className="p-2.5 text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      id={`btn-add-${product.id}`}
                      onClick={() => handleAdd(product, stock)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add {selectedQty} {selectedQty === 1 ? 'Pack' : 'Packs'} (
                      {formatUGX(product.price * selectedQty)})
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
