import { useEffect } from 'react';

import { useAppStore } from '@/core/store';
import { configApi } from '@/shared/api/config.api';

export function useAppInitialize() {
  const isInitialized = useAppStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized) return;

    const initialize = async () => {
      try {
        const configResponse = await configApi.loadConfig();

        if (!configResponse.success || !configResponse.data) {
          useAppStore.setState({
            isLoading: false,
            isInitialized: true,
            isStorageSelected: false,
            isDatabaseInitialized: false,
          });
          return;
        }

        const config = configResponse.data;

        if (!config.storagePath || !config.isDatabaseInitialized) {
          useAppStore.setState({
            isLoading: false,
            isInitialized: true,
            isStorageSelected: false,
            isDatabaseInitialized: false,
          });
          return;
        }

        const databaseHealthResponse = await configApi.loadDatabase();

        if (
          !databaseHealthResponse.success ||
          !databaseHealthResponse.data ||
          !databaseHealthResponse.data.connected ||
          !databaseHealthResponse.data.sqliteVecLoaded ||
          !databaseHealthResponse.data.walMode ||
          !databaseHealthResponse.data.foreignKeysEnabled
        ) {
          useAppStore.setState({
            isLoading: false,
            isInitialized: true,
            isStorageSelected: true,
            isDatabaseInitialized: false,
          });
          return;
        }

        useAppStore.setState({
          isLoading: false,
          isInitialized: true,
          isStorageSelected: true,
          isDatabaseInitialized: true,
          tabs: config.tabs,
        });
      } catch {
        useAppStore.setState({
          isLoading: false,
          isStorageSelected: false,
          isDatabaseInitialized: false,
        });
      }
    };

    initialize();
  }, [isInitialized]);

  return null;
}
