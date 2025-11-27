import React from 'react';
import { Sparkles } from 'lucide-react';
import { Tooltip } from './Tooltip';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#050507]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Tooltip content="Prose AI Detector & Humanizer" side="bottom">
            <div className="flex items-center gap-3 cursor-default">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                <span className="text-white font-bold text-xs font-serif italic">P</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight font-sans">Prose</h1>
            </div>
          </Tooltip>
          
          <Tooltip content="Powered by Google Gemini 2.5" side="bottom">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 cursor-help font-mono hover:bg-white/10 transition-colors">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Gemini 2.5</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};