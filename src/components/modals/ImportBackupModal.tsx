import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, PlusCircle, RefreshCw } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportBackupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { importBackupJSON, data } = useAccounting();

  const [jsonText, setJsonText] = useState('');
  const [importMode, setImportMode] = useState<'new_business' | 'overwrite'>('new_business');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorMsg('');
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim()) {
      setErrorMsg('Please paste or upload a valid JSON backup content.');
      return;
    }

    const res = importBackupJSON(jsonText.trim(), importMode === 'new_business');
    if (res.success) {
      setSuccessMsg(
        importMode === 'new_business'
          ? 'Business imported successfully as a new entity and set to active!'
          : 'Backup restored successfully! Active company database refreshed.'
      );
      setErrorMsg('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Failed to parse JSON backup.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Restore / Import JSON Backup
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload a .json backup file to import as an additional business or restore an existing one.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
          {/* Import Destination Target */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Import Target Destination</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setImportMode('new_business')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  importMode === 'new_business'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  Add as New Business
                </div>
                <p className="text-[11px] text-slate-400">
                  Keeps current businesses untouched; adds this company into your multi-business portfolio.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('overwrite')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  importMode === 'overwrite'
                    ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  Overwrite Active ({data.name})
                </div>
                <p className="text-[11px] text-slate-400">
                  Replaces the ledger & transactions of the currently selected business.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Choose .json File</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full text-slate-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Or Paste Raw Backup JSON</label>
            <textarea
              rows={6}
              placeholder='Paste {"id": "...", "name": "...", "chartOfAccounts": [...]} here...'
              value={jsonText}
              onChange={e => {
                setJsonText(e.target.value);
                setErrorMsg('');
              }}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
            >
              {importMode === 'new_business' ? 'Import as New Business' : 'Restore Active Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
