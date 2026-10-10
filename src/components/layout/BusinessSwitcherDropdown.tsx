import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  Search,
  Settings,
  Briefcase
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

interface Props {
  onOpenAddBusiness: () => void;
}

export const BusinessSwitcherDropdown: React.FC<Props> = ({ onOpenAddBusiness }) => {
  const { data, businesses, activeBusinessId, switchBusiness, setActiveTab } = useAccounting();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBusinesses = businesses.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.sector && b.sector.toLowerCase().includes(q)) ||
      (b.currency && b.currency.code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Brand & Switcher Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 text-left group p-1.5 -ml-1.5 rounded-xl hover:bg-slate-900/80 transition-all cursor-pointer border border-transparent hover:border-slate-800"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shadow-emerald-500/20 transition-colors uppercase shrink-0">
          {(data.name || 'MBF').slice(0, 3)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white tracking-tight leading-none flex items-center gap-1.5">
            <span className="truncate max-w-[130px] sm:max-w-[180px]">{data.name || 'MBF'}</span>
            <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded-sm shrink-0 truncate max-w-[100px]">
              {data.sector || 'Frozen Food'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono flex items-center gap-1">
            <span>{data.currency.code} ({data.currency.symbol})</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[10px]">{businesses.length} {businesses.length === 1 ? 'co.' : 'cos.'}</span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 shrink-0 ml-0.5 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Company / Business
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {businesses.length} Total
            </span>
          </div>

          {/* Search Bar (if 2+ businesses) */}
          {businesses.length > 2 && (
            <div className="p-2 border-b border-slate-800/80 bg-slate-900/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Businesses List */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {filteredBusinesses.map(biz => {
              const isActive = biz.id === activeBusinessId;
              const invCount = biz.salesInvoices ? biz.salesInvoices.length : 0;
              const custCount = biz.customers ? biz.customers.length : 0;

              return (
                <button
                  key={biz.id}
                  onClick={() => {
                    switchBusiness(biz.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950/50 border border-emerald-500/40 shadow-xs'
                      : 'hover:bg-slate-800/60 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {(biz.name || 'MBF').slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {biz.name}
                        </span>
                        {biz.sector && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium shrink-0 truncate max-w-[90px]">
                            {biz.sector}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                        <span className="text-emerald-400 font-semibold">{biz.currency?.code || 'PKR'}</span>
                        <span>·</span>
                        <span>{invCount} Invoices</span>
                        <span>·</span>
                        <span>{custCount} Customers</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isActive ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300">
                        Switch
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredBusinesses.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching businesses found.
              </div>
            )}
          </div>

          {/* Dropdown Bottom Actions */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAddBusiness();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Business</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('settings');
              }}
              title="Manage All Businesses in Settings"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
