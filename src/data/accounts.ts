import { BankAccount, ChartOfAccountItem, TaxCode } from '../types/accounting';

export const initialBankAccounts: BankAccount[] = [
  {
    institution: "Cash Drawer",
    accountNumber: "CASH-PKR",
    name: "Cash In Hand",
    startingBalance: -12900,
    code: "BNK-101",
    id: "bank-1790928412719"
  },
  {
    name: "Reserved Amount",
    startingBalance: 1000,
    institution: "Reserve Vault",
    code: "BNK-102",
    id: "bank-1790928476223",
    accountNumber: "RES-001"
  },
  {
    code: "BNK-103",
    accountNumber: "PK71MEZN000192837192",
    id: "bank-1790934033978",
    name: "Meezan Bank Limited",
    institution: "Meezan Bank Islamic",
    startingBalance: 23213.28
  }
];

export const initialTaxCodes: TaxCode[] = [
  {
    name: "VAT 10%",
    id: "tax-vat-10",
    rate: 10,
    description: "Standard Value Added Tax (10%)"
  },
  {
    description: "Goods and Services Tax (15%)",
    id: "tax-gst-15",
    name: "GST 15%",
    rate: 15
  },
  {
    description: "State & Local Sales Tax (8.25%)",
    name: "Sales Tax 8.25%",
    rate: 8.25,
    id: "tax-sales-8"
  },
  {
    rate: 0,
    description: "Zero-rated or tax-exempt supply (0%)",
    id: "tax-zero",
    name: "Tax Free 0%"
  }
];

export const initialChartOfAccounts: ChartOfAccountItem[] = [
  { id: "acc-cash", name: "Bank and cash accounts", category: "Assets", isSystem: true, code: "1100", group: "Current Assets" },
  { name: "Accounts receivable", id: "acc-ar", group: "Current Assets", code: "1200", category: "Assets", isSystem: true },
  { name: "Inventory on hand", category: "Assets", group: "Current Assets", isSystem: true, code: "1300", id: "acc-inventory" },
  { id: "acc-fixed-assets", group: "Fixed Assets", code: "1500", name: "Fixed assets, at cost", isSystem: true, category: "Assets" },
  { isSystem: true, code: "1510", category: "Assets", group: "Fixed Assets", id: "acc-accum-depr", name: "Fixed assets, accumulated depreciation" },
  { code: "2100", isSystem: true, category: "Liabilities", group: "Current Liabilities", id: "acc-ap", name: "Accounts payable" },
  { group: "Current Liabilities", id: "acc-tax-payable", category: "Liabilities", code: "2200", isSystem: true, name: "Tax payable" },
  { name: "Employee clearing account", id: "acc-employee-clearing", group: "Current Liabilities", isSystem: true, code: "2300", category: "Liabilities" },
  { id: "acc-payroll-liabilities", code: "2310", group: "Current Liabilities", name: "Payroll liabilities", isSystem: true, category: "Liabilities" },
  { name: "Capital accounts", code: "3100", id: "acc-capital", isSystem: true, group: "Equity", category: "Equity" },
  { isSystem: true, code: "3200", category: "Equity", id: "acc-retained-earnings", group: "Equity", name: "Retained earnings" },
  { category: "Income", name: "Sales — Services & Advisory", group: "Operating Revenue", id: "acc-sales", code: "4100" },
  { name: "Inventory — sales", category: "Income", isSystem: true, id: "acc-inventory-sales", code: "4200", group: "Operating Revenue" },
  { id: "acc-inventory-cost", group: "Cost of Goods Sold", code: "5100", category: "Expenses", isSystem: true, name: "Inventory — cost" },
  { id: "acc-freight", name: "Freight and logistics", group: "Cost of Goods Sold", category: "Expenses", code: "5200" },
  { category: "Expenses", name: "Advertising and promotion", group: "Operating Expenses", id: "acc-advertising", code: "6150" },
  { name: "Bank charges", code: "6200", category: "Expenses", id: "acc-bank-charges", group: "Operating Expenses" },
  { id: "acc-depreciation", name: "Fixed assets — depreciation", code: "6300", category: "Expenses", group: "Operating Expenses", isSystem: true },
  { group: "Operating Expenses", code: "6800", id: "acc-wages", category: "Expenses", isSystem: true, name: "Wages & salaries" },
  { code: "6900", group: "Operating Expenses", category: "Expenses", id: "acc-operating-exp", name: "General office expenses" },
  { startingBalance: 0, code: "5000", category: "Expenses", id: "acc-custom-1790934901081", group: "Operating Expenses", name: "Adjustment Expense" },
  { startingBalance: 0, id: "acc-custom-1790934974257", code: "5001", category: "Expenses", group: "Operating Expenses", name: "Customer Discount" },
  { name: "Delivery Expenses", group: "Operating Expenses", startingBalance: 0, code: "5002", id: "acc-custom-1790935000129", category: "Expenses" },
  { startingBalance: 0, code: "5003", group: "Operating Expenses", name: "Food Materials", id: "acc-custom-1790935040497", category: "Expenses" },
  { startingBalance: 0, name: "Mobile Recharge", category: "Expenses", code: "5004", id: "acc-custom-1790935161345", group: "Operating Expenses" },
  { name: "Packing Materials", id: "acc-custom-1790935233426", startingBalance: 0, code: "5005", group: "Operating Expenses", category: "Expenses" },
  { name: "Adjustment Income", category: "Income", group: "Income", id: "acc-custom-1790935372425", code: "4000", startingBalance: 0 },
  { name: "Delivery Charges", category: "Income", group: "Income", code: "4001", id: "acc-custom-1790935413881", startingBalance: 0 },
  { name: "Fry Charges", category: "Income", startingBalance: 0, code: "4002", group: "Income", id: "acc-custom-1790935448537" },
  { group: "Income", code: "4003", startingBalance: 0, id: "acc-custom-1790935505057", category: "Income", name: "Other Charges" },
  { name: "Hand Loan Liabilities", id: "acc-custom-1790935821489", group: "Liabilities", category: "Liabilities", code: "2000", startingBalance: 0 },
  { id: "acc-custom-1791369248007", code: "9167", name: "Supplier Delivery Charges", category: "Expenses", group: "Operating Expenses", startingBalance: 0 }
];

