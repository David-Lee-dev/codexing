'use client';

import React, { memo } from 'react';

import dynamic from 'next/dynamic';

import { useAppStore, useIsRightSidebarOpen } from '@/core/store';

import { RightSidebarHeader } from './RightSidebarHeader';

const Graph = dynamic(
  () => import('@/features/graph/components/Graph').then((mod) => mod.Graph),
  { ssr: false },
);

export const RightSidebar = memo(function RightSidebar() {
  const isOpen = useIsRightSidebarOpen();
  const setIsRightSidebarOpen = useAppStore(
    (state) => state.setIsRightSidebarOpen,
  );

  const handleClose = () => {
    setIsRightSidebarOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex-1 h-full bg-ctp-base border-l border-ctp-surface0/60 flex flex-col">
      <RightSidebarHeader onClose={handleClose} />
      <div className="flex-1 overflow-hidden">
        <Graph />
      </div>
    </div>
  );
});
