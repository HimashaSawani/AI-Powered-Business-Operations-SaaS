import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  PlusCircle, 
  ArrowUpDown, 
  History, 
  Search, 
  X,
  TrendingDown
} from 'lucide-react';
import { Product, InventoryMovement, MovementType } from '../types';

interface InventoryViewProps {
  products: Product[];
  movements: InventoryMovement[];
  onRecordMovement: (productId: number, type: MovementType, quantity: number, notes: string) => void;
  onCreateProduct: (newProduct: Partial<Product>) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  movements,
  onRecordMovement,
  onCreateProduct,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'ledger'>('catalog');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'in_stock' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Movement
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<MovementType>('PURCHASE');
  const [movementQty, setMovementQty] = useState<number>(10);
  const [movementNotes, setMovementNotes] = useState<string>('');

  // Modal State for New Product
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(29.99);
  const [newCost, setNewCost] = useState(14.50);
  const [newStock, setNewStock] = useState(25);
  const [newReorder, setNewReorder] = useState(10);

  const filteredProducts = products.filter((p) => {
    const matchesFilter = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenMovementModal = (product: Product, defaultType: MovementType = 'PURCHASE') => {
    setSelectedProduct(product);
    setMovementType(defaultType);
    setMovementQty(defaultType === 'PURCHASE' ? 25 : 5);
    setMovementNotes(`Manual inventory ${defaultType.toLowerCase()} via operations cockpit`);
    setIsMovementModalOpen(true);
  };

  const handleExecuteMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Positive delta for purchase/return/adjustment up, negative delta for sale/damage/transfer
    const finalQty = ['SALE', 'DAMAGE', 'TRANSFER'].includes(movementType) 
      ? -Math.abs(movementQty) 
      : Math.abs(movementQty);

    onRecordMovement(selectedProduct.id, movementType, finalQty, movementNotes);
    setIsMovementModalOpen(false);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProduct({
      sku: newSku,
      name: newName,
      price: newPrice,
      cost: newCost,
      current_stock: newStock,
      reorder_level: newReorder,
      status: newStock <= 0 ? 'out_of_stock' : (newStock <= newReorder ? 'low_stock' : 'in_stock'),
    });
    setIsNewProductModalOpen(false);
    setNewSku('');
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Module 1 — Smart Inventory Management</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Zero-Blind Updates
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strict audit-trail accounting for every SKU. Never update stock without recording movement reason.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* SubTab Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveSubTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catalog ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'ledger'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Ledger ({movements.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'catalog' ? (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search SKU or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All SKUs
              </button>
              <button
                onClick={() => setStatusFilter('low_stock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'low_stock'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Low Stock Thresholds
              </button>
              <button
                onClick={() => setStatusFilter('in_stock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'in_stock'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                In Stock
              </button>
            </div>
          </div>

          {/* Product Catalog Table */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">SKU & Item Details</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Unit Cost</th>
                    <th className="pb-3 text-right">Gross Margin</th>
                    <th className="pb-3 text-right">Current Stock</th>
                    <th className="pb-3 text-right">Reorder Level</th>
                    <th className="pb-3">Inventory Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((p) => {
                    const marginPct = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="font-mono text-[11px] text-indigo-400">SKU: {p.sku}</div>
                          {p.supplier && (
                            <div className="text-[10px] text-slate-400 mt-0.5">Supplier: {p.supplier.name} (Lead: {p.supplier.lead_time_days}d)</div>
                          )}
                        </td>
                        <td className="py-3 text-slate-300">{p.category?.name || 'General Hardware'}</td>
                        <td className="py-3 text-right font-semibold text-white">${p.price.toFixed(2)}</td>
                        <td className="py-3 text-right text-slate-400">${p.cost.toFixed(2)}</td>
                        <td className="py-3 text-right font-medium text-emerald-400">{marginPct}%</td>
                        <td className="py-3 text-right font-bold text-base text-white">{p.current_stock}</td>
                        <td className="py-3 text-right font-mono text-slate-400">{p.reorder_level} units</td>
                        <td className="py-3">
                          {p.status === 'low_stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              LOW STOCK
                            </span>
                          )}
                          {p.status === 'in_stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              IN STOCK
                            </span>
                          )}
                          {p.status === 'out_of_stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                              <TrendingDown className="w-3.5 h-3.5" />
                              OUT OF STOCK
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleOpenMovementModal(p, 'PURCHASE')}
                            className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                          >
                            Adjust / Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Full Audit Ledger Tab */
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Complete Inventory Movement Audit Log
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable ledger recording who, what, when, and why stock levels altered.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              Total Recorded: {movements.length} events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Movement #</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Movement Type</th>
                  <th className="pb-3 text-right">Delta</th>
                  <th className="pb-3 text-right">Balance After</th>
                  <th className="pb-3">Reference Entity</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-indigo-300 font-semibold">#{m.id}</td>
                    <td className="py-3">
                      <div className="font-semibold text-white">{m.product?.name || 'Catalog Item'}</div>
                      <div className="font-mono text-[10px] text-slate-400">{m.product?.sku || 'SKU'}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.type === 'PURCHASE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : m.type === 'SALE'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className={`py-3 text-right font-bold text-sm ${m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white text-sm">
                      {m.balance_after}
                    </td>
                    <td className="py-3 text-slate-300 font-mono">
                      {m.reference_type} #{m.reference_id || 'N/A'}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-300 italic">{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement Modal (Audit-trail stock change) */}
      {isMovementModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Record Inventory Movement</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit trail entry for <span className="text-indigo-300 font-semibold">{selectedProduct.name}</span>
                </p>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMovement} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px]">Current Available Stock:</span>
                  <div className="text-xl font-bold text-white">{selectedProduct.current_stock} units</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">Reorder Threshold:</span>
                  <div className="text-sm font-mono text-amber-400">{selectedProduct.reorder_level} units</div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Movement Classification Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'ADJUSTMENT', 'TRANSFER'] as MovementType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMovementType(t)}
                      className={`py-2 px-2 text-center rounded-lg border font-semibold transition-all ${
                        movementType === t
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Quantity ({['SALE', 'DAMAGE', 'TRANSFER'].includes(movementType) ? 'Units to Deduct' : 'Units to Inbound'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Audit Trail Reason & Reference</label>
                <input
                  type="text"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  placeholder="e.g. Supplier replenishment PO-9102 or customer warranty replacement"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Post Movement Ledger Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create New Catalog Product</h3>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ergonomic Standing Desk Controller"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SKU</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. DC-702"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={newReorder}
                    onChange={(e) => setNewReorder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
