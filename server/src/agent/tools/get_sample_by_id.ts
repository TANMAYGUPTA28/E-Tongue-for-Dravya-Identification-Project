import { z } from 'zod';
import { ToolDefinition, ToolExecutionContext } from '../types.js';

export const GetSampleByIdInputSchema = z.object({
  id: z.string().min(1, 'Sample ID is required')
});

export type GetSampleByIdInput = z.infer<typeof GetSampleByIdInputSchema>;

export const getSampleByIdDefinition: ToolDefinition = {
  name: 'get_sample_by_id',
  description: 'Retrieve full potentiometric curve, radar profile, and SHA-256 monograph for a specific sample ID. Strips technician notes.',
  allowedRoles: ['admin', 'technician', 'researcher'],
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The unique sample identifier (e.g., "SMP-2026-081")'
      }
    },
    required: ['id']
  }
};

export async function executeGetSampleById(
  args: unknown,
  context: ToolExecutionContext,
  sampleDataSource?: (id: string) => Promise<any>
): Promise<any> {
  if (getSampleByIdDefinition.allowedRoles && !getSampleByIdDefinition.allowedRoles.includes(context.userRole)) {
    throw new Error(`Unauthorized: User role '${context.userRole}' cannot execute get_sample_by_id.`);
  }

  const { id } = GetSampleByIdInputSchema.parse(args);

  let sample: any = null;
  if (sampleDataSource) {
    sample = await sampleDataSource(id);
  } else {
    // Database mock/fallback catalog
    const CATALOG: Record<string, any> = {
      'SMP-2026-081': {
        id: 'SMP-2026-081',
        dravya: 'Tulsi (Ocimum sanctum)',
        botanicalName: 'Ocimum sanctum L.',
        batchNumber: 'TUL-BATCH-09',
        status: 'VERIFIED_PURE',
        confidence: 96.4,
        date: '2026-10-14',
        voltages: [0.72, 0.38, 0.45, 0.65, 2.85, 1.42],
        radarProfile: { madhura: 21, amla: 12, lavana: 13, tikta: 20, katu: 82, kashaya: 42 },
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        notes: 'TECHNICIAN_CONFIDENTIAL_NOTES_DO_NOT_LEAK'
      },
      'SMP-2026-082': {
        id: 'SMP-2026-082',
        dravya: 'Ashwagandha (Withania somnifera)',
        botanicalName: 'Withania somnifera (L.) Dunal',
        batchNumber: 'ASH-BATCH-04',
        status: 'SUSPECT_ADULTERATED',
        confidence: 88.2,
        date: '2026-10-14',
        voltages: [1.85, 0.42, 0.50, 0.72, 1.10, 0.85],
        radarProfile: { madhura: 65, amla: 15, lavana: 14, tikta: 25, katu: 30, kashaya: 28 },
        sha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        notes: 'Technician flagged elevated carbohydrate starch adulteration'
      }
    };
    sample = CATALOG[id] || null;
  }

  if (!sample) {
    return { error: 'SAMPLE_NOT_FOUND', message: `No sample found with ID ${id}` };
  }

  // Sanitize: strip notes
  const { notes, ...safeSample } = sample;
  return safeSample;
}
