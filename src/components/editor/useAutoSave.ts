import { useEffect, useRef, useState } from 'react';
import { saveNote } from '../../utils/tauri-api';

interface UseAutoSaveOptions {
  content: string;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave({
  content,
  debounceMs = 30000, // 30초
  onSaveStart,
  onSaveComplete,
  onSaveError,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noteIdRef = useRef<string | undefined>(undefined);

  // Debounced auto-save
  useEffect(() => {
    // 빈 내용은 저장하지 않음
    if (!content || content.trim() === '' || content === '<p></p>') {
      return;
    }

    // 기존 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타이머 설정
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
        onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, debounceMs, onSaveStart, onSaveComplete, onSaveError]);

  // 창 닫기 시 즉시 저장
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!content || content.trim() === '' || content === '<p></p>') {
        return;
      }

      // 비동기 저장을 동기적으로 처리하기 위해 이벤트 지연
      e.preventDefault();
      e.returnValue = '';

      try {
        // 즉시 저장 (타이머 대기 없이)
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
