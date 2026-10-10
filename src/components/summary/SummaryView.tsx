import React from 'react';
import {
  Wallet,
  TrendingUp,
  Receipt as ReceiptIcon,
  ShoppingBag,
  CreditCard,
  Building,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { computeFinancialSummary, formatCurrency, getInvoiceTotal } from '../../utils/accountingMath';

export const SummaryView: React.FC = () => {
  const { data, setActiveTab, updateSummarySettings } = useAccounting();
  const summary = computeFinancialSummary(data);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Executive Financial Dashboard</h2>
            <span className="text-xs px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Balance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial performance and double-entry balance summary for <span className="text-slate-200 font-semibold">{data.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Method Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => updateSummarySettings({ ...data.summarySettings, accountingMethod: 'Accrual' })}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                data.summarySettings.accountingMethod === 'Accrual'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Accrual Basis
            </button>
            <button
              onClick={() => updateSummarySettings({ ...data.summarySettings, accountingMethod: 'Cash' })}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                data.summarySettings.accountingMethod === 'Cash'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cash Basis
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{data.summarySettings.periodStart}</span>
            <span className="text-slate-600">→</span>
            <span>{data.summarySettings.periodEnd}</span>
          </div>
        </div>
      </div>

      {/* Primary 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Profit / (Loss)</span>
            <div className={`p-1.5 rounded-lg ${summary.netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {formatCurrency(summary.netProfit, data.currency.symbol)}
          </div>
          <div className="text-[11px] text-slate-400">
            Gross Margin: <span className="font-mono text-emerald-400">{summary.totalSalesRevenue > 0 ? ((summary.grossProfit / summary.totalSalesRevenue) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>

        {/* Total Cash & Bank */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Cash & Bank</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {formatCurrency(summary.totalCashAndBank, data.currency.symbol)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{data.bankAccounts.length} liquid accounts</span>
            <button
              onClick={() => setActiveTab('bank-accounts')}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              View accounts
            </button>
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Accounts Receivable</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ReceiptIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {formatCurrency(summary.totalAccountsReceivable, data.currency.symbol)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Due from customers</span>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Customer ledger
            </button>
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Accounts Payable</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {formatCurrency(summary.totalAccountsPayable, data.currency.symbol)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Owed to suppliers</span>
            <button
              onClick={() => setActiveTab('suppliers')}
              className="text-rose-400 hover:underline cursor-pointer"
            >
              Supplier bills
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Financial Metrics: Revenue, COGS, Expenses & Inventory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Total Invoiced Revenue</span>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(summary.totalSalesRevenue, data.currency.symbol)}
          </p>
          <span className="text-[11px] text-slate-500">{data.salesInvoices.length} recorded invoices</span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Cost of Goods Sold (COGS)</span>
          <p className="text-lg font-bold font-mono text-slate-200 mt-1">
            {formatCurrency(summary.totalCOGS, data.currency.symbol)}
          </p>
          <span className="text-[11px] text-slate-500">Gross: {formatCurrency(summary.grossProfit, data.currency.symbol)}</span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Operating Expenses</span>
          <p className="text-lg font-bold font-mono text-rose-300 mt-1">
            {formatCurrency(summary.totalOperatingExpenses, data.currency.symbol)}
          </p>
          <span className="text-[11px] text-slate-500">{data.payments.length} disbursed payments</span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400">Inventory on Hand Valuation</span>
          <p className="text-lg font-bold font-mono text-blue-400 mt-1">
            {formatCurrency(summary.totalInventoryValuation, data.currency.symbol)}
          </p>
          <span className="text-[11px] text-slate-500">{data.inventoryItems.length} active frozen products</span>
        </div>
      </div>

      {/* Liquid Bank Accounts Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Bank & Cash Liquidity Register</h3>
          </div>
          <button
            onClick={() => setActiveTab('bank-accounts')}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Manage Accounts →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.bankBalances.map(({ account, balance }) => {
            const isNegative = balance < 0;
            return (
              <div
                key={account.id}
                onClick={() => setActiveTab('bank-accounts')}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{account.code}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {account.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{account.institution || "Internal Register"}</p>
                  </div>
                  <div className={`p-1.5 rounded-lg ${isNegative ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-500">Current Balance:</span>
                  <span className={`font-mono font-bold text-base ${isNegative ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatCurrency(balance, data.currency.symbol)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Recent Invoices & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Invoices */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Recent Sales Invoices</h3>
            </div>
            <button
              onClick={() => setActiveTab('sales-invoices')}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              View All ({data.salesInvoices.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Inv #</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.salesInvoices.slice(0, 6).map(inv => {
                  const customer = data.customers.find(c => c.id === inv.customerId);
                  const total = getInvoiceTotal(inv);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono font-semibold text-emerald-400">#{inv.reference}</td>
                      <td className="py-2.5 font-mono text-slate-400">{inv.date}</td>
                      <td className="py-2.5 font-medium text-slate-200 truncate max-w-[140px]">
                        {customer?.name || inv.customerId}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-white">
                        {formatCurrency(total, data.currency.symbol)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Receipts (Money In) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Recent Customer Receipts</h3>
            </div>
            <button
              onClick={() => setActiveTab('receipts')}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
            >
              View All ({data.receipts.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Receipt #</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Payer</th>
                  <th className="pb-2">Deposited In</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.receipts.slice(0, 6).map(r => {
                  const bank = data.bankAccounts.find(b => b.id === r.receivedInAccountId);
                  const amount = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono font-semibold text-blue-400">{r.reference}</td>
                      <td className="py-2.5 font-mono text-slate-400">{r.date}</td>
                      <td className="py-2.5 font-medium text-slate-200 truncate max-w-[130px]">{r.payerName}</td>
                      <td className="py-2.5 text-slate-400 truncate max-w-[120px]">{bank?.name || "Bank"}</td>
                      <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                        {formatCurrency(amount, data.currency.symbol)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
