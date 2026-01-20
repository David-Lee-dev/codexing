'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useAppStore } from '@/core/store';
import { configApi } from '@/shared/api/config.api';
import { documentApi } from '@/shared/api/document.api';

import { GraphView } from './GraphView';
import { useGraphData } from '../hooks/useGraphData';

import type { GraphColors, Tab } from '@/core/types';

const DEFAULT_COLORS: GraphColors = {
  documentNode: '#3b82f6',
  tagNode: '#22c55e',
  documentLink: '#94a3b8',
  tagLink: '#86efac',
};

export const Graph: React.FC = () => {
  const { graphData, isLoading, refetch } = useGraphData();
  const tabs = useAppStore((state) => state.tabs);
  const addTab = useAppStore((state) => state.addTab);
  const switchTab = useAppStore((state) => state.switchTab);
  const [colors, setColors] = useState<GraphColors>(DEFAULT_COLORS);

  const activeDocumentId = tabs.find((t) => t.isActive)?.documentId ?? null;

  useEffect(() => {
    const loadColors = async () => {
      const response = await configApi.loadConfig();
      if (response.success && response.data?.graphSettings?.colors) {
        setColors(response.data.graphSettings.colors);
      }
    };
    loadColors();
  }, []);

  const handleNodeClick = useCallback(
    async (nodeId: string, nodeType: 'document' | 'tag') => {
      if (nodeType === 'document') {
        const existingTab = tabs.find((t) => t.documentId === nodeId);

        if (existingTab) {
          switchTab(existingTab);
          return;
        }

        const response = await documentApi.getDocument(nodeId);
        if (!response.success || !response.data) return;

        const document = response.data;
        const newTab: Tab = {
          documentId: document.id,
          blockId: document.blocks[0]?.id ?? '',
          isActive: true,
          cursor: 0,
          title: document.title,
        };

        addTab(newTab);
      }
    },
    [tabs, addTab, switchTab],
  );

  return (
    <GraphView
      graphData={graphData}
      isLoading={isLoading}
      colors={colors}
      activeDocumentId={activeDocumentId}
      onNodeClick={handleNodeClick}
      onRefresh={refetch}
    />
  );
};
