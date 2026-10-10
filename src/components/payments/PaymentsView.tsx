import React, { useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  Wallet,
  Trash2,
  X,
  CreditCard,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { Payment, TransactionLine } from '../../types/accounting';
import { formatCurrency, getInvoiceTotal } from '../../utils/accountingMath';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const paymentColumns: ColumnDef[] = [
  { key: 'reference', header: 'Payment #', sample: 'PMT-2026-007' },
  { key: 'date', header: 'Date', sample: '2026-10-08' },
  { key: 'payeeName', header: 'Payee / Supplier', sample: 'Hussain Bhai' },
  { key: 'amount', header: 'Amount', sample: '5000' },
  { key: 'description', header: 'Description', sample: 'Supplier payment settlement' }
];

export const PaymentsView: React.FC = () => {
  const { data, addPayment, deletePayment } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // New Payment Form
  const [newRef, setNewRef] = useState(`PMT-2026-${(data.payments.length + 7).toString().padStart(3, '0')}`);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBankId, setNewBankId] = useState(data.bankAccounts[2]?.id || data.bankAccounts[0]?.id || '');
  const [payeeType, setPayeeType] = useState<'Supplier' | 'Other'>('Supplier');
  const [newSupplierId, setNewSupplierId] = useState(data.suppliers[0]?.id || '');
  const [newExpenseAccId, setNewExpenseAccId] = useState('acc-custom-1790935000129'); // Delivery Expenses default
  const [newPayeeName, setNewPayeeName] = useState(data.suppliers[0]?.name || '');
  const [newAmount, setNewAmount] = useState<number>(5000);
  const [newDesc, setNewDesc] = useState('Supplier payment settlement');

  // Expense accounts for quick selection
  const expenseAccounts = data.chartOfAccounts.filter(a => a.category === 'Expenses');

  const handleSupplierChange = (supId: string) => {
    setNewSupplierId(supId);
    const sup = data.suppliers.find(s => s.id === supId);
    if (sup) {
      setNewPayeeName(sup.name);
      setNewDesc(`Payment settlement — ${sup.name}`);
    }
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }

    const lines: TransactionLine[] = [
      {
        id: `pl-${Date.now()}`,
        accountId: payeeType === 'Supplier' ? 'acc-ap' : newExpenseAccId,
        subAccountId: payeeType === 'Supplier' ? newSupplierId : undefined,
        description: newDesc,
        qty: 1,
        unitPrice: Number(newAmount) || 0
      }
    ];

    addPayment({
      reference: newRef.trim() || `PMT-2026-${Date.now().toString().slice(-4)}`,
      date: newDate,
      paidFromAccountId: newBankId,
      payeeType,
      supplierId: payeeType === 'Supplier' ? newSupplierId : undefined,
      payeeName: payeeType === 'Supplier' ? (data.suppliers.find(s => s.id === newSupplierId)?.name || 'Supplier') : newPayeeName,
      description: newDesc,
      clearedStatus: 'Cleared',
      lines
    });

    setShowAddModal(false);
  };

  const filteredPayments = data.payments.filter(p => {
    const bank = data.bankAccounts.find(b => b.id === p.paidFromAccountId);
    return (
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bank?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-rose-400" />
            Payments (Money Disbursed)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track disbursements to meat suppliers, rider delivery charges, mobile recharge, and operating expenses.
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
              setNewRef(`PMT-2026-${(data.payments.length + 7).toString().padStart(3, '0')}`);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by payment #, payee, or memo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-rose-500 focus:outline-hidden"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Paid From Account</th>
                <th className="py-3 px-4">Payee / Supplier</th>
                <th className="py-3 px-4">Account / Purpose</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.map(payment => {
                const bank = data.bankAccounts.find(b => b.id === payment.paidFromAccountId);
                const amount = payment.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
                const targetAccount = data.chartOfAccounts.find(a => a.id === payment.lines[0]?.accountId);

                return (
                  <tr key={payment.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">{payment.reference}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{payment.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-slate-500" />
                        {bank?.name || "Account"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-[160px] truncate">
                      {payment.payeeName || payment.supplierId || "Payee"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">
                      {payment.description || targetAccount?.name || "Expense"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(amount, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                        {payment.clearedStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete Payment ${payment.reference}?`)) {
                            deletePayment(payment.id);
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

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                Record Money Disbursed
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Reference *</label>
                  <input
                    type="text"
                    required
                    value={newRef}
                    onChange={e => setNewRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Paid From Account *</label>
                <select
                  value={newBankId}
                  onChange={e => setNewBankId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
                >
                  {data.bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payee Category</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayeeType('Supplier');
                      handleSupplierChange(data.suppliers[0]?.id || '');
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-medium cursor-pointer ${
                      payeeType === 'Supplier'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Supplier (Accounts Payable)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayeeType('Other');
                      setNewPayeeName('Delivery Rider');
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-medium cursor-pointer ${
                      payeeType === 'Other'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Direct Expense Account
                  </button>
                </div>
              </div>

              {payeeType === 'Supplier' ? (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Supplier *</label>
                  <select
                    value={newSupplierId}
                    onChange={e => handleSupplierChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
                  >
                    {data.suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Delivery Rider Fuel"
                      value={newPayeeName}
                      onChange={e => setNewPayeeName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Expense Account</label>
                    <select
                      value={newExpenseAccId}
                      onChange={e => setNewExpenseAccId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
                    >
                      {expenseAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Disbursed Amount (PKR) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  value={newAmount}
                  onChange={e => setNewAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm font-bold focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description / Memo</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="e.g. Payment for beef supply batch"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
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
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                >
                  Record Payment
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
        entityKey="payments"
        entityTitle="Payments"
        columns={paymentColumns}
        dataList={data.payments}
        matchKey="reference"
      />
    </div>
  );
};
