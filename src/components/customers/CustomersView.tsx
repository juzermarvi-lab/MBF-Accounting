import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Receipt,
  FileText,
  Phone,
  MapPin,
  X,
  CreditCard,
  UserCheck,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { Customer } from '../../types/accounting';
import { formatCurrency, getCustomerBalance, getInvoiceTotal } from '../../utils/accountingMath';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const customerColumns: ColumnDef[] = [
  { key: 'code', header: 'Customer Code', sample: 'CUST-1035' },
  { key: 'name', header: 'Customer Name', sample: 'Mariam Saifuddin' },
  { key: 'billingAddress', header: 'Billing Address', sample: 'Clifton Block 4' },
  { key: 'startingBalance', header: 'Starting Balance', sample: '0' },
  { key: 'creditLimit', header: 'Credit Limit', sample: '50000' },
  { key: 'email', header: 'Email', sample: 'customer@gmail.com' }
];

export const CustomersView: React.FC = () => {
  const { data, addCustomer, updateCustomer, deleteCustomer, setActiveTab, navigateToReport } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // New Customer Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [creditLimit, setCreditLimit] = useState(50000);
  const [startingBalance, setStartingBalance] = useState(0);

  const selectedCustomer = data.customers.find(c => c.id === selectedCustomerId);

  // Compute ledger entries for selected customer
  const customerLedger = React.useMemo(() => {
    if (!selectedCustomer) return [];

    interface LedgerEntry {
      id: string;
      date: string;
      type: 'Invoice' | 'Receipt';
      reference: string;
      description: string;
      debit: number;
      credit: number;
    }

    const entries: LedgerEntry[] = [];

    // Invoices
    data.salesInvoices
      .filter(inv => inv.customerId === selectedCustomer.id)
      .forEach(inv => {
        entries.push({
          id: inv.id,
          date: inv.date,
          type: 'Invoice',
          reference: `#${inv.reference}`,
          description: inv.description || `Sales Invoice with ${inv.lines.length} items`,
          debit: getInvoiceTotal(inv),
          credit: 0
        });
      });

    // Receipts
    data.receipts
      .filter(r => r.customerId === selectedCustomer.id || r.payerName?.toLowerCase() === selectedCustomer.name.toLowerCase())
      .forEach(r => {
        const total = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        entries.push({
          id: r.id,
          date: r.date,
          type: 'Receipt',
          reference: r.reference,
          description: r.description || `Payment receipt`,
          debit: 0,
          credit: total
        });
      });

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = Number(selectedCustomer.startingBalance) || 0;
    return entries.map(entry => {
      running = running + entry.debit - entry.credit;
      return {
        ...entry,
        runningBalance: running
      };
    });
  }, [selectedCustomer, data.salesInvoices, data.receipts]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const generatedCode = code.trim() || `CUST-100${data.customers.length + 1}`;
    addCustomer({
      name: name.trim(),
      code: generatedCode,
      billingAddress: address.trim() || 'Karachi, Pakistan',
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
    setShowAddCustomerModal(false);
  };

  const filteredCustomers = data.customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.billingAddress || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Customers & Receivables Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse 35+ verified customer accounts, verify credit limits, view historical ledgers, and track receivables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigateToReport('customer-transactions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
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
              setCode(`CUST-100${data.customers.length + 1}`);
              setShowAddCustomerModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by customer name, code, or area..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Billing Area</th>
                <th className="py-3 px-4 text-right">Starting Bal</th>
                <th className="py-3 px-4 text-right">Current Balance</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-center">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map(customer => {
                const balance = getCustomerBalance(customer, data.salesInvoices, data.receipts);
                const isDebit = balance > 0;

                return (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{customer.code}</td>
                    <td className="py-3 px-4 font-semibold text-white">{customer.name}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-[180px] truncate">{customer.billingAddress || "—"}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatCurrency(customer.startingBalance, data.currency.symbol)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${isDebit ? 'text-amber-400' : 'text-slate-400'}`}>
                      {formatCurrency(balance, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(customer.creditLimit, data.currency.symbol, 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerId(customer.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold cursor-pointer"
                      >
                        View Statement
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Statement / Ledger Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{selectedCustomer.code}</span>
                  <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCustomer.billingAddress || "Karachi, Pakistan"}</p>
              </div>
              <button onClick={() => setSelectedCustomerId(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Balance Header */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500">Opening Balance:</span>
                <p className="font-mono font-bold text-slate-300 mt-0.5">
                  {formatCurrency(selectedCustomer.startingBalance, data.currency.symbol)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Total Outstanding Due:</span>
                <p className="font-mono font-bold text-amber-400 mt-0.5">
                  {formatCurrency(getCustomerBalance(selectedCustomer, data.salesInvoices, data.receipts), data.currency.symbol)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Credit Limit:</span>
                <p className="font-mono text-slate-400 mt-0.5">
                  {formatCurrency(selectedCustomer.creditLimit, data.currency.symbol, 0)}
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
                    <th className="pb-2 text-right text-amber-400">Invoiced (+)</th>
                    <th className="pb-2 text-right text-emerald-400">Paid (-)</th>
                    <th className="pb-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="bg-slate-950/40 text-slate-400 font-medium">
                    <td className="py-2.5 font-mono">Opening</td>
                    <td className="py-2.5">Opening</td>
                    <td className="py-2.5 font-mono">INIT</td>
                    <td className="py-2.5">Initial customer opening balance</td>
                    <td className="py-2.5 text-right font-mono">—</td>
                    <td className="py-2.5 text-right font-mono">—</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-200">
                      {formatCurrency(selectedCustomer.startingBalance, data.currency.symbol)}
                    </td>
                  </tr>

                  {customerLedger.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-slate-400">{entry.date}</td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          entry.type === 'Invoice' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-200 font-medium">{entry.reference}</td>
                      <td className="py-2.5 text-slate-400 truncate max-w-[200px]">{entry.description}</td>
                      <td className="py-2.5 text-right font-mono font-semibold text-amber-400">
                        {entry.debit > 0 ? formatCurrency(entry.debit, data.currency.symbol) : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                        {entry.credit > 0 ? formatCurrency(entry.credit, data.currency.symbol) : "—"}
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
                  navigateToReport('customer-transactions', { customerId: selectedCustomer.id });
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open in Customer Transaction Report & Date Criteria →</span>
              </button>

              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Add New Customer
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zainab Clifton"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Customer Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Credit Limit (PKR)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Billing Address / Area</label>
                <input
                  type="text"
                  placeholder="e.g. DHA Phase 5, Karachi"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Opening Starting Balance (PKR)</label>
                <input
                  type="number"
                  step="any"
                  value={startingBalance}
                  onChange={e => setStartingBalance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Save Customer
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
        entityKey="customers"
        entityTitle="Customers"
        columns={customerColumns}
        dataList={data.customers}
        matchKey="code"
      />
    </div>
  );
};
