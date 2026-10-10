import React from 'react';
import {
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ShoppingBag,
  UserPlus,
  Truck,
  PackagePlus,
  X
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { AppTabId } from '../../types/accounting';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickEntryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setActiveTab } = useAccounting();

  if (!isOpen) return null;

  const quickActions: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    tab: AppTabId;
    color: string;
  }> = [
    {
      title: 'New Sales Invoice',
      description: 'Bill customer for Samosas, Kababs, or Rolls',
      icon: FileText,
      tab: 'sales-invoices',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Record Customer Receipt',
      description: 'Receive customer money into Bank or Cash in Hand',
      icon: ArrowDownLeft,
      tab: 'receipts',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Record Expense Payment',
      description: 'Pay delivery rider, mobile recharge, food supplies',
      icon: ArrowUpRight,
      tab: 'payments',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
      title: 'New Purchase Bill',
      description: 'Record incoming supplier stock invoice',
      icon: ShoppingBag,
      tab: 'purchase-invoices',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Transfer Bank Funds',
      description: 'Shift money between Cash Drawer and Meezan Bank',
      icon: ArrowLeftRight,
      tab: 'bank-accounts',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Add New Inventory SKU',
      description: 'Register a new frozen food item with cost and price',
      icon: PackagePlus,
      tab: 'inventory-items',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Add Customer Account',
      description: 'Add customer contact and starting balance',
      icon: UserPlus,
      tab: 'customers',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Add Wholesale Supplier',
      description: 'Register meat, poultry, or packaging vendor',
      icon: Truck,
      tab: 'suppliers',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Create New Transaction</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select the entry type to jump directly to its creation form.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(action.tab);
                  onClose();
                }}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className={`p-2 rounded-lg border shrink-0 ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
