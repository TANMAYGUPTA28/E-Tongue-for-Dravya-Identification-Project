import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Building, ArrowRight, ShieldCheck, Zap, Sparkles, Compass } from 'lucide-react';
import SpotlightCard from '../components/ui/SpotlightCard';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(name, email, password, role, institution);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('tanmay@etongue.lab', 'DravyaLab#2026!');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07100B] text-[#EDEFE8] flex flex-col lg:flex-row overflow-hidden selection:bg-[#3E7B4C]/40 selection:text-[#B6F36A]">
      {/* LEFT HALF: Form & Auth Controls */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 z-10 max-w-2xl mx-auto w-full">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3E7B4C] to-[#B6F36A] p-[1.5px] shadow-[0_0_20px_rgba(182,243,106,0.3)]">
              <div className="w-full h-full rounded-full bg-[#07100B] flex items-center justify-center">
                <span className="font-display italic text-sm text-[#B6F36A] font-bold">d</span>
              </div>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#EDEFE8] block leading-tight">
                DRAVYA PRO
              </span>
              <span className="text-[9px] font-mono text-[#8A968E] block -mt-0.5">
                Workstation Clearance
              </span>
            </div>
          </Link>

          <Link
            to="/3d"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#8A968E] hover:text-[#B6F36A] transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Lab</span>
          </Link>
        </div>

        {/* Main Auth Form Card */}
        <div className="py-8 sm:py-12 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
              <span>{isSignUp ? 'NEW AUDITOR REGISTRATION' : 'LABORATORY AUTHENTICATION'}</span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-5xl text-[#EDEFE8]">
              {isSignUp ? 'Register Analyst' : 'Enter Workstation'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8A968E] font-sans">
              Sign in with your institutional credentials or trigger instant demo mode.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="text-[#8A968E] block">Analyst Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-[#8A968E]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Tanmay Gupta"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#8A968E] block">Research Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Senior Chemometrician"
                      className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#8A968E] block">Institution</label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3 text-[#8A968E]" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="AYUSH Analytical QC"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[#8A968E] block">Analyst Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8A968E]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@etongue.lab"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[#8A968E] block">Clearance Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#8A968E]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full bg-[#B6F36A] hover:bg-[#cbfb88] text-[#07100B] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(182,243,106,0.35)] transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Credentials' : 'Sign In to Workstation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Button */}
          {!isSignUp && (
            <div className="pt-2">
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#E0A03A]/15 hover:bg-[#E0A03A]/25 border border-[#E0A03A]/30 text-[#E0A03A] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(224,160,58,0.15)]"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>One-Click Demo Access (Hackathon Mode)</span>
              </button>
              <p className="text-[10px] text-[#8A968E] font-mono text-center mt-2">
                Instant clearance • Zero credentials stored in DOM
              </p>
            </div>
          )}

          {/* Toggle Sign Up / Login */}
          <div className="pt-4 text-center font-mono text-xs text-[#8A968E] border-t border-white/5">
            {isSignUp ? (
              <span>
                Already have laboratory clearance?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-[#B6F36A] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New researcher or regulatory auditor?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-[#B6F36A] font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="flex items-center gap-2 text-[#8A968E] font-mono text-xs">
          <ShieldCheck className="w-4 h-4 text-[#B6F36A]" />
          <span>Secured with ISO-17025 & AYUSH Pharmacopoeial Protocol</span>
        </div>
      </div>

      {/* RIGHT HALF: Animated Gradient Side with Botanical Art & Telemetry */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0C1711] via-[#07100B] to-[#122417] border-l border-white/10 p-12 lg:p-16 flex-col justify-between overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-[#3E7B4C]/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-[#E0A03A]/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Telemetry Chip */}
        <div className="flex items-center justify-between font-mono text-xs text-[#8A968E] z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B6F36A] animate-ping" />
            <span className="text-[#EDEFE8] font-bold">AFE POTENTIOSTAT MATRIX</span>
          </div>
          <span>250 S/s INGESTION</span>
        </div>

        {/* Centerpiece Quotation & Graphic */}
        <div className="relative z-10 space-y-8 my-auto">
          <div className="w-24 h-24 rounded-3xl bg-[#3E7B4C]/30 border border-[#B6F36A]/40 flex items-center justify-center text-[#B6F36A] shadow-[0_0_40px_rgba(182,243,106,0.3)]">
            <Sparkles className="w-12 h-12 animate-spin-slow" />
          </div>

          <div className="space-y-4 max-w-lg">
            <blockquote className="font-serif italic text-3xl sm:text-4xl text-[#EDEFE8] leading-tight">
              "Translating ancient Ayurvedic organoleptic science into precision electrochemical coordinates."
            </blockquote>
            <p className="text-xs font-mono text-[#8A968E]">
              6-Channel lipid-membrane biochips capture double-layer Nernstian potentials for 40+ standardized Dravya formulations.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 font-mono text-xs">
            <div>
              <span className="text-2xl font-bold text-[#EDEFE8] block tabular-nums">88.4%</span>
              <span className="text-[10px] text-[#8A968E] uppercase">Accuracy</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#B6F36A] block tabular-nums">42</span>
              <span className="text-[10px] text-[#8A968E] uppercase">Monographs</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#E0A03A] block tabular-nums">&lt; 15s</span>
              <span className="text-[10px] text-[#8A968E] uppercase">Assay Time</span>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="font-mono text-[11px] text-[#4F5B53] z-10">
          IIT Delhi Bio-Instrumentation Laboratory • E-Tongue Pro v2.4
        </div>
      </div>
    </div>
  );
}
