import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Command,
  Sun,
  Moon,
  Languages,
  ArrowRight,
  FlaskConical,
  Activity,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function IslandNavbar({ onOpenCommandPalette }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [language, setLanguage] = useState('EN'); // 'EN' | 'HI'
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return next;
    });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'EN' ? 'HI' : 'EN'));
  };

  const navLinks = [
    { label: language === 'HI' ? 'अवलोकन' : 'Overview', href: '#hero' },
    { label: language === 'HI' ? 'कार्यविधि' : 'How it works', href: '#how-it-works' },
    { label: language === 'HI' ? 'विशेषताएं' : 'Features', href: '#features' },
    { label: language === 'HI' ? 'परीक्षण' : 'Interactive Demo', href: '#demo' },
    { label: language === 'HI' ? 'द्रव्य' : 'Dravya Library', href: '#library' },
    { label: language === 'HI' ? 'सामान्य प्रश्न' : 'FAQ', href: '#faq' },
  ];

  return (
    <>
      {/* Sticky Floating Island Container */}
      <header className="fixed top-4 sm:top-6 inset-x-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <motion.div
          layout
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 rounded-full border border-white/10 backdrop-blur-2xl transition-all duration-300 ${
            scrolled
              ? 'py-2 px-3 sm:px-5 bg-[#07100B]/85 shadow-[0_16px_40px_rgba(0,0,0,0.6)] border-white/15 scale-95 sm:scale-100'
              : 'py-2.5 px-4 sm:px-6 bg-[#07100B]/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)]'
          }`}
        >
          {/* Brand Logo & Tag */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3E7B4C] to-[#B6F36A] p-[1.5px] shadow-[0_0_20px_rgba(182,243,106,0.3)]">
              <div className="w-full h-full rounded-full bg-[#07100B] flex items-center justify-center">
                <span className="font-display italic text-sm text-[#B6F36A] font-bold">d</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xs tracking-tight text-[#EDEFE8] block leading-tight group-hover:text-[#B6F36A] transition-colors">
                DRAVYA PRO
              </span>
              <span className="text-[9px] font-mono text-[#8A968E] block -mt-0.5">
                E-Tongue AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-full text-[#8A968E] hover:text-[#EDEFE8] hover:bg-white/[0.04] transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              title="Command Palette (Cmd+K)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-[#8A968E] hover:text-[#EDEFE8] transition-colors cursor-pointer"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px] bg-white/[0.06] px-1 py-0.5 rounded border border-white/10">⌘K</span>
            </button>

            {/* Language Toggle (EN / हिन्दी) */}
            <button
              onClick={toggleLanguage}
              title="Toggle Language"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-[#8A968E] hover:text-[#B6F36A] transition-colors cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{language}</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#8A968E] hover:text-[#E0A03A] transition-colors cursor-pointer"
            >
              {isLightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Live Oscilloscope Shortcut */}
            <Link
              to="/live-sensors"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3E7B4C]/20 hover:bg-[#3E7B4C]/35 border border-[#3E7B4C]/40 text-[#B6F36A] text-xs font-mono font-medium transition-all shadow-[0_0_15px_rgba(182,243,106,0.15)]"
            >
              <Activity className="w-3.5 h-3.5 text-[#B6F36A]" />
              <span>Sensors</span>
            </Link>

            {/* Launch App / Dashboard CTA */}
            <Link
              to="/dashboard"
              className="group relative px-4 py-1.5 rounded-full bg-[#EDEFE8] hover:bg-[#FFFFFF] text-[#07100B] font-bold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(182,243,106,0.35)] transition-all duration-300"
            >
              <span>{language === 'HI' ? 'डैशबोर्ड' : 'Launch App'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-white/[0.05] border border-white/10 text-[#EDEFE8]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-50 p-6 rounded-3xl bg-[#07100B]/95 backdrop-blur-2xl border border-white/10 shadow-2xl lg:hidden flex flex-col gap-4 font-mono text-sm"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-xl text-[#EDEFE8] hover:bg-white/[0.05] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/live-sensors"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-[#3E7B4C]/20 border border-[#3E7B4C]/40 text-[#B6F36A] flex items-center justify-between"
              >
                <span>Live Oscilloscope</span>
                <Activity className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-[#EDEFE8] text-[#07100B] font-bold text-center"
              >
                Launch Analytical App
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
