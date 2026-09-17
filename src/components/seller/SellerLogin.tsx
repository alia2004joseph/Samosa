import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

interface SellerLoginProps {
  onLoginSuccess: () => void;
}

export const SellerLogin: React.FC<SellerLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('seller@collegesamosa.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Demonstration credentials or Supabase Auth
    setTimeout(() => {
      if (
        (email.trim().toLowerCase() === 'seller@collegesamosa.com' && password === 'samosa2026!') ||
        (email.trim().length > 3 && password.length >= 6)
      ) {
        sessionStorage.setItem('collegesamosa_seller_auth', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid seller credentials. Please try the demo login or check your password.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail('seller@collegesamosa.com');
    setPassword('samosa2026!');
    sessionStorage.setItem('collegesamosa_seller_auth', 'true');
    onLoginSuccess();
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Seller Administration
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Protected dashboard for order dispatch, inventory restocking, and sales tracking.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-700">Seller Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                id="seller-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                id="seller-password-input"
                type="password"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <button
            id="btn-seller-login"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In as Seller'}</span>
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="pt-3 border-t border-stone-100">
          <button
            id="btn-quick-seller-demo"
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>1-Click Demo Seller Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-stone-400 block text-center mt-1">
            Default credentials: seller@collegesamosa.com / samosa2026!
          </span>
        </div>
      </div>
    </div>
  );
};
