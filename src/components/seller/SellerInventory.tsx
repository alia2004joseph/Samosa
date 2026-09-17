import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  SlidersHorizontal,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Product, Inventory, InventoryTransaction } from '../../types';
import { formatDateTime } from '../../utils/formatting';

interface SellerInventoryProps {
  products: Product[];
  inventory: (Inventory & { product?: Product })[];
  transactions: InventoryTransaction[];
  onRestock: (productId: string, quantity: number, reference?: string) => { success: boolean; error?: string };
  onAdjustStock: (productId: string, newQuantity: number, reason?: string) => { success: boolean; error?: string };
}

export const SellerInventory: React.FC<SellerInventoryProps> = ({
  products,
  inventory,
  transactions,
  onRestock,
  onAdjustStock,
}) => {
  // Modal states
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const [restockQty, setRestockQty] = useState<number>(20);
  const [restockRef, setRestockRef] = useState<string>('Morning Batch Restock');

  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Kitchen count reconciliation');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    const res = onRestock(restockProduct.id, restockQty, restockRef);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Successfully restocked ${restockQty} packs of ${restockProduct.name}!`,
      });
      setRestockProduct(null);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to restock.' });
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;

    const res = onAdjustStock(adjustProduct.id, adjustQty, adjustReason);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Adjusted stock for ${adjustProduct.name} to ${adjustQty} packs.`,
      });
      setAdjustProduct(null);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to adjust stock.' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Inventory & Kitchen Stock
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Stock is measured and tracked strictly in packs of 2 samosas. All movements are logged.
          </p>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2 font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {products.map((product) => {
          const inv = inventory.find((i) => i.product_id === product.id);
          const stock = inv ? inv.quantity_available : 0;
          const isOutOfStock = stock <= 0;
          const isLowStock = stock > 0 && stock <= 5;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">{product.name}</h2>
                    <span className="text-xs text-stone-500">
                      {product.packs_per_unit} samosas per pack • Total individual samosas:{' '}
                      <strong className="text-stone-800">{stock * product.packs_per_unit}</strong>
                    </span>
                  </div>

                  <div>
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 rounded-md bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs">
                        OUT OF STOCK
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs">
                        IN STOCK
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-stone-400 block">Available Packs:</span>
                    <span className="text-3xl font-extrabold text-stone-900">
                      {stock}{' '}
                      <span className="text-sm font-normal text-stone-500">packs</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Updated {formatDateTime(inv?.updated_at)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => {
                    setRestockProduct(product);
                    setRestockQty(20);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-xs transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Stock (Restock)
                </button>

                <button
                  onClick={() => {
                    setAdjustProduct(product);
                    setAdjustQty(stock);
                  }}
                  className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Make manual count adjustment"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                  Adjust Count
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory Transactions Audit Trail */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Auditable Inventory Movement History
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            {transactions.length} total logged transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Transaction Type</th>
                <th className="py-2.5 px-3">Quantity Change</th>
                <th className="py-2.5 px-3">Reference / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {transactions.slice(0, 15).map((tx) => {
                const isPositive = tx.quantity_change > 0;

                return (
                  <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-stone-500 font-mono text-[11px]">
                      {formatDateTime(tx.created_at)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">
                      {tx.product?.name || 'Samosa'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.transaction_type === 'RESTOCK'
                            ? 'bg-emerald-100 text-emerald-900'
                            : tx.transaction_type === 'INITIAL_STOCK'
                            ? 'bg-blue-100 text-blue-900'
                            : tx.transaction_type === 'ORDER'
                            ? 'bg-amber-100 text-amber-900'
                            : tx.transaction_type === 'ORDER_CANCELLED'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold">
                      <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                        {isPositive ? `+${tx.quantity_change}` : tx.quantity_change} packs
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 truncate max-w-xs">
                      {tx.reference || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                Restock {restockProduct.name}
              </h3>
              <button
                onClick={() => setRestockProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Packs to Add to Kitchen Inventory
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold"
                />
                <span className="text-[11px] text-stone-500">
                  {restockQty * restockProduct.packs_per_unit} individual samosas will be added.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Restock Reference / Note
                </label>
                <input
                  type="text"
                  required
                  value={restockRef}
                  onChange={(e) => setRestockRef(e.target.value)}
                  placeholder="e.g. Afternoon fresh batch from kitchen"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Confirm Restock (+{restockQty} packs)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                Adjust Stock for {adjustProduct.name}
              </h3>
              <button
                onClick={() => setAdjustProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  New Exact Available Count (Packs)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Correction Reason
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. End of day physical audit"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Apply Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
