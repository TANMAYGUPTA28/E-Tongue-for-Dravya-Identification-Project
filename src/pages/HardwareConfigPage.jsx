import { useState } from 'react';
import { Cpu, Zap, Wifi, RefreshCw, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HardwareConfigPage() {
  const [config, setConfig] = useState({
    port: 'COM5',
    baudRate: '115200',
    dataBits: '8',
    parity: 'None',
    stopBits: '1',
    adcSampRate: '250 Hz',
    adcResolution: '12-Bit SAR (0-4095)',
    bufferSize: '1024 Bytes',
    autoReconnect: true,
  });

  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTED_STABLE');

  const handleTestHandshake = () => {
    setIsTesting(true);
    toast.loading('Sending UART ping to ESP32-S3 AFE...', { id: 'com' });
    setTimeout(() => {
      setIsTesting(false);
      setConnectionStatus('CONNECTED_STABLE');
      toast.success('UART Handshake Acknowledged: ESP32-S3 Firmware v3.1.8', { id: 'com' });
    }, 700);
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Hardware COM Port Parameters Saved');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              HARDWARE GATEWAY
            </span>
            <span className="text-xs font-mono text-zinc-400">ESP32-S3 Serial Potentiostat Driver</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Microcontroller & Serial Port Configuration
          </h1>
        </div>

        <button
          onClick={handleTestHandshake}
          disabled={isTesting}
          className="px-4 py-2 rounded bg-surface hover:bg-surface-hover border border-border text-zinc-200 font-mono text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'PINGING...' : 'TEST SERIAL HANDSHAKE'}</span>
        </button>
      </div>

      {/* Connection Indicator Card */}
      <div className="figma-card p-4 flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">ESP32-S3 Dual-Core Xtensa LX7</span>
            <span className="text-zinc-500 text-[10px]">Active Port: {config.port} • Baud: {config.baudRate} 8-N-1</span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SERIAL BUS ONLINE</span>
        </span>
      </div>

      {/* Parameter Settings Form */}
      <form onSubmit={handleSave} className="figma-card p-5 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-semibold text-white font-sans">
          UART Serial & Analog-to-Digital Converter (ADC) Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-zinc-400 block mb-1">Target Serial Port</label>
            <select
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="COM3">COM3 (USB-to-UART Bridge)</option>
              <option value="COM5">COM5 (ESP32-S3 Native USB)</option>
              <option value="COM7">COM7 (Virtual Serial Loopback)</option>
              <option value="/dev/ttyUSB0">/dev/ttyUSB0 (Linux / Mac)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Baud Rate (bps)</label>
            <select
              value={config.baudRate}
              onChange={(e) => setConfig({ ...config, baudRate: e.target.value })}
              className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="9600">9600 bps</option>
              <option value="115200">115200 bps (Recommended)</option>
              <option value="230400">230400 bps</option>
              <option value="921600">921600 bps (High-Speed DMA)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">ADC Acquisition Frequency</label>
            <select
              value={config.adcSampRate}
              onChange={(e) => setConfig({ ...config, adcSampRate: e.target.value })}
              className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="100 Hz">100 S/s (Slow Transient)</option>
              <option value="250 Hz">250 S/s (Optimal Standard)</option>
              <option value="500 Hz">500 S/s (Fast Transient)</option>
              <option value="1000 Hz">1000 S/s (Oversampling)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">ADC Bit Resolution</label>
            <select
              value={config.adcResolution}
              onChange={(e) => setConfig({ ...config, adcResolution: e.target.value })}
              className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="10-Bit (0-1023)">10-Bit (1024 LSB)</option>
              <option value="12-Bit SAR (0-4095)">12-Bit SAR (4096 LSB)</option>
              <option value="16-Bit ADS1115">16-Bit External I2C ADC</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Circular FIFO Buffer Size</label>
            <select
              value={config.bufferSize}
              onChange={(e) => setConfig({ ...config, bufferSize: e.target.value })}
              className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="512 Bytes">512 Bytes</option>
              <option value="1024 Bytes">1024 Bytes (Standard)</option>
              <option value="4096 Bytes">4096 Bytes</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-colors"
            >
              SAVE DRIVER CONFIG
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
