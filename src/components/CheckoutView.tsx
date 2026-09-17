import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { CartItem, CheckoutResult } from '../types';
import { formatUGX } from '../utils/formatting';
import { validateCustomerDetails } from '../utils/validation';

interface CheckoutViewProps {
  cart: CartItem[];
  onBackToCart: () => void;
  onSubmitOrder: (
    name: string,
    phone: string,
    email: string,
    location: string,
    note?: string
  ) => Promise<CheckoutResult>;
}

// College delivery location presets for quick 1-tap selection
const COLLEGE_LOCATION_PRESETS = [
  'CEDAT Block B - Room 204',
  'CEDAT New Building - Lab 1',
  'Main Library - Ground Floor Quiet Wing',
  'Main Library - 1st Floor Reference',
  'Nkrumah Lecture Theatre',
  'Lumumba Hall - Common Room',
  'Complex Hall - Block C',
  'Mary Stuart Hall - Front Gate',
  'Africa Hall - Room A12',
  'School of Economics - LT1',
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  onBackToCart,
  onSubmitOrder,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handlePresetSelect = (preset: string) => {
    setLocation(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // double-click protection

    setErrorMessage(null);

    // Client-side validation
    const validation = validateCustomerDetails(name, phone, email, location);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please check your information.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add samosas before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmitOrder(name, phone, email, location, note);
      if (!result.success) {
        setErrorMessage(
          result.error || 'Unable to complete checkout. Please verify item quantities.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'A network error occurred while processing your order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <button
        onClick={onBackToCart}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Cart
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Delivery & Contact Details
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          No account or sign up needed. We deliver directly to your campus spot.
        </p>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Order Validation Error</strong>
            <p className="text-xs sm:text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Fields Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Personal Information Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="checkout-name-input"
                  type="text"
                  required
                  placeholder="e.g. John Mukasa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Phone Number <span className="text-rose-600">*</span>
                </label>
                <input
                  id="checkout-phone-input"
                  type="tel"
                  required
                  placeholder="e.g. 0772 123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
                <span className="text-[11px] text-stone-500">
                  The delivery runner will call when arriving.
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  id="checkout-email-input"
                  type="email"
                  required
                  placeholder="e.g. jmukasa@college.ac.ug"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
                <span className="text-[11px] text-stone-500">
                  For your order confirmation & tracking link.
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Location Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Campus Delivery Location
            </h2>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                Lecture Room / Building / Hostel <span className="text-rose-600">*</span>
              </label>

              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="checkout-location-input"
                  type="text"
                  required
                  placeholder="e.g. Nkrumah Lecture Theatre or CEDAT Room 204"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Preset quick chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Quick Campus Locations (Click to fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COLLEGE_LOCATION_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        location === preset
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional customer note */}
              <div className="pt-2 space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Delivery Note (Optional)
                </label>
                <textarea
                  id="checkout-note-input"
                  rows={2}
                  placeholder="e.g. I am wearing a blue jacket sitting at the back row."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Notice Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              Payment Method: Pay on Delivery (Cash)
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              You do <strong>not</strong> need mobile money or a card online. Simply pay{' '}
              <strong>{formatUGX(totalAmount)}</strong> in physical cash to the seller runner when
              they hand over your samosa packs.
            </p>
          </div>
        </div>

        {/* Order Summary & Place Order Button Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 sticky top-20">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            {/* Items review */}
            <div className="divide-y divide-stone-100 text-xs max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex justify-between gap-2">
                  <div>
                    <span className="font-semibold text-stone-900 block">
                      {item.product.name}
                    </span>
                    <span className="text-stone-500">
                      {item.quantity} {item.quantity === 1 ? 'pack' : 'packs'} ×{' '}
                      {formatUGX(item.product.price)}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">
                    {formatUGX(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatUGX(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Campus Delivery</span>
                <span className="text-emerald-700 font-medium">FREE</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
                <span className="text-sm font-bold">Total Amount Due</span>
                <span className="text-xl font-extrabold text-amber-700">
                  {formatUGX(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-place-order"
              type="submit"
              disabled={isSubmitting || totalAmount <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-stone-950 shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-amber-300 cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-400 hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving Samosas...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order ({formatUGX(totalAmount)})</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-stone-500 text-center leading-tight">
              By placing this order, you confirm you will physically pay cash upon delivery.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
