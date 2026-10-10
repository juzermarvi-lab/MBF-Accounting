import React from 'react';
import { Printer, X, CheckCircle, Clock } from 'lucide-react';
import { SalesInvoice } from '../../types/accounting';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, getInvoiceTotal, getSalesInvoicePaidAmount } from '../../utils/accountingMath';

interface Props {
  invoice: SalesInvoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<Props> = ({ invoice, onClose }) => {
  const { data } = useAccounting();

  if (!invoice) return null;

  const customer = data.customers.find(c => c.id === invoice.customerId);
  const total = getInvoiceTotal(invoice);
  const paid = getSalesInvoicePaidAmount(invoice.id, data.receipts);
  const balanceDue = Math.max(0, total - paid);
  const isPaid = balanceDue <= 0.01;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-200">Invoice Document #{invoice.reference}</span>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <CheckCircle className="w-3 h-3" /> Paid in Full
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                <Clock className="w-3 h-3" /> Balance Due: {formatCurrency(balanceDue, data.currency.symbol)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper Container */}
        <div className="p-8 bg-white text-slate-900 printable-document overflow-y-auto max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xl tracking-wider">
                  MBF
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.businessDetails.legalName || "MBF"}</h1>
                  <p className="text-xs font-medium text-emerald-700 tracking-wide uppercase">{data.sector || "Frozen Food Wholesale & Retail"}</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p>{data.businessDetails.address || "Karachi, Pakistan"}</p>
                <p>Phone: <span className="font-mono">{data.businessDetails.phone || "+92 331 2257772"}</span></p>
                <p>Email: {data.businessDetails.email || "accounts@company.io"}</p>
                <p>NTN / Tax ID: <span className="font-mono">{data.businessDetails.taxId || "EIN 84-2910482"}</span></p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-extrabold uppercase tracking-tight text-slate-900">SALES INVOICE</span>
              <div className="mt-2 space-y-1 text-xs">
                <p className="text-slate-500">Invoice No: <span className="font-mono font-bold text-slate-900 text-sm">#{invoice.reference}</span></p>
                <p className="text-slate-500">Invoice Date: <span className="font-mono text-slate-900">{invoice.date}</span></p>
                <p className="text-slate-500">Payment Due: <span className="font-mono text-slate-900">{invoice.dueDate || invoice.date}</span></p>
              </div>
            </div>
          </div>

          {/* Customer / Billed To */}
          <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wider text-slate-400 mb-1">Billed To</p>
              <p className="text-base font-bold text-slate-900">{customer?.name || invoice.customerId}</p>
              <p className="text-slate-600 mt-1">{invoice.billingAddress || customer?.billingAddress || "Karachi, Pakistan"}</p>
              {customer?.code && (
                <p className="text-slate-500 mt-1">Customer Code: <span className="font-mono font-medium text-slate-800">{customer.code}</span></p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold uppercase tracking-wider text-slate-400 mb-1">Payment Status</p>
              {isPaid ? (
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-sm border border-emerald-300">
                  PAID IN FULL
                </div>
              ) : paid > 0 ? (
                <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded text-sm border border-amber-300">
                  PARTIALLY PAID
                </div>
              ) : (
                <div className="inline-block px-3 py-1 bg-red-100 text-red-800 font-bold rounded text-sm border border-red-300">
                  PAYMENT PENDING
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 pr-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  {invoice.lines.some(l => l.discountPercent && l.discountPercent > 0) && (
                    <th className="py-2.5 px-3 text-right">Discount</th>
                  )}
                  <th className="py-2.5 pl-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.lines.map((line, idx) => {
                  const qty = Number(line.qty) || 0;
                  const price = Number(line.unitPrice) || 0;
                  const disc = Number(line.discountPercent) || 0;
                  const lineTotal = qty * price * (1 - disc / 100);
                  const isDiscountLine = price < 0;

                  return (
                    <tr key={line.id || idx} className={isDiscountLine ? "text-red-700 bg-red-50/50" : ""}>
                      <td className="py-2.5 pr-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{line.description}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">{qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                        {formatCurrency(price, data.currency.symbol)}
                      </td>
                      {invoice.lines.some(l => l.discountPercent && l.discountPercent > 0) && (
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {disc > 0 ? `${disc}%` : "—"}
                        </td>
                      )}
                      <td className="py-2.5 pl-3 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(lineTotal, data.currency.symbol)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-4 border-t border-slate-200 text-xs">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-800">
                  {formatCurrency(
                    invoice.lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0),
                    data.currency.symbol
                  )}
                </span>
              </div>

              {((invoice.customerDiscountAmount && invoice.customerDiscountAmount > 0) ||
                (invoice.customerDiscountPercent && invoice.customerDiscountPercent > 0)) && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">
                    -{formatCurrency(invoice.customerDiscountAmount || 0, data.currency.symbol)}
                  </span>
                </div>
              )}

              {invoice.deliveryCharges && invoice.deliveryCharges > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span className="font-mono text-slate-800">
                    +{formatCurrency(invoice.deliveryCharges, data.currency.symbol)}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono">{formatCurrency(total, data.currency.symbol)}</span>
              </div>

              {paid > 0 && (
                <>
                  <div className="flex justify-between text-emerald-700 font-medium pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono">-{formatCurrency(paid, data.currency.symbol)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-slate-200 font-bold text-slate-900">
                    <span>Balance Due:</span>
                    <span className="font-mono text-red-700">{formatCurrency(balanceDue, data.currency.symbol)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer note & Bank info */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-end">
            <div>
              <p className="font-semibold text-slate-800 mb-1">Bank Payment Details:</p>
              <p>Meezan Bank Limited (Islamic)</p>
              <p>Account Title: <span className="font-semibold text-slate-800">MBF / Frozen Food</span></p>
              <p>IBAN: <span className="font-mono">PK71 MEZN 0001 9283 7192 01</span></p>
            </div>
            <div className="text-right">
              <p className="italic text-slate-600">
                {data.businessDetails.footerNote || "Thank you for choosing MBF Frozen Foods! Quality & Hygiene Guaranteed."}
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Generated electronically via MBF Accounting Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
