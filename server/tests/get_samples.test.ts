import { describe, it, expect } from 'vitest';
import { executeGetSamples } from '../src/agent/tools/get_samples.js';

describe('Tool: get_samples', () => {
  it('enforces RBAC role checks', async () => {
    await expect(
      executeGetSamples({}, { userRole: 'unauthorized_role' as any })
    ).rejects.toThrow('Unauthorized: User role');
  });

  it('filters samples by dravya term', async () => {
    const result = await executeGetSamples({ dravya: 'Tulsi' }, { userRole: 'researcher' });
    expect(result.count).toBeGreaterThanOrEqual(1);
    expect(result.samples[0].dravya).toContain('Tulsi');
  });

  it('filters samples by status', async () => {
    const result = await executeGetSamples(
      { status: 'SUSPECT_ADULTERATED' },
      { userRole: 'technician' }
    );
    expect(result.count).toBeGreaterThanOrEqual(1);
    result.samples.forEach((sample) => {
      expect(sample.status).toBe('SUSPECT_ADULTERATED');
    });
  });

  it('defends against prompt injection by strictly stripping `notes`', async () => {
    const result = await executeGetSamples({}, { userRole: 'admin' });
    expect(result.samples.length).toBeGreaterThan(0);
    result.samples.forEach((sample) => {
      expect(sample).not.toHaveProperty('notes');
    });
  });
});
