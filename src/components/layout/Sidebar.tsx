import {
  LayoutDashboard,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Users,
  FileText,
  Truck,
  ShoppingBag,
  Package,
  BookOpen,
  BarChart3,
  History,
  Settings,
  Shield,
  Plus,
  Building2
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { AppTabId } from '../../types/accounting';

interface Props {
  onOpenAddBusiness?: () => void;
}

export const Sidebar: React.FC<Props> = ({ onOpenAddBusiness }) => {
  const { data, activeTab, setActiveTab, currentUser } = useAccounting();

  // Helper count badges
  const invoiceCount = data.salesInvoices.length;
  const customerCount = data.customers.length;
  const itemCount = data.inventoryItems.length;
  const receiptCount = data.receipts.length;
  const paymentCount = data.payments.length;
  const supplierCount = data.suppliers.length;
  const purchaseCount = data.purchaseInvoices.length;

  const navSections: Array<{
    title: string;
    items: Array<{
      id: AppTabId;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
    }>;
  }> = [
    {
      title: 'FINANCIAL FLOWS',
      items: [
        { id: 'summary', label: 'Summary Overview', icon: LayoutDashboard },
        { id: 'bank-accounts', label: 'Bank & Cash', icon: Wallet, badge: data.bankAccounts.length },
        { id: 'receipts', label: 'Receipts (In)', icon: ArrowDownLeft, badge: receiptCount },
        { id: 'payments', label: 'Payments (Out)', icon: ArrowUpRight, badge: paymentCount },
        { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight }
      ]
    },
    {
      title: 'SALES & CUSTOMERS',
      items: [
        { id: 'customers', label: 'Customers', icon: Users, badge: customerCount },
        { id: 'sales-invoices', label: 'Sales Invoices', icon: FileText, badge: invoiceCount, badgeColor: 'bg-emerald-500/20 text-emerald-300' }
      ]
    },
    {
      title: 'PURCHASES & SUPPLIERS',
      items: [
        { id: 'suppliers', label: 'Suppliers', icon: Truck, badge: supplierCount },
        { id: 'purchase-invoices', label: 'Purchase Invoices', icon: ShoppingBag, badge: purchaseCount }
      ]
    },
    {
      title: 'PRODUCTS & STOCK',
      items: [
        { id: 'inventory-items', label: 'Inventory Items', icon: Package, badge: itemCount, badgeColor: 'bg-blue-500/20 text-blue-300' }
      ]
    },
    {
      title: 'ACCOUNTING & AUDIT',
      items: [
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: BookOpen },
        { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
        { id: 'audit-trail', label: 'Audit Trail', icon: History, badge: data.auditHistory.length }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'users', label: 'Users & Roles', icon: Shield },
        { id: 'settings', label: 'Settings & Backup', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/80 border-r border-slate-800 flex flex-col h-[calc(100vh-57px)] overflow-y-auto no-print">
      <div className="p-4 space-y-6">
        {navSections.map((section, sIdx) => {
          // Filter items based on user's allowedTabs if role isn't Administrator
          const filteredItems = section.items.filter(item => {
            if (currentUser.rolePreset === 'Administrator') return true;
            return currentUser.allowedTabs.includes(item.id);
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-500">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700/80'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-sm ${
                            item.badgeColor || 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pinned Bottom Business Badge & Multi-Company Shortcut */}
      <div className="mt-auto p-3.5 border-t border-slate-900 bg-slate-950 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate font-bold text-xs text-white">{data.name}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
            {data.currency?.code || 'PKR'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[120px] text-slate-500">{data.sector || 'Frozen Food'}</span>
          <span className="font-mono text-slate-400">{data.summarySettings?.accountingMethod || 'Accrual'}</span>
        </div>
        {onOpenAddBusiness && (
          <button
            type="button"
            onClick={onOpenAddBusiness}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-emerald-400 text-[11px] font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Business</span>
          </button>
        )}
      </div>
    </aside>
  );
};
