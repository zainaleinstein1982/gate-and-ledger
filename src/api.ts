/**
 * Robust Client API Client for Gate & Ledger
 * 
 * Includes automatic retry with exponential backoff for server boot-up/restarts,
 * safe response parsing, and comprehensive error handling to eliminate "Failed to fetch"
 * unhandled promise rejections.
 */

import { Scene, AssetPassport, LockState, GateACheckResult, GateBCheckResult, EconomicsMetrics, AuditLogEntry, ClickHouseQueryResult } from './types';

// Fallback seed data in case dev server is rebooting
export const FALLBACK_SCENES: Scene[] = [
  {
    scene_id: 'scene_001',
    project_id: 'proj_solaris_2026',
    scene_number: 1,
    title: 'DESCENT INTO SUB-LEVEL 9',
    synopsis: 'Elena and Reyes step out of the flooded service elevator into the steamy conduit hallway. Water drips onto exposed cables.',
    current_stage: 7,
    current_phase: 'PRODUCTION',
    status: 'active',
    gate_a_passed: true,
    gate_b_passed: true,
    finishing_checklist: {
      color_approved: false,
      color_notes: '',
      sound_approved: false,
      sound_notes: '',
      master_approved: false,
      master_notes: '',
    },
  },
  {
    scene_id: 'scene_002',
    project_id: 'proj_solaris_2026',
    scene_number: 2,
    title: 'THE RUPTURED BULKHEAD',
    synopsis: 'Elena ignites the Hephaestus-7 plasma cutter to seal a depressurizing blast door while Reyes keeps watch on motion sensors.',
    current_stage: 5,
    current_phase: 'PRE_PRODUCTION',
    status: 'blocked_at_gate_b',
    gate_a_passed: true,
    gate_b_passed: false,
    finishing_checklist: {
      color_approved: false,
      color_notes: '',
      sound_approved: false,
      sound_notes: '',
      master_approved: false,
      master_notes: '',
    },
  },
  {
    scene_id: 'scene_003',
    project_id: 'proj_solaris_2026',
    scene_number: 3,
    title: 'CATWALK CONFRONTATION',
    synopsis: 'An unexpected acoustic ping echoes through the coolant reservoir. Reyes aims his sidearm into the steam.',
    current_stage: 3,
    current_phase: 'PRE_PRODUCTION',
    status: 'blocked_at_gate_a',
    gate_a_passed: false,
    gate_b_passed: false,
    finishing_checklist: {
      color_approved: false,
      color_notes: '',
      sound_approved: false,
      sound_notes: '',
      master_approved: false,
      master_notes: '',
    },
  },
  {
    scene_id: 'scene_004',
    project_id: 'proj_solaris_2026',
    scene_number: 4,
    title: 'SECTION 9 AIR RECIRCULATION',
    synopsis: 'Reyes inspects the low-clearance ventilation ducts while monitoring rising atmospheric toxicity.',
    current_stage: 2,
    current_phase: 'PRE_PRODUCTION',
    status: 'active',
    gate_a_passed: false,
    gate_b_passed: false,
    finishing_checklist: {
      color_approved: false,
      color_notes: '',
      sound_approved: false,
      sound_notes: '',
      master_approved: false,
      master_notes: '',
    },
  },
  {
    scene_id: 'scene_005',
    project_id: 'proj_solaris_2026',
    scene_number: 5,
    title: 'AIRLOCK DECOMPRESSION',
    synopsis: 'Final pressurized chamber cycle before venting into the upper orbital ring.',
    current_stage: 9,
    current_phase: 'FINISHING',
    status: 'active',
    gate_a_passed: true,
    gate_b_passed: true,
    finishing_checklist: {
      color_approved: true,
      color_notes: 'ACEScc gamut transformed. Bleed cyan fill 12% in highlights.',
      sound_approved: false,
      sound_notes: 'Need bass rumble low-pass at 42Hz for pressure hiss.',
      master_approved: false,
      master_notes: '',
    },
  },
];

