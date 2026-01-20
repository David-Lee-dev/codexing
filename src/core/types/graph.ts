export interface GraphNode {
  id: string;
  label: string;
  nodeType: 'document' | 'tag';
}

export interface GraphEdge {
  source: string;
  target: string;
  edgeType: 'document-document' | 'document-tag';
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DocumentGraphInfo {
  documentId: string;
  documentNode: GraphNode;
  tagNodes: GraphNode[];
  tagEdges: GraphEdge[];
}

export interface EdgeChangeInfo {
  addedEdges: GraphEdge[];
  removedEdges: GraphEdge[];
}
