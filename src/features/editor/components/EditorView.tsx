'use client';

import { memo } from 'react';

import { Virtuoso } from 'react-virtuoso';

import { useDocument } from '@/core/store';

import { BlockEditor } from './BlockEditor';
import { TitleEditor } from './TitleEditor';

const EditorViewComponent: React.FC = () => {
  const document = useDocument();

  return (
    <div className="w-full h-full bg-stone-50 flex flex-col overflow-hidden">
      <div className="max-w-3xl mx-auto w-full px-6 py-16 md:px-12 lg:px-16">
        <TitleEditor />
      </div>

      {document!.blocks.length > 0 && (
        <Virtuoso
          data={document!.blocks}
          className="flex-1"
          itemContent={(index, block) => (
            <div className="max-w-3xl mx-auto w-full px-6 md:px-12 lg:px-16">
              <div className={index === 0 ? '' : 'mt-2'}>
                <BlockEditor key={block.id} block={block} />
              </div>
            </div>
          )}
          overscan={3}
          increaseViewportBy={{ top: 100, bottom: 100 }}
        />
      )}

      {document!.blocks.length === 0 && (
        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 md:px-12 lg:px-16" />
      )}
    </div>
  );
};

export const EditorView = memo(EditorViewComponent);
