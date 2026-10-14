/**
 * E-TONGUE: INTELLIGENT DRAVYA IDENTIFICATION SYSTEM
 * FULL MERN STACK BACKEND
 * 
 * Express + MongoDB (Mongoose) + MCP HTTP Bridge + IoT Ingestion + Random Forest ML
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────┐
 * │  IoT Hardware (ESP32-S3)  →  POST /api/iot/telemetry  │
 * │  React Frontend           ←  REST APIs + SSE          │
 * │  MCP Clients (Claude)     ←  POST /api/mcp/tool       │
 * │  MongoDB                  ←  Mongoose ODM             │
 * └─────────────────────────────────────────────────┘
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REFERENCE_SPECIES } from './data/herbalDatabase.js';
import { classifySample, SENSOR_INFO } from './services/randomForest.js';
import { iotManager } from './services/iotSimulator.js';
import { storage } from './services/storage.js';
import { aiAgent } from './services/agentService.js';
import { agentRouter } from './src/agent/router.js';
import { startNightlyCronJob } from './src/jobs/nightlyRollup.js';
import {
  validateAllowedEmail,
  generateOTP,
  verifyOTP,
  isEmailVerified,
  consumeEmailVerification,
  signJWT,
  verifyJWT,
} from './services/authService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount Autonomous Agentic SSE Router (/api/v1/agent/chat, /api/v1/agent/chat-sync)
app.use('/api/v1/agent', agentRouter);

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (!req.path.includes('/sensors/live') && !req.path.includes('/sensors/stream')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - start}ms)`);
    }
  });
  next();
});

// =========================================================================
// 1. SYSTEM & HARDWARE STATUS
// =========================================================================

app.get('/api/status', (req, res) => {
  const sysStatus = iotManager.getStatus();
  const dbStatus = storage.getDBStatus();
  res.json({ ...sysStatus, database: dbStatus });
});

app.get('/api/db/status', (req, res) => {
  res.json(storage.getDBStatus());
});

// =========================================================================
// 2. LIVE SENSOR TELEMETRY & OSCILLOSCOPE FEED
// =========================================================================

app.get('/api/sensors/live', (req, res) => {
  res.json(iotManager.getLiveReadings());
});

app.get('/api/sensors/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const timer = setInterval(() => {
    const reading = iotManager.getLiveReadings();
    res.write(`data: ${JSON.stringify(reading)}\n\n`);
  }, 100);

  req.on('close', () => {
    clearInterval(timer);
    res.end();
  });
});

app.post('/api/calibrate/tare', (req, res) => {
  const result = iotManager.tareBaseline();
  res.json(result);
});

// =========================================================================
// 3. IOT HARDWARE INGESTION (FROM PHYSICAL ESP32 / ARDUINO)
// =========================================================================

app.post('/api/iot/telemetry', async (req, res) => {
  const result = iotManager.ingestIoTTelemetry(req.body);

  // 1. Log raw telemetry packet to MongoDB
  await storage.logTelemetry({
    deviceId: req.body.deviceId || 'ESP32-S3',
    sampleName: req.body.sampleName || iotManager.currentSampleName,
    voltages: iotManager.currentVoltages,
    rawADC: req.body.rawADC,
    temperatureC: req.body.tempC || iotManager.temperatureC,
  });

  // 2. Autonomous AI Agent reasoning directly on live incoming voltages!
  const agentAnalysis = await aiAgent.analyzeTelemetry(
    iotManager.currentVoltages, 
    req.body.sampleName || iotManager.currentSampleName
  );

  // 3. Classify and persist assay to MongoDB if voltages indicate active sample
  let classification = null;
  const isZeroTare = iotManager.currentVoltages.every(v => v < 0.05);

  if (!isZeroTare) {
    classification = classifySample(iotManager.currentVoltages, {
      sampleName: req.body.sampleName || agentAnalysis.closestMatch?.name || 'Live IoT Dravya Scan',
      batchNumber: req.body.batchNumber || `IOT-${Date.now().toString().slice(-4)}`,
      category: 'Physical IoT Telemetry Scan',
      operator: 'Dravya Autonomous AI Agent',
    });

    await storage.addHistory({
      id: classification.analysisId,
      sampleName: classification.metadata.sampleName,
      batchNumber: classification.metadata.batchNumber,
      category: 'Physical IoT Potentiostat Scan',
      operator: 'Dravya AI Agent (Live ESP32 Ingestion)',
      verdict: classification.verdict,
      botanicalName: classification.botanicalName,
      confidence: classification.confidence,
      status: classification.status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      sensorPeak: `${Math.max(...iotManager.currentVoltages).toFixed(2)}V`,
      voltages: iotManager.currentVoltages,
      radarScores: classification.radarScores,
    });
  }

  res.json({
    status: 'INGESTED_AND_ANALYZED',
    iotStatus: result,
    voltages: iotManager.currentVoltages,
    agentAnalysis,
    classification,
    packetsCount: iotManager.packetsCount,
  });
});

// Interactive Live Demo Feed Endpoint
app.post('/api/iot/demo-feed', async (req, res) => {
  const { specimenKey } = req.body;

  const DEMO_PRESETS = {
    ashwagandha: {
      name: 'Pure Ashwagandha Root (Withania somnifera)',
      voltages: [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
    },
    haritaki: {
      name: 'Haritaki Decoction (Terminalia chebula)',
      voltages: [0.92, 2.85, 0.42, 2.18, 0.88, 3.22],
    },
    turmeric: {
      name: 'Lakadong Turmeric (Curcuma longa)',
      voltages: [0.48, 0.52, 0.36, 2.45, 3.05, 1.55],
    },
    adulterated_dye: {
      name: 'Turmeric with Metanil Yellow (Synthetic Azo Dye)',
      voltages: [0.45, 0.48, 3.10, 0.82, 0.95, 0.41],
    },
    tare: {
      name: 'Sensor Chamber Cleaned with Deionized Water',
      voltages: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
    },
  };

  const preset = DEMO_PRESETS[specimenKey] || DEMO_PRESETS.ashwagandha;

  // Ingest via the main IoT ingestion pipeline
  iotManager.ingestIoTTelemetry({
    voltages: preset.voltages,
    sampleName: preset.name,
    deviceId: 'ESP32-S3-DEMO-SIM',
    tempC: 25.2,
  });

  const agentAnalysis = await aiAgent.analyzeTelemetry(preset.voltages, preset.name);

  let classification = null;
  if (specimenKey !== 'tare') {
    classification = classifySample(preset.voltages, {
      sampleName: preset.name,
      batchNumber: `LIVE-DEMO-${Date.now().toString().slice(-4)}`,
      category: 'Live Demo Telemetry',
      operator: 'Dravya AI Agent',
    });

    await storage.addHistory({
      id: classification.analysisId,
      sampleName: classification.metadata.sampleName,
      batchNumber: classification.metadata.batchNumber,
      category: 'Live Potentiostat Demo',
      operator: 'Dravya AI Agent (Live ESP32 Ingestion)',
      verdict: classification.verdict,
      botanicalName: classification.botanicalName,
      confidence: classification.confidence,
      status: classification.status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      sensorPeak: `${Math.max(...preset.voltages).toFixed(2)}V`,
      voltages: preset.voltages,
      radarScores: classification.radarScores,
    });
  } else {
    iotManager.ejectSpecimen();
  }

  res.json({
    status: 'DEMO_TELEMETRY_INGESTED',
    specimen: preset.name,
    voltages: iotManager.currentVoltages,
    agentAnalysis,
    classification,
    packetsCount: iotManager.packetsCount,
  });
});

app.get('/api/iot/telemetry/history', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const records = await storage.getTelemetryHistory(limit);
  res.json({ totalRecords: records.length, records });
});

// =========================================================================
// 4. RANDOM FOREST CLASSIFICATION & INFERENCE
// =========================================================================

app.post('/api/classify', async (req, res) => {
  const { voltages, sampleName, batchNumber, category, operator, sampleId } = req.body;

  let targetVoltages = voltages;

  if (!targetVoltages && sampleId) {
    const found = REFERENCE_SPECIES.find((s) => s.id === sampleId);
    if (found) targetVoltages = found.baseVoltages;
  }

  if (!targetVoltages || !Array.isArray(targetVoltages) || targetVoltages.length !== 6) {
    targetVoltages = iotManager.getLiveReadings().voltages;
  }

  const result = classifySample(targetVoltages, {
    sampleName: sampleName || iotManager.currentSampleName,
    batchNumber: batchNumber || `BATCH-LOT-${Date.now().toString().slice(-4)}`,
    category: category || 'Herbal Extraction',
    operator: operator || 'Analyst (COM5)',
  });

  // Save to audit history
  const auditRecord = {
    id: result.analysisId,
    sampleName: result.metadata.sampleName,
    batchNumber: result.metadata.batchNumber,
    category: result.metadata.category,
    operator: result.metadata.operator,
    verdict: result.verdict,
    botanicalName: result.botanicalName,
    confidence: result.confidence,
    status: result.status,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    sensorPeak: `${Math.max(...targetVoltages).toFixed(2)}V (S${targetVoltages.indexOf(Math.max(...targetVoltages)) + 1})`,
    voltages: targetVoltages,
    radarScores: result.radarScores,
    probabilities: result.probabilities,
    featureWeights: result.featureWeights,
  };
  await storage.addHistory(auditRecord);

  res.json(result);
});

// Alias for standard API contract: POST /api/predict -> { dravya, confidence, top3[] }
app.post('/api/predict', async (req, res) => {
  const { voltages, ph, tds, turbidity, temperature } = req.body;
  let targetVoltages = voltages;

  if (!targetVoltages || !Array.isArray(targetVoltages) || targetVoltages.length !== 6) {
    targetVoltages = iotManager.getLiveReadings().voltages;
  }

  const result = classifySample(targetVoltages, req.body);
  const confidenceNorm = result.confidence / 100;
  const isLowConfidence = confidenceNorm < 0.60;
  const finalVerdict = isLowConfidence ? 'inconclusive' : result.verdict;

  res.json({
    dravya: finalVerdict,
    label: finalVerdict,
    confidence: confidenceNorm,
    confidencePercentage: `${result.confidence}%`,
    status: isLowConfidence ? 'INCONCLUSIVE' : result.status,
    botanicalName: result.botanicalName,
    top3: result.probabilities?.slice(0, 3).map((p) => ({
      label: p.label,
      score: p.percentage / 100,
    })) || [],
    featureImportance: result.featureWeights?.map((f) => ({
      feature: f.sensor,
      weight: f.weight,
    })) || [],
    radarScores: result.radarScores,
    modelVersion: 'v3.2-RandomForest-Ensemble',
  });
});

app.post('/api/sample/select', (req, res) => {
  const { sampleId } = req.body;
  const specimen = REFERENCE_SPECIES.find((s) => s.id === sampleId);

  if (!specimen) {
    return res.status(404).json({ error: 'Specimen not found in reference database' });
  }

  iotManager.loadSpecimen(specimen.name, specimen.baseVoltages);
  const inference = classifySample(specimen.baseVoltages, { sampleName: specimen.name });

  res.json({ status: 'SPECIMEN_LOADED', specimen, voltages: specimen.baseVoltages, inference });
});

app.post('/api/sensors/sample/eject', (req, res) => {
  const result = iotManager.ejectSpecimen();
  res.json(result);
});

// =========================================================================
// 5. AUDIT HISTORY & SAMPLES ARCHIVE
// =========================================================================

app.get('/api/history', async (req, res) => {
  const records = await storage.getHistory();
  res.json({ totalRecords: records.length, records });
});

app.post('/api/history', async (req, res) => {
  const newEntry = await storage.addHistory(req.body);
  res.status(201).json(newEntry);
});

// =========================================================================
// 6. SPECIMEN REGISTRY
// =========================================================================

app.get('/api/specimens', async (req, res) => {
  const specs = await storage.getSpecimens();
  res.json(specs);
});

app.post('/api/specimens', async (req, res) => {
  const { commonName, botanical, partUsed, origin, solvent } = req.body;
  if (!commonName || !botanical) {
    return res.status(400).json({ error: 'commonName and botanical binomial are required' });
  }

  const newSpecimen = {
    lotId: `LOT-${Date.now().toString().slice(-6)}`,
    commonName, botanical,
    partUsed: partUsed || 'Root',
    origin: origin || 'Cultivated',
    harvestDate: new Date().toISOString().split('T')[0],
    solvent: solvent || 'Distilled Water (1:10)',
    status: 'LOGGED_UNTESTED',
  };

  await storage.addSpecimen(newSpecimen);
  res.status(201).json(newSpecimen);
});

app.delete('/api/specimens/:lotId', async (req, res) => {
  const success = await storage.removeSpecimen(req.params.lotId);
  if (success) {
    res.json({ status: 'DELETED', lotId: req.params.lotId });
  } else {
    res.status(404).json({ error: 'Specimen lot not found' });
  }
});

// =========================================================================
// 7. MODEL METRICS & EXPLAINABLE AI
// =========================================================================

app.get('/api/model/metrics', (req, res) => {
  res.json({
    algorithm: 'Random Forest Classifier (Ensemble Bagging)',
    nEstimators: 24, maxDepth: 4, oobAccuracy: 98.4,
    subspaceFeatures: 'm = √6 ≈ 2',
    splitCriterion: 'Gini Impurity (MDI)',
    sensorGiniImportances: SENSOR_INFO.map((s) => ({
      id: s.id, name: s.name, rasa: s.rasa, target: s.target, importance: s.defaultWeight,
    })),
  });
});

// Reference species list
app.get('/api/reference/species', (req, res) => {
  res.json(REFERENCE_SPECIES.map(s => ({
    id: s.id, name: s.name, botanical: s.botanical, category: s.category,
    purityRating: s.purityRating, status: s.status, baseVoltages: s.baseVoltages,
    radarScores: s.radarScores, primaryRasa: s.primaryRasa, doshaKarma: s.doshaKarma,
  })));
});

// =========================================================================
// 8. USER AUTHENTICATION & JWT SECURITY
// =========================================================================

/**
 * POST /api/auth/send-otp
 * Restricts domains: @gmail.com, @yahoo.com, .edu, .ac.in
 * Blocks fake / disposable email services
 */
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const validation = validateAllowedEmail(email);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  try {
    const result = generateOTP(email);
    res.json({
      message: `Verification code sent to ${validation.cleanEmail}`,
      domainType: result.domainType,
      expiresInSeconds: result.expiresInSeconds,
      devOtp: result.devOtp, // Convenient for instant testing & visual UI notification
    });
  } catch (err) {
    res.status(429).json({ error: err.message });
  }
});

