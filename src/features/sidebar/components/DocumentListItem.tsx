'use client';

import React, { memo } from 'react';

import type { DocumentListItem as DocumentListItemType } from '@/core/store';

interface DocumentListItemProps {
  document: DocumentListItemType;
  isActive: boolean;
  onClick: (documentId: string, title: string | null) => void;
}

export const DocumentListItem = memo(function DocumentListItem({
  document,
  isActive,
  onClick,
}: DocumentListItemProps) {
  const handleClick = () => {
    onClick(document.id, document.title);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full px-2 py-2 flex items-start gap-2 rounded-xl text-left transition-all group ${
        isActive
          ? 'bg-ctp-surface1/80 text-ctp-text'
          : 'hover:bg-ctp-surface0/50 text-ctp-subtext1'
      }`}
    >
      <svg
        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
          isActive ? 'text-ctp-lavender' : 'text-ctp-overlay1'
        }`}
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
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {document.title || 'Untitled'}
        </p>
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {document.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 bg-ctp-surface0/60 rounded-md text-ctp-overlay1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
});
