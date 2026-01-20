'use client';

import React from 'react';

import { GEMINI_MODELS } from '@/core/types';
import { ColorPicker } from '@/shared/ui/ColorPicker';

import type {
  GeminiModel,
  GraphColors,
  GraphSettings,
  VectorSettings,
} from '@/core/types';

export interface SettingsViewProps {
  isOpen: boolean;
  isReindexing: boolean;
  isSaving: boolean;
  vectorSettings: VectorSettings;
  graphSettings: GraphSettings;
  geminiApiKey: string;
  geminiModel: GeminiModel;
  onSimilarityThresholdChange: (value: number) => void;
  onMultiHopLevelChange: (value: number) => void;
  onGeminiApiKeyChange: (value: string) => void;
  onGeminiModelChange: (value: GeminiModel) => void;
  onGraphColorChange: (colorKey: keyof GraphColors, value: string) => void;
  onSave: () => void;
  onReindexAll: () => void;
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isOpen,
  isReindexing,
  isSaving,
  vectorSettings,
  graphSettings,
  geminiApiKey,
  geminiModel,
  onSimilarityThresholdChange,
  onMultiHopLevelChange,
  onGeminiApiKeyChange,
  onGeminiModelChange,
  onGraphColorChange,
  onSave,
  onReindexAll,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-ctp-crust/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-ctp-mantle rounded-2xl shadow-2xl w-[480px] max-h-[80vh] overflow-hidden border border-ctp-surface0">
        <div className="px-6 py-4 border-b border-ctp-surface0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ctp-text">Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <section>
            <h3 className="text-sm font-medium text-ctp-text mb-4">
              Vector Search
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-ctp-subtext1">
                    Similarity Threshold
                  </label>
                  <span className="text-sm font-mono text-ctp-subtext0">
                    {vectorSettings.similarityThreshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={vectorSettings.similarityThreshold}
                  onChange={(e) =>
                    onSimilarityThresholdChange(parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-ctp-surface0 rounded-lg appearance-none cursor-pointer accent-ctp-lavender"
                />
                <div className="flex justify-between text-xs text-ctp-overlay1 mt-1">
                  <span>More results</span>
                  <span>More precise</span>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-ctp-surface0" />

          <section>
            <h3 className="text-sm font-medium text-ctp-text mb-4">
              Graph Settings
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-ctp-subtext1">
                    Multi-hop Search Level
                  </label>
                  <span className="text-sm font-mono text-ctp-subtext0">
                    {graphSettings.multiHopLevel}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={graphSettings.multiHopLevel}
                  onChange={(e) =>
                    onMultiHopLevelChange(parseInt(e.target.value, 10))
                  }
                  className="w-full h-2 bg-ctp-surface0 rounded-lg appearance-none cursor-pointer accent-ctp-lavender"
                />
                <div className="flex justify-between text-xs text-ctp-overlay1 mt-1">
                  <span>Direct only</span>
                  <span>Deep connections</span>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-ctp-surface0" />

          <section>
            <h3 className="text-sm font-medium text-ctp-text mb-4">
              Graph Appearance
            </h3>
            <div className="space-y-3">
              <ColorPicker
                label="Document Node"
                value={graphSettings.colors?.documentNode || '#89b4fa'}
                onChange={(v) => onGraphColorChange('documentNode', v)}
              />
              <ColorPicker
                label="Tag Node"
                value={graphSettings.colors?.tagNode || '#a6e3a1'}
                onChange={(v) => onGraphColorChange('tagNode', v)}
              />
              <ColorPicker
                label="Document Link"
                value={graphSettings.colors?.documentLink || '#7f849c'}
                onChange={(v) => onGraphColorChange('documentLink', v)}
              />
              <ColorPicker
                label="Tag Link"
                value={graphSettings.colors?.tagLink || '#94e2d5'}
                onChange={(v) => onGraphColorChange('tagLink', v)}
              />
            </div>
          </section>

          <div className="border-t border-ctp-surface0" />

          <section>
            <h3 className="text-sm font-medium text-ctp-text mb-4">
              AI Integration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-ctp-subtext1 block mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => onGeminiApiKeyChange(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 py-2 text-sm text-ctp-text border border-ctp-surface1 rounded-xl bg-ctp-surface0 placeholder-ctp-overlay1 focus:outline-none focus:ring-2 focus:ring-ctp-lavender focus:border-transparent"
                />
                <p className="text-xs text-ctp-overlay1 mt-1.5">
                  Get your API key from{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ctp-lavender hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm text-ctp-subtext1 block mb-2">
                  Model
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) =>
                    onGeminiModelChange(e.target.value as GeminiModel)
                  }
                  className="w-full px-3 py-2 text-sm text-ctp-text border border-ctp-surface1 rounded-xl bg-ctp-surface0 focus:outline-none focus:ring-2 focus:ring-ctp-lavender focus:border-transparent"
                >
                  {GEMINI_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ctp-overlay1 mt-1.5">
                  Select the Gemini model to use for AI tag generation.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-ctp-surface0" />

          <section>
            <h3 className="text-sm font-medium text-ctp-text mb-4">
              Maintenance
            </h3>
            <div className="space-y-3">
              <button
                onClick={onReindexAll}
                disabled={isReindexing}
                className="w-full px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl border border-ctp-surface1 text-ctp-text hover:bg-ctp-surface0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReindexing ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm">Reindexing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span className="text-sm">Rebuild Vector Index</span>
                  </>
                )}
              </button>
              <p className="text-xs text-ctp-overlay1">
                Recalculates all block embeddings and rebuilds document
                connections. This may take a while for large collections.
              </p>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-ctp-surface0 bg-ctp-crust flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-ctp-subtext1 hover:text-ctp-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-ctp-lavender text-ctp-crust rounded-xl hover:bg-ctp-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
