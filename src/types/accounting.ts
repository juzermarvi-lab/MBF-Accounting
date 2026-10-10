export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface BusinessDetails {
  id?: string;
  legalName: string;
  name: string;
  sector?: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  logoUrl?: string;
  footerNote?: string;
}

export interface NewBusinessInput {
  name: string;
  legalName?: string;
  sector?: string;
  currency: CurrencyConfig;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  footerNote?: string;
  templateType?: 'clean' | 'clone_current';
  initialBankName?: string;
  initialBankBalance?: number;
}

export interface SummarySettings {
  balanceSheetDate: string;
  accountingMethod: 'Accrual' | 'Cash';
  showZeroBalances: boolean;
  periodStart: string;
  periodEnd: string;
}

export interface ChartOfAccountItem {
  id: string;
  code: string;
  name: string;
  category: 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';
  group: string;
  isSystem?: boolean;
  startingBalance?: number;
}

export interface TaxCode {
  id: string;
  name: string;
  rate: number;
  description: string;
}

export interface BankAccount {
  id: string;
  code: string;
  name: string;
  institution: string;
  accountNumber: string;
  startingBalance: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  billingAddress: string;
  creditLimit: number;
  startingBalance: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  email: string;
  address: string;
  creditLimit: number;
  startingBalance: number;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  division?: string;
  unitName: string;
  purchasePrice: number;
  salePrice: number;
  startingQty: number;
  startingUnitCost: number;
  taxCodeId?: string;
}

export interface InvoiceLineItem {
  id: string;
  itemId?: string;
  accountId: string;
  subAccountId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  discountPercent?: number;
  taxCodeId?: string;
}

export interface SalesInvoice {
  id: string;
  reference: string;
  date: string;
  dueDate: string;
  customerId: string;
  description?: string;
  billingAddress?: string;
  taxInclusive?: boolean;
  deliveryCharges?: number;
  customerDiscountPercent?: number;
  customerDiscountAmount?: number;
  lines: InvoiceLineItem[];
}

export interface PurchaseInvoice {
  id: string;
  reference: string;
  date: string;
  dueDate: string;
  supplierId: string;
  description?: string;
  taxInclusive?: boolean;
  deliveryCharges?: number;
  supplierDiscountPercent?: number;
  supplierDiscountAmount?: number;
  lines: InvoiceLineItem[];
}

export interface TransactionLine {
  id: string;
  accountId: string;
  subAccountId?: string;
  invoiceId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxCodeId?: string;
  discountPercent?: number;
}

export interface Receipt {
  id: string;
  reference: string;
  date: string;
  receivedInAccountId: string;
  payerType: 'Customer' | 'Other';
  customerId?: string;
  payerName: string;
  description: string;
  clearedStatus: 'Cleared' | 'Pending';
  taxInclusive?: boolean;
  lines: TransactionLine[];
}

export interface Payment {
  id: string;
  reference: string;
  date: string;
  paidFromAccountId: string;
  payeeType: 'Supplier' | 'Other';
  supplierId?: string;
  payeeName: string;
  payerName?: string;
  description: string;
  clearedStatus: 'Cleared' | 'Pending';
  taxInclusive?: boolean;
  lines: TransactionLine[];
}

export interface Transfer {
  id: string;
  reference: string;
  date: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  clearedStatus: 'Cleared' | 'Pending';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: 'Create' | 'Update' | 'Delete';
  entityType: string;
  reference: string;
  summary: string;
}

export interface UserPermission {
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canManageUsers: boolean;
  canImportExport: boolean;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  rolePreset: 'Administrator' | 'Custom Role' | 'Viewer';
  status: 'Active' | 'Inactive';
  assignedBusinessIds: string[];
  permissions: UserPermission;
  allowedTabs: string[];
  createdAt: string;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rolePreset: string;
  deviceLabel: string;
  activeBusinessId: string;
  activeTab: string;
  lastActiveAt: string;
}

export interface BackupData {
  id: string;
  name: string;
  sector?: string;
  currency: CurrencyConfig;
  businessDetails: BusinessDetails;
  summarySettings: SummarySettings;
  enabledTabs: string[];
  chartOfAccounts: ChartOfAccountItem[];
  taxCodes: TaxCode[];
  bankAccounts: BankAccount[];
  receipts: Receipt[];
  payments: Payment[];
  transfers: Transfer[];
  customers: Customer[];
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  inventoryKits?: any[];
  salesQuotes?: any[];
  salesOrders?: any[];
  salesInvoices: SalesInvoice[];
  creditNotes?: any[];
  purchaseInvoices: PurchaseInvoice[];
  debitNotes?: any[];
  employees?: any[];
  payslips?: any[];
  fixedAssets?: any[];
  journalEntries?: any[];
  auditHistory: AuditLogItem[];
  users: UserItem[];
  activeSessions: UserSession[];
}

export type AppTabId =
  | 'summary'
  | 'bank-accounts'
  | 'receipts'
  | 'payments'
  | 'transfers'
  | 'customers'
  | 'sales-invoices'
  | 'suppliers'
  | 'purchase-invoices'
  | 'inventory-items'
  | 'chart-of-accounts'
  | 'reports'
  | 'audit-trail'
  | 'users'
  | 'settings';
