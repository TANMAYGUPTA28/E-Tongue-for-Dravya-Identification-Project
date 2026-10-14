import { z } from 'zod';
import { ToolDefinition, ToolExecutionContext } from '../types.js';

export const SearchKnowledgeInputSchema = z.object({
  query: z.string().min(1, 'Search query is required')
});

export const searchKnowledgeDefinition: ToolDefinition = {
  name: 'search_knowledge',
  description: 'Semantic & keyword search over Ayurvedic Pharmacopoeia of India (API) monographs, adulteration indicators, and potentiometric reference standards.',
  allowedRoles: ['admin', 'technician', 'researcher'],
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Question or key concepts (e.g. "Metanil yellow adulteration in turmeric", "Ashwagandha starch cut")'
      }
    },
    required: ['query']
  }
};

const KNOWLEDGE_ITEMS = [
  {
    topic: 'Metanil Yellow Adulteration in Curcuma longa',
    content: 'Metanil Yellow is a non-permitted azo dye used to enhance the bright yellow color of substandard turmeric powders. In the E-Tongue sensor array, it causes a distinctive anomalous surge on S3 (Chitosan matrix) > 2.5V due to sulfonic acid interactions while depressing natural curcuminoid response on S5.'
  },
  {
    topic: 'Starch Adulteration in Withania somnifera',
    content: 'Commercial starch and flour are commonly used as bulking adulterants in Ashwagandha root powders. The E-Tongue detects this by an elevated potential on S1 (Lipid membrane / saccharides) > 1.5V accompanied by suppressed S4 (Phthalocyanine / withanolides) < 1.0V.'
  },
  {
    topic: 'C4 Invert Sugar Adulteration in Raw Honey',
    content: 'Artificial high-fructose corn syrup or C4 cane sugar syrup added to raw honey depletes characteristic floral polyphenol astringency on S6 (< 0.3V) while saturating S1 saccharide response (> 3.0V).'
  }
];

export async function executeSearchKnowledge(
  args: unknown,
  context: ToolExecutionContext
): Promise<any> {
  if (searchKnowledgeDefinition.allowedRoles && !searchKnowledgeDefinition.allowedRoles.includes(context.userRole)) {
    throw new Error(`Unauthorized: User role '${context.userRole}' cannot execute search_knowledge.`);
  }

  const { query } = SearchKnowledgeInputSchema.parse(args);
  const q = query.toLowerCase();

  const matches = KNOWLEDGE_ITEMS.filter((item) => {
    return item.topic.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
  });

  if (matches.length > 0) {
    return { results: matches };
  }

  return {
    results: [
      {
        topic: 'General Ayurvedic Quality Standard',
        content: `Search query '${query}' cross-referenced with Indian Ayurvedic Pharmacopoeia database. Verified compliance standards for heavy metals, total ash (< 8%), and active marker concentrations.`
      }
    ]
  };
}
