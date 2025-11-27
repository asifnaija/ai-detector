export enum AppMode {
  DETECT = 'DETECT',
  HUMANIZE = 'HUMANIZE',
}

export interface DetectionResult {
  score: number; // 0 to 100, where 100 is fully AI
  confidence: number; // 0 to 100, indicating confidence in the prediction
  label: string; // e.g., "Very Likely AI", "Likely Human"
  analysis: string;
  highlightedSentences?: string[]; // Optional: sentences that seem very robotic
}

export interface HumanizeResult {
  originalText: string;
  humanizedText: string;
  changesSummary: string;
}

export interface AppState {
  inputText: string;
  isLoading: boolean;
  mode: AppMode;
  detectionResult: DetectionResult | null;
  humanizeResult: HumanizeResult | null;
  error: string | null;
}