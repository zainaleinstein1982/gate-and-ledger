/**
 * Express + Vite Server Entrypoint for "Gate & Ledger"
 * 
 * Exposes API routes for ClickHouse MCP pipeline queries,
 * Agent Builder orchestrator & skills, and serves the Vite client.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { clickhouse } from './server/clickhouse';
import {
  runSkillAssetPassport,
  runSkillFilmBreakdown,
  runSkillReferenceBoard,
  runSkillSetup,
  runSkillShotPrompt,
  runSkillStressTest,
  runSkillStudioInit,
} from './server/agentGraph';
import {
  getGenAI,
  generateImagesWithGemini,
  generateVideoWithVeo,
} from './server/gemini';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health and System Status
  app.get('/api/status', (req, res) => {
    const chStatus = clickhouse.getStatus();
    const ai = getGenAI();
    res.json({
      status: 'ok',
      clickhouse: chStatus,
      gemini_configured: Boolean(ai),
      model: 'gemini-3.8-flash',
      agent_network: {
        orchestrator: 'Gate & Ledger Central Supervisor',
        skills_count: 7,
        stages_count: 11,
        phases_count: 3,
      },
    });
  });

  // Scenes
  app.get('/api/scenes', (req, res) => {
    const includeDemo = req.query.include_demo === 'true';
    const scenes = clickhouse.getScenes(includeDemo);
    res.json(scenes);
  });

  // Demo Simulation Seed
  app.post('/api/demo/seed', async (req, res) => {
    try {
      const demoScene = await clickhouse.seedDemoScene();
      res.json({ success: true, scene: demoScene });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scenes/:id', (req, res) => {
    const scene = clickhouse.getScene(req.params.id);
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }
    const shots = clickhouse.getShotCards(req.params.id);
    const registryRows = clickhouse.getRegistryRows(req.params.id);
    const generations = clickhouse.getGenerations(req.params.id);

    res.json({
      ...scene,
      shots,
      registry_rows: registryRows,
      generations,
    });
  });

  app.post('/api/scenes', (req, res) => {
    const { title, synopsis } = req.body;
    const existing = clickhouse.getScenes();
    const newNumber = existing.length + 1;
    const sceneId = `scene_${String(newNumber).padStart(3, '0')}`;

    const newScene = {
      scene_id: sceneId,
      project_id: 'proj_solaris_2026',
      scene_number: newNumber,
      title: title || `SCENE ${newNumber}`,
      synopsis: synopsis || 'New scene awaiting breakdown.',
      current_stage: 1 as const,
      current_phase: 'PRE_PRODUCTION' as const,
      status: 'active' as const,
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
    };

    (clickhouse as any).tables.scenes.push(newScene);
    res.json(newScene);
  });

  // Stage Advancement (enforces Gate invariants!)
  app.post('/api/scenes/:id/advance', (req, res) => {
    const { targetStage, actor = 'DIRECTOR' } = req.body;
    const result = clickhouse.advanceSceneStage(req.params.id, Number(targetStage), actor);
    if (result.error) {
      return res.status(400).json({ error: result.error, scene: result.scene });
    }
    res.json({ success: true, scene: result.scene });
  });

  // Gate A Evaluation
  app.post('/api/scenes/:id/gate-a/evaluate', async (req, res) => {
    try {
      const result = await clickhouse.evaluateGateA(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Gate B Evaluation
  app.post('/api/scenes/:id/gate-b/evaluate', async (req, res) => {
    try {
      const result = await clickhouse.evaluateGateB(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Shot Cards & Written Decisions (Gate A source)
  app.get('/api/shot-cards', (req, res) => {
    const sceneId = req.query.scene_id as string | undefined;
    res.json(clickhouse.getShotCards(sceneId));
  });

  app.post('/api/shot-cards/:id/decision', (req, res) => {
    const { decision, actor = 'DIRECTOR_CHEN', notes } = req.body;
    if (!['approved', 'revised', 'rejected', 'pending'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approved, revised, or rejected' });
    }

    const card = clickhouse.updateShotDecision(req.params.id, decision, actor, notes);
    if (!card) {
      return res.status(404).json({ error: 'Shot card not found' });
    }
    res.json(card);
  });

  // Registry Rows & Lock States (Gate B source)
  app.get('/api/registry', (req, res) => {
    const sceneId = req.query.scene_id as string | undefined;
    res.json(clickhouse.getRegistryRows(sceneId));
  });

  app.post('/api/registry/:id/lock', (req, res) => {
    const { lock_state, actor = 'LEAD_ASSET_STEWARD' } = req.body;
    if (!['locked', 'unlocked', 'pending_revision'].includes(lock_state)) {
      return res.status(400).json({ error: 'Invalid lock state' });
    }

    const row = clickhouse.updateRegistryLockState(req.params.id, lock_state, actor);
    if (!row) {
      return res.status(404).json({ error: 'Registry row not found' });
    }
    res.json(row);
  });

  // Asset Passports
  app.get('/api/passports', (req, res) => {
    res.json(clickhouse.getAssetPassports());
  });

  app.post('/api/passports', async (req, res) => {
    try {
      const result = await runSkillAssetPassport(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Economics Analytical Queries (Backed by ClickHouse SQL)
  app.get('/api/economics', async (req, res) => {
    try {
      const data = await clickhouse.getEconomicsMetrics();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Audit Log
  app.get('/api/audit', (req, res) => {
    const limit = Number(req.query.limit) || 100;
    res.json(clickhouse.getAuditLog(limit));
  });

  // ClickHouse SQL Terminal Query Runner
  app.post('/api/clickhouse/query', async (req, res) => {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'Missing sql query parameter' });
    }

    try {
      const result = await clickhouse.query(sql);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Specialist Agent Skill Execution
  app.post('/api/skills/run', async (req, res) => {
    const { skill, payload } = req.body;
    try {
      let result;
      switch (skill) {
        case '/setup':
          result = await runSkillSetup(payload || {});
          break;
        case '/studio-init':
          result = await runSkillStudioInit(payload);
          break;
        case '/film-breakdown':
          result = await runSkillFilmBreakdown(payload);
          break;
        case '/reference-board':
          result = await runSkillReferenceBoard(payload);
          break;
        case '/asset-passport':
          result = await runSkillAssetPassport(payload);
          break;
        case '/stress-test':
          result = await runSkillStressTest(payload);
          break;
        case '/shot-prompt':
          result = await runSkillShotPrompt(payload);
          break;
        default:
          return res.status(400).json({ error: `Unknown skill command: ${skill}` });
      }
      res.json(result);
    } catch (err: any) {
      console.error('Skill execution failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Finishing Checklist (Stages 9-11 Human-Only)
  app.post('/api/scenes/:id/finishing', (req, res) => {
    const { checklist, actor = 'HUMAN_POST_SUPERVISOR' } = req.body;
    const scene = clickhouse.updateFinishingChecklist(req.params.id, checklist, actor);
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }
    res.json(scene);
  });

  // Real Visual Generation via Gemini (Google GenAI)
  app.post('/api/generate/images', async (req, res) => {
    const { prompt, count = 1, aspectRatio = '16:9' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt for image generation' });
    }
    try {
      const result = await generateImagesWithGemini(prompt, count, aspectRatio);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Image generation failed' });
    }
  });

  // Video Generation via Veo (Google GenAI) with compliant billing / demo fallback
  app.post('/api/generate/video', async (req, res) => {
    const { prompt, isDemo = false, sceneId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt for video generation' });
    }
    try {
      const result = await generateVideoWithVeo(prompt, Boolean(isDemo), sceneId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Video generation failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gate & Ledger server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
