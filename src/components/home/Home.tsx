import React from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import HomeView from './HomeVeiw';

const Home: React.FC = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '메모를 작성하세요...',
      }),
    ],
    content: '',
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return <HomeView editor={editor} />;
};

export default Home;
