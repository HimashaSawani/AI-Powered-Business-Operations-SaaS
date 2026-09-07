import React, { useState } from 'react';
import { User, Organization, SystemNotification } from '../types';
import { 
  Building2, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  Wrench,
  Layers,
  Bell,
  Search,
  Check,
  X,
  LogOut,
  Lock,
  ArrowRightLeft,
  Shield,
  Mail
} from 'lucide-react';

interface HeaderProps {
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  currentUser: User;
  users?: User[];
  onSelectUser?: (user: User) => void;
  lowStockCount: number;
  criticalChurnCount: number;
  notifications: SystemNotification[];
  onMarkNotificationRead: (id: number) => void;
  onOpenArchModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentOrg,
  organizations,
  onSelectOrg,
  currentUser,
  users,
  onSelectUser,
  lowStockCount,
  criticalChurnCount,
  notifications = [],
  onMarkNotificationRead,
  onOpenArchModal,
  searchQuery,
  onSearchChange,
  onLogout,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', icon: ShieldCheck, color: 'bg-purple-900/60 text-purple-300 border-purple-500/40' };
      case 'owner':
        return { label: 'Org Owner', icon: Briefcase, color: 'bg-blue-900/60 text-blue-300 border-blue-500/40' };
      case 'manager':
        return { label: 'Ops Manager', icon: UserCheck, color: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40' };
      default:
        return { label: 'Staff Member', icon: Wrench, color: 'bg-slate-800 text-slate-300 border-slate-600/40' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);
  const RoleIcon = roleInfo.icon;
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 glass-panel border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      {/* Brand & Architecture Visualizer Trigger */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                OpsMind<span className="text-indigo-400">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SaaS Core v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Tenant Autonomous Business Operations</p>
          </div>
        </div>

        <button
          onClick={onOpenArchModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-700/60 hover:border-indigo-500/50 hover:text-white transition-colors"
          title="Inspect System Inter-Module Nervous System Architecture"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>System Pipeline</span>
        </button>
      </div>

      {/* Center Search Bar & Quick Indicators */}
      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search across customers, products, tickets (Scout / Meilisearch)..."
            className="w-full pl-8 pr-4 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Multi-Tenant Organization Switcher & Persona Simulator & Notifications */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsOrgOpen(false); setIsUserMenuOpen(false); }}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-400" />
                  Notifications ({unreadCount} unread)
                </span>
                <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                      n.read_at
                        ? 'bg-slate-950/40 border-white/5 opacity-60'
                        : n.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/40'
                        : 'bg-indigo-950/30 border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-white text-[11px]">{n.title}</h4>
                      {!n.read_at && (
                        <button
                          onClick={() => onMarkNotificationRead(n.id)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug">{n.message}</p>
                    <div className="text-[9px] text-slate-500 font-mono">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Organization Switcher */}
        <div className="relative">
          <div 
            onClick={() => { setIsOrgOpen(!isOrgOpen); setIsNotifOpen(false); setIsUserMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <div className="text-left">
              <p className="font-semibold leading-none">{currentOrg.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{currentOrg.plan} Tier</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {isOrgOpen && (
            <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Tenant Isolation
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrg(org);
                    setIsOrgOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                    org.id === currentOrg.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-medium text-white">{org.name}</div>
                    <div className="text-[10px] text-slate-400">Tenant ID: #{org.id} &bull; {org.slug}</div>
                  </div>
                  {org.id === currentOrg.id && <span className="text-xs text-indigo-400">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Persona / RBAC Switcher */}
        <div className="relative">
          <div 
            onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); setIsOrgOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <img
              src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded border ${roleInfo.color}`}>
                  <RoleIcon className="w-2.5 h-2.5" />
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 space-y-3">
              {/* Authenticated User Profile Summary */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-white truncate">{currentUser.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    {currentUser.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded border ${roleInfo.color}`}>
                      <RoleIcon className="w-2.5 h-2.5" />
                      {roleInfo.label}
                    </span>
                    <span className="text-[9px] text-slate-500">#{currentUser.id}</span>
                  </div>
                </div>
              </div>

              {/* Security & Organization Context */}
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Organization</span>
                  <span className="font-semibold text-white truncate max-w-[120px]">{currentOrg.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Auth Status</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Sanctum Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tenant Isolation</span>
                  <span className="text-indigo-400 font-medium">Enforced</span>
                </div>
              </div>

              {/* Secure Session Actions */}
              <div className="space-y-1 pt-1 border-t border-white/10">
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Switch / Log In Another User</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Requires Auth</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Session</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
