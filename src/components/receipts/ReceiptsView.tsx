import React, { useState } from 'react';
import {
  ArrowDownLeft,
  Plus,
  Search,
  Wallet,
  Trash2,
  X,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { Receipt, TransactionLine } from '../../types/accounting';
import { formatCurrency, getInvoiceTotal } from '../../utils/accountingMath';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const receiptColumns: ColumnDef[] = [
  { key: 'reference', header: 'Receipt #', sample: 'RCP-2026-0022' },
  { key: 'date', header: 'Date', sample: '2026-10-08' },
  { key: 'customer', header: 'Customer', sample: 'Batool Ezzi' },
  { key: 'amount', header: 'Amount', sample: '1000' },
  { key: 'description', header: 'Description', sample: 'Payment settlement' }
];

export const ReceiptsView: React.FC = () => {
  const { data, addReceipt, deleteReceipt } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // New Receipt form state
  const [newRef, setNewRef] = useState(`RCP-2026-${(data.receipts.length + 22).toString().padStart(4, '0')}`);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBankId, setNewBankId] = useState(data.bankAccounts[2]?.id || data.bankAccounts[0]?.id || '');
  const [newCustId, setNewCustId] = useState(data.customers[0]?.id || '');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState<number>(1000);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');

  const handleCustomerChange = (customerId: string) => {
    setNewCustId(customerId);
    const customer = data.customers.find(c => c.id === customerId);
    if (customer) {
      // Find open invoices for this customer
      const customerInvoices = data.salesInvoices.filter(i => i.customerId === customerId);
      if (customerInvoices.length > 0) {
        setSelectedInvoiceId(customerInvoices[0].id);
        const invTotal = getInvoiceTotal(customerInvoices[0]);
        setNewAmount(invTotal);
        setNewDesc(`Payment settlement for Invoice #${customerInvoices[0].reference}`);
      } else {
        setSelectedInvoiceId('');
        setNewDesc(`Customer payment — ${customer.name}`);
      }
    }
  };

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    const customer = data.customers.find(c => c.id === newCustId);
    const lines: TransactionLine[] = [
      {
        id: `rl-${Date.now()}`,
        accountId: 'acc-ar',
        subAccountId: newCustId,
        invoiceId: selectedInvoiceId || undefined,
        description: newDesc || `Receipt from ${customer?.name}`,
        qty: 1,
        unitPrice: Number(newAmount) || 0
      }
    ];

    addReceipt({
      reference: newRef.trim() || `RCP-2026-${Date.now().toString().slice(-4)}`,
      date: newDate,
      receivedInAccountId: newBankId,
      payerType: 'Customer',
      customerId: newCustId,
      payerName: customer?.name || 'Customer',
      description: newDesc || `Receipt settlement`,
      clearedStatus: 'Cleared',
      lines
    });

    setShowAddModal(false);
  };

  const filteredReceipts = data.receipts.filter(r => {
    const bank = data.bankAccounts.find(b => b.id === r.receivedInAccountId);
    return (
      r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bank?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            Receipts (Money Received)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record customer settlements, bank deposits, and cash inflow into your liquid registers.
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
              setNewRef(`RCP-2026-${(data.receipts.length + 22).toString().padStart(4, '0')}`);
              if (data.customers.length > 0) handleCustomerChange(data.customers[0].id);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Receipt
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by receipt #, payer, or description..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
        />
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Received In (Bank/Cash)</th>
                <th className="py-3 px-4">Payer / Customer</th>
                <th className="py-3 px-4">Description / Settlement</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReceipts.map(receipt => {
                const bank = data.bankAccounts.find(b => b.id === receipt.receivedInAccountId);
                const amount = receipt.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);

                return (
                  <tr key={receipt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{receipt.reference}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{receipt.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-slate-500" />
                        {bank?.name || "Account"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-[160px] truncate">
                      {receipt.payerName}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[220px] truncate">
                      {receipt.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(amount, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {receipt.clearedStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete Receipt ${receipt.reference}?`)) {
                            deleteReceipt(receipt.id);
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

      {/* Record Receipt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                Record Customer Receipt
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Receipt Reference *</label>
                  <input
                    type="text"
                    required
                    value={newRef}
                    onChange={e => setNewRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Receipt Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Received Into Bank Account *</label>
                <select
                  value={newBankId}
                  onChange={e => setNewBankId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                >
                  {data.bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Received From Customer *</label>
                <select
                  value={newCustId}
                  onChange={e => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                >
                  {data.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              {/* Invoice link (if available) */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Settles Against Invoice (Optional)</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = data.salesInvoices.find(i => i.id === e.target.value);
                    if (inv) {
                      setNewAmount(getInvoiceTotal(inv));
                      setNewDesc(`Invoice #${inv.reference} settlement`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="">General Payment on Account / Opening Balance</option>
                  {data.salesInvoices
                    .filter(i => i.customerId === newCustId)
                    .map(inv => (
                      <option key={inv.id} value={inv.id}>
                        Invoice #{inv.reference} ({inv.date}) — Total: {formatCurrency(getInvoiceTotal(inv), data.currency.symbol)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Receipt Amount (PKR) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  value={newAmount}
                  onChange={e => setNewAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm font-bold focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Memo / Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="e.g. Full invoice settlement via Online Transfer"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Record Receipt
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
        entityKey="receipts"
        entityTitle="Receipts"
        columns={receiptColumns}
        dataList={data.receipts}
        matchKey="reference"
      />
    </div>
  );
};
