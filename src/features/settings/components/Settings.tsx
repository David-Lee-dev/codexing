'use client';

import React from 'react';

import { useUpdater } from '@/shared/hooks/useUpdater';

import { SettingsView } from './SettingsView';
import { useSettings } from '../hooks/useSettings';

const APP_VERSION = '0.2.0';

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

  const {
    status: updateStatus,
    progress: updateProgress,
    updateInfo,
    error: updateError,
    checkForUpdates,
    downloadAndInstall,
    restartApp,
  } = useUpdater();

  return (
    <SettingsView
      isOpen={isOpen}
      isReindexing={isReindexing}
      isSaving={isSaving}
      vectorSettings={localVectorSettings}
      graphSettings={localGraphSettings}
      geminiApiKey={localGeminiApiKey}
      geminiModel={localGeminiModel}
      updateStatus={updateStatus}
      updateProgress={updateProgress}
      updateInfo={updateInfo}
      updateError={updateError}
      currentVersion={APP_VERSION}
      onSimilarityThresholdChange={handleSimilarityThresholdChange}
      onMultiHopLevelChange={handleMultiHopLevelChange}
      onGeminiApiKeyChange={handleGeminiApiKeyChange}
      onGeminiModelChange={handleGeminiModelChange}
      onGraphColorChange={handleGraphColorChange}
      onSave={handleSave}
      onReindexAll={handleReindexAll}
      onClose={handleClose}
      onCheckUpdate={checkForUpdates}
      onDownloadUpdate={downloadAndInstall}
      onRestartApp={restartApp}
    />
  );
};
