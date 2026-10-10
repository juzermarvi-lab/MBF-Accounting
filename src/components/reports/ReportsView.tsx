import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Scale,
  Receipt,
  Package,
  Printer,
  Truck,
  Calendar,
  Filter,
  ArrowRight,
  Download,
  Search,
  Users,
  RefreshCw,
  FileText,
  DollarSign,
  Clock,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAccounting, ReportType } from '../../context/AccountingContext';
import {
  computeFinancialSummary,
  formatCurrency,
  getCustomerTransactionReport,
  getSupplierTransactionReport,
  getCustomerBalance,
  getSupplierBalance,
  getInvoiceTotal,
  CustomerTransactionEntry,
  SupplierTransactionEntry
} from '../../utils/accountingMath';
import { downloadFile, arrayToCSV } from '../../utils/csvHelper';

export const ReportsView: React.FC = () => {
  const { data, reportFilterState, setReportFilterState } = useAccounting();

  // Local state initialized from context reportFilterState
  const selectedReport = reportFilterState.reportType || 'customer-transactions';
  const setSelectedReport = (reportType: ReportType) => {
    setReportFilterState(prev => ({ ...prev, reportType }));
  };

  const startDate = reportFilterState.startDate || '2026-01-01';
  const endDate = reportFilterState.endDate || '2026-12-31';

  const setStartDate = (val: string) => {
    setReportFilterState(prev => ({ ...prev, startDate: val }));
  };

  const setEndDate = (val: string) => {
    setReportFilterState(prev => ({ ...prev, endDate: val }));
  };

  const selectedCustomerId = reportFilterState.selectedCustomerId || '';
  const setSelectedCustomerId = (val: string) => {
    setReportFilterState(prev => ({ ...prev, selectedCustomerId: val ? val : null }));
  };

  const selectedSupplierId = reportFilterState.selectedSupplierId || '';
  const setSelectedSupplierId = (val: string) => {
    setReportFilterState(prev => ({ ...prev, selectedSupplierId: val ? val : null }));
  };

  // Search filter for dropdowns/tables
  const [searchTerm, setSearchTerm] = useState('');
  // Toggle for "All Customers" view: 'summary' or 'all-ledger'
  const [customerViewMode, setCustomerViewMode] = useState<'summary' | 'all-ledger'>('summary');
  // Toggle for "All Suppliers" view: 'summary' or 'all-ledger'
  const [supplierViewMode, setSupplierViewMode] = useState<'summary' | 'all-ledger'>('summary');

  // Quick Date Presets
  const handleApplyPreset = (preset: 'all' | 'this-month' | 'last-month' | 'q4' | 'fy2026') => {
    if (preset === 'all') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    } else if (preset === 'this-month') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (preset === 'last-month') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    } else if (preset === 'q4') {
      setStartDate('2026-10-01');
      setEndDate('2026-12-31');
    } else if (preset === 'fy2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Compute standard GAAP financial summary filtered by date criteria
  const summary = useMemo(() => {
    return computeFinancialSummary(data, startDate, endDate);
  }, [data, startDate, endDate]);

  // Selected customer object (if any)
  const currentCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return data.customers.find(c => c.id === selectedCustomerId) || null;
  }, [data.customers, selectedCustomerId]);

  // Selected supplier object (if any)
  const currentSupplier = useMemo(() => {
    if (!selectedSupplierId) return null;
    return data.suppliers.find(s => s.id === selectedSupplierId) || null;
  }, [data.suppliers, selectedSupplierId]);

  // Customer Transaction Report for selected customer
  const customerReportData = useMemo(() => {
    if (!currentCustomer) return null;
    return getCustomerTransactionReport(
      currentCustomer,
      data.salesInvoices,
      data.receipts,
      startDate,
      endDate
    );
  }, [currentCustomer, data.salesInvoices, data.receipts, startDate, endDate]);

  // Supplier Transaction Report for selected supplier
  const supplierReportData = useMemo(() => {
    if (!currentSupplier) return null;
    return getSupplierTransactionReport(
      currentSupplier,
      data.purchaseInvoices,
      data.payments,
      startDate,
      endDate
    );
  }, [currentSupplier, data.purchaseInvoices, data.payments, startDate, endDate]);

  // All Customers Summary Report (when no specific customer is selected)
  const allCustomersSummaries = useMemo(() => {
    return data.customers.map(c => {
      const rep = getCustomerTransactionReport(
        c,
        data.salesInvoices,
        data.receipts,
        startDate,
        endDate
      );
      return {
        customer: c,
        openingBalance: rep.openingBalance,
        totalDebits: rep.totalDebits,
        totalCredits: rep.totalCredits,
        netChange: rep.netChange,
        closingBalance: rep.closingBalance,
        txCount: rep.entries.length
      };
    }).filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.customer.name.toLowerCase().includes(term) ||
        item.customer.code.toLowerCase().includes(term) ||
        item.customer.billingAddress.toLowerCase().includes(term)
      );
    });
  }, [data.customers, data.salesInvoices, data.receipts, startDate, endDate, searchTerm]);

  // Consolidated Customer Chronological Ledger (All transactions across all customers in date range)
  const consolidatedCustomerLedger = useMemo(() => {
    interface ConsolidatedCustRow {
      id: string;
      date: string;
      customerName: string;
      customerCode: string;
      customerId: string;
      type: 'Invoice' | 'Receipt';
      reference: string;
      description: string;
      debit: number;
      credit: number;
    }
    const rows: ConsolidatedCustRow[] = [];

    data.salesInvoices
      .filter(inv => (!startDate || inv.date >= startDate) && (!endDate || inv.date <= endDate))
      .forEach(inv => {
        const cust = data.customers.find(c => c.id === inv.customerId);
        rows.push({
          id: inv.id,
          date: inv.date,
          customerName: cust ? cust.name : 'Unknown Customer',
          customerCode: cust ? cust.code : '-',
          customerId: inv.customerId,
          type: 'Invoice',
          reference: `#${inv.reference}`,
          description: inv.description || `Sales invoice with ${inv.lines.length} items`,
          debit: getInvoiceTotal(inv),
          credit: 0
        });
      });

    data.receipts
      .filter(r => (!startDate || r.date >= startDate) && (!endDate || r.date <= endDate))
      .forEach(r => {
        const cust = data.customers.find(
          c => c.id === r.customerId || c.name.toLowerCase() === r.payerName?.toLowerCase()
        );
        const total = r.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        rows.push({
          id: r.id,
          date: r.date,
          customerName: cust ? cust.name : r.payerName || 'Direct Receipt',
          customerCode: cust ? cust.code : '-',
          customerId: cust?.id || r.customerId || '',
          type: 'Receipt',
          reference: r.reference,
          description: r.description || `Receipt collected`,
          debit: 0,
          credit: total
        });
      });

    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return rows;
  }, [data.salesInvoices, data.receipts, data.customers, startDate, endDate]);

  // All Suppliers Summary Report (when no specific supplier is selected)
  const allSuppliersSummaries = useMemo(() => {
    return data.suppliers.map(s => {
      const rep = getSupplierTransactionReport(
        s,
        data.purchaseInvoices,
        data.payments,
        startDate,
        endDate
      );
      return {
        supplier: s,
        openingBalance: rep.openingBalance,
        totalDebits: rep.totalDebits,
        totalCredits: rep.totalCredits,
        netChange: rep.netChange,
        closingBalance: rep.closingBalance,
        txCount: rep.entries.length
      };
    }).filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.supplier.name.toLowerCase().includes(term) ||
        item.supplier.code.toLowerCase().includes(term) ||
        item.supplier.address.toLowerCase().includes(term)
      );
    });
  }, [data.suppliers, data.purchaseInvoices, data.payments, startDate, endDate, searchTerm]);

  // Consolidated Supplier Chronological Ledger
  const consolidatedSupplierLedger = useMemo(() => {
    interface ConsolidatedSupRow {
      id: string;
      date: string;
      supplierName: string;
      supplierCode: string;
      supplierId: string;
      type: 'Purchase' | 'Payment';
      reference: string;
      description: string;
      debit: number;
      credit: number;
    }
    const rows: ConsolidatedSupRow[] = [];

    data.purchaseInvoices
      .filter(inv => (!startDate || inv.date >= startDate) && (!endDate || inv.date <= endDate))
      .forEach(inv => {
        const sup = data.suppliers.find(s => s.id === inv.supplierId);
        rows.push({
          id: inv.id,
          date: inv.date,
          supplierName: sup ? sup.name : 'Unknown Supplier',
          supplierCode: sup ? sup.code : '-',
          supplierId: inv.supplierId,
          type: 'Purchase',
          reference: `#${inv.reference}`,
          description: inv.description || `Purchase invoice with ${inv.lines.length} items`,
          debit: 0,
          credit: getInvoiceTotal(inv)
        });
      });

    data.payments
      .filter(p => (!startDate || p.date >= startDate) && (!endDate || p.date <= endDate))
      .forEach(p => {
        const sup = data.suppliers.find(
          s => s.id === p.supplierId || s.name.toLowerCase() === p.payeeName?.toLowerCase()
        );
        const total = p.lines.reduce((s, l) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0);
        rows.push({
          id: p.id,
          date: p.date,
          supplierName: sup ? sup.name : p.payeeName || 'Direct Payment',
          supplierCode: sup ? sup.code : '-',
          supplierId: sup?.id || p.supplierId || '',
          type: 'Payment',
          reference: p.reference,
          description: p.description || `Payment disbursement`,
          debit: total,
          credit: 0
        });
      });

    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return rows;
  }, [data.purchaseInvoices, data.payments, data.suppliers, startDate, endDate]);

  // Customer Aging calculation evaluated as of endDate
  const customerAgingData = useMemo(() => {
    const asOf = endDate || new Date().toISOString().split('T')[0];
    const asOfTime = new Date(asOf).getTime();

    return data.customers
      .filter(c => {
        if (selectedCustomerId && c.id !== selectedCustomerId) return false;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term);
        }
        return true;
      })
      .map(customer => {
        const balance = getCustomerBalance(customer, data.salesInvoices, data.receipts, asOf);
        
        // Compute unpaid invoice aging relative to asOf
        let b0_30 = 0;
        let b31_60 = 0;
        let b61_90 = 0;
        let b90_plus = 0;

        if (balance > 0) {
          // Approximate based on latest invoices prior to asOf
          const customerInvoices = data.salesInvoices
            .filter(inv => inv.customerId === customer.id && inv.date <= asOf)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          let remainingBalance = balance;
          for (const inv of customerInvoices) {
            if (remainingBalance <= 0) break;
            const invTotal = getInvoiceTotal(inv);
            const applied = Math.min(remainingBalance, invTotal);
            const diffDays = Math.max(0, Math.floor((asOfTime - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24)));

            if (diffDays <= 30) b0_30 += applied;
            else if (diffDays <= 60) b31_60 += applied;
            else if (diffDays <= 90) b61_90 += applied;
            else b90_plus += applied;

            remainingBalance -= applied;
          }

          if (remainingBalance > 0) {
            b90_plus += remainingBalance;
          }
        }

        return {
          customer,
          balance,
          b0_30,
          b31_60,
          b61_90,
          b90_plus
        };
      })
      .filter(item => item.balance !== 0);
  }, [data.customers, data.salesInvoices, data.receipts, endDate, selectedCustomerId, searchTerm]);

  // Supplier Payables list evaluated as of endDate
  const supplierPayablesData = useMemo(() => {
    const asOf = endDate || new Date().toISOString().split('T')[0];
    return data.suppliers
      .filter(s => {
        if (selectedSupplierId && s.id !== selectedSupplierId) return false;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term);
        }
        return true;
      })
      .map(supplier => {
        const balance = getSupplierBalance(supplier, data.purchaseInvoices, data.payments, asOf);
        return {
          supplier,
          balance
        };
      });
  }, [data.suppliers, data.purchaseInvoices, data.payments, endDate, selectedSupplierId, searchTerm]);

  // Handlers for printing and exporting
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const reportDateTag = `${startDate}_to_${endDate}`;

    if (selectedReport === 'customer-transactions') {
      if (currentCustomer && customerReportData) {
        const csvRows = [
          {
            Date: startDate,
            Type: 'Opening Balance',
            Reference: '-',
            Description: `Balance brought forward as of ${startDate}`,
            Items: '',
            Debit: '',
            Credit: '',
            RunningBalance: customerReportData.openingBalance.toFixed(2)
          },
          ...customerReportData.entries.map(e => ({
            Date: e.date,
            Type: e.type,
            Reference: e.reference,
            Description: e.description,
            Items: e.items || '',
            Debit: e.debit > 0 ? e.debit.toFixed(2) : '',
            Credit: e.credit > 0 ? e.credit.toFixed(2) : '',
            RunningBalance: e.runningBalance.toFixed(2)
          }))
        ];
        const csv = arrayToCSV(csvRows);
        downloadFile(csv, `Customer_Statement_${currentCustomer.code}_${reportDateTag}.csv`);
      } else {
        const csvRows = allCustomersSummaries.map(item => ({
          CustomerCode: item.customer.code,
          CustomerName: item.customer.name,
          BillingAddress: item.customer.billingAddress,
          OpeningBalance: item.openingBalance.toFixed(2),
          TotalInvoiced: item.totalDebits.toFixed(2),
          TotalReceived: item.totalCredits.toFixed(2),
          NetChange: item.netChange.toFixed(2),
          ClosingBalance: item.closingBalance.toFixed(2)
        }));
        const csv = arrayToCSV(csvRows);
        downloadFile(csv, `Customer_Transaction_Summary_${reportDateTag}.csv`);
      }
    } else if (selectedReport === 'supplier-transactions') {
      if (currentSupplier && supplierReportData) {
        const csvRows = [
          {
            Date: startDate,
            Type: 'Opening Balance',
            Reference: '-',
            Description: `Payable brought forward as of ${startDate}`,
            Items: '',
            Debit: '',
            Credit: '',
            RunningBalance: supplierReportData.openingBalance.toFixed(2)
          },
          ...supplierReportData.entries.map(e => ({
            Date: e.date,
            Type: e.type,
            Reference: e.reference,
            Description: e.description,
            Items: e.items || '',
            Debit: e.debit > 0 ? e.debit.toFixed(2) : '',
            Credit: e.credit > 0 ? e.credit.toFixed(2) : '',
            RunningBalance: e.runningBalance.toFixed(2)
          }))
        ];
        const csv = arrayToCSV(csvRows);
        downloadFile(csv, `Supplier_Statement_${currentSupplier.code}_${reportDateTag}.csv`);
      } else {
        const csvRows = allSuppliersSummaries.map(item => ({
          SupplierCode: item.supplier.code,
          SupplierName: item.supplier.name,
          Address: item.supplier.address,
          OpeningBalance: item.openingBalance.toFixed(2),
          TotalPurchases: item.totalCredits.toFixed(2),
          TotalPayments: item.totalDebits.toFixed(2),
          NetChange: item.netChange.toFixed(2),
          ClosingBalance: item.closingBalance.toFixed(2)
        }));
        const csv = arrayToCSV(csvRows);
        downloadFile(csv, `Supplier_Transaction_Summary_${reportDateTag}.csv`);
      }
    } else if (selectedReport === 'profit-loss') {
      const csvRows = [
        { Section: 'Operating Revenue', Line: 'Sales Invoices', Amount: summary.totalSalesRevenue.toFixed(2) },
        { Section: 'Cost of Goods Sold', Line: 'Direct Inventory Cost', Amount: (-summary.totalCOGS).toFixed(2) },
        { Section: 'Gross Profit', Line: 'Gross Profit', Amount: summary.grossProfit.toFixed(2) },
        { Section: 'Operating Expenses', Line: 'Operating Expenses', Amount: (-summary.totalOperatingExpenses).toFixed(2) },
        { Section: 'Net Profit', Line: 'Net Profit / (Loss)', Amount: summary.netProfit.toFixed(2) }
      ];
      const csv = arrayToCSV(csvRows);
      downloadFile(csv, `Profit_and_Loss_${reportDateTag}.csv`);
    } else if (selectedReport === 'customer-aging') {
      const csvRows = customerAgingData.map(item => ({
        CustomerCode: item.customer.code,
        CustomerName: item.customer.name,
        Current_0_30_Days: item.b0_30.toFixed(2),
        Days_31_60: item.b31_60.toFixed(2),
        Days_61_90: item.b61_90.toFixed(2),
        Days_90_Plus: item.b90_plus.toFixed(2),
        TotalOutstanding: item.balance.toFixed(2)
      }));
      const csv = arrayToCSV(csvRows);
      downloadFile(csv, `Customer_Aging_Report_${reportDateTag}.csv`);
    } else if (selectedReport === 'supplier-payables') {
      const csvRows = supplierPayablesData.map(item => ({
        SupplierCode: item.supplier.code,
        SupplierName: item.supplier.name,
        Address: item.supplier.address,
        StartingBalance: Number(item.supplier.startingBalance || 0).toFixed(2),
        PayableBalance: item.balance.toFixed(2)
      }));
      const csv = arrayToCSV(csvRows);
      downloadFile(csv, `Supplier_Payables_${reportDateTag}.csv`);
    } else if (selectedReport === 'inventory-valuation') {
      const csvRows = summary.itemStocks.map(s => ({
        SKU: s.item.code,
        ProductName: s.item.name,
        Division: s.item.division || '',
        UnitCost: Number(s.item.purchasePrice || 0).toFixed(2),
        StockOnHand: s.currentStock,
        CostValuation: s.valuationCost.toFixed(2),
        RetailValuation: s.valuationSale.toFixed(2)
      }));
      const csv = arrayToCSV(csvRows);
      downloadFile(csv, `Inventory_Valuation_${reportDateTag}.csv`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl no-print">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Financial Statements & Transaction Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-period ledgers, statements, aging, and GAAP financial reports with custom date criteria.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Download CSV for current report"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF Statement
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs no-print">
        {[
          { id: 'customer-transactions', label: 'Customer Transaction Report', icon: Users, highlight: true },
          { id: 'supplier-transactions', label: 'Supplier Transaction Report', icon: Truck, highlight: true },
          { id: 'profit-loss', label: 'Profit & Loss (P&L)', icon: TrendingUp },
          { id: 'balance-sheet', label: 'Balance Sheet', icon: Scale },
          { id: 'trial-balance', label: 'Trial Balance', icon: BarChart3 },
          { id: 'customer-aging', label: 'A/R Customer Aging', icon: Receipt },
          { id: 'supplier-payables', label: 'A/P Supplier Bills', icon: FileText },
          { id: 'inventory-valuation', label: 'Inventory Valuation', icon: Package }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = selectedReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id as ReportType)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Universal Date & Entity Filtering Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Date Range Inputs & Presets */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Date Criteria:</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 mr-2">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                />
              </div>

              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 mr-2">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                />
              </div>
            </div>

            {/* Quick Period Presets */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('this-month')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Oct 2026
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('last-month')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sep 2026
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('q4')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Q4 2026
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('fy2026')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                FY 2026 (YTD)
              </button>
            </div>
          </div>

          {/* Contextual Selectors based on report */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Customer Selector for Customer reports */}
            {(selectedReport === 'customer-transactions' || selectedReport === 'customer-aging') && (
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <label className="text-xs text-slate-400 font-medium">Customer:</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 max-w-[200px]"
                >
                  <option value="">All Customers (Summary)</option>
                  {data.customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Supplier Selector for Supplier reports */}
            {(selectedReport === 'supplier-transactions' || selectedReport === 'supplier-payables') && (
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <label className="text-xs text-slate-400 font-medium">Supplier:</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 max-w-[200px]"
                >
                  <option value="">All Suppliers (Summary)</option>
                  {data.suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Search Term */}
            <div className="relative min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search report items..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Printable Report Document */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl printable-document space-y-6">
        {/* Document Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white tracking-tight">{data.businessDetails?.legalName || data.name}</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mt-1">
            {selectedReport === 'customer-transactions' && (
              currentCustomer
                ? `Customer Statement & Transaction Ledger — ${currentCustomer.name} (${currentCustomer.code})`
                : 'Customer Transaction Activity & Ledger Summary'
            )}
            {selectedReport === 'supplier-transactions' && (
              currentSupplier
                ? `Supplier Statement & Transaction Ledger — ${currentSupplier.name} (${currentSupplier.code})`
                : 'Supplier Transaction Activity & Ledger Summary'
            )}
            {selectedReport === 'profit-loss' && 'Statement of Profit and Loss (Income Statement)'}
            {selectedReport === 'balance-sheet' && 'Balance Sheet Statement of Financial Position'}
            {selectedReport === 'trial-balance' && 'General Ledger Trial Balance'}
            {selectedReport === 'customer-aging' && 'Accounts Receivable Customer Aging Summary'}
            {selectedReport === 'supplier-payables' && 'Accounts Payable Supplier Balances'}
            {selectedReport === 'inventory-valuation' && 'Inventory Valuation by Product Line'}
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Reporting Period: <span className="text-slate-200 font-semibold">{startDate || 'Start'}</span> to{' '}
            <span className="text-slate-200 font-semibold">{endDate || 'Present'}</span> · Currency:{' '}
            {data.currency.code} ({data.currency.symbol})
          </p>
        </div>

        {/* =========================================================================
            REPORT 1: CUSTOMER TRANSACTION REPORT
           ========================================================================= */}
        {selectedReport === 'customer-transactions' && (
          <div className="space-y-6">
            {/* If a Specific Customer is Selected: Display Detailed Statement */}
            {currentCustomer && customerReportData ? (
              <div className="space-y-6">
                {/* Customer Details Banner & KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{currentCustomer.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                        {currentCustomer.code}
                      </span>
                    </div>
                    <p className="text-slate-400">{currentCustomer.billingAddress}</p>
                    <p className="text-slate-400 font-mono">{currentCustomer.email} · Credit Limit: {formatCurrency(currentCustomer.creditLimit, data.currency.symbol)}</p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <p className="text-[11px] text-slate-400">Opening Balance ({startDate || 'Start'})</p>
                    <p className="text-sm font-bold font-mono text-slate-200 mt-1">
                      {formatCurrency(customerReportData.openingBalance, data.currency.symbol)}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
                    <p className="text-[11px] text-emerald-400 font-semibold">Closing Balance ({endDate || 'End'})</p>
                    <p className="text-base font-extrabold font-mono text-emerald-400 mt-1">
                      {formatCurrency(customerReportData.closingBalance, data.currency.symbol)}
                    </p>
                  </div>
                </div>

                {/* Summary Metrics Row */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400">Total Invoiced (Debits):</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatCurrency(customerReportData.totalDebits, data.currency.symbol)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400">Total Received (Credits):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(customerReportData.totalCredits, data.currency.symbol)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400">Net Movement:</span>
                    <span className={`font-mono font-bold ${customerReportData.netChange >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {customerReportData.netChange >= 0 ? '+' : ''}{formatCurrency(customerReportData.netChange, data.currency.symbol)}
                    </span>
                  </div>
                </div>

                {/* Customer Detailed Ledger Table */}
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Reference #</th>
                        <th className="py-2.5 px-3">Description & Item Details</th>
                        <th className="py-2.5 px-3 text-right">Debit (Invoiced)</th>
                        <th className="py-2.5 px-3 text-right">Credit (Received)</th>
                        <th className="py-2.5 px-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {/* Row 1: Opening Balance row */}
                      <tr className="bg-slate-950/70 font-medium">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{startDate || '—'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                            Opening Balance
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">—</td>
                        <td className="py-2.5 px-3 text-slate-300 italic">
                          Balance brought forward prior to {startDate || 'first transaction'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">—</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">—</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                          {formatCurrency(customerReportData.openingBalance, data.currency.symbol)}
                        </td>
                      </tr>

                      {/* Period Transactions */}
                      {customerReportData.entries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                            No transactions found for this customer between {startDate} and {endDate}.
                          </td>
                        </tr>
                      ) : (
                        customerReportData.entries.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{entry.date}</td>
                            <td className="py-2.5 px-3">
                              {entry.type === 'Invoice' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                                  Sales Invoice
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                  Receipt
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-white">{entry.reference}</td>
                            <td className="py-2.5 px-3 text-slate-300 max-w-xs">
                              <div>{entry.description}</div>
                              {entry.items && (
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{entry.items}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                              {entry.debit > 0 ? formatCurrency(entry.debit, data.currency.symbol) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                              {entry.credit > 0 ? formatCurrency(entry.credit, data.currency.symbol) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                              {formatCurrency(entry.runningBalance, data.currency.symbol)}
                            </td>
                          </tr>
                        ))
                      )}

                      {/* Final Total Summary Row */}
                      <tr className="bg-slate-950 border-t-2 border-slate-700 font-bold text-xs">
                        <td colSpan={4} className="py-3 px-3 uppercase text-slate-300 tracking-wider">
                          Totals for Period ({customerReportData.entries.length} transactions)
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-200">
                          {formatCurrency(customerReportData.totalDebits, data.currency.symbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">
                          {formatCurrency(customerReportData.totalCredits, data.currency.symbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                          {formatCurrency(customerReportData.closingBalance, data.currency.symbol)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-2 no-print">
                  <button
                    onClick={() => setSelectedCustomerId('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    ← Back to All Customers
                  </button>
                </div>
              </div>
            ) : (
              /* Case B: All Customers View */
              <div className="space-y-4">
                <div className="flex items-center justify-between no-print">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCustomerViewMode('summary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        customerViewMode === 'summary'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Customer Balances & Activity
                    </button>
                    <button
                      onClick={() => setCustomerViewMode('all-ledger')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        customerViewMode === 'all-ledger'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Consolidated Transactions Feed ({consolidatedCustomerLedger.length})
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Click any customer row to view their individual statement & running ledger.
                  </p>
                </div>

                {customerViewMode === 'summary' ? (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Customer Name</th>
                          <th className="py-2.5 px-3">Billing Address</th>
                          <th className="py-2.5 px-3 text-right">Opening Bal.</th>
                          <th className="py-2.5 px-3 text-right">Invoiced (Debits)</th>
                          <th className="py-2.5 px-3 text-right">Received (Credits)</th>
                          <th className="py-2.5 px-3 text-right">Closing Receivable</th>
                          <th className="py-2.5 px-3 text-center no-print">Statement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {allCustomersSummaries.map(item => (
                          <tr
                            key={item.customer.id}
                            className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedCustomerId(item.customer.id)}
                          >
                            <td className="py-2 px-3 font-mono text-slate-400">{item.customer.code}</td>
                            <td className="py-2 px-3 font-semibold text-white">{item.customer.name}</td>
                            <td className="py-2 px-3 text-slate-400 truncate max-w-[160px]">
                              {item.customer.billingAddress}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300">
                              {formatCurrency(item.openingBalance, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-200">
                              {formatCurrency(item.totalDebits, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-400">
                              {formatCurrency(item.totalCredits, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                              {formatCurrency(item.closingBalance, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-center no-print">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedCustomerId(item.customer.id);
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-[11px] text-slate-300 transition-colors"
                              >
                                View Statement →
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Grand Totals */}
                        <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                          <td colSpan={3} className="py-3 px-3 uppercase text-slate-300">
                            Total All Customers ({allCustomersSummaries.length})
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            {formatCurrency(
                              allCustomersSummaries.reduce((s, i) => s + i.openingBalance, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-200">
                            {formatCurrency(
                              allCustomersSummaries.reduce((s, i) => s + i.totalDebits, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400">
                            {formatCurrency(
                              allCustomersSummaries.reduce((s, i) => s + i.totalCredits, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                            {formatCurrency(
                              allCustomersSummaries.reduce((s, i) => s + i.closingBalance, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="no-print"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Consolidated Transactions Feed */
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Reference #</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-right">Debit</th>
                          <th className="py-2.5 px-3 text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {consolidatedCustomerLedger.map(row => (
                          <tr key={row.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{row.date}</td>
                            <td className="py-2.5 px-3 font-medium text-white">
                              {row.customerName}{' '}
                              <span className="text-[10px] text-slate-500 font-mono">({row.customerCode})</span>
                            </td>
                            <td className="py-2.5 px-3">
                              {row.type === 'Invoice' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                                  Sales Invoice
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                  Receipt
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-white">{row.reference}</td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{row.description}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                              {row.debit > 0 ? formatCurrency(row.debit, data.currency.symbol) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                              {row.credit > 0 ? formatCurrency(row.credit, data.currency.symbol) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            REPORT 2: SUPPLIER TRANSACTION REPORT
           ========================================================================= */}
        {selectedReport === 'supplier-transactions' && (
          <div className="space-y-6">
            {/* If a Specific Supplier is Selected: Display Detailed Statement */}
            {currentSupplier && supplierReportData ? (
              <div className="space-y-6">
                {/* Supplier Details Banner & KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{currentSupplier.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        {currentSupplier.code}
                      </span>
                    </div>
                    <p className="text-slate-400">{currentSupplier.address}</p>
                    <p className="text-slate-400 font-mono">{currentSupplier.email} · Credit Limit: {formatCurrency(currentSupplier.creditLimit, data.currency.symbol)}</p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <p className="text-[11px] text-slate-400">Opening Payable ({startDate || 'Start'})</p>
                    <p className="text-sm font-bold font-mono text-slate-200 mt-1">
                      {formatCurrency(supplierReportData.openingBalance, data.currency.symbol)}
                    </p>
                  </div>

                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg">
                    <p className="text-[11px] text-rose-400 font-semibold">Closing Payable ({endDate || 'End'})</p>
                    <p className="text-base font-extrabold font-mono text-rose-400 mt-1">
                      {formatCurrency(supplierReportData.closingBalance, data.currency.symbol)}
                    </p>
                  </div>
                </div>

                {/* Summary Metrics Row */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400">Total Purchases (Credits):</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatCurrency(supplierReportData.totalCredits, data.currency.symbol)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400">Total Payments (Debits):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(supplierReportData.totalDebits, data.currency.symbol)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400">Net Movement:</span>
                    <span className={`font-mono font-bold ${supplierReportData.netChange >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {supplierReportData.netChange >= 0 ? '+' : ''}{formatCurrency(supplierReportData.netChange, data.currency.symbol)}
                    </span>
                  </div>
                </div>

                {/* Supplier Detailed Ledger Table */}
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Reference #</th>
                        <th className="py-2.5 px-3">Description & Item Details</th>
                        <th className="py-2.5 px-3 text-right">Debit (Payment Made)</th>
                        <th className="py-2.5 px-3 text-right">Credit (Purchase Bill)</th>
                        <th className="py-2.5 px-3 text-right">Running Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {/* Opening Balance Row */}
                      <tr className="bg-slate-950/70 font-medium">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{startDate || '—'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                            Opening Balance
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">—</td>
                        <td className="py-2.5 px-3 text-slate-300 italic">
                          Payable brought forward prior to {startDate || 'first transaction'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">—</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">—</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                          {formatCurrency(supplierReportData.openingBalance, data.currency.symbol)}
                        </td>
                      </tr>

                      {/* Period Transactions */}
                      {supplierReportData.entries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                            No transactions recorded with this supplier between {startDate} and {endDate}.
                          </td>
                        </tr>
                      ) : (
                        supplierReportData.entries.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{entry.date}</td>
                            <td className="py-2.5 px-3">
                              {entry.type === 'Purchase' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                  Purchase Bill
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                  Payment
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-white">{entry.reference}</td>
                            <td className="py-2.5 px-3 text-slate-300 max-w-xs">
                              <div>{entry.description}</div>
                              {entry.items && (
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{entry.items}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                              {entry.debit > 0 ? formatCurrency(entry.debit, data.currency.symbol) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                              {entry.credit > 0 ? formatCurrency(entry.credit, data.currency.symbol) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-300">
                              {formatCurrency(entry.runningBalance, data.currency.symbol)}
                            </td>
                          </tr>
                        ))
                      )}

                      {/* Total Summary Row */}
                      <tr className="bg-slate-950 border-t-2 border-slate-700 font-bold text-xs">
                        <td colSpan={4} className="py-3 px-3 uppercase text-slate-300 tracking-wider">
                          Totals for Period ({supplierReportData.entries.length} transactions)
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">
                          {formatCurrency(supplierReportData.totalDebits, data.currency.symbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-200">
                          {formatCurrency(supplierReportData.totalCredits, data.currency.symbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-rose-400 text-sm">
                          {formatCurrency(supplierReportData.closingBalance, data.currency.symbol)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-2 no-print">
                  <button
                    onClick={() => setSelectedSupplierId('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    ← Back to All Suppliers
                  </button>
                </div>
              </div>
            ) : (
              /* Case B: All Suppliers View */
              <div className="space-y-4">
                <div className="flex items-center justify-between no-print">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSupplierViewMode('summary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        supplierViewMode === 'summary'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Supplier Balances & Activity
                    </button>
                    <button
                      onClick={() => setSupplierViewMode('all-ledger')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        supplierViewMode === 'all-ledger'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Consolidated Transactions Feed ({consolidatedSupplierLedger.length})
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Click any supplier row to view their individual statement & running ledger.
                  </p>
                </div>

                {supplierViewMode === 'summary' ? (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Supplier Name</th>
                          <th className="py-2.5 px-3">Market Address</th>
                          <th className="py-2.5 px-3 text-right">Opening Bal.</th>
                          <th className="py-2.5 px-3 text-right">Purchases (Credits)</th>
                          <th className="py-2.5 px-3 text-right">Payments (Debits)</th>
                          <th className="py-2.5 px-3 text-right">Closing Payable</th>
                          <th className="py-2.5 px-3 text-center no-print">Statement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {allSuppliersSummaries.map(item => (
                          <tr
                            key={item.supplier.id}
                            className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedSupplierId(item.supplier.id)}
                          >
                            <td className="py-2 px-3 font-mono text-slate-400">{item.supplier.code}</td>
                            <td className="py-2 px-3 font-semibold text-white">{item.supplier.name}</td>
                            <td className="py-2 px-3 text-slate-400">{item.supplier.address}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300">
                              {formatCurrency(item.openingBalance, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-200">
                              {formatCurrency(item.totalCredits, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-400">
                              {formatCurrency(item.totalDebits, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-rose-400">
                              {formatCurrency(item.closingBalance, data.currency.symbol)}
                            </td>
                            <td className="py-2 px-3 text-center no-print">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedSupplierId(item.supplier.id);
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-[11px] text-slate-300 transition-colors"
                              >
                                View Statement →
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Grand Totals */}
                        <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                          <td colSpan={3} className="py-3 px-3 uppercase text-slate-300">
                            Total All Suppliers ({allSuppliersSummaries.length})
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            {formatCurrency(
                              allSuppliersSummaries.reduce((s, i) => s + i.openingBalance, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-200">
                            {formatCurrency(
                              allSuppliersSummaries.reduce((s, i) => s + i.totalCredits, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400">
                            {formatCurrency(
                              allSuppliersSummaries.reduce((s, i) => s + i.totalDebits, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-rose-400 text-sm">
                            {formatCurrency(
                              allSuppliersSummaries.reduce((s, i) => s + i.closingBalance, 0),
                              data.currency.symbol
                            )}
                          </td>
                          <td className="no-print"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Consolidated Transactions Feed */
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Supplier</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Reference #</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-right">Debit (Payment)</th>
                          <th className="py-2.5 px-3 text-right">Credit (Bill)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {consolidatedSupplierLedger.map(row => (
                          <tr key={row.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{row.date}</td>
                            <td className="py-2.5 px-3 font-medium text-white">
                              {row.supplierName}{' '}
                              <span className="text-[10px] text-slate-500 font-mono">({row.supplierCode})</span>
                            </td>
                            <td className="py-2.5 px-3">
                              {row.type === 'Purchase' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                  Purchase Bill
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                  Payment
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-white">{row.reference}</td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{row.description}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                              {row.debit > 0 ? formatCurrency(row.debit, data.currency.symbol) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                              {row.credit > 0 ? formatCurrency(row.credit, data.currency.symbol) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            REPORT 3: PROFIT & LOSS STATEMENT (With Date Filter Criteria)
           ========================================================================= */}
        {selectedReport === 'profit-loss' && (
          <div className="max-w-2xl mx-auto space-y-6 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-400">Statement Filter Range:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {startDate || 'Beginning'} through {endDate || 'Ending'}
              </span>
            </div>

            {/* Operating Revenue */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-sm text-slate-200 border-b border-slate-800 pb-1.5">
                <span>Operating Revenue</span>
                <span className="font-mono">{formatCurrency(summary.totalSalesRevenue, data.currency.symbol)}</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Sales Invoices Revenue ({summary.periodSalesInvoices.length} invoices in period)</span>
                  <span className="font-mono text-slate-200">{formatCurrency(summary.totalSalesRevenue, data.currency.symbol)}</span>
                </div>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-sm text-slate-200 border-b border-slate-800 pb-1.5">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="font-mono text-rose-300">-{formatCurrency(summary.totalCOGS, data.currency.symbol)}</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Direct Cost of Sold Products in Period</span>
                  <span className="font-mono text-slate-200">-{formatCurrency(summary.totalCOGS, data.currency.symbol)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between font-bold text-sm bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400">
              <span>Gross Profit</span>
              <span className="font-mono">{formatCurrency(summary.grossProfit, data.currency.symbol)}</span>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-sm text-slate-200 border-b border-slate-800 pb-1.5">
                <span>Operating Expenses</span>
                <span className="font-mono text-rose-400">-{formatCurrency(summary.totalOperatingExpenses, data.currency.symbol)}</span>
              </div>
              <div className="pl-4 space-y-1.5 text-slate-400">
                {summary.periodPayments.filter(p => p.payeeType === 'Other').length === 0 ? (
                  <p className="text-slate-500 italic">No non-payable operating expense disbursements in this date range.</p>
                ) : (
                  summary.periodPayments
                    .filter(p => p.payeeType === 'Other')
                    .map(p => (
                      <div key={p.id} className="flex justify-between">
                        <span>{p.payeeName || p.description || 'Operating Expense'} ({p.date})</span>
                        <span className="font-mono">
                          -{formatCurrency(
                            p.lines.reduce((s, l) => s + (l.unitPrice || 0) * (l.qty || 1), 0),
                            data.currency.symbol
                          )}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Net Profit Final Row */}
            <div className="flex justify-between font-extrabold text-base bg-emerald-950/60 p-4 rounded-xl border border-emerald-500/30 text-white">
              <span>NET PROFIT / (LOSS)</span>
              <span className="font-mono text-emerald-400">{formatCurrency(summary.netProfit, data.currency.symbol)}</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            REPORT 4: BALANCE SHEET (Evaluated as of End Date Criteria)
           ========================================================================= */}
        {selectedReport === 'balance-sheet' && (
          <div className="space-y-4">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
              Balance Sheet Position as of <span className="text-white font-mono font-bold">{endDate || 'Current'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Assets */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-blue-400 border-b-2 border-blue-500/40 pb-2 uppercase tracking-wide">
                  Assets
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-300 mb-1">Current Assets</p>
                    <div className="pl-3 space-y-1.5 text-slate-400">
                      <div className="flex justify-between">
                        <span>Cash & Bank Balances (As of {endDate})</span>
                        <span className="font-mono text-slate-200">{formatCurrency(summary.totalCashAndBank, data.currency.symbol)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accounts Receivable (Customer Due as of {endDate})</span>
                        <span className="font-mono text-slate-200">{formatCurrency(summary.totalAccountsReceivable, data.currency.symbol)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inventory on Hand (At Cost as of {endDate})</span>
                        <span className="font-mono text-slate-200">{formatCurrency(summary.totalInventoryValuation, data.currency.symbol)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>TOTAL ASSETS</span>
                    <span className="font-mono text-blue-400">{formatCurrency(summary.totalAssets, data.currency.symbol)}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-rose-400 border-b-2 border-rose-500/40 pb-2 uppercase tracking-wide">
                  Liabilities & Equity
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-300 mb-1">Current Liabilities</p>
                    <div className="pl-3 space-y-1.5 text-slate-400">
                      <div className="flex justify-between">
                        <span>Accounts Payable (Suppliers as of {endDate})</span>
                        <span className="font-mono text-rose-300">{formatCurrency(summary.totalAccountsPayable, data.currency.symbol)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-300 mb-1">Equity</p>
                    <div className="pl-3 space-y-1.5 text-slate-400">
                      <div className="flex justify-between">
                        <span>Owner's Equity & Retained Earnings</span>
                        <span className="font-mono text-slate-200">{formatCurrency(summary.equity, data.currency.symbol)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>TOTAL LIABILITIES & EQUITY</span>
                    <span className="font-mono text-emerald-400">
                      {formatCurrency(summary.totalLiabilities + summary.equity, data.currency.symbol)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            REPORT 5: TRIAL BALANCE (Evaluated as of End Date Criteria)
           ========================================================================= */}
        {selectedReport === 'trial-balance' && (
          <div className="overflow-x-auto text-xs">
            <div className="mb-3 text-xs text-slate-400">
              Ledger Trial Balance balances computed as of <span className="text-white font-mono font-bold">{endDate}</span>:
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Account Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Debit Balance</th>
                  <th className="py-2.5 px-3 text-right">Credit Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono">1100</td>
                  <td className="py-2 px-3 font-medium text-white">Bank and cash accounts</td>
                  <td className="py-2 px-3 text-slate-400">Assets</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    {summary.totalCashAndBank >= 0 ? formatCurrency(summary.totalCashAndBank, data.currency.symbol) : "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-rose-400">
                    {summary.totalCashAndBank < 0 ? formatCurrency(Math.abs(summary.totalCashAndBank), data.currency.symbol) : "—"}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono">1200</td>
                  <td className="py-2 px-3 font-medium text-white">Accounts receivable</td>
                  <td className="py-2 px-3 text-slate-400">Assets</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    {formatCurrency(summary.totalAccountsReceivable, data.currency.symbol)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">—</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono">1300</td>
                  <td className="py-2 px-3 font-medium text-white">Inventory on hand</td>
                  <td className="py-2 px-3 text-slate-400">Assets</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    {formatCurrency(summary.totalInventoryValuation, data.currency.symbol)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">—</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono">2100</td>
                  <td className="py-2 px-3 font-medium text-white">Accounts payable</td>
                  <td className="py-2 px-3 text-slate-400">Liabilities</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">—</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-400">
                    {formatCurrency(summary.totalAccountsPayable, data.currency.symbol)}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono">4200</td>
                  <td className="py-2 px-3 font-medium text-white">Inventory — sales revenue</td>
                  <td className="py-2 px-3 text-slate-400">Income</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">—</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-400">
                    {formatCurrency(summary.totalSalesRevenue, data.currency.symbol)}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono">5100</td>
                  <td className="py-2 px-3 font-medium text-white">Inventory — cost (COGS)</td>
                  <td className="py-2 px-3 text-slate-400">Expenses</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    {formatCurrency(summary.totalCOGS, data.currency.symbol)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">—</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono">5002</td>
                  <td className="py-2 px-3 font-medium text-white">Delivery & General Operating Expenses</td>
                  <td className="py-2 px-3 text-slate-400">Expenses</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    {formatCurrency(summary.totalOperatingExpenses, data.currency.symbol)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            REPORT 6: CUSTOMER RECEIVABLES AGING (With Date Criteria & Customer Selection)
           ========================================================================= */}
        {selectedReport === 'customer-aging' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <p>Aging calculated as of <span className="text-white font-mono font-bold">{endDate}</span></p>
              {selectedCustomerId && (
                <button
                  onClick={() => setSelectedCustomerId('')}
                  className="text-emerald-400 hover:underline cursor-pointer no-print"
                >
                  Show All Customers
                </button>
              )}
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Customer Code</th>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Area</th>
                    <th className="py-2.5 px-3 text-right">0 - 30 Days</th>
                    <th className="py-2.5 px-3 text-right">31 - 60 Days</th>
                    <th className="py-2.5 px-3 text-right">61 - 90 Days</th>
                    <th className="py-2.5 px-3 text-right">90+ Days</th>
                    <th className="py-2.5 px-3 text-right">Total Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customerAgingData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                        No outstanding receivables found as of {endDate}.
                      </td>
                    </tr>
                  ) : (
                    customerAgingData.map(({ customer, balance, b0_30, b31_60, b61_90, b90_plus }) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-slate-800/40 cursor-pointer"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setSelectedReport('customer-transactions');
                        }}
                      >
                        <td className="py-2 px-3 font-mono text-slate-400">{customer.code}</td>
                        <td className="py-2 px-3 font-semibold text-white">{customer.name}</td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-[140px]">{customer.billingAddress}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-300">
                          {formatCurrency(b0_30, data.currency.symbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-amber-400">
                          {formatCurrency(b31_60, data.currency.symbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300">
                          {formatCurrency(b61_90, data.currency.symbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-rose-400">
                          {formatCurrency(b90_plus, data.currency.symbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatCurrency(balance, data.currency.symbol)}
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Aging Totals */}
                  {customerAgingData.length > 0 && (
                    <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                      <td colSpan={3} className="py-3 px-3 uppercase text-slate-300">
                        Total Outstanding Receivables
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {formatCurrency(customerAgingData.reduce((s, i) => s + i.b0_30, 0), data.currency.symbol)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-400">
                        {formatCurrency(customerAgingData.reduce((s, i) => s + i.b31_60, 0), data.currency.symbol)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-300">
                        {formatCurrency(customerAgingData.reduce((s, i) => s + i.b61_90, 0), data.currency.symbol)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-400">
                        {formatCurrency(customerAgingData.reduce((s, i) => s + i.b90_plus, 0), data.currency.symbol)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                        {formatCurrency(customerAgingData.reduce((s, i) => s + i.balance, 0), data.currency.symbol)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            REPORT 7: SUPPLIER PAYABLES (With Date Criteria & Supplier Selection)
           ========================================================================= */}
        {selectedReport === 'supplier-payables' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <p>Supplier payables outstanding as of <span className="text-white font-mono font-bold">{endDate}</span></p>
              {selectedSupplierId && (
                <button
                  onClick={() => setSelectedSupplierId('')}
                  className="text-emerald-400 hover:underline cursor-pointer no-print"
                >
                  Show All Suppliers
                </button>
              )}
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Supplier Code</th>
                    <th className="py-2.5 px-3">Supplier Name</th>
                    <th className="py-2.5 px-3">Market Address</th>
                    <th className="py-2.5 px-3 text-right">Starting Payable</th>
                    <th className="py-2.5 px-3 text-right">Payable Balance as of {endDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {supplierPayablesData.map(({ supplier, balance }) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-800/40 cursor-pointer"
                      onClick={() => {
                        setSelectedSupplierId(supplier.id);
                        setSelectedReport('supplier-transactions');
                      }}
                    >
                      <td className="py-2 px-3 font-mono text-slate-400">{supplier.code}</td>
                      <td className="py-2 px-3 font-semibold text-white">{supplier.name}</td>
                      <td className="py-2 px-3 text-slate-400">{supplier.address}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">
                        {formatCurrency(supplier.startingBalance, data.currency.symbol)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-400">
                        {formatCurrency(balance, data.currency.symbol)}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                    <td colSpan={3} className="py-3 px-3 uppercase text-slate-300">
                      Total Accounts Payable
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(
                        supplierPayablesData.reduce((s, i) => s + (Number(i.supplier.startingBalance) || 0), 0),
                        data.currency.symbol
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400 text-sm">
                      {formatCurrency(
                        supplierPayablesData.reduce((s, i) => s + i.balance, 0),
                        data.currency.symbol
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            REPORT 8: INVENTORY VALUATION (With As-Of Date Criteria)
           ========================================================================= */}
        {selectedReport === 'inventory-valuation' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Inventory valuation and physical stock balance on hand evaluated as of{' '}
              <span className="text-white font-mono font-bold">{endDate}</span>:
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-center">Stock (Packs)</th>
                    <th className="py-2.5 px-3 text-right">Cost Valuation</th>
                    <th className="py-2.5 px-3 text-right">Retail Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {summary.itemStocks
                    .filter(s => {
                      if (!searchTerm) return true;
                      const term = searchTerm.toLowerCase();
                      return s.item.name.toLowerCase().includes(term) || s.item.code.toLowerCase().includes(term);
                    })
                    .map(({ item, currentStock, valuationCost, valuationSale }) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono text-slate-400">{item.code}</td>
                        <td className="py-2 px-3 font-semibold text-white">{item.name}</td>
                        <td className="py-2 px-3 text-slate-400">{item.division}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-300">
                          {formatCurrency(item.purchasePrice, data.currency.symbol)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-200">
                          {currentStock}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-400">
                          {formatCurrency(valuationCost, data.currency.symbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">
                          {formatCurrency(valuationSale, data.currency.symbol)}
                        </td>
                      </tr>
                    ))}

                  <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                    <td colSpan={4} className="py-3 px-3 uppercase text-slate-300">
                      Total Inventory Valuation
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-200">
                      {summary.itemStocks.reduce((s, i) => s + i.currentStock, 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-400 text-sm">
                      {formatCurrency(summary.totalInventoryValuation, data.currency.symbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(
                        summary.itemStocks.reduce((s, i) => s + i.valuationSale, 0),
                        data.currency.symbol
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
