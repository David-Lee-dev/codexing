'use client';

import React from 'react';

import { useDocument } from '@/core/store';

import { EditorView } from './EditorView';

export const Editor: React.FC = () => {
  const document = useDocument();

  if (!document) return <div></div>;

  return <EditorView />;
};
