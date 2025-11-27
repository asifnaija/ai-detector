import React from 'react';
import { DetectionResult, HumanizeResult, AppMode } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Copy, Check, AlertTriangle, Fingerprint } from 'lucide-react';

interface ResultCardProps {
  mode: AppMode;
  detectionResult: DetectionResult | null;
  humanizeResult: HumanizeResult | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({ mode, detectionResult, humanizeResult }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (mode === AppMode.DETECT && detectionResult) {
    const data = [
      { name: 'AI', value: detectionResult.score },
      { name: 'Human', value: 100 - detectionResult.score },
    ];
    
    // Determine color based on score
    const getColor = (score: number) => {
      if (score < 30) return '#10b981'; // Green (Human)
      if (score < 70) return '#f59e0b'; // Amber (Mixed)
      return '#ef4444'; // Red (AI)
    };

    const primaryColor = getColor(detectionResult.score);

    return (
      <div className="h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-400" />
            Analysis Result
          </h2>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="ai" fill={primaryColor} />
                    <Cell key="human" fill="#334155" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">{detectionResult.score}%</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">AI Probability</span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                {detectionResult.label}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Detailed Analysis</h3>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-slate-300 leading-relaxed text-sm">
              {detectionResult.analysis}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === AppMode.HUMANIZE && humanizeResult) {
    return (
      <div className="h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-emerald-400" />
            Humanized Content
          </h2>
          <button
            onClick={() => handleCopy(humanizeResult.humanizedText)}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="prose prose-invert max-w-none">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-inner min-h-[200px] text-slate-200 whitespace-pre-wrap leading-relaxed">
              {humanizeResult.humanizedText}
            </div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-xl p-4">
            <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Changes Made</h4>
            <p className="text-emerald-100/80 text-sm">
              {humanizeResult.changesSummary}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  return (
    <div className="h-full bg-slate-800 rounded-2xl border border-slate-700 flex flex-col items-center justify-center p-8 text-center border-dashed">
      <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
        {mode === AppMode.DETECT ? (
          <Fingerprint className="w-8 h-8 text-slate-500" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-slate-500" />
        )}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        {mode === AppMode.DETECT ? "Ready to Analyze" : "Ready to Humanize"}
      </h3>
      <p className="text-slate-400 max-w-xs mx-auto text-sm">
        {mode === AppMode.DETECT 
          ? "Paste your text on the left to check for AI generation patterns." 
          : "Paste robotic text on the left to rewrite it with a natural, human touch."}
      </p>
    </div>
  );
};
