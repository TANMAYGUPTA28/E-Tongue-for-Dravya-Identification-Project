/**
 * E-TONGUE PHYSICAL HARDWARE SERIAL BRIDGE
 * Connects physical ESP32 / Arduino USB COM port to MERN Express Backend
 *
 * Usage:
 *   node server/serial-bridge.js
 *   node server/serial-bridge.js --port COM3 --baud 115200
 */

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import http from 'http';

const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
}

const TARGET_PORT = getArg('--port', null);
const BAUD_RATE = parseInt(getArg('--baud', '115200'), 10);
const BACKEND_URL = 'http://localhost:5000/api/iot/telemetry';

console.log('=======================================================');
console.log('  E-TONGUE PHYSICAL HARDWARE SERIAL GATEWAY');
console.log('  ESP32 / Arduino -> Serial COM -> MERN Express Ingestion');
console.log('=======================================================');

// 1. Discover all connected serial ports
async function findSerialPorts() {
  try {
    const ports = await SerialPort.list();
    console.log(`\n[SCAN] Found ${ports.length} available serial port(s):`);
    ports.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.path} | Manufacturer: ${p.manufacturer || 'Generic'} | VendorId: ${p.vendorId || 'N/A'}`);
    });
    return ports;
  } catch (err) {
    console.error('[ERROR] Failed to list serial ports:', err.message);
    return [];
  }
}

// 2. Post telemetry to Express backend
function forwardToBackend(telemetryPayload) {
  const data = JSON.stringify(telemetryPayload);
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/iot/telemetry',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    // silently consume response
    res.on('data', () => {});
  });

  req.on('error', (e) => {
    console.error(`[FORWARD ERROR] Could not reach backend: ${e.message}`);
  });

  req.write(data);
  req.end();
}

// 3. Connect to the port
async function startBridge() {
  const ports = await findSerialPorts();

  let selectedPort = TARGET_PORT;
  if (!selectedPort) {
    if (ports.length === 0) {
      console.log('\n[ALERT] No physical USB device connected right now!');
      console.log('[INFO] Plug your ESP32 / Arduino into a USB port and run:');
      console.log('       node server/serial-bridge.js --port COM3\n');
      return;
    }
    // Auto-select first non-Bluetooth/standard USB port
    const candidate = ports.find((p) => p.manufacturer || p.vendorId) || ports[0];
    selectedPort = candidate.path;
    console.log(`\n[AUTO-SELECT] Selected port: ${selectedPort}`);
  }

  console.log(`\n[CONNECTING] Opening ${selectedPort} at ${BAUD_RATE} baud...`);

  const port = new SerialPort({
    path: selectedPort,
    baudRate: BAUD_RATE,
  }, (err) => {
    if (err) {
      console.error(`\n[CONNECTION FAILED] Could not open ${selectedPort}:`, err.message);
      console.log('\nTip: Make sure the Arduino IDE Serial Monitor is closed so the port is not busy.');
    }
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  port.on('open', () => {
    console.log(`[CONNECTED] Serial stream active on ${selectedPort}!`);
    console.log('[STATUS] Streaming live millivolt readings to Express Backend...\n');
  });

  parser.on('data', (line) => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    // Check if it's JSON
    if (cleanLine.startsWith('{') && cleanLine.endsWith('}')) {
      try {
        const payload = JSON.parse(cleanLine);
        forwardToBackend(payload);
        if (payload.voltages) {
          console.log(`[LIVE PACKET #${payload.packet || '?'}] Voltages: [${payload.voltages.map(v => v.toFixed(2)).join(', ')}] V | Temp: ${payload.tempC || 25}°C`);
        }
      } catch (e) {
        console.log(`[SERIAL RAW]: ${cleanLine}`);
      }
    } else {
      // CSV format fallback: "0.72,0.38,0.45,2.78,1.15,2.35"
      const parts = cleanLine.split(',').map((x) => parseFloat(x.trim())).filter((x) => !isNaN(x));
      if (parts.length === 6) {
        const payload = {
          deviceId: 'ESP32-S3-SERIAL',
          voltages: parts,
          tempC: 25.0,
        };
        forwardToBackend(payload);
        console.log(`[LIVE CSV] Voltages: [${parts.map(v => v.toFixed(2)).join(', ')}] V`);
      } else {
        console.log(`[SERIAL LOG]: ${cleanLine}`);
      }
    }
  });

  port.on('error', (err) => {
    console.error('[SERIAL ERROR]:', err.message);
  });

  port.on('close', () => {
    console.log('\n[DISCONNECTED] Serial port closed.');
  });
}

startBridge();
