'use client';

import React from 'react';

import { useDocument } from '@/core/store';

import { BlockEditor } from './BlockEditor';
import { TitleEditor } from './TitleEditor';

export const EditorView: React.FC = () => {
  const document = useDocument();

  return (
    <div className="w-full h-full bg-stone-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 md:px-12 lg:px-16">
        <TitleEditor />
        <div className="space-y-2">
          {document!.blocks.map((block) => (
            <BlockEditor key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
};
