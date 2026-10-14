import { useState } from 'react';
import { GitBranch, CheckCircle2, Split } from 'lucide-react';

function TreeNode({ node, depth = 0 }) {
  const isLeaf = node.type === 'leaf';

  return (
    <div className="flex flex-col items-center">
      {/* Node Box */}
      <div
        className={`px-3 py-2 rounded border text-center transition-all ${
          isLeaf
            ? 'bg-[#0f1f18] border-emerald-500/40 text-emerald-200'
            : 'bg-[#121520] border-white/[0.1] text-zinc-200 hover:border-zinc-500'
        }`}
      >
        {!isLeaf ? (
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-zinc-100">
              <Split className="w-3 h-3 text-emerald-400" />
              <span>{node.featureName} &le; {node.threshold} V</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
              <span>Gini: {node.gini}</span>
              <span>•</span>
              <span>n = {node.samples}</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-1 text-xs font-bold font-sans text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{node.prediction.split('(')[0]}</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
              Confidence: {node.confidence}% (n={node.samples})
            </div>
          </div>
        )}
      </div>

      {/* Children branches */}
      {!isLeaf && depth < 3 && (
        <div className="mt-3 flex gap-4 items-start relative before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-2 before:border-t before:border-zinc-700">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-emerald-400 mb-0.5">&le; True</span>
            <TreeNode node={node.left} depth={depth + 1} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-zinc-400 mb-0.5">&gt; False</span>
            <TreeNode node={node.right} depth={depth + 1} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreeVisualizer({ forest }) {
  const [selectedTreeIndex, setSelectedTreeIndex] = useState(0);

  if (!forest || !forest.trees || forest.trees.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-500 font-mono text-xs">
        No trained trees found in memory.
      </div>
    );
  }

  const selectedTree = forest.trees[selectedTreeIndex];

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Tree Selector Ribbon */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-zinc-400 bg-[#0e111a] px-3 py-2 rounded border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-300">Decision Tree:</span>
          <select
            value={selectedTreeIndex}
            onChange={(e) => setSelectedTreeIndex(parseInt(e.target.value))}
            className="bg-[#181c28] border border-white/[0.1] text-zinc-200 rounded px-2 py-0.5 text-xs font-mono focus:outline-none"
          >
            {forest.trees.map((t, idx) => (
              <option key={t.id} value={idx}>
                Tree #{t.id} (Bootstrap Subspace)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
          <span>Forest: <strong className="text-zinc-200">{forest.trees.length} Estimators</strong></span>
          <span>Max Depth: <strong className="text-zinc-200">{forest.maxDepth}</strong></span>
          <span>OOB Validation: <strong className="text-emerald-400">{forest.oobAccuracy}%</strong></span>
        </div>
      </div>

      {/* Tree Visual Flow Diagram */}
      <div className="bg-[#080a10] p-6 rounded border border-white/[0.08] overflow-x-auto min-h-[240px] flex justify-center items-center">
        {selectedTree && selectedTree.root && (
          <TreeNode node={selectedTree.root} depth={0} />
        )}
      </div>
    </div>
  );
}
