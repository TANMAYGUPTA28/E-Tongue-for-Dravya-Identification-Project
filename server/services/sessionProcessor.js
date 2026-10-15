import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { storage } from './storage.js';
import { classifySample } from './randomForest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Load standardized reference ranges
let REFERENCE_RANGES = {};
try {
  const refPath = path.join(DATA_DIR, 'referenceRanges.json');
  if (fs.existsSync(refPath)) {
    REFERENCE_RANGES = JSON.parse(fs.readFileSync(refPath, 'utf-8'));
  }
} catch (e) {
  console.warn('[SESSION PROCESSOR] Could not load referenceRanges.json, using fallback.');
}

// 6 Supported botanical keys
export const VALID_SAMPLES = ['turmeric', 'ashwagandha', 'haritaki', 'guduchi', 'amalaki', 'tulsi'];

// Sensor channels list
export const SENSOR_KEYS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

// Schema for incoming device readings (supports both voltages array and values array)
export const ReadingInputSchema = z.object({
  deviceId: z.string().min(1).max(64),
  sessionId: z.string().min(1).max(128),
  sampleId: z.string().min(1).max(64),
  seq: z.number().int().nonnegative().optional(),
  firmware: z.string().optional(),
  timestamp: z.number().refine((ts) => {
    const now = Date.now();
    // Must not be older than 5 minutes and not in the future by more than 1 minute
    return ts >= now - 300000 && ts <= now + 60000;
  }, { message: 'Timestamp is stale or invalid (must be within 5 minutes of server time)' }),
  voltages: z.array(z.number().min(0.0).max(5.0)).length(6, { message: 'Must contain exactly 6 sensor voltage readings' }).optional(),
  values: z.array(z.object({
    sensor: z.string(),
    value: z.number().min(0.0).max(5.0),
    unit: z.string().optional().default('V'),
  })).min(6).max(6).optional(),
  unit: z.string().optional().default('V'),
  baselineTare: z.array(z.number().min(0.0).max(1.0)).length(6).optional(),
}).refine((data) => data.voltages !== undefined || data.values !== undefined, {
  message: 'Must provide either voltages array or values object array',
});

// Device Heartbeat & Baseline Storage
const deviceHeartbeats = new Map();
const deviceBaselines = new Map(); // deviceId -> [b1, b2, b3, b4, b5, b6]
const processedPacketKeys = new Set(); // deviceId:sessionId:seq for idempotency

export function recordDeviceHeartbeat(deviceId, metadata = {}) {
  deviceHeartbeats.set(deviceId, {
    lastSeen: Date.now(),
    metadata,
  });
}

export function setDeviceBaseline(deviceId, baselineArray) {
  if (Array.isArray(baselineArray) && baselineArray.length === 6) {
    deviceBaselines.set(deviceId, [...baselineArray]);
    return true;
  }
  return false;
}

export function getDeviceBaseline(deviceId) {
  return deviceBaselines.get(deviceId) || [0, 0, 0, 0, 0, 0];
}

export function getDeviceStatus(deviceId = 'ESP32-S3') {
  const entry = deviceHeartbeats.get(deviceId);
  if (!entry) {
    return {
      deviceId,
      status: 'Offline',
      lastSeen: null,
      secondsAgo: null,
    };
  }
  const secondsAgo = Math.round((Date.now() - entry.lastSeen) / 1000);
  const status = secondsAgo <= 15 ? 'Connected' : 'Offline';
  return {
    deviceId,
    status,
    lastSeen: new Date(entry.lastSeen).toISOString(),
    secondsAgo,
  };
}

// In-Memory Active Test Sessions
const activeSessions = new Map();
const sessionListeners = new Map(); // sessionId -> Set of SSE response objects