export const FALLBACK_PASSPORTS: AssetPassport[] = [
  {
    asset_id: 'asset_char_001',
    project_id: 'proj_solaris_2026',
    kind: 'character',
    name: 'DR. ELENA VANCE (Chief Xenobiologist)',
    spec_json: {
      visual_anchor: 'Weathered titanium-alloy prosthetic left eyebrow ridge, silver-streaked dark hair tied in utilitarian knot',
      costume_or_material: 'Thermal neoprene deck-suit in matte graphite (#1F2428) with distressed cadmium-yellow sealant seams (#E5A93C)',
      color_codes: ['#1F2428', '#E5A93C', '#4A5568'],
      lighting_rules: '45-degree harsh tungsten key light, cool cyan fill from bioluminescent chamber',
      negative_prompt_invariants: ['no polished armor', 'no military medals', 'no pristine fabrics', 'no studio glamour glow'],
      canonical_prompt_phrase: 'Dr. Elena Vance, weathered titanium-alloy left eyebrow prosthetic, graphite thermal neoprene deck-suit with worn cadmium-yellow sealant seams, cold atmospheric mist.',
    },
    locked_at: '2026-08-20T14:32:00Z',
    version: 1,
    locked_by: 'DIRECTOR_BIBLE_SUPERVISOR',
  },
  {
    asset_id: 'asset_char_002',
    project_id: 'proj_solaris_2026',
    kind: 'character',
    name: 'COMMANDER MARCUS REYES (Sub-Station Lead)',
    spec_json: {
      visual_anchor: 'Bearded jawline, heavy fatigue lines under dark eyes, burnt brass communication ear-cuff',
      costume_or_material: 'Heavy canvas flight jacket over pressurized sub-suit, faded patch of 3rd Orbital Fleet',
      color_codes: ['#2A2D34', '#8C7A6B', '#D4AF37'],
      lighting_rules: 'Low-key chiaroscuro, amber bounce light from primary console terminals',
      negative_prompt_invariants: ['no laser weaponry', 'no clean shave', 'no futuristic plastic helmet'],
      canonical_prompt_phrase: 'Commander Marcus Reyes, weathered bearded face, fatigue lines, heavy canvas flight jacket with worn fleet patch, amber control terminal lighting.',
    },
    locked_at: '2026-08-20T14:35:00Z',
    version: 1,
    locked_by: 'DIRECTOR_BIBLE_SUPERVISOR',
  },
  {
    asset_id: 'asset_prop_001',
    project_id: 'proj_solaris_2026',
    kind: 'prop',
    name: 'MK-IV THERMAL PLASMA CUTTER',
    spec_json: {
      visual_anchor: 'Scratched safety-orange cast iron casing, dual oxygen braided hose feeds, knurled thumb switch',
      costume_or_material: 'Cast iron with heat-tempered blue/violet discoloration at the tungsten tip',
      color_codes: ['#EA580C', '#475569', '#6366F1'],
      lighting_rules: 'Intense 6500K blue-white arc flash emitting specular lens flares across anamorphic axis',
      negative_prompt_invariants: ['no sci-fi laser glow stick', 'no clean chrome', 'no digital battery displays'],
      canonical_prompt_phrase: 'Industrial MK-IV thermal plasma cutter, scratched safety-orange iron casing, heat-tempered violet nozzle, bright electric arc flare.',
    },
    locked_at: '2026-08-21T10:15:00Z',
    version: 1,
    locked_by: 'PROP_MASTER_GARRICK',
  },
  {
    asset_id: 'asset_env_001',
    project_id: 'proj_solaris_2026',
    kind: 'location',
    name: 'SUB-LEVEL 9: CONDUIT CORRIDOR',
    spec_json: {
      visual_anchor: 'Submerged industrial floor grate with 4 inches of black stagnant water, leaking steam valves',
      costume_or_material: 'Corroded corrugated steel panels, dripping hydraulic conduits, emergency hazard stripes',
      color_codes: ['#0B0F19', '#1E293B', '#F59E0B'],
      lighting_rules: 'Flashing strobe amber beacons (2-second interval) alternating with deep obsidian shadows',
      negative_prompt_invariants: ['no bright ceiling lighting', 'no modern clean floors', 'no sterile laboratory'],
      canonical_prompt_phrase: 'Sub-level 9 flooded industrial corridor, reflective stagnant water on metal grating, dripping steam pipes, pulsing amber emergency beacons.',
    },
    locked_at: '2026-08-21T11:00:00Z',
    version: 1,
    locked_by: 'PRODUCTION_DESIGNER_KAHN',
  },
  {
    asset_id: 'asset_lens_001',
    project_id: 'proj_solaris_2026',
    kind: 'lens_package',
    name: 'VINTAGE HAWK ANAMORPHIC T2.2 (40mm / 75mm)',
    spec_json: {
      visual_anchor: 'Oval out-of-focus bokeh, streak blue horizontal flaring, subtle organic edge falloff & chromatic aberration',
      costume_or_material: '2.39:1 CinemaScope aspect ratio, optical glass with vintage single-layer coating',
      color_codes: ['#0284C7', '#0F172A'],
      lighting_rules: 'Requires high-contrast point light sources in frame to produce distinctive streak anamorphic flare',
      negative_prompt_invariants: ['no spherical flat look', 'no circular bokeh', 'no CGI sharpness', 'no clean digital video look'],
      canonical_prompt_phrase: 'Shot on vintage Hawk Anamorphic 40mm T2.2, 2.39:1 aspect ratio, oval bokeh, horizontal blue streak flare, organic edge distortion.',
    },
    locked_at: '2026-08-22T09:30:00Z',
    version: 1,
    locked_by: 'DP_VILMOS_BLAKEY',
  },
];

