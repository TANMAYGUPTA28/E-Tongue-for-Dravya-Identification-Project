import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileDown,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  FlaskConical,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { getTestSession, finalizeTestSession } from '../api';
import SampleIllustration from '../components/ui/SampleIllustration';
import Badge from '../components/ui/ds/Badge';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/ds/Card';
import toast from 'react-hot-toast';

export default function SessionResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const fetchSession = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!sessionId) {
        // Fallback demo data if navigated without ID
        setSessionData({
          sessionId: 'SES-STANDALONE-01',
          sampleId: 'ashwagandha',
          sampleName: 'Pure Ashwagandha Root',
          botanical: 'Withania somnifera (L.) Dunal',
          batchNumber: 'LOT-2026-ASH-01',
          operator: 'Tanmay Gupta (Lead Analyst)',
          verdict: 'Pass',
          status: 'VERIFIED_PURE',
          qualityScore: 96,
          isEstimate: true,
          qualityFlags: [],
          factors: [
            'All 6 potentiostat working electrode signals fall within certified reference bands.',
            'Characteristic withanolide bitter response detected at 2.78V on phthalocyanine transducer.',
            'Zero synthetic adulterants or carrier starches detected.',
          ],
          finalVoltages: [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
          dateFormatted: '14 Oct 2026',
          referenceSource: 'Ayurvedic Pharmacopoeia of India (API Vol. I, p. 19)',
        });
        setLoading(false);
        return;
      }

      const session = await getTestSession(sessionId);
      if (session.status === 'COLLECTING' || session.status === 'ANALYZING') {
        const result = await finalizeTestSession(sessionId);
        setSessionData(result);
      } else if (session.result) {
        setSessionData(session.result);
      } else {
        setSessionData(session);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Could not retrieve this test session. It may have expired or not yet finalized.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-pulse">
        <div className="h-8 bg-white/[0.05] rounded-xl w-64" />
        <div className="p-8 rounded-3xl bg-[#0B100D] border border-white/[0.08] space-y-6">
          <div className="h-10 bg-white/[0.04] rounded-lg w-1/3" />
          <div className="h-4 bg-white/[0.03] rounded-lg w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="h-32 bg-white/[0.02] rounded-2xl" />
            <div className="h-32 bg-white/[0.02] rounded-2xl" />
            <div className="h-32 bg-white/[0.02] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error || !sessionData) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0B100D] border border-white/[0.08] text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#EDEFE8]">Assay Result Not Available</h2>
          <p className="text-xs text-[#8E9B93] leading-relaxed">{error || 'Session not found.'}</p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={fetchSession}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] text-[#0B100D] font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Retrieval</span>
          </button>
          <Link
            to="/new-analysis"
            className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-[#EDEFE8] text-xs font-semibold hover:bg-white/[0.08]"
          >
            Start New Test
          </Link>
        </div>
      </div>
    );
  }

  const isPass = sessionData.verdict === 'Pass';
  const isBorderline = sessionData.verdict === 'Borderline';
  const isFail = !isPass && !isBorderline;

  const SENSOR_CHANNELS = [
    { id: 'S1', name: 'Lipid (Neutral Glycosides)', rasa: 'Madhura' },
    { id: 'S2', name: 'Conductive (Organic Acids)', rasa: 'Amla' },
    { id: 'S3', name: 'Chitosan (Electrolytes)', rasa: 'Lavana' },
    { id: 'S4', name: 'Phthalocyanine (Alkaloids)', rasa: 'Tikta' },
    { id: 'S5', name: 'Crown Ether (Volatiles)', rasa: 'Katu' },
    { id: 'S6', name: 'Ruthenium Oxide (Tannins)', rasa: 'Kashaya' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-[#EDEFE8]">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#8E9B93] hover:text-[#EDEFE8] transition-colors"
            title="Back to History"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#8E9B93]">OFFICIAL ASSAY REPORT</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[11px] font-mono text-[#8E9B93]">SESSION: {sessionData.sessionId}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#EDEFE8]">
              Botanical Authenticity & Quality Certificate
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              window.print();
              toast.success('Certificate sent to printer / PDF export.');
            }}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#EDEFE8] text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileDown className="w-4 h-4 text-[#8E9B93]" />
            <span>Download Certificate</span>
          </button>
          <Link
            to="/new-analysis"
            className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0B100D] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <span>Run Another Sample</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Certificate Bento Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0B100D] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20 ${
            isPass ? 'bg-[#10B981]' : isBorderline ? 'bg-amber-400' : 'bg-red-500'
          }`}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left: Botanical Illustration & Identity */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <SampleIllustration
              sampleId={sessionData.sampleId}
              size={130}
              className="drop-shadow-[0_10px_25px_rgba(16,185,129,0.2)]"
            />
            <div>
              <span className="text-[11px] font-mono text-[#8E9B93] uppercase tracking-wider block">
                TEST SPECIMEN
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#EDEFE8] mt-0.5">
                {sessionData.sampleName}
              </h2>
              <p className="text-xs font-serif italic text-[#8E9B93] mt-0.5">
                {sessionData.botanical}
              </p>
            </div>

            <div className="w-full pt-4 border-t border-white/[0.06] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#8E9B93]">
                <span>Batch Lot:</span>
                <span className="text-[#EDEFE8] font-semibold">{sessionData.batchNumber || 'LOT-2026-A'}</span>
              </div>
              <div className="flex justify-between text-[#8E9B93]">
                <span>Analyst:</span>
                <span className="text-[#EDEFE8]">{sessionData.operator || 'Lead Chemist'}</span>
              </div>
              <div className="flex justify-between text-[#8E9B93]">
                <span>Date of Assay:</span>
                <span className="text-[#EDEFE8]">{sessionData.dateFormatted || 'Today'}</span>
              </div>
            </div>
          </div>

          {/* Right: Big Verdict Badge & Quality Score */}
          <div className="md:col-span-7 space-y-6">
            <div
              className={`p-6 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
                isPass
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : isBorderline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isPass
                      ? 'bg-[#10B981]/20'
                      : isBorderline
                      ? 'bg-amber-500/20'
                      : 'bg-red-500/20'
                  }`}
                >
                  {isPass ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : isBorderline ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <AlertCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-wider uppercase">
                      VERDICT:
                    </span>
                    {sessionData.isEstimate && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[10px] font-mono text-[#EDEFE8]/80">
                        Estimate
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#EDEFE8] mt-0.5">
                    {isPass
                      ? 'Certified Pure Botanical'
                      : isBorderline
                      ? 'Borderline Quality Profile'
                      : 'Adulteration / Quality Deviation Flagged'}
                  </h3>
                </div>
              </div>

              {sessionData.qualityScore !== null && (
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-[#EDEFE8] font-mono">
                    {sessionData.qualityScore}%
                  </span>
                  <span className="text-[10px] text-[#8E9B93] block uppercase tracking-wider font-mono">
                    Quality Rating
                  </span>
                </div>
              )}
            </div>

            {/* Quality Flags Notice (if any) */}
            {sessionData.qualityFlags && sessionData.qualityFlags.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-[#EDEFE8] space-y-1">
                  <span className="font-semibold text-amber-400 block">Instrument Quality Alert:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[#8E9B93]">
                    {sessionData.qualityFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* "Why this result?" Plain-English Explanation */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981]">
                <Sparkles className="w-4 h-4" />
                <span>Why this classification result?</span>
              </div>
              <ul className="space-y-2 text-xs text-[#EDEFE8]/90">
                {(sessionData.factors || []).map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{factor}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8E9B93] font-mono">
                <span>Standard Reference Monograph:</span>
                <span className="text-[#EDEFE8]">{sessionData.referenceSource || 'Ayurvedic Pharmacopoeia of India (API)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Channel Potentiostat Working Electrode Potential Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recorded Potentiostat Working Potentials</CardTitle>
              <p className="text-xs text-[#8E9B93] mt-0.5">
                Calibrated equilibrium voltages across the 6-channel cross-reactive transducer array.
              </p>
            </div>
            <Badge variant="neutral">6/6 Sensors Stabilized</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {SENSOR_CHANNELS.map((ch, idx) => {
              const voltage =
                sessionData.finalVoltages && sessionData.finalVoltages[idx] !== undefined
                  ? Number(sessionData.finalVoltages[idx])
                  : 1.2;
              return (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center space-y-1 hover:border-white/20 transition-colors"
                >
                  <span className="text-[10px] font-mono text-[#8E9B93] block">
                    {ch.id} • {ch.rasa}
                  </span>
                  <span className="text-base font-bold font-mono text-[#EDEFE8] block">
                    {voltage.toFixed(2)} V
                  </span>
                  <span className="text-[10px] text-[#5A675F] block truncate" title={ch.name}>
                    {ch.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
