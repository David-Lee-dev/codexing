'use client';

import { useState, useEffect } from 'react';
import MinimalEditor from '../components/editor/MinimalEditor';
import { useAutoSave } from '../components/editor/useAutoSave';
import { loadNotes } from '../utils/tauri-api';

export default function Home() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // 초기 메모 로드
  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        const notes = await loadNotes();
        // 가장 최근 메모를 불러옴 (간단한 구현)
        if (notes.length > 0) {
          const latestNote = notes.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          )[0];
          setContent(latestNote.content);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialContent();
  }, []);

  // 자동 저장 훅
  const { isSaving, lastSaved } = useAutoSave({
    content,
    debounceMs: 30000, // 30초
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="w-full h-screen">
      <MinimalEditor content={content} onUpdate={setContent} placeholder="메모를 입력하세요..." />
      {/* 비침습적인 저장 상태 표시 */}
      {isSaving && <div className="fixed bottom-4 right-4 text-sm text-gray-500">저장 중...</div>}
      {lastSaved && !isSaving && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-400">
          저장됨: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </main>
  );
}