export const standardFreshChartOfAccounts: ChartOfAccountItem[] = [
  { id: "acc-cash", name: "Bank and cash accounts", category: "Assets", isSystem: true, code: "1100", group: "Current Assets" },
  { name: "Accounts receivable", id: "acc-ar", group: "Current Assets", code: "1200", category: "Assets", isSystem: true },
  { name: "Inventory on hand", category: "Assets", group: "Current Assets", code: "1300", id: "acc-inventory" },
  { id: "acc-fixed-assets", group: "Fixed Assets", code: "1500", name: "Fixed assets, at cost", isSystem: true, category: "Assets" },
  { isSystem: true, code: "1510", category: "Assets", group: "Fixed Assets", id: "acc-accum-depr", name: "Fixed assets, accumulated depreciation" },
  { code: "2100", isSystem: true, category: "Liabilities", group: "Current Liabilities", id: "acc-ap", name: "Accounts payable" },
  { group: "Current Liabilities", id: "acc-tax-payable", category: "Liabilities", code: "2200", isSystem: true, name: "Tax payable" },
  { name: "Capital accounts", code: "3100", id: "acc-capital", isSystem: true, group: "Equity", category: "Equity" },
  { isSystem: true, code: "3200", category: "Equity", id: "acc-retained-earnings", group: "Equity", name: "Retained earnings" },
  { category: "Income", name: "Sales & Operating Revenue", group: "Operating Revenue", id: "acc-sales", code: "4100" },
  { name: "Inventory — sales", category: "Income", isSystem: true, id: "acc-inventory-sales", code: "4200", group: "Operating Revenue" },
  { id: "acc-inventory-cost", group: "Cost of Goods Sold", code: "5100", category: "Expenses", isSystem: true, name: "Cost of Goods Sold" },
  { id: "acc-freight", name: "Freight and logistics", group: "Cost of Goods Sold", category: "Expenses", code: "5200" },
  { category: "Expenses", name: "Advertising and promotion", group: "Operating Expenses", id: "acc-advertising", code: "6150" },
  { name: "Bank charges", code: "6200", category: "Expenses", id: "acc-bank-charges", group: "Operating Expenses" },
  { name: "Utilities & Office rent", code: "6300", category: "Expenses", id: "acc-utilities", group: "Operating Expenses" },
  { group: "Operating Expenses", code: "6800", id: "acc-wages", category: "Expenses", isSystem: true, name: "Wages & salaries" },
  { code: "6900", group: "Operating Expenses", category: "Expenses", id: "acc-operating-exp", name: "General office expenses" }
];
