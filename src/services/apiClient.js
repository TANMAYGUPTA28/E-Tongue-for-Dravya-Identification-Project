/**
 * API Client for DRAVYA 6000 Potentiostat & Chemometrics Backend
 * Uses environment variable with seamless proxy fallback
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Human-friendly error mapper that translates technical stack traces,
 * HTTP codes, and network errors into clean non-technical guidance.
 */
export function mapErrorMessage(error, defaultMsg = 'Unable to complete request. Please try again.') {
  if (!error) return defaultMsg;
  const msg = typeof error === 'string' ? error : error.message || '';
  
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
    return 'Workstation service is temporarily unreachable. Please ensure the laboratory server is running.';
  }
  if (msg.includes('401') || msg.includes('credentials') || msg.includes('password')) {
    return 'Invalid email or password. Please verify your laboratory credentials.';
  }
  if (msg.includes('403') || msg.includes('Forbidden') || msg.includes('Unauthorized')) {
    return 'Session expired or insufficient clearance. Please sign in again.';
  }
  if (msg.includes('Restricted domain') || msg.includes('domain')) {
    return 'Only authorized institutional (.edu, .ac.in), Gmail, or Yahoo accounts are permitted.';
  }
  if (msg.includes('OTP') || msg.includes('code') || msg.includes('expired')) {
    return msg;
  }
  return defaultMsg;
}

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
