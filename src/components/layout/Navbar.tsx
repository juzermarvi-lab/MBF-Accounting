import React, { useState } from 'react';
import {
  Download,
  Upload,
  User,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
  Radio
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { AppTabId } from '../../types/accounting';
import { BusinessSwitcherDropdown } from './BusinessSwitcherDropdown';

interface Props {
  onOpenQuickModal: () => void;
  onOpenImportModal: () => void;
  onOpenAddBusiness: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenQuickModal, onOpenImportModal, onOpenAddBusiness }) => {
  const {
    data,
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    exportBackupJSON,
    resetToDefaultBackup,
    authUser,
    cloudSyncStatus,
    cloudSyncError,
    signInWithGoogle,
    signOutGoogle
  } = useAccounting();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabLabels: Record<AppTabId, string> = {
    'summary': 'Executive Summary',
    'bank-accounts': 'Bank & Cash Accounts',
    'receipts': 'Receipts (Money In)',
    'payments': 'Payments (Money Out)',
    'transfers': 'Inter-Account Transfers',
    'customers': 'Customers & Receivables',
    'sales-invoices': 'Sales Invoices',
    'suppliers': 'Suppliers & Payables',
    'purchase-invoices': 'Purchase Invoices',
    'inventory-items': 'Inventory Items & Stock',
    'chart-of-accounts': 'Chart of Accounts',
    'reports': 'Financial Reports',
    'audit-trail': 'Audit Trail & Logs',
    'users': 'Users & Access Control',
    'settings': 'Business Settings & Data'
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md no-print">
      {/* Zone 1: Interactive Brand & Business Switcher */}
      <div className="flex items-center gap-3">
        <BusinessSwitcherDropdown onOpenAddBusiness={onOpenAddBusiness} />

        <span className="hidden sm:inline-block text-slate-700 text-sm">/</span>

        {/* Current Tab Context */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-200">{tabLabels[activeTab] || activeTab}</span>
        </div>
      </div>

      {/* Zone 2: Period / Live Status */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800">
          <span className="text-slate-500">Period:</span>
          <span className="font-mono text-slate-300 font-medium">
            {data.summarySettings.periodStart} → {data.summarySettings.periodEnd}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-medium">{data.summarySettings.accountingMethod}</span>
        </div>

        {/* Cloud Live Collaboration Status Pill */}
        {cloudSyncStatus === 'connected' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold tracking-wide">Cloud Live Sync</span>
          </div>
        )}

        {cloudSyncStatus === 'syncing' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/80 text-blue-400 font-medium animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-[11px] font-semibold">Syncing to Cloud...</span>
          </div>
        )}

        {cloudSyncStatus === 'offline' && !authUser && (
          <button
            onClick={() => signInWithGoogle()}
            title="Sign in with Google to enable real-time collaboration with team members"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-[11px]"
          >
            <Cloud className="w-3 h-3 text-slate-500" />
            <span>Connect Live Cloud</span>
          </button>
        )}

        {cloudSyncStatus === 'error' && (
          <div
            title={cloudSyncError || 'Cloud synchronization encountered an issue'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-800/80 text-rose-400 font-medium text-[11px]"
          >
            <CloudOff className="w-3 h-3" />
            <span>Cloud Reconnecting</span>
          </div>
        )}
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>+ New Entry</span>
        </button>

        {/* Export Backup JSON Button */}
        <button
          onClick={exportBackupJSON}
          title="Export JSON Backup"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Backup JSON</span>
        </button>

        {/* Import Backup Button */}
        <button
          onClick={onOpenImportModal}
          title="Restore / Import Backup JSON"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Restore</span>
        </button>

        {/* Reset to Default Backup */}
        <button
          onClick={() => {
            if (window.confirm("Reset all data back to the default original backup state?")) {
              resetToDefaultBackup();
            }
          }}
          title="Reset to Original Backup"
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Live Cloud Status Trigger for Mobile / Tablet */}
        <div className="lg:hidden">
          {cloudSyncStatus === 'connected' ? (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Cloud Live Sync active" />
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              title="Connect Cloud Live"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User Account & Cloud Sync Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            {authUser?.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={authUser.displayName || 'User'}
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-[11px]">
                {(authUser?.displayName || currentUser.name).charAt(0)}
              </div>
            )}
            <span className="hidden sm:inline font-medium text-slate-200">
              {authUser?.displayName || currentUser.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Account Identity Header */}
              <div className="px-3 py-2.5 border-b border-slate-800 mb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">
                    {authUser?.displayName || currentUser.name}
                  </p>
                  {cloudSyncStatus === 'connected' ? (
                    <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      Local
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                  {authUser?.email || currentUser.email}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-block text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    {currentUser.rolePreset}
                  </span>
                  {authUser && (
                    <span className="text-[10px] text-slate-500">Google Verified</span>
                  )}
                </div>
              </div>

              {/* Cloud Collaboration Action Section */}
              <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-blue-400" />
                    Cloud Real-time Engine
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Firestore</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                  {authUser
                    ? 'All edits, invoices, and businesses sync live to Google Cloud for all connected teammates.'
                    : 'Sign in to Google to sync edits in real-time across all browser sessions.'}
                </p>

                {authUser ? (
                  <button
                    onClick={async () => {
                      await signOutGoogle();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>Sign Out of Cloud Session</span>
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signInWithGoogle();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>

              {/* Simulated Local Roles (for demo & permission testing) */}
              <div className="space-y-0.5">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-500">
                  Switch Role Profile
                </p>
                {data.users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      u.id === currentUser.id
                        ? 'bg-emerald-500/10 text-emerald-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p>{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.rolePreset}</p>
                    </div>
                    {u.id === currentUser.id && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800 mt-2 pt-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Manage Users & Roles
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
