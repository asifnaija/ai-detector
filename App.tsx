import React, { useState } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { ResultCard } from './components/ResultCard';
import { detectAIContent, humanizeContent } from './services/geminiService';
import { AppMode, AppState } from './types';
import { Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    inputText: '',
    isLoading: false,
    mode: AppMode.DETECT,
    detectionResult: null,
    humanizeResult: null,
    error: null,
  });

  const handleModeChange = (newMode: AppMode) => {
    setState(prev => ({
      ...prev,
      mode: newMode,
      error: null,
      detectionResult: null,
      humanizeResult: null,
    }));
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      inputText: '',
      detectionResult: null,
      humanizeResult: null,
      error: null,
    }));
  };

  const handleProcess = async () => {
    if (!state.inputText.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (state.mode === AppMode.DETECT) {
        const result = await detectAIContent(state.inputText);
        setState(prev => ({
          ...prev,
          isLoading: false,
          detectionResult: result,
        }));
      } else {
        const result = await humanizeContent(state.inputText);
        setState(prev => ({
          ...prev,
          isLoading: false,
          humanizeResult: result,
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "An error occurred. Please check your internet connection and try again.",
      }));
    }
  };

  const wordCount = state.inputText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen flex flex-col selection:bg-violet-500/30 selection:text-violet-200 font-sans bg-[#050507]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 relative">
        {/* Ambient Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Cosmic Segmented Control */}
        <div className="flex justify-center mb-10 relative z-10">
          <div className="bg-[#121215] p-1.5 rounded-full inline-flex relative shadow-lg border border-white/5">
            <button
              onClick={() => handleModeChange(AppMode.DETECT)}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 font-sans ${
                state.mode === AppMode.DETECT
                  ? 'bg-[#1c1c21] text-white shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)] border border-white/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Detector
            </button>
            <button
              onClick={() => handleModeChange(AppMode.HUMANIZE)}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 font-sans ${
                state.mode === AppMode.HUMANIZE
                  ? 'bg-[#1c1c21] text-white shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)] border border-white/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Humanizer
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px] relative z-10">
          
          {/* Left: Input Area */}
          <div className="flex flex-col gap-5 h-full">
            <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">Source Text</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-500 font-mono">{wordCount} words</span>
                  {state.inputText && (
                    <button 
                      onClick={handleClear}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Clear text"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="flex-1 bg-transparent p-6 resize-none focus:outline-none text-zinc-200 placeholder-zinc-700 leading-relaxed text-[16px] font-serif"
                placeholder={state.mode === AppMode.DETECT 
                  ? "Enter text to check for AI generation..." 
                  : "Enter text to rewrite naturally..."}
                value={state.inputText}
                onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
                spellCheck={false}
              />
            </div>
            
            <Button 
              onClick={handleProcess} 
              isLoading={state.isLoading}
              disabled={!state.inputText.trim()}
              variant="primary"
              className="w-full h-14 text-[15px] font-bold tracking-wide transform transition-all active:scale-[0.99] rounded-2xl"
            >
              {state.mode === AppMode.DETECT ? 'Analyze Content' : 'Humanize Text'}
            </Button>
            
            {state.error && (
              <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm text-center font-medium">
                {state.error}
              </div>
            )}
          </div>

          {/* Right: Output Area */}
          <div className="h-full">
            <ResultCard 
              mode={state.mode}
              inputText={state.inputText}
              detectionResult={state.detectionResult}
              humanizeResult={state.humanizeResult}
              isLoading={state.isLoading}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;