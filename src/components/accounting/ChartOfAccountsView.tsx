import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  FolderTree,
  X,
  Layers,
  Download,
  Upload
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { ChartOfAccountItem } from '../../types/accounting';
import { DataImportExportModal, ColumnDef } from '../modals/DataImportExportModal';

const coaColumns: ColumnDef[] = [
  { key: 'code', header: 'Account Code', sample: '4010' },
  { key: 'name', header: 'Account Name', sample: 'Delivery Expenses' },
  { key: 'category', header: 'Category', sample: 'Expenses' },
  { key: 'group', header: 'Group Classification', sample: 'Operating Expenses' },
  { key: 'startingBalance', header: 'Starting Balance', sample: '0' }
];

export const ChartOfAccountsView: React.FC = () => {
  const { data, addChartAccount } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ChartOfAccountItem['category']>('Expenses');
  const [group, setGroup] = useState('Operating Expenses');

  const categories: Array<ChartOfAccountItem['category'] | 'All'> = [
    'All',
    'Assets',
    'Liabilities',
    'Equity',
    'Income',
    'Expenses'
  ];

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addChartAccount({
      code: code.trim() || `${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      group: group.trim() || 'General',
      isSystem: false,
      startingBalance: 0
    });

    setCode('');
    setName('');
    setShowAddModal(false);
  };

  const filteredAccounts = data.chartOfAccounts.filter(acc => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.group.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || acc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Chart of Accounts (COA)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            General ledger classification structure supporting double-entry bookkeeping, custom expense tags, and hand loans.
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search account code, name, or group..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chart of Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subgroup</th>
                <th className="py-3 px-4 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccounts.map(account => {
                const categoryColors: Record<string, string> = {
                  Assets: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  Liabilities: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  Equity: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                  Income: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  Expenses: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                };

                return (
                  <tr key={account.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">{account.code}</td>
                    <td className="py-3 px-4 font-semibold text-white">{account.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${categoryColors[account.category] || ''}`}>
                        {account.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{account.group}</td>
                    <td className="py-3 px-4 text-center">
                      {account.isSystem ? (
                        <span className="text-[10px] text-slate-500 font-mono">System Account</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          Custom
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Add Chart of Accounts Ledger
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5006"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generator Fuel & Electricity"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Financial Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Expenses">Expenses</option>
                    <option value="Income">Income</option>
                    <option value="Assets">Assets</option>
                    <option value="Liabilities">Liabilities</option>
                    <option value="Equity">Equity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Group Classification</label>
                  <input
                    type="text"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    placeholder="Operating Expenses"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Save Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import / Export Modal */}
      <DataImportExportModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        entityKey="chartOfAccounts"
        entityTitle="Chart of Accounts"
        columns={coaColumns}
        dataList={data.chartOfAccounts}
        matchKey="code"
      />
    </div>
  );
};
