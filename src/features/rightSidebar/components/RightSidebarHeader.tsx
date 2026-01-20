'use client';

import React, { memo } from 'react';

interface RightSidebarHeaderProps {
  onClose: () => void;
}

export const RightSidebarHeader = memo(function RightSidebarHeader({
  onClose,
}: RightSidebarHeaderProps) {
  return (
    <div className="h-10 px-3 flex items-center justify-between flex-shrink-0 border-b border-ctp-surface0/60">
      <span className="text-sm font-medium text-ctp-text">Graph</span>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-xl text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/80 transition-all"
        title="Close graph (Cmd+G)"
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
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
});
