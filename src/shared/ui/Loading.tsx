'use client';

import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
        {/* 스피너 */}
        <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />

        {/* 텍스트 */}
        <span className="text-sm text-stone-400">Loading...</span>
      </div>
    </div>
  );
};
