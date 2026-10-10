import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  X,
  FileSpreadsheet,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { BankAccount, Transfer } from '../../types/accounting';
import { formatCurrency, getBankAccountBalance } from '../../utils/accountingMath';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const bankColumns: ColumnDef[] = [
  { key: 'code', header: 'Account Code', sample: 'BNK-104' },
  { key: 'name', header: 'Account Name', sample: 'Habib Bank Limited' },
  { key: 'institution', header: 'Institution', sample: 'HBL Islamic' },
  { key: 'accountNumber', header: 'Account / IBAN Number', sample: 'PK12HABB000...' },
  { key: 'startingBalance', header: 'Starting Balance', sample: '50000' }
];

export const BankAccountsView: React.FC = () => {
  const { data, addBankAccount, updateBankAccount, addTransfer } = useAccounting();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(data.bankAccounts[0]?.id || null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // Form states
  const [newAccName, setNewAccName] = useState('');
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccInst, setNewAccInst] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccStarting, setNewAccStarting] = useState(0);

  // Transfer form
  const [transferFrom, setTransferFrom] = useState(data.bankAccounts[0]?.id || '');
  const [transferTo, setTransferTo] = useState(data.bankAccounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(1000);
  const [transferDesc, setTransferDesc] = useState('Cash deposit to bank account');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedAccount = data.bankAccounts.find(b => b.id === selectedAccountId) || data.bankAccounts[0];

  // Calculate detailed statement for selected account
  const accountTransactions = React.useMemo(() => {
    if (!selectedAccount) return [];

    interface LedgerEntry {
      id: string;
      date: string;
      type: 'Receipt' | 'Payment' | 'Transfer In' | 'Transfer Out';
      reference: string;
      party: string;
      description: string;
      inflow: number;
      outflow: number;
    }

    const entries: LedgerEntry[] = [];

    // Receipts
    data.receipts.forEach(r => {
      if (r.receivedInAccountId === selectedAccount.id) {
        const amount = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        entries.push({
          id: r.id,
          date: r.date,
          type: 'Receipt',
          reference: r.reference,
          party: r.payerName,
          description: r.description || `Receipt from ${r.payerName}`,
          inflow: amount,
          outflow: 0
        });
      }
    });

    // Payments
    data.payments.forEach(p => {
      if (p.paidFromAccountId === selectedAccount.id) {
        const amount = p.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        entries.push({
          id: p.id,
          date: p.date,
          type: 'Payment',
          reference: p.reference,
          party: p.payeeName || p.supplierId || "Expense Payee",
          description: p.description || p.lines.map(l => l.description).filter(Boolean).join(', ') || 'Payment',
          inflow: 0,
          outflow: amount
        });
      }
    });

    // Transfers
    data.transfers.forEach(t => {
      if (t.toAccountId === selectedAccount.id) {
        entries.push({
          id: t.id,
          date: t.date,
          type: 'Transfer In',
          reference: t.reference || 'TRF',
          party: 'Internal Transfer',
          description: t.description || `Transfer received from ${data.bankAccounts.find(b => b.id === t.fromAccountId)?.name}`,
          inflow: Number(t.amount) || 0,
          outflow: 0
        });
      }
      if (t.fromAccountId === selectedAccount.id) {
        entries.push({
          id: t.id,
          date: t.date,
          type: 'Transfer Out',
          reference: t.reference || 'TRF',
          party: 'Internal Transfer',
          description: t.description || `Transfer sent to ${data.bankAccounts.find(b => b.id === t.toAccountId)?.name}`,
          inflow: 0,
          outflow: Number(t.amount) || 0
        });
      }
    });

    // Sort by date ascending to compute running balance
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = Number(selectedAccount.startingBalance) || 0;
    return entries.map(entry => {
      running = running + entry.inflow - entry.outflow;
      return {
        ...entry,
        runningBalance: running
      };
    });
  }, [selectedAccount, data.receipts, data.payments, data.transfers, data.bankAccounts]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    addBankAccount({
      name: newAccName.trim(),
      code: newAccCode.trim() || `BNK-${data.bankAccounts.length + 101}`,
      institution: newAccInst.trim(),
      accountNumber: newAccNumber.trim(),
      startingBalance: Number(newAccStarting) || 0
    });
    setNewAccName('');
    setNewAccCode('');
    setNewAccInst('');
    setNewAccNumber('');
    setNewAccStarting(0);
    setShowAddAccountModal(false);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      alert("Source and destination accounts must be different.");
      return;
    }
    if (transferAmount <= 0) {
      alert("Transfer amount must be greater than zero.");
      return;
    }
    addTransfer({
      reference: `TRF-${Date.now().toString().slice(-4)}`,
      date: transferDate,
      fromAccountId: transferFrom,
      toAccountId: transferTo,
      amount: transferAmount,
      description: transferDesc,
      clearedStatus: 'Cleared'
    });
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Bank and Cash Accounts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage physical cash registers, vaulted reserves, and commercial bank accounts with real-time running statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowDataModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import / Export</span>
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            Transfer Funds
          </button>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.bankAccounts.map(account => {
          const balance = getBankAccountBalance(account, data.receipts, data.payments, data.transfers);
          const isSelected = selectedAccount?.id === account.id;
          const isNegative = balance < 0;

          return (
            <div
              key={account.id}
              onClick={() => setSelectedAccountId(account.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{account.code}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{account.name}</h3>
                  <p className="text-xs text-slate-400">{account.institution || "Internal Cash"}</p>
                </div>
                <div className={`p-2 rounded-lg ${isNegative ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Current Balance:</span>
                <span className={`text-lg font-mono font-bold ${isNegative ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrency(balance, data.currency.symbol)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Statement / Ledger Table */}
      {selectedAccount && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Statement Register: {selectedAccount.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Starting Balance: <span className="font-mono text-slate-300 font-semibold">{formatCurrency(selectedAccount.startingBalance, data.currency.symbol)}</span>
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              {accountTransactions.length} transaction entries found
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Ref #</th>
                  <th className="pb-2.5">Party / Payee</th>
                  <th className="pb-2.5">Description</th>
                  <th className="pb-2.5 text-right text-emerald-400">Inflow (+)</th>
                  <th className="pb-2.5 text-right text-rose-400">Outflow (-)</th>
                  <th className="pb-2.5 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Starting balance row */}
                <tr className="bg-slate-950/40 text-slate-400 font-medium">
                  <td className="py-2.5 font-mono">Opening</td>
                  <td className="py-2.5">—</td>
                  <td className="py-2.5 font-mono">INIT</td>
                  <td className="py-2.5">Opening Register Balance</td>
                  <td className="py-2.5">Initial balance recorded in backup</td>
                  <td className="py-2.5 text-right font-mono">—</td>
                  <td className="py-2.5 text-right font-mono">—</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-slate-200">
                    {formatCurrency(selectedAccount.startingBalance, data.currency.symbol)}
                  </td>
                </tr>

                {accountTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-slate-400">{t.date}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        t.inflow > 0
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {t.inflow > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300 font-semibold">{t.reference}</td>
                    <td className="py-2.5 font-medium text-slate-200 truncate max-w-[150px]">{t.party}</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[200px]">{t.description}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                      {t.inflow > 0 ? formatCurrency(t.inflow, data.currency.symbol) : "—"}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-rose-400">
                      {t.outflow > 0 ? formatCurrency(t.outflow, data.currency.symbol) : "—"}
                    </td>
                    <td className={`py-2.5 text-right font-mono font-bold ${t.runningBalance < 0 ? 'text-red-400' : 'text-slate-100'}`}>
                      {formatCurrency(t.runningBalance, data.currency.symbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Bank / Cash Account</h3>
              <button onClick={() => setShowAddAccountModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank Alfalah Islamic"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BNK-104"
                    value={newAccCode}
                    onChange={e => setNewAccCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Alfalah"
                    value={newAccInst}
                    onChange={e => setNewAccInst(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">IBAN / Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. PK00ALFH..."
                  value={newAccNumber}
                  onChange={e => setNewAccNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Opening Starting Balance (PKR)</label>
                <input
                  type="number"
                  step="any"
                  value={newAccStarting}
                  onChange={e => setNewAccStarting(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                Inter-Account Fund Transfer
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">From Account *</label>
                  <select
                    value={transferFrom}
                    onChange={e => setTransferFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    {data.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">To Account *</label>
                  <select
                    value={transferTo}
                    onChange={e => setTransferTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    {data.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Transfer Date</label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={e => setTransferDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={transferAmount}
                    onChange={e => setTransferAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description / Memo</label>
                <input
                  type="text"
                  value={transferDesc}
                  onChange={e => setTransferDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                >
                  Complete Transfer
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
        entityKey="bankAccounts"
        entityTitle="Bank & Cash Accounts"
        columns={bankColumns}
        dataList={data.bankAccounts}
        matchKey="code"
      />
    </div>
  );
};
