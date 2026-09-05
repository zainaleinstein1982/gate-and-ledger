# Gate & Ledger: Agentic Pre-Production Pipeline for Film Crews

> **Google Cloud Agentic Cinema Hackathon — ClickHouse Track**  
> Built with **Gemini 3.8 Flash** via `@google/genai` and **ClickHouse MCP** as the single source of truth.

---

## 🎬 Project Overview

**Gate & Ledger** is an agentic pre-production pipeline for physical and virtual film crews. It replaces chaotic prompt-slinging with a disciplined, 11-stage, 3-phase production cadence guarded by strict, mathematically verifiable database gates.

The pipeline runs on **Gemini 3.8 Flash** via the official Google GenAI SDK and is structured according to the **Google Cloud Agent Builder** pattern: a central orchestrating agent dispatching to 7 specialist sub-agent tools mapped to fixed pipeline stages.

**ClickHouse** serves as the project's single source of truth and persistent pipeline memory. In a domain where on-set crews burn $5,000–$20,000 per hour, an unapproved camera angle or subtle asset drift causes catastrophic reshoots. Gate & Ledger turns gates into literal ClickHouse SQL aggregate queries that block advancement until every invariant is fulfilled.

---

## 🔒 The Four Invariants (Non-Negotiable Pipeline Rules)

1. **Lock Assets Before Anything Generates**  
   Generation is never allowed to run against an unlocked asset sheet. Gate B physically blocks render dispatch until every row for the scene in ClickHouse reads `'locked'`.
2. **One Asset, One Passport**  
   Each asset (character, prop, location, or lens package) gets exactly one canonical spec row. Nothing downstream re-describes it; everything downstream references it strictly by ID.
3. **Copied Verbatim**  
   Once an asset passport is locked, downstream stages must copy its fields into generation prompts verbatim — never paraphrased, re-interpreted, or summarized by an LLM.
4. **Edits Change One Line**  
   Revisions are atomic diffs against a single registry row, never regenerated documents. Every edit is versioned and logged in ClickHouse `audit_log` with who/what/when attribution.

---

## 🏛️ The 11 Stages & 3 Phases

### Phase 1: Pre-Production (Stages 1–5, Reverse Lock)
- **Stage 1: Script & Shot Breakdown** (`/film-breakdown`) — Script/logline → shot cards with sluglines, camera angles, and action beats.
- **Stage 2: Reference Boards** (`/reference-board`) — Shot cards → lighting cues, contrast ratios, and lens specs.
- **Stage 3: Visual Bible Lock** — Master cinematographic look frozen.
- **Stage 4: Asset Sheets & Passports** (`/asset-passport`) — The **ONLY** place an asset's canonical description is written and locked.
- **Stage 5: Scene Library** — Verified and packaged for production.

### 🛑 GATE A: Decision Gate (Checkpoint between 5 and 6)
**ClickHouse Invariant:**
```sql
SELECT count() AS unassigned_count 
FROM shot_cards 
WHERE scene_id = ? 
  AND (decision IS NULL OR decision = '' OR decision = 'pending');
```
*Condition:* Must equal `0`. Nothing advances until every shot board carries a written, attributable decision (`approved`, `revised`, or `rejected`). No silent defaults.

### Phase 2: Production (Stages 6–8)
- **Stage 6: Prompt Compilation & Generation** (`/shot-prompt`) — The **ONLY** skill authorized to generate plates. Pulls locked library + passport rows verbatim.
- **Stage 7: Cleanup & Inpainting** — Plate artifact mitigation.
- **Stage 8: Director Review & Cut Assembly** — Assembly review against the locked bible.

### 🛑 GATE B: Registry Gate (Checkpoint between 8 and 9)
**ClickHouse Invariant:**
```sql
SELECT count() AS unlocked_count 
FROM registry_rows 
WHERE scene_id = ? 
  AND lock_state != 'locked';
```
*Condition:* Must equal `0`. *"No row, no render."* A scene cannot enter finishing until every row in ClickHouse reads `'locked'`.

### Phase 3: Finishing (Stages 9–11, Human Craft Only)
- **Stage 9: Color Grading** — Human Colorist in DaVinci Resolve / ACEScc.
- **Stage 10: Sound Design & Mix** — Human Sound Supervisor in Dolby Atmos 7.1.4.
- **Stage 11: Archival Master** — Human Post Producer final packaging & DCI compliance.

> **Crucial Invariant:** No AI skill touches Stages 9–11. That work stays human, on purpose — the agent's job is to hold the pipeline, not finish the film.

---

## 🛠️ The 7 Installable Skills (Google Cloud Agent Builder Graph)

1. `/setup` — One-time setup: writes project tree and initializes the 8 ClickHouse MergeTree tables.
2. `/studio-init` — One-time inception: registers project, phases, and 11-stage cadence in ClickHouse.
3. `/film-breakdown` — Stage 1 tool: generates shot cards with pending decisions.
4. `/reference-board` — Stage 2 tool: synthesizes visual references, contrast ratios, and mood descriptors.
5. `/asset-passport` — Stage 4 tool: writes the immutable asset passport spec into ClickHouse.
6. `/stress-test` — Pre-Gate-A tool: executes the aggregate check to ensure zero unassigned cards.
7. `/shot-prompt` — Stage 6 tool: compiles verbatim generation prompts from ClickHouse passports.

---

## 💡 Learnings: Registry-as-Memory for Cinema AI Pipelines

### 1. Why Stateless LLMs Alone Fail Production Rigor
In cinema, continuity errors represent direct financial loss. In a chat-based or stateless pipeline, an LLM rewriting a prompt will casually change character wardrobe, flip an eye patch from left to right, or alter lens flares from anamorphic to spherical. By decoupling generation from memory, ClickHouse acts as the rigid external spinal cord: the model is never allowed to describe an asset from memory; it must read verbatim from the ClickHouse passport row.

### 2. Why ClickHouse Columnar Speed Makes Real-Time Gates Viable
Evaluating gate conditions before every stage transition requires zero-latency aggregations. ClickHouse evaluates multi-condition group-bys and counting filters across millions of asset states in single-digit milliseconds. This allows real-time synchronous gate verification during drag-and-drop or batch stage advancement.

### 3. The Human-AI Boundary
AI excels at combinatorial exploration, script breakdowns, and initial plate rendering. Finishing—nuanced color timing, spatial Atmos dynamics, emotional cut rhythm—requires human accountability and aesthetic taste. Keeping Stages 9–11 manual ensures the technology serves the creative team rather than displacing them.

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server (Node/Express backend + Vite)
npm run dev

# Build for production
npm run build
```
Port: `3000` (Reverse proxy ingress).
