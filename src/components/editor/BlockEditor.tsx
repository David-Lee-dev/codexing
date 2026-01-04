import React, { useEffect } from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

interface BlockEditorProps {
  blockId: string;
  content: string;
  placeholder?: string;
  onUpdate: (content: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  isFocused: boolean;
  onFocus: () => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  blockId,
  content,
  placeholder = '메모를 작성하세요...',
  onUpdate,
  onEnter,
  onBackspace,
  onArrowUp,
  onArrowDown,
  isFocused,
  onFocus,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = ({ event }: { event: KeyboardEvent }) => {
      const { key, shiftKey } = event;
      const { selection } = editor.state;
      const { $anchor } = selection;

      if (key === 'Enter' && !shiftKey) {
        event.preventDefault();
        onEnter();
        return;
      }

      if (key === 'Backspace') {
        const isEmpty = editor.isEmpty;
        if (isEmpty) {
          event.preventDefault();
          onBackspace();
          return;
        }
      }

      if (key === 'ArrowUp') {
        const isAtStart = $anchor.pos === 0 || $anchor.parentOffset === 0;
        if (isAtStart) {
          event.preventDefault();
          onArrowUp();
          return;
        }
      }

      if (key === 'ArrowDown') {
        const isAtEnd =
          $anchor.pos === editor.state.doc.content.size &&
          $anchor.parentOffset === $anchor.parent.nodeSize - 2;

        if (isAtEnd) {
          event.preventDefault();
          onArrowDown();
          return;
        }
      }
    };

    editor.on('keydown', handleKeyDown);

    return () => {
      editor.off('keydown', handleKeyDown);
    };
  }, [editor, onEnter, onBackspace, onArrowUp, onArrowDown]);

  useEffect(() => {
    if (!editor) return;

    if (isFocused) {
      editor.commands.focus('end');
    }
  }, [editor, isFocused]);

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    if (currentContent !== content) {
      editor.commands.setContent(content, false);
    }
  }, [editor, blockId]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`block-editor min-h-[1.5rem] rounded-lg px-3 py-2 transition-colors ${
        isFocused
          ? 'bg-white border-2 border-blue-400 shadow-sm'
          : 'bg-white/50 border-2 border-transparent hover:bg-white/70 hover:border-gray-200'
      }`}
      onFocus={onFocus}
      onClick={onFocus}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default BlockEditor;
