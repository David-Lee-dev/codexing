'use client';

import React from 'react';

import { SettingsView } from './SettingsView';
import { useSettings } from '../hooks/useSettings';

export const Settings: React.FC = () => {
  const {
    isOpen,
    isReindexing,
    isSaving,
    localVectorSettings,
    localGraphSettings,
    localGeminiApiKey,
    localGeminiModel,
    handleSimilarityThresholdChange,
    handleMultiHopLevelChange,
    handleGeminiApiKeyChange,
    handleGeminiModelChange,
    handleGraphColorChange,
    handleSave,
    handleReindexAll,
    handleClose,
  } = useSettings();

  return (
    <SettingsView
      isOpen={isOpen}
      isReindexing={isReindexing}
      isSaving={isSaving}
      vectorSettings={localVectorSettings}
      graphSettings={localGraphSettings}
      geminiApiKey={localGeminiApiKey}
      geminiModel={localGeminiModel}
      onSimilarityThresholdChange={handleSimilarityThresholdChange}
      onMultiHopLevelChange={handleMultiHopLevelChange}
      onGeminiApiKeyChange={handleGeminiApiKeyChange}
      onGeminiModelChange={handleGeminiModelChange}
      onGraphColorChange={handleGraphColorChange}
      onSave={handleSave}
      onReindexAll={handleReindexAll}
      onClose={handleClose}
    />
  );
};
