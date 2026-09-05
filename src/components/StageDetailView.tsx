import React, { useState, useEffect, useRef } from 'react';
import {
  Scene,
  AssetPassport,
  STAGES,
  ShotCard,
  RegistryRow,
  GateACheckResult,
  GateBCheckResult,
} from '../types';
import { api } from '../api';
import { CINEMATIC_PLATES } from '../utils/cinematicVisuals';
import {
  Film,
  Camera,
  Layers,
  Lock,
  Unlock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Database,
  Sliders,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Activity,
  Award,
  Scissors,
  Brush,
  Wand2,
} from 'lucide-react';

interface StageDetailViewProps {
  selectedStageId: number | 'gate-a' | 'gate-b';
  scenes: Scene[];
  passports: AssetPassport[];
  onAdvanceStage: (sceneId: string, targetStage: number) => Promise<void>;
  onCheckGateA: (sceneId: string) => Promise<GateACheckResult>;
  onCheckGateB: (sceneId: string) => Promise<GateBCheckResult>;
  onRefreshScenes: () => Promise<void>;
}

export const StageDetailView: React.FC<StageDetailViewProps> = ({
  selectedStageId,
  scenes,
  passports,
  onAdvanceStage,
  onCheckGateA,
  onCheckGateB,
  onRefreshScenes,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(() => {
    const demo = scenes.find((s) => s.is_demo);
    return demo ? demo.scene_id : scenes[0]?.scene_id || 'scene_001';
  });

  const activeScene = scenes.find((s) => s.scene_id === selectedSceneId) || scenes[0];

  // Stage 1 active shot selection
  const [activeShotIndex, setActiveShotIndex] = useState(0);

  // Stage 2 state
  const [stage2Images, setStage2Images] = useState<Record<string, string[]>>({});
  const [stage2Loading, setStage2Loading] = useState(false);
  const [stage2RateLimitSec, setStage2RateLimitSec] = useState<number | null>(null);

  // Stage 3 decision approvals
  const [boardDecisions, setBoardDecisions] = useState<Record<string, 'approved' | 'revised' | 'rejected'>>({
    board_1: 'approved',
    board_2: 'approved',
    board_3: 'approved',
  });

  // Stage 4 5-pose turnaround state
  const [activePoseIndex, setActivePoseIndex] = useState(0);
  const [stage4Loading, setStage4Loading] = useState(false);

  // Stage 5 combat matrix stress test
  const [matrixScore, setMatrixScore] = useState<number>(10);
  const [stressPass, setStressPass] = useState(true);

  // Stage 6 video state
  const [videoUrl, setVideoUrl] = useState<string>('/assets/demo_scene_12_veo_clip.mp4');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<{
    type: string;
    message: string;
    billingUrl?: string;
  } | null>(null);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stage 8 Cleanup Before/After toggle
  const [showCleanupAfter, setShowCleanupAfter] = useState(true);

  // Stage 9 Color Grading LUT
  const [activeLUT, setActiveLUT] = useState<'neutral' | 'sodium' | 'bleach' | 'cyberpunk'>('sodium');

  // Stage 10 Audio track state
  const [stemMutes, setStemMutes] = useState({
    dialogue: false,
    foley: false,
    score: false,
    ambience: false,
  });

  // Gates evaluation state
  const [gateAResult, setGateAResult] = useState<GateACheckResult | null>(null);
  const [gateBResult, setGateBResult] = useState<GateBCheckResult | null>(null);
  const [evaluatingGate, setEvaluatingGate] = useState(false);

  // Rate limit countdown
  useEffect(() => {
    if (stage2RateLimitSec && stage2RateLimitSec > 0) {
      const timer = setTimeout(() => setStage2RateLimitSec((prev) => (prev ? prev - 1 : null)), 1000);
      return () => clearTimeout(timer);
    }
  }, [stage2RateLimitSec]);

  // Handle generation via Gemini for Stage 2
  const handleGenerateReferences = async () => {
    setStage2Loading(true);
    setStage2RateLimitSec(null);
    try {
      const res = await api.generateImages(
        'Cinematic sci-fi movie concept art, Dr. Elena Vance in pressurized space suit with glowing titanium ocular prosthetic, anamorphic lens flare, deep navy and sodium lighting, high key 4:1 contrast, photorealistic 8k film still',
        4,
        '16:9'
      );
      if (res.rateLimited) {
        setStage2RateLimitSec(res.retryAfterSeconds || 20);
      } else if (res.images && res.images.length > 0) {
        setStage2Images((prev) => ({
          ...prev,
          [activeScene.scene_id]: res.images,
        }));
      }
    } catch (e: any) {
      console.warn('Gemini generation error:', e);
    } finally {
      setStage2Loading(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleAdvance = async () => {
    if (!activeScene) return;
    const nextStage = activeScene.current_stage + 1;
    if (nextStage > 11) return;
    try {
      await onAdvanceStage(activeScene.scene_id, nextStage);
      await onRefreshScenes();
    } catch (e: any) {
      alert(e.message || 'Advance blocked by ClickHouse invariant check');
    }
  };

  const currentStageConfig = STAGES.find(
    (s) => s.id === (typeof selectedStageId === 'number' ? selectedStageId : 1)
  );

  // LUT Filter class for Stage 9 Color Grading
  const getLUTFilterStyle = () => {
    switch (activeLUT) {
      case 'sodium':
        return { filter: 'sepia(0.4) saturate(1.4) contrast(1.2) hue-rotate(-15deg)' };
      case 'bleach':
        return { filter: 'contrast(1.6) saturate(0.3) brightness(0.9)' };
      case 'cyberpunk':
        return { filter: 'hue-rotate(180deg) saturate(1.8) contrast(1.3)' };
      default:
        return { filter: 'none' };
    }
  };

  return (
    <div className="space-y-6 text-slate-100 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="bg-[#0b1636] border border-[#1d3570] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#162d66] text-[#38bdf8] border border-[#254b9c]">
                {selectedStageId === 'gate-a'
                  ? 'INVARIANT GATE A'
                  : selectedStageId === 'gate-b'
                  ? 'REGISTRY GATE B'
                  : currentStageConfig?.phase?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Stage {typeof selectedStageId === 'number' ? selectedStageId : 'Gate'} of 11
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>
                {selectedStageId === 'gate-a'
                  ? 'Gate A: Written Decision Checkpoint'
                  : selectedStageId === 'gate-b'
                  ? 'Gate B: Registry Lock ("No row, no render")'
                  : `${currentStageConfig?.id}. ${currentStageConfig?.name}`}
              </span>
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {selectedStageId === 'gate-a'
                ? 'Validates that every visual board has an approved director decision before allowing asset synthesis.'
                : selectedStageId === 'gate-b'
                ? 'Enforces ClickHouse registry locking across all touching assets before video rendering can begin.'
                : currentStageConfig?.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentStageConfig?.skillCommand && (
              <span className="hidden sm:inline-flex font-mono text-xs px-3 py-1.5 rounded-lg bg-[#0e1d44] border border-[#22458a] text-[#38bdf8] shadow-sm">
                {currentStageConfig.skillCommand}
              </span>
            )}

            {typeof selectedStageId === 'number' && selectedStageId < 11 && (
              <button
                onClick={handleAdvance}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Advance to Stage {selectedStageId + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Scene Selector & Live Status Pill */}
        <div className="mt-4 pt-3 border-t border-[#1a3268] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">ACTIVE SCENE:</span>
            <select
              value={selectedSceneId}
              onChange={(e) => setSelectedSceneId(e.target.value)}
              aria-label="Select Scene"
              className="bg-[#0e1f4a] border border-[#234791] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#38bdf8] font-medium"
            >
              {scenes.map((s) => (
                <option key={s.scene_id} value={s.scene_id}>
                  Scene #{s.scene_number}: {s.title} (Stage {s.current_stage}) {s.is_demo ? '[DEMO]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e214d] text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CLICKHOUSE GATE SYNCED</span>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STAGE 1: VISUAL STORYBOARD CARDS
         ========================================================================= */}
      {selectedStageId === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#38bdf8]" />
                <span>Visual Storyboard Breakdown Cards</span>
              </h2>
              <p className="text-xs text-slate-400">
                Decomposed camera shot angles with anamorphic framing guides.
              </p>
            </div>
            <span className="text-xs font-mono text-[#38bdf8] bg-[#0f214c] border border-[#244b9b] px-2.5 py-1 rounded-lg">
              4 Shots Planned
            </span>
          </div>

          {/* Primary Big Storyboard Viewer */}
          <div className="relative rounded-2xl overflow-hidden border border-[#23458a] bg-[#070e24] shadow-2xl group">
            <div className="aspect-[16/9] w-full max-h-[380px] flex items-center justify-center bg-black overflow-hidden relative">
              <img
                src={
                  activeShotIndex === 0
                    ? CINEMATIC_PLATES.shot1_wide
                    : activeShotIndex === 1
                    ? CINEMATIC_PLATES.shot2_medium
                    : activeShotIndex === 2
                    ? CINEMATIC_PLATES.shot3_macro
                    : CINEMATIC_PLATES.shot4_alarm
                }
                alt="Active Storyboard Plate"
                className="w-full h-full object-contain"
              />

              {/* Viewfinder Camera Overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border-8 border-transparent">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#38bdf8]">
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-[#23458a]">
                    REC ● 24 FPS
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-[#23458a]">
                    TC 01:12:04:18
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                  <span className="bg-black/60 px-2 py-0.5 rounded">
                    LENS: {['35mm T2.2', '50mm T2.0', '75mm Close-Focus', '85mm Macro'][activeShotIndex]}
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded text-amber-400 font-bold">
                    ASPECT: 2.39:1 SCOPE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Interactive Storyboard Thumbnail Strips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                idx: 0,
                num: '01',
                title: 'Coolant Void',
                lens: '35mm Anamorphic',
                img: CINEMATIC_PLATES.shot1_wide,
              },
              {
                idx: 1,
                num: '02',
                title: 'Catwalk Tracking',
                lens: '50mm Primes',
                img: CINEMATIC_PLATES.shot2_medium,
              },
              {
                idx: 2,
                num: '03',
                title: 'Transponder Switch',
                lens: '75mm Close-Focus',
                img: CINEMATIC_PLATES.shot3_macro,
              },
              {
                idx: 3,
                num: '04',
                title: 'Alarm Strobe',
                lens: '85mm Macro ECU',
                img: CINEMATIC_PLATES.shot4_alarm,
              },
            ].map((shot) => {
              const isSelected = activeShotIndex === shot.idx;
              return (
                <div
                  key={shot.idx}
                  onClick={() => setActiveShotIndex(shot.idx)}
                  className={`rounded-xl overflow-hidden border transition-all cursor-pointer bg-[#0e1a3d] ${
                    isSelected
                      ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/40 shadow-lg'
                      : 'border-[#1b3164] hover:border-[#2f55a6]'
                  }`}
                >
                  <div className="aspect-[16/9] bg-black relative overflow-hidden">
                    <img src={shot.img} alt={shot.title} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5 text-[9px] font-mono font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                      SHOT {shot.num}
                    </div>
                  </div>
                  <div className="p-2.5 space-y-0.5">
                    <div className="text-xs font-bold text-white truncate">{shot.title}</div>
                    <div className="text-[10px] text-[#38bdf8] font-mono">{shot.lens}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: VISUAL REFERENCE MOODBOARD GALLERY (GEMINI GENERATED)
         ========================================================================= */}
      {selectedStageId === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                <span>Visual Reference Specification Gallery</span>
              </h2>
              <p className="text-xs text-slate-400">
                Visual specification boards for characters, props, locations, and optical profiles.
              </p>
            </div>

            <button
              onClick={handleGenerateReferences}
              disabled={stage2Loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white font-semibold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{stage2Loading ? 'Generating with Gemini...' : 'Generate New with Gemini'}</span>
            </button>
          </div>

          {/* Rate limit notification */}
          {stage2RateLimitSec !== null && stage2RateLimitSec > 0 && (
            <div className="p-3 border border-amber-500/30 bg-amber-500/10 text-xs font-mono text-amber-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Rate limited on free tier, retrying in {stage2RateLimitSec}s...</span>
            </div>
          )}

          {/* 4 Rich Visual Concept Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Asset 1: Elena Vance */}
            <div className="border border-[#1e3870] bg-[#0e1b3e] rounded-2xl overflow-hidden shadow-lg hover:border-[#38bdf8] transition-all">
              <div className="aspect-square bg-black relative overflow-hidden">
                <img
                  src={stage2Images[activeScene.scene_id]?.[0] || CINEMATIC_PLATES.elena_concept}
                  alt="Dr. Elena Vance"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] font-mono bg-black/70 text-[#38bdf8] px-2 py-0.5 rounded-md border border-[#23458a]">
                  CHARACTER
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-emerald-500/80 text-black font-bold px-2 py-0.5 rounded">
                  LOCKED
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-xs font-bold text-white">Dr. Elena Vance (@elena)</div>
                <div className="text-[11px] text-slate-300 line-clamp-2">
                  Graphite pressurized deck-suit with titanium cybernetic ocular graft.
                </div>
              </div>
            </div>

            {/* Asset 2: Emergency Transponder */}
            <div className="border border-[#1e3870] bg-[#0e1b3e] rounded-2xl overflow-hidden shadow-lg hover:border-[#38bdf8] transition-all">
              <div className="aspect-square bg-black relative overflow-hidden">
                <img
                  src={stage2Images[activeScene.scene_id]?.[1] || CINEMATIC_PLATES.transponder_prop}
                  alt="Emergency Transponder"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] font-mono bg-black/70 text-amber-400 px-2 py-0.5 rounded-md border border-[#23458a]">
                  PROP
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-emerald-500/80 text-black font-bold px-2 py-0.5 rounded">
                  LOCKED
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-xs font-bold text-white">Emergency Transponder (@transponder)</div>
                <div className="text-[11px] text-slate-300 line-clamp-2">
                  Blued steel enclosure with safety-yellow dual toggle switch.
                </div>
              </div>
            </div>

            {/* Asset 3: Catwalk Gantry */}
            <div className="border border-[#1e3870] bg-[#0e1b3e] rounded-2xl overflow-hidden shadow-lg hover:border-[#38bdf8] transition-all">
              <div className="aspect-square bg-black relative overflow-hidden">
                <img
                  src={stage2Images[activeScene.scene_id]?.[2] || CINEMATIC_PLATES.catwalk_environment}
                  alt="Catwalk Gantry"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] font-mono bg-black/70 text-[#38bdf8] px-2 py-0.5 rounded-md border border-[#23458a]">
                  LOCATION
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-emerald-500/80 text-black font-bold px-2 py-0.5 rounded">
                  LOCKED
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-xs font-bold text-white">Reactor Gantry (@catwalk_gantry)</div>
                <div className="text-[11px] text-slate-300 line-clamp-2">
                  Perforated industrial catwalk over subterranean cooling reservoir.
                </div>
              </div>
            </div>

            {/* Asset 4: 35mm Lens Profile */}
            <div className="border border-[#1e3870] bg-[#0e1b3e] rounded-2xl overflow-hidden shadow-lg hover:border-[#38bdf8] transition-all">
              <div className="aspect-square bg-black relative overflow-hidden">
                <img
                  src={stage2Images[activeScene.scene_id]?.[3] || CINEMATIC_PLATES.lens_specimen}
                  alt="Optical Lens Specimen"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] font-mono bg-black/70 text-purple-400 px-2 py-0.5 rounded-md border border-[#23458a]">
                  OPTICAL
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-emerald-500/80 text-black font-bold px-2 py-0.5 rounded">
                  2.39:1
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-xs font-bold text-white">35mm Vintage Anamorphic T2.2</div>
                <div className="text-[11px] text-slate-300 line-clamp-2">
                  Oval bokeh 2.0x squeeze factor with controlled horizontal flare streaks.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: VISUAL BIBLE LOCK & STAMPED APPROVAL BOARDS
         ========================================================================= */}
      {(selectedStageId === 3 || selectedStageId === 'gate-a') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Visual Bible Stamped Decisions</span>
              </h2>
              <p className="text-xs text-slate-400">
                Every board carries Director Chen&apos;s signed approval stamp in ClickHouse.
              </p>
            </div>

            <button
              onClick={async () => {
                setEvaluatingGate(true);
                try {
                  const res = await onCheckGateA(activeScene.scene_id);
                  setGateAResult(res);
                } finally {
                  setEvaluatingGate(false);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#142654] border border-[#274b96] hover:bg-[#1a3370] text-xs font-mono text-[#38bdf8] transition-colors cursor-pointer"
            >
              {evaluatingGate ? 'Checking ClickHouse...' : 'Evaluate Gate A'}
            </button>
          </div>

          {/* 3 Stamped Boards with Rich Visual Illustrations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'board_1',
                title: 'Board #1: INT. CATWALK ENTRY',
                lens: '35mm Anamorphic T2.2',
                notes: 'Approved per anamorphic spec // Lead Director Chen',
                img: CINEMATIC_PLATES.shot1_wide,
              },
              {
                id: 'board_2',
                title: 'Board #2: INT. CONDENSER MIST PROFILE',
                lens: '50mm Prime T2.0',
                notes: 'Approved titanium eye contrast // Lead Director Chen',
                img: CINEMATIC_PLATES.shot2_medium,
              },
              {
                id: 'board_3',
                title: 'Board #3: INT. EMERGENCY SWITCH SLAM',
                lens: '75mm Macro Close-Focus',
                notes: 'Approved dual-lever hazard geometry // Lead Director Chen',
                img: CINEMATIC_PLATES.shot3_macro,
              },
            ].map((board) => {
              const currentDecision = boardDecisions[board.id] || 'approved';
              return (
                <div
                  key={board.id}
                  className="rounded-2xl border border-[#213f80] bg-[#0c193c] overflow-hidden shadow-xl"
                >
                  <div className="aspect-[16/9] bg-black relative overflow-hidden">
                    <img src={board.img} alt={board.title} className="w-full h-full object-cover" />
                    {/* Visual Gold Approval Stamp Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <div className="border-4 border-emerald-400 text-emerald-400 font-extrabold text-xs px-3 py-1.5 rounded-lg rotate-[-12deg] tracking-widest shadow-2xl bg-black/60 backdrop-blur-xs flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>APPROVED</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="text-xs font-bold text-white">{board.title}</div>
                    <div className="text-[11px] text-[#38bdf8] font-mono">{board.lens}</div>
                    <div className="text-[11px] text-slate-300 italic bg-[#08122d] p-2 rounded-lg border border-[#172c5c]">
                      &ldquo;{board.notes}&rdquo;
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>ATTRIBUTED</span>
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setBoardDecisions((p) => ({ ...p, [board.id]: 'approved' }))}
                          className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            currentDecision === 'approved'
                              ? 'bg-emerald-500 text-black'
                              : 'bg-[#142858] text-slate-300'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setBoardDecisions((p) => ({ ...p, [board.id]: 'revised' }))}
                          className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            currentDecision === 'revised'
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#142858] text-slate-300'
                          }`}
                        >
                          Revise
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: 5-POSE ORTHOGRAPHIC CHARACTER TURNAROUND SHEET
         ========================================================================= */}
      {selectedStageId === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#38bdf8]" />
                <span>5-Pose Neutral Grey Model Turnaround Sheet</span>
              </h2>
              <p className="text-xs text-slate-400">
                Orthographic turnaround angles against 18% neutral grey studio lighting.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Asset Locked: @elena
            </span>
          </div>

          {/* 5-Pose Model Sheet Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { idx: 0, label: 'Front (0°)', desc: 'Chest harness, eye level' },
              { idx: 1, label: '3/4 Left (45°)', desc: 'Titanium graft anchor' },
              { idx: 2, label: 'Profile (90°)', desc: 'Side brow fixture profile' },
              { idx: 3, label: '3/4 Right (315°)', desc: 'Oxygen valve assembly' },
              { idx: 4, label: 'Rear (180°)', desc: 'Carbon-weave backpack' },
            ].map((pose) => {
              const isSelected = activePoseIndex === pose.idx;
              return (
                <div
                  key={pose.idx}
                  onClick={() => setActivePoseIndex(pose.idx)}
                  className={`rounded-2xl overflow-hidden border transition-all cursor-pointer bg-[#0e1d44] ${
                    isSelected
                      ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/40 shadow-xl'
                      : 'border-[#1b3469] hover:border-[#2f55a6]'
                  }`}
                >
                  <div className="aspect-[3/4] bg-[#252833] relative flex items-center justify-center p-2">
                    <img
                      src={CINEMATIC_PLATES.elena_concept}
                      alt={pose.label}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 text-[10px] font-mono font-bold bg-black/70 text-white px-2 py-0.5 rounded">
                      {pose.label}
                    </div>
                  </div>
                  <div className="p-2.5 space-y-0.5">
                    <div className="text-xs font-bold text-white truncate">{pose.label}</div>
                    <div className="text-[10px] text-slate-300">{pose.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Material Swatches Bar */}
          <div className="bg-[#0b1636] border border-[#1b3469] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-mono text-slate-400 text-[11px]">VERIFIED COSTUME FABRICS:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-200 text-xs">
                <span className="w-3 h-3 rounded-full bg-[#475569] border border-white/20" />
                <span>Weathered Titanium</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-200 text-xs">
                <span className="w-3 h-3 rounded-full bg-[#1e293b] border border-white/20" />
                <span>Graphite Kevlar</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-200 text-xs">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-white/20" />
                <span>Safety Amber Hazard</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 5: COMBAT MATRIX STRESS TEST & GATE B
         ========================================================================= */}
      {(selectedStageId === 5 || selectedStageId === 'gate-b') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Combat Matrix Stress-Test Suite</span>
              </h2>
              <p className="text-xs text-slate-400">
                Validates consistency across extreme lighting, motion blur, and co-star depth.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                SCORE: {matrixScore}/10 PASSED
              </span>
            </div>
          </div>

          {/* 4 Extreme Visual Stress Test Plates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Low-Key Sodium Strobe',
                tag: 'LIGHTING TEST',
                score: 'PASS (10/10)',
                img: CINEMATIC_PLATES.shot4_alarm,
              },
              {
                title: 'High-Speed Motion Blur',
                tag: 'MOTION TEST',
                score: 'PASS (10/10)',
                img: CINEMATIC_PLATES.shot2_medium,
              },
              {
                title: 'Two-Shot Scale Test',
                tag: 'DEPTH TEST',
                score: 'PASS (10/10)',
                img: CINEMATIC_PLATES.shot1_wide,
              },
              {
                title: 'Macro Condensation',
                tag: 'TEXTURE TEST',
                score: 'PASS (10/10)',
                img: CINEMATIC_PLATES.shot3_macro,
              },
            ].map((test, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#1e3870] bg-[#0c183a] overflow-hidden shadow-lg"
              >
                <div className="aspect-[4/3] bg-black relative overflow-hidden">
                  <img src={test.img} alt={test.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] font-mono bg-black/70 text-[#38bdf8] px-2 py-0.5 rounded">
                    {test.tag}
                  </span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-emerald-500/90 text-black font-bold px-2 py-0.5 rounded">
                    {test.score}
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-white">{test.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Asset anchor verified invariant</div>
                </div>
              </div>
            ))}
          </div>

          {/* Gate B Lock Vault Banner */}
          <div className="bg-[#0b1636] border border-[#213f80] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">ClickHouse Registry Lock Status</div>
                <div className="text-[11px] text-slate-300">
                  All 3 touching assets read &quot;locked&quot; in ClickHouse. Gate B is satisfied.
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                setEvaluatingGate(true);
                try {
                  const res = await onCheckGateB(activeScene.scene_id);
                  setGateBResult(res);
                } finally {
                  setEvaluatingGate(false);
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Verify Gate B SQL
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 6: GENERATION (CINEMA CAMERA VIEWFINDER & REAL VIDEO PLAYBACK)
         ========================================================================= */}
      {selectedStageId === 6 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-[#f59e0b]" />
                <span>Cinematic Viewfinder Video Playback (Veo Model)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Plays rendered shot sequence with camera HUD overlay.
              </p>
            </div>

            <span className="text-[11px] font-mono text-[#38bdf8] bg-[#0f214c] border border-[#244b9b] px-2.5 py-1 rounded-lg">
              Pre-rendered demo clip (Free tier)
            </span>
          </div>

          {/* High-End Cinema Camera Viewfinder Video Player */}
          <div className="rounded-2xl border-2 border-[#23458a] bg-black overflow-hidden shadow-2xl relative group">
            <div className="aspect-[16/9] w-full relative">
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                autoPlay
                loop
                muted={isMuted}
                className="w-full h-full object-contain"
              />

              {/* Viewfinder HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between">
                {/* Top HUD */}
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 text-red-500 font-bold border border-red-500/40">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span>REC</span>
                    </span>
                    <span className="px-2.5 py-1 rounded bg-black/60 text-white border border-white/20">
                      24.000 FPS
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-black/60 border border-white/20">
                      TC 01:14:22:18
                    </span>
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-white/20 text-[#38bdf8]">
                    SHUTTER: 180° // ISO 800
                  </span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-white/20 text-amber-400">
                    2.39:1 ANAMORPHIC
                  </span>
                </div>
              </div>

              {/* Interactive Player Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-auto bg-black/70 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-[#38bdf8] text-black hover:bg-[#0284c7] transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-xs font-mono text-slate-300">Scene 12: Extraction Beacon</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }
                    }}
                    className="p-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible 15-Block Prompt Accordion */}
          <div className="rounded-xl border border-[#1b3469] bg-[#0b1636] overflow-hidden text-xs">
            <button
              onClick={() => setIsPromptCollapsed(!isPromptCollapsed)}
              className="w-full p-3 flex items-center justify-between text-slate-300 hover:text-white font-mono cursor-pointer"
            >
              <span>15-Block Canonical Prompt Contract (Click to View)</span>
              {isPromptCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {!isPromptCollapsed && (
              <div className="p-4 border-t border-[#1b3469] bg-[#08122d] font-mono text-[11px] text-slate-300 space-y-2">
                <div className="text-[#38bdf8] font-bold">15-BLOCK PROMPT CONTRACT:</div>
                <p>1. Camera: Arri Alexa 65, 35mm Anamorphic T2.2 prime lens, 2.39:1 aspect ratio.</p>
                <p>2. Subject: Dr. Elena Vance (@elena), titanium ocular graft on left brow.</p>
                <p>3. Lighting: High-contrast 4:1 amber sodium rim light, cool cyan specular highlights.</p>
                <p>4. Motion: Elena pulls yellow dual toggle switch on emergency transponder beacon.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 7: EDITORIAL NLE TIMELINE & CUT PREVIEW
         ========================================================================= */}
      {selectedStageId === 7 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#38bdf8]" />
                <span>NLE Sequence Assembly Timeline</span>
              </h2>
              <p className="text-xs text-slate-400">
                Parallel cut sequence assembled shot-by-shot while next scenes generate.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Sequence Duration: 00:00:24:12
            </span>
          </div>

          {/* Visual NLE Timeline Tracks */}
          <div className="rounded-2xl border border-[#213e7d] bg-[#091433] p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-[#182f63]">
              <span>VIDEO TRACK V1</span>
              <span>24 FPS PRORES 4444</span>
            </div>

            {/* Thumbnail Film Strip */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Shot 01 (Ext. Wide)', time: '0:00 - 0:06', img: CINEMATIC_PLATES.shot1_wide },
                { name: 'Shot 02 (Tracking)', time: '0:06 - 0:12', img: CINEMATIC_PLATES.shot2_medium },
                { name: 'Shot 03 (Switch Slam)', time: '0:12 - 0:18', img: CINEMATIC_PLATES.shot3_macro },
                { name: 'Shot 04 (Alarm ECU)', time: '0:18 - 0:24', img: CINEMATIC_PLATES.shot4_alarm },
              ].map((clip, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-[#2a4d96] bg-[#0c1a3d] p-1 space-y-1"
                >
                  <div className="aspect-[16/9] bg-black rounded overflow-hidden">
                    <img src={clip.img} alt={clip.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[11px] font-bold text-white px-1 truncate">{clip.name}</div>
                  <div className="text-[10px] text-[#38bdf8] font-mono px-1">{clip.time}</div>
                </div>
              ))}
            </div>

            {/* Audio Waveform Track Strip */}
            <div className="pt-2 border-t border-[#182f63] space-y-1">
              <div className="text-[11px] font-mono text-slate-400">AUDIO TRACK A1 // STEREO STEMS</div>
              <div className="h-8 bg-[#050b1d] rounded-lg border border-[#1b3469] flex items-center px-2 gap-1 overflow-hidden">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#38bdf8]/70 rounded-full"
                    style={{ height: `${Math.sin(i * 0.4) * 50 + 40}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 8: DIGITAL CLEANUP / INPAINTING BEFORE & AFTER
         ========================================================================= */}
      {selectedStageId === 8 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Brush className="w-4 h-4 text-[#38bdf8]" />
                <span>Interactive Digital Cleanup & Inpainting</span>
              </h2>
              <p className="text-xs text-slate-400">
                Compare raw generated plate against inpainted cleanup plate.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCleanupAfter(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  !showCleanupAfter
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#142858] text-slate-300 hover:text-white'
                }`}
              >
                Before (Raw AI Plate)
              </button>
              <button
                onClick={() => setShowCleanupAfter(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  showCleanupAfter
                    ? 'bg-emerald-400 text-black'
                    : 'bg-[#142858] text-slate-300 hover:text-white'
                }`}
              >
                After (Cleaned Master)
              </button>
            </div>
          </div>

          {/* Interactive Before & After Plate View */}
          <div className="rounded-2xl border border-[#213e7d] bg-black overflow-hidden shadow-2xl relative">
            <div className="aspect-[16/9] w-full relative">
              <img
                src={CINEMATIC_PLATES.shot2_medium}
                alt="Cleanup comparison plate"
                className={`w-full h-full object-contain transition-all duration-300 ${
                  !showCleanupAfter ? 'brightness-90 hue-rotate-15' : 'brightness-105'
                }`}
              />
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold shadow-lg ${
                    showCleanupAfter
                      ? 'bg-emerald-500 text-black'
                      : 'bg-amber-500 text-black'
                  }`}
                >
                  {showCleanupAfter ? '● INPAINTED CLEANUP (RESOLVED)' : '● RAW GENERATION ARTIFACTS'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 9: COLOR GRADING SUITE WITH LIVE INTERACTIVE LUTS
         ========================================================================= */}
      {selectedStageId === 9 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#38bdf8]" />
                <span>Visual ACEScc Color Grading & LUT Switcher</span>
              </h2>
              <p className="text-xs text-slate-400">
                Click any LUT preset below to preview real-time theatrical color grades.
              </p>
            </div>
            <span className="text-xs font-mono text-[#38bdf8] bg-[#0f214c] border border-[#244b9b] px-2.5 py-1 rounded-lg">
              ACES 1.3 Calibrated
            </span>
          </div>

          {/* Interactive Live Color Grade Canvas */}
          <div className="rounded-2xl border-2 border-[#23458a] bg-black overflow-hidden shadow-2xl relative">
            <div className="aspect-[16/9] w-full flex items-center justify-center">
              <img
                src={CINEMATIC_PLATES.shot1_wide}
                alt="Color Grading Preview"
                style={getLUTFilterStyle()}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>
          </div>

          {/* 4 Interactive One-Click LUT Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'neutral', name: 'ACES Neutral', desc: 'True natural camera raw' },
              { id: 'sodium', name: 'Sodium Amber & Teal', desc: 'Cyberpunk warm/cool split' },
              { id: 'bleach', name: 'Bleach Bypass Noir', desc: 'High-contrast grit' },
              { id: 'cyberpunk', name: 'Neon Cyberpunk', desc: 'Stylized saturated spectrum' },
            ].map((lut) => (
              <button
                key={lut.id}
                onClick={() => setActiveLUT(lut.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  activeLUT === lut.id
                    ? 'border-[#38bdf8] bg-[#102350] shadow-lg ring-1 ring-[#38bdf8]'
                    : 'border-[#1b3469] bg-[#0b1636] hover:border-[#2f55a6]'
                }`}
              >
                <div className="text-xs font-bold text-white">{lut.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{lut.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 10: SOUND DESIGN STUDIO (AUDIO VISUALIZER & 5.1 RADAR)
         ========================================================================= */}
      {selectedStageId === 10 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#38bdf8]" />
                <span>Post-Sound Studio & 5.1 Surround Spatial Radar</span>
              </h2>
              <p className="text-xs text-slate-400">
                -23 LUFS platform loudness standard with 4 discrete stem channels.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Target: -23.0 LUFS
            </span>
          </div>

          {/* Live Frequency Spectrum & 5.1 Spatial Radar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Animated Frequency Bars */}
            <div className="md:col-span-2 rounded-2xl border border-[#213e7d] bg-[#08122e] p-4 space-y-3">
              <div className="text-xs font-mono text-slate-300 font-bold">
                FREQUENCY SPECTRUM VISUALIZER (20Hz - 20kHz)
              </div>
              <div className="h-44 bg-black rounded-xl border border-[#1b3469] p-3 flex items-end justify-between gap-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-[#0284c7] via-[#38bdf8] to-[#f59e0b] rounded-t-sm"
                    style={{ height: `${(Math.sin(i * 0.3) * 0.4 + 0.5) * 85}%` }}
                  />
                ))}
              </div>
            </div>

            {/* 5.1 Surround Radar */}
            <div className="rounded-2xl border border-[#213e7d] bg-[#08122e] p-4 flex flex-col items-center justify-center space-y-2">
              <div className="text-xs font-mono text-slate-300 font-bold">5.1 SURROUND RADAR</div>
              <div className="w-36 h-36 rounded-full border-2 border-[#38bdf8]/40 relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-dashed border-[#38bdf8]/30" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-lg shadow-amber-500/50" />
                <span className="absolute top-1 text-[9px] font-mono text-slate-400">CENTER</span>
                <span className="absolute bottom-1 text-[9px] font-mono text-slate-400">SURROUND</span>
                <span className="absolute left-1 text-[9px] font-mono text-slate-400">LEFT</span>
                <span className="absolute right-1 text-[9px] font-mono text-slate-400">RIGHT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 11: MASTER & PACKAGING (SCREENING ROOM & LAURELS)
         ========================================================================= */}
      {selectedStageId === 11 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#f59e0b]" />
                <span>Master Packaging & Theatrical DCI Screening</span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Festival DCP container and ProRes 4444 XQ archival gold master.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Status: Gold Certified
            </span>
          </div>

          {/* Master Certificate & Festival Laurels */}
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0e1d44] to-[#070e24] p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-center gap-6">
              <Award className="w-12 h-12 text-[#f59e0b]" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-[#38bdf8]">
                OFFICIAL FESTIVAL ARCHIVE PACKAGE
              </div>
              <h3 className="text-2xl font-black text-white tracking-wider">
                EXTRACTION BEACON (SCENE 12)
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                Certified complete across all 11 stages. Written decisions and registry locks sealed in ClickHouse.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
              <div className="p-2.5 rounded-xl bg-[#09132e] border border-[#1b3469]">
                <div className="text-[10px] font-mono text-slate-400">CONTAINER</div>
                <div className="text-xs font-bold text-white font-mono">DCI DCP SMPTE</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#09132e] border border-[#1b3469]">
                <div className="text-[10px] font-mono text-slate-400">VIDEO CODEC</div>
                <div className="text-xs font-bold text-white font-mono">ProRes 4444 XQ</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#09132e] border border-[#1b3469]">
                <div className="text-[10px] font-mono text-slate-400">AUDIO</div>
                <div className="text-xs font-bold text-white font-mono">24-bit 48kHz 5.1</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
