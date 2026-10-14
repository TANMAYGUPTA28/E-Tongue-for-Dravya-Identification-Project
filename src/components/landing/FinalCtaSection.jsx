import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function FinalCtaSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid laboratory or corporate email.');
      return;
    }

    setSubmitted(true);
    toast.success('Access Request Received. Analytical dossier sent to your inbox.');
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#B6F36A', '#3E7B4C', '#E0A03A'],
    });
  };

  return (
    <section className="relative py-24 sm:py-36 overflow-hidden">
      {/* Giant Background Glowing Gradient Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-r from-[#3E7B4C]/25 via-[#B6F36A]/15 to-[#E0A03A]/20 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A] backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>ENTERPRISE & RESEARCH DEPLOYMENT</span>
        </div>

        <div className="space-y-4">
          <h2 className="font-display-hero text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#EDEFE8]">
            Authenticate every <i>harvest</i>.
          </h2>
          <p className="text-sm sm:text-base text-[#8A968E] max-w-xl mx-auto font-sans leading-relaxed">
            Deploy automated potentiometric taste sensing in your QA pipeline. Integrate with existing LIMS and export cryptographic monographs.
          </p>
        </div>

        {/* Waitlist / Request Access Form */}
        <div className="max-w-md mx-auto">
          {submitted ? (
            <div className="p-4 rounded-2xl bg-[#3E7B4C]/25 border border-[#B6F36A]/40 text-[#B6F36A] font-mono text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B6F36A]" />
              <span>Priority Access Granted. Welcome to Dravya Pro.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter lab or institution email..."
                className="flex-1 px-4 py-3.5 rounded-full bg-white/[0.04] border border-white/15 text-sm text-[#EDEFE8] placeholder:text-[#8A968E] focus:outline-none focus:border-[#B6F36A] font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-[#B6F36A] hover:bg-[#cbfb88] text-[#07100B] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(182,243,106,0.35)] shrink-0"
              >
                <span>Request Kit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-[#8A968E]">
          <span>✓ ISO-17025 Ready</span>
          <span>✓ ESP32 Firmware Source</span>
          <span>✓ ISO-17025 Encrypted Cloud Ledger</span>
        </div>
      </div>
    </section>
  );
}
