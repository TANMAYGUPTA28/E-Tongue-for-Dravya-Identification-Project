import { useState } from 'react';
import HeroSection from '../components/landing/HeroSection';
import StatsStrip from '../components/landing/StatsStrip';
import HowItWorksScrollStory from '../components/landing/HowItWorksScrollStory';
import BentoFeatures from '../components/landing/BentoFeatures';
import InteractiveDemoPanel from '../components/landing/InteractiveDemoPanel';
import ArchitectureTechSection from '../components/landing/ArchitectureTechSection';
import DravyaShowcaseGallery from '../components/landing/DravyaShowcaseGallery';
import ModelInsightsTeaser from '../components/landing/ModelInsightsTeaser';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FaqSection from '../components/landing/FaqSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="relative w-full min-h-screen bg-[#07100B] text-[#EDEFE8] overflow-hidden selection:bg-[#3E7B4C]/40 selection:text-[#B6F36A]">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. TRUST / STATS STRIP */}
      <StatsStrip />

      {/* 3. SCROLL-STORY: HOW IT WORKS */}
      <HowItWorksScrollStory />

      {/* 4. ASYMMETRIC BENTO GRID FEATURES */}
      <BentoFeatures />

      {/* 5. INTERACTIVE TRY-IT DEMO PANEL */}
      <InteractiveDemoPanel />

      {/* 6. ARCHITECTURE & TECH TOPOLOGY */}
      <ArchitectureTechSection />

      {/* 7. DRAVYA SHOWCASE GALLERY */}
      <DravyaShowcaseGallery />

      {/* 8. MODEL INSIGHTS & CONFUSION MATRIX */}
      <ModelInsightsTeaser />

      {/* 9. TESTIMONIALS & USE-CASES */}
      <TestimonialsSection />

      {/* 10. SCIENTIFIC FAQ */}
      <FaqSection />

      {/* 11. FINAL HIGH-CONVERSION CTA */}
      <FinalCtaSection />

      {/* 12. PARALLAX WORDMARK FOOTER */}
      <LandingFooter />
    </div>
  );
}
