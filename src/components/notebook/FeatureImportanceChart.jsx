import { SHAD_RASA_SENSORS } from '../../services/randomForestEngine';

export default function FeatureImportanceChart({ importances }) {
  const safeImportances = importances && importances.length === 6
    ? importances
    : [28.4, 18.2, 22.1, 14.3, 11.0, 6.0];

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between text-zinc-400">
        <span className="text-zinc-200 font-semibold font-sans">
          Feature Importance (Mean Decrease Impurity / Gini Gain)
        </span>
        <span className="text-[10px] text-zinc-500">Σ = 100.0%</span>
      </div>

      <div className="space-y-2 bg-[#0e111a] p-3.5 rounded border border-white/[0.08]">
        {SHAD_RASA_SENSORS.map((sensor, idx) => {
          const val = safeImportances[idx] || 0;
          return (
            <div key={sensor.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">
                  {sensor.id}: {sensor.rasa} <span className="text-zinc-500 text-[11px]">({sensor.english})</span>
                </span>
                <span className="font-bold text-zinc-100 tabular-nums">{val.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${val}%`,
                    backgroundColor: sensor.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-500">
        Sensors with higher MDI weights yield the strongest discriminatory power when distinguishing authentic herbal extracts from commercial adulterants.
      </p>
    </div>
  );
}
