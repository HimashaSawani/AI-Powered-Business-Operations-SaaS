import React from 'react';
import { X, CheckCircle2, ArrowDown, Database, Cpu, Bot, Zap } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const flowSteps = [
    { step: 1, title: 'Customer Initiates Purchase', desc: 'Customer selects items & triggers POS checkout', icon: '🛒', highlight: 'Frontend React + TypeScript' },
    { step: 2, title: 'Atomic Transaction Initiated', desc: 'Laravel API executes DB::beginTransaction() with strict row locking', icon: '🔒', highlight: 'Laravel 12 / PHP 8.5' },
    { step: 3, title: 'Inventory Decrement & Audit Log', desc: 'Stock deducted + InventoryMovement written (Type: SALE, Ref: Order#)', icon: '📦', highlight: 'Module 1 — Inventory' },
    { step: 4, title: 'Payment Confirmed & Order Created', desc: 'Payment entity linked, order marked completed, DB::commit()', icon: '💳', highlight: 'Module 2 — Sales' },
    { step: 5, title: 'Customer Health & RFM Sync', desc: 'LTV recalculation, order frequency count incremented', icon: '👥', highlight: 'Module 3 — CRM' },
    { step: 6, title: 'Python AI Pipeline Ingestion', desc: 'FastAPI microservice recalculates churn probability & demand curve', icon: '🧠', highlight: 'Python 3.13 / FastAPI' },
    { step: 7, title: 'Autonomous Insights Generated', desc: 'Actionable recommendation posted to Executive Operations Cockpit', icon: '⚡', highlight: 'OpsMind AI Intelligence' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                OpsMind Inter-Module Nervous System
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live Flow
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end event chain connecting CRM, Inventory, Sales, Helpdesk, and AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Flow Timeline */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {flowSteps.map((s, idx) => (
            <div key={s.step} className="relative">
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-indigo-500/30 transition-all">
                <div className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs flex items-center justify-center border border-indigo-500/40">
                        {s.step}
                      </span>
                      {s.title}
                    </h3>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {s.highlight}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
                </div>
              </div>

              {idx < flowSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-3.5 h-3.5 text-indigo-400/60" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Technical Guarantee */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ACID Transaction Guarantee
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <Database className="w-3.5 h-3.5" />
              Tenant Scoped Isolation
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <Bot className="w-3.5 h-3.5" />
              RFM & ML Churn Scoring
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
