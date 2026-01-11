'use client';

import React, { useEffect, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { getDocument } from '@/api/document.api';
import { useBlockStore } from '@/store/blockStore';
import { useTabStore } from '@/store/tabStore';
import { Document } from '@/types/document';

import EditorView from './EditorView';

const Editor: React.FC = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const { tabs } = useTabStore();
  const { blocks, setBlocks, addBlock, clearBlocks } = useBlockStore();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  useEffect(() => {
    const tab = tabs.find((t) => t.focused);

    if (tab) {
      setDocumentId(tab.id);
    }
  }, [tabs]);

  useEffect(() => {
    const loadDocument = async () => {
      if (documentId) {
        const document: Document | null = await getDocument(documentId);

        clearBlocks();

        if (document && document.blocks) {
          setBlocks(document.blocks);
        } else {
          setBlocks([
            {
              id: uuidv4(),
              documentId: documentId,
              type: null,
              content: null,
              orderIndex: 0,
              sourceDocumentId: null,
              indexingStatus: 'PENDING',
            },
          ]);
        }
      }
    };
    loadDocument();
  }, [documentId, setBlocks, addBlock, clearBlocks]);

  return (
    <EditorView
      blocks={blocks}
      title={title}
      onTitleChange={handleTitleChange}
    />
  );
};

export default Editor;