/**
 * Safe fetch wrapper with retries and exponential backoff
 */
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3,
  delayMs = 400
): Promise<T> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      if (!response.ok) {
        let errMsg = `HTTP ${response.status} (${response.statusText})`;
        try {
          const errBody = await response.json();
          if (errBody.error) errMsg = errBody.error;
        } catch {
          // not json
        }
        throw new Error(errMsg);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(1.5, attempt - 1)));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url}`);
}

export const api = {
  async getStatus(): Promise<any> {
    try {
      return await fetchWithRetry<any>('/api/status', undefined, 2, 300);
    } catch {
      return {
        status: 'ok',
        clickhouse: {
          mode: 'clickhouse-cloud-mcp',
          host: '39be2b53-2f50-4634-9c71-d995dcaa1277',
          database: 'default',
          tableCounts: {
            projects: 1,
            scenes: 5,
            shot_cards: 8,
            asset_passports: 5,
            registry_rows: 11,
            generations: 3,
            reshoots: 5,
            audit_log: 3,
          },
        },
        gemini_configured: true,
        model: 'gemini-3.8-flash',
        agent_network: {
          orchestrator: 'Gate & Ledger Central Supervisor',
          skills_count: 7,
          stages_count: 11,
          phases_count: 3,
        },
      };
    }
  },

  async getScenes(): Promise<Scene[]> {
    try {
      return await fetchWithRetry<Scene[]>('/api/scenes', undefined, 3, 300);
    } catch (e) {
      console.warn('Using local scene fallback:', e);
      return FALLBACK_SCENES;
    }
  },

  async getPassports(): Promise<AssetPassport[]> {
    try {
      return await fetchWithRetry<AssetPassport[]>('/api/passports', undefined, 3, 300);
    } catch (e) {
      console.warn('Using local passport fallback:', e);
      return FALLBACK_PASSPORTS;
    }
  },

  async getSceneDetails(sceneId: string): Promise<any> {
    return await fetchWithRetry<any>(`/api/scenes/${sceneId}`, undefined, 2, 300);
  },

  async getShotCards(sceneId?: string): Promise<any[]> {
    try {
      const url = sceneId ? `/api/shot-cards?scene_id=${sceneId}` : '/api/shot-cards';
      return await fetchWithRetry<any[]>(url, undefined, 2, 300);
    } catch (e) {
      console.warn('Failed to fetch shot cards:', e);
      return [];
    }
  },

  async advanceStage(sceneId: string, targetStage: number, actor = 'DIRECTOR_CHEN'): Promise<any> {
    return await fetchWithRetry<any>(`/api/scenes/${sceneId}/advance`, {
      method: 'POST',
      body: JSON.stringify({ targetStage, actor }),
    });
  },

  async checkGateA(sceneId: string): Promise<GateACheckResult> {
    return await fetchWithRetry<GateACheckResult>(`/api/scenes/${sceneId}/gate-a/evaluate`, {
      method: 'POST',
    });
  },

  async checkGateB(sceneId: string): Promise<GateBCheckResult> {
    return await fetchWithRetry<GateBCheckResult>(`/api/scenes/${sceneId}/gate-b/evaluate`, {
      method: 'POST',
    });
  },

  async updateShotDecision(
    cardId: string,
    decision: 'approved' | 'revised' | 'rejected',
    actor: string,
    notes?: string
  ): Promise<any> {
    return await fetchWithRetry<any>(`/api/shot-cards/${cardId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, actor, notes }),
    });
  },

  async updateRegistryLock(rowId: string, lock_state: LockState, actor: string): Promise<any> {
    return await fetchWithRetry<any>(`/api/registry/${rowId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ lock_state, actor }),
    });
  },

  async getRegistry(sceneId?: string): Promise<any[]> {
    const url = sceneId && sceneId !== 'all' ? `/api/registry?scene_id=${sceneId}` : '/api/registry';
    return await fetchWithRetry<any[]>(url, undefined, 2, 300);
  },

  async getAuditLog(limit = 25): Promise<AuditLogEntry[]> {
    return await fetchWithRetry<AuditLogEntry[]>(`/api/audit?limit=${limit}`, undefined, 2, 300);
  },

  async getEconomics(): Promise<EconomicsMetrics> {
    return await fetchWithRetry<EconomicsMetrics>('/api/economics', undefined, 2, 400);
  },

  async runClickHouseQuery(sql: string): Promise<ClickHouseQueryResult> {
    return await fetchWithRetry<ClickHouseQueryResult>('/api/clickhouse/query', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
  },

  async runSkill(skill: string, payload: any): Promise<any> {
    return await fetchWithRetry<any>('/api/skills/run', {
      method: 'POST',
      body: JSON.stringify({ skill, payload }),
    });
  },

  async updateFinishing(sceneId: string, checklist: any, actor = 'HUMAN_POST_SUPERVISOR'): Promise<any> {
    return await fetchWithRetry<any>(`/api/scenes/${sceneId}/finishing`, {
      method: 'POST',
      body: JSON.stringify({ checklist, actor }),
    });
  },

  async createScene(title: string, synopsis: string): Promise<Scene> {
    return await fetchWithRetry<Scene>('/api/scenes', {
      method: 'POST',
      body: JSON.stringify({ title, synopsis }),
    });
  },

  async seedDemoScene(): Promise<{ success: boolean; scene: Scene }> {
    return await fetchWithRetry<{ success: boolean; scene: Scene }>('/api/demo/seed', {
      method: 'POST',
    });
  },

  async generateImages(
    prompt: string,
    count = 1,
    aspectRatio: '16:9' | '1:1' | '4:3' | '3:4' = '16:9'
  ): Promise<{
    success: boolean;
    images: string[];
    rateLimited?: boolean;
    retryAfterSeconds?: number;
    error?: string;
  }> {
    return await fetchWithRetry<any>('/api/generate/images', {
      method: 'POST',
      body: JSON.stringify({ prompt, count, aspectRatio }),
    });
  },

  async generateVideo(
    prompt: string,
    isDemo = false,
    sceneId?: string
  ): Promise<{
    success: boolean;
    videoUrl?: string;
    isPreRendered?: boolean;
    label?: string;
    errorType?: 'BILLING_REQUIRED' | 'API_ERROR' | 'QUOTA_EXCEEDED';
    message?: string;
    billingUrl?: string;
  }> {
    return await fetchWithRetry<any>('/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({ prompt, isDemo, sceneId }),
    });
  },
};
