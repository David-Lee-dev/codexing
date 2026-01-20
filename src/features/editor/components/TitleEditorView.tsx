'use client';

import React from 'react';

import { EditorContent, Editor } from '@tiptap/react';

interface TitleEditorViewProps {
  editor: Editor | null;
}

export const TitleEditorView: React.FC<TitleEditorViewProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div
      className="mb-8 text-ctp-text
                 [&_.ProseMirror]:outline-none
                 [&_.ProseMirror]:text-3xl
                 [&_.ProseMirror]:font-bold
                 [&_.ProseMirror]:leading-tight
                 [&_.ProseMirror_p]:my-0
                 [&_.ProseMirror_p]:p-0"
    >
      <EditorContent editor={editor} />
    </div>
  );
};
