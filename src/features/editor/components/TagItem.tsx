'use client';

import React, { memo, useCallback } from 'react';

interface TagItemProps {
  tag: string;
  index: number;
  onRemove: (index: number) => void;
}

export const TagItem = memo(function TagItem({
  tag,
  index,
  onRemove,
}: TagItemProps) {
  const handleClick = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ctp-surface0 text-ctp-text text-sm">
      {tag}
      <button
        type="button"
        onClick={handleClick}
        className="w-4 h-4 flex items-center justify-center rounded-md hover:bg-ctp-surface1 transition-colors"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </span>
  );
});
