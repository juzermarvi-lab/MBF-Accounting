import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  X,
  PlusCircle,
  Eye,
  Receipt,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { InvoiceLineItem, SalesInvoice } from '../../types/accounting';
import {
  formatCurrency,
  getInvoiceTotal,
  getSalesInvoicePaidAmount
} from '../../utils/accountingMath';
import { InvoicePrintModal } from '../modals/InvoicePrintModal';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const salesInvoiceColumns: ColumnDef[] = [
  { key: 'reference', header: 'Invoice #', sample: 'INV-7325' },
  { key: 'date', header: 'Date', sample: '2026-10-08' },
  { key: 'dueDate', header: 'Due Date', sample: '2026-10-15' },
  { key: 'customer', header: 'Customer', sample: 'Batool Ezzi' },
  { key: 'item', header: 'Item', sample: 'Allo Samosa' },
  { key: 'qty', header: 'Quantity', sample: '2' },
  { key: 'unitPrice', header: 'Unit Price', sample: '360' },
  { key: 'discountPercent', header: 'Discount %', sample: '0' },
  { key: 'deliveryCharges', header: 'Delivery Charges', sample: '0' },
  { key: 'description', header: 'Description', sample: 'Sales order delivery' }
];

export const SalesInvoicesView: React.FC = () => {
  const {
    data,
    addSalesInvoice,
    deleteSalesInvoice,
    addReceipt
  } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoice | null>(null);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // New Invoice Form
  const [newRef, setNewRef] = useState(`INV-${Date.now().toString().slice(-4)}`);
  const [newCustId, setNewCustId] = useState(data.customers[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDelivery, setNewDelivery] = useState(0);
  const [newDiscountAmount, setNewDiscountAmount] = useState(0);
  const [newLines, setNewLines] = useState<Array<Omit<InvoiceLineItem, 'id'>>>([
    {
      itemId: data.inventoryItems[0]?.id,
      accountId: 'acc-sales',
      description: data.inventoryItems[0]?.name || 'Item',
      qty: 1,
      unitPrice: data.inventoryItems[0]?.salePrice || 450,
      discountPercent: 0
    }
  ]);

  const handleAddLine = () => {
    const firstItem = data.inventoryItems[0];
    setNewLines([
      ...newLines,
      {
        itemId: firstItem?.id,
        accountId: 'acc-sales',
        description: firstItem?.name || 'Item',
        qty: 1,
        unitPrice: firstItem?.salePrice || 450,
        discountPercent: 0
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
      unitPrice: item.salePrice
    };
    setNewLines(updated);
  };

  const handleLineChange = (idx: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...newLines];
    updated[idx] = { ...updated[idx], [field]: value };
    setNewLines(updated);
  };

  const calculateFormTotal = () => {
    const sub = newLines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0) * (1 - (Number(l.discountPercent) || 0) / 100), 0);
    return Math.max(0, sub - Number(newDiscountAmount || 0) + Number(newDelivery || 0));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLines.length === 0) {
      alert("Please add at least one line item.");
      return;
    }
    const customer = data.customers.find(c => c.id === newCustId);

    const generatedLines: InvoiceLineItem[] = newLines.map((l, i) => ({
      ...l,
      id: `line-${Date.now()}-${i}`
    }));

    addSalesInvoice({
      reference: newRef.trim() || `INV-${Date.now().toString().slice(-4)}`,
      date: newDate,
      dueDate: newDueDate,
      customerId: newCustId,
      description: `Sales invoice for ${customer?.name}`,
      billingAddress: customer?.billingAddress,
      deliveryCharges: Number(newDelivery) || 0,
      customerDiscountAmount: Number(newDiscountAmount) || 0,
      customerDiscountPercent: 0,
      taxInclusive: false,
      lines: generatedLines
    });

    setShowNewInvoiceModal(false);
  };

  // Quick Settle invoice
  const handleQuickSettle = (inv: SalesInvoice) => {
    const total = getInvoiceTotal(inv);
    const paid = getSalesInvoicePaidAmount(inv.id, data.receipts);
    const remaining = Math.max(0, total - paid);
    if (remaining <= 0) return;

    const customer = data.customers.find(c => c.id === inv.customerId);
    const defaultBank = data.bankAccounts[2] || data.bankAccounts[0]; // Meezan or Cash

    addReceipt({
      reference: `RCP-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      receivedInAccountId: defaultBank.id,
      payerType: 'Customer',
      customerId: inv.customerId,
      payerName: customer?.name || 'Customer',
      description: `Settlement for Invoice #${inv.reference}`,
      clearedStatus: 'Cleared',
      lines: [
        {
          id: `rl-${Date.now()}`,
          accountId: 'acc-ar',
          subAccountId: inv.customerId,
          invoiceId: inv.id,
          description: `Full settlement for Invoice #${inv.reference}`,
          qty: 1,
          unitPrice: remaining
        }
      ]
    });
  };

  const filteredInvoices = data.salesInvoices.filter(inv => {
    const customer = data.customers.find(c => c.id === inv.customerId);
    const matchesSearch =
      inv.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const total = getInvoiceTotal(inv);
    const paid = getSalesInvoicePaidAmount(inv.id, data.receipts);
    const isPaid = (total - paid) <= 0.01;

    if (statusFilter === 'paid') return matchesSearch && isPaid;
    if (statusFilter === 'unpaid') return matchesSearch && !isPaid;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Sales Invoices
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, track, print, and settle customer bills with instant inventory allocation and discount deductions.
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
              setNewRef(`INV-${(data.salesInvoices.length + 7315).toString()}`);
              setShowNewInvoiceModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-slate-500">Status:</span>
          <div className="flex p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              All ({data.salesInvoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'unpaid' ? 'bg-amber-950/80 text-amber-300 font-semibold border border-amber-800/50' : 'text-slate-400'
              }`}
            >
              Pending Balance
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'paid' ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/50' : 'text-slate-400'
              }`}
            >
              Paid in Full
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No sales invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const customer = data.customers.find(c => c.id === inv.customerId);
                  const total = getInvoiceTotal(inv);
                  const paid = getSalesInvoicePaidAmount(inv.id, data.receipts);
                  const balanceDue = Math.max(0, total - paid);
                  const isPaid = balanceDue <= 0.01;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        #{inv.reference}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{inv.date}</td>
                      <td className="py-3 px-4 font-medium text-slate-100 max-w-[180px] truncate">
                        {customer?.name || inv.customerId}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {inv.lines.length}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(total, data.currency.symbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400">
                        {paid > 0 ? formatCurrency(paid, data.currency.symbol) : "—"}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${balanceDue > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {balanceDue > 0 ? formatCurrency(balanceDue, data.currency.symbol) : "0.00"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                        ) : paid > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            <Clock className="w-3 h-3" /> Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            <Clock className="w-3 h-3" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            title="View & Print Invoice"
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4 text-emerald-400" />
                          </button>
                          {!isPaid && (
                            <button
                              onClick={() => handleQuickSettle(inv)}
                              title="Record full receipt settlement"
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Receipt className="w-4 h-4 text-blue-400" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete Invoice #${inv.reference}?`)) {
                                deleteSalesInvoice(inv.id);
                              }
                            }}
                            title="Delete Invoice"
                            className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  New Sales Invoice
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Bill products to customer with instant pricing and inventory updates.</p>
              </div>
              <button onClick={() => setShowNewInvoiceModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Reference *</label>
                  <input
                    type="text"
                    required
                    value={newRef}
                    onChange={e => setNewRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Customer *</label>
                  <select
                    value={newCustId}
                    onChange={e => setNewCustId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    {data.customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Line items table */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Line Items & Products</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Product Line
                  </button>
                </div>

                <div className="space-y-2">
                  {newLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <div className="col-span-4">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Product</label>
                        <select
                          value={line.itemId}
                          onChange={e => handleItemSelect(idx, e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                        >
                          {data.inventoryItems.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({formatCurrency(item.salePrice, data.currency.symbol)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Quantity</label>
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

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Unit Price</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={line.unitPrice}
                          onChange={e => handleLineChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Discount %</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          max="100"
                          value={line.discountPercent || 0}
                          onChange={e => handleLineChange(idx, 'discountPercent', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-1 text-right font-mono font-semibold text-slate-200">
                        {formatCurrency(
                          (Number(line.qty) || 0) * (Number(line.unitPrice) || 0) * (1 - (Number(line.discountPercent) || 0) / 100),
                          data.currency.symbol,
                          0
                        )}
                      </div>

                      <div className="col-span-1 text-right">
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

              {/* Adjustments: discount & delivery charges */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Customer Discount (Amount PKR)</label>
                  <input
                    type="number"
                    step="any"
                    value={newDiscountAmount}
                    onChange={e => setNewDiscountAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Delivery Charges (PKR)</label>
                  <input
                    type="number"
                    step="any"
                    value={newDelivery}
                    onChange={e => setNewDelivery(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Total Banner */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-300">Total Invoice Amount:</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {formatCurrency(calculateFormTotal(), data.currency.symbol)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Save & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Print & Preview Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* Universal Import / Export Modal */}
      <DataImportExportModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        entityKey="salesInvoices"
        entityTitle="Sales Invoices"
        columns={salesInvoiceColumns}
        dataList={data.salesInvoices}
        matchKey="reference"
      />
    </div>
  );
};
