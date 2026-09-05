import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Package, 
  RefreshCw,
  Cpu,
  BarChart2,
  Check,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Line
} from 'recharts';
import { Customer, Product, AiInsight, ModelBenchmarkMetric } from '../types';
import { initialModelBenchmarks } from '../mockData';

interface AiIntelligenceViewProps {
  customers: Customer[];
  products: Product[];
  insights: AiInsight[];
  onApplyInsight: (id: string | number) => void;
  onDismissInsight: (id: string | number) => void;
}

export const AiIntelligenceView: React.FC<AiIntelligenceViewProps> = ({
  customers,
  products,
  insights,
  onApplyInsight,
  onDismissInsight,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 1);
  const [benchmarks] = useState<ModelBenchmarkMetric[]>(initialModelBenchmarks);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Dynamic calculations based on Section 18
  const currentStock = selectedProduct.current_stock || 50;
  const predictedDemand = 87;
  const safetyStock = selectedProduct.safety_stock || 15;
  const leadTimeDays = selectedProduct.supplier?.lead_time_days || 7;
  const dailyVelocity = (predictedDemand / 30.0);
  const daysUntilStockout = Math.max(1, Math.round(currentStock / dailyVelocity));
  const recommendedReorder = Math.max(0, (predictedDemand - currentStock + safetyStock));

  // Generate 30-day forecast projection series
  const forecastSeries = [];
  let remainingStock = currentStock;
  for (let i = 1; i <= 30; i++) {
    const dayDemand = Number((dailyVelocity * (1 + (i * 0.01))).toFixed(1));
    remainingStock = Math.max(0, Math.round(remainingStock - dayDemand));
    forecastSeries.push({
      day: `Day ${i}`,
      demand: dayDemand,
      remainingStock: remainingStock,
      safetyThreshold: safetyStock,
    });
  }

  const handleRunAiAnalysis = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">OpsMind AI — Autonomous Operations Engine</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              FastAPI / Scikit-Learn Model Lab
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparing statistical & ML models with empirical error metrics (MAE, RMSE, MAPE) and continuous lead-time safety stock audits.
          </p>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Re-scoring Pipeline...' : 'Run Pipeline Inference'}</span>
        </button>
      </div>

      {/* Section 1: Model Benchmark Comparison Matrix (Section 17) */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Forecasting Model Benchmark Evaluation (MAE / RMSE / MAPE)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical metric comparison selecting the optimal predictive model for 30-day product demand
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Selected: Linear Trend / ARIMA (Lowest Error: 3.26% MAPE)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benchmarks.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                m.is_best_fit
                  ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-950/60 border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-xs">{m.model_name}</h3>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {idx === 0 ? 'Optimal Performance' : (idx === 1 ? 'Baseline Moving Avg' : 'Advanced ML')}
                  </div>
                </div>
                {m.is_best_fit && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    Best Fit
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded bg-slate-950/70 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">MAE</span>
                  <strong className="text-white font-mono">{m.mae}</strong>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">RMSE</span>
                  <strong className="text-white font-mono">{m.rmse}</strong>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">MAPE</span>
                  <strong className={m.is_best_fit ? 'text-emerald-400 font-mono font-bold' : 'text-slate-300 font-mono'}>
                    {m.mape}%
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">30-Day Demand:</span>
                <span className="font-mono font-bold text-white">{m.projected_30d_demand} units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Inventory Prediction & Safety Stock Formula (Section 18) */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Safety Stock & Stockout Runout Forecaster (Module 1 Integration)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculates safety stock, lead time windows, and stockout horizon
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">Product SKU:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) &bull; {p.current_stock} in stock
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Formula Display Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 border border-amber-500/30 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Current Stock</span>
              <div className="text-base font-black text-white font-mono">{currentStock} units</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Predicted Demand (30d)</span>
              <div className="text-base font-black text-indigo-400 font-mono">{predictedDemand} units</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Safety Stock Buffer</span>
              <div className="text-base font-black text-amber-400 font-mono">{safetyStock} units</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Supplier Lead Time</span>
              <div className="text-base font-black text-purple-400 font-mono">{leadTimeDays} Days</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>⚠️ {selectedProduct.name}</strong> may run out of stock in approximately <strong>{daysUntilStockout} days</strong>.
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] text-slate-400 uppercase">Recommended Reorder: </span>
              <strong className="text-emerald-400 font-mono text-sm">{recommendedReorder} units</strong>
            </div>
          </div>
        </div>

        {/* 30-Day Projection Chart */}
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="invStockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} interval={4} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="remainingStock" stroke="#a78bfa" strokeWidth={2.5} fillOpacity={1} fill="url(#invStockGrad)" />
              <Line type="monotone" dataKey="demand" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="safetyThreshold" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 3: AI Business Insights (Section 19) */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              AI Operational Business Insights (Section 19 Requirements)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesized operational recommendations across revenue, inventory runout, churn risk, and market basket affinities
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                item.status === 'applied'
                  ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                  : item.status === 'dismissed'
                  ? 'bg-slate-950/40 border-white/5 opacity-50'
                  : 'bg-slate-900/80 border-white/5 hover:border-purple-500/30'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : item.severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] font-mono text-purple-300">
                    Confidence: {Math.round(item.confidence_score * 100)}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                <div className="flex items-center gap-2 text-[11px] text-indigo-300">
                  <strong className="text-slate-400">Action:</strong>
                  <span>{item.recommended_action}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status === 'applied' ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Applied & Resolved
                  </span>
                ) : item.status === 'dismissed' ? (
                  <span className="text-slate-500 text-xs italic px-3 py-1.5">Dismissed</span>
                ) : (
                  <>
                    <button
                      onClick={() => onDismissInsight(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => onApplyInsight(item.id)}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
                    >
                      Apply Action
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
