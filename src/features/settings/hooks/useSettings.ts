import { useCallback, useEffect, useState } from 'react';

import { useAppStore, useIsReindexing, useIsSettingsOpen } from '@/core/store';
import {
  AppConfig,
  GeminiModel,
  GraphColors,
  GraphSettings,
  VectorSettings,
} from '@/core/types';
import { configApi } from '@/shared/api/config.api';

const DEFAULT_GRAPH_COLORS: GraphColors = {
  documentNode: '#3b82f6',
  tagNode: '#22c55e',
  documentLink: '#94a3b8',
  tagLink: '#86efac',
};

export const useSettings = () => {
  const isOpen = useIsSettingsOpen();
  const isReindexing = useIsReindexing();
  const closeSettings = useAppStore((state) => state.closeSettings);
  const setIsReindexing = useAppStore((state) => state.setIsReindexing);

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [localVectorSettings, setLocalVectorSettings] =
    useState<VectorSettings>({
      similarityThreshold: 0.5,
    });
  const [localGraphSettings, setLocalGraphSettings] = useState<GraphSettings>({
    multiHopLevel: 1,
    colors: DEFAULT_GRAPH_COLORS,
  });
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState('');
  const [localGeminiModel, setLocalGeminiModel] =
    useState<GeminiModel>('gemini-2.0-flash');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    const response = await configApi.loadConfig();
    if (response.success && response.data) {
      setConfig(response.data);
      setLocalVectorSettings(
        response.data.vectorSettings || { similarityThreshold: 0.5 },
      );
      setLocalGraphSettings(
        response.data.graphSettings || {
          multiHopLevel: 1,
          colors: DEFAULT_GRAPH_COLORS,
        },
      );
      setLocalGeminiApiKey(response.data.geminiApiKey || '');
      setLocalGeminiModel(response.data.geminiModel || 'gemini-2.0-flash');
    }
  };

  const handleSimilarityThresholdChange = useCallback((value: number) => {
    setLocalVectorSettings((prev) => ({
      ...prev,
      similarityThreshold: value,
    }));
  }, []);

  const handleMultiHopLevelChange = useCallback((value: number) => {
    setLocalGraphSettings((prev) => ({
      ...prev,
      multiHopLevel: value,
    }));
  }, []);

  const handleGeminiApiKeyChange = useCallback((value: string) => {
    setLocalGeminiApiKey(value);
  }, []);

  const handleGeminiModelChange = useCallback((value: GeminiModel) => {
    setLocalGeminiModel(value);
  }, []);

  const handleGraphColorChange = useCallback(
    (colorKey: keyof GraphColors, value: string) => {
      setLocalGraphSettings((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: value,
        },
      }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await configApi.saveConfig({
        vectorSettings: localVectorSettings,
        graphSettings: localGraphSettings,
        geminiApiKey: localGeminiApiKey || null,
        geminiModel: localGeminiModel,
      });
      closeSettings();
    } finally {
      setIsSaving(false);
    }
  }, [
    localVectorSettings,
    localGraphSettings,
    localGeminiApiKey,
    localGeminiModel,
    closeSettings,
  ]);

  const handleReindexAll = useCallback(async () => {
    setIsReindexing(true);
    try {
      const response = await configApi.triggerReindexAll();
      if (!response.success) {
        console.error('Reindex failed:', response.message);
      }
    } finally {
      setIsReindexing(false);
    }
  }, [setIsReindexing]);

  const handleClose = useCallback(() => {
    closeSettings();
  }, [closeSettings]);

  return {
    isOpen,
    isReindexing,
    isSaving,
    config,
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
  };
};
