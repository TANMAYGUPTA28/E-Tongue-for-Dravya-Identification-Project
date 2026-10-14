import { STATS, SENSOR_STREAM_DEFAULT, DRAVYA_LIBRARY, CONFUSION_MATRIX, FEATURE_IMPORTANCE, TESTIMONIALS, FAQ_ITEMS } from './mockData';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to check if backend is reachable
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

// Ingest / Analyze Sample Simulation
export async function runAnalysisSample(dravyaId) {
  // If backend available, try it; otherwise fallback to rich mock simulation
  try {
    const res = await fetch(`${BACKEND_URL}/iot/demo-feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specimenKey: dravyaId }),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, ...data };
    }
  } catch {
    // fallback to mock
  }

  // Realistic mock delay
  await new Promise((r) => setTimeout(r, 600));
  const specimen = DRAVYA_LIBRARY.find((d) => d.id === dravyaId) || DRAVYA_LIBRARY[0];
  return {
    success: true,
    specimen,
    confidence: specimen.purityRating,
    top3: [
      { name: specimen.english, confidence: specimen.purityRating },
      { name: 'Terminalia bellirica', confidence: 5.4 },
      { name: 'Phyllanthus niruri', confidence: 2.1 },
    ],
    timestamp: new Date().toISOString(),
    sha256: '8f4b2a9e7123c5d809' + Math.floor(Math.random() * 1000000).toString(16),
  };
}

export {
  STATS,
  SENSOR_STREAM_DEFAULT,
  DRAVYA_LIBRARY,
  CONFUSION_MATRIX,
  FEATURE_IMPORTANCE,
  TESTIMONIALS,
  FAQ_ITEMS,
};
