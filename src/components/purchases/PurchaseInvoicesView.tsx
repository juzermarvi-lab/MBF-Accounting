import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Trash2,
  X,
  PlusCircle,
  Truck,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { InvoiceLineItem, PurchaseInvoice } from '../../types/accounting';
import {
  formatCurrency,
  getInvoiceTotal,
  getPurchaseInvoicePaidAmount
} from '../../utils/accountingMath';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const purchaseInvoiceColumns: ColumnDef[] = [
  { key: 'reference', header: 'Bill Ref #', sample: 'PINV-9018' },
  { key: 'date', header: 'Date', sample: '2026-10-06' },
  { key: 'dueDate', header: 'Due Date', sample: '2026-11-06' },
  { key: 'supplier', header: 'Supplier', sample: 'Hussain Bhai' },
  { key: 'item', header: 'Item', sample: 'Chicken Samosa' },
  { key: 'qty', header: 'Quantity', sample: '10' },
  { key: 'unitPrice', header: 'Unit Cost', sample: '290' },
  { key: 'description', header: 'Description', sample: 'Stock delivery' }
];

export const PurchaseInvoicesView: React.FC = () => {
  const { data, addPurchaseInvoice, deletePurchaseInvoice } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // New Purchase Invoice form state
  const [newRef, setNewRef] = useState(`PINV-90${(data.purchaseInvoices.length + 18).toString()}`);
  const [newSupplierId, setNewSupplierId] = useState(data.suppliers[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState('Stock purchase batch');
  const [newLines, setNewLines] = useState<Array<Omit<InvoiceLineItem, 'id'>>>([
    {
      itemId: data.inventoryItems[0]?.id,
      accountId: 'acc-inventory',
      description: data.inventoryItems[0]?.name || 'Item',
      qty: 10,
      unitPrice: data.inventoryItems[0]?.purchasePrice || 280
    }
  ]);

  const handleAddLine = () => {
    const firstItem = data.inventoryItems[0];
    setNewLines([
      ...newLines,
      {
        itemId: firstItem?.id,
        accountId: 'acc-inventory',
        description: firstItem?.name || 'Item',
        qty: 10,
        unitPrice: firstItem?.purchasePrice || 280
      }
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (newLines.length <= 1) return;
    setNewLines(newLines.filter((_, i) => i !== idx));
  };

  const handleItemSelect = (idx: number, itemId: string) => {
    const item = data.inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    const updated = [...newLines];
    updated[idx] = {
      ...updated[idx],
      itemId: item.id,
      description: item.name,
      unitPrice: item.purchasePrice || item.startingUnitCost || 200
    };
    setNewLines(updated);
  };

  const handleLineChange = (idx: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...newLines];
    updated[idx] = { ...updated[idx], [field]: value };
    setNewLines(updated);
  };

  const calculateTotal = () => {
    return newLines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLines.length === 0) return;

    const generatedLines: InvoiceLineItem[] = newLines.map((l, i) => ({
      ...l,
      id: `pl-${Date.now()}-${i}`
    }));

    addPurchaseInvoice({
      reference: newRef.trim() || `PINV-90${Date.now().toString().slice(-4)}`,
      date: newDate,
      dueDate: newDueDate,
      supplierId: newSupplierId,
      description: newDesc,
      taxInclusive: false,
      deliveryCharges: 0,
      supplierDiscountAmount: 0,
      supplierDiscountPercent: 0,
      lines: generatedLines
    });

    setShowAddModal(false);
  };

  const filteredInvoices = data.purchaseInvoices.filter(inv => {
    const supplier = data.suppliers.find(s => s.id === inv.supplierId);
    return (
      inv.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            Purchase Invoices & Bills
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record supplier orders and incoming stock deliveries with automatic inventory quantity on hand increases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowDataModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import / Export</span>
          </button>

          <button
            onClick={() => {
              setNewRef(`PINV-90${(data.purchaseInvoices.length + 18).toString()}`);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Purchase Bill
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by invoice #, supplier..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
        />
      </div>

      {/* Purchase Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Bill Ref #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4 text-right">Total (PKR)</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map(inv => {
                const supplier = data.suppliers.find(s => s.id === inv.supplierId);
                const total = getInvoiceTotal(inv);
                const paid = getPurchaseInvoicePaidAmount(inv.id, data.payments);
                const balanceDue = Math.max(0, total - paid);

                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      {inv.reference}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{inv.date}</td>
                    <td className="py-3 px-4 font-semibold text-white max-w-[160px] truncate">
                      {supplier?.name || inv.supplierId}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">
                      {inv.lines.map(l => `${l.description} (${l.qty})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(total, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      {paid > 0 ? formatCurrency(paid, data.currency.symbol) : "—"}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${balanceDue > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {formatCurrency(balanceDue, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete Purchase Invoice ${inv.reference}?`)) {
                            deletePurchaseInvoice(inv.id);
                          }
                        }}
                        className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                Record Supplier Purchase Bill
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Ref *</label>
                  <input
                    type="text"
                    required
                    value={newRef}
                    onChange={e => setNewRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Supplier *</label>
                  <select
                    value={newSupplierId}
                    onChange={e => setNewSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-purple-500 focus:outline-hidden"
                  >
                    {data.suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Purchased Inventory Items (Stock In)</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {newLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <div className="col-span-5">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Product</label>
                        <select
                          value={line.itemId}
                          onChange={e => handleItemSelect(idx, e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-hidden"
                        >
                          {data.inventoryItems.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} (Cost: {formatCurrency(item.purchasePrice || item.startingUnitCost, data.currency.symbol)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Quantity (Packs)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          min="0.1"
                          value={line.qty}
                          onChange={e => handleLineChange(idx, 'qty', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Unit Cost (PKR)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={line.unitPrice}
                          onChange={e => handleLineChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-1 text-right pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={newLines.length <= 1}
                          className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Banner */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-300">Total Purchase Payable:</span>
                <span className="font-mono text-lg font-bold text-rose-400">
                  {formatCurrency(calculateTotal(), data.currency.symbol)}
                </span>
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
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer"
                >
                  Save Bill & Increase Stock
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
        entityKey="purchaseInvoices"
        entityTitle="Purchase Invoices"
        columns={purchaseInvoiceColumns}
        dataList={data.purchaseInvoices}
        matchKey="reference"
      />
    </div>
  );
};
