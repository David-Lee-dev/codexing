import { listen, type UnlistenFn } from '@tauri-apps/api/event';

import type { TauriEventRegistry } from '@/core/types';

type EventHandler<T> = (payload: T) => void;

interface ListenerInfo {
  unlisten: UnlistenFn;
  handlers: Set<EventHandler<unknown>>;
}

class TauriEventManager {
  private listeners: Map<string, ListenerInfo> = new Map();
  private isInitialized = false;

  async subscribe<K extends keyof TauriEventRegistry>(
    event: K,
    handler: EventHandler<TauriEventRegistry[K]>,
  ): Promise<() => void> {
    const existingListener = this.listeners.get(event);

    if (existingListener) {
      existingListener.handlers.add(handler as EventHandler<unknown>);
      return () => {
        existingListener.handlers.delete(handler as EventHandler<unknown>);
      };
    }

    const handlers = new Set<EventHandler<unknown>>();
    handlers.add(handler as EventHandler<unknown>);

    const unlisten = await listen<TauriEventRegistry[K]>(event, (e) => {
      const listenerInfo = this.listeners.get(event);
      if (listenerInfo) {
        listenerInfo.handlers.forEach((h) => h(e.payload));
      }
    });

    this.listeners.set(event, { unlisten, handlers });

    return () => {
      const listenerInfo = this.listeners.get(event);
      if (listenerInfo) {
        listenerInfo.handlers.delete(handler as EventHandler<unknown>);
        if (listenerInfo.handlers.size === 0) {
          listenerInfo.unlisten();
          this.listeners.delete(event);
        }
      }
    };
  }

  unsubscribeAll(): void {
    this.listeners.forEach((listenerInfo) => {
      listenerInfo.unlisten();
    });
    this.listeners.clear();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  destroy(): void {
    this.unsubscribeAll();
    this.isInitialized = false;
  }
}

export const tauriEventManager = new TauriEventManager();