/**
 * POST /api/auth/verify-otp
 * Validates 6-digit verification code with TTL and max attempts
 */
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  const result = verifyOTP(email, otp);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({
    message: result.message,
    verified: true,
    email: result.email,
  });
});

/**
 * POST /api/auth/signup
 * Requires valid email domain, OTP verification check, and returns cryptographically signed JWT
 */
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role, institution, otp } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const validation = validateAllowedEmail(email);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  // Verify OTP if provided or check if already verified
  if (otp) {
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.success) {
      return res.status(400).json({ error: `OTP Verification failed: ${otpResult.message}` });
    }
  } else if (!isEmailVerified(email)) {
    return res.status(400).json({ error: 'OTP verification is required before account creation. Please verify your email first.' });
  }

  const existing = await storage.findUserByEmail(validation.cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An analyst account with this email already exists' });
  }

  const user = await storage.createUser({
    name: name.trim(),
    email: validation.cleanEmail,
    password,
    role: role || 'Junior Analytical Chemist',
    institution: institution || (validation.domainType.includes('Institutional') ? 'Academic Research Institute' : 'AYUSH Quality Control Division'),
  });

  consumeEmailVerification(validation.cleanEmail);

  // Generate cryptographically signed JWT Token
  const token = signJWT(user);

  res.status(201).json({
    message: 'Analyst workstation account created successfully',
    user: {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution
    },
    token,
  });
});

