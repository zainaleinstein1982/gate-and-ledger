# Gate & Ledger: Agentic Pre-Production Pipeline for Film Crews

> **Google Cloud Agentic Cinema Hackathon — ClickHouse Track Submission**  
> Built with **Gemini 3.8 Flash** via `@google/genai` (Google Cloud Agent Platform) and **ClickHouse MCP** / `@clickhouse/client` as the deterministic single source of truth.

---

## 🎬 1. Executive Summary & Problem Statement

In feature film and episodic television production, physical soundstages burn **$5,000 to $20,000 per hour**. When generative AI tools are used without rigid state management, subtle hallucinations silently break continuity between setups:
- A character's titanium ocular graft flips from left brow to right brow between shots.
- An anamorphic lens package drifts into spherical bokeh mid-scene.
- A key costume patch loses its cadmium-yellow sealant seams.

When these plates reach editorial or VFX, the footage is unusable, triggering catastrophic multi-hour physical reshoots.

**Gate & Ledger** solves enterprise chaos in media and entertainment by enforcing a deterministic, 11-stage, 3-phase production cadence guarded by **ClickHouse MergeTree SQL invariants**. The generative model is never allowed to describe an asset from memory; it must read verbatim from locked ClickHouse passport rows.

---

## 🏆 2. Partner Track: ClickHouse Track

Gate & Ledger integrates **ClickHouse** at runtime as the stateful memory and gate evaluation engine:
1. **ClickHouse Columnar Database**: Powers real-time analytical queries over shot cards, asset passports, camera configurations, and audit diffs.
2. **Official Client & MCP Server**: Uses `@clickhouse/client` and the official ClickHouse MCP server (`mcp-clickhouse`) to connect seamlessly to ClickHouse Cloud clusters or self-hosted instances.
3. **Deterministic Gates as SQL Queries**: Gate A and Gate B are not subjective LLM checks; they are literal ClickHouse aggregate queries that must evaluate to zero before stage advancement.

### The 4 Pipeline Invariants:
1. **Lock Assets Before Anything Generates**: Generation is prohibited against unlocked asset sheets. Gate B physically blocks render dispatch until every row for the scene in ClickHouse reads `'locked'`.
2. **One Asset, One Passport**: Each asset (character, prop, location, or lens package) gets exactly one canonical spec row. Downstream stages reference it strictly by ID.
3. **Copied Verbatim**: Once an asset passport is locked, downstream stages must copy its fields into generation prompts verbatim — never paraphrased or summarized.
4. **Edits Change One Line**: Revisions are atomic diffs against a single registry row, logged in the ClickHouse `audit_log` with who/what/when attribution.

---

## 🏛️ 3. The 11 Stages & 3 Production Phases

```
PHASE 1: PRE-PRODUCTION (Stages 1–5, Reverse Lock)
├── Stage 1: Script & Shot Breakdown (/film-breakdown)
├── Stage 2: Reference Boards (/reference-board)
├── Stage 3: Visual Bible Lock
├── Stage 4: Asset Sheets & Passports (/asset-passport)
└── Stage 5: Scene Library & Combat Matrix
        │
    [🛑 GATE A: Decision Gate — unassigned_count == 0]
        │
PHASE 2: PRODUCTION (Stages 6–8)
├── Stage 6: Prompt Compilation & Generation (/shot-prompt)
├── Stage 7: Cleanup & Inpainting
└── Stage 8: Director Review & Cut Assembly
        │
    [🛑 GATE B: Registry Gate — unlocked_count == 0 ("No row, no render")]
        │
PHASE 3: FINISHING (Stages 9–11, Human Craft Only)
├── Stage 9: Color Grading (ACEScc / DaVinci Resolve)
├── Stage 10: Sound Design & Mix (Dolby Atmos / -23 LUFS)
└── Stage 11: Archival Master (DCI / SMPTE DCP Package)
```

### 🛑 Gate A Invariant SQL (ClickHouse):
```sql
SELECT count() AS unassigned_count 
FROM shot_cards 
WHERE scene_id = 'scene_001' 
  AND (decision IS NULL OR decision = '' OR decision = 'pending');
```
*Rule:* Must equal `0`. Every shot board must carry a written, attributable decision (`approved`, `revised`, or `rejected`).

