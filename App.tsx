import React, { useState } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { ResultCard } from './components/ResultCard';
import { detectAIContent, humanizeContent } from './services/geminiService';
import { AppMode, AppState, DetectionResult, HumanizeResult } from './types';
import { ScanSearch, Wand2, Trash2 } from 'lucide-react';

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
      // Optional: Clear results when switching or keep them? Let's keep input, clear result.
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
        error: "An error occurred while processing your request. Please try again.",
      }));
    }
  };

  const wordCount = state.inputText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex shadow-lg">
            <button
              onClick={() => handleModeChange(AppMode.DETECT)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                state.mode === AppMode.DETECT
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ScanSearch className="w-4 h-4" />
              AI Detector
            </button>
            <button
              onClick={() => handleModeChange(AppMode.HUMANIZE)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                state.mode === AppMode.HUMANIZE
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Humanizer
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
          
          {/* Left: Input Area */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Input Text</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{wordCount} words</span>
                  {state.inputText && (
                    <button 
                      onClick={handleClear}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Clear text"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="flex-1 bg-transparent p-6 resize-none focus:outline-none text-slate-200 placeholder-slate-600 leading-relaxed font-light text-base"
                placeholder={state.mode === AppMode.DETECT 
                  ? "Paste text here to analyze if it's AI generated..." 
                  : "Paste text here that sounds robotic or stiff to humanize it..."}
                value={state.inputText}
                onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
                spellCheck={false}
              />
            </div>
            
            <Button 
              onClick={handleProcess} 
              isLoading={state.isLoading}
              disabled={!state.inputText.trim()}
              variant={state.mode === AppMode.DETECT ? 'primary' : 'accent'}
              className="w-full shadow-lg shadow-indigo-500/10"
            >
              {state.mode === AppMode.DETECT ? 'Analyze Text' : 'Humanize Text'}
            </Button>
            
            {state.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center">
                {state.error}
              </div>
            )}
          </div>

          {/* Right: Output Area */}
          <div className="h-full">
            <ResultCard 
              mode={state.mode}
              detectionResult={state.detectionResult}
              humanizeResult={state.humanizeResult}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;