/**
 * POST /api/auth/login
 * Validates domain and credentials, returns signed JWT token
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const validation = validateAllowedEmail(email);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  const user = await storage.findUserByEmail(validation.cleanEmail);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid laboratory credentials or password' });
  }

  // Generate cryptographically signed JWT Token
  const token = signJWT(user);

  res.json({
    message: 'Laboratory authentication successful',
    user: {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution || 'Biomimetic Lab'
    },
    token,
  });
});

/**
 * GET /api/auth/me
 * Decodes and validates JWT token from Authorization header
 */
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token);
    if (decoded.valid && decoded.payload) {
      const user = await storage.findUserByEmail(decoded.payload.email);
      if (user) {
        return res.json({
          user: {
            id: user.id || user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution,
          },
          tokenValid: true,
        });
      }
    }
  }

  const defaultUser = await storage.findUserByEmail('tanmay@etongue.lab');
  res.json({ user: defaultUser || { name: 'Tanmay Gupta', role: 'Lead ML Systems Engineer', email: 'tanmay@etongue.lab' } });
});

// =========================================================================
// 9. AI AGENT & MCP COPILOT
// =========================================================================

app.post('/api/agent/analyze', async (req, res) => {
  const { voltages, sampleName } = req.body;
  const targetV = voltages || iotManager.getLiveReadings().voltages;
  const analysis = await aiAgent.analyzeTelemetry(targetV, sampleName);
  res.json(analysis);
});

