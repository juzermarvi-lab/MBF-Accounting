import {
  BackupData,
  BankAccount,
  Customer,
  InventoryItem,
  Payment,
  PurchaseInvoice,
  Receipt,
  SalesInvoice,
  Supplier,
  Transfer
} from '../types/accounting';

export function formatCurrency(amount: number | undefined | null, symbol = "Rs", decimals = 2): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol} 0.00`;
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (isNegative) {
    return `(${symbol} ${formattedNumber})`;
  }
  return `${symbol} ${formattedNumber}`;
}

export function getInvoiceSubtotal(invoice: SalesInvoice | PurchaseInvoice): number {
  if (!invoice || !invoice.lines) return 0;
  return invoice.lines.reduce((sum, line) => {
    const qty = Number(line.qty) || 0;
    const unitPrice = Number(line.unitPrice) || 0;
    const discount = Number(line.discountPercent) || 0;
    const lineTotal = qty * unitPrice * (1 - discount / 100);
    return sum + lineTotal;
  }, 0);
}

export function getInvoiceTotal(invoice: SalesInvoice | PurchaseInvoice): number {
  const subtotal = getInvoiceSubtotal(invoice);
  let discount = 0;

  if ('customerDiscountAmount' in invoice && invoice.customerDiscountAmount) {
    discount += Number(invoice.customerDiscountAmount) || 0;
  }
  if ('customerDiscountPercent' in invoice && invoice.customerDiscountPercent) {
    discount += (subtotal * (Number(invoice.customerDiscountPercent) || 0)) / 100;
  }
  if ('supplierDiscountAmount' in invoice && invoice.supplierDiscountAmount) {
    discount += Number(invoice.supplierDiscountAmount) || 0;
  }
  if ('supplierDiscountPercent' in invoice && invoice.supplierDiscountPercent) {
    discount += (subtotal * (Number(invoice.supplierDiscountPercent) || 0)) / 100;
  }

  const delivery = Number(invoice.deliveryCharges) || 0;
  return Math.max(0, subtotal - discount + delivery);
}

export function getSalesInvoicePaidAmount(invoiceId: string, receipts: Receipt[]): number {
  let paid = 0;
  receipts.forEach(r => {
    r.lines.forEach(l => {
      if (l.invoiceId === invoiceId) {
        paid += (Number(l.qty) || 1) * (Number(l.unitPrice) || 0);
      }
    });
  });
  return paid;
}

export function getPurchaseInvoicePaidAmount(invoiceId: string, payments: Payment[]): number {
  let paid = 0;
  payments.forEach(p => {
    p.lines.forEach(l => {
      if (l.invoiceId === invoiceId) {
        paid += (Number(l.qty) || 1) * (Number(l.unitPrice) || 0);
      }
    });
  });
  return paid;
}

export function getCustomerBalance(customer: Customer, invoices: SalesInvoice[], receipts: Receipt[], asOfDate?: string): number {
  let balance = Number(customer.startingBalance) || 0;

  // Add all sales invoices up to asOfDate
  invoices
    .filter(inv => inv.customerId === customer.id && (!asOfDate || inv.date <= asOfDate))
    .forEach(inv => {
      balance += getInvoiceTotal(inv);
    });

  // Subtract all receipts up to asOfDate
  receipts
    .filter(r => (r.customerId === customer.id || r.payerName?.toLowerCase() === customer.name.toLowerCase()) && (!asOfDate || r.date <= asOfDate))
    .forEach(r => {
      const receiptTotal = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
      balance -= receiptTotal;
    });

  return balance;
}

export function getSupplierBalance(supplier: Supplier, purchaseInvoices: PurchaseInvoice[], payments: Payment[], asOfDate?: string): number {
  let balance = Number(supplier.startingBalance) || 0;

  // Add all purchase invoices up to asOfDate
  purchaseInvoices
    .filter(inv => inv.supplierId === supplier.id && (!asOfDate || inv.date <= asOfDate))
    .forEach(inv => {
      balance += getInvoiceTotal(inv);
    });

  // Subtract all payments up to asOfDate
  payments
    .filter(p => (p.supplierId === supplier.id || p.payeeName?.toLowerCase() === supplier.name.toLowerCase()) && (!asOfDate || p.date <= asOfDate))
    .forEach(p => {
      const paymentTotal = p.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
      balance -= paymentTotal;
    });

  return balance;
}

export function getBankAccountBalance(
  account: BankAccount,
  receipts: Receipt[],
  payments: Payment[],
  transfers: Transfer[],
  asOfDate?: string
): number {
  let balance = Number(account.startingBalance) || 0;

  receipts
    .filter(r => !asOfDate || r.date <= asOfDate)
    .forEach(r => {
      if (r.receivedInAccountId === account.id) {
        const receiptTotal = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        balance += receiptTotal;
      }
    });

  payments
    .filter(p => !asOfDate || p.date <= asOfDate)
    .forEach(p => {
      if (p.paidFromAccountId === account.id) {
        const paymentTotal = p.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        balance -= paymentTotal;
      }
    });

  transfers
    .filter(t => !asOfDate || t.date <= asOfDate)
    .forEach(t => {
      if (t.toAccountId === account.id) {
        balance += Number(t.amount) || 0;
      }
      if (t.fromAccountId === account.id) {
        balance -= Number(t.amount) || 0;
      }
    });

  return balance;
}

export function getInventoryStock(
  item: InventoryItem,
  salesInvoices: SalesInvoice[],
  purchaseInvoices: PurchaseInvoice[],
  asOfDate?: string
): {
  startingQty: number;
  qtyIn: number;
  qtyOut: number;
  currentStock: number;
  valuationCost: number;
  valuationSale: number;
} {
  const startingQty = Number(item.startingQty) || 0;
  let qtyIn = 0;
  let qtyOut = 0;

  purchaseInvoices
    .filter(inv => !asOfDate || inv.date <= asOfDate)
    .forEach(inv => {
      inv.lines.forEach(l => {
        if (l.itemId === item.id || l.description === item.name) {
          qtyIn += Number(l.qty) || 0;
        }
      });
    });

  salesInvoices
    .filter(inv => !asOfDate || inv.date <= asOfDate)
    .forEach(inv => {
      inv.lines.forEach(l => {
        if (l.itemId === item.id || l.description === item.name) {
          qtyOut += Number(l.qty) || 0;
        }
      });
    });

  const currentStock = startingQty + qtyIn - qtyOut;
  const unitCost = Number(item.purchasePrice) || Number(item.startingUnitCost) || 0;
  const unitSale = Number(item.salePrice) || 0;

  return {
    startingQty,
    qtyIn,
    qtyOut,
    currentStock,
    valuationCost: Math.max(0, currentStock) * unitCost,
    valuationSale: Math.max(0, currentStock) * unitSale
  };
}

export interface CustomerTransactionEntry {
  id: string;
  date: string;
  type: 'Invoice' | 'Receipt' | 'Opening Balance';
  reference: string;
  description: string;
  items?: string;
  debit: number; // Invoice / Receivable increase
  credit: number; // Receipt / Payment collected
  runningBalance: number;
}

export function getCustomerTransactionReport(
  customer: Customer,
  salesInvoices: SalesInvoice[],
  receipts: Receipt[],
  startDate?: string,
  endDate?: string
) {
  // 1. Calculate opening balance strictly before startDate
  let openingBalance = Number(customer.startingBalance) || 0;

  if (startDate) {
    salesInvoices
      .filter(inv => inv.customerId === customer.id && inv.date < startDate)
      .forEach(inv => {
        openingBalance += getInvoiceTotal(inv);
      });

    receipts
      .filter(r => (r.customerId === customer.id || r.payerName?.toLowerCase() === customer.name.toLowerCase()) && r.date < startDate)
      .forEach(r => {
        const total = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        openingBalance -= total;
      });
  }

  // 2. Collect transactions between startDate and endDate
  const rawEntries: Omit<CustomerTransactionEntry, 'runningBalance'>[] = [];

  salesInvoices
    .filter(inv => inv.customerId === customer.id && (!startDate || inv.date >= startDate) && (!endDate || inv.date <= endDate))
    .forEach(inv => {
      const itemsList = inv.lines.map(l => `${l.description || 'Item'} (x${l.qty || 1})`).join(', ');
      rawEntries.push({
        id: inv.id,
        date: inv.date,
        type: 'Invoice',
        reference: `#${inv.reference}`,
        description: inv.description || itemsList || `Sales Invoice`,
        items: itemsList,
        debit: getInvoiceTotal(inv),
        credit: 0
      });
    });

  receipts
    .filter(r => (r.customerId === customer.id || r.payerName?.toLowerCase() === customer.name.toLowerCase()) &&
                 (!startDate || r.date >= startDate) &&
                 (!endDate || r.date <= endDate))
    .forEach(r => {
      const total = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
      rawEntries.push({
        id: r.id,
        date: r.date,
        type: 'Receipt',
        reference: r.reference,
        description: r.description || `Customer Payment Receipt`,
        items: `Received via ${r.receivedInAccountId ? 'Bank/Cash' : 'Account'}`,
        debit: 0,
        credit: total
      });
    });

  // Sort ascending by date, Invoices first if same date
  rawEntries.sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return diff;
    return a.type === 'Invoice' ? -1 : 1;
  });

  let running = openingBalance;
  let totalDebits = 0;
  let totalCredits = 0;

  const entries: CustomerTransactionEntry[] = rawEntries.map(e => {
    totalDebits += e.debit;
    totalCredits += e.credit;
    running = running + e.debit - e.credit;
    return {
      ...e,
      runningBalance: running
    };
  });

  return {
    customer,
    openingBalance,
    entries,
    totalDebits,
    totalCredits,
    netChange: totalDebits - totalCredits,
    closingBalance: running
  };
}

