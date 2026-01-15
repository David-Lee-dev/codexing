'use client';

import React from 'react';

import {
  useIsDatabaseInitialized,
  useIsLoading,
  useIsStorageSelected,
  useDocument,
} from '@/core/store';
import { Editor } from '@/features/editor';
import { Onboarding } from '@/features/onboarding';
import { Sidebar } from '@/features/sidebar';
import { Tabbar } from '@/features/tabbar';
import { Welcome } from '@/features/welcome';
import {
  useAppInitialize,
  useShortcut,
  useTabSync,
  useEditing,
  useAutoSave,
} from '@/shared/hooks';
import { Loading } from '@/shared/ui/Loading';

export default function App() {
  useAppInitialize();
  useShortcut();
  useTabSync();
  useAutoSave();
  useEditing();

  const isLoading = useIsLoading();
  const isStorageSelected = useIsStorageSelected();
  const isDatabaseInitialized = useIsDatabaseInitialized();
  const document = useDocument();

  if (isLoading) {
    return <Loading />;
  }

  if (!isStorageSelected || !isDatabaseInitialized) {
    return <Onboarding />;
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabbar />
        {document ? <Editor /> : <Welcome />}
      </div>
    </div>
  );
}