app.post('/api/agent/chat', async (req, res) => {
  const { prompt, voltages, userId } = req.body;
  const targetV = voltages || iotManager.getLiveReadings().voltages;
  const response = await aiAgent.chatResponse(prompt, targetV);

  // Log to MongoDB
  await storage.logAgentChat({
    userId: userId || 'anonymous',
    prompt: prompt || '',
    reply: response.reply,
    agentAction: response.agentAction,
    voltagesAtTime: targetV,
  });

  res.json(response);
});

app.get('/api/agent/status', (req, res) => {
  res.json({
    agentName: aiAgent.name, version: aiAgent.version, protocol: aiAgent.protocol,
    sensorsMonitored: 6, activeSpecimen: iotManager.currentSampleName, status: 'ONLINE_ACTIVE',
    database: storage.getDBStatus(),
  });
});

app.get('/api/agent/chat/history', async (req, res) => {
  const userId = req.query.userId;
  const limit = parseInt(req.query.limit) || 50;
  const chats = await storage.getAgentChatHistory(userId, limit);
  res.json({ totalChats: chats.length, chats });
});

// =========================================================================
// 10. MCP HTTP BRIDGE (so frontend can call MCP tools via REST)
// =========================================================================

const MCP_TOOLS = {
  read_live_sensors: async () => {
    const reading = iotManager.getLiveReadings();
    return {
      sampleName: reading.sampleName, voltages: reading.voltages,
      channels: SENSOR_INFO.map((s, i) => ({ id: s.id, name: s.name, rasa: s.rasa, target: s.target, voltage: reading.voltages[i] })),
      temperatureC: reading.temperatureC, timestamp: reading.timestamp,
    };
  },
  classify_sample: async (params) => {
    const v = params.voltages || iotManager.getLiveReadings().voltages;
    return classifySample(v, { sampleName: params.sampleName || 'MCP Sample', batchNumber: params.batchNumber || `MCP-${Date.now().toString().slice(-6)}` });
  },
  detect_adulteration: async (params) => {
    const v = params.voltages || iotManager.getLiveReadings().voltages;
    const findings = [];
    if (v[2] > 2.5 && v[4] < 1.0) findings.push({ type: 'METANIL_YELLOW_DYE', severity: 'CRITICAL', detail: `S3=${v[2].toFixed(3)}V surge, S5=${v[4].toFixed(3)}V suppressed` });
    if (v[0] > 1.5 && v[3] < 1.0) findings.push({ type: 'STARCH_FLOUR', severity: 'HIGH', detail: `S1=${v[0].toFixed(3)}V spike, S4=${v[3].toFixed(3)}V blunted` });
    if (v[0] > 3.0 && v[5] < 0.3) findings.push({ type: 'INVERT_SUGAR_SYRUP', severity: 'HIGH', detail: `S1=${v[0].toFixed(3)}V saturated, S6=${v[5].toFixed(3)}V depleted` });
    return { voltages: v, isAdulterated: findings.length > 0, riskLevel: findings.length > 0 ? 'HIGH' : 'LOW', findings };
  },
  load_specimen: async (params) => {
    const specimen = REFERENCE_SPECIES.find(s => s.id === params.sampleId);
    if (!specimen) return { error: `Specimen "${params.sampleId}" not found`, availableIds: REFERENCE_SPECIES.map(s => s.id) };
    iotManager.loadSpecimen(specimen.name, specimen.baseVoltages);
    return { status: 'SPECIMEN_LOADED', name: specimen.name, botanical: specimen.botanical, voltages: specimen.baseVoltages };
  },
  tare_sensors: async () => iotManager.tareBaseline(),
  get_model_metrics: async () => ({
    algorithm: 'Random Forest', nEstimators: 24, maxDepth: 4, oobAccuracy: 98.4,
    sensorImportances: SENSOR_INFO.map(s => ({ id: s.id, name: s.name, weight: s.defaultWeight })),
  }),
  get_pharmacopoeia: async () => REFERENCE_SPECIES.map(s => ({ id: s.id, name: s.name, botanical: s.botanical, status: s.status, baseVoltages: s.baseVoltages, radarScores: s.radarScores })),
};

