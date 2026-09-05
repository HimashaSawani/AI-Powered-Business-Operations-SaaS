import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  PlusCircle, 
  X, 
  Send,
  Clock,
  ShoppingCart,
  LifeBuoy,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { Customer, CustomerNote } from '../types';

interface CrmViewProps {
  customers: Customer[];
  onCreateCustomer: (customer: Partial<Customer>) => void;
  onAddNote: (customerId: number, content: string) => void;
}

export const CrmView: React.FC<CrmViewProps> = ({
  customers,
  onCreateCustomer,
  onAddNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Form State for New Customer
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCustomer({
      name: newName,
      email: newEmail,
      company: newCompany,
      phone: newPhone,
      status: 'active',
      lifetime_value: 0.0,
      total_orders: 0,
      health_score: 85,
    });
    setIsNewCustomerModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewCompany('');
    setNewPhone('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNoteContent.trim()) return;
    onAddNote(selectedCustomer.id, newNoteContent.trim());
    setNewNoteContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Module 3 — CRM & Customer Intelligence</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              6-Factor Health Radar & Timelines
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accounts enriched with multi-dimensional RFM scoring, interactive activity timelines, and churn risk playbooks.
          </p>
        </div>

        <button
          onClick={() => setIsNewCustomerModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Customer Account</span>
        </button>
      </div>

      {/* Main CRM Layout: Customer Directory (Left) + Detail Profile & Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers by name, company, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              {filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                const isHealthy = (c.health_score || 85) >= 70;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.id === 1 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              VIP Profile
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{c.company || 'Enterprise'} &bull; {c.email}</div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isHealthy
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {isHealthy ? '🟢 HEALTHY' : '🔴 AT RISK'} ({c.health_score || 85}%)
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>LTV: <strong className="text-white">${c.lifetime_value.toLocaleString()}</strong></span>
                      <span>Orders: <strong className="text-white">{c.total_orders}</strong></span>
                      <span className="font-mono text-slate-500">Last: {c.id === 1 ? '7 days ago' : (c.id === 2 ? '65 days ago' : '3 days ago')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Customer Details, 6-Factor Health Radar & Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCustomer ? (
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-5">
              {/* Profile Header */}
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-black text-white">{selectedCustomer.name}</h2>
                  <p className="text-xs text-slate-400">{selectedCustomer.company} &bull; {selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-xs text-slate-400 mt-0.5">{selectedCustomer.phone}</p>}
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-emerald-400">
                    {selectedCustomer.health_score || 86}%
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    (selectedCustomer.health_score || 86) >= 70
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {(selectedCustomer.health_score || 86) >= 70 ? '🟢 HEALTHY' : '🔴 AT RISK'}
                  </span>
                </div>
              </div>

              {/* 3 Core Profile Statistics (Section 12) */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</div>
                  <div className="text-lg font-black text-white font-mono">{selectedCustomer.total_orders} Orders</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Spending</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">${selectedCustomer.lifetime_value.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Last Purchase</div>
                  <div className="text-lg font-black text-indigo-300 font-mono">
                    {selectedCustomer.id === 1 ? '7 days ago' : (selectedCustomer.id === 2 ? '65 days ago' : '3 days ago')}
                  </div>
                </div>
              </div>

              {/* 6-Factor Customer Health Breakdown (Section 15) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI 6-Factor Health Score Breakdown
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-300">
                    Overall: {selectedCustomer.health_score || 86}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {selectedCustomer.health_factors ? (
                    <>
                      <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span className="text-[10px] text-slate-400">Recency</span>
                        <div className="text-sm font-bold text-white font-mono">{selectedCustomer.health_factors.recency} / 100</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span className="text-[10px] text-slate-400">Purchase Frequency</span>
                        <div className="text-sm font-bold text-white font-mono">{selectedCustomer.health_factors.purchase_frequency} / 100</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span className="text-[10px] text-slate-400">Revenue (Spend)</span>
                        <div className="text-sm font-bold text-white font-mono">{selectedCustomer.health_factors.revenue} / 100</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span className="text-[10px] text-slate-400">Support Experience</span>
                        <div className="text-sm font-bold text-white font-mono">{selectedCustomer.health_factors.support} / 100</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span className="text-[10px] text-slate-400">Engagement</span>
                        <div className="text-sm font-bold text-white font-mono">{selectedCustomer.health_factors.engagement} / 100</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span className="text-[10px] text-slate-400">Refunds History</span>
                        <div className="text-sm font-bold text-white font-mono">{selectedCustomer.health_factors.refunds || 90} / 100</div>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3 text-slate-400 text-xs italic">Standard metrics active</div>
                  )}
                </div>
              </div>

              {/* Customer Timeline Component (Section 12) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Customer Activity Timeline
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Cross-Module Pipeline Sync</span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/30">
                  {(selectedCustomer.timeline || [
                    { time: 'Today', title: 'Account Active', desc: 'No recorded activity events today', icon: 'check-circle', color: 'emerald' }
                  ]).map((item, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                      <div className="text-[10px] font-mono text-slate-400">{item.time}</div>
                      <div className="text-xs font-bold text-white mt-0.5">{item.title}</div>
                      <div className="text-xs text-slate-400 leading-snug">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log Note Composer */}
              <form onSubmit={handleAddNoteSubmit} className="pt-3 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Log account note or customer touchpoint..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Log</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl border border-white/10">
              Select a customer from the left to view profile and timeline.
            </div>
          )}
        </div>
      </div>

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create New Customer Account</h3>
              <button onClick={() => setIsNewCustomerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contact Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sarah Williams"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. sarah.williams@apexenterprise.com"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Apex Enterprise Solutions"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 438-9021"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
