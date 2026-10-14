import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Chemometrician');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const otpInputRefs = useRef([]);
  const { login, signup, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Real-time domain verification helper
  const checkEmailDomain = (val) => {
    if (!val || !val.includes('@')) return null;
    const parts = val.toLowerCase().trim().split('@');
    if (parts.length < 2 || !parts[1]) return null;
    const domain = parts[1];

    const disposable = ['tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com'];
    if (disposable.includes(domain)) {
      return { valid: false, message: 'Disposable & fake email domains are prohibited', type: 'error' };
    }

    if (domain === 'gmail.com') {
      return { valid: true, message: 'Authorized: Google Workspace / Gmail', type: 'success', tag: 'Gmail Verified' };
    }
    if (domain === 'yahoo.com' || domain === 'yahoo.in' || domain === 'yahoo.co.in') {
      return { valid: true, message: 'Authorized: Yahoo Mail Credential', type: 'success', tag: 'Yahoo Verified' };
    }
    if (domain.endsWith('.edu') || domain.endsWith('.edu.in') || domain.endsWith('.ac.in')) {
      return { valid: true, message: 'Authorized: Institutional Academic Domain', type: 'success', tag: 'Academic Clear' };
    }
    if (domain === 'etongue.lab') {
      return { valid: true, message: 'Internal Laboratory Access Protocol', type: 'success', tag: 'Lab Admin' };
    }

    return {
      valid: false,
      message: 'Restricted domain: Only @gmail.com, @yahoo.com, or .edu/.ac.in allowed',
      type: 'warning',
    };
  };

  const domainCheck = checkEmailDomain(email);

  // Send OTP handler
  const handleRequestOtp = async () => {
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please enter your analyst email first.');
      toast.error('Email required');
      return;
    }
    if (domainCheck && !domainCheck.valid) {
      setErrorMessage(domainCheck.message);
      toast.error(domainCheck.message);
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(email);
      setOtpSent(true);
      setCooldown(30);
      setDevOtpHint(res.devOtp || '');
      toast.success(`Verification code dispatched to ${email}`);
      // Focus first OTP cell
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP cell input handling
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpValues];
    updated[index] = digit;
    setOtpValues(updated);

    // Auto advance to next box
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const updated = [...otpValues];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtpValues(updated);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // Form submit (Sign In / Register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (domainCheck && !domainCheck.valid) {
      setErrorMessage(domainCheck.message);
      toast.error(domainCheck.message);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const fullOtp = otpValues.join('');
        if (fullOtp.length !== 6) {
          throw new Error('Please enter all 6 digits of the laboratory clearance OTP.');
        }
        await signup(name, email, password, role, institution, fullOtp);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // One-click demo login
  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await login('tanmay@etongue.lab', 'DravyaLab#2026!');
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
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
                DRAVYA 6000 PRO
              </span>
              <span className="text-[9px] font-mono text-[#8A968E] block -mt-0.5">
                Workstation Clearance Gateway
              </span>
            </div>
          </Link>

          <Link
            to="/3d"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#8A968E] hover:text-[#B6F36A] transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Biochip</span>
          </Link>
        </div>

        {/* Main Auth Form Container */}
        <div className="py-6 sm:py-10 space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A] animate-pulse" />
              <span>{isSignUp ? 'TWO-FACTOR ANALYST REGISTRATION' : 'LABORATORY CLEARANCE AUTHENTICATION'}</span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-5xl text-[#EDEFE8]">
              {isSignUp ? 'Create Clearance' : 'Enter Workstation'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8A968E] font-sans">
              Restricted to verified institutional accounts (<span className="text-[#B6F36A] font-mono">.edu / .ac.in</span>), Gmail, or Yahoo credentials.
            </p>
          </div>

          {/* Verification Code Notice */}
          {otpSent && (
            <div className="p-3.5 rounded-2xl bg-[#B6F36A]/10 border border-[#B6F36A]/30 text-[#B6F36A] text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                <span>Verification code dispatched to your inbox. Please enter the 6 digits below.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="text-[#8A968E] block">Lead Analyst Name</label>
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
                      placeholder="Lead Chemometrician"
                      className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#8A968E] block">Institution / Lab</label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3 text-[#8A968E]" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="AYUSH Analytical QC Division"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email Input with Real-time Domain Validation Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[#8A968E] block">Laboratory Email</label>
                {domainCheck && (
                  <span
                    className={`text-[10px] flex items-center gap-1 font-mono ${
                      domainCheck.valid ? 'text-[#B6F36A]' : 'text-red-400'
                    }`}
                  >
                    {domainCheck.valid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{domainCheck.tag}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Invalid Domain</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8A968E]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@gmail.com, lab@iitd.ac.in, or user@mit.edu"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none transition-colors ${
                    domainCheck && !domainCheck.valid
                      ? 'border-red-500/50 focus:border-red-500'
                      : domainCheck && domainCheck.valid
                      ? 'border-[#B6F36A]/40 focus:border-[#B6F36A]'
                      : 'border-white/10 focus:border-[#B6F36A]'
                  }`}
                />
              </div>
              {domainCheck && !domainCheck.valid && (
                <p className="text-[10px] text-red-400/90 font-mono mt-1">
                  ⚠️ {domainCheck.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[#8A968E] block">Laboratory Password</label>
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

            {/* 6-DIGIT OTP VERIFICATION SECTION (SIGNUP MODE) */}
            {isSignUp && (
              <div className="pt-2 space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#EDEFE8] font-bold">
                    <KeyRound className="w-3.5 h-3.5 text-[#B6F36A]" />
                    <span>6-Digit Security OTP</span>
                  </div>
                  <button
                    type="button"
                    disabled={loading || cooldown > 0 || (domainCheck && !domainCheck.valid)}
                    onClick={handleRequestOtp}
                    className="text-[11px] font-mono text-[#B6F36A] hover:underline disabled:text-[#4F5B53] disabled:no-underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>{cooldown > 0 ? `Resend (${cooldown}s)` : otpSent ? 'Resend OTP' : 'Send Code'}</span>
                  </button>
                </div>

                {/* 6 Digit Cells */}
                <div className="flex items-center justify-between gap-2 on-paste" onPaste={handleOtpPaste}>
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      placeholder="•"
                      className="w-10 sm:w-12 h-12 text-center text-lg font-bold rounded-xl bg-white/[0.04] border border-white/15 text-[#B6F36A] focus:outline-none focus:border-[#B6F36A] focus:ring-1 focus:ring-[#B6F36A]/50 transition-all"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-[#8A968E]">
                  Enter the one-time clearance token dispatched to your institutional inbox.
                </p>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading || (domainCheck && !domainCheck.valid)}
              className="w-full mt-2 py-3.5 rounded-full bg-[#B6F36A] hover:bg-[#cbfb88] disabled:bg-[#3E7B4C]/40 disabled:text-[#8A968E] text-[#07100B] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(182,243,106,0.35)] transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : isSignUp ? 'Verify Code & Create Clearance' : 'Sign In to Workstation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Button */}
          {!isSignUp && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#E0A03A]/15 hover:bg-[#E0A03A]/25 border border-[#E0A03A]/30 text-[#E0A03A] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(224,160,58,0.15)]"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Laboratory Demo Access (Preset Analyst)</span>
              </button>
              <p className="text-[10px] text-[#8A968E] font-mono text-center mt-2">
                Pre-configured laboratory analyst profile for testing and evaluation.
              </p>
            </div>
          )}

          {/* Toggle Sign Up / Login */}
          <div className="pt-3 text-center font-mono text-xs text-[#8A968E] border-t border-white/5">
            {isSignUp ? (
              <span>
                Already have laboratory clearance?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage('');
                  }}
                  className="text-[#B6F36A] font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New researcher or regulatory auditor?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage('');
                  }}
                  className="text-[#B6F36A] font-bold hover:underline cursor-pointer ml-1"
                >
                  Register Analyst
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="flex items-center gap-2 text-[#8A968E] font-mono text-xs">
          <ShieldCheck className="w-4 h-4 text-[#B6F36A]" />
          <span>Compliant with ISO-17025 Standards & Institutional Access Controls</span>
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
            <span className="text-[#EDEFE8] font-bold">ELECTROCHEMICAL SENSOR ARRAY</span>
          </div>
          <span>REAL-TIME STREAMING</span>
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
              6-Channel cross-reactive lipid membrane biochips capture double-layer Nernstian potentials for 40+ standardized Dravya formulations.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 font-mono text-xs">
            <div>
              <span className="text-2xl font-bold text-[#EDEFE8] block tabular-nums">Evaluated</span>
              <span className="text-[10px] text-[#8A968E] uppercase">Cross-Validated</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#B6F36A] block tabular-nums">2-Factor</span>
              <span className="text-[10px] text-[#8A968E] uppercase">Verification</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#E0A03A] block tabular-nums">&lt; 15s</span>
              <span className="text-[10px] text-[#8A968E] uppercase">Assay Time</span>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="font-mono text-[11px] text-[#4F5B53] z-10 flex items-center justify-between">
          <span>Biomimetic Olfactory & Gustatory AI Lab</span>
          <span>Dravya 6000 Workstation</span>
        </div>
      </div>
    </div>
  );
}
