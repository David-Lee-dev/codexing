import type { EdgeChangeInfo } from './graph';

export interface DocumentDeletedEvent {
  documentId: string;
}

export interface DocumentUpdatedEvent {
  documentId: string;
  title: string | null;
  tags: string[] | null;
  updatedAt: string;
}

export interface TauriEventRegistry {
  'shortcut-event': string;
  'graph-edge-changed': EdgeChangeInfo;
  'document-deleted': DocumentDeletedEvent;
  'document-updated': DocumentUpdatedEvent;
}
