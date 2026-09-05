export type PipelinePhase = 'PRE_PRODUCTION' | 'PRODUCTION' | 'FINISHING';

export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface StageConfig {
  id: StageId;
  name: string;
  slug: string;
  phase: PipelinePhase;
  phaseOrder: number;
  description: string;
  isAutomated: boolean;
  skillCommand?: string;
  roleDescription: string;
}

export const STAGES: StageConfig[] = [
  // Phase 1: Pre-Production (reversed: fix digital references before anything else)
  {
    id: 1,
    name: 'Breakdown',
    slug: 'breakdown',
    phase: 'PRE_PRODUCTION',
    phaseOrder: 1,
    description: 'The script becomes scenes and shot cards',
    isAutomated: true,
    skillCommand: '/film-breakdown',
    roleDescription: 'Automated script extraction to granular camera setups',
  },
  {
    id: 2,
    name: 'References',
    slug: 'references',
    phase: 'PRE_PRODUCTION',
    phaseOrder: 2,
    description: 'Images collected as specification, per asset and per style',
    isAutomated: true,
    skillCommand: '/reference-board',
    roleDescription: 'Visual research synthesis and specification anchors per asset and style',
  },
  {
    id: 3,
    name: 'Visual Bible Lock',
    slug: 'visual-bible-lock',
    phase: 'PRE_PRODUCTION',
    phaseOrder: 3,
    description: 'Every board gets a written decision (approved/revise/rejected)',
    isAutomated: true,
    skillCommand: '/reference-board',
    roleDescription: 'Attributable written lock decisions on reference boards before Gate A',
  },
  {
    id: 4,
    name: 'Asset Sheets',
    slug: 'asset-sheets',
    phase: 'PRE_PRODUCTION',
    phaseOrder: 4,
    description: 'Characters, locations, and props get passports',
    isAutomated: true,
    skillCommand: '/asset-passport',
    roleDescription: 'Canonical turnaround specs and immutable asset passports',
  },
  {
    id: 5,
    name: 'Library',
    slug: 'library',
    phase: 'PRE_PRODUCTION',
    phaseOrder: 5,
    description: 'Passports stress-tested, then locked into the registry',
    isAutomated: true,
    skillCommand: '/stress-test',
    roleDescription: 'Stress-test verification and flipping registry rows to locked',
  },

  // Phase 2: Production
  {
    id: 6,
    name: 'Generation',
    slug: 'generation',
    phase: 'PRODUCTION',
    phaseOrder: 6,
    description: 'Shots produced from shot cards and locked passports (the fixed 15-block prompt structure)',
    isAutomated: true,
    skillCommand: '/shot-prompt',
    roleDescription: 'Gemini-directed camera execution using locked registry and 15-block structure',
  },
  {
    id: 7,
    name: 'Edit',
    slug: 'edit',
    phase: 'PRODUCTION',
    phaseOrder: 7,
    description: 'Assembly runs in parallel with generation (while scene N generates, editor assembles N-1 and director team shotlists N+1)',
    isAutomated: false,
    roleDescription: 'Editorial team: Continuous parallel assembly cadence with generation',
  },
  {
    id: 8,
    name: 'Cleanup',
    slug: 'cleanup',
    phase: 'PRODUCTION',
    phaseOrder: 8,
    description: 'Artifacts fixed shot by shot',
    isAutomated: false,
    roleDescription: 'Digital cleanup artist: Shot-by-shot artifact fixes and plate correction',
  },

  // Phase 3: Finishing (Human-Only)
  {
    id: 9,
    name: 'Color',
    slug: 'color',
    phase: 'FINISHING',
    phaseOrder: 9,
    description: 'An outsourced colorist unifies then grades',
    isAutomated: false,
    roleDescription: 'Human Colorist: Unifies exposure and grades in ACES / DaVinci Resolve',
  },
  {
    id: 10,
    name: 'Sound',
    slug: 'sound',
    phase: 'FINISHING',
    phaseOrder: 10,
    description: 'An outsourced post team cleans and mixes',
    isAutomated: false,
    roleDescription: 'Human Sound Supervisor: Dialogue sync cleanup, Foley, and -23 LUFS mix',
  },
  {
    id: 11,
    name: 'Master',
    slug: 'master',
    phase: 'FINISHING',
    phaseOrder: 11,
    description: 'Festival and platform deliverables, plus the archive',
    isAutomated: false,
    roleDescription: 'Human Post Supervisor: Festival DCP, ProRes archival, and platform packaging',
  },
];

