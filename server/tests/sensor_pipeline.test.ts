import { describe, it, expect, beforeEach } from 'vitest';
import {
  sessionProcessor,
  recordDeviceHeartbeat,
  getDeviceStatus,
  ReadingInputSchema,
} from '../services/sessionProcessor.js';

describe('Sensor Processing & Ingestion Pipeline', () => {
  const DEVICE_ID = 'TEST-ESP32-UNIT';

  describe('1. Schema Validation (POST /api/readings)', () => {
    it('accepts valid 6-channel potentiostat reading packet', () => {
      const valid = {
        deviceId: DEVICE_ID,
        sessionId: 'SES-TEST-VALID-01',
        sampleId: 'ashwagandha',
        timestamp: Date.now(),
        voltages: [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
        unit: 'V',
      };
      const parsed = ReadingInputSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('rejects packet with NaN or null voltage', () => {
      const invalid = {
        deviceId: DEVICE_ID,
        sessionId: 'SES-TEST-NAN',
        sampleId: 'ashwagandha',
        timestamp: Date.now(),
        voltages: [0.72, NaN, 0.45, 2.78, 1.15, 2.35],
        unit: 'V',
      };
      const parsed = ReadingInputSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it('rejects out-of-range voltage (> 5.0V or < 0.0V)', () => {
      const tooHigh = {
        deviceId: DEVICE_ID,
        sessionId: 'SES-TEST-HIGH',
        sampleId: 'ashwagandha',
        timestamp: Date.now(),
        voltages: [0.72, 5.82, 0.45, 2.78, 1.15, 2.35],
        unit: 'V',
      };
      expect(ReadingInputSchema.safeParse(tooHigh).success).toBe(false);

      const negative = {
        deviceId: DEVICE_ID,
        sessionId: 'SES-TEST-NEG',
        sampleId: 'ashwagandha',
        timestamp: Date.now(),
        voltages: [-0.2, 0.38, 0.45, 2.78, 1.15, 2.35],
        unit: 'V',
      };
      expect(ReadingInputSchema.safeParse(negative).success).toBe(false);
    });

    it('rejects stale timestamp (> 5 minutes in past)', () => {
      const stale = {
        deviceId: DEVICE_ID,
        sessionId: 'SES-TEST-STALE',
        sampleId: 'ashwagandha',
        timestamp: Date.now() - 400000, // 6.6 minutes ago
        voltages: [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
        unit: 'V',
      };
      expect(ReadingInputSchema.safeParse(stale).success).toBe(false);
    });
  });

  describe('2. Signal Processing & Outlier Removal (MAD)', () => {
    it('successfully rejects isolated voltage spike using Median Absolute Deviation', async () => {
      const session = sessionProcessor.startSession({
        sampleId: 'ashwagandha',
        deviceId: DEVICE_ID,
      });

      const baseV = [0.72, 0.38, 0.45, 2.78, 1.15, 2.35];

      // Ingest 3 warm-up readings
      for (let i = 0; i < 3; i++) {
        await sessionProcessor.ingestReading({
          deviceId: DEVICE_ID,
          sessionId: session.sessionId,
          sampleId: 'ashwagandha',
          timestamp: Date.now(),
          voltages: baseV,
        });
      }

      // Ingest 10 normal readings
      for (let i = 0; i < 10; i++) {
        await sessionProcessor.ingestReading({
          deviceId: DEVICE_ID,
          sessionId: session.sessionId,
          sampleId: 'ashwagandha',
          timestamp: Date.now(),
          voltages: baseV,
        });
      }

      // Ingest 1 massive spike on Channel S4 (e.g. 4.90V transient glitch)
      await sessionProcessor.ingestReading({
        deviceId: DEVICE_ID,
        sessionId: session.sessionId,
        sampleId: 'ashwagandha',
        timestamp: Date.now(),
        voltages: [0.72, 0.38, 0.45, 4.90, 1.15, 2.35],
      });

      // Ingest 3 more normal readings
      for (let i = 0; i < 3; i++) {
        await sessionProcessor.ingestReading({
          deviceId: DEVICE_ID,
          sessionId: session.sessionId,
          sampleId: 'ashwagandha',
          timestamp: Date.now(),
          voltages: baseV,
        });
      }

      const result = await sessionProcessor.finalizeSession(session.sessionId);

      // S4 final voltage should remain close to 2.78V, NOT contaminated by the 4.90V spike
      expect(result.finalVoltages[3]).toBeLessThan(2.95);
      expect(result.finalVoltages[3]).toBeGreaterThan(2.65);
    });
  });

  describe('3. Disconnected Sensor & Quality Flags', () => {
    it('flags "Sensor not connected" when all channels flatline to near 0.0V', async () => {
      const session = sessionProcessor.startSession({
        sampleId: 'turmeric',
        deviceId: DEVICE_ID,
      });

      // Send 15 zero flatline readings
      for (let i = 0; i < 15; i++) {
        await sessionProcessor.ingestReading({
          deviceId: DEVICE_ID,
          sessionId: session.sessionId,
          sampleId: 'turmeric',
          timestamp: Date.now(),
          voltages: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
        });
      }

      const result = await sessionProcessor.finalizeSession(session.sessionId);
      expect(result.status).toBe('DISCONNECTED');
      expect(result.qualityFlags).toContain('Sensor not connected');
    });

    it('flags "Not enough data yet" when session finalized prematurely (< 8 samples)', async () => {
      const session = sessionProcessor.startSession({
        sampleId: 'haritaki',
        deviceId: DEVICE_ID,
      });

      // Send only 4 readings (1 post-warmup)
      for (let i = 0; i < 4; i++) {
        await sessionProcessor.ingestReading({
          deviceId: DEVICE_ID,
          sessionId: session.sessionId,
          sampleId: 'haritaki',
          timestamp: Date.now(),
          voltages: [0.92, 2.85, 0.42, 2.18, 0.88, 3.22],
        });
      }

      const result = await sessionProcessor.finalizeSession(session.sessionId);
      expect(result.status).toBe('INSUFFICIENT_DATA');
      expect(result.qualityFlags).toContain('Not enough data yet');
    });
  });

  describe('4. Known-Good & Known-Bad Fixtures for all 6 Ayurvedic Samples', () => {
    const KNOWN_GOOD = [
      { id: 'turmeric', voltages: [0.48, 0.52, 0.36, 2.45, 3.05, 1.55] },
      { id: 'ashwagandha', voltages: [0.72, 0.38, 0.45, 2.78, 1.15, 2.35] },
      { id: 'haritaki', voltages: [0.92, 2.85, 0.42, 2.18, 0.88, 3.22] },
      { id: 'guduchi', voltages: [0.32, 0.22, 0.28, 3.05, 0.98, 1.85] },
      { id: 'amalaki', voltages: [0.55, 3.05, 0.22, 1.35, 0.62, 3.00] },
      { id: 'tulsi', voltages: [0.42, 0.58, 0.32, 2.22, 2.75, 1.72] },
    ];

    const KNOWN_BAD = [
      { id: 'turmeric', voltages: [0.45, 0.48, 3.10, 0.82, 0.95, 0.41], desc: 'Metanil yellow synthetic dye cut' },
      { id: 'ashwagandha', voltages: [1.85, 0.82, 1.65, 0.75, 0.45, 0.65], desc: 'Starch powder bulking' },
      { id: 'haritaki', voltages: [0.50, 1.10, 0.65, 1.05, 0.40, 1.20], desc: 'Spent tannin marc extract' },
      { id: 'guduchi', voltages: [0.25, 0.20, 0.25, 1.15, 0.50, 0.90], desc: 'Depleted stem surrogate' },
      { id: 'amalaki', voltages: [0.50, 1.20, 0.40, 0.80, 0.40, 1.10], desc: 'Wood apple pulp cut' },
      { id: 'tulsi', voltages: [0.35, 0.45, 0.25, 1.20, 0.85, 0.95], desc: 'Exhausted dry leaf' },
    ];

    KNOWN_GOOD.forEach((sample) => {
      it(`evaluates authentic ${sample.id} sample as "Pass"`, async () => {
        const session = sessionProcessor.startSession({
          sampleId: sample.id,
          deviceId: DEVICE_ID,
        });

        for (let i = 0; i < 15; i++) {
          await sessionProcessor.ingestReading({
            deviceId: DEVICE_ID,
            sessionId: session.sessionId,
            sampleId: sample.id,
            timestamp: Date.now(),
            voltages: sample.voltages,
          });
        }

        const result = await sessionProcessor.finalizeSession(session.sessionId);
        expect(result.verdict).toBe('Pass');
        expect(result.qualityScore).toBeGreaterThanOrEqual(85);
      });
    });

    KNOWN_BAD.forEach((sample) => {
      it(`evaluates adulterated/deficient ${sample.id} (${sample.desc}) as "Fail" or "Borderline"`, async () => {
        const session = sessionProcessor.startSession({
          sampleId: sample.id,
          deviceId: DEVICE_ID,
        });

        for (let i = 0; i < 15; i++) {
          await sessionProcessor.ingestReading({
            deviceId: DEVICE_ID,
            sessionId: session.sessionId,
            sampleId: sample.id,
            timestamp: Date.now(),
            voltages: sample.voltages,
          });
        }

        const result = await sessionProcessor.finalizeSession(session.sessionId);
        expect(result.verdict).not.toBe('Pass');
        expect(result.qualityScore).toBeLessThan(85);
      });
    });
  });

  describe('5. Hardware Heartbeat & Device Health', () => {
    it('reports "Connected" when heartbeat received within 15 seconds', () => {
      const dev = 'ESP32-HEARTBEAT-TEST';
      recordDeviceHeartbeat(dev);
      const health = getDeviceStatus(dev);
      expect(health.status).toBe('Connected');
      expect(health.secondsAgo).toBeLessThanOrEqual(2);
    });

    it('reports "Offline" for unknown device or long silence', () => {
      const health = getDeviceStatus('UNKNOWN-ESP32-NEVER-SEEN');
      expect(health.status).toBe('Offline');
      expect(health.lastSeen).toBeNull();
    });
  });
});
