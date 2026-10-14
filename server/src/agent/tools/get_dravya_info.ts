import { z } from 'zod';
import { ToolDefinition, ToolExecutionContext } from '../types.js';

export const GetDravyaInfoInputSchema = z.object({
  slug: z.string().min(1, 'Dravya slug or botanical name is required')
});

export const getDravyaInfoDefinition: ToolDefinition = {
  name: 'get_dravya_info',
  description: 'Retrieve standardized Ayurvedic Pharmacopoeia (API) monograph information for an herb: botanical name, Sanskrit name, Rasa, Guna, Virya, Vipaka, active chemical markers, and standard references.',
  allowedRoles: ['admin', 'technician', 'researcher'],
  parameters: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        description: 'Botanical name, common name, or slug (e.g., "tulsi", "ashwagandha", "haridra", "neem")'
      }
    },
    required: ['slug']
  }
};

const BOTANICAL_MONOGRAPHS: Record<string, any> = {
  tulsi: {
    sanskritName: 'Tulasi (सुरसा / तुलसी)',
    botanicalName: 'Ocimum sanctum L. / Ocimum tenuiflorum',
    family: 'Lamiaceae',
    rasa: ['Katu (Pungent)', 'Tikta (Bitter)'],
    guna: ['Laghu (Light)', 'Ruksha (Dry)', 'Tikshna (Sharp)'],
    virya: 'Ushna (Hot potency)',
    vipaka: 'Katu (Pungent after digestion)',
    doshaKarma: 'Kapha-Vata Shamaka, Pitta Vardhaka',
    activeBiomarkers: ['Eugenol (71.3%)', 'Caryophyllene', 'Ursolic Acid', 'Rosmarinic Acid'],
    pharmacopoeiaStandard: 'Ayurvedic Pharmacopoeia of India (API) Part 1, Vol. II, Page 165',
    potentiostatSignature: 'Excitation localized at S5 (Crown Ether - Volatile Terpenes) and S6 (Polyphenols)'
  },
  ashwagandha: {
    sanskritName: 'Ashwagandha (अश्वगंधा)',
    botanicalName: 'Withania somnifera (L.) Dunal',
    family: 'Solanaceae',
    rasa: ['Tikta (Bitter)', 'Kashaya (Astringent)', 'Madhura (Sweet)'],
    guna: ['Guru (Heavy)', 'Snigdha (Unctuous)'],
    virya: 'Ushna (Hot potency)',
    vipaka: 'Madhura (Sweet after digestion)',
    doshaKarma: 'Vata-Kapha Shamaka / Balya & Rasayana',
    activeBiomarkers: ['Withaferin A', 'Withanolide A', 'Withanolide D', 'Sominone'],
    pharmacopoeiaStandard: 'API Part 1, Vol. I, Page 15',
    potentiostatSignature: 'Excitation localized at S4 (Phthalocyanine - Steroidal Lactones/Withanolides)'
  },
  haridra: {
    sanskritName: 'Haridra (हरिद्रा / निशा)',
    botanicalName: 'Curcuma longa L.',
    family: 'Zingiberaceae',
    rasa: ['Tikta (Bitter)', 'Katu (Pungent)'],
    guna: ['Ruksha (Dry)', 'Laghu (Light)'],
    virya: 'Ushna (Hot potency)',
    vipaka: 'Katu (Pungent after digestion)',
    doshaKarma: 'Tridosha Shamaka / Varnya / Vishaghna',
    activeBiomarkers: ['Curcumin (4.5 - 7.5%)', 'Demethoxycurcumin', 'Bisdemethoxycurcumin', 'Turmerone'],
    pharmacopoeiaStandard: 'API Part 1, Vol. I, Page 45',
    potentiostatSignature: 'Excitation localized at S5 (Crown Ether - Curcuminoids) and S2 (Organic Acids)'
  }
};

export async function executeGetDravyaInfo(
  args: unknown,
  context: ToolExecutionContext
): Promise<any> {
  if (getDravyaInfoDefinition.allowedRoles && !getDravyaInfoDefinition.allowedRoles.includes(context.userRole)) {
    throw new Error(`Unauthorized: User role '${context.userRole}' cannot execute get_dravya_info.`);
  }

  const { slug } = GetDravyaInfoInputSchema.parse(args);
  const key = slug.toLowerCase().trim();

  for (const [name, monograph] of Object.entries(BOTANICAL_MONOGRAPHS)) {
    if (key.includes(name) || monograph.botanicalName.toLowerCase().includes(key)) {
      return monograph;
    }
  }

  return {
    error: 'MONOGRAPH_NOT_FOUND',
    message: `No standardized pharmacopoeia monograph found for query '${slug}'. Available references: Tulsi, Ashwagandha, Haridra.`
  };
}
