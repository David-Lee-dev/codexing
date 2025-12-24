import { useEffect, useRef, useState } from 'react';

import { saveNote } from '../api/noteApi';

interface UseAutoSaveOptions {
  content: string;
  debounceMs?: number;
  enabled?: boolean;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave({
  content,
  debounceMs = 30000,
  enabled = true,
  onSaveStart,
  onSaveComplete,
  onSaveError,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noteIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      !enabled ||
      !content ||
      content.trim() === '' ||
      content === '<p></p>'
    ) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      onSaveStart?.();

      try {
        const savedNote = await saveNote(content, noteIdRef.current);
        noteIdRef.current = savedNote.id;
        setLastSaved(new Date());
        onSaveComplete?.();
      } catch (error) {
        console.error('Auto-save failed:', error);
        onSaveError?.(
          error instanceof Error ? error : new Error('Unknown error'),
        );
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, debounceMs, enabled, onSaveStart, onSaveComplete, onSaveError]);

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!content || content.trim() === '' || content === '<p></p>') {
        return;
      }

      e.preventDefault();
      e.returnValue = '';

      try {
        await saveNote(content, noteIdRef.current);
      } catch (error) {
        console.error('Save on close failed:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [content]);

  return {
    isSaving,
    lastSaved,
  };
}
