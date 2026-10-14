import { z } from 'zod';
import { ToolDefinition, ToolExecutionContext, UIComponentSchema } from '../types.js';

export const RenderUIInputSchema = z.object({
  component: UIComponentSchema.describe('Declarative UI component specification')
});

export const renderUIDefinition: ToolDefinition = {
  name: 'render_ui',
  description: 'Emit a declarative UI widget (radar, line_chart, bar_chart, data_table, stat_cards, or confidence_ring) to be dynamically rendered in the client interface.',
  allowedRoles: ['admin', 'technician', 'researcher'],
  parameters: {
    type: 'object',
    properties: {
      component: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['line_chart', 'bar_chart', 'radar', 'data_table', 'stat_cards', 'confidence_ring']
          },
          props: {
            type: 'object'
          }
        },
        required: ['type', 'props']
      }
    },
    required: ['component']
  }
};

export async function executeRenderUI(
  args: unknown,
  context: ToolExecutionContext
): Promise<any> {
  if (renderUIDefinition.allowedRoles && !renderUIDefinition.allowedRoles.includes(context.userRole)) {
    throw new Error(`Unauthorized: User role '${context.userRole}' cannot execute render_ui.`);
  }

  const { component } = RenderUIInputSchema.parse(args);
  return {
    status: 'UI_SPEC_VERIFIED',
    component
  };
}
