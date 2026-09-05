import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LifeBuoy, 
  BrainCircuit, 
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { UserRole } from '../types';

export type TabKey = 'dashboard' | 'inventory' | 'sales' | 'crm' | 'helpdesk' | 'ai' | 'audit';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  userRole: UserRole;
  counts: {
    lowStock: number;
    openTickets: number;
    atRiskCustomers: number;
    activeInsights: number;
    auditLogsCount?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  counts,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabKey,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      description: 'Owner, Support, & Inv Telemetry',
      roles: ['super_admin', 'owner', 'manager', 'staff'],
    },
    {
      id: 'inventory' as TabKey,
      label: 'Inventory & Movements',
      icon: Package,
      badge: counts.lowStock > 0 ? `${counts.lowStock} Low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Audit stock ledgers & SKUs',
      roles: ['super_admin', 'owner', 'manager'],
    },
    {
      id: 'sales' as TabKey,
      label: 'Sales & POS Studio',
      icon: ShoppingCart,
      description: 'Atomic DB checkout orders',
      roles: ['super_admin', 'owner', 'manager', 'staff'],
    },
    {
      id: 'crm' as TabKey,
      label: 'CRM & Accounts',
      icon: Users,
      badge: counts.atRiskCustomers > 0 ? `${counts.atRiskCustomers} Risk` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Sarah Williams & Timelines',
      roles: ['super_admin', 'owner', 'manager', 'staff'],
    },
    {
      id: 'helpdesk' as TabKey,
      label: 'Helpdesk & SLA',
      icon: LifeBuoy,
      badge: counts.openTickets > 0 ? `${counts.openTickets}` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'AI Ticket #2048 NLP Triage',
      roles: ['super_admin', 'owner', 'manager', 'staff'],
    },
    {
      id: 'ai' as TabKey,
      label: 'OpsMind AI Lab',
      icon: BrainCircuit,
      badge: `${counts.activeInsights} Live`,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'MAE/RMSE Models & Basket',
      roles: ['super_admin', 'owner', 'manager'],
    },
    {
      id: 'audit' as TabKey,
      label: 'Audit Log & Security',
      icon: ShieldAlert,
      badge: counts.auditLogsCount ? `${counts.auditLogsCount}` : undefined,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
      description: 'Price & role change logs',
      roles: ['super_admin', 'owner', 'manager'],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-white/5 bg-slate-950/70 p-4">
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Operations Control</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasAccess = item.roles.includes(userRole);

            if (!hasAccess) {
              return null; // RBAC isolation: Staff cannot access Manager/Owner tabs
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{item.description}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend & AI Microservice Health Telemetry Card */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Engines Telemetry</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Laravel 12 API:</span>
            <span className="text-emerald-300 font-mono">ONLINE (:8088)</span>
          </div>
          <div className="flex justify-between">
            <span>Python AI Engine:</span>
            <span className="text-indigo-300 font-mono">ONLINE (:8001)</span>
          </div>
          <div className="flex justify-between">
            <span>Queue / Scheduler:</span>
            <span className="text-purple-300 font-mono">ACTIVE (Nightly)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
