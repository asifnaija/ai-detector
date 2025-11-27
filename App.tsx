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
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        
        {/* iOS-style Segmented Control */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#e3e3e8] p-1 rounded-full inline-flex relative shadow-inner">
            <button
              onClick={() => handleModeChange(AppMode.DETECT)}
              className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                state.mode === AppMode.DETECT
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Detector
            </button>
            <button
              onClick={() => handleModeChange(AppMode.HUMANIZE)}
              className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                state.mode === AppMode.HUMANIZE
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Humanizer
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          
          {/* Left: Input Area */}
          <div className="flex flex-col gap-5 h-full">
            <div className="flex-1 bg-white rounded-3xl border border-gray-200/60 flex flex-col shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden focus-within:ring-2 focus-within:ring-[#0071e3]/20 transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fafafc]">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Source Text</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400">{wordCount} words</span>
                  {state.inputText && (
                    <button 
                      onClick={handleClear}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Clear text"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="flex-1 bg-transparent p-6 resize-none focus:outline-none text-[#1d1d1f] placeholder-gray-300 leading-relaxed text-[16px]"
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
              variant={state.mode === AppMode.DETECT ? 'primary' : 'accent'}
              className="w-full h-14 text-[15px] font-semibold tracking-wide shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10 transform transition-all active:scale-[0.99]"
            >
              {state.mode === AppMode.DETECT ? 'Analyze Content' : 'Humanize Text'}
            </Button>
            
            {state.error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm text-center font-medium">
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