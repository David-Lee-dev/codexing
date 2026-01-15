'use client';

import React from 'react';

export interface WelcomeViewProps {
  onCreateNote: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onCreateNote }) => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-stone-50/50">
      <div className="max-w-md text-center space-y-8">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-stone-800">
            Start Writing
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Create a new note to capture your thoughts,
            <br />
            ideas, and everything in between.
          </p>
        </div>

        {/* 새 노트 버튼 */}
        <button
          onClick={onCreateNote}
          className="
            inline-flex items-center gap-2 px-6 py-3
            bg-stone-800 text-white text-sm font-medium rounded-xl
            hover:bg-stone-700 active:bg-stone-900
            transition-colors duration-150
            shadow-sm hover:shadow-md
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create new note
        </button>

        {/* 단축키 가이드 */}
        <div className="pt-4 border-t border-stone-200">
          <p className="text-xs text-stone-400 mb-4">Keyboard Shortcuts</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            <ShortcutItem keys={['⌘', 'N']} description="New note" />
            <ShortcutItem keys={['⌘', 'K']} description="Search" />
            <ShortcutItem keys={['⌘', 'S']} description="Save" />
            <ShortcutItem keys={['⌘', 'W']} description="Close tab" />
            <ShortcutItem keys={['⌘', '[']} description="Previous tab" />
            <ShortcutItem keys={['⌘', ']']} description="Next tab" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 단축키 아이템 컴포넌트
interface ShortcutItemProps {
  keys: string[];
  description: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ keys, description }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="min-w-[24px] h-6 px-1.5 flex items-center justify-center bg-stone-100 border border-stone-200 rounded text-[11px] font-medium text-stone-600"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-xs text-stone-500">{description}</span>
    </div>
  );
};
