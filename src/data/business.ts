import { BusinessDetails, CurrencyConfig, SummarySettings, UserItem, UserSession } from '../types/accounting';

export const initialCurrency: CurrencyConfig = {
  code: "PKR",
  symbol: "Rs",
  name: "Pakistani Rupee"
};

export const initialBusinessDetails: BusinessDetails = {
  id: "biz-imp-1791266968035",
  name: "MBF",
  legalName: "MBF",
  sector: "Frozen Food",
  email: "accounts@company.io",
  phone: "+92 331 2257772",
  taxId: "EIN 84-2910482",
  address: "Karachi, Pakistan",
  footerNote: "Thank you for choosing MBF Frozen Foods! Quality & Hygiene Guaranteed.",
  logoUrl: ""
} as unknown as BusinessDetails;

export const initialSummarySettings: SummarySettings = {
  balanceSheetDate: "2026-12-31",
  accountingMethod: "Accrual",
  showZeroBalances: false,
  periodEnd: "2026-12-31",
  periodStart: "2026-01-01"
};

export const initialUsers: UserItem[] = [
  {
    status: "Active",
    id: "usr-admin-1",
    email: "juzerzoebmarvi@gmail.com",
    rolePreset: "Administrator",
    assignedBusinessIds: ["*"],
    name: "Administrator",
    permissions: {
      canCreate: true,
      canDelete: true,
      canEdit: true,
      canManageUsers: true,
      canImportExport: true
    },
    allowedTabs: [
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
    createdAt: "2026-01-01"
  },
  {
    id: "usr-sales-2",
    name: "Rashida Juzer",
    email: "rashida.juzer.80@gmail.com",
    rolePreset: "Custom Role",
    allowedTabs: [
      "summary",
      "customers",
      "sales-invoices",
      "inventory-items",
      "receipts"
    ],
    assignedBusinessIds: ["biz-imp-1791266968035"],
    permissions: {
      canImportExport: false,
      canCreate: true,
      canDelete: false,
      canManageUsers: false,
      canEdit: true
    },
    status: "Active",
    createdAt: "2026-01-05"
  }
];

export const initialActiveSessions: UserSession[] = [
  {
    sessionId: "sess-muy4oli7-cvoui",
    userId: "usr-admin-1",
    userName: "Administrator",
    userEmail: "juzerzoebmarvi@gmail.com",
    rolePreset: "Administrator",
    deviceLabel: "Chrome · Desktop (CCNA)",
    activeBusinessId: "biz-imp-1791266968035",
    activeTab: "suppliers",
    lastActiveAt: "2026-10-07T13:17:02.309Z"
  },
  {
    sessionId: "sess-muxvjqp0-ayvsh",
    userId: "usr-sales-2",
    userName: "Rashida Juzer",
    userEmail: "rashida.juzer.80@gmail.com",
    rolePreset: "Custom Role",
    deviceLabel: "Chrome · Desktop (WU31)",
    activeBusinessId: "biz-imp-1791266968035",
    activeTab: "sales-invoices",
    lastActiveAt: "2026-10-07T13:04:21.228Z"
  }
];
