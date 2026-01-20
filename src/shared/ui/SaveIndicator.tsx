'use client';

import React from 'react';

import { useSaveStatus } from '@/core/store';

export const SaveIndicator: React.FC = () => {
  const saveStatus = useSaveStatus();

  if (saveStatus === 'idle') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-stone-800 text-stone-100 rounded-lg shadow-lg text-sm">
      <div className="w-4 h-4 border-2 border-stone-400 border-t-stone-100 rounded-full animate-spin" />
      <span>
        {saveStatus === 'saving' && '저장 중...'}
        {saveStatus === 'indexing' && '인덱싱 중...'}
      </span>
    </div>
  );
};
