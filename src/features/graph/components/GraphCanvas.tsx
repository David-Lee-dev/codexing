'use client';

import React, { useCallback, useMemo, useRef, useEffect } from 'react';

import ForceGraph2D, {
  type NodeObject,
  type LinkObject,
} from 'react-force-graph-2d';

import type { GraphColors, GraphData } from '../../../core/types';

interface GraphCanvasProps {
  graphData: GraphData;
  width: number;
  height: number;
  colors?: GraphColors;
  activeDocumentId?: string | null;
  onNodeClick?: (nodeId: string, nodeType: 'document' | 'tag') => void;
}

interface ForceGraphNode extends NodeObject {
  id: string;
  label: string;
  nodeType: 'document' | 'tag';
}

interface ForceGraphLink extends LinkObject {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  edgeType: 'document-document' | 'document-tag';
  weight?: number;
}

const DEFAULT_COLORS: GraphColors = {
  documentNode: '#3b82f6',
  tagNode: '#22c55e',
  documentLink: '#94a3b8',
  tagLink: '#86efac',
};

const INACTIVE_COLOR = '#9ca3af';
const INACTIVE_OPACITY = 0.3;

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  width,
  height,
  colors = DEFAULT_COLORS,
  activeDocumentId,
  onNodeClick,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(undefined);

  const forceGraphData = useMemo(() => {
    const nodes: ForceGraphNode[] = graphData.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      nodeType: node.nodeType as 'document' | 'tag',
    }));

    const links: ForceGraphLink[] = graphData.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      edgeType: edge.edgeType as 'document-document' | 'document-tag',
      weight: edge.weight,
    }));

    return { nodes, links };
  }, [graphData]);

  const highlightedNodeIds = useMemo(() => {
    if (!activeDocumentId) return new Set<string>();

    const highlighted = new Set<string>();
    highlighted.add(activeDocumentId);

    graphData.edges.forEach((edge) => {
      if (edge.source === activeDocumentId) {
        highlighted.add(edge.target);
      }
      if (edge.target === activeDocumentId) {
        highlighted.add(edge.source);
      }
    });

    return highlighted;
  }, [activeDocumentId, graphData.edges]);

  const highlightedEdges = useMemo(() => {
    if (!activeDocumentId) return new Set<string>();

    const edges = new Set<string>();
    graphData.edges.forEach((edge) => {
      if (
        edge.source === activeDocumentId ||
        edge.target === activeDocumentId
      ) {
        edges.add(`${edge.source}-${edge.target}`);
      }
    });

    return edges;
  }, [activeDocumentId, graphData.edges]);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-300);
      graphRef.current.d3Force('link')?.distance(100);
    }
  }, []);

  const handleNodeClick = useCallback(
    (node: ForceGraphNode) => {
      if (onNodeClick) {
        onNodeClick(node.id, node.nodeType);
      }
    },
    [onNodeClick],
  );

  const nodeCanvasObject = useCallback(
    (
      node: ForceGraphNode,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const label = node.label;
      const fontSize = Math.max(12 / globalScale, 4);
      ctx.font = `${fontSize}px Sans-Serif`;

      const isHighlighted =
        !activeDocumentId || highlightedNodeIds.has(node.id);
      const baseColor =
        node.nodeType === 'document' ? colors.documentNode : colors.tagNode;
      const nodeColor = isHighlighted ? baseColor : INACTIVE_COLOR;
      const opacity = isHighlighted ? 1 : INACTIVE_OPACITY;
      const radius = node.nodeType === 'document' ? 8 : 6;

      ctx.globalAlpha = opacity;

      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = nodeColor;
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isHighlighted ? '#374151' : '#9ca3af';
      ctx.fillText(label, node.x || 0, (node.y || 0) + radius + fontSize);

      ctx.globalAlpha = 1;
    },
    [colors, activeDocumentId, highlightedNodeIds],
  );

  const linkColor = useCallback(
    (link: ForceGraphLink) => {
      const sourceId =
        typeof link.source === 'string' ? link.source : link.source.id;
      const targetId =
        typeof link.target === 'string' ? link.target : link.target.id;
      const edgeKey = `${sourceId}-${targetId}`;
      const reverseKey = `${targetId}-${sourceId}`;

      const isHighlighted =
        !activeDocumentId ||
        highlightedEdges.has(edgeKey) ||
        highlightedEdges.has(reverseKey);

      if (!isHighlighted) {
        return `rgba(156, 163, 175, ${INACTIVE_OPACITY})`;
      }

      return link.edgeType === 'document-document'
        ? colors.documentLink
        : colors.tagLink;
    },
    [colors, activeDocumentId, highlightedEdges],
  );

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={forceGraphData}
      width={width}
      height={height}
      nodeCanvasObject={nodeCanvasObject}
      nodePointerAreaPaint={(node, color, ctx) => {
        const radius = (node as ForceGraphNode).nodeType === 'document' ? 8 : 6;
        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, radius + 4, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
      }}
      onNodeClick={handleNodeClick}
      linkColor={linkColor}
      linkWidth={1}
      linkDirectionalParticles={0}
      warmupTicks={100}
      cooldownTicks={0}
      enableZoomInteraction={true}
      enablePanInteraction={true}
    />
  );
};
