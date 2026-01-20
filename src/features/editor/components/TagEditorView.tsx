'use client';

import type { KeyboardEvent } from 'react';
import React, { memo, useCallback } from 'react';

import { TagItem } from './TagItem';

export interface TagEditorViewProps {
  tags: string[];
  inputValue: string;
  isGenerating: boolean;
  hasApiKey: boolean;
  onInputChange: (value: string) => void;
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (index: number) => void;
  onGenerateTags: () => void;
}

export const TagEditorView = memo(function TagEditorView({
  tags,
  inputValue,
  isGenerating,
  hasApiKey,
  onInputChange,
  onInputKeyDown,
  onRemoveTag,
  onGenerateTags,
}: TagEditorViewProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(e.target.value);
    },
    [onInputChange],
  );

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag, index) => (
          <TagItem
            key={`${tag}-${index}`}
            tag={tag}
            index={index}
            onRemove={onRemoveTag}
          />
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={onInputKeyDown}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className="flex-1 min-w-[120px] px-2 py-1 text-sm text-ctp-subtext1 placeholder-ctp-overlay1 bg-transparent outline-none"
        />

        {hasApiKey && (
          <button
            type="button"
            onClick={onGenerateTags}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-ctp-surface1 text-ctp-subtext1 text-sm hover:bg-ctp-surface0 hover:text-ctp-lavender transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                  />
                </svg>
                <span>AI Tags</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
