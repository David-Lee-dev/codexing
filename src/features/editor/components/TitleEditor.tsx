'use client';

import React, { useEffect, useRef, useMemo } from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { debounce } from 'lodash';

import { getStoreActions, useDocument } from '@/core/store';

import { TitleEditorView } from './TitleEditorView';

const DEBOUNCE_MS = 250;

export const TitleEditor: React.FC = () => {
  const document = useDocument();
  const documentRef = useRef(document);

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  const debouncedUpdate = useMemo(
    () =>
      debounce((text: string) => {
        const currentDoc = documentRef.current;

        if (!currentDoc) return;

        const setDocument = getStoreActions().setDocument;
        setDocument({ ...currentDoc, title: text || null });
      }, DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder: 'Untitled',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: document!.title ?? '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'outline-none',
      },
      handleKeyDown: (_, event) => {
        // Prevent Enter key - title should be single line
        if (event.key === 'Enter') {
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      debouncedUpdate(text);
    },
  });

  return <TitleEditorView editor={editor} />;
};
