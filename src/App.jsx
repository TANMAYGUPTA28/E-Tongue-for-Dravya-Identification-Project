import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import IslandNavbar from './components/ui/IslandNavbar';
import SmoothScrollProvider from './components/ui/SmoothScrollProvider';
import CustomCursor from './components/ui/CustomCursor';
import Preloader from './components/ui/Preloader';

// Core Analytical Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AiAgentPage from './pages/AiAgentPage';
import NewAnalysisWizardPage from './pages/NewAnalysisWizardPage';
import LiveSensorsPage from './pages/LiveSensorsPage';
import ResultRadarPage from './pages/ResultRadarPage';
import SampleHistoryPage from './pages/SampleHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModelInsightsPage from './pages/ModelInsightsPage';
import SystemStatusPage from './pages/SystemStatusPage';
import AboutPage from './pages/AboutPage';
import SpecimenRegistryPage from './pages/SpecimenRegistryPage';
import SpatialWorkstationPage from './pages/SpatialWorkstationPage';
import ApiConsolePage from './pages/ApiConsolePage';
import CalibrationPage from './pages/CalibrationPage';
import FeatureImportancePage from './pages/FeatureImportancePage';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';
  const isSpatialPage = location.pathname === '/3d' || location.pathname === '/spatial';

  // Global Keyboard Listener for Cmd+K and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Full-viewport 3D Scrollytelling Experience
  if (isSpatialPage) {
    return (
      <SmoothScrollProvider>
        <div className="w-full h-screen overflow-hidden bg-[#07100B]">
          <CustomCursor />
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
          <SpatialWorkstationPage />
        </div>
      </SmoothScrollProvider>
    );
  }

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#07100B] text-[#EDEFE8] font-sans selection:bg-[#3E7B4C]/40 selection:text-[#B6F36A] relative overflow-x-hidden">
        {/* Subtle Film Grain Overlay & Aurora Glow */}
        <div className="grain-overlay pointer-events-none" />
        <div className="aurora-bg pointer-events-none" />

        {/* Custom Interactive Cursor */}
        <CustomCursor />

        {/* Initial Session Preloader */}
        <Preloader />

        {/* Global Command Palette (Cmd+K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {/* Floating Island Navbar (Shown on Marketing Landing Page) */}
        {location.pathname === '/' && (
          <IslandNavbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
        )}

        {/* Main Application Router */}
        {isPublicPage ? (
          <main className="w-full relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<LoginPage />} />
              <Route path="/3d" element={<SpatialWorkstationPage />} />
              <Route path="/spatial" element={<SpatialWorkstationPage />} />
            </Routes>
          </main>
        ) : (
          <div className="flex h-screen overflow-hidden relative z-10">
            {/* Left Analytical Sidebar */}
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />

            {/* Main Viewport */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#07100B]/90 backdrop-blur-md">
              <TopNavbar
                onMenuClick={() => setSidebarOpen(true)}
                onOpenCommandPalette={() => setCommandPaletteOpen(true)}
              />

              <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
                <div key={location.pathname} className="animate-view-fade">
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={<DashboardPage onOpenCommandPalette={() => setCommandPaletteOpen(true)} />}
                    />
                    <Route path="/3d" element={<SpatialWorkstationPage />} />
                    <Route path="/spatial" element={<SpatialWorkstationPage />} />
                    <Route path="/agent" element={<AiAgentPage />} />
                    <Route path="/ai-agent" element={<AiAgentPage />} />
                    <Route path="/new-analysis" element={<NewAnalysisWizardPage />} />
                    <Route path="/live-sensors" element={<LiveSensorsPage />} />
                    <Route path="/results" element={<ResultRadarPage />} />
                    <Route path="/history" element={<SampleHistoryPage />} />
                    <Route path="/registry" element={<SpecimenRegistryPage />} />
                    <Route path="/specimens" element={<SpecimenRegistryPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/model-insights" element={<ModelInsightsPage />} />
                    <Route path="/system-status" element={<SystemStatusPage />} />
                    <Route path="/calibration" element={<CalibrationPage />} />
                    <Route path="/api-console" element={<ApiConsolePage />} />
                    <Route path="/feature-importance" element={<FeatureImportancePage />} />
                    <Route path="/about" element={<AboutPage />} />

                    {/* Fallback & Aliases */}
                    <Route path="/sensors" element={<Navigate to="/live-sensors" replace />} />
                    <Route path="/model" element={<Navigate to="/model-insights" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        )}
      </div>
    </SmoothScrollProvider>
  );
}
