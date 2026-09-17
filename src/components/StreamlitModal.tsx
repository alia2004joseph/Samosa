import React, { useState } from 'react';
import { Terminal, Copy, Check, X, FileCode, CheckCircle2, Sparkles } from 'lucide-react';

interface StreamlitModalProps {
  onClose: () => void;
}

export const StreamlitModal: React.FC<StreamlitModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('pip install -r requirements.txt\nstreamlit run app.py');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-stone-900">
                  Streamlit (Python) Application
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  app.py Included
                </span>
              </div>
              <span className="text-xs text-stone-500">
                Full standalone Python Streamlit app implementing all college samosa features
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview banner */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Dual Deployment: Modern Web UI + Python Streamlit App</span>
          </div>
          <p>
            The live interactive preview you are viewing right now is running the high-performance
            React + TypeScript + Tailwind web application (required by Google AI Studio's Node.js
            container environment).
          </p>
          <p>
            Additionally, a complete, self-contained <strong>Streamlit app (<code>app.py</code>)</strong> and{' '}
            <strong><code>requirements.txt</code></strong> have been generated at the root of your project!
          </p>
        </div>

        {/* Features in app.py */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
            What's Built Inside <code>app.py</code>:
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
            <li className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Mobile-first guest checkout (UGX, packs of 2)</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Atomic pack inventory decrement & locks</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Guest order tracking with UUID token & progress</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Seller dispatch dashboard (Kitchen, Delivery)</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Cash on delivery payment toggling (UNPAID/PAID)</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Restock form & transaction audit table</span>
            </li>
          </ul>
        </div>

        {/* How to run instructions */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
            How to Run the Streamlit App Locally or on Streamlit Cloud:
          </h3>
          <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone-400"># Terminal commands</span>
              <button
                onClick={handleCopyCommand}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-amber-400">pip install -r requirements.txt</p>
            <p className="text-emerald-400">streamlit run app.py</p>
          </div>
        </div>

        {/* Files Included */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
          <div className="font-semibold text-stone-800">Files available in your repository:</div>
          <div className="font-mono text-[11px] text-stone-700">
            • <span className="text-amber-800">/app.py</span> — Complete Streamlit application<br />
            • <span className="text-amber-800">/requirements.txt</span> — Dependencies (<code>streamlit</code>, <code>supabase</code>)<br />
            • <span className="text-amber-800">/supabase/migrations/01_initial_schema.sql</span> — 7-table PostgreSQL schema
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 font-bold text-xs"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
