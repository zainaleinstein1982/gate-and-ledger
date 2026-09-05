import React, { useState } from 'react';
import {
  STAGES,
  Scene,
  StageConfig,
  GateACheckResult,
  GateBCheckResult,
} from '../types';
import {
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  UserCheck,
  Film,
  Layers,
  Sliders,
  PlayCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface KanbanBoardProps {
  scenes: Scene[];
  onSelectScene: (scene: Scene) => void;
  onAdvanceStage: (sceneId: string, targetStage: number) => Promise<void>;
  onCheckGateA: (sceneId: string) => Promise<GateACheckResult>;
  onCheckGateB: (sceneId: string) => Promise<GateBCheckResult>;
  onOpenDemoSimulation?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  scenes,
  onSelectScene,
  onAdvanceStage,
  onCheckGateA,
  onCheckGateB,
  onOpenDemoSimulation,
}) => {
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [gateModal, setGateModal] = useState<{
    type: 'GATE_A' | 'GATE_B';
    scene: Scene;
    result?: GateACheckResult | GateBCheckResult;
    loading: boolean;
  } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Canonical Stage Slicing: Gate A after Stage 3 (blocks 4), Gate B after Stage 5 (blocks 6)
  const phase1EarlyStages = STAGES.filter((s) => s.id >= 1 && s.id <= 3); // 1. Breakdown, 2. References, 3. Visual Bible Lock
  const phase1LateStages = STAGES.filter((s) => s.id >= 4 && s.id <= 5);  // 4. Asset Sheets, 5. Library
  const phase2Stages = STAGES.filter((s) => s.phase === 'PRODUCTION');    // 6. Generation, 7. Edit, 8. Cleanup
  const phase3Stages = STAGES.filter((s) => s.phase === 'FINISHING');     // 9. Color, 10. Sound, 11. Master

  const handleAdvance = async (e: React.MouseEvent, scene: Scene, targetStage: number) => {
    e.stopPropagation();
    setErrorBanner(null);
    setAdvancingId(scene.scene_id);
    try {
      await onAdvanceStage(scene.scene_id, targetStage);
    } catch (err: any) {
      setErrorBanner(err.message || 'Cannot advance stage: Gate invariant violated.');
    } finally {
      setAdvancingId(null);
    }
  };

  const handleTestGateA = async (e: React.MouseEvent, scene: Scene) => {
    e.stopPropagation();
    setGateModal({ type: 'GATE_A', scene, loading: true });
    try {
      const result = await onCheckGateA(scene.scene_id);
      setGateModal({ type: 'GATE_A', scene, result, loading: false });
    } catch (err) {
      setGateModal(null);
    }
  };

  const handleTestGateB = async (e: React.MouseEvent, scene: Scene) => {
    e.stopPropagation();
    setGateModal({ type: 'GATE_B', scene, loading: true });
    try {
      const result = await onCheckGateB(scene.scene_id);
      setGateModal({ type: 'GATE_B', scene, result, loading: false });
    } catch (err) {
      setGateModal(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Top Banner Notice */}
      {errorBanner && (
        <div className="bg-rose-950/80 border border-rose-600/60 text-rose-200 px-4 py-3 rounded-lg flex items-start justify-between shadow-lg text-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-rose-100">CLICKHOUSE GATE REJECTION</p>
              <p className="text-rose-300 text-xs mt-0.5">{errorBanner}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-400 hover:text-rose-100 text-xs font-mono ml-4"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Cadence Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Scene Cadence:</span>
          <span className="text-slate-400">
            5 scenes currently moving concurrently through reverse pre-production, generation, and human finishing.
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Phase 1 (1-5) Reverse Lock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span> Phase 2 (6-8) Production
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Phase 3 (9-11) Human Only
          </span>
          {onOpenDemoSimulation && (
            <button
              onClick={onOpenDemoSimulation}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all shrink-0 ml-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Simulation (11 Stages)</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="inline-flex min-w-full space-x-3 items-stretch">
          
          {/* ================= PHASE 1A: PRE-PRODUCTION (STAGES 1, 2, 3) ================= */}
          <div className="flex flex-col bg-slate-950/60 p-2 rounded-2xl border border-amber-500/20 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b border-amber-500/20 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-bold text-xs tracking-wider text-amber-300 uppercase">
                  Phase 1: Pre-Production (1-3)
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                SPECIFICATION (3 → 1)
              </span>
            </div>

            <div className="flex space-x-3">
              {phase1EarlyStages.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  scenes={scenes.filter((s) => s.current_stage === stage.id)}
                  onSelectScene={onSelectScene}
                  onAdvance={handleAdvance}
                  advancingId={advancingId}
                />
              ))}
            </div>
          </div>

          {/* ================= GATE A: WRITTEN-DECISION GATE (BLOCKS STAGE 4) ================= */}
          <div className="flex flex-col items-center justify-between w-44 bg-gradient-to-b from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-dashed border-amber-500/60 rounded-2xl p-3 shadow-xl relative my-1">
            <div className="absolute -top-3 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider shadow">
              GATE A
            </div>

            <div className="text-center mt-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mb-1 shadow">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs text-amber-200 tracking-wider">GATE A</h4>
              <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">Written-Decision Gate</p>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-amber-500/30 text-[10px] text-slate-300 text-center leading-tight my-2">
              <span className="text-amber-400 font-semibold block mb-1">ClickHouse Invariant:</span>
              "Blocks progress into stage 4 until every reference board for the scene has a recorded decision."
            </div>

            <div className="w-full space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 text-center truncate">
                decision IS NULL == 0
              </div>
              <button
                onClick={(e) => {
                  const scene3 = scenes.find((s) => s.scene_id === 'scene_003') || scenes[0];
                  if (scene3) handleTestGateA(e, scene3);
                }}
                className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>Verify Gate A</span>
              </button>
            </div>
          </div>

          {/* ================= PHASE 1B: PRE-PRODUCTION (STAGES 4, 5) ================= */}
          <div className="flex flex-col bg-slate-950/60 p-2 rounded-2xl border border-amber-500/20 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b border-amber-500/20 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-bold text-xs tracking-wider text-amber-300 uppercase">
                  Phase 1: Pre-Production (4-5)
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                PASSPORT LOCK
              </span>
            </div>

            <div className="flex space-x-3">
              {phase1LateStages.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  scenes={scenes.filter((s) => s.current_stage === stage.id)}
                  onSelectScene={onSelectScene}
                  onAdvance={handleAdvance}
                  advancingId={advancingId}
                />
              ))}
            </div>
          </div>

          {/* ================= GATE B: REGISTRY-LOCK GATE (HARDEST GATE: BLOCKS STAGE 6) ================= */}
          <div className="flex flex-col items-center justify-between w-44 bg-gradient-to-b from-sky-950/40 via-slate-900 to-sky-950/40 border-2 border-dashed border-sky-500/60 rounded-2xl p-3 shadow-xl relative my-1">
            <div className="absolute -top-3 px-2 py-0.5 bg-sky-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider shadow">
              GATE B
            </div>

            <div className="text-center mt-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-sky-500/20 border border-sky-500 flex items-center justify-center text-sky-400 mb-1 shadow">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs text-sky-200 tracking-wider">GATE B</h4>
              <p className="text-[10px] text-sky-300/80 font-mono mt-0.5">Registry-Lock Gate</p>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-sky-500/30 text-[10px] text-slate-300 text-center leading-tight my-2">
              <span className="text-sky-400 font-semibold block mb-1">ClickHouse Invariant:</span>
              "Blocks progress into stage 6 until every character, variant, location, and prop reads 'locked'. No row, no render."
            </div>

            <div className="w-full space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 text-center truncate">
                lock_state != 'locked' == 0
              </div>
              <button
                onClick={(e) => {
                  const scene2 = scenes.find((s) => s.scene_id === 'scene_002') || scenes[0];
                  if (scene2) handleTestGateB(e, scene2);
                }}
                className="w-full py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sky-300 rounded text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>Verify Gate B</span>
              </button>
            </div>
          </div>

          {/* ================= PHASE 2: PRODUCTION (STAGES 6, 7, 8) ================= */}
          <div className="flex flex-col bg-slate-950/60 p-2 rounded-2xl border border-sky-500/20 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b border-sky-500/20 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="font-bold text-xs tracking-wider text-sky-300 uppercase">
                  Phase 2: Production (6-8)
                </span>
              </div>
              <span className="text-[10px] font-mono text-sky-400/80 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                PARALLEL CADENCE
              </span>
            </div>

            <div className="flex space-x-3">
              {phase2Stages.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  scenes={scenes.filter((s) => s.current_stage === stage.id)}
                  onSelectScene={onSelectScene}
                  onAdvance={handleAdvance}
                  advancingId={advancingId}
                />
              ))}
            </div>
          </div>

          {/* ================= PHASE 3: FINISHING (HUMAN ONLY - STAGES 9, 10, 11) ================= */}
          <div className="flex flex-col bg-slate-950/60 p-2 rounded-2xl border border-emerald-500/20 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-500/20 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-bold text-xs tracking-wider text-emerald-300 uppercase">
                  Phase 3: Finishing (9-11)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                HUMAN ONLY (NO AI)
              </span>
            </div>

            <div className="flex space-x-3">
              {phase3Stages.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  scenes={scenes.filter((s) => s.current_stage === stage.id)}
                  onSelectScene={onSelectScene}
                  onAdvance={handleAdvance}
                  advancingId={advancingId}
                  isHumanOnly={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Gate Modal */}
      {gateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock className={`w-5 h-5 ${gateModal.type === 'GATE_A' ? 'text-amber-400' : 'text-sky-400'}`} />
                <h3 className="font-bold text-slate-100">
                  {gateModal.type === 'GATE_A' ? 'Gate A: Decision Gate Check' : 'Gate B: Registry Gate Check'}
                </h3>
              </div>
              <button
                onClick={() => setGateModal(null)}
                className="text-slate-400 hover:text-slate-100 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {gateModal.loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                Executing live SQL aggregate query against ClickHouse...
              </div>
            ) : gateModal.result ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border flex items-start gap-3 ${
                    gateModal.result.passed
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {gateModal.result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {gateModal.result.passed ? 'GATE CHECK: PASSED' : 'GATE CHECK: BLOCKED'}
                    </h4>
                    <p className="text-xs mt-1">
                      Scene #{gateModal.scene.scene_number} ("{gateModal.scene.title}")
                    </p>
                  </div>
                </div>

                {/* SQL Query Preview */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Executed ClickHouse SQL Query:
                  </label>
                  <pre className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-mono text-amber-300 overflow-x-auto">
                    {gateModal.result.sql_query}
                  </pre>
                </div>

                {/* Blockers or Metrics */}
                {gateModal.result.blockers.length > 0 ? (
                  <div>
                    <label className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                      Violations & Invariant Blockers:
                    </label>
                    <ul className="space-y-1.5 bg-slate-950/80 border border-rose-900/40 rounded p-3 text-xs text-rose-300">
                      {gateModal.result.blockers.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-slate-950/80 border border-emerald-900/40 rounded p-3 text-xs text-emerald-300">
                    All invariant conditions met in ClickHouse storage. Pipeline advancement authorized.
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      onSelectScene(gateModal.scene);
                      setGateModal(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                  >
                    Open Scene Inspector
                  </button>
                  <button
                    onClick={() => setGateModal(null)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

interface StageColumnProps {
  stage: StageConfig;
  scenes: Scene[];
  onSelectScene: (scene: Scene) => void;
  onAdvance: (e: React.MouseEvent, scene: Scene, targetStage: number) => Promise<void>;
  advancingId: string | null;
  isHumanOnly?: boolean;
}

const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  scenes,
  onSelectScene,
  onAdvance,
  advancingId,
  isHumanOnly = false,
}) => {
  return (
    <div
      className={`w-64 shrink-0 rounded-xl flex flex-col h-[640px] border transition-colors ${
        isHumanOnly
          ? 'bg-slate-900/50 border-emerald-500/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-slate-800 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-slate-500">#{stage.id}</span>
            <h3 className="font-bold text-xs text-slate-100 tracking-wide uppercase truncate">
              {stage.name}
            </h3>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {scenes.length}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
          {stage.description}
        </p>

        {isHumanOnly ? (
          <div className="mt-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            <span>Manual Sign-off</span>
          </div>
        ) : stage.skillCommand ? (
          <div className="mt-1 text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-sky-400">{stage.skillCommand}</span>
            <span className="text-[9px] text-slate-500">Agent Tool</span>
          </div>
        ) : null}
      </div>

      {/* Cards Area */}
      <div className="flex-1 p-2 space-y-2.5 overflow-y-auto custom-scrollbar">
        {scenes.length === 0 ? (
          <div className="h-28 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-slate-600 text-[11px] italic">
            No scenes in stage
          </div>
        ) : (
          scenes.map((scene) => (
            <div
              key={scene.scene_id}
              onClick={() => onSelectScene(scene)}
              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-lg p-3 cursor-pointer transition-all shadow hover:shadow-md group relative"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-medium">
                    SCENE #{scene.scene_number}
                  </span>
                  {scene.is_demo && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      DEMO
                    </span>
                  )}
                </div>

                {/* Status Indicator */}
                {scene.status === 'blocked_at_gate_a' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Blocked @ Gate A
                  </span>
                )}
                {scene.status === 'blocked_at_gate_b' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Blocked @ Gate B
                  </span>
                )}
                {scene.status === 'completed' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Mastered
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-xs text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                {scene.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {scene.synopsis}
              </p>

              {/* Card Meta & Gate Indicators */}
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 font-mono text-slate-400">
                  <span
                    className={`flex items-center gap-1 px-1 rounded ${
                      scene.gate_a_passed
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {scene.gate_a_passed ? 'Gate A ✓' : 'Gate A ⏱'}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-1 rounded ${
                      scene.gate_b_passed
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-sky-400 bg-sky-500/10'
                    }`}
                  >
                    {scene.gate_b_passed ? 'Gate B ✓' : 'Gate B ⏱'}
                  </span>
                </div>

                {/* Advance Button */}
                {stage.id < 11 && (
                  <button
                    disabled={advancingId === scene.scene_id}
                    onClick={(e) => onAdvance(e, scene, stage.id + 1)}
                    className="p-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded transition-colors flex items-center gap-1"
                    title={`Advance to Stage ${stage.id + 1}`}
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
