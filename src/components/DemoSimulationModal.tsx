import React, { useState, useEffect } from 'react';
import {
  STAGES,
  Scene,
  ShotCard,
  AssetPassport,
  RegistryRow,
  GenerationRecord,
  StageId,
} from '../types';
import { api } from '../api';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Film,
  UserCheck,
  Palette,
  Volume2,
  Award,
  ArrowRight,
  FileCode,
  Terminal,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';

interface DemoSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSceneUpdated?: () => void;
  onRefreshScenes?: () => Promise<void> | void;
  onViewInKanban?: (scene: Scene) => void;
  onViewScene?: (scene: Scene) => void;
}

export const DemoSimulationModal: React.FC<DemoSimulationModalProps> = ({
  isOpen,
  onClose,
  onSceneUpdated,
  onRefreshScenes,
  onViewInKanban,
  onViewScene,
}) => {
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [demoScene, setDemoScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gateACheck, setGateACheck] = useState<{ loading: boolean; passed?: boolean; query: string }>({
    loading: false,
    query: `SELECT count() AS unassigned_count FROM shot_cards WHERE scene_id = 'scene_demo_012' AND (decision IS NULL OR decision = '' OR decision = 'pending');`,
  });
  const [gateBCheck, setGateBCheck] = useState<{ loading: boolean; passed?: boolean; query: string }>({
    loading: false,
    query: `SELECT count() AS unlocked_count FROM registry_rows WHERE scene_id = 'scene_demo_012' AND lock_state != 'locked';`,
  });

  // Load or seed demo scene on mount
  useEffect(() => {
    if (!isOpen) return;

    const initDemo = async () => {
      setLoading(true);
      try {
        const res = await api.seedDemoScene();
        if (res?.scene) {
          setDemoScene(res.scene);
          setCurrentStageId(res.scene.current_stage || 1);
        }
      } catch (err) {
        console.warn('Failed to seed demo scene from server, using local fallback:', err);
        setDemoScene({
          scene_id: 'scene_demo_012',
          project_id: 'proj_solaris_2026',
          scene_number: 12,
          title: 'EXTRACTION BEACON',
          synopsis: 'Elena triggers the emergency transponder from the catwalk gantry as alarms strobe in cold blue and amber sodium.',
          current_stage: 1,
          current_phase: 'PRE_PRODUCTION',
          status: 'active',
          gate_a_passed: true,
          gate_b_passed: true,
          is_demo: true,
          finishing_checklist: {
            color_approved: true,
            color_notes: 'Unified exposure across Scene 12\'s 6 shots.',
            sound_approved: true,
            sound_notes: 'Cleaned synced dialogue, -23 LUFS platform loudness.',
            master_approved: true,
            master_notes: 'DCP for festivals, ProRes 4444 XQ archival package locked.',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    initDemo();
  }, [isOpen]);

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStageId((prev) => {
          if (prev >= 11) {
            setIsPlaying(false);
            return 11;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  if (!isOpen) return null;

  const currentStageConfig = STAGES.find((s) => s.id === currentStageId) || STAGES[0];

  const handleAdvanceToStage = async (stageNum: number) => {
    if (!demoScene) return;
    try {
      await api.advanceStage(demoScene.scene_id, stageNum, 'DEMO_SIMULATOR');
      setDemoScene((prev) => (prev ? { ...prev, current_stage: stageNum as any } : null));
      if (onSceneUpdated) onSceneUpdated();
      if (onRefreshScenes) onRefreshScenes();
    } catch (e) {
      // Allow simulation step even if backend rejects
      setDemoScene((prev) => (prev ? { ...prev, current_stage: stageNum as any } : null));
    }
  };

  const handleRunGateACheck = async () => {
    setGateACheck((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.checkGateA('scene_demo_012');
      setGateACheck({ loading: false, passed: res.passed, query: res.sql_query });
    } catch {
      setGateACheck((prev) => ({ ...prev, loading: false, passed: true }));
    }
  };

  const handleRunGateBCheck = async () => {
    setGateBCheck((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.checkGateB('scene_demo_012');
      setGateBCheck({ loading: false, passed: res.passed, query: res.sql_query });
    } catch {
      setGateBCheck((prev) => ({ ...prev, loading: false, passed: true }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  DEMO SIMULATION
                </span>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Scene 12: EXTRACTION BEACON
                </h2>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">11-Stage Pipeline Walkthrough</span>
              </div>
              <p className="text-xs text-slate-400">
                Experience why Phase 1 is reversed to lock specifications before generation, with ClickHouse gate enforcement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto Play / Pause Simulation */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
              title="Automatically step through all 11 stages"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Simulation'}</span>
            </button>

            {(onViewInKanban || onViewScene) && demoScene && (
              <button
                onClick={() => {
                  if (onViewInKanban) onViewInKanban(demoScene);
                  if (onViewScene) onViewScene(demoScene);
                  onClose();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>View on Board</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 11-Stage Interactive Stepper Bar with Gates A & B */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 overflow-x-auto custom-scrollbar">
          <div className="flex items-center space-x-1 min-w-max text-xs">
            {/* Phase 1 Part 1: Stages 1, 2, 3 */}
            {[1, 2, 3].map((stId) => {
              const stage = STAGES.find((s) => s.id === stId)!;
              const isCurrent = currentStageId === stId;
              const isPast = currentStageId > stId;
              return (
                <button
                  key={stId}
                  onClick={() => setCurrentStageId(stId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-2 ring-amber-400/50'
                      : isPast
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span className="font-mono text-[11px]">{stId}.</span>
                  <span>{stage.name}</span>
                  {isPast && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              );
            })}

            {/* GATE A CHECKPOINT */}
            <div className="flex items-center px-1.5">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border-2 border-dashed ${
                  currentStageId >= 4
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-amber-600/70 text-amber-400/80 bg-slate-900'
                }`}
                title="Gate A: Written Decision Gate (Blocks Stage 4)"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Gate A</span>
              </div>
            </div>

            {/* Phase 1 Part 2: Stages 4, 5 */}
            {[4, 5].map((stId) => {
              const stage = STAGES.find((s) => s.id === stId)!;
              const isCurrent = currentStageId === stId;
              const isPast = currentStageId > stId;
              return (
                <button
                  key={stId}
                  onClick={() => setCurrentStageId(stId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-2 ring-amber-400/50'
                      : isPast
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span className="font-mono text-[11px]">{stId}.</span>
                  <span>{stage.name}</span>
                  {isPast && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              );
            })}

            {/* GATE B CHECKPOINT */}
            <div className="flex items-center px-1.5">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border-2 border-dashed ${
                  currentStageId >= 6
                    ? 'border-sky-400 text-sky-300 bg-sky-500/10'
                    : 'border-sky-600/70 text-sky-400/80 bg-slate-900'
                }`}
                title="Gate B: Registry Lock Gate (Blocks Stage 6 - 'No row, no render')"
              >
                <Lock className="w-3 h-3 text-sky-400" />
                <span>Gate B</span>
              </div>
            </div>

            {/* Phase 2: Production: Stages 6, 7, 8 */}
            {[6, 7, 8].map((stId) => {
              const stage = STAGES.find((s) => s.id === stId)!;
              const isCurrent = currentStageId === stId;
              const isPast = currentStageId > stId;
              return (
                <button
                  key={stId}
                  onClick={() => setCurrentStageId(stId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-md ring-2 ring-sky-400/50'
                      : isPast
                      ? 'bg-sky-950/40 text-sky-300 border border-sky-500/30 hover:bg-sky-900/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span className="font-mono text-[11px]">{stId}.</span>
                  <span>{stage.name}</span>
                  {isPast && <Check className="w-3 h-3 text-sky-400" />}
                </button>
              );
            })}

            {/* Phase 3: Finishing: Stages 9, 10, 11 (Human Only) */}
            {[9, 10, 11].map((stId) => {
              const stage = STAGES.find((s) => s.id === stId)!;
              const isCurrent = currentStageId === stId;
              const isPast = currentStageId > stId;
              return (
                <button
                  key={stId}
                  onClick={() => setCurrentStageId(stId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md ring-2 ring-emerald-400/50'
                      : isPast
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span className="font-mono text-[11px]">{stId}.</span>
                  <span>{stage.name}</span>
                  {isPast && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Stage Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-850">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  STAGE {currentStageConfig.id} OF 11
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    currentStageConfig.phase === 'PRE_PRODUCTION'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : currentStageConfig.phase === 'PRODUCTION'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  PHASE: {currentStageConfig.phase.replace('_', ' ')}
                </span>
                {currentStageConfig.phase === 'FINISHING' ? (
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    HUMAN ONLY (NO AI)
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-400 bg-slate-850 px-2 py-0.5 rounded">
                    {currentStageConfig.roleDescription}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {currentStageConfig.id}. {currentStageConfig.name}
                <span className="text-sm font-normal text-slate-400">
                  — {currentStageConfig.description}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAdvanceToStage(currentStageConfig.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Sync Scene to Stage {currentStageConfig.id}</span>
              </button>
            </div>
          </div>

          {/* Two-Column Deep Dive: 1. Why it Exists & 2. What it Produces */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Why It Exists & Architectural Role (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Why This Stage Exists</span>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed space-y-2.5">
                  {currentStageId === 1 && (
                    <>
                      <p>
                        In a traditional production, scripts are treated as loose text until shoot day, leading to sudden budget overruns.
                      </p>
                      <p>
                        <strong className="text-white">Breakdown</strong> converts raw script action into discrete, addressable <em>Shot Cards</em> with explicit camera angles, sluglines, lighting rules, and asset references before any pixels are generated.
                      </p>
                      <div className="text-xs font-mono p-2.5 bg-slate-900 rounded border border-slate-800 text-amber-300/90">
                        "Every visual element must exist as a queryable record in ClickHouse."
                      </div>
                    </>
                  )}

                  {currentStageId === 2 && (
                    <>
                      <p>
                        Standard AI image generation creates hallucinations because models guess lighting, costume weave, and set architecture on every prompt.
                      </p>
                      <p>
                        <strong className="text-white">References</strong> fixes digital references <em>before anything else</em> (reversing traditional pre-production). Visual anchors, RGB palette limits, and lighting ratios are locked as a formal specification.
                      </p>
                      <div className="text-xs font-mono p-2.5 bg-slate-900 rounded border border-slate-800 text-amber-300/90">
                        Specification anchors: 60:30:10 color ratio, lens packages, and lighting rules per asset.
                      </div>
                    </>
                  )}

                  {currentStageId === 3 && (
                    <>
                      <p>
                        Without a formal lock step, subjective notes like "make it look cooler" cause endless regenerations.
                      </p>
                      <p>
                        <strong className="text-white">Visual Bible Lock</strong> requires that every single reference board receives a written, attributable decision (<code className="text-emerald-400">approved</code>, <code className="text-amber-400">revised</code>, or <code className="text-rose-400">rejected</code>) recorded in ClickHouse.
                      </p>
                      <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded text-xs text-amber-200">
                        <strong>Pre-requisite for Gate A:</strong> Blocks progress into Stage 4 until zero unassigned boards remain.
                      </div>
                    </>
                  )}

                  {currentStageId === 4 && (
                    <>
                      <p>
                        Characters, props, and environments need consistent physical rules that persist across multiple cameras, angles, and scenes.
                      </p>
                      <p>
                        <strong className="text-white">Asset Sheets</strong> creates immutable <em>Asset Passports</em> containing a 6-part specification: Visual Anchors, Costume/Materials, Hex Swatches, Lighting Geometry, Negative Invariants, and Canonical Prompt Phrases.
                      </p>
                      <div className="text-xs font-mono p-2.5 bg-slate-900 rounded border border-slate-800 text-amber-300/90">
                        Supports narrative variants: e.g., @elena vs @elena_injured.
                      </div>
                    </>
                  )}

                  {currentStageId === 5 && (
                    <>
                      <p>
                        An untested prompt will drift when placed under extreme lighting or optical distortion.
                      </p>
                      <p>
                        <strong className="text-white">Library</strong> runs automated stress-testing against lens halation, dense steam, and color casts. Once verified, the asset steward sets <code className="text-sky-300">lock_state = 'locked'</code> in ClickHouse.
                      </p>
                      <div className="p-2.5 bg-sky-950/40 border border-sky-500/40 rounded text-xs text-sky-200">
                        <strong>Pre-requisite for Gate B:</strong> The hardest gate in the studio. No row in ClickHouse, no render in production.
                      </div>
                    </>
                  )}

                  {currentStageId === 6 && (
                    <>
                      <p>
                        The core generative stage. Because Gates A and B are locked, prompt engineers never have to guess character clothing or lighting temperatures.
                      </p>
                      <p>
                        <strong className="text-white">Generation</strong> compiles the locked passports and shot cards into the <em>fixed 15-block prompt structure</em> and directs Gemini 3.8 Flash to produce high-resolution cinematic frames.
                      </p>
                      <div className="text-xs font-mono p-2.5 bg-slate-900 rounded border border-slate-800 text-sky-300/90">
                        Fixed 15-Block Invariant: Verbatim passport text + negative invariant suppression.
                      </div>
                    </>
                  )}

                  {currentStageId === 7 && (
                    <>
                      <p>
                        Sequential pipelines freeze: while generation renders, editors sit idle; when editing starts, directors wait.
                      </p>
                      <p>
                        <strong className="text-white">Edit</strong> implements a continuous parallel cadence: while Scene N generates, the editor assembles Scene N-1, and the director team shotlists Scene N+1.
                      </p>
                      <div className="text-xs font-mono p-2.5 bg-slate-900 rounded border border-slate-800 text-sky-300/90">
                        Pipelined assembly prevents production bottlenecks and guarantees pacing continuity.
                      </div>
                    </>
                  )}

                  {currentStageId === 8 && (
                    <>
                      <p>
                        Generative outputs occasionally leave small artifacts (e.g. garbled typography, extra seams, or boundary seams).
                      </p>
                      <p>
                        <strong className="text-white">Cleanup</strong> applies shot-by-shot digital matte fixes and enforces text suppression rules (all legible signage is added here as deliberate VFX plates).
                      </p>
                      <div className="text-xs font-mono p-2.5 bg-slate-900 rounded border border-slate-800 text-sky-300/90">
                        Completes Phase 2 (Production) and prepares locked frames for human finishing.
                      </div>
                    </>
                  )}

                  {currentStageId === 9 && (
                    <>
                      <p>
                        AI models cannot do true color grading because they don't understand linear scene-referred ACES color science or projector gamut transforms.
                      </p>
                      <p>
                        <strong className="text-white">Color (Human-Only)</strong>: An outsourced master colorist transforms shots into ACEScc, balances highlights, and applies the official production LUT.
                      </p>
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs text-emerald-200">
                        Strict studio rule: No AI skill touches Phase 3 Finishing stages.
                      </div>
                    </>
                  )}

                  {currentStageId === 10 && (
                    <>
                      <p>
                        Synthesized dialogue and environmental audio lack proper acoustic impulse response, frequency masking, and broadcast compliance.
                      </p>
                      <p>
                        <strong className="text-white">Sound (Human-Only)</strong>: An outsourced post team cleans dialogue recordings, layers Foley and spatial steam atmos, and mixes the 5.1/stereo tracks to -23 LUFS.
                      </p>
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs text-emerald-200">
                        Human sound supervisor signs off on final stem delivery.
                      </div>
                    </>
                  )}

                  {currentStageId === 11 && (
                    <>
                      <p>
                        Distribution requires rigorous packaging formats that pass QC at film festivals and theatrical streaming platforms.
                      </p>
                      <p>
                        <strong className="text-white">Master (Finishing)</strong>: Generates DCI-compliant Digital Cinema Packages (DCP), 12-bit ProRes 4444 XQ archives, and commits the full ClickHouse audit ledger.
                      </p>
                      <div className="text-xs font-mono p-2.5 bg-slate-900 rounded border border-slate-800 text-emerald-300/90">
                        Complete verifiable chain of custody: from Breakdown script card to festival DCP.
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gate Invariant Check Box (Interactive) */}
              {(currentStageId === 3 || currentStageId === 4) && (
                <div className="bg-amber-950/30 border-2 border-dashed border-amber-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>GATE A (Written-Decision Gate)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      BLOCKS STAGE 4
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Blocks progress into stage 4 until every reference board for Scene 12 has a recorded decision in ClickHouse:
                  </p>

                  <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-amber-300 break-all border border-slate-850">
                    {gateACheck.query}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleRunGateACheck}
                      disabled={gateACheck.loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded text-xs font-medium transition-colors"
                    >
                      {gateACheck.loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sliders className="w-3.5 h-3.5" />
                      )}
                      <span>Test Gate A Query</span>
                    </button>
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>COUNT == 0 (OPEN)</span>
                    </span>
                  </div>
                </div>
              )}

              {(currentStageId === 5 || currentStageId === 6) && (
                <div className="bg-sky-950/30 border-2 border-dashed border-sky-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                      <Lock className="w-4 h-4 text-sky-400" />
                      <span>GATE B (Registry-Lock Gate)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      HARDEST GATE: BLOCKS STAGE 6
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Blocks progress into stage 6 until every character, variant, location, and prop touching Scene 12 has a registry row marked "locked". "No row, no render."
                  </p>

                  <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-sky-300 break-all border border-slate-850">
                    {gateBCheck.query}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleRunGateBCheck}
                      disabled={gateBCheck.loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sky-300 rounded text-xs font-medium transition-colors"
                    >
                      {gateBCheck.loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sliders className="w-3.5 h-3.5" />
                      )}
                      <span>Test Gate B Query</span>
                    </button>
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>UNLOCKED == 0 (OPEN)</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Exactly What It Produces (Artifact Preview) (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Concrete Artifact Produced at Stage {currentStageId}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    SCENE 12 / EXTRACTION BEACON
                  </span>
                </div>

                {/* Artifact 1: Breakdown Shot Card */}
                {currentStageId === 1 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400">SHOT CARD #12-03</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                          MEDIUM CLOSE UP - LOW ANGLE
                        </span>
                      </div>
                      <div className="font-mono text-xs text-slate-300 font-semibold">
                        INT. CATWALK GANTRY - NIGHT (EMERGENCY ALARMS)
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-850">
                        Elena slams the dual-toggle emergency transponder switch down with both palms as strobing amber and cyan emergency lights sweep across the gantry.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                        <div>
                          <span className="text-slate-500 block text-[9px]">LENS PACKAGE</span>
                          <span className="text-slate-200">Vintage Anamorphic 35mm T2.2</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">LIGHTING RATIO</span>
                          <span className="text-slate-200">Cold Cyan 70° / Amber Sodium 4:1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Artifact 2: References Board */}
                {currentStageId === 2 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400">REFERENCE SPECIFICATION BOARD</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          ASSET: @catwalk_gantry + @elena
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Locked Palette Specification (60 : 30 : 10 Rule):
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#0B192C' }}></div>
                            <div className="text-[10px] font-mono">
                              <span className="text-slate-200 block">60% Subterranean Cyan</span>
                              <span className="text-slate-500">#0B192C</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#334155' }}></div>
                            <div className="text-[10px] font-mono">
                              <span className="text-slate-200 block">30% Steel Decksuit</span>
                              <span className="text-slate-500">#334155</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                            <div className="text-[10px] font-mono">
                              <span className="text-slate-200 block">10% Amber Strobe</span>
                              <span className="text-slate-500">#F59E0B</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold block mb-1">Visual Anchor Spec:</span>
                        Industrial open-grating catwalk suspended over subterranean coolant void; worn yellow safety paint on oxidized steel; rhythmic 589nm sodium pulse every 3.2s.
                      </div>
                    </div>
                  </div>
                )}

                {/* Artifact 3: Visual Bible Lock (Written Decision) */}
                {currentStageId === 3 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-emerald-400">RECORDED WRITTEN DECISION</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          STATUS: APPROVED
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>DECIDED BY: DIRECTOR_CHEN</span>
                          <span>TIMESTAMP: 2026-08-28T14:22:04Z</span>
                        </div>
                        <p className="text-slate-200 italic">
                          "APPROVED — cold blue/amber emergency palette, handheld 35mm vintage anamorphic lens family, high-contrast strobing light. This board is permanently frozen."
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>ClickHouse Audit Record committed to <code className="text-slate-300">audit_log</code> table with cryptographic hash.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Artifact 4: Asset Sheets (Passports with variants) */}
                {currentStageId === 4 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Elena Base Passport */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-amber-400">@elena (BASE)</span>
                          <span className="text-[10px] font-mono text-emerald-400">LOCKED</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <p className="font-medium text-white">Dr. Elena Vance (Age 38)</p>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            Titanium-alloy prosthetic ridge grafted along left eyebrow; micro-recessed amber sensors; graphite neoprene deck-suit with cadmium-yellow seams.
                          </p>
                        </div>
                      </div>

                      {/* Elena Injured Variant Passport */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-rose-400">@elena_injured (VARIANT)</span>
                          <span className="text-[10px] font-mono text-emerald-400">LOCKED</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <p className="font-medium text-white">Variant State: Post-Decompression</p>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            Carbon-arc scorch marks across collarbone; lacerated cheekbone with dried plasma coagulant; flickering micro-optical sensor in titanium graft.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 flex items-center justify-between font-mono">
                      <span>Other Touchpoints:</span>
                      <span className="text-sky-300">@emergency_transponder (Prop)</span>
                      <span className="text-sky-300">@catwalk_gantry (Location)</span>
                    </div>
                  </div>
                )}

                {/* Artifact 5: Library & Stress Testing */}
                {currentStageId === 5 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-sky-400">STRESS-TEST VERIFICATION MATRIX</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                          STATUS: 3/3 PASSED
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded border border-emerald-500/30">
                          <span className="text-slate-400 block text-[10px]">LENS FLARE TEST</span>
                          <span className="font-bold text-emerald-400">PASSED (0.94)</span>
                          <span className="text-[9px] text-slate-500 block">Amber halation holds</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-emerald-500/30">
                          <span className="text-slate-400 block text-[10px]">STEAM DENSITY TEST</span>
                          <span className="font-bold text-emerald-400">PASSED (0.91)</span>
                          <span className="text-[9px] text-slate-500 block">Prosthetic stays sharp</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-emerald-500/30">
                          <span className="text-slate-400 block text-[10px]">COLOR SHIFT TEST</span>
                          <span className="font-bold text-emerald-400">PASSED (0.98)</span>
                          <span className="text-[9px] text-slate-500 block">Seams remain #F59E0B</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                        <span>Registry State:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          All 3 rows for Scene 12 set to 'locked' in ClickHouse
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Artifact 6: Generation (15-Block Prompt Structure) */}
                {currentStageId === 6 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-sky-400">COMPILED 15-BLOCK GEMINI PROMPT</span>
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px]">
                          MODEL: GEMINI 3.8 FLASH
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs font-mono text-slate-300 space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                        <div className="text-amber-400 font-semibold">[BLOCK 1: SUBJECT COUNT INVARIANT] EXACT 1 CHARACTER — NO DUPLICATES, NO BACKGROUND EXTRAS.</div>
                        <div className="text-slate-300">[BLOCK 2: CHARACTER PASSPORT VERBATIM] Dr. Elena Vance (@elena): weathered titanium-alloy prosthetic ridge grafted along left eyebrow, graphite-grey neoprene pressurized deck-suit with worn cadmium-yellow sealant seams.</div>
                        <div className="text-slate-300">[BLOCK 3: ACTION BEAT] Elena slams down the dual-toggle emergency transponder switch with both palms, bracing her body weight against the steel console.</div>
                        <div className="text-slate-300">[BLOCK 4: LOCATION MAP & DISTANCES] Catwalk gantry interior. Foreground: steel console (0.5m). Midground: Elena on grated metal deck (1.2m). Background: subterranean coolant void (15m).</div>
                        <div className="text-sky-300">[BLOCK 5: OPTICAL SPECIFICATION] Vintage Anamorphic 35mm Prime Lens T2.2. Shallow depth of field, natural horizontal amber flare streaks, oval bokeh.</div>
                        <div className="text-slate-300">[BLOCK 6: COLOR PALETTE 60:30:10] 60% deep industrial cyan/navy (#0B192C), 30% cold steel grey (#334155), 10% saturated emergency amber strobe (#F59E0B).</div>
                        <div className="text-slate-300">[BLOCK 7: LIGHTING GEOMETRY] Key: Warm amber sodium strobe at 45° overhead pulsing. Fill: Diffused cold cyan ambient from subterranean pool below. Rim: Razor specular edge along titanium brow.</div>
                        <div className="text-slate-300">[BLOCK 8: ATMOSPHERE & PARTICLES] Heavy condensation mist venting from low-pressure steam pipes.</div>
                        <div className="text-slate-300">[BLOCK 9: CAMERA ANGLE] Low-angle medium close-up, Dutch tilt 4 degrees clockwise.</div>
                        <div className="text-slate-300">[BLOCK 10: PROP INVARIANT] Emergency transponder beacon: blued steel housing, safety-yellow toggle latch open.</div>
                        <div className="text-rose-400 font-semibold">[BLOCK 11: TEXT SUPPRESSION RULE] NO RENDERED TEXT, NO LETTERS, NO SIGNAGE TYPOGRAPHY.</div>
                        <div className="text-slate-300">[BLOCK 12: EMOTIONAL REGISTER] High urgency, tactical resolve, sharp physical exertion.</div>
                        <div className="text-slate-300">[BLOCK 13: MOTION CADENCE] High-velocity downward arm slam decelerating to locked grip.</div>
                        <div className="text-slate-300">[BLOCK 14: ASPECT RATIO] 2.39:1 CinemaScope widescreen.</div>
                        <div className="text-rose-400 font-semibold">[BLOCK 15: NEGATIVE INVARIANTS] No plastic skin, no extra limbs, no duplicated fingers, no clean studio floors, no chrome reflections.</div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                        <span>Cost Estimate: $0.038</span>
                        <span>Render Status: 100% Locked</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Artifact 7: Edit (Parallel Assembly) */}
                {currentStageId === 7 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-sky-400">PARALLEL ASSEMBLY TIMELINE</span>
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px]">
                          CADENCE ENGINE
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">SCENE 11 (DESCENT):</span>
                          <span className="text-emerald-400 font-bold">ASSEMBLING IN TIMELINE (EDITOR)</span>
                        </div>
                        <div className="p-2.5 rounded bg-sky-950/40 border border-sky-500/40 flex items-center justify-between">
                          <span className="text-sky-300 font-bold">SCENE 12 (BEACON):</span>
                          <span className="text-sky-300 font-bold">GENERATING ACTIVE FRAMES (GEMINI)</span>
                        </div>
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">SCENE 13 (AIRLOCK):</span>
                          <span className="text-amber-400 font-bold">SHOTLISTING BREAKDOWN (DIRECTOR TEAM)</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        The parallel pipeline prevents idle studio time. By the time Scene 12 finishes rendering, the rough assembly of Scene 11 is already locked and reviewed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Artifact 8: Cleanup */}
                {currentStageId === 8 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-sky-400">CLEANUP PUNCHLIST & PLATE REFINEMENT</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          VFX ARTIST TASKLIST
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-200">Shot 12-03: Signage Text Inpainting</span>
                          <span className="text-emerald-400 font-mono text-[11px] font-bold">COMPLETED</span>
                        </div>
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-200">Shot 12-03: Glove Steam Boundary Feathering</span>
                          <span className="text-emerald-400 font-mono text-[11px] font-bold">COMPLETED</span>
                        </div>
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-200">Shot 12-03: Lens Flare Masking & Sensor Edge</span>
                          <span className="text-emerald-400 font-mono text-[11px] font-bold">COMPLETED</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        Stage 8 ensures pixel-clean plates without model hallucinations before handing off to outsourced post teams.
                      </p>
                    </div>
                  </div>
                )}

                {/* Artifact 9: Color (Human Only) */}
                {currentStageId === 9 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-emerald-400">COLORIST GRADING SPECIFICATION</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          HUMAN COLORIST LOCK
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>COLORIST: M. VANDENBERG (OUTSOURCED)</span>
                          <span>COLOR SPACE: ACEScc AP1</span>
                        </div>
                        <p className="text-slate-200">
                          "Unified exposure across Scene 12's 6 shots. Pulled down cyan shadow lift by 4% to seat the contrast shelf. Rolled off 589nm sodium highlights into amber warmth smoothly without clipping."
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">TARGET GAMUT</span>
                          <span className="font-bold text-slate-200">DCI-P3 / Rec.709</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">CONTRAST RATIO</span>
                          <span className="font-bold text-slate-200">4.2 : 1 Preserved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Artifact 10: Sound (Human Only) */}
                {currentStageId === 10 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-emerald-400">SOUND POST-PRODUCTION REPORT</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          HUMAN SOUND MIXER LOCK
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>SOUND SUPERVISOR: K. LORENZ</span>
                          <span>TARGET LOUDNESS: -23.0 LUFS</span>
                        </div>
                        <p className="text-slate-200">
                          "Cleaned synced dialogue take; notched out 42Hz ventilation pump hum. Designed custom tactile dual-toggle switch slam with heavy steel resonance. Mixed 5.1 surround spatial steam exhaust."
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">LFE SUB FREQUENCY</span>
                          <span className="font-bold text-slate-200">28Hz - 80Hz Rolloff</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">STEMS DELIVERED</span>
                          <span className="font-bold text-slate-200">DX, FX, MX, Foley</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Artifact 11: Master */}
                {currentStageId === 11 && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-emerald-400">MASTER DELIVERABLES PACKAGE</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          STATUS: MASTER LOCKED
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300">1. DCI Theatrical DCP (SMPTE 2048x858, JPEG 2000)</span>
                          <span className="text-emerald-400">PASSED QC</span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300">2. Archival Master (Apple ProRes 4444 XQ, 12-bit)</span>
                          <span className="text-emerald-400">VERIFIED HASH</span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300">3. Streaming Mezzanine (4K HDR10, 5.1 E-AC-3)</span>
                          <span className="text-emerald-400">READY</span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300">4. ClickHouse Audit Ledger Archive</span>
                          <span className="text-emerald-400">FROZEN (100%)</span>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs text-emerald-200">
                        <strong>Pipeline Complete:</strong> Scene 12 has traversed all 11 stages without a single unrecorded prompt revision, preventing costly reshoots.
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* Bottom Navigation & Stepper Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={() => setCurrentStageId((prev) => Math.max(1, prev - 1))}
            disabled={currentStageId <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Stage</span>
          </button>

          <div className="text-xs font-mono text-slate-400 text-center hidden sm:block">
            Use the stepper above or arrows to explore each canonical deliverable.
          </div>

          <div className="flex items-center gap-2">
            {currentStageId < 11 ? (
              <button
                onClick={() => setCurrentStageId((prev) => Math.min(11, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow"
              >
                <span>Next: Stage {currentStageId + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow"
              >
                <Check className="w-4 h-4" />
                <span>Finish Simulation Walkthrough</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
