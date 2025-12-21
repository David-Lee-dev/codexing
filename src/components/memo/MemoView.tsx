'use client';

import { useState, useEffect } from 'react';
import MinimalEditor from '../editor/MinimalEditor';
import { useAutoSave } from '../editor/useAutoSave';
import { loadNotes } from '../../utils/tauri-api';

export const MemoView = () => {
  const [content, setContent] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 메모 로드 (메모 뷰가 나타날 때 수행)
  useEffect(() => {
    const fetchInitialNote = async () => {
      try {
        const notes = await loadNotes();
        if (notes.length > 0) {
          const latestNote = notes.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          )[0];
          setContent(latestNote.content);
        }
      } catch (error) {
        console.error('Failed to load notes in MemoView:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchInitialNote();
  }, []);

  // 자동 저장 훅 (MemoView 내부에 있으므로 활성화 여부를 걱정할 필요 없음)
  const { isSaving, lastSaved } = useAutoSave({
    content,
    debounceMs: 30000, // 30초
    enabled: isLoaded, // 초기 로드 완료 후에만 활성화
  });

  return (
    <main className="w-full h-screen bg-white dark:bg-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <MinimalEditor content={content} onUpdate={setContent} placeholder="메모를 입력하세요..." />
      
      {/* 상태 표시 UI */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 text-sm text-gray-500 animate-pulse">저장 중...</div>
      )}
      {lastSaved && !isSaving && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-400">
          저장됨: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </main>
  );
};

