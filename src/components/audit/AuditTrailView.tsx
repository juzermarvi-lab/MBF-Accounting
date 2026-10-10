import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Download
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { arrayToCSV, downloadFile } from '../../utils/csvHelper';

export const AuditTrailView: React.FC = () => {
  const { data } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'All' | 'Create' | 'Update' | 'Delete'>('All');

  const handleExportLogs = () => {
    const csv = arrayToCSV(filteredLogs, [
      { key: 'timestamp', header: 'Timestamp' },
      { key: 'action', header: 'Action' },
      { key: 'entityType', header: 'Module' },
      { key: 'user', header: 'Operator' },
      { key: 'summary', header: 'Event Details' }
    ]);
    downloadFile(csv, `MBF-Audit-Trail-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const filteredLogs = data.auditHistory.filter(log => {
    const matchesSearch =
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Security & Compliance Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system logs documenting all data creation, updates, settlements, and administrative changes with device signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400">
            Total Logs: <span className="text-white font-bold">{data.auditHistory.length}</span>
          </div>

          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, user, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Action:</span>
          {(['All', 'Create', 'Update', 'Delete'] as const).map(act => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                actionFilter === act
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Device Signature</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Audit Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map(log => {
                const actionBadge: Record<string, string> = {
                  Create: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  Update: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  Delete: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                };

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[220px] truncate">
                      {log.user}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${actionBadge[log.action] || ''}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {log.summary}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