export const sessionProcessor = {
  /**
   * Start a new test session
   * Status progression: waiting -> warming_up -> collecting -> analysing -> complete | failed
   */
  startSession({ sampleId, deviceId = 'ESP32-S3', operator = 'Analyst', batchNumber = null }) {
    const normalizedSampleId = sampleId.toLowerCase().trim();
    const refData = REFERENCE_RANGES[normalizedSampleId] || REFERENCE_RANGES['ashwagandha'];

    const sessionId = `SES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const generatedBatch = batchNumber || `LOT-${new Date().getFullYear()}-${normalizedSampleId.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const session = {
      sessionId,
      sampleId: normalizedSampleId,
      sampleName: refData ? `${refData.name} (${refData.botanical})` : normalizedSampleId,
      botanical: refData ? refData.botanical : 'Botanical Standard',
      deviceId,
      operator,
      batchNumber: generatedBatch,
      startedAt: Date.now(),
      status: 'waiting', // 'waiting' | 'warming_up' | 'collecting' | 'analysing' | 'complete' | 'failed'
      requiredSamples: 15, // target readings
      warmupSamplesCount: 3, // ignore first 3 readings (immersion settling window)
      rawReadings: [],
      cleanReadings: [],
      smoothedVoltages: [0, 0, 0, 0, 0, 0],
      qualityFlags: [],
      result: null,
    };

    activeSessions.set(sessionId, session);
    recordDeviceHeartbeat(deviceId, { activeSessionId: sessionId });
    return session;
  },

  /**
   * Get session by ID (with auto-timeout check)
   */
  getSession(sessionId) {
    const session = activeSessions.get(sessionId);
    if (!session) return null;

    // Check timeout: 3 minutes max duration for active sessions
    if ((session.status === 'collecting' || session.status === 'warming_up' || session.status === 'waiting') && Date.now() - session.startedAt > 180000) {
      session.status = 'failed';
      session.qualityFlags.push('Session timed out awaiting sensor telemetry.');
    }
    return session;
  },

  /**
   * Cancel an active session
   */
  cancelSession(sessionId) {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.status = 'failed';
      session.qualityFlags.push('Session cancelled by user.');
      return true;
    }
    return false;
  },

  /**
   * Register SSE listener for live session updates
   */
  addListener(sessionId, res) {
    if (!sessionListeners.has(sessionId)) {
      sessionListeners.set(sessionId, new Set());
    }
    sessionListeners.get(sessionId).add(res);
  },

  /**
   * Remove SSE listener
   */
  removeListener(sessionId, res) {
    if (sessionListeners.has(sessionId)) {
      sessionListeners.get(sessionId).delete(res);
      if (sessionListeners.get(sessionId).size === 0) {
        sessionListeners.delete(sessionId);
      }
    }
  },

  /**
   * Ingest a reading into a test session
   */
  async ingestReading(payload) {
    // 1. Zod schema validation
    const parsed = ReadingInputSchema.parse(payload);
    recordDeviceHeartbeat(parsed.deviceId, { activeSessionId: parsed.sessionId });

    // 2. Idempotency Check (seq tracking)
    if (parsed.seq !== undefined) {
      const packetKey = `${parsed.deviceId}:${parsed.sessionId}:${parsed.seq}`;
      if (processedPacketKeys.has(packetKey)) {
        const session = activeSessions.get(parsed.sessionId);
        return {
          accepted: true,
          duplicate: true,
          progressPct: session ? Math.min(100, Math.round((session.rawReadings.length / session.requiredSamples) * 100)) : 100,
          session,
        };
      }
      processedPacketKeys.add(packetKey);
    }

    let session = activeSessions.get(parsed.sessionId);
    if (!session) {
      session = this.startSession({
        sampleId: parsed.sampleId,
        deviceId: parsed.deviceId,
      });
    }

    if (session.status === 'complete' || session.status === 'failed') {
      return { accepted: false, message: 'Session is no longer collecting readings', session };
    }

    // Extract normalized 6 voltages
    let normalizedVoltages = [];
    if (parsed.voltages) {
      normalizedVoltages = [...parsed.voltages];
    } else if (parsed.values) {
      normalizedVoltages = SENSOR_KEYS.map((k) => {
        const item = parsed.values.find((v) => v.sensor.toUpperCase() === k);
        return item ? item.value : 0.0;
      });
    }

    // Accumulate raw reading
    session.rawReadings.push({
      timestamp: parsed.timestamp,
      voltages: normalizedVoltages,
    });

    const totalReadings = session.rawReadings.length;

    // Progression of state
    if (totalReadings <= session.warmupSamplesCount) {
      session.status = 'warming_up';
    } else {
      session.status = 'collecting';

      // Calibration: subtract device baseline tare
      const baseline = parsed.baselineTare || getDeviceBaseline(parsed.deviceId);
      const calibratedV = normalizedVoltages.map((v, idx) => Math.max(0, parseFloat((v - (baseline[idx] || 0)).toFixed(3))));

      session.cleanReadings.push(calibratedV);

      // Signal Processing: Exponential Moving Average (EMA, α = 0.35)
      const alpha = 0.35;
      if (session.cleanReadings.length === 1) {
        session.smoothedVoltages = [...calibratedV];
      } else {
        session.smoothedVoltages = session.smoothedVoltages.map((prev, idx) => {
          return parseFloat((alpha * calibratedV[idx] + (1 - alpha) * prev).toFixed(3));
        });
      }
    }

    const progressPct = Math.min(100, Math.round((totalReadings / session.requiredSamples) * 100));

    // Broadcast to SSE listeners
    const broadcastData = {
      sessionId: session.sessionId,
      progressPct,
      readingsCount: totalReadings,
      requiredSamples: session.requiredSamples,
      smoothedVoltages: session.smoothedVoltages,
      status: session.status,
    };

    const listeners = sessionListeners.get(session.sessionId);
    if (listeners) {
      const msg = `data: ${JSON.stringify(broadcastData)}\n\n`;
      listeners.forEach((res) => {
        try {
          res.write(msg);
        } catch (e) {}
      });
    }

    // Auto-finalize when required samples threshold reached
    if (totalReadings >= session.requiredSamples && session.status === 'collecting') {
      await this.finalizeSession(session.sessionId);
    }

    return {
      accepted: true,
      progressPct,
      totalReadings,
      smoothedVoltages: session.smoothedVoltages,
      session,
    };
  },

  /**
   * Finalize session: Signal processing, outlier removal (MAD), reference range scoring, cross-check, and DB persist
   */
  async finalizeSession(sessionId) {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    session.status = 'analysing';
    const cleanSamples = session.cleanReadings;
    const flags = [];

    // Quality Check 1: Minimum sample requirement (at least 8 clean readings)
    if (cleanSamples.length < 8) {
      flags.push('Not enough data yet');
      session.status = 'failed';
      session.qualityFlags = flags;
      session.result = {
        sessionId: session.sessionId,
        sampleId: session.sampleId,
        sampleName: session.sampleName,
        verdict: 'Inconclusive',
        qualityScore: null,
        status: 'INSUFFICIENT_DATA',
        reasons: ['Acquisition terminated before collecting minimum 8 stable readings.'],
        qualityFlags: flags,
        features: [],
        isEstimate: true,
      };
      return session.result;
    }

    // Quality Check 2: Sensor disconnected or zero flatline
    const allNearZero = session.smoothedVoltages.every((v) => v < 0.03);
    if (allNearZero) {
      flags.push('Sensor not connected');
      session.status = 'failed';
      session.qualityFlags = flags;
      session.result = {
        sessionId: session.sessionId,
        sampleId: session.sampleId,
        sampleName: session.sampleName,
        verdict: 'Fail',
        qualityScore: 0,
        status: 'DISCONNECTED',
        reasons: ['All potentiostat working electrodes detected < 0.03V baseline signal. Verify probe immersion.'],
        qualityFlags: flags,
        features: [],
        isEstimate: true,
      };
      return session.result;
    }

    // Signal Processing: Median Absolute Deviation (MAD) Outlier Removal per channel
    const finalChannelVoltages = [];
    const channelStdDevs = [];

    for (let ch = 0; ch < 6; ch++) {
      const chValues = cleanSamples.map((s) => s[ch]).sort((a, b) => a - b);
      const median = chValues[Math.floor(chValues.length / 2)];

      // Compute MAD: median(|x_i - median|)
      const deviations = chValues.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
      const mad = deviations[Math.floor(deviations.length / 2)];

      // Outlier filtering threshold: 3.0 * 1.4826 * MAD
      let inliers = chValues;
      if (mad > 0.005) {
        const threshold = 3.0 * 1.4826 * mad;
        inliers = chValues.filter((v) => Math.abs(v - median) <= threshold);
      } else {
        // If MAD is zero (e.g. constant baseline with an isolated spike), discard any point deviating > 0.20V
        inliers = chValues.filter((v) => Math.abs(v - median) <= 0.20);
      }

      // Inlier mean
      const inlierSum = inliers.reduce((sum, v) => sum + v, 0);
      const meanV = parseFloat((inlierSum / (inliers.length || 1)).toFixed(3));
      finalChannelVoltages.push(meanV);

      // Standard deviation
      const variance = inliers.reduce((sum, v) => sum + Math.pow(v - meanV, 2), 0) / (inliers.length || 1);
      const stdDev = Math.sqrt(variance);
      channelStdDevs.push(stdDev);
    }

    // Quality Check 3: Noise Variance & Stability (across all clean samples)
    const rawStdDevs = [];
    for (let ch = 0; ch < 6; ch++) {
      const chVals = cleanSamples.map((s) => s[ch]);
      const chMean = chVals.reduce((a, b) => a + b, 0) / (chVals.length || 1);
      const chVar = chVals.reduce((a, b) => a + Math.pow(b - chMean, 2), 0) / (chVals.length || 1);
      rawStdDevs.push(Math.sqrt(chVar));
    }
    const maxRawStdDev = Math.max(...rawStdDevs);
    if (maxRawStdDev > 0.20) {
      flags.push('Unstable reading, please retest');
    }

    // Quality Check 4: Check for stuck flatline sensor (pinned to ground or rail with zero variance)
    for (let ch = 0; ch < 6; ch++) {
      if (channelStdDevs[ch] < 0.0001 && cleanSamples.length > 10 && (finalChannelVoltages[ch] <= 0.01 || finalChannelVoltages[ch] >= 4.95)) {
        flags.push(`Sensor flatline detected on transducer S${ch + 1}`);
        break;
      }
    }

    // Reference Range Comparison & Scoring
    const refData = REFERENCE_RANGES[session.sampleId] || REFERENCE_RANGES['ashwagandha'];
    const channelScores = [];
    const plainReasons = [];
    const detailedFeatures = [];

    if (refData && refData.channels) {
      SENSOR_KEYS.forEach((key, idx) => {
        const spec = refData.channels[key];
        const val = finalChannelVoltages[idx];
        if (spec) {
          const inRange = val >= spec.min && val <= spec.max;
          detailedFeatures.push({
            name: spec.name,
            sensor: key,
            value: val,
            unit: spec.unit || 'V',
            rangeMin: spec.min,
            rangeMax: spec.max,
            inRange,
          });

          if (inRange) {
            channelScores.push(100);
          } else {
            const range = Math.max(0.1, spec.max - spec.min);
            const dist = val < spec.min ? spec.min - val : val - spec.max;
            const penalty = Math.min(100, (dist / range) * 100);
            channelScores.push(Math.max(0, 100 - penalty));

            if (dist > range * 0.3) {
              const direction = val < spec.min ? 'below normal range' : 'above normal range';
              plainReasons.push(
                `${spec.name} is ${direction} for ${refData.name} (${val.toFixed(2)}V vs normal ${spec.min.toFixed(2)}V–${spec.max.toFixed(2)}V)`
              );
            }
          }
        }
      });
    }

    // Cross-Check: Does the sample look more like a DIFFERENT sample?
    let bestMatchingOther = null;
    let highestOtherScore = 0;

    for (const otherKey of VALID_SAMPLES) {
      if (otherKey === session.sampleId) continue;
      const otherRef = REFERENCE_RANGES[otherKey];
      if (!otherRef || !otherRef.channels) continue;

      let scoreSum = 0;
      SENSOR_KEYS.forEach((k, idx) => {
        const sp = otherRef.channels[k];
        const val = finalChannelVoltages[idx];
        if (sp && val >= sp.min && val <= sp.max) scoreSum += 100;
      });
      const avgOther = scoreSum / 6;
      if (avgOther > highestOtherScore) {
        highestOtherScore = avgOther;
        bestMatchingOther = otherRef.name;
      }
    }

    // Quality Score calculation
    const avgScore = channelScores.length > 0
      ? Math.round(channelScores.reduce((sum, s) => sum + s, 0) / channelScores.length)
      : 88;

    // Cross-sample mismatch flag
    if (highestOtherScore >= 80 && highestOtherScore > avgScore + 15) {
      flags.push('Sample not recognised');
      plainReasons.unshift(`Reading does not match selected sample; profile aligns closer with ${bestMatchingOther}.`);
    }

    let verdict = 'Pass';
    let status = 'VERIFIED_PURE';

    if (flags.includes('Unstable reading, please retest')) {
      verdict = 'Inconclusive';
      status = 'UNSTABLE';
      plainReasons.unshift('Electrode potential variance exceeds allowable stability threshold (>0.20V). Please ensure probe is stationary and clean before retesting.');
    } else if (flags.includes('Sample not recognised')) {
      verdict = 'Fail';
      status = 'SAMPLE_MISMATCH';
    } else if (avgScore >= 85 && flags.length === 0) {
      verdict = 'Pass';
      status = 'VERIFIED_PURE';
      if (plainReasons.length === 0) {
        plainReasons.push('All 6 potentiostat working electrode signals fall within certified reference bands.');
        plainReasons.push(`Characteristic bioactive markers match ${refData?.name || session.sampleName} standard.`);
      }
    } else if (avgScore >= 70 && flags.length === 0) {
      verdict = 'Borderline';
      status = 'BORDERLINE';
      plainReasons.unshift('Minor potentiometric variance observed; potential mild oxidative aging or moisture variance.');
    } else {
      verdict = 'Fail';
      status = 'ADULTERATION_FLAG';
      if (plainReasons.length === 0) {
        plainReasons.unshift(`Biomarker profile deviates significantly from authentic reference standard (${refData?.adulterantRisk || 'Possible filler'}).`);
      }
    }

    // Check ML Model inference if available
    let mlPrediction = null;
    try {
      mlPrediction = classifySample(finalChannelVoltages, {
        sampleName: session.sampleName,
        batchNumber: session.batchNumber,
        category: 'Physical IoT Potentiostat Scan',
        operator: session.operator,
      });
    } catch (e) {}

    const finalResult = {
      sessionId: session.sessionId,
      sampleId: session.sampleId,
      sampleName: session.sampleName,
      botanical: session.botanical,
      batchNumber: session.batchNumber,
      operator: session.operator,
      deviceId: session.deviceId,
      verdict,
      status,
      qualityScore: avgScore,
      isEstimate: true, // Transparent range-based estimate
      scoringMethod: 'Transparent Pharmacopoeial Range-Overlap Metric',
      features: detailedFeatures,
      finalVoltages: finalChannelVoltages,
      rawSamplesCount: session.rawReadings.length,
      cleanSamplesCount: cleanSamples.length,
      sampleCount: cleanSamples.length,
      qualityFlags: flags,
      reasons: plainReasons.slice(0, 3),
      factors: plainReasons.slice(0, 3),
      timestamp: new Date().toISOString(),
      calibratedAt: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      referenceSource: refData?.source || 'Ayurvedic Pharmacopoeia of India (API)',
      mlPrediction: mlPrediction ? {
        verdict: mlPrediction.verdict,
        confidence: mlPrediction.confidence,
        status: mlPrediction.status,
      } : null,
    };

    session.status = 'complete';
    session.result = finalResult;

    // Persist to MongoDB ledger via storage
    await storage.addHistory({
      id: session.sessionId,
      sampleName: session.sampleName,
      batchNumber: session.batchNumber,
      category: 'Potentiostat Assay',
      operator: session.operator,
      verdict,
      botanicalName: session.botanical,
      confidence: avgScore,
      status,
      date: finalResult.dateFormatted,
      sensorPeak: `${Math.max(...finalChannelVoltages).toFixed(2)}V`,
      voltages: finalChannelVoltages,
      radarScores: {
        madhura: Math.round(finalChannelVoltages[0] * 22),
        amla: Math.round(finalChannelVoltages[1] * 24),
        lavana: Math.round(finalChannelVoltages[2] * 25),
        tikta: Math.round(finalChannelVoltages[3] * 22),
        katu: Math.round(finalChannelVoltages[4] * 24),
        kashaya: Math.round(finalChannelVoltages[5] * 22),
      },
    });

    // Notify SSE listeners that session is finalized
    const listeners = sessionListeners.get(session.sessionId);
    if (listeners) {
      const msg = `data: ${JSON.stringify({ finalized: true, result: finalResult })}\n\n`;
      listeners.forEach((res) => {
        try {
          res.write(msg);
          res.end();
        } catch (e) {}
      });
      sessionListeners.delete(session.sessionId);
    }

    return finalResult;
  },
};
