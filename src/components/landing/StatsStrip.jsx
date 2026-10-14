import CountUp from '../ui/CountUp';
import SpotlightCard from '../ui/SpotlightCard';
import { Award, Zap, Layers, Timer } from 'lucide-react';

export default function StatsStrip() {
  const stats = [
    {
      icon: Award,
      value: 96.7,
      decimals: 1,
      suffix: '%',
      label: 'Cross-Validated Accuracy',
      desc: 'Tested across 240 certified reference standard assays',
      accent: '#B6F36A',
    },
    {
      icon: Layers,
      value: 6,
      decimals: 0,
      suffix: ' Sensors',
      label: 'Cross-Reactive Array',
      desc: 'Lipid, PANI, Chitosan, Phthalocyanine, Crown Ether, RuOx',
      accent: '#3E7B4C',
    },
    {
      icon: Zap,
      value: 42,
      decimals: 0,
      suffix: '+',
      label: 'Botanical Formulations',
      desc: 'Indexed in multidimensional Cartesian Rasa space',
      accent: '#E0A03A',
    },
    {
      icon: Timer,
      value: 12.8,
      decimals: 1,
      prefix: '< ',
      suffix: 's',
      label: 'Rapid Assay Time',
      desc: 'Zero-drift potentiostatic acquisition to classification',
      accent: '#38BDF8',
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <SpotlightCard
              key={i}
              className="p-6 flex flex-col justify-between space-y-4 group"
              spotlightColor={`${stat.accent}25`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${stat.accent}15`,
                    borderColor: `${stat.accent}30`,
                    color: stat.accent,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A968E]">
                  BENCHMARK
                </span>
              </div>

              <div>
                <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#EDEFE8] tracking-tight">
                  <CountUp
                    end={stat.value}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <h3 className="font-sans font-semibold text-sm text-[#EDEFE8] mt-1 group-hover:text-[#B6F36A] transition-colors">
                  {stat.label}
                </h3>
                <p className="text-xs text-[#8A968E] mt-1 leading-relaxed font-sans">
                  {stat.desc}
                </p>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
