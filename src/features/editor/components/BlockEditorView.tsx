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
      className="text-stone-700 leading-relaxed rounded-lg bg-stone-100
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
