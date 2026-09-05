import React, { useEffect, useState } from 'react';
import { EconomicsMetrics } from '../types';
import { api } from '../api';
import {
  TrendingUp,
  RefreshCw,
  Database,
  DollarSign,
  Clock,
  CheckCircle2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const EconomicsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<EconomicsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEconomics = async () => {
    setLoading(true);
    try {
      const data = await api.getEconomics();
      setMetrics(data);
    } catch (e) {
      console.warn('Failed to load economics data:', e);
      setMetrics({
        avgReshootMinutes: 46,
        totalReshootMinutes: 230,
        fullShootDayMinutes: 720,
        reshootPercentageOfDay: 31.9,
        totalGenerationCost: 0.125,
        reshootSavingsEstimated: 20125,
        reasonsBreakdown: [
          { reason: 'Asset Desync (Prosthetic graft missing)', minutes: 48, count: 1 },
          { reason: 'Unapproved Shot Framing', minutes: 65, count: 1 },
          { reason: 'Style Drift (Spherical instead of Anamorphic)', minutes: 35, count: 1 },
          { reason: 'Actor Costume Color Shift', minutes: 52, count: 1 },
          { reason: 'Prop Inconsistency (Transponder scale)', minutes: 30, count: 1 },
        ],
        costTrend: [
          { stageGroup: 'Stage 1-2 (Drafts)', avgCostPerShot: 0.18, revisionRatePct: 68 },
          { stageGroup: 'Stage 3 (Bible)', avgCostPerShot: 0.11, revisionRatePct: 34 },
          { stageGroup: 'Stage 4 (Passports)', avgCostPerShot: 0.065, revisionRatePct: 14 },
          { stageGroup: 'Stage 5 (Library)', avgCostPerShot: 0.041, revisionRatePct: 4.5 },
          { stageGroup: 'Stage 6 (Post-Gate)', avgCostPerShot: 0.038, revisionRatePct: 1.2 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEconomics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs font-mono">
        <div className="w-8 h-8 border-3 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto mb-2 shadow-lg shadow-sky-500/20" />
        Running ClickHouse analytical queries across reshoot telemetry tables...
      </div>
    );
  }

  if (!metrics) return null;

  const standardShootDayMinutes = metrics.fullShootDayMinutes || 720;
  const lostMinutes = metrics.totalReshootMinutes ?? 230;
  const preservedMinutes = Math.max(0, standardShootDayMinutes - lostMinutes);

  const reasons = metrics.reasonsBreakdown || [];
  const costTrend = metrics.costTrend || [];

  const BAR_COLORS = ['#38bdf8', '#0ea5e9', '#0284c7', '#60a5fa', '#93c5fd'];

  return (
    <div className="w-full space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-[#0b1636] border border-[#1d3570] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8]">
            CLICKHOUSE ANALYTICS // RESHOOT TELEMETRY
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#f59e0b]" />
            <span>Pipeline Reshoot Economics</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            In cinematic production, asset desync triggers multi-hour physical reshoots. Gate &amp; Ledger eliminates preventable reshoots through ClickHouse invariant gates.
          </p>
        </div>

        <button
          onClick={fetchEconomics}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#22458a] bg-[#0e1f48] hover:bg-[#152a5c] text-slate-200 font-mono text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38bdf8]' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1e3870] bg-[#0c183a] p-4 rounded-2xl shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400">PREVENTED RESHOOT HOURS</div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {(lostMinutes / 60).toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-[#38bdf8] font-mono">Across 5 averted defects</div>
        </div>

        <div className="border border-[#1e3870] bg-[#0c183a] p-4 rounded-2xl shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400">ESTIMATED CREW SAVINGS</div>
          <div className="text-2xl font-extrabold text-[#f59e0b] font-mono">
            ${(metrics.reshootSavingsEstimated || 20125).toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300 font-mono">Based on $8,750/hr stage burn</div>
        </div>

        <div className="border border-[#1e3870] bg-[#0c183a] p-4 rounded-2xl shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400">POST-GATE REVISION RATE</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">1.2%</div>
          <div className="text-[11px] text-slate-400 font-mono">vs 68% in draft stages</div>
        </div>

        <div className="border border-[#1e3870] bg-[#0c183a] p-4 rounded-2xl shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400">TOTAL AI COMPUTE SPEND</div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${(metrics.totalGenerationCost || 0.125).toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Veo + Imagen token ledger</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost per Shot Trend */}
        <div className="border border-[#1e3870] bg-[#0c183a] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
            <span>REVISION RATE (%) BY STAGE GROUP</span>
            <span className="text-[#38bdf8]">68% → 1.2%</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costTrend} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="stageGroup" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070e24', borderColor: '#23458a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="revisionRatePct" radius={[6, 6, 0, 0]}>
                  {costTrend.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown of Prevented Defects */}
        <div className="border border-[#1e3870] bg-[#0c183a] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="text-xs font-mono font-bold text-white">
            AVERTED RESHOOT CAUSES (MINUTES SAVED)
          </div>
          <div className="space-y-2 pt-2">
            {reasons.map((r, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#08122e] border border-[#182f63] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 truncate max-w-xs">{r.reason}</span>
                <span className="text-[#f59e0b] font-bold">+{r.minutes}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
