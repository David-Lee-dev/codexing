'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  KeyboardEvent,
} from 'react';

import { debounce } from 'lodash';

import { getStoreActions, useDocument } from '@/core/store';
import { aiApi } from '@/shared/api/ai.api';
import { configApi } from '@/shared/api/config.api';

import { TagEditorView } from './TagEditorView';

const SYNC_DEBOUNCE_MS = 300;

export const TagEditor: React.FC = () => {
  const document = useDocument();
  const documentRef = useRef(document);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Local-first: UI uses localTags for immediate rendering
  const [localTags, setLocalTags] = useState<string[]>(document?.tags ?? []);
  const localTagsRef = useRef(localTags);

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  useEffect(() => {
    localTagsRef.current = localTags;
  }, [localTags]);

  // Sync localTags when document changes externally (e.g., document switch)
  useEffect(() => {
    const documentTags = document?.tags ?? [];
    setLocalTags(documentTags);
  }, [document?.id, document?.tags]);

  useEffect(() => {
    const checkApiKey = async () => {
      const response = await configApi.loadConfig();
      if (response.success && response.data) {
        setHasApiKey(!!response.data.geminiApiKey);
      }
    };
    checkApiKey();
  }, []);

  // Background sync to document store (debounced for save efficiency)
  const syncToDocument = useMemo(
    () =>
      debounce((newTags: string[]) => {
        const currentDoc = documentRef.current;
        if (!currentDoc) return;

        const setDocument = getStoreActions().setDocument;
        setDocument({
          ...currentDoc,
          tags: newTags.length > 0 ? newTags : null,
        });
      }, SYNC_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => {
      syncToDocument.cancel();
    };
  }, [syncToDocument]);

  // Update both local state (immediate) and document (debounced)
  const updateTags = useCallback(
    (newTags: string[]) => {
      setLocalTags(newTags);
      syncToDocument(newTags);
    },
    [syncToDocument],
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      const currentTags = localTagsRef.current;
      if (!trimmed || currentTags.includes(trimmed)) return;

      const newTags = [...currentTags, trimmed];
      updateTags(newTags);
    },
    [updateTags],
  );

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim()) {
          addTag(inputValue);
          setInputValue('');
        }
      } else if (e.key === 'Backspace' && !inputValue && localTags.length > 0) {
        const newTags = localTags.slice(0, -1);
        updateTags(newTags);
      }
    },
    [inputValue, localTags, addTag, updateTags],
  );

  const handleRemoveTag = useCallback(
    (index: number) => {
      const newTags = localTags.filter((_, i) => i !== index);
      updateTags(newTags);
    },
    [localTags, updateTags],
  );

  const handleGenerateTags = useCallback(async () => {
    const currentDoc = documentRef.current;
    if (!currentDoc) return;

    setIsGenerating(true);
    try {
      const title = currentDoc.title ?? '';
      const content = currentDoc.blocks
        .map((block) => block.content ?? '')
        .join('\n')
        .slice(0, 2000);

      const response = await aiApi.generateTags({ title, content });

      if (response.success && response.data) {
        const currentTags = localTagsRef.current;
        const existingTags = new Set(currentTags.map((t) => t.toLowerCase()));
        const newTags = response.data.filter(
          (t) => !existingTags.has(t.toLowerCase()),
        );
        const mergedTags = [...currentTags, ...newTags];
        updateTags(mergedTags);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [updateTags]);

  return (
    <TagEditorView
      tags={localTags}
      inputValue={inputValue}
      isGenerating={isGenerating}
      hasApiKey={hasApiKey}
      onInputChange={handleInputChange}
      onInputKeyDown={handleInputKeyDown}
      onRemoveTag={handleRemoveTag}
      onGenerateTags={handleGenerateTags}
    />
  );
};
