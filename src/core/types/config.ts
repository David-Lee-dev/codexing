export interface Tab {
  documentId: string;
  blockId: string;
  isActive: boolean;
  cursor: number;
  title: string | null;
}

export interface AppConfig {
  storagePath: string | null;
  isDatabaseInitialized: boolean;
  tabs: Tab[];
}

export interface DatabaseHealth {
  connected: boolean;
  sqliteVecLoaded: boolean;
  walMode: boolean;
  foreignKeysEnabled: boolean;
}