export interface SupplierTransactionEntry {
  id: string;
  date: string;
  type: 'Purchase' | 'Payment' | 'Opening Balance';
  reference: string;
  description: string;
  items?: string;
  debit: number; // Payment made (reduces payable liability)
  credit: number; // Purchase bill (increases payable liability)
  runningBalance: number;
}

export function getSupplierTransactionReport(
  supplier: Supplier,
  purchaseInvoices: PurchaseInvoice[],
  payments: Payment[],
  startDate?: string,
  endDate?: string
) {
  // 1. Calculate opening balance strictly before startDate
  let openingBalance = Number(supplier.startingBalance) || 0;

  if (startDate) {
    purchaseInvoices
      .filter(inv => inv.supplierId === supplier.id && inv.date < startDate)
      .forEach(inv => {
        openingBalance += getInvoiceTotal(inv);
      });

    payments
      .filter(p => (p.supplierId === supplier.id || p.payeeName?.toLowerCase() === supplier.name.toLowerCase()) && p.date < startDate)
      .forEach(p => {
        const total = p.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        openingBalance -= total;
      });
  }

  // 2. Collect transactions between startDate and endDate
  const rawEntries: Omit<SupplierTransactionEntry, 'runningBalance'>[] = [];

  purchaseInvoices
    .filter(inv => inv.supplierId === supplier.id && (!startDate || inv.date >= startDate) && (!endDate || inv.date <= endDate))
    .forEach(inv => {
      const itemsList = inv.lines.map(l => `${l.description || 'Item'} (x${l.qty || 1})`).join(', ');
      rawEntries.push({
        id: inv.id,
        date: inv.date,
        type: 'Purchase',
        reference: `#${inv.reference}`,
        description: inv.description || itemsList || `Purchase Invoice`,
        items: itemsList,
        debit: 0,
        credit: getInvoiceTotal(inv)
      });
    });

  payments
    .filter(p => (p.supplierId === supplier.id || p.payeeName?.toLowerCase() === supplier.name.toLowerCase()) &&
                 (!startDate || p.date >= startDate) &&
                 (!endDate || p.date <= endDate))
    .forEach(p => {
      const total = p.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
      rawEntries.push({
        id: p.id,
        date: p.date,
        type: 'Payment',
        reference: p.reference,
        description: p.description || `Supplier Payment`,
        items: `Paid from ${p.paidFromAccountId ? 'Bank/Cash' : 'Account'}`,
        debit: total,
        credit: 0
      });
    });

  // Sort ascending by date, Purchases first if same date
  rawEntries.sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return diff;
    return a.type === 'Purchase' ? -1 : 1;
  });

  let running = openingBalance;
  let totalDebits = 0;
  let totalCredits = 0;

  const entries: SupplierTransactionEntry[] = rawEntries.map(e => {
    totalDebits += e.debit;
    totalCredits += e.credit;
    // For payable: credit increases liability, debit reduces liability
    running = running + e.credit - e.debit;
    return {
      ...e,
      runningBalance: running
    };
  });

  return {
    supplier,
    openingBalance,
    entries,
    totalDebits, // Payments made
    totalCredits, // Purchases billed
    netChange: totalCredits - totalDebits,
    closingBalance: running
  };
}

