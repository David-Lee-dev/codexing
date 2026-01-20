import { useEffect } from 'react';

import {
  registerDocumentEventHandlers,
  unregisterDocumentEventHandlers,
} from '@/shared/lib/documentEventHandlers';

export function useDocumentEvents() {
  useEffect(() => {
    registerDocumentEventHandlers();

    return () => {
      unregisterDocumentEventHandlers();
    };
  }, []);
}
