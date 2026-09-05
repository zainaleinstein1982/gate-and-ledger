import React, { useState, useEffect } from 'react';
import { Scene, AssetPassport, GateACheckResult, GateBCheckResult } from './types';
import { StageDetailView } from './components/StageDetailView';
import { RegistryPanel } from './components/RegistryPanel';
import { EconomicsPanel } from './components/EconomicsPanel';
import { AgentNetworkPanel } from './components/AgentNetworkPanel';
import { ClickHouseConsole } from './components/ClickHouseConsole';
import { LearningsPanel } from './components/LearningsPanel';
import { DemoSimulationView } from './components/DemoSimulationView';
import { NewSceneModal } from './components/NewSceneModal';
import { api } from './api';
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Film,
  Camera,
  Layers,
  Sparkles,
  Lock,
  Play,
  Scissors,
  Brush,
  SlidersHorizontal,
  Volume2,
  Award,
  Database,
  Terminal,
  BookOpen,
} from 'lucide-react';

export type NavItem =
  | 'stage-1'
  | 'stage-2'
  | 'stage-3'
  | 'gate-a'
  | 'stage-4'
  | 'stage-5'
  | 'gate-b'
  | 'stage-6'
  | 'stage-7'
  | 'stage-8'
  | 'stage-9'
  | 'stage-10'
  | 'stage-11'
  | 'registry'
  | 'economics'
  | 'agent-network'
  | 'sql-terminal'
  | 'learnings'
  | 'demo-simulation';

