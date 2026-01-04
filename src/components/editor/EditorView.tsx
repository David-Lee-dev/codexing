'use client';

import React from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

interface EditorViewProps {
  onPressEnter: (event: KeyboardEvent) => void;
  onPressBackspace: (event: KeyboardEvent) => void;
  onPressArrowUp: (event: KeyboardEvent) => void;
  onPressArrowDown: (event: KeyboardEvent) => void;
  onClickBlock: (event: MouseEvent) => void;
}

const EditorView: React.FC<EditorViewProps> = ({
  onPressEnter,
  onPressBackspace,
  onPressArrowUp,
  onPressArrowDown,
  onClickBlock: _onClickBlock,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '메모를 작성하세요...',
      }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
      handleKeyDown: (view, event) => {
        const { state } = view;
        const { selection } = state;
        const { $anchor } = selection;
        const isEmpty = state.doc.textContent.trim().length === 0;

        if (event.key === 'Enter' && !event.shiftKey) {
          onPressEnter(event);
        }

        if (event.key === 'Backspace') {
          onPressBackspace(event);
        }

        if (event.key === 'ArrowUp') {
          onPressArrowUp(event);
        }

        if (event.key === 'ArrowDown') {
          onPressArrowDown(event);
        }

        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleFocus = () => {
    console.log('Editor focused');
  };

  const handleBlur = () => {
    console.log('Editor blurred');
  };

  const handleClick = () => {
    console.log('Editor clicked');
  };

  return (
    <div className="w-full h-full bg-red-200 p-16 text-black flex flex-col">
      <div className="bg-red-50 flex-shrink min-h-0">
        <EditorContent
          editor={editor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default EditorView;
