import React, { useState } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SummaryView } from './components/summary/SummaryView';
import { BankAccountsView } from './components/banking/BankAccountsView';
import { ReceiptsView } from './components/receipts/ReceiptsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { CustomersView } from './components/customers/CustomersView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { SalesInvoicesView } from './components/invoices/SalesInvoicesView';
import { PurchaseInvoicesView } from './components/purchases/PurchaseInvoicesView';
import { InventoryView } from './components/inventory/InventoryView';
import { ChartOfAccountsView } from './components/accounting/ChartOfAccountsView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { QuickEntryModal } from './components/modals/QuickEntryModal';
import { ImportBackupModal } from './components/modals/ImportBackupModal';
import { AddBusinessModal } from './components/modals/AddBusinessModal';

const AppContent: React.FC = () => {
  const { activeTab } = useAccounting();

  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <Navbar
        onOpenQuickModal={() => setIsQuickOpen(true)}
        onOpenImportModal={() => setIsImportOpen(true)}
        onOpenAddBusiness={() => setIsAddBusinessOpen(true)}
      />

      {/* Main Body with Sidebar + Viewport */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenAddBusiness={() => setIsAddBusinessOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'summary' && <SummaryView />}
            {(activeTab === 'bank-accounts' || activeTab === 'transfers') && <BankAccountsView />}
            {activeTab === 'receipts' && <ReceiptsView />}
            {activeTab === 'payments' && <PaymentsView />}
            {activeTab === 'customers' && <CustomersView />}
            {activeTab === 'sales-invoices' && <SalesInvoicesView />}
            {activeTab === 'suppliers' && <SuppliersView />}
            {activeTab === 'purchase-invoices' && <PurchaseInvoicesView />}
            {activeTab === 'inventory-items' && <InventoryView />}
            {activeTab === 'chart-of-accounts' && <ChartOfAccountsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'audit-trail' && <AuditTrailView />}
            {activeTab === 'users' && <UsersView />}
            {activeTab === 'settings' && (
              <SettingsView
                onOpenImportModal={() => setIsImportOpen(true)}
                onOpenAddBusiness={() => setIsAddBusinessOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Quick Modals */}
      <QuickEntryModal isOpen={isQuickOpen} onClose={() => setIsQuickOpen(false)} />
      <ImportBackupModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <AddBusinessModal isOpen={isAddBusinessOpen} onClose={() => setIsAddBusinessOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <AppContent />
    </AccountingProvider>
  );
}
