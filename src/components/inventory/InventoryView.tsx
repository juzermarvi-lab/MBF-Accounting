import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Tag,
  X,
  Layers,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { InventoryItem } from '../../types/accounting';
import { formatCurrency, getInventoryStock } from '../../utils/accountingMath';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const inventoryColumns: ColumnDef[] = [
  { key: 'code', header: 'SKU Code', sample: 'SKU-128' },
  { key: 'name', header: 'Item Name', sample: 'Chicken Malai Boti Samosa' },
  { key: 'division', header: 'Division', sample: 'Samosas' },
  { key: 'unitName', header: 'Unit of Measure', sample: 'Pack' },
  { key: 'purchasePrice', header: 'Purchase Cost', sample: '300' },
  { key: 'salePrice', header: 'Sale Price', sample: '480' },
  { key: 'startingQty', header: 'Starting Quantity', sample: '10' }
];

export const InventoryView: React.FC = () => {
  const { data, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [division, setDivision] = useState('Samosas');
  const [unitName, setUnitName] = useState('Pack');
  const [purchasePrice, setPurchasePrice] = useState<number>(250);
  const [salePrice, setSalePrice] = useState<number>(450);
  const [startingQty, setStartingQty] = useState<number>(10);

  const divisions = ['All', 'Samosas', 'Kababs', 'Rolls', 'Snacks', 'Kids Special'];

  const handleOpenAdd = () => {
    setName('');
    setCode(`SKU-${data.inventoryItems.length + 101}`);
    setDivision('Samosas');
    setUnitName('Pack');
    setPurchasePrice(250);
    setSalePrice(450);
    setStartingQty(10);
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCode(item.code);
    setDivision(item.division || 'Samosas');
    setUnitName(item.unitName || 'Pack');
    setPurchasePrice(item.purchasePrice);
    setSalePrice(item.salePrice);
    setStartingQty(item.startingQty);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        name: name.trim(),
        code: code.trim(),
        division,
        unitName,
        purchasePrice: Number(purchasePrice) || 0,
        salePrice: Number(salePrice) || 0,
        startingQty: Number(startingQty) || 0
      });
    } else {
      addInventoryItem({
        name: name.trim(),
        code: code.trim() || `SKU-${data.inventoryItems.length + 101}`,
        division,
        unitName,
        purchasePrice: Number(purchasePrice) || 0,
        salePrice: Number(salePrice) || 0,
        startingQty: Number(startingQty) || 0,
        startingUnitCost: Number(purchasePrice) || 0
      });
    }

    setShowAddModal(false);
  };

  const filteredItems = data.inventoryItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = divisionFilter === 'All' || item.division === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  // Calculate total inventory valuation
  const totalValuation = data.inventoryItems.reduce((sum, item) => {
    const stockInfo = getInventoryStock(item, data.salesInvoices, data.purchaseInvoices);
    return sum + stockInfo.valuationCost;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Frozen Food Inventory & Stock Levels
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            27 SKUs across Samosas, Kababs, Rolls, Snacks, and Kids Specials with live stock tracking and valuation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right pr-3 border-r border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Stock Value</span>
            <p className="font-mono font-bold text-emerald-400 text-sm">
              {formatCurrency(totalValuation, data.currency.symbol)}
            </p>
          </div>
          <button
            onClick={() => setShowDataModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import / Export</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add SKU Item
          </button>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by SKU or item name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Division segment controls */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-w-full">
          {divisions.map(div => (
            <button
              key={div}
              onClick={() => setDivisionFilter(div)}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                divisionFilter === div
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {div}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost (PKR)</th>
                <th className="py-3 px-4 text-right">Sale (PKR)</th>
                <th className="py-3 px-4 text-center">Initial</th>
                <th className="py-3 px-4 text-center">In (+)</th>
                <th className="py-3 px-4 text-center">Out (-)</th>
                <th className="py-3 px-4 text-right">Stock on Hand</th>
                <th className="py-3 px-4 text-right">Valuation</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map(item => {
                const stock = getInventoryStock(item, data.salesInvoices, data.purchaseInvoices);
                const isLowStock = stock.currentStock <= 2;
                const isOutOfStock = stock.currentStock <= 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{item.code}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {isOutOfStock ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            Low Stock
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.division || "General"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatCurrency(item.purchasePrice, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(item.salePrice, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{stock.startingQty}</td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-400">+{stock.qtyIn}</td>
                    <td className="py-3 px-4 text-center font-mono text-rose-400">-{stock.qtyOut}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono font-bold ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-slate-100'}`}>
                        {stock.currentStock} {item.unitName || 'Packs'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300 font-semibold">
                      {formatCurrency(stock.valuationCost, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${item.name}?`)) {
                              deleteInventoryItem(item.id);
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                {editingItem ? 'Edit Inventory Item' : 'New Frozen Food Item'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Malai Boti Samosa"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Division / Category</label>
                  <select
                    value={division}
                    onChange={e => setDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Samosas">Samosas</option>
                    <option value="Kababs">Kababs</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Kids Special">Kids Special</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purchase Cost (PKR) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Retail Sale Price (PKR) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={salePrice}
                    onChange={e => setSalePrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Starting Stock Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={startingQty}
                    onChange={e => setStartingQty(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={e => setUnitName(e.target.value)}
                    placeholder="Pack"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                >
                  {editingItem ? 'Update SKU' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Import / Export Modal */}
      <DataImportExportModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        entityKey="inventoryItems"
        entityTitle="Inventory Items"
        columns={inventoryColumns}
        dataList={data.inventoryItems}
        matchKey="code"
      />
    </div>
  );
};
