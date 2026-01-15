'use client';

import React, { useEffect, memo, useMemo } from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { debounce } from 'lodash';

import {
  getStoreActions,
  useAppStore,
  useBlockInEditing,
  useCursorOffset,
} from '@/core/store';
import { EditorManager } from '@/shared/lib';

import { BlockEditorView } from './BlockEditorView';

import type { Block } from '@/core/types';

interface BlockEditorProps {
  block: Block;
}

const BlockEditorComponent: React.FC<BlockEditorProps> = ({ block }) => {
  const blockInEditing = useBlockInEditing();
  const cursorOffset = useCursorOffset();

  const debouncedUpdateContent = useMemo(
    () =>
      debounce((blockToUpdate: Block, text: string) => {
        getStoreActions().updateBlockContent(blockToUpdate, text);
      }, 500),
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      Placeholder.configure({
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: block.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[1.5em] prose prose-stone max-w-none',
      },
      handleKeyDown: (view, event) => {
        const manager = new EditorManager(view);
        const {
          addNewBlock,
          popBlock,
          switchToPreviousBlock,
          switchToNextBlock,
        } = useAppStore.getState();

        if (event.shiftKey && event.key === 'Enter') {
          addNewBlock(block);
          return true;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
          if (manager.isEmptyDocument()) {
            addNewBlock(block);
            return true;
          }

          if (manager.isCurrentLineEmpty() && manager.isFollowingLinesEmpty()) {
            manager.removeEmptyLines();
            addNewBlock(block);
            return true;
          }
        }

        if (event.key === 'Backspace') {
          if (manager.isEmptyDocument()) {
            popBlock(block);
            return true;
          }
        }

        if (event.key === 'ArrowUp') {
          if (manager.isFirstLine()) {
            switchToPreviousBlock(block, manager.getCursorOffset());
            return true;
          }
        }

        if (event.key === 'ArrowDown') {
          if (manager.isLastLine()) {
            switchToNextBlock(block, -1 * manager.getCursorOffset());
            return true;
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      debouncedUpdateContent(block, text);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!blockInEditing) return;
    if (blockInEditing.id !== block.id) return;

    const manager = new EditorManager(editor.view);

    if (cursorOffset > 0) {
      editor.commands.focus(
        manager.getLastLineStartPosition() + Math.abs(cursorOffset),
      );
    } else {
      editor.commands.focus(Math.abs(cursorOffset) + 1);
    }
  }, [editor, blockInEditing, cursorOffset]);

  useEffect(() => {
    return () => {
      debouncedUpdateContent.cancel();
    };
  }, [debouncedUpdateContent]);

  return <BlockEditorView editor={editor} />;
};

export const BlockEditor = memo(
  BlockEditorComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.block.id === nextProps.block.id &&
      prevProps.block.content === nextProps.block.content
    );
  },
);