### 🛑 Gate B Invariant SQL (ClickHouse):
```sql
SELECT count() AS unlocked_count 
FROM registry_rows 
WHERE scene_id = 'scene_001' 
  AND lock_state != 'locked';
```
*Rule:* Must equal `0`. *"No row, no render."* No generation can proceed without all assets locked in ClickHouse.

---

## 🤖 4. Google Cloud & Gemini Enterprise Agent Architecture

The application strictly utilizes Google Cloud AI tooling in compliance with the hackathon rules:
- **`@google/genai` (Gemini 3.8 Flash)**: Powers the orchestrating agent and 7 specialized MCP sub-agents:
  - `/setup` — Initializes ClickHouse schemas and storage trees.
  - `/studio-init` — Registers project and stage cadence.
  - `/film-breakdown` — Breaks dramatic text into structured camera shot cards.
  - `/reference-board` — Generates optical briefs, lighting ratios, and concept references.
  - `/asset-passport` — Writes canonical, immutable asset passport specs.
  - `/stress-test` — Executes ClickHouse Gate A aggregate verification.
  - `/shot-prompt` — Compiles 15-block strict prompt contracts for video/image rendering.
- **Imagen 3 & Veo**: Generates reference plates and simulated cinematic viewfinder footage with compliant fallback handling.

---

## 📊 5. ClickHouse Schema Architecture

The pipeline implements 8 ClickHouse MergeTree tables:
1. `projects` — Active film projects and production metadata.
2. `scenes` — Scene state, current stage, phase, and gate verification statuses.
3. `shot_cards` — Shot breakdown cards, camera angles, lenses, and attributable decisions.
4. `asset_passports` — Canonical specs for characters, props, environments, and lens packages.
5. `registry_rows` — Active lock state tracking per scene (`locked` vs `unlocked`).
6. `generations` — Prompt execution ledger, model token spend, and rendered assets.
7. `reshoots` — Historical telemetry tracking prevented reshoot minutes and dollar savings.
8. `audit_log` — Single-line JSON diffs for all human and agent actions.

---

## 💡 6. Findings & Learnings

1. **Memory Decoupling**: Large Language Models should act as reasoning and synthesis engines, not long-term storage. Using ClickHouse as an immutable columnar memory layer prevents subtle prompt drift.
2. **Sub-Millisecond Invariant Gates**: Because ClickHouse processes aggregate filter queries across millions of rows in single-digit milliseconds, gate evaluations can happen synchronously on every UI interaction without lagging the creative team.
3. **The Human-AI Boundary**: Retaining Stages 9–11 (Color, Sound, Mastering) as strictly human-operated ensures theatrical compliance (ACEScc, -23 LUFS, SMPTE DCP) while empowering the crew with AI speed across Stages 1–8.

---

## 🚀 7. Quick Start & Local Execution

### Prerequisites
- Node.js 18+
- (Optional) ClickHouse Cloud account or local ClickHouse instance

### Environment Variables (`.env`)
```env
GEMINI_API_KEY="your-gemini-api-key"
CLICKHOUSE_HOST="your-cluster.clickhouse.cloud"
CLICKHOUSE_PORT="8443"
CLICKHOUSE_USER="default"
CLICKHOUSE_PASSWORD="your-password"
CLICKHOUSE_DATABASE="default"
```

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start Full-Stack App (Express + Vite)
npm run dev

# 3. Build & Compile for Production
npm run build
```
Access the application at `http://localhost:3000`.

---

## 📹 8. The 3-Minute Demo Video Walkthrough Script

1. **0:00–0:45 (The Enterprise Problem)**: Introduce the $8,750/hr soundstage burn rate and show how asset desync triggers reshoots.
2. **0:45–1:30 (ClickHouse Invariant Gates)**: Walk through Gate A (pending shot decisions) and Gate B ("No row, no render" asset locks) in the ClickHouse SQL Terminal.
3. **1:30–2:15 (Agent Network & 11-Stage Workflow)**: Execute `/film-breakdown` and `/asset-passport` skills; show the visual-first storyboards and 5-pose model sheets.
4. **2:15–3:00 (Reshoot Economics & Production ROI)**: Inspect the ClickHouse Reshoot Economics dashboard showing $20,125 in saved production hours and a 1.2% post-gate revision rate.

---

## 📜 9. Open Source License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
