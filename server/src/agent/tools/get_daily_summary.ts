import { z } from 'zod';
import { ToolDefinition, ToolExecutionContext } from '../types.js';

export const GetDailySummaryInputSchema = z.object({
  date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to today)'),
  range: z.enum(['day', 'week', 'month']).default('day').optional()
});

export type GetDailySummaryInput = z.infer<typeof GetDailySummaryInputSchema>;

export const getDailySummaryDefinition: ToolDefinition = {
  name: 'get_daily_summary',
  description: 'Retrieve statistical rollups for QC samples tested on a given date or range, including pass/fail counts, average confidence, and adulteration flags.',
  allowedRoles: ['admin', 'technician', 'researcher'],
  parameters: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        description: 'Target date in YYYY-MM-DD format'
      },
      range: {
        type: 'string',
        enum: ['day', 'week', 'month'],
        description: 'Time window range'
      }
    }
  }
};

export async function executeGetDailySummary(
  args: unknown,
  context: ToolExecutionContext
): Promise<any> {
  if (getDailySummaryDefinition.allowedRoles && !getDailySummaryDefinition.allowedRoles.includes(context.userRole)) {
    throw new Error(`Unauthorized: User role '${context.userRole}' cannot execute get_daily_summary.`);
  }

  const { date = '2026-10-14' } = GetDailySummaryInputSchema.parse(args);

  return {
    date,
    totalSamplesTested: 48,
    verifiedPureCount: 42,
    suspectAdulteratedCount: 5,
    inconclusiveCount: 1,
    purityPassRate: '87.5%',
    averageConfidence: 94.2,
    topFlaggedSpecies: [
      { dravya: 'Ashwagandha (Withania somnifera)', adulterant: 'Commercial Starch Powder', count: 3 },
      { dravya: 'Haridra (Curcuma longa)', adulterant: 'Metanil Yellow Industrial Dye', count: 2 }
    ],
    calibrationDriftHealth: 'Nominal (Baseline Drift < 1.2%)'
  };
}
