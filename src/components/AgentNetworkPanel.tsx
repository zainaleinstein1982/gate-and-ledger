import React, { useState } from 'react';
import { AgentSkillTrace, Scene } from '../types';
import { api } from '../api';
import {
  Play,
  Check,
  Terminal,
  Cpu,
  Sparkles,
  ShieldCheck,
  Layers,
  Camera,
} from 'lucide-react';

interface AgentNetworkPanelProps {
  scenes: Scene[];
}

export const AgentNetworkPanel: React.FC<AgentNetworkPanelProps> = ({ scenes }) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('/stress-test');
  const [targetSceneId, setTargetSceneId] = useState<string>(scenes[0]?.scene_id || 'scene_001');
  const [executing, setExecuting] = useState(false);
  const [lastTrace, setLastTrace] = useState<AgentSkillTrace | null>(null);
  const [rawResult, setRawResult] = useState<any>(null);

  const skills = [
    {
      command: '/setup',
      name: 'Architecture Setup',
      stage: 'One-Time Pre-flight',
      description: 'Initializes ClickHouse MergeTree tables and directory structure.',
      target: 'ClickHouse Engine',
    },
    {
      command: '/studio-init',
      name: 'Studio Inception',
      stage: 'One-Time Project Init',
      description: 'Registers the project, active phases, and 11-stage cadence in ClickHouse.',
      target: 'ClickHouse Engine',
    },
    {
      command: '/film-breakdown',
      name: 'Script & Shot Breakdown',
      stage: 'Stage 1 (Breakdown)',
      description: 'Parses dramatic text/synopsis into camera shot cards with pending decisions.',
      target: 'shot_cards Table',
    },
    {
      command: '/reference-board',
      name: 'Reference Board Specialist',
      stage: 'Stage 2 (References)',
      description: 'Synthesizes visual mood descriptors, lighting cues, and anamorphic briefs.',
      target: 'shot_cards.lighting_mood',
    },
    {
      command: '/asset-passport',
      name: 'Asset Passport Authority',
      stage: 'Stage 4 (Asset Sheets)',
      description: 'The ONLY place an asset canonical spec is written and locked. Immutable.',
      target: 'asset_passports Table',
    },
    {
      command: '/stress-test',
      name: 'Gate A Stress-Tester',
      stage: 'Pre-Gate A Barrier',
      description: 'Executes ClickHouse aggregate check for unassigned decisions before opening Gate A.',
      target: 'Gate A Invariant',
    },
    {
      command: '/shot-prompt',
      name: '15-Block Generation Engine',
      stage: 'Stage 6 (Generation)',
      description: 'Compiles the strict 15-block prompt contract from locked passports for Veo rendering.',
      target: 'Veo / Generations Table',
    },
  ];

  const handleExecuteSkill = async () => {
    setExecuting(true);
    setLastTrace(null);
    setRawResult(null);
    try {
      let payload: any = { sceneId: targetSceneId };
      if (selectedSkill === '/film-breakdown') {
        payload = {
          title: 'SUB-LEVEL 9 INFILTRATION',
          synopsis: 'Elena and Reyes descend the breached service lift into the reactor quadrant.',
        };
      } else if (selectedSkill === '/reference-board') {
        payload = {
          assetName: 'Titanium Arm Prosthetic',
          lightingStyle: 'High-contrast 4:1 amber sodium rim light, anamorphic blue flare',
        };
      } else if (selectedSkill === '/asset-passport') {
        payload = {
          kind: 'character',
          name: 'Chief Engineer Thorne',
          anchor: 'Grizzled 50-year-old station engineer with cybernetic ocular graft on left brow.',
          costume: 'Heavy flame-retardant EVA grease-stained flight harness over dark carbon-weave jumpsuit.',
          lighting: 'High key contrast 4:1, amber sodium rim light.',
        };
      } else if (selectedSkill === '/shot-prompt') {
        payload = {
          sceneId: targetSceneId,
          shotId: 'shot_001',
        };
      }

      const res = await api.runSkill(selectedSkill, payload);
      setRawResult(res);
      setLastTrace({
        id: `trace_${Date.now()}`,
        skillName: selectedSkill,
        timestamp: new Date().toISOString(),
        input: payload,
        output: res,
        execution_ms: 120,
        status: res.error ? 'error' : 'success',
      });
    } catch (err: any) {
      setRawResult({ error: err.message || 'Execution error' });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-[#0b1636] border border-[#1d3570] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8]">
            AGENT NETWORK // 7 SPECIALIZED MCP SKILLS
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#38bdf8]" />
            <span>Deterministic Skill Graph</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Seven specialized skills operate under strict ClickHouse invariant constraints. No skill can bypass gates.
          </p>
        </div>

        <button
          onClick={handleExecuteSkill}
          disabled={executing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{executing ? 'Executing...' : `Execute ${selectedSkill}`}</span>
        </button>
      </div>

      {/* Target Scene Selection Bar */}
      <div className="border border-[#1b3469] bg-[#0b1636] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400 text-[11px]">TARGET SCENE:</span>
          <select
            value={targetSceneId}
            onChange={(e) => setTargetSceneId(e.target.value)}
            aria-label="Target Scene"
            className="bg-[#0e1f4a] border border-[#234791] text-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-[#38bdf8]"
          >
            {scenes.map((s) => (
              <option key={s.scene_id} value={s.scene_id}>
                Scene #{s.scene_number}: {s.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[11px] font-mono text-[#38bdf8]">
          Selected Skill: <strong className="text-white">{selectedSkill}</strong>
        </span>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => {
          const isSelected = selectedSkill === skill.command;
          return (
            <div
              key={skill.command}
              onClick={() => setSelectedSkill(skill.command)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-[#0c183a] shadow-lg ${
                isSelected
                  ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/40 shadow-sky-950/60'
                  : 'border-[#1e3870] hover:border-[#2f55a6]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#162a56]">
                <span className="font-mono text-xs font-bold text-[#38bdf8] bg-[#122452] border border-[#284f9b] px-2 py-0.5 rounded-lg">
                  {skill.command}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{skill.stage}</span>
              </div>

              <div className="mt-3 space-y-1">
                <div className="text-xs font-bold text-white">{skill.name}</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{skill.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#162a56] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>TARGET:</span>
                <span className="text-slate-300">{skill.target}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Trace Output */}
      {lastTrace && (
        <div className="border border-[#1e3870] bg-[#0c183a] rounded-2xl p-4 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#162a56] pb-2">
            <span className="text-slate-300 font-bold">CLICKHOUSE AGENT EXECUTION TRACE</span>
            <span className="text-emerald-400 font-bold">STATUS: {lastTrace.status.toUpperCase()}</span>
          </div>

          <pre className="p-3 rounded-xl bg-[#070e24] border border-[#1b3469] text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
            {JSON.stringify(rawResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
