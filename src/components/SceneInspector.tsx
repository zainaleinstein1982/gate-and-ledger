import React, { useState, useEffect } from 'react';
import {
  Scene,
  ShotCard,
  RegistryRow,
  GenerationRecord,
  AssetPassport,
  STAGES,
  GateACheckResult,
  GateBCheckResult,
} from '../types';
import { api } from '../api';
import {
  X,
  Clapperboard,
  ShieldCheck,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  UserCheck,
  Layers,
  ChevronRight,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';

interface SceneInspectorProps {
  scene: Scene;
  onClose: () => void;
  onUpdateShotDecision: (
    cardId: string,
    decision: 'approved' | 'revised' | 'rejected',
    actor: string,
    notes?: string
  ) => Promise<void>;
  onCheckGateA: (sceneId: string) => Promise<GateACheckResult>;
  onCheckGateB: (sceneId: string) => Promise<GateBCheckResult>;
  onAdvanceStage: (sceneId: string, targetStage: number) => Promise<void>;
  onRunShotPrompt: (sceneId: string, shotId: string) => Promise<void>;
  onUpdateFinishing: (
    sceneId: string,
    checklist: Scene['finishing_checklist'],
    actor: string
  ) => Promise<void>;
  allPassports: AssetPassport[];
}

export const SceneInspector: React.FC<SceneInspectorProps> = ({
  scene,
  onClose,
  onUpdateShotDecision,
  onCheckGateA,
  onCheckGateB,
  onAdvanceStage,
  onRunShotPrompt,
  onUpdateFinishing,
  allPassports,
}) => {
  const [activeTab, setActiveTab] = useState<'shots' | 'passports' | 'gates' | 'finishing' | 'generations'>('shots');
  const [shots, setShots] = useState<ShotCard[]>([]);
  const [registryRows, setRegistryRows] = useState<RegistryRow[]>([]);
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateAResult, setGateAResult] = useState<GateACheckResult | null>(null);
  const [gateBResult, setGateBResult] = useState<GateBCheckResult | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [decisionActor, setDecisionActor] = useState('DIRECTOR_CHEN');
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [finishingState, setFinishingState] = useState(scene.finishing_checklist);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getSceneDetails(scene.scene_id);
      setShots(data.shots || []);
      setRegistryRows(data.registry_rows || []);
      setGenerations(data.generations || []);
      setFinishingState(data.finishing_checklist || scene.finishing_checklist);

      // Evaluate gates live
      const [resA, resB] = await Promise.allSettled([
        onCheckGateA(scene.scene_id),
        onCheckGateB(scene.scene_id),
      ]);
      if (resA.status === 'fulfilled') setGateAResult(resA.value);
      if (resB.status === 'fulfilled') setGateBResult(resB.value);
    } catch (e) {
      console.warn('Failed to load full scene details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [scene.scene_id]);

  const handleDecisionChange = async (cardId: string, decision: 'approved' | 'revised' | 'rejected') => {
    setActionInProgress(true);
    try {
      const notes = decisionNotes[cardId] || '';
      await onUpdateShotDecision(cardId, decision, decisionActor, notes);
      await fetchDetails();
    } catch (err: any) {
      console.error('Decision change failed:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleTriggerShotPrompt = async (shotId: string) => {
    setActionInProgress(true);
    try {
      await onRunShotPrompt(scene.scene_id, shotId);
      await fetchDetails();
      setActiveTab('generations');
    } catch (err: any) {
      console.error('Prompt compilation error:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSaveFinishing = async () => {
    setActionInProgress(true);
    try {
      await onUpdateFinishing(scene.scene_id, finishingState, 'HUMAN_POST_SUPERVISOR');
      await fetchDetails();
    } catch (err: any) {
      console.error('Finishing save error:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const currentStageConfig = STAGES.find((s) => s.id === scene.current_stage);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold border border-amber-500/30">
                SCENE #{scene.scene_number}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">
                Stage {scene.current_stage}: {currentStageConfig?.name}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-mono text-slate-400">
                Phase: {scene.current_phase}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{scene.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{scene.synopsis}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gate Badges Strip */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-850 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Gate A:</span>
              <span
                className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                  gateAResult?.passed
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {gateAResult?.passed ? 'PASSED (0 unassigned)' : 'BLOCKED (Decision Required)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Gate B:</span>
              <span
                className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                  gateBResult?.passed
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                }`}
              >
                {gateBResult?.passed ? 'PASSED (All Locked)' : 'BLOCKED (Unlocked Assets)'}
              </span>
            </div>
          </div>

          <button
            onClick={fetchDetails}
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
            title="Refresh ClickHouse State"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-[11px]">Sync MCP</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-850 px-5 bg-slate-950">
          <button
            onClick={() => setActiveTab('shots')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'shots'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Shot Cards & Decisions ({shots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('passports')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'passports'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Asset Passports ({registryRows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gates')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'gates'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ClickHouse Gate SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('generations')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'generations'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Plates & Renders ({generations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finishing')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'finishing'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Human Finishing (9-11)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
          {/* TAB 1: SHOT CARDS & DECISIONS (GATE A SOURCE) */}
          {activeTab === 'shots' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300">
                <span className="font-bold block mb-0.5">GATE A INVARIANT RULE:</span>
                "Nothing advances until every shot board carries a written, attributable decision: approved, revised, or rejected. No silent defaults."
              </div>

              {/* Attribution Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">Signing Actor:</span>
                  <select
                    value={decisionActor}
                    onChange={(e) => setDecisionActor(e.target.value)}
                    className="bg-slate-950 border border-slate-750 text-slate-200 rounded px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="DIRECTOR_CHEN">Director Chen (Head of Direction)</option>
                    <option value="VFX_SUPERVISOR_KIM">VFX Supervisor Kim</option>
                    <option value="DP_VASQUEZ">Cinematographer Vasquez</option>
                    <option value="PRODUCTION_DESIGNER">Production Designer</option>
                  </select>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">Logged to ClickHouse audit_log</span>
              </div>

              {/* Shot Card List */}
              <div className="space-y-3">
                {shots.map((card) => (
                  <div
                    key={card.card_id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-xs font-bold">
                          SHOT #{card.shot_number}
                        </span>
                        <h4 className="font-mono text-xs text-slate-300 font-semibold">{card.slugline}</h4>
                      </div>

                      {/* Current Decision Pill */}
                      <span
                        className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold ${
                          card.decision === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : card.decision === 'revised'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : card.decision === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 animate-pulse'
                        }`}
                      >
                        {card.decision || 'pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">CAMERA ANGLE:</span>
                        <span>{card.camera_angle}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">LENS PACKAGE:</span>
                        <span>{card.lens_spec || '40mm Anamorphic'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="text-slate-500 font-mono text-[10px] block">ACTION BEAT:</span>
                      {card.action_desc}
                    </p>

                    {card.lighting_mood && (
                      <p className="text-xs text-slate-400 italic">
                        <span className="text-slate-500 font-mono text-[10px] block not-italic">LIGHTING & MOOD:</span>
                        {card.lighting_mood}
                      </p>
                    )}

                    {card.decided_by && (
                      <div className="text-[11px] font-mono text-slate-500 border-t border-slate-800 pt-2 flex items-center justify-between">
                        <span>Attributed: {card.decided_by}</span>
                        <span>{card.decided_at ? new Date(card.decided_at).toLocaleTimeString() : ''}</span>
                      </div>
                    )}

                    {/* Decision Action Buttons */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Attributable decision notes (stored in ClickHouse diff)..."
                        value={decisionNotes[card.card_id] || card.decision_notes || ''}
                        onChange={(e) =>
                          setDecisionNotes({ ...decisionNotes, [card.card_id]: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                      />

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            disabled={actionInProgress}
                            onClick={() => handleDecisionChange(card.card_id, 'approved')}
                            className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-mono font-medium transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            disabled={actionInProgress}
                            onClick={() => handleDecisionChange(card.card_id, 'revised')}
                            className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded text-xs font-mono font-medium transition-colors"
                          >
                            ✎ Mark Revised
                          </button>
                          <button
                            disabled={actionInProgress}
                            onClick={() => handleDecisionChange(card.card_id, 'rejected')}
                            className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded text-xs font-mono font-medium transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>

                        {/* Trigger Prompt Compilation for this shot */}
                        <button
                          disabled={actionInProgress || !gateAResult?.passed}
                          onClick={() => handleTriggerShotPrompt(card.card_id)}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-slate-950 font-bold rounded text-xs font-mono transition-colors flex items-center gap-1"
                          title={!gateAResult?.passed ? 'Gate A must pass before generating' : 'Compile prompt from locked library'}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Compile & Render</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ASSET PASSPORTS & VERBATIM INVARIANTS */}
          {activeTab === 'passports' && (
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 text-xs text-sky-300">
                <span className="font-bold block mb-0.5">INVARIANT 2 & 3:</span>
                "One asset, one passport — each asset gets exactly one canonical spec row. Downstream stages must copy its fields into generation prompts verbatim, never paraphrase."
              </div>

              <div className="space-y-3">
                {registryRows.map((row) => {
                  const passport = allPassports.find((p) => p.asset_id === row.asset_id);
                  return (
                    <div
                      key={row.row_id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold">
                              {row.asset_kind}
                            </span>
                            <h4 className="font-bold text-sm text-slate-100">{row.asset_name}</h4>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                            ID: {row.asset_id} • Locked v{row.locked_version} by {row.updated_by}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-mono px-2.5 py-1 rounded font-bold uppercase ${
                            row.lock_state === 'locked'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {row.lock_state}
                        </span>
                      </div>

                      {passport && (
                        <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block">VISUAL ANCHOR:</span>
                            <p className="text-slate-300">{passport.spec_json.visual_anchor}</p>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block">COSTUME / MATERIAL:</span>
                            <p className="text-slate-300">{passport.spec_json.costume_or_material}</p>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block">LIGHTING RULES:</span>
                            <p className="text-slate-300">{passport.spec_json.lighting_rules}</p>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-amber-400 block font-bold">
                              CANONICAL VERBATIM PHRASE (DOWNSTREAM COPIED):
                            </span>
                            <p className="text-amber-200/90 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                              "{passport.spec_json.canonical_prompt_phrase}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CLICKHOUSE GATE VERIFICATION SQL */}
          {activeTab === 'gates' && (
            <div className="space-y-4">
              {/* Gate A Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-slate-100">Gate A: Decision Gate Condition</h3>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      gateAResult?.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {gateAResult?.passed ? 'STATUS: OPEN' : 'STATUS: CLOSED'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-850">
                  <span className="text-slate-500 block text-[10px]">CLICKHOUSE AGGREGATE QUERY:</span>
                  <code className="text-amber-300">{gateAResult?.sql_query}</code>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">TOTAL CARDS</span>
                    <span className="font-bold text-slate-200">{gateAResult?.total_cards}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">UNASSIGNED</span>
                    <span className="font-bold text-rose-400">{gateAResult?.unassigned_count}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">APPROVED</span>
                    <span className="font-bold text-emerald-400">{gateAResult?.approved_count}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">REVISED</span>
                    <span className="font-bold text-amber-400">{gateAResult?.revised_count}</span>
                  </div>
                </div>

                {gateAResult?.blockers && gateAResult.blockers.length > 0 && (
                  <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded text-xs text-rose-300 space-y-1">
                    <span className="font-bold block">Current Gate A Blockers:</span>
                    {gateAResult.blockers.map((b, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gate B Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-400" />
                    <h3 className="font-bold text-sm text-slate-100">Gate B: Registry Gate Condition</h3>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      gateBResult?.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {gateBResult?.passed ? 'STATUS: OPEN' : 'STATUS: CLOSED'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-850">
                  <span className="text-slate-500 block text-[10px]">CLICKHOUSE AGGREGATE QUERY:</span>
                  <code className="text-sky-300">{gateBResult?.sql_query}</code>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">REGISTRY ROWS</span>
                    <span className="font-bold text-slate-200">{gateBResult?.total_registry_rows}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">LOCKED</span>
                    <span className="font-bold text-emerald-400">{gateBResult?.locked_count}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">UNLOCKED (VIOLATION)</span>
                    <span className="font-bold text-rose-400">{gateBResult?.unlocked_count}</span>
                  </div>
                </div>

                {gateBResult?.blockers && gateBResult.blockers.length > 0 && (
                  <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded text-xs text-rose-300 space-y-1">
                    <span className="font-bold block">Current Gate B Blockers:</span>
                    {gateBResult.blockers.map((b, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GENERATIONS & PLATES */}
          {activeTab === 'generations' && (
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 text-xs text-sky-300">
                <span className="font-bold block mb-0.5">GENERATION AUDIT TRAIL:</span>
                "Stage 6 generations run strictly through /shot-prompt pulling locked library & passport rows verbatim. No raw prompts."
              </div>

              {generations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No plates generated yet. Approve all shot cards to open Gate A, then click "Compile & Render".
                </div>
              ) : (
                <div className="space-y-4">
                  {generations.map((gen) => (
                    <div
                      key={gen.gen_id}
                      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
                    >
                      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                        <img
                          src={gen.preview_url}
                          alt="Rendered plate"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 rounded font-mono text-[10px] text-amber-400 border border-amber-500/40">
                          COST: ${gen.cost_estimate.toFixed(3)}
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 rounded font-mono text-[10px] text-sky-300 border border-sky-500/40">
                          {gen.model}
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>GEN ID: {gen.gen_id}</span>
                          <span>{new Date(gen.created_at).toLocaleString()}</span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="text-[10px] font-mono text-slate-500 block mb-1">
                            COMPILED VERBATIM PROMPT:
                          </span>
                          <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                            {gen.prompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HUMAN FINISHING CHECKLIST (STAGES 9-11) */}
          {activeTab === 'finishing' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-300">
                <span className="font-bold block mb-0.5">PHASE 3 — HUMAN ONLY INVARIANT:</span>
                "No skill touches stages 9-11 (color/sound/master). That work stays human, on purpose — the agent's job is to hold the pipeline, not finish the film."
              </div>

              <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                {/* Stage 9: Color */}
                <div className="space-y-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="color_check"
                        checked={finishingState.color_approved}
                        onChange={(e) =>
                          setFinishingState({ ...finishingState, color_approved: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 focus:outline-none"
                      />
                      <label htmlFor="color_check" className="font-bold text-xs text-slate-100 cursor-pointer">
                        Stage 9: Colorist Pass (DaVinci Resolve / ACEScc)
                      </label>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">HUMAN LEAD: COLORIST</span>
                  </div>
                  <input
                    type="text"
                    placeholder="LUT notes, CDL adjustments, printer points..."
                    value={finishingState.color_notes}
                    onChange={(e) =>
                      setFinishingState({ ...finishingState, color_notes: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Stage 10: Sound */}
                <div className="space-y-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="sound_check"
                        checked={finishingState.sound_approved}
                        onChange={(e) =>
                          setFinishingState({ ...finishingState, sound_approved: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 focus:outline-none"
                      />
                      <label htmlFor="sound_check" className="font-bold text-xs text-slate-100 cursor-pointer">
                        Stage 10: Sound Supervisor Sign-off (Dolby Atmos 7.1.4)
                      </label>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">HUMAN LEAD: SOUND DESIGNER</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Foley pass, dialog cleanup, score mix stems..."
                    value={finishingState.sound_notes}
                    onChange={(e) =>
                      setFinishingState({ ...finishingState, sound_notes: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Stage 11: Master */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="master_check"
                        checked={finishingState.master_approved}
                        onChange={(e) =>
                          setFinishingState({ ...finishingState, master_approved: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 focus:outline-none"
                      />
                      <label htmlFor="master_check" className="font-bold text-xs text-slate-100 cursor-pointer">
                        Stage 11: Master Delivery & Archival Sign-off
                      </label>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">HUMAN LEAD: POST PRODUCER</span>
                  </div>
                  <input
                    type="text"
                    placeholder="DCP checksum, ProRes 4444 XQ archive package, LTO tape verification..."
                    value={finishingState.master_notes}
                    onChange={(e) =>
                      setFinishingState({ ...finishingState, master_notes: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    disabled={actionInProgress}
                    onClick={handleSaveFinishing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Human Finishing Ledger</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Advance Controls */}
        <div className="p-4 border-t border-slate-850 bg-slate-900 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Current: Stage {scene.current_stage} ({currentStageConfig?.name})
          </div>

          <div className="flex items-center gap-2">
            {scene.current_stage > 1 && (
              <button
                disabled={actionInProgress}
                onClick={async () => {
                  setActionInProgress(true);
                  try {
                    await onAdvanceStage(scene.scene_id, scene.current_stage - 1);
                    await fetchDetails();
                  } finally {
                    setActionInProgress(false);
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium transition-colors"
              >
                ← Reverse Stage
              </button>
            )}

            {scene.current_stage < 11 && (
              <button
                disabled={actionInProgress}
                onClick={async () => {
                  setActionInProgress(true);
                  try {
                    await onAdvanceStage(scene.scene_id, scene.current_stage + 1);
                    await fetchDetails();
                  } catch (e: any) {
                    alert(e.message);
                  } finally {
                    setActionInProgress(false);
                  }
                }}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1"
              >
                <span>Advance to Stage {scene.current_stage + 1}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
