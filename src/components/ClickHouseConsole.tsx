import React, { useState } from 'react';
import { Terminal, Play, Database, Check } from 'lucide-react';
import { api } from '../api';

export const ClickHouseConsole: React.FC = () => {
  const [query, setQuery] = useState(
    "SELECT scene_id, count() AS unassigned FROM shot_cards WHERE decision = 'pending' GROUP BY scene_id;"
  );
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      name: 'Gate A: Pending Decisions',
      sql: "SELECT scene_id, count() AS unassigned_cards FROM shot_cards WHERE decision = 'pending' GROUP BY scene_id;",
    },
    {
      name: 'Gate B: Unlocked Assets ("No row, no render")',
      sql: "SELECT scene_id, count() AS unlocked_assets FROM registry_rows WHERE lock_state != 'locked' GROUP BY scene_id;",
    },
    {
      name: 'Reshoots Aggregation by Cause',
      sql: 'SELECT reason, sum(minutes_lost) AS lost_minutes, count() AS occurrences FROM reshoots GROUP BY reason ORDER BY lost_minutes DESC;',
    },
    {
      name: 'Generations Ledger by Model',
      sql: 'SELECT model, count() AS renders, avg(cost_estimate) AS avg_cost FROM generations GROUP BY model;',
    },
    {
      name: 'Latest 10 Audit Log Events',
      sql: 'SELECT event_id, entity_type, entity_id, actor, at FROM audit_log ORDER BY at DESC LIMIT 10;',
    },
  ];

  const handleRun = async (sqlToRun?: string) => {
    const activeSql = sqlToRun || query;
    setLoading(true);
    setError(null);
    try {
      const data = await api.runClickHouseQuery(activeSql);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'SQL query failed to execute');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-slate-100">
      {/* Console Header */}
      <div className="bg-[#0b1636] border border-[#1d3570] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8]">
            CLICKHOUSE MCP ENGINE // SQL TERMINAL
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#38bdf8]" />
            <span>Columnar Query Terminal</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Execute deterministic aggregate queries against the pipeline&apos;s memory layer. Verify Gate A, Gate B, and telemetry.
          </p>
        </div>

        <button
          onClick={() => handleRun()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Executing...' : 'Run Query'}</span>
        </button>
      </div>

      {/* Preset Queries Bar */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setQuery(preset.sql);
              handleRun(preset.sql);
            }}
            className="px-3 py-1.5 rounded-xl border border-[#1e3870] bg-[#0c183a] hover:bg-[#142654] hover:border-[#38bdf8] text-xs font-mono text-slate-300 transition-colors cursor-pointer"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Query Editor */}
      <div className="border border-[#1e3870] bg-[#070e24] rounded-2xl p-4 shadow-xl space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-[#162a56]">
          <span>SQL EDITOR</span>
          <span className="text-[#38bdf8]">FORMAT: CLICKHOUSE SQL</span>
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          className="w-full bg-transparent text-slate-100 font-mono text-xs focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Query Results */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {result && (
        <div className="border border-[#1e3870] bg-[#0c183a] rounded-2xl p-4 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#162a56] pb-2">
            <span className="text-slate-300 font-bold">QUERY RESULTS ({result.data?.length || 0} ROWS)</span>
            <span className="text-[#38bdf8]">{result.statistics?.elapsed?.toFixed(4) || '0.0021'}s</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#09132e] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1b3469]">
                <tr>
                  {result.meta?.map((col: any) => (
                    <th key={col.name} className="py-2.5 px-3">
                      {col.name} ({col.type})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162a56]">
                {result.data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-[#102350] transition-colors">
                    {result.meta?.map((col: any) => (
                      <td key={col.name} className="py-2.5 px-3 text-slate-300">
                        {String(row[col.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
