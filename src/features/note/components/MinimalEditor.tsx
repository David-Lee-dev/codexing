'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';

interface MinimalEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
}

export default function MinimalEditor({
  content,
  onUpdate,
  placeholder = '메모를 입력하세요...',
}: MinimalEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    autofocus: 'end',
    immediatelyRender: false,
    onUpdate: ({ editor: editorInstance }) => {
      const html = editorInstance.getHTML();
      onUpdate(html);
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror focus:outline-none',
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentContent = editor.getHTML();
    if (currentContent !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!isMounted || !editor) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500">에디터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <EditorContent editor={editor} />
    </div>
  );
}

