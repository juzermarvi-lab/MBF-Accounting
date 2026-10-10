import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Building,
  CheckCircle,
  FileJson,
  Building2,
  Plus,
  Copy,
  Trash2,
  Check,
  Package,
  FileText,
  Users,
  Wallet,
  ArrowRightCircle,
  Archive,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { BusinessDetails, SummarySettings } from '../../types/accounting';

interface Props {
  onOpenImportModal: () => void;
  onOpenAddBusiness: () => void;
}

export const SettingsView: React.FC<Props> = ({ onOpenImportModal, onOpenAddBusiness }) => {
  const {
    data,
    businesses,
    activeBusinessId,
    switchBusiness,
    duplicateBusiness,
    deleteBusiness,
    exportAllBusinessesBackup,
    updateBusinessDetails,
    updateSummarySettings,
    exportBackupJSON,
    resetToDefaultBackup,
    authUser,
    cloudSyncStatus,
    cloudSyncError,
    signInWithGoogle,
    signOutGoogle
  } = useAccounting();

  const [details, setDetails] = useState<BusinessDetails>(data.businessDetails);
  const [summarySettings, setSummarySettings] = useState<SummarySettings>(data.summarySettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState<string | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Sync state whenever active company changes
  useEffect(() => {
    setDetails(data.businessDetails);
    setSummarySettings(data.summarySettings);
  }, [data.id, data.name]);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessDetails(details);
    updateSummarySettings(summarySettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneName.trim() || !cloneModalOpen) return;
    duplicateBusiness(cloneModalOpen, cloneName.trim());
    setCloneModalOpen(null);
    setCloneName('');
  };

  const handleDeleteBusiness = (bizId: string, bizName: string) => {
    if (businesses.length <= 1) {
      setDeleteError('Cannot delete the only business in the system. At least one company must remain.');
      setTimeout(() => setDeleteError(''), 4000);
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete company "${bizName}" and all of its accounting records? This action cannot be undone.`)) {
      const res = deleteBusiness(bizId);
      if (!res.success && res.error) {
        setDeleteError(res.error);
        setTimeout(() => setDeleteError(''), 4000);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            Business Management & System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-company profiles, add new businesses, customize legal metadata, and configure ledger periods.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Changes Saved
          </span>
        )}
      </div>

      {deleteError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError('')} className="text-slate-400 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Multi-Company / Businesses Management Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Registered Companies & Businesses</h3>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                {businesses.length} Active {businesses.length === 1 ? 'Entity' : 'Entities'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Each business maintains its own segregated books, bank accounts, customers, invoices, and financial reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAllBusinessesBackup}
              title="Export all businesses in a single backup bundle"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Bundle Backup</span>
            </button>

            <button
              onClick={onOpenAddBusiness}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Business</span>
            </button>
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map(biz => {
            const isActive = biz.id === activeBusinessId;
            const invCount = biz.salesInvoices ? biz.salesInvoices.length : 0;
            const purCount = biz.purchaseInvoices ? biz.purchaseInvoices.length : 0;
            const custCount = biz.customers ? biz.customers.length : 0;
            const bnkCount = biz.bankAccounts ? biz.bankAccounts.length : 0;
            const itemCount = biz.inventoryItems ? biz.inventoryItems.length : 0;

            return (
              <div
                key={biz.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-950/90 border-emerald-500 ring-1 ring-emerald-500/30 shadow-lg'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top line: Initials, Name, Sector, Active Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 uppercase ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {(biz.name || 'MBF').slice(0, 3)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {biz.name}
                          {isActive && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active Company
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {biz.businessDetails?.legalName || biz.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                        {biz.currency?.code || 'PKR'} ({biz.currency?.symbol || 'Rs'})
                      </span>
                      {biz.sector && (
                        <p className="text-[10px] text-emerald-400 mt-1 font-medium truncate max-w-[130px]">
                          {biz.sector}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Summary Counts Bar */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Invoices</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{invCount + purCount}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Customers</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{custCount}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Banks</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{bnkCount}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Products</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{itemCount}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCloneModalOpen(biz.id);
                        setCloneName(`${biz.name} (Branch)`);
                      }}
                      title="Clone/duplicate this business structure"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBusiness(biz.id, biz.name)}
                      disabled={businesses.length <= 1}
                      title={businesses.length <= 1 ? 'Cannot delete the only business' : 'Delete business'}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        businesses.length <= 1
                          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-red-400 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isActive ? (
                    <span className="text-[11px] text-emerald-400 font-semibold px-2 py-1">
                      Active Books
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchBusiness(biz.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Switch to This Entity</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Cloud Database & Team Collaboration Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Live Cloud Database & Team Collaboration</h3>
              {cloudSyncStatus === 'connected' ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Synced
                </span>
              ) : cloudSyncStatus === 'syncing' ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                  Syncing to Cloud
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Local Mode (Offline)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by Google Cloud Firestore with real-time websocket synchronization. Multiple accountants, cashiers, and managers can update invoices and ledgers simultaneously.
            </p>
          </div>

          <div>
            {authUser ? (
              <button
                onClick={() => signOutGoogle()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Google</span>
              </button>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cloud Engine</p>
            <p className="font-semibold text-white">Google Cloud Firestore</p>
            <p className="text-[11px] text-emerald-400 font-mono">Real-time WebSocket Live</p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Authentication Identity</p>
            <p className="font-semibold text-white truncate">{authUser?.displayName || 'Not Authenticated'}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{authUser?.email || 'Local Browser Session'}</p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Data Synchronization</p>
            <p className="font-semibold text-white">Bidirectional Live Push & Pull</p>
            <p className="text-[11px] text-slate-400">{businesses.length} companies synchronized</p>
          </div>
        </div>

        {cloudSyncError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <CloudOff className="w-4 h-4 shrink-0" />
            <span>Sync Alert: {cloudSyncError}</span>
          </div>
        )}
      </div>

      {/* Backup and JSON Sync Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">Database Backup & Portability</h3>
        </div>
        <p className="text-xs text-slate-400">
          This system is completely driven by your JSON backup. You can download an offline JSON backup for the active company ({data.name}), download a bundle of all companies, or restore backup files.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportBackupJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Active Company JSON ({data.name})
          </button>

          <button
            onClick={exportAllBusinessesBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4 text-emerald-400" />
            Download All Companies Bundle ({businesses.length})
          </button>

          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            Restore / Import Backup File
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to revert company "${data.name}" back to original factory template data?`)) {
                resetToDefaultBackup();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Active Company
          </button>
        </div>
      </div>

      {/* Business Details Form (Edits Active Company) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Active Entity Profile: {data.name}</h3>
              <p className="text-xs text-slate-400">Modify legal registration and header particulars for {data.name}.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
            Currency: {data.currency.code} ({data.currency.symbol})
          </span>
        </div>

        <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Business Trade Name *</label>
              <input
                type="text"
                required
                value={details.name}
                onChange={e => setDetails({ ...details, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Legal Registered Name</label>
              <input
                type="text"
                value={details.legalName}
                onChange={e => setDetails({ ...details, legalName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Industry Sector</label>
              <input
                type="text"
                value={details.sector || ''}
                onChange={e => setDetails({ ...details, sector: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tax ID / NTN *</label>
              <input
                type="text"
                value={details.taxId}
                onChange={e => setDetails({ ...details, taxId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={details.phone}
                onChange={e => setDetails({ ...details, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Official Email</label>
              <input
                type="email"
                value={details.email}
                onChange={e => setDetails({ ...details, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Official Address</label>
              <input
                type="text"
                value={details.address}
                onChange={e => setDetails({ ...details, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Invoice Footer Note / Disclaimers</label>
            <textarea
              rows={2}
              value={details.footerNote || ''}
              onChange={e => setDetails({ ...details, footerNote: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white mb-3">Accounting Standards & Summary Reporting Period</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Accounting Basis</label>
                <select
                  value={summarySettings.accountingMethod}
                  onChange={e => setSummarySettings({ ...summarySettings, accountingMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="Accrual">Accrual Basis</option>
                  <option value="Cash">Cash Basis</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Period Start</label>
                <input
                  type="date"
                  value={summarySettings.periodStart}
                  onChange={e => setSummarySettings({ ...summarySettings, periodStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Period End</label>
                <input
                  type="date"
                  value={summarySettings.periodEnd}
                  onChange={e => setSummarySettings({ ...summarySettings, periodEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate / Clone Modal */}
      {cloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Copy className="w-5 h-5 text-emerald-400" />
              Duplicate / Clone Business
            </h3>
            <p className="text-xs text-slate-400">
              Create a new entity with the same chart of accounts, tax categories, and configurations from the source entity.
            </p>

            <form onSubmit={handleCloneSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">New Business Trade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBF Wholesale Branch, MBF Karachi"
                  value={cloneName}
                  onChange={e => setCloneName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCloneModalOpen(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Create Clone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