export default function App() {
  const [selectedNav, setSelectedNav] = useState<NavItem>('stage-1');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [passports, setPassports] = useState<AssetPassport[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [isNewSceneModalOpen, setIsNewSceneModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [scenesData, passportsData, statusData] = await Promise.all([
        api.getScenes(),
        api.getPassports(),
        api.getStatus(),
      ]);
      setScenes(scenesData);
      setPassports(passportsData);
      setStatus(statusData);
    } catch (e: any) {
      console.error('Failed to load pipeline state:', e);
      setErrorMessage(e.message || 'Unable to connect to ClickHouse backend pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAdvanceStage = async (sceneId: string, targetStage: number) => {
    try {
      await api.advanceStage(sceneId, targetStage, 'DIRECTOR_CHEN');
      const updated = await api.getScenes();
      setScenes(updated);
    } catch (err: any) {
      throw new Error(err.message || 'Stage advancement rejected by ClickHouse invariant check.');
    }
  };

  const handleCheckGateA = async (sceneId: string): Promise<GateACheckResult> => {
    try {
      return await api.checkGateA(sceneId);
    } catch {
      return {
        scene_id: sceneId,
        passed: false,
        sql_query: `SELECT count() FROM shot_cards WHERE scene_id = '${sceneId}' AND (decision IS NULL OR decision = '' OR decision = 'pending');`,
        total_cards: 0,
        unassigned_count: 1,
        approved_count: 0,
        revised_count: 0,
        rejected_count: 0,
        blockers: ['Cannot evaluate Gate A: ClickHouse query error.'],
        execution_ms: 0,
      };
    }
  };

  const handleCheckGateB = async (sceneId: string): Promise<GateBCheckResult> => {
    try {
      return await api.checkGateB(sceneId);
    } catch {
      return {
        scene_id: sceneId,
        passed: false,
        sql_query: `SELECT count() FROM registry_rows WHERE scene_id = '${sceneId}' AND lock_state != 'locked';`,
        total_registry_rows: 0,
        unlocked_count: 1,
        locked_count: 0,
        blockers: ['Cannot evaluate Gate B: ClickHouse query error.'],
        execution_ms: 0,
      };
    }
  };

  const handleLockToggle = async (rowId: string, lock_state: any, actor: string) => {
    try {
      await api.updateRegistryLock(rowId, lock_state, actor);
      const updated = await api.getScenes();
      setScenes(updated);
    } catch (err: any) {
      console.error('Failed to toggle lock state:', err);
    }
  };

  const handleCreateScene = async (title: string, synopsis: string) => {
    const newScene = await api.createScene(title, synopsis);
    setScenes((prev) => [...prev, newScene]);
  };

  const getSceneCountForStage = (stageNum: number) => {
    return scenes.filter((s) => s.current_stage === stageNum).length;
  };

  const gateAPendingCount = scenes.filter((s) => !s.gate_a_passed).length;
  const gateBPendingCount = scenes.filter((s) => s.gate_a_passed && !s.gate_b_passed).length;

  return (
    <div className="flex h-screen w-screen bg-[#070e24] text-slate-100 overflow-hidden font-sans">
      {/* =========================================================================
          LEFT PANEL — FIXED 25% WIDTH, DEEP NAVY SLATE, NO HORIZONTAL SCROLL
         ========================================================================= */}
      <aside className="w-1/4 min-w-[260px] max-w-[320px] flex-shrink-0 bg-[#050b1c] border-r border-[#14244e] flex flex-col h-screen overflow-y-auto overflow-x-hidden select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#14244e] space-y-3 bg-[#070e24]/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-black font-black text-sm shadow-md shadow-sky-500/30">
                G
              </div>
              <div>
                <div className="text-[9px] font-mono tracking-widest uppercase text-[#38bdf8] font-bold">
                  CLICKHOUSE CINEMA
                </div>
                <div className="text-sm font-black tracking-tight text-white font-mono">
                  GATE &amp; LEDGER
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono border border-[#23458a] bg-[#0c183a] px-2 py-0.5 rounded-full text-[#38bdf8]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <button
            onClick={() => setIsNewSceneModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scene</span>
          </button>
        </div>

        {/* 11 Stages Grouped by Phase */}
        <div className="flex-1 py-3 space-y-4 px-2.5">
          {/* Phase 1: Pre-Production */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              PRE-PRODUCTION (1–3)
            </div>

            <button
              onClick={() => setSelectedNav('stage-1')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-1'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>1. Breakdown</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(1)}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('stage-2')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-2'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2. References</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(2)}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('stage-3')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-3'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Visual Bible Lock</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(3)}
              </span>
            </button>

            {/* Gate A Row */}
            <button
              onClick={() => setSelectedNav('gate-a')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'gate-a'
                  ? 'bg-[#132454] text-white border-l-4 border-amber-400 shadow-md shadow-amber-900/40 font-bold'
                  : 'text-amber-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">GATE A: Decisions</span>
              </div>
              <span className="border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 rounded text-[10px] text-amber-300">
                {gateAPendingCount}
              </span>
            </button>

            {/* Asset Sheets & Library */}
            <div className="pt-2 px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              ASSET SHEETS / LIBRARY (4–5)
            </div>

            <button
              onClick={() => setSelectedNav('stage-4')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-4'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>4. Asset Sheets</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(4)}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('stage-5')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-5'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>5. Library &amp; Stress</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(5)}
              </span>
            </button>

            {/* Gate B Row */}
            <button
              onClick={() => setSelectedNav('gate-b')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'gate-b'
                  ? 'bg-[#132454] text-white border-l-4 border-emerald-400 shadow-md shadow-emerald-900/40 font-bold'
                  : 'text-emerald-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">GATE B: Registry</span>
              </div>
              <span className="border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 rounded text-[10px] text-emerald-300">
                {gateBPendingCount}
              </span>
            </button>
          </div>

          {/* Phase 2: Production */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              PRODUCTION (6–8)
            </div>

            <button
              onClick={() => setSelectedNav('stage-6')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-6'
                  ? 'bg-[#132454] text-white border-l-4 border-amber-400 shadow-md shadow-amber-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>6. Generation (Veo)</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(6)}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('stage-7')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-7'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-sky-400" />
                <span>7. Edit Assembly</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(7)}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('stage-8')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-8'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brush className="w-3.5 h-3.5 text-purple-400" />
                <span>8. Cleanup</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(8)}
              </span>
            </button>
          </div>

          {/* Phase 3: Finishing (Human-Only) */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              FINISHING (9–11 HUMAN)
            </div>

            <button
              onClick={() => setSelectedNav('stage-9')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-9'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>9. Color (ACES)</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(9)}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('stage-10')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-10'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] shadow-md shadow-sky-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>10. Sound (-23LUFS)</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(10)}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('stage-11')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'stage-11'
                  ? 'bg-[#132454] text-white border-l-4 border-emerald-400 shadow-md shadow-emerald-900/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>11. Master (DCP)</span>
              </div>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {getSceneCountForStage(11)}
              </span>
            </button>
          </div>

          <div className="border-t border-[#152752] my-2" />

          {/* Secondary Compact Navigation */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              SYSTEM &amp; TELEMETRY
            </div>

            <button
              onClick={() => setSelectedNav('registry')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'registry'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <span>Asset Registry</span>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                {passports.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('economics')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'economics'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <span>Reshoot Economics</span>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                5
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('agent-network')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'agent-network'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <span>Agent Network</span>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                7
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('sql-terminal')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'sql-terminal'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <span>SQL Terminal</span>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                8
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('learnings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'learnings'
                  ? 'bg-[#132454] text-white border-l-4 border-[#38bdf8] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <span>Learnings &amp; Invariants</span>
              <span className="border border-[#1f376e] bg-[#09132e] px-1.5 py-0.2 rounded text-[10px] text-[#93c5fd]">
                3
              </span>
            </button>

            <button
              onClick={() => setSelectedNav('demo-simulation')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                selectedNav === 'demo-simulation'
                  ? 'bg-[#132454] text-white border-l-4 border-amber-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c1738]'
              }`}
            >
              <span>Demo Walkthrough</span>
              <span className="border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 rounded text-[10px] text-amber-300">
                11
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#14244e] text-[10px] font-mono text-slate-400 bg-[#070e24]/70">
          ClickHouse MergeTree // GenAI Veo
        </div>
      </aside>

      {/* =========================================================================
          RIGHT PANEL — FIXED 75% WIDTH, DEEP NAVY BACKGROUND, VERTICAL SCROLL
         ========================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-[#070e24] p-6 lg:p-8">
        {errorMessage && (
          <div className="mb-6 p-4 border border-amber-500/40 bg-amber-500/10 rounded-2xl flex items-center justify-between text-xs font-mono text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{errorMessage} (Using offline local cache)</span>
            </div>
            <button
              onClick={fetchInitialData}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs font-mono">
            <div className="w-8 h-8 border-3 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto mb-3 shadow-lg shadow-sky-500/20" />
            Connecting to ClickHouse and loading visual pipeline...
          </div>
        ) : (
          <>
            {/* Stage Views (Stages 1 through 11, and Gate A, Gate B) */}
            {selectedNav.startsWith('stage-') && (
              <StageDetailView
                selectedStageId={parseInt(selectedNav.replace('stage-', ''), 10)}
                scenes={scenes}
                passports={passports}
                onAdvanceStage={handleAdvanceStage}
                onCheckGateA={handleCheckGateA}
                onCheckGateB={handleCheckGateB}
                onRefreshScenes={fetchInitialData}
              />
            )}

            {selectedNav === 'gate-a' && (
              <StageDetailView
                selectedStageId="gate-a"
                scenes={scenes}
                passports={passports}
                onAdvanceStage={handleAdvanceStage}
                onCheckGateA={handleCheckGateA}
                onCheckGateB={handleCheckGateB}
                onRefreshScenes={fetchInitialData}
              />
            )}

            {selectedNav === 'gate-b' && (
              <StageDetailView
                selectedStageId="gate-b"
                scenes={scenes}
                passports={passports}
                onAdvanceStage={handleAdvanceStage}
                onCheckGateA={handleCheckGateA}
                onCheckGateB={handleCheckGateB}
                onRefreshScenes={fetchInitialData}
              />
            )}

            {/* Registry View */}
            {selectedNav === 'registry' && (
              <RegistryPanel
                scenes={scenes}
                passports={passports}
                onLockToggle={handleLockToggle}
              />
            )}

            {/* Reshoot Economics View */}
            {selectedNav === 'economics' && <EconomicsPanel />}

            {/* Agent Network View */}
            {selectedNav === 'agent-network' && <AgentNetworkPanel scenes={scenes} />}

            {/* SQL Terminal View */}
            {selectedNav === 'sql-terminal' && <ClickHouseConsole />}

            {/* Learnings & Invariants View */}
            {selectedNav === 'learnings' && <LearningsPanel />}

            {/* Demo Simulation Walkthrough */}
            {selectedNav === 'demo-simulation' && (
              <DemoSimulationView onRefreshScenes={fetchInitialData} />
            )}
          </>
        )}
      </main>

      {/* New Scene Modal */}
      <NewSceneModal
        isOpen={isNewSceneModalOpen}
        onClose={() => setIsNewSceneModalOpen(false)}
        onCreateScene={handleCreateScene}
      />
    </div>
  );
}
