#!/usr/bin/env node

/**
 * ESP32-S3 PHYSICAL DEVICE SIMULATOR (DRAVYA 6000)
 * Simulates 6-channel electrochemical potentiostat packet ingestion.
 *
 * Usage:
 *   node scripts/simulate-device.js [sampleId] [--good|--bad|--unstable|--disconnect]
 *
 * Examples:
 *   node scripts/simulate-device.js turmeric --good
 *   node scripts/simulate-device.js ashwagandha --bad
 *   node scripts/simulate-device.js haritaki --unstable
 *   node scripts/simulate-device.js guduchi --disconnect
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const SAMPLES = {
  turmeric: {
    good: [0.48, 0.52, 0.36, 2.45, 3.05, 1.55],
    bad: [0.45, 0.48, 3.10, 0.82, 0.95, 0.41], // Metanil Yellow dye spike on S3
  },
  ashwagandha: {
    good: [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
    bad: [1.85, 0.82, 1.65, 0.75, 0.45, 0.65], // Starch cut carbohydrate surge on S1
  },
  haritaki: {
    good: [0.92, 2.85, 0.42, 2.18, 0.88, 3.22],
    bad: [0.50, 1.10, 0.65, 1.05, 0.40, 1.20], // Spent bark extract
  },
  guduchi: {
    good: [0.32, 0.22, 0.28, 3.05, 0.98, 1.85],
    bad: [0.25, 0.20, 0.25, 1.15, 0.50, 0.90], // Depleted stem surrogate
  },
  amalaki: {
    good: [0.55, 3.05, 0.22, 1.35, 0.62, 3.00],
    bad: [0.50, 1.20, 0.40, 0.80, 0.40, 1.10], // Wood apple pulp cut
  },
  tulsi: {
    good: [0.42, 0.58, 0.32, 2.22, 2.75, 1.72],
    bad: [0.35, 0.45, 0.25, 1.20, 0.85, 0.95], // Exhausted leaf residue
  },
};

const args = process.argv.slice(2);
let sampleId = 'turmeric';
let mode = 'good';

for (const arg of args) {
  if (arg.startsWith('--')) {
    mode = arg.replace(/^--/, '').toLowerCase();
  } else if (SAMPLES[arg.toLowerCase()]) {
    sampleId = arg.toLowerCase();
  }
}

async function runSimulation() {
  console.log(`\n===============================================================`);
  console.log(`  [SIMULATOR] ESP32-S3 IoT Potentiostat Hardware Feed`);
  console.log(`  Target Sample: ${sampleId.toUpperCase()}`);
  console.log(`  Condition Mode: --${mode.toUpperCase()} (Simulation Mode)`);
  console.log(`===============================================================\n`);

  try {
    // 1. Send heartbeat
    await fetch(`${API_BASE}/device/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'ESP32-S3-SIMULATOR',
        metadata: { firmware: 'v2.4.1-potentiostat', sampleRate: '250 S/s' },
      }),
    });

    // 2. Start session
    console.log(`[1/3] Initiating test session for ${sampleId}...`);
    const sessionRes = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sampleId,
        deviceId: 'ESP32-S3-SIMULATOR',
        operator: 'Hardware Simulator Test Runner',
      }),
    });

    if (!sessionRes.ok) {
      const err = await sessionRes.json();
      throw new Error(err.error || 'Failed to start session');
    }

    const { session } = await sessionRes.json();
    console.log(`[2/3] Session Started: ${session.sessionId}`);
    console.log(`      Transmitting 15 real-time 6-channel SAR ADC packets...\n`);

    const sampleProfile = SAMPLES[sampleId] || SAMPLES.turmeric;
    let baseVoltages = sampleProfile.good;

    if (mode === 'bad') {
      baseVoltages = sampleProfile.bad;
    } else if (mode === 'disconnect') {
      baseVoltages = [0.005, 0.005, 0.005, 0.005, 0.005, 0.005];
    }

    const totalPackets = 15;
    for (let seq = 1; seq <= totalPackets; seq++) {
      let packetVoltages = [];

      if (mode === 'unstable') {
        // High random variance to trigger unstable reading
        packetVoltages = baseVoltages.map((v) => {
          const jitter = (Math.sin(seq * 3.7) * 0.45);
          return Math.max(0.01, parseFloat((v + jitter).toFixed(3)));
        });
      } else if (mode === 'disconnect') {
        packetVoltages = [0.002, 0.003, 0.001, 0.002, 0.004, 0.002];
      } else {
        // Minor realistic physical noise (±0.012V)
        packetVoltages = baseVoltages.map((v, i) => {
          const noise = Math.sin(seq + i) * 0.012;
          return parseFloat((v + noise).toFixed(3));
        });
      }

      const readingRes = await fetch(`${API_BASE}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'ESP32-S3-SIMULATOR',
          sessionId: session.sessionId,
          sampleId,
          seq,
          timestamp: Date.now(),
          voltages: packetVoltages,
          unit: 'V',
        }),
      });

      const readingData = await readingRes.json();
      const progress = readingData.progressPct || Math.round((seq / totalPackets) * 100);
      process.stdout.write(`\r  → Ingesting Packet [${seq}/${totalPackets}] Progress: ${progress}%  Readings: [${packetVoltages.join(', ')}]V`);

      await new Promise((r) => setTimeout(r, 120));
    }

    console.log(`\n\n[3/3] Finalizing chemometrics analysis on backend...`);
    const finalizeRes = await fetch(`${API_BASE}/sessions/${session.sessionId}/finalize`, {
      method: 'POST',
    });

    const finalizeData = await finalizeRes.json();
    const result = finalizeData.result || finalizeData;

    console.log(`\n---------------------------------------------------------------`);
    console.log(`  OFFICIAL ASSAY VERDICT: ${result.verdict?.toUpperCase() || 'UNKNOWN'}`);
    console.log(`  Quality Score:          ${result.qualityScore !== null ? result.qualityScore + '%' : 'N/A'}`);
    console.log(`  Status:                 ${result.status}`);
    console.log(`  Sample:                 ${result.sampleName}`);
    console.log(`  Batch ID:               ${result.batchNumber}`);
    if (result.qualityFlags && result.qualityFlags.length > 0) {
      console.log(`  Quality Flags:          ⚠️  ${result.qualityFlags.join(' | ')}`);
    }
    console.log(`  Primary Factors:`);
    (result.factors || result.reasons || []).forEach((f) => console.log(`    • ${f}`));
    console.log(`---------------------------------------------------------------`);
    console.log(`  Result URL: http://localhost:5173/result/${session.sessionId}\n`);

  } catch (err) {
    console.error(`\n[SIMULATOR ERROR]: ${err.message}`);
    process.exit(1);
  }
}

runSimulation();