export type ShotDecision = 'approved' | 'revised' | 'rejected' | 'pending';

export interface ShotCard {
  card_id: string;
  scene_id: string;
  shot_number: number;
  slugline: string;
  camera_angle: string;
  action_desc: string;
  lens_spec?: string;
  lighting_mood?: string;
  decision: ShotDecision;
  decided_by: string | null;
  decided_at: string | null;
  decision_notes?: string;
  asset_ids: string[];
}

export type AssetKind = 'character' | 'prop' | 'location' | 'lens_package';

export interface AssetPassport {
  asset_id: string;
  project_id: string;
  kind: AssetKind;
  name: string;
  spec_json: {
    visual_anchor: string;
    costume_or_material: string;
    color_codes: string[];
    lighting_rules: string;
    negative_prompt_invariants: string[];
    canonical_prompt_phrase: string;
  };
  locked_at: string;
  version: number;
  locked_by: string;
}

export type LockState = 'locked' | 'unlocked' | 'pending_revision';

export interface RegistryRow {
  row_id: string;
  scene_id: string;
  asset_id: string;
  asset_name: string;
  asset_kind: AssetKind;
  lock_state: LockState;
  updated_at: string;
  locked_version: number;
  updated_by: string;
}

export interface Scene {
  scene_id: string;
  project_id: string;
  scene_number: number;
  title: string;
  synopsis: string;
  current_stage: StageId;
  current_phase: PipelinePhase;
  status: 'active' | 'blocked_at_gate_a' | 'blocked_at_gate_b' | 'completed';
  gate_a_passed: boolean;
  gate_b_passed: boolean;
  is_demo?: boolean;
  finishing_checklist: {
    color_approved: boolean;
    color_notes: string;
    sound_approved: boolean;
    sound_notes: string;
    master_approved: boolean;
    master_notes: string;
  };
}

export interface GateACheckResult {
  scene_id: string;
  passed: boolean;
  sql_query: string;
  total_cards: number;
  unassigned_count: number;
  approved_count: number;
  revised_count: number;
  rejected_count: number;
  blockers: string[];
  execution_ms: number;
}

export interface GateBCheckResult {
  scene_id: string;
  passed: boolean;
  sql_query: string;
  total_registry_rows: number;
  unlocked_count: number;
  locked_count: number;
  blockers: string[];
  execution_ms: number;
}

export interface GenerationRecord {
  gen_id: string;
  scene_id: string;
  shot_id: string;
  model: string;
  prompt: string;
  preview_url: string;
  cost_estimate: number; // in USD
  created_at: string;
  status: 'rendered' | 'failed' | 'queued';
  verbatim_passports_used: string[];
}

export interface ReshootRecord {
  reshoot_id: string;
  scene_id: string;
  shot_id?: string;
  reason: string;
  minutes_lost: number;
  created_at: string;
  financial_impact: number;
}

export interface AuditLogEntry {
  event_id: string;
  entity_type: 'scene' | 'shot_card' | 'asset_passport' | 'registry_row' | 'gate';
  entity_id: string;
  actor: string;
  diff_json: string;
  at: string;
}

export interface EconomicsMetrics {
  avgReshootMinutes: number;
  totalReshootMinutes: number;
  fullShootDayMinutes: number; // e.g. 720
  reshootPercentageOfDay: number;
  totalGenerationCost: number;
  reshootSavingsEstimated: number;
  reasonsBreakdown: { reason: string; minutes: number; count: number }[];
  costTrend: { stageGroup: string; avgCostPerShot: number; revisionRatePct: number }[];
}

export interface AgentSkillTrace {
  id: string;
  skillName: string;
  timestamp: string;
  input: any;
  output: any;
  sql_executed?: string;
  gemini_tokens_used?: number;
  execution_ms: number;
  status: 'success' | 'error';
}

export interface ClickHouseQueryResult<T = any> {
  meta?: { name: string; type: string }[];
  data: T[];
  rows: number;
  statistics?: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
  raw_sql?: string;
  error?: string;
}
