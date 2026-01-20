'use client';

import React from 'react';

import dynamic from 'next/dynamic';

import {
  useIsDatabaseInitialized,
  useIsLoading,
  useIsStorageSelected,
  useDocument,
} from '@/core/store';
import { Editor } from '@/features/editor/components/Editor';
import { RightSidebar } from '@/features/rightSidebar';
import { Settings } from '@/features/settings';
import { Sidebar } from '@/features/sidebar/components/Sidebar';
import { Tabbar } from '@/features/tabbar/components/Tabbar';
import { useAppInitialize } from '@/shared/hooks/useAppInitialize';
import { useAutoSave } from '@/shared/hooks/useAutoSave';
import { useDocumentEvents } from '@/shared/hooks/useDocumentEvents';
import { useEditing } from '@/shared/hooks/useEditing';
import { useShortcut } from '@/shared/hooks/useShortcut';
import { useTabSync } from '@/shared/hooks/useTabSync';
import { Loading } from '@/shared/ui/Loading';
import { SaveIndicator } from '@/shared/ui/SaveIndicator';

const Onboarding = dynamic(
  () =>
    import('@/features/onboarding/components/Onboarding').then(
      (mod) => mod.Onboarding,
    ),
  { loading: () => <Loading /> },
);

const Welcome = dynamic(
  () =>
    import('@/features/welcome/components/Welcome').then((mod) => mod.Welcome),
  { loading: () => null },
);

export default function App() {
  useAppInitialize();
  useDocumentEvents();
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
    <div className="w-screen h-screen flex overflow-hidden bg-ctp-base">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabbar />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {document ? <Editor /> : <Welcome />}
          </div>
          <RightSidebar />
        </div>
      </div>
      <Settings />
      <SaveIndicator />
    </div>
  );
}
