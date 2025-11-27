import React, { useState, useEffect } from 'react';
import { DetectionResult, HumanizeResult, AppMode } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Copy, Check, Fingerprint, Sparkles, ShieldCheck, Activity, Palette, Loader2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

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
    return <p className="whitespace-pre-wrap text-[#1d1d1f] leading-7">{text}</p>;
  }

  // Escape special characters for regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Build the content array by splitting text by highlighted phrases
  let parts: { text: string; highlight: boolean }[] = [{ text: text, highlight: false }];

  highlights.forEach(h => {
    if (!h) return;
    const nextParts: { text: string; highlight: boolean }[] = [];
    parts.forEach(part => {
      if (part.highlight) {
        nextParts.push(part);
      } else {
        const escaped = escapeRegExp(h);
        // Split by the highlighted sentence globally
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

  const bgColor = hexToRgba(highlightColor, 0.25);
  const borderColor = hexToRgba(highlightColor, 0.6);

  return (
    <div className="whitespace-pre-wrap text-[15px] leading-7 text-[#1d1d1f]">
      {parts.map((part, i) => (
        <span 
          key={i} 
          style={part.highlight ? { 
            backgroundColor: bgColor, 
            borderBottomColor: borderColor 
          } : undefined}
          className={part.highlight 
            ? "border-b-2 px-0.5 rounded-sm transition-colors duration-300 cursor-help" 
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
  const [highlightColor, setHighlightColor] = useState('#ff3b30'); // Default Apple Red

  // Reset view when new result comes in
  useEffect(() => {
    setView('overview');
  }, [detectionResult]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
        {/* Header Skeleton */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-8 animate-pulse">
          {mode === AppMode.DETECT ? (
            <>
              {/* Pie Chart Skeleton */}
              <div className="w-48 h-48 rounded-full border-[16px] border-gray-50 flex items-center justify-center">
                 <div className="w-24 h-8 bg-gray-100 rounded"></div>
              </div>
              
              {/* Verdict Label Skeleton */}
              <div className="h-8 w-40 bg-gray-100 rounded-full"></div>
              
              {/* Analysis Text Skeleton */}
              <div className="w-full space-y-3 mt-4">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-50 rounded w-full"></div>
                <div className="h-3 bg-gray-50 rounded w-full"></div>
                <div className="h-3 bg-gray-50 rounded w-5/6"></div>
              </div>
            </>
          ) : (
            <div className="w-full space-y-6">
               <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-32 mb-6"></div>
                  <div className="h-3 bg-gray-50 rounded w-full"></div>
                  <div className="h-3 bg-gray-50 rounded w-full"></div>
                  <div className="h-3 bg-gray-50 rounded w-11/12"></div>
                  <div className="h-3 bg-gray-50 rounded w-full"></div>
                  <div className="h-3 bg-gray-50 rounded w-4/5"></div>
               </div>
               
               <div className="p-5 border border-gray-50 rounded-2xl mt-8">
                  <div className="h-3 bg-gray-100 rounded w-24 mb-3"></div>
                  <div className="h-2 bg-gray-50 rounded w-full"></div>
                  <div className="h-2 bg-gray-50 rounded w-3/4 mt-2"></div>
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
    
    const getColor = (score: number) => {
      if (score <= 20) return '#34c759'; // Apple Green
      if (score <= 40) return '#32ade6'; // Apple Cyan/Blueish
      if (score <= 60) return '#ffcc00'; // Apple Yellow
      if (score <= 80) return '#ff9500'; // Apple Orange
      return '#ff3b30'; // Apple Red
    };

    const primaryColor = getColor(detectionResult.score);

    return (
      <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-all duration-500">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip content="AI Pattern Analysis">
              <div className="p-1.5 bg-gray-50 rounded-lg">
                <Fingerprint className="w-4 h-4 text-gray-500" />
              </div>
            </Tooltip>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Analysis</h2>
          </div>
          
          <div className="bg-gray-100/80 p-1 rounded-lg flex items-center">
             <Tooltip content="View analysis summary">
               <button 
                 onClick={() => setView('overview')}
                 className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'overview' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Overview
               </button>
             </Tooltip>
             <Tooltip content="View highlighted patterns">
               <button 
                 onClick={() => setView('text')}
                 className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'text' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Highlights
               </button>
             </Tooltip>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {view === 'overview' ? (
            <>
              <div className="flex flex-col items-center justify-center mb-10">
                <div className="w-56 h-56 relative">
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
                        cornerRadius={10}
                        paddingAngle={5}
                      >
                        <Cell key="ai" fill={primaryColor} />
                        <Cell key="human" fill="#f2f2f7" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Tooltip content="Likelihood of AI generation">
                      <span className="text-5xl font-semibold tracking-tighter text-[#1d1d1f] cursor-default">{detectionResult.score}%</span>
                    </Tooltip>
                    <span className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">AI Probability</span>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Tooltip content="Overall classification">
                    <span 
                      className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium cursor-default"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {detectionResult.label}
                    </span>
                  </Tooltip>
                  {detectionResult.confidence && (
                    <Tooltip content="Model's certainty in this result">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 cursor-help">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Confidence: <span className="text-gray-600 font-medium">{detectionResult.confidence}%</span>
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">The Verdict</h3>
                <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed text-sm text-justify">
                  {detectionResult.analysis}
                </div>
              </div>
            </>
          ) : (
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detailed Scan</h3>
                 
                 <div className="flex items-center gap-3">
                   <Tooltip content="Customize highlight color">
                     <div className="flex items-center gap-2 bg-gray-50 pl-2 pr-1 py-1 rounded-full border border-gray-100 shadow-sm">
                        <Palette className="w-3 h-3 text-gray-400" />
                        <div className="w-5 h-5 rounded-full overflow-hidden relative cursor-pointer hover:scale-105 transition-transform">
                          <input 
                              type="color" 
                              value={highlightColor}
                              onChange={(e) => setHighlightColor(e.target.value)}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                          />
                        </div>
                     </div>
                   </Tooltip>

                   <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-100/50">
                     <Activity className="w-3 h-3" />
                     Patterns
                   </div>
                 </div>
               </div>

               <div className="p-6 bg-[#fafafc] rounded-2xl border border-gray-100">
                  <HighlightedText 
                    text={inputText} 
                    highlights={detectionResult.highlightedSentences || []} 
                    highlightColor={highlightColor}
                  />
               </div>
               {(!detectionResult.highlightedSentences || detectionResult.highlightedSentences.length === 0) && (
                 <p className="text-xs text-center text-gray-400 italic">No specific AI sentences were confidently identified.</p>
               )}
             </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === AppMode.HUMANIZE && humanizeResult) {
    return (
      <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-all duration-500">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Tooltip content="Humanized Output">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
              </div>
            </Tooltip>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Humanized Result</h2>
          </div>
          <Tooltip content={copied ? "Copied!" : "Copy to Clipboard"}>
            <button
              onClick={() => handleCopy(humanizeResult.humanizedText)}
              className="text-gray-400 hover:text-[#0071e3] transition-colors p-2 rounded-full hover:bg-blue-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </Tooltip>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="prose prose-sm max-w-none">
            <div className="p-6 bg-[#fbfbfd] rounded-2xl border border-gray-100 text-[#1d1d1f] whitespace-pre-wrap leading-7 text-[15px] shadow-inner">
              {humanizeResult.humanizedText}
            </div>
          </div>

          <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5">
            <h4 className="text-[#34c759] text-xs font-bold uppercase tracking-wider mb-2">Enhancements</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {humanizeResult.changesSummary}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty State - Minimalist
  return (
    <div className="h-full bg-white rounded-3xl border border-gray-200/60 shadow-sm flex flex-col items-center justify-center p-10 text-center">
      <Tooltip content={mode === AppMode.DETECT ? "Start detection" : "Start humanization"}>
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm cursor-default">
          {mode === AppMode.DETECT ? (
            <Fingerprint className="w-8 h-8 text-gray-300" />
          ) : (
            <Sparkles className="w-8 h-8 text-gray-300" />
          )}
        </div>
      </Tooltip>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {mode === AppMode.DETECT ? "Ready to Analyze" : "Ready to Humanize"}
      </h3>
      <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
        {mode === AppMode.DETECT 
          ? "Paste text to detect AI patterns." 
          : "Paste text to improve flow and natural tone."}
      </p>
    </div>
  );
};