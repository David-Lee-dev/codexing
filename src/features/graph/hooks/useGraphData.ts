'use client';

import { useCallback, useEffect } from 'react';

import { useAppStore } from '../../../core/store';
import { documentApi } from '../../../shared/api/document.api';
import { tauriEventManager } from '../../../shared/lib/tauriEventManager';

export const useGraphData = () => {
  const graphData = useAppStore((state) => state.graphData);
  const isLoading = useAppStore((state) => state.isGraphLoading);
  const setGraphData = useAppStore((state) => state.setGraphData);
  const setIsGraphLoading = useAppStore((state) => state.setIsGraphLoading);
  const setLastGraphUpdated = useAppStore((state) => state.setLastGraphUpdated);
  const applyEdgeChanges = useAppStore((state) => state.applyEdgeChanges);

  const fetchGraphData = useCallback(async () => {
    setIsGraphLoading(true);
    try {
      const response = await documentApi.getGraphData();
      if (response.success && response.data) {
        setGraphData(response.data);
        setLastGraphUpdated(Date.now());
      }
    } finally {
      setIsGraphLoading(false);
    }
  }, [setGraphData, setIsGraphLoading, setLastGraphUpdated]);

  useEffect(() => {
    if (!graphData) {
      fetchGraphData();
    }
  }, [fetchGraphData, graphData]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      unsubscribe = await tauriEventManager.subscribe(
        'graph-edge-changed',
        (payload) => {
          applyEdgeChanges(payload);
        },
      );
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [applyEdgeChanges]);

  return {
    graphData,
    isLoading,
    refetch: fetchGraphData,
  };
};
