'use client';

import Editor from '@/components/editor/Editor';
import Sidebar from '@/components/sidebar/Sidebar';
import Tapbar from '@/components/tapbar/Tapbar';

export default function App() {
  return (
    <div className="w-full h-full flex flex-row">
      <aside className="w-64 flex-shrink-0">
        <Sidebar />
      </aside>
      <main className="flex flex-col flex-1 min-w-0">
        <Tapbar />
        <Editor />
      </main>
    </div>
  );
}
