import { ToolDefinition, ToolExecutionContext } from '../types.js';
import { getSamplesDefinition, executeGetSamples } from './get_samples.js';
import { getSampleByIdDefinition, executeGetSampleById } from './get_sample_by_id.js';
import { getDailySummaryDefinition, executeGetDailySummary } from './get_daily_summary.js';
import { comparePeriodsDefinition, executeComparePeriods } from './compare_periods.js';
import { predictDravyaDefinition, executePredictDravya } from './predict_dravya.js';
import { getDravyaInfoDefinition, executeGetDravyaInfo } from './get_dravya_info.js';
import { searchKnowledgeDefinition, executeSearchKnowledge } from './search_knowledge.js';
import { renderUIDefinition, executeRenderUI } from './render_ui.js';

export interface AgentToolModule {
  definition: ToolDefinition;
  execute: (args: unknown, context: ToolExecutionContext) => Promise<any>;
}

export const agentToolsRegistry: Record<string, AgentToolModule> = {
  get_samples: {
    definition: getSamplesDefinition,
    execute: executeGetSamples
  },
  get_sample_by_id: {
    definition: getSampleByIdDefinition,
    execute: executeGetSampleById
  },
  get_daily_summary: {
    definition: getDailySummaryDefinition,
    execute: executeGetDailySummary
  },
  compare_periods: {
    definition: comparePeriodsDefinition,
    execute: executeComparePeriods
  },
  predict_dravya: {
    definition: predictDravyaDefinition,
    execute: executePredictDravya
  },
  get_dravya_info: {
    definition: getDravyaInfoDefinition,
    execute: executeGetDravyaInfo
  },
  search_knowledge: {
    definition: searchKnowledgeDefinition,
    execute: executeSearchKnowledge
  },
  render_ui: {
    definition: renderUIDefinition,
    execute: executeRenderUI
  }
};

export function getAllToolDefinitions(): ToolDefinition[] {
  return Object.values(agentToolsRegistry).map((t) => t.definition);
}

export async function executeToolByName(
  name: string,
  args: unknown,
  context: ToolExecutionContext
): Promise<any> {
  const tool = agentToolsRegistry[name];
  if (!tool) {
    throw new Error(`Tool '${name}' is not registered in agentToolsRegistry.`);
  }
  return await tool.execute(args, context);
}
