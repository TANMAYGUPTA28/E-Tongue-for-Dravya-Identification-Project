import { useState } from 'react';
import { Server, Play, CheckCircle2, Copy, Send, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ENDPOINTS = [
  {
    id: 'health',
    method: 'GET',
    path: '/actuator/health',
    desc: 'Spring Boot Actuator Service Health Probe',
    sampleResponse: {
      status: 'UP',
      components: {
        potentiostatHardware: { status: 'UP', details: { port: 'COM5', baud: 115200 } },
        randomForestEngine: { status: 'UP', details: { trees: 20, oobAccuracy: 98.4 } },
        shadRasaElectrodeArray: { status: 'UP', details: { activeChannels: 6 } },
      },
    },
  },
  {
    id: 'sensors',
    method: 'GET',
    path: '/api/v1/sensors/live',
    desc: 'Retrieve Real-time 6-Channel Shad-Rasa Transient Voltages',
    sampleResponse: {
      timestamp: Date.now(),
      sampleRateHz: 250,
      voltages: {
        s1_madhura: 0.82,
        s2_amla: 0.41,
        s3_lavana: 0.58,
        s4_tikta: 3.79,
        s5_katu: 1.22,
        s6_kashaya: 3.24,
      },
      status: 'CALIBRATED',
    },
  },
  {
    id: 'classify',
    method: 'POST',
    path: '/api/v1/dravya/classify',
    desc: 'Execute Random Forest Botanical Classification on 6-Electrode Vector',
    requestBody: {
      voltages: [0.8, 0.4, 0.6, 3.8, 1.2, 3.2],
      temperatureC: 24.5,
      batchId: 'BATCH-ASH-409',
    },
    sampleResponse: {
      dravya: 'Pure Ashwagandha Root',
      botanicalName: 'Withania somnifera',
      status: 'AUTHENTIC',
      confidence: 98.6,
      doshaKarma: 'Vata-Kapha Shamaka',
      shadRasaScores: {
        madhura: 16,
        amla: 9,
        lavana: 14,
        tikta: 80,
        katu: 28,
        kashaya: 68,
      },
      executionLatencyMs: 2.1,
    },
  },
];

export default function ApiConsolePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [activeResponse, setActiveResponse] = useState(ENDPOINTS[0].sampleResponse);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestCall = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveResponse(selectedEndpoint.sampleResponse);
      setIsLoading(false);
      toast.success(`HTTP 200 OK • Response Received`);
    }, 250);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeResponse, null, 2));
    toast.success('JSON Copied to Clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              SPRING BOOT MICROSERVICE
            </span>
            <span className="text-xs font-mono text-zinc-400">OpenAPI 3.0 / REST Controller</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Enterprise API & Telemetry Endpoints
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-surface px-3 py-1.5 rounded-xl border border-border">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>MICROSERVICE: HEALTHY (UP)</span>
        </div>
      </div>

      {/* Endpoints Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        {ENDPOINTS.map((ep) => (
          <button
            key={ep.id}
            onClick={() => {
              setSelectedEndpoint(ep);
              setActiveResponse(ep.sampleResponse);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedEndpoint.id === ep.id
                ? 'bg-surface border-emerald-500/50 text-white shadow-sm'
                : 'bg-surface-subtle border-border text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  ep.method === 'GET'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {ep.method}
              </span>
              <span className="font-semibold text-zinc-200 text-xs truncate">{ep.path}</span>
            </div>
            <p className="text-[10px] text-zinc-500 truncate">{ep.desc}</p>
          </button>
        ))}
      </div>

      {/* Controller Request/Response Panel */}
      <div className="figma-card p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                selectedEndpoint.method === 'GET'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {selectedEndpoint.method}
            </span>
            <span className="text-sm font-bold text-white">{selectedEndpoint.path}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestCall}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>{isLoading ? 'EXECUTING...' : 'TEST ENDPOINT'}</span>
            </button>

            <button
              onClick={copyJson}
              className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-zinc-300 transition-colors"
              title="Copy JSON response"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Request Payload (if POST) */}
        {selectedEndpoint.requestBody && (
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400 block uppercase">Request Body (JSON):</span>
            <pre className="p-3 rounded-lg bg-zinc-950 text-emerald-400 text-[11px] overflow-x-auto border border-zinc-800">
              {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
            </pre>
          </div>
        )}

        {/* Response Body */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 block uppercase">Response Body (HTTP 200 OK):</span>
            <span className="text-[10px] text-emerald-400 font-bold">Content-Type: application/json</span>
          </div>
          <pre className="p-3.5 rounded-lg bg-zinc-950 text-zinc-300 text-[11px] overflow-x-auto border border-zinc-800 leading-relaxed">
            {JSON.stringify(activeResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