// List available MCP tools
app.get('/api/mcp/tools', (req, res) => {
  res.json({
    protocol: 'MCP (Model Context Protocol)',
    tools: Object.keys(MCP_TOOLS).map(name => ({ name, endpoint: `POST /api/mcp/tool/${name}` })),
  });
});

// Execute any MCP tool via HTTP
app.post('/api/mcp/tool/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const handler = MCP_TOOLS[toolName];
  if (!handler) {
    return res.status(404).json({ error: `MCP tool "${toolName}" not found`, available: Object.keys(MCP_TOOLS) });
  }
  try {
    const result = await handler(req.body || {});
    res.json({ tool: toolName, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 11. STATIC FILE SERVING (Production Deployment)
// =========================================================================

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// =========================================================================
// 12. SERVER BOOTSTRAP
// =========================================================================

async function boot() {
  // Try MongoDB connection
  const mongoOk = await storage.initMongo();

  const serverInstance = app.listen(PORT, () => {
    console.log(`\n=======================================================`);
    console.log(`  E-TONGUE | Intelligent Dravya Identification System`);
    console.log(`  MERN Backend Online`);
    console.log(`=======================================================`);
    console.log(`  PORT:     http://localhost:${PORT}`);
    console.log(`  DATABASE: ${mongoOk ? 'MongoDB (Mongoose)' : 'JSON File (Offline Mode)'}`);
    console.log(`  IoT:      Hardware Simulation Active`);
    console.log(`  ML:       Random Forest (24 Trees, OOB 98.4%)`);
    console.log(`  MCP:      HTTP Bridge at /api/mcp/tools`);
    console.log(`  Agent:    Dravya-GPT Copilot Online`);
    console.log(`=======================================================\n`);
  });

  // Start Nightly Batch Job (node-cron at 00:00 Asia/Kolkata)
  startNightlyCronJob();
}

if (process.env.NODE_ENV !== 'test') {
  boot();
}

export default app;
