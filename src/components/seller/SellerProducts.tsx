import React, { useState } from 'react';
import { Plus, Edit2, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { formatUGX } from '../../utils/formatting';

interface SellerProductsProps {
  products: Product[];
  onCreateProduct: (
    name: string,
    description: string,
    price: number,
    packsPerUnit: number,
    imageUrl?: string,
    initialStock?: number
  ) => { success: boolean; error?: string };
  onUpdateProduct: (
    productId: string,
    updates: Partial<Pick<Product, 'name' | 'description' | 'price' | 'image_url' | 'is_available' | 'packs_per_unit'>>
  ) => { success: boolean; error?: string };
}

export const SellerProducts: React.FC<SellerProductsProps> = ({
  products,
  onCreateProduct,
  onUpdateProduct,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1000);
  const [packsPerUnit, setPacksPerUnit] = useState<number>(2);
  const [imageUrl, setImageUrl] = useState('');
  const [initialStock, setInitialStock] = useState<number>(20);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onCreateProduct(
      name,
      description,
      price,
      packsPerUnit,
      imageUrl || undefined,
      initialStock
    );

    if (res.success) {
      setFeedback({ type: 'success', message: `Product "${name}" created successfully!` });
      setIsAddModalOpen(false);
      setName('');
      setDescription('');
      setPrice(1000);
      setImageUrl('');
      setInitialStock(20);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to create product.' });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const res = onUpdateProduct(editingProduct.id, {
      name: editingProduct.name,
      description: editingProduct.description,
      price: editingProduct.price,
      packs_per_unit: editingProduct.packs_per_unit,
      image_url: editingProduct.image_url,
      is_available: editingProduct.is_available,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Product updated successfully!' });
      setEditingProduct(null);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update product.' });
    }
  };

  const handleToggleAvailability = (product: Product) => {
    const res = onUpdateProduct(product.id, { is_available: !product.is_available });
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Product ${product.is_available ? 'disabled' : 'enabled'} for orders.`,
      });
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Add new samosa varieties, update prices, or toggle menu availability.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Feedback message */}
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
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Products Table / Cards */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden divide-y divide-stone-100">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  product.image_url ||
                  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
                }
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900">{product.name}</h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      product.is_available
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-stone-100 border-stone-300 text-stone-600'
                    }`}
                  >
                    {product.is_available ? 'Available' : 'Disabled (Hidden)'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-1 max-w-md">
                  {product.description || 'No description entered.'}
                </p>
                <div className="text-xs text-stone-700 font-semibold">
                  Price: <span className="text-amber-800">{formatUGX(product.price)}</span> • Pack
                  size: {product.packs_per_unit} samosas
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleToggleAvailability(product)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  product.is_available
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                }`}
              >
                {product.is_available ? 'Disable on Menu' : 'Enable on Menu'}
              </button>

              <button
                onClick={() => setEditingProduct({ ...product })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Add New Samosa Product</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beef Samosa Pack"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Minced beef with fresh spices and herbs."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Price (UGX) *</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">
                    Samosas per Pack *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={packsPerUnit}
                    onChange={(e) => setPacksPerUnit(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Initial Kitchen Stock (Packs)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={initialStock}
                  onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Create Samosa Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Edit {editingProduct.name}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Price (UGX) *</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">
                    Samosas per Pack *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.packs_per_unit}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        packs_per_unit: parseInt(e.target.value) || 2,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Image URL</label>
                <input
                  type="url"
                  value={editingProduct.image_url || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, image_url: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-is-available"
                  checked={editingProduct.is_available}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, is_available: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="edit-is-available" className="font-semibold text-stone-800">
                  Available for Customer Orders
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
