import React, { useState, useEffect } from 'react';
import { AssetPassport, RegistryRow, Scene, LockState, AuditLogEntry } from '../types';
import { api } from '../api';
import {
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Check,
  ShieldCheck,
  Layers,
  FileText,
  Clock,
} from 'lucide-react';

interface RegistryPanelProps {
  scenes: Scene[];
  passports: AssetPassport[];
  onLockToggle: (rowId: string, state: LockState, actor: string) => Promise<void>;
}

export const RegistryPanel: React.FC<RegistryPanelProps> = ({
  scenes,
  passports,
  onLockToggle,
}) => {
  const [registryRows, setRegistryRows] = useState<RegistryRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actorName] = useState('LEAD_ASSET_STEWARD');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'passports' | 'audit'>('table');

  const fetchRegistryData = async () => {
    setLoading(true);
    try {
      const [regData, auditData] = await Promise.all([
        api.getRegistry(selectedScene),
        api.getAuditLog(25),
      ]);
      setRegistryRows(regData || []);
      setAuditLogs(auditData || []);
    } catch (e) {
      console.warn('Failed to load registry or audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistryData();
  }, [selectedScene]);

  const handleStateChange = async (rowId: string, newState: LockState) => {
    setUpdatingId(rowId);
    try {
      await onLockToggle(rowId, newState, actorName);
      await fetchRegistryData();
    } catch (err: any) {
      console.error('Failed to change registry lock state:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRows = registryRows.filter((r) => {
    const matchesSearch =
      r.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.asset_kind.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.scene_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalLocked = registryRows.filter((r) => r.lock_state === 'locked').length;
  const totalUnlocked = registryRows.filter((r) => r.lock_state !== 'locked').length;

  return (
    <div className="w-full space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-[#0b1636] border border-[#1d3570] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8]">
            CLICKHOUSE CANONICAL REGISTRY
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Asset Registry &amp; Audit Ledger</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Columnar registry memory for digital cinema. &quot;No row, no render&quot; rule enforced before Stage 6.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs border border-[#22458a] text-slate-300 px-3 py-1.5 rounded-xl bg-[#0e1f48]">
            LOCKED: <span className="text-emerald-400 font-bold">{totalLocked}</span> // UNLOCKED:{' '}
            <span className="text-amber-400 font-bold">{totalUnlocked}</span>
          </span>
          <button
            onClick={fetchRegistryData}
            aria-label="Refresh Registry Data"
            className="p-2 border border-[#22458a] rounded-xl text-slate-300 hover:bg-[#152a5c] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#38bdf8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Invariants Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { num: '01', title: 'Lock Assets First', desc: 'Generation is prohibited against unlocked sheets. Gate B enforces.' },
          { num: '02', title: 'One Asset, One Passport', desc: 'Exactly one canonical spec row per asset. Referenced strictly by ID.' },
          { num: '03', title: 'Copied Verbatim', desc: 'Locked fields copy verbatim into 15-block prompts. Never paraphrased.' },
          { num: '04', title: 'Edits Change One Line', desc: 'Revisions are single-line diffs logged in ClickHouse with who/what/when.' },
        ].map((inv) => (
          <div key={inv.num} className="border border-[#1e3870] bg-[#0c183a] p-3.5 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
              <span className="border border-[#284f9b] bg-[#122452] px-1.5 py-0.5 rounded text-[#38bdf8]">
                {inv.num}
              </span>
              <span>{inv.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{inv.desc}</p>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="border border-[#1b3469] bg-[#0b1636] rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex border border-[#213f80] rounded-xl overflow-hidden bg-[#070e24]">
            <button
              onClick={() => setActiveView('table')}
              className={`px-3.5 py-2 text-xs font-mono transition-colors cursor-pointer ${
                activeView === 'table'
                  ? 'bg-[#193574] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registry Rows ({registryRows.length})
            </button>
            <button
              onClick={() => setActiveView('passports')}
              className={`px-3.5 py-2 text-xs font-mono transition-colors cursor-pointer ${
                activeView === 'passports'
                  ? 'bg-[#193574] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Passports ({passports.length})
            </button>
            <button
              onClick={() => setActiveView('audit')}
              className={`px-3.5 py-2 text-xs font-mono transition-colors cursor-pointer ${
                activeView === 'audit'
                  ? 'bg-[#193574] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Diffs ({auditLogs.length})
            </button>
          </div>

          <select
            value={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value)}
            aria-label="Filter Registry by Scene"
            className="bg-[#0e1f4a] border border-[#234791] text-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#38bdf8]"
          >
            <option value="all">All Scenes</option>
            {scenes.map((s) => (
              <option key={s.scene_id} value={s.scene_id}>
                Scene #{s.scene_number}: {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search assets / rows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0e1f4a] border border-[#234791] text-slate-200 pl-8 pr-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#38bdf8] w-full sm:w-56"
          />
        </div>
      </div>

      {/* Main Table / Passports / Audit View */}
      {activeView === 'table' && (
        <div className="border border-[#1e3870] bg-[#0c183a] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#09132e] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1b3469]">
                <tr>
                  <th className="py-3 px-4">Asset ID &amp; Name</th>
                  <th className="py-3 px-4">Kind</th>
                  <th className="py-3 px-4">Scene</th>
                  <th className="py-3 px-4">Anchor Spec</th>
                  <th className="py-3 px-4">Lock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162a56]">
                {filteredRows.map((row) => (
                  <tr key={row.row_id} className="hover:bg-[#102350] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-mono">{row.asset_name}</div>
                      <div className="text-[10px] text-slate-400">{row.asset_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="border border-[#22458a] bg-[#122452] px-2 py-0.5 rounded text-[10px] text-[#38bdf8]">
                        {row.asset_kind}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{row.scene_id}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{row.canonical_spec}</td>
                    <td className="py-3 px-4">
                      {row.lock_state === 'locked' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[10px]">
                          <Unlock className="w-3 h-3" />
                          <span>UNLOCKED</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.lock_state === 'locked' ? (
                        <button
                          onClick={() => handleStateChange(row.row_id, 'unlocked')}
                          disabled={updatingId === row.row_id}
                          className="px-2.5 py-1 rounded bg-[#162d64] border border-[#274f9e] text-slate-200 hover:text-white text-[11px] cursor-pointer"
                        >
                          Unlock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStateChange(row.row_id, 'locked')}
                          disabled={updatingId === row.row_id}
                          className="px-2.5 py-1 rounded bg-emerald-500 text-black font-bold text-[11px] hover:bg-emerald-400 cursor-pointer"
                        >
                          Lock Row
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'passports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {passports.map((p) => (
            <div
              key={p.passport_id}
              className="rounded-2xl border border-[#1e3870] bg-[#0c183a] p-4 space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{p.canonical_name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  v{p.version}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{p.costume_wardrobe_base}</p>
              <div className="text-[10px] font-mono text-slate-400 border-t border-[#182f63] pt-2">
                ID: {p.passport_id} // KIND: {p.asset_kind}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'audit' && (
        <div className="border border-[#1e3870] bg-[#0c183a] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="text-xs font-mono font-bold text-slate-300">
            RECENT CLICKHOUSE AUDIT DIFFS
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.log_id}
                className="p-3 rounded-xl border border-[#182f63] bg-[#08122d] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="text-white font-bold">{log.actor}</span>
                  <span className="text-slate-400"> updated </span>
                  <span className="text-[#38bdf8]">{log.entity_id}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
