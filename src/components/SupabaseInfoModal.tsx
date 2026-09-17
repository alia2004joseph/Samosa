import React, { useState } from 'react';
import { Database, Copy, Check, X, ShieldCheck, Server, FileCode, CheckCircle2 } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../services/supabase';

interface SupabaseInfoModalProps {
  onClose: () => void;
}

export const SupabaseInfoModal: React.FC<SupabaseInfoModalProps> = ({ onClose }) => {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopySql = () => {
    const sqlScript = `-- 1. customers, 2. products, 3. inventory, 4. orders, 5. order_items, 6. order_status_history, 7. inventory_transactions
-- Full migration located in supabase/migrations/01_initial_schema.sql
-- Check supabase/migrations/01_initial_schema.sql in the project tree!`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                PostgreSQL & Supabase Architecture
              </h2>
              <span className="text-xs text-stone-500">
                7 Core Relational Tables • Atomic Inventory Transactions • Row-Level Security
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Schema Overview */}
        <div className="space-y-3 text-xs text-stone-700">
          <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
            Active Relational Tables
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 font-mono">1. customers</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                id, name, phone, email, created_at. No registration required.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 font-mono">2. products</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                id, name, price (integer UGX), packs_per_unit (2), is_available.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 font-mono">3. inventory</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                product_id (1-to-1), quantity_available (packs), CHECK &gt;= 0.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 font-mono">4. orders</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                status, payment_status (UNPAID/PAID), CASH, tracking_token (UUID).
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 font-mono">5. order_items</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                order_id, product_id, quantity, unit_price snapshot, subtotal.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 font-mono">6. order_status_history</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                order_id, old_status, new_status, note, changed_at audit trail.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 sm:col-span-2">
              <div className="font-bold text-stone-900 font-mono">7. inventory_transactions</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                product_id, quantity_change (+/-), INITIAL_STOCK / RESTOCK / ORDER / ORDER_CANCELLED / MANUAL_ADJUSTMENT.
              </p>
            </div>
          </div>
        </div>

        {/* Supabase Connection Form */}
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm">Supabase Project Connection</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                config.isConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {config.isConfigured ? 'Supabase Configured' : 'In-App Storage Mode'}
            </span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Supabase settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Supabase Project URL</label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Supabase Public Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
            >
              Save & Connect Supabase
            </button>
          </form>
        </div>

        {/* SQL Migration Reference */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900">PostgreSQL Migration File</span>
            <span className="text-stone-500 text-[11px] font-mono">
              /supabase/migrations/01_initial_schema.sql
            </span>
          </div>
          <p className="text-stone-600">
            The full migration contains table definitions, atomic row locking functions (
            <code className="text-amber-800">create_order_atomic</code>,{' '}
            <code className="text-amber-800">update_order_status_atomic</code>), and RLS policies.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
