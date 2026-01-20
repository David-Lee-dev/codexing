import type { DocumentGraphInfo, EdgeChangeInfo, GraphData } from '../../types';
import type { StateCreator } from 'zustand';

export interface GraphSliceState {
  graphData: GraphData | null;
  isGraphLoading: boolean;
  lastGraphUpdated: number | null;
}

export interface GraphSliceActions {
  setGraphData: (graphData: GraphData | null) => void;
  setIsGraphLoading: (isLoading: boolean) => void;
  setLastGraphUpdated: (timestamp: number | null) => void;
  upsertDocumentGraph: (info: DocumentGraphInfo) => void;
  removeDocumentFromGraph: (documentId: string) => void;
  applyEdgeChanges: (changes: EdgeChangeInfo) => void;
}

export type GraphSlice = GraphSliceState & GraphSliceActions;

export const createGraphSlice: StateCreator<GraphSlice, [], [], GraphSlice> = (
  set,
  get,
) => ({
  graphData: null,
  isGraphLoading: false,
  lastGraphUpdated: null,

  setGraphData: (graphData) => set({ graphData }),
  setIsGraphLoading: (isGraphLoading) => set({ isGraphLoading }),
  setLastGraphUpdated: (lastGraphUpdated) => set({ lastGraphUpdated }),

  upsertDocumentGraph: (info: DocumentGraphInfo) => {
    const current = get().graphData;
    if (!current) return;

    const { documentId, documentNode, tagNodes, tagEdges } = info;

    // 1. Remove existing tag edges for this document
    const filteredEdges = current.edges.filter(
      (edge) =>
        !(edge.source === documentId && edge.edgeType === 'document-tag'),
    );

    // 2. Remove orphan tag nodes (tags only connected to this document)
    const tagIdsToKeep = new Set<string>();
    filteredEdges.forEach((edge) => {
      if (edge.edgeType === 'document-tag') {
        tagIdsToKeep.add(edge.target);
      }
    });
    tagNodes.forEach((tag) => tagIdsToKeep.add(tag.id));

    // 3. Update or add document node
    const nodeMap = new Map(current.nodes.map((n) => [n.id, n]));
    nodeMap.set(documentNode.id, documentNode);

    // 4. Add new tag nodes
    tagNodes.forEach((tagNode) => {
      nodeMap.set(tagNode.id, tagNode);
    });

    // 5. Filter out orphan tag nodes
    const filteredNodes = Array.from(nodeMap.values()).filter((node) => {
      if (node.nodeType === 'tag') {
        return tagIdsToKeep.has(node.id);
      }
      return true;
    });

    // 6. Add new tag edges
    const newEdges = [...filteredEdges, ...tagEdges];

    set({
      graphData: { nodes: filteredNodes, edges: newEdges },
      lastGraphUpdated: Date.now(),
    });
  },

  removeDocumentFromGraph: (documentId: string) => {
    const current = get().graphData;
    if (!current) return;

    // 1. Remove document node
    const filteredNodes = current.nodes.filter(
      (node) => node.id !== documentId,
    );

    // 2. Remove all edges connected to this document
    const filteredEdges = current.edges.filter(
      (edge) => edge.source !== documentId && edge.target !== documentId,
    );

    // 3. Find orphan tag nodes (tags with no remaining connections)
    const connectedTagIds = new Set<string>();
    filteredEdges.forEach((edge) => {
      if (edge.edgeType === 'document-tag') {
        connectedTagIds.add(edge.target);
      }
    });

    const finalNodes = filteredNodes.filter((node) => {
      if (node.nodeType === 'tag') {
        return connectedTagIds.has(node.id);
      }
      return true;
    });

    set({
      graphData: { nodes: finalNodes, edges: filteredEdges },
      lastGraphUpdated: Date.now(),
    });
  },

  applyEdgeChanges: (changes: EdgeChangeInfo) => {
    const current = get().graphData;
    if (!current) return;

    const { addedEdges, removedEdges } = changes;

    // Create a set of edge keys to remove
    const removeKeys = new Set(
      removedEdges.map((e) => `${e.source}-${e.target}`),
    );

    // Filter out removed edges
    const filteredEdges = current.edges.filter(
      (edge) => !removeKeys.has(`${edge.source}-${edge.target}`),
    );

    // Add new edges (avoid duplicates)
    const existingKeys = new Set(
      filteredEdges.map((e) => `${e.source}-${e.target}`),
    );
    const edgesToAdd = addedEdges.filter((edge) => {
      const key = `${edge.source}-${edge.target}`;
      return !existingKeys.has(key);
    });

    const newEdges = [...filteredEdges, ...edgesToAdd];

    set({
      graphData: { nodes: current.nodes, edges: newEdges },
      lastGraphUpdated: Date.now(),
    });
  },
});
