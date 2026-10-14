import { useState, useEffect } from 'react';
import {
  Sparkles,
  Terminal,
  Activity,
  Cpu,
  Sliders,
  CheckCircle2,
  RefreshCw,
  GitBranch,
  BarChart3,
  FlaskConical,
  Compass
} from 'lucide-react';
import NotebookCell from '../components/notebook/NotebookCell';
import OscilloscopeCanvas from '../components/notebook/OscilloscopeCanvas';
import TreeVisualizer from '../components/notebook/TreeVisualizer';
import FeatureImportanceChart from '../components/notebook/FeatureImportanceChart';
import TasteRadarCanvas from '../components/notebook/TasteRadarCanvas';
import PCAScatterPlot from '../components/notebook/PCAScatterPlot';
import SampleInferencePlayground from '../components/notebook/SampleInferencePlayground';
import {
  generateSyntheticDataset,
  trainRandomForest,
  predictRandomForest,
  SAMPLE_CLASSES
} from '../services/randomForestEngine';
import toast from 'react-hot-toast';

export default function ResearchNotebookPage() {
  // Machine Learning State
  const [dataset, setDataset] = useState(() => generateSyntheticDataset(25));
  const [forestParams, setForestParams] = useState({
    nEstimators: 20,
    maxDepth: 4,
    minSamplesSplit: 3,
    featureSubsetSize: 3,
  });
  const [forest, setForest] = useState(null);
  const [isTraining, setIsTraining] = useState(false);

  // Active assay probe state
  const [activeVoltages, setActiveVoltages] = useState([1.8, 1.2, 0.9, 0.4, 2.2, 0.6]);
  const [activePrediction, setActivePrediction] = useState(null);

  // Train model on initial mount
  useEffect(() => {
    handleTrainModel();
  }, []);

  const handleTrainModel = () => {
    setIsTraining(true);
    setTimeout(() => {
      const trainedForest = trainRandomForest(dataset, forestParams);
      setForest(trainedForest);
      // Run initial prediction
      const initPred = predictRandomForest(trainedForest, activeVoltages);
      setActivePrediction(initPred);
      setIsTraining(false);
      toast.success(`Random Forest Trained: ${forestParams.nEstimators} Trees | OOB: ${trainedForest.oobAccuracy}%`);
    }, 350);
  };

  const handleRegenerateDataset = () => {
    const freshData = generateSyntheticDataset(25);
    setDataset(freshData);
    toast.success('Generated 150 Fresh Electrochemical Assay Calibrations');
  };

  const handlePredictAssay = (result, features) => {
    setActivePrediction(result);
    setActiveVoltages(features);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Notebook Document Title Bar (Google Colab / DeepMind style) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> NOTEBOOK SESSION 01
            </span>
            <span className="text-xs font-mono text-slate-400">
              etongue_rf_pipeline_v2.ipynb
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 font-display mt-1">
            Biomimetic E-Tongue: Random Forest & PCA Latent Space Assay
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Electrochemical chronoamperometric taste profiling across 6 lipid-membrane cross-sensitive electrodes.
          </p>
        </div>

        {/* Global Telemetry Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/80 px-4 py-2.5 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">OOB ACCURACY</span>
            <span className="text-emerald-400 font-bold text-sm">
              {forest ? `${forest.oobAccuracy}%` : '...'}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px]">FOREST SIZE</span>
            <span className="text-cyan-400 font-bold text-sm">
              {forest ? `${forest.trees.length} Trees` : '...'}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px]">SAMPLE N</span>
            <span className="text-violet-400 font-bold text-sm">
              {dataset.length} Assays
            </span>
          </div>
        </div>
      </div>

      {/* CELL 01: Hardware Telemetry & 6-Channel Oscilloscope */}
      <NotebookCell
        cellIndex={1}
        title="Cell [1]: Real-Time Electrochemical Telemetry (6-Channel Potentiostat ADC)"
        subtitle="Continuous chronoamperometry voltage acquisition across cross-sensitive taste electrodes"
        executionTime="0.8ms"
        badge="HARDWARE TELEMETRY"
        codeSnippet={`# Ingest 6-Channel Microvolt Signal via ESP32-S3 ADC
import time, numpy as np

def acquire_chronoamperometry_stream(duration_sec=5, sample_rate_hz=250):
    timestamps = np.linspace(0, duration_sec, duration_sec * sample_rate_hz)
    voltages = np.array([read_adc_channel(ch) for ch in range(6)])
    return filter_butterworth_bandpass(voltages, lowcut=0.1, highcut=40.0)`}
      >
        <OscilloscopeCanvas
          activeFeatures={activeVoltages}
          onSensorUpdate={(updated) => setActiveVoltages(updated)}
        />
      </NotebookCell>

      {/* CELL 02: Model Training & Hyperparameter Tuning */}
      <NotebookCell
        cellIndex={2}
        title="Cell [2]: Random Forest Training & Hyperparameter Tuning"
        subtitle="Bootstrap aggregation (Bagging) + Subspace feature decorrelation (m = ⌊√p⌋)"
        executionTime="4.2ms"
        badge="ENSEMBLE LEARNER"
        onRun={handleTrainModel}
        codeSnippet={`from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

rf = RandomForestClassifier(
    n_estimators=${forestParams.nEstimators},
    max_depth=${forestParams.maxDepth},
    max_features=${forestParams.featureSubsetSize},
    min_samples_split=${forestParams.minSamplesSplit},
    oob_score=True,
    random_state=42
)
rf.fit(X_train, y_train)
print(f"OOB Validation Accuracy: {rf.oob_score_ * 100:.2f}%")`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">
                Number of Trees (n_estimators): <strong className="text-emerald-400">{forestParams.nEstimators}</strong>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={forestParams.nEstimators}
                onChange={(e) =>
                  setForestParams({ ...forestParams, nEstimators: parseInt(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Max Tree Depth: <strong className="text-cyan-400">{forestParams.maxDepth}</strong>
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={forestParams.maxDepth}
                onChange={(e) =>
                  setForestParams({ ...forestParams, maxDepth: parseInt(e.target.value) })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Subspace Features (m): <strong className="text-violet-400">{forestParams.featureSubsetSize}/6</strong>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={forestParams.featureSubsetSize}
                onChange={(e) =>
                  setForestParams({ ...forestParams, featureSubsetSize: parseInt(e.target.value) })
                }
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleTrainModel}
                disabled={isTraining}
                className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
                <span>{isTraining ? 'TRAINING...' : 'RETRAIN MODEL'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Tree Visualizer */}
          <TreeVisualizer forest={forest} />
        </div>
      </NotebookCell>

      {/* CELL 03: Feature Importance (MDI) & Explainability */}
      <NotebookCell
        cellIndex={3}
        title="Cell [3]: Biomarker Feature Importance (Mean Decrease in Impurity / Gini)"
        subtitle="Quantifying electrode sensor contributions across the entire decision tree forest"
        executionTime="1.2ms"
        badge="EXPLAINABLE AI"
        codeSnippet={`# Calculate Mean Decrease Impurity (MDI) for each sensor
import pandas as pd

importances = rf.feature_importances_
feature_df = pd.DataFrame({
    'Sensor': ['S1_Sweet', 'S2_Salty', 'S3_Sour', 'S4_Bitter', 'S5_Umami', 'S6_Astringent'],
    'Importance_Pct': importances * 100
}).sort_values(by='Importance_Pct', ascending=False)`}
      >
        <FeatureImportanceChart importances={forest?.featureImportances} />
      </NotebookCell>

      {/* CELL 04: Taste Radar & 2D PCA Latent Space Projection */}
      <NotebookCell
        cellIndex={4}
        title="Cell [4]: Taste Profile Polygon & 2D PCA Dimensionality Reduction"
        subtitle="Unsupervised latent space cluster projection and 6-dimensional organoleptic radar"
        executionTime="2.1ms"
        badge="LATENT SPACE & RADAR"
        codeSnippet={`# PCA Latent Space Projection
from sklearn.decomposition import PCA

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_assay)
print(f"Explained Variance Ratio: {pca.explained_variance_ratio_}")`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-mono text-slate-300 font-semibold mb-2">
              Organoleptic Taste Hexagon (Active Probe)
            </h4>
            <TasteRadarCanvas tasteScores={activePrediction?.tasteScores} />
          </div>

          <div>
            <h4 className="text-xs font-mono text-slate-300 font-semibold mb-2">
              PCA Cluster Map (Principal Components 1 & 2)
            </h4>
            <PCAScatterPlot currentPoint={activePrediction?.pca} />
          </div>
        </div>
      </NotebookCell>

      {/* CELL 05: Real-Time Liquid Assay & Inference Playground */}
      <NotebookCell
        cellIndex={5}
        title="Cell [5]: Real-Time Liquid Assay & Ensemble Classification Playground"
        subtitle="Dip virtual / physical E-Tongue into sample solutions to classify taste and detect adulteration"
        executionTime="2.9ms"
        badge="ACTIVE INFERENCE"
        codeSnippet={`# Run live prediction with calibrated confidence
sample_vector = np.array([s1_v, s2_v, s3_v, s4_v, s5_v, s6_v]).reshape(1, -1)
predicted_class = rf.predict(sample_vector)[0]
confidence = np.max(rf.predict_proba(sample_vector)) * 100

print(f"Identified: {predicted_class} with {confidence:.1f}% confidence")`}
      >
        <SampleInferencePlayground
          forest={forest}
          onPredict={handlePredictAssay}
          onSelectPreset={(features) => {
            setActiveVoltages(features);
            if (forest) {
              const pred = predictRandomForest(forest, features);
              setActivePrediction(pred);
            }
          }}
        />
      </NotebookCell>
    </div>
  );
}
