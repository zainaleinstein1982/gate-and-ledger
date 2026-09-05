import React from 'react';
import {
  Clapperboard,
  Database,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Cpu,
  Terminal,
  BookOpen,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewScene: () => void;
  onOpenDemoSimulation?: () => void;
  clickhouseStatus: {
    mode: string;
    host: string;
  } | null;
  geminiConfigured: boolean;
  totalScenes: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewScene,
  onOpenDemoSimulation,
  clickhouseStatus,
  geminiConfigured,
  totalScenes,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Top Banner with Project Context and System Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                GATE & LEDGER
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/40">
                  CLICKHOUSE MCP
                </span>
              </h1>
              <span className="hidden sm:inline-block text-xs text-slate-500">|</span>
              <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                PROJ: SOLARIS RESURGENCE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agentic Pre-Production Pipeline • 11 Gated Stages • Single Source of Truth
            </p>
          </div>
        </div>

        {/* Live Runtime Status Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-750 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-200">
              {clickhouseStatus?.mode === 'clickhouse-cloud-mcp' ? 'ClickHouse Cloud' : 'ClickHouse MCP Engine'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-750 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-slate-200">Gemini 3.8 Flash</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                geminiConfigured ? 'bg-sky-400' : 'bg-amber-400'
              }`}
            ></span>
          </div>

          {onOpenDemoSimulation && (
            <button
              onClick={onOpenDemoSimulation}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-md text-xs transition-all shadow-sm ml-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Simulation</span>
            </button>
          )}

          <button
            onClick={onOpenNewScene}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-md text-xs transition-colors shadow-sm ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scene</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-1.5">
        <nav className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Pipeline Board</span>
            <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {totalScenes}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>ClickHouse Registry</span>
          </button>

          <button
            onClick={() => setActiveTab('economics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'economics'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Reshoot Economics</span>
          </button>

          <button
            onClick={() => setActiveTab('agent-network')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'agent-network'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Agent Network (7 Skills)</span>
          </button>

          <button
            onClick={() => setActiveTab('clickhouse-console')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'clickhouse-console'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>SQL Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('learnings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'learnings'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-300" />
            <span>Learnings & Invariants</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
