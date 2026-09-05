import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Package, 
  LifeBuoy, 
  TrendingUp, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  Clock,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Customer, Product, Order, Ticket, AiInsight, InventoryMovement } from '../types';

interface DashboardViewProps {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  tickets: Ticket[];
  insights: AiInsight[];
  movements: InventoryMovement[];
  onApplyInsight: (id: string | number) => void;
  onNavigateTab: (tab: any) => void;
}

type DashboardRoleView = 'owner' | 'support' | 'inventory';

const salesChartData = [
  { day: 'Mon', revenue: 140, orders: 3 },
  { day: 'Tue', revenue: 290, orders: 5 },
  { day: 'Wed', revenue: 195, orders: 4 },
  { day: 'Thu', revenue: 420, orders: 7 },
  { day: 'Fri', revenue: 380, orders: 6 },
  { day: 'Sat', revenue: 510, orders: 9 },
  { day: 'Sun', revenue: 640, orders: 11 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  products,
  orders,
  tickets,
  insights,
  movements,
  onApplyInsight,
  onNavigateTab,
}) => {
  const [roleView, setRoleView] = useState<DashboardRoleView>('owner');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0) + 4820.00;
  const grossProfit = totalRevenue * 0.44;
  const lowStockProducts = products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock');
  const atRiskCustomers = customers.filter((c) => c.status === 'at_risk' || (c.health_score && c.health_score < 45));
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const highPriorityTickets = tickets.filter((t) => t.priority === 'high' || t.priority === 'urgent');
  const inventoryValuation = products.reduce((sum, p) => sum + (p.current_stock * p.cost), 0) + 12450.00;

  return (
    <div className="space-y-6">
      {/* Top Banner with Role-Dashboard View Switcher (Section 27) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Operations Cockpit & Intelligence Telemetry</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Real-Time Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic role views: Toggle between Owner, Support Operations, and Inventory Management dashboards.
          </p>
        </div>

        {/* Segmented Role-Dashboard View Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setRoleView('owner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleView === 'owner'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Owner Dashboard</span>
          </button>
          <button
            onClick={() => setRoleView('support')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleView === 'support'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support Dashboard</span>
          </button>
          <button
            onClick={() => setRoleView('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleView === 'inventory'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory Dashboard</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: OWNER DASHBOARD */}
      {roleView === 'owner' && (
        <>
          {/* 4 Owner KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel glass-panel-hover border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Net Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.0% revenue increase this month</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel glass-panel-hover border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Estimated Gross Profit</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">${grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-indigo-300">
                  <span>44.0% Average Gross Margin</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel glass-panel-hover border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Customer Health Index</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">86.0% Avg Health</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{atRiskCustomers.length} Accounts at Churn Risk</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel glass-panel-hover border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Catalog Asset Value</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">${inventoryValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                  <span>{products.length} Active SKUs Monitored</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Velocity Chart & AI Business Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Revenue & Velocity Trajectory
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Last 7 Days
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Continuous sales velocity tracking with live order sync</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ownerRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                      formatter={(value: any) => [`$${value}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#ownerRevenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Business Insights Feed (Section 19) */}
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">AI Business Insights</h2>
                    <p className="text-[11px] text-slate-400">Cross-module intelligence</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {insights.filter((i) => i.status === 'active').slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{item.title}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug">{item.description}</p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-indigo-400">{item.impact_metric}</span>
                      <button
                        onClick={() => onApplyInsight(item.id)}
                        className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[10px] font-semibold"
                      >
                        Apply Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: SUPPORT OPERATIONS DASHBOARD (Section 27) */}
      {roleView === 'support' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">Total Open Tickets</span>
              <div className="text-2xl font-black text-white mt-1">{openTickets.length} Inquiries</div>
              <span className="text-xs text-indigo-400">Auto-classified by AI</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">High / Urgent Priority</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{highPriorityTickets.length} Tickets</div>
              <span className="text-xs text-slate-400">Immediate response required</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">Average Resolution Time</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">3.8 Hours</div>
              <span className="text-xs text-emerald-400">96.2% SLA Compliance</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">SLA Breach Horizon</span>
              <div className="text-2xl font-black text-white mt-1">1 At Risk</div>
              <span className="text-xs text-amber-400">Targeting &lt;4h resolution</span>
            </div>
          </div>

          {/* AI NLP Sentiment & Agent Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-indigo-400" />
                AI Ticket Sentiment Breakdown
              </h3>
              <p className="text-xs text-slate-400">NLP sentiment detected from customer messages</p>
              
              <div className="space-y-2.5 pt-2 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-rose-300 font-semibold">Negative Sentiment (Billing & Hardware)</span>
                    <span className="font-mono text-white">45% (Ticket #2048 & #2041)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-semibold">Neutral Sentiment</span>
                    <span className="font-mono text-white">40%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-emerald-300 font-semibold">Positive Feedback</span>
                    <span className="font-mono text-white">15%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Support Agent Leaderboard
              </h3>
              <p className="text-xs text-slate-400">SLA performance and customer satisfaction</p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-white">Sarah Jenkins</div>
                      <div className="text-[10px] text-slate-400">Staff Support Specialist</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400">98% Satisfaction</span>
                    <div className="text-[10px] text-slate-400">24 tickets resolved</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-white">Marcus Chen</div>
                      <div className="text-[10px] text-slate-400">Operations Manager</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400">94% Satisfaction</span>
                    <div className="text-[10px] text-slate-400">18 tickets resolved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INVENTORY OPERATIONS DASHBOARD (Section 27) */}
      {roleView === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">Total Monitored SKUs</span>
              <div className="text-2xl font-black text-white mt-1">{products.length} SKUs</div>
              <span className="text-xs text-emerald-400">Zero blind updates</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">Low Stock Reorders Needed</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{lowStockProducts.length} Products</div>
              <span className="text-xs text-amber-300">WM-001 & HS-300</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">Total Asset Inventory Value</span>
              <div className="text-2xl font-black text-white mt-1">${inventoryValuation.toLocaleString()}</div>
              <span className="text-xs text-slate-400">Cost valuation balance</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/10">
              <span className="text-xs text-slate-400">Safety Stock Deficits</span>
              <div className="text-2xl font-black text-rose-400 mt-1">2 Items</div>
              <span className="text-xs text-rose-300">Lead time window critical</span>
            </div>
          </div>

          {/* Reorder Urgency List */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  Recommended Reorder Batches & Supplier Lead Times
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Formula: (Daily Demand &times; Lead Time) + Safety Stock</p>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-indigo-400 hover:text-white"
              >
                Go to Catalog &rarr;
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white text-sm">Wireless Mouse Pro (WM-001)</div>
                  <div className="text-slate-400 text-[11px]">
                    Current Stock: 18 &bull; Safety Stock: 15 &bull; Supplier Lead Time: 7 Days &bull; Daily Velocity: 3.2 units/day
                  </div>
                  <div className="text-amber-400 text-[11px] font-semibold mt-1">
                    ⚠️ Wireless Mouse may run out of stock in approximately 5.6 days.
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-black text-indigo-400">80 units</span>
                  <div className="text-[10px] text-slate-400">Recommended Order</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white text-sm">Noise-Cancelling Headset (HS-300)</div>
                  <div className="text-slate-400 text-[11px]">
                    Current Stock: 8 &bull; Safety Stock: 10 &bull; Supplier Lead Time: 8 Days &bull; Daily Velocity: 1.5 units/day
                  </div>
                  <div className="text-amber-400 text-[11px] font-semibold mt-1">
                    ⚠️ Headset units may breach safety stock threshold in approximately 5.3 days.
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-black text-indigo-400">45 units</span>
                  <div className="text-[10px] text-slate-400">Recommended Order</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
