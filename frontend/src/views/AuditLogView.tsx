import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Clock, User, ArrowRight, Database } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    const matchesSearch =
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Enterprise Immutable Audit Logging</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Compliance Enforced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracks sensitive mutations: price changes, inventory adjustments, role elevations, and order cancellations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Total Audit Entries: <strong>{logs.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, summary, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['all', 'price_change', 'inventory_adjust', 'role_change', 'order_create'].map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors uppercase text-[10px] ${
                filterAction === act
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor / User</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Entity Target</th>
                <th className="pb-3">Audit Summary & Value Delta</th>
                <th className="pb-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <User className="w-3 h-3 text-purple-400" />
                      <span>{log.user_name}</span>
                    </div>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.action === 'price_change'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.action === 'inventory_adjust'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-white">{log.summary}</div>
                    {(log.old_values || log.new_values) && (
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                        {log.old_values && <span>Old: {JSON.stringify(log.old_values)}</span>}
                        {log.old_values && log.new_values && <ArrowRight className="w-3 h-3 text-indigo-400" />}
                        {log.new_values && <span className="text-emerald-300">New: {JSON.stringify(log.new_values)}</span>}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
