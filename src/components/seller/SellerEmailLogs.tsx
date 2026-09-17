import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { getEmailLogs, EmailLog } from '../../services/email';
import { formatDateTime } from '../../utils/formatting';

export const SellerEmailLogs: React.FC = () => {
  const logs = getEmailLogs();

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Transactional Email Logs
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Audit history of order confirmations, kitchen updates, and payment receipts dispatched.
          </p>
        </div>
        <div className="text-xs font-semibold text-stone-600">
          {logs.length} Total Emails Dispatched
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
        <strong className="block font-bold">Email Resiliency Guarantee:</strong>
        <p>
          Per business requirements, transactional email failures will never abort or roll back a
          customer's order. If an external email provider is temporarily unreachable, the order
          remains safely booked in PostgreSQL and the failure is logged below for audit.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-12 text-center space-y-2">
          <Mail className="w-8 h-8 text-stone-400 mx-auto" />
          <h2 className="text-sm font-bold text-stone-900">No Emails Logged Yet</h2>
          <p className="text-xs text-stone-500">
            Place an order or update an order status to see real-time email triggers appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden text-xs">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 space-y-2 hover:bg-stone-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SENT'
                        ? 'bg-emerald-100 text-emerald-900'
                        : log.status === 'SIMULATED'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {log.status === 'SIMULATED' ? 'DISPATCHED (SIMULATED)' : log.status}
                  </span>
                  <span className="font-bold text-stone-900 text-sm">{log.subject}</span>
                </div>
                <span className="text-stone-400 text-[11px] font-mono">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>

              <div className="text-stone-600 text-[11px] flex items-center gap-2">
                <Send className="w-3 h-3 text-stone-400" />
                <span>
                  Recipient: <strong className="text-stone-800">{log.recipient}</strong>
                </span>
                <span>•</span>
                <span>
                  Order ID: <strong className="font-mono text-stone-800">{log.orderId.substring(0, 12)}</strong>
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl font-mono text-[11px] text-stone-700 whitespace-pre-line border border-stone-100">
                {log.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
