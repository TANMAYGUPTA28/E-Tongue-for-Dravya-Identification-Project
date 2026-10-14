import { BookOpen, Leaf, Layers, ShieldCheck, Cpu, FlaskConical, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold uppercase tracking-wider">
            Theory & Analytical Pharmacology
          </span>
          <span className="text-xs font-mono text-slate-500">Dravyaguna Vijnana & AI Biomimicry</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Ayurvedic Shad-Rasa & Electrochemical Transduction
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          Biomimetic potentiometry bridging classical Ayurvedic pharmacopoeia with modern machine learning chemometrics.
        </p>
      </div>

      {/* Card 1: Dravyaguna Principle */}
      <div className="lab-card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span>1. The Ayurvedic Foundation of Taste (Rasa)</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          In Ayurveda, <strong className="text-slate-800">Rasa</strong> (taste) is not merely a subjective sensory perception; it is the fundamental chemical biomarker that reveals a medicinal herb's elemental composition (<em className="text-slate-700">Pancha Mahabhuta</em>) and systemic biological action (<em className="text-slate-700">Karma</em>) in human physiology:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
          {[
            { rasa: 'Madhura (Sweet)', elements: 'Prithvi + Jala', action: 'Nourishing / Anabolic (Kapha+ / Vata- Pitta-)', color: 'text-teal-700 bg-teal-50/70 border-teal-200' },
            { rasa: 'Amla (Sour)', elements: 'Prithvi + Agni', action: 'Digestive / Deepana (Pitta+ / Vata-)', color: 'text-amber-700 bg-amber-50/70 border-amber-200' },
            { rasa: 'Lavana (Salty)', elements: 'Jala + Agni', action: 'Electrolyte balance / Chedana', color: 'text-blue-700 bg-blue-50/70 border-blue-200' },
            { rasa: 'Tikta (Bitter)', elements: 'Vayu + Akasha', action: 'Detoxifying / Vishaghna (Pitta- Kapha-)', color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200' },
            { rasa: 'Katu (Pungent)', elements: 'Vayu + Agni', action: 'Metabolic stimulant / Lekhana', color: 'text-rose-700 bg-rose-50/70 border-rose-200' },
            { rasa: 'Kashaya (Astringent)', elements: 'Vayu + Prithvi', action: 'Tissue tightening / Ropana & Grahi', color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200' },
          ].map((item) => (
            <div key={item.rasa} className={`p-3 rounded-lg border ${item.color}`}>
              <span className="font-bold block text-[13px]">{item.rasa}</span>
              <span className="text-slate-500 text-[10px] block mt-0.5">{item.elements}</span>
              <span className="text-slate-700 text-[11px] block mt-1 font-sans font-medium">{item.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: How the E-Tongue Works */}
      <div className="lab-card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-600" />
          <span>2. Biomimetic Cross-Reactive Electrochemical Transduction</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          When botanical decoctions (<em className="text-slate-700">Kashayam</em>) or powders are immersed in the sensor cell, the 6 cross-reactive polymer membranes generate distinct potentiometric transients against an Ag/AgCl reference electrode:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Non-Specific Cross-Reactivity</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Instead of one sensor for one compound, each membrane interacts with an entire functional group family (tannins, organic acids, alkaloids, saccharides).
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Random Forest Fingerprinting</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ensemble decision trees extract multidimensional spatial correlations, matching complex herbal signatures to pharmacopoeia standards.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Adulteration Detection</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Industrial dyes (Metanil Yellow in Turmeric) or starch fillers cause severe baseline divergence, triggering automated safety alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
