export interface Tab {
  documentId: string;
  blockId: string;
  isActive: boolean;
  cursor: number;
  title: string | null;
}

export interface VectorSettings {
  similarityThreshold: number; // 0.0 ~ 1.0
}

export interface GraphColors {
  documentNode: string;
  tagNode: string;
  documentLink: string;
  tagLink: string;
}

export interface GraphSettings {
  multiHopLevel: number; // 1 ~ 5
  colors: GraphColors;
}

export type GeminiModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro';

export const GEMINI_MODELS: { value: GeminiModel; label: string }[] = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Default)' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];

export interface AppConfig {
  storagePath: string | null;
  isDatabaseInitialized: boolean;
  tabs: Tab[];
  vectorSettings: VectorSettings;
  graphSettings: GraphSettings;
  geminiApiKey: string | null;
  geminiModel: GeminiModel;
}

export interface DatabaseHealth {
  connected: boolean;
  sqliteVecLoaded: boolean;
  walMode: boolean;
  foreignKeysEnabled: boolean;
}