export function computeFinancialSummary(data: BackupData, startDate?: string, endDate?: string) {
  const asOfDate = endDate;

  // Total Bank Balances as of endDate
  const bankBalances = data.bankAccounts.map(b => ({
    account: b,
    balance: getBankAccountBalance(b, data.receipts, data.payments, data.transfers, asOfDate)
  }));
  const totalCashAndBank = bankBalances.reduce((s, b) => s + b.balance, 0);

  // Accounts Receivable as of endDate
  const customerLedgers = data.customers.map(c => ({
    customer: c,
    balance: getCustomerBalance(c, data.salesInvoices, data.receipts, asOfDate)
  }));
  const totalAccountsReceivable = customerLedgers.reduce((s, c) => s + (c.balance > 0 ? c.balance : 0), 0);

  // Accounts Payable as of endDate
  const supplierLedgers = data.suppliers.map(s => ({
    supplier: s,
    balance: getSupplierBalance(s, data.purchaseInvoices, data.payments, asOfDate)
  }));
  const totalAccountsPayable = supplierLedgers.reduce((s, sup) => s + (sup.balance > 0 ? sup.balance : 0), 0);

  // Inventory Valuation as of endDate
  const itemStocks = data.inventoryItems.map(i => ({
    item: i,
    ...getInventoryStock(i, data.salesInvoices, data.purchaseInvoices, asOfDate)
  }));
  const totalInventoryValuation = itemStocks.reduce((s, i) => s + i.valuationCost, 0);

  // Period-filtered Sales Invoices for P&L Revenue & COGS
  const periodSalesInvoices = data.salesInvoices.filter(
    inv => (!startDate || inv.date >= startDate) && (!endDate || inv.date <= endDate)
  );

  // Total Invoiced Sales Revenue
  const totalSalesRevenue = periodSalesInvoices.reduce((s, inv) => s + getInvoiceTotal(inv), 0);

  // Cost of Goods Sold from Invoices in period
  let totalCOGS = 0;
  periodSalesInvoices.forEach(inv => {
    inv.lines.forEach(l => {
      if (l.itemId) {
        const item = data.inventoryItems.find(i => i.id === l.itemId);
        if (item) {
          totalCOGS += (Number(l.qty) || 0) * (Number(item.purchasePrice) || Number(item.startingUnitCost) || 0);
        }
      }
    });
  });

  // Operating Expenses from Payments in period
  let totalOperatingExpenses = 0;
  const periodPayments = data.payments.filter(
    p => (!startDate || p.date >= startDate) && (!endDate || p.date <= endDate)
  );
  periodPayments.forEach(p => {
    p.lines.forEach(l => {
      if (l.accountId !== 'acc-ap') {
        totalOperatingExpenses += (Number(l.qty) || 1) * (Number(l.unitPrice) || 0);
      }
    });
  });

  const grossProfit = totalSalesRevenue - totalCOGS;
  const netProfit = grossProfit - totalOperatingExpenses;

  // Total Assets & Liabilities
  const totalAssets = totalCashAndBank + totalAccountsReceivable + totalInventoryValuation;
  const totalLiabilities = totalAccountsPayable;
  const equity = totalAssets - totalLiabilities;

  return {
    bankBalances,
    totalCashAndBank,
    customerLedgers,
    totalAccountsReceivable,
    supplierLedgers,
    totalAccountsPayable,
    itemStocks,
    totalInventoryValuation,
    totalSalesRevenue,
    totalCOGS,
    grossProfit,
    totalOperatingExpenses,
    netProfit,
    totalAssets,
    totalLiabilities,
    equity,
    periodSalesInvoices,
    periodPayments
  };
}
