import React from 'react';

import { Editor, EditorContent } from '@tiptap/react';

interface HomeViewProps {
  editor: Editor;
}

const HomeView: React.FC<HomeViewProps> = ({ editor }) => {
  return (
    <div className="w-full h-full bg-gray-50 p-16 text-black">
      <EditorContent editor={editor} />
    </div>
  );
};

export default HomeView;
