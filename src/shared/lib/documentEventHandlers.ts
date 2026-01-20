import { getStoreActions } from '@/core/store';

import { tauriEventManager } from './tauriEventManager';

let isRegistered = false;

export async function registerDocumentEventHandlers(): Promise<void> {
  if (isRegistered) return;
  isRegistered = true;

  await tauriEventManager.subscribe('document-deleted', (payload) => {
    const { removeDocumentFromList, removeDocumentFromGraph } =
      getStoreActions();
    removeDocumentFromList(payload.documentId);
    removeDocumentFromGraph(payload.documentId);
  });

  await tauriEventManager.subscribe('document-updated', (payload) => {
    const { updateDocumentInList } = getStoreActions();
    updateDocumentInList(payload.documentId, {
      title: payload.title,
      tags: payload.tags,
      updatedAt: payload.updatedAt,
    });
  });
}

export function unregisterDocumentEventHandlers(): void {
  tauriEventManager.unsubscribeAll();
  isRegistered = false;
}
