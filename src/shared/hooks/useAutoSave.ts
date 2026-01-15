import { useEffect, useRef } from 'react';

import { useDocument } from '@/core/store';
import { documentApi } from '@/shared/api';

const DEBOUNCE_DELAY = 500; // ms

export function useAutoSave() {
  const document = useDocument();

  const lastSavedRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log(document);
    if (!document) return;

    const documentHash = JSON.stringify(document);
    console.log('documentHash', documentHash);
    if (documentHash === lastSavedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      console.log('useAutoSave', document);
      await documentApi.saveDocument(document);
      lastSavedRef.current = documentHash;
    }, DEBOUNCE_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [document]);
}
