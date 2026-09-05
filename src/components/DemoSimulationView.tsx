import React, { useState, useEffect, useRef } from 'react';
import {
  STAGES,
  Scene,
} from '../types';
import { api } from '../api';
import { CINEMATIC_PLATES } from '../utils/cinematicVisuals';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  Film,
  Database,
  Check,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  Scissors,
  Brush,
  SlidersHorizontal,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface DemoSimulationViewProps {
  onRefreshScenes?: () => Promise<void> | void;
}

export const DemoSimulationView: React.FC<DemoSimulationViewProps> = ({
  onRefreshScenes,
}) => {
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [demoScene, setDemoScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [gateACheck, setGateACheck] = useState<{ loading: boolean; passed?: boolean; query: string }>({
    loading: false,
    query: `SELECT count() AS unassigned_count FROM shot_cards WHERE scene_id = 'scene_demo_012' AND (decision IS NULL OR decision = '' OR decision = 'pending');`,
  });

  const [gateBCheck, setGateBCheck] = useState<{ loading: boolean; passed?: boolean; query: string }>({
    loading: false,
    query: `SELECT count() AS unlocked_count FROM registry_rows WHERE scene_id = 'scene_demo_012' AND lock_state != 'locked';`,
  });

  useEffect(() => {
    const initDemo = async () => {
      setLoading(true);
      try {
        const res = await api.seedDemoScene();
        if (res?.scene) {
          setDemoScene(res.scene);
          setCurrentStageId(res.scene.current_stage || 1);
        }
      } catch (err) {
        console.warn('Using local fallback for demo scene:', err);
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
            color_notes: "Unified exposure across Scene 12's 6 shots.",
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
  }, []);

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
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentStageConfig = STAGES.find((s) => s.id === currentStageId) || STAGES[0];

  const handleAdvanceToStage = async (stageNum: number) => {
    if (!demoScene) return;
    try {
      await api.advanceStage(demoScene.scene_id, stageNum, 'DEMO_SIMULATOR');
      setDemoScene((prev) => (prev ? { ...prev, current_stage: stageNum as any } : null));
      if (onRefreshScenes) onRefreshScenes();
    } catch {
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
    <div className="space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="bg-[#0b1636] border border-[#1d3570] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8]">
            DEMO SIMULATION WALKTHROUGH
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-[#f59e0b]" />
            <span>Scene 12: &quot;Extraction Beacon&quot; (11-Stage Progression)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Step through all 11 stages of the cinema pipeline from script breakdown to DCP master packaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play 11 Stages'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentStageId(1);
              handleAdvanceToStage(1);
            }}
            className="p-2 rounded-xl border border-[#22458a] bg-[#0e1f48] hover:bg-[#152a5c] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset to Stage 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage Number Stepper Bar */}
      <div className="border border-[#1b3469] bg-[#0b1636] p-3 rounded-2xl flex items-center justify-between gap-2 overflow-x-auto shadow-lg">
        <div className="flex items-center gap-1.5">
          {STAGES.map((s) => {
            const isCurrent = s.id === currentStageId;
            const isCompleted = s.id < currentStageId;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStageId(s.id);
                  handleAdvanceToStage(s.id);
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#38bdf8] text-black font-extrabold shadow-lg shadow-sky-500/30 ring-2 ring-[#38bdf8]'
                    : isCompleted
                    ? 'border border-[#23458a] text-slate-200 bg-[#0e1f48] hover:bg-[#142654]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.id}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => {
              if (currentStageId > 1) {
                const prev = currentStageId - 1;
                setCurrentStageId(prev);
                handleAdvanceToStage(prev);
              }
            }}
            disabled={currentStageId <= 1}
            className="p-1.5 border border-[#22458a] rounded-xl hover:bg-[#152a5c] text-slate-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-slate-300 font-bold px-1">
            Stage {currentStageId} / 11
          </span>

          <button
            onClick={() => {
              if (currentStageId < 11) {
                const next = currentStageId + 1;
                setCurrentStageId(next);
                handleAdvanceToStage(next);
              }
            }}
            disabled={currentStageId >= 11}
            className="p-1.5 border border-[#22458a] rounded-xl hover:bg-[#152a5c] text-slate-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage Detail Card */}
      <div className="border border-[#1e3870] bg-[#0c183a] p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#162a56] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8]">
              {currentStageConfig.phase.replace('_', ' ')}
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Stage {currentStageConfig.id}: {currentStageConfig.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">{currentStageConfig.description}</p>
          </div>

          {currentStageConfig.skillCommand && (
            <span className="font-mono text-xs border border-[#22458a] text-[#38bdf8] px-3 py-1 rounded-xl bg-[#0e1f48] self-start sm:self-auto">
              {currentStageConfig.skillCommand}
            </span>
          )}
        </div>

        {/* Dynamic Simulation Content Based on Stage */}
        {currentStageId === 1 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">AUTOMATED SCRIPT SHOT DECOMPOSITION:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'SHOT 01 — COOLANT VOID', lens: '35mm Anamorphic', img: CINEMATIC_PLATES.shot1_wide },
                { title: 'SHOT 02 — STEAM TRACKING', lens: '50mm Primes', img: CINEMATIC_PLATES.shot2_medium },
                { title: 'SHOT 03 — TRANSPONDER SLAM', lens: '75mm Close-Focus', img: CINEMATIC_PLATES.shot3_macro },
                { title: 'SHOT 04 — ALARM PROFILE', lens: '85mm Macro ECU', img: CINEMATIC_PLATES.shot4_alarm },
              ].map((shot, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[#1b3469] bg-[#08122d]">
                  <div className="aspect-[16/9] bg-black">
                    <img src={shot.img} alt={shot.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-white truncate">{shot.title}</div>
                    <div className="text-[10px] text-[#38bdf8] font-mono">{shot.lens}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStageId === 2 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">
              SPECIFICATION RESEARCH BOARDS GENERATED WITH GEMINI:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Dr. Elena Vance', desc: 'Character Anchor', img: CINEMATIC_PLATES.elena_concept },
                { title: 'Emergency Transponder', desc: 'Prop Spec', img: CINEMATIC_PLATES.transponder_prop },
                { title: 'Catwalk Gantry', desc: 'Location Plate', img: CINEMATIC_PLATES.catwalk_environment },
                { title: '35mm Anamorphic Spec', desc: 'Optical Specimen', img: CINEMATIC_PLATES.lens_specimen },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-[#1b3469] bg-[#08122d]">
                  <div className="aspect-square bg-black">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-white font-mono">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStageId === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold">
              <span>VISUAL BIBLE WRITTEN DECISIONS (GATE A CHECK):</span>
              <button
                onClick={handleRunGateACheck}
                className="px-3 py-1 rounded-lg bg-[#162d64] border border-[#274f9e] text-[#38bdf8] text-xs hover:bg-[#1a3575] cursor-pointer"
              >
                {gateACheck.loading ? 'Evaluating...' : 'Query Gate A Invariant'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Board #1: INT. CATWALK ENTRY', lens: '35mm T2.2 Anamorphic', img: CINEMATIC_PLATES.shot1_wide },
                { title: 'Board #2: CONDENSER MIST PROFILE', lens: '50mm T2.0 Primes', img: CINEMATIC_PLATES.shot2_medium },
                { title: 'Board #3: EMERGENCY SWITCH SLAM', lens: '75mm Macro', img: CINEMATIC_PLATES.shot3_macro },
              ].map((b, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[#1b3469] bg-[#08122d]">
                  <div className="aspect-[16/9] bg-black relative">
                    <img src={b.img} alt={b.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="border-2 border-emerald-400 text-emerald-400 font-black text-[10px] px-2 py-0.5 rounded rotate-[-12deg] bg-black/70 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>APPROVED</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-white">{b.title}</div>
                    <div className="text-[10px] text-[#38bdf8] font-mono">{b.lens}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStageId === 4 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">5-POSE NEUTRAL GREY MODEL SHEET:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Front (0°)', '3/4 Left (45°)', 'Profile (90°)', '3/4 Right (315°)', 'Rear (180°)'].map((pose, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[#1b3469] bg-[#222530] p-2 text-center">
                  <div className="aspect-[3/4] flex items-center justify-center">
                    <img src={CINEMATIC_PLATES.elena_concept} alt={pose} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[11px] font-bold text-white mt-1">{pose}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStageId === 5 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold">
              <span>COMBAT MATRIX STRESS-TEST (GATE B CHECK):</span>
              <button
                onClick={handleRunGateBCheck}
                className="px-3 py-1 rounded-lg bg-[#162d64] border border-[#274f9e] text-emerald-400 text-xs hover:bg-[#1a3575] cursor-pointer"
              >
                {gateBCheck.loading ? 'Evaluating...' : 'Query Gate B Invariant'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Sodium Strobe', score: '10/10 PASS', img: CINEMATIC_PLATES.shot4_alarm },
                { title: 'Motion Blur', score: '10/10 PASS', img: CINEMATIC_PLATES.shot2_medium },
                { title: 'Two-Shot Depth', score: '10/10 PASS', img: CINEMATIC_PLATES.shot1_wide },
                { title: 'Condensation', score: '10/10 PASS', img: CINEMATIC_PLATES.shot3_macro },
              ].map((m, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[#1b3469] bg-[#08122d]">
                  <div className="aspect-[4/3] bg-black">
                    <img src={m.img} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white">{m.title}</span>
                    <span className="text-emerald-400 font-mono font-bold">{m.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStageId === 6 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">
              HIGH-END CINEMA CAMERA VIEWFINDER &amp; VIDEO PLAYBACK:
            </div>
            <div className="rounded-2xl border border-[#23458a] bg-black overflow-hidden relative aspect-[16/9] max-h-[320px]">
              <video
                src="/assets/demo_scene_12_veo_clip.mp4"
                playsInline
                autoPlay
                loop
                muted
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-red-500 border border-red-500/40 font-bold">
                REC ● 24.000 FPS
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-white/20">
                2.39:1 ANAMORPHIC
              </div>
            </div>
          </div>
        )}

        {currentStageId === 7 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">EDITORIAL NLE TIMELINE:</div>
            <div className="p-3 bg-[#08122d] border border-[#1b3469] rounded-xl space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Shot 01 (Wide)', img: CINEMATIC_PLATES.shot1_wide },
                  { name: 'Shot 02 (Tracking)', img: CINEMATIC_PLATES.shot2_medium },
                  { name: 'Shot 03 (Macro)', img: CINEMATIC_PLATES.shot3_macro },
                  { name: 'Shot 04 (Alarm)', img: CINEMATIC_PLATES.shot4_alarm },
                ].map((c, i) => (
                  <div key={i} className="aspect-[16/9] bg-black rounded overflow-hidden border border-[#23458a]">
                    <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="h-6 bg-[#040817] rounded flex items-center px-2 gap-0.5 overflow-hidden">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#38bdf8]/60 rounded-full"
                    style={{ height: `${Math.sin(i * 0.5) * 50 + 40}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStageId === 8 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">DIGITAL INPAINTING CLEANUP:</div>
            <div className="rounded-xl border border-[#1b3469] bg-black overflow-hidden aspect-[16/9] max-h-[300px] relative flex items-center justify-center">
              <img src={CINEMATIC_PLATES.shot2_medium} alt="Cleanup plate" className="w-full h-full object-contain" />
              <div className="absolute top-3 left-3 bg-emerald-500 text-black font-bold text-[10px] font-mono px-2 py-0.5 rounded shadow">
                CLEANED &amp; INPAINTED MASTER
              </div>
            </div>
          </div>
        )}

        {currentStageId === 9 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">ACES 1.3 THEATRICAL COLOR GRADING:</div>
            <div className="rounded-xl border border-[#1b3469] bg-black overflow-hidden aspect-[16/9] max-h-[300px] relative flex items-center justify-center">
              <img
                src={CINEMATIC_PLATES.shot1_wide}
                alt="Color plate"
                style={{ filter: 'sepia(0.4) saturate(1.4) contrast(1.2)' }}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#38bdf8] text-black font-bold text-[10px] font-mono px-2 py-0.5 rounded shadow">
                LUT: SODIUM AMBER &amp; TEAL
              </div>
            </div>
          </div>
        )}

        {currentStageId === 10 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">POST-SOUND STUDIO &amp; -23 LUFS RADAR:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#08122d] border border-[#1b3469] rounded-xl flex items-end justify-between gap-1 h-36">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-[#0284c7] via-[#38bdf8] to-[#f59e0b] rounded-t-sm"
                    style={{ height: `${(Math.sin(i * 0.4) * 0.4 + 0.5) * 85}%` }}
                  />
                ))}
              </div>
              <div className="p-3 bg-[#08122d] border border-[#1b3469] rounded-xl flex flex-col items-center justify-center space-y-1">
                <div className="w-24 h-24 rounded-full border border-[#38bdf8]/50 relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                </div>
                <div className="text-[11px] font-mono text-slate-300">5.1 SURROUND SPATIAL CALIBRATED</div>
              </div>
            </div>
          </div>
        )}

        {currentStageId === 11 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 font-bold">DCI MASTER DCP THEATRICAL PACKAGE:</div>
            <div className="p-6 bg-gradient-to-b from-[#0e1d44] to-[#070e24] border-2 border-amber-500/40 rounded-2xl text-center space-y-3 shadow-2xl">
              <Award className="w-10 h-10 text-[#f59e0b] mx-auto" />
              <div className="text-lg font-black text-white font-mono">EXTRACTION BEACON (SCENE 12)</div>
              <div className="text-xs text-emerald-400 font-mono">DCP SMPTE // PRORES 4444 XQ // CERTIFIED GOLD</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
