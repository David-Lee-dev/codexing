'use client';

import { memo } from 'react';

import { useDocument } from '@/core/store';

import { EditorView } from './EditorView';

const EditorComponent: React.FC = () => {
  const document = useDocument();

  if (!document) return <div></div>;

  return <EditorView />;
};

export const Editor = memo(EditorComponent);
