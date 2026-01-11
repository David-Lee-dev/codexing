'use client';

import React from 'react';

import { Block } from '@/types/block';

import BlockComponent from './block/Block';

interface EditorViewProps {
  blocks: Block[];
  title?: string;
  onTitleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditorView: React.FC<EditorViewProps> = ({
  blocks,
  title = '',
  onTitleChange,
}) => {
  return (
    <div className="w-full h-full bg-stone-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 md:px-12 lg:px-16">
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={onTitleChange}
            placeholder="Untitled"
            className="w-full text-4xl md:text-5xl font-light text-stone-800
                       placeholder:text-stone-300 bg-transparent border-none
                       outline-none focus:outline-none caret-stone-400
                       tracking-tight leading-tight
                       transition-colors duration-200"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          />
          <div className="mt-4 h-px bg-gradient-to-r from-stone-200 via-stone-200 to-transparent" />
        </div>

        <div>
          {blocks.map((block) => (
            <BlockComponent key={block.id} block={block} />
          ))}
        </div>

        <div className="h-48" />
      </div>
    </div>
  );
};

export default EditorView;
