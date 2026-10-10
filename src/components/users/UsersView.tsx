import React from 'react';
import {
  Shield,
  UserCheck,
  Laptop,
  Check,
  X,
  Key
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const UsersView: React.FC = () => {
  const { data, currentUser, setCurrentUser } = useAccounting();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Users, Roles & Device Sessions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access control policies and device session monitoring for the MBF enterprise environment.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Currently logged in as: <span className="font-bold text-emerald-400">{currentUser.name}</span> ({currentUser.rolePreset})
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.users.map(user => {
          const isCurrent = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`p-6 bg-slate-900 border rounded-xl space-y-4 ${
                isCurrent ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {user.name}
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Active User
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {user.rolePreset}
                </span>
              </div>

              {/* Permissions List */}
              <div className="pt-3 border-t border-slate-800 text-xs space-y-2">
                <p className="font-semibold text-slate-300">Role Capabilities & Permissions:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {user.permissions.canCreate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Create Entries</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {user.permissions.canEdit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Edit Records</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {user.permissions.canDelete ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Delete Entries</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {user.permissions.canImportExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Export / Backup Data</span>
                  </div>
                </div>
              </div>

              {/* Allowed Tabs */}
              <div className="pt-3 border-t border-slate-800 text-xs">
                <p className="font-semibold text-slate-300 mb-1.5">Authorized Navigation Modules:</p>
                <div className="flex flex-wrap gap-1">
                  {user.allowedTabs.map(tab => (
                    <span key={tab} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              {!isCurrent && (
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentUser(user)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Simulate / Switch to this User
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Device Sessions */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Laptop className="w-4 h-4 text-blue-400" />
          Active Device Sessions
        </h3>

        <div className="divide-y divide-slate-800">
          {data.activeSessions.map(sess => (
            <div key={sess.sessionId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{sess.userName} <span className="font-mono text-slate-500 font-normal">({sess.userEmail})</span></p>
                <p className="text-[11px] text-slate-400 mt-0.5">{sess.deviceLabel} · Session: <span className="font-mono">{sess.sessionId}</span></p>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <span className="font-mono">{new Date(sess.lastActiveAt).toLocaleString()}</span>
                <p className="text-slate-500 text-[10px]">Active Tab: {sess.activeTab}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
