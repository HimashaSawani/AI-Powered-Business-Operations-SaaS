import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  X,
  Sparkles,
  Bot,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Ticket, Customer } from '../types';

interface HelpdeskViewProps {
  tickets: Ticket[];
  customers: Customer[];
  onReplyTicket: (ticketId: number, message: string, newStatus?: string) => void;
  onCreateTicket: (newTicket: {
    customer_id: number;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    message: string;
  }) => void;
}

export const HelpdeskView: React.FC<HelpdeskViewProps> = ({
  tickets,
  customers,
  onReplyTicket,
  onCreateTicket,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<number>(tickets[0]?.id || 2048);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('open');

  // Modal State for New Ticket
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newCustId, setNewCustId] = useState<number>(customers[0]?.id || 1);
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [newCategory, setNewCategory] = useState('Billing');
  const [initialMessage, setInitialMessage] = useState('');

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Dynamic AI Preview on message typing
  const isBillingDispute = initialMessage.toLowerCase().includes('charge') || initialMessage.toLowerCase().includes('twice');
  const predictedCategory = isBillingDispute ? 'Billing' : (initialMessage.toLowerCase().includes('broken') ? 'Technical Support' : 'General');
  const predictedSentiment = (isBillingDispute || initialMessage.toLowerCase().includes('broken')) ? 'negative' : 'neutral';
  const predictedPriority = isBillingDispute ? 'high' : 'medium';

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    onReplyTicket(activeTicket.id, replyMessage.trim(), selectedStatus);
    setReplyMessage('');
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTicket({
      customer_id: newCustId,
      subject: newSubject,
      priority: predictedPriority as any,
      category: predictedCategory,
      message: initialMessage,
    });
    setIsNewTicketModalOpen(false);
    setNewSubject('');
    setInitialMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Module 4 — Helpdesk & AI Ticket Classification</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              Python NLP Pipeline Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Incoming inquiries are automatically parsed by Python AI service: sentiment, category, priority, and team routing.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Open Support Ticket</span>
        </button>
      </div>

      {/* Main Grid: Ticket List (Left 5 cols) + Conversation & AI NLP Card (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider flex items-center justify-between">
            <span>Customer Inquiries ({tickets.length})</span>
            <span className="text-[10px] text-indigo-400 font-mono">Queue Worker: Idle</span>
          </div>

          <div className="space-y-2.5">
            {tickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              const isUrgent = t.priority === 'urgent' || t.priority === 'high';
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicketId(t.id);
                    setSelectedStatus(t.status);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-400 font-bold">{t.ticket_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                      {t.sentiment === 'negative' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                          Negative Sentiment
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-white mt-2 leading-snug">{t.subject}</h3>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t.customer?.name || 'Customer'}</span>
                    <span className="text-indigo-300 font-semibold">{t.assigned_team || 'Support Team'}</span>
                    <span className="capitalize text-slate-300 font-medium">{t.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation Thread & AI NLP Metadata */}
        <div className="lg:col-span-7 space-y-4">
          {activeTicket ? (
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4 flex flex-col justify-between min-h-[520px]">
              <div>
                {/* Thread Header */}
                <div className="flex items-start justify-between pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-400 font-bold">{activeTicket.ticket_number}</span>
                      <h2 className="text-sm font-bold text-white">{activeTicket.subject}</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customer: <strong className="text-slate-200">{activeTicket.customer?.name}</strong> &bull; Category: {activeTicket.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_on_customer">Waiting on Customer</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* AI Classification & Sentiment Card (Sections 13 & 14) */}
                <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 border border-purple-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      Python AI NLP Classification Result
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Confidence: <strong className="text-emerald-400 font-bold">{Math.round((activeTicket.ai_confidence || 0.94) * 100)}%</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Category:</span>
                      <strong className="text-white capitalize">{activeTicket.category}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Priority:</span>
                      <strong className="text-rose-400 uppercase">{activeTicket.priority}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Sentiment:</span>
                      <strong className="text-amber-400 capitalize">{activeTicket.sentiment || 'negative'}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Routed Team:</span>
                      <strong className="text-indigo-300">{activeTicket.assigned_team || 'Billing Team'}</strong>
                    </div>
                  </div>

                  <div className="font-mono text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-white/5">
                    {`{"category": "${activeTicket.category.toLowerCase()}", "priority": "${activeTicket.priority}", "sentiment": "${activeTicket.sentiment || 'negative'}", "confidence": ${activeTicket.ai_confidence || 0.94}}`}
                  </div>
                </div>

                {/* Message History Thread */}
                <div className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {(activeTicket.messages || []).map((msg) => {
                    const isStaff = msg.sender_type === 'staff';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5">
                          {msg.sender_name} &bull; {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div
                          className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                            isStaff
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Composer */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type an official support reply..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 glass-panel rounded-2xl border border-white/10">
              Select a ticket to inspect AI classification.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal with Live AI Classification Preview */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Open Support Ticket (AI Classified)</h3>
              <button onClick={() => setIsNewTicketModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Customer Account</label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || 'Direct'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. I was charged twice for my order"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Customer Message</label>
                <textarea
                  rows={3}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="e.g. I was charged twice for my order. Please reverse the duplicate payment."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Live NLP Classification Preview */}
              {initialMessage.trim().length > 5 && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1 text-xs">
                  <div className="font-semibold text-purple-300 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>Real-Time AI Classification Preview:</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>Category: <strong className="text-white">{predictedCategory}</strong></span>
                    <span>Priority: <strong className="text-rose-400">{predictedPriority.toUpperCase()}</strong></span>
                    <span>Sentiment: <strong className="text-amber-400">{predictedSentiment}</strong></span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Create & Auto-Classify Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
