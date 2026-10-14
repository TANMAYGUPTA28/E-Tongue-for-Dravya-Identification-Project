/**
 * API Client for DRAVYA 6000 Potentiostat & Chemometrics Backend
 * Connects React frontend directly to Express/Spring REST endpoints
 */

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/status`);
    if (!res.ok) throw new Error('Status failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'STANDALONE_EMBEDDED',
      instrument: 'DRAVYA 6000 Potentiostat Workstation',
      samplingRate: '250 S/s',
    };
  }
}

export async function fetchLiveTelemetry() {
  try {
    const res = await fetch(`${API_BASE_URL}/sensors/live`);
    if (!res.ok) throw new Error('Live telemetry failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function classifyDravya(payload = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Classification failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function switchSpecimen(sampleId) {
  try {
    const res = await fetch(`${API_BASE_URL}/sample/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId }),
    });
    if (!res.ok) throw new Error('Switch sample failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function tareZeroBaseline() {
  try {
    const res = await fetch(`${API_BASE_URL}/calibrate/tare`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Tare failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchAuditHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/history`);
    if (!res.ok) throw new Error('History failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchModelMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/model/metrics`);
    if (!res.ok) throw new Error('Metrics failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}
