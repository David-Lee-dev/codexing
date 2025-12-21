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
    immediatelyRender: false, // SSR hydration mismatch 방지
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

  // 클라이언트에서만 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // content prop 변경 시 에디터 동기화
  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentContent = editor.getHTML();
    if (currentContent !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // SSR 방지: 클라이언트에서만 렌더링
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
