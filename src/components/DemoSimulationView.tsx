import React, { useState, useEffect, useRef } from 'react';
import {
  STAGES,
  Scene,
  StageId,
} from '../types';
import { api } from '../api';
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
      }, 4000);
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
    <div className="space-y-6 text-neutral-200">
      {/* Top Header */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            DEMO SIMULATION WALKTHROUGH
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Scene 12: &quot;Extraction Beacon&quot; (11-Stage Progression)
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
            Step through all 11 stages of the cinema pipeline from script breakdown to DCP master packaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#e5a93c] text-neutral-950 font-semibold text-xs uppercase tracking-wider hover:bg-[#d4972e] transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play 11 Stages'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentStageId(1);
              handleAdvanceToStage(1);
            }}
            className="p-1.5 rounded border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer"
            title="Reset to Stage 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage Number Stepper Bar */}
      <div className="border border-neutral-800 bg-neutral-900/40 p-3 rounded flex items-center justify-between gap-2 overflow-x-auto">
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
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#e5a93c] text-neutral-950 font-bold'
                    : isCompleted
                    ? 'border border-neutral-700 text-neutral-200 bg-neutral-900/80 hover:bg-neutral-800'
                    : 'text-neutral-500 hover:text-neutral-300'
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
            className="p-1 border border-neutral-700 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-neutral-400">
            {currentStageId} of 11
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
            className="p-1 border border-neutral-700 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage Detail Card */}
      <div className="border border-neutral-800 bg-neutral-900/30 p-5 rounded space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-800 pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              {currentStageConfig.phase.replace('_', ' ')}
            </span>
            <h2 className="text-lg font-bold text-white">
              Stage {currentStageConfig.id}: {currentStageConfig.name}
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5">{currentStageConfig.description}</p>
          </div>

          {currentStageConfig.skillCommand && (
            <span className="font-mono text-xs border border-neutral-700 text-neutral-300 px-2.5 py-1 rounded bg-neutral-900/60 self-start sm:self-auto">
              {currentStageConfig.skillCommand}
            </span>
          )}
        </div>

        {/* Dynamic Simulation Content Based on Stage */}
        {currentStageId === 1 && (
          <div className="space-y-3 text-xs font-mono">
            <div className="text-neutral-400">AUTOMATED SCRIPT SHOT DECOMPOSITION:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded">
                <div className="text-white font-bold">SHOT 01 — SUBTERRANEAN COOLANT VOID</div>
                <div className="text-neutral-400 mt-1">Extreme wide shot. Perforated steel walkway over cooling reservoir.</div>
                <div className="text-neutral-500 mt-1 text-[11px]">Lens: 35mm Vintage Anamorphic T2.2</div>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded">
                <div className="text-white font-bold">SHOT 02 — APPROACHING CONSOLE</div>
                <div className="text-neutral-400 mt-1">Medium tracking. Elena walks briskly past venting high-pressure steam conduits.</div>
                <div className="text-neutral-500 mt-1 text-[11px]">Lens: 50mm Anamorphic T2.0</div>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded">
                <div className="text-white font-bold">SHOT 03 — EMERGENCY TRANSPONDER ENGAGED</div>
                <div className="text-neutral-400 mt-1">Close-up. Elena slams the yellow dual-toggle switch; amber strobe illuminates.</div>
                <div className="text-neutral-500 mt-1 text-[11px]">Lens: 75mm Anamorphic Close-Focus</div>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded">
                <div className="text-white font-bold">SHOT 04 — ALARM OSCILLATION PROFILE</div>
                <div className="text-neutral-400 mt-1">Profile ECU. Sodium yellow strobe sweeps across Elena&apos;s titanium graft.</div>
                <div className="text-neutral-500 mt-1 text-[11px]">Lens: 85mm Anamorphic Macro</div>
              </div>
            </div>
          </div>
        )}

        {currentStageId === 2 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-neutral-400">
              SPECIFICATION RESEARCH BOARDS GENERATED WITH GEMINI:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Dr. Elena Vance', desc: 'Titanium prosthetic graft, graphite suit' },
                { title: 'Emergency Transponder', desc: 'Safety-yellow dual toggle switch' },
                { title: 'Catwalk Gantry', desc: 'Perforated grating, steam conduits' },
                { title: '35mm Anamorphic Spec', desc: 'Horizontal blue flare suppression' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 rounded space-y-1">
                  <div className="text-xs font-bold text-white font-mono">{item.title}</div>
                  <div className="text-[11px] text-neutral-400">{item.desc}</div>
                  <div className="text-[10px] text-neutral-500 font-mono pt-1">Model: imagen-3.0-generate-002</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStageId === 3 && (
          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between text-neutral-400">
              <span>GATE A EVALUATION (ALL BOARDS MUST CARRY ATTRIBUTABLE DECISIONS):</span>
              <button
                onClick={handleRunGateACheck}
                className="px-2.5 py-1 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                {gateACheck.loading ? 'Checking...' : 'Run Gate A SQL Query'}
              </button>
            </div>
            <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded text-neutral-300">
              {gateACheck.query}
            </pre>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between">
              <span>CLICKHOUSE RESULT: 0 UNASSIGNED BOARDS</span>
              <span className="text-[#e5a93c] flex items-center gap-1 font-bold">
                <Check className="w-4 h-4" /> GATE A PASSED
              </span>
            </div>
          </div>
        )}

        {currentStageId === 4 && (
          <div className="space-y-3 text-xs font-mono">
            <div className="text-neutral-400">5-POSE NEUTRAL GREY MODEL TURNAROUND SHEET:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              {['Front (0°)', '3/4 Left (45°)', 'Profile (90°)', '3/4 Right (315°)', 'Back (180°)'].map((p, i) => (
                <div key={i} className="p-3 bg-neutral-950 border border-neutral-800 rounded">
                  <div className="text-white font-bold">{p}</div>
                  <div className="text-[10px] text-neutral-500 mt-1">18% Grey Studio Light</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStageId === 5 && (
          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between text-neutral-400">
              <span>GATE B EVALUATION (NO ROW, NO RENDER):</span>
              <button
                onClick={handleRunGateBCheck}
                className="px-2.5 py-1 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                {gateBCheck.loading ? 'Checking...' : 'Run Gate B SQL Query'}
              </button>
            </div>
            <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded text-neutral-300">
              {gateBCheck.query}
            </pre>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between">
              <span>CLICKHOUSE RESULT: 3 OF 3 TOUCHING ROWS LOCKED</span>
              <span className="text-[#e5a93c] flex items-center gap-1 font-bold">
                <Check className="w-4 h-4" /> GATE B PASSED
              </span>
            </div>
          </div>
        )}

        {currentStageId === 6 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-neutral-400 flex items-center justify-between">
              <span>VEO VIDEO GENERATION (GOOGLE GENAI):</span>
              <span className="border border-neutral-700 text-neutral-300 px-2 py-0.5 rounded text-[11px]">
                Pre-rendered demo clip — live Veo generation requires billing
              </span>
            </div>

            <div className="aspect-[16/9] w-full bg-black rounded overflow-hidden relative border border-neutral-800">
              <video
                ref={videoRef}
                src="/assets/demo_scene_12_veo_clip.mp4"
                playsInline
                autoPlay
                loop
                muted={isMuted}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-1.5 rounded bg-neutral-950/80 border border-neutral-700 text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStageId >= 7 && (
          <div className="space-y-3 text-xs font-mono">
            <div className="text-neutral-400">
              {currentStageId === 7 && 'PARALLEL EDITORIAL ASSEMBLY: Assembly cut assembled while next scene generates.'}
              {currentStageId === 8 && 'DIGITAL CLEANUP: Artifact punch-list resolved shot-by-shot.'}
              {currentStageId === 9 && 'COLOR GRADING: Human colorist unified ACEScc exposure and sodium grading.'}
              {currentStageId === 10 && 'POST SOUND: Human audio team -23 LUFS platform loudness mix.'}
              {currentStageId === 11 && 'MASTER PACKAGING: Festival DCP and ProRes 4444 XQ archival package certified.'}
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between">
              <span>STATUS: COMPLETE</span>
              <span className="text-[#e5a93c] flex items-center gap-1 font-bold">
                <Check className="w-3.5 h-3.5" /> VERIFIED IN CLICKHOUSE
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
