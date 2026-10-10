import React, { useState } from 'react';
import {
  Building2,
  X,
  Sparkles,
  Coins,
  MapPin,
  Phone,
  Mail,
  FileCheck2,
  Wallet,
  ArrowRight,
  Copy
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { CURRENCY_PRESETS, INDUSTRY_SECTORS } from '../../data/currencies';
import { CurrencyConfig, NewBusinessInput } from '../../types/accounting';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (businessId: string) => void;
}

export const AddBusinessModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { addBusiness, data: currentBusiness } = useAccounting();

  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [sector, setSector] = useState(INDUSTRY_SECTORS[0]);
  const [customSector, setCustomSector] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(CURRENCY_PRESETS[0]);
  const [customCurrencyCode, setCustomCurrencyCode] = useState('');
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState('');
  const [isCustomCurrency, setIsCustomCurrency] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [footerNote, setFooterNote] = useState('');

  const [templateType, setTemplateType] = useState<'clean' | 'clone_current'>('clean');
  const [initialBankName, setInitialBankName] = useState('Cash in Hand');
  const [initialBankBalance, setInitialBankBalance] = useState<string>('0');

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCurrencySelect = (curr: CurrencyConfig) => {
    setSelectedCurrency(curr);
    setIsCustomCurrency(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a business trade name.');
      return;
    }

    const effectiveCurrency: CurrencyConfig = isCustomCurrency
      ? {
          code: customCurrencyCode.trim().toUpperCase() || 'USD',
          symbol: customCurrencySymbol.trim() || '$',
          name: `${customCurrencyCode.trim().toUpperCase() || 'USD'} Currency`
        }
      : selectedCurrency;

    const effectiveSector = sector === 'Other' ? (customSector.trim() || 'General Business') : sector;

    const input: NewBusinessInput = {
      name: name.trim(),
      legalName: legalName.trim() || name.trim(),
      sector: effectiveSector,
      currency: effectiveCurrency,
      email: email.trim(),
      phone: phone.trim(),
      taxId: taxId.trim(),
      address: address.trim(),
      footerNote: footerNote.trim(),
      templateType,
      initialBankName: initialBankName.trim() || 'Cash in Hand',
      initialBankBalance: parseFloat(initialBankBalance) || 0
    };

    try {
      const newId = addBusiness(input);
      // Reset form
      setName('');
      setLegalName('');
      setEmail('');
      setPhone('');
      setTaxId('');
      setAddress('');
      setFooterNote('');
      setErrorMsg('');
      if (onSuccess) onSuccess(newId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create business.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Add New Business Entity
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Multi-Company
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Setup an independent accounting ledger, currency, chart of accounts, and financial reports.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="add-business-form" onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Section 1: Business Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>1. Business Identity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Business Trade Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Falcon Frozen Foods, Apex Trading"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Legal / Registered Entity Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Falcon Enterprises (Pvt) Ltd."
                    value={legalName}
                    onChange={e => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    {INDUSTRY_SECTORS.map(sec => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                    <option value="Other">Other / Custom Sector</option>
                  </select>
                </div>

                {sector === 'Other' && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Custom Sector Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Renewable Energy, Education"
                      value={customSector}
                      onChange={e => setCustomSector(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Currency & Monetary System */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>2. Operational Currency</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomCurrency(!isCustomCurrency)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                >
                  {isCustomCurrency ? '← Choose from Presets' : '+ Custom Currency'}
                </button>
              </div>

              {!isCustomCurrency ? (
                <div>
                  <p className="text-slate-400 text-[11px] mb-2">
                    Select the base ledger currency for this business:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {CURRENCY_PRESETS.slice(0, 12).map(curr => {
                      const isSel = selectedCurrency.code === curr.code;
                      return (
                        <button
                          type="button"
                          key={curr.code}
                          onClick={() => handleCurrencySelect(curr)}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs text-white">{curr.code}</span>
                            <span className="text-xs font-semibold text-emerald-400">{curr.symbol}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{curr.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Currency Code (ISO)</label>
                    <input
                      type="text"
                      placeholder="e.g. MYR, KES, BRL"
                      value={customCurrencyCode}
                      onChange={e => setCustomCurrencyCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      placeholder="e.g. RM, KSh, R$"
                      value={customCurrencySymbol}
                      onChange={e => setCustomCurrencySymbol(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Starting Chart of Accounts & Bank */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                <span>3. Accounting Template & Opening Bank</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTemplateType('clean')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    templateType === 'clean'
                      ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        Clean Standard Accounts
                      </span>
                      {templateType === 'clean' && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-medium">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Starts with fresh standard GAAP/IFRS accounts (Assets, Liabilities, Equity, Revenue, COGS, Expenses). Best for a new company.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('clone_current')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    templateType === 'clone_current'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                        Clone from {currentBusiness.name}
                      </span>
                      {templateType === 'clone_current' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Copies all account codes, custom sub-accounts, and tax codes from current business ({currentBusiness.name}), with zero transaction balances.
                    </p>
                  </div>
                </button>
              </div>

              {/* Initial Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    Opening Bank / Cash Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cash in Hand, Meezan Bank, HBL"
                    value={initialBankName}
                    onChange={e => setInitialBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Opening Balance ({isCustomCurrency ? customCurrencyCode || 'USD' : selectedCurrency.code})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={initialBankBalance}
                    onChange={e => setInitialBankBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Contact & Registration Metadata */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>4. Contact Details & Tax Registration (Optional)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <input
                    type="email"
                    placeholder="accounts@business.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tax ID / NTN / STRN</label>
                  <input
                    type="text"
                    placeholder="e.g. NTN 1234567-8"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Office / Warehouse Address</label>
                <input
                  type="text"
                  placeholder="Plot #, Street, Industrial Area, City, Country"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Live Header Preview</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {(name || 'NEW').slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {name || 'New Business Name'}
                      <span className="text-[9px] uppercase font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1 py-0.2 rounded">
                        {sector === 'Other' ? (customSector || 'General') : sector}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {isCustomCurrency ? customCurrencyCode || 'USD' : selectedCurrency.code} ({isCustomCurrency ? customCurrencySymbol || '$' : selectedCurrency.symbol})
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Opening Bank: {initialBankName || 'Cash in Hand'} ({initialBankBalance || '0'})
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-business-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
          >
            <span>Create & Switch to Business</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
