import { useEffect, useRef } from 'react';

import { useTabs } from '@/core/store';
import { configApi } from '@/shared/api/config.api';

const DEBOUNCE_DELAY = 250;

export function useTabSync() {
  const tabs = useTabs();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await configApi.saveConfig({ tabs });
      } catch (error) {
        console.error('[useTabSync] Failed to save tabs:', error);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tabs]);
}
