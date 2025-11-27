import React, { useState, useEffect } from 'react';
import { DetectionResult, HumanizeResult, AppMode } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Copy, Check, Fingerprint, Sparkles, ShieldCheck, Activity, Palette, Bot, LayoutTemplate, Columns } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { computeWordDiff } from '../utils/diff';

interface ResultCardProps {
  mode: AppMode;
  inputText: string;
  detectionResult: DetectionResult | null;
  humanizeResult: HumanizeResult | null;
  isLoading?: boolean;
}

// Helper to convert hex to rgba for transparency
const hexToRgba = (hex: string, alpha: number) => {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
  }
  return hex;
};

const HighlightedText = ({ text, highlights, highlightColor }: { text: string, highlights: string[], highlightColor: string }) => {
  if (!highlights || highlights.length === 0) {
    return <p className="whitespace-pre-wrap text-zinc-300 leading-7 font-serif">{text}</p>;
  }

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  let parts: { text: string; highlight: boolean }[] = [{ text: text, highlight: false }];

  highlights.forEach(h => {
    if (!h) return;
    const nextParts: { text: string; highlight: boolean }[] = [];
    parts.forEach(part => {
      if (part.highlight) {
        nextParts.push(part);
      } else {
        const escaped = escapeRegExp(h);
        const regex = new RegExp(`(${escaped})`, 'g'); 
        const split = part.text.split(regex);
        
        split.forEach(s => {
          if (s === '') return;
          if (s === h) {
             nextParts.push({ text: s, highlight: true });
          } else {
             nextParts.push({ text: s, highlight: false });
          }
        });
      }
    });
    parts = nextParts;
  });

  const bgColor = hexToRgba(highlightColor, 0.2);
  const borderColor = hexToRgba(highlightColor, 0.5);
  const textColor = hexToRgba(highlightColor, 1);

  return (
    <div className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-300 font-serif">
      {parts.map((part, i) => (
        <span 
          key={i} 
          style={part.highlight ? { 
            backgroundColor: bgColor, 
            borderBottomColor: borderColor,
            color: 'white' 
          } : undefined}
          className={part.highlight 
            ? "border-b px-0.5 rounded-sm transition-colors duration-300 cursor-help" 
            : ""
          }
          title={part.highlight ? "Potential AI pattern detected" : undefined}
        >
          {part.text}
        </span>
      ))}
    </div>
  );
};

