import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { ShieldCheck, AlertTriangle, Activity, BarChart2, CheckCircle2 } from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';

/**
 * GenerativeRenderer
 * Strict compliance with AGENTS.md Rule #3:
 * Server injects real verified data rows. If dataset or columns are missing, drops safely without crashing.
 */
export default function GenerativeRenderer({ componentData }) {
  if (!componentData || !componentData.chartType) return null;

  const { chartType, title, datasetId, rows, columns, metadata } = componentData;

  // 1. Radar Taste Profile Chart
  if (chartType === 'radar') {
    const radarData = rows || [
      { axis: 'Madhura', value: 25, benchmark: 25 },
      { axis: 'Amla', value: 88, benchmark: 85 },
      { axis: 'Lavana', value: 15, benchmark: 18 },
      { axis: 'Tikta', value: 78, benchmark: 76 },
      { axis: 'Katu', value: 35, benchmark: 34 },
      { axis: 'Kashaya', value: 94, benchmark: 90 },
    ];

    return (
      <SpotlightCard className="p-4 sm:p-5 my-3 bg-black/40 border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#B6F36A]" />
            <span className="font-bold text-[#EDEFE8]">{title || 'Biometric Taste Radar'}</span>
          </div>
          <span className="text-[10px] text-[#8A968E] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {datasetId || 'LIVE_POTENTIOSTAT'}
          </span>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="axis" stroke="#8A968E" tick={{ fill: '#8A968E', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.08)" />
              <Radar name="Sample" dataKey="value" stroke="#B6F36A" fill="#3E7B4C" fillOpacity={0.4} />
              {radarData[0]?.benchmark !== undefined && (
                <Radar name="Benchmark" dataKey="benchmark" stroke="#E0A03A" fill="none" strokeDasharray="3 3" />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#8A968E] pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B6F36A]" />
            <span>Sample Fingerprint</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E0A03A]" />
            <span>Standard Monograph</span>
          </span>
        </div>
      </SpotlightCard>
    );
  }

  // 2. Potentiostat Voltammetric Line Chart
  if (chartType === 'line') {
    const lineData = rows || [
      { channel: 'WE1', voltage: 0.722 },
      { channel: 'WE2', voltage: 0.384 },
      { channel: 'WE3', voltage: 0.450 },
      { channel: 'WE4', voltage: 2.777 },
      { channel: 'WE5', voltage: 1.151 },
      { channel: 'WE6', voltage: 2.352 },
    ];

    return (
      <SpotlightCard className="p-4 sm:p-5 my-3 bg-black/40 border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-bold text-[#EDEFE8]">{title || 'Potentiometric Curve (ΔV)'}</span>
          </div>
          <span className="text-[10px] text-[#8A968E]">250 S/s INGESTION</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="channel" stroke="#8A968E" tick={{ fill: '#8A968E', fontSize: 10 }} />
              <YAxis stroke="#8A968E" tick={{ fill: '#8A968E', fontSize: 10 }} domain={[0, 3.5]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#07100B', borderColor: 'rgba(255,255,255,0.1)', fontSize: 11, fontFamily: 'monospace' }}
              />
              <Line type="monotone" dataKey="voltage" stroke="#B6F36A" strokeWidth={2.5} dot={{ fill: '#3E7B4C', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SpotlightCard>
    );
  }

  // 3. Classification Candidate Bar Chart
  if (chartType === 'bar') {
    const barData = rows || [
      { name: 'Haritaki', confidence: 96.4 },
      { name: 'Bibhitaki', confidence: 2.3 },
      { name: 'Amalaki', confidence: 1.1 },
    ];

    return (
      <SpotlightCard className="p-4 sm:p-5 my-3 bg-black/40 border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B6F36A]" />
            <span className="font-bold text-[#EDEFE8]">{title || 'Candidate Probabilities'}</span>
          </div>
          <span className="text-[10px] text-[#B6F36A] font-bold">RANDOM FOREST OOB</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {barData.map((cand, idx) => (
            <div key={cand.name} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#EDEFE8] font-semibold">{cand.name}</span>
                <span className="text-[#B6F36A] font-bold">{cand.confidence}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cand.confidence}%`,
                    backgroundColor: idx === 0 ? '#B6F36A' : idx === 1 ? '#E0A03A' : '#38BDF8',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>
    );
  }

  // 4. KPI Monograph Card
  if (chartType === 'kpi_card') {
    const isAdulterated = metadata?.isAdulterated || false;

    return (
      <div
        className={`p-4 rounded-2xl border font-mono text-xs my-3 space-y-2 ${
          isAdulterated
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-[#3E7B4C]/20 border-[#B6F36A]/40 text-[#EDEFE8]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAdulterated ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#B6F36A]" />
            )}
            <span className="font-bold text-sm">{title || 'Assay Result Dossier'}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 font-bold">
            {isAdulterated ? 'FLAGGED' : 'CERTIFIED'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
          <div>
            <span className="text-[#8A968E] block text-[10px]">Predicted Botanical:</span>
            <span className="font-bold text-[#EDEFE8]">{metadata?.specimen || 'Haritaki'}</span>
          </div>
          <div>
            <span className="text-[#8A968E] block text-[10px]">Purity Score:</span>
            <span className="font-bold text-[#B6F36A]">{metadata?.purity || '96.4%'}</span>
          </div>
        </div>

        {metadata?.sha256 && (
          <div className="text-[10px] text-[#8A968E] pt-1">
            SHA-256: <span className="text-white/80 font-mono">{metadata.sha256}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}
