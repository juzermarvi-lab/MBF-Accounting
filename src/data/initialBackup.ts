import { BackupData } from '../types/accounting';
import {
  initialBusinessDetails,
  initialCurrency,
  initialSummarySettings,
  initialUsers,
  initialActiveSessions
} from './business';
import {
  initialBankAccounts,
  initialChartOfAccounts,
  initialTaxCodes
} from './accounts';
import {
  initialCustomers,
  initialInventoryItems,
  initialSuppliers
} from './entities';
import {
  initialPayments,
  initialPurchaseInvoices,
  initialReceipts,
  initialSalesInvoices,
  initialTransfers
} from './transactions';
import { initialAuditHistory } from './audit';

export const defaultBackupData: BackupData = {
  id: "biz-imp-1791266968035",
  name: "MBF",
  sector: "Frozen Food",
  currency: initialCurrency,
  businessDetails: initialBusinessDetails,
  summarySettings: initialSummarySettings,
  enabledTabs: [
    "summary",
    "bank-accounts",
    "receipts",
    "payments",
    "transfers",
    "customers",
    "sales-invoices",
    "suppliers",
    "purchase-invoices",
    "inventory-items",
    "chart-of-accounts",
    "reports",
    "audit-trail",
    "users",
    "settings"
  ],
  chartOfAccounts: initialChartOfAccounts,
  taxCodes: initialTaxCodes,
  bankAccounts: initialBankAccounts,
  receipts: initialReceipts,
  payments: initialPayments,
  transfers: initialTransfers,
  customers: initialCustomers,
  suppliers: initialSuppliers,
  inventoryItems: initialInventoryItems,
  salesInvoices: initialSalesInvoices,
  purchaseInvoices: initialPurchaseInvoices,
  auditHistory: initialAuditHistory,
  users: initialUsers,
  activeSessions: initialActiveSessions
};
