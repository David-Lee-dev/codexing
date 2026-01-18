import { useEffect } from 'react';

import { getStoreActions, useActiveDocumentId } from '@/core/store';
import { documentApi } from '@/shared/api/document.api';

export function useEditing() {
  const activeDocumentId = useActiveDocumentId();

  useEffect(() => {
    if (!activeDocumentId) {
      getStoreActions().setDocument(null);
      return;
    }

    const loadDocument = async () => {
      const response = await documentApi.getDocument(activeDocumentId);

      if (response.success && response.data) {
        getStoreActions().setDocument(response.data);
      }
    };

    loadDocument();
  }, [activeDocumentId]);
}
