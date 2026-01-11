import React, { useEffect } from 'react';

import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import { useBlockStore } from '@/store/blockStore';
import { Block } from '@/types/block';
import { EditorManager } from '@/utils/editorManager';

import BlockContentView from './BlockView';

interface BlockProps {
  block: Block;
}

const BlockContent: React.FC<BlockProps> = ({ block }) => {
  const { focusedBlockStatus, addBlock, removeBlock, switchBlock } =
    useBlockStore();

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none text-base',
      },
      handleKeyDown: (view, event) => {
        const manager = new EditorManager(view);

        if (event.shiftKey && event.key === 'Enter') {
          // Shift + Enter
          addBlock(block.documentId, block);
          return true;
        } else if (event.key === 'Enter' && !event.shiftKey) {
          // Enter (without Shift)
          if (manager.isEmptyDocument()) {
            addBlock(block.documentId, block);
            return true;
          }

          if (manager.isCurrentLineEmpty() && manager.isFollowingLinesEmpty()) {
            manager.removeEmptyLines();
            addBlock(block.documentId, block);
            return true;
          }
        } else if (event.key === 'Backspace') {
          // Backspace
          if (manager.isEmptyDocument()) {
            removeBlock(block);
            return true;
          }
        } else if (event.key === 'ArrowUp') {
          // ArrowUp
          if (manager.isFirstLine()) {
            const cursorOffset = manager.getCursorOffset();
            switchBlock(block, event, cursorOffset);

            return true;
          }

          return false;
        } else if (event.key === 'ArrowDown') {
          // ArrowDown
          if (manager.isLastLine()) {
            const cursorOffset = manager.getCursorOffset();
            switchBlock(block, event, cursorOffset);

            return true;
          }

          return false;
        } else {
          return false;
        }
      },
    },
  });

  useEffect(() => {
    if (!editor || !focusedBlockStatus.id) return;

    if (focusedBlockStatus.id === block.id) {
      const manager = new EditorManager(editor.view);
      const lastLineStartPosition = manager.getLastLineStartPosition();
      const cursorOffset = focusedBlockStatus.cursorOffset;

      editor.commands.focus(lastLineStartPosition + cursorOffset);
    }
  }, [focusedBlockStatus, editor, block.id]);

  if (!editor) {
    return null;
  }

  return <BlockContentView editor={editor} />;
};

export default BlockContent;
