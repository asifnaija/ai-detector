import React from 'react';
import { Sparkles } from 'lucide-react';
import { Tooltip } from './Tooltip';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <Tooltip content="Prose AI Detector & Humanizer" side="bottom">
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-5 h-5 bg-black rounded-md flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <h1 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">Prose</h1>
            </div>
          </Tooltip>
          
          <Tooltip content="Powered by Google Gemini 2.5" side="bottom">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100/50 px-2 py-1 rounded-full border border-gray-200/50 cursor-help">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Gemini 2.5</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
