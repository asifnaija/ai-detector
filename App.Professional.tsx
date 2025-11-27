import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { ResultCard } from './components/ResultCard';
import { detectAIContent, humanizeContent } from './services/geminiService';
import { AppMode, AppState, DetectionResult, HumanizeResult } from './types';
import { ScanSearch, Wand2, Trash2, Settings, History, Download, Upload } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    inputText: '',
    isLoading: false,
    mode: AppMode.DETECT,
    detectionResult: null,
    humanizeResult: null,
    error: null,
    history: [],
    settings: {
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 1000,
      enableHistory: true,
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load settings and history from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('veritas-settings');
    const savedHistory = localStorage.getItem('veritas-history');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setState(prev => ({
          ...prev,
          settings: { ...prev.settings, ...parsedSettings }
        }));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setState(prev => ({
          ...prev,
          history: parsedHistory
        }));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  // Save settings and history to localStorage when they change
  useEffect(() => {
    localStorage.setItem('veritas-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    if (state.settings.enableHistory) {
      localStorage.setItem('veritas-history', JSON.stringify(state.history));
    }
  }, [state.history, state.settings.enableHistory]);

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
      let result;
      
      if (state.mode === AppMode.DETECT) {
        result = await detectAIContent(state.inputText, state.settings);
        setState(prev => ({
          ...prev,
          isLoading: false,
          detectionResult: result,
          history: prev.settings.enableHistory 
            ? [
                ...prev.history.slice(-9), // Keep only last 10 items
                {
                  id: Date.now(),
                  mode: AppMode.DETECT,
                  input: prev.inputText,
                  result: result,
                  timestamp: new Date().toISOString()
                }
              ]
            : prev.history
        }));
      } else {
        result = await humanizeContent(state.inputText, state.settings);
        setState(prev => ({
          ...prev,
          isLoading: false,
          humanizeResult: result,
          history: prev.settings.enableHistory 
            ? [
                ...prev.history.slice(-9), // Keep only last 10 items
                {
                  id: Date.now(),
                  mode: AppMode.HUMANIZE,
                  input: prev.inputText,
                  result: result,
                  timestamp: new Date().toISOString()
                }
              ]
            : prev.history
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while processing your request. Please try again.";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleSettingsChange = (key: keyof typeof state.settings, value: any) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const handleHistorySelect = (item: any) => {
    setState(prev => ({
      ...prev,
      inputText: item.input,
      mode: item.mode,
      detectionResult: item.mode === AppMode.DETECT ? item.result : null,
      humanizeResult: item.mode === AppMode.HUMANIZE ? item.result : null,
    }));
    setShowHistory(false);
  };

  const handleHistoryClear = () => {
    setState(prev => ({
      ...prev,
      history: []
    }));
  };

  const handleExportResults = () => {
    if (state.mode === AppMode.DETECT && state.detectionResult) {
      const dataStr = JSON.stringify({
        mode: 'DETECTION',
        input: state.inputText,
        result: state.detectionResult,
        timestamp: new Date().toISOString()
      }, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `veritas-detection-result-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (state.mode === AppMode.HUMANIZE && state.humanizeResult) {
      const dataStr = JSON.stringify({
        mode: 'HUMANIZATION',
        input: state.inputText,
        result: state.humanizeResult,
        timestamp: new Date().toISOString()
      }, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `veritas-humanization-result-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const wordCount = state.inputText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = state.inputText.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 flex flex-col">
      <Header />
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Application Settings
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">AI Model</label>
                <select
                  value={state.settings.model}
                  onChange={(e) => handleSettingsChange('model', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Temperature: {state.settings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.settings.temperature}
                  onChange={(e) => handleSettingsChange('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Max Tokens</label>
                <input
                  type="number"
                  value={state.settings.maxTokens}
                  onChange={(e) => handleSettingsChange('maxTokens', parseInt(e.target.value) || 1000)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="100"
                  max="8000"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableHistory"
                  checked={state.settings.enableHistory}
                  onChange={(e) => handleSettingsChange('enableHistory', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="enableHistory" className="text-sm text-slate-300">
                  Enable History
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Analysis History
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleHistoryClear}
                  className="text-xs px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded-lg transition-colors"
                  disabled={state.history.length === 0}
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {state.history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <History className="w-12 h-12 mb-4" />
                  <p>No history yet</p>
                  <p className="text-sm mt-2">Your analysis results will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...state.history].reverse().map((item) => (
                    <div 
                      key={item.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => handleHistorySelect(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.mode === AppMode.DETECT 
                                ? 'bg-indigo-500/20 text-indigo-400' 
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {item.mode === AppMode.DETECT ? 'Detection' : 'Humanization'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2">
                            {item.input.substring(0, 100)}{item.input.length > 100 ? '...' : ''}
                          </p>
                        </div>
                        <button className="text-slate-500 hover:text-slate-300">
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700"
            >
              <History className="w-4 h-4" />
              History ({state.history.length})
            </button>
          </div>
          
          {(state.detectionResult || state.humanizeResult) && (
            <button
              onClick={handleExportResults}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-sm transition-colors border border-emerald-600/30"
            >
              <Download className="w-4 h-4" />
              Export Result
            </button>
          )}
        </div>
        
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-260px)] min-h-[600px]">
          
          {/* Left: Input Area */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Input Text</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{wordCount} words, {charCount} chars</span>
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
                disabled={state.isLoading}
              />
            </div>
            
            <Button 
              onClick={handleProcess} 
              isLoading={state.isLoading}
              disabled={!state.inputText.trim() || state.isLoading}
              variant={state.mode === AppMode.DETECT ? 'primary' : 'accent'}
              className="w-full shadow-lg shadow-indigo-500/10"
            >
              {state.isLoading 
                ? 'Processing...' 
                : state.mode === AppMode.DETECT 
                  ? 'Analyze Text' 
                  : 'Humanize Text'}
            </Button>
            
            {state.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
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
              onRegenerate={async () => {
                if (!state.inputText.trim()) return;
                
                setState(prev => ({ ...prev, isLoading: true, error: null }));
                
                try {
                  if (state.mode === AppMode.DETECT) {
                    const result = await detectAIContent(state.inputText, state.settings);
                    setState(prev => ({
                      ...prev,
                      isLoading: false,
                      detectionResult: result,
                    }));
                  } else {
                    const result = await humanizeContent(state.inputText, state.settings);
                    setState(prev => ({
                      ...prev,
                      isLoading: false,
                      humanizeResult: result,
                    }));
                  }
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : "An error occurred while regenerating results.";
                  setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                  }));
                }
              }}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;