export enum AppMode {
  DETECT = 'DETECT',
  HUMANIZE = 'HUMANIZE',
}

export interface DetectionResult {
  score: number; // 0 to 100, where 100 is fully AI
  label: string; // e.g., "Likely AI", "Mixed", "Human"
  analysis: string;
  highlightedSentences?: string[]; // Optional: sentences that seem very robotic
}

export interface HumanizeResult {
  originalText: string;
  humanizedText: string;
  changesSummary: string;
}

export interface AppSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  enableHistory: boolean;
}

export interface HistoryItem {
  id: number;
  mode: AppMode;
  input: string;
  result: DetectionResult | HumanizeResult;
  timestamp: string;
}

export interface AppState {
  inputText: string;
  isLoading: boolean;
  mode: AppMode;
  detectionResult: DetectionResult | null;
  humanizeResult: HumanizeResult | null;
  error: string | null;
  history: HistoryItem[];
  settings: AppSettings;
}
