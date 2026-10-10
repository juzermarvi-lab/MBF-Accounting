import React, { useState } from 'react';
import {
  Download,
  Upload,
  X,
  FileSpreadsheet,
  FileJson,
  Check,
  AlertCircle,
  Copy,
  CheckCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { BackupData, SalesInvoice, PurchaseInvoice } from '../../types/accounting';
import { arrayToCSV, downloadFile, parseCSV } from '../../utils/csvHelper';
import { formatCurrency, getInvoiceTotal } from '../../utils/accountingMath';

export interface ColumnDef {
  key: string;
  header: string;
  sample?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entityKey: keyof BackupData;
  entityTitle: string;
  columns: ColumnDef[];
  dataList: any[];
  matchKey?: string;
}

export const DataImportExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  entityKey,
  entityTitle,
  columns,
  dataList,
  matchKey = 'code'
}) => {
  const { batchImportEntities, data, addCustomer, addSupplier } = useAccounting();

  const [activeMode, setActiveMode] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [copied, setCopied] = useState(false);

  // Import states
  const [importText, setImportText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  if (!isOpen) return null;

  // Flatten or prepare dataList for export
  const getPreparedExportRows = () => {
    if (entityKey === 'salesInvoices') {
      const rows: any[] = [];
      (dataList as SalesInvoice[]).forEach(inv => {
        const custName = data.customers.find(c => c.id === inv.customerId)?.name || inv.customerId;
        if (inv.lines && inv.lines.length > 0) {
          inv.lines.forEach(line => {
            const itemName = data.inventoryItems.find(i => i.id === line.itemId)?.name || line.description;
            rows.push({
              reference: inv.reference,
              date: inv.date,
              dueDate: inv.dueDate,
              customer: custName,
              item: itemName,
              qty: line.qty,
              unitPrice: line.unitPrice,
              discountPercent: line.discountPercent || 0,
              deliveryCharges: inv.deliveryCharges || 0,
              description: inv.description || line.description || ''
            });
          });
        } else {
          rows.push({
            reference: inv.reference,
            date: inv.date,
            dueDate: inv.dueDate,
            customer: custName,
            item: 'Assorted Food Product',
            qty: 1,
            unitPrice: getInvoiceTotal(inv),
            discountPercent: 0,
            deliveryCharges: inv.deliveryCharges || 0,
            description: inv.description || ''
          });
        }
      });
      return rows;
    }

    if (entityKey === 'purchaseInvoices') {
      const rows: any[] = [];
      (dataList as PurchaseInvoice[]).forEach(inv => {
        const supName = data.suppliers.find(s => s.id === inv.supplierId)?.name || inv.supplierId;
        if (inv.lines && inv.lines.length > 0) {
          inv.lines.forEach(line => {
            const itemName = data.inventoryItems.find(i => i.id === line.itemId)?.name || line.description;
            rows.push({
              reference: inv.reference,
              date: inv.date,
              dueDate: inv.dueDate,
              supplier: supName,
              item: itemName,
              qty: line.qty,
              unitPrice: line.unitPrice,
              description: inv.description || line.description || ''
            });
          });
        } else {
          rows.push({
            reference: inv.reference,
            date: inv.date,
            dueDate: inv.dueDate,
            supplier: supName,
            item: 'Raw Stock',
            qty: 1,
            unitPrice: getInvoiceTotal(inv),
            description: inv.description || ''
          });
        }
      });
      return rows;
    }

    if (entityKey === 'receipts') {
      return dataList.map(r => ({
        reference: r.reference,
        date: r.date,
        customer: r.payerName || data.customers.find(c => c.id === r.customerId)?.name || 'Batool Ezzi',
        amount: r.lines?.reduce((s: number, l: any) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0) || 0,
        description: r.description || ''
      }));
    }

    if (entityKey === 'payments') {
      return dataList.map(p => ({
        reference: p.reference,
        date: p.date,
        payeeName: p.payeeName || 'Supplier',
        amount: p.lines?.reduce((s: number, l: any) => s + (Number(l.qty) || 1) * (Number(l.unitPrice) || 0), 0) || 0,
        description: p.description || ''
      }));
    }

    return dataList;
  };

  // Export handlers
  const getExportContent = () => {
    if (exportFormat === 'json') {
      return JSON.stringify(dataList, null, 2);
    }
    const preparedRows = getPreparedExportRows();
    return arrayToCSV(preparedRows, columns);
  };

  const handleDownloadExport = () => {
    const content = getExportContent();
    const ext = exportFormat === 'json' ? 'json' : 'csv';
    const type = exportFormat === 'json' ? 'application/json' : 'text/csv';
    const filename = `MBF-${entityTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${ext}`;
    downloadFile(content, filename, type);
  };

  const handleCopyClipboard = () => {
    const content = getExportContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Import template generator
  const handleDownloadTemplate = () => {
    const sampleRow1: Record<string, string> = {};
    const sampleRow2: Record<string, string> = {};

    columns.forEach(col => {
      sampleRow1[col.header] = col.sample || 'sample_val_1';
      sampleRow2[col.header] = col.sample ? `${col.sample}_2` : 'sample_val_2';
    });

    const csvTemplate = arrayToCSV([sampleRow1, sampleRow2], columns.map(c => ({ key: c.header, header: c.header })));
    downloadFile(csvTemplate, `Template-${entityTitle.replace(/\s+/g, '-')}.csv`, 'text/csv');
  };

  // File reader for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setImportText(text);
      handleParseText(text);
    };
    reader.readAsText(file);
  };

  // Parse CSV or JSON text
  const handleParseText = (rawText: string) => {
    setImportError('');
    setImportSuccess('');

    if (!rawText.trim()) {
      setParsedPreview(null);
      return;
    }

    try {
      let rawItems: any[] = [];

      // Try JSON first
      if (rawText.trim().startsWith('[') || rawText.trim().startsWith('{')) {
        const parsed = JSON.parse(rawText);
        rawItems = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Try CSV parsing
        const rawRows = parseCSV(rawText);
        if (rawRows.length === 0) {
          setImportError('No valid rows found in CSV. Please verify headers.');
          setParsedPreview(null);
          return;
        }

        // Map CSV headers to internal keys
        rawItems = rawRows.map(row => {
          const mappedObj: Record<string, any> = {};
          columns.forEach(col => {
            const val = row[col.header] ?? row[col.key] ?? '';
            mappedObj[col.key] = val;
          });

          // Copy any extra properties
          Object.keys(row).forEach(header => {
            const matchCol = columns.find(c => c.header === header);
            if (!matchCol) {
              mappedObj[header] = row[header];
            }
          });

          return mappedObj;
        });
      }

      // Grouping and normalization for Sales Invoices
      if (entityKey === 'salesInvoices') {
        const grouped = new Map<string, any>();

        rawItems.forEach((row, index) => {
          const ref = (row.reference || row.invoiceNo || row['Invoice #'] || row['Invoice No'] || `INV-${Date.now().toString().slice(-4)}-${index}`).toString().trim();
          const date = (row.date || row['Date'] || new Date().toISOString().split('T')[0]).toString().trim();
          const dueDate = (row.dueDate || row['Due Date'] || date).toString().trim();
          const delivery = Number(row.deliveryCharges || row['Delivery Charges'] || 0);
          const discountAmt = Number(row.customerDiscountAmount || row['Discount Amount'] || 0);
          const desc = (row.description || row['Description'] || `Sales invoice ${ref}`).toString().trim();

          // Resolve customer
          const custQuery = (row.customer || row['Customer'] || row['Customer Name'] || row.payerName || row.customerId || '').toString().trim();
          let custId = row.customerId;
          if (!custId && custQuery) {
            const matchedCust = data.customers.find(c =>
              c.name.toLowerCase() === custQuery.toLowerCase() ||
              c.code.toLowerCase() === custQuery.toLowerCase() ||
              c.id.toLowerCase() === custQuery.toLowerCase()
            );
            if (matchedCust) {
              custId = matchedCust.id;
            } else {
              // Auto-create customer if not existing
              custId = `cust-imp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
              addCustomer({
                code: `CUST-${(data.customers.length + 1030 + index).toString()}`,
                name: custQuery,
                billingAddress: row.billingAddress || 'Karachi, Pakistan',
                creditLimit: 50000,
                startingBalance: 0,
                email: ''
              });
            }
          }
          if (!custId) {
            custId = data.customers[0]?.id || 'cust-1791187527602-0';
          }

          if (!grouped.has(ref)) {
            grouped.set(ref, {
              id: row.id || `sinv-${Date.now()}-${index}`,
              reference: ref,
              date,
              dueDate,
              customerId: custId,
              customerName: custQuery || data.customers.find(c => c.id === custId)?.name,
              description: desc,
              deliveryCharges: delivery,
              customerDiscountAmount: discountAmt,
              taxInclusive: false,
              lines: Array.isArray(row.lines) ? row.lines : []
            });
          }

          const invoice = grouped.get(ref);

          // Add line items
          if (!Array.isArray(row.lines) || row.lines.length === 0) {
            const itemDesc = (row.item || row['Item'] || row.product || row['Product'] || row.description || 'Assorted Food Product').toString().trim();
            const qty = Number(row.qty || row.quantity || row['Quantity'] || 1);
            const unitPrice = Number(row.unitPrice || row.price || row['Unit Price'] || row.amount || row['Amount'] || 450);
            const discountPct = Number(row.discountPercent || row['Discount %'] || row.discount || 0);

            const matchedItem = data.inventoryItems.find(i =>
              i.name.toLowerCase() === itemDesc.toLowerCase() ||
              i.code.toLowerCase() === itemDesc.toLowerCase()
            );

            invoice.lines.push({
              id: `line-${Date.now()}-${index}-${invoice.lines.length}`,
              itemId: matchedItem?.id,
              description: matchedItem?.name || itemDesc,
              qty: Math.max(1, qty),
              unitPrice: unitPrice,
              discountPercent: discountPct
            });
          }
        });

        setParsedPreview(Array.from(grouped.values()));
        return;
      }

      // Grouping and normalization for Purchase Invoices
      if (entityKey === 'purchaseInvoices') {
        const grouped = new Map<string, any>();

        rawItems.forEach((row, index) => {
          const ref = (row.reference || row.billNo || row['Bill Ref #'] || row['Bill No'] || row['Invoice #'] || `PINV-90${Date.now().toString().slice(-4)}-${index}`).toString().trim();
          const date = (row.date || row['Date'] || new Date().toISOString().split('T')[0]).toString().trim();
          const dueDate = (row.dueDate || row['Due Date'] || date).toString().trim();
          const desc = (row.description || row['Description'] || `Purchase bill ${ref}`).toString().trim();

          // Resolve supplier
          const supQuery = (row.supplier || row['Supplier'] || row['Supplier Name'] || row.supplierId || '').toString().trim();
          let supId = row.supplierId;
          if (!supId && supQuery) {
            const matchedSup = data.suppliers.find(s =>
              s.name.toLowerCase() === supQuery.toLowerCase() ||
              s.code.toLowerCase() === supQuery.toLowerCase() ||
              s.id.toLowerCase() === supQuery.toLowerCase()
            );
            if (matchedSup) {
              supId = matchedSup.id;
            } else {
              supId = `sup-imp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
              addSupplier({
                code: `SUP-${(data.suppliers.length + 2005 + index).toString()}`,
                name: supQuery,
                address: row.address || 'Karachi Market',
                creditLimit: 50000,
                startingBalance: 0,
                email: ''
              });
            }
          }
          if (!supId) {
            supId = data.suppliers[0]?.id || 'sup-1791187527602-1';
          }

          if (!grouped.has(ref)) {
            grouped.set(ref, {
              id: row.id || `pinv-${Date.now()}-${index}`,
              reference: ref,
              date,
              dueDate,
              supplierId: supId,
              supplierName: supQuery || data.suppliers.find(s => s.id === supId)?.name,
              description: desc,
              taxInclusive: false,
              lines: Array.isArray(row.lines) ? row.lines : []
            });
          }

          const bill = grouped.get(ref);

          if (!Array.isArray(row.lines) || row.lines.length === 0) {
            const itemDesc = (row.item || row['Item'] || row.product || row['Product'] || row.description || 'Raw Material / Stock').toString().trim();
            const qty = Number(row.qty || row.quantity || row['Quantity'] || 1);
            const unitPrice = Number(row.unitPrice || row.cost || row['Unit Cost'] || row.price || row.amount || row['Amount'] || 250);

            const matchedItem = data.inventoryItems.find(i =>
              i.name.toLowerCase() === itemDesc.toLowerCase() ||
              i.code.toLowerCase() === itemDesc.toLowerCase()
            );

            bill.lines.push({
              id: `line-${Date.now()}-${index}-${bill.lines.length}`,
              itemId: matchedItem?.id,
              description: matchedItem?.name || itemDesc,
              qty: Math.max(1, qty),
              unitPrice: unitPrice
            });
          }
        });

        setParsedPreview(Array.from(grouped.values()));
        return;
      }

      // Normalization for other entities
      const normalizedItems = rawItems.map((item, index) => {
        const norm = { ...item };

        if (entityKey === 'receipts') {
          if (!norm.receivedInAccountId) {
            norm.receivedInAccountId = data.bankAccounts[2]?.id || data.bankAccounts[0]?.id;
          }
          if (!norm.payerName && norm.customer) {
            norm.payerName = norm.customer;
          }
          if (!norm.date) {
            norm.date = new Date().toISOString().split('T')[0];
          }
          if (!norm.reference) {
            norm.reference = norm['Receipt #'] || `RCP-2026-${(data.receipts.length + 22 + index).toString().padStart(4, '0')}`;
          }
          if (!Array.isArray(norm.lines) || norm.lines.length === 0) {
            norm.lines = [
              {
                id: `rl-${Date.now()}-${index}`,
                accountId: 'acc-ar',
                subAccountId: norm.customerId,
                description: norm.description || `Payment receipt`,
                qty: 1,
                unitPrice: Number(norm.amount || norm.unitPrice || 0)
              }
            ];
          }
        }

        if (entityKey === 'payments') {
          if (!norm.paidFromAccountId) {
            norm.paidFromAccountId = data.bankAccounts[0]?.id;
          }
          if (!norm.payeeName && norm['Payee / Supplier']) {
            norm.payeeName = norm['Payee / Supplier'];
          }
          if (!norm.date) {
            norm.date = new Date().toISOString().split('T')[0];
          }
          if (!norm.reference) {
            norm.reference = norm['Payment #'] || `PMT-2026-${(data.payments.length + 7 + index).toString().padStart(3, '0')}`;
          }
          if (!Array.isArray(norm.lines) || norm.lines.length === 0) {
            norm.lines = [
              {
                id: `pl-${Date.now()}-${index}`,
                accountId: norm.accountId || 'acc-custom-1790935000129',
                description: norm.description || `Payment disbursed`,
                qty: 1,
                unitPrice: Number(norm.amount || norm.unitPrice || 0)
              }
            ];
          }
        }

        if (entityKey === 'chartOfAccounts') {
          if (!norm.code) norm.code = norm['Account Code'] || `${Date.now().toString().slice(-4)}`;
          if (!norm.name) norm.name = norm['Account Name'] || 'Account';
          if (!norm.category) norm.category = norm['Category'] || 'Expenses';
          if (!norm.group) norm.group = norm['Group'] || 'General';
        }

        return norm;
      });

      setParsedPreview(normalizedItems);
    } catch (err: any) {
      setImportError(`Parsing error: ${err.message || 'Invalid format'}`);
      setParsedPreview(null);
    }
  };

  // Commit batch import
  const handleCommitImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;

    const res = batchImportEntities(entityKey, parsedPreview, entityTitle, matchKey);
    setImportSuccess(`Successfully imported ${res.created} new records and updated ${res.updated} existing records!`);
    setTimeout(() => {
      setImportSuccess('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8 p-6 space-y-5">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {entityTitle} — Import & Export Data
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Batch operations for spreadsheet CSVs and JSON payloads.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector (Export vs Import) */}
        <div className="flex items-center justify-between p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          <div className="flex gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveMode('export')}
              className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeMode === 'export'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export {entityTitle} ({dataList.length})</span>
            </button>
            <button
              onClick={() => setActiveMode('import')}
              className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeMode === 'import'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Batch Import CSV / JSON</span>
            </button>
          </div>
        </div>

        {/* 1. EXPORT MODE */}
        {activeMode === 'export' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Export Format:</span>
                <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-md">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                      exportFormat === 'csv' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    CSV (Excel)
                  </button>
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                      exportFormat === 'json' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    JSON
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
                <button
                  onClick={handleDownloadExport}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Preview of exported records */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Data Preview ({dataList.length} records ready):</span>
                <span className="font-mono text-slate-500">
                  {columns.map(c => c.header).join(' · ')}
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 whitespace-pre">
                {getExportContent().slice(0, 2000)}
                {getExportContent().length > 2000 && '\n... [truncated preview]'}
              </div>
            </div>
          </div>
        )}

        {/* 2. IMPORT MODE */}
        {activeMode === 'import' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <p className="font-semibold text-white">Import from Spreadsheet or JSON</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Matches on key <span className="font-mono font-bold text-emerald-400">{matchKey}</span> to update existing or create new.
                </p>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold cursor-pointer whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Get Sample CSV Template</span>
              </button>
            </div>

            {/* Status alerts */}
            {importError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Upload File (.csv or .json)</label>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileChange}
                  className="w-full text-slate-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Or Paste CSV / JSON Content</label>
                <textarea
                  rows={5}
                  placeholder={`Paste CSV content with headers: ${columns.map(c => c.header).join(', ')}...`}
                  value={importText}
                  onChange={e => {
                    setImportText(e.target.value);
                    handleParseText(e.target.value);
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Parsed Preview Table */}
            {parsedPreview && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">
                    Parsed Rows Ready to Commit ({parsedPreview.length} {entityKey === 'salesInvoices' ? 'invoices' : entityKey === 'purchaseInvoices' ? 'bills' : 'items'}):
                  </span>
                  <span className="text-emerald-400 font-medium">Valid headers parsed & structured</span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-medium bg-slate-900/50">
                        {entityKey === 'salesInvoices' || entityKey === 'purchaseInvoices' ? (
                          <>
                            <th className="py-2 px-3">Reference #</th>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">{entityKey === 'salesInvoices' ? 'Customer' : 'Supplier'}</th>
                            <th className="py-2 px-3">Line Items</th>
                            <th className="py-2 px-3 text-right">Total Amount</th>
                          </>
                        ) : (
                          columns.slice(0, 5).map(c => (
                            <th key={c.key} className="py-2 px-3">{c.header}</th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-mono">
                      {entityKey === 'salesInvoices' || entityKey === 'purchaseInvoices' ? (
                        parsedPreview.slice(0, 8).map((inv, rIdx) => {
                          const partyName = entityKey === 'salesInvoices'
                            ? (inv.customerName || data.customers.find(c => c.id === inv.customerId)?.name || inv.customerId)
                            : (inv.supplierName || data.suppliers.find(s => s.id === inv.supplierId)?.name || inv.supplierId);
                          const total = getInvoiceTotal(inv);
                          const itemsSummary = inv.lines?.map((l: any) => `${l.description} (${l.qty}x)`).join(', ') || 'No lines';

                          return (
                            <tr key={rIdx} className="hover:bg-slate-900/40">
                              <td className="py-2 px-3 text-emerald-400 font-bold">{inv.reference}</td>
                              <td className="py-2 px-3 text-slate-300">{inv.date}</td>
                              <td className="py-2 px-3 text-white max-w-[140px] truncate">{partyName}</td>
                              <td className="py-2 px-3 text-slate-400 max-w-[200px] truncate" title={itemsSummary}>{itemsSummary}</td>
                              <td className="py-2 px-3 text-right font-bold text-white">
                                {formatCurrency(total, data.currency.symbol)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        parsedPreview.slice(0, 8).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/40">
                            {columns.slice(0, 5).map(c => (
                              <td key={c.key} className="py-2 px-3 truncate max-w-[150px]">
                                {String(row[c.key] || row[c.header] || '—')}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCommitImport}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    <span>Import {parsedPreview.length} {entityTitle}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
