'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { GraphCanvas } from './GraphCanvas';

import type { GraphColors, GraphData } from '../../../core/types';

interface GraphViewProps {
  graphData: GraphData | null;
  isLoading: boolean;
  colors?: GraphColors;
  activeDocumentId?: string | null;
  onNodeClick?: (nodeId: string, nodeType: 'document' | 'tag') => void;
  onRefresh?: () => void;
}

const DEFAULT_COLORS: GraphColors = {
  documentNode: '#89b4fa',
  tagNode: '#a6e3a1',
  documentLink: '#7f849c',
  tagLink: '#94e2d5',
};

export const GraphView: React.FC<GraphViewProps> = ({
  graphData,
  isLoading,
  colors = DEFAULT_COLORS,
  activeDocumentId,
  onNodeClick,
  onRefresh,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: clientWidth || 800,
        height: clientHeight || 600,
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  if (isLoading && !graphData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-ctp-base">
        <div className="text-ctp-subtext0">Loading graph...</div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-ctp-base">
        <div className="text-ctp-subtext0">No data to display</div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 rounded-xl bg-ctp-lavender px-4 py-2 text-ctp-crust font-medium hover:bg-ctp-blue transition-colors"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-ctp-base">
      <GraphCanvas
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        colors={colors}
        activeDocumentId={activeDocumentId}
        onNodeClick={onNodeClick}
      />

      <div className="absolute bottom-4 left-4 flex gap-4 rounded-xl bg-ctp-mantle/90 backdrop-blur-sm p-2 text-xs text-ctp-text shadow-lg border border-ctp-surface0">
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: colors.documentNode }}
          />
          <span>Document</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: colors.tagNode }}
          />
          <span>Tag</span>
        </div>
      </div>

      {isLoading && (
        <div className="absolute right-4 top-4 rounded-xl bg-ctp-mantle/90 backdrop-blur-sm px-2 py-1 text-xs text-ctp-subtext0 shadow-lg border border-ctp-surface0">
          Updating...
        </div>
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="absolute right-4 bottom-4 rounded-xl bg-ctp-mantle/90 backdrop-blur-sm px-3 py-1.5 text-sm text-ctp-text shadow-lg border border-ctp-surface0 hover:bg-ctp-surface0 transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      )}
    </div>
  );
};
