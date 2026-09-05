import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Film } from 'lucide-react';

export const LearningsPanel: React.FC = () => {
  return (
    <div className="w-full space-y-6 max-w-4xl text-slate-100">
      {/* Title Header */}
      <div className="bg-[#0b1636] border border-[#1d3570] rounded-2xl p-5 shadow-xl">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8]">
          ARCHITECTURAL ESSAY // PIPELINE PHILOSOPHY
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
          <BookOpen className="w-6 h-6 text-[#38bdf8]" />
          <span>Registry-As-Memory for Cinema Crews</span>
        </h1>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
          Why generative models without a stateful columnar registry fail cinematic production rigor, how ClickHouse provides deterministic gate memory, and why human craft holds stages 9–11.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="space-y-4">
        {/* Pillar 1 */}
        <div className="border border-[#1e3870] bg-[#0c183a] p-5 rounded-2xl shadow-xl space-y-2.5">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
            <span className="border border-[#284f9b] bg-[#122452] px-2 py-0.5 rounded text-[#38bdf8]">
              01
            </span>
            <span>The Fatal Flaw of Stateless LLMs in Cinema Pre-Production</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In cinema, continuity is not an aesthetic preference — it is an existential economic constraint. A standard soundstage shoot costs between <strong className="text-white">$5,000 and $20,000 per hour</strong>. When an AI pipeline operates purely through stateless prompts or chat windows, subtle hallucinations silently mutate details between shots:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
            <li>A lead character&apos;s cybernetic ocular graft drifts from the left brow in Shot 1 to the right eye in Shot 3.</li>
            <li>An anamorphic lens specification flips from 40mm T2.0 to a spherical 85mm look mid-sequence without attribution.</li>
            <li>A costume patch changes coloration because the generative model paraphrased the concept art instead of copying an invariant.</li>
          </ul>
          <p className="text-xs text-slate-300 leading-relaxed">
            When these plates reach editorial or visual effects post-production, they are unusable. The result is a full day of wasted reshoots. Gate &amp; Ledger solves this by establishing immutable asset passports before production begins.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="border border-[#1e3870] bg-[#0c183a] p-5 rounded-2xl shadow-xl space-y-2.5">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
            <span className="border border-[#284f9b] bg-[#122452] px-2 py-0.5 rounded text-[#38bdf8]">
              02
            </span>
            <span>Why ClickHouse Columnar Storage Powers Deterministic Gates</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Traditional relational databases or document stores are optimized for transactional CRUD. ClickHouse provides instantaneous analytical aggregate queries over millions of historical shot parameters, camera metadata, and asset versions:
          </p>
          <div className="p-3 bg-[#070e24] border border-[#1b3469] rounded-xl font-mono text-xs space-y-1.5 text-slate-300">
            <div className="text-slate-500">-- Gate A: Unassigned decisions must equal zero</div>
            <div>SELECT count() FROM shot_cards WHERE scene_id = &apos;scene_001&apos; AND decision IS NULL;</div>
            <div className="text-slate-500 pt-1">-- Gate B: &quot;No row, no render&quot; invariant</div>
            <div>SELECT count() FROM registry_rows WHERE scene_id = &apos;scene_001&apos; AND lock_state != &apos;locked&apos;;</div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            These queries execute in single-digit milliseconds, enabling real-time gating at every transition step.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="border border-[#1e3870] bg-[#0c183a] p-5 rounded-2xl shadow-xl space-y-2.5">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
            <span className="border border-[#284f9b] bg-[#122452] px-2 py-0.5 rounded text-[#38bdf8]">
              03
            </span>
            <span>Human-Only Finishing: Why Stages 9–11 Do Not Automate</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generative AI excels at raw draft synthesis, but color grading (ACEScc), dynamic acoustic mastering (-23 LUFS), and DCP festival delivery require calibrated physical monitoring and intentional human craft. Automating these final three stages results in generic, uncurated outputs that fail theatrical delivery specifications.
          </p>
        </div>
      </div>
    </div>
  );
};
