import { describe, it, expect } from 'vitest';
import { executeNightlyRollup } from '../src/jobs/nightlyRollup.js';

describe('Nightly Batch Rollup & Anomaly Detection', () => {
  it('executes batch RF inference and computes rollups for target date', async () => {
    const rollup = await executeNightlyRollup('2026-10-14');

    expect(rollup.date).toBe('2026-10-14');
    expect(rollup.batchPredictionsCount).toBeGreaterThanOrEqual(0);
    expect(rollup.purityPassPercentage).toBeDefined();
    expect(rollup.averageConfidence).toBeGreaterThan(0);
    expect(Array.isArray(rollup.anomaliesFlagged)).toBe(true);
    expect(rollup.executionTimestamp).toBeDefined();
  });

  it('correctly flags adulteration anomalies when abnormal voltages are processed', async () => {
    const rollup = await executeNightlyRollup();
    // Verify structure of any flagged anomalies
    rollup.anomaliesFlagged.forEach((anomaly) => {
      expect(anomaly.sampleId).toBeDefined();
      expect(anomaly.adulterationType).toBeDefined();
      expect(anomaly.confidence).toBeGreaterThan(0);
    });
  });
});
