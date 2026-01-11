import React from 'react';

import { Editor, EditorContent } from '@tiptap/react';

interface BlockViewProps {
  editor: Editor;
}

const BlockContentView: React.FC<BlockViewProps> = ({ editor }) => {
  return (
    <div
      className="mb-2 text-stone-700 leading-relaxed bg-stone-200
                 [&_.ProseMirror]:outline-none
                 [&_.ProseMirror]:min-h-[1.5rem]
                 [&_.ProseMirror]:px-4
                 [&_.ProseMirror]:py-2
                 [&_.ProseMirror_p]:my-0
                 [&_.ProseMirror_p]:p-0"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default BlockContentView;
