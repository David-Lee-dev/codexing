import { useEffect } from 'react';

import { useDocument } from '@/core/store';
import { autoSaveService } from '@/shared/lib/autoSaveService';

export function useAutoSave() {
  const document = useDocument();

  useEffect(() => {
    if (!document) return;

    autoSaveService.scheduleAutoSave(document);
  }, [document]);
}
