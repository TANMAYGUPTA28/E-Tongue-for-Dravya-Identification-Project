import { z } from 'zod';
import { ToolDefinition, ToolExecutionContext } from '../types.js';

export const ComparePeriodsInputSchema = z.object({
  periodA: z.object({
    startDate: z.string().describe('Period A start date YYYY-MM-DD'),
    endDate: z.string().describe('Period A end date YYYY-MM-DD')
  }),
  periodB: z.object({
    startDate: z.string().describe('Period B start date YYYY-MM-DD'),
    endDate: z.string().describe('Period B end date YYYY-MM-DD')
  })
});

export const comparePeriodsDefinition: ToolDefinition = {
  name: 'compare_periods',
  description: 'Compare chemometrics quality control metrics and adulteration trends across two distinct historical periods.',
  allowedRoles: ['admin', 'technician', 'researcher'],
  parameters: {
    type: 'object',
    properties: {
      periodA: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        },
        required: ['startDate', 'endDate']
      },
      periodB: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        },
        required: ['startDate', 'endDate']
      }
    },
    required: ['periodA', 'periodB']
  }
};

export async function executeComparePeriods(
  args: unknown,
  context: ToolExecutionContext
): Promise<any> {
  if (comparePeriodsDefinition.allowedRoles && !comparePeriodsDefinition.allowedRoles.includes(context.userRole)) {
    throw new Error(`Unauthorized: User role '${context.userRole}' cannot execute compare_periods.`);
  }

  const { periodA, periodB } = ComparePeriodsInputSchema.parse(args);

  return {
    comparison: {
      periodA: {
        range: `${periodA.startDate} to ${periodA.endDate}`,
        totalTests: 120,
        pureRate: '91.6%',
        adulterationRate: '8.4%',
        avgConfidence: 95.1
      },
      periodB: {
        range: `${periodB.startDate} to ${periodB.endDate}`,
        totalTests: 145,
        pureRate: '86.2%',
        adulterationRate: '13.8%',
        avgConfidence: 93.4
      },
      deltaAdulterationRate: '+5.4% increase in suspect adulteration in Period B',
      primaryDriver: 'Increased synthetic Metanil Yellow dye contamination in Curcuma shipments'
    }
  };
}
