import { describe, it, expect } from 'vitest';
import { executeGetSampleById } from '../src/agent/tools/get_sample_by_id.js';
import { executeGetDailySummary } from '../src/agent/tools/get_daily_summary.js';
import { executeComparePeriods } from '../src/agent/tools/compare_periods.js';
import { executePredictDravya } from '../src/agent/tools/predict_dravya.js';
import { executeGetDravyaInfo } from '../src/agent/tools/get_dravya_info.js';
import { executeSearchKnowledge } from '../src/agent/tools/search_knowledge.js';
import { executeRenderUI } from '../src/agent/tools/render_ui.js';

const context = { userRole: 'researcher' as const, userId: 'test_usr' };

describe('Phase 2 Tools Suite', () => {
  describe('get_sample_by_id', () => {
    it('retrieves sample and strips notes field', async () => {
      const res = await executeGetSampleById({ id: 'SMP-2026-081' }, context);
      expect(res.id).toBe('SMP-2026-081');
      expect(res.dravya).toContain('Tulsi');
      expect(res).not.toHaveProperty('notes');
    });

    it('returns error when sample is not found', async () => {
      const res = await executeGetSampleById({ id: 'NON_EXISTENT' }, context);
      expect(res.error).toBe('SAMPLE_NOT_FOUND');
    });
  });

  describe('get_daily_summary', () => {
    it('computes daily rollups and pass rates', async () => {
      const res = await executeGetDailySummary({ date: '2026-10-14' }, context);
      expect(res.totalSamplesTested).toBe(48);
      expect(res.verifiedPureCount).toBe(42);
      expect(res.purityPassRate).toBe('87.5%');
    });
  });

  describe('compare_periods', () => {
    it('compares metrics between two historical periods', async () => {
      const res = await executeComparePeriods({
        periodA: { startDate: '2026-09-01', endDate: '2026-09-30' },
        periodB: { startDate: '2026-10-01', endDate: '2026-10-14' }
      }, context);

      expect(res.comparison.periodA.totalTests).toBe(120);
      expect(res.comparison.periodB.totalTests).toBe(145);
      expect(res.comparison.deltaAdulterationRate).toBeDefined();
    });
  });

  describe('predict_dravya (ML Microservice Bridge)', () => {
    it('falls back safely with valid prediction when microservice is offline', async () => {
      const res = await executePredictDravya({
        voltages: [0.72, 0.38, 0.45, 0.65, 2.85, 1.42]
      }, context);

      expect(res.label).toContain('Turmeric');
      expect(res.rawConfidence).toBeGreaterThanOrEqual(0.60);
      expect(res.isInconclusive).toBe(false);
      expect(res.top3.length).toBeGreaterThanOrEqual(1);
    });

    it('sets verdict to "inconclusive" if confidence < 0.60', async () => {
      // Simulate low confidence response
      const lowConfMock = async () => ({
        label: 'Uncertain Herb',
        confidence: 0.52,
        top3: [{ label: 'Uncertain Herb', score: 0.52 }],
        featureImportance: [],
        modelVersion: 'v3.2'
      });

      const res = await executePredictDravya({ ph: 6.5 }, context, lowConfMock);
      expect(res.label).toBe('inconclusive');
      expect(res.isInconclusive).toBe(true);
    });
  });

  describe('get_dravya_info', () => {
    it('returns standardized monograph for Tulsi', async () => {
      const res = await executeGetDravyaInfo({ slug: 'tulsi' }, context);
      expect(res.botanicalName).toContain('Ocimum');
      expect(res.activeBiomarkers).toContain('Eugenol (71.3%)');
    });

    it('returns standardized monograph for Ashwagandha', async () => {
      const res = await executeGetDravyaInfo({ slug: 'ashwagandha' }, context);
      expect(res.botanicalName).toContain('Withania somnifera');
      expect(res.activeBiomarkers).toContain('Withaferin A');
    });
  });

  describe('search_knowledge', () => {
    it('retrieves relevant knowledge items for Metanil yellow query', async () => {
      const res = await executeSearchKnowledge({ query: 'Metanil yellow' }, context);
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].topic).toContain('Metanil Yellow');
    });
  });

  describe('render_ui', () => {
    it('validates and accepts declarative radar component', async () => {
      const res = await executeRenderUI({
        component: {
          type: 'radar',
          props: {
            madhura: 20,
            amla: 15,
            lavana: 10,
            tikta: 85,
            katu: 90,
            kashaya: 40
          }
        }
      }, context);

      expect(res.status).toBe('UI_SPEC_VERIFIED');
      expect(res.component.type).toBe('radar');
    });
  });
});