export const ResultCard: React.FC<ResultCardProps> = ({ mode, inputText, detectionResult, humanizeResult, isLoading = false }) => {
  const [copied, setCopied] = React.useState(false);
  const [view, setView] = useState<'overview' | 'text'>('overview');
  const [humanizeView, setHumanizeView] = useState<'final' | 'diff'>('final');
  const [highlightColor, setHighlightColor] = useState('#c084fc'); // Cosmic Violet Default

  useEffect(() => {
    setView('overview');
    setHumanizeView('final');
  }, [detectionResult, humanizeResult]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cosmic Card Styles (Glassmorphism, Dark)
  const cardClasses = "h-full glass-panel rounded-2xl overflow-hidden flex flex-col transition-all duration-500 font-sans";

  if (isLoading) {
    return (
      <div className={cardClasses}>
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 rounded-lg animate-pulse">
              <div className="w-4 h-4 bg-white/10 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-8 animate-pulse">
          {mode === AppMode.DETECT ? (
            <>
              <div className="w-48 h-48 rounded-full border-[16px] border-white/5 flex items-center justify-center">
                 <div className="w-24 h-8 bg-white/5 rounded"></div>
              </div>
              <div className="h-8 w-40 bg-white/5 rounded-full"></div>
              <div className="w-full space-y-3 mt-4">
                <div className="h-4 bg-white/5 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-white/5 rounded w-full"></div>
                <div className="h-3 bg-white/5 rounded w-full"></div>
                <div className="h-3 bg-white/5 rounded w-5/6"></div>
              </div>
            </>
          ) : (
            <div className="w-full space-y-6">
               <div className="space-y-3">
                  <div className="h-4 bg-white/5 rounded w-32 mb-6"></div>
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-11/12"></div>
               </div>
               <div className="p-5 border border-white/5 rounded-2xl mt-8">
                  <div className="h-3 bg-white/10 rounded w-24 mb-3"></div>
                  <div className="h-2 bg-white/5 rounded w-full"></div>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === AppMode.DETECT && detectionResult) {
    const data = [
      { name: 'AI', value: detectionResult.score },
      { name: 'Human', value: 100 - detectionResult.score },
    ];
    
    // Neon Palette for charts
    const getColor = (score: number) => {
      if (score <= 20) return '#4ade80'; // Neon Green
      if (score <= 40) return '#22d3ee'; // Neon Cyan
      if (score <= 60) return '#facc15'; // Neon Yellow
      if (score <= 80) return '#fb923c'; // Neon Orange
      return '#c084fc'; // Neon Violet
    };

    const primaryColor = getColor(detectionResult.score);

    return (
      <div className={cardClasses}>
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Tooltip content="AI Pattern Analysis">
              <div className="p-1.5 bg-white/5 rounded-lg text-zinc-400">
                <Fingerprint className="w-4 h-4" />
              </div>
            </Tooltip>
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide font-mono">Analysis</h2>
          </div>
          
          <div className="bg-black/20 p-1 rounded-xl flex items-center border border-white/5">
             <Tooltip content="View analysis summary">
               <button 
                 onClick={() => setView('overview')}
                 className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${view === 'overview' ? 'bg-[#1c1c21] text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 Overview
               </button>
             </Tooltip>
             <Tooltip content="View highlighted patterns">
               <button 
                 onClick={() => setView('text')}
                 className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${view === 'text' ? 'bg-[#1c1c21] text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 Highlights
               </button>
             </Tooltip>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {view === 'overview' ? (
            <>
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="w-56 h-56 relative filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                        paddingAngle={5}
                      >
                        <Cell key="ai" fill={primaryColor} />
                        <Cell key="human" fill="#27272a" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Tooltip content="Likelihood of AI generation">
                      <span className="text-5xl font-bold tracking-tighter text-white cursor-default font-sans drop-shadow-md">{detectionResult.score}%</span>
                    </Tooltip>
                    <span className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider font-mono">AI Probability</span>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Tooltip content="Overall classification">
                    <span 
                      className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold cursor-default border border-white/5"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, boxShadow: `0 0 15px -5px ${primaryColor}40` }}
                    >
                      {detectionResult.label}
                    </span>
                  </Tooltip>
                  <div className="flex items-center gap-4 mt-2">
                    {detectionResult.confidence && (
                      <Tooltip content="Model's certainty in this result">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-help font-mono">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Conf: <span className="text-zinc-300 font-medium">{detectionResult.confidence}%</span></span>
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>

              {detectionResult.detectedModel && detectionResult.detectedModel !== 'N/A' && detectionResult.detectedModel !== 'Unknown' && (
                <div className="mb-6">
                   <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1 mb-2 font-mono">Model Fingerprint</h3>
                   <Tooltip content="Stylistic analysis identification" side="top">
                    <div className="bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border border-violet-500/20 rounded-2xl p-4 flex items-center gap-4 cursor-help hover:border-violet-500/40 transition-colors">
                       <div className="bg-violet-500/10 p-2.5 rounded-full text-violet-400">
                         <Bot className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wide font-mono">Suspected Source</p>
                         <p className="text-lg font-bold text-white leading-none mt-0.5">{detectionResult.detectedModel}</p>
                       </div>
                    </div>
                  </Tooltip>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1 font-mono">The Verdict</h3>
                <div className="bg-white/5 p-6 rounded-2xl text-zinc-300 leading-relaxed text-sm text-justify font-serif border border-white/5">
                  {detectionResult.analysis}
                </div>
              </div>
            </>
          ) : (
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">Detailed Scan</h3>
                 
                 <div className="flex items-center gap-3">
                   <Tooltip content="Customize highlight color">
                     <div className="flex items-center gap-2 bg-white/5 pl-2 pr-1 py-1 rounded-full border border-white/10">
                        <Palette className="w-3 h-3 text-zinc-400" />
                        <div className="w-5 h-5 rounded-full overflow-hidden relative cursor-pointer hover:scale-110 transition-transform ring-1 ring-white/10">
                          <input 
                              type="color" 
                              value={highlightColor}
                              onChange={(e) => setHighlightColor(e.target.value)}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                          />
                        </div>
                     </div>
                   </Tooltip>

                   <div className="flex items-center gap-1.5 text-[10px] text-rose-300 font-medium bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20 font-mono">
                     <Activity className="w-3 h-3" />
                     Patterns
                   </div>
                 </div>
               </div>

               <div className="p-6 bg-[#050507]/50 rounded-2xl border border-white/5">
                  <HighlightedText 
                    text={inputText} 
                    highlights={detectionResult.highlightedSentences || []} 
                    highlightColor={highlightColor}
                  />
               </div>
               {(!detectionResult.highlightedSentences || detectionResult.highlightedSentences.length === 0) && (
                 <p className="text-xs text-center text-zinc-600 italic font-mono">No specific AI sentences were confidently identified.</p>
               )}
             </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === AppMode.HUMANIZE && humanizeResult) {
    const diff = humanizeView === 'diff' 
      ? computeWordDiff(humanizeResult.originalText, humanizeResult.humanizedText) 
      : [];

    return (
      <div className={cardClasses}>
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Tooltip content="Humanized Output">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
            </Tooltip>
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide font-mono">Humanized Result</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-black/20 p-1 rounded-xl flex items-center border border-white/5">
               <Tooltip content="View final result">
                 <button 
                   onClick={() => setHumanizeView('final')}
                   className={`p-1.5 rounded-lg transition-all ${humanizeView === 'final' ? 'bg-[#1c1c21] text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                   <LayoutTemplate className="w-4 h-4" />
                 </button>
               </Tooltip>
               <Tooltip content="Compare with original">
                 <button 
                   onClick={() => setHumanizeView('diff')}
                   className={`p-1.5 rounded-lg transition-all ${humanizeView === 'diff' ? 'bg-[#1c1c21] text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                   <Columns className="w-4 h-4" />
                 </button>
               </Tooltip>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <Tooltip content={copied ? "Copied!" : "Copy to Clipboard"}>
              <button
                onClick={() => handleCopy(humanizeResult.humanizedText)}
                className="text-zinc-400 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-500/10"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="p-6 bg-[#050507]/50 rounded-2xl border border-white/5 text-zinc-200 whitespace-pre-wrap leading-7 text-[15px] shadow-inner font-serif">
              {humanizeView === 'final' ? (
                humanizeResult.humanizedText
              ) : (
                <div className="leading-7 font-serif">
                  {diff.map((part, index) => {
                    if (part.type === 'same') {
                      return <span key={index}>{part.value}</span>;
                    }
                    if (part.type === 'added') {
                      return (
                        <span key={index} className="bg-emerald-500/20 text-emerald-300 px-1 rounded mx-0.5 border-b border-emerald-500/30">
                          {part.value}
                        </span>
                      );
                    }
                    if (part.type === 'removed') {
                      return (
                        <span key={index} className="bg-rose-500/20 text-rose-300 line-through px-1 rounded mx-0.5 decoration-rose-400/50">
                          {part.value}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5">
            <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">Enhancements</h4>
            <p className="text-emerald-100/70 text-sm leading-relaxed font-serif">
              {humanizeResult.changesSummary}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  return (
    <div className={`${cardClasses} items-center justify-center p-10 text-center`}>
      <Tooltip content={mode === AppMode.DETECT ? "Start detection" : "Start humanization"}>
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5 cursor-default">
          {mode === AppMode.DETECT ? (
            <Fingerprint className="w-8 h-8 text-zinc-500" />
          ) : (
            <Sparkles className="w-8 h-8 text-zinc-500" />
          )}
        </div>
      </Tooltip>
      <h3 className="text-lg font-bold text-zinc-200 mb-2 font-serif">
        {mode === AppMode.DETECT ? "Ready to Analyze" : "Ready to Humanize"}
      </h3>
      <p className="text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed font-sans">
        {mode === AppMode.DETECT 
          ? "Paste text to detect AI patterns." 
          : "Paste text to improve flow and natural tone."}
      </p>
    </div>
  );
};