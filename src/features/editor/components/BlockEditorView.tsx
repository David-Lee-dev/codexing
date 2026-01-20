'use client';

import React from 'react';

import { EditorContent, Editor } from '@tiptap/react';

interface BlockEditorViewProps {
  editor: Editor | null;
}

export const BlockEditorView: React.FC<BlockEditorViewProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div
      className="text-ctp-text leading-relaxed rounded-xl bg-ctp-surface0/50
                 [&_.ProseMirror]:outline-none
                 [&_.ProseMirror]:min-h-[1.5rem]
                 [&_.ProseMirror]:px-4
                 [&_.ProseMirror]:py-3
                 [&_.ProseMirror_p]:my-0
                 [&_.ProseMirror_p]:p-0"
    >
      <EditorContent editor={editor} />
    </div>
  );
};
