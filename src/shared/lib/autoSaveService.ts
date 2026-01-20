import { getStoreActions } from '@/core/store';
import { documentApi } from '@/shared/api/document.api';

import type { Document } from '@/core/types';

const DEBOUNCE_DELAY = 500;
const INDEXING_DISPLAY_DURATION = 2000;

interface SaveTask {
  document: Document;
  hash: string;
  timeoutId: NodeJS.Timeout | null;
  status: 'pending' | 'saving';
}

class AutoSaveService {
  private tasks: Map<string, SaveTask> = new Map();
  private savedHashes: Map<string, string> = new Map();
  private activeSaveCount = 0;
  private indexingTimeoutId: NodeJS.Timeout | null = null;

  private getDocumentHash(document: Document): string {
    return JSON.stringify({
      id: document.id,
      title: document.title,
      tags: document.tags,
      blocks: document.blocks,
    });
  }

  private isDocumentEmpty(document: Document): boolean {
    if (document.title && document.title.trim().length > 0) return false;
    return document.blocks.every(
      (block) => !block.content || block.content.trim().length === 0,
    );
  }

  scheduleAutoSave(document: Document): void {
    const documentId = document.id;
    const hash = this.getDocumentHash(document);
    const savedHash = this.savedHashes.get(documentId);

    if (hash === savedHash) {
      return;
    }

    const existingTask = this.tasks.get(documentId);

    if (existingTask?.status === 'saving') {
      existingTask.document = document;
      existingTask.hash = hash;
      return;
    }

    if (existingTask?.timeoutId) {
      clearTimeout(existingTask.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      this.executeSave(documentId);
    }, DEBOUNCE_DELAY);

    this.tasks.set(documentId, {
      document,
      hash,
      timeoutId,
      status: 'pending',
    });
  }

  async saveImmediate(document: Document): Promise<void> {
    const documentId = document.id;
    const hash = this.getDocumentHash(document);
    const isEmpty = this.isDocumentEmpty(document);

    const existingTask = this.tasks.get(documentId);
    if (existingTask?.timeoutId) {
      clearTimeout(existingTask.timeoutId);
    }
    this.tasks.delete(documentId);

    if (!isEmpty) {
      this.activeSaveCount++;
      this.updateSaveStatus();
    }

    try {
      const response = await documentApi.saveDocument(document);
      this.savedHashes.set(documentId, hash);

      if (response.success && response.data) {
        getStoreActions().upsertDocumentGraph(response.data);
      }
    } finally {
      if (!isEmpty) {
        this.activeSaveCount--;
        this.updateSaveStatus();
      }
    }
  }

  async flushSave(documentId?: string): Promise<void> {
    if (documentId) {
      const task = this.tasks.get(documentId);
      if (task?.timeoutId) {
        clearTimeout(task.timeoutId);
        task.timeoutId = null;
      }
      if (task?.status === 'pending') {
        await this.executeSave(documentId);
      } else if (task?.status === 'saving') {
        await this.waitForSave(documentId);
      }
    } else {
      const pendingIds = Array.from(this.tasks.entries())
        .filter(([, task]) => task.status === 'pending')
        .map(([id]) => id);

      for (const id of pendingIds) {
        const task = this.tasks.get(id);
        if (task?.timeoutId) {
          clearTimeout(task.timeoutId);
          task.timeoutId = null;
        }
      }

      await Promise.all(pendingIds.map((id) => this.executeSave(id)));
    }
  }

  private async waitForSave(documentId: string): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        const task = this.tasks.get(documentId);
        if (!task || task.status !== 'saving') {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  private async executeSave(documentId: string): Promise<void> {
    const task = this.tasks.get(documentId);
    if (!task || task.status === 'saving') {
      return;
    }

    const savedHash = this.savedHashes.get(documentId);
    if (task.hash === savedHash) {
      this.tasks.delete(documentId);
      return;
    }

    task.status = 'saving';
    task.timeoutId = null;
    const hashBeforeSave = task.hash;
    const isEmpty = this.isDocumentEmpty(task.document);

    if (!isEmpty) {
      this.activeSaveCount++;
      this.updateSaveStatus();
    }

    try {
      const response = await documentApi.saveDocument(task.document);
      this.savedHashes.set(documentId, hashBeforeSave);

      if (response.success && response.data) {
        getStoreActions().upsertDocumentGraph(response.data);
      }

      if (task.hash !== hashBeforeSave) {
        task.status = 'pending';
        task.timeoutId = setTimeout(() => {
          this.executeSave(documentId);
        }, DEBOUNCE_DELAY);
      } else {
        this.tasks.delete(documentId);
      }
    } finally {
      if (!isEmpty) {
        this.activeSaveCount--;
        this.updateSaveStatus();
      }
    }
  }

  private updateSaveStatus(): void {
    if (this.indexingTimeoutId) {
      clearTimeout(this.indexingTimeoutId);
      this.indexingTimeoutId = null;
    }

    if (this.activeSaveCount > 0) {
      getStoreActions().setSaveStatus('saving');
    } else {
      getStoreActions().setSaveStatus('indexing');
      this.indexingTimeoutId = setTimeout(() => {
        getStoreActions().setSaveStatus('idle');
        this.indexingTimeoutId = null;
      }, INDEXING_DISPLAY_DURATION);
    }
  }

  reset(): void {
    for (const task of this.tasks.values()) {
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
    }
    this.tasks.clear();
    this.savedHashes.clear();
    this.activeSaveCount = 0;

    if (this.indexingTimeoutId) {
      clearTimeout(this.indexingTimeoutId);
      this.indexingTimeoutId = null;
    }
    getStoreActions().setSaveStatus('idle');
  }
}

export const autoSaveService = new AutoSaveService();
