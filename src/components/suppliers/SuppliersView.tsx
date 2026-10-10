import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  ShoppingBag,
  CreditCard,
  X,
  PlusCircle,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { Supplier } from '../../types/accounting';
import { formatCurrency, getInvoiceTotal, getSupplierBalance } from '../../utils/accountingMath';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const supplierColumns: ColumnDef[] = [
  { key: 'code', header: 'Supplier Code', sample: 'SUP-2004' },
  { key: 'name', header: 'Supplier Name', sample: 'Kashif Poultry' },
  { key: 'address', header: 'Market Address', sample: 'Lee Market Karachi' },
  { key: 'startingBalance', header: 'Starting Payable', sample: '0' },
  { key: 'creditLimit', header: 'Credit Limit', sample: '50000' },
  { key: 'email', header: 'Email', sample: 'kashif@poultry.com' }
];

export const SuppliersView: React.FC = () => {
  const { data, addSupplier, deleteSupplier, navigateToReport } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [creditLimit, setCreditLimit] = useState(50000);
  const [startingBalance, setStartingBalance] = useState(0);

  const selectedSupplier = data.suppliers.find(s => s.id === selectedSupplierId);

  // Compute ledger entries for selected supplier
  const supplierLedger = React.useMemo(() => {
    if (!selectedSupplier) return [];

    interface LedgerEntry {
      id: string;
      date: string;
      type: 'Purchase' | 'Payment';
      reference: string;
      description: string;
      debit: number;
      credit: number;
    }

    const entries: LedgerEntry[] = [];

    // Purchase Invoices (increases payable / credit to supplier)
    data.purchaseInvoices
      .filter(inv => inv.supplierId === selectedSupplier.id)
      .forEach(inv => {
        entries.push({
          id: inv.id,
          date: inv.date,
          type: 'Purchase',
          reference: inv.reference,
          description: inv.description || `Purchase Invoice with ${inv.lines.length} items`,
          debit: 0,
          credit: getInvoiceTotal(inv)
        });
      });

    // Payments (reduces payable / debit to supplier)
    data.payments
      .filter(p => p.supplierId === selectedSupplier.id || p.payeeName?.toLowerCase() === selectedSupplier.name.toLowerCase())
      .forEach(p => {
        const total = p.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        entries.push({
          id: p.id,
          date: p.date,
          type: 'Payment',
          reference: p.reference,
          description: p.description || `Payment made to supplier`,
          debit: total,
          credit: 0
        });
      });

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = Number(selectedSupplier.startingBalance) || 0;
    return entries.map(entry => {
      // For accounts payable: Credit increases liability, Debit reduces liability
      running = running + entry.credit - entry.debit;
      return {
        ...entry,
        runningBalance: running
      };
    });
  }, [selectedSupplier, data.purchaseInvoices, data.payments]);

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSupplier({
      name: name.trim(),
      code: code.trim() || `SUP-200${data.suppliers.length + 1}`,
      address: address.trim() || 'Karachi Wholesale Market',
      email: email.trim(),
      creditLimit: Number(creditLimit) || 50000,
      startingBalance: Number(startingBalance) || 0
    });

    setName('');
    setCode('');
    setAddress('');
    setEmail('');
    setCreditLimit(50000);
    setStartingBalance(0);
    setShowAddModal(false);
  };

  const filteredSuppliers = data.suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-400" />
            Suppliers & Accounts Payable
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage wholesale meat & poultry suppliers, purchase ledgers, payment tracking, and credit terms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigateToReport('supplier-transactions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Transaction Report</span>
          </button>

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
              setCode(`SUP-200${data.suppliers.length + 1}`);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search suppliers by name or code..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-rose-500 focus:outline-hidden"
        />
      </div>

      {/* Suppliers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Address / Market</th>
                <th className="py-3 px-4 text-right">Starting Balance</th>
                <th className="py-3 px-4 text-right">Payable Balance</th>
                <th className="py-3 px-4 text-center">Ledger Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSuppliers.map(supplier => {
                const balance = getSupplierBalance(supplier, data.purchaseInvoices, data.payments);
                const isPayable = balance > 0;

                return (
                  <tr
                    key={supplier.id}
                    onClick={() => setSelectedSupplierId(supplier.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{supplier.code}</td>
                    <td className="py-3 px-4 font-semibold text-white">{supplier.name}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">{supplier.address || "—"}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatCurrency(supplier.startingBalance, data.currency.symbol)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${isPayable ? 'text-rose-400' : 'text-slate-400'}`}>
                      {formatCurrency(balance, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSupplierId(supplier.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold cursor-pointer"
                      >
                        View Bills & Ledger
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Ledger / Statement Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{selectedSupplier.code}</span>
                  <h3 className="text-base font-bold text-white">{selectedSupplier.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedSupplier.address || "Karachi Wholesale Meat Market"}</p>
              </div>
              <button onClick={() => setSelectedSupplierId(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balances Card */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500">Opening Payable:</span>
                <p className="font-mono font-bold text-slate-300 mt-0.5">
                  {formatCurrency(selectedSupplier.startingBalance, data.currency.symbol)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Current Balance Owed:</span>
                <p className="font-mono font-bold text-rose-400 text-base mt-0.5">
                  {formatCurrency(getSupplierBalance(selectedSupplier, data.purchaseInvoices, data.payments), data.currency.symbol)}
                </p>
              </div>
            </div>

            {/* Statement Table */}
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Reference</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right text-rose-400">Purchased Bill (+)</th>
                    <th className="pb-2 text-right text-emerald-400">Payment Made (-)</th>
                    <th className="pb-2 text-right">Owed Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="bg-slate-950/40 text-slate-400 font-medium">
                    <td className="py-2.5 font-mono">Opening</td>
                    <td className="py-2.5">Opening</td>
                    <td className="py-2.5 font-mono">INIT</td>
                    <td className="py-2.5">Supplier opening payable balance</td>
                    <td className="py-2.5 text-right font-mono">—</td>
                    <td className="py-2.5 text-right font-mono">—</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-200">
                      {formatCurrency(selectedSupplier.startingBalance, data.currency.symbol)}
                    </td>
                  </tr>

                  {supplierLedger.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-slate-400">{entry.date}</td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          entry.type === 'Purchase' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-200 font-medium">{entry.reference}</td>
                      <td className="py-2.5 text-slate-400 truncate max-w-[200px]">{entry.description}</td>
                      <td className="py-2.5 text-right font-mono font-semibold text-rose-400">
                        {entry.credit > 0 ? formatCurrency(entry.credit, data.currency.symbol) : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                        {entry.debit > 0 ? formatCurrency(entry.debit, data.currency.symbol) : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-100">
                        {formatCurrency(entry.runningBalance, data.currency.symbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  navigateToReport('supplier-transactions', { supplierId: selectedSupplier.id });
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open in Supplier Transaction Report & Date Criteria →</span>
              </button>

              <button
                onClick={() => setSelectedSupplierId(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-rose-400" />
                Add New Supplier
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anees Bhai Meat Supplier"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opening Payable (PKR)</label>
                  <input
                    type="number"
                    step="any"
                    value={startingBalance}
                    onChange={e => setStartingBalance(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Market Address</label>
                <input
                  type="text"
                  placeholder="e.g. Saddar Wholesale Meat Market"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. supplier@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  Save Supplier
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
        entityKey="suppliers"
        entityTitle="Suppliers"
        columns={supplierColumns}
        dataList={data.suppliers}
        matchKey="code"
      />
    </div>
  );
};